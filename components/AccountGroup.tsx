import { AccountCard } from './AccountCard';

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
                    <span className="opacity-70">{platform}</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/50">{accounts.length}</span>
                </h2>

                <label className="flex items-center cursor-pointer">
                    <input
                        id={`${platform}-toggle`}
                        type="checkbox"
                        checked={allActive}
                        onChange={() => onToggleGroup(platform, !allActive)}
                        className="sr-only peer"
                    />
                    <span className="mr-3 text-xs font-semibold uppercase tracking-wider text-white/70">{allActive ? 'ACTIVE' : 'PAUSED'}</span>
                    <div className="relative">
                        <div className="w-11 h-6 bg-white/10 rounded-full border border-white/10 shadow-inner transition-colors duration-200 ease-in-out hover:bg-white/20 peer-checked:bg-blue-600 peer-checked:border-blue-500"></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${allActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                </label>
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
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 border-dashed hover:bg-white/5 transition-colors group opacity-50 hover:opacity-100 min-h-[140px]"
                >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-2 group-hover:bg-white/20 transition-colors">
                        <span className="text-xl">+</span>
                    </div>
                    <span className="text-xs font-medium">Link {platform}</span>
                </button>
            </div>
        </div>
    );
}
