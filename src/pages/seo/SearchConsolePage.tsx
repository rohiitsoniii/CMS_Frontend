import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Search, Loader2, Link2, Unlink, TrendingDown, Lightbulb, AlertTriangle } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { gscAPI } from '@/services/growthService';
import { errorMessage } from '@/services/emailMarketingService';

export default function SearchConsolePage() {
    const { projectId } = useParams();
    const [params] = useSearchParams();
    const { toast } = useToast();
    const [status, setStatus] = useState<any>(null);
    const [sites, setSites] = useState<{ siteUrl: string; permission: string }[]>([]);
    const [days, setDays] = useState(28);
    const [perf, setPerf] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const loadStatus = async () => {
        const s = (await gscAPI.status(projectId!)).data.data;
        setStatus(s);
        if (s.connected) gscAPI.sites(projectId!).then((r) => setSites(r.data.data)).catch((e) => toast({ title: errorMessage(e), variant: 'destructive' }));
    };

    useEffect(() => {
        loadStatus().catch(() => undefined);
        if (params.get('connected')) toast({ title: 'Search Console connected' });
        if (params.get('error')) toast({ title: 'Connection failed', description: params.get('error')!, variant: 'destructive' });
    }, [projectId]);

    useEffect(() => {
        if (!status?.connected || !status.siteUrl) return;
        setLoading(true);
        gscAPI.performance(projectId!, days)
            .then((r) => setPerf(r.data.data))
            .catch((e) => toast({ title: 'Could not load data', description: errorMessage(e), variant: 'destructive' }))
            .finally(() => setLoading(false));
    }, [status?.siteUrl, days]);

    const connect = async () => {
        try {
            window.location.href = (await gscAPI.connectUrl(projectId!)).data.data.url;
        } catch (e) {
            toast({ title: 'Cannot connect', description: errorMessage(e), variant: 'destructive' });
        }
    };

    if (!status) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2"><Search className="w-7 h-7" />Google Search Console</h1>
                    <p className="text-gray-500 mt-1">Real clicks, impressions and positions from Google — free, straight from your property.</p>
                </div>
                {status.connected && (
                    <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-500">{status.email}</span>
                        <Button variant="outline" size="sm" onClick={async () => { await gscAPI.disconnect(projectId!); setPerf(null); loadStatus(); }}><Unlink className="w-3.5 h-3.5 mr-1" />Disconnect</Button>
                    </div>
                )}
            </div>

            {!status.configured && (
                <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertTitle>Google sign-in is not configured</AlertTitle>
                    <AlertDescription>Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the server and add <code className="break-all">{status.redirectUri}</code> as an authorised redirect URI.</AlertDescription>
                </Alert>
            )}

            {!status.connected ? (
                <Card>
                    <CardContent className="py-12 text-center space-y-3">
                        <p className="text-gray-600">Connect the Google account that has access to your site in Search Console.</p>
                        <Button onClick={connect} disabled={!status.configured}><Link2 className="w-4 h-4 mr-2" />Connect Google Search Console</Button>
                        <p className="text-xs text-gray-500">Read-only access. You can disconnect any time.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card>
                        <CardContent className="p-4 flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium">Property</span>
                            <select className="h-9 rounded-md border bg-transparent px-2 text-sm min-w-[260px]" value={status.siteUrl || ''} aria-label="Search Console property"
                                onChange={async (e) => { await gscAPI.selectSite(projectId!, e.target.value); loadStatus(); }}>
                                <option value="" disabled>Choose a property…</option>
                                {sites.map((s) => <option key={s.siteUrl} value={s.siteUrl}>{s.siteUrl}</option>)}
                            </select>
                            <div className="flex rounded-md border overflow-hidden ml-auto">
                                {[7, 28, 90].map((d) => (
                                    <button key={d} type="button" onClick={() => setDays(d)} className={`px-3 py-1.5 text-sm ${days === d ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{d} days</button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}
                    {perf && !loading && (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[['Clicks', perf.totals.clicks.toLocaleString()], ['Impressions', perf.totals.impressions.toLocaleString()], ['Avg. CTR', `${perf.totals.ctr}%`], ['Avg. position', perf.totals.position]].map(([l, v]) => (
                                    <Card key={l as string}><CardContent className="p-4"><p className="text-sm text-gray-500">{l}</p><p className="text-2xl font-semibold dark:text-white">{v}</p></CardContent></Card>
                                ))}
                            </div>
                            <Card>
                                <CardHeader className="pb-0"><CardTitle className="text-base">Performance</CardTitle><CardDescription>{perf.range.start} → {perf.range.end}</CardDescription></CardHeader>
                                <CardContent className="h-72 pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={perf.series}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                                            <YAxis yAxisId="c" tick={{ fontSize: 11 }} width={40} />
                                            <YAxis yAxisId="i" orientation="right" tick={{ fontSize: 11 }} width={50} />
                                            <Tooltip />
                                            <Line yAxisId="c" type="monotone" dataKey="clicks" name="Clicks" stroke="#4f46e5" dot={false} strokeWidth={2} />
                                            <Line yAxisId="i" type="monotone" dataKey="impressions" name="Impressions" stroke="#a78bfa" dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <div className="grid lg:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" />Pages losing traffic</CardTitle><CardDescription>vs the previous {days} days</CardDescription></CardHeader>
                                    <CardContent className="space-y-1.5 text-sm">
                                        {perf.losing.length === 0 ? <p className="text-gray-500">No significant drops. 🎉</p> : perf.losing.map((p: any) => (
                                            <div key={p.key} className="flex justify-between gap-3"><span className="truncate" title={p.key}>{p.key.replace(/^https?:\/\/[^/]+/, '') || '/'}</span><span className="text-red-600 whitespace-nowrap">{p.change} clicks</span></div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" />Quick wins</CardTitle><CardDescription>Queries on page 2 — a small push can reach page 1</CardDescription></CardHeader>
                                    <CardContent className="space-y-1.5 text-sm">
                                        {perf.opportunities.length === 0 ? <p className="text-gray-500">No page-2 queries with enough impressions yet.</p> : perf.opportunities.map((q: any) => (
                                            <div key={q.key} className="flex justify-between gap-3"><span className="truncate">{q.key}</span><span className="text-gray-600 whitespace-nowrap">pos {q.position} · {q.impressions} impr.</span></div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-base">Top queries</CardTitle></CardHeader>
                                <CardContent className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="text-left text-gray-500"><th className="py-1.5 font-medium">Query</th><th className="text-right font-medium">Clicks</th><th className="text-right font-medium">Impressions</th><th className="text-right font-medium">CTR</th><th className="text-right font-medium">Position</th></tr></thead>
                                        <tbody>{perf.queries.slice(0, 50).map((q: any) => (
                                            <tr key={q.key} className="border-t"><td className="py-1.5">{q.key}</td><td className="text-right">{q.clicks}</td><td className="text-right">{q.impressions}</td><td className="text-right">{q.ctr}%</td><td className="text-right">{q.position}</td></tr>
                                        ))}</tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
