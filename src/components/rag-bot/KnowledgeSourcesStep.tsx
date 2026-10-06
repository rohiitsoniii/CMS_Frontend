import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Globe, 
  Database, 
  Upload, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { ragBotAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface KnowledgeSourcesStepProps {
  bot: any;
  projectId: string;
  botId: string;
}

const KnowledgeSourcesStep: React.FC<KnowledgeSourcesStepProps> = ({ bot, projectId, botId }) => {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'files' | 'urls' | 'cms'>('files');

  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await ragBotAPI.getSources(projectId, botId);
      setSources(response.data.data);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [projectId, botId]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    const file = acceptedFiles[0];
    
    try {
      await ragBotAPI.ingestDocument(projectId, botId, file);
      toast.success(`${file.name} ingested successfully`);
      fetchSources();
    } catch (error) {
      toast.error('Failed to ingest document');
    } finally {
      setUploading(false);
    }
  }, [projectId, botId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    multiple: false
  });

  const handleCrawl = async () => {
    if (!url) return;
    setCrawling(true);
    try {
      await ragBotAPI.crawlUrl(projectId, botId, url);
      toast.success('URL ingested successfully');
      setUrl('');
      fetchSources();
    } catch (error) {
      toast.error('Crawl failed');
    } finally {
      setCrawling(false);
    }
  };

  const handleSyncCms = async () => {
    setSyncing(true);
    try {
      await ragBotAPI.syncCms(projectId, botId);
      toast.success('CMS content synced');
      fetchSources();
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteSource = async (type: string, hash: string) => {
    try {
      await ragBotAPI.deleteSource(projectId, botId, type, hash);
      toast.success('Source removed');
      fetchSources();
    } catch (error) {
      toast.error('Failed to remove source');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Tab Navigation */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'files' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" /> Documents
        </button>
        <button
          onClick={() => setActiveTab('urls')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'urls' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="w-4 h-4" /> Websites
        </button>
        <button
          onClick={() => setActiveTab('cms')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'cms' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Database className="w-4 h-4" /> CMS Content
        </button>
      </div>

      {/* Action Area */}
      <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-8">
        {activeTab === 'files' && (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
              isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              {uploading ? 'Processing Document...' : 'Upload Knowledge Document'}
            </h4>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Drag and drop PDF, TXT or Markdown files here. Max 10MB.
            </p>
          </div>
        )}

        {activeTab === 'urls' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
             <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Globe className="w-5 h-5 text-indigo-600" />
               Crawl a Website
             </h4>
             <div className="flex gap-3">
               <input
                 type="url"
                 value={url}
                 onChange={(e) => setUrl(e.target.value)}
                 disabled={crawling}
                 placeholder="https://example.com/docs"
                 className="flex-grow px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
               />
               <button
                 onClick={handleCrawl}
                 disabled={crawling || !url}
                 className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
               >
                 {crawling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crawl URL'}
               </button>
             </div>
             <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
               <Info className="w-3 h-3" /> We'll scrape the main content of this page and follow relevant links.
             </p>
          </div>
        )}

        {activeTab === 'cms' && (
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm text-center">
             <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-10 h-10" />
             </div>
             <h4 className="text-xl font-bold text-gray-900 mb-2">Sync Existing Content</h4>
             <p className="text-gray-500 max-w-sm mx-auto mb-8">
               Import all published entries from your CMS into this bot's knowledge base automatically.
             </p>
             <button
               onClick={handleSyncCms}
               disabled={syncing}
               className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-3 mx-auto"
             >
               {syncing ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
               Sync Project Content
             </button>
          </div>
        )}
      </div>

      {/* Sources List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Ingested Sources
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{sources.length}</span>
          </h3>
          <button 
            onClick={fetchSources}
            className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400">Loading sources...</div>
        ) : sources.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {sources.map((source, idx) => (
              <div 
                key={`${source.type}-${source.hash}-${idx}`}
                className="bg-white border border-gray-100 p-4 rounded-2xl hover:border-indigo-100 group transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${
                    source.type === 'document' ? 'bg-indigo-50 text-indigo-600' :
                    source.type === 'url' ? 'bg-green-50 text-green-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {source.type === 'document' ? <FileText className="w-5 h-5" /> :
                     source.type === 'url' ? <Globe className="w-5 h-5" /> :
                     <Database className="w-5 h-5" />}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      {source.file || source.url || 'CMS Data'}
                      {source.url && <a href={source.url} target="_blank" rel="noreferrer"><ExternalLink className="w-3 h-3 text-gray-400" /></a>}
                    </h5>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Processed</span>
                      <span>•</span>
                      <span>{source.chunkCount} chunks</span>
                      <span>•</span>
                      <span>{Math.round(source.totalCharacters / 1000)}k chars</span>
                      <span>•</span>
                      <span>{new Date(source.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteSource(source.type, source.hash)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl text-center">
             <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 text-sm">No knowledge sources added yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default KnowledgeSourcesStep;
