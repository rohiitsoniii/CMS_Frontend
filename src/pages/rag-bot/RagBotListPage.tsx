import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Bot, 
  MoreVertical, 
  ExternalLink, 
  BarChart2, 
  Settings, 
  Trash2,
  MessageSquare,
  Activity,
  ChevronRight
} from 'lucide-react';
import { ragBotAPI } from '@/services/api';
import { RagBotListSkeleton } from '@/components/skeletons';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const RagBotListPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBots = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await ragBotAPI.list(projectId);
      setBots(response.data.data);
    } catch (error) {
      console.error('Failed to fetch bots:', error);
      toast.error('Failed to load RAG bots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, [projectId]);

  const handleDeleteBot = async (botId: string) => {
    if (!window.confirm('Are you sure you want to delete this bot? This action cannot be undone.')) return;
    
    try {
      await ragBotAPI.delete(projectId!, botId);
      toast.success('Bot deleted successfully');
      fetchBots();
    } catch (error) {
      toast.error('Failed to delete bot');
    }
  };

  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-8 h-8 text-indigo-600" />
            AI RAG Bots
          </h1>
          <p className="text-gray-500 mt-1">
            Build and manage AI chatbots powered by your custom knowledge base.
          </p>
        </div>
        <button
          onClick={() => navigate(`/dashboard/projects/${projectId}/rag-bots/new`)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Bot
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Bots</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{bots.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Conversations</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {bots.reduce((acc, bot) => acc + (bot.stats?.totalConversations || 0), 0)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Messages</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {bots.reduce((acc, bot) => acc + (bot.stats?.totalMessages || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search bots by name or slug..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Bot Grid */}
      {loading ? (
        <RagBotListSkeleton />
      ) : filteredBots.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBots.map((bot) => (
            <div 
              key={bot._id} 
              className="bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm"
                      style={{ backgroundColor: bot.widget?.primaryColor || '#6366f1' }}
                    >
                      {bot.widget?.avatarUrl ? (
                         <img src={bot.widget.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        bot.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">/{bot.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      bot.status === 'active' ? 'bg-green-100 text-green-700' :
                      bot.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {bot.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[40px]">
                  {bot.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-semibold text-gray-900">{bot.stats?.totalConversations || 0}</span> chats
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Activity className="w-4 h-4" />
                    Last active: <span className="font-semibold text-gray-900">
                      {bot.stats?.lastActiveAt ? new Date(bot.stats.lastActiveAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                  <div className="flex gap-2">
                    <Link
                      to={`/dashboard/projects/${projectId}/rag-bots/${bot._id}`}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Settings"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                    <Link
                      to={`/dashboard/projects/${projectId}/rag-bots/${bot._id}/analytics`}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Analytics"
                    >
                      <BarChart2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteBot(bot._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => navigate(`/dashboard/projects/${projectId}/rag-bots/${bot._id}`)}
                    className="inline-flex items-center text-indigo-600 font-semibold hover:underline"
                  >
                    Edit Bot <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center px-4">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-6">
            <Bot className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No RAG Bots Found</h2>
          <p className="text-gray-500 max-w-sm mb-8">
            Build your first AI chatbot today. Connect your knowledge base and let AI handle your customer queries.
          </p>
          <button
            onClick={() => navigate(`/dashboard/projects/${projectId}/rag-bots/new`)}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Bot
          </button>
        </div>
      )}
    </div>
  );
};

export default RagBotListPage;
