import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { ssoAPI, SSOProviderId } from '@/services/api';

const PROVIDERS: { id: SSOProviderId; name: string; desc: string; env: string }[] = [
    { id: 'google', name: 'Google', desc: 'Google accounts and Google Workspace', env: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET' },
    { id: 'microsoft', name: 'Microsoft', desc: 'Microsoft 365, Outlook and Entra ID (Azure AD)', env: 'MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET (MICROSOFT_TENANT_ID optional)' },
    { id: 'github', name: 'GitHub', desc: 'GitHub accounts — handy for developer teams', env: 'GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET' },
];

export const SSOConfigPage = () => {
    const { toast } = useToast();
    const [params] = useSearchParams();
    const [status, setStatus] = useState<Record<string, any> | null>(null);
    const [busy, setBusy] = useState<string | null>(null);

    const load = () => ssoAPI.getStatus().then((r) => setStatus(r.data.data)).catch(() => setStatus({}));
    useEffect(() => {
        load();
        if (params.get('linked')) toast({ title: `${params.get('linked')} account linked` });
    }, []);

    const link = async (p: SSOProviderId) => {
        try {
            setBusy(p);
            window.location.href = (await ssoAPI.getLinkUrl(p)).data.data.url;
        } catch (err: any) {
            setBusy(null);
            toast({ title: 'Could not start linking', description: err?.response?.data?.error, variant: 'destructive' });
        }
    };

    const unlink = async () => {
        await ssoAPI.unlink();
        toast({ title: 'Sign-in provider unlinked' });
        load();
    };

    if (!status) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2"><KeyRound className="w-7 h-7" />Single sign-on</h1>
                <p className="text-gray-500 mt-1">Sign in with an existing work account. Linking also lets you sign in even if your email changes.</p>
            </div>
            {PROVIDERS.map((p) => {
                const enabled = Boolean(status[p.id]);
                const linked = status.linkedProvider === p.id;
                return (
                    <Card key={p.id}>
                        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {p.name}
                                    {linked && <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />Linked</Badge>}
                                    {!enabled && <Badge variant="secondary">Not configured</Badge>}
                                </CardTitle>
                                <CardDescription>{p.desc}</CardDescription>
                            </div>
                            {linked ? (
                                <Button variant="outline" onClick={unlink}>Unlink</Button>
                            ) : (
                                <Button onClick={() => link(p.id)} disabled={!enabled || busy !== null}>
                                    {busy === p.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Link {p.name}
                                </Button>
                            )}
                        </CardHeader>
                        {!enabled && (
                            <CardContent className="pt-0 text-xs text-gray-500">
                                Your administrator can enable it by setting <code>{p.env}</code> on the server, with the redirect URI
                                <code className="break-all"> {'<API_URL>'}/api/v1/sso/{p.id}/callback</code>.
                            </CardContent>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};

export default SSOConfigPage;
