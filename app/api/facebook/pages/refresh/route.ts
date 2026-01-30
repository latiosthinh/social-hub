import { NextRequest, NextResponse } from 'next/server';
import { getFacebookPages, updateFacebookPageToken } from '@/services/facebook-pages';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        const { userAccessToken } = await request.json();
        if (!userAccessToken) {
            return NextResponse.json({ error: 'User Access Token required' }, { status: 400 });
        }

        // 1. Fetch all pages available to this user from Facebook
        const fbResponse = await axios.get(
            `https://graph.facebook.com/v19.0/me/accounts?fields=id,access_token&limit=100&access_token=${userAccessToken}`
        );
        const fbPages = fbResponse.data.data as { id: string, access_token: string }[];

        // 2. Get currently stored pages for this user
        const storedPages = getFacebookPages(userId);

        // 3. Update tokens for matching pages
        let updatedCount = 0;
        for (const storedPage of storedPages) {
            const freshPageData = fbPages.find(p => p.id === storedPage.page_id);
            if (freshPageData) {
                updateFacebookPageToken(userId, storedPage.page_id, freshPageData.access_token);
                updatedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            updatedCount,
            message: `Successfully refreshed tokens for ${updatedCount} pages.`
        });

    } catch (error: any) {
        console.error('Error refreshing Facebook tokens:', error?.response?.data || error);
        return NextResponse.json(
            { error: 'Failed to refresh tokens from Facebook' },
            { status: 500 }
        );
    }
}
