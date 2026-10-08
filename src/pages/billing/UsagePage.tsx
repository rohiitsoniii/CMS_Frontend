import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gauge, Loader2, ArrowUpRight } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
import { Progress } from '@/components/ui/progress';
import { usageAPI, UsageItem } from '@/services/growthService';

const fmt = (n: number, unit: string) => {
    if (unit === 'bytes') {
        if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
        if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
        return `${Math.round(n / 1024)} KB`;
    }
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 10_000) return `${Math.round(n / 1000)}k`;
    return n.toLocaleString();
};

export default function UsagePage() {
    const [data, setData] = useState<{ plan: string; items: UsageItem[]; byok: { aiTokens: number } } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        usageAPI.summary().then((r) => setData(r.data.data)).catch((e) => setError(e?.response?.data?.message || 'Could not load usage'));
    }, []);

    if (error) return <p className="text-red-600">{error}</p>;
    if (!data) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

    const near = data.items.filter((i) => i.limit > 0 && i.used / i.limit >= 0.8);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2"><Gauge className="w-7 h-7" />Usage</h1>
                    <p className="text-gray-500 mt-1">What your workspace has used this month against your <span className="capitalize font-medium">{data.plan}</span> plan.</p>
                </div>
                <Button asChild><Link to="/dashboard/pricing">Upgrade plan<ArrowUpRight className="w-4 h-4 ml-1" /></Link></Button>
            </div>

            {near.length > 0 && (
                <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
                    <CardContent className="p-4 text-sm">
                        You're close to the limit on <strong>{near.map((n) => n.label.toLowerCase()).join(', ')}</strong>. Upgrade to avoid interruptions.
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Plan limits</CardTitle>
                    <CardDescription>Monthly items reset on the 1st.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {data.items.map((i) => {
                        const unlimited = i.limit < 0;
                        const pct = unlimited ? 0 : Math.min(100, Math.round((i.used / Math.max(1, i.limit)) * 100));
                        return (
                            <div key={i.label} className="space-y-1.5">
                                <div className="flex justify-between gap-3 text-sm">
                                    <span className="font-medium dark:text-white">{i.label} {i.period === 'month' && <Badge variant="secondary" className="ml-1 text-[10px]">monthly</Badge>}</span>
                                    <span className="text-gray-600 tabular-nums">{fmt(i.used, i.unit)} / {unlimited ? 'Unlimited' : fmt(i.limit, i.unit)}</span>
                                </div>
                                {!unlimited && <Progress value={pct} className={pct >= 90 ? '[&>div]:bg-red-500' : pct >= 80 ? '[&>div]:bg-amber-500' : ''} aria-label={`${i.label} usage`} />}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {data.byok.aiTokens > 0 && (
                <Card>
                    <CardContent className="p-4 text-sm text-gray-600">
                        {fmt(data.byok.aiTokens, '')} AI tokens this month ran on your own API key (not counted against credits).
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
