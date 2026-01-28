import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    const apiUrl = process.env.OPTIMIZELY_API_URL;

    if (!authHeader) {
        return NextResponse.json(
            { error: 'Missing Authorization header' },
            { status: 401 }
        );
    }

    if (!apiUrl) {
        return NextResponse.json(
            { error: 'Missing API URL in environment variables' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();

        const response = await fetch(`${apiUrl}/preview3/experimental/content`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(body),
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
