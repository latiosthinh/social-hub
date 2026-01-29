import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
    try {
        // Check if direct token is configured
        if (!FACEBOOK_PAGE_ID || !FACEBOOK_PAGE_ACCESS_TOKEN) {
            return NextResponse.json(
                { error: 'Facebook Page credentials not configured in environment' },
                { status: 500 }
            );
        }

        const { message, link, imageUrl } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Build the post payload
        const postUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/feed`;

        const payload: Record<string, string> = {
            message,
            access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
        };

        // Optional: Add link if provided
        if (link) {
            payload.link = link;
        }

        // If there's an image URL, post as a photo instead
        if (imageUrl) {
            const photoUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/photos`;
            const photoPayload = {
                url: imageUrl,
                caption: message,
                access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
            };
            const response = await axios.post(photoUrl, photoPayload);
            return NextResponse.json({
                success: true,
                postId: response.data.id,
                type: 'photo'
            });
        }

        // Regular text/link post
        const response = await axios.post(postUrl, payload);

        return NextResponse.json({
            success: true,
            postId: response.data.id,
            type: 'feed'
        });

    } catch (error: unknown) {
        console.error('Facebook Post Error:', error);

        // Extract Facebook API error if available
        const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
        const fbError = axiosError?.response?.data?.error?.message || 'Failed to post to Facebook';

        return NextResponse.json(
            { error: fbError },
            { status: 500 }
        );
    }
}

// GET endpoint to check token status
export async function GET() {
    try {
        if (!FACEBOOK_PAGE_ID || !FACEBOOK_PAGE_ACCESS_TOKEN) {
            return NextResponse.json({
                configured: false,
                error: 'Facebook Page credentials not configured'
            });
        }

        // Verify the token by fetching page info
        const debugUrl = `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}?fields=name,id&access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`;
        const response = await axios.get(debugUrl);

        return NextResponse.json({
            configured: true,
            pageId: response.data.id,
            pageName: response.data.name,
        });
    } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
        return NextResponse.json({
            configured: false,
            error: axiosError?.response?.data?.error?.message || 'Invalid token'
        });
    }
}
