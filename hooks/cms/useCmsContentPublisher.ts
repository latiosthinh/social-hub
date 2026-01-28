
import {
    editedContent,
    displayName,
    status,
    scheduledDate,
    container,
    locale,
    isRoutable,
    isLoading,
    error,
    publishResult
} from '@/lib/cms/store';
import { useCmsAuth } from './useCmsAuth';

export function useCmsContentPublisher() {
    const { authenticate } = useCmsAuth();

    const handlePublish = async () => {
        const currentEditedContent = editedContent.get();
        const currentStatus = status.get();
        const currentScheduledDate = scheduledDate.get();
        const currentContainer = container.get();
        const currentLocale = locale.get();
        const currentIsRoutable = isRoutable.get();
        const currentDisplayName = displayName.get();

        if (!currentEditedContent) {
            error.set('Please parse content first');
            return;
        }

        if (currentStatus === 'scheduled' && !currentScheduledDate) {
            error.set('Please select a scheduled date');
            return;
        }

        isLoading.set(true);
        error.set('');
        publishResult.set(null);

        try {
            const token = await authenticate();

            const payload = {
                content: {
                    ...currentEditedContent,
                    title: currentDisplayName || currentEditedContent.title,
                },
                options: {
                    container: currentContainer,
                    status: currentStatus,
                    locale: currentLocale,
                    delayPublishUntil: currentStatus === 'scheduled' ? new Date(currentScheduledDate).toISOString() : undefined,
                    isRoutable: currentIsRoutable
                }
            };

            const response = await fetch('/api/cms/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                publishResult.set({ success: false, data });
                throw new Error(data.error || 'Failed to publish content');
            }

            publishResult.set({ success: true, data });
        } catch (err) {
            const currentPublishResult = publishResult.get();
            if (!currentPublishResult) {
                error.set(err instanceof Error ? err.message : 'Failed to publish content');
            }
        } finally {
            isLoading.set(false);
        }
    };

    return { handlePublish };
}
