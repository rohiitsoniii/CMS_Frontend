import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Search, 
  Trash2, 
  Target, 
  BarChart2, 
  PieChart, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { seoAPI } from '@/services/api';
import { KeywordTrackerSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function KeywordTrackerPage() {
    const { projectId } = useParams();
    const [keywords, setKeywords] = useState<any[]>([]);
    const [newKeyword, setNewKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchKeywords();
        fetchSuggestions();
    }, [projectId]);
 
    const fetchKeywords = async () => {
        try {
            setLoading(true);
            const res = await seoAPI.getKeywords(projectId!);
            if (res.data.success) {
                setKeywords(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch keywords:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        try {
            setLoadingSuggestions(true);
            const res = await seoAPI.suggestKeywords(projectId!);
            if (res.data.success) {
                setSuggestions(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch keyword suggestions:', error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleAddKeyword = async (kw?: string) => {
        const keywordToAdd = kw || newKeyword;
        if (!keywordToAdd.trim()) return;
        try {
            const res = await seoAPI.addKeyword(projectId!, { keyword: keywordToAdd.trim() });
            if (res.data.success) {
                setKeywords([...keywords, res.data.data]);
                if (!kw) setNewKeyword('');
                setSuggestions(prev => prev.filter(s => s.keyword !== keywordToAdd));
                toast({ title: "Keyword Added", description: `Now tracking: ${keywordToAdd}` });
            }
        } catch (error: any) {
            toast({ title: "Failed to Add", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await seoAPI.deleteKeyword(projectId!, id);
            setKeywords(keywords.filter(k => k._id !== id));
            toast({ title: "Keyword Deleted" });
        } catch (error) {
            toast({ title: "Delete Failed", variant: "destructive" });
        }
    };

    if (loading) return <KeywordTrackerSkeleton />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Keyword Tracker</h1>
                    <p className="text-gray-500 mt-1">Monitor your organic search rankings over time</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto max-w-md">
                    <Input 
                        placeholder="Enter keyword to track..." 
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                        className="rounded-full pl-6 shadow-sm border-2 focus:border-indigo-500 transition-all"
                    />
                    <Button 
                        onClick={() => handleAddKeyword()} 
                        className="rounded-full bg-indigo-600 hover:bg-indigo-700 px-6 shadow-md"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Track
                    </Button>
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-none shadow-xl">
                    <CardContent className="p-6">
                         <div className="flex justify-between items-start mb-4">
                            <Target className="w-6 h-6 text-indigo-200" />
                            <Badge className="bg-white/20 text-white border-none text-[10px]">Active</Badge>
                         </div>
                         <h3 className="text-3xl font-bold">{keywords.length}</h3>
                         <p className="text-indigo-100 text-sm mt-1">Total Tracked Keywords</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardContent className="p-6 text-center">
                         <h3 className="text-3xl font-bold text-green-500">
                             {keywords.filter(k => k.currentRank > 0 && k.currentRank <= 10).length}
                         </h3>
                         <p className="text-gray-500 text-sm mt-1">In Top 10 Positions</p>
                         <Progress value={keywords.length > 0 ? (keywords.filter(k => k.currentRank > 0 && k.currentRank <= 10).length / keywords.length) * 100 : 0} className="h-1 mt-4" />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md">
                    <CardContent className="p-6 text-center">
                         <h3 className="text-3xl font-bold text-amber-500">
                             {keywords.filter(k => k.currentRank > 10 && k.currentRank <= 30).length}
                         </h3>
                         <p className="text-gray-500 text-sm mt-1">Page 2-3 Positions</p>
                         <Progress value={keywords.length > 0 ? (keywords.filter(k => k.currentRank > 10 && k.currentRank <= 30).length / keywords.length) * 100 : 0} className="h-1 mt-4" />
                    </CardContent>
                </Card>
            </div>

            {/* Keyword Table */}
            <Card className="border-none shadow-sm dark:bg-gray-800">
                <CardHeader className="border-b dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Ranking Performance</CardTitle>
                        <div className="flex items-center gap-4 text-xs grayscale">
                            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-500" /> Improved</span>
                            <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3 text-red-500" /> Declined</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-900 text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Keyword</th>
                                    <th className="px-6 py-4 font-bold text-center">Current Rank</th>
                                    <th className="px-6 py-4 font-bold text-center">Best Rank</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Trend</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {keywords.map((kw) => (
                                    <tr key={kw._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white">{kw.keyword}</span>
                                                <span className="text-[10px] text-gray-500 italic mt-0.5">Global (Worldwide)</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className={cn(
                                                "inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-sm",
                                                kw.currentRank === 0 ? "bg-gray-100 text-gray-400" :
                                                kw.currentRank <= 3 ? "bg-amber-100 text-amber-700 border-2 border-amber-200" :
                                                kw.currentRank <= 10 ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"
                                            )}>
                                                {kw.currentRank === 0 ? '—' : kw.currentRank}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-gray-400">
                                            {kw.bestRank || '—'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px]">
                                                Tracking
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-green-500" />
                                                <span className="text-green-600 font-bold">+2</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-indigo-600">
                                                    <BarChart2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(kw._id)}
                                                    className="h-8 w-8 text-gray-300 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {keywords.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <PieChart className="w-12 h-12 text-gray-100 mb-4" />
                                                <p className="text-gray-500 font-medium">No keywords tracked yet.</p>
                                                <p className="text-xs text-gray-400 mt-1">Start adding keywords above to monitor your presence.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <Sparkles className="absolute -right-8 -top-8 w-48 h-48 text-white/5 rotate-12" />
                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <Badge className="bg-white/20 text-white mb-4 border-none">AI Insight</Badge>
                        <h2 className="text-2xl font-bold mb-4">Semantic Opportunities Detected</h2>
                        <p className="text-indigo-100/70 text-sm leading-relaxed mb-6">
                            Our analysis shows high potential for ranking in "Headless CMS Performance" and "React SEO Optimization".
                            You already have content relevant to these terms but haven't optimized metadata yet.
                        </p>
                        <div className="flex gap-4">
                            <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold shadow-lg">
                                Add Opportunities
                            </Button>
                            <Button variant="ghost" className="text-white hover:bg-white/10">
                                View Content Gaps
                            </Button>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300">AI Quick Add</h4>
                            {loadingSuggestions && <Loader2 className="w-3 h-3 animate-spin text-indigo-300" />}
                        </div>
                        <div className="space-y-3">
                            {suggestions.slice(0, 4).map(item => (
                                <div key={item.keyword} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold">{item.keyword}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                           <Badge variant="outline" className="text-[8px] h-3 px-1 border-white/20 text-indigo-200">{item.intent}</Badge>
                                           <span className="text-[8px] text-white/40 uppercase tracking-tighter">Diff: {item.difficulty}</span>
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => handleAddKeyword(item.keyword)}
                                        className="h-7 w-7 p-0 text-white/40 group-hover:text-white group-hover:bg-indigo-500/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {suggestions.length === 0 && !loadingSuggestions && (
                                <p className="text-[10px] text-white/30 text-center py-4 italic">No new suggestions at this time.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
