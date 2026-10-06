import { useState, useEffect, useCallback } from 'react';
import { Search, X, FileText, Check, Loader2, ChevronDown } from 'lucide-react';
import { api } from '@/services/api';

interface ContentItem {
  _id: string;
  name: string;
  type: string;
  status: string;
  slug?: string;
  updatedAt: string;
}

interface ReferencePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string, item: ContentItem) => void;
  projectId: string;
  contentType?: string;
  title?: string;
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  draft: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  archived: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
  scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
};

export function ReferencePickerModal({
  isOpen,
  onClose,
  onSelect,
  projectId,
  contentType,
  title = 'Select Reference',
}: ReferencePickerModalProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [typeFilter, setTypeFilter] = useState(contentType || '');

  const fetchItems = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const res = await api.get(`/projects/${projectId}/content`, { params });
      setItems(res.data.data.contents || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, search, typeFilter]);

  useEffect(() => {
    if (isOpen) {
      setSelected(null);
      fetchItems();
    }
  }, [isOpen, fetchItems]);

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected._id, selected);
    onClose();
  };

  const contentTypes = ['header', 'footer', 'hero', 'blog', 'page', 'faq', 'testimonial', 'banner', 'navigation', 'gallery', 'team', 'pricing', 'feature', 'cta'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[75vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {!contentType && (
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="">All types</option>
                {contentTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No content items found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => {
                const isSelected = selected?._id === item._id;
                return (
                  <button
                    key={item._id}
                    onClick={() => setSelected(isSelected ? null : item)}
                    className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {isSelected ? <Check className="w-4 h-4 text-white" /> : <FileText className="w-4 h-4 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 capitalize">{item.type}</span>
                        {item.slug && <span className="text-xs text-gray-400">· /{item.slug}</span>}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[item.status] || STATUS_COLORS.draft}`}>
                      {item.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selected ? (
              <span className="font-medium text-gray-900 dark:text-white">{selected.name}</span>
            ) : (
              `${items.length} item${items.length !== 1 ? 's' : ''}`
            )}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
