import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileCode, Save, Info, ExternalLink, RefreshCcw } from 'lucide-react';
import { seoAPI } from '@/services/api';
import { RobotsSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RobotsEditorPage() {
    const { projectId } = useParams();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchRobots();
    }, [projectId]);

    const fetchRobots = async () => {
        try {
            setLoading(true);
            const response = await seoAPI.getRobots(projectId!);
            if (response.data.success) {
                setContent(response.data.data.content);
            }
        } catch (error) {
            console.error('Failed to fetch robots.txt:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await seoAPI.updateRobots(projectId!, content);
            if (response.data.success) {
                toast({ title: 'Success', description: 'robots.txt updated successfully.' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update robots.txt', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <RobotsSkeleton />;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Robots.txt Editor</h1>
                    <p className="text-gray-500 mt-1">Manage crawl permissions for search engines</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" asChild>
                        <a href={`/api/v1/projects/${projectId}/seo/robots`} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Preview Raw
                        </a>
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                        {saving ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800">
                <Info className="w-4 h-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">How it works</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                    Robots.txt tells search engine crawlers which pages or files the crawler can or can't request from your site. 
                    Incorrect settings can stop your site from appearing in search results.
                </AlertDescription>
            </Alert>

            <Card className="border-2">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-gray-500" />
                        <CardTitle className="text-base font-semibold">robots.txt Direct Editor</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[400px] p-6 font-mono text-sm bg-transparent border-none focus:ring-0 resize-none dark:text-gray-300"
                        placeholder="User-agent: *
Allow: /"
                    />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Common Directives</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono">
                            User-agent: * <span className="text-gray-400 ml-2"># Applies to all bots</span>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono">
                            Disallow: /admin <span className="text-gray-400 ml-2"># Hide admin panel</span>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono">
                            Disallow: /api <span className="text-gray-400 ml-2"># Block API routes</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Technical Validation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-gray-500">
                        <li className="flex gap-2">
                            <span className="text-green-500">✓</span>
                            Standard compliance with REP
                        </li>
                        <li className="flex gap-2">
                            <span className="text-green-500">✓</span>
                            UTF-8 Encoding
                        </li>
                        <li className="flex gap-2">
                            <span className="text-green-500">✓</span>
                            Max size under 500KB
                        </li>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
