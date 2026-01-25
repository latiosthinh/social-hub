import { useEffect, useState } from 'react';
import { getAccounts, toggleAccount, toggleGroup, addAccount } from '../api';
import { AccountGroup } from '../components/AccountGroup';

interface Account {
    id: string;
    platform: string;
    display_name: string;
    is_active: number;
    status: 'valid' | 'expired';
}

export function Dashboard() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAccounts = async () => {
        try {
            const data = await getAccounts();
            setAccounts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleToggle = async (id: string, newState: boolean) => {
        // Optimistic update
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, is_active: newState ? 1 : 0 } : a));
        await toggleAccount(id, newState);
        fetchAccounts(); // Refresh to be safe
    };

    const handleGroupToggle = async (platform: string, newState: boolean) => {
        // Optimistic
        setAccounts(prev => prev.map(a => a.platform === platform ? { ...a, is_active: newState ? 1 : 0 } : a));
        await toggleGroup(platform, newState);
        fetchAccounts();
    };

    const handleLinkAccount = async (platform: string) => {
        if (platform === 'facebook') {
            const userId = localStorage.getItem('user_id');
            if (userId) {
                window.location.href = `https://socialhub.xueer.space/oauth/facebook/authorize?userId=${userId}`;
            } else {
                alert("You must be logged in to link an account.");
            }
            return;
        }

        // Fallback for others
        const name = window.prompt(`Enter display name for your ${platform} account:`);
        if (name) {
            try {
                await addAccount(platform, name);
                fetchAccounts();
            } catch (err) {
                console.error("Failed to link", err);
                alert("Failed to link account");
            }
        }
    };

    // Grouping
    const grouped = accounts.reduce((acc, curr) => {
        if (!acc[curr.platform]) acc[curr.platform] = [];
        acc[curr.platform].push(curr);
        return acc;
    }, {} as Record<string, Account[]>);

    // Ensure order: facebook, linkedin, tiktok
    const platforms = ['facebook', 'linkedin', 'tiktok'];

    if (loading) return <div className="p-8 text-center opacity-50">Loading interface...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 pb-32">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">SocialHub</h1>
                <p className="text-white/50">Manage your digital presence across multiple networks.</p>
            </header>

            {platforms.map(p => (
                <AccountGroup
                    key={p}
                    platform={p}
                    accounts={grouped[p] || []}
                    onToggleAccount={handleToggle}
                    onToggleGroup={handleGroupToggle}
                    onLinkAccount={handleLinkAccount}
                />
            ))}

        </div>
    );
}
