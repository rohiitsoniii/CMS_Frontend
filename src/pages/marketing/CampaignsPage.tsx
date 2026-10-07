import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Send, Loader2, Copy, Trash2, Mail, Settings, Users } from 'lucide-react';
import {
    Button, Input, Label, Card, CardContent, Badge,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { emailAPI, Campaign, errorMessage, CAMPAIGN_STATUS } from '@/services/emailMarketingService';


const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : '—');

export default function CampaignsPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [name, setName] = useState('');
    const [creating, setCreating] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            setCampaigns((await emailAPI.listCampaigns(projectId!)).data.data);
        } catch (err) {
            toast({ title: 'Could not load campaigns', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [projectId]);

    // Refresh while something is sending
    useEffect(() => {
        if (!campaigns.some((c) => c.status === 'sending')) return;
        const t = setInterval(load, 10_000);
        return () => clearInterval(t);
    }, [campaigns]);

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            const res = await emailAPI.createCampaign(projectId!, { name });
            navigate(`/dashboard/project/${projectId}/email/campaigns/${res.data.data._id}`);
        } catch (err) {
            toast({ title: 'Could not create campaign', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Email campaigns</h1>
                    <p className="text-gray-500 mt-1">Newsletters, announcements and promotions to your audience.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild><Link to={`/dashboard/project/${projectId}/email/audience`}><Users className="w-4 h-4 mr-2" />Audience</Link></Button>
                    <Button variant="outline" asChild><Link to={`/dashboard/project/${projectId}/email/settings`}><Settings className="w-4 h-4 mr-2" />Settings</Link></Button>
                    <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />New campaign</Button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Recipients</TableHead>
                                <TableHead className="text-right">Open rate</TableHead>
                                <TableHead className="text-right">Click rate</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin inline text-gray-400" /></TableCell></TableRow>
                            ) : campaigns.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-14 text-gray-500">
                                    <Mail className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                    No campaigns yet. Create one to email your audience.
                                </TableCell></TableRow>
                            ) : campaigns.map((c) => (
                                <TableRow key={c._id} className="cursor-pointer" onClick={() => navigate(`/dashboard/project/${projectId}/email/campaigns/${c._id}`)}>
                                    <TableCell>
                                        <div className="font-medium dark:text-white">{c.name}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[320px]">{c.subject}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${CAMPAIGN_STATUS[c.status]}`}>{c.status}</span>
                                        {c.status === 'sending' && c.stats.totalRecipients > 0 && (
                                            <span className="text-xs text-gray-500 ml-2">{Math.round(((c.stats.sent + c.stats.failed) / c.stats.totalRecipients) * 100)}%</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">{c.stats.totalRecipients ? c.stats.totalRecipients.toLocaleString() : '—'}</TableCell>
                                    <TableCell className="text-right">{pct(c.stats.opened, c.stats.delivered)}</TableCell>
                                    <TableCell className="text-right">{pct(c.stats.clicked, c.stats.delivered)}</TableCell>
                                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                                        {c.status === 'scheduled' && c.scheduledFor ? `Scheduled ${new Date(c.scheduledFor).toLocaleString()}` :
                                            c.sentAt ? new Date(c.sentAt).toLocaleDateString() : new Date(c.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <div className="flex">
                                            <Button size="icon" variant="ghost" aria-label="Duplicate" onClick={async () => {
                                                const res = await emailAPI.duplicateCampaign(projectId!, c._id);
                                                navigate(`/dashboard/project/${projectId}/email/campaigns/${res.data.data._id}`);
                                            }}><Copy className="w-4 h-4" /></Button>
                                            {c.status !== 'sending' && (
                                                <Button size="icon" variant="ghost" aria-label="Delete" onClick={async () => {
                                                    if (!confirm(`Delete "${c.name}"?`)) return;
                                                    try { await emailAPI.deleteCampaign(projectId!, c._id); load(); }
                                                    catch (err) { toast({ title: errorMessage(err), variant: 'destructive' }); }
                                                }}><Trash2 className="w-4 h-4 text-gray-400" /></Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <form onSubmit={create}>
                        <DialogHeader><DialogTitle>New campaign</DialogTitle></DialogHeader>
                        <div className="py-4 space-y-1.5">
                            <Label htmlFor="camp-name">Campaign name (internal)</Label>
                            <Input id="camp-name" autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder="March newsletter" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={creating || !name.trim()}>{creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
