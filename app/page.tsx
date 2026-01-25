'use client';

import { useEffect, useState } from 'react';
import { getAccounts, toggleAccount, toggleGroup, addAccount } from '@/lib/api';
import { AccountGroup } from '@/components/AccountGroup';

interface Account {
  id: string;
  platform: string;
  display_name: string;
  is_active: number;
  status: 'valid' | 'expired';
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      if (Array.isArray(data)) {
        setAccounts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Simple auth check
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchAccounts();

    // Load Facebook SDK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbAsyncInit = function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1409076067613009',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (js as any).src = "https://connect.facebook.net/en_US/sdk.js";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fjs as any).parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).FB) {
          alert("Facebook SDK loading... please wait.");
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).FB.login((response: any) => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken;

            // Send to backend
            fetch('/api/oauth/facebook/connect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessToken, userId })
            })
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  // alert("Connected: " + data.profile.name);
                  fetchAccounts();
                } else {
                  alert("Failed: " + data.error);
                }
              })
              .catch(err => console.error(err));
          }
        }, { scope: 'public_profile,email', auth_type: 'reauthenticate' });
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

  if (loading) return <div className="p-8 text-center opacity-50 min-h-screen">Loading interface...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 pb-32 min-h-screen">
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
