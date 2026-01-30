export interface Container {
    key: string;
    displayName: string;
}

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

export async function getContainers(): Promise<Container[]> {
    const graphqlEndpoint = process.env.OPTIMIZELY_GRAPHQL_ENDPOINT;
    const authToken = process.env.OPTIMIZELY_AUTH_TOKEN;

    if (!graphqlEndpoint || !authToken) {
        throw new Error('GraphQL endpoint or auth token not configured');
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
        throw new Error(`Failed to fetch containers from CMS: ${errorText}`);
    }

    const result = await response.json();

    if (result.errors) {
        throw new Error(`GraphQL query failed: ${JSON.stringify(result.errors)}`);
    }

    return result.data?.BlankExperience?.items?.map((item: any) => ({
        key: item._itemMetadata.key,
        displayName: item._itemMetadata.displayName || item._itemMetadata.key,
    })) || [];
}
