import React, { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

interface Editor {
  userId: string;
  name: string;
  email: string;
  color: string;
  isTyping?: boolean;
}

interface Props {
  contentId: string;
  className?: string;
  /** Show typing indicator */
  showTypingIndicator?: boolean;
}

let socket: Socket | null = null;

function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/v1\/?$/, '');
    socket = io(baseUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
    });
  }
  return socket;
}

/**
 * CollaborationPresence
 *
 * Displays avatar dots for all users currently editing the same content item.
 * Connects to the existing Socket.IO collaboration service automatically.
 *
 * Usage:
 *   <CollaborationPresence contentId={content._id} />
 */
export const CollaborationPresence: React.FC<Props> = ({
  contentId,
  className = '',
  showTypingIndicator = true,
}) => {
  const { accessToken: token, user } = useAuthStore();
  const userId = user?.id || user?._id;
  const [editors, setEditors] = useState<Editor[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const initSocket = useCallback(() => {
    if (!token) return;
    const s = getSocket(token);

    s.on('connect', () => {
      s.emit('content:join', contentId);
    });

    s.on('content:editors', (initialEditors: Editor[]) => {
      // Exclude the current user from the list
      setEditors(initialEditors.filter(e => e.userId !== userId));
    });

    s.on('content:editor-join', ({ user: newEditor }: { user: Editor }) => {
      if (newEditor.userId === userId) return;
      setEditors(prev => {
        if (prev.find(e => e.userId === newEditor.userId)) return prev;
        return [...prev, newEditor];
      });
    });

    s.on('content:editor-leave', ({ userId }: { userId: string }) => {
      setEditors(prev => prev.filter(e => e.userId !== userId));
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    s.on('typing:user', ({ userId, typing }: { userId: string; typing: boolean }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (typing) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    // Handle reconnection
    s.on('reconnect', () => {
      s.emit('content:join', contentId);
    });

    return () => {
      s.emit('content:leave', contentId);
      s.off('content:editors');
      s.off('content:editor-join');
      s.off('content:editor-leave');
      s.off('typing:user');
    };
  }, [contentId, token, userId]);

  useEffect(() => {
    const cleanup = initSocket();
    return cleanup;
  }, [initSocket]);

  const typingEditors = editors.filter(e => typingUsers.has(e.userId));

  if (editors.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Avatar stack */}
      <div className="flex items-center">
        {editors.slice(0, 5).map((editor, i) => (
          <div
            key={editor.userId}
            className="relative group"
            style={{ marginLeft: i > 0 ? '-8px' : '0', zIndex: 10 - i }}
          >
            {/* Avatar circle */}
            <div
              className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:z-20"
              style={{ backgroundColor: editor.color }}
              title={`${editor.name || editor.email} is editing`}
            >
              {(editor.name || editor.email || '?').charAt(0).toUpperCase()}
            </div>

            {/* Typing pulsing ring */}
            {typingUsers.has(editor.userId) && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-gray-900 animate-pulse" />
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              {editor.name || editor.email}
              {typingUsers.has(editor.userId) && (
                <span className="text-green-400 ml-1">• typing</span>
              )}
            </div>
          </div>
        ))}

        {/* Overflow count */}
        {editors.length > 5 && (
          <div
            className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-400 flex items-center justify-center text-white text-[10px] font-bold"
            style={{ marginLeft: '-8px', zIndex: 5 }}
            title={`${editors.length - 5} more editor(s)`}
          >
            +{editors.length - 5}
          </div>
        )}
      </div>

      {/* Typing indicator text */}
      {showTypingIndicator && typingEditors.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          <span>
            {typingEditors.length === 1
              ? `${typingEditors[0].name || typingEditors[0].email} is typing...`
              : `${typingEditors.length} people are typing...`}
          </span>
        </div>
      )}

      {/* Live editing label */}
      {typingEditors.length === 0 && editors.length > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {editors.length === 1 ? '1 other editor' : `${editors.length} other editors`}
        </span>
      )}
    </div>
  );
};

/**
 * Hook to emit typing events from any input field
 */
export function useCollaborationTyping(contentId: string) {
  const { accessToken: token } = useAuthStore();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  const notifyTyping = useCallback(() => {
    if (!token) return;
    const s = getSocket(token);
    if (!isTyping) {
      s.emit('typing:start', contentId);
      setIsTyping(true);
    }

    // Stop typing after 2s of inactivity
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      s.emit('typing:stop', contentId);
      setIsTyping(false);
    }, 2000);
  }, [contentId, token, isTyping]);

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  return { notifyTyping };
}
