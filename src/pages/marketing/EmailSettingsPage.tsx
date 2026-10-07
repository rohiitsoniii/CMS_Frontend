import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Server, ShieldCheck, Send, AlertTriangle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { Button, Input, Label, Switch, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { emailAPI, EmailSettings, SmtpPreset, errorMessage } from '@/services/emailMarketingService';

const PRESET_LABELS: Record<string, string> = {
    gmail: 'Gmail / Google Workspace',
    outlook: 'Outlook / Microsoft 365',
    sendgrid: 'SendGrid',
    resend: 'Resend',
    ses: 'Amazon SES',
    mailgun: 'Mailgun',
    brevo: 'Brevo (Sendinblue)',
    zoho: 'Zoho Mail',
    custom: 'Other SMTP server',
};

export default function EmailSettingsPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [presets, setPresets] = useState<Record<string, SmtpPreset>>({});
    const [platformConfigured, setPlatformConfigured] = useState(false);
    const [saved, setSaved] = useState<EmailSettings | null>(null);
    const [testTo, setTestTo] = useState('');

    const [form, setForm] = useState({
        provider: 'system' as 'system' | 'custom',
        preset: 'gmail',
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        fromName: '',
        fromEmail: '',
        replyTo: '',
        physicalAddress: '',
        doubleOptIn: false,
    });

    const load = async () => {
        try {
            setLoading(true);
            const res = await emailAPI.getSettings(projectId!);
            const { settings, presets, platformConfigured } = res.data.data;
            setPresets(presets);
            setPlatformConfigured(platformConfigured);
            setSaved(settings);
            if (settings) {
                setForm((f) => ({
                    ...f,
                    provider: settings.provider,
                    preset: settings.preset || 'custom',
                    host: settings.smtp?.host || '',
                    port: settings.smtp?.port || 587,
                    secure: settings.smtp?.secure || false,
                    user: settings.smtp?.auth?.user || '',
                    pass: '',
                    fromName: settings.fromName || '',
                    fromEmail: settings.fromEmail || '',
                    replyTo: settings.replyTo || '',
                    physicalAddress: settings.physicalAddress || '',
                    doubleOptIn: settings.doubleOptIn || false,
                }));
            }
        } catch (err) {
            toast({ title: 'Could not load email settings', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [projectId]);

    const applyPreset = (key: string) => {
        const p = presets[key];
        setForm((f) => ({
            ...f,
            preset: key,
            host: p?.host || f.host,
            port: p?.port || f.port,
            secure: p?.secure ?? f.secure,
            user: key === 'sendgrid' ? 'apikey' : key === 'resend' ? 'resend' : f.user,
        }));
    };

    const save = async () => {
        try {
            setSaving(true);
            const payload: any = {
                provider: form.provider,
                preset: form.preset,
                fromName: form.fromName,
                fromEmail: form.fromEmail,
                replyTo: form.replyTo,
                physicalAddress: form.physicalAddress,
                doubleOptIn: form.doubleOptIn,
            };
            if (form.provider === 'custom') {
                payload.smtp = { host: form.host, port: Number(form.port), secure: form.secure, user: form.user, pass: form.pass || undefined };
            }
            const res = await emailAPI.updateSettings(projectId!, payload);
            setSaved(res.data.data);
            setForm((f) => ({ ...f, pass: '' }));
            toast({ title: 'Email settings saved', description: form.provider === 'custom' ? 'Send a test email to verify your server.' : undefined });
        } catch (err) {
            toast({ title: 'Could not save', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const sendTest = async () => {
        if (!testTo) return;
        try {
            setTesting(true);
            const res = await emailAPI.testSettings(projectId!, testTo);
            toast({ title: res.data.message });
            load();
        } catch (err) {
            toast({ title: 'Test failed', description: errorMessage(err), variant: 'destructive' });
            load();
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
    }

    const usingOwn = form.provider === 'custom';
    const limits = saved?.limits;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold dark:text-white">Email settings</h1>
                <p className="text-gray-500 mt-1">Choose how this project sends email — campaigns, signup confirmations and your site users' account emails.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setForm({ ...form, provider: 'system' })}
                    className={`text-left rounded-xl border-2 p-5 transition ${!usingOwn ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                >
                    <Mail className="w-5 h-5 text-indigo-600 mb-2" />
                    <p className="font-semibold dark:text-white">Platform mail server</p>
                    <p className="text-sm text-gray-500 mt-1">Nothing to set up. Includes a monthly sending allowance based on your plan.</p>
                </button>
                <button
                    type="button"
                    onClick={() => { setForm({ ...form, provider: 'custom' }); if (!form.host) applyPreset(form.preset); }}
                    className={`text-left rounded-xl border-2 p-5 transition ${usingOwn ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                >
                    <Server className="w-5 h-5 text-indigo-600 mb-2" />
                    <p className="font-semibold dark:text-white">Your own mail server (SMTP)</p>
                    <p className="text-sm text-gray-500 mt-1">Send from your domain through Gmail, SendGrid, Resend, SES and others. No platform sending limits.</p>
                </button>
            </div>

            {!usingOwn && (
                <Alert>
                    <Info className="w-4 h-4" />
                    <AlertTitle>Platform allowance</AlertTitle>
                    <AlertDescription>
                        {!platformConfigured
                            ? 'The platform mail server is not configured on this installation — emails are logged instead of sent. Connect your own SMTP server to send real email.'
                            : limits
                                ? `${limits.currentMonthlyCount.toLocaleString()} of ${limits.monthlyLimit.toLocaleString()} marketing emails used this month (${limits.dailyLimit.toLocaleString()} per day). Replies go to your sender email.`
                                : 'Your plan includes a monthly allowance of marketing emails. Replies go to your sender email.'}
                    </AlertDescription>
                </Alert>
            )}

            {usingOwn && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <CardTitle>SMTP connection</CardTitle>
                                <CardDescription>Your password is encrypted and never shown again.</CardDescription>
                            </div>
                            {saved?.provider === 'custom' && (
                                saved.isVerified
                                    ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>
                                    : <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Not verified</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Provider</Label>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(presets).map((key) => (
                                    <Button key={key} type="button" size="sm" variant={form.preset === key ? 'default' : 'outline'} onClick={() => applyPreset(key)}>
                                        {PRESET_LABELS[key] || key}
                                    </Button>
                                ))}
                            </div>
                            {presets[form.preset]?.hint && <p className="text-xs text-gray-500">{presets[form.preset].hint}</p>}
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2 space-y-1.5">
                                <Label htmlFor="smtp-host">Host</Label>
                                <Input id="smtp-host" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="smtp.example.com" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="smtp-port">Port</Label>
                                <Input id="smtp-port" type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value), secure: Number(e.target.value) === 465 })} />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="smtp-user">Username</Label>
                                <Input id="smtp-user" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} autoComplete="off" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="smtp-pass">Password / API key</Label>
                                <Input
                                    id="smtp-pass"
                                    type="password"
                                    value={form.pass}
                                    onChange={(e) => setForm({ ...form, pass: e.target.value })}
                                    placeholder={saved?.smtp?.auth?.hasPassword ? '•••••••• (unchanged)' : ''}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch id="smtp-secure" checked={form.secure} onCheckedChange={(v) => setForm({ ...form, secure: v })} />
                            <Label htmlFor="smtp-secure">Use SSL/TLS (port 465)</Label>
                        </div>
                        {saved?.lastError && (
                            <Alert variant="destructive">
                                <AlertTriangle className="w-4 h-4" />
                                <AlertTitle>Last test failed</AlertTitle>
                                <AlertDescription className="break-words">{saved.lastError}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Sender</CardTitle>
                    <CardDescription>How your emails appear in the inbox.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="from-name">From name</Label>
                            <Input id="from-name" value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} placeholder="Acme Store" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="from-email">{usingOwn ? 'From email' : 'Reply-to email'}</Label>
                            <Input id="from-email" type="email" value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} placeholder="hello@acme.com" />
                            {!usingOwn && <p className="text-xs text-gray-500">The platform sends from its own address; replies come to this one.</p>}
                        </div>
                    </div>
                    {usingOwn && (
                        <div className="space-y-1.5">
                            <Label htmlFor="reply-to">Reply-to (optional)</Label>
                            <Input id="reply-to" type="email" value={form.replyTo} onChange={(e) => setForm({ ...form, replyTo: e.target.value })} />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <Label htmlFor="address">Postal address (shown in campaign footers)</Label>
                        <Textarea id="address" rows={2} value={form.physicalAddress} onChange={(e) => setForm({ ...form, physicalAddress: e.target.value })} placeholder="Acme Inc, 123 Main St, City, Country" />
                        <p className="text-xs text-gray-500">Required by anti-spam laws (CAN-SPAM) for marketing email.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" />Sign-up confirmation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-3">
                        <Switch id="doi" checked={form.doubleOptIn} onCheckedChange={(v) => setForm({ ...form, doubleOptIn: v })} />
                        <div>
                            <Label htmlFor="doi">Double opt-in</Label>
                            <p className="text-sm text-gray-500">New sign-ups from forms and the chatbot must click a confirmation link before they receive campaigns. Recommended for the EU (GDPR) and better deliverability.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-2">
                    <Input className="w-64" type="email" placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} aria-label="Test email address" />
                    <Button variant="outline" onClick={sendTest} disabled={testing || !testTo || !saved}>
                        {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Send test
                    </Button>
                </div>
                <Button onClick={save} disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save settings
                </Button>
            </div>
            {!saved && <p className="text-xs text-gray-500 text-right">Save your settings before sending a test.</p>}
        </div>
    );
}
