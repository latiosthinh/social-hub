import { createZignal } from '@zignal/core';

// Platform visibility toggles
export const showFacebook = createZignal<boolean>(true).store;
export const showLinkedIn = createZignal<boolean>(false).store;
export const showTikTok = createZignal<boolean>(false).store;
export const showSaasCMS = createZignal<boolean>(true).store;

// SaasCMS manual upload toggle
export const showManualUpload = createZignal<boolean>(false).store;
