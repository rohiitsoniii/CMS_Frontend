import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Users, UserPlus, Upload, Download, Search, Trash2, Tag, MailX, Loader2, Code2, Copy, Filter, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
    Button, Input, Label, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Checkbox, Textarea,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
    Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { emailAPI, Subscriber, AudienceStats, errorMessage, publicApiOrigin } from '@/services/emailMarketingService';
import { csvToContacts } from '@/lib/csv';

const STATUS_STYLES: Record<string, string> = {
    subscribed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    unsubscribed: 'bg-gray-100 text-gray-600',
    bounced: 'bg-red-100 text-red-700',
    complained: 'bg-red-100 text-red-700',
};

export default function AudiencePage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [stats, setStats] = useState<AudienceStats | null>(null);
    const [items, setItems] = useState<Subscriber[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: 'all', tag: 'all', source: 'all' });
    const [selected, setSelected] = useState<string[]>([]);
    const [addOpen, setAddOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [tagDialog, setTagDialog] = useState<null | 'tag' | 'untag'>(null);
    const limit = 50;

    const loadStats = () => emailAPI.subscriberStats(projectId!).then((r) => setStats(r.data.data)).catch(() => undefined);

    const load = async () => {
        try {
            setLoading(true);
            const params: Record<string, any> = { page, limit };
            if (filters.search) params.search = filters.search;
            if (filters.status !== 'all') params.status = filters.status;
            if (filters.tag !== 'all') params.tag = filters.tag;
            if (filters.source !== 'all') params.source = filters.source;
            const res = await emailAPI.listSubscribers(projectId!, params);
            setItems(res.data.data);
            setTotal(res.data.pagination.total);
            setSelected([]);
        } catch (err) {
            toast({ title: 'Could not load contacts', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStats(); }, [projectId]);
    useEffect(() => {
        const t = setTimeout(load, filters.search ? 300 : 0);
        return () => clearTimeout(t);
    }, [projectId, page, filters]);

    const refresh = () => { load(); loadStats(); };

    const bulk = async (action: string, tags?: string[]) => {
        try {
            await emailAPI.bulkSubscribers(projectId!, { action, ids: selected, tags });
            toast({ title: 'Done', description: `${selected.length} contacts updated` });
            refresh();
        } catch (err) {
            toast({ title: 'Action failed', description: errorMessage(err), variant: 'destructive' });
        }
    };

    const exportCsv = async () => {
        try {
            const res = await emailAPI.exportSubscribers(projectId!);
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contacts.csv';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            toast({ title: 'Export failed', description: errorMessage(err), variant: 'destructive' });
        }
    };

    const pages = Math.max(1, Math.ceil(total / limit));
    const allChecked = items.length > 0 && selected.length === items.length;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Audience</h1>
                    <p className="text-gray-500 mt-1">Everyone who signed up on your website, through the chatbot, or was imported.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={exportCsv}><Download className="w-4 h-4 mr-2" />Export</Button>
                    <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="w-4 h-4 mr-2" />Import CSV</Button>
                    <Button onClick={() => setAddOpen(true)}><UserPlus className="w-4 h-4 mr-2" />Add contact</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Subscribed', value: stats?.subscribed ?? '—' },
                    { label: 'Awaiting confirmation', value: stats?.pending ?? '—' },
                    { label: 'Unsubscribed', value: stats?.unsubscribed ?? '—' },
                    { label: 'New (30 days)', value: stats ? stats.growth.reduce((n, g) => n + g.count, 0) : '—' },
                ].map((s) => (
                    <Card key={s.label}>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-500">{s.label}</p>
                            <p className="text-2xl font-semibold mt-1 dark:text-white">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="contacts">
                <TabsList>
                    <TabsTrigger value="contacts"><Users className="w-4 h-4 mr-2" />Contacts</TabsTrigger>
                    <TabsTrigger value="forms"><Code2 className="w-4 h-4 mr-2" />Signup forms</TabsTrigger>
                </TabsList>

                <TabsContent value="contacts" className="space-y-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input className="pl-9" placeholder="Search email or name" value={filters.search} onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }} aria-label="Search contacts" />
                        </div>
                        <Select value={filters.status} onValueChange={(v) => { setPage(1); setFilters({ ...filters, status: v }); }}>
                            <SelectTrigger className="w-40" aria-label="Status"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                {['subscribed', 'pending', 'unsubscribed', 'bounced'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filters.tag} onValueChange={(v) => { setPage(1); setFilters({ ...filters, tag: v }); }}>
                            <SelectTrigger className="w-40" aria-label="Tag"><SelectValue placeholder="Tag" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All tags</SelectItem>
                                {(stats?.tags || []).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filters.source} onValueChange={(v) => { setPage(1); setFilters({ ...filters, source: v }); }}>
                            <SelectTrigger className="w-40" aria-label="Source"><SelectValue placeholder="Source" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All sources</SelectItem>
                                {(stats?.bySource || []).map((s) => <SelectItem key={s.source} value={s.source}>{s.source} ({s.count})</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" asChild>
                            <Link to={`/dashboard/project/${projectId}/email/segments`}><Filter className="w-4 h-4 mr-2" />Segments</Link>
                        </Button>
                    </div>

                    {selected.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                            <span className="text-sm font-medium">{selected.length} selected</span>
                            <Button size="sm" variant="outline" onClick={() => setTagDialog('tag')}><Tag className="w-3.5 h-3.5 mr-1" />Add tags</Button>
                            <Button size="sm" variant="outline" onClick={() => setTagDialog('untag')}>Remove tags</Button>
                            <Button size="sm" variant="outline" onClick={() => bulk('unsubscribe')}><MailX className="w-3.5 h-3.5 mr-1" />Unsubscribe</Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => { if (confirm(`Delete ${selected.length} contacts permanently?`)) bulk('delete'); }}>
                                <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
                            </Button>
                        </div>
                    )}

                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <Checkbox checked={allChecked} onCheckedChange={(v) => setSelected(v ? items.map((i) => i._id) : [])} aria-label="Select all" />
                                        </TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tags</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead className="text-right">Opens</TableHead>
                                        <TableHead className="text-right">Clicks</TableHead>
                                        <TableHead>Added</TableHead>
                                        <TableHead className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={9} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin inline text-gray-400" /></TableCell></TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                                                No contacts yet. Add a signup form to your website, turn on email capture in your chatbot, or import a CSV.
                                            </TableCell>
                                        </TableRow>
                                    ) : items.map((s) => (
                                        <TableRow key={s._id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selected.includes(s._id)}
                                                    onCheckedChange={(v) => setSelected(v ? [...selected, s._id] : selected.filter((x) => x !== s._id))}
                                                    aria-label={`Select ${s.email}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium dark:text-white">{s.email}</div>
                                                {s.name && <div className="text-xs text-gray-500">{s.name}</div>}
                                            </TableCell>
                                            <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status]}`}>{s.status}</span></TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                    {s.tags.slice(0, 4).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                                                    {s.tags.length > 4 && <span className="text-xs text-gray-400">+{s.tags.length - 4}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600" title={s.sourceDetail}>{s.source}</TableCell>
                                            <TableCell className="text-right text-sm">{s.totalEmailsOpened}</TableCell>
                                            <TableCell className="text-right text-sm">{s.totalLinksClicked}</TableCell>
                                            <TableCell className="text-sm text-gray-500 whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="icon" variant="ghost" aria-label={`Delete ${s.email}`}
                                                    onClick={async () => {
                                                        if (!confirm(`Delete ${s.email}?`)) return;
                                                        await emailAPI.deleteSubscriber(projectId!, s._id).catch((e) => toast({ title: errorMessage(e), variant: 'destructive' }));
                                                        refresh();
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 text-gray-400" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{total.toLocaleString()} contacts</span>
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></Button>
                            <span>Page {page} of {pages}</span>
                            <Button size="icon" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="forms">
                    <SignupFormBuilder projectId={projectId!} />
                </TabsContent>
            </Tabs>

            <AddContactDialog open={addOpen} onOpenChange={setAddOpen} projectId={projectId!} onDone={refresh} />
            <ImportDialog open={importOpen} onOpenChange={setImportOpen} projectId={projectId!} onDone={refresh} />
            <TagDialog
                mode={tagDialog}
                onClose={() => setTagDialog(null)}
                onSubmit={(tags) => { bulk(tagDialog!, tags); setTagDialog(null); }}
            />
        </div>
    );
}

function AddContactDialog({ open, onOpenChange, projectId, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; onDone: () => void }) {
    const { toast } = useToast();
    const [form, setForm] = useState({ email: '', name: '', tags: '' });
    const [saving, setSaving] = useState(false);
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await emailAPI.addSubscriber(projectId, { email: form.email, name: form.name, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) });
            toast({ title: 'Contact added' });
            setForm({ email: '', name: '', tags: '' });
            onOpenChange(false);
            onDone();
        } catch (err) {
            toast({ title: 'Could not add contact', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Add contact</DialogTitle>
                        <DialogDescription>Only add people who agreed to receive your emails.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="space-y-1.5"><Label htmlFor="c-email">Email</Label><Input id="c-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label htmlFor="c-name">Name</Label><Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label htmlFor="c-tags">Tags (comma separated)</Label><Input id="c-tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="customer, vip" /></div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Add</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ImportDialog({ open, onOpenChange, projectId, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; onDone: () => void }) {
    const { toast } = useToast();
    const [parsed, setParsed] = useState<{ contacts: any[]; columns: string[]; hasEmail?: boolean } | null>(null);
    const [tags, setTags] = useState('');
    const [consent, setConsent] = useState(false);
    const [busy, setBusy] = useState(false);

    const onFile = async (file?: File) => {
        if (!file) return;
        const text = await file.text();
        setParsed(csvToContacts(text));
    };

    const submit = async () => {
        if (!parsed) return;
        try {
            setBusy(true);
            const contacts = parsed.contacts.filter((c) => c.email);
            let created = 0, updated = 0, skipped = 0, invalid = 0;
            for (let i = 0; i < contacts.length; i += 5000) {
                const res = await emailAPI.importSubscribers(projectId, {
                    contacts: contacts.slice(i, i + 5000),
                    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
                    consent,
                });
                const d = res.data.data;
                created += d.created; updated += d.updated; skipped += d.skipped; invalid += d.invalid;
            }
            toast({ title: 'Import complete', description: `${created} added, ${updated} updated, ${skipped} skipped (unsubscribed/duplicates), ${invalid} invalid` });
            setParsed(null);
            setConsent(false);
            onOpenChange(false);
            onDone();
        } catch (err) {
            toast({ title: 'Import failed', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) setParsed(null); onOpenChange(v); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Import contacts</DialogTitle>
                    <DialogDescription>CSV with an <code>email</code> column. Optional: name, first_name, last_name, phone, tags; other columns become custom fields.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <Input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} aria-label="CSV file" />
                    {parsed && (
                        parsed.hasEmail === false
                            ? <p className="text-sm text-red-600">No email column found. Columns: {parsed.columns.join(', ')}</p>
                            : <p className="text-sm text-gray-600">{parsed.contacts.length.toLocaleString()} rows found · columns: {parsed.columns.join(', ')}</p>
                    )}
                    <div className="space-y-1.5">
                        <Label htmlFor="imp-tags">Add tags to everyone in this import</Label>
                        <Input id="imp-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="imported, 2026-list" />
                    </div>
                    <label className="flex items-start gap-2 text-sm">
                        <Checkbox checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} className="mt-0.5" />
                        <span>These contacts agreed to receive emails from me. Contacts who previously unsubscribed will not be re-added.</span>
                    </label>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={submit} disabled={!parsed?.contacts.length || !consent || busy || parsed.hasEmail === false}>
                        {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TagDialog({ mode, onClose, onSubmit }: { mode: null | 'tag' | 'untag'; onClose: () => void; onSubmit: (tags: string[]) => void }) {
    const [value, setValue] = useState('');
    return (
        <Dialog open={Boolean(mode)} onOpenChange={(v) => !v && onClose()}>
            <DialogContent>
                <DialogHeader><DialogTitle>{mode === 'tag' ? 'Add tags' : 'Remove tags'}</DialogTitle></DialogHeader>
                <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="vip, customer" aria-label="Tags" />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => { onSubmit(value.split(',').map((t) => t.trim()).filter(Boolean)); setValue(''); }} disabled={!value.trim()}>Apply</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SignupFormBuilder({ projectId }: { projectId: string }) {
    const { toast } = useToast();
    const [cfg, setCfg] = useState({
        title: 'Join our newsletter',
        description: 'Get updates and offers. Unsubscribe anytime.',
        button: 'Subscribe',
        tags: 'newsletter',
        form: 'Website signup',
        color: '#4f46e5',
        name: false,
        consent: '',
    });
    const origin = publicApiOrigin();

    const snippet = useMemo(() => {
        const attrs = [
            `src="${origin}/subscribe.js"`,
            `data-project="${projectId}"`,
            cfg.title && `data-title="${cfg.title.replace(/"/g, '&quot;')}"`,
            cfg.description && `data-description="${cfg.description.replace(/"/g, '&quot;')}"`,
            `data-button="${cfg.button.replace(/"/g, '&quot;')}"`,
            cfg.tags && `data-tags="${cfg.tags}"`,
            `data-form="${cfg.form.replace(/"/g, '&quot;')}"`,
            `data-color="${cfg.color}"`,
            cfg.name && 'data-name="true"',
            cfg.consent && `data-consent="${cfg.consent.replace(/"/g, '&quot;')}"`,
        ].filter(Boolean);
        return `<script ${attrs.join('\n        ')}></script>`;
    }, [cfg, origin, projectId]);

    const apiSnippet = `fetch("${origin}/api/v1/public/email/${projectId}/subscribe", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, name, tags: ["${cfg.tags.split(',')[0] || 'newsletter'}"], source: "form", form: "My custom form" })
});`;

    const copy = (text: string) => { navigator.clipboard.writeText(text); toast({ title: 'Copied to clipboard' }); };

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Embeddable signup form</CardTitle>
                    <CardDescription>Paste this where you want the form to appear on your website. New sign-ups appear in Audience with their source and UTM tags.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5"><Label htmlFor="f-title">Heading</Label><Input id="f-title" value={cfg.title} onChange={(e) => setCfg({ ...cfg, title: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label htmlFor="f-button">Button text</Label><Input id="f-button" value={cfg.button} onChange={(e) => setCfg({ ...cfg, button: e.target.value })} /></div>
                    </div>
                    <div className="space-y-1.5"><Label htmlFor="f-desc">Description</Label><Input id="f-desc" value={cfg.description} onChange={(e) => setCfg({ ...cfg, description: e.target.value })} /></div>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5"><Label htmlFor="f-tags">Tags</Label><Input id="f-tags" value={cfg.tags} onChange={(e) => setCfg({ ...cfg, tags: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label htmlFor="f-name">Form name</Label><Input id="f-name" value={cfg.form} onChange={(e) => setCfg({ ...cfg, form: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label htmlFor="f-color">Color</Label><Input id="f-color" type="color" value={cfg.color} onChange={(e) => setCfg({ ...cfg, color: e.target.value })} className="h-10 p-1" /></div>
                    </div>
                    <div className="space-y-1.5"><Label htmlFor="f-consent">Consent text (optional)</Label><Input id="f-consent" value={cfg.consent} onChange={(e) => setCfg({ ...cfg, consent: e.target.value })} placeholder="By subscribing you agree to our privacy policy." /></div>
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={cfg.name} onCheckedChange={(v) => setCfg({ ...cfg, name: Boolean(v) })} /> Ask for name
                    </label>
                </CardContent>
            </Card>
            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base">HTML snippet</CardTitle>
                        <Button size="sm" variant="outline" onClick={() => copy(snippet)}><Copy className="w-3.5 h-3.5 mr-1" />Copy</Button>
                    </CardHeader>
                    <CardContent>
                        <Textarea readOnly value={snippet} rows={9} className="font-mono text-xs" aria-label="Signup form snippet" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base">Or use your own form (API)</CardTitle>
                        <Button size="sm" variant="outline" onClick={() => copy(apiSnippet)}><Copy className="w-3.5 h-3.5 mr-1" />Copy</Button>
                    </CardHeader>
                    <CardContent>
                        <Textarea readOnly value={apiSnippet} rows={6} className="font-mono text-xs" aria-label="API snippet" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
