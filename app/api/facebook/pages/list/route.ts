import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const { accessToken } = await request.json();

        if (!accessToken) {
            return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
        }

        // Fetch pages from Facebook using the provided token
        // Use fields to get name, id, and access_token for the page
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/me/accounts?fields=name,id,access_token,tasks&limit=100&access_token=${accessToken}`
        );

        const pages = response.data.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            access_token: p.access_token,
            tasks: p.tasks
        }));

        return NextResponse.json({ pages });
    } catch (error: any) {
        console.error('Error fetching Facebook pages from token:', error?.response?.data || error.message);
        return NextResponse.json(
            { error: error?.response?.data?.error?.message || 'Failed to fetch pages from Facebook' },
            { status: 400 }
        );
    }
}
