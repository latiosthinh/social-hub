'use client';

import { publishResult } from '@/lib/cms/store';
import { useZignal } from '@/hooks/cms/useZignal';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PublishResult() {
    const currentPublishResult = useZignal(publishResult);

    if (!currentPublishResult) return null;

    const isSuccess = currentPublishResult.success;

    return (
        <Card className={cn(
            "mt-6 border-l-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4",
            isSuccess
                ? "border-l-emerald-500 border-t-border border-r-border border-b-border bg-emerald-500/5"
                : "border-l-destructive border-t-border border-r-border border-b-border bg-destructive/5"
        )}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                {isSuccess ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                    <XCircle className="h-6 w-6 text-destructive" />
                )}
                <CardTitle className={cn(
                    "text-lg",
                    isSuccess ? "text-emerald-500" : "text-destructive"
                )}>
                    {isSuccess ? 'Published Successfully!' : 'Publish Failed'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md bg-muted p-4 font-mono text-xs overflow-x-auto border border-border">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground border-b border-border/50 pb-2">
                        <Terminal className="h-3 w-3" />
                        <span>Response Output</span>
                    </div>
                    <pre className="text-foreground/80">
                        {JSON.stringify(currentPublishResult.data, null, 2)}
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
}
