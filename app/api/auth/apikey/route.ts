import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

function getUserFromToken(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    // Mock token format: mock-jwt-token-USER_ID
    if (!token.startsWith('mock-jwt-token-')) return null;
    const userId = token.replace('mock-jwt-token-', '');
    return userId;
}

export async function POST(request: Request) {
    const userId = getUserFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getDb();
        // Generate 13 chars. 
        // 7 bytes = 14 hex chars. 
        const apiKey = crypto.randomBytes(7).toString('hex').slice(0, 13);

        db.prepare('UPDATE users SET api_secret_key = ? WHERE id = ?').run(apiKey, userId);

        return NextResponse.json({ apiKey });
    } catch (error) {
        console.error('API Key generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const userId = getUserFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getDb();
        const user = db.prepare('SELECT api_secret_key FROM users WHERE id = ?').get(userId) as any;

        return NextResponse.json({ apiKey: user?.api_secret_key || null });
    } catch (error) {
        console.error('API Key fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
