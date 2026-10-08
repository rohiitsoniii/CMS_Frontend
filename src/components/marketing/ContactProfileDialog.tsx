import { useEffect, useState } from 'react';
import { Loader2, Mail, MailOpen, MousePointerClick, ClipboardList, MessageSquare, UserPlus, UserX, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Badge } from '@/components/ui';
import { contactsAPI } from '@/services/growthService';

const ICONS: Record<string, any> = {
    subscribed: UserPlus,
    email_sent: Mail,
    email_opened: MailOpen,
    email_clicked: MousePointerClick,
    form: ClipboardList,
    chat: MessageSquare,
    unsubscribed: UserX,
};

/** Everything we know about one contact: emails, forms, chats, account, automations. */
export function ContactProfileDialog({ projectId, contactId, onClose }: { projectId: string; contactId: string | null; onClose: () => void }) {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        setData(null);
        if (contactId) contactsAPI.profile(projectId, contactId).then((r) => setData(r.data.data)).catch(() => setData({ error: true }));
    }, [projectId, contactId]);

    const c = data?.contact;

    return (
        <Dialog open={Boolean(contactId)} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {!data ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" /></div>
                ) : data.error ? (
                    <p className="text-sm text-red-600 py-8 text-center">Could not load this contact.</p>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>{c.name || c.email}</DialogTitle>
                            <DialogDescription>{c.name ? c.email : ''} · {c.status} · joined {new Date(c.createdAt).toLocaleDateString()} via {c.source}</DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            {[['Emails', c.totalEmailsReceived], ['Opens', c.totalEmailsOpened], ['Clicks', c.totalLinksClicked]].map(([l, v]) => (
                                <div key={l} className="rounded-lg border p-2"><p className="text-xs text-gray-500">{l}</p><p className="text-lg font-semibold dark:text-white">{v}</p></div>
                            ))}
                        </div>

                        {(c.tags?.length > 0 || Object.keys(c.customFields || {}).length > 0) && (
                            <div className="space-y-2">
                                {c.tags?.length > 0 && <div className="flex flex-wrap gap-1">{c.tags.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>}
                                {Object.entries(c.customFields || {}).map(([k, v]) => (
                                    <p key={k} className="text-sm"><span className="text-gray-500">{k}:</span> {String(v)}</p>
                                ))}
                            </div>
                        )}

                        {data.account && (
                            <div className="rounded-lg border p-3 text-sm flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-600" />
                                Has a website account ({data.account.firstName} {data.account.lastName}, {data.account.status}
                                {data.account.lastLoginAt ? `, last login ${new Date(data.account.lastLoginAt).toLocaleDateString()}` : ''})
                            </div>
                        )}

                        {data.automations?.length > 0 && (
                            <div className="text-sm"><p className="font-medium mb-1">Automations</p>
                                {data.automations.map((a: any, i: number) => <p key={i} className="text-gray-600">{a.name} — {a.status}{a.status === 'active' ? ` (next: email ${a.step + 1})` : ''}</p>)}
                            </div>
                        )}

                        <div>
                            <p className="font-medium text-sm mb-2">Activity</p>
                            <ol className="relative border-l pl-4 space-y-3">
                                {data.timeline.map((t: any, i: number) => {
                                    const Icon = ICONS[t.kind] || Mail;
                                    return (
                                        <li key={i} className="text-sm">
                                            <span className="absolute -left-2 mt-0.5 bg-white dark:bg-gray-900 rounded-full"><Icon className="w-4 h-4 text-indigo-500" /></span>
                                            <p className="dark:text-white break-words">{t.text}</p>
                                            <p className="text-xs text-gray-500">{new Date(t.at).toLocaleString()}</p>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>

                        {data.conversations?.length > 0 && (
                            <div className="text-sm">
                                <p className="font-medium mb-1">Latest chat</p>
                                <div className="rounded-lg border p-3 space-y-1 bg-gray-50 dark:bg-gray-900/40">
                                    {data.conversations[0].messages.map((m: any, i: number) => (
                                        <p key={i}><span className="text-gray-500">{m.role === 'user' ? 'Visitor' : m.role === 'agent' ? 'You' : 'Bot'}:</span> {m.content}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
