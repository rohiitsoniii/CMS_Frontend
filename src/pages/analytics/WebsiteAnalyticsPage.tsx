import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, Copy, Loader2, Eye, Users, MousePointerClick, Timer, Target } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Textarea } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { siteAnalyticsAPI, SiteReport, TopRow } from '@/services/growthService';
import { errorMessage, publicApiOrigin } from '@/services/emailMarketingService';

const RANGES = [
    { label: '24h', days: 1 },
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
];

function TopList({ title, rows, empty, format }: { title: string; rows: TopRow[]; empty: string; format?: (k: string) => string }) {
    const max = Math.max(1, ...rows.map((r) => r.visitors));
    return (
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
                {rows.length === 0 ? <p className="text-sm text-gray-500">{empty}</p> : rows.map((r) => (
                    <div key={r.key} className="relative text-sm">
                        <div className="absolute inset-y-0 left-0 rounded bg-indigo-50 dark:bg-indigo-950/40" style={{ width: `${(r.visitors / max) * 100}%` }} />
                        <div className="relative flex justify-between gap-3 px-2 py-1">
                            <span className="truncate" title={r.key}>{format ? format(r.key) : r.key}</span>
                            <span className="text-gray-600 tabular-nums">{r.visitors.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function WebsiteAnalyticsPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [days, setDays] = useState(30);
    const [data, setData] = useState<SiteReport | null>(null);
    const [live, setLive] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        siteAnalyticsAPI.report(projectId!, days)
            .then((r) => setData(r.data.data))
            .catch((err) => toast({ title: 'Could not load analytics', description: errorMessage(err), variant: 'destructive' }))
            .finally(() => setLoading(false));
    }, [projectId, days]);

    useEffect(() => {
        const tick = () => siteAnalyticsAPI.realtime(projectId!).then((r) => setLive(r.data.data.visitors)).catch(() => undefined);
        tick();
        const t = setInterval(tick, 30_000);
        return () => clearInterval(t);
    }, [projectId]);

    const snippet = `<script defer src="${publicApiOrigin()}/tracker.js" data-project="${projectId}"></script>`;
    const empty = !loading && data && data.totals.pageviews === 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Website analytics</h1>
                    <p className="text-gray-500 mt-1">Privacy-friendly: no cookies, no personal data, no consent banner needed.</p>
                </div>
                <div className="flex items-center gap-3">
                    {live !== null && (
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{live} online now
                        </span>
                    )}
                    <div className="flex rounded-md border overflow-hidden">
                        {RANGES.map((r) => (
                            <button key={r.days} type="button" onClick={() => setDays(r.days)}
                                className={`px-3 py-1.5 text-sm ${days === r.days ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {(empty || !data) && !loading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Install the tracker</CardTitle>
                        <CardDescription>Add this line to every page of your website (before &lt;/head&gt;). Data appears within a minute.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Textarea readOnly rows={2} className="font-mono text-xs" value={snippet} aria-label="Tracker snippet" />
                        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(snippet); toast({ title: 'Copied' }); }}><Copy className="w-3.5 h-3.5 mr-1" />Copy</Button>
                        <p className="text-xs text-gray-500">Track conversions with <code>hcms.track('signup', {'{'} plan: 'pro' {'}'}, 49)</code> or add <code>data-hcms-event="name"</code> to any button.</p>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : data && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { label: 'Visitors', value: data.totals.visitors.toLocaleString(), icon: Users },
                            { label: 'Page views', value: data.totals.pageviews.toLocaleString(), icon: Eye },
                            { label: 'Pages / visit', value: data.totals.pagesPerSession, icon: MousePointerClick },
                            { label: 'Bounce rate', value: `${data.totals.bounceRate}%`, icon: Timer },
                            { label: 'Conversions', value: data.events.filter((e) => e.name !== 'outbound').reduce((n, e) => n + e.count, 0).toLocaleString(), icon: Target },
                        ].map((s) => (
                            <Card key={s.label}>
                                <CardContent className="p-4">
                                    <p className="text-sm text-gray-500 flex items-center gap-1.5"><s.icon className="w-4 h-4" />{s.label}</p>
                                    <p className="text-2xl font-semibold mt-1 dark:text-white">{s.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader className="pb-0"><CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4" />Traffic</CardTitle></CardHeader>
                        <CardContent className="h-72 pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.series}>
                                    <defs>
                                        <linearGradient id="vis" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false}
                                        tickFormatter={(v: string) => (v.includes('T') ? v.slice(11) : new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={40} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#6366f1" strokeWidth={2} fill="url(#vis)" />
                                    <Area type="monotone" dataKey="pageviews" name="Page views" stroke="#a5b4fc" strokeWidth={1.5} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <TopList title="Top pages" rows={data.pages} empty="No page views yet." />
                        <TopList title="Referrers" rows={data.referrers} empty="No referrers yet — direct traffic only." />
                        <TopList title="UTM sources" rows={data.sources} empty="Add ?utm_source= to your campaign links." />
                        <TopList title="Campaigns" rows={data.campaigns} empty="No UTM campaigns yet." />
                        <TopList title="Countries" rows={data.countries} empty="Country needs a CDN header (Cloudflare, Vercel, CloudFront)." />
                        <TopList title="Devices" rows={[...data.devices, ...data.browsers.map((b) => ({ ...b, key: `· ${b.key}` }))]} empty="—" />
                    </div>

                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Goals & events</CardTitle></CardHeader>
                        <CardContent>
                            {data.events.length === 0 ? (
                                <p className="text-sm text-gray-500">No events yet. Forms, popups and the signup form report conversions automatically.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="text-left text-gray-500"><th className="py-1.5 font-medium">Event</th><th className="font-medium text-right">Count</th><th className="font-medium text-right">Visitors</th><th className="font-medium text-right">Conversion</th><th className="font-medium text-right">Value</th></tr></thead>
                                        <tbody>
                                            {data.events.map((e) => (
                                                <tr key={e.name} className="border-t">
                                                    <td className="py-1.5 font-mono text-xs">{e.name}</td>
                                                    <td className="text-right tabular-nums">{e.count.toLocaleString()}</td>
                                                    <td className="text-right tabular-nums">{e.visitors.toLocaleString()}</td>
                                                    <td className="text-right tabular-nums">{e.conversionRate}%</td>
                                                    <td className="text-right tabular-nums">{e.value ? e.value.toLocaleString() : ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
