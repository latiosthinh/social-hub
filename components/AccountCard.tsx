import { Power, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AccountCardProps {
    id: string;
    platform: string; // 'facebook', 'linkedin', 'tiktok'
    displayName: string;
    isActive: boolean;
    onToggle: (id: string, newState: boolean) => void;
    status: 'valid' | 'expired';
}

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const platformColors: Record<string, string> = {
    facebook: 'bg-blue-600',
    linkedin: 'bg-blue-800',
    tiktok: 'bg-black text-white border border-gray-700',
};

export function AccountCard({ id, platform, displayName, isActive, onToggle, status }: AccountCardProps) {
    const isExpired = status === 'expired';

    return (
        <div className={cn(
            "relative p-3 rounded-lg border border-white/10 backdrop-blur-md transition-all duration-300 group hover:translate-y-[-2px]",
            isActive ? "bg-white/5 shadow-lg shadow-black/50" : "bg-white/5 opacity-60 grayscale-[0.5]"
        )}>
            <div className="flex justify-between items-start mb-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white", platformColors[platform] || 'bg-gray-600')}>
                    {platform[0].toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                    {isExpired ? (
                        <AlertCircle className="w-3 h-3 text-rose-500" />
                    ) : (
                        <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-500")} />
                    )}
                </div>
            </div>

            <h3 className="text-white font-medium text-xs truncate mb-2" title={displayName}>{displayName}</h3>

            <button
                onClick={() => !isExpired && onToggle(id, !isActive)}
                disabled={isExpired}
                className={cn(
                    "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors",
                    isActive
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-transparent border border-white/20 text-gray-400 hover:border-white/40"
                )}
            >
                <Power className="w-3 h-3" />
                {isActive ? 'Active' : 'Paused'}
            </button>
        </div>
    );
}
