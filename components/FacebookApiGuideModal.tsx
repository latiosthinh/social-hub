import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Terminal } from "lucide-react";
import { useState } from "react";

export function FacebookApiGuideModal() {
    const [open, setOpen] = useState(false);

    // Get origin safely for client-side
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
    const apiUrl = `${origin}/api/facebook/publish-api`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    const curlExample = `curl -X POST ${apiUrl} \\
  -H "Content-Type: application/json" \\
  -H "X_API_Secret_Key: YOUR_PERSONAL_API_KEY" \\
  -d '{
    "message": "Hello World from API!",
    "link": "https://example.com",
    "imageUrl": "https://example.com/image.jpg"
  }'`;

    const jsExample = `const response = await fetch('${apiUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X_API_Secret_Key': 'YOUR_PERSONAL_API_KEY'
  },
  body: JSON.stringify({
    message: 'Hello World from API!',
    link: 'https://example.com'
  })
});

const data = await response.json();
console.log(data);`;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-2">
                    <Terminal className="w-3 h-3" />
                    API Guide
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-900 text-slate-100 border-slate-700">
                <DialogHeader>
                    <DialogTitle>Facebook Publishing API</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Use this API to publish content to <strong>ALL your active Facebook Pages</strong> at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-200">Endpoint</h3>
                        <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/10 font-mono text-xs">
                            <span className="text-green-400">POST</span>
                            <span className="flex-1 truncate">{apiUrl}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(apiUrl)}>
                                <Copy className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-200">Headers</h3>
                        <div className="bg-black/40 p-3 rounded border border-white/10 font-mono text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-blue-300">Content-Type</span>
                                <span className="text-slate-400">application/json</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-300">X_API_Secret_Key</span>
                                <span className="text-slate-400">YOUR_PERSONAL_API_KEY</span>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="curl" className="w-full">
                        <TabsList className="bg-white/5 border border-white/10">
                            <TabsTrigger value="curl">cURL</TabsTrigger>
                            <TabsTrigger value="js">JavaScript</TabsTrigger>
                        </TabsList>

                        <TabsContent value="curl" className="mt-2">
                            <div className="relative">
                                <ScrollArea className="h-[200px] w-full rounded border border-white/10 bg-black/40 p-4 font-mono text-xs">
                                    <pre className="text-slate-300 whitespace-pre-wrap">{curlExample}</pre>
                                </ScrollArea>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 bg-white/5 hover:bg-white/10"
                                    onClick={() => copyToClipboard(curlExample)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="js" className="mt-2">
                            <div className="relative">
                                <ScrollArea className="h-[200px] w-full rounded border border-white/10 bg-black/40 p-4 font-mono text-xs">
                                    <pre className="text-slate-300 whitespace-pre-wrap">{jsExample}</pre>
                                </ScrollArea>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 bg-white/5 hover:bg-white/10"
                                    onClick={() => copyToClipboard(jsExample)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
