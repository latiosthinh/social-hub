// Parsed content from HTML file
export interface ParsedContent {
    title: string;
    body: string;
    author: string;
    metaTitle: string;
    metaDescription: string;
    urlSlug: string;
    featuredMedia: string | null;
    contentTypeName: string;
}

// Content type from Optimizely CMS API
export interface ContentType {
    key: string;
    displayName: string;
    description: string;
    baseType: string;
    properties: Record<string, ContentTypeProperty>;
}

export interface ContentTypeProperty {
    type: string;
    displayName: string;
    description: string;
    localized: boolean;
    required: boolean;
}

// Publish request payload
export interface PublishRequest {
    contentType: string;
    displayName: string;
    status: 'draft' | 'published' | 'scheduled';
    delayPublishUntil?: string;
    locale?: string;
    container?: string;
    routeSegment?: string;
    properties: Record<string, unknown>;
}

// API response from content creation
export interface PublishResponse {
    key: string;
    locale: string;
    version: string;
    contentType: string;
    displayName: string;
    status: string;
    lastModified: string;
}

// OAuth token response
export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

// Content types list response
export interface ContentTypesResponse {
    items: ContentType[];
    pageIndex: number;
    pageSize: number;
    totalItemCount: number;
}
