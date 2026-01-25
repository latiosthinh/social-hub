import { NextResponse } from 'next/server';
import { toggleAccount, toggleGroup } from '@/services/accounts';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, id, userId, platform, isActive } = body;

        // type can be 'account' or 'group'
        if (type === 'account' && id !== undefined) {
            toggleAccount(id, isActive);
            return NextResponse.json({ success: true });
        } else if (type === 'group' && userId && platform) {
            toggleGroup(userId, platform, isActive);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }
    } catch (error) {
        console.error('Toggle error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
