import React, { useState, useEffect } from 'react';
import { RagBotAnalyticsSkeleton } from '@/components/skeletons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BarChart2, 
  ChevronLeft, 
  MessageSquare, 
  Users, 
  ThumbsUp, 
  ThumbsDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Filter,
  Download,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ragBotAPI } from '@/services/api';
import toast from 'react-hot-toast';

const RagBotAnalyticsPage: React.FC = () => {
  const { projectId, botId } = useParams<{ projectId: string; botId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bot, setBot] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('7d');

  const [unanswered, setUnanswered] = useState<{ question: string; count: number; reason: string; lastAskedAt: string }[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const days = timeRange === '24h' ? 1 : timeRange === '30d' ? 30 : 7;

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [botRes, analyticsRes, unansweredRes] = await Promise.all([
        ragBotAPI.getById(projectId!, botId!),
        ragBotAPI.getAnalytics(projectId!, botId!, days),
        ragBotAPI.getUnanswered(projectId!, botId!, Math.max(days, 7)),
      ]);
      setBot(botRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setUnanswered(unansweredRes.data.data);
    } catch (error: any) {
      setLoadError(error.response?.data?.message || 'Could not load analytics');
      toast.error('Could not load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, botId, timeRange]);

  if (loading && !bot) {
    return <RagBotAnalyticsSkeleton />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/dashboard/project/${projectId}/rag-bots`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-8 h-8 text-indigo-600" />
              Bot Analytics: {bot?.name}
            </h1>
            <p className="text-gray-500 text-sm">Detailed performance metrics and user insights.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-white border border-gray-200 rounded-xl p-1 flex">
              {['24h', '7d', '30d'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeRange === range ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
           </div>
           <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500">
              <Download className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                 <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-400">{timeRange.toUpperCase()}</span>
           </div>
           <p className="text-sm font-medium text-gray-500">Conversations</p>
           <h3 className="text-3xl font-bold text-gray-900 mt-1">{analytics?.overview.totalConversations}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                 <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-400">{timeRange.toUpperCase()}</span>
           </div>
           <p className="text-sm font-medium text-gray-500">Total Messages</p>
           <h3 className="text-3xl font-bold text-gray-900 mt-1">{analytics?.overview.totalMessages}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                 <ThumbsUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-400">Helpful</span>
           </div>
           <p className="text-sm font-medium text-gray-500">AI Accuracy</p>
           <h3 className="text-3xl font-bold text-gray-900 mt-1">
             {(analytics?.overview.helpfulCount + analytics?.overview.notHelpfulCount) > 0
               ? `${Math.round((analytics.overview.helpfulCount / (analytics.overview.helpfulCount + analytics.overview.notHelpfulCount)) * 100)}%`
               : '—'}
           </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                 <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-400">Leads</span>
           </div>
           <p className="text-sm font-medium text-gray-500">Emails captured</p>
           <h3 className="text-3xl font-bold text-gray-900 mt-1">{analytics?.overview.leadsCaptured ?? 0}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Volume Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-900">Conversation Volume</h3>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                    Conversations
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-200"></div>
                    Messages
                 </div>
              </div>
           </div>
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={analytics?.chartData}>
                    <defs>
                       <linearGradient id="colorConvo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }} 
                      dy={10}
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="convos" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorConvo)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="msgs" 
                      stroke="#e2e8f0" 
                      strokeWidth={2}
                      fill="transparent"
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Top Questions */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
           <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
             Top Asked Questions
             <Info className="w-4 h-4 text-gray-300" />
           </h3>
           <div className="space-y-5 flex-grow">
              {(analytics?.topQuestions || []).length === 0 && (
                <p className="text-sm text-gray-400">No questions in this period yet.</p>
              )}
              {analytics?.topQuestions.map((item: any, idx: number) => (
                <div key={idx} className="space-y-2">
                   <div className="flex justify-between text-xs">
                      <span className="font-bold text-gray-700 truncate max-w-[80%]">{item.question}</span>
                      <span className="text-gray-400 font-bold">{item.count}</span>
                   </div>
                   <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(item.count / analytics.topQuestions[0].count) * 100}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
           <div className="mt-8 pt-6 border-t border-gray-50">
              <Link 
                to={`/dashboard/project/${projectId}/chatbot/knowledge`}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center justify-center gap-1"
              >
                Refine Knowledge Base <ArrowUpRight className="w-3 h-3" />
              </Link>
           </div>
        </div>
      </div>

      {/* Knowledge gaps (real data) */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
         <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
           <ThumbsDown className="w-5 h-5 text-red-400" />
           Questions your bot couldn't answer well
         </h3>
         <p className="text-sm text-gray-500 mb-6">No matching knowledge was found, or visitors marked the answer unhelpful. Add answers to your knowledge base or publish content that covers them.</p>
         {loadError && <p className="text-sm text-red-600 mb-4">{loadError}</p>}
         {unanswered.length === 0 ? (
           <div className="p-6 border-2 border-dashed border-gray-100 rounded-3xl text-center">
             <p className="text-sm text-gray-400 font-medium">No knowledge gaps found in this period.</p>
           </div>
         ) : (
           <div className="grid md:grid-cols-2 gap-3">
             {unanswered.slice(0, 20).map((q, i) => (
               <div key={i} className="p-4 bg-red-50/30 rounded-2xl border border-red-100 border-dashed">
                 <p className="text-sm text-red-900 font-bold mb-2">"{q.question}"</p>
                 <div className="flex flex-wrap items-center gap-2">
                   <span className="text-[10px] bg-white border border-red-200 text-red-600 px-2 py-0.5 rounded-full font-bold">
                     {q.reason === 'no_sources' ? 'MISSING KNOWLEDGE' : 'RATED UNHELPFUL'}
                   </span>
                   <span className="text-[10px] text-gray-500">asked {q.count}×</span>
                   <Link to={`/dashboard/project/${projectId}/chatbot/knowledge`} className="text-[10px] text-indigo-600 font-bold hover:underline">Add to knowledge →</Link>
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>

    </div>
  );
};

export default RagBotAnalyticsPage;
