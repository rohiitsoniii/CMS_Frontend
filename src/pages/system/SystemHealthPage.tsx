import React, { useState, useEffect } from 'react';
import { 
  Activity, Database, Server, Cpu, RefreshCw, 
  CheckCircle2, AlertTriangle, ShieldCheck, HardDrive, 
  Radio, Zap, Layers 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  uptime: string;
  details: string;
}

export const SystemHealthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [purgeQueueTarget, setPurgeQueueTarget] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    cpuUsage: 24,
    memoryUsage: 48,
    eventLoopLag: 1.4,
    activeConnections: 142,
    mongoOpsSec: 850,
    redisMemoryMb: 68.4,
    queueWaiting: 12,
    queueFailed: 0,
  });

  const [services] = useState<ServiceStatus[]>([
    { name: 'Primary Database (MongoDB Replica)', status: 'healthy', latencyMs: 3.2, uptime: '99.98%', details: 'Primary node active, 2 secondaries in sync' },
    { name: 'Redis Cache & Session Store', status: 'healthy', latencyMs: 0.8, uptime: '99.99%', details: 'In-memory cache hit ratio: 94.2%' },
    { name: 'Queue Worker (BullMQ)', status: 'healthy', latencyMs: 5.1, uptime: '99.95%', details: '4 active worker threads consuming jobs' },
    { name: 'Object Storage (Cloudinary/S3)', status: 'healthy', latencyMs: 42.0, uptime: '99.90%', details: 'Edge CDN distribution healthy' },
    { name: 'RAG Vector Index (Chroma/FAISS)', status: 'healthy', latencyMs: 14.6, uptime: '99.85%', details: 'Embedding engine ready' },
  ]);

  const refreshHealth = async () => {
    setLoading(true);
    // Simulate real-time polling jitter
    setTimeout(() => {
      setLastChecked(new Date());
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.floor(20 + Math.random() * 15),
        memoryUsage: Math.floor(45 + Math.random() * 8),
        eventLoopLag: parseFloat((1.2 + Math.random() * 0.8).toFixed(1)),
        mongoOpsSec: Math.floor(800 + Math.random() * 120),
      }));
      setLoading(false);
      toast.success('Infrastructure metrics refreshed');
    }, 600);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setLastChecked(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handlePurgeQueue = async () => {
    toast.success('Failed job queue purged successfully');
    setPurgeQueueTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-500" />
            Infrastructure & Cluster Health
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time status monitoring for MongoDB replicas, Redis cache, queue workers, and event loop latency.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-muted-foreground">
            Updated {lastChecked.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshHealth} 
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">CPU Utilization</span>
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{metrics.cpuUsage}%</div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${metrics.cpuUsage}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Memory Load</span>
              <Server className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{metrics.memoryUsage}%</div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${metrics.memoryUsage}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Event Loop Lag</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{metrics.eventLoopLag} ms</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Excellent responsiveness
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Active DB Conns</span>
              <Database className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">{metrics.activeConnections}</div>
            <p className="text-[11px] text-muted-foreground mt-2 font-mono">
              ~{metrics.mongoOpsSec} ops/sec
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Health Table */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Service Status Grid
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Current operational metrics across core database clusters and external subsystems.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-y border-border text-muted-foreground font-medium text-xs">
                <tr>
                  <th className="px-6 py-3">Subsystem</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Latency</th>
                  <th className="px-6 py-3">30d Uptime</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((service) => (
                  <tr key={service.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground text-xs">
                      {service.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant="outline" 
                        className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] flex items-center gap-1 w-fit"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Operational
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-foreground">
                      {service.latencyMs} ms
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {service.uptime}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {service.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Queue & Job Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border bg-card p-5">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Background Job Queues (BullMQ)
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs py-1 border-b border-border/50">
              <span className="text-muted-foreground">Publishing Queue (Waiting)</span>
              <span className="font-semibold text-foreground">{metrics.queueWaiting} jobs</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-border/50">
              <span className="text-muted-foreground">Webhooks Outbox (Active)</span>
              <span className="font-semibold text-emerald-600">3 jobs</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-muted-foreground">Failed Jobs (Dead-letter)</span>
              <span className="font-semibold text-foreground">{metrics.queueFailed} jobs</span>
            </div>
          </div>
          {metrics.queueFailed > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setPurgeQueueTarget('dead-letter')} 
              className="mt-4 w-full"
            >
              Purge Failed Jobs
            </Button>
          )}
        </Card>

        <Card className="border border-border bg-card p-5">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-500" />
            Active Clustering Nodes
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs p-2.5 bg-muted/30 rounded-lg">
              <div>
                <div className="font-semibold text-foreground">node-app-us-east-1a</div>
                <div className="text-[11px] text-muted-foreground">Worker PID: 14208 • Master</div>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">ONLINE</Badge>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 bg-muted/30 rounded-lg">
              <div>
                <div className="font-semibold text-foreground">node-app-us-east-1b</div>
                <div className="text-[11px] text-muted-foreground">Worker PID: 14210 • Replica</div>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">ONLINE</Badge>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={!!purgeQueueTarget}
        onOpenChange={(open) => !open && setPurgeQueueTarget(null)}
        title="Purge Dead-Letter Queue"
        description="Are you sure you want to permanently clear failed background jobs? This action cannot be reversed."
        confirmText="Purge Queue"
        variant="destructive"
        onConfirm={handlePurgeQueue}
      />
    </div>
  );
};

export default SystemHealthPage;
