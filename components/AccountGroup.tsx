import { AccountCard } from './AccountCard';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Account {
    id: string;
    platform: string;
    display_name: string;
    is_active: number; // SQLite boolean is 0 or 1
    status: 'valid' | 'expired';
}

interface AccountGroupProps {
    platform: string;
    accounts: Account[];
    onToggleAccount: (id: string, newState: boolean) => void;
    onToggleGroup: (platform: string, newState: boolean) => void;
    onLinkAccount: (platform: string) => void;
}

export function AccountGroup({ platform, accounts, onToggleAccount, onToggleGroup, onLinkAccount }: AccountGroupProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allActive = accounts.every((a: any) => a.is_active);

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-semibold capitalize text-white flex items-center gap-2">
                    <span className="text-primary">{platform}</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/50">{accounts.length}</span>
                </h2>

                <div className="flex items-center gap-3">
                    <Label htmlFor={`${platform}-toggle`} className="text-xs font-semibold uppercase tracking-wider text-white/70 cursor-pointer">
                        {allActive ? 'ACTIVE' : 'PAUSED'}
                    </Label>
                    <Switch
                        id={`${platform}-toggle`}
                        checked={allActive}
                        onCheckedChange={(checked) => onToggleGroup(platform, checked)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {accounts.map(acc => (
                    <AccountCard
                        key={acc.id}
                        id={acc.id}
                        platform={acc.platform}
                        displayName={acc.display_name}
                        isActive={!!acc.is_active}
                        status={acc.status as any}
                        onToggle={onToggleAccount}
                    />
                ))}

                {/* Add New placeholder */}
                <button
                    onClick={() => onLinkAccount(platform)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-white/10 border-dashed hover:bg-white/5 transition-colors group opacity-50 hover:opacity-100 cursor-pointer min-h-[80px]"
                >
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mb-1 group-hover:bg-white/20 transition-colors">
                        <span className="text-sm">+</span>
                    </div>
                    <span className="text-xs font-medium">Link {platform}</span>
                </button>
            </div>
        </div>
    );
}
