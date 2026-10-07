import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Plus, Pencil, Trash2, Send, Loader2 } from 'lucide-react';
import {
    Button, Input, Label, Textarea, Card, CardContent, Badge,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { emailAPI, EmailTemplate, errorMessage } from '@/services/emailMarketingService';

const STARTER_BODY = `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#111827">
  <h1 style="font-size:24px">Hi {{first_name|there}},</h1>
  <p>Write your message here.</p>
  <p><a href="https://example.com" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none">Call to action</a></p>
</div>`;

export function EmailTemplatesPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<EmailTemplate> | null>(null);
    const [saving, setSaving] = useState(false);
    const [testTo, setTestTo] = useState('');

    const load = async () => {
        try {
            setLoading(true);
            setTemplates((await emailAPI.listTemplates(projectId!)).data.data);
        } catch (err) {
            toast({ title: 'Could not load templates', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [projectId]);

    const save = async () => {
        if (!editing) return;
        try {
            setSaving(true);
            const data = { name: editing.name, subject: editing.subject, body: editing.body, category: editing.category, isActive: editing.isActive ?? true };
            if (editing._id) await emailAPI.updateTemplate(projectId!, editing._id, data);
            else await emailAPI.createTemplate(projectId!, data);
            toast({ title: 'Template saved' });
            setEditing(null);
            load();
        } catch (err) {
            toast({ title: 'Could not save template', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const sendTest = async () => {
        if (!editing?._id || !testTo) return;
        try {
            await emailAPI.testTemplate(projectId!, editing._id, testTo);
            toast({ title: `Test sent to ${testTo}` });
        } catch (err) {
            toast({ title: 'Test failed', description: errorMessage(err), variant: 'destructive' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Email templates</h1>
                    <p className="text-gray-500 mt-1">Reusable designs for campaigns and automated emails. Use merge tags like <code>{'{{first_name}}'}</code>.</p>
                </div>
                <Button onClick={() => setEditing({ name: '', subject: '', body: STARTER_BODY, category: 'marketing', isActive: true })}>
                    <Plus className="w-4 h-4 mr-2" />New template
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : templates.length === 0 ? (
                <Card><CardContent className="py-16 text-center text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-3 text-gray-300" />No templates yet.
                </CardContent></Card>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((t) => (
                        <Card key={t._id} className="overflow-hidden">
                            <iframe title={`${t.name} preview`} sandbox="" srcDoc={t.body} className="w-full h-40 border-b bg-white pointer-events-none" />
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate dark:text-white">{t.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{t.subject}</p>
                                    </div>
                                    <Badge variant="secondary">{t.category}</Badge>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="outline" onClick={() => setEditing(t)}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
                                    <Button size="sm" variant="ghost" aria-label={`Delete ${t.name}`} onClick={async () => {
                                        if (!confirm(`Delete "${t.name}"?`)) return;
                                        await emailAPI.deleteTemplate(projectId!, t._id).catch((e) => toast({ title: errorMessage(e), variant: 'destructive' }));
                                        load();
                                    }}><Trash2 className="w-3.5 h-3.5" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
                {editing && (
                    <DialogContent className="max-w-5xl">
                        <DialogHeader>
                            <DialogTitle>{editing._id ? 'Edit template' : 'New template'}</DialogTitle>
                            <DialogDescription>Merge tags: {'{{first_name}}'}, {'{{name}}'}, {'{{email}}'}, {'{{custom.field}}'}, {'{{unsubscribe_url}}'}</DialogDescription>
                        </DialogHeader>
                        <div className="grid sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5"><Label htmlFor="t-name">Name</Label><Input id="t-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                            <div className="space-y-1.5"><Label htmlFor="t-subject">Subject</Label><Input id="t-subject" value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} /></div>
                            <div className="space-y-1.5">
                                <Label>Category</Label>
                                <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as EmailTemplate['category'] })}>
                                    <SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="transactional">Transactional</SelectItem>
                                        <SelectItem value="support">Support</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-3">
                            <Textarea rows={18} className="font-mono text-xs" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} aria-label="Template HTML" />
                            <iframe title="Template preview" sandbox="" srcDoc={editing.body} className="w-full h-full min-h-[360px] rounded-md border bg-white" />
                        </div>
                        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
                            {editing._id ? (
                                <div className="flex gap-2">
                                    <Input className="w-56" type="email" placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} aria-label="Test address" />
                                    <Button variant="outline" onClick={sendTest} disabled={!testTo}><Send className="w-4 h-4 mr-2" />Test</Button>
                                </div>
                            ) : <span />}
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                                <Button onClick={save} disabled={saving || !editing.name || !editing.subject || !editing.body}>
                                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}

export default EmailTemplatesPage;
