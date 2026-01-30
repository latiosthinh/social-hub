import { createZignal } from '@zignal/core';
import { ParsedContent } from './types';

// File upload state
export const fileName = createZignal<string>('').store;
export const htmlContent = createZignal<string>('').store;
export const isDragOver = createZignal<boolean>(false).store;

// Parsed content state
export const parsedContent = createZignal<ParsedContent | null>(null).store;
export const editedContent = createZignal<ParsedContent | null>(null).store;
export const displayName = createZignal<string>('').store;

// Content type state
export const contentType = createZignal<string>('OpalPage').store;

// Publish options state
export type PublishStatus = 'draft' | 'published' | 'scheduled';
export const status = createZignal<PublishStatus>('draft').store;
export const scheduledDate = createZignal<string>('').store;
export const container = createZignal<string>('').store;
export const locale = createZignal<string>('en').store;
export const isRoutable = createZignal<boolean>(true).store;

// UI state
export const isLoading = createZignal<boolean>(false).store;
export const isParsing = createZignal<boolean>(false).store;
export const publishResult = createZignal<{ success: boolean; data: unknown } | null>(null).store;
export const error = createZignal<string>('').store;

// Auth state
export const accessToken = createZignal<string>('').store;

// GraphQL state - Container options
export interface ContainerOption {
    key: string;
    displayName: string;
}
export const containerOptions = createZignal<ContainerOption[]>([]).store;
export const isLoadingContainers = createZignal<boolean>(false).store;

// Optimizely Configuration
export const optimizelyClientId = createZignal<string>('').store;
export const optimizelyClientSecret = createZignal<string>('').store;
export const optimizelyApiUrl = createZignal<string>('https://api.cms.optimizely.com').store;
export const optimizelyGraphqlEndpoint = createZignal<string>('https://cg.optimizely.com/content/v2').store;
export const optimizelyAuthToken = createZignal<string>('').store;
