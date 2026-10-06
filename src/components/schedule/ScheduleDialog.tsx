import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { scheduleService } from '../../services/scheduleService';
import { toast } from 'react-hot-toast';

interface ScheduleDialogProps {
    contentId: string;
    projectId: string;
    contentTitle: string;
    contentType: string;
    onScheduled?: () => void;
}

export function ScheduleDialog({ contentId, projectId, contentTitle, contentType, onScheduled }: ScheduleDialogProps) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');
    const [action, setAction] = useState<'publish' | 'unpublish'>('publish');

    const handleSubmit = async () => {
        if (!date || !time) {
            toast.error("Please select both date and time");
            return;
        }

        try {
            const scheduledFor = new Date(`${date}T${time}`).toISOString();
            await scheduleService.createSchedule({
                contentId,
                projectId,
                action,
                scheduledFor,
                contentTitle, // Pass required fields
                contentType,  // Pass required fields
                recurring: { enabled: false, frequency: 'daily' }
            } as any); // Type assertion needed due to partial mismatch in frontend/backend models

            toast.success(`Content scheduled to ${action}`);
            setOpen(false);
            onScheduled?.();
        } catch (error) {
            toast.error('Failed to schedule content');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule Content</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label>Action</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={action}
                            onChange={(e) => setAction(e.target.value as 'publish' | 'unpublish')}
                        >
                            <option value="publish">Publish</option>
                            <option value="unpublish">Unpublish</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <label>Date</label>
                        <input
                            type="date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={date}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label>Time</label>
                        <input
                            type="time"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSubmit} className="w-full mt-4">
                        Confirm Schedule
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
