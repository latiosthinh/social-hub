import { NextResponse } from 'next/server';
import { getAccounts } from '@/services/accounts';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const accounts = getAccounts(userId);
        return NextResponse.json(accounts);
    } catch (error) {
        console.error('Get accounts error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { platform, display_name } = await request.json();
        // We need userId. Header passed by client lib.
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 401 });
        }

        if (!platform || !display_name) {
            return NextResponse.json({ error: "Platform and display name required" }, { status: 400 });
        }

        const { addAccount } = await import('@/services/accounts');
        const newAccount = addAccount(userId, platform, display_name);
        return NextResponse.json(newAccount);

    } catch (error) {
        console.error("Add account error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
