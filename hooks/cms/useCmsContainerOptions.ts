import { useEffect } from 'react';
import { containerOptions, isLoadingContainers } from '@/lib/cms/store';

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

export function useCmsContainerOptions() {
    useEffect(() => {
        const fetchContainers = async () => {
            isLoadingContainers.set(true);

            try {
                // Call server-side GraphQL route instead of direct GraphQL endpoint
                const response = await fetch('/api/cms/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: CONTAINERS_QUERY,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch containers');
                }

                const result = await response.json();

                if (result.errors) {
                    console.error('GraphQL errors:', result.errors);
                    throw new Error('GraphQL query failed');
                }

                const containers = result.data?.BlankExperience?.items?.map((item: any) => ({
                    key: item._itemMetadata.key,
                    displayName: item._itemMetadata.displayName || item._itemMetadata.key,
                })) || [];

                containerOptions.set(containers);
            } catch (error) {
                console.error('Error fetching containers:', error);
                // Set empty array on error so the component can still render
                containerOptions.set([]);
            } finally {
                isLoadingContainers.set(false);
            }
        };

        // Only fetch if we don't have options yet
        if (containerOptions.get().length === 0) {
            fetchContainers();
        }
    }, []);

    return {
        containers: containerOptions.get(),
        isLoading: isLoadingContainers.get(),
    };
}
