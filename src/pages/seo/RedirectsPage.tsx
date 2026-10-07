import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Plus, Trash2, Loader2, Upload, AlertCircle, Copy } from 'lucide-react';
import {
    Button, Input, Label, Switch, Card, CardHeader, CardTitle, CardDescription, CardContent, Textarea,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
    Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { seoSuiteAPI, Redirect, NotFoundEntry } from '@/services/growthService';
import { errorMessage, publicApiOrigin } from '@/services/emailMarketingService';
import { parseCsv } from '@/lib/csv';

export default function RedirectsPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [redirects, setRedirects] = useState<Redirect[]>([]);
    const [notFound, setNotFound] = useState<NotFoundEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Redirect> | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [importText, setImportText] = useState('');

    const load = async () => {
        try {
            setLoading(true);
            const [r, n] = await Promise.all([seoSuiteAPI.listRedirects(projectId!), seoSuiteAPI.listNotFound(projectId!)]);
            setRedirects(r.data.data);
            setNotFound(n.data.data);
        } catch (err) {
            toast({ title: 'Could not load redirects', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [projectId]);

    const save = async () => {
        if (!editing) return;
        try {
            if (editing._id) await seoSuiteAPI.updateRedirect(projectId!, editing._id, editing);
            else await seoSuiteAPI.createRedirect(projectId!, editing);
            toast({ title: 'Redirect saved' });
            setEditing(null);
            load();
        } catch (err) {
            toast({ title: 'Could not save', description: errorMessage(err), variant: 'destructive' });
        }
    };

    const runImport = async () => {
        const rows = parseCsv(importText).filter((r) => r[0] && !/^from$/i.test(r[0].trim()));
        try {
            const res = await seoSuiteAPI.importRedirects(projectId!, rows.map((r) => ({ from: r[0], to: r[1], statusCode: Number(r[2]) || 301 })));
            const d = res.data.data;
            toast({ title: 'Import complete', description: `${d.created} created, ${d.updated} updated, ${d.invalid} invalid` });
            setImportOpen(false);
            setImportText('');
            load();
        } catch (err) {
            toast({ title: 'Import failed', description: errorMessage(err), variant: 'destructive' });
        }
    };

    const nextSnippet = `// middleware.ts (Next.js)
const res = await fetch("${publicApiOrigin()}/api/v1/public/seo/${projectId}/resolve?path=" + encodeURIComponent(req.nextUrl.pathname));
const { data } = await res.json();
if (data.type === "redirect") return NextResponse.redirect(new URL(data.to, req.url), data.statusCode);
if (data.type === "gone") return new NextResponse(null, { status: 410 });
// In your 404 page, report the miss: ...resolve?path=<path>&notFound=1`;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Redirects & 404s</h1>
                    <p className="text-gray-500 mt-1">Keep old links working and fix broken URLs visitors actually hit.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="w-4 h-4 mr-2" />Import CSV</Button>
                    <Button onClick={() => setEditing({ from: '', to: '', statusCode: 301, isActive: true })}><Plus className="w-4 h-4 mr-2" />Add redirect</Button>
                </div>
            </div>

            <Tabs defaultValue="redirects">
                <TabsList>
                    <TabsTrigger value="redirects">Redirects ({redirects.length})</TabsTrigger>
                    <TabsTrigger value="404">404 monitor ({notFound.length})</TabsTrigger>
                    <TabsTrigger value="setup">Website setup</TabsTrigger>
                </TabsList>

                <TabsContent value="redirects">
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>From</TableHead><TableHead /><TableHead>To</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Hits</TableHead><TableHead className="w-24" /></TableRow></TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin inline" /></TableCell></TableRow>
                                    ) : redirects.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-500">No redirects yet.</TableCell></TableRow>
                                    ) : redirects.map((r) => (
                                        <TableRow key={r._id} className={r.isActive ? '' : 'opacity-50'}>
                                            <TableCell className="font-mono text-sm">{r.from}</TableCell>
                                            <TableCell><ArrowRight className="w-4 h-4 text-gray-400" /></TableCell>
                                            <TableCell className="font-mono text-sm truncate max-w-xs">{r.statusCode === 410 ? <em className="text-gray-500">gone</em> : r.to}</TableCell>
                                            <TableCell className="text-sm">{r.statusCode}</TableCell>
                                            <TableCell className="text-right text-sm">{r.hits}</TableCell>
                                            <TableCell>
                                                <div className="flex">
                                                    <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>Edit</Button>
                                                    <Button size="icon" variant="ghost" aria-label="Delete redirect" onClick={async () => { await seoSuiteAPI.deleteRedirect(projectId!, r._id); load(); }}><Trash2 className="w-4 h-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="404">
                    <Card>
                        <CardHeader>
                            <CardDescription>URLs visitors requested that don't exist (reported by your website). Fix them with a redirect.</CardDescription>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Path</TableHead><TableHead className="text-right">Hits</TableHead><TableHead>Last seen</TableHead><TableHead>Referrer</TableHead><TableHead className="w-48" /></TableRow></TableHeader>
                                <TableBody>
                                    {notFound.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-12 text-gray-500"><AlertCircle className="w-5 h-5 inline mr-2" />No 404s reported. See “Website setup” to start reporting.</TableCell></TableRow>
                                    ) : notFound.map((n) => (
                                        <TableRow key={n._id}>
                                            <TableCell className="font-mono text-sm">{n.path}</TableCell>
                                            <TableCell className="text-right">{n.hits}</TableCell>
                                            <TableCell className="text-sm text-gray-500 whitespace-nowrap">{new Date(n.lastSeenAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-xs text-gray-500 truncate max-w-[200px]" title={n.lastReferrer}>{n.lastReferrer || '—'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" onClick={() => setEditing({ from: n.path, to: '', statusCode: 301, isActive: true })}>Redirect</Button>
                                                    <Button size="sm" variant="ghost" onClick={async () => { await seoSuiteAPI.dismissNotFound(projectId!, n._id); load(); }}>Dismiss</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="setup">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Connect your website</CardTitle>
                            <CardDescription>Your site checks each request against your redirects and reports 404s. Example for Next.js middleware:</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded-lg p-3 overflow-x-auto">{nextSnippet}</pre>
                            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(nextSnippet); toast({ title: 'Copied' }); }}><Copy className="w-3.5 h-3.5 mr-1" />Copy</Button>
                            <p className="text-xs text-gray-500">Static sites can instead fetch <code>/redirects</code> at build time and write them to your host's redirect file (Netlify _redirects, Vercel config).</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
                {editing && (
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editing._id ? 'Edit redirect' : 'Add redirect'}</DialogTitle></DialogHeader>
                        <div className="space-y-3 py-2">
                            <div className="space-y-1.5"><Label htmlFor="r-from">From path</Label><Input id="r-from" className="font-mono" value={editing.from} onChange={(e) => setEditing({ ...editing, from: e.target.value })} placeholder="/old-page" /></div>
                            <div className="space-y-1.5">
                                <Label htmlFor="r-type">Type</Label>
                                <select id="r-type" className="h-10 w-full rounded-md border bg-transparent px-3 text-sm" value={editing.statusCode} onChange={(e) => setEditing({ ...editing, statusCode: Number(e.target.value) })}>
                                    <option value={301}>301 — Permanent (passes SEO value)</option>
                                    <option value={302}>302 — Temporary</option>
                                    <option value={307}>307 — Temporary (keep method)</option>
                                    <option value={308}>308 — Permanent (keep method)</option>
                                    <option value={410}>410 — Gone (removed for good)</option>
                                </select>
                            </div>
                            {editing.statusCode !== 410 && (
                                <div className="space-y-1.5"><Label htmlFor="r-to">To</Label><Input id="r-to" className="font-mono" value={editing.to || ''} onChange={(e) => setEditing({ ...editing, to: e.target.value })} placeholder="/new-page or https://…" /></div>
                            )}
                            <label className="flex items-center gap-2 text-sm"><Switch checked={editing.isActive !== false} onCheckedChange={(v) => setEditing({ ...editing, isActive: v })} />Active</label>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                            <Button onClick={save}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>

            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import redirects</DialogTitle>
                        <DialogDescription>Paste CSV rows: <code>from,to,status</code> (status optional, default 301).</DialogDescription>
                    </DialogHeader>
                    <Textarea rows={10} className="font-mono text-xs" value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={'/old-blog/post-1,/blog/post-1,301\n/summer-sale,/sale,302'} aria-label="Redirect CSV" />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
                        <Button onClick={runImport} disabled={!importText.trim()}>Import</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
