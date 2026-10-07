import { useEffect, useState } from 'react';
import { Sparkles, KeyRound, CheckCircle2, AlertTriangle, Loader2, Trash2, Zap, Gauge } from 'lucide-react';
import {
    Button, Input, Label, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent,
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { aiSettingsAPI, AIConfig, AIProviderPreset, AIUsage } from '@/services/growthService';
import { errorMessage } from '@/services/emailMarketingService';

const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));

export default function AISettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState<Record<string, AIProviderPreset>>({});
    const [config, setConfig] = useState<AIConfig | null>(null);
    const [platformAvailable, setPlatformAvailable] = useState(false);
    const [fee, setFee] = useState(0);
    const [usage, setUsage] = useState<AIUsage | null>(null);
    const [form, setForm] = useState({ provider: 'openai', apiKey: '', baseURL: '', defaultModel: '', embeddingModel: '' });
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const [s, u] = await Promise.all([aiSettingsAPI.get(), aiSettingsAPI.usage()]);
            const d = s.data.data;
            setProviders(d.providers);
            setConfig(d.config);
            setPlatformAvailable(d.platformAvailable);
            setFee(d.byokMonthlyFeeUsd);
            setUsage(u.data.data);
            if (d.config) {
                setForm({
                    provider: d.config.provider,
                    apiKey: '',
                    baseURL: d.config.baseURL || '',
                    defaultModel: d.config.defaultModel || '',
                    embeddingModel: d.config.embeddingModel || '',
                });
            }
        } catch (err) {
            toast({ title: 'Could not load AI settings', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    const save = async () => {
        try {
            setSaving(true);
            await aiSettingsAPI.save({ ...form, apiKey: form.apiKey || undefined });
            toast({ title: 'Connected', description: 'AI features now run on your own key.' });
            load();
        } catch (err) {
            toast({ title: 'Could not connect', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const test = async () => {
        try {
            setTesting(true);
            const res = await aiSettingsAPI.test();
            toast({ title: 'Connection works', description: `Model: ${res.data.data.model}` });
            load();
        } catch (err) {
            toast({ title: 'Connection failed', description: errorMessage(err), variant: 'destructive' });
            load();
        } finally {
            setTesting(false);
        }
    };

    const remove = async () => {
        if (!confirm('Remove your AI key? AI features will use platform credits again.')) return;
        await aiSettingsAPI.remove();
        setForm({ provider: 'openai', apiKey: '', baseURL: '', defaultModel: '', embeddingModel: '' });
        load();
    };

    if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

    const preset = providers[form.provider];
    const needsBaseUrl = form.provider === 'custom' || form.provider === 'ollama';
    const keyOptional = form.provider === 'ollama';
    const usedPct = usage ? Math.min(100, Math.round((usage.platformTokens / Math.max(1, usage.platformAllowance)) * 100)) : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold dark:text-white">AI settings</h1>
                <p className="text-gray-500 mt-1">AI writing, SEO suggestions, translation and chatbots. Use the included credits, or bring your own key for unlimited usage.</p>
            </div>

            {usage && (
                <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2"><Gauge className="w-4 h-4" />Included credits · {usage.plan} plan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Progress value={usedPct} aria-label="Platform credit usage" />
                            <p className="text-sm text-gray-600">{fmt(usage.platformTokens)} of {fmt(usage.platformAllowance)} tokens used in {usage.month}</p>
                            {usage.byok.active && <p className="text-xs text-gray-500">Not used while your own key is connected.</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2"><KeyRound className="w-4 h-4" />Your own key</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {usage.byok.active ? (
                                <>
                                    <p className="text-2xl font-semibold dark:text-white">{fmt(usage.byokTokens)} <span className="text-sm font-normal text-gray-500">tokens this month</span></p>
                                    <p className="text-xs text-gray-500">Billed by {providers[usage.byok.provider!]?.label || usage.byok.provider} directly. Platform fee: ${usage.byok.monthlyFeeUsd}/month.</p>
                                </>
                            ) : <p className="text-sm text-gray-500">Not connected. Connect a key below to remove credit limits.</p>}
                        </CardContent>
                    </Card>
                </div>
            )}

            {!config && !platformAvailable && (
                <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertTitle>AI is not available yet</AlertTitle>
                    <AlertDescription>This installation has no platform AI key. Connect your own provider below to use AI features.</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" />Bring your own key</CardTitle>
                            <CardDescription>Your key is encrypted and only used for your workspace. We check it with a tiny test request before saving.</CardDescription>
                        </div>
                        {config && (config.isVerified
                            ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />Connected · ••••{config.keyLast4}</Badge>
                            : <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Check failed</Badge>)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(providers).map(([key, p]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setForm({ ...form, provider: key, baseURL: '', defaultModel: '', embeddingModel: '' })}
                                className={`text-left rounded-lg border-2 px-3 py-2 text-sm transition ${form.provider === key ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                            >
                                <span className="font-medium dark:text-white">{p.label}</span>
                            </button>
                        ))}
                    </div>
                    {preset?.keyHint && <p className="text-xs text-gray-500">{preset.keyHint}</p>}
                    <div className="space-y-1.5">
                        <Label htmlFor="ai-key">API key{keyOptional && ' (optional)'}</Label>
                        <Input
                            id="ai-key"
                            type="password"
                            autoComplete="off"
                            value={form.apiKey}
                            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                            placeholder={config && config.provider === form.provider ? `•••• ${config.keyLast4} (unchanged)` : 'sk-…'}
                        />
                    </div>
                    {needsBaseUrl && (
                        <div className="space-y-1.5">
                            <Label htmlFor="ai-base">Base URL</Label>
                            <Input id="ai-base" value={form.baseURL} onChange={(e) => setForm({ ...form, baseURL: e.target.value })} placeholder={preset?.baseURL || 'https://your-endpoint/v1'} />
                        </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="ai-model">Model</Label>
                            <Input id="ai-model" value={form.defaultModel} onChange={(e) => setForm({ ...form, defaultModel: e.target.value })} placeholder={preset?.defaultModel || 'model name'} />
                        </div>
                        {form.provider !== 'anthropic' && (
                            <div className="space-y-1.5">
                                <Label htmlFor="ai-embed">Embedding model (chatbot search)</Label>
                                <Input id="ai-embed" value={form.embeddingModel} onChange={(e) => setForm({ ...form, embeddingModel: e.target.value })} placeholder={preset?.embeddingModel || 'embedding model'} />
                            </div>
                        )}
                    </div>
                    {form.provider === 'anthropic' && <p className="text-xs text-gray-500">Claude has no embeddings API; chatbot search embeddings use platform credits (a tiny amount).</p>}
                    {config?.lastError && <p className="text-sm text-red-600 break-words">{config.lastError}</p>}
                    <div className="flex flex-wrap gap-2 justify-between pt-2">
                        <div className="flex gap-2">
                            {config && <Button variant="outline" onClick={test} disabled={testing}>{testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}Test connection</Button>}
                            {config && <Button variant="ghost" className="text-red-600" onClick={remove}><Trash2 className="w-4 h-4 mr-2" />Remove key</Button>}
                        </div>
                        <Button onClick={save} disabled={saving || (!form.apiKey && !keyOptional && !(config && config.provider === form.provider))}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Verify & save
                        </Button>
                    </div>
                    {fee > 0 && !config && <p className="text-xs text-gray-500 text-right">Using your own key costs ${fee}/month instead of plan credits.</p>}
                </CardContent>
            </Card>

            {usage && usage.byFeature.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="text-base">Usage this month by feature</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Feature</TableHead><TableHead>Key</TableHead><TableHead className="text-right">Requests</TableHead><TableHead className="text-right">Tokens</TableHead><TableHead className="text-right">Errors</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {usage.byFeature.map((f, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-mono text-xs">{f.feature}</TableCell>
                                        <TableCell><Badge variant="secondary">{f.keySource === 'byok' ? 'your key' : 'credits'}</Badge></TableCell>
                                        <TableCell className="text-right">{f.requests}</TableCell>
                                        <TableCell className="text-right">{fmt(f.tokens)}</TableCell>
                                        <TableCell className="text-right">{f.errors || ''}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
