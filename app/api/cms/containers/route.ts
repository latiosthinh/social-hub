import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    const apiUrl = process.env.OPTIMIZELY_API_URL;

    if (!authHeader) {
        return NextResponse.json(
            { error: 'Missing Authorization header' },
            { status: 401 }
        );
    }

    if (!apiUrl) {
        return NextResponse.json(
            { error: 'Missing API URL in environment variables' },
            { status: 500 }
        );
    }

    try {
        // Fetch content items that can act as containers
        // Using the experimental content API to list content
        const response = await fetch(`${apiUrl}/preview3/experimental/content/versions?pageIndex=0&pageSize=50`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': authHeader,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Failed to fetch containers: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Filter for container types (pages, folders, etc.)
        const containers = data.items?.filter((item: any) => {
            const baseType = item.contentType?.toLowerCase() || '';
            return baseType.includes('page') || baseType.includes('folder') || baseType.includes('container');
        }) || [];

        return NextResponse.json({ items: containers });
    } catch (error) {
        console.error('Containers fetch error:', error);
        return NextResponse.json(
            { error: `Failed to fetch containers: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}
