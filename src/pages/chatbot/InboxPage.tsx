import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MessagesSquare, Send, Loader2, UserCheck, Bot, XCircle, Mail } from 'lucide-react';
import { Button, Textarea, Card, CardContent, Badge, Checkbox } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { inboxAPI, InboxConversation, ChatMessage } from '@/services/growthService';
import { errorMessage } from '@/services/emailMarketingService';
import { cn } from '@/lib/utils';

const FILTERS = [
    { value: 'open', label: 'Needs a human' },
    { value: 'bot', label: 'Bot only' },
    { value: 'closed', label: 'Closed' },
    { value: 'all', label: 'All' },
];

const STATUS_STYLE: Record<string, string> = {
    requested: 'bg-amber-100 text-amber-800',
    human: 'bg-green-100 text-green-700',
    bot: 'bg-gray-100 text-gray-600',
    closed: 'bg-gray-100 text-gray-500',
};

export default function InboxPage() {
    const { projectId } = useParams();
    const [params, setParams] = useSearchParams();
    const { toast } = useToast();
    const [filter, setFilter] = useState('open');
    const [list, setList] = useState<InboxConversation[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [activeId, setActiveId] = useState<string | null>(params.get('c'));
    const [conv, setConv] = useState<any>(null);
    const [reply, setReply] = useState('');
    const [emailCopy, setEmailCopy] = useState(false);
    const [sending, setSending] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    const loadList = () => inboxAPI.list(projectId!, filter).then((r) => { setList(r.data.data.conversations); setCounts(r.data.data.counts); }).catch(() => undefined);
    const loadConv = (id: string) => inboxAPI.get(projectId!, id).then((r) => setConv(r.data.data)).catch((err) => toast({ title: errorMessage(err), variant: 'destructive' }));

    useEffect(() => { loadList(); }, [projectId, filter]);
    useEffect(() => { if (activeId) loadConv(activeId); }, [activeId]);

    // Live-ish updates
    useEffect(() => {
        const t = setInterval(() => {
            loadList();
            if (activeId) loadConv(activeId);
        }, 5000);
        return () => clearInterval(t);
    }, [projectId, filter, activeId]);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conv?.messages?.length]);

    const open = (id: string) => {
        setActiveId(id);
        setParams({ c: id }, { replace: true });
    };

    const send = async () => {
        if (!reply.trim() || !activeId) return;
        try {
            setSending(true);
            const res = await inboxAPI.reply(projectId!, activeId, reply, emailCopy);
            setConv({ ...conv, ...res.data.data });
            setReply('');
            loadList();
        } catch (err) {
            toast({ title: 'Could not send', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSending(false);
        }
    };

    const setStatus = async (status: 'bot' | 'human' | 'closed') => {
        if (!activeId) return;
        const res = await inboxAPI.setStatus(projectId!, activeId, status);
        setConv({ ...conv, ...res.data.data });
        loadList();
    };

    const waiting = (counts.requested || 0);

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
                        Live chat inbox
                        {waiting > 0 && <Badge className="bg-amber-500 hover:bg-amber-500">{waiting} waiting</Badge>}
                    </h1>
                    <p className="text-gray-500 mt-1">Take over chatbot conversations when visitors ask for a person. The bot stays quiet while you reply.</p>
                </div>
                <div className="flex rounded-md border overflow-hidden">
                    {FILTERS.map((f) => (
                        <button key={f.value} type="button" onClick={() => setFilter(f.value)} className={`px-3 py-1.5 text-sm ${filter === f.value ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{f.label}</button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                <Card className="overflow-hidden">
                    {list.length === 0 ? (
                        <CardContent className="py-12 text-center text-sm text-gray-500">
                            <MessagesSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            {filter === 'open' ? 'No one is waiting. Visitors can ask for a person from the chat widget.' : 'No conversations.'}
                        </CardContent>
                    ) : (
                        <ul className="divide-y max-h-[72vh] overflow-y-auto">
                            {list.map((c) => (
                                <li key={c._id}>
                                    <button type="button" onClick={() => open(c._id)} className={cn('w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800', activeId === c._id && 'bg-indigo-50 dark:bg-indigo-950/30')}>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={cn('truncate', c.unread > 0 && 'font-semibold dark:text-white')}>{c.visitorEmail || 'Website visitor'}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_STYLE[c.status]}`}>{c.status === 'requested' ? 'waiting' : c.status}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{c.preview}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{c.botName} · {new Date(c.lastMessageAt).toLocaleString()}{c.unread > 0 ? ` · ${c.unread} new` : ''}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card className="lg:col-span-2 flex flex-col min-h-[60vh]">
                    {!conv ? (
                        <CardContent className="flex-1 flex items-center justify-center text-sm text-gray-500">Select a conversation.</CardContent>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                                <div>
                                    <p className="font-medium dark:text-white">{conv.visitorEmail || 'Website visitor'}</p>
                                    <p className="text-xs text-gray-500">{conv.botName} · {conv.handoff?.assignedName ? `with ${conv.handoff.assignedName}` : conv.handoff?.status}</p>
                                </div>
                                <div className="flex gap-1">
                                    {conv.handoff?.status !== 'human' && <Button size="sm" onClick={() => setStatus('human')}><UserCheck className="w-3.5 h-3.5 mr-1" />Take over</Button>}
                                    {conv.handoff?.status === 'human' && <Button size="sm" variant="outline" onClick={() => setStatus('bot')}><Bot className="w-3.5 h-3.5 mr-1" />Hand back to bot</Button>}
                                    {conv.handoff?.status !== 'closed' && <Button size="sm" variant="outline" onClick={() => setStatus('closed')}><XCircle className="w-3.5 h-3.5 mr-1" />Close</Button>}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60 dark:bg-gray-900/40 max-h-[55vh]">
                                {(conv.messages as ChatMessage[]).map((m, i) => m.role === 'system' ? (
                                    <p key={i} className="text-center text-xs text-gray-500">{m.content}</p>
                                ) : (
                                    <div key={i} className={cn('flex', m.role === 'user' ? 'justify-start' : 'justify-end')}>
                                        <div className={cn('max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
                                            m.role === 'user' && 'bg-white dark:bg-gray-800 border',
                                            m.role === 'assistant' && 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100',
                                            m.role === 'agent' && 'bg-indigo-600 text-white')}>
                                            {m.role !== 'user' && <p className="text-[10px] opacity-70 mb-0.5">{m.role === 'agent' ? m.agentName || 'Agent' : 'Bot'}</p>}
                                            {m.content}
                                            <p className="text-[10px] opacity-60 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={endRef} />
                            </div>
                            {conv.handoff?.status !== 'closed' && (
                                <div className="border-t p-3 space-y-2">
                                    <Textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply…" aria-label="Reply"
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
                                    <div className="flex items-center justify-between gap-2">
                                        <label className="flex items-center gap-2 text-xs text-gray-600">
                                            <Checkbox checked={emailCopy} onCheckedChange={(v) => setEmailCopy(Boolean(v))} disabled={!conv.visitorEmail} />
                                            <Mail className="w-3.5 h-3.5" />Also email this reply{conv.visitorEmail ? '' : ' (visitor left no email)'}
                                        </label>
                                        <Button onClick={send} disabled={sending || !reply.trim()}>{sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}Send</Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
