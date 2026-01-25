import { NextResponse } from 'next/server';
import { exchangeFacebookCode, getFacebookProfile } from '@/services/oauth';
import { addAccount } from '@/services/accounts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: Request, context: any) {
    const { provider } = await context.params;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.json({ error: `OAuth Error: ${error}` }, { status: 400 });
    }

    if (provider === 'facebook') {
        if (!code || !state) {
            return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
        }

        try {
            const userId = state;
            const tokenData = await exchangeFacebookCode(code);
            const accessToken = tokenData.access_token;
            const profile = await getFacebookProfile(accessToken);

            addAccount(userId, 'facebook', profile.name, profile.id, accessToken);

            // Redirect to home page
            return NextResponse.redirect(new URL('/', request.url));
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.error("OAuth Callback Error:", (err as any).response?.data || (err as any).message);
            return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Provider not supported" }, { status: 400 });
}
