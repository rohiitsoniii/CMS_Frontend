import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) {
    return null;
  }

  if (showRestored) {
    return (
      <aside aria-label="Connection Restored" className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
        <Wifi className="w-3.5 h-3.5" />
        <span>Internet connection restored</span>
      </aside>
    );
  }

  return (
    <aside aria-label="Offline Alert" className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-600/95 dark:bg-amber-600/90 text-white text-xs font-semibold shadow-xl backdrop-blur-md border border-amber-400/40 animate-in fade-in slide-in-from-top-2 duration-300">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>Offline Mode — Content changes will not save until reconnected</span>
    </aside>
  );
}

export default OfflineBanner;
