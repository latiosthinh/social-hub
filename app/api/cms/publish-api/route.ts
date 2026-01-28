import { NextRequest, NextResponse } from 'next/server';
import { mapToContentItem } from '@/lib/cms/html-parser';

// Secret key for API authentication
const API_SECRET_KEY = process.env.CMS_API_SECRET_KEY || 'your-secret-key-here';

export async function POST(request: NextRequest) {
    try {
        // Check for secret key in headers
        const secretKey = request.headers.get('X-API-Secret-Key');

        if (!secretKey || secretKey !== API_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid or missing API secret key' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { content, options } = body;

        // Validate required fields
        if (!content || !content.title || !content.body) {
            return NextResponse.json(
                { error: 'Missing required content fields: title and body are required' },
                { status: 400 }
            );
        }

        if (!options || !options.container) {
            return NextResponse.json(
                { error: 'Missing required options: container is required' },
                { status: 400 }
            );
        }

        // Get OAuth token
        const clientId = process.env.OPTIMIZELY_CLIENT_ID;
        const clientSecret = process.env.OPTIMIZELY_CLIENT_SECRET;
        const apiUrl = process.env.OPTIMIZELY_API_URL;

        if (!clientId || !clientSecret || !apiUrl) {
            return NextResponse.json(
                { error: 'Server configuration error: Missing Optimizely credentials' },
                { status: 500 }
            );
        }

        const authResponse = await fetch(`${apiUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        if (!authResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to authenticate with Optimizely' },
                { status: 500 }
            );
        }

        const authData = await authResponse.json();
        const accessToken = authData.access_token;

        // Map content to Optimizely format
        const contentItem = mapToContentItem(
            content,
            options.contentType || 'OpalPage',
            options.status || 'draft',
            options.delayPublishUntil,
            options.container,
            options.locale || 'en-US',
            options.isRoutable !== false
        );

        // Publish to Optimizely
        const publishResponse = await fetch(`${apiUrl}/preview3/experimental/content`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(contentItem),
        });

        if (!publishResponse.ok) {
            const errorData = await publishResponse.json().catch(() => ({}));
            return NextResponse.json(
                {
                    error: `Failed to publish content: ${publishResponse.status}`,
                    details: errorData
                },
                { status: publishResponse.status }
            );
        }

        const publishData = await publishResponse.json();
        return NextResponse.json({
            success: true,
            data: publishData
        }, { status: 201 });

    } catch (error) {
        console.error('API Publish error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
