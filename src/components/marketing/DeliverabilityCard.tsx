import { useState } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, AlertTriangle, XCircle, Copy, RefreshCw } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { deliverabilityAPI, DnsCheckRow } from '@/services/growthService';
import { errorMessage } from '@/services/emailMarketingService';

const ICON = {
    pass: <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />,
    warn: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    fail: <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
};

/** Sender-domain DNS health + bounce/complaint webhook URL. */
export function DeliverabilityCard({ projectId, usingOwnSmtp }: { projectId: string; usingOwnSmtp: boolean }) {
    const { toast } = useToast();
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<{ domain: string; checks: DnsCheckRow[] } | null>(null);
    const [hookUrl, setHookUrl] = useState<string | null>(null);

    const check = async () => {
        try {
            setChecking(true);
            setResult((await deliverabilityAPI.dns(projectId)).data.data);
        } catch (err) {
            toast({ title: 'DNS check failed', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setChecking(false);
        }
    };

    const getHook = async (rotate = false) => {
        try {
            setHookUrl((await deliverabilityAPI.eventsWebhook(projectId, rotate)).data.data.url);
        } catch (err) {
            toast({ title: errorMessage(err), variant: 'destructive' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" />Deliverability</CardTitle>
                <CardDescription>Keep your emails out of spam. Gmail and Yahoo require SPF, DKIM and DMARC for bulk senders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={check} disabled={checking}>
                        {checking ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}Check sender domain
                    </Button>
                    {result && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Domain: <strong>{result.domain}</strong></p>
                            {result.checks.map((c) => (
                                <div key={c.id} className="flex items-start gap-2 text-sm">
                                    {ICON[c.status]}
                                    <div className="min-w-0">
                                        <p><span className="font-medium uppercase">{c.id}</span> — {c.message}</p>
                                        {c.record && <p className="text-xs text-gray-500 font-mono break-all">{c.record}</p>}
                                        {c.fix && <p className="text-xs text-gray-700 dark:text-gray-300">{c.fix}</p>}
                                    </div>
                                </div>
                            ))}
                            {!usingOwnSmtp && <p className="text-xs text-gray-500">On the platform server, emails are signed for the platform domain; these records matter once you connect your own SMTP.</p>}
                        </div>
                    )}
                </div>

                <div className="space-y-2 border-t pt-4">
                    <p className="text-sm font-medium">Bounce & spam-complaint webhook</p>
                    <p className="text-xs text-gray-500">Paste this URL into your provider's event webhooks (SendGrid, Mailgun, Resend, Amazon SES via SNS, Postmark, Brevo). Bounced and complaining contacts are suppressed automatically.</p>
                    {hookUrl ? (
                        <div className="flex gap-2">
                            <Input readOnly value={hookUrl} className="font-mono text-xs" aria-label="Webhook URL" />
                            <Button size="icon" variant="outline" aria-label="Copy webhook URL" onClick={() => { navigator.clipboard.writeText(hookUrl); toast({ title: 'Copied' }); }}><Copy className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => { if (confirm('Create a new URL? The old one stops working.')) getHook(true); }}>Rotate</Button>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => getHook()}>Show webhook URL</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
