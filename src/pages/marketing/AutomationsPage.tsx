import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Workflow, Plus, Loader2, Trash2 } from 'lucide-react';
import { TRIGGERS } from './automationTriggers';
import {
    Button, Card, CardContent, Badge,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Input, Label,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { automationsAPI, Automation } from '@/services/growthService';
import { errorMessage } from '@/services/emailMarketingService';



const TEMPLATES: Record<string, Partial<Automation>> = {
    subscribed: {
        name: 'Welcome series',
        trigger: { type: 'subscribed' },
        steps: [
            { delayMinutes: 0, subject: 'Welcome, {{first_name|friend}}!', htmlContent: '<p>Hi {{first_name|there}},</p><p>Thanks for joining us. Here is what to expect…</p>' },
            { delayMinutes: 60 * 24 * 2, subject: 'Getting the most out of {{custom.product|our product}}', htmlContent: '<p>Here are three tips to get started…</p>' },
            { delayMinutes: 60 * 24 * 5, subject: 'A quick question', htmlContent: '<p>What would you like to see from us? Just hit reply.</p>' },
        ],
    },
    content_published: {
        name: 'New post newsletter',
        trigger: { type: 'content_published', contentTypes: ['blog'], sendMode: 'draft' },
        steps: [{ delayMinutes: 0, subject: 'New: {{post_title}}', htmlContent: '<h2>{{post_title}}</h2><p>{{post_excerpt}}</p><p><a href="{{post_url}}">Read the full post →</a></p>' }],
    },
};

export default function AutomationsPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [items, setItems] = useState<Automation[]>([]);
    const [loading, setLoading] = useState(true);
    const [choose, setChoose] = useState(false);
    const [name, setName] = useState('');

    const load = async () => {
        try {
            setLoading(true);
            setItems((await automationsAPI.list(projectId!)).data.data);
        } catch (err) {
            toast({ title: 'Could not load automations', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [projectId]);

    const create = async (type: keyof typeof TRIGGERS) => {
        try {
            const tpl = TEMPLATES[type] || { name: TRIGGERS[type].label, trigger: { type }, steps: [{ delayMinutes: 0, subject: '', htmlContent: '<p></p>' }] };
            const res = await automationsAPI.create(projectId!, { ...tpl, name: name.trim() || tpl.name } as any);
            navigate(`/dashboard/project/${projectId}/email/automations/${res.data.data._id}`);
        } catch (err) {
            toast({ title: 'Could not create automation', description: errorMessage(err), variant: 'destructive' });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Automations</h1>
                    <p className="text-gray-500 mt-1">Emails that send themselves: welcome series, lead nurturing and new-post newsletters.</p>
                </div>
                <Button onClick={() => setChoose(true)}><Plus className="w-4 h-4 mr-2" />New automation</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : items.length === 0 ? (
                <Card><CardContent className="py-16 text-center text-gray-500">
                    <Workflow className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    No automations yet. Start with a welcome series — it's the highest-performing email most businesses send.
                </CardContent></Card>
            ) : (
                <div className="grid gap-3">
                    {items.map((a) => {
                        const T = TRIGGERS[a.trigger.type];
                        return (
                            <Card key={a._id} className="cursor-pointer hover:border-indigo-300" onClick={() => navigate(`/dashboard/project/${projectId}/email/automations/${a._id}`)}>
                                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600"><T.icon className="w-5 h-5" /></div>
                                        <div className="min-w-0">
                                            <p className="font-semibold dark:text-white">{a.name}</p>
                                            <p className="text-sm text-gray-500">{T.label}{a.trigger.tag ? `: ${a.trigger.tag}` : ''} · {a.steps.length} email{a.steps.length === 1 ? '' : 's'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span>{a.stats.enrolled} enrolled</span>
                                        <span>{a.stats.sent} sent</span>
                                        <Badge className={a.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''} variant={a.status === 'active' ? 'default' : 'secondary'}>{a.status}</Badge>
                                        <Button size="icon" variant="ghost" aria-label={`Delete ${a.name}`} onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!confirm(`Delete "${a.name}"? Contacts in progress will stop receiving it.`)) return;
                                            await automationsAPI.remove(projectId!, a._id);
                                            load();
                                        }}><Trash2 className="w-4 h-4 text-gray-400" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={choose} onOpenChange={setChoose}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>New automation</DialogTitle>
                        <DialogDescription>Choose what starts it. You can edit everything afterwards.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-1.5"><Label htmlFor="a-name">Name (optional)</Label><Input id="a-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                    <div className="grid gap-2">
                        {(Object.keys(TRIGGERS) as (keyof typeof TRIGGERS)[]).map((k) => {
                            const T = TRIGGERS[k];
                            return (
                                <button key={k} type="button" onClick={() => create(k)} className="flex items-start gap-3 text-left rounded-lg border p-3 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20">
                                    <T.icon className="w-5 h-5 text-indigo-600 mt-0.5" />
                                    <span><span className="font-medium dark:text-white block">{T.label}</span><span className="text-sm text-gray-500">{T.hint}</span></span>
                                </button>
                            );
                        })}
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setChoose(false)}>Cancel</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
