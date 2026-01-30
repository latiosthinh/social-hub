"use client";

import { useZignal } from "@/hooks/useZignal";
import {
    optimizelyApiUrl,
    optimizelyAuthToken,
    optimizelyClientId,
    optimizelyClientSecret,
    optimizelyGraphqlEndpoint
} from "@/lib/cms/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function OptimizelyConfig() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [showRequiredNote, setShowRequiredNote] = useState(false);

    // Global store values
    const globalClientId = useZignal(optimizelyClientId);
    const globalClientSecret = useZignal(optimizelyClientSecret);
    const globalApiUrl = useZignal(optimizelyApiUrl);
    const globalGraphqlEndpoint = useZignal(optimizelyGraphqlEndpoint);
    const globalAuthToken = useZignal(optimizelyAuthToken);

    // Local state for inputs
    const [localClientId, setClientId] = useState(globalClientId);
    const [localClientSecret, setClientSecret] = useState(globalClientSecret);
    const [localApiUrl, setApiUrl] = useState(globalApiUrl);
    const [localGraphqlEndpoint, setGraphqlEndpoint] = useState(globalGraphqlEndpoint);
    const [localAuthToken, setAuthToken] = useState(globalAuthToken);

    // Sync local state when global store changes (e.g. initial load if handled elsewhere)
    useEffect(() => {
        setClientId(globalClientId);
        setClientSecret(globalClientSecret);
        setApiUrl(globalApiUrl);
        setGraphqlEndpoint(globalGraphqlEndpoint);
        setAuthToken(globalAuthToken);
    }, [globalClientId, globalClientSecret, globalApiUrl, globalGraphqlEndpoint, globalAuthToken]);

    // Load config on mount
    useEffect(() => {
        const loadConfig = async () => {
            const userId = localStorage.getItem('user_id');
            const token = localStorage.getItem('auth_token');
            if (!userId || !token) return;

            setIsLoading(true);
            try {
                const res = await fetch('/api/user/optimizely-config', {
                    headers: {
                        'x-user-id': userId,
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();

                    // Update global store
                    if (data.clientId) optimizelyClientId.set(data.clientId);
                    if (data.clientSecret) optimizelyClientSecret.set(data.clientSecret);
                    if (data.apiUrl) optimizelyApiUrl.set(data.apiUrl);
                    if (data.graphqlEndpoint) optimizelyGraphqlEndpoint.set(data.graphqlEndpoint);
                    if (data.authToken) optimizelyAuthToken.set(data.authToken);

                    // If critical config is missing, assume config is not settled
                    // We check Client ID, Secret, and Auth Token as the core requirements
                    if (!data.clientId || !data.clientSecret || !data.authToken) {
                        setIsOpen(true);
                        setShowRequiredNote(true);
                    }
                }
            } catch (error) {
                console.error('Failed to load Optimizely config:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []); // Run once on mount

    const handleSave = async () => {
        const userId = localStorage.getItem('user_id');
        const token = localStorage.getItem('auth_token');

        if (!userId || !token) {
            alert('User session invalid. Please log in again.');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/user/optimizely-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId,
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    clientId: localClientId,
                    clientSecret: localClientSecret,
                    apiUrl: localApiUrl,
                    graphqlEndpoint: localGraphqlEndpoint,
                    authToken: localAuthToken
                })
            });

            if (res.ok) {
                // Update global store on successful save
                optimizelyClientId.set(localClientId);
                optimizelyClientSecret.set(localClientSecret);
                optimizelyApiUrl.set(localApiUrl);
                optimizelyGraphqlEndpoint.set(localGraphqlEndpoint);
                optimizelyAuthToken.set(localAuthToken);

                setShowRequiredNote(false);
                alert('Configuration saved successfully!');
            } else {
                const data = await res.json();
                alert(`Failed to save: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to save config:', error);
            alert('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="border border-white/10 rounded-lg bg-white/5 overflow-hidden"
        >
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                        <Settings2 className="w-4 h-4 text-primary" />
                        Optimizely Configuration
                        {showRequiredNote && <span className="text-[10px] text-orange-400 font-normal ml-2">(Required)</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        {isLoading && <span className="text-xs text-white/40">Loading...</span>}
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
                        </Button>
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="p-4 pt-0 space-y-4">
                    {showRequiredNote && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded p-3 text-xs text-orange-200 mb-4">
                            ⚠️ <strong>Setup Required:</strong> Please configure your Optimizely credentials below to enable content integration.
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="opt-client-id" className="text-xs text-white/60">Client ID</Label>
                            <Input
                                id="opt-client-id"
                                value={localClientId}
                                onChange={(e) => setClientId(e.target.value)}
                                placeholder="Enter Client ID"
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="opt-client-secret" className="text-xs text-white/60">Client Secret</Label>
                            <Input
                                id="opt-client-secret"
                                type="password"
                                value={localClientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
                                placeholder="Enter Client Secret"
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="opt-api-url" className="text-xs text-white/60">API URL</Label>
                        <Input
                            id="opt-api-url"
                            value={localApiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            placeholder="https://api.cms.optimizely.com"
                            className="bg-black/20 border-white/10"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="opt-graphql-endpoint" className="text-xs text-white/60">GraphQL Endpoint</Label>
                            <Input
                                id="opt-graphql-endpoint"
                                value={localGraphqlEndpoint}
                                onChange={(e) => setGraphqlEndpoint(e.target.value)}
                                placeholder="https://cg.optimizely.com/content/v2"
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="opt-auth-token" className="text-xs text-white/60">Single Key (Auth Token)</Label>
                            <Input
                                id="opt-auth-token"
                                type="password"
                                value={localAuthToken}
                                onChange={(e) => setAuthToken(e.target.value)}
                                placeholder="Enter Single Key"
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
