import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Globe, 
  FileCode, 
  Sparkles, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Activity,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import { seoAPI } from '@/services/api';
import { SeoDashboardSkeleton } from '@/components/skeletons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SeoDashboardPage() {
    const { projectId } = useParams();

    const { data: overview, isLoading: isOverviewLoading } = useQuery({
        queryKey: ['seo-overview', projectId],
        queryFn: async () => {
            const response = await seoAPI.getOverview(projectId!);
            return response.data.data;
        },
    });

    const { data: keywords, isLoading: isKeywordsLoading } = useQuery({
        queryKey: ['seo-keywords', projectId],
        queryFn: async () => {
            const response = await seoAPI.getKeywords(projectId!);
            return response.data.data;
        },
    });

    const isLoading = isOverviewLoading || isKeywordsLoading;

    if (isLoading) return <SeoDashboardSkeleton />;

    const topKeywords = keywords?.filter((k: any) => k.currentRank > 0 && k.currentRank <= 10).length || 0;

    const stats = [
        { label: 'Avg Health Score', value: `${Math.round(overview?.avgScore || 0)}%`, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Keywords in Top 10', value: topKeywords, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Critical Issues', value: overview?.criticallyLow || 0, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
        { label: 'Total Tracked', value: keywords?.length || 0, icon: Search, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:items-center md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
                        SEO Strategy Center
                        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none">Pro Suite</Badge>
                    </h1>
                    <p className="text-gray-500 mt-1">Unified command center for search engine optimization</p>
                </div>
                <div className="flex gap-3">
                   <Button variant="outline" asChild className="border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                      <Link to={`/dashboard/project/${projectId}/seo/audit`}>Run Site Audit</Link>
                   </Button>
                   <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Zap className="w-4 h-4 mr-2" />
                      Generate AI Report
                   </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800">
                        <CardContent className="p-6">
                            <div className={cn("inline-flex p-2 rounded-lg mb-3", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Health Overview */}
                <Card className="lg:col-span-2 overflow-hidden border-2">
                   <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
                       <CardTitle>Content Health Breakdown</CardTitle>
                       <CardDescription>Aggregate performance across all content types</CardDescription>
                   </CardHeader>
                   <CardContent className="p-8">
                       <div className="space-y-8">
                           <div className="flex items-center gap-8">
                              <div className="relative w-40 h-40">
                                 <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset={`${2 * Math.PI * 70 * (1 - (overview?.avgScore || 0) / 100)}`} className="text-indigo-500 transition-all duration-1000" />
                                 </svg>
                                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-gray-900 dark:text-white">{Math.round(overview?.avgScore || 0)}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Health</span>
                                 </div>
                              </div>
                              <div className="flex-1 space-y-4">
                                 <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                                       <span>Optimization level</span>
                                       <span>{Math.round(overview?.avgScore || 0)}%</span>
                                    </div>
                                    <Progress value={overview?.avgScore || 0} className="h-1.5" />
                                 </div>
                                 <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Your average project health is <span className="text-indigo-600 font-bold">{overview?.avgScore > 70 ? 'Optimal' : 'Needs Work'}</span>. 
                                    We detected {overview?.totalIssues || 0} total improvements across {overview?.totalCount || 0} entries.
                                 </p>
                              </div>
                           </div>

                           <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                               <div className="flex items-center gap-4">
                                  <div className="p-3 bg-emerald-50 rounded-xl">
                                     <TrendingUp className="w-6 h-6 text-emerald-500" />
                                  </div>
                                  <div>
                                     <h4 className="text-sm font-bold dark:text-white">Keyword Visibility</h4>
                                     <p className="text-xs text-muted-foreground">+14% vs last month</p>
                                  </div>
                               </div>
                               <div className="flex justify-end">
                                  <Button variant="ghost" asChild size="sm" className="text-indigo-600">
                                     <Link to={`/dashboard/project/${projectId}/seo/keywords`}>
                                        View Rankings <ArrowRight className="w-4 h-4 ml-2" />
                                     </Link>
                                  </Button>
                               </div>
                           </div>
                       </div>
                   </CardContent>
                </Card>

                {/* Technical SEO Toolbox */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 px-2">Technical Toolbox</h3>
                    
                    {[
                        { label: 'Site Audit', desc: 'Scan for technical errors', icon: Activity, href: `/dashboard/project/${projectId}/seo/audit`, color: 'bg-red-500' },
                        { label: 'Keyword Tracker', desc: 'Monitor search rankings', icon: Search, href: `/dashboard/project/${projectId}/seo/keywords`, color: 'bg-blue-500' },
                        { label: 'XML Sitemap', desc: 'Auto-gen sitemap.xml', icon: Globe, href: `/dashboard/project/${projectId}/seo/sitemap`, color: 'bg-emerald-500' },
                        { label: 'Schema Builder', desc: 'Structured data wizard', icon: Sparkles, href: `/dashboard/project/${projectId}/seo/schema`, color: 'bg-amber-500' },
                        { label: 'Robots Editor', desc: 'Manage crawler access', icon: FileCode, href: `/dashboard/project/${projectId}/seo/robots`, color: 'bg-indigo-500' },
                    ].map(tool => (
                        <Link key={tool.label} to={tool.href} className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md group">
                            <div className={cn("p-2.5 rounded-xl text-white", tool.color)}>
                                <tool.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{tool.label}</h4>
                                <p className="text-xs text-gray-500 truncate">{tool.desc}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}

                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl">
                        <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 -rotate-12" />
                        <h4 className="font-bold mb-1">Weekly Growth</h4>
                        <p className="text-xs text-white/70 mb-4">Total Search Impressions increased by 12% this week.</p>
                        <Button variant="secondary" size="sm" className="w-full bg-white text-indigo-900 hover:bg-gray-100" asChild>
                           <Link to={`/dashboard/project/${projectId}/analytics`}>
                              Full Analytics
                              <ChevronRight className="w-4 h-4 ml-1" />
                           </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
