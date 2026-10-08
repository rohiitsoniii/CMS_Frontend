import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  ExternalLink, 
  ChevronRight,
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { ragBotAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BotWidgetSkeleton } from '@/components/skeletons';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant' | 'agent' | 'system';
  content: string;
  agentName?: string;
  sources?: any[];
  timestamp: Date;
}

export default function BotWidgetPage() {
    const { botId } = useParams();
    const [searchParams] = useSearchParams();
    const apiKey = searchParams.get('apiKey');
    const sessionIdRef = useRef(uuidv4());
    
    const [bot, setBot] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lead, setLead] = useState({ email: '', name: '' });
    const [leadState, setLeadState] = useState<'idle' | 'sending' | 'done' | 'dismissed'>('idle');
    const [leadError, setLeadError] = useState<string | null>(null);
    // Human takeover: 'bot' | 'requested' | 'human' | 'closed'
    const [handoff, setHandoff] = useState<string>('bot');
    const [handoffEmail, setHandoffEmail] = useState('');
    const [askingHuman, setAskingHuman] = useState(false);
    const lastPollRef = useRef<string>(new Date(0).toISOString());
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (botId && apiKey) {
            fetchConfig();
        } else {
            setError('Missing configuration (Bot ID or API Key)');
        }
    }, [botId, apiKey]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    // While a person handles the chat, poll for their replies
    useEffect(() => {
        if (!bot || (handoff !== 'requested' && handoff !== 'human')) return;
        const tick = async () => {
            try {
                const res = await ragBotAPI.pollMessages(botId!, apiKey!, sessionIdRef.current, lastPollRef.current);
                const { status, messages: incoming } = res.data.data;
                setHandoff(status);
                if (incoming.length) {
                    lastPollRef.current = incoming[incoming.length - 1].timestamp;
                    setMessages((prev) => [...prev, ...incoming.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))]);
                }
            } catch { /* keep polling */ }
        };
        tick();
        const t = setInterval(tick, 4000);
        return () => clearInterval(t);
    }, [bot, handoff]);

    const askForHuman = async () => {
        try {
            setAskingHuman(false);
            lastPollRef.current = new Date().toISOString();
            await ragBotAPI.requestHandoff(botId!, apiKey!, { sessionId: sessionIdRef.current, email: handoffEmail || undefined });
            setHandoff('requested');
            setMessages((prev) => [...prev, { role: 'system', content: 'A team member has been notified and will reply here.' + (handoffEmail ? ' We\'ll also email you if you leave.' : ''), timestamp: new Date() }]);
        } catch {
            setMessages((prev) => [...prev, { role: 'system', content: 'Sorry, we could not reach the team right now.', timestamp: new Date() }]);
        }
    };

    const fetchConfig = async () => {
        try {
            setIsLoading(true);
            const response = await ragBotAPI.getPublicConfig(botId!, apiKey!);
            setBot(response.data.data);
            
            // Add initial greeting
            setMessages([
                {
                    role: 'assistant',
                    content: response.data.data.widget.greeting || 'Hi! How can I help you today?',
                    timestamp: new Date()
                }
            ]);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to load bot configuration');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isThinking || !bot) return;

        const userMsg: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            const response = await ragBotAPI.publicChat(botId!, {
                message: input,
                sessionId: sessionIdRef.current,
                apiKey: apiKey!,
                history: messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-6).map(m => ({ role: m.role, content: m.content }))
            });

            if (response.data.data.handoff) {
                // A person is handling the chat; their reply arrives via polling
                setHandoff(response.data.data.handoff);
            } else {
                const assistantMsg: Message = {
                    role: 'assistant',
                    content: response.data.data.message,
                    sources: response.data.data.sources,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMsg]);
            }
        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again later.',
                timestamp: new Date()
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const submitLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lead.email.trim()) return;
        setLeadState('sending');
        setLeadError(null);
        try {
            const res = await ragBotAPI.submitLead(botId!, apiKey!, { ...lead, sessionId: sessionIdRef.current });
            setLeadState('done');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.data.data?.needsConfirmation
                    ? 'Thanks! Please check your inbox to confirm your email.'
                    : "Thanks! We'll be in touch.",
                timestamp: new Date()
            }]);
        } catch (err: any) {
            setLeadState('idle');
            setLeadError(err.response?.data?.message || 'Could not save your email');
        }
    };

    // Ask for an email after the visitor has had one answer
    const showLeadForm = Boolean(bot?.widget?.collectEmail) && leadState !== 'done' && leadState !== 'dismissed'
        && messages.filter(m => m.role === 'assistant').length >= 2;

    const sourceLabel = (source: any) => {
        if (source.sourceFile) return source.sourceFile;
        if (source.sourceUrl) {
            try { return new URL(source.sourceUrl).hostname; } catch { return source.sourceUrl; }
        }
        return 'CMS';
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <Info className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Connection Error</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">{error}</p>
                <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
                    Retry Connection
                </Button>
            </div>
        );
    }

    if (isLoading || !bot) {
        return <BotWidgetSkeleton />;
    }

    return (
        <div className="flex flex-col h-screen max-h-screen bg-transparent">
            {/* Header */}
            <div 
                className="p-4 flex items-center gap-3 shadow-md z-10 sticky top-0"
                style={{ backgroundColor: bot.widget.primaryColor, color: '#fff' }}
            >
                <Avatar className="h-10 w-10 border-2 border-white/20">
                    {bot.widget.avatarUrl ? (
                        <AvatarImage src={bot.widget.avatarUrl} />
                    ) : (
                        <AvatarFallback className="bg-white/20 text-white">
                            <Bot className="w-6 h-6" />
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold truncate text-sm leading-tight">{bot.widget.name}</h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        <p className="text-[10px] text-white/70 font-medium">Online & Ready</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 bg-[#f8fafc]">
                <div className="space-y-4 pb-4">
                    {messages.map((msg, idx) => msg.role === 'system' ? (
                        <p key={idx} className="text-center text-[11px] text-gray-500 px-4">{msg.content}</p>
                    ) : (
                        <div 
                            key={idx}
                            className={cn(
                                "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "max-w-[85%] rounded-2xl p-3 shadow-sm",
                                msg.role === 'user' 
                                    ? "bg-indigo-600 text-white rounded-tr-none" 
                                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                            )}>
                                {msg.role === 'agent' && <p className="text-[10px] font-semibold text-indigo-600 mb-0.5">{msg.agentName || 'Support'}</p>}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                
                                {msg.sources && msg.sources.length > 0 && bot.widget.showSources && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1.5">Sources</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {msg.sources.map((source, sIdx) => (
                                                <Badge 
                                                    key={sIdx} 
                                                    variant="secondary" 
                                                    className="bg-gray-50 text-[9px] py-0 h-5 border-gray-100 text-gray-500 hover:text-indigo-600 cursor-pointer flex items-center gap-1"
                                                >
                                                    <ExternalLink className="w-2 h-2" />
                                                    {sourceLabel(source)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p className={cn(
                                    "text-[9px] mt-1.5 opacity-50 text-right",
                                    msg.role === 'user' ? "text-white" : "text-gray-400"
                                )}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                    {isThinking && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                    {handoff === 'bot' && messages.filter(m => m.role === 'assistant').length >= 2 && (
                        askingHuman ? (
                            <div className="bg-white border border-gray-200 rounded-2xl p-3 space-y-2">
                                <p className="text-xs text-gray-700">Leave your email in case you step away (optional):</p>
                                <Input type="email" value={handoffEmail} onChange={(e) => setHandoffEmail(e.target.value)} placeholder="you@example.com" className="h-9 text-sm" aria-label="Your email" />
                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1" onClick={askForHuman}>Connect me</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setAskingHuman(false)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <button type="button" onClick={() => setAskingHuman(true)} className="text-xs text-indigo-600 hover:underline">Talk to a person</button>
                            </div>
                        )
                    )}
                    {showLeadForm && (
                        <form onSubmit={submitLead} className="bg-white border border-indigo-100 rounded-2xl p-3 shadow-sm space-y-2">
                            <p className="text-xs font-medium text-gray-700">Want us to follow up? Leave your email.</p>
                            <Input
                                value={lead.name}
                                onChange={(e) => setLead({ ...lead, name: e.target.value })}
                                placeholder="Name (optional)"
                                className="h-9 text-sm"
                                aria-label="Your name"
                            />
                            <Input
                                type="email"
                                required
                                value={lead.email}
                                onChange={(e) => setLead({ ...lead, email: e.target.value })}
                                placeholder="you@example.com"
                                className="h-9 text-sm"
                                aria-label="Your email"
                            />
                            {leadError && <p className="text-xs text-red-600">{leadError}</p>}
                            <div className="flex gap-2">
                                <Button type="submit" size="sm" className="flex-1" disabled={leadState === 'sending'}>
                                    {leadState === 'sending' ? 'Saving…' : 'Send'}
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setLeadState('dismissed')}>
                                    No thanks
                                </Button>
                            </div>
                        </form>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                {bot.widget.suggestedQuestions && bot.widget.suggestedQuestions.length > 0 && messages.length === 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar scroll-smooth">
                        {bot.widget.suggestedQuestions.map((q: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => { setInput(q); }}
                                className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors border border-indigo-100"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}
                <div className="relative flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={bot.widget.placeholder || "Ask me anything..."}
                        className="pr-24 py-6 border-gray-200 focus-visible:ring-indigo-500 shadow-sm rounded-xl"
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                        <Button 
                            size="icon" 
                            className="bg-indigo-600 hover:bg-indigo-700 h-9 w-9 rounded-lg"
                            onClick={handleSend}
                            disabled={!input.trim() || isThinking}
                        >
                            {isThinking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                    <p className="text-[9px] text-gray-400 font-medium tracking-tight">AI can make mistakes. Built with</p>
                    <div className="flex items-center gap-0.5 text-indigo-600 font-bold text-[9px] uppercase tracking-tighter">
                        <Sparkles className="w-2.5 h-2.5" /> Headless CMS
                    </div>
                </div>
            </div>
        </div>
    );
}
