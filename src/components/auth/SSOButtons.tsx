import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ssoAPI, SSOProviderId } from '@/services/api';

const LABELS: Record<SSOProviderId, string> = {
    google: 'Continue with Google',
    microsoft: 'Continue with Microsoft',
    github: 'Continue with GitHub',
};

/** Social / enterprise sign-in buttons — only configured providers are shown. */
export function SSOButtons({ onError }: { onError?: (message: string) => void }) {
    const [enabled, setEnabled] = useState<SSOProviderId[]>([]);
    const [busy, setBusy] = useState<SSOProviderId | null>(null);

    useEffect(() => {
        ssoAPI.providers()
            .then((r) => setEnabled((Object.entries(r.data.data) as [SSOProviderId, boolean][]).filter(([, on]) => on).map(([p]) => p)))
            .catch(() => setEnabled([]));
    }, []);

    if (!enabled.length) return null;

    const start = async (p: SSOProviderId) => {
        try {
            setBusy(p);
            const res = await ssoAPI.getLoginUrl(p);
            window.location.href = res.data.data.url;
        } catch (err: any) {
            setBusy(null);
            onError?.(err?.response?.data?.error || 'Could not start sign-in');
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />or<div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            {enabled.map((p) => (
                <Button key={p} type="button" variant="outline" className="w-full" disabled={busy !== null} onClick={() => start(p)}>
                    {busy === p && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {LABELS[p]}
                </Button>
            ))}
        </div>
    );
}
