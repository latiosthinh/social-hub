import { NextRequest, NextResponse } from 'next/server';
import { getFacebookPages, addFacebookPage, removeFacebookPage, toggleFacebookPage } from '@/services/facebook-pages';
import axios from 'axios';

const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

// GET - List all Facebook pages for the user
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        const pages = getFacebookPages(userId);
        return NextResponse.json({ pages });
    } catch (error) {
        console.error('Error fetching Facebook pages:', error);
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

// POST - Add a new Facebook page
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        const { pageId, pageName, accessToken } = await request.json();

        if (!pageId) {
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }

        // Optionally verify the page exists by fetching its info
        let verifiedPageName = pageName;
        // If we have a specific access token for this page, use it. 
        // Otherwise fall back to env token (legacy support) or skip verification logic if no token available.
        const tokenToUse = accessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

        if (tokenToUse && !pageName) {
            try {
                const response = await axios.get(
                    `https://graph.facebook.com/v18.0/${pageId}?fields=name&access_token=${tokenToUse}`
                );
                verifiedPageName = response.data.name;
            } catch {
                // Page might not be accessible with the token, but still allow adding
                console.log('Could not verify page name, using provided or empty');
            }
        }

        const page = addFacebookPage(userId, pageId, verifiedPageName, accessToken);
        return NextResponse.json({ success: true, page });
    } catch (error: unknown) {
        console.error('Error adding Facebook page:', error);
        const message = (error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE'
            ? 'This page is already added'
            : 'Failed to add page';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

// DELETE - Remove a Facebook page
export async function DELETE(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }

        const deleted = removeFacebookPage(id, userId);
        if (!deleted) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing Facebook page:', error);
        return NextResponse.json({ error: 'Failed to remove page' }, { status: 500 });
    }
}

// PATCH - Toggle page active status
export async function PATCH(request: NextRequest) {
    try {
        const { id, isActive } = await request.json();

        if (!id || typeof isActive !== 'boolean') {
            return NextResponse.json({ error: 'id and isActive are required' }, { status: 400 });
        }

        toggleFacebookPage(id, isActive);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error toggling Facebook page:', error);
        return NextResponse.json({ error: 'Failed to toggle page' }, { status: 500 });
    }
}
