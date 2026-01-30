"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Info, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

export function ApiDocumentationModal() {
    const [apiUrl, setApiUrl] = useState('/api/cms/publish-api');
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Container state
    const [containers, setContainers] = useState<any[]>([]);
    const [defaultContainerId, setDefaultContainerId] = useState<string>('');
    const [savingContainer, setSavingContainer] = useState(false);

    // Facebook API state
    const [facebookApiUrl, setFacebookApiUrl] = useState('');
    const [facebookResetApiUrl, setFacebookResetApiUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setApiUrl(`${window.location.origin}/api/cms/publish-api`);
            setFacebookApiUrl(`${window.location.origin}/api/facebook/publish-api`);
            setFacebookResetApiUrl(`${window.location.origin}/api/facebook/reset`);
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

            // 3. Fetch Available Containers from CMS
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

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code: ', err);
        }
    };

    const cmsJsExample = `
// Example using fetch to CMS
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

    const fbCurlExample = `curl -X POST ${facebookApiUrl} \\
  -H "Content-Type: application/json" \\
  -H "X_API_Secret_Key: ${apiKey || 'YOUR_PERSONAL_API_KEY'}" \\
  -d '{
    "message": "Hello World from API!",
    "link": "https://example.com",
    "imageUrl": "https://example.com/image.jpg"
  }'`;

    const fbJsExample = `const response = await fetch('${facebookApiUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X_API_Secret_Key': '${apiKey || 'YOUR_PERSONAL_API_KEY'}'
  },
  body: JSON.stringify({
    message: 'Hello World from API!',
    link: 'https://example.com'
  })
});

const data = await response.json();
console.log(data);`;

    const resetCurlExample = `curl -X POST ${facebookResetApiUrl} \\
  -H "X_API_Secret_Key: ${apiKey || 'YOUR_PERSONAL_API_KEY'}"`;

    const resetJsExample = `const response = await fetch('${facebookResetApiUrl}', {
  method: 'POST',
  headers: {
    'X_API_Secret_Key': '${apiKey || 'YOUR_PERSONAL_API_KEY'}'
  }
});

const data = await response.json();
console.log(data);`;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="cursor-pointer gap-2 bg-background/5 text-foreground hover:bg-background/10 border-white/10">
                    <Terminal className="w-4 h-4" />
                    API Guide
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[800px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>API Documentation</SheetTitle>
                    <SheetDescription>
                        Manage your API Key and view documentation for available endpoints.
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="cms" className="w-full mt-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="cms">CMS Publish</TabsTrigger>
                        <TabsTrigger value="fb-publish">FB Publish</TabsTrigger>
                        <TabsTrigger value="fb-reset">FB Reset</TabsTrigger>
                    </TabsList>

                    {/* SHARED: API Key Section */}
                    <div className="mt-6 mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 space-y-3">
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
                                <code className="flex-1 bg-background/50 p-2 rounded border font-mono text-sm tracking-widest truncate">
                                    {apiKey}
                                </code>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9 shrink-0"
                                    onClick={() => copyToClipboard(apiKey)}
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    <span className="sr-only">Copy key</span>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">You need to generate a secret key to use the API.</p>
                        )}
                    </div>

                    {/* CMS Content */}
                    <TabsContent value="cms" className="space-y-6">
                        {/* Default Container Section */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium">Default Target Container</h3>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Info className="h-3 w-3" />
                                    Content will be published to this container if not specified.
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
                            <h3 className="text-sm font-medium">Request Body Example (JS)</h3>
                            <div className="relative bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto border border-white/10">
                                <pre className="text-xs font-mono">
                                    {cmsJsExample.trim()}
                                </pre>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-white"
                                    onClick={() => copyToClipboard(cmsJsExample)}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Facebook Publish Content */}
                    <TabsContent value="fb-publish" className="space-y-6">
                        <div className="text-sm text-muted-foreground">
                            Publish content to <strong>ALL your active Facebook Pages</strong> at once.
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Endpoint</h3>
                            <div className="flex items-center gap-2 bg-muted p-2 rounded border font-mono text-xs">
                                <span className="text-green-600 font-bold">POST</span>
                                <span className="flex-1 truncate">{facebookApiUrl}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(facebookApiUrl)}>
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="curl" className="w-full">
                            <TabsList className="h-8 w-auto">
                                <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                                <TabsTrigger value="js" className="text-xs">JavaScript</TabsTrigger>
                            </TabsList>

                            <TabsContent value="curl" className="mt-2">
                                <div className="relative">
                                    <ScrollArea className="h-[200px] w-full rounded border bg-slate-950 text-slate-50 p-4 font-mono text-xs">
                                        <pre className="whitespace-pre-wrap">{fbCurlExample}</pre>
                                    </ScrollArea>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-white"
                                        onClick={() => copyToClipboard(fbCurlExample)}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="js" className="mt-2">
                                <div className="relative">
                                    <ScrollArea className="h-[200px] w-full rounded border bg-slate-950 text-slate-50 p-4 font-mono text-xs">
                                        <pre className="whitespace-pre-wrap">{fbJsExample}</pre>
                                    </ScrollArea>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-white"
                                        onClick={() => copyToClipboard(fbJsExample)}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    {/* Facebook Reset Content */}
                    <TabsContent value="fb-reset" className="space-y-6">
                        <div className="text-sm text-muted-foreground">
                            <strong>DANGER ZONE:</strong> This API endpoint will <span className="text-red-500 font-bold">DELETE ALL</span> connected Facebook pages and tokens for your account. Use this for automated cleanup or hard resets.
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Endpoint</h3>
                            <div className="flex items-center gap-2 bg-muted p-2 rounded border font-mono text-xs">
                                <span className="text-red-500 font-bold">POST</span>
                                <span className="flex-1 truncate">{facebookResetApiUrl}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(facebookResetApiUrl)}>
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="curl" className="w-full">
                            <TabsList className="h-8 w-auto">
                                <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                                <TabsTrigger value="js" className="text-xs">JavaScript</TabsTrigger>
                            </TabsList>

                            <TabsContent value="curl" className="mt-2">
                                <div className="relative">
                                    <ScrollArea className="h-[150px] w-full rounded border bg-slate-950 text-slate-50 p-4 font-mono text-xs">
                                        <pre className="whitespace-pre-wrap">{resetCurlExample}</pre>
                                    </ScrollArea>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-white"
                                        onClick={() => copyToClipboard(resetCurlExample)}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="js" className="mt-2">
                                <div className="relative">
                                    <ScrollArea className="h-[150px] w-full rounded border bg-slate-950 text-slate-50 p-4 font-mono text-xs">
                                        <pre className="whitespace-pre-wrap">{resetJsExample}</pre>
                                    </ScrollArea>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-white"
                                        onClick={() => copyToClipboard(resetJsExample)}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
