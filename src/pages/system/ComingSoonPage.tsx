import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComingSoonPageProps {
    title: string;
    description: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center mb-6">
                <Construction className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-2">{description}</p>
            <p className="text-sm text-indigo-500 dark:text-indigo-400 font-medium mb-8">
                This section is under active development
            </p>
            <Link
                to="/admin/system"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to System Dashboard
            </Link>
        </div>
    );
}

export default ComingSoonPage;
