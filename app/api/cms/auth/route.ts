import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));

    const clientId = body.clientId || process.env.OPTIMIZELY_CLIENT_ID;
    const clientSecret = body.clientSecret || process.env.OPTIMIZELY_CLIENT_SECRET;
    const apiUrl = body.apiUrl || process.env.OPTIMIZELY_API_URL;

    if (!clientId || !clientSecret || !apiUrl) {
        return NextResponse.json(
            { error: 'Missing Optimizely credentials. Please configure them in the UI or environment variables.' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(`${apiUrl}/oauth/token`, {
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

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OAuth failed:', errorText);
            return NextResponse.json(
                { error: `Authentication failed: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
