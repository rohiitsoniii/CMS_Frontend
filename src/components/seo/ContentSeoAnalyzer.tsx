import React, { useState, useEffect } from 'react';
import { 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Layout, 
  Globe, 
  RefreshCcw,
  Sparkles,
  BarChart,
  HelpCircle
} from 'lucide-react';
import { seoAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ContentSeoAnalyzerProps {
  projectId: string;
  contentId: string;
}

export const ContentSeoAnalyzer: React.FC<ContentSeoAnalyzerProps> = ({ projectId, contentId }) => {
  const [report, setReport] = useState<any>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReport();
  }, [contentId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await seoAPI.getReport(projectId, contentId);
      if (response.data.success) {
        setReport(response.data.data);
        setKeywords(response.data.data.focusKeywords || []);
      }
    } catch (error) {
      console.error('Failed to fetch SEO report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (kwList = keywords) => {
    try {
      setAnalyzing(true);
      const response = await seoAPI.analyze(projectId, contentId, kwList);
      if (response.data.success) {
        setReport(response.data.data);
        toast({ title: "Analysis Complete", description: "SEO metrics have been updated." });
      }
    } catch (error) {
      toast({ title: "Analysis Failed", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAiGenerate = async () => {
    try {
      setIsAiGenerating(true);
      const response = await seoAPI.generateAiSeo(projectId, contentId);
      if (response.data.success) {
        const { title, description, tags } = response.data.data;
        // Logic to update local state or suggest these
        setKeywords(tags);
        handleAnalyze(tags);
        toast({ 
          title: "AI Optimization Ready", 
          description: "Focus keywords and metadata have been suggested based on your content." 
        });
      }
    } catch (error) {
      toast({ title: "AI Generation Failed", variant: "destructive" });
    } finally {
      setIsAiGenerating(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      const updated = [...keywords, newKeyword.trim()];
      setKeywords(updated);
      setNewKeyword('');
      handleAnalyze(updated);
    }
  };

  const removeKeyword = (kw: string) => {
    const updated = keywords.filter(k => k !== kw);
    setKeywords(updated);
    handleAnalyze(updated);
  };

  if (loading) return (
    <div className="p-12 text-center animate-pulse">
      <RefreshCcw className="w-8 h-8 text-indigo-200 mx-auto animate-spin mb-4" />
      <p className="text-muted-foreground">Initializing SEO Analyzer...</p>
    </div>
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Analysis Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Score Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="48" cy="48" r="40" 
                  stroke="currentColor" strokeWidth="8" fill="transparent" 
                  className="text-gray-100 dark:text-gray-700" 
                />
                <circle 
                  cx="48" cy="48" r="40" 
                  stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - report?.score / 100)}`}
                  className={cn("transition-all duration-1000", getScoreColor(report?.score))}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-2xl font-bold", getScoreColor(report?.score))}>
                  {report?.score}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">SEO Health Score</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Optimized based on {keywords.length} target keywords.
              </p>
              <div className="mt-3 flex items-center gap-3">
                 <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100">
                    Readability: {report?.readabilityScore || 0}%
                 </Badge>
                 <Badge variant="outline" className="text-xs">
                    Last crawl: {new Date(report?.analyzedAt).toLocaleTimeString()}
                 </Badge>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => handleAnalyze()} 
            disabled={analyzing}
            className="rounded-full bg-indigo-600 hover:bg-indigo-700"
          >
            {analyzing ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {/* Focus Keywords */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-500" />
            Focus Keywords
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {keywords.map(kw => (
              <Badge key={kw} className="pl-3 py-1 pr-1 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 rounded-lg group">
                {kw}
                <button 
                  onClick={() => removeKeyword(kw)} 
                  className="ml-2 p-0.5 rounded-md hover:bg-white text-indigo-400 hover:text-red-500 transition-colors"
                >
                  <RefreshCcw className="w-3 h-3 rotate-45" />
                </button>
              </Badge>
            ))}
            {keywords.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Add keywords to start targeted analysis.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. headless cms, marketing, seo" 
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              className="h-10 rounded-xl"
            />
            <Button onClick={addKeyword} variant="outline" className="rounded-xl">Add</Button>
            <Button 
                onClick={handleAiGenerate} 
                disabled={isAiGenerating}
                variant="ghost" 
                className="rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            >
                {isAiGenerating ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                AI Suggest
            </Button>
          </div>
        </div>

        {/* Issue Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
             <h3 className="font-bold text-gray-900 dark:text-white">Optimization Checklist</h3>
             <span className="text-xs text-muted-foreground">{report?.issues?.length || 0} issues detected</span>
          </div>
          
          {report?.issues?.map((issue: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  issue.type === 'error' ? "bg-red-50 text-red-500" : 
                  issue.type === 'warning' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                )}>
                  {issue.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
                   issue.type === 'warning' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className="flex-grow">
                   <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">{issue.field.replace(/([A-Z])/g, ' $1')}</span>
                      <Badge variant="outline" className="text-[10px] h-4">{issue.type}</Badge>
                   </div>
                   <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-1">{issue.message}</p>
                   {issue.recommendation && (
                     <p className="text-xs text-muted-foreground mt-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Fix Tip: </span>
                        {issue.recommendation}
                     </p>
                   )}
                </div>
              </div>
            </div>
          ))}

          {(!report?.issues || report.issues.length === 0) && (
            <div className="text-center py-12 bg-green-50/30 border-2 border-dashed border-green-100 rounded-2xl">
               <CheckCircle2 className="w-12 h-12 text-green-200 mx-auto mb-4" />
               <p className="text-green-700 font-bold">Perfect Score!</p>
               <p className="text-green-600 text-sm mt-1">No SEO issues detected for this entry.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Tools */}
      <div className="space-y-6">
        {/* SERP Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            Google SERP Preview
          </h3>
          <div className="space-y-1">
             <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">
                {report?.metaTitle || 'Loading Title...'}
             </div>
             <div className="text-[#006621] text-sm flex items-center gap-1">
                https://yourdomain.com <ChevronRight className="w-3 h-3" /> blog
             </div>
             <div className="text-[#545454] text-sm line-clamp-2">
                {report?.metaDescription || 'Add a meta description to see how your content will appear in Google Search results...'}
             </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 text-center">Preview based on standard desktop rendering.</p>
        </div>

        {/* AI Insight Box */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
           <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
           <h3 className="font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Assistant
           </h3>
           <p className="text-xs text-white/80 leading-relaxed mb-4">
              Our AI recommends targeting long-tail keywords based on your content structure.
           </p>
           <Button variant="secondary" size="sm" className="w-full bg-white text-indigo-600 hover:bg-white/90">
              Get AI Tags
           </Button>
        </div>

        {/* Readability Index */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
           <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-amber-500" />
              Readability
           </h3>
           <div className="space-y-4">
              <div className="flex justify-between text-xs">
                 <span className="text-muted-foreground">Flesch Ease Score</span>
                 <span className="font-bold">{report?.readabilityScore || 0}%</span>
              </div>
              <Progress value={report?.readabilityScore || 0} className="h-1.5" />
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-slate-50 dark:bg-transparent p-3 rounded-lg">
                 <HelpCircle className="w-4 h-4 shrink-0 text-slate-300" />
                 Score over 60 means English that's easy to read for most adults.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
