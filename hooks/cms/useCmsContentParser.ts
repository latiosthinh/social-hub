import { parseHtmlContent } from '@/lib/cms/html-parser';
import {
    htmlContent,
    parsedContent,
    editedContent,
    displayName,
    isParsing,
    error,
    publishResult
} from '@/lib/cms/store';

export function useCmsContentParser() {
    const handleParse = async () => {
        const currentHtmlContent = htmlContent.get();

        if (!currentHtmlContent) {
            error.set('Please upload an HTML file first');
            return;
        }

        isParsing.set(true);
        error.set('');
        publishResult.set(null);

        try {
            const parsed = parseHtmlContent(currentHtmlContent);
            parsedContent.set(parsed);
            editedContent.set({ ...parsed });
            displayName.set(parsed.title);
        } catch (err) {
            error.set(err instanceof Error ? err.message : 'Failed to parse content');
        } finally {
            isParsing.set(false);
        }
    };

    return { handleParse };
}
