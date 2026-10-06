import { useState } from 'react';
import { Sparkles, Code, Copy, Check, FileText, ShoppingCart, MessageSquare, ListTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type SchemaType = 'article' | 'product' | 'faq' | 'breadcrumb';

export default function SchemaBuilderPage() {
    const [type, setType] = useState<SchemaType>('article');
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    // Article State
    const [articleData, setArticleData] = useState({
        headline: '',
        author: '',
        publisher: '',
        description: ''
    });

    const generateJsonLd = () => {
        let schema: any = {
            "@context": "https://schema.org",
        };

        if (type === 'article') {
            schema = {
                ...schema,
                "@type": "BlogPosting",
                "headline": articleData.headline,
                "author": { "@type": "Person", "name": articleData.author },
                "publisher": { "@type": "Organization", "name": articleData.publisher },
                "description": articleData.description
            };
        } else if (type === 'faq') {
            schema = {
                ...schema,
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Sample Question?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Sample Answer." }
                    }
                ]
            };
        }

        return JSON.stringify(schema, null, 2);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`<script type="application/ld+json">\n${generateJsonLd()}\n</script>`);
        setCopied(true);
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Schema.org Builder</h1>
                    <p className="text-gray-500 mt-1">Generate structured data to earn rich snippets in search</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Select Schema Type</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setType('article')}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                    type === 'article' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-100 dark:border-gray-800'
                                }`}
                            >
                                <FileText className="w-5 h-5 text-indigo-500" />
                                <span className="text-sm font-medium">Article</span>
                            </button>
                            <button
                                onClick={() => setType('faq')}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                    type === 'faq' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-100 dark:border-gray-800'
                                }`}
                            >
                                <MessageSquare className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-medium">FAQ</span>
                            </button>
                            <button
                                onClick={() => setType('product')}
                                className="flex items-center gap-3 p-4 rounded-xl border-2 opacity-50 cursor-not-allowed border-gray-100 dark:border-gray-800"
                            >
                                <ShoppingCart className="w-5 h-5 text-amber-500" />
                                <span className="text-sm font-medium">Product (Soon)</span>
                            </button>
                            <button
                                onClick={() => setType('breadcrumb')}
                                className="flex items-center gap-3 p-4 rounded-xl border-2 opacity-50 cursor-not-allowed border-gray-100 dark:border-gray-800"
                            >
                                <ListTree className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-medium">Breadcrumb (Soon)</span>
                            </button>
                        </CardContent>
                    </Card>

                    {type === 'article' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Article Properties</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Headline</Label>
                                    <Input 
                                        placeholder="Main title of the article" 
                                        value={articleData.headline}
                                        onChange={(e) => setArticleData({...articleData, headline: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Author Name</Label>
                                        <Input 
                                            placeholder="Author" 
                                            value={articleData.author}
                                            onChange={(e) => setArticleData({...articleData, author: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Publisher</Label>
                                        <Input 
                                            placeholder="Pub Name" 
                                            value={articleData.publisher}
                                            onChange={(e) => setArticleData({...articleData, publisher: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input 
                                        placeholder="Short summary" 
                                        value={articleData.description}
                                        onChange={(e) => setArticleData({...articleData, description: e.target.value})}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Preview Panel */}
                <div className="space-y-6">
                    <Card className="bg-gray-900 border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary" onClick={handleCopy} className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                Copy Code
                            </Button>
                        </div>
                        <CardHeader className="border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <div className="ml-4 px-3 py-1 bg-white/5 rounded-md flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                                    <Code className="w-3 h-3" />
                                    json-ld
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <pre className="text-indigo-300 font-mono text-sm leading-relaxed overflow-x-auto">
                                <code>
                                    {`<script type="application/ld+json">\n`}
                                    {generateJsonLd()}
                                    {`\n</script>`}
                                </code>
                            </pre>
                        </CardContent>
                    </Card>

                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
                        <h4 className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 mb-3">
                            <Sparkles className="w-4 h-4" />
                            Why use Schema?
                        </h4>
                        <p className="text-sm text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
                            Structured data helps search engines understand your content better and can enable "Rich Snippets" like star ratings, review counts, and FAQ dropdowns directly in search results.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
