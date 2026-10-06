import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { AlertCircle, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { analyzeSEO, SEOAnalysisResult } from '@/utils/seoUtils';
import { GooglePreview } from './GooglePreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SEOAnalyzerProps {
    content: string;
    title: string;
    slug: string;
    metaDescription?: string;
    initialKeyword?: string;
}

export function SEOAnalyzer({
    content,
    title,
    slug,
    metaDescription = '',
    initialKeyword = '',
}: SEOAnalyzerProps) {
    const [keyword, setKeyword] = useState(initialKeyword);
    const [result, setResult] = useState<SEOAnalysisResult | null>(null);

    useEffect(() => {
        const analysis = analyzeSEO(content, title, metaDescription, keyword);
        setResult(analysis);
    }, [content, title, metaDescription, keyword]);

    if (!result) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        SEO Intelligence
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Target Keyword Input */}
                    <div className="space-y-2">
                        <Label htmlFor="seo-keyword">Focus Keyword</Label>
                        <Input
                            id="seo-keyword"
                            placeholder="e.g. headless cms"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                            Enter the main keyword you want to rank for.
                        </p>
                    </div>

                    {/* Score Circle */}
                    <div className="flex items-center gap-4">
                        <div className={`relative flex items-center justify-center w-20 h-20 rounded-full border-4 ${result.score >= 80 ? 'border-green-100' : result.score >= 50 ? 'border-yellow-100' : 'border-red-100'
                            }`}>
                            <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                                {result.score}
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <h4 className="font-medium">SEO Score</h4>
                            <Progress value={result.score} className={`h-2 ${getProgressColor(result.score)}`} />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Reading Time: {result.metrics.readingTime} min</span>
                                <span>Words: {result.metrics.wordCount}</span>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="issues" className="w-full">
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="issues">Issues ({result.issues.filter(i => i.type !== 'good').length})</TabsTrigger>
                            <TabsTrigger value="preview">Google Preview</TabsTrigger>
                        </TabsList>

                        <TabsContent value="issues" className="space-y-3 mt-4">
                            {/* Issues List */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {result.issues.map((issue, idx) => (
                                    <div key={idx} className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        {issue.type === 'critical' && <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                                        {issue.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />}
                                        {issue.type === 'good' && <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />}
                                        <span className={`text-sm ${issue.type === 'critical' ? 'text-red-700 dark:text-red-400 font-medium' :
                                                issue.type === 'warning' ? 'text-yellow-700 dark:text-yellow-400' :
                                                    'text-green-700 dark:text-green-400'
                                            }`}>
                                            {issue.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="preview" className="mt-4">
                            <GooglePreview
                                title={title}
                                description={metaDescription}
                                slug={slug}
                            />
                        </TabsContent>
                    </Tabs>


                </CardContent>
            </Card>
        </div>
    );
}
