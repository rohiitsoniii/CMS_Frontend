import { useState, useEffect, useCallback } from 'react';
import { Search, X, Upload, Image as ImageIcon, Film, FileText, Music, Check, Loader2 } from 'lucide-react';
import { mediaAPI } from '@/services/api';

interface MediaFile {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  folder: string;
  createdAt: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, file: MediaFile) => void;
  accept?: 'image' | 'video' | 'audio' | 'document' | 'all';
  title?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ mimeType, className = 'w-6 h-6' }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon className={className} />;
  if (mimeType.startsWith('video/')) return <Film className={className} />;
  if (mimeType.startsWith('audio/')) return <Music className={className} />;
  return <FileText className={className} />;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  accept = 'all',
  title = 'Select Media',
}: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 18, search: search || undefined };
      if (accept !== 'all') params.type = accept;
      const res = await mediaAPI.getAll(params as any);
      setFiles(res.data.data.files || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch {
      // Use empty state on error
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, accept]);

  useEffect(() => {
    if (isOpen) {
      setSelected(null);
      fetchFiles();
    }
  }, [isOpen, fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await mediaAPI.upload(file, { alt: file.name });
      await fetchFiles();
    } catch {
      // silently fail, user can retry
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleConfirm = () => {
    if (!selected) return;
    const url = `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${selected.url}`;
    onSelect(url, selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <div className="flex items-center gap-3">
            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium cursor-pointer transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'}`}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept={accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : accept === 'audio' ? 'audio/*' : undefined} />
            </label>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <ImageIcon className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No files found. Upload one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-3">
              {files.map((file) => {
                const isImage = file.mimeType.startsWith('image/');
                const isSelected = selected?._id === file._id;
                const fileUrl = `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${file.url}`;

                return (
                  <button
                    key={file._id}
                    onClick={() => setSelected(isSelected ? null : file)}
                    className={`relative group aspect-square rounded-xl border-2 overflow-hidden transition-all focus:outline-none ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
                  >
                    {isImage ? (
                      <img src={fileUrl} alt={file.alt || file.originalName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center gap-1 p-2">
                        <FileTypeIcon mimeType={file.mimeType} className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 text-center truncate w-full">{file.originalName}</span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{file.originalName}</p>
                      <p className="text-white/70 text-xs">{formatSize(file.size)}</p>
                    </div>
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
              <span className="font-medium text-gray-900 dark:text-white">{selected.originalName}</span>
            ) : (
              `${total} file${total !== 1 ? 's' : ''}`
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
