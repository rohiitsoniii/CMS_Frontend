import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Eye, RotateCw } from 'lucide-react';
import { api } from '@/services/api';
import { WebhookLogsSkeleton } from '@/components/skeletons';
import toast from 'react-hot-toast';

interface WebhookLog {
  _id: string;
  event: string;
  status: 'success' | 'failed' | 'pending' | 'retrying';
  response: {
    statusCode: number;
    body: string;
    duration: number;
  };
  error?: string;
  attempts: number;
  createdAt: string;
  webhookId: {
    name: string;
    url: string;
  };
}

export function WebhookLogsPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const [logsRes, statsRes] = await Promise.all([
        api.get('/webhooks/logs', { params }),
        api.get('/webhooks/logs/stats')
      ]);
      setLogs(logsRes.data.data || logsRes.data);
      setStats(statsRes.data.data || statsRes.data);
    } catch (error) {
      toast.error('Failed to load webhook logs');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (logId: string) => {
    try {
      await api.post(`/webhooks/logs/${logId}/retry`);
      toast.success('Retrying webhook...');
      setTimeout(loadData, 2000);
    } catch (error) {
      toast.error('Failed to retry webhook');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'retrying': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      retrying: 'bg-blue-100 text-blue-800'
    };
    return variants[status] || 'bg-gray-100';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Webhook Logs</h1>
          <p className="text-muted-foreground">Monitor webhook delivery history and status</p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byStatus?.success?.count || 0 + stats?.byStatus?.failed?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.byStatus?.success?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.byStatus?.failed?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byStatus?.success?.avgDuration 
                ? `${Math.round(stats.byStatus.success.avgDuration)}ms`
                : '0ms'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {loading ? (
              <WebhookLogsSkeleton />
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No webhook logs found</div>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="font-medium">{log.event}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.webhookId?.name || 'Unknown webhook'} • {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusBadge(log.status)}>{log.status}</Badge>
                    {log.response?.statusCode && (
                      <span className="text-sm text-muted-foreground">HTTP {log.response.statusCode}</span>
                    )}
                    {log.response?.duration && (
                      <span className="text-sm text-muted-foreground">{log.response.duration}ms</span>
                    )}
                    {log.status === 'failed' && (
                      <Button size="sm" variant="outline" onClick={() => handleRetry(log._id)}>
                        <RotateCw className="w-4 h-4 mr-1" />
                        Retry
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setSelectedLog(log)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Webhook Log Details</h3>
                <p className="text-sm text-muted-foreground">{selectedLog.event} • {new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>
              <Badge className={getStatusBadge(selectedLog.status)}>{selectedLog.status}</Badge>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Response Status</h4>
                <p className="font-mono text-sm">{selectedLog.response?.statusCode || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Duration</h4>
                <p className="font-mono text-sm">{selectedLog.response?.duration || '0'}ms</p>
              </div>
              {selectedLog.error && (
                <div>
                  <h4 className="text-sm font-medium mb-1 text-red-500">Error</h4>
                  <p className="text-sm text-red-500">{selectedLog.error}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium mb-1">Attempts</h4>
                <p className="text-sm">{selectedLog.attempts}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Response Body</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-40">
                  {selectedLog.response?.body || 'No response body'}
                </pre>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedLog(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}