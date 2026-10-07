import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, Plus, Trash2, Loader2, Pencil, Users } from 'lucide-react';
import {
    Button, Input, Label, Card, CardContent, Badge,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { emailAPI, Segment, SegmentRule, errorMessage } from '@/services/emailMarketingService';

const FIELD_LABELS: Record<string, string> = {
    email: 'Email', name: 'Name', phone: 'Phone', status: 'Status', source: 'Source', sourceDetail: 'Signup form / page',
    tags: 'Tags', 'utm.source': 'UTM source', 'utm.medium': 'UTM medium', 'utm.campaign': 'UTM campaign',
    subscribedAt: 'Subscribed date', createdAt: 'Added date', confirmedAt: 'Confirmed date', lastEmailSentAt: 'Last email sent',
    lastEmailOpenedAt: 'Last opened', lastLinkClickedAt: 'Last clicked', totalEmailsReceived: 'Emails received',
    totalEmailsOpened: 'Emails opened', totalLinksClicked: 'Links clicked',
};

const DATE_FIELDS = ['subscribedAt', 'createdAt', 'confirmedAt', 'lastEmailSentAt', 'lastEmailOpenedAt', 'lastLinkClickedAt'];
const NUMBER_FIELDS = ['totalEmailsReceived', 'totalEmailsOpened', 'totalLinksClicked'];

function operatorsFor(field: string) {
    if (DATE_FIELDS.includes(field)) return [['within_days', 'in the last N days'], ['older_than_days', 'more than N days ago / never'], ['exists', 'is set'], ['not_exists', 'is not set']];
    if (NUMBER_FIELDS.includes(field)) return [['gte', 'at least'], ['lte', 'at most'], ['equals', 'equals']];
    if (field === 'tags') return [['equals', 'has tag'], ['in', 'has any of (comma list)'], ['not_in', 'has none of'], ['exists', 'has any tag'], ['not_exists', 'has no tags']];
    return [['equals', 'is'], ['not_equals', 'is not'], ['contains', 'contains'], ['starts_with', 'starts with'], ['in', 'is any of (comma list)'], ['exists', 'is set'], ['not_exists', 'is empty']];
}

const needsValue = (op: string) => !['exists', 'not_exists'].includes(op);
const label = (f: string) => FIELD_LABELS[f] || f.replace(/^customFields\./, 'Custom: ');

export default function SegmentsPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Segment> | null>(null);

    const load = async () => {
        try {
            setLoading(true);
            setSegments((await emailAPI.listSegments(projectId!)).data.data);
        } catch (err) {
            toast({ title: 'Could not load segments', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [projectId]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Segments</h1>
                    <p className="text-gray-500 mt-1">Saved audience filters. They update automatically, so a campaign always reaches the right people.</p>
                </div>
                <Button onClick={() => setEditing({ name: '', match: 'all', rules: [{ field: 'tags', operator: 'equals', value: '' }] })}>
                    <Plus className="w-4 h-4 mr-2" />New segment
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : segments.length === 0 ? (
                <Card><CardContent className="py-16 text-center text-gray-500">
                    <Filter className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    No segments yet. Example: “Opened an email in the last 30 days and tagged customer”.
                </CardContent></Card>
            ) : (
                <div className="grid gap-3">
                    {segments.map((s) => (
                        <Card key={s._id}>
                            <CardContent className="p-4 flex flex-wrap items-center gap-4 justify-between">
                                <div className="min-w-0">
                                    <p className="font-semibold dark:text-white">{s.name}</p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {s.rules.map((r) => `${label(r.field)} ${r.operator.replace(/_/g, ' ')}${needsValue(r.operator) ? ` ${r.value}` : ''}`).join(s.match === 'all' ? ' AND ' : ' OR ') || 'Everyone subscribed'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />{s.lastCount ?? '—'}</Badge>
                                    <Button size="icon" variant="ghost" onClick={() => setEditing(s)} aria-label={`Edit ${s.name}`}><Pencil className="w-4 h-4" /></Button>
                                    <Button
                                        size="icon" variant="ghost" aria-label={`Delete ${s.name}`}
                                        onClick={async () => {
                                            if (!confirm(`Delete segment "${s.name}"?`)) return;
                                            try { await emailAPI.deleteSegment(projectId!, s._id); load(); }
                                            catch (err) { toast({ title: 'Could not delete', description: errorMessage(err), variant: 'destructive' }); }
                                        }}
                                    ><Trash2 className="w-4 h-4 text-gray-400" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {editing && <SegmentEditor projectId={projectId!} segment={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
        </div>
    );
}

function SegmentEditor({ projectId, segment, onClose, onSaved }: { projectId: string; segment: Partial<Segment>; onClose: () => void; onSaved: () => void }) {
    const { toast } = useToast();
    const [name, setName] = useState(segment.name || '');
    const [match, setMatch] = useState<'all' | 'any'>(segment.match || 'all');
    const [rules, setRules] = useState<SegmentRule[]>(segment.rules?.length ? segment.rules : [{ field: 'tags', operator: 'equals', value: '' }]);
    const [fields, setFields] = useState<string[]>(Object.keys(FIELD_LABELS));
    const [preview, setPreview] = useState<{ count: number; sample: { email: string }[] } | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => { emailAPI.segmentFields(projectId).then((r) => setFields(r.data.data)).catch(() => undefined); }, [projectId]);

    useEffect(() => {
        const t = setTimeout(async () => {
            const ready = rules.filter((r) => !needsValue(r.operator) || String(r.value ?? '').trim() !== '');
            try {
                const res = await emailAPI.previewSegment(projectId, { match, rules: ready });
                setPreview(res.data.data);
                setPreviewError(null);
            } catch (err) {
                setPreviewError(errorMessage(err));
            }
        }, 400);
        return () => clearTimeout(t);
    }, [rules, match, projectId]);

    const update = (i: number, patch: Partial<SegmentRule>) => setRules(rules.map((r, j) => (j === i ? { ...r, ...patch } : r)));

    const save = async () => {
        try {
            setSaving(true);
            const payload = { name, match, rules: rules.filter((r) => !needsValue(r.operator) || String(r.value ?? '').trim() !== '') };
            if (segment._id) await emailAPI.updateSegment(projectId, segment._id, payload);
            else await emailAPI.createSegment(projectId, payload);
            toast({ title: 'Segment saved' });
            onSaved();
        } catch (err) {
            toast({ title: 'Could not save segment', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{segment._id ? 'Edit segment' : 'New segment'}</DialogTitle>
                    <DialogDescription>Only subscribed contacts are counted and emailed.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="seg-name">Name</Label>
                        <Input id="seg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Engaged customers" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        Contacts matching
                        <Select value={match} onValueChange={(v) => setMatch(v as 'all' | 'any')}>
                            <SelectTrigger className="w-24 h-8" aria-label="Match mode"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="all">all</SelectItem><SelectItem value="any">any</SelectItem></SelectContent>
                        </Select>
                        of these conditions:
                    </div>
                    <div className="space-y-2">
                        {rules.map((r, i) => (
                            <div key={i} className="flex flex-wrap gap-2 items-center">
                                <Select value={r.field} onValueChange={(v) => update(i, { field: v, operator: operatorsFor(v)[0][0], value: '' })}>
                                    <SelectTrigger className="w-48" aria-label="Field"><SelectValue /></SelectTrigger>
                                    <SelectContent>{fields.map((f) => <SelectItem key={f} value={f}>{label(f)}</SelectItem>)}</SelectContent>
                                </Select>
                                <Select value={r.operator} onValueChange={(v) => update(i, { operator: v })}>
                                    <SelectTrigger className="w-56" aria-label="Condition"><SelectValue /></SelectTrigger>
                                    <SelectContent>{operatorsFor(r.field).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                                </Select>
                                {needsValue(r.operator) && (
                                    r.field === 'status' ? (
                                        <Select value={String(r.value || '')} onValueChange={(v) => update(i, { value: v })}>
                                            <SelectTrigger className="flex-1 min-w-[140px]" aria-label="Value"><SelectValue placeholder="Choose" /></SelectTrigger>
                                            <SelectContent>{['subscribed', 'pending', 'unsubscribed', 'bounced'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            className="flex-1 min-w-[140px]"
                                            type={NUMBER_FIELDS.includes(r.field) || ['within_days', 'older_than_days'].includes(r.operator) ? 'number' : 'text'}
                                            value={r.value ?? ''}
                                            onChange={(e) => update(i, { value: e.target.value })}
                                            placeholder={['within_days', 'older_than_days'].includes(r.operator) ? 'days' : 'value'}
                                            aria-label="Value"
                                        />
                                    )
                                )}
                                <Button size="icon" variant="ghost" onClick={() => setRules(rules.filter((_, j) => j !== i))} aria-label="Remove condition"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        ))}
                        <Button size="sm" variant="outline" onClick={() => setRules([...rules, { field: 'tags', operator: 'equals', value: '' }])}>
                            <Plus className="w-3.5 h-3.5 mr-1" />Add condition
                        </Button>
                    </div>
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-sm">
                        {previewError ? <span className="text-red-600">{previewError}</span> : preview ? (
                            <>
                                <span className="font-semibold">{preview.count.toLocaleString()}</span> subscribed contacts match
                                {preview.sample.length > 0 && <span className="text-gray-500"> — e.g. {preview.sample.slice(0, 3).map((s) => s.email).join(', ')}</span>}
                            </>
                        ) : 'Calculating…'}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={save} disabled={!name.trim() || saving || Boolean(previewError)}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save segment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
