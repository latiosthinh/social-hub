import { createZignal } from '@zignal/core';

export type PlatformType = 'cms' | 'facebook' | 'linkedin' | 'tiktok';

// Platform visibility toggles
export const showPlatform = createZignal<PlatformType>('cms').store;