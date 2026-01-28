import { accessToken } from '@/lib/cms/store';
import type { TokenResponse } from '@/lib/cms/types';

export function useCmsAuth() {
    const authenticate = async (): Promise<string> => {
        const currentToken = accessToken.get();
        if (currentToken) {
            return currentToken;
        }

        const response = await fetch('/api/cms/auth', { method: 'POST' });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Authentication failed');
        }

        const data: TokenResponse = await response.json();
        accessToken.set(data.access_token);
        return data.access_token;
    };

    return { authenticate };
}
