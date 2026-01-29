import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getDb } from '@/lib/db';

const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
    try {
        const { pageId, message, link, imageUrl } = await request.json();

        if (!pageId) {
            return NextResponse.json(
                { error: 'Page ID is required' },
                { status: 400 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Get token from DB or env
        let accessToken = FACEBOOK_PAGE_ACCESS_TOKEN;

        // Try to find page-specific token in DB
        const db = getDb();
        const pageRow = db.prepare('SELECT access_token FROM facebook_pages WHERE page_id = ?').get(pageId) as { access_token: string } | undefined;

        if (pageRow && pageRow.access_token) {
            accessToken = pageRow.access_token;
        }

        // Check if we have a valid token
        if (!accessToken) {
            return NextResponse.json(
                { error: `No access token found for page ${pageId}. Please add the page with a valid token.` },
                { status: 400 }
            );
        }

        // If there's an image URL, post as a photo
        if (imageUrl) {
            const photoUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;
            const photoPayload = {
                url: imageUrl,
                caption: message,
                access_token: accessToken,
            };
            const response = await axios.post(photoUrl, photoPayload);
            return NextResponse.json({
                success: true,
                postId: response.data.id,
                pageId,
                type: 'photo'
            });
        }

        // Regular text/link post
        const postUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;
        const payload: Record<string, string> = {
            message,
            access_token: accessToken,
        };

        if (link) {
            payload.link = link;
        }

        const response = await axios.post(postUrl, payload);

        return NextResponse.json({
            success: true,
            postId: response.data.id,
            pageId,
            type: 'feed'
        });

    } catch (error: unknown) {
        console.error('Facebook Post Error:', error);

        const axiosError = error as { response?: { data?: { error?: { message?: string; code?: number } } } };
        const fbError = axiosError?.response?.data?.error;

        return NextResponse.json(
            {
                error: fbError?.message || 'Failed to post to Facebook',
                code: fbError?.code
            },
            { status: 500 }
        );
    }
}

// GET - Test connection to a specific page
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pageId = searchParams.get('pageId');

        // Get token from DB or env
        let accessToken = FACEBOOK_PAGE_ACCESS_TOKEN;

        if (pageId) {
            const db = getDb();
            const pageRow = db.prepare('SELECT access_token FROM facebook_pages WHERE page_id = ?').get(pageId) as { access_token: string } | undefined;
            if (pageRow && pageRow.access_token) {
                accessToken = pageRow.access_token;
            }
        }

        if (!accessToken) {
            return NextResponse.json({
                configured: false,
                error: 'Facebook Access Token not configured (Env or DB)'
            });
        }

        // Debug: Check permissions of the token
        const debugTokenUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
        const debugRes = await axios.get(debugTokenUrl);
        const tokenScopes = debugRes.data.data.scopes || [];

        if (!pageId) {
            return NextResponse.json({
                configured: true,
                error: 'Page ID is required for testing',
                scopes: tokenScopes
            });
        }

        // Verify the token by fetching page info
        const debugUrl = `https://graph.facebook.com/v18.0/${pageId}?fields=name,id,fan_count,picture&access_token=${accessToken}`;
        const response = await axios.get(debugUrl);

        return NextResponse.json({
            success: true,
            configured: true,
            pageId: response.data.id,
            pageName: response.data.name,
            fanCount: response.data.fan_count,
            picture: response.data.picture?.data?.url,
            scopes: tokenScopes // Return scopes so UI can show them
        });
    } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { error?: { message?: string, code?: number, type?: string } } } };
        const errData = axiosError?.response?.data?.error;

        return NextResponse.json({
            success: false,
            configured: true,
            error: errData?.message || 'Failed to verify page',
            errorCode: errData?.code,
            errorType: errData?.type
        });
    }
}
