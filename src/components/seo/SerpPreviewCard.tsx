import React from 'react';
import { Search, Globe, MoreVertical, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SerpPreviewCardProps {
  title: string;
  description: string;
  url?: string;
}

const SerpPreviewCard: React.FC<SerpPreviewCardProps> = ({ title, description, url = 'https://yourwebsite.com/blog/example-post' }) => {
  const titleLimit = 60;
  const descLimit = 160;

  const titleScore = Math.min((title.length / titleLimit) * 100, 100);
  const descScore = Math.min((description.length / descLimit) * 100, 100);

  const getStatusColor = (len: number, limit: number) => {
    if (len === 0) return 'text-gray-400';
    if (len > limit) return 'text-red-500';
    if (len > limit * 0.8) return 'text-emerald-500';
    return 'text-amber-500';
  };

  const getProgressColor = (len: number, limit: number) => {
    if (len > limit) return 'bg-red-500';
    if (len > limit * 0.8) return 'bg-emerald-500';
    return 'bg-amber-500';
  };

  return (
    <Card className="overflow-hidden border-2 border-gray-100 shadow-xl rounded-[2rem] bg-white">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 px-6 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-600" />
          SERP Preview Simulator
        </CardTitle>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
           <Globe className="w-3.5 h-3.5 text-gray-400" />
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Google Desktop</span>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        
        {/* The Actual Preview */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
           <div className="flex items-center gap-2 text-[13px] text-gray-600 mb-1">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">G</div>
              <span className="truncate max-w-[250px]">{url}</span>
              <MoreVertical className="w-4 h-4 ml-auto text-gray-400" />
           </div>
           
           <h3 className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight">
             {title || 'Please enter a SEO title...'}
           </h3>
           
           <p className="text-[14px] text-[#4d5156] leading-relaxed line-clamp-2">
             <span className="font-bold text-gray-400">Apr 18, 2026 — </span>
             {description || 'Please enter a meta description to see how it will appear in search results. Google typically truncates after 160 characters.'}
           </p>
        </div>

        {/* Analytics/Metrics */}
        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-[11px] font-bold text-gray-500 uppercase">Title Length</span>
                 <span className={`text-xs font-bold ${getStatusColor(title.length, titleLimit)}`}>
                   {title.length}/{titleLimit}
                 </span>
              </div>
              <Progress value={titleScore} className={`h-1.5 ${getProgressColor(title.length, titleLimit)}`} />
              <div className="flex items-center gap-1.5">
                 {title.length > titleLimit ? (
                   <AlertCircle className="w-3 h-3 text-red-500" />
                 ) : (
                   <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                 )}
                 <span className="text-[10px] text-gray-400">
                   {title.length > titleLimit ? 'Too long' : 'Optimal length'}
                 </span>
              </div>
           </div>

           <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-[11px] font-bold text-gray-500 uppercase">Meta Desc</span>
                 <span className={`text-xs font-bold ${getStatusColor(description.length, descLimit)}`}>
                   {description.length}/{descLimit}
                 </span>
              </div>
              <Progress value={descScore} className={`h-1.5 ${getProgressColor(description.length, descLimit)}`} />
              <div className="flex items-center gap-1.5">
                 {description.length > descLimit ? (
                   <AlertCircle className="w-3 h-3 text-red-500" />
                 ) : (
                   <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                 )}
                 <span className="text-[10px] text-gray-400">
                   {description.length > descLimit ? 'Too long' : 'Optimal length'}
                 </span>
              </div>
           </div>
        </div>

        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
           <p className="text-[11px] text-indigo-700 leading-normal">
             <span className="font-bold">Pro Tip:</span> Including your primary keyword in the first 60 characters of the title significantly improves CTR.
           </p>
        </div>

      </CardContent>
    </Card>
  );
};

export default SerpPreviewCard;
