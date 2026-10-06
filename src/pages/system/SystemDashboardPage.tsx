import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Users, 
    Globe, 
    Database, 
    TrendingUp, 
    Clock,
    ShieldAlert,
    Ticket,
    RefreshCcw
} from 'lucide-react';
import { systemAPI } from '@/services/api';
import { SuperAdminDashboardSkeleton } from '@/components/skeletons';
import { toast } from 'react-hot-toast';

export default function SystemDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const response = await systemAPI.getStats();
            setStats(response.data.data);
        } catch (error) {
            toast.error('Failed to load system statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <SuperAdminDashboardSkeleton />;

    if (!stats) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <ShieldAlert className="w-12 h-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Super Admin Telemetry</h2>
            <p className="text-gray-500 max-w-md mb-6">
                Platform vital signs are restricted to Super Administrators. Ensure your account has platform super-admin privileges.
            </p>
            <Button onClick={loadStats} variant="outline" className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                Refresh
            </Button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
                    <p className="text-slate-500 mt-1">Real-time vital signs of your enterprise SaaS infrastructure.</p>
                </div>
                <Button variant="outline" onClick={loadStats} className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Refresh Stats
                </Button>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Tenants" 
                    value={stats.tenants} 
                    icon={<Globe className="w-5 h-5" />} 
                    color="bg-blue-500"
                    description="Active SaaS customers"
                />
                <StatCard 
                    title="System Users" 
                    value={stats.users} 
                    icon={<Users className="w-5 h-5" />} 
                    color="bg-indigo-500"
                    description="Across all organizations"
                />
                <StatCard 
                    title="Open Errors" 
                    value={stats.openErrors} 
                    icon={<ShieldAlert className="w-5 h-5" />} 
                    color="bg-red-500"
                    description="Critical system alerts"
                    trend={stats.openErrors > 5 ? "Action Required" : "Stable"}
                    trendColor={stats.openErrors > 5 ? "text-red-500" : "text-green-500"}
                />
                <StatCard 
                    title="Total Content" 
                    value={stats.content} 
                    icon={<Database className="w-5 h-5" />} 
                    color="bg-emerald-500"
                    description="Nodes in database"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Health */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ActivityIcon className="w-5 h-5 text-green-500" />
                            System Health & Uptime
                        </CardTitle>
                        <CardDescription>Infrastructure performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Uptime Status</p>
                                        <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">99.99%</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Session Uptime</p>
                                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{(stats.uptime / 3600).toFixed(2)} Hours</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Database Load</p>
                                    <div className="flex items-start justify-between">
                                        <span className="text-2xl font-bold">12%</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md font-bold">OPTIMAL</span>
                                    </div>
                                </div>
                                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">API Latency</p>
                                    <div className="flex items-start justify-between">
                                        <span className="text-2xl font-bold">45ms</span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md font-bold">FAST</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Global Management</CardTitle>
                        <CardDescription>Shortcut to system modules</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ActionButton icon={<ShieldAlert className="w-4 h-4" />} title="View Error Logs" href="/admin/system/errors" color="text-red-500" />
                        <ActionButton icon={<Globe className="w-4 h-4" />} title="Manage Tenants" href="/admin/system/tenants" color="text-blue-500" />
                        <ActionButton icon={<Ticket className="w-4 h-4" />} title="Create Coupons" href="/admin/system/coupons" color="text-orange-500" />
                        <ActionButton icon={<Clock className="w-4 h-4" />} title="Audit Trails" href="/admin/system/audit" color="text-indigo-500" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, description, trend, trendColor }: any) {
    return (
        <Card className="overflow-hidden border-none shadow-md">
            <div className={`h-1 ${color}`} />
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardDescription className="font-bold text-xs uppercase tracking-wider">{title}</CardDescription>
                    <div className={`${color}/10 p-2 rounded-lg`}>
                        {icon}
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold pt-2">{value ?? 0}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 italic">{description}</p>
                    {trend && <span className={`text-[10px] font-bold ${trendColor}`}>{trend}</span>}
                </div>
            </CardContent>
        </Card>
    );
}

function ActionButton({ icon, title, href, color }: any) {
    return (
        <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => window.location.href = href}
        >
            <div className={`${color} bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800`}>
                {icon}
            </div>
            <span className="font-medium">{title}</span>
        </Button>
    );
}

function ActivityIcon({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
