import { NextRequest, NextResponse } from 'next/server';
import { mapToContentItem } from '@/lib/cms/html-parser';

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    try {
        const body = await request.json();
        const apiUrl = body.apiUrl || process.env.OPTIMIZELY_API_URL;

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Missing Authorization header' },
                { status: 401 }
            );
        }

        if (!apiUrl) {
            return NextResponse.json(
                { error: 'Missing API URL. Please configure it in the UI or environment variables.' },
                { status: 400 }
            );
        }

        // Detect if this is a raw Optimizely payload or our simplified format
        // The simplified format has 'content' and 'options' keys.
        // We will enforce the simplified format for consistency with the Public API.

        let contentItem;

        if (body.content && body.options) {
            const { content, options } = body;
            contentItem = mapToContentItem(
                content,
                options.contentType || 'OpalPage',
                options.status || 'draft',
                options.delayPublishUntil,
                options.container,
                options.locale || 'en-US',
                options.isRoutable !== false
            );
        } else {
            // Fallback for backward compatibility or direct usage? 
            // Better to assume stricter types now to ensure we are using the "API part".
            // But if the client hasn't been updated yet, this might break. 
            // Since we are updating the client in the next step, we can enforce it.
            return NextResponse.json(
                { error: 'Invalid payload format. Expected { content, options }' },
                { status: 400 }
            );
        }

        const response = await fetch(`${apiUrl}/preview3/experimental/content`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(contentItem),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                {
                    error: `Failed to publish content: ${response.status}`,
                    details: errorData
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Publish error:', error);
        return NextResponse.json(
            { error: `Failed to publish content: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}
