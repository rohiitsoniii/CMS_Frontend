import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bot, CheckCircle2, XCircle, Loader2, FileText, ExternalLink, Sparkles, ShieldAlert } from 'lucide-react';
import {
    Button, Switch, Label, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { seoSuiteAPI, SeoSettings, GeoReport } from '@/services/growthService';
import { errorMessage } from '@/services/emailMarketingService';

interface Overview {
    averageScore: number;
    pagesAnalyzed: number;
    pages: { contentId: string; name: string; type: string; contentTypeId?: string; path: string; score: number; grade: string; topFix?: string }[];
    readiness: { siteUrl: boolean; llmsTxt: boolean; organization: boolean; aiCrawlersBlocked: string[]; indexNow: boolean };
}

const gradeColor = (score: number) => (score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600');

export default function GeoPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [overview, setOverview] = useState<Overview | null>(null);
    const [settings, setSettings] = useState<SeoSettings | null>(null);
    const [crawlers, setCrawlers] = useState<Record<string, string>>({});
    const [endpoints, setEndpoints] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [detail, setDetail] = useState<{ name: string; report: GeoReport | null } | null>(null);

    const load = async () => {
        try {
            const [o, s] = await Promise.all([seoSuiteAPI.geoOverview(projectId!), seoSuiteAPI.getSettings(projectId!)]);
            setOverview(o.data.data);
            const st = s.data.data.settings;
            setSettings({ ...st, aiCrawlers: st.aiCrawlers || {} });
            setCrawlers(s.data.data.aiCrawlers);
            setEndpoints(s.data.data.endpoints);
        } catch (err) {
            toast({ title: 'Could not load AI search data', description: errorMessage(err), variant: 'destructive' });
        }
    };
    useEffect(() => { load(); }, [projectId]);

    const saveAi = async () => {
        if (!settings) return;
        try {
            setSaving(true);
            await seoSuiteAPI.updateSettings(projectId!, { aiCrawlers: settings.aiCrawlers, llms: settings.llms });
            toast({ title: 'Saved', description: 'robots.txt and llms.txt are updated.' });
            load();
        } catch (err) {
            toast({ title: 'Could not save', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const openDetail = async (contentId: string, name: string) => {
        setDetail({ name, report: null });
        try {
            const res = await seoSuiteAPI.geoForContent(projectId!, contentId);
            setDetail({ name, report: res.data.data });
        } catch (err) {
            toast({ title: 'Could not analyse page', description: errorMessage(err), variant: 'destructive' });
            setDetail(null);
        }
    };

    if (!overview || !settings) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

    const r = overview.readiness;
    const checklist = [
        { ok: r.siteUrl, label: 'Site URL set', fix: 'Add your site URL in SEO settings', link: 'seo/settings' },
        { ok: r.organization, label: 'Organization details for structured data', fix: 'Add your organization name, logo and profiles', link: 'seo/settings' },
        { ok: r.llmsTxt, label: 'llms.txt published', fix: 'Enable llms.txt below' },
        { ok: r.aiCrawlersBlocked.filter((b) => /Search|User|Perplexity/.test(b)).length === 0, label: 'AI answer engines can read your site', fix: `Blocked: ${r.aiCrawlersBlocked.join(', ')}` },
        { ok: r.indexNow, label: 'Instant indexing (IndexNow)', fix: 'Enable IndexNow in SEO settings', link: 'seo/settings' },
        { ok: overview.averageScore >= 65, label: `Average content GEO score ${overview.averageScore}/100`, fix: 'Improve the lowest-scoring pages below' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2"><Sparkles className="w-7 h-7 text-indigo-600" />AI search (GEO)</h1>
                <p className="text-gray-500 mt-1">Get found and cited by ChatGPT, Claude, Perplexity, Gemini and Google AI Overviews.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm text-gray-500">Average GEO score</p>
                        <p className={`text-5xl font-bold mt-2 ${gradeColor(overview.averageScore)}`}>{overview.averageScore}</p>
                        <p className="text-xs text-gray-500 mt-1">{overview.pagesAnalyzed} published pages analysed</p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Readiness checklist</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {checklist.map((c) => (
                            <div key={c.label} className="flex items-start gap-2 text-sm">
                                {c.ok ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                                <div>
                                    <span className="dark:text-white">{c.label}</span>
                                    {!c.ok && (
                                        <span className="text-gray-500"> — {c.link ? <Link className="text-indigo-600" to={`/dashboard/project/${projectId}/${c.link}`}>{c.fix}</Link> : c.fix}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5" />AI crawlers</CardTitle>
                        <CardDescription>Choose who may read your site. Blocking “search/user” bots removes you from AI answers; blocking “training” bots only opts out of model training.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {Object.entries(crawlers).map(([bot, desc]) => {
                            const blocked = settings.aiCrawlers[bot] === 'block';
                            return (
                                <div key={bot} className="flex items-center justify-between gap-3 py-1.5 border-b last:border-0">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium font-mono dark:text-white">{bot}</p>
                                        <p className="text-xs text-gray-500">{desc}</p>
                                    </div>
                                    <label className="flex items-center gap-2 text-xs shrink-0">
                                        {blocked ? <span className="text-red-600">Blocked</span> : <span className="text-green-600">Allowed</span>}
                                        <Switch
                                            checked={!blocked}
                                            onCheckedChange={(allow) => setSettings({ ...settings, aiCrawlers: { ...settings.aiCrawlers, [bot]: allow ? 'allow' : 'block' } })}
                                            aria-label={`Allow ${bot}`}
                                        />
                                    </label>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />llms.txt</CardTitle>
                        <CardDescription>A plain-text map of your site for AI assistants, generated from your published content.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <label className="flex items-center gap-2 text-sm">
                            <Switch checked={settings.llms.enabled} onCheckedChange={(v) => setSettings({ ...settings, llms: { ...settings.llms, enabled: v } })} />Publish llms.txt
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <Switch checked={settings.llms.includeFullText} onCheckedChange={(v) => setSettings({ ...settings, llms: { ...settings.llms, includeFullText: v } })} />Also publish llms-full.txt (full page text)
                        </label>
                        <div className="space-y-1.5">
                            <Label htmlFor="llms-summary">Site summary</Label>
                            <Textarea id="llms-summary" rows={3} value={settings.llms.summary || ''} onChange={(e) => setSettings({ ...settings, llms: { ...settings.llms, summary: e.target.value } })} placeholder="Acme makes accounting software for freelancers in Europe…" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="llms-details">Key facts for AI (optional)</Label>
                            <Textarea id="llms-details" rows={4} value={settings.llms.details || ''} onChange={(e) => setSettings({ ...settings, llms: { ...settings.llms, details: e.target.value } })} placeholder={'- Founded in 2019, based in Berlin\n- Pricing starts at €9/month\n- Supports 12 languages'} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {endpoints.llms && <Button size="sm" variant="outline" asChild><a href={endpoints.llms} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-1" />View llms.txt</a></Button>}
                            {endpoints.robots && <Button size="sm" variant="outline" asChild><a href={endpoints.robots} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-1" />View robots.txt</a></Button>}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-end">
                <Button onClick={saveAi} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save AI settings</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pages to improve</CardTitle>
                    <CardDescription>Lowest scores first. Click a page for its full checklist and structured-data preview.</CardDescription>
                </CardHeader>
                <CardContent>
                    {overview.pages.length === 0 ? (
                        <p className="text-sm text-gray-500 py-6 text-center flex items-center justify-center gap-2"><ShieldAlert className="w-4 h-4" />No published pages with a URL yet. Check URL patterns in SEO settings.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Page</TableHead><TableHead>Score</TableHead><TableHead>Top fix</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {overview.pages.map((p) => (
                                        <TableRow key={p.contentId} className="cursor-pointer" onClick={() => openDetail(p.contentId, p.name)}>
                                            <TableCell>
                                                <div className="font-medium dark:text-white">{p.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{p.path}</div>
                                            </TableCell>
                                            <TableCell><span className={`font-semibold ${gradeColor(p.score)}`}>{p.score}</span> <Badge variant="secondary">{p.grade}</Badge></TableCell>
                                            <TableCell className="text-sm text-gray-600 max-w-md">{p.topFix || '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={Boolean(detail)} onOpenChange={(v) => !v && setDetail(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{detail?.name}</DialogTitle>
                        {detail?.report && <DialogDescription>GEO score {detail.report.score}/100 · {detail.report.wordCount} words</DialogDescription>}
                    </DialogHeader>
                    {!detail?.report ? <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" /></div> : (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                {detail.report.checks.map((c) => (
                                    <div key={c.id} className="flex items-start gap-2 text-sm">
                                        {c.passed ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                                        <div>
                                            <span className="font-medium dark:text-white">{c.label}</span> <span className="text-gray-500">— {c.detail}</span>
                                            {!c.passed && c.fix && <p className="text-gray-600 text-xs mt-0.5">{c.fix}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-1">Search result preview</p>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-gray-500 truncate">{detail.report.preview.canonical || detail.report.preview.path}</p>
                                    <p className="text-[#1a0dab] dark:text-blue-400 text-lg leading-snug">{detail.report.preview.title}</p>
                                    <p className="text-sm text-gray-600">{detail.report.preview.description || <em>No description — add one.</em>}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-1">Generated structured data (JSON-LD)</p>
                                <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded-lg p-3 overflow-x-auto max-h-64">{JSON.stringify(detail.report.preview.jsonLd, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
