import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, Save, Play, Pause, Clock, Mail } from 'lucide-react';
import {
    Button, Input, Label, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge,
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { automationsAPI, formsAPI, Automation, AutomationStep, FormDef } from '@/services/growthService';
import { emailAPI, Segment, errorMessage } from '@/services/emailMarketingService';
import { contentTypeService } from '@/services/contentTypeService';
import { TRIGGERS } from './automationTriggers';

const UNITS = [
    { label: 'minutes', mult: 1 },
    { label: 'hours', mult: 60 },
    { label: 'days', mult: 60 * 24 },
];

function splitDelay(min: number) {
    if (min > 0 && min % (60 * 24) === 0) return { value: min / (60 * 24), unit: 60 * 24 };
    if (min > 0 && min % 60 === 0) return { value: min / 60, unit: 60 };
    return { value: min, unit: 1 };
}

export default function AutomationEditorPage() {
    const { projectId, automationId } = useParams();
    const { toast } = useToast();
    const [a, setA] = useState<Automation | null>(null);
    const [enrollments, setEnrollments] = useState<{ active: number; completed: number; exited: number } | null>(null);
    const [forms, setForms] = useState<FormDef[]>([]);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [types, setTypes] = useState<{ apiId: string; name: string }[]>([]);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const res = await automationsAPI.get(projectId!, automationId!);
            setA({ ...res.data.data.automation, steps: res.data.data.steps });
            setEnrollments(res.data.data.enrollments);
        } catch (err) {
            toast({ title: 'Could not load automation', description: errorMessage(err), variant: 'destructive' });
        }
    };

    useEffect(() => {
        load();
        formsAPI.list(projectId!).then((r) => setForms(r.data.data)).catch(() => undefined);
        emailAPI.listSegments(projectId!).then((r) => setSegments(r.data.data)).catch(() => undefined);
        contentTypeService.getContentTypes(projectId!).then((l: any[]) => setTypes((l || []).map((t: any) => ({ apiId: t.apiId, name: t.name })))).catch(() => undefined);
    }, [projectId, automationId]);

    if (!a) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

    const setStep = (i: number, patch: Partial<AutomationStep>) => setA({ ...a, steps: a.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
    const isNewsletter = a.trigger.type === 'content_published';

    const save = async (status?: Automation['status']) => {
        try {
            setSaving(true);
            const res = await automationsAPI.update(projectId!, a._id, {
                name: a.name, trigger: a.trigger, fromName: a.fromName,
                steps: a.steps.map(({ stats, ...s }) => s),
                ...(status ? { status } : {}),
            });
            setA({ ...res.data.data, steps: res.data.data.steps.map((s: AutomationStep, i: number) => ({ ...s, stats: a.steps[i]?.stats })) });
            toast({ title: status === 'active' ? 'Automation is live' : status === 'paused' ? 'Automation paused' : 'Saved' });
        } catch (err) {
            toast({ title: 'Could not save', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const T = TRIGGERS[a.trigger.type];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Button variant="ghost" size="icon" asChild aria-label="Back"><Link to={`/dashboard/project/${projectId}/email/automations`}><ArrowLeft className="w-4 h-4" /></Link></Button>
                    <Input className="text-xl font-bold border-transparent hover:border-gray-200 focus:border-gray-300 w-auto min-w-[240px]" value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} aria-label="Automation name" />
                    <Badge variant={a.status === 'active' ? 'default' : 'secondary'} className={a.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>{a.status}</Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => save()} disabled={saving}><Save className="w-4 h-4 mr-2" />Save</Button>
                    {a.status === 'active'
                        ? <Button variant="outline" onClick={() => save('paused')} disabled={saving}><Pause className="w-4 h-4 mr-2" />Pause</Button>
                        : <Button onClick={() => save('active')} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}Turn on</Button>}
                </div>
            </div>

            {enrollments && !isNewsletter && (
                <div className="grid grid-cols-3 gap-3">
                    {[['In progress', enrollments.active], ['Completed', enrollments.completed], ['Left early', enrollments.exited]].map(([l, v]) => (
                        <Card key={l as string}><CardContent className="p-3"><p className="text-xs text-gray-500">{l}</p><p className="text-xl font-semibold dark:text-white">{v as number}</p></CardContent></Card>
                    ))}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><T.icon className="w-5 h-5 text-indigo-600" />Trigger: {T.label}</CardTitle>
                    <CardDescription>{T.hint}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {a.trigger.type === 'tag_added' && (
                        <div className="space-y-1.5"><Label htmlFor="t-tag">Tag</Label><Input id="t-tag" value={a.trigger.tag || ''} onChange={(e) => setA({ ...a, trigger: { ...a.trigger, tag: e.target.value } })} placeholder="customer" /></div>
                    )}
                    {a.trigger.type === 'form_submitted' && (
                        <div className="space-y-1.5">
                            <Label>Form</Label>
                            <Select value={a.trigger.formId || ''} onValueChange={(v) => setA({ ...a, trigger: { ...a.trigger, formId: v } })}>
                                <SelectTrigger aria-label="Form"><SelectValue placeholder="Choose a form" /></SelectTrigger>
                                <SelectContent>{forms.map((f) => <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">The form must add submitters to your audience (Forms → After submit).</p>
                        </div>
                    )}
                    {isNewsletter && (
                        <>
                            <div className="space-y-1.5">
                                <Label>When this content is published</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[...new Set(['blog', ...types.map((t) => t.apiId)])].map((t) => {
                                        const on = (a.trigger.contentTypes || []).includes(t);
                                        return (
                                            <button key={t} type="button" onClick={() => setA({ ...a, trigger: { ...a.trigger, contentTypes: on ? (a.trigger.contentTypes || []).filter((x) => x !== t) : [...(a.trigger.contentTypes || []), t] } })}
                                                className={`text-sm px-3 py-1 rounded-full border ${on ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                                {types.find((x) => x.apiId === t)?.name || t}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Send to</Label>
                                    <Select value={a.trigger.segmentId || 'all'} onValueChange={(v) => setA({ ...a, trigger: { ...a.trigger, segmentId: v === 'all' ? undefined : v } })}>
                                        <SelectTrigger aria-label="Audience"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All subscribers</SelectItem>
                                            {segments.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Then</Label>
                                    <Select value={a.trigger.sendMode || 'draft'} onValueChange={(v) => setA({ ...a, trigger: { ...a.trigger, sendMode: v as 'send' | 'draft' } })}>
                                        <SelectTrigger aria-label="Send mode"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Create a draft campaign for me to review</SelectItem>
                                            <SelectItem value="send">Send it automatically</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="space-y-1.5"><Label htmlFor="from">From name (optional)</Label><Input id="from" value={a.fromName || ''} onChange={(e) => setA({ ...a, fromName: e.target.value })} /></div>
                </CardContent>
            </Card>

            {a.steps.map((s, i) => {
                const d = splitDelay(s.delayMinutes);
                return (
                    <div key={i} className="space-y-3">
                        {!isNewsletter && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 pl-2">
                                <Clock className="w-4 h-4" />Wait
                                <Input type="number" min={0} className="w-20 h-8" value={d.value} aria-label="Delay"
                                    onChange={(e) => setStep(i, { delayMinutes: Math.max(0, Number(e.target.value)) * d.unit })} />
                                <select className="h-8 rounded-md border bg-transparent px-2 text-sm" value={d.unit} aria-label="Delay unit"
                                    onChange={(e) => setStep(i, { delayMinutes: d.value * Number(e.target.value) })}>
                                    {UNITS.map((u) => <option key={u.mult} value={u.mult}>{u.label}</option>)}
                                </select>
                                {i === 0 ? 'after the trigger' : 'after the previous email'}
                            </div>
                        )}
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4" />{isNewsletter ? 'Newsletter template' : `Email ${i + 1}`}</CardTitle>
                                <div className="flex items-center gap-3">
                                    {s.stats && <span className="text-xs text-gray-500">{s.stats.sent} sent · {s.stats.opened} opened · {s.stats.clicked} clicked</span>}
                                    {!isNewsletter && a.steps.length > 1 && (
                                        <Button size="icon" variant="ghost" aria-label="Remove email" onClick={() => setA({ ...a, steps: a.steps.filter((_, j) => j !== i) })}><Trash2 className="w-4 h-4" /></Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Input value={s.subject} onChange={(e) => setStep(i, { subject: e.target.value })} placeholder="Subject" aria-label="Subject" />
                                <Input value={s.previewText || ''} onChange={(e) => setStep(i, { previewText: e.target.value })} placeholder="Preview text (optional)" aria-label="Preview text" />
                                <Textarea rows={8} className="font-mono text-xs" value={s.htmlContent} onChange={(e) => setStep(i, { htmlContent: e.target.value })} aria-label="Email HTML" />
                                <p className="text-xs text-gray-500">
                                    {isNewsletter
                                        ? 'Merge tags: {{post_title}}, {{post_url}}, {{post_excerpt}}, {{post_image}} and contact tags like {{first_name}}.'
                                        : 'Merge tags: {{first_name|fallback}}, {{name}}, {{email}}, {{custom.field}}. Unsubscribe link is added automatically.'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                );
            })}
            {!isNewsletter && (
                <Button variant="outline" onClick={() => setA({ ...a, steps: [...a.steps, { delayMinutes: 60 * 24 * 2, subject: '', htmlContent: '<p></p>' }] })}>
                    <Plus className="w-4 h-4 mr-2" />Add email
                </Button>
            )}
        </div>
    );
}
