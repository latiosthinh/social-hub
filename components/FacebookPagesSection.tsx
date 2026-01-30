'use client';

import { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacebookApiGuideModal } from "./FacebookApiGuideModal";
import { Checkbox } from "@/components/ui/checkbox";

interface FacebookPage {
    id: string;
    page_id: string;
    page_name: string | null;
    is_active: number;
}

interface TestResult {
    pageId: string;
    success: boolean;
    message: string;
    pageName?: string;
}

interface FetchedPage {
    id: string;
    name: string;
    access_token: string;
    tasks: string[];
}

export function FacebookPagesSection() {
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [newPageId, setNewPageId] = useState('');
    const [newPageToken, setNewPageToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
    const [testingAll, setTestingAll] = useState(false);
    const [logs, setLogs] = useState<{ time: string, msg: string, type: 'info' | 'error' | 'success' | 'warning' }[]>([]);

    // Auto mode state
    const [mode, setMode] = useState<'manual' | 'auto'>('auto');
    const [fetchedPages, setFetchedPages] = useState<FetchedPage[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
    const [isFetchingPages, setIsFetchingPages] = useState(false);

    const addLog = (msg: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
        const time = new Date().toLocaleTimeString();
        console.log(`[${type.toUpperCase()}] ${msg}`);
        setLogs(prev => [{ time, msg, type }, ...prev]);
    };

    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

    const fetchPages = async () => {
        if (!userId) return;
        try {
            const res = await fetch('/api/facebook/pages', {
                headers: { 'x-user-id': userId }
            });
            const data = await res.json();
            if (data.pages) {
                setPages(data.pages);
            }
        } catch (err) {
            console.error('Failed to fetch pages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleAddPage = async () => {
        if (!newPageId.trim() || !userId) return;

        setAdding(true);
        try {
            const res = await fetch('/api/facebook/pages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({
                    pageId: newPageId.trim(),
                    accessToken: newPageToken.trim() || undefined
                })
            });
            const data = await res.json();

            if (data.success) {
                setNewPageId('');
                setNewPageToken('');
                fetchPages();
                addLog(`Successfully added page: ${data.page?.page_name || newPageId}`, 'success');
            } else {
                addLog(data.error || 'Failed to add page', 'error');
            }
        } catch (err) {
            console.error('Failed to add page:', err);
            addLog('Failed to add page', 'error');
        } finally {
            setAdding(false);
        }
    };

    // Auto Mode Handlers
    const handleFacebookLogin = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fb = (window as any).FB;
        if (!fb) {
            addLog('Facebook SDK not loaded. Please refresh or check connection.', 'error');
            return;
        }

        fb.login((response: any) => {
            if (response.authResponse) {
                const accessToken = response.authResponse.accessToken;
                addLog('Facebook login successful. Fetching pages...', 'success');
                fetchUserPages(accessToken);
            } else {
                addLog('User cancelled login or did not fully authorize.', 'warning');
            }
        }, {
            // Request permissions needed for page management
            scope: 'pages_show_list,pages_read_engagement,pages_manage_posts',
            return_scopes: true
        });
    };

    const fetchUserPages = async (token: string) => {
        setIsFetchingPages(true);
        setFetchedPages([]);
        setSelectedPages(new Set());

        try {
            const res = await fetch('/api/facebook/pages/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: token })
            });

            const data = await res.json();

            if (data.pages) {
                setFetchedPages(data.pages);
                addLog(`Found ${data.pages.length} pages available to add.`, 'info');
            } else {
                addLog(data.error || 'Failed to list pages', 'error');
            }
        } catch (err) {
            console.error('API Error:', err);
            addLog('Error fetching pages from backend', 'error');
        } finally {
            setIsFetchingPages(false);
        }
    };

    const handleToggleSelectPage = (pageId: string) => {
        const newSelected = new Set(selectedPages);
        if (newSelected.has(pageId)) {
            newSelected.delete(pageId);
        } else {
            newSelected.add(pageId);
        }
        setSelectedPages(newSelected);
    };

    const handleAddSelectedPages = async () => {
        if (!userId || selectedPages.size === 0) return;

        setAdding(true);
        let successCount = 0;

        for (const pageId of Array.from(selectedPages)) {
            const pageData = fetchedPages.find(p => p.id === pageId);
            if (!pageData) continue;

            try {
                const res = await fetch('/api/facebook/pages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': userId
                    },
                    body: JSON.stringify({
                        pageId: pageData.id,
                        pageName: pageData.name,
                        accessToken: pageData.access_token
                    })
                });
                const data = await res.json();

                if (data.success) {
                    successCount++;
                } else {
                    addLog(`Failed to add ${pageData.name}: ${data.error}`, 'error');
                }
            } catch (err) {
                console.error(`Error adding ${pageData.name}`, err);
            }
        }

        addLog(`Added ${successCount} pages.`, 'success');
        setFetchedPages([]);
        setSelectedPages(new Set());
        setAdding(false);
        fetchPages();
    };

    const handleRemovePage = async (id: string) => {
        if (!userId || !confirm('Remove this page?')) return;

        try {
            const res = await fetch(`/api/facebook/pages?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': userId }
            });
            const data = await res.json();

            if (data.success) {
                fetchPages();
            }
        } catch (err) {
            console.error('Failed to remove page:', err);
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            await fetch('/api/facebook/pages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive })
            });
            fetchPages();
        } catch (err) {
            console.error('Failed to toggle page:', err);
        }
    };

    const testPage = async (pageId: string) => {
        setTestResults(prev => ({
            ...prev,
            [pageId]: { pageId, success: false, message: 'Testing...' }
        }));

        try {
            const res = await fetch(`/api/facebook/post?pageId=${pageId}`);
            const data = await res.json();

            // Log verified scopes
            if (data.scopes) {
                addLog(`Token Perms: ${data.scopes.join(', ')}`, 'info');

                // Check for required permissions
                const required = ['pages_manage_posts', 'pages_read_engagement'];
                const missing = required.filter(r => !data.scopes.includes(r));
                if (missing.length > 0) {
                    addLog(`MISSING REQUIRED PERMS: ${missing.join(', ')}`, 'warning');
                }
            }

            setTestResults(prev => ({
                ...prev,
                [pageId]: {
                    pageId,
                    success: data.success,
                    message: data.success
                        ? `✓ Connected: ${data.pageName}`
                        : `✗ ${data.error}`,
                    pageName: data.pageName
                }
            }));

            if (data.success) {
                addLog(`✓ Verified access to page "${data.pageName}"`, 'success');
            } else {
                addLog(`✗ Verification failed: ${data.error}`, 'error');
            }
        } catch (err) {
            setTestResults(prev => ({
                ...prev,
                [pageId]: { pageId, success: false, message: '✗ Connection failed' }
            }));
            addLog(`✗ Connection check failed for ${pageId}`, 'error');
        }
    };

    const testAllPages = async () => {
        setTestingAll(true);
        const activePages = pages.filter(p => p.is_active);

        for (const page of activePages) {
            await testPage(page.page_id);
        }

        setTestingAll(false);
    };

    const sendTestPost = async (pageId: string) => {
        const confirmed = confirm(`Send a test post to page ${pageId}?\n\nThis will create a real post on your Facebook page.`);
        if (!confirmed) return;

        try {
            const res = await fetch('/api/facebook/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageId,
                    message: `🧪 Test post from SocialHub - ${new Date().toLocaleString()}`
                })
            });
            const data = await res.json();

            if (data.success) {
                addLog(`✓ Post created successfully! Post ID: ${data.postId}`, 'success');
            } else {
                addLog(`✗ Failed to post: ${data.error}`, 'error');
            }
        } catch (err) {
            addLog('✗ Failed to send test post', 'error');
        }
    };

    const handleResetToken = async () => {
        if (!confirm('Are you sure you want to reset your Facebook connection? This will remove all added pages.')) {
            return;
        }

        try {
            const res = await fetch('/api/facebook/reset', {
                method: 'POST',
                headers: {
                    'x-user-id': userId as string
                }
            });
            const data = await res.json();

            if (data.success) {
                setPages([]);
                setFetchedPages([]);
                setSelectedPages(new Set());
                addLog('Facebook access tokens reset successfully.', 'success');
            } else {
                addLog('Failed to reset tokens: ' + data.error, 'error');
            }
        } catch (err) {
            console.error('Failed to reset tokens:', err);
            addLog('Failed to reset tokens', 'error');
        }
    };

    const hasPages = pages.length > 0;

    if (loading) {
        return <div className="p-4 opacity-50">Loading Facebook pages...</div>;
    }

    const allActive = pages.length > 0 && pages.every(p => p.is_active);

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-primary">Facebook Pages</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/50">
                        {pages.length}
                    </span>
                </h2>

                <div className="flex items-center gap-3">
                    {pages.length > 0 && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={testAllPages}
                                disabled={testingAll}
                                className="text-xs"
                            >
                                {testingAll ? 'Testing...' : '🔗 Test All'}
                            </Button>
                            <FacebookApiGuideModal />
                            <Label htmlFor="fb-pages-toggle" className="text-xs font-semibold uppercase tracking-wider text-white/70 cursor-pointer">
                                {allActive ? 'ACTIVE' : 'PAUSED'}
                            </Label>
                            <Switch
                                id="fb-pages-toggle"
                                checked={allActive}
                                onCheckedChange={(checked) => {
                                    pages.forEach(p => handleToggle(p.id, checked));
                                }}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Add New Page Form */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white/70">Add Facebook Page</h3>
                    <Tabs value={mode} onValueChange={(v) => setMode(v as 'auto' | 'manual')} className="w-[150px]">
                        <TabsList className="grid w-full grid-cols-2 p-0">
                            <TabsTrigger value="auto" className="text-xs">Auto</TabsTrigger>
                            <TabsTrigger value="manual" className="text-xs">Manual</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {mode === 'manual' ? (
                    <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1">
                            <Label htmlFor="page-id" className="text-xs text-white/50 mb-1 block">Page ID *</Label>
                            <Input
                                id="page-id"
                                placeholder="e.g. 123456789012345"
                                value={newPageId}
                                onChange={(e) => setNewPageId(e.target.value)}
                                className="bg-white/5 border-white/20"
                            />
                        </div>
                        <div className="flex-[2]">
                            <div className="flex justify-between items-center mb-1">
                                <Label htmlFor="page-token" className="text-xs text-white/50 block">Page Access Token (Recommended)</Label>
                                <a
                                    href="https://developers.facebook.com/tools/explorer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                >
                                    Get Token ↗
                                </a>
                            </div>
                            <Input
                                id="page-token"
                                type="password"
                                placeholder="Page Access Token (for direct API access)"
                                value={newPageToken}
                                onChange={(e) => setNewPageToken(e.target.value)}
                                className="bg-white/5 border-white/20"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={handleAddPage}
                                disabled={adding || !newPageId.trim()}
                                className="w-full sm:w-auto"
                            >
                                {adding ? 'Adding...' : '+ Add'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-4">
                            {hasPages ? (
                                <Button
                                    onClick={handleResetToken}
                                    variant="destructive"
                                    disabled={isFetchingPages}
                                >
                                    Reset access token
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleFacebookLogin}
                                    className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white cursor-pointer"
                                    disabled={isFetchingPages}
                                >
                                    {isFetchingPages ? 'Loading Pages...' : 'Login to Facebook'}
                                </Button>
                            )}
                            <p className="text-xs text-white/40">
                                {hasPages
                                    ? 'Resetting will disconnect all pages and remove stored tokens.'
                                    : 'Log in to grant permission to list your pages.'}
                            </p>
                        </div>

                        {fetchedPages.length > 0 && (
                            <div className="bg-black/20 rounded border border-white/10 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-white/50">Found {fetchedPages.length} pages</span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setSelectedPages(new Set(fetchedPages.map(p => p.id)))}
                                            className="h-7 text-xs"
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleAddSelectedPages}
                                            disabled={adding || selectedPages.size === 0}
                                            className="h-7 text-xs"
                                        >
                                            {adding ? 'Adding...' : `Add Selected (${selectedPages.size})`}
                                        </Button>
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                    {fetchedPages.map(page => {
                                        const alreadyAdded = pages.some(p => p.page_id === page.id);
                                        return (
                                            <div
                                                key={page.id}
                                                className={`flex items-center justify-between p-2 rounded border ${selectedPages.has(page.id)
                                                    ? 'bg-primary/10 border-primary/30'
                                                    : 'bg-white/5 border-white/10'
                                                    } ${alreadyAdded ? 'opacity-50' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={selectedPages.has(page.id)}
                                                        onCheckedChange={() => handleToggleSelectPage(page.id)}
                                                        disabled={alreadyAdded}
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{page.name}</div>
                                                        <div className="text-[10px] text-white/40">{page.id}</div>
                                                    </div>
                                                </div>
                                                {alreadyAdded && <span className="text-[10px] text-green-400">Already Added</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'manual' && (
                    <p className="text-xs text-white/40 mt-2">
                        💡 Find your Page ID in Facebook Page Settings → About → Page ID
                    </p>
                )}
            </div>

            {/* Pages List */}
            {pages.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                    <p>No Facebook pages added yet.</p>
                    <p className="text-sm mt-1">Add a page ID above to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pages.map(page => (
                        <div
                            key={page.id}
                            className={`relative p-4 rounded-lg border transition-all ${page.is_active
                                ? 'bg-white/5 border-white/20'
                                : 'bg-white/[0.02] border-white/10 opacity-60'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white truncate">
                                        {page.page_name || 'Unnamed Page'}
                                    </div>
                                    <div className="text-xs text-white/50 font-mono mt-0.5">
                                        ID: {page.page_id}
                                    </div>

                                    {/* Test Result */}
                                    {testResults[page.page_id] && (
                                        <div className={`text-xs mt-2 ${testResults[page.page_id].success
                                            ? 'text-green-400'
                                            : 'text-orange-400'
                                            }`}>
                                            {testResults[page.page_id].message}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={!!page.is_active}
                                        onCheckedChange={(checked) => handleToggle(page.id, checked)}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => testPage(page.page_id)}
                                >
                                    🔗 Test Connection
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs"
                                    onClick={() => sendTestPost(page.page_id)}
                                    disabled={!page.is_active}
                                >
                                    📝 Test Post
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                    onClick={() => handleRemovePage(page.id)}
                                >
                                    ✕
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Activity Log */}
            {logs.length > 0 && (
                <div className="mt-8 bg-black/40 rounded-lg border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Console Log</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLogs([])}
                            className="h-6 text-xs text-white/30 hover:text-white"
                        >
                            Clear
                        </Button>
                    </div>
                    <div className="h-40 overflow-y-auto font-mono text-xs space-y-1 p-2 bg-black/20 rounded border border-white/5">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3">
                                <span className="text-white/30 shrink-0 select-none">[{log.time}]</span>
                                <span className={`${log.type === 'error' ? 'text-red-400' :
                                    log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warning' ? 'text-orange-400' : 'text-blue-300'
                                    } break-all`}>
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
