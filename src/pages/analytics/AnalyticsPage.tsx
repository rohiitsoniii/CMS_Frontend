import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Users, MousePointer, Clock, ArrowUpRight,
    Download, RefreshCw, BarChart2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { analyticsService, IAnalyticsData } from '../../services/analyticsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AnalyticsPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<IAnalyticsData | null>(null);
    const [realtime, setRealtime] = useState<any>(null);
    const [visitors, setVisitors] = useState<any>(null);
    const [dateRange, setDateRange] = useState('30'); // days

    useEffect(() => {
        loadData();
        const interval = setInterval(loadRealtime, 30000); // 30s refresh for realtime
        return () => clearInterval(interval);
    }, [projectId, dateRange]);

    const loadRealtime = async () => {
        if (!projectId) return;
        try {
            const data = await analyticsService.getRealtime(projectId);
            setRealtime(data);
        } catch {
            // Silently fallback on interval polling
        }
    };

    const loadData = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(dateRange));

            const [overviewData, visitorData, realtimeData] = await Promise.all([
                analyticsService.getOverview(projectId, startDate.toISOString()),
                analyticsService.getVisitorAnalytics(projectId, startDate.toISOString()),
                analyticsService.getRealtime(projectId)
            ]);

            setOverview(overviewData);
            setVisitors(visitorData);
            setRealtime(realtimeData);
        } catch {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!projectId) return;
        try {
            await analyticsService.exportData(projectId);
            toast.success('Export started');
        } catch {
            toast.error('Failed to export data');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading analytics...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                        <BarChart2 className="w-6 h-6 text-primary" />
                        Analytics Dashboard
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            {realtime?.activeUsers || 0} active users online right now
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <select
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value)}
                        className="text-xs border border-border rounded-lg bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                    </select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="gap-2 h-9 text-xs"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={loadData}
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        aria-label="Refresh Data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Page Views', value: overview?.overview?.totalPageViews || 0, icon: MousePointer, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
                    { label: 'Unique Visitors', value: overview?.overview?.uniqueVisitors || 0, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
                    { label: 'Avg. Session', value: `${Math.round(overview?.overview?.avgSessionDuration || 0)}s`, icon: Clock, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
                    { label: 'Bounce Rate', value: `${Math.round(overview?.overview?.bounceRate || 0)}%`, icon: ArrowUpRight, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
                ].map((stat, i) => (
                    <Card key={i} className="border border-border bg-card p-5">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</h3>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </Card>
                ))}
            </div>

            {/* Traffic Chart */}
            <Card className="border border-border bg-card p-6">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-base font-semibold text-foreground">Traffic Overview</CardTitle>
                </CardHeader>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={overview?.dailyData || []}>
                            <defs>
                                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary, #6366f1)" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="var(--primary, #6366f1)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/30" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => new Date(str).getDate().toString()}
                                stroke="currentColor"
                                className="text-muted-foreground text-xs"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="currentColor"
                                className="text-muted-foreground text-xs"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--popover, #1e293b)', color: 'var(--popover-foreground, #fff)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Area
                                type="monotone"
                                dataKey="totalPageViews"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPv)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Breakdown */}
                <Card className="border border-border bg-card p-6">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-base font-semibold text-foreground">Device Usage</CardTitle>
                    </CardHeader>
                    <div className="flex items-center justify-center h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={visitors?.devices || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {(visitors?.devices || []).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--popover, #1e293b)', color: 'var(--popover-foreground, #fff)', borderRadius: '8px', border: 'none' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Countries */}
                <Card className="border border-border bg-card p-6">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-base font-semibold text-foreground">Top Countries</CardTitle>
                    </CardHeader>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={visitors?.countries || []}
                                layout="vertical"
                                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-muted/30" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="_id"
                                    type="category"
                                    width={90}
                                    stroke="currentColor"
                                    className="text-muted-foreground text-xs"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--popover, #1e293b)', color: 'var(--popover-foreground, #fff)', borderRadius: '8px', border: 'none' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Realtime Pages */}
            <Card className="border border-border bg-card p-6">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-base font-semibold text-foreground">Active Pages (Real-time)</CardTitle>
                </CardHeader>
                <div className="space-y-2.5">
                    {realtime?.currentPages?.map((page: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 border border-border/50 rounded-lg">
                            <div className="min-w-0 pr-4">
                                <div className="text-sm font-semibold text-foreground truncate">{page.title || page.url}</div>
                                <div className="text-xs text-muted-foreground truncate font-mono">{page.url}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className="text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                                    {page.activeUsers} active
                                </Badge>
                            </div>
                        </div>
                    ))}
                    {(!realtime?.currentPages || realtime.currentPages.length === 0) && (
                        <div className="text-center text-xs text-muted-foreground py-8">No active page sessions detected at this moment.</div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
