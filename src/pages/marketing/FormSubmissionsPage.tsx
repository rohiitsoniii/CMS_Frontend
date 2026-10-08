import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Archive, ShieldAlert, Trash2, Mail, ExternalLink } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { formsAPI, FormDef, FormSubmissionRow } from '@/services/growthService';
import { errorMessage } from '@/services/emailMarketingService';

const TABS = [
    { value: '', label: 'Inbox' },
    { value: 'new', label: 'Unread' },
    { value: 'archived', label: 'Archived' },
    { value: 'spam', label: 'Spam' },
];

export default function FormSubmissionsPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [forms, setForms] = useState<FormDef[]>([]);
    const [formId, setFormId] = useState('');
    const [status, setStatus] = useState('');
    const [items, setItems] = useState<FormSubmissionRow[]>([]);
    const [selected, setSelected] = useState<FormSubmissionRow | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { formsAPI.list(projectId!).then((r) => setForms(r.data.data)).catch(() => undefined); }, [projectId]);

    const load = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (formId) params.formId = formId;
            if (status) params.status = status;
            setItems((await formsAPI.submissions(projectId!, params)).data.data);
        } catch (err) {
            toast({ title: 'Could not load submissions', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [projectId, formId, status]);

    const open = async (s: FormSubmissionRow) => {
        setSelected(s);
        if (s.status === 'new') {
            await formsAPI.setSubmissionStatus(projectId!, s._id, 'read').catch(() => undefined);
            setItems((list) => list.map((x) => (x._id === s._id ? { ...x, status: 'read' } : x)));
        }
    };

    const act = async (s: FormSubmissionRow, next: string) => {
        await formsAPI.setSubmissionStatus(projectId!, s._id, next);
        setSelected(null);
        load();
    };

    const formName = (s: FormSubmissionRow) => (typeof s.formId === 'object' ? s.formId?.name : forms.find((f) => f._id === s.formId)?.name) || 'Form';
    const fieldLabel = (s: FormSubmissionRow, key: string) => {
        const id = typeof s.formId === 'object' ? s.formId?._id : s.formId;
        return forms.find((f) => f._id === id)?.fields.find((f) => f.key === key)?.label || key;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild aria-label="Back to forms"><Link to={`/dashboard/project/${projectId}/forms`}><ArrowLeft className="w-4 h-4" /></Link></Button>
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Form submissions</h1>
                    <p className="text-gray-500 text-sm">Everything people sent through your website forms.</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <div className="flex rounded-md border overflow-hidden">
                    {TABS.map((t) => (
                        <button key={t.value} type="button" onClick={() => setStatus(t.value)} className={`px-3 py-1.5 text-sm ${status === t.value ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{t.label}</button>
                    ))}
                </div>
                <select className="h-9 rounded-md border bg-transparent px-2 text-sm" value={formId} onChange={(e) => setFormId(e.target.value)} aria-label="Filter by form">
                    <option value="">All forms</option>
                    {forms.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
            </div>

            <div className="grid lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-2 overflow-hidden">
                    {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" /></div> : items.length === 0 ? (
                        <CardContent className="py-12 text-center text-sm text-gray-500">Nothing here yet.</CardContent>
                    ) : (
                        <ul className="divide-y max-h-[70vh] overflow-y-auto">
                            {items.map((s) => (
                                <li key={s._id}>
                                    <button type="button" onClick={() => open(s)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${selected?._id === s._id ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''}`}>
                                        <div className="flex justify-between gap-2">
                                            <span className={`truncate ${s.status === 'new' ? 'font-semibold dark:text-white' : ''}`}>{s.email || Object.values(s.data)[0] || 'Submission'}</span>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{formName(s)} · {Object.values(s.data).slice(1, 3).join(' · ')}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card className="lg:col-span-3">
                    <CardContent className="p-5">
                        {!selected ? <p className="text-sm text-gray-500 py-12 text-center">Select a submission to read it.</p> : (
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <Badge variant="secondary">{formName(selected)}</Badge>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {selected.email && <Button size="sm" variant="outline" asChild><a href={`mailto:${selected.email}`}><Mail className="w-3.5 h-3.5 mr-1" />Reply</a></Button>}
                                        <Button size="sm" variant="outline" onClick={() => act(selected, 'archived')}><Archive className="w-3.5 h-3.5 mr-1" />Archive</Button>
                                        <Button size="sm" variant="outline" onClick={() => act(selected, 'spam')}><ShieldAlert className="w-3.5 h-3.5 mr-1" />Spam</Button>
                                        <Button size="icon" variant="ghost" aria-label="Delete submission" onClick={async () => { await formsAPI.deleteSubmission(projectId!, selected._id); setSelected(null); load(); }}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                                <dl className="space-y-3">
                                    {Object.entries(selected.data).map(([k, v]) => (
                                        <div key={k}>
                                            <dt className="text-xs uppercase tracking-wide text-gray-500">{fieldLabel(selected, k)}</dt>
                                            <dd className="text-sm whitespace-pre-wrap break-words dark:text-white">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                                {selected.meta?.page && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 break-all"><ExternalLink className="w-3 h-3 shrink-0" />{selected.meta.page}</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
