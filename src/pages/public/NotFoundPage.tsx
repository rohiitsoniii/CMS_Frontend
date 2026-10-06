import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, FolderGit2, LifeBuoy, FileCode2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-xl w-full text-center">
        {/* Glow & 404 number */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500/30 to-purple-500/30 -z-10 rounded-full" />
          <span className="text-8xl sm:text-9xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent select-none">
            404
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Resource Not Found
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Lost in Headless Space?
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          The page or resource you are looking for has been moved, archived, or does not exist in this project.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-slate-300 dark:border-slate-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Link to="/dashboard">
              <Home className="w-4 h-4" />
              Main Dashboard
            </Link>
          </Button>
        </div>

        {/* Helpful links card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Quick Navigation
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Link
              to="/dashboard/projects"
              className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FolderGit2 className="w-4 h-4 text-indigo-500" />
              <span>Projects Directory</span>
            </Link>

            <Link
              to="/dashboard/content-types"
              className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FileCode2 className="w-4 h-4 text-purple-500" />
              <span>Content Schemas</span>
            </Link>

            <Link
              to="/dashboard/support"
              className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LifeBuoy className="w-4 h-4 text-pink-500" />
              <span>Help & Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
