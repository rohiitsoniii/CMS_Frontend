import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  RefreshCw, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  FileText,
  Globe,
  Database,
  ChevronDown,
  ChevronUp,
  Play,
  Zap
} from 'lucide-react';
import { ragBotAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

interface LiveChatPreviewStepProps {
  bot: any;
  projectId: string;
}

const LiveChatPreviewStep: React.FC<LiveChatPreviewStepProps> = ({ bot, projectId }) => {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: bot.widget?.greeting || 'Hi! How can I help you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      // Use the public chat endpoint for testing
      const response = await ragBotAPI.publicChat(bot._id, {
        message: input,
        sessionId,
        apiKey: bot.apiKey,
        history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.data.message,
        sources: response.data.data.sources,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      toast.error('Failed to get response from bot');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error: Could not connect to the AI model. Please check your API configuration or try again.', 
        error: true,
        timestamp: new Date() 
      }]);
    } finally {
      setSending(false);
    }
  };

  const resetChat = () => {
    setMessages([{ role: 'assistant', content: bot.widget?.greeting || 'Hi! How can I help you today?', timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm border border-indigo-100">
               <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
               <p className="text-sm font-bold text-indigo-900">Interactive Preview</p>
               <p className="text-[10px] text-indigo-700">Test your bot's personality and knowledge accuracy live.</p>
            </div>
         </div>
         <Button 
          variant="outline"
          size="sm"
          onClick={resetChat}
          className="h-8 text-indigo-600 bg-white border-indigo-200 hover:bg-indigo-50"
         >
           <RefreshCw className="w-3 h-3 mr-2" /> Reset
         </Button>
      </div>

      {/* Messages Container */}
      <div className="flex-grow bg-white border border-gray-100 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div 
          className="p-4 flex items-center gap-3 text-white"
          style={{ background: `linear-gradient(135deg, ${bot.widget?.primaryColor || '#6366f1'}, ${bot.widget?.secondaryColor || '#4f46e5'})` }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold">
             {bot.widget?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">{bot.widget?.name || 'AI Assistant'}</p>
            <p className="text-[10px] opacity-80">Test Session</p>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50">
           {messages.map((m, idx) => (
             <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm bg-gray-400"
                  style={m.role === 'assistant' ? { backgroundColor: bot.widget?.primaryColor } : {}}
                >
                  {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={cn("max-w-[80%] space-y-2", m.role === 'user' ? "text-right" : "")}>
                   <div className={cn(
                     "p-4 rounded-2xl shadow-sm text-sm leading-relaxed text-left",
                     m.role === 'assistant' 
                     ? (m.error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none') 
                     : 'bg-indigo-600 text-white rounded-tr-none'
                   )}
                   style={m.role === 'user' ? { backgroundColor: bot.widget?.primaryColor } : {}}
                   >
                     {m.content}
                   </div>
                   
                   {/* Sources */}
                   {m.sources && m.sources.length > 0 && (
                     <div className="flex flex-wrap gap-2 pt-1">
                        <p className="text-[9px] font-bold text-gray-400 w-full mb-0.5 flex items-center gap-1 justify-start">
                          <CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> Sources identified
                        </p>
                        {m.sources.map((s: any, i: number) => (
                          <div key={i} className="bg-white border border-gray-100 px-2 py-0.5 rounded-lg text-[9px] flex items-center gap-1.5 text-gray-500 shadow-sm">
                             {s.sourceType === 'document' ? <FileText className="w-3 h-3 text-indigo-400" /> :
                              s.sourceType === 'url' ? <Globe className="w-3 h-3 text-green-400" /> :
                              <Database className="w-3 h-3 text-amber-400" />}
                             <span className="truncate max-w-[120px]">{s.sourceFile || s.sourceUrl || 'CMS Content'}</span>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
             </div>
           ))}
           {sending && (
             <div className="flex gap-4">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600 text-white shadow-sm"
                  style={{ backgroundColor: bot.widget?.primaryColor }}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form 
          onSubmit={handleSend}
          className="p-4 bg-white border-t border-gray-100 flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder={bot.widget?.placeholder || 'Type here to test...'}
            className="flex-grow bg-gray-50 px-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: bot.widget?.primaryColor }}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

       <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
          <AlertCircle className="w-4 h-4" />
          <p className="text-[10px]">
            Uses the <span className="font-bold text-gray-500">{bot.persona?.model}</span> model with <span className="font-bold text-gray-500">{bot.retrieval?.topK}</span> chunks context.
          </p>
       </div>
    </div>
  );
};

export default LiveChatPreviewStep;
