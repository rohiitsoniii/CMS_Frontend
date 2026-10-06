import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
    FileText,
    BookOpen,
    MessageSquare,
    Eye,
    Plus,
    ArrowRight,
    Sparkles,
    Type,
    FootprintsIcon,
    Settings,
    Globe,
    Copy,
    Check,
    Terminal,
    Code2,
    Play,
    Loader2,
    CheckCircle2,
    Boxes,
    Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { ProjectOverviewSkeleton } from '@/components/skeletons';

interface ProjectContext {
    project: {
        _id: string;
        name: string;
        slug: string;
        domain?: string;
        status: string;
        chatbot?: {
            enabled: boolean;
        };
        branding?: {
            colors?: {
                primary: string;
            };
        };
    };
    stats: {
        totalContent: number;
        totalPublished: number;
        knowledgeBase: number;
        content: Record<string, { total: number; published: number; draft: number }>;
    };
    isLoading: boolean;
}

export default function ProjectOverview() {
    const { project, stats, isLoading } = useOutletContext<ProjectContext>();
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [activeLang, setActiveLang] = useState<'curl' | 'js'>('curl');
    const [testResponse, setTestResponse] = useState<any>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [testStatusCode, setTestStatusCode] = useState<number | null>(null);

    if (isLoading || !project) {
        return <ProjectOverviewSkeleton />;
    }

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const runLiveTest = async (endpoint: string) => {
        setIsTesting(true);
        setTestResponse(null);
        setTestStatusCode(null);
        try {
            const res = await api.get(endpoint);
            setTestStatusCode(res.status);
            setTestResponse(res.data);
            toast.success(`Success (${res.status} OK)`);
        } catch (err: any) {
            const status = err.response?.status || 500;
            setTestStatusCode(status);
            setTestResponse(err.response?.data || { error: err.message });
            toast.error(`Request finished with HTTP ${status}`);
        } finally {
            setIsTesting(false);
        }
    };

    const quickActions = [
        { label: 'Add Header', href: `/dashboard/project/${project._id}/content/header/new`, icon: Type },
        { label: 'Add Footer', href: `/dashboard/project/${project._id}/content/footer/new`, icon: FootprintsIcon },
        { label: 'Add Hero', href: `/dashboard/project/${project._id}/content/hero/new`, icon: Sparkles },
        { label: 'Add Blog', href: `/dashboard/project/${project._id}/content/blog/new`, icon: BookOpen },
    ];

    const contentSections = [
        { type: 'header', label: 'Headers', icon: Type },
        { type: 'footer', label: 'Footers', icon: FootprintsIcon },
        { type: 'hero', label: 'Hero Sections', icon: Sparkles },
        { type: 'blog', label: 'Blog Posts', icon: BookOpen },
        { type: 'page', label: 'Pages', icon: FileText },
        { type: 'faq', label: 'FAQs', icon: MessageSquare },
    ];

    const endpoints = [
        { label: 'All Content', path: `/deliver/${project.slug}/all`, desc: 'Retrieve all published content' },
        { label: 'Active Header', path: `/deliver/${project.slug}/header`, desc: 'Fetch main navigation structure' },
        { label: 'Published Blogs', path: `/deliver/${project.slug}/blogs`, desc: 'Retrieve list of blog posts' },
    ];

    const curlSnippet = `curl -X GET "http://localhost:5000/api/v1/deliver/${project.slug}/all" \\
  -H "Accept: application/json"`;

    const jsSnippet = `const res = await fetch("http://localhost:5000/api/v1/deliver/${project.slug}/all");
const data = await res.json();
console.log(data);`;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                            style={{ backgroundColor: project.branding?.colors?.primary || '#6366f1' }}
                        >
                            {project.name.charAt(0)}
                        </div>
                        {project.name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage content, test delivery APIs, and oversee live integrations
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {project.domain && (
                        <Button variant="outline" asChild>
                            <a href={`https://${project.domain}`} target="_blank" rel="noopener noreferrer">
                                <Globe className="w-4 h-4 mr-2" />
                                Visit Site
                            </a>
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link to={`/dashboard/project/${project._id}/content-types`}>
                            <Boxes className="w-4 h-4 mr-2 text-indigo-500" />
                            Content Models
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to={`/dashboard/project/${project._id}/settings`}>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover-lift border-gray-200/80 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <Badge variant="success">
                                {stats?.totalPublished || 0} live
                            </Badge>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats?.totalContent || 0}
                        </p>
                        <p className="text-sm text-gray-500">Total Content Items</p>
                    </CardContent>
                </Card>

                <Card className="hover-lift border-gray-200/80 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats?.content?.blog?.total || 0}
                        </p>
                        <p className="text-sm text-gray-500">Blog Posts</p>
                    </CardContent>
                </Card>

                <Card className="hover-lift border-gray-200/80 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            {project.chatbot?.enabled && (
                                <Badge variant="success">Active</Badge>
                            )}
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats?.knowledgeBase || 0}
                        </p>
                        <p className="text-sm text-gray-500">Knowledge Base Items</p>
                    </CardContent>
                </Card>

                <Card className="hover-lift border-gray-200/80 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-sm">
                                <Eye className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {project.status === 'active' ? '🟢' : '🟡'}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">{project.status} Environment</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-gray-200/80 dark:border-gray-800">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Instant creation for core content models</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.label}
                                    to={action.href}
                                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center group-hover:from-indigo-500 group-hover:to-purple-500 transition-all">
                                        <Icon className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {action.label}
                                    </span>
                                    <Plus className="w-4 h-4 ml-auto text-gray-400 group-hover:text-indigo-500" />
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Content Sections */}
            <Card className="border-gray-200/80 dark:border-gray-800">
                <CardHeader>
                    <CardTitle>Content Collections</CardTitle>
                    <CardDescription>Manage your structured content library</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {contentSections.map((section) => {
                            const Icon = section.icon;
                            const sectionStats = stats?.content?.[section.type];
                            return (
                                <Link
                                    key={section.type}
                                    to={`/dashboard/project/${project._id}/content/${section.type}`}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:shadow-md transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                        <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {section.label}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {sectionStats?.total || 0} items
                                            {sectionStats?.published ? ` • ${sectionStats.published} published` : ''}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Developer Playground & API Endpoints */}
            <Card className="border-gray-200/80 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-indigo-500" />
                            Delivery API & Live Playground
                        </CardTitle>
                        <CardDescription>
                            Public read-only content delivery endpoints for your frontend or mobile app
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={activeLang === 'curl' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveLang('curl')}
                            className="h-8 text-xs"
                        >
                            <Terminal className="w-3.5 h-3.5 mr-1" />
                            cURL
                        </Button>
                        <Button
                            variant={activeLang === 'js' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveLang('js')}
                            className="h-8 text-xs"
                        >
                            <Code2 className="w-3.5 h-3.5 mr-1" />
                            JavaScript
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Endpoints List */}
                    <div className="space-y-3 font-mono text-sm">
                        {endpoints.map((ep, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                                        GET
                                    </Badge>
                                    <span className="text-gray-800 dark:text-gray-200 truncate font-semibold">
                                        /api/v1{ep.path}
                                    </span>
                                    <span className="hidden md:inline text-xs text-gray-400 font-sans ml-2">
                                        — {ep.desc}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => runLiveTest(ep.path)}
                                        disabled={isTesting}
                                        className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                                    >
                                        {isTesting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                                        Test
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(`http://localhost:5000/api/v1${ep.path}`, `ep-${idx}`)}
                                        className="h-8 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400"
                                        title="Copy Endpoint URL"
                                    >
                                        {copiedKey === `ep-${idx}` ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Code Snippet Box */}
                    <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-[#0d1117] text-gray-200">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#161b22] text-xs font-sans text-gray-400">
                            <span>{activeLang === 'curl' ? 'Terminal Command' : 'Node.js / Browser Fetch'}</span>
                            <button
                                onClick={() => copyToClipboard(activeLang === 'curl' ? curlSnippet : jsSnippet, 'code')}
                                className="flex items-center gap-1 hover:text-white transition-colors"
                            >
                                {copiedKey === 'code' ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy Code</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-indigo-300">
                            <code>{activeLang === 'curl' ? curlSnippet : jsSnippet}</code>
                        </pre>
                    </div>

                    {/* Live Test Response Preview */}
                    {testResponse && (
                        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Live API Response:</span>
                                    <Badge
                                        variant="outline"
                                        className={testStatusCode === 200 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}
                                    >
                                        HTTP {testStatusCode}
                                    </Badge>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(JSON.stringify(testResponse, null, 2), 'response')}
                                    className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy JSON</span>
                                </button>
                            </div>
                            <pre className="p-4 font-mono text-xs max-h-64 overflow-y-auto text-gray-800 dark:text-gray-200 bg-gray-50/50 dark:bg-gray-900">
                                <code>{JSON.stringify(testResponse, null, 2)}</code>
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
