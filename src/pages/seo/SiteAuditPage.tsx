import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  RefreshCcw, 
  Search, 
  ChevronRight, 
  ExternalLink,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { seoAPI } from '@/services/api';
import { SiteAuditSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SiteAuditPage() {
    const { projectId } = useParams();
    const [report, setReport] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCrawling, setIsCrawling] = useState(false);
    const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            if (isCrawling) checkStatus();
        }, 5000);
        return () => clearInterval(interval);
    }, [projectId, isCrawling]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const historyRes = await seoAPI.getAuditHistory(projectId!);
            if (historyRes.data.success) {
                setHistory(historyRes.data.data);
                if (historyRes.data.data.length > 0) {
                    await fetchReport(historyRes.data.data[0]._id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch audit data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReport = async (id: string) => {
        const res = await seoAPI.getAuditReport(projectId!, id);
        if (res.data.success) {
            setReport(res.data.data);
            if (res.data.data.status === 'crawling') {
                setIsCrawling(true);
            } else {
                setIsCrawling(false);
            }
        }
    };

    const checkStatus = async () => {
        if (!report?._id) return;
        const res = await seoAPI.getAuditReport(projectId!, report._id);
        if (res.data.success) {
            setReport(res.data.data);
            if (res.data.data.status !== 'crawling') {
                setIsCrawling(false);
                toast({ title: 'Audit Complete', description: 'Your site health report is ready.' });
            }
        }
    };

    const runAudit = async () => {
        try {
            setIsCrawling(true);
            const res = await seoAPI.startAudit(projectId!);
            if (res.data.success) {
                setReport(res.data.data);
                toast({ title: 'Audit Started', description: 'Crawling site domain in background...' });
            }
        } catch (error: any) {
            setIsCrawling(false);
            toast({ title: 'Audit Failed', description: error.message, variant: 'destructive' });
        }
    };

    if (loading && !report) return <SiteAuditSkeleton />;

    const filteredIssues = report?.issues?.filter((i: any) => filter === 'all' || i.type === filter) || [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Site Audit Engine</h1>
                    <p className="text-gray-500 mt-1">Full-domain technical SEO evaluation</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        onClick={runAudit} 
                        disabled={isCrawling}
                        className={cn(
                            "rounded-full px-8 shadow-lg transition-all",
                            isCrawling ? "bg-gray-100 dark:bg-gray-800" : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95"
                        )}
                    >
                        {isCrawling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                        {isCrawling ? 'Crawling Site...' : 'Run New Audit'}
                    </Button>
                </div>
            </div>

            {/* Status Bar for active crawl */}
            {isCrawling && (
                <Card className="border-indigo-200 bg-indigo-50/30 dark:bg-indigo-900/10 dark:border-indigo-800 overflow-hidden">
                   <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                            <Activity className="w-4 h-4 animate-pulse" />
                            <span className="font-bold">Crawler Instance Active</span>
                         </div>
                         <span className="text-indigo-600 font-mono">Found {report?.totalUrlsScanned || 0} Pages</span>
                      </div>
                      <Progress value={Math.min(95, (report?.totalUrlsScanned || 0) * 5)} className="h-2" />
                      <p className="text-xs text-indigo-500 italic">Processing links and analyzing meta-data. This may take a few minutes...</p>
                   </div>
                </Card>
            )}

            {!report && !isCrawling && (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <Search className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-xl font-bold dark:text-white">No Audit Data Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        Configure your domain in project settings and start an audit to identify technical SEO issues.
                    </p>
                    <Button onClick={runAudit} className="mt-8 bg-indigo-600">Initial Site Scan</Button>
                </div>
            )}

            {report && (
                <>
                {/* Stats Summary */}
                <div className="grid md:grid-cols-4 gap-6">
                    <Card className="text-center p-6 border-2 border-indigo-100 dark:border-indigo-900">
                        <div className="text-3xl font-black text-indigo-600 mb-1">{report.healthScore}%</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Site Health</div>
                    </Card>
                    <Card className={cn("text-center p-6 border-2 transition-all", report.summary.errors > 0 ? "border-red-100" : "border-gray-100")}>
                        <div className="text-3xl font-black text-red-500 mb-1">{report.summary.errors}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Errors</div>
                    </Card>
                    <Card className="text-center p-6 border-2 border-amber-50">
                        <div className="text-3xl font-black text-amber-500 mb-1">{report.summary.warnings}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Warnings</div>
                    </Card>
                    <Card className="text-center p-6 border-2 border-blue-50">
                        <div className="text-3xl font-black text-blue-500 mb-1">{report.totalUrlsScanned}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">URLs Scanned</div>
                    </Card>
                </div>

                {/* Main Content Areas */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Issues List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2 dark:text-white">
                                Improvement List
                                <Badge variant="outline" className="text-[10px]">{filteredIssues.length} Items</Badge>
                            </h3>
                            <div className="flex gap-1">
                                {['all', 'error', 'warning', 'info'].map((lvl) => (
                                    <button 
                                        key={lvl}
                                        onClick={() => setFilter(lvl as any)}
                                        className={cn(
                                            "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all border",
                                            filter === lvl 
                                                ? "bg-indigo-600 text-white border-indigo-600" 
                                                : "bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700"
                                        )}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredIssues.map((issue: any, idx: number) => (
                                <IssueRow key={idx} issue={issue} />
                            ))}
                            {filteredIssues.length === 0 && (
                                <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed">
                                   <CheckCircle2 className="w-10 h-10 text-green-200 mx-auto mb-3" />
                                   <p className="text-sm font-medium text-gray-500 italic">No {filter} level issues remaining in this scan.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Audit History</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {history.map((h) => (
                                    <button
                                        key={h._id}
                                        onClick={() => fetchReport(h._id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-xl text-left border transition-all",
                                            report?._id === h._id 
                                                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10" 
                                                : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        )}
                                    >
                                        <div>
                                            <p className="text-xs font-bold dark:text-white">
                                                {new Date(h.startedAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                Health Score: {h.healthScore || 0}%
                                            </p>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-gray-300" />
                                    </button>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="bg-gradient-to-br from-gray-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
                            <h4 className="font-bold flex items-center gap-2 mb-2 text-indigo-300">
                                <Zap className="w-4 h-4" />
                                Next Steps
                            </h4>
                            <p className="text-xs text-indigo-100/70 leading-relaxed mb-4">
                                Most of your issues are related to <strong>Missing Metadata</strong>. Use our AI Assistant to generate them automatically.
                            </p>
                            <Button variant="secondary" size="sm" className="w-full bg-white text-indigo-900 hover:bg-indigo-50">
                                Launch Creator AI
                            </Button>
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}

function IssueRow({ issue }: { issue: any }) {
    const [expanded, setExpanded] = useState(false);

    const icons = {
        error: <ShieldAlert className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all hover:border-gray-200 dark:hover:border-gray-700">
            <div 
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="shrink-0">{icons[issue.type as keyof typeof icons]}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{issue.category}</span>
                        <Badge 
                            variant="outline" 
                            className={cn(
                                "text-[9px] h-4 px-1 uppercase tracking-tighter font-bold",
                                issue.impact === 'high' ? "text-red-600 border-red-200 bg-red-50" :
                                issue.impact === 'medium' ? "text-amber-600 border-amber-200 bg-amber-50" :
                                "text-blue-600 border-blue-200 bg-blue-50"
                            )}
                        >
                            {issue.impact} Impact
                        </Badge>
                        <ChevronRight className={cn("w-3 h-3 transition-transform text-gray-300", expanded && "rotate-90")} />
                    </div>
                    <h4 className="text-sm font-bold dark:text-white truncate">{issue.message}</h4>
                    <p className="text-xs text-muted-foreground truncate italic">{issue.url}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                </Button>
            </div>
            {expanded && (
                <div className="px-14 pb-4 animate-in slide-in-from-top-2">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">Fix Suggestion</h5>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{issue.recommendation}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4Z" />
    </svg>
  )
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2" />
    </svg>
  )
}
