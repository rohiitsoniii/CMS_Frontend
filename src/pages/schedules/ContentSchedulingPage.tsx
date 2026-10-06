import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, Trash2, Play, Pause, AlertCircle, RefreshCw } from 'lucide-react';
import { scheduleService, Schedule } from '../../services/scheduleService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const ContentSchedulingPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);

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
        } catch {
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteScheduleId) return;
        try {
            await scheduleService.deleteSchedule(deleteScheduleId);
            toast.success('Schedule deleted');
            loadSchedules();
        } catch {
            toast.error('Failed to delete schedule');
        } finally {
            setDeleteScheduleId(null);
        }
    };

    const handleExecuteNow = async (id: string) => {
        try {
            await scheduleService.executeNow(id);
            toast.success('Executed successfully');
            loadSchedules();
        } catch {
            toast.error('Execution failed');
        }
    };

    const handlePause = async (id: string) => {
        try {
            await scheduleService.pauseSchedule(id);
            toast.success('Schedule paused');
            loadSchedules();
        } catch {
            toast.error('Failed to pause schedule');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'failed': return 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'processing': return 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'cancelled': return 'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
            default: return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Loading schedules...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                        <Calendar className="w-6 h-6 text-primary" />
                        Content Scheduling
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Automate your content publishing and unpublishing timeline</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.map(schedule => (
                    <div key={schedule._id} className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusColor(schedule.status || 'pending')}`}>
                                {schedule.status}
                            </span>
                            <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                {schedule.status === 'pending' && (
                                    <>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleExecuteNow(schedule._id!)}
                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                            title="Execute Now"
                                            aria-label="Execute Now"
                                        >
                                            <Play className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handlePause(schedule._id!)}
                                            className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                                            title="Pause"
                                            aria-label="Pause"
                                        >
                                            <Pause className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setDeleteScheduleId(schedule._id!)}
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    title="Delete Schedule"
                                    aria-label="Delete Schedule"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate" title={schedule.contentId}>
                                {schedule.action === 'publish' ? 'Publish' : 'Unpublish'} Content
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate font-mono">ID: {schedule.contentId}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span>{format(new Date(schedule.scheduledFor), 'PPp')}</span>
                        </div>

                        {schedule.recurring?.enabled && (
                            <div className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400 mt-2 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1.5 rounded-md border border-purple-200 dark:border-purple-800">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Repeats {schedule.recurring.frequency}</span>
                            </div>
                        )}

                        {schedule.error && (
                            <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs rounded-md border border-red-200 dark:border-red-800">
                                Error: {schedule.error}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {schedules.length === 0 && (
                <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/60" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">No scheduled tasks found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                        Schedules created from the Content Editor will appear here automatically.
                    </p>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteScheduleId}
                onOpenChange={(open) => !open && setDeleteScheduleId(null)}
                title="Delete Schedule"
                description="Are you sure you want to delete this scheduled task? This action cannot be undone."
                confirmText="Delete"
                onConfirm={handleDelete}
            />
        </div>
    );
};
export default ContentSchedulingPage;
