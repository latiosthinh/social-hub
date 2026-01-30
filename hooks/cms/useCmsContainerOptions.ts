import { useEffect } from 'react';
import {
    container,
    containerOptions,
    isLoadingContainers,
    optimizelyAuthToken,
    optimizelyGraphqlEndpoint
} from '@/lib/cms/store';
import { useZignal } from '../useZignal';

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
    const endpoint = useZignal(optimizelyGraphqlEndpoint);
    const token = useZignal(optimizelyAuthToken);

    useEffect(() => {
        const fetchContainers = async () => {
            // Only fetch if we have a token (config loaded from DB/UI)
            if (!token) {
                // Should we clear containers? Maybe.
                // containerOptions.set([]);
                return;
            }
            // Only fetch if we have an endpoint and token (or if we want to try with defaults if they are set)
            // But if we are waiting for DB load, we should probably wait until we have a token or endpoint.
            // Check if store has values. The props 'endpoint' and 'token' passed here are reactive.

            // If explicit empty strings in store (default), we might skip or fail. 
            // However, defaults in store.ts are:
            // endpoint: 'https://cg.optimizely.com/content/v2'
            // token: '' 

            // If token is empty, we probably shouldn't fetch yet, UNLESS we expect .env fallback.
            // But we can't know if .env is there from client.
            // Let's just try to fetch. If it fails (400), so be it.
            // BUT, to avoid double fetch (one with default, one with loaded), we can check.

            isLoadingContainers.set(true);
            try {
                const response = await fetch('/api/cms/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: CONTAINERS_QUERY,
                        endpoint: endpoint,
                        token: token
                    }),
                });

                if (!response.ok) {
                    // Don't throw immediately, just set empty? 
                    // Or keep silent if it's just auth error?
                    // throw new Error('Failed to fetch containers');
                    console.warn('Container fetch failed', response.status);
                    containerOptions.set([]);
                    return;
                }

                const result = await response.json();

                if (result.errors) {
                    console.error('GraphQL errors:', result.errors);
                    // throw new Error('GraphQL query failed');
                    containerOptions.set([]);
                    return;
                }

                const containers = result.data?.BlankExperience?.items?.map((item: any) => ({
                    key: item._itemMetadata.key,
                    displayName: item._itemMetadata.displayName || item._itemMetadata.key,
                })) || [];

                containerOptions.set(containers);
            } catch (error) {
                console.error('Error fetching containers:', error);
                containerOptions.set([]);
            } finally {
                isLoadingContainers.set(false);
            }
        };

        // Trigger fetch if we have somewhat valid looking config OR if we haven't fetched yet
        // Debounce could be good but since this changes only on Load/Save now, it's fine.
        fetchContainers();

        // Fetch user default container preference and set if not already set
        const initDefaultContainer = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            try {
                const res = await fetch('/api/user/container', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                // Only set if we don't have one selected yet
                if (data.defaultContainerId && !container.get()) {
                    container.set(data.defaultContainerId);
                }
            } catch (e) {
                console.error("Failed to load user default container", e);
            }
        };

        if (!container.get()) {
            initDefaultContainer();
        }
    }, [endpoint, token]); // Re-run when config changes

    return {
        containers: containerOptions.get(),
        isLoading: isLoadingContainers.get(),
    };
}
