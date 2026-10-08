import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Loader2, Copy, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { Button, Input, Label, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { briefAPI, GeoCheck } from '@/services/growthService';
import { errorMessage } from '@/services/emailMarketingService';

interface Brief {
    keyword: string;
    searchIntent?: string;
    titles?: string[];
    metaDescription?: string;
    summary?: string;
    outline?: { heading: string; points: string[] }[];
    questions?: string[];
    entities?: string[];
    statistics?: string[];
    wordCount?: number;
    faq?: { question: string; answer: string }[];
}

export default function ContentBriefPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const [keyword, setKeyword] = useState('');
    const [audience, setAudience] = useState('');
    const [brief, setBrief] = useState<Brief | null>(null);
    const [loading, setLoading] = useState(false);
    const [draft, setDraft] = useState('');
    const [title, setTitle] = useState('');
    const [score, setScore] = useState<{ score: number; grade: string; checks: GeoCheck[]; wordCount: number } | null>(null);

    const generate = async () => {
        if (!keyword.trim()) return;
        try {
            setLoading(true);
            const res = await briefAPI.create(projectId!, keyword, audience);
            setBrief(res.data.data);
            if (!title && res.data.data.titles?.[0]) setTitle(res.data.data.titles[0]);
        } catch (err) {
            toast({ title: 'Could not create brief', description: errorMessage(err), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // Live GEO score of the draft
    useEffect(() => {
        if (!draft.trim()) { setScore(null); return; }
        const t = setTimeout(() => {
            const html = /<[a-z][\s\S]*>/i.test(draft) ? draft : draft.split(/\n{2,}/).map((p) => (p.startsWith('## ') ? `<h2>${p.slice(3)}</h2>` : `<p>${p}</p>`)).join('');
            briefAPI.analyze(projectId!, { html, title, metaDescription: brief?.metaDescription }).then((r) => setScore(r.data.data)).catch(() => undefined);
        }, 700);
        return () => clearTimeout(t);
    }, [draft, title]);

    const outlineText = brief ? [
        brief.summary ? `${brief.summary}\n` : '',
        ...(brief.outline || []).map((o) => `## ${o.heading}\n${o.points.map((p) => `- ${p}`).join('\n')}`),
        brief.faq?.length ? `## Frequently asked questions\n${brief.faq.map((f) => `**${f.question}**\n${f.answer}`).join('\n\n')}` : '',
    ].filter(Boolean).join('\n\n') : '';

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2"><FileText className="w-7 h-7" />Content brief</h1>
                <p className="text-gray-500 mt-1">Plan a page that ranks in Google and gets cited by AI answers — then write it with a live GEO score.</p>
            </div>

            <Card>
                <CardContent className="p-4 grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div className="space-y-1.5"><Label htmlFor="kw">Topic or keyword</Label><Input id="kw" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="best CRM for small business" onKeyDown={(e) => e.key === 'Enter' && generate()} /></div>
                    <div className="space-y-1.5"><Label htmlFor="aud">Audience (optional)</Label><Input id="aud" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="founders of 5–20 person companies" /></div>
                    <Button onClick={generate} disabled={loading || !keyword.trim()}>{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Create brief</Button>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {brief ? (
                        <>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center justify-between gap-2">Brief: {brief.keyword}{brief.searchIntent && <Badge variant="secondary">{brief.searchIntent}</Badge>}</CardTitle>
                                    {brief.wordCount && <CardDescription>Target length ~{brief.wordCount.toLocaleString()} words</CardDescription>}
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    {brief.titles?.length ? (
                                        <div><p className="font-medium mb-1">Title ideas</p>{brief.titles.map((t) => (
                                            <button key={t} type="button" onClick={() => setTitle(t)} className="block text-left w-full rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800">{t} <span className="text-xs text-gray-400">({t.length})</span></button>
                                        ))}</div>
                                    ) : null}
                                    {brief.metaDescription && <div><p className="font-medium mb-1">Meta description</p><p className="text-gray-600">{brief.metaDescription}</p></div>}
                                    {brief.summary && <div><p className="font-medium mb-1">Open with this answer</p><p className="text-gray-600">{brief.summary}</p></div>}
                                    {brief.outline?.length ? (
                                        <div><p className="font-medium mb-1">Outline</p>{brief.outline.map((o) => (
                                            <div key={o.heading} className="mb-2"><p className="font-medium text-indigo-700 dark:text-indigo-300">{o.heading}</p><ul className="list-disc pl-5 text-gray-600">{o.points.map((p) => <li key={p}>{p}</li>)}</ul></div>
                                        ))}</div>
                                    ) : null}
                                    {brief.questions?.length ? <div><p className="font-medium mb-1">Questions to answer</p><ul className="list-disc pl-5 text-gray-600">{brief.questions.map((q) => <li key={q}>{q}</li>)}</ul></div> : null}
                                    {brief.entities?.length ? <div><p className="font-medium mb-1">Mention</p><div className="flex flex-wrap gap-1">{brief.entities.map((e) => <Badge key={e} variant="secondary">{e}</Badge>)}</div></div> : null}
                                    {brief.statistics?.length ? <div><p className="font-medium mb-1">Back it up with</p><ul className="list-disc pl-5 text-gray-600">{brief.statistics.map((s) => <li key={s}>{s}</li>)}</ul></div> : null}
                                </CardContent>
                            </Card>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(outlineText); toast({ title: 'Outline copied' }); }}><Copy className="w-3.5 h-3.5 mr-1" />Copy outline</Button>
                                <Button variant="outline" size="sm" onClick={() => setDraft(outlineText)}>Start draft from outline</Button>
                            </div>
                        </>
                    ) : (
                        <Card><CardContent className="py-16 text-center text-sm text-gray-500">Enter a topic to get titles, an outline, questions to answer and an FAQ.</CardContent></Card>
                    )}
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-base">Draft</CardTitle>
                            {score && <span className={`text-2xl font-bold ${score.score >= 80 ? 'text-green-600' : score.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{score.score}<span className="text-sm text-gray-500 font-normal">/100 GEO</span></span>}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" aria-label="Title" />
                            <Textarea rows={16} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write or paste your article. Use '## ' for headings, or paste HTML." aria-label="Draft" />
                            {score && <p className="text-xs text-gray-500">{score.wordCount} words</p>}
                        </CardContent>
                    </Card>
                    {score && (
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                {score.checks.map((c) => (
                                    <div key={c.id} className="flex items-start gap-2 text-sm">
                                        {c.passed ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                                        <div><span className="dark:text-white">{c.label}</span> <span className="text-gray-500">— {c.detail}</span>{!c.passed && c.fix && <p className="text-xs text-gray-600">{c.fix}</p>}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
