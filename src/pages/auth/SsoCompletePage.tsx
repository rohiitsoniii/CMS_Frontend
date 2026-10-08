import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, csrfHeaders } from '@/services/api';
import { MFAChallengeModal } from '@/components/auth/MFAChallengeModal';
import { useAuthStore } from '@/store';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * The API redirects here after Google / Microsoft / GitHub sign-in. The
 * session cookies are already set; load the profile (and run 2FA if on).
 */
export default function SsoCompletePage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [error, setError] = useState<string | null>(params.get('error'));
    const [mfaToken, setMfaToken] = useState<string | null>(null);

    useEffect(() => {
        if (error) return;
        const linked = params.get('linked');
        if (linked) {
            navigate('/dashboard/settings/sso?linked=' + encodeURIComponent(linked), { replace: true });
            return;
        }
        (async () => {
            try {
                const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true, headers: csrfHeaders() });
                const tokens = res.data?.data?.tokens;
                if (!tokens?.accessToken) throw new Error('No session');
                if (params.get('mfa') === '1') {
                    setMfaToken(tokens.accessToken);
                    return;
                }
                const me = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${tokens.accessToken}` }, withCredentials: true });
                setAuth(me.data.data.user, me.data.data.tenant, tokens);
                navigate(params.get('new') ? '/onboarding' : '/dashboard', { replace: true });
            } catch {
                setError('Sign-in could not be completed. Please try again.');
            }
        })();
    }, []);

    const onMfa = async (verified: { accessToken: string; refreshToken: string }) => {
        try {
            const me = await api.get('/auth/me', { headers: { Authorization: `Bearer ${verified.accessToken}` } });
            setAuth(me.data.data.user, me.data.data.tenant, verified);
            navigate('/dashboard', { replace: true });
        } catch {
            setError('2FA verified but your profile could not be loaded.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            {error ? (
                <div className="text-center space-y-4 max-w-sm">
                    <p className="text-red-600">{error}</p>
                    <Button asChild><Link to="/login">Back to sign in</Link></Button>
                </div>
            ) : (
                <p className="flex items-center gap-2 text-gray-600"><Loader2 className="w-5 h-5 animate-spin" />Signing you in…</p>
            )}
            {mfaToken && <MFAChallengeModal tempToken={mfaToken} onSuccess={onMfa} onCancel={() => navigate('/login')} />}
        </div>
    );
}
