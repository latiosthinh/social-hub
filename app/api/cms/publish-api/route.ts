import { NextRequest, NextResponse } from 'next/server';
import { mapToContentItem } from '@/lib/cms/html-parser';
import { getContainers } from '@/lib/cms/containers';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Check for secret key in headers (support both underscore and hyphen formats)
        const secretKey = request.headers.get('X_API_Secret_Key') || request.headers.get('X-API-Secret-Key');

        if (!secretKey) {
            return NextResponse.json(
                { error: 'Unauthorized: Missing API secret key' },
                { status: 401 }
            );
        }

        // Validate key against database
        const db = getDb();
        const user = db.prepare('SELECT id FROM users WHERE api_secret_key = ?').get(secretKey) as { id: string } | undefined;

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid API secret key' },
                { status: 401 }
            );
        }

        // Proceed...
        const body = await request.json();
        const { content, options = {} } = body;

        // Validate required fields
        if (!content || !content.title || !content.body) {
            return NextResponse.json(
                { error: 'Missing required content fields: title and body are required' },
                { status: 400 }
            );
        }

        const containerId = options.container;

        // If no container ID is provided, return the payload for specific container selection
        if (!containerId) {
            let containers: any[] = [];
            try {
                containers = await getContainers();
            } catch (error) {
                console.warn('Failed to fetch containers for selection payload:', error);
                // Continue without containers, or potentially return an error depending on strictness.
                // For now, let's allow it to proceed but with empty containers, 
                // though the frontend might struggle.
            }

            const contentItem = mapToContentItem(
                content,
                options.contentType || 'OpalPage',
                options.status || 'draft',
                options.delayPublishUntil,
                undefined, // No container yet
                options.locale || 'en-US',
                options.isRoutable !== false
            );

            return NextResponse.json({
                action: 'select_container',
                payload: {
                    content: content,
                    options: {
                        ...options,
                    },
                    mappedItem: contentItem,
                    containers: containers
                }
            });
        }

        // If container ID is provided, proceed to publish
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

        // Map content to Optimizely format with the provided container
        const contentItem = mapToContentItem(
            content,
            options.contentType || 'OpalPage',
            options.status || 'draft',
            options.delayPublishUntil,
            containerId,
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
