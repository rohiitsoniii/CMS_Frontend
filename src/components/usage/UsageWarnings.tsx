import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface UsageWarning {
  type: 'projects' | 'contentItems' | 'teamMembers' | 'storage' | 'apiCalls';
  used: number;
  limit: number;
  percent: number;
}

export function UsageWarnings() {
  const [warnings, setWarnings] = useState<UsageWarning[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const { data } = await api.get('/billing/usage');
      const newWarnings: UsageWarning[] = [];

      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (value.limit !== -1) {
          const percent = (value.used / value.limit) * 100;
          if (percent >= 80) {
            newWarnings.push({
              type: key as any,
              used: value.used,
              limit: value.limit,
              percent
            });
          }
        }
      });

      setWarnings(newWarnings);
    } catch (error) {
      // Silently fail
    }
  };

  const handleDismiss = (type: string) => {
    setDismissed(new Set(dismissed).add(type));
  };

  const getWarningMessage = (warning: UsageWarning) => {
    const label = warning.type.replace(/([A-Z])/g, ' $1').toLowerCase();
    if (warning.percent >= 100) {
      return `You've reached your ${label} limit (${warning.used}/${warning.limit}). Upgrade to continue.`;
    }
    if (warning.percent >= 90) {
      return `You're approaching your ${label} limit (${warning.used}/${warning.limit}). Consider upgrading.`;
    }
    return `You're using ${Math.round(warning.percent)}% of your ${label} (${warning.used}/${warning.limit}).`;
  };

  const visibleWarnings = warnings.filter(w => !dismissed.has(w.type));

  if (visibleWarnings.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visibleWarnings.map((warning) => (
        <Alert key={warning.type} variant={warning.percent >= 100 ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Usage Warning</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{getWarningMessage(warning)}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate('/dashboard/billing')}>
                Upgrade
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDismiss(warning.type)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
