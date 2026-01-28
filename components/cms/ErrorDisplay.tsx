'use client';

import { error } from '@/lib/cms/store';
import { useZignal } from '@/hooks/cms/useZignal';
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ErrorDisplay() {
    const currentError = useZignal(error);

    if (!currentError) return null;

    return (
        <div className={cn(
            "mt-6 rounded-lg border border-destructive/50 p-4",
            "bg-destructive/10 text-destructive",
            "flex items-start gap-3"
        )}>
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="text-sm font-medium">
                {currentError}
            </div>
        </div>
    );
}
