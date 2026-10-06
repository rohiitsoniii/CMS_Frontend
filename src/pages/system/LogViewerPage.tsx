import React, { useEffect, useState, useRef } from 'react';

interface LogEntry {
  level: number | { level: string };
  time?: number;
  msg?: string;
  requestId?: string;
  tenantId?: string;
  [key: string]: any;
}

export const LogViewerPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaused) return;

    // Use absolute URL if in dev, else relative
    const sseUrl = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api/v1/system/logs/stream` 
      : '/api/v1/system/logs/stream';
      
    // Ideally we'd pass auth token. Standard EventSource doesn't support headers easily natively.
    // Assuming cookie-based auth or we use a polyfill/custom fetch like @microsoft/fetch-event-source
    // For this implementation, we assume basic EventSource works or auth is handled.
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const parsed: LogEntry = JSON.parse(event.data);
        setLogs(prev => [...prev.slice(-999), parsed]); // Keep last 1000 logs
      } catch (err) {
        console.error('Failed to parse log entry', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isPaused]);

  useEffect(() => {
    // Auto scroll
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col bg-gray-900 text-gray-100 font-mono">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Real-time Log Stream</h1>
        <div className="space-x-4">
          <button 
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Clear
          </button>
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 rounded ${isPaused ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto bg-black p-4 rounded border border-gray-800"
      >
        {logs.length === 0 ? (
          <p className="text-gray-500 italic">Waiting for logs...</p>
        ) : (
          logs.map((log, idx) => {
            const levelStr = typeof log.level === 'object' ? log.level.level : String(log.level);
            const levelVal = typeof log.level === 'number' ? log.level : 30;
            const levelColor = levelStr === 'error' || levelVal >= 50 ? 'text-red-400' :
                             levelStr === 'warn' || levelVal === 40 ? 'text-yellow-400' :
                             'text-green-400';
            
            const timestamp = log.time ? new Date(log.time).toISOString() : new Date().toISOString();

            return (
              <div key={idx} className="mb-2 text-sm border-b border-gray-800 pb-1">
                <span className="text-gray-500 mr-2">[{timestamp}]</span>
                <span className={`font-bold uppercase w-16 inline-block ${levelColor}`}>
                  {levelStr}
                </span>
                <span className="text-blue-300 mr-2">
                  {log.requestId ? `[req:${log.requestId.slice(0,8)}]` : ''}
                </span>
                <span className="text-gray-100">{log.msg || JSON.stringify(log)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
