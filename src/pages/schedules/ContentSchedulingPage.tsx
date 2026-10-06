import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, Trash2, Play, Pause, AlertCircle } from 'lucide-react';
import { scheduleService, Schedule } from '../../services/scheduleService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export const ContentSchedulingPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSchedules();
    }, [projectId]);

    const loadSchedules = async () => {
        if (!projectId) return;
        try {
            // Load both upcoming and history
            const [upcoming, history] = await Promise.all([
                scheduleService.getUpcoming(projectId),
                scheduleService.getHistory(projectId)
            ]);
            setSchedules([...upcoming, ...history]);
        } catch (error) {
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await scheduleService.deleteSchedule(id);
            toast.success('Schedule deleted');
            loadSchedules();
        } catch (error) {
            toast.error('Failed to delete schedule');
        }
    };

    const handleExecuteNow = async (id: string) => {
        try {
            await scheduleService.executeNow(id);
            toast.success('Executed successfully');
            loadSchedules();
        } catch (error) {
            toast.error('Execution failed');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            case 'processing': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
            default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading schedules...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Calendar className="w-6 h-6" />
                        Content Scheduling
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Automate your content publishing workflow</p>
                </div>
                {/* Note: Creation usually happens from Content Editor, but we can add a manual button if needed */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.map(schedule => (
                    <div key={schedule._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(schedule.status || 'pending')}`}>
                                {schedule.status}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {schedule.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleExecuteNow(schedule._id!)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                            title="Execute Now"
                                        >
                                            <Play className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => scheduleService.pauseSchedule(schedule._id!)}
                                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                                            title="Pause"
                                        >
                                            <Pause className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDelete(schedule._id!)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-lg dark:text-white truncate" title={schedule.contentId}>
                                {schedule.action === 'publish' ? 'Publish' : 'Unpublish'} Content
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {schedule.contentId}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <Clock className="w-4 h-4" />
                            {format(new Date(schedule.scheduledFor), 'PPp')}
                        </div>

                        {schedule.recurring?.enabled && (
                            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                                <AlertCircle className="w-4 h-4" />
                                Repeats {schedule.recurring.frequency}
                            </div>
                        )}

                        {schedule.error && (
                            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs rounded border border-red-100 dark:border-red-800">
                                Error: {schedule.error}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {schedules.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>No scheduled tasks found.</p>
                </div>
            )}
        </div>
    );
};
