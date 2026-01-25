import { NextResponse } from 'next/server';
import { extendFacebookToken, getFacebookProfile } from '@/services/oauth';
import { addAccount } from '@/services/accounts';

export async function POST(request: Request) {
    try {
        const { accessToken, userId } = await request.json();

        if (!accessToken || !userId) {
            return NextResponse.json({ error: 'Missing accessToken or userId' }, { status: 400 });
        }

        // Verify/Extend token
        const longLivedTokenData = await extendFacebookToken(accessToken);
        const longLivedToken = longLivedTokenData.access_token;

        // Get Profile to confirm identity and get name
        const profile = await getFacebookProfile(longLivedToken);

        // Add to database
        addAccount(userId, 'facebook', profile.name, profile.id, longLivedToken);

        return NextResponse.json({ success: true, profile });
    } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.error("Facebook Connect Error:", (err as any)?.response?.data || (err as any)?.message);
        return NextResponse.json({ error: 'Failed to connect Facebook account' }, { status: 500 });
    }
}
