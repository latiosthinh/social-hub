import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { query, variables } = await request.json();

        const graphqlEndpoint = process.env.OPTIMIZELY_GRAPHQL_ENDPOINT;
        const authToken = process.env.OPTIMIZELY_AUTH_TOKEN;

        if (!graphqlEndpoint || !authToken) {
            return NextResponse.json(
                { error: 'GraphQL endpoint or auth token not configured' },
                { status: 500 }
            );
        }

        const response = await fetch(graphqlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `epi-single ${authToken}`,
            },
            body: JSON.stringify({
                query,
                variables: variables || {},
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GraphQL request failed:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
                endpoint: graphqlEndpoint,
            });
            return NextResponse.json(
                { error: `GraphQL request failed: ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (data.errors) {
            return NextResponse.json(
                { error: 'GraphQL query errors', details: data.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('GraphQL API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
