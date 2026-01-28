'use client';

import { editedContent, error } from '@/lib/cms/store';
import { useZignal } from '@/hooks/cms/useZignal';

export default function EmptyState() {
    const currentEditedContent = useZignal(editedContent);
    const currentError = useZignal(error);

    if (currentEditedContent || currentError) return null;

    return (
        <div className="card">
            <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <p>Upload an HTML file to preview content</p>
            </div>
        </div>
    );
}
