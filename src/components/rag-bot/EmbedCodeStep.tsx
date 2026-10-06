import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  Globe, 
  ShieldCheck, 
  Key, 
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Terminal,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { ragBotAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EmbedCodeStepProps {
  bot: any;
  projectId: string;
  botId: string;
}

const EmbedCodeStep: React.FC<EmbedCodeStepProps> = ({ bot, projectId, botId }) => {
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [newOrigin, setNewOrigin] = useState('');
  const [origins, setOrigins] = useState<string[]>(bot.allowedOrigins || []);
  const [regenerating, setRegenerating] = useState(false);

  // Use the backend URL for the script source
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const embedCode = `<!-- Headless CMS RAG Bot Widget -->
<script 
  src="${backendUrl}/widget.js" 
  data-bot="${bot.slug}" 
  data-id="${botId}" 
  data-key="${bot.apiKey}"
  async
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Embed code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddOrigin = async () => {
    if (!newOrigin) return;
    const updatedOrigins = [...origins, newOrigin];
    try {
      await ragBotAPI.update(projectId, botId, { allowedOrigins: updatedOrigins });
      setOrigins(updatedOrigins);
      setNewOrigin('');
      toast.success('Origin added');
    } catch (error) {
      toast.error('Failed to add origin');
    }
  };

  const handleRemoveOrigin = async (idx: number) => {
    const updatedOrigins = origins.filter((_, i) => i !== idx);
    try {
      await ragBotAPI.update(projectId, botId, { allowedOrigins: updatedOrigins });
      setOrigins(updatedOrigins);
      toast.success('Origin removed');
    } catch (error) {
      toast.error('Failed to remove origin');
    }
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Regenerating the API key will break your existing installations. Proceed?')) return;
    setRegenerating(true);
    try {
      const response = await ragBotAPI.regenerateKey(projectId, botId);
      toast.success('API Key regenerated');
      window.location.reload(); 
    } catch (error) {
      toast.error('Failed to regenerate key');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Bot Status Banner */}
      <div className={cn(
        "p-6 rounded-[2rem] flex items-center justify-between border-2 transition-all",
        bot.status === 'active' 
          ? "bg-emerald-50 border-emerald-100 text-emerald-900" 
          : "bg-amber-50 border-amber-100 text-amber-900"
      )}>
         <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-2xl shadow-sm",
              bot.status === 'active' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
            )}>
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
               <div className="flex items-center gap-2">
                 <h4 className="text-lg font-bold">Deployment Status: {bot.status === 'active' ? 'Live' : 'Draft'}</h4>
                 <Badge variant={bot.status === 'active' ? 'default' : 'secondary'} className={cn(
                   "text-[10px] uppercase tracking-widest px-2",
                   bot.status === 'active' ? "bg-emerald-600" : "bg-amber-600 text-white"
                 )}>
                   {bot.status}
                 </Badge>
               </div>
               <p className="text-xs opacity-75 mt-0.5">
                 {bot.status === 'active' 
                   ? 'Your bot is currently accepting requests from assigned origins.' 
                   : 'Bot is in draft mode. Implementation script will not load until activated.'}
               </p>
            </div>
         </div>
         {bot.status !== 'active' && (
           <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">
             Activate Now
           </Button>
         )}
      </div>

      {/* Embed Code Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              Installation Script
           </h3>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              Auto-updating
           </div>
        </div>
        <p className="text-sm text-gray-500">
          Paste this snippet into the <code>&lt;head&gt;</code> or <code>&lt;body&gt;</code> of your website.
        </p>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <pre className="relative bg-gray-900 text-indigo-300 p-8 rounded-2xl overflow-x-auto text-sm font-mono leading-relaxed border border-white/10 shadow-2xl">
            {embedCode}
          </pre>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={handleCopy}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-xl flex items-center gap-2 font-bold px-4 py-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Script'}
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* Security & Origin Allowlist */}
        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Globe className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-md font-bold text-gray-900 leading-tight">Allowed Origins</h3>
                <p className="text-[10px] text-gray-500">Domain-level security for your widget</p>
             </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="text"
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
              placeholder="https://acme.com"
              className="h-11 rounded-xl"
            />
            <Button
              onClick={handleAddOrigin}
              disabled={!newOrigin}
              className="bg-gray-900 hover:bg-black h-11 px-4 rounded-xl"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
            {origins.map((origin, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl group hover:border-indigo-100 transition-all">
                 <span className="text-sm font-medium text-gray-600">{origin}</span>
                 <button 
                  onClick={() => handleRemoveOrigin(idx)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            ))}
            {origins.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 bg-amber-50/50 border border-dashed border-amber-200 rounded-2xl text-center">
                 <Lock className="w-8 h-8 text-amber-400 mb-2" />
                 <p className="text-[11px] text-amber-800 font-bold uppercase tracking-widest">Public Access Enabled</p>
                 <p className="text-[10px] text-amber-700 mt-1 max-w-[200px]">Without origins, any domain can load this bot. Add your domain for better security.</p>
              </div>
            )}
          </div>
        </section>

        {/* API Secret Section */}
        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Key className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-md font-bold text-gray-900 leading-tight">Bot API Secret</h3>
                <p className="text-[10px] text-gray-500">Secret key for widget authentication</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="relative group">
               <input
                type={showKey ? 'text' : 'password'}
                readOnly
                value={bot.apiKey}
                className="w-full bg-gray-50 border border-gray-200 pr-12 pl-4 py-4 rounded-2xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
               />
               <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-4 text-gray-400 hover:text-indigo-600 transition-all"
               >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
               </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateKey}
              disabled={regenerating}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold text-xs"
            >
              <RefreshCw className={cn("w-3 h-3 mr-2", regenerating ? "animate-spin" : "")} />
              Regenerate API Secret
            </Button>
          </div>

          <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[1.5rem] text-white overflow-hidden relative">
             <Terminal className="absolute -right-2 -bottom-2 w-16 h-16 text-white/5 -rotate-12" />
             <h5 className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Production Ready</h5>
             <p className="text-[10px] text-gray-400 leading-normal">
               High-availability RAG cluster is active for this bot. All chats are processed via <span className="text-white font-bold">Llama 3.2</span>.
             </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default EmbedCodeStep;
