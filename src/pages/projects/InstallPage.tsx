import { Link, useParams } from 'react-router-dom';
import { Copy, Code2, BarChart3, MessageSquare, Mail, ClipboardList, Megaphone, Globe } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Textarea } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { publicApiOrigin } from '@/services/emailMarketingService';

/** Every snippet a customer needs on their website, in one place. */
export default function InstallPage() {
    const { projectId } = useParams();
    const { toast } = useToast();
    const api = publicApiOrigin();
    const base = `/dashboard/project/${projectId}`;

    const blocks = [
        {
            icon: BarChart3, title: 'Website analytics', when: 'Every page, inside <head>',
            code: `<script defer src="${api}/tracker.js" data-project="${projectId}"></script>`,
            link: { to: `${base}/analytics/website`, label: 'View analytics' },
        },
        {
            icon: Megaphone, title: 'Popups & announcement bars', when: 'Every page, before </body>. Create popups as "Popup" or "Banner" content.',
            code: `<script defer src="${api}/popup.js" data-project="${projectId}"></script>`,
            link: { to: `${base}/content/popup`, label: 'Manage popups' },
        },
        {
            icon: Mail, title: 'Newsletter signup form', when: 'Where the form should appear',
            code: `<script src="${api}/subscribe.js" data-project="${projectId}" data-title="Join our newsletter" data-tags="newsletter"></script>`,
            link: { to: `${base}/email/audience`, label: 'Customise form' },
        },
        {
            icon: ClipboardList, title: 'Contact & lead forms', when: 'Where the form should appear (each form has its own code)',
            code: `<script src="${api}/form.js" data-form="FORM_ID"></script>`,
            link: { to: `${base}/forms`, label: 'Build a form' },
        },
        {
            icon: MessageSquare, title: 'AI chatbot', when: 'Every page, before </body> (each bot has its own key)',
            code: `<script src="${api}/widget.js" data-bot="BOT_SLUG" data-key="BOT_KEY" async></script>`,
            link: { to: `${base}/rag-bots`, label: 'Get bot code' },
        },
    ];

    const seo = [
        ['/sitemap.xml', `${api}/api/v1/public/seo/${projectId}/sitemap.xml`],
        ['/robots.txt', `${api}/api/v1/public/seo/${projectId}/robots.txt`],
        ['/llms.txt', `${api}/api/v1/public/seo/${projectId}/llms.txt`],
        ['Page meta (per page)', `${api}/api/v1/public/seo/${projectId}/meta?slug=<slug>`],
        ['Redirects (middleware)', `${api}/api/v1/public/seo/${projectId}/resolve?path=<path>`],
    ];

    const copy = (t: string) => { navigator.clipboard.writeText(t); toast({ title: 'Copied' }); };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2"><Code2 className="w-7 h-7" />Install on your website</h1>
                <p className="text-gray-500 mt-1">Copy these snippets into your site. Each one is optional and works on any website or framework.</p>
            </div>

            {blocks.map((b) => (
                <Card key={b.title}>
                    <CardHeader className="pb-2 flex-row items-start justify-between gap-3 space-y-0">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2"><b.icon className="w-4 h-4 text-indigo-600" />{b.title}</CardTitle>
                            <CardDescription>{b.when}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild><Link to={b.link.to}>{b.link.label}</Link></Button>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        <Textarea readOnly rows={2} className="font-mono text-xs" value={b.code} aria-label={`${b.title} snippet`} />
                        <Button size="icon" variant="outline" onClick={() => copy(b.code)} aria-label={`Copy ${b.title} snippet`}><Copy className="w-4 h-4" /></Button>
                    </CardContent>
                </Card>
            ))}

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-600" />SEO endpoints (headless sites)</CardTitle>
                    <CardDescription>Serve these from your own domain with a rewrite, or fetch them with the SDK (<code>client.seo.*</code>).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5">
                    {seo.map(([label, url]) => (
                        <div key={label} className="flex items-center gap-2">
                            <span className="w-44 text-sm text-gray-500 shrink-0">{label}</span>
                            <code className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 rounded px-2 py-1.5 truncate" title={url}>{url}</code>
                            <Button size="icon" variant="ghost" onClick={() => copy(url)} aria-label={`Copy ${label}`}><Copy className="w-4 h-4" /></Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
