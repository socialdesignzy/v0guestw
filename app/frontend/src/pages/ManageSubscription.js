import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  CreditCard, 
  Calendar,
  Key,
  Receipt,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Clock,
  Gift,
  RefreshCw,
  Ban,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Crown,
  Building2,
  Check,
  Users,
  Briefcase,
  FileText
} from 'lucide-react';
import { api } from '../utils/api';
import axios from 'axios';

const BACKEND_HOST = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.guestworker.app' 
    : `http://${window.location.hostname}:8000`);
const API = `${BACKEND_HOST}/api`;

export default function ManageSubscription() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [extensionKey, setExtensionKey] = useState('');
  const [applyingKey, setApplyingKey] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [changingPlan, setChangingPlan] = useState(false);
  const [planChangePreview, setPlanChangePreview] = useState(null);
  
  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [user?.subscription_plan]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.getMyTransactions();
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/plans`, { withCredentials: true });
      const activePlans = response.data.plans || [];
      // Filter to only show Plus and Pro plans (as per requirement)
      // Also exclude the current plan from the list
      const allowedPlans = activePlans.filter(plan => {
        const isAllowed = plan.name.includes('Plus') || plan.name.includes('Pro');
        const isCurrentPlan = user?.subscription_plan && plan.name === user.subscription_plan;
        return isAllowed && !isCurrentPlan;
      });
      setPlans(allowedPlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const calculatePlanChangePreview = (newPlanId) => {
    if (!newPlanId || !user) return null;

    const newPlan = plans.find(p => p.id === newPlanId);
    if (!newPlan) return null;

    const currentPlanName = user.subscription_plan || 'Free Plan';
    const newPlanName = newPlan.name;

    if (currentPlanName === newPlanName) return null;

    // Check if user is on trial
    const isTrial = user.payment_method === 'trial';

    // Calculate days remaining
    let daysRemaining = 0;
    if (user.plan_end_date) {
      const endDate = new Date(user.plan_end_date);
      const today = new Date();
      const diffTime = endDate - today;
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Get current plan details
    const currentPlan = plans.find(p => p.name === currentPlanName);
    const currentPrice = isTrial ? 0 : (currentPlan?.price || 0);
    const currentDuration = isTrial ? (user.trial_duration_days || 14) : (currentPlan?.duration_days || 30);
    const newPrice = newPlan.price || 0;
    const newDuration = newPlan.duration_days || 30;

    // TRIAL CONVERSION: Special handling
    if (isTrial) {
      return {
        currentPlan: currentPlanName + ' (Trial)',
        newPlan: newPlanName,
        currentPrice: 0,
        newPrice,
        daysRemaining,
        unusedCredit: 0,
        amountToPay: newPrice,
        proratedDays: newDuration,
        transactionType: 'trial_conversion',
        isTrial: true,
        isUpgrade: true, // Trial to paid is always considered upgrade
        newEndDate: new Date(Date.now() + newDuration * 24 * 60 * 60 * 1000).toISOString(),
        isRazorpay: false
      };
    }

    // PAID PLAN CHANGE: Netflix-style prorated billing
    const currentDailyRate = currentPrice / currentDuration;
    const newDailyRate = newPrice / newDuration;
    const unusedCredit = currentDailyRate * daysRemaining;
    
    const isUpgrade = newPrice > currentPrice;
    let amountToPay, proratedDays, newEndDate;

    if (isUpgrade) {
      // UPGRADE: Pay full price, get credit as extra days
      const creditDays = Math.floor(unusedCredit / newDailyRate);
      amountToPay = newPrice;
      proratedDays = newDuration + creditDays;
      newEndDate = new Date(Date.now() + proratedDays * 24 * 60 * 60 * 1000);
    } else {
      // DOWNGRADE: Credit covers new plan, no payment
      const creditDays = Math.floor(unusedCredit / newDailyRate);
      amountToPay = 0;
      proratedDays = creditDays;
      newEndDate = new Date(Date.now() + proratedDays * 24 * 60 * 60 * 1000);
    }

    return {
      currentPlan: currentPlanName,
      newPlan: newPlanName,
      currentPrice,
      newPrice,
      daysRemaining,
      unusedCredit: Math.round(unusedCredit * 100) / 100,
      amountToPay,
      proratedDays,
      transactionType: isUpgrade ? 'upgrade' : 'downgrade',
      isTrial: false,
      isUpgrade,
      newEndDate: newEndDate.toISOString(),
      isRazorpay: user.payment_method === 'razorpay' && user.subscription_status === 'active'
    };
  };

  const handlePlanSelectionChange = (planId) => {
    setSelectedPlanId(planId);
    const preview = calculatePlanChangePreview(planId);
    setPlanChangePreview(preview);
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) {
      toast.error('Please select a plan');
      return;
    }

    try {
      setChangingPlan(true);
      const response = await api.changePlan({ plan_id: selectedPlanId });
      
      // Check if payment is required
      if (response.data.payment_required) {
        // Payment required - initiate Razorpay
        const { razorpay_order_id, amount, currency } = response.data;
        
        // Get Razorpay key
        const keyResponse = await axios.get(`${API}/gateway/public-key`, { withCredentials: true });
        const razorpayKey = keyResponse.data.key_id;
        
        // Initialize Razorpay
        const options = {
          key: razorpayKey,
          amount: amount * 100, // Amount in paise
          currency: currency,
          name: 'GuestWorker',
          description: `Plan Change: ${response.data.transaction.new_plan}`,
          order_id: razorpay_order_id,
          handler: async function (paymentResponse) {
            try {
              // Verify payment
              const verifyResponse = await api.verifyPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              });
              
              toast.success(verifyResponse.data.message || 'Payment successful! Plan changed.');
              setChangePlanDialogOpen(false);
              setSelectedPlanId('');
              setPlanChangePreview(null);
              
              // Refresh user data
              if (refreshUser) {
                await refreshUser();
              }
              
              // Reload to show updated subscription
              setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
              toast.error(error.response?.data?.detail || 'Payment verification failed');
              setChangingPlan(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || ''
          },
          theme: {
            color: '#3B2ED0'
          },
          modal: {
            ondismiss: function() {
              toast.error('Payment cancelled');
              setChangingPlan(false);
            }
          }
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
        
      } else {
        // No payment required - plan changed successfully
        toast.success(response.data.message || 'Plan changed successfully!');
        setChangePlanDialogOpen(false);
        setSelectedPlanId('');
        setPlanChangePreview(null);
        
        // Refresh user data
        if (refreshUser) {
          await refreshUser();
        }
        
        // Reload to show updated subscription
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change plan');
      setChangingPlan(false);
    }
  };

  const handleApplyExtensionKey = async (e) => {
    e.preventDefault();
    
    if (!extensionKey.trim()) {
      toast.error('Please enter a validity extension key');
      return;
    }

    try {
      setApplyingKey(true);
      const response = await api.applyExtensionKey(extensionKey);
      toast.success(response.data.message || 'Extension key applied successfully!');
      setExtensionKey('');
      // Refresh page to show updated subscription
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid or expired extension key');
    } finally {
      setApplyingKey(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await api.cancelSubscription();
      toast.success('Subscription cancelled. You will retain access until your billing period ends.');
      setCancelDialogOpen(false);
      // Refresh to show updated status
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel subscription');
    }
  };

  const handleRestartSubscription = async () => {
    try {
      const response = await api.restartSubscription();
      toast.success(response.data.message || 'Subscription restarted successfully!');
      // Refresh to show updated status
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to restart subscription');
    }
  };

  const getStatusBadge = () => {
    if (user?.subscription_status === 'active') {
      return <Badge className="bg-green-500 text-white hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
    } else if (user?.subscription_status === 'expired') {
      return <Badge className="bg-red-500 text-white hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" /> Expired</Badge>;
    } else if (user?.subscription_status === 'cancelled') {
      return <Badge className="bg-gray-500 text-white hover:bg-gray-600"><Ban className="h-3 w-3 mr-1" /> Cancelled</Badge>;
    } else {
      return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" /> Inactive</Badge>;
    }
  };

  const isPlanExpired = () => {
    if (user?.subscription_status === 'expired') return true;
    if (!user?.plan_end_date) return false;
    const endDate = new Date(user.plan_end_date);
    return endDate < new Date();
  };

  const getDaysRemaining = () => {
    if (!user?.plan_end_date) return null;
    
    const endDate = new Date(user.plan_end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? diffDays : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPlanTheme = () => {
    const planName = (user?.subscription_plan || '').toLowerCase();
    
    if (planName.includes('plus')) {
      // Violet/Indigo-Purple theme for Plus (matches pricing page)
      return {
        border: 'border-[#3B2ED0]/50',
        gradient: 'bg-gradient-to-br from-[#3B2ED0] via-[#4F46E5] to-violet-600',
        buttonGradient: 'bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4]',
        buttonOutline: 'border-[#3B2ED0]/50 hover:bg-[#3B2ED0]/10',
        cardShadow: 'shadow-indigo-100'
      };
    } else if (planName.includes('pro')) {
      // Premium Golden theme for Pro (matches pricing page golden effect)
      return {
        border: 'border-amber-300',
        gradient: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600',
        buttonGradient: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700',
        buttonOutline: 'border-amber-300 hover:bg-amber-50',
        cardShadow: 'shadow-amber-100'
      };
    } else if (planName.includes('enterprise') || planName.includes('estate')) {
      // Black and Shiny Silver theme for Enterprise (matches pricing page)
      return {
        border: 'border-gray-700',
        gradient: 'bg-gradient-to-br from-gray-900 via-black to-gray-900',
        buttonGradient: 'bg-gradient-to-r from-gray-700 to-slate-800 hover:from-gray-800 hover:to-slate-900',
        buttonOutline: 'border-gray-400 hover:bg-gray-100',
        textColor: 'text-gray-100',
        cardShadow: 'shadow-gray-900/50',
        silverAccent: true
      };
    } else {
      // Default theme (Free plan)
      return {
        border: 'border-gray-200',
        gradient: 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
        buttonGradient: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
        buttonOutline: 'border-gray-200 hover:bg-gray-50',
        cardShadow: 'shadow-gray-200'
      };
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'razorpay':
        return <CreditCard className="h-4 w-4" />;
      case 'activation_key':
        return <Key className="h-4 w-4" />;
      case 'extension_key':
        return <Gift className="h-4 w-4" />;
      case 'trial':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const getPlanIcon = (planName) => {
    const name = (planName || '').toLowerCase();
    if (name.includes('plus')) {
      return <Sparkles className="h-5 w-5 text-[#3B2ED0]" />;
    } else if (name.includes('pro')) {
      return <Crown className="h-5 w-5 text-amber-600" />;
    } else if (name.includes('enterprise') || name.includes('estate')) {
      return <Building2 className="h-5 w-5 text-gray-700" />;
    }
    return <Sparkles className="h-5 w-5 text-gray-600" />;
  };

  const getPlanIconWithStyle = (planName) => {
    const name = (planName || '').toLowerCase();
    if (name.includes('plus')) {
      return (
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] flex items-center justify-center shadow-md">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
      );
    } else if (name.includes('pro')) {
      return (
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-400 flex items-center justify-center shadow-md">
          <Crown className="h-5 w-5 fill-amber-600 text-amber-600" />
        </div>
      );
    } else if (name.includes('enterprise') || name.includes('estate')) {
      return (
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 flex items-center justify-center shadow-md">
          <Building2 className="h-5 w-5 text-gray-200" />
        </div>
      );
    }
    return (
      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
        <Sparkles className="h-5 w-5 text-gray-600" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#F8FAFF] p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          onClick={() => navigate('/account')} 
          variant="outline" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Account
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Manage Subscription</h1>
            <p className="text-gray-600">View and manage your subscription details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={`border-2 ${getPlanTheme().border} ${getPlanTheme().cardShadow} shadow-lg overflow-hidden`}>
            <div className={`${getPlanTheme().gradient} p-6 ${getPlanTheme().textColor || 'text-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Current Plan</h2>
                  <p className="text-white/90">Your active subscription details</p>
                </div>
                {getStatusBadge()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm text-white/90">Plan Type</span>
                  </div>
                  <p className="text-xl font-bold">{isPlanExpired() ? 'No Plan' : (user?.subscription_plan === 'none' || !user?.subscription_plan ? 'Free Plan' : (user?.subscription_plan || 'Free Plan'))}</p>
                </div>

                {user?.plan_end_date && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="text-sm text-white/90">Days Left</span>
                    </div>
                    <p className="text-xl font-bold">{getDaysRemaining()}</p>
                  </div>
                )}

                {user?.plan_start_date && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm text-white/90">Started On</span>
                    </div>
                    <p className="text-lg font-semibold">{formatDate(user.plan_start_date)}</p>
                  </div>
                )}

                {user?.plan_end_date && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm text-white/90">Valid Until</span>
                    </div>
                    <p className="text-lg font-semibold">{formatDate(user.plan_end_date)}</p>
                  </div>
                )}

                {user?.activation_key && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-5 w-5" />
                      <span className="text-sm text-white/90">Activated With Key</span>
                    </div>
                    <p className="text-lg font-mono">{user.activation_key}</p>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Razorpay Subscription Info */}
              {user?.payment_method === 'razorpay' && user?.subscription_status === 'active' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Razorpay Subscription</p>
                      <p className="text-xs text-blue-700">
                        Your subscription is set to auto-renew. You can cancel auto-renewal below, and you'll retain access until {formatDate(user?.plan_end_date)}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trial User - Add Payment Method */}
              {user?.payment_method === 'trial' && user?.subscription_status === 'active' && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Add Payment Method for Auto-Renewal</h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Set up your payment method now to ensure seamless continuation when your trial ends. 
                        <span className="font-semibold"> No charge until your trial period completes.</span>
                      </p>
                      <div className="bg-white/80 rounded-lg p-3 mb-4 border border-orange-200">
                        <div className="flex items-start gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">Your trial continues as normal</p>
                        </div>
                        <div className="flex items-start gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">Auto-renewal starts when trial ends ({formatDate(user?.plan_end_date)})</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">No service interruption - seamless transition to paid plan</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate('/pricing?trial_conversion=true')}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Add Payment Method to Renew
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Change Plan Button */}
              {user?.subscription_status === 'active' && plans.length > 0 && (
                <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className={`w-full ${getPlanTheme().buttonGradient} text-white shadow-md hover:shadow-lg transition-all duration-200`}>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Change Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-[#3B2ED0]/5 to-purple-50">
                      <DialogTitle className="text-2xl font-bold text-gray-900">
                        Change Your Plan
                      </DialogTitle>
                      <DialogDescription className="text-sm text-gray-600 mt-1">
                        {user?.subscription_plan && (
                          <span className="inline-flex items-center gap-2">
                            Current Plan: <Badge variant="outline" className="font-semibold">{user.subscription_plan}</Badge>
                          </span>
                        )}
                        <span className="block mt-1">Choose a new plan below - we'll handle the billing automatically</span>
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="px-6 py-6 space-y-6">
                      {/* Plan Cards Grid */}
                      {plans.length === 0 ? (
                        <div className="text-center py-12">
                          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No other plans available at the moment</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {plans.map((plan) => {
                            const isSelected = selectedPlanId === plan.id;
                            const planNameLower = (plan.name || '').toLowerCase();
                            const isPlusPlan = planNameLower.includes('plus');
                            const isProPlan = planNameLower.includes('pro');
                            
                            return (
                              <Card
                                key={plan.id}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                                  isSelected
                                    ? 'ring-2 ring-[#3B2ED0] border-[#3B2ED0] shadow-lg'
                                    : 'hover:border-[#3B2ED0]/50 border-gray-200'
                                }`}
                                onClick={() => handlePlanSelectionChange(plan.id)}
                              >
                                <CardHeader className="pb-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      {isPlusPlan ? (
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] flex items-center justify-center shadow-md">
                                          <Sparkles className="h-6 w-6 text-white" />
                                        </div>
                                      ) : isProPlan ? (
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-amber-300 flex items-center justify-center shadow-md">
                                          <Crown className="h-6 w-6 fill-white text-white" />
                                        </div>
                                      ) : (
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md">
                                          <Building2 className="h-6 w-6 text-gray-200" />
                                        </div>
                                      )}
                                      <div>
                                        <CardTitle className="text-xl font-bold text-gray-900">
                                          {plan.name}
                                        </CardTitle>
                                        {plan.description && (
                                          <p className="text-xs text-gray-600 mt-0.5">{plan.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className="h-8 w-8 rounded-full bg-[#3B2ED0] flex items-center justify-center flex-shrink-0">
                                        <Check className="h-5 w-5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Pricing */}
                                  <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                                    <span className="text-gray-600">/month</span>
                                  </div>
                                </CardHeader>
                                
                                <CardContent className="pt-0 space-y-4">
                                  {/* Features */}
                                  <div className="space-y-2.5">
                                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">What's Included:</p>
                                    <div className="space-y-2">
                                      <div className="flex items-start gap-2.5">
                                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <Users className="h-3 w-3 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-gray-900">
                                            {plan.max_workers === null ? 'Unlimited' : plan.max_workers} Workers
                                          </p>
                                          <p className="text-xs text-gray-500">Manage your workforce</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2.5">
                                        <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <Briefcase className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium text-gray-900">
                                            {plan.max_employers === null ? 'Unlimited' : plan.max_employers} Employers
                                          </p>
                                          <p className="text-xs text-gray-500">Track all employers</p>
                                        </div>
                                      </div>
                                      {plan.features && plan.features.length > 0 && plan.features.slice(0, 3).map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5">
                                          <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="h-3 w-3 text-purple-600" />
                                          </div>
                                          <p className="text-sm text-gray-700 flex-1">{feature}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Select Button */}
                                  <Button
                                    className={`w-full mt-4 ${
                                      isSelected
                                        ? isPlusPlan
                                          ? 'bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white'
                                          : isProPlan
                                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white'
                                          : 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlanSelectionChange(plan.id);
                                    }}
                                  >
                                    {isSelected ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Selected
                                      </>
                                    ) : (
                                      'Select This Plan'
                                    )}
                                  </Button>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}

                      {/* Plan Change Preview */}
                      {planChangePreview && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                          {/* Plan Comparison - Compact */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">From</p>
                              <p className="font-semibold text-gray-900">{planChangePreview.currentPlan}</p>
                            </div>
                            <ArrowUpRight className={`h-5 w-5 ${
                              planChangePreview.isUpgrade ? 'text-green-600' : 'text-blue-600'
                            }`} />
                            <div>
                              <p className="text-xs text-gray-500 mb-1">To</p>
                              <p className="font-semibold text-gray-900">{planChangePreview.newPlan}</p>
                            </div>
                          </div>

                          {/* Billing Summary - Compact */}
                          <div className="bg-white rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Days remaining</span>
                              <span className="font-medium">{planChangePreview.daysRemaining} days</span>
                            </div>
                            {!planChangePreview.isTrial && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Unused credit</span>
                                <span className="font-medium">₹{planChangePreview.unusedCredit.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="border-t pt-2 flex justify-between items-center">
                              <span className="font-semibold text-gray-900">Amount to pay</span>
                              <span className={`font-bold text-xl ${
                                planChangePreview.amountToPay > 0 ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                ₹{planChangePreview.amountToPay.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">New duration</span>
                              <span className="font-medium">{planChangePreview.proratedDays} days</span>
                            </div>
                          </div>

                          {/* Quick Info */}
                          {planChangePreview.amountToPay > 0 && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 rounded px-3 py-2">
                              <Info className="h-4 w-4 text-blue-600" />
                              <span>Payment via UPI/Card/Net Banking</span>
                            </div>
                          )}
                        </div>
                      )}

                      {!planChangePreview && selectedPlanId && (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                          <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Calculating...</p>
                        </div>
                      )}
                    </div>

                    <DialogFooter className="px-6 py-4 bg-gray-50 border-t gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setChangePlanDialogOpen(false);
                          setSelectedPlanId('');
                          setPlanChangePreview(null);
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleChangePlan}
                        disabled={!selectedPlanId || changingPlan}
                        className={`flex-1 ${
                          planChangePreview && planChangePreview.amountToPay > 0 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                        } text-white`}
                      >
                        {changingPlan ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : planChangePreview && planChangePreview.amountToPay > 0 ? (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay ₹{planChangePreview.amountToPay.toLocaleString('en-IN')}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {user?.subscription_status === 'active' && (
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors">
                      <Ban className="h-4 w-4 mr-2" />
                      {user?.payment_method === 'razorpay' ? 'Cancel Auto-Renewal' : 'Cancel Subscription'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-b border-red-100 px-6 pt-6 pb-5">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <AlertTriangle className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                            {user?.payment_method === 'razorpay' ? 'Cancel Auto-Renewal?' : 'Cancel Subscription?'}
                          </DialogTitle>
                          <DialogDescription className="text-sm text-gray-700">
                            {user?.payment_method === 'razorpay' 
                              ? 'Your auto-renewal will be disabled, but you\'ll keep access until your period ends'
                              : 'We\'re sorry to see you go. Here\'s what you need to know before cancelling'}
                          </DialogDescription>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-6 space-y-5">
                      {/* Current Subscription Card */}
                      <Card className="border-2 border-gray-200 shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] flex items-center justify-center">
                              {getPlanIcon(user?.subscription_plan)}
                            </div>
                            <CardTitle className="text-base font-semibold">Your Current Subscription</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Plan</p>
                              <p className="font-bold text-gray-900">{user?.subscription_plan || 'Free Plan'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Access Until</p>
                              <p className="font-bold text-gray-900">{formatDate(user?.plan_end_date)}</p>
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <p className="text-sm text-blue-900">
                                <strong>{getDaysRemaining()} days</strong> of access remaining
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* What Happens Section */}
                      <Card className="border-2 border-red-200 bg-red-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold text-red-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            What Happens After Cancellation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-red-100">
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Access Continues</p>
                                <p className="text-xs text-gray-600 mt-0.5">You'll keep full access until <strong>{formatDate(user?.plan_end_date)}</strong></p>
                              </div>
                            </div>
                            
                            {user?.payment_method === 'razorpay' && (
                              <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-red-100">
                                <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Ban className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">Auto-Renewal Disabled</p>
                                  <p className="text-xs text-gray-600 mt-0.5">Your Razorpay subscription will be cancelled automatically</p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-red-100">
                              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Calendar className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Data Preserved</p>
                                <p className="text-xs text-gray-600 mt-0.5">Your data will be safely stored for 30 days after expiry</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-red-100">
                              <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <XCircle className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">No Refunds</p>
                                <p className="text-xs text-gray-600 mt-0.5">Unused time cannot be refunded as per our policy</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-green-200 bg-green-50/50">
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <RefreshCw className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Easy Reactivation</p>
                                <p className="text-xs text-gray-600 mt-0.5">You can restart your subscription anytime before it expires</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Help Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <Info className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">Need Help?</p>
                            <p className="text-xs text-gray-700 mb-3">
                              If you're experiencing issues or have questions, our support team is here to help. Consider reaching out before cancelling.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setCancelDialogOpen(false);
                                navigate('/help');
                              }}
                              className="border-blue-300 hover:bg-blue-100 text-blue-700"
                            >
                              <Gift className="h-3.5 w-3.5 mr-2" />
                              Contact Support
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-gray-50 border-t gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setCancelDialogOpen(false)}
                        className="flex-1 border-gray-300 hover:bg-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Keep My Subscription
                      </Button>
                      <Button 
                        onClick={handleCancelSubscription}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Yes, Cancel Subscription
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {user?.subscription_status === 'cancelled' && (() => {
                // Check if still within billing period
                const isWithinBillingPeriod = user?.plan_end_date && new Date(user.plan_end_date) > new Date();
                
                if (isWithinBillingPeriod) {
                  return (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-800 font-semibold mb-2">Subscription Cancelled</p>
                        <p className="text-sm text-amber-700">
                          Your subscription has been cancelled. You still have access until {formatDate(user?.plan_end_date)}.
                        </p>
                        {user?.payment_method === 'razorpay' && (
                          <p className="text-xs text-amber-600 mt-2">
                            Auto-renewal is disabled. Restart subscription to re-enable auto-renewal.
                          </p>
                        )}
                      </div>
                      <Button 
                        onClick={handleRestartSubscription}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Restart Subscription
                      </Button>
                    </div>
                  );
                } else {
                  return (
                    <Button 
                      onClick={() => navigate('/pricing')}
                      className={`w-full ${getPlanTheme().buttonGradient} text-white`}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Purchase New Subscription
                    </Button>
                  );
                }
              })()}

              {user?.subscription_status !== 'active' && user?.subscription_status !== 'cancelled' && (
                <Button 
                  onClick={() => navigate('/pricing')}
                  className={`w-full ${getPlanTheme().buttonGradient} text-white`}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Activate Subscription
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-[#3B2ED0]" />
                    Payment History & Invoices
                  </CardTitle>
                  <CardDescription>Your payment and activation history. Download invoices for your records.</CardDescription>
                </div>
                {transactions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Create CSV download
                      const csv = [
                        ['Date', 'Description', 'Amount', 'Payment Method', 'Status'].join(','),
                        ...transactions.map(t => [
                          formatDate(t.created_at),
                          `"${t.description || 'Subscription Payment'}"`,
                          t.amount || 0,
                          t.payment_method_label || t.payment_method,
                          t.status
                        ].join(','))
                      ].join('\n');
                      
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                      toast.success('Payment history downloaded');
                    }}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400 mt-1">Your payment history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          {getPaymentMethodIcon(transaction.payment_method)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.description || 'Subscription Payment'}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.created_at)} • {transaction.payment_method_label || transaction.payment_method}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₹{parseFloat(transaction.amount || 0).toLocaleString('en-IN')}
                          </p>
                          <Badge className={
                            transaction.status === 'success' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                        {transaction.status === 'success' && transaction.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const invoiceUrl = api.generateSubscriptionInvoice(transaction.id);
                              window.open(invoiceUrl, '_blank');
                            }}
                            title="View Invoice"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Extension Key Card */}
          <Card className="border-2 border-purple-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Gift className="h-5 w-5" />
                Extension Key
              </CardTitle>
              <CardDescription>Extend your subscription validity</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleApplyExtensionKey} className="space-y-4">
                <div>
                  <Label>Validity Extension Key</Label>
                  <Input
                    value={extensionKey}
                    onChange={(e) => setExtensionKey(e.target.value)}
                    placeholder="Enter your extension key"
                    className="mt-1 font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Have a validity extension key? Enter it above to extend your subscription period.
                  </p>
                </div>
                <Button 
                  type="submit" 
                  disabled={applyingKey}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {applyingKey ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Apply Extension Key
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-sm font-semibold text-gray-700">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm text-gray-600">
                Have questions about your subscription or billing?
              </p>
              <Button
                onClick={() => navigate('/help-center?tab=new')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

