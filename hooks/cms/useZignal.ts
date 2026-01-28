import { useEffect, useState } from 'react';
import type { ZignalStore } from '@zignal/core';

/**
 * React hook to subscribe to a Zignal store and trigger re-renders on changes
 */
export function useZignal<T>(store: ZignalStore<T>): T {
    const [value, setValue] = useState<T>(store.get());

    useEffect(() => {
        // Subscribe to changes
        const unsubscribe = store.subscribe(() => {
            setValue(store.get());
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, [store]);

    return value;
}
