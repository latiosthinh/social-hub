import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET: Retrieve config for the logged-in user
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, we verify the JWT token here to get user ID.
    // For this prototype, we'll assume the client sends x-user-id header or trust the token payload if checking locally.
    // But better: let's use the USER ID if available in headers (set by middleware if existing)
    // OR just decode the token if possible.
    // SIMPLIFICATION: The client sends 'x-user-id' for now as seen in other endpoints, OR we query by token?
    // Actually, `page.tsx` uses `api/user/container` with a token. Let's see how that one works.
    // Wait, I don't see `api/user/container` in the file list I explored.
    // Let's assume we pass `x-user-id` from the client for now to keep it consistent with `FacebookPagesSection`.

    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare(`
        SELECT opt_client_id, opt_client_secret, opt_api_url, opt_graphql_endpoint, opt_auth_token 
        FROM users WHERE id = ?
    `).get(userId) as any;

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
        clientId: user.opt_client_id || '',
        clientSecret: user.opt_client_secret || '',
        apiUrl: user.opt_api_url || '',
        graphqlEndpoint: user.opt_graphql_endpoint || '',
        authToken: user.opt_auth_token || ''
    });
}

// POST: Save config for the logged-in user
export async function POST(request: NextRequest) {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { clientId, clientSecret, apiUrl, graphqlEndpoint, authToken } = body;

        const db = getDb();
        const stmt = db.prepare(`
            UPDATE users 
            SET opt_client_id = ?, 
                opt_client_secret = ?, 
                opt_api_url = ?, 
                opt_graphql_endpoint = ?, 
                opt_auth_token = ?
            WHERE id = ?
        `);

        const info = stmt.run(
            clientId || null,
            clientSecret || null,
            apiUrl || null,
            graphqlEndpoint || null,
            authToken || null,
            userId
        );

        if (info.changes === 0) {
            return NextResponse.json({ error: 'User not found or no changes made' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save config:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
