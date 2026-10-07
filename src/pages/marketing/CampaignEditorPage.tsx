import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Save, Send, Clock, Loader2, Pause, Play, XCircle, Eye, Code2, Type, Users, Sparkles, MousePointerClick, MailOpen, AlertTriangle,
} from 'lucide-react';
import {
    Button, Input, Label, Textarea, Switch, Card, CardHeader, CardTitle, CardContent, CardDescription,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
    Tabs, TabsList, TabsTrigger, TabsContent,
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { emailAPI, Campaign, CampaignStats, Segment, EmailTemplate, errorMessage, CAMPAIGN_STATUS } from '@/services/emailMarketingService';
import { aiAPI } from '@/services/api';

const MERGE_TAGS = ['{{first_name|there}}', '{{name}}', '{{email}}', '{{unsubscribe_url}}'];
const EDITABLE = ['draft', 'scheduled', 'paused'];

export default function CampaignEditorPage() {
    const { projectId, campaignId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [draft, setDraft] = useState<any>(null);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [audience, setAudience] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState<'visual' | 'html'>('visual');
    const [testOpen, setTestOpen] = useState(false);
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [sendOpen, setSendOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiBusy, setAiBusy] = useState(false);
    const dirty = useRef(false);

    const load = async () => {
        try {
            const res = await emailAPI.getCampaign(projectId!, campaignId!);
            const c: Campaign = res.data.data;
            setCampaign(c);
            setDraft({
                name: c.name,
                subject: c.subject,
                previewText: c.previewText || '',
                fromName: c.fromName,
                replyTo: c.replyTo || '',
                htmlContent: c.htmlContent,
                recipientType: c.recipientType,
                segmentId: c.segmentId || '',
                tags: (c.recipientSegment?.tags || []).join(', '),
                customRecipients: (c.customRecipients || []).join('\n'),
                trackOpens: c.trackOpens,
                trackClicks: c.trackClicks,
            });
            dirty.current = false;
        } catch (err) {
            toast({ title: 'Could not load campaign', description: errorMessage(err), variant: 'destructive' });
        }
    };

    useEffect(() => {
        load();
        emailAPI.listSegments(projectId!).then((r) => setSegments(r.data.data)).catch(() => undefined);
        emailAPI.listTemplates(projectId!).then((r) => setTemplates(r.data.data.filter((t: EmailTemplate) => t.category === 'marketing' || t.category === 'transactional'))).catch(() => undefined);
    }, [projectId, campaignId]);

    const payload = useMemo(() => draft && ({
        ...draft,
        segmentId: draft.recipientType === 'segment' ? draft.segmentId : undefined,
        tags: draft.recipientType === 'tags' ? draft.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        customRecipients: draft.recipientType === 'custom' ? draft.customRecipients : [],
    }), [draft]);

    // Live audience size
    useEffect(() => {
        if (!payload) return;
        const t = setTimeout(() => {
            emailAPI.audienceCount(projectId!, {
                recipientType: payload.recipientType, segmentId: payload.segmentId, tags: payload.tags, customRecipients: payload.customRecipients,
            }).then((r) => setAudience(r.data.data.count)).catch(() => setAudience(null));
        }, 400);
        return () => clearTimeout(t);
    }, [payload?.recipientType, payload?.segmentId, draft?.tags, draft?.customRecipients]);

    // Poll while sending
    useEffect(() => {
        if (campaign?.status !== 'sending') return;
        const t = setInterval(load, 8000);
        return () => clearInterval(t);
    }, [campaign?.status]);

    const set = (patch: any) => { dirty.current = true; setDraft((d: any) => ({ ...d, ...patch })); };

    const save = async (silent = false) => {
        try {
            setSaving(true);
            const res = await emailAPI.updateCampaign(projectId!, campaignId!, payload);
            setCampaign(res.data.data);
            dirty.current = false;
            if (!silent) toast({ title: 'Campaign saved' });
            return true;
        } catch (err) {
            toast({ title: 'Could not save', description: errorMessage(err), variant: 'destructive' });
            return false;
        } finally {
            setSaving(false);
        }
    };

    const action = async (fn: () => Promise<any>, success: string) => {
        try {
            setBusy(true);
            if (dirty.current && campaign && EDITABLE.includes(campaign.status) && !(await save(true))) return;
            const res = await fn();
            toast({ title: res?.data?.message || success });
            await load();
        } catch (err) {
            toast({ title: 'Action failed', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setBusy(false);
        }
    };

    const generateWithAI = async () => {
        if (!aiTopic.trim()) return;
        try {
            setAiBusy(true);
            const res = await aiAPI.generateEmail(aiTopic, 'newsletter');
            const d = res.data.data;
            set({
                subject: d.subject || draft.subject,
                previewText: d.preheader || draft.previewText,
                htmlContent: d.html || d.body || d.content || draft.htmlContent,
            });
            toast({ title: 'Draft generated', description: 'Review and edit before sending.' });
        } catch (err) {
            toast({ title: 'AI generation failed', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setAiBusy(false);
        }
    };

    if (!campaign || !draft) {
        return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
    }

    const editable = EDITABLE.includes(campaign.status);
    const showReport = ['sending', 'sent', 'paused', 'cancelled', 'failed'].includes(campaign.status) && campaign.stats.totalRecipients > 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Button variant="ghost" size="icon" asChild aria-label="Back to campaigns">
                        <Link to={`/dashboard/project/${projectId}/email/campaigns`}><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold dark:text-white truncate">{campaign.name}</h1>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${CAMPAIGN_STATUS[campaign.status]}`}>{campaign.status}</span>
                        {campaign.status === 'scheduled' && campaign.scheduledFor && <span className="text-xs text-gray-500 ml-2">for {new Date(campaign.scheduledFor).toLocaleString()}</span>}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {editable && <Button variant="outline" onClick={() => save()} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save</Button>}
                    <Button variant="outline" onClick={() => setTestOpen(true)}><Eye className="w-4 h-4 mr-2" />Send test</Button>
                    {campaign.status === 'draft' && <Button variant="outline" onClick={() => setScheduleOpen(true)}><Clock className="w-4 h-4 mr-2" />Schedule</Button>}
                    {campaign.status === 'scheduled' && <Button variant="outline" disabled={busy} onClick={() => action(() => emailAPI.unscheduleCampaign(projectId!, campaignId!), 'Unscheduled')}>Unschedule</Button>}
                    {['draft', 'scheduled'].includes(campaign.status) && <Button onClick={() => setSendOpen(true)} disabled={busy}><Send className="w-4 h-4 mr-2" />Send now</Button>}
                    {campaign.status === 'sending' && <Button variant="outline" disabled={busy} onClick={() => action(() => emailAPI.pauseCampaign(projectId!, campaignId!), 'Paused')}><Pause className="w-4 h-4 mr-2" />Pause</Button>}
                    {campaign.status === 'paused' && <Button disabled={busy} onClick={() => action(() => emailAPI.resumeCampaign(projectId!, campaignId!), 'Resumed')}><Play className="w-4 h-4 mr-2" />Resume</Button>}
                    {['sending', 'paused', 'scheduled'].includes(campaign.status) && (
                        <Button variant="outline" className="text-red-600" disabled={busy} onClick={() => { if (confirm('Cancel this campaign? Unsent emails will not be sent.')) action(() => emailAPI.cancelCampaign(projectId!, campaignId!), 'Cancelled'); }}>
                            <XCircle className="w-4 h-4 mr-2" />Cancel
                        </Button>
                    )}
                </div>
            </div>

            {campaign.lastError && (
                <Alert variant="destructive"><AlertTriangle className="w-4 h-4" /><AlertDescription>{campaign.lastError}</AlertDescription></Alert>
            )}

            {showReport && <CampaignReport projectId={projectId!} campaignId={campaignId!} campaign={campaign} />}

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Message</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="subject">Subject line</Label>
                                <Input id="subject" disabled={!editable} value={draft.subject} onChange={(e) => set({ subject: e.target.value })} />
                                <p className="text-xs text-gray-500">{draft.subject.length} characters — aim for under 50.</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="preview">Preview text</Label>
                                <Input id="preview" disabled={!editable} value={draft.previewText} onChange={(e) => set({ previewText: e.target.value })} placeholder="Shown next to the subject in most inboxes" />
                            </div>
                            {editable && (
                                <div className="flex flex-wrap gap-2 items-end rounded-lg border border-dashed p-3">
                                    <div className="flex-1 min-w-[220px] space-y-1.5">
                                        <Label htmlFor="ai-topic" className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />Write with AI</Label>
                                        <Input id="ai-topic" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. Spring sale: 20% off all plans until Friday" />
                                    </div>
                                    <Button variant="outline" onClick={generateWithAI} disabled={aiBusy || !aiTopic.trim()}>
                                        {aiBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Generate
                                    </Button>
                                    {templates.length > 0 && (
                                        <Select onValueChange={(id) => { const t = templates.find((x) => x._id === id); if (t) set({ htmlContent: t.body, subject: draft.subject || t.subject }); }}>
                                            <SelectTrigger className="w-48" aria-label="Start from template"><SelectValue placeholder="Start from template" /></SelectTrigger>
                                            <SelectContent>{templates.map((t) => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}
                                </div>
                            )}
                            <Tabs value={mode} onValueChange={(v) => setMode(v as 'visual' | 'html')}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <TabsList>
                                        <TabsTrigger value="visual"><Type className="w-4 h-4 mr-1" />Visual</TabsTrigger>
                                        <TabsTrigger value="html"><Code2 className="w-4 h-4 mr-1" />HTML</TabsTrigger>
                                    </TabsList>
                                    {editable && (
                                        <div className="flex flex-wrap gap-1">
                                            {MERGE_TAGS.map((tag) => (
                                                <button key={tag} type="button" className="text-[11px] font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
                                                    onClick={() => { navigator.clipboard.writeText(tag); toast({ title: `Copied ${tag}` }); }}>
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <TabsContent value="visual">
                                    {editable
                                        ? <RichTextEditor value={draft.htmlContent} onChange={(v) => set({ htmlContent: v })} />
                                        : <EmailPreview html={draft.htmlContent} />}
                                </TabsContent>
                                <TabsContent value="html">
                                    <Textarea disabled={!editable} rows={18} className="font-mono text-xs" value={draft.htmlContent} onChange={(e) => set({ htmlContent: e.target.value })} aria-label="Email HTML" />
                                </TabsContent>
                            </Tabs>
                            <p className="text-xs text-gray-500">An unsubscribe link and your postal address are added automatically if you don't include <code>{'{{unsubscribe_url}}'}</code>.</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Audience</CardTitle>
                            <CardDescription>{audience === null ? '…' : `${audience.toLocaleString()} recipients`}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select disabled={!editable} value={draft.recipientType} onValueChange={(v) => set({ recipientType: v })}>
                                <SelectTrigger aria-label="Audience type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All subscribed contacts</SelectItem>
                                    <SelectItem value="segment">A saved segment</SelectItem>
                                    <SelectItem value="tags">Contacts with tags</SelectItem>
                                    <SelectItem value="custom">A list of emails</SelectItem>
                                </SelectContent>
                            </Select>
                            {draft.recipientType === 'segment' && (
                                segments.length ? (
                                    <Select disabled={!editable} value={draft.segmentId} onValueChange={(v) => set({ segmentId: v })}>
                                        <SelectTrigger aria-label="Segment"><SelectValue placeholder="Choose a segment" /></SelectTrigger>
                                        <SelectContent>{segments.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                ) : <p className="text-sm text-gray-500">No segments yet. <Link className="text-indigo-600" to={`/dashboard/project/${projectId}/email/segments`}>Create one</Link></p>
                            )}
                            {draft.recipientType === 'tags' && <Input disabled={!editable} value={draft.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="newsletter, customer" aria-label="Tags" />}
                            {draft.recipientType === 'custom' && (
                                <>
                                    <Textarea disabled={!editable} rows={5} value={draft.customRecipients} onChange={(e) => set({ customRecipients: e.target.value })} placeholder="one@example.com&#10;two@example.com" aria-label="Recipient emails" />
                                    <p className="text-xs text-gray-500">People who unsubscribed are always skipped.</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Sender & tracking</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1.5"><Label htmlFor="from-name">From name</Label><Input id="from-name" disabled={!editable} value={draft.fromName} onChange={(e) => set({ fromName: e.target.value })} /></div>
                            <div className="space-y-1.5"><Label htmlFor="reply">Reply-to</Label><Input id="reply" type="email" disabled={!editable} value={draft.replyTo} onChange={(e) => set({ replyTo: e.target.value })} /></div>
                            <div className="flex items-center gap-2"><Switch id="t-open" disabled={!editable} checked={draft.trackOpens} onCheckedChange={(v) => set({ trackOpens: v })} /><Label htmlFor="t-open">Track opens</Label></div>
                            <div className="flex items-center gap-2"><Switch id="t-click" disabled={!editable} checked={draft.trackClicks} onCheckedChange={(v) => set({ trackClicks: v })} /><Label htmlFor="t-click">Track link clicks</Label></div>
                            <p className="text-xs text-gray-500">Sending account: <Link className="text-indigo-600" to={`/dashboard/project/${projectId}/email/settings`}>Email settings</Link></p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <TestDialog open={testOpen} onOpenChange={setTestOpen} onSend={(to) => action(() => emailAPI.testCampaign(projectId!, campaignId!, to), 'Test sent')} />

            <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <ScheduleDialog onSchedule={(when) => { setScheduleOpen(false); action(() => emailAPI.scheduleCampaign(projectId!, campaignId!, when), 'Scheduled'); }} onCancel={() => setScheduleOpen(false)} />
            </Dialog>

            <Dialog open={sendOpen} onOpenChange={setSendOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send now?</DialogTitle>
                        <DialogDescription>
                            “{draft.subject}” will be sent to {audience === null ? 'your audience' : `${audience.toLocaleString()} contacts`}. This can't be undone, but you can pause it while sending.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button>
                        <Button disabled={busy} onClick={() => { setSendOpen(false); action(() => emailAPI.sendCampaign(projectId!, campaignId!), 'Sending started'); }}>
                            <Send className="w-4 h-4 mr-2" />Send
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {!editable && campaign.status === 'sent' && (
                <div className="text-center">
                    <Button variant="outline" onClick={async () => {
                        const res = await emailAPI.duplicateCampaign(projectId!, campaignId!);
                        navigate(`/dashboard/project/${projectId}/email/campaigns/${res.data.data._id}`);
                    }}>Reuse this campaign</Button>
                </div>
            )}
        </div>
    );
}

function EmailPreview({ html }: { html: string }) {
    return (
        <iframe
            title="Email preview"
            sandbox=""
            srcDoc={`<!doctype html><html><body style="margin:0;padding:16px;font-family:Arial,sans-serif">${html}</body></html>`}
            className="w-full h-[480px] rounded-lg border bg-white"
        />
    );
}

function TestDialog({ open, onOpenChange, onSend }: { open: boolean; onOpenChange: (v: boolean) => void; onSend: (to: string) => void }) {
    const [to, setTo] = useState('');
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send a test</DialogTitle>
                    <DialogDescription>Up to 5 addresses, comma separated. Merge tags use sample values.</DialogDescription>
                </DialogHeader>
                <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="you@example.com" aria-label="Test recipients" />
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button disabled={!to.trim()} onClick={() => { onSend(to); onOpenChange(false); }}><Send className="w-4 h-4 mr-2" />Send test</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ScheduleDialog({ onSchedule, onCancel }: { onSchedule: (iso: string) => void; onCancel: () => void }) {
    const defaultValue = useMemo(() => {
        const d = new Date(Date.now() + 24 * 3600_000);
        d.setMinutes(0, 0, 0);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
    }, []);
    const [value, setValue] = useState(defaultValue);
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Schedule campaign</DialogTitle>
                <DialogDescription>Time is in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}).</DialogDescription>
            </DialogHeader>
            <Input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} aria-label="Send time" />
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSchedule(new Date(value).toISOString())}><Clock className="w-4 h-4 mr-2" />Schedule</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function CampaignReport({ projectId, campaignId, campaign }: { projectId: string; campaignId: string; campaign: Campaign }) {
    const [stats, setStats] = useState<CampaignStats | null>(null);
    const [recipients, setRecipients] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        emailAPI.campaignStats(projectId, campaignId).then((r) => setStats(r.data.data)).catch(() => undefined);
    }, [projectId, campaignId, campaign.stats.sent, campaign.stats.opened, campaign.stats.clicked]);

    useEffect(() => {
        emailAPI.campaignRecipients(projectId, campaignId, filter === 'all' ? {} : { status: filter })
            .then((r) => setRecipients(r.data.data)).catch(() => undefined);
    }, [projectId, campaignId, filter, campaign.stats.sent]);

    if (!stats) return null;
    const progress = stats.totalRecipients ? Math.round(((stats.sent + stats.failed) / stats.totalRecipients) * 100) : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Report</CardTitle>
                {campaign.status === 'sending' && <CardDescription>Sending… {progress}% ({stats.pending.toLocaleString()} left)</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: 'Delivered', value: stats.delivered.toLocaleString(), sub: `${stats.deliveryRate}%`, icon: Send },
                        { label: 'Opened', value: stats.opened.toLocaleString(), sub: `${stats.openRate}%`, icon: MailOpen },
                        { label: 'Clicked', value: stats.clicked.toLocaleString(), sub: `${stats.clickRate}%`, icon: MousePointerClick },
                        { label: 'Unsubscribed', value: stats.unsubscribed.toLocaleString(), sub: `${stats.unsubscribeRate}%`, icon: XCircle },
                        { label: 'Failed', value: stats.failed.toLocaleString(), sub: '', icon: AlertTriangle },
                    ].map((s) => (
                        <div key={s.label} className="rounded-lg border p-3">
                            <p className="text-xs text-gray-500 flex items-center gap-1"><s.icon className="w-3.5 h-3.5" />{s.label}</p>
                            <p className="text-xl font-semibold dark:text-white">{s.value}</p>
                            {s.sub && <p className="text-xs text-gray-500">{s.sub}</p>}
                        </div>
                    ))}
                </div>
                {stats.topLinks.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-2">Top links</p>
                        <div className="space-y-1">
                            {stats.topLinks.map((l) => (
                                <div key={l.url} className="flex justify-between gap-4 text-sm">
                                    <span className="truncate text-gray-600" title={l.url}>{l.url}</span>
                                    <span className="whitespace-nowrap">{l.uniqueClicks} people · {l.clicks} clicks</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Recipients</p>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-36 h-8" aria-label="Recipient filter"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {['all', 'sent', 'opened', 'clicked', 'failed', 'pending', 'skipped'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="max-h-72 overflow-auto border rounded-lg">
                        <Table>
                            <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Opens</TableHead><TableHead className="text-right">Clicks</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {recipients.map((r) => (
                                    <TableRow key={r._id}>
                                        <TableCell className="text-sm">{r.email}{r.error && <span className="block text-xs text-red-600 truncate max-w-xs" title={r.error}>{r.error}</span>}</TableCell>
                                        <TableCell className="text-sm">{r.status}</TableCell>
                                        <TableCell className="text-right text-sm">{r.openCount}</TableCell>
                                        <TableCell className="text-right text-sm">{r.clickCount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
