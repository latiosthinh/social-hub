"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Code, Copy, Check, Info } from "lucide-react";
import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ApiDocumentationModal() {
    const [apiUrl, setApiUrl] = useState('/api/cms/publish-api');
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Container state
    const [containers, setContainers] = useState<any[]>([]);
    const [defaultContainerId, setDefaultContainerId] = useState<string>('');
    const [savingContainer, setSavingContainer] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setApiUrl(`${window.location.origin}/api/cms/publish-api`);
            fetchInitialData();
        }
    }, []);

    const fetchInitialData = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            // 1. Fetch API Key
            const keyRes = await fetch('/api/auth/apikey', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const keyData = await keyRes.json();
            if (keyData.apiKey) setApiKey(keyData.apiKey);

            // 2. Fetch User Default Container
            const userContainerRes = await fetch('/api/user/container', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userContainerData = await userContainerRes.json();
            if (userContainerData.defaultContainerId) setDefaultContainerId(userContainerData.defaultContainerId);

            // 3. Fetch Available Containers from CMS using GraphQL (consistent with app usage)
            // Use the same query as useCmsContainerOptions.ts
            const GRAQPHQL_QUERY = `
              query AllRoutesQuery {
                BlankExperience {
                  items {
                    _itemMetadata {
                      key
                      displayName
                    }
                  }
                  total(all: true)
                }
              }
            `;

            const containersRes = await fetch('/api/cms/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // The internal graphql API doesn't need auth header from client if using env vars
                    // but we might pass it for consistency if needed, though route.ts ignores it.
                },
                body: JSON.stringify({
                    query: GRAQPHQL_QUERY
                })
            });
            const containersData = await containersRes.json();

            const items = containersData.data?.BlankExperience?.items?.map((item: any) => ({
                id: item._itemMetadata.key,
                name: item._itemMetadata.displayName || item._itemMetadata.key,
            })) || [];

            if (items.length > 0) {
                setContainers(items);
            }

        } catch (e) {
            console.error("Failed to fetch initial data", e);
        }
    };

    const handleContainerChange = async (value: string) => {
        setDefaultContainerId(value);
        setSavingContainer(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            await fetch('/api/user/container', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ defaultContainerId: value })
            });
        } catch (e) {
            console.error("Failed to save default container", e);
        } finally {
            setSavingContainer(false);
        }
    };

    const generateApiKey = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            if (!token) {
                alert("You must be logged in");
                return;
            }

            const res = await fetch('/api/auth/apikey', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.apiKey) {
                setApiKey(data.apiKey);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate key");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!apiKey) return;
        try {
            await navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code: ', err);
        }
    };

    const jsExample = `
// Example using fetch
const response = await fetch('${apiUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X_API_Secret_Key': '${apiKey || 'YOUR_SECRET_KEY'}'
  },
  body: JSON.stringify({
    content: {
      title: 'My Article Title',
      body: '<h1>Hello World</h1><p>Content goes here...</p>'
    }
  })
});

const result = await response.json();
console.log(result);
`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer gap-2 bg-background/5 text-foreground hover:bg-background/10 border-white/10">
                    <Code className="h-4 w-4" />
                    API & Key
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Public Content API</DialogTitle>
                    <DialogDescription>
                        Configuration and documentation for pushing content to SocialHub.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* API Key Section */}
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-yellow-500">Your API Secret Key</h3>
                            <Button
                                size="sm"
                                onClick={generateApiKey}
                                disabled={loading}
                                variant="secondary"
                                className="h-7 text-xs"
                            >
                                {loading ? 'Generating...' : (apiKey ? 'Regenerate Key' : 'Generate Key')}
                            </Button>
                        </div>
                        {apiKey ? (
                            <div className="group relative flex items-center gap-2">
                                <code className="flex-1 bg-background/50 p-2 rounded border font-mono text-sm tracking-widest">
                                    {apiKey}
                                </code>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9 shrink-0"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    <span className="sr-only">Copy key</span>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">You need to generate a secret key to use the API.</p>
                        )}
                    </div>

                    {/* Default Container Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">Default Target Container</h3>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Content will be published to this container if not specified in the request.
                            </div>
                        </div>
                        <Select value={defaultContainerId} onValueChange={handleContainerChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a default container..." />
                            </SelectTrigger>
                            <SelectContent>
                                {containers.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name || 'Untitled Container'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {savingContainer && <span className="text-xs text-muted-foreground animate-pulse">Saving default container...</span>}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Endpoint</h3>
                        <div className="bg-muted p-2 rounded-md font-mono text-xs break-all border">
                            POST {apiUrl}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Headers</h3>
                        <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                            <li><code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono text-xs">Content-Type: application/json</code></li>
                            <li><code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono text-xs">X-API-Secret-Key: [Your Secret Key]</code></li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Request Body Example</h3>
                        <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto border border-white/10">
                            <pre className="text-xs font-mono">
                                {jsExample.trim()}
                            </pre>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
