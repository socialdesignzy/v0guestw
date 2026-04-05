import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  CheckCircle2, ArrowRight, Calendar, Clock, Users, TrendingUp, 
  Shield, Check, BarChart3, FileText, Rocket
} from 'lucide-react';
import api from '../utils/api';

export default function TrialActivated() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [planDetails, setPlanDetails] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const end = location.state?.end ? new Date(location.state.end) : null;
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      fetchPlanDetails();
      setChecking(false);
    }
  }, [user, authLoading, navigate]);

  const fetchPlanDetails = async () => {
    if (!user?.subscription_plan) {
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
          p.name.toLowerCase() === user.subscription_plan.toLowerCase()
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

  useEffect(() => {
    if (!checking) {
      if (seconds <= 0) {
        // Store flag that user just activated trial, so dashboard can show welcome message
        if (user?.id) {
          localStorage.setItem(`trial_activated_${user.id}`, Date.now().toString());
        }
        navigate('/dashboard');
        return;
      }

      const timer = setInterval(() => {
        setSeconds((s) => {
          const newSeconds = s - 1;
          if (newSeconds <= 0) {
            if (user?.id) {
              localStorage.setItem(`trial_activated_${user.id}`, Date.now().toString());
            }
            navigate('/dashboard');
            return 0;
          }
          return newSeconds;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [checking, seconds, navigate, user]);

  const formatDate = (d) => {
    try {
      if (!d) return '';
      const date = typeof d === 'string' ? new Date(d) : d;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const handleGoToDashboard = () => {
    if (user?.id) {
      localStorage.setItem(`trial_activated_${user.id}`, Date.now().toString());
    }
    navigate('/dashboard');
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-[#3B2ED0]"></div>
          <p className="mt-4 text-sm font-medium text-slate-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  const trialEndDate = end || (user && user.plan_end_date ? new Date(user.plan_end_date) : null);
  const daysRemaining = trialEndDate ? Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/25">
              <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Trial Activated Successfully
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-6">
            {planDetails 
              ? `Your ${planDetails.name} subscription trial is now active. You have full access to all premium features and can start using the platform immediately.`
              : user?.subscription_plan 
                ? `Your ${user.subscription_plan} subscription trial is now active. You have full access to all premium features and can start using the platform immediately.`
                : 'Your subscription trial is now active. You have full access to all premium features and can start using the platform immediately.'
            }
          </p>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-emerald-50 border border-emerald-200/60 rounded-lg shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-sm font-medium text-emerald-700">No credit card required • Cancel anytime</span>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#3B2ED0] via-[#4F46E5] to-pink-600"></div>
          <CardHeader className="border-b border-slate-200 bg-slate-50/50 px-8 py-7">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-[#3B2ED0]" strokeWidth={2} />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Getting Started Guide
                  </CardTitle>
                </div>
                <CardDescription className="text-base text-slate-600 leading-relaxed max-w-2xl">
                  Follow these steps to begin managing your workforce efficiently. All features are accessible immediately.
                </CardDescription>
              </div>
              {trialEndDate && (
                <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 min-w-[240px] shadow-sm">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trial Expires</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-2">{formatDate(trialEndDate)}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <p className="text-sm font-medium text-slate-600">
                      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-8 py-8">
            {/* Quick Start Guide */}
            <div className="mb-10">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Essential First Steps</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">These fundamental actions will help you get the most value from your trial period</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="group flex gap-4 p-6 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-[#3B2ED0]/50 hover:bg-[#3B2ED0]/10/50 hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-[#3B2ED0] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-transform">
                      <Users className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-[#3B2ED0] bg-indigo-100 px-2 py-0.5 rounded">STEP 1</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1.5 text-base">Add Your Workers</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">Import or manually add your team members to begin workforce management</p>
                  </div>
                </div>
                
                <div className="group flex gap-4 p-6 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-transform">
                      <BarChart3 className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">STEP 2</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1.5 text-base">Track Attendance</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">Record daily attendance and monitor workforce presence in real-time</p>
                  </div>
                </div>

                <div className="group flex gap-4 p-6 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-transform">
                      <FileText className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">STEP 3</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1.5 text-base">Manage Payments</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">Process payments, settlements, and financial transactions seamlessly</p>
                  </div>
                </div>

                <div className="group flex gap-4 p-6 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-amber-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-transform">
                      <TrendingUp className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">STEP 4</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1.5 text-base">Generate Reports</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">Access detailed analytics and insights to make data-driven decisions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            {planDetails && planDetails.features && planDetails.features.length > 0 && (
              <div className="mb-10">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Included Features</h3>
                  <p className="text-slate-600 text-[15px]">All premium features are available during your trial period</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {planDetails.features
                    .filter(feature => {
                      const lowerFeature = feature.toLowerCase();
                      return !lowerFeature.includes('7-day free trial') && 
                             !lowerFeature.includes('free trial available') &&
                             !lowerFeature.includes('7 day free trial') &&
                             !lowerFeature.includes('14-day free trial') &&
                             !lowerFeature.includes('14 day free trial');
                    })
                    .map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{feature}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Support Information */}
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-[#3B2ED0]/30/60 rounded-xl p-7 mb-8">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-[#3B2ED0] flex items-center justify-center shadow-md">
                    <Shield className="h-7 w-7 text-white" strokeWidth={2} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-2.5 text-lg">Support & Resources</h4>
                  <p className="text-sm text-slate-700 mb-5 leading-relaxed max-w-2xl">
                    Our dedicated support team is available to assist you throughout your trial. Access comprehensive documentation, video tutorials, and step-by-step guides in our Help Center to maximize your platform utilization.
                  </p>
                  <Button 
                    variant="outline" 
                    size="default"
                    onClick={() => navigate('/help')}
                    className="border-2 border-[#3B2ED0]/50 text-[#3B2ED0] hover:bg-[#3B2ED0]/10 hover:border-[#3B2ED0]/60 font-semibold"
                  >
                    Access Help Center
                    <ArrowRight className="h-4 w-4 ml-2" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-200">
              <Button 
                onClick={handleGoToDashboard}
                className="flex-1 bg-[#3B2ED0] hover:bg-[#2A1FB8] text-white shadow-lg hover:shadow-xl transition-all font-semibold h-12 text-base"
                size="lg"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5 ml-2" strokeWidth={2} />
              </Button>
              <Button 
                onClick={() => navigate('/pricing')}
                variant="outline"
                className="flex-1 border-2 border-slate-300 hover:border-[#3B2ED0]/60 hover:bg-[#3B2ED0]/10/50 font-semibold h-12 text-base"
                size="lg"
              >
                View Subscription Plans
              </Button>
            </div>

            {/* Redirect Notice */}
            {seconds > 0 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 flex items-center justify-center gap-2 font-medium">
                  <Clock className="h-4 w-4" />
                  Redirecting to dashboard in {seconds} second{seconds !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 font-medium">
            No credit card required during trial period. You can cancel your subscription at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
