import { useState } from 'react';
import { Search, Sparkles, Loader2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nlqAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface NLQSearchBarProps {
  projectId: string;
}

export function NLQSearchBar({ projectId }: NLQSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResults(null);
    try {
      const res = await nlqAPI.query(projectId, query);
      setResults(res.data.data);
      if (res.data.data.matchCount === 0) {
        toast.success("No results matched your query");
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to parse query.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Sparkles className="w-5 h-5 text-indigo-500 group-focus-within:text-indigo-600 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything... e.g. 'Show me all published landing pages'"
          className="w-full pl-12 pr-24 py-4 bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-gray-900 dark:text-gray-100 shadow-sm outline-none"
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim()}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-1" />}
            {isLoading ? '' : 'Query'}
          </Button>
        </div>
      </form>

      {/* Results View */}
      {results && (
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              Found {results.matchCount} result(s)
            </h3>
            <div className="text-xs font-mono text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
               {JSON.stringify(results.generatedQuery)}
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
             {results.items.length === 0 ? (
               <p className="text-sm text-gray-500 p-4 text-center">No Content matched this specific AI query.</p>
             ) : (
                results.items.map((item: any) => (
                  <div 
                    key={item._id} 
                    className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    onClick={() => navigate(`/projects/${projectId}/content/edit/${item._id}`)}
                  >
                     <div>
                       <div className="font-medium">{item.name || 'Untitled Content'}</div>
                       <div className="text-xs text-gray-500 flex gap-2">
                          <span className="uppercase">{item.type}</span>
                          <span>•</span>
                          <span className={item.status === 'published' ? 'text-green-600' : 'text-amber-600'}>
                            {item.status}
                          </span>
                       </div>
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>
      )}
    </div>
  );
}
