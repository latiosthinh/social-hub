'use client';

import { editedContent, displayName } from '@/lib/cms/store';
import { useZignal } from '@/hooks/cms/useZignal';
import type { ParsedContent } from '@/lib/cms/types';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Rocket } from "lucide-react"

interface ParsedContentEditorProps {
    onPublish: () => void;
    isPublishing: boolean;
    canPublish: boolean;
}

export default function ParsedContentEditor({ onPublish, isPublishing, canPublish }: ParsedContentEditorProps) {
    const currentEditedContent = useZignal(editedContent);
    const currentDisplayName = useZignal(displayName);

    if (!currentEditedContent) return null;

    const updateContent = (updates: Partial<ParsedContent>) => {
        editedContent.set({ ...currentEditedContent, ...updates });
    };

    return (
        <Card className="border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span>Parsed Content Fields</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input
                            id="display-name"
                            value={currentDisplayName}
                            onChange={(e) => displayName.set(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={currentEditedContent.title}
                            onChange={(e) => updateContent({ title: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="author">Author</Label>
                        <Input
                            id="author"
                            value={currentEditedContent.author}
                            onChange={(e) => updateContent({ author: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="url-slug">URL Slug</Label>
                        <Input
                            id="url-slug"
                            value={currentEditedContent.urlSlug || ''}
                            onChange={(e) => updateContent({ urlSlug: e.target.value })}
                            placeholder="auto-generated-from-title"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="meta-title">Meta Title</Label>
                    <Input
                        id="meta-title"
                        value={currentEditedContent.metaTitle || ''}
                        onChange={(e) => updateContent({ metaTitle: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="meta-desc">Meta Description</Label>
                    <Textarea
                        id="meta-desc"
                        value={currentEditedContent.metaDescription || ''}
                        onChange={(e) => updateContent({ metaDescription: e.target.value })}
                        className="min-h-[80px]"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Body (Rich Text Preview)</Label>
                    <div
                        className="rounded-md border bg-muted/30 p-4 text-sm max-h-[200px] overflow-y-auto prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: currentEditedContent.body || '<p class="text-muted-foreground text-xs italic">No content</p>' }}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end p-4 border-t border-border/50 bg-muted/10">
                <Button
                    onClick={onPublish}
                    disabled={!canPublish || isPublishing}
                    className="w-full md:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    size="lg"
                >
                    {isPublishing ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Publishing...
                        </>
                    ) : (
                        <>
                            <Rocket className="h-4 w-4" />
                            Publish to CMS
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
