'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  features: string[];
  trialDays: number;
}

interface Subscription {
  id: string;
  status: string;
  plan: Plan;
  currentPeriodEnd: string;
  trialEndsAt?: string;
}

export default function SubscriptionsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/subscriptions');
        setSubscription(res.data.subscription);
        setPlans(res.data.plans);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleUpgrade = async (planId: string) => {
    try {
      const res = await axios.post('/api/subscriptions', {
        planId,
        billingCycle: 'monthly',
      });

      // Here you would typically redirect to Razorpay payment page
      alert('Subscription updated! Order ID: ' + res.data.razorpayOrder.id);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upgrade subscription');
    }
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Subscription & Billing</h1>

      {subscription && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Current Plan: {subscription.plan.name}</h3>
          <p className="text-sm text-muted-foreground">
            Status: <span className="font-semibold capitalize">{subscription.status}</span>
          </p>
          {subscription.trialEndsAt && (
            <p className="text-sm text-muted-foreground mt-1">
              Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground text-sm">{plan.description}</p>

              <div className="space-y-2">
                <p className="text-3xl font-bold">₹{plan.monthlyPrice}</p>
                <p className="text-xs text-muted-foreground">per month</p>
                {plan.yearlyPrice && (
                  <p className="text-xs text-muted-foreground">
                    or ₹{plan.yearlyPrice}/year
                  </p>
                )}
              </div>

              {plan.trialDays > 0 && (
                <p className="text-xs bg-green-100 text-green-800 p-2 rounded">
                  {plan.trialDays} days free trial
                </p>
              )}

              <div className="space-y-2 py-4 border-t border-b">
                {plan.features.map((feature, i) => (
                  <p key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    {feature}
                  </p>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={subscription?.plan.id === plan.id}
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {subscription?.plan.id === plan.id ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
