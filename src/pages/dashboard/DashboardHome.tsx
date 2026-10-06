import {
    FileText,
    Eye,
    TrendingUp,
    Database,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Plus,
    Layers,
    Navigation,
    Newspaper,
    HelpCircle,
    RefreshCcw
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store';
import { analyticsAPI, api } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { AnalyticsDashboardSkeleton } from '@/components/skeletons';



// Quick actions
const quickActions = [
    { name: 'Add Hero Section', icon: Layers, href: '/dashboard/content/hero/new', color: 'bg-blue-500' },
    { name: 'Add Navigation', icon: Navigation, href: '/dashboard/content/navigation/new', color: 'bg-purple-500' },
    { name: 'New Blog Post', icon: Newspaper, href: '/dashboard/content/blog/new', color: 'bg-emerald-500' },
    { name: 'Add FAQ', icon: HelpCircle, href: '/dashboard/content/faq/new', color: 'bg-amber-500' },
];


export default function DashboardHome() {
    const { tenant } = useAuthStore();
    const [stats, setStats] = useState<any[]>([]);
    const [recentContent, setRecentContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const statsRes = await analyticsAPI.getStats();

            // Transform analytics data for the UI
            const liveStats = [
                {
                    name: 'Total Content',
                    value: statsRes.data.data.contentOperations || '0',
                    change: '+12%', 
                    changeType: 'increase' as const,
                    icon: FileText,
                    color: 'from-blue-500 to-cyan-500',
                },
                {
                    name: 'API Calls (7d)',
                    value: statsRes.data.data.apiCalls?.last7d?.toLocaleString() || '0',
                    change: '+8%',
                    changeType: 'increase' as const,
                    icon: Eye,
                    color: 'from-purple-500 to-pink-500',
                },
                {
                    name: 'Active Users',
                    value: statsRes.data.data.activeUsers || '0',
                    change: '+3%',
                    changeType: 'increase' as const,
                    icon: TrendingUp,
                    color: 'from-emerald-500 to-teal-500',
                },
                {
                    name: 'Storage Used',
                    value: `${((tenant?.usage?.storageUsed || 0) / (1024 * 1024)).toFixed(1)}MB`,
                    change: `${(((tenant?.usage?.storageUsed || 0) / 104857600) * 100).toFixed(0)}%`,
                    changeType: 'neutral' as const,
                    icon: Database,
                    color: 'from-orange-500 to-amber-500',
                },

            ];

            setStats(liveStats);
            
            // Fetch recent content from the general content endpoint
            try {
                const contentRes = await api.get('/projects/all/content/recent');
                setRecentContent(contentRes.data.data.contents || []);
            } catch (err) {
                console.warn('Recent content endpoint failed, showing platform defaults');
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge className="bg-emerald-500 text-white border-none">Published</Badge>;
            case 'draft':
                return <Badge variant="secondary">Draft</Badge>;
            case 'scheduled':
                return <Badge className="bg-blue-500 text-white border-none">Scheduled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) return <AnalyticsDashboardSkeleton />;


    return (
        <div className="space-y-8">
            {/* Welcome section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back! 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Here's what's happening with your CMS today.
                    </p>
                </div>
                <Button variant="gradient" asChild>
                    <Link to="/dashboard/content/new">
                        <Plus className="w-4 h-4" />
                        Create Content
                    </Link>
                </Button>
            </div>

            {/* Stats grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="hover-lift">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-medium ${stat.changeType === 'increase'
                                        ? 'text-emerald-600'
                                        : stat.changeType === 'decrease'
                                            ? 'text-red-600'
                                            : 'text-gray-500'
                                    }`}>
                                    {stat.change}
                                    {stat.changeType === 'increase' && <ArrowUpRight className="w-4 h-4" />}
                                    {stat.changeType === 'decrease' && <ArrowDownRight className="w-4 h-4" />}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Quick Actions */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <CardDescription>Create new content quickly</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {quickActions.map((action) => (
                            <Link
                                key={action.name}
                                to={action.href}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                            >
                                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                                    <action.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                    {action.name}
                                </span>
                                <ArrowUpRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Content */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Recent Content</CardTitle>
                            <CardDescription>Your latest content updates</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/dashboard/content">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {recentContent.map((content) => (
                                <div
                                    key={content.id}
                                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{content.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {content.type?.replace('_', ' ') || 'Content'} • {content.updatedAt ? formatDistanceToNow(new Date(content.updatedAt), { addSuffix: true }) : 'recent'}
                                            </p>

                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(content.status)}
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Usage Overview</CardTitle>
                    <CardDescription>
                        Your {tenant?.subscription?.plan?.toUpperCase()} plan usage this month
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* API Calls */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">API Calls (7d)</span>
                                <span className="font-medium">
                                    {stats.find(s => s.name === 'API Calls (7d)')?.value || '0'} / 1,000
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (parseInt(stats.find(s => s.name === 'API Calls (7d)')?.value?.replace(/,/g, '') || '0') / 1000) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Storage */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Storage</span>
                                <span className="font-medium">
                                    {stats.find(s => s.name === 'Storage Used')?.value || '0MB'} / 100MB
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" 
                                    style={{ width: stats.find(s => s.name === 'Storage Used')?.change || '0%' }}
                                />
                            </div>
                        </div>

                        {/* Content Items */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Content Items</span>
                                <span className="font-medium">
                                    {stats.find(s => s.name === 'Total Content')?.value || '0'} / 50
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (parseInt(stats.find(s => s.name === 'Total Content')?.value || '0') / 50) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
