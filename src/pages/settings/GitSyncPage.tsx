import { useState } from 'react';
import { GitBranch, Github, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export function GitSyncPage() {
    const [repo, setRepo] = useState('org/headless-content');
    const [branch, setBranch] = useState('main');
    const [token, setToken] = useState('ghp_****************');
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState('2 hours ago');

    const handleSync = async () => {
        setIsSyncing(true);
        // Fake API call
        setTimeout(() => {
            setIsSyncing(false);
            setLastSync('Just now');
            toast.success("Successfully pushed to GitHub!");
        }, 2000);
    }

    return (
        <div className="p-8 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                    Content-as-Code (Git Sync)
                </h1>
                <p className="text-gray-500 mt-2">Bi-directionally synchronize your schemas and content with a Git repository.</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                            <Github className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Repository Connection</h3>
                            <p className="text-sm text-gray-500">Configure where your content lives</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Repository Name</label>
                            <input 
                                value={repo} onChange={(e) => setRepo(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-flex items-center gap-2">
                                <GitBranch className="w-4 h-4 inline" /> Target Branch
                            </label>
                            <input 
                                value={branch} onChange={(e) => setBranch(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Personal Access Token (PAT)</label>
                        <input 
                            type="password"
                            value={token} onChange={(e) => setToken(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100" 
                        />
                        <p className="text-xs text-gray-500">Requires `repo` scope to commit content.</p>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 px-8 py-5 rounded-xl">
                            <Save className="w-4 h-4 mr-2" /> Save Configuration
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-800/30">
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-4">
                        <RefreshCw className="w-5 h-5 text-indigo-500" /> Manual Sync
                    </h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-6 leading-relaxed">
                        Push all your current schemas and content into the Git repository as JSON and Markdown files.
                    </p>
                    <Button 
                        onClick={handleSync} disabled={isSyncing}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-xl transition-all"
                    >
                        {isSyncing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        {isSyncing ? 'Syncing to GitHub...' : 'Trigger Sync Now'}
                    </Button>
                    <p className="text-xs text-indigo-500/70 mt-3 text-center">Last sync: {lastSync}</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-6 border border-amber-100 dark:border-amber-800/30">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500" /> Webhook Setup
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4 leading-relaxed">
                        To receive incoming content updates when files change in GitHub, set up a webhook in your repository settings:
                    </p>
                    <code className="block p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-xs font-mono text-amber-800 dark:text-amber-200 break-all select-all">
                        https://api.yourcms.com/v1/deployments/github-webhook
                    </code>
                </div>
            </div>
        </div>
    );
}
