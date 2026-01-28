'use client';

import { useRef } from 'react';
import { fileName, htmlContent, isDragOver, error } from '@/lib/cms/store';
import { useZignal } from '@/hooks/cms/useZignal';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileIcon, UploadCloud, RotateCcw, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
    onParse: () => void;
    onReset: () => void;
    isParsing: boolean;
}

export default function FileUpload({ onParse, onReset, isParsing }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use useZignal hook for reactivity
    const currentFileName = useZignal(fileName);
    const currentHtmlContent = useZignal(htmlContent);
    const currentIsDragOver = useZignal(isDragOver);

    const handleFileSelect = (file: File) => {
        if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
            error.set('Please select an HTML file');
            return;
        }

        fileName.set(file.name);
        error.set('');

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            htmlContent.set(content);
        };
        reader.onerror = () => {
            error.set('Failed to read file');
        };
        reader.readAsText(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        isDragOver.set(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        isDragOver.set(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        isDragOver.set(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    return (
        <Card className="hover:border-primary/50 transition-colors p-0 border-none">
            <CardContent className="p-0">
                <div
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4",
                        currentIsDragOver
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground/25 bg-muted/50 hover:border-primary hover:bg-muted"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className={cn(
                        "h-16 w-16 rounded-full bg-muted flex items-center justify-center transition-colors",
                        currentIsDragOver && "bg-background"
                    )}>
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            Click to browse or drag and drop your HTML file
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supports .html and .htm files exported from Optimizely
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".html,.htm"
                        className="hidden"
                        onChange={handleFileInputChange}
                    />

                    {currentFileName && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium border border-primary/20">
                            <FileIcon className="h-3.5 w-3.5" />
                            {currentFileName}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-4 px-0">
                <Button
                    variant="secondary"
                    onClick={onReset}
                    disabled={!currentFileName}
                    className="gap-2"
                >
                    <RotateCcw className="h-4 w-4" /> Reset
                </Button>
                <Button
                    onClick={onParse}
                    disabled={!currentHtmlContent || isParsing}
                    className="gap-2"
                >
                    {isParsing ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Parsing...
                        </>
                    ) : (
                        <>
                            Parse Content
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
