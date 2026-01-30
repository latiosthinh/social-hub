import { NextRequest, NextResponse } from 'next/server';
import { getContainers } from '@/lib/cms/containers';

async function handleRequest() {
    try {
        const containers = await getContainers();
        return NextResponse.json({ containers });
    } catch (error) {
        console.error('Container API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return handleRequest();
}

export async function POST(request: NextRequest) {
    return handleRequest();
}
