import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Calendar, Clock, Play, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { scheduleService, Schedule } from '@/services/scheduleService';
import { ContentSchedulesSkeleton } from '@/components/skeletons';

export function SchedulesPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [upcoming, setUpcoming] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

    useEffect(() => {
        loadSchedules();
        loadUpcoming();
    }, [projectId]);

    const loadSchedules = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            const data = await scheduleService.getSchedules(projectId);
            setSchedules(data);
        } catch (error) {
            console.error('Failed to load schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUpcoming = async () => {
        if (!projectId) return;

        try {
            const data = await scheduleService.getUpcoming(projectId, 5);
            setUpcoming(data);
        } catch (error) {
            console.error('Failed to load upcoming schedules:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this schedule?')) {
            return;
        }

        try {
            await scheduleService.deleteSchedule(id);
            setSchedules(schedules.filter(s => s._id !== id));
            loadUpcoming();
        } catch (error) {
            console.error('Failed to delete schedule:', error);
            toast.error('Failed to delete schedule');
        }
    };

    const handleExecuteNow = async (id: string) => {
        if (!confirm('Execute this schedule now?')) {
            return;
        }

        try {
            await scheduleService.executeNow(id);
            loadSchedules();
            loadUpcoming();
        } catch (error) {
            console.error('Failed to execute schedule:', error);
            toast.error('Failed to execute schedule');
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
            case 'failed':
                return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
            default:
                return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
        }
    };

    const filteredSchedules = schedules.filter(s => {
        if (filter === 'all') return true;
        return s.status === filter;
    });

    if (loading) {
        return <ContentSchedulesSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Content Scheduling
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Schedule content to publish or unpublish automatically
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/dashboard/project/${projectId}/schedules/new`)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create Schedule
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Filters */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'pending'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'completed'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setFilter('failed')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'failed'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Failed
                            </button>
                        </div>

                        {/* Schedules List */}
                        {filteredSchedules.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                                <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No schedules yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Create your first schedule to automate content publishing
                                </p>
                                <button
                                    onClick={() => navigate(`/dashboard/project/${projectId}/schedules/new`)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create First Schedule
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredSchedules.map((schedule) => (
                                    <div
                                        key={schedule._id}
                                        className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(schedule.status)}`}>
                                                        {getStatusIcon(schedule.status)}
                                                        {schedule.status}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${schedule.action === 'publish'
                                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                            : schedule.action === 'unpublish'
                                                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                                                                : 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                        {schedule.action}
                                                    </span>
                                                    {schedule.recurring?.enabled && (
                                                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
                                                            Recurring ({schedule.recurring.frequency})
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        Scheduled for {new Date(schedule.scheduledFor).toLocaleString()}
                                                    </span>
                                                </div>
                                                {schedule.timezone && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Timezone: {schedule.timezone}
                                                    </div>
                                                )}
                                                {schedule.error && (
                                                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                        Error: {schedule.error}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {schedule.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleExecuteNow(schedule._id!)}
                                                        className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                        title="Execute now"
                                                    >
                                                        <Play className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(schedule._id!)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Upcoming */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Upcoming
                            </h3>
                            {upcoming.length === 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    No upcoming schedules
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {upcoming.map((schedule) => (
                                        <div
                                            key={schedule._id}
                                            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${schedule.action === 'publish'
                                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                                                    }`}>
                                                    {schedule.action}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {new Date(schedule.scheduledFor).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
