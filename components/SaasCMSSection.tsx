'use client';

import ErrorDisplay from '@/components/cms/ErrorDisplay';
import FileUpload from '@/components/cms/FileUpload';
import ParsedContentEditor from '@/components/cms/ParsedContentEditor';
import PublishResult from '@/components/cms/PublishResult';
import SimplifiedPublishingOptions from '@/components/cms/SimplifiedPublishingOptions';
import { OptimizelyConfig } from '@/components/cms/OptimizelyConfig';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCmsContainerOptions } from '@/hooks/cms/useCmsContainerOptions';
import { useCmsContentParser } from '@/hooks/cms/useCmsContentParser';
import { useCmsContentPublisher } from '@/hooks/cms/useCmsContentPublisher';
import { useZignal } from '@/hooks/useZignal';
import {
    container,
    displayName,
    editedContent,
    error,
    fileName,
    htmlContent,
    isLoading,
    isParsing,
    isRoutable,
    locale,
    parsedContent,
    publishResult,
    scheduledDate,
    status
} from '@/lib/cms/store';

export function SaasCMSSection() {
    const currentIsParsing = useZignal(isParsing);
    const currentIsLoading = useZignal(isLoading);
    const currentContainer = useZignal(container);
    const currentParsedContent = useZignal(parsedContent);

    // CMS hooks
    const { handleParse } = useCmsContentParser();
    const { handlePublish } = useCmsContentPublisher();

    // Fetch container options on component mount
    useCmsContainerOptions();

    const handleReset = () => {
        fileName.set('');
        htmlContent.set('');
        parsedContent.set(null);
        editedContent.set(null);
        displayName.set('');
        status.set('draft');
        scheduledDate.set('');
        container.set('');
        locale.set('en-US');
        isRoutable.set(false);
        publishResult.set(null);
        error.set('');
    };

    return (
        <section className="space-y-6">
            {/* Main Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold capitalize text-white flex items-center gap-2">
                        <span className="text-primary">SaasCMS</span>
                    </h2>
                </div>
            </div>

            <div className="space-y-8">
                {/* Configuration Section */}
                <OptimizelyConfig />

                {/* Simplified Publishing Options (Always visible at top) */}
                <SimplifiedPublishingOptions />

                <div className="animate-in slide-in-from-top-4 duration-300 fade-in border-t pt-6 border-border/50">
                    <FileUpload
                        onParse={handleParse}
                        onReset={handleReset}
                        isParsing={currentIsParsing}
                    />

                    <ParsedContentEditor
                        onPublish={handlePublish}
                        isPublishing={currentIsLoading}
                        canPublish={!!currentContainer}
                    />

                    <ErrorDisplay />
                </div>

                <PublishResult />
            </div>
        </section>
    );
}
