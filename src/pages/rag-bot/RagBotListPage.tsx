import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Bot, 
  BarChart2, 
  Settings, 
  Trash2,
  MessageSquare,
  Activity,
  ChevronRight
} from 'lucide-react';
import { ragBotAPI } from '@/services/api';
import { RagBotListSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export const RagBotListPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteBotId, setDeleteBotId] = useState<string | null>(null);

  const fetchBots = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await ragBotAPI.list(projectId);
      setBots(response.data?.data || []);
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

  const handleDeleteBot = async () => {
    if (!deleteBotId || !projectId) return;
    try {
      await ragBotAPI.delete(projectId, deleteBotId);
      toast.success('Bot deleted successfully');
      fetchBots();
    } catch {
      toast.error('Failed to delete bot');
    } finally {
      setDeleteBotId(null);
    }
  };

  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-primary" />
            AI RAG Bots
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build and manage AI chatbots powered by your custom knowledge base and dynamic content.
          </p>
        </div>
        <Button
          onClick={() => navigate(`/dashboard/projects/${projectId}/rag-bots/new`)}
          className="shrink-0 gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bot</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Bots</span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">{bots.length}</div>
        </div>
        <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Conversations</span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {bots.reduce((acc, bot) => acc + (bot.stats?.totalConversations || 0), 0)}
          </div>
        </div>
        <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Messages</span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {bots.reduce((acc, bot) => acc + (bot.stats?.totalMessages || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search bots by name or slug..."
          className="pl-9 bg-background"
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
              className="bg-card text-card-foreground rounded-xl border border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3.5">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0"
                      style={{ backgroundColor: bot.widget?.primaryColor || 'var(--primary, #6366f1)' }}
                    >
                      {bot.widget?.avatarUrl ? (
                         <img src={bot.widget.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        bot.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {bot.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">/{bot.slug}</p>
                    </div>
                  </div>
                  <div>
                    <Badge variant={bot.status === 'active' ? 'default' : 'secondary'} className="text-xs uppercase">
                      {bot.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-muted-foreground text-xs leading-relaxed mb-5 line-clamp-2 min-h-[32px]">
                  {bot.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-2 gap-4 py-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span><strong className="text-foreground">{bot.stats?.totalConversations || 0}</strong> chats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Active: <strong className="text-foreground">
                      {bot.stats?.lastActiveAt ? new Date(bot.stats.lastActiveAt).toLocaleDateString() : 'Never'}
                    </strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex gap-1">
                    <Link
                      to={`/dashboard/projects/${projectId}/rag-bots/${bot._id}`}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="Settings"
                      aria-label="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/dashboard/projects/${projectId}/rag-bots/${bot._id}/analytics`}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="Analytics"
                      aria-label="Analytics"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteBotId(bot._id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete"
                      aria-label="Delete Bot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/dashboard/projects/${projectId}/rag-bots/${bot._id}`)}
                    className="text-primary hover:text-primary hover:bg-primary/10 font-medium"
                  >
                    <span>Edit Bot</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed border-border text-center px-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Bot className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">No RAG Bots Found</h2>
          <p className="text-xs text-muted-foreground max-w-sm mb-6">
            Build your first AI chatbot today. Connect your knowledge base and let AI assist your users.
          </p>
          <Button
            onClick={() => navigate(`/dashboard/projects/${projectId}/rag-bots/new`)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Bot
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteBotId}
        onOpenChange={(open) => !open && setDeleteBotId(null)}
        title="Delete RAG Bot"
        description="Are you sure you want to delete this bot? This action cannot be undone and public widgets referencing it will stop answering queries."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteBot}
      />
    </div>
  );
};

export default RagBotListPage;
