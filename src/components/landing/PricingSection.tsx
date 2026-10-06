import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for trying out the platform',
    features: [
      '1 project',
      '1,000 content items',
      '2 team members',
      '10GB storage',
      '10,000 API calls/month',
      'Community support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Starter',
    price: { monthly: 29, yearly: 290 },
    description: 'For freelancers and small teams',
    features: [
      '3 projects',
      '10,000 content items',
      '5 team members',
      '50GB storage',
      '100,000 API calls/month',
      'Email support',
      'Webhooks',
      'Localization',
    ],
    cta: 'Start Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: { monthly: 99, yearly: 990 },
    description: 'For growing businesses',
    features: [
      '10 projects',
      '100,000 content items',
      '15 team members',
      '200GB storage',
      '1M API calls/month',
      'Priority support',
      'All features unlocked',
      'Custom domains',
      'Advanced workflows',
      'Audit logs',
    ],
    cta: 'Start Trial',
    popular: true,
  },
  {
    name: 'Business',
    price: { monthly: 299, yearly: 2990 },
    description: 'For mid-market companies',
    features: [
      '50 projects',
      '1M content items',
      '50 team members',
      '1TB storage',
      '10M API calls/month',
      '24/7 support',
      'SSO',
      'SLA guarantee',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for you
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start free, upgrade as you grow. All plans include 14-day free trial.
        </p>

        {/* Billing Toggle */}
        <div className="mt-10 flex justify-center">
          <div className="relative flex rounded-lg bg-white p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative rounded-md px-6 py-2 text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative rounded-md px-6 py-2 text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col p-8 ${
                plan.popular ? 'border-2 border-blue-600 shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price[billingCycle]}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-base font-medium text-gray-600">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </p>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-blue-600" />
                      <span className="ml-3 text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/signup" className="mt-8">
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-600">
          Need a custom plan?{' '}
          <Link to="/contact" className="font-semibold text-blue-600 hover:text-blue-500">
            Contact our sales team
          </Link>
        </p>
      </div>
    </section>
  );
}
