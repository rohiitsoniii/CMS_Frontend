import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Download, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { billingAPI } from '@/services/api';
import toast from 'react-hot-toast';


interface Plan {
  name: string;
  price: number;
  limits: {
    projects: number;
    contentItems: number;
    teamMembers: number;
    storage: number;
    apiCalls: number;
  };
}

interface Subscription {
  plan: Plan;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface Usage {
  projects: { used: number; limit: number };
  contentItems: { used: number; limit: number };
  teamMembers: { used: number; limit: number };
  storage: { used: number; limit: number };
  apiCalls: { used: number; limit: number };
}

export function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const [subRes, usageRes, invoicesRes] = await Promise.all([
        billingAPI.getSubscription(),
        billingAPI.getUsage(),
        billingAPI.getInvoices()
      ]);
      setSubscription(subRes.data.data);
      setUsage(usageRes.data.data);
      setInvoices(invoicesRes.data.data || []);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load billing data');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleManageBilling = async () => {
    try {
      const response = await billingAPI.createPortalSession();
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to open billing portal');
    }
  };



  const getUsagePercent = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Usage</h1>
          <p className="text-muted-foreground">Manage your subscription and monitor usage</p>
        </div>
        <Button onClick={handleManageBilling}>
          <CreditCard className="w-4 h-4 mr-2" />
          Manage Billing
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Details</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{subscription.plan.name}</h3>
                      <p className="text-muted-foreground">
                        ${subscription.plan.price}/month
                      </p>
                    </div>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertCircle className="w-4 h-4" />
                      Subscription will cancel at period end
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active subscription</p>
                  <Button onClick={() => window.location.href = '/pricing'}>Upgrade Now</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {usage && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <UsageCard title="Projects" used={usage.projects.used} limit={usage.projects.limit} icon={<TrendingUp className="w-4 h-4" />} />
              <UsageCard title="Content Items" used={usage.contentItems.used} limit={usage.contentItems.limit} icon={<TrendingUp className="w-4 h-4" />} />
              <UsageCard title="Team Members" used={usage.teamMembers.used} limit={usage.teamMembers.limit} icon={<TrendingUp className="w-4 h-4" />} />
              <UsageCard title="Storage" used={usage.storage.used} limit={usage.storage.limit} unit="GB" icon={<TrendingUp className="w-4 h-4" />} />
              <UsageCard title="API Calls" used={usage.apiCalls.used} limit={usage.apiCalls.limit} icon={<TrendingUp className="w-4 h-4" />} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {usage && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Usage</CardTitle>
                <CardDescription>Current billing period usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(usage).map(([key, value]) => {
                  const percent = getUsagePercent(value.used, value.limit);
                  const color = getUsageColor(percent);
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className={color}>
                          {value.used} / {value.limit === -1 ? '∞' : value.limit}
                        </span>
                      </div>
                      <Progress value={percent} className="h-2" />
                      {percent >= 90 && (
                        <p className="text-xs text-red-600">⚠️ Approaching limit. Consider upgrading your plan.</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Download past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">${(invoice.amount / 100).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                        {invoice.invoicePdf && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={invoice.invoicePdf} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No invoices yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsageCard({ title, used, limit, unit = '', icon }: any) {
  const percent = limit === -1 ? 0 : Math.min((used / limit) * 100, 100);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{used}{unit}</div>
        <p className="text-xs text-muted-foreground">of {limit === -1 ? '∞' : `${limit}${unit}`}</p>
        <Progress value={percent} className="mt-2 h-1" />
        {percent >= 90 && <p className="text-xs text-red-600 mt-1">⚠️ Limit approaching</p>}
      </CardContent>
    </Card>
  );
}
