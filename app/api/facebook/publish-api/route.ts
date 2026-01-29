import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getDb } from '@/lib/db';
import { getFacebookPages } from '@/services/facebook-pages';

// POST - Public Publish API
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate Request
        const secretKey = request.headers.get('X_API_Secret_Key') || request.headers.get('X-API-Secret-Key');

        if (!secretKey) {
            return NextResponse.json({ error: 'Unauthorized: Missing API secret key' }, { status: 401 });
        }

        const db = getDb();
        const user = db.prepare('SELECT id FROM users WHERE api_secret_key = ?').get(secretKey) as { id: string } | undefined;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized: Invalid API secret key' }, { status: 401 });
        }

        // 2. Parse Request Body
        const { message, link, imageUrl } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Missing required fields: message is required' }, { status: 400 });
        }

        // 3. Get Active Pages
        const allPages = getFacebookPages(user.id);
        const activePages = allPages.filter(p => p.is_active);

        if (activePages.length === 0) {
            return NextResponse.json({ error: 'No active Facebook pages found for this user.' }, { status: 400 });
        }

        // 4. Publish to All Active Pages
        const results = [];
        const errors = [];

        for (const page of activePages) {
            const accessToken = page.access_token || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

            if (!accessToken) {
                errors.push({ pageId: page.page_id, error: 'No access token' });
                continue;
            }

            try {
                let fbResponse;
                let fbPostId;

                if (imageUrl) {
                    const photoUrl = `https://graph.facebook.com/v18.0/${page.page_id}/photos`;
                    fbResponse = await axios.post(photoUrl, {
                        url: imageUrl,
                        caption: message,
                        access_token: accessToken,
                    });
                    fbPostId = fbResponse.data.id;
                } else {
                    const postUrl = `https://graph.facebook.com/v18.0/${page.page_id}/feed`;
                    const payload: Record<string, string> = {
                        message,
                        access_token: accessToken,
                    };
                    if (link) payload.link = link;

                    fbResponse = await axios.post(postUrl, payload);
                    fbPostId = fbResponse.data.id;
                }

                results.push({ pageId: page.page_id, pageName: page.page_name, postId: fbPostId, status: 'success' });
            } catch (err: unknown) {
                const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
                const errMsg = axiosError?.response?.data?.error?.message || 'Failed to post';
                errors.push({ pageId: page.page_id, pageName: page.page_name, error: errMsg, status: 'failed' });
            }
        }

        // 5. Return Summary
        return NextResponse.json({
            success: results.length > 0,
            summary: {
                total: activePages.length,
                succeeded: results.length,
                failed: errors.length
            },
            results,
            errors
        });

    } catch (error: unknown) {
        console.error('Facebook Publish API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
