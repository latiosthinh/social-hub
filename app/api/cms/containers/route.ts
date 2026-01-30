import { NextRequest, NextResponse } from 'next/server';

const CONTAINERS_QUERY = `
  query AllRoutesQuery {
    BlankExperience {
      items {
        _itemMetadata {
          key
          displayName
        }
      }
      total(all: true)
    }
  }
`;

export async function GET(request: NextRequest) {
    try {
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
                query: CONTAINERS_QUERY,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Container fetch failed:', {
                status: response.status,
                error: errorText
            });
            return NextResponse.json(
                { error: 'Failed to fetch containers from CMS' },
                { status: response.status }
            );
        }

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            return NextResponse.json(
                { error: 'GraphQL query failed', details: result.errors },
                { status: 400 }
            );
        }

        const containers = result.data?.BlankExperience?.items?.map((item: any) => ({
            key: item._itemMetadata.key,
            displayName: item._itemMetadata.displayName || item._itemMetadata.key,
        })) || [];

        return NextResponse.json({ containers });
    } catch (error) {
        console.error('Container API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
