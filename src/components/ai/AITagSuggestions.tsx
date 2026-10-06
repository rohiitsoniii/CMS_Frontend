import { useState } from 'react';
import { Tag, Sparkles, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { aiAPI } from '@/services/api';

interface AITagSuggestionsProps {
    contentContext: string;
    onAddTag: (tag: string) => void;
    existingTags: string[];
}

export function AITagSuggestions({ contentContext, onAddTag, existingTags }: AITagSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSuggestions = async () => {
        if (!contentContext || contentContext.length < 50) {
            toast.error("Add more content first to get good tags");
            return;
        }
        setIsLoading(true);
        try {
            const res = await aiAPI.generateTags(contentContext);
            const rawTags = res.data?.data?.tags || res.data?.tags || [];
            if (Array.isArray(rawTags) && rawTags.length > 0) {
                setSuggestions(rawTags.filter((t: string) => !existingTags.includes(t)));
            } else {
                setSuggestions(["Featured", "Update", "Technology", "Release"].filter(t => !existingTags.includes(t)));
            }
        } catch (error) {
            console.error('Failed to generate AI tags:', error);
            setSuggestions(["Featured", "News", "Update"].filter(t => !existingTags.includes(t)));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 border border-indigo-100 dark:border-indigo-900 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    AI Auto-Tagging
                </div>
                <Button size="sm" variant="secondary" onClick={fetchSuggestions} disabled={isLoading} className="text-xs h-7">
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Tag className="w-3 h-3 mr-1" />}
                    Suggest Tags
                </Button>
            </div>
            
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((t, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                onAddTag(t);
                                setSuggestions(s => s.filter(sug => sug !== t));
                            }}
                            className="text-xs px-2.5 py-1 bg-white dark:bg-gray-800 border-indigo-200 border text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 hover:border-indigo-300 transition-all flex items-center gap-1 shadow-sm"
                        >
                            <Plus className="w-3 h-3" /> {t}
                        </button>
                    ))}
                </div>
            )}
            {suggestions.length === 0 && !isLoading && (
                <p className="text-xs text-gray-500 italic">Generate tags based on your current content.</p>
            )}
        </div>
    );
}
