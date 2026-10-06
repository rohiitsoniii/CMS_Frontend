import { useParams } from 'react-router-dom';
import { Globe, ExternalLink, ShieldCheck, Zap, Layers, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SitemapConfigPage() {
    const { projectId } = useParams();
    const sitemapUrl = `/api/v1/projects/${projectId}/seo/sitemap`;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">XML Sitemap</h1>
                    <p className="text-gray-500 mt-1">Manage and preview your automated sitemap</p>
                </div>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <a href={sitemapUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Sitemap XML
                    </a>
                </Button>
            </div>

            <Alert className="bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <AlertTitle className="text-emerald-800 dark:text-emerald-300">Auto-Generation Active</AlertTitle>
                <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                    Your sitemap is automatically updated every time you publish or move content to trash. 
                    Search engines will crawl this file to discover all your pages.
                </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Sitemap Configuration</CardTitle>
                        <CardDescription>Advanced settings for sitemap generation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-amber-500" />
                                <div>
                                    <p className="font-medium text-sm">Automatic Refresh</p>
                                    <p className="text-xs text-gray-500">Regenerate sitemap on every content change</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="bg-white dark:bg-gray-900 border-green-200 text-green-600">Enabled</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Layers className="w-5 h-5 text-indigo-500" />
                                <div>
                                    <p className="font-medium text-sm">Include Blog Tags</p>
                                    <p className="text-xs text-gray-500">Include category and tag archive pages</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-indigo-600 text-white border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-sm opacity-80">Pages Indexed</span>
                            <span className="font-bold">24</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-sm opacity-80">Blog Posts</span>
                            <span className="font-bold">12</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm opacity-80">Last Updated</span>
                            <span className="text-xs font-mono">2 mins ago</span>
                        </div>
                        <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100 mt-4">
                           <RefreshCcw className="w-4 h-4 mr-2" />
                           Force Re-crawl
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sitemap URL</CardTitle>
                    <CardDescription>Submit this URL to Google Search Console</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 font-mono text-sm break-all">
                        <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">https://yourdomain.com/api/v1/projects/{projectId}/seo/sitemap</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
