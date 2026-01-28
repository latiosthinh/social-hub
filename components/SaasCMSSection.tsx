'use client';

import { useZignal } from '@/hooks/useZignal';
import { showManualUpload } from '@/lib/platform-store';
import ErrorDisplay from '@/components/cms/ErrorDisplay';
import PublishResult from '@/components/cms/PublishResult';
import FileUpload from '@/components/cms/FileUpload';
import SimplifiedPublishingOptions from '@/components/cms/SimplifiedPublishingOptions';
import ParsedContentEditor from '@/components/cms/ParsedContentEditor';
import { useCmsContentParser } from '@/hooks/cms/useCmsContentParser';
import { useCmsContentPublisher } from '@/hooks/cms/useCmsContentPublisher';
import { useCmsContainerOptions } from '@/hooks/cms/useCmsContainerOptions';
import {
    fileName,
    htmlContent,
    parsedContent,
    editedContent,
    displayName,
    status,
    scheduledDate,
    container,
    locale,
    isRoutable,
    publishResult,
    error,
    isParsing,
    isLoading
} from '@/lib/cms/store';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, FolderOpen, X } from "lucide-react"

export function SaasCMSSection() {
    const isManualUploadVisible = useZignal(showManualUpload);
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

                <div className="flex items-center gap-3">
                    <Label htmlFor="saascms-manual-upload-toggle" className="text-xs font-semibold uppercase tracking-wider text-white/70 cursor-pointer">
                        Manual Upload
                    </Label>
                    <Switch
                        id="saascms-manual-upload-toggle"
                        checked={isManualUploadVisible}
                        onCheckedChange={(c) => showManualUpload.set(c)}
                    />
                </div>
            </div>

            <div className="space-y-8">
                {/* Simplified Publishing Options (Always visible at top) */}
                <SimplifiedPublishingOptions />

                {/* Manual Upload Section */}
                {isManualUploadVisible && (
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
                )}

                <PublishResult />
            </div>
        </section>
    );
}
