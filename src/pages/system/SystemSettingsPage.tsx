import React, { useState } from 'react';
import { 
  Settings, Mail, Shield, HardDrive, Bell, 
  Save, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';

export const SystemSettingsPage: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [maintenanceModeTarget, setMaintenanceModeTarget] = useState(false);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);

  const [formData, setFormData] = useState({
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    smtpUser: 'apikey',
    smtpPass: '••••••••••••••••••••',
    smtpFrom: 'noreply@headless-cms.io',
    rateLimitMax: '1000',
    rateLimitWindow: '15',
    storageProvider: 's3',
    s3Bucket: 'cms-production-assets',
    s3Region: 'us-east-1',
    maintenanceMode: false,
    enableTelemetry: true
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Global system configuration saved successfully');
    }, 600);
  };

  const handleToggleMaintenance = () => {
    setFormData(prev => ({ ...prev, maintenanceMode: maintenanceModeTarget }));
    toast.success(`Maintenance mode is now ${maintenanceModeTarget ? 'ENABLED' : 'DISABLED'}.`);
    setShowMaintenanceConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-primary" />
            Global Platform Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure system-wide SMTP relays, DDoS rate limits, storage providers, and maintenance windows.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMTP Gateway Settings */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <Mail className="w-4 h-4 text-primary" />
              SMTP & Mail Dispatch Gateway
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Outbound transactional email delivery service used for verification and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Host</label>
                <Input 
                  value={formData.smtpHost} 
                  onChange={e => setFormData({ ...formData, smtpHost: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Port</label>
                <Input 
                  value={formData.smtpPort} 
                  onChange={e => setFormData({ ...formData, smtpPort: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Username</label>
                <Input 
                  value={formData.smtpUser} 
                  onChange={e => setFormData({ ...formData, smtpUser: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Password / API Key</label>
                <Input 
                  type="password"
                  value={formData.smtpPass} 
                  onChange={e => setFormData({ ...formData, smtpPass: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Default From Address</label>
              <Input 
                value={formData.smtpFrom} 
                onChange={e => setFormData({ ...formData, smtpFrom: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Global Rate Limiting */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <Shield className="w-4 h-4 text-emerald-500" />
              DDoS & Global API Rate Limiting
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Protect tenant services and databases against scraping or brute-force floods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Max Requests / IP</label>
                <Input 
                  type="number"
                  value={formData.rateLimitMax} 
                  onChange={e => setFormData({ ...formData, rateLimitMax: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Window Duration (Minutes)</label>
                <Input 
                  type="number"
                  value={formData.rateLimitWindow} 
                  onChange={e => setFormData({ ...formData, rateLimitWindow: e.target.value })}
                />
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground leading-relaxed border border-border">
              Current policy allows up to <strong>{formData.rateLimitMax} requests</strong> every <strong>{formData.rateLimitWindow} minutes</strong> per client IP address before returning HTTP 429 Too Many Requests.
            </div>
          </CardContent>
        </Card>

        {/* Storage Provider */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <HardDrive className="w-4 h-4 text-indigo-500" />
              Default Object Storage Adapter
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Storage destination for uploaded media, cropped variants, and automated database backups.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Provider</label>
              <select
                value={formData.storageProvider}
                onChange={e => setFormData({ ...formData, storageProvider: e.target.value })}
                className="w-full text-xs border border-border rounded-lg bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="s3">Amazon Web Services (AWS S3)</option>
                <option value="cloudinary">Cloudinary Media Cloud</option>
                <option value="local">Local Persistent Volume</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Bucket Name</label>
                <Input 
                  value={formData.s3Bucket} 
                  onChange={e => setFormData({ ...formData, s3Bucket: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Region</label>
                <Input 
                  value={formData.s3Region} 
                  onChange={e => setFormData({ ...formData, s3Region: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance & Reliability */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Maintenance & Emergency Controls
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Halt public API access for cluster database migration or security patching.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-muted/20">
              <div>
                <div className="text-xs font-semibold text-foreground">Maintenance Mode</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Temporarily return HTTP 503 Service Unavailable to all tenant client traffic.
                </div>
              </div>
              <Button
                variant={formData.maintenanceMode ? "default" : "destructive"}
                size="sm"
                onClick={() => {
                  setMaintenanceModeTarget(!formData.maintenanceMode);
                  setShowMaintenanceConfirm(true);
                }}
                className="text-xs shrink-0"
              >
                {formData.maintenanceMode ? 'Disable Mode' : 'Enable Mode'}
              </Button>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input 
                type="checkbox"
                checked={formData.enableTelemetry}
                onChange={e => setFormData({ ...formData, enableTelemetry: e.target.checked })}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-xs text-foreground font-medium">Send anonymous cluster crash telemetry to system monitoring</span>
            </label>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showMaintenanceConfirm}
        onOpenChange={setShowMaintenanceConfirm}
        title={maintenanceModeTarget ? "Enable Platform Maintenance Mode" : "Disable Maintenance Mode"}
        description={maintenanceModeTarget ? "Enabling maintenance mode will immediately return HTTP 503 to all public API endpoints and content delivery CDN nodes. Are you sure?" : "Disabling maintenance mode will restore normal traffic."}
        confirmText={maintenanceModeTarget ? "Enable Maintenance Mode" : "Disable Maintenance Mode"}
        variant={maintenanceModeTarget ? "destructive" : "default"}
        onConfirm={handleToggleMaintenance}
      />
    </div>
  );
};

export default SystemSettingsPage;
