import { useState } from 'react';
import { Copy, Check, Code, Terminal, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Card } from '@/components/ui/card';

interface CodeSnippetViewerProps {
    projectId: string;
    contentId?: string;
    contentType: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CodeSnippetViewer({
    projectId,
    contentId,
    contentType,
    isOpen,
    onOpenChange,
}: CodeSnippetViewerProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('react');

    const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`;
    const endpoint = contentId
        ? `/projects/${projectId}/content/${contentId}`
        : `/projects/${projectId}/content?type=${contentType}`;

    const getCodeSnippet = (lang: string) => {
        switch (lang) {
            case 'react':
                return `// 1. Install axios: npm install axios
import { useState, useEffect } from 'react';
import axios from 'axios';

export function ContentComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          '${apiUrl}${endpoint}',
          {
             headers: { 
               'Authorization': 'Bearer YOUR_API_KEY' // Get key from Settings > API Keys
             }
          }
        );
        setData(response.data.data);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No content found</div>;

  return (
    <div className="content">
      {/* Dynamic Content Rendering */}
      <h1>{data.name}</h1>
      <div dangerouslySetInnerHTML={{ __html: data.data.body }} />
    </div>
  );
}`;

            case 'nextjs':
                return `// Next.js (App Router) - app/page.tsx

async function getContent() {
  const res = await fetch(
    '${apiUrl}${endpoint}',
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
      },
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    }
  );

  if (!res.ok) throw new Error('Failed to fetch content');
  
  return res.json();
}

export default async function Page() {
  const { data } = await getContent();

  return (
    <main>
      <h1>{data.name}</h1>
      {/* Render your dynamic content here */}
      <pre>{JSON.stringify(data.data, null, 2)}</pre>
    </main>
  );
}`;

            case 'javascript':
                return `<!-- index.html -->
<div id="content-container">Checking for updates...</div>

<script>
  async function loadContent() {
    const container = document.getElementById('content-container');
    
    try {
      const response = await fetch(
        '${apiUrl}${endpoint}', 
        {
          headers: {
            'Authorization': 'Bearer YOUR_API_KEY'
          }
        }
      );
      
      const json = await response.json();
      const content = json.data;
      
      // Update DOM to make it dynamic!
      container.innerHTML = \`
        <h1>\${content.name}</h1>
        <div>\${content.data.body || JSON.stringify(content.data)}</div>
      \`;
      
    } catch (error) {
      container.innerHTML = 'Error loading content';
      console.error(error);
    }
  }

  loadContent();
</script>`;

            case 'curl':
                return `curl -X GET "${apiUrl}${endpoint}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

            default:
                return '';
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getCodeSnippet(activeTab));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Code className="w-5 h-5 text-blue-500" />
                        Integrate Content
                    </DialogTitle>
                    <DialogDescription>
                        Copy these code snippets to make your website dynamic. The content will update instantly when you publish changes here!
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <TabsList>
                                <TabsTrigger value="react" className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    React
                                </TabsTrigger>
                                <TabsTrigger value="nextjs" className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                                    Next.js
                                </TabsTrigger>
                                <TabsTrigger value="javascript" className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                    HTML/JS
                                </TabsTrigger>
                                <TabsTrigger value="curl" className="flex items-center gap-2">
                                    <Terminal className="w-3 h-3" />
                                    cURL
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <Card className="flex-1 relative bg-slate-950 text-slate-50 border-slate-800 overflow-hidden group">
                            <div className="absolute right-4 top-4 z-10">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 shadow-none bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700"
                                    onClick={handleCopy}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3 h-3 mr-2 text-green-400" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3 mr-2" />
                                            Copy Code
                                        </>
                                    )}
                                </Button>
                            </div>
                            <ScrollArea className="h-[400px] w-full p-6 font-mono text-sm">
                                <pre>{getCodeSnippet(activeTab)}</pre>
                            </ScrollArea>
                        </Card>
                    </Tabs>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3 border border-blue-100 dark:border-blue-800">
                        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                                Make it Dynamic!
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Using this code, your website will fetch the latest content from this CMS every time a user visits. No need to redeploy your site when you fix a typo!
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
