import { NextResponse } from 'next/server';
import { getFacebookAuthUrl } from '@/services/oauth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: Request, context: any) {
    const { provider } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (provider === 'facebook') {
        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }
        const url = getFacebookAuthUrl(userId);
        return NextResponse.redirect(url);
    }

    return NextResponse.json({ error: "Provider not supported" }, { status: 400 });
}
