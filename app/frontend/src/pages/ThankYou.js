import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  CheckCircle2, ArrowRight, Calendar, 
  CreditCard, Key, Shield, FileText, Clock
} from 'lucide-react';

export default function ThankYou() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(8);
  const [planDetails, setPlanDetails] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  
  const { 
    planType, 
    activationKey, 
    planValidity, 
    paymentMethod,
    amount,
    promoApplied,
    isTrial
  } = location.state || {};

  // Fetch plan details to get full information
  useEffect(() => {
    const fetchPlanDetails = async () => {
      const planName = planType || user?.subscription_plan;
      if (!planName) {
        setLoadingPlan(false);
        return;
      }

      try {
        const { getApiBaseUrl } = await import('../utils/apiConfig');
        const host = getApiBaseUrl();
        const response = await fetch(`${host}/api/plans`, { credentials: 'include' });
        const data = await response.json();
        
        if (data.plans && Array.isArray(data.plans)) {
          const userPlan = data.plans.find(p => 
            p.name.toLowerCase() === planName.toLowerCase()
          );
          setPlanDetails(userPlan);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch plan details:', error);
        }
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlanDetails();
  }, [planType, user?.subscription_plan]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoDashboard = () => {
    navigate('/dashboard');
  };

  // Determine the actual plan name to display
  const displayPlanName = planDetails?.name || planType || user?.subscription_plan || 'Subscription Plan';
  const displayValidity = planValidity || (planDetails ? `${planDetails.duration_days} days` : '30 days');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" strokeWidth={2} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-3">
            {isTrial ? 'Trial Activated Successfully' : 'Subscription Activated'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isTrial 
              ? 'Your free trial is now active. Start exploring all the features available in your plan.'
              : 'Thank you for your subscription. Your account has been upgraded and you now have access to all premium features.'
            }
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {/* Subscription Details Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
              <div className="space-y-3">
                {/* Plan Name */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Plan</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {displayPlanName}
                  </span>
                </div>

                {/* Validity */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Validity</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {displayValidity}
                  </span>
                </div>

                {/* Payment Method */}
                {paymentMethod && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Payment Method</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {paymentMethod}
                    </span>
                  </div>
                )}

                {/* Amount */}
                {amount && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Amount Paid</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{parseFloat(amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Promo Code */}
                {promoApplied && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Promo Code</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {promoApplied}
                    </span>
                  </div>
                )}

                {/* Activation Key */}
                {activationKey && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Activation Key</span>
                    </div>
                    <span className="text-xs font-mono text-gray-600 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                      {activationKey}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Features Section */}
            {planDetails?.features && planDetails.features.length > 0 && (
              <div className="mb-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Included Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {planDetails.features
                    .filter(feature => {
                      const lowerFeature = feature.toLowerCase();
                      return !lowerFeature.includes('trial') && 
                             !lowerFeature.includes('free trial');
                    })
                    .slice(0, 8)
                    .map((feature, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 py-2"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-green-600" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Trial Badge */}
            {isTrial && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Free Trial Active</p>
                    <p className="text-xs text-blue-700">
                      Your trial period is active. No credit card required. You can cancel anytime.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-6 border-t border-gray-200">
              <Button
                onClick={handleGoDashboard}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 font-medium"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Auto Redirect */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Redirecting automatically in{' '}
                  <span className="font-medium text-gray-700">{countdown}</span>{' '}
                  seconds
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden max-w-xs mx-auto">
                  <div 
                    className="bg-gray-900 h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${((8 - countdown) / 8) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <button
              onClick={() => navigate('/contact')}
              className="text-gray-900 font-medium hover:underline"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
