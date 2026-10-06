import { useState } from 'react';
import { api } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentCalendarSkeleton } from '@/components/skeletons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import toast from 'react-hot-toast';

interface ScheduledContent {
    id: string;
    name: string;
    type: string;
    status: string;
    publishAt?: Date;
    unpublishAt?: Date;
    recurring?: {
        pattern: string;
        endDate?: Date;
    };
    author: {
        name: string;
        email: string;
    };
}

export function ContentCalendar() {
    const { projectId } = useParams();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Fetch calendar data
    const { data: calendarData, isLoading } = useQuery({
        queryKey: ['calendar', projectId, currentMonth],
        queryFn: async () => {
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);

            try {
                const response = await api.get(
                    `/projects/${projectId}/content/schedule/calendar?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
                );
                return (response.data?.data?.calendar || response.data?.calendar || []) as ScheduledContent[];
            } catch (err) {
                return [] as ScheduledContent[];
            }
        },
    });

    // Get days in month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get content for a specific date
    const getContentForDate = (date: Date) => {
        if (!calendarData) return [];

        return calendarData.filter((content) => {
            const publishDate = content.publishAt ? new Date(content.publishAt) : null;
            const unpublishDate = content.unpublishAt ? new Date(content.unpublishAt) : null;

            return (
                (publishDate && isSameDay(publishDate, date)) ||
                (unpublishDate && isSameDay(unpublishDate, date))
            );
        });
    };

    const handlePreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleToday = () => {
        setCurrentMonth(new Date());
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <CalendarIcon className="w-8 h-8" />
                            Content Calendar
                        </h1>
                        <p className="text-gray-600 mt-1">
                            View and manage scheduled content
                        </p>
                    </div>
                    <Button onClick={() => toast.success('Coming soon!')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Content
                    </Button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handlePreviousMonth}>
                            ←
                        </Button>
                        <Button variant="outline" onClick={handleToday}>
                            Today
                        </Button>
                        <Button variant="outline" onClick={handleNextMonth}>
                            →
                        </Button>
                    </div>
                    <h2 className="text-2xl font-semibold">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            Publish
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                            Unpublish
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
                <ContentCalendarSkeleton />
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-lg border">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div
                                key={day}
                                className="p-4 text-center font-semibold text-gray-600 dark:text-gray-400"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                        {daysInMonth.map((day) => {
                            const contentForDay = getContentForDate(day);
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = isSameMonth(day, currentMonth);

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`min-h-[120px] p-2 border-r border-b ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800' : ''
                                        } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                    onClick={() => setSelectedDate(day)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className={`text-sm font-medium ${isToday
                                                    ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center'
                                                    : !isCurrentMonth
                                                        ? 'text-gray-400'
                                                        : ''
                                                }`}
                                        >
                                            {format(day, 'd')}
                                        </span>
                                        {contentForDay.length > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {contentForDay.length}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Scheduled Content */}
                                    <div className="space-y-1">
                                        {contentForDay.slice(0, 3).map((content) => {
                                            const isPublish = content.publishAt && isSameDay(new Date(content.publishAt), day);

                                            return (
                                                <div
                                                    key={content.id}
                                                    className={`text-xs p-1 rounded truncate ${isPublish
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                                        }`}
                                                    title={content.name}
                                                >
                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                    {content.name}
                                                </div>
                                            );
                                        })}
                                        {contentForDay.length > 3 && (
                                            <div className="text-xs text-gray-500 pl-1">
                                                +{contentForDay.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Day Detail Dialog */}
            {selectedDate && (
                <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {getContentForDate(selectedDate).length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No scheduled content for this day
                                </div>
                            ) : (
                                getContentForDate(selectedDate).map((content) => {
                                    const isPublish = content.publishAt && isSameDay(new Date(content.publishAt), selectedDate);

                                    return (
                                        <Card key={content.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold">{content.name}</h3>
                                                        <Badge variant="outline">{content.type}</Badge>
                                                        <Badge className={isPublish ? 'bg-green-500' : 'bg-red-500'}>
                                                            {isPublish ? 'Publish' : 'Unpublish'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        <div>
                                                            <Clock className="w-4 h-4 inline mr-1" />
                                                            {isPublish && content.publishAt && format(new Date(content.publishAt), 'h:mm a')}
                                                            {!isPublish && content.unpublishAt && format(new Date(content.unpublishAt), 'h:mm a')}
                                                        </div>
                                                        <div className="mt-1">By {content.author.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedDate(null)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
