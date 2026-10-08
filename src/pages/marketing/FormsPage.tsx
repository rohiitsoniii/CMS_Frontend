import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClipboardList, Plus, Trash2, Loader2, Pencil, Copy, ArrowUp, ArrowDown, Inbox, Download, Pause, Play } from 'lucide-react';
import {
    Button, Input, Label, Switch, Textarea, Card, CardContent, Badge,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { formsAPI, FormDef, FormField, FormFieldType } from '@/services/growthService';
import { errorMessage, publicApiOrigin } from '@/services/emailMarketingService';

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
    { value: 'text', label: 'Short text' }, { value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' },
    { value: 'textarea', label: 'Long text' }, { value: 'number', label: 'Number' }, { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Single choice' }, { value: 'checkbox', label: 'Checkboxes' }, { value: 'date', label: 'Date' },
    { value: 'url', label: 'Website URL' }, { value: 'consent', label: 'Consent checkbox' }, { value: 'hidden', label: 'Hidden value' },
];

const keyFromLabel = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/^[^a-z]+/, '') || 'field';

export default function FormsPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [forms, setForms] = useState<FormDef[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<FormDef> | null>(null);

    const load = async () => {
        try {
            setLoading(true);
            setForms((await formsAPI.list(projectId!)).data.data);
        } catch (err) {
            toast({ title: 'Could not load forms', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [projectId]);

    const create = async () => {
        try {
            const res = await formsAPI.create(projectId!, { name: 'Contact form' });
            setEditing(res.data.data);
            load();
        } catch (err) {
            toast({ title: 'Could not create form', description: errorMessage(err), variant: 'destructive' });
        }
    };

    const download = async (f: FormDef) => {
        const res = await formsAPI.exportCsv(projectId!, f._id);
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${f.name}-submissions.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Forms</h1>
                    <p className="text-gray-500 mt-1">Contact, quote and survey forms for your website, with an inbox, email alerts and audience sync.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild><Link to={`/dashboard/project/${projectId}/forms/submissions`}><Inbox className="w-4 h-4 mr-2" />Submissions</Link></Button>
                    <Button onClick={create}><Plus className="w-4 h-4 mr-2" />New form</Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : forms.length === 0 ? (
                <Card><CardContent className="py-16 text-center text-gray-500">
                    <ClipboardList className="w-8 h-8 mx-auto mb-3 text-gray-300" />No forms yet. Create one and paste it on your website.
                </CardContent></Card>
            ) : (
                <div className="grid gap-3">
                    {forms.map((f) => (
                        <Card key={f._id}>
                            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold dark:text-white flex items-center gap-2">
                                        {f.name}
                                        {f.status === 'paused' && <Badge variant="secondary">Paused</Badge>}
                                        {(f.unread || 0) > 0 && <Badge className="bg-indigo-600">{f.unread} new</Badge>}
                                    </p>
                                    <p className="text-sm text-gray-500">{f.fields.length} fields · {f.stats.submissions.toLocaleString()} submissions{f.stats.lastSubmissionAt ? ` · last ${new Date(f.stats.lastSubmissionAt).toLocaleDateString()}` : ''}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="outline" onClick={() => setEditing(f)}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
                                    <Button size="icon" variant="ghost" aria-label="Export CSV" onClick={() => download(f)}><Download className="w-4 h-4" /></Button>
                                    <Button size="icon" variant="ghost" aria-label={f.status === 'paused' ? 'Resume form' : 'Pause form'} onClick={async () => {
                                        await formsAPI.update(projectId!, f._id, { status: f.status === 'paused' ? 'active' : 'paused' });
                                        load();
                                    }}>{f.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}</Button>
                                    <Button size="icon" variant="ghost" aria-label="Delete form" onClick={async () => {
                                        if (!confirm(`Delete "${f.name}" and all its submissions?`)) return;
                                        await formsAPI.remove(projectId!, f._id);
                                        load();
                                    }}><Trash2 className="w-4 h-4 text-gray-400" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {editing && <FormEditor projectId={projectId!} form={editing as FormDef} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
        </div>
    );
}

function FormEditor({ projectId, form, onClose, onSaved }: { projectId: string; form: FormDef; onClose: () => void; onSaved: () => void }) {
    const { toast } = useToast();
    const [name, setName] = useState(form.name);
    const [description, setDescription] = useState(form.description || '');
    const [fields, setFields] = useState<FormField[]>(form.fields);
    const [settings, setSettings] = useState({
        ...form.settings,
        notifyEmails: (form.settings.notifyEmails || []).join(', '),
        audienceTags: (form.settings.audienceTags || []).join(', '),
        autoReply: form.settings.autoReply || { enabled: false },
    });
    const [saving, setSaving] = useState(false);

    const setField = (i: number, patch: Partial<FormField>) => setFields(fields.map((f, j) => (j === i ? { ...f, ...patch } : f)));
    const move = (i: number, d: number) => {
        const next = [...fields];
        const [x] = next.splice(i, 1);
        next.splice(i + d, 0, x);
        setFields(next);
    };

    const save = async () => {
        try {
            setSaving(true);
            await formsAPI.update(projectId, form._id, {
                name, description, fields,
                settings: {
                    ...settings,
                    notifyEmails: settings.notifyEmails.split(/[\s,;]+/).filter(Boolean),
                    audienceTags: settings.audienceTags.split(',').map((t) => t.trim()).filter(Boolean),
                } as any,
            });
            toast({ title: 'Form saved' });
            onSaved();
        } catch (err) {
            toast({ title: 'Could not save', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const embed = `<script src="${publicApiOrigin()}/form.js" data-form="${form._id}"></script>`;

    return (
        <Dialog open onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit form</DialogTitle>
                    <DialogDescription>Changes go live on your website as soon as you save.</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="fields">
                    <TabsList>
                        <TabsTrigger value="fields">Fields</TabsTrigger>
                        <TabsTrigger value="after">After submit</TabsTrigger>
                        <TabsTrigger value="embed">Embed</TabsTrigger>
                    </TabsList>
                    <TabsContent value="fields" className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label htmlFor="f-name">Form name</Label><Input id="f-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                            <div className="space-y-1.5"><Label htmlFor="f-submit">Button text</Label><Input id="f-submit" value={settings.submitLabel} onChange={(e) => setSettings({ ...settings, submitLabel: e.target.value })} /></div>
                        </div>
                        <div className="space-y-1.5"><Label htmlFor="f-desc">Intro text (optional)</Label><Input id="f-desc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                        <div className="space-y-2">
                            {fields.map((f, i) => (
                                <div key={i} className="rounded-lg border p-3 space-y-2">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <Input className="flex-1 min-w-[160px]" value={f.label} aria-label="Field label"
                                            onChange={(e) => setField(i, { label: e.target.value, key: f.key && f.key !== keyFromLabel(f.label) ? f.key : keyFromLabel(e.target.value) })} />
                                        <select className="h-10 rounded-md border bg-transparent px-2 text-sm" value={f.type} aria-label="Field type"
                                            onChange={(e) => setField(i, { type: e.target.value as FormFieldType })}>
                                            {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                        <label className="flex items-center gap-1.5 text-sm"><Switch checked={f.required} onCheckedChange={(v) => setField(i, { required: v })} />Required</label>
                                        <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="w-4 h-4" /></Button>
                                        <Button size="icon" variant="ghost" disabled={i === fields.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="w-4 h-4" /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => setFields(fields.filter((_, j) => j !== i))} aria-label="Remove field"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                    {['select', 'radio', 'checkbox'].includes(f.type) && (
                                        <Input value={(f.options || []).join(', ')} placeholder="Options, comma separated" aria-label="Options"
                                            onChange={(e) => setField(i, { options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean) })} />
                                    )}
                                    {f.type === 'hidden' ? (
                                        <Input value={f.defaultValue || ''} placeholder="Value sent with every submission" aria-label="Hidden value" onChange={(e) => setField(i, { defaultValue: e.target.value })} />
                                    ) : f.type !== 'consent' && (
                                        <Input value={f.placeholder || ''} placeholder="Placeholder (optional)" aria-label="Placeholder" onChange={(e) => setField(i, { placeholder: e.target.value })} />
                                    )}
                                    <p className="text-[11px] text-gray-400 font-mono">key: {f.key}</p>
                                </div>
                            ))}
                            <Button size="sm" variant="outline" onClick={() => setFields([...fields, { key: `field_${fields.length + 1}`, label: 'New field', type: 'text', required: false }])}>
                                <Plus className="w-3.5 h-3.5 mr-1" />Add field
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="after" className="space-y-4">
                        <div className="space-y-1.5"><Label htmlFor="f-success">Success message</Label><Input id="f-success" value={settings.successMessage} onChange={(e) => setSettings({ ...settings, successMessage: e.target.value })} /></div>
                        <div className="space-y-1.5"><Label htmlFor="f-redirect">Or redirect to (optional)</Label><Input id="f-redirect" value={settings.redirectUrl || ''} onChange={(e) => setSettings({ ...settings, redirectUrl: e.target.value })} placeholder="https://yoursite.com/thank-you" /></div>
                        <div className="space-y-1.5">
                            <Label htmlFor="f-notify">Email new submissions to</Label>
                            <Input id="f-notify" value={settings.notifyEmails} onChange={(e) => setSettings({ ...settings, notifyEmails: e.target.value })} placeholder="sales@acme.com, you@acme.com" />
                        </div>
                        <div className="rounded-lg border p-3 space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium"><Switch checked={settings.addToAudience} onCheckedChange={(v) => setSettings({ ...settings, addToAudience: v })} />Add the sender to my email audience</label>
                            {settings.addToAudience && <Input value={settings.audienceTags} onChange={(e) => setSettings({ ...settings, audienceTags: e.target.value })} placeholder="Tags, e.g. lead, contact-form" aria-label="Audience tags" />}
                            <p className="text-xs text-gray-500">Needs an email field. Respects double opt-in from Email settings, and can start an automation.</p>
                        </div>
                        <div className="rounded-lg border p-3 space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <Switch checked={settings.autoReply.enabled} onCheckedChange={(v) => setSettings({ ...settings, autoReply: { ...settings.autoReply, enabled: v } })} />Send an automatic reply
                            </label>
                            {settings.autoReply.enabled && (
                                <>
                                    <Input value={settings.autoReply.subject || ''} onChange={(e) => setSettings({ ...settings, autoReply: { ...settings.autoReply, subject: e.target.value } })} placeholder="Thanks for getting in touch" aria-label="Auto-reply subject" />
                                    <Textarea rows={4} value={settings.autoReply.body || ''} onChange={(e) => setSettings({ ...settings, autoReply: { ...settings.autoReply, body: e.target.value } })} placeholder="<p>Hi {{name}}, we'll reply within one business day.</p>" aria-label="Auto-reply body" />
                                    <p className="text-xs text-gray-500">Use field keys as merge tags, e.g. {'{{name}}'}.</p>
                                </>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="embed" className="space-y-3">
                        <p className="text-sm text-gray-600">Paste where the form should appear. It adapts to your page, blocks spam, and reports conversions to Website Analytics.</p>
                        <Textarea readOnly rows={2} className="font-mono text-xs" value={embed} aria-label="Embed code" />
                        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(embed); toast({ title: 'Copied' }); }}><Copy className="w-3.5 h-3.5 mr-1" />Copy</Button>
                        <p className="text-xs text-gray-500">Building your own form? POST JSON to <code className="break-all">{publicApiOrigin()}/api/v1/public/forms/{form._id}/submit</code> using the field keys.</p>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={save} disabled={saving || !name.trim()}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save form</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
