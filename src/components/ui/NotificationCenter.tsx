import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '@/services/api';
import { Bell, Loader2, Workflow, AlertCircle, Info, MessageSquare, PartyPopper } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuTitle,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationAPI.getAll({ limit: 20 });
      return response.data;
    },
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔔 Connected to notifications gateway');
    });

    socket.on('notification:new', (notification: any) => {
      console.log('🎉 New notification received:', notification);
      
      // 1. Refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // 2. Clear visual feedback
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-indigo-500 overflow-hidden`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                   <PartyPopper className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {notification.title}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 5000, position: 'top-right' });
    });

    return () => {
      if (socket) socket.close();
    };
  }, [queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.pagination?.totalUnread || 0;

  const getIcon = (type: string, status: string) => {
    if (type === 'workflow') return <Workflow className="w-4 h-4 text-purple-500" />;
    if (type === 'mention') return <MessageSquare className="w-4 h-4 text-blue-500" />;
    if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Info className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-gray-900" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[380px] p-0 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden">
        <DropdownMenuHeader className="px-4 py-3 border-b flex flex-row items-center justify-between border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2">
             <DropdownMenuTitle className="text-sm font-semibold">Notifications</DropdownMenuTitle>
             {unreadCount > 0 && (
                 <Badge variant="default" className="text-[10px] h-5 px-1.5">
                     {unreadCount} new
                 </Badge>
             )}
          </div>
          {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-indigo-600 dark:text-indigo-400 p-0 hover:bg-transparent"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </Button>
          )}
        </DropdownMenuHeader>

        <ScrollArea className="h-[400px] w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
                <p className="text-xs">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">All caught up!</p>
                <p className="text-xs text-gray-500 mt-1">You have no new notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notif: any) => (
                <div 
                  key={notif._id} 
                  className={`p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${notif.read ? 'opacity-60' : 'bg-indigo-50/30 dark:bg-indigo-900/10'}`}
                >
                    <div className="mt-1 shrink-0">
                        {getIcon(notif.type, notif.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">
                                {notif.title}
                            </p>
                            <span className="text-[10px] text-gray-500 shrink-0 whitespace-nowrap">
                                {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {notif.message}
                        </p>
                        
                        {!notif.read && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 mt-2 text-[10px] px-2 text-indigo-600 dark:text-indigo-400"
                                onClick={() => markAsReadMutation.mutate(notif._id)}
                            >
                                Mark as read
                            </Button>
                        )}
                    </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
