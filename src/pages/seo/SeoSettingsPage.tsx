import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Settings2, Plus, Trash2, Loader2, Copy, Zap, Globe, Building2, BadgeCheck } from 'lucide-react';
import {
    Button, Input, Label, Switch, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { seoSuiteAPI, SeoSettings, UrlPattern } from '@/services/growthService';
import { contentTypeService } from '@/services/contentTypeService';
import { errorMessage } from '@/services/emailMarketingService';

export default function SeoSettingsPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [s, setS] = useState<SeoSettings | null>(null);
    const [endpoints, setEndpoints] = useState<Record<string, string>>({});
    const [types, setTypes] = useState<{ apiId: string; name: string }[]>([]);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        try {
            const res = await seoSuiteAPI.getSettings(projectId!);
            setS(res.data.data.settings);
            setEndpoints(res.data.data.endpoints);
        } catch (err) {
            toast({ title: 'Could not load SEO settings', description: errorMessage(err), variant: 'destructive' });
        }
    };

    useEffect(() => {
        load();
        contentTypeService.getContentTypes(projectId!)
            .then((list: any[]) => setTypes((list || []).map((t: any) => ({ apiId: t.apiId, name: t.name }))))
            .catch(() => undefined);
    }, [projectId]);

    const save = async () => {
        if (!s) return;
        try {
            setSaving(true);
            const res = await seoSuiteAPI.updateSettings(projectId!, {
                siteUrl: s.siteUrl, siteName: s.siteName, titleTemplate: s.titleTemplate, defaultDescription: s.defaultDescription,
                defaultOgImage: s.defaultOgImage, twitterHandle: s.twitterHandle, defaultLocale: s.defaultLocale,
                urlPatterns: s.urlPatterns, defaultPattern: s.defaultPattern, verification: s.verification,
                organization: s.organization, indexNow: { enabled: s.indexNow.enabled } as any,
            });
            setS(res.data.data);
            toast({ title: 'SEO settings saved' });
        } catch (err) {
            toast({ title: 'Could not save', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const submitAll = async () => {
        try {
            setSubmitting(true);
            const res = await seoSuiteAPI.indexNowSubmit(projectId!);
            toast({ title: res.data.message });
            load();
        } catch (err) {
            toast({ title: 'Submission failed', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!s) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

    const setPattern = (i: number, patch: Partial<UrlPattern>) =>
        setS({ ...s, urlPatterns: s.urlPatterns.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
    const copy = (v: string) => { navigator.clipboard.writeText(v); toast({ title: 'Copied' }); };
    const typeOptions = [...new Set(['blog', 'page', ...types.map((t) => t.apiId)])];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">SEO settings</h1>
                    <p className="text-gray-500 mt-1">Site-wide defaults used for sitemaps, canonical URLs, social cards, structured data and llms.txt.</p>
                </div>
                <Button onClick={save} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button>
            </div>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />Website</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5"><Label htmlFor="site-url">Site URL</Label><Input id="site-url" value={s.siteUrl || ''} onChange={(e) => setS({ ...s, siteUrl: e.target.value })} placeholder="https://www.example.com" /></div>
                        <div className="space-y-1.5"><Label htmlFor="site-name">Site name</Label><Input id="site-name" value={s.siteName || ''} onChange={(e) => setS({ ...s, siteName: e.target.value })} /></div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="title-tpl">Title template</Label>
                            <Input id="title-tpl" value={s.titleTemplate || ''} onChange={(e) => setS({ ...s, titleTemplate: e.target.value })} placeholder="%s | Acme" />
                            <p className="text-xs text-gray-500">%s is replaced with the page title.</p>
                        </div>
                        <div className="space-y-1.5"><Label htmlFor="twitter">X / Twitter handle</Label><Input id="twitter" value={s.twitterHandle || ''} onChange={(e) => setS({ ...s, twitterHandle: e.target.value })} placeholder="@acme" /></div>
                    </div>
                    <div className="space-y-1.5"><Label htmlFor="def-desc">Default meta description</Label><Textarea id="def-desc" rows={2} value={s.defaultDescription || ''} onChange={(e) => setS({ ...s, defaultDescription: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label htmlFor="def-og">Default social image URL</Label><Input id="def-og" value={s.defaultOgImage || ''} onChange={(e) => setS({ ...s, defaultOgImage: e.target.value })} placeholder="https://…/og.png (1200×630)" /></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5" />URL patterns</CardTitle>
                    <CardDescription>Where each content type lives on your website. Use {'{slug}'} and optionally {'{locale}'}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {s.urlPatterns.map((p, i) => (
                        <div key={i} className="flex flex-wrap gap-2 items-center">
                            <select
                                className="h-10 rounded-md border bg-transparent px-3 text-sm w-44"
                                value={p.contentType}
                                onChange={(e) => setPattern(i, { contentType: e.target.value })}
                                aria-label="Content type"
                            >
                                {typeOptions.map((t) => <option key={t} value={t}>{types.find((x) => x.apiId === t)?.name || t}</option>)}
                            </select>
                            <Input className="flex-1 min-w-[160px] font-mono text-sm" value={p.pattern} onChange={(e) => setPattern(i, { pattern: e.target.value })} aria-label="URL pattern" />
                            <label className="flex items-center gap-1.5 text-sm"><Switch checked={p.includeInSitemap} onCheckedChange={(v) => setPattern(i, { includeInSitemap: v })} />Sitemap</label>
                            <Button size="icon" variant="ghost" onClick={() => setS({ ...s, urlPatterns: s.urlPatterns.filter((_, j) => j !== i) })} aria-label="Remove pattern"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                        <Button size="sm" variant="outline" onClick={() => setS({ ...s, urlPatterns: [...s.urlPatterns, { contentType: typeOptions[0], pattern: '/{slug}', includeInSitemap: true }] })}>
                            <Plus className="w-3.5 h-3.5 mr-1" />Add pattern
                        </Button>
                        <div className="flex items-center gap-2 text-sm">
                            <Label htmlFor="def-pattern">Other types</Label>
                            <Input id="def-pattern" className="w-40 font-mono text-sm" value={s.defaultPattern} onChange={(e) => setS({ ...s, defaultPattern: e.target.value })} placeholder="(none)" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />Organization (structured data)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label>Type</Label>
                            <select className="h-10 w-full rounded-md border bg-transparent px-3 text-sm" value={s.organization.type} onChange={(e) => setS({ ...s, organization: { ...s.organization, type: e.target.value } })} aria-label="Organization type">
                                <option value="Organization">Organization</option><option value="LocalBusiness">Local business</option><option value="Person">Person</option>
                            </select>
                        </div>
                        <div className="space-y-1.5"><Label htmlFor="org-name">Name</Label><Input id="org-name" value={s.organization.name || ''} onChange={(e) => setS({ ...s, organization: { ...s.organization, name: e.target.value } })} /></div>
                        <div className="space-y-1.5"><Label htmlFor="org-logo">Logo URL</Label><Input id="org-logo" value={s.organization.logo || ''} onChange={(e) => setS({ ...s, organization: { ...s.organization, logo: e.target.value } })} /></div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5"><Label htmlFor="org-email">Email</Label><Input id="org-email" value={s.organization.email || ''} onChange={(e) => setS({ ...s, organization: { ...s.organization, email: e.target.value } })} /></div>
                        <div className="space-y-1.5"><Label htmlFor="org-phone">Phone</Label><Input id="org-phone" value={s.organization.phone || ''} onChange={(e) => setS({ ...s, organization: { ...s.organization, phone: e.target.value } })} /></div>
                        <div className="space-y-1.5"><Label htmlFor="org-address">Address</Label><Input id="org-address" value={s.organization.address || ''} onChange={(e) => setS({ ...s, organization: { ...s.organization, address: e.target.value } })} /></div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="org-same">Social profiles (one URL per line)</Label>
                        <Textarea id="org-same" rows={3} value={(s.organization.sameAs || []).join('\n')} onChange={(e) => setS({ ...s, organization: { ...s.organization, sameAs: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) } })} placeholder="https://www.linkedin.com/company/acme" />
                        <p className="text-xs text-gray-500">Helps search and AI engines connect your brand to its profiles.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BadgeCheck className="w-5 h-5" />Search engine verification</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-4">
                    {(['google', 'bing', 'yandex'] as const).map((k) => (
                        <div key={k} className="space-y-1.5">
                            <Label htmlFor={`v-${k}`} className="capitalize">{k}</Label>
                            <Input id={`v-${k}`} value={s.verification?.[k] || ''} onChange={(e) => setS({ ...s, verification: { ...s.verification, [k]: e.target.value } })} placeholder="verification code" />
                        </div>
                    ))}
                    <p className="text-xs text-gray-500 sm:col-span-3">Included in the meta bundle your site fetches, so you don't need to edit HTML.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" />Instant indexing (IndexNow)</CardTitle>
                    <CardDescription>Notify Bing, Yandex and partners the moment you publish, instead of waiting for a crawl.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <label className="flex items-center gap-2 text-sm"><Switch checked={s.indexNow.enabled} onCheckedChange={(v) => setS({ ...s, indexNow: { ...s.indexNow, enabled: v } })} />Ping search engines on publish</label>
                    {s.indexNow.enabled && s.indexNow.key && (
                        <div className="text-sm space-y-2">
                            <p>Serve this key at <code>{(s.siteUrl || 'https://yoursite.com')}/{s.indexNow.key}.txt</code> (proxy it from <code className="break-all">{endpoints.sitemap?.replace('sitemap.xml', 'indexnow-key.txt')}</code>).</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button size="sm" variant="outline" onClick={submitAll} disabled={submitting}>{submitting && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}Submit all pages now</Button>
                                {s.indexNow.lastPingAt && <span className="text-xs text-gray-500">Last ping {new Date(s.indexNow.lastPingAt).toLocaleString()}</span>}
                                {s.indexNow.lastError && <span className="text-xs text-red-600">{s.indexNow.lastError}</span>}
                            </div>
                        </div>
                    )}
                    {s.indexNow.enabled && !s.indexNow.key && <p className="text-xs text-gray-500">Save to generate your key.</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Endpoints for your website</CardTitle>
                    <CardDescription>Serve these from your domain (e.g. a rewrite or route in Next.js/Nuxt/Astro) — they always reflect your published content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {Object.entries(endpoints).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2">
                            <span className="w-24 text-sm text-gray-500 shrink-0">{k}</span>
                            <code className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 rounded px-2 py-1.5 truncate" title={v}>{v}</code>
                            <Button size="icon" variant="ghost" onClick={() => copy(v)} aria-label={`Copy ${k} URL`}><Copy className="w-4 h-4" /></Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
