import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ShieldAlert, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    User,
    Globe,
    ExternalLink
} from 'lucide-react';
import { systemAPI } from '@/services/api';
import { ErrorLogsSkeleton } from '@/components/skeletons';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ErrorLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [severity, setSeverity] = useState('');
    const [isFixed, setIsFixed] = useState('false');
    const [selectedLog, setSelectedLog] = useState<any>(null);

    useEffect(() => {
        loadLogs();
    }, [severity, isFixed]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const response = await systemAPI.getErrors({ severity, isFixed });
            setLogs(response.data.data.logs);
        } catch (error) {
            toast.error('Failed to load error logs');
        } finally {
            setLoading(false);
        }
    };

    const handleFix = async (id: string) => {
        try {
            await systemAPI.fixError(id);
            toast.success('Error marked as fixed');
            loadLogs();
            if (selectedLog?._id === id) setSelectedLog(null);
        } catch (error) {
            toast.error('Failed to update error status');
        }
    };

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'critical': return 'bg-red-500 hover:bg-red-600';
            case 'high': return 'bg-orange-500 hover:bg-orange-600';
            case 'medium': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
            default: return 'bg-blue-500 hover:bg-blue-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                        System Error Logs
                    </h1>
                    <p className="text-slate-500">Monitor and resolve system-wide exceptions and failures.</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm outline-none"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                    >
                        <option value="">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <select 
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm outline-none"
                        value={isFixed}
                        onChange={(e) => setIsFixed(e.target.value)}
                    >
                        <option value="false">Unresolved Only</option>
                        <option value="true">Fixed Only</option>
                        <option value="">All Statuses</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* Logs List */}
                <Card className="xl:col-span-2 border-slate-200 dark:border-slate-800">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Recent Anomalies</CardTitle>
                            <Badge variant="outline">{logs.length} Total</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <ErrorLogsSkeleton />
                        ) : logs.length === 0 ? (
                            <div className="p-12 text-center">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <p className="font-medium">No errors detected!</p>
                                <p className="text-sm text-slate-500">System is operating within normal parameters.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {logs.map((log) => (
                                    <div 
                                        key={log._id} 
                                        className={`group p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all ${selectedLog?._id === log._id ? 'bg-slate-50 dark:bg-slate-800 border-l-4 border-red-500' : ''}`}
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-3">
                                                <div className={`mt-1 h-3 w-3 rounded-full ${log.severity === 'critical' ? 'animate-pulse bg-red-500' : log.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                                                <div>
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                                        {log.message}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                        </span>
                                                        <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                            {log.method} {log.path}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge className={getSeverityColor(log.severity)}>{log.severity.toUpperCase()}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Details Peek */}
                <Card className="sticky top-24 border-slate-200 dark:border-slate-800 shadow-xl shadow-red-500/5 overflow-hidden">
                    {selectedLog ? (
                        <>
                            <CardHeader className="bg-slate-900 text-white border-none">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge className={`${getSeverityColor(selectedLog.severity)} border-none`}>{selectedLog.severity.toUpperCase()}</Badge>
                                    <span className="text-xs text-slate-400 font-mono">ID: {selectedLog._id.slice(-8)}</span>
                                </div>
                                <CardTitle className="text-xl break-words">{selectedLog.message}</CardTitle>
                                <CardDescription className="text-slate-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {selectedLog.isOperational ? 'Expected Application Error' : 'Unexpected System Fault'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-500 flex items-center gap-2"><Globe className="w-4 h-4" /> Tenant</span>
                                        <span className="font-medium">{selectedLog.tenantId?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-500 flex items-center gap-2"><User className="w-4 h-4" /> Affected User</span>
                                        <span className="font-medium text-xs font-mono">{selectedLog.userId?._id || 'Anonymous'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-500">Status Code</span>
                                        <Badge variant="secondary" className="font-mono">{selectedLog.statusCode}</Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stack Trace Preview</p>
                                    <pre className="bg-slate-950 text-red-400 p-4 rounded-xl text-[10px] leading-relaxed overflow-x-auto h-48 border border-slate-800 scrollbar-hide">
                                        {selectedLog.stack || 'No stack trace available'}
                                    </pre>
                                </div>

                                {!selectedLog.isFixed && (
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-12" onClick={() => handleFix(selectedLog._id)}>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Mark as Resolved
                                    </Button>
                                )}
                            </CardContent>
                        </>
                    ) : (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                            <ExternalLink className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm">Select an incident from the log feed to view technical diagnostics and stack traces.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
