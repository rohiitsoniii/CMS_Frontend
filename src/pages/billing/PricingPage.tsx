import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface Plan {
  _id: string;
  name: string;
  price: number | { monthly: number; yearly: number };
  interval?: string;
  features: string[];
  limits?: {
    projects?: number;
    contentItems?: number;
    teamMembers?: number;
    storage?: number;
    apiCalls?: number;
    apiCallsPerMonth?: number;
    apiRateLimit?: number;
  };
  stripePriceId?: any;
}

export function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        api.get('/billing/plans'),
        api.get('/billing/subscription').catch(() => ({ data: null }))
      ]);
      setPlans(plansRes.data);
      setCurrentPlan(subRes.data?.plan?._id || null);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      const { data } = await api.post('/billing/subscription', { planId });
      const stripe = await stripePromise;
      if (stripe && data.sessionId) {
        await (stripe as any).redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start subscription');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">Scale as you grow with flexible pricing</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan._id === currentPlan;
          const isPopular = plan.name === 'Professional';
          
          return (
            <Card key={plan._id} className={isPopular ? 'border-primary shadow-lg' : ''}>
              {isPopular && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {isCurrent && <Badge>Current</Badge>}
                </CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">
                    ${typeof plan.price === 'number' ? plan.price : (plan.price?.monthly ?? 0)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Limits:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>{(plan.limits?.projects ?? 1) === -1 || (plan.limits?.projects ?? 1) >= 999999 ? 'Unlimited' : (plan.limits?.projects ?? 1)} Projects</li>
                    <li>{(plan.limits?.contentItems ?? 1000) === -1 || (plan.limits?.contentItems ?? 1000) >= 999999 ? 'Unlimited' : (plan.limits?.contentItems ?? 1000).toLocaleString()} Content Items</li>
                    <li>{(plan.limits?.teamMembers ?? 2) === -1 || (plan.limits?.teamMembers ?? 2) >= 999999 ? 'Unlimited' : (plan.limits?.teamMembers ?? 2)} Team Members</li>
                    <li>{(plan.limits?.storage ?? 10) === -1 || (plan.limits?.storage ?? 10) >= 999999 ? 'Unlimited' : (plan.limits?.storage ?? 10)} GB Storage</li>
                    <li>{(plan.limits?.apiCallsPerMonth ?? plan.limits?.apiCalls ?? 10000) === -1 || (plan.limits?.apiCallsPerMonth ?? plan.limits?.apiCalls ?? 10000) >= 999999 ? 'Unlimited' : (plan.limits?.apiCallsPerMonth ?? plan.limits?.apiCalls ?? 10000).toLocaleString()} API Calls/month</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Features:</p>
                  <ul className="space-y-2">
                    {(plan.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className="w-full"
                  variant={isPopular ? 'default' : 'outline'}
                  disabled={isCurrent || subscribing === plan._id || (typeof plan.price === 'number' ? plan.price === 0 : plan.price?.monthly === 0)}
                  onClick={() => handleSubscribe(plan._id)}
                >
                  {subscribing === plan._id ? (
                    'Processing...'
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (typeof plan.price === 'number' ? plan.price === 0 : plan.price?.monthly === 0) ? (
                    'Free Forever'
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>All plans include a 14-day free trial. Cancel anytime. No credit card required.</p>
        <p className="mt-2">Need a custom plan or enterprise pricing? <a href="/dashboard/support" className="text-primary hover:underline font-medium">Contact our team →</a></p>
      </div>
    </div>
  );
}
