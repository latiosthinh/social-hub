import { useEffect, useState } from 'react';
import type { ZignalStore } from '@zignal/core';

export function useZignal<T>(store: ZignalStore<T>): T {
    const [value, setValue] = useState<T>(store.get());

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setValue(store.get());
        });

        return unsubscribe;
    }, [store]);

    return value;
}
