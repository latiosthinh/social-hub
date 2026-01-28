import * as cheerio from 'cheerio';
import { ParsedContent } from './types';

/**
 * Parse HTML content exported from Optimizely CMS
 * Extracts content fields based on data-testid attributes
 */
export function parseHtmlContent(htmlString: string): ParsedContent {
    const $ = cheerio.load(htmlString);

    // Extract content type from the heading
    const contentTypeName = $('h5').text().replace('Content Type:', '').trim();

    // Helper function to extract text from a field
    const getFieldText = (testId: string): string => {
        const field = $(`[data-testid="${testId}"]`);
        // Get the text content, excluding placeholder text
        const text = field.find('.stc-OccInlineField-value p:not(.placeholder-text)').text().trim();
        return text || field.find('.stc-OccInlineField-value').text().trim();
    };

    // Helper function to extract HTML content (for rich text)
    const getFieldHtml = (testId: string): string => {
        const field = $(`[data-testid="${testId}"]`);
        const valueContainer = field.find('.stc-OccInlineField-value > div');
        if (valueContainer.length) {
            return valueContainer.html()?.trim() || '';
        }
        return '';
    };

    // Check if a field has content (not just placeholder)
    const hasContent = (testId: string): boolean => {
        const field = $(`[data-testid="${testId}"]`);
        return !field.find('.placeholder-text').length || field.find('.stc-OccInlineField-value p:not(.placeholder-text)').length > 0;
    };

    // Extract title from h3 as fallback
    const titleFromH3 = $('h3').text().replace('Title:', '').trim();

    // Parse all fields
    const parsed: ParsedContent = {
        title: getFieldText('/title') || titleFromH3,
        body: getFieldHtml('/body'),
        author: getFieldText('/author'),
        metaTitle: getFieldText('/metaTitle'),
        metaDescription: getFieldText('/metaDescription'),
        urlSlug: hasContent('/urlSlug') ? getFieldText('/urlSlug') : '',
        featuredMedia: hasContent('/featuredMedia') ? getFieldText('/featuredMedia') : null,
        contentTypeName: contentTypeName || 'Unknown',
    };

    return parsed;
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

/**
 * Map parsed content to Optimizely CMS content item format
 */
export function mapToContentItem(
    parsed: ParsedContent,
    contentType: string,
    status: 'draft' | 'published' | 'scheduled',
    delayPublishUntil?: string,
    container?: string,
    locale?: string,
    isRoutable?: boolean
): Record<string, unknown> {
    const contentItem: Record<string, unknown> = {
        contentType,
        displayName: parsed.title,
        status,
        properties: {
            title: parsed.title,
            body: parsed.body,
            author: parsed.author,
            metaTitle: parsed.metaTitle,
            metaDescription: parsed.metaDescription,
        },
    };

    // Only include routeSegment for routable content types
    if (isRoutable) {
        contentItem.routeSegment = parsed.urlSlug || generateSlug(parsed.title);

        if (parsed.urlSlug) {
            (contentItem.properties as Record<string, unknown>).urlSlug = parsed.urlSlug;
        }
    }

    // Add container if provided (required by CMS API)
    if (container) {
        contentItem.container = container;
    }

    // Add locale if provided (required for localized content types)
    if (locale) {
        contentItem.locale = locale;
    }

    if (status === 'scheduled' && delayPublishUntil) {
        contentItem.delayPublishUntil = delayPublishUntil;
    }

    return contentItem;
}
