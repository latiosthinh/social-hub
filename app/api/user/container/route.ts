import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

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
        const { defaultContainerId } = await request.json();

        if (!defaultContainerId) {
            return NextResponse.json({ error: 'Container ID is required' }, { status: 400 });
        }

        const db = getDb();
        db.prepare('UPDATE users SET default_container_id = ? WHERE id = ?').run(defaultContainerId, userId);

        return NextResponse.json({ success: true, defaultContainerId });
    } catch (error) {
        console.error('Update default container error:', error);
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
        const user = db.prepare('SELECT default_container_id FROM users WHERE id = ?').get(userId) as any;

        return NextResponse.json({ defaultContainerId: user?.default_container_id || null });
    } catch (error) {
        console.error('Fetch default container error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
