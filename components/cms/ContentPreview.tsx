'use client';

import { editedContent, parsedContent, status, container, isLoading } from '@/lib/cms/store';
import { useZignal } from '@/hooks/cms/useZignal';
import PublishingOptions from './PublishingOptions';
import ContentFields from './ContentFields';

interface ContentPreviewProps {
    onPublish: () => void;
}

export default function ContentPreview({ onPublish }: ContentPreviewProps) {
    const currentEditedContent = useZignal(editedContent);
    const currentParsedContent = useZignal(parsedContent);
    const currentStatus = useZignal(status);
    const currentContainer = useZignal(container);
    const currentIsLoading = useZignal(isLoading);

    if (!currentEditedContent) return null;

    return (
        <section className="card fade-in">
            <div className="card-header">
                <div className="card-icon">👁️</div>
                <h2>Content Preview</h2>
                <span className={`status-badge status-${currentStatus}`}>
                    {currentStatus === 'draft' && '📝'}
                    {currentStatus === 'published' && '✅'}
                    {currentStatus === 'scheduled' && '📅'}
                    {currentStatus}
                </span>
            </div>

            <PublishingOptions />
            <ContentFields />

            {/* Detected Info */}
            <div className="section">
                <div className="section-title">Detected Information</div>
                <div className="preview-content">
                    <p><strong>Original Content Type:</strong> {currentParsedContent?.contentTypeName || 'Unknown'}</p>
                    <p><strong>Featured Media:</strong> {currentParsedContent?.featuredMedia || 'None'}</p>
                </div>
            </div>

            {/* Publish Action */}
            <div className="action-bar">
                <button
                    className="btn btn-success"
                    onClick={onPublish}
                    disabled={currentIsLoading || !currentContainer}
                >
                    {currentIsLoading ? (
                        <>
                            <span className="spinner"></span>
                            Publishing...
                        </>
                    ) : (
                        <>🚀 Publish to CMS</>
                    )}
                </button>
            </div>
        </section>
    );
}
