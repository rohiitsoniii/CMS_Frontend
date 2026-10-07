import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gauge, Loader2, Smartphone, Monitor } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { seoSuiteAPI } from '@/services/growthService';
import { errorMessage } from '@/services/emailMarketingService';

const scoreColor = (n: number | null) => (n === null ? 'text-gray-400' : n >= 90 ? 'text-green-600' : n >= 50 ? 'text-amber-600' : 'text-red-600');
const categoryColor = (c?: string) => (c === 'FAST' ? 'text-green-600' : c === 'AVERAGE' ? 'text-amber-600' : c === 'SLOW' ? 'text-red-600' : 'text-gray-500');

export default function PageSpeedPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [url, setUrl] = useState('');
    const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const run = async () => {
        try {
            setLoading(true);
            const res = await seoSuiteAPI.pageSpeed(projectId!, url || undefined, strategy);
            setResult(res.data.data);
        } catch (err) {
            toast({ title: 'Check failed', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2"><Gauge className="w-7 h-7" />Page speed & Core Web Vitals</h1>
                <p className="text-gray-500 mt-1">Google's PageSpeed Insights for any page on your site. Speed is a ranking factor and affects conversions.</p>
            </div>

            <Card>
                <CardContent className="p-4 flex flex-wrap gap-2">
                    <Input className="flex-1 min-w-[240px]" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Page URL (defaults to your homepage)" aria-label="Page URL" />
                    <div className="flex rounded-md border overflow-hidden">
                        <button type="button" className={`px-3 text-sm flex items-center gap-1 ${strategy === 'mobile' ? 'bg-indigo-600 text-white' : ''}`} onClick={() => setStrategy('mobile')}><Smartphone className="w-4 h-4" />Mobile</button>
                        <button type="button" className={`px-3 text-sm flex items-center gap-1 ${strategy === 'desktop' ? 'bg-indigo-600 text-white' : ''}`} onClick={() => setStrategy('desktop')}><Monitor className="w-4 h-4" />Desktop</button>
                    </div>
                    <Button onClick={run} disabled={loading}>{loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{loading ? 'Testing (up to a minute)…' : 'Run test'}</Button>
                </CardContent>
            </Card>

            {result && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            ['Performance', result.scores.performance],
                            ['SEO', result.scores.seo],
                            ['Accessibility', result.scores.accessibility],
                            ['Best practices', result.scores.bestPractices],
                        ].map(([label, value]) => (
                            <Card key={label as string}>
                                <CardContent className="p-5 text-center">
                                    <p className={`text-4xl font-bold ${scoreColor(value as number | null)}`}>{value ?? '—'}</p>
                                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Real users (last 28 days)</CardTitle>
                                <CardDescription>From Chrome users. Overall: <span className={categoryColor(result.field.overall)}>{result.field.overall || 'not enough traffic'}</span></CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {[
                                    ['Largest Contentful Paint', result.field.lcp, (v: number) => `${(v / 1000).toFixed(1)} s`],
                                    ['Interaction to Next Paint', result.field.inp, (v: number) => `${v} ms`],
                                    ['Cumulative Layout Shift', result.field.cls, (v: number) => (v / 100).toFixed(2)],
                                ].map(([label, m, f]: any) => (
                                    <div key={label} className="flex justify-between">
                                        <span>{label}</span>
                                        <span className={categoryColor(m?.category)}>{m ? f(m.percentile) : '—'}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-base">Lab test</CardTitle><CardDescription>Simulated {result.strategy} load</CardDescription></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {[['Largest Contentful Paint', result.lab.lcp], ['Total Blocking Time', result.lab.tbt], ['Cumulative Layout Shift', result.lab.cls], ['First Contentful Paint', result.lab.fcp], ['Speed Index', result.lab.speedIndex]].map(([label, m]: any) => (
                                    <div key={label} className="flex justify-between">
                                        <span>{label}</span>
                                        <span className={scoreColor(m?.score != null ? Math.round(m.score * 100) : null)}>{m?.value || '—'}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {result.opportunities.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-base">Top improvements</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {result.opportunities.map((o: any) => (
                                    <div key={o.title} className="border-b last:border-0 pb-3 last:pb-0">
                                        <div className="flex justify-between gap-4 text-sm"><span className="font-medium dark:text-white">{o.title}</span><span className="text-amber-600 whitespace-nowrap">{o.savings}</span></div>
                                        <p className="text-xs text-gray-500 mt-0.5">{o.description}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
