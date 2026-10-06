import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, X, RefreshCw, ChevronRight, Wand2, 
  BookOpen, Search, Minimize2, Maximize2, Loader2
} from 'lucide-react';
import { aiAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

interface AIAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  prompt: (content: string) => string;
}

const AI_ACTIONS: AIAction[] = [
  {
    id: 'improve',
    label: 'Improve Writing',
    description: 'Fix grammar, clarity, and flow',
    icon: '✨',
    prompt: (c) => c,
  },
  {
    id: 'rewrite_formal',
    label: 'Make Formal',
    description: 'Professional, business tone',
    icon: '👔',
    prompt: (c) => `Rewrite the following content in a formal, professional tone: ${c}`,
  },
  {
    id: 'rewrite_casual',
    label: 'Make Casual',
    description: 'Friendly, conversational tone',
    icon: '😊',
    prompt: (c) => `Rewrite the following in a warm, casual and friendly tone: ${c}`,
  },
  {
    id: 'expand',
    label: 'Expand',
    description: 'Add more detail and depth',
    icon: '📖',
    prompt: (c) => `Expand the following text with more detail, examples, and depth while keeping the same tone: ${c}`,
  },
  {
    id: 'shorten',
    label: 'Make Concise',
    description: 'Remove fluff, keep the point',
    icon: '✂️',
    prompt: (c) => `Make the following more concise and punchy, removing any redundant words: ${c}`,
  },
  {
    id: 'seo_meta',
    label: 'Write SEO Meta',
    description: 'Generate meta title + description',
    icon: '🔍',
    prompt: (c) => `Based on the following content, write an SEO-optimized meta title (max 60 chars) and meta description (max 155 chars). Format as:\nMeta Title: ...\nMeta Description: ...\n\nContent:\n${c}`,
  },
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Create a brief summary',
    icon: '📋',
    prompt: (c) => `Write a compelling 2-sentence summary of the following content: ${c}`,
  },
  {
    id: 'bullets',
    label: 'Convert to Bullets',
    description: 'Transform into a bullet list',
    icon: '📌',
    prompt: (c) => `Convert the following into a clear, scannable bullet-point list: ${c}`,
  },
];

interface AIAssistantPanelProps {
  /** Current content text from the editor (selected text or full field value) */
  selectedText?: string;
  /** Called when the user wants to apply AI output to their content */
  onApply: (result: string) => void;
  /** Called when the panel should close */
  onClose: () => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  selectedText = '',
  onApply,
  onClose,
}) => {
  const [inputText, setInputText] = useState(selectedText);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInputText(selectedText);
  }, [selectedText]);

  const runAction = async (action: AIAction) => {
    if (!inputText.trim()) {
      toast.error('Please enter some content to work with');
      return;
    }

    setLoading(true);
    setActiveAction(action.id);
    setResult('');

    try {
      const prompt = action.prompt(inputText);
      const response = await aiAPI.improveContent(prompt);
      const improved = response.data.data?.improved || response.data.data?.content || '';
      setResult(improved);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result);
    toast.success('Content applied!');
    setResult('');
  };

  const handleRegenerate = () => {
    const action = AI_ACTIONS.find(a => a.id === activeAction);
    if (action) runAction(action);
  };

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-1 transition-all font-bold text-sm"
        >
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-black/20 border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">AI Content Assistant</h3>
            <p className="text-white/70 text-xs">Powered by your AI service</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMinimized(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Input Area */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">
            Content to Transform
          </label>
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type the content you want to improve..."
            rows={4}
            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Action Grid */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
            Choose an Action
          </p>
          <div className="grid grid-cols-2 gap-2">
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => runAction(action)}
                disabled={loading}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all text-sm group ${
                  activeAction === action.id && !loading
                    ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-lg leading-none mt-0.5">{action.icon}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white text-xs truncate flex items-center gap-1">
                    {action.label}
                    {loading && activeAction === action.id && (
                      <Loader2 className="w-3 h-3 animate-spin text-violet-500" />
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {action.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Result Area */}
        {(result || loading) && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                AI Result
              </p>
              {result && !loading && (
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500 flex-shrink-0" />
                <span className="text-sm text-gray-500">AI is thinking...</span>
              </div>
            ) : (
              <div className="bg-gradient-to-b from-violet-50 to-white dark:from-violet-900/10 dark:to-gray-800 rounded-xl border border-violet-100 dark:border-violet-900/30 p-4">
                <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {result}
                </p>
              </div>
            )}

            {result && !loading && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleApply}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5 transition-all"
                >
                  <Wand2 className="w-4 h-4" />
                  Apply to Content
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success('Copied!');
                  }}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Floating trigger button for opening the AI Assistant.
 * Place this in any content editor page.
 */
export const AIAssistantTrigger: React.FC<{
  onClick: () => void;
  hasSelection?: boolean;
}> = ({ onClick, hasSelection }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-violet-200 dark:shadow-none hover:shadow-violet-300 hover:-translate-y-1 transition-all font-bold text-sm group"
    title="Open AI Content Assistant"
  >
    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
    {hasSelection ? 'Improve Selection' : 'AI Assistant'}
  </button>
);
