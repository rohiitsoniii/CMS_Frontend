import { useState } from 'react';
import { MessageSquare, Search, Clock, User, ChevronRight, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  sessionId: string;
  startedAt: string;
  messageCount: number;
  lastMessage: string;
  resolved: boolean;
  rating?: 'positive' | 'negative';
  messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    sessionId: 'session_1712345678',
    startedAt: '2026-04-11T14:20:00Z',
    messageCount: 6,
    lastMessage: 'Thank you for your help!',
    resolved: true,
    rating: 'positive',
    messages: [
      { id: 'm1', role: 'user', text: 'What are your business hours?', timestamp: '2026-04-11T14:20:00Z' },
      { id: 'm2', role: 'bot', text: 'We are open Monday to Friday, 9 AM to 6 PM IST.', timestamp: '2026-04-11T14:20:05Z' },
      { id: 'm3', role: 'user', text: 'Do you offer weekend support?', timestamp: '2026-04-11T14:21:00Z' },
      { id: 'm4', role: 'bot', text: 'We offer limited email support on weekends. You can reach us at support@example.com.', timestamp: '2026-04-11T14:21:05Z' },
      { id: 'm5', role: 'user', text: 'Great, thank you!', timestamp: '2026-04-11T14:22:00Z' },
      { id: 'm6', role: 'bot', text: 'Happy to help! Is there anything else I can assist you with?', timestamp: '2026-04-11T14:22:03Z' },
    ],
  },
  {
    id: '2',
    sessionId: 'session_1712349000',
    startedAt: '2026-04-11T15:10:00Z',
    messageCount: 4,
    lastMessage: 'How do I reset my password?',
    resolved: false,
    rating: 'negative',
    messages: [
      { id: 'm1', role: 'user', text: 'How do I reset my password?', timestamp: '2026-04-11T15:10:00Z' },
      { id: 'm2', role: 'bot', text: "I'm sorry, I don't have information about that. Would you like to speak with a human?", timestamp: '2026-04-11T15:10:05Z' },
      { id: 'm3', role: 'user', text: 'Yes please', timestamp: '2026-04-11T15:11:00Z' },
      { id: 'm4', role: 'bot', text: 'I will connect you with our support team shortly.', timestamp: '2026-04-11T15:11:04Z' },
    ],
  },
  {
    id: '3',
    sessionId: 'session_1712352000',
    startedAt: '2026-04-11T16:00:00Z',
    messageCount: 3,
    lastMessage: 'What is the refund policy?',
    resolved: true,
    messages: [
      { id: 'm1', role: 'user', text: 'What is your refund policy?', timestamp: '2026-04-11T16:00:00Z' },
      { id: 'm2', role: 'bot', text: 'We offer a 30-day money-back guarantee on all plans. No questions asked.', timestamp: '2026-04-11T16:00:04Z' },
      { id: 'm3', role: 'user', text: 'Perfect, thanks!', timestamp: '2026-04-11T16:01:00Z' },
    ],
  },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function ChatbotConversationsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Conversation | null>(MOCK_CONVERSATIONS[0]);
  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');

  const filtered = MOCK_CONVERSATIONS.filter((c) => {
    const matchesSearch =
      c.sessionId.includes(search) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'resolved' && c.resolved) ||
      (filter === 'unresolved' && !c.resolved);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and review chatbot conversation history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-xl text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {MOCK_CONVERSATIONS.filter((c) => c.resolved).length} Resolved
          </div>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-xl text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {MOCK_CONVERSATIONS.filter((c) => !c.resolved).length} Open
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-3 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {(['all', 'resolved', 'unresolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex flex-col gap-2 overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No conversations found</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selected?.id === c.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${c.resolved ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">{c.sessionId}</p>
                        <p className="text-sm text-gray-900 dark:text-white truncate mt-0.5">{c.lastMessage}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(c.startedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {c.messageCount}
                    </span>
                    {c.rating === 'positive' && <ThumbsUp className="w-3 h-3 text-green-500" />}
                    {c.rating === 'negative' && <ThumbsDown className="w-3 h-3 text-red-500" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation detail */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono text-gray-500 dark:text-gray-400">{selected.sessionId}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Started {formatDate(selected.startedAt)}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selected.resolved
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {selected.resolved ? 'Resolved' : 'Open'}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {selected.messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {msg.role === 'bot' ? <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                    </div>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${msg.role === 'bot' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm' : 'bg-indigo-600 text-white rounded-br-sm'}`}>
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.role === 'bot' ? 'text-gray-400' : 'text-indigo-200'}`}>{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a conversation to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
