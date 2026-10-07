/**
 * Real-Time Collaboration Hook
 * 
 * React hook for real-time collaboration features
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store';

interface User {
  id: string;
  name: string;
  email: string;
  color: string;
}

interface Editor {
  userId: string;
  user: User;
  cursorPosition?: number;
}

interface UseCollaborationOptions {
  contentId?: string;
  onContentChange?: (changes: any) => void;
  onEditorsChange?: (editors: Editor[]) => void;
  enabled?: boolean;
}

export function useCollaboration({
  contentId,
  onContentChange,
  onEditorsChange,
  enabled = true,
}: UseCollaborationOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [presence, setPresence] = useState<Array<{ socketId: string; user: User }>>([]);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!enabled) return;

    const token = useAuthStore.getState().accessToken || localStorage.getItem('token');
    if (!token) return;

    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/v1\/?$/, '');
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to collaboration server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from collaboration server');
      setConnected(false);
    });

    // Presence events
    newSocket.on('presence:init', (presenceList: any[]) => {
      setPresence(presenceList);
    });

    newSocket.on('presence:join', (data: { socketId: string; user: User }) => {
      setPresence((prev) => [...prev, data]);
    });

    newSocket.on('presence:leave', (data: { socketId: string }) => {
      setPresence((prev) => prev.filter((p) => p.socketId !== data.socketId));
    });

    return () => {
      newSocket.close();
    };
  }, [enabled]);

  // Join content editing
  useEffect(() => {
    if (!socket || !contentId || !connected) return;

    console.log(`📝 Joining content: ${contentId}`);
    socket.emit('content:join', contentId);

    // Listen for editors
    socket.on('content:editors', (editorList: Editor[]) => {
      setEditors(editorList);
      onEditorsChange?.(editorList);
    });

    socket.on('content:editor-join', (data: { userId: string; user: User }) => {
      setEditors((prev) => {
        const updated = [...prev, { userId: data.userId, user: data.user }];
        onEditorsChange?.(updated);
        return updated;
      });
    });

    socket.on('content:editor-leave', (data: { userId: string }) => {
      setEditors((prev) => {
        const updated = prev.filter((e) => e.userId !== data.userId);
        onEditorsChange?.(updated);
        return updated;
      });
    });

    // Listen for content changes
    socket.on('content:change', (data: { userId: string; changes: any }) => {
      onContentChange?.(data.changes);
    });

    // Listen for cursor updates
    socket.on('cursor:update', (data: { userId: string; user: User; position: number }) => {
      setEditors((prev) =>
        prev.map((e) =>
          e.userId === data.userId ? { ...e, cursorPosition: data.position } : e
        )
      );
    });

    return () => {
      socket.emit('content:leave', contentId);
      socket.off('content:editors');
      socket.off('content:editor-join');
      socket.off('content:editor-leave');
      socket.off('content:change');
      socket.off('cursor:update');
    };
  }, [socket, contentId, connected, onContentChange, onEditorsChange]);

  // Send content update
  const sendUpdate = useCallback(
    (changes: any) => {
      if (socket && contentId && connected) {
        socket.emit('content:update', {
          contentId,
          userId: socket.id,
          changes,
          timestamp: new Date(),
        });
      }
    },
    [socket, contentId, connected]
  );

  // Send cursor position
  const sendCursorPosition = useCallback(
    (position: number) => {
      if (socket && contentId && connected) {
        socket.emit('cursor:move', { contentId, position });
      }
    },
    [socket, contentId, connected]
  );

  // Typing indicators
  const startTyping = useCallback(() => {
    if (socket && contentId && connected) {
      socket.emit('typing:start', contentId);
    }
  }, [socket, contentId, connected]);

  const stopTyping = useCallback(() => {
    if (socket && contentId && connected) {
      socket.emit('typing:stop', contentId);
    }
  }, [socket, contentId, connected]);

  return {
    connected,
    editors,
    presence,
    sendUpdate,
    sendCursorPosition,
    startTyping,
    stopTyping,
  };
}

export default useCollaboration;
