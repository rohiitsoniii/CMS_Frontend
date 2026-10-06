import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Users, MousePointer, Clock, ArrowUpRight,
    Download, RefreshCw
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { analyticsService, IAnalyticsData } from '../../services/analyticsService';
import { toast } from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
        } catch (error) {
            console.error('Failed to load realtime');
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
        } catch (error) {
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
        } catch (error) {
            toast.error('Failed to export data');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Analytics Dashboard</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            {realtime?.activeUsers || 0} active users right now
                        </span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <select
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={loadData}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Page Views', value: overview?.overview.totalPageViews, icon: MousePointer, color: 'text-blue-600' },
                    { label: 'Unique Visitors', value: overview?.overview.uniqueVisitors, icon: Users, color: 'text-purple-600' },
                    { label: 'Avg. Session', value: `${Math.round(overview?.overview.avgSessionDuration || 0)}s`, icon: Clock, color: 'text-green-600' },
                    { label: 'Bounce Rate', value: `${Math.round(overview?.overview.bounceRate || 0)}%`, icon: ArrowUpRight, color: 'text-orange-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 bg-gray-50 dark:bg-gray-900 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            {/* Growth indicator would go here */}
                        </div>
                        <h3 className="text-3xl font-bold dark:text-white mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Traffic Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-bold dark:text-white mb-6">Traffic Overview</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={overview?.dailyData}>
                            <defs>
                                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => new Date(str).getDate().toString()}
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                                itemStyle={{ color: '#fff' }}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Area
                                type="monotone"
                                dataKey="totalPageViews"
                                stroke="#4F46E5"
                                fillOpacity={1}
                                fill="url(#colorPv)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold dark:text-white mb-6">Device Usage</h3>
                    <div className="flex items-center justify-center h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={visitors?.devices}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {visitors?.devices?.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Countries */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold dark:text-white mb-6">Top Countries</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={visitors?.countries}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="_id"
                                    type="category"
                                    width={100}
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Realtime Pages */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-bold dark:text-white mb-4">Active Pages (Real-time)</h3>
                <div className="space-y-4">
                    {realtime?.currentPages?.map((page: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{page.title || page.url}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{page.url}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {Array.from({ length: Math.min(page.activeUsers, 5) }).map((_, j) => (
                                        <div key={j} className="h-6 w-6 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800" />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {page.activeUsers} active
                                </span>
                            </div>
                        </div>
                    ))}
                    {(!realtime?.currentPages || realtime.currentPages.length === 0) && (
                        <div className="text-center text-gray-500 py-4">No active pages right now</div>
                    )}
                </div>
            </div>
        </div>
    );
};
