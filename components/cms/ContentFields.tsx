'use client';

import { editedContent, displayName } from '@/lib/cms/store';
import { useZignal } from '@/hooks/cms/useZignal';
import type { ParsedContent } from '@/lib/cms/types';

export default function ContentFields() {
    const currentEditedContent = useZignal(editedContent);
    const currentDisplayName = useZignal(displayName);

    if (!currentEditedContent) return null;

    const updateContent = (updates: Partial<ParsedContent>) => {
        editedContent.set({ ...currentEditedContent, ...updates });
    };

    return (
        <div className="section">
            <div className="section-title">Content Fields</div>
            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input
                        type="text"
                        className="form-input"
                        value={currentDisplayName}
                        onChange={(e) => displayName.set(e.target.value)}
                        placeholder="Enter display name"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-input"
                        value={currentEditedContent.title}
                        onChange={(e) => updateContent({ title: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Author</label>
                    <input
                        type="text"
                        className="form-input"
                        value={currentEditedContent.author}
                        onChange={(e) => updateContent({ author: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">URL Slug</label>
                    <input
                        type="text"
                        className="form-input"
                        value={currentEditedContent.urlSlug}
                        onChange={(e) => updateContent({ urlSlug: e.target.value })}
                        placeholder="auto-generated-from-title"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Meta Title</label>
                <input
                    type="text"
                    className="form-input"
                    value={currentEditedContent.metaTitle}
                    onChange={(e) => updateContent({ metaTitle: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Meta Description</label>
                <textarea
                    className="form-textarea"
                    value={currentEditedContent.metaDescription}
                    onChange={(e) => updateContent({ metaDescription: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Body (Rich Text)</label>
                <div
                    className="rich-text-preview"
                    dangerouslySetInnerHTML={{ __html: currentEditedContent.body }}
                />
            </div>
        </div>
    );
}
