import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { 
  Check, CreditCard, Key, Sparkles, TrendingUp, Shield, Clock, Users, 
  FileText, DollarSign, BarChart3, Download, Zap, Star, Crown, Tag, X, IndianRupee,
  CheckCircle2, Rocket, ArrowUpRight, Play, Award, Target, CheckCircle, 
  ArrowRight, Globe, Lock, Headphones, HelpCircle, Gift
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import axios from 'axios';

// Backend API configuration
const BACKEND_HOST = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.guestworker.app' 
    : `http://${window.location.hostname}:8000`);
const API = `${BACKEND_HOST}/api`;

export default function PricingPage() {
  const { user, activatePlan, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const stored = (typeof window !== 'undefined' && sessionStorage.getItem('welcomeFromRegistration')) || null;
  const fromReg = location.state?.fromRegistration === true || !!stored;
  let nameSource = location.state?.name || user?.name || '';
  if (stored) {
    try {
      const p = JSON.parse(stored);
      if (p && typeof p.name === 'string') nameSource = p.name;
    } catch (_) {}
  }
  const welcomeName = (String(nameSource || '').trim().split(/[ ]+/)[0] || '');
  const [showWelcomeModal, setShowWelcomeModal] = useState(!!fromReg);
  const [trialActivating, setTrialActivating] = useState(false);
  
  // Trial conversion state
  const isTrialConversion = new URLSearchParams(location.search).get('trial_conversion') === 'true';
  const [trialConversionDialogOpen, setTrialConversionDialogOpen] = useState(false);
  const [settingUpPayment, setSettingUpPayment] = useState(false);

  // Refresh user data when component mounts
  useEffect(() => {
    if (user) refreshUser();
  }, []);
  
  // Show trial conversion dialog if coming from trial expiry banner
  useEffect(() => {
    if (isTrialConversion && user?.payment_method === 'trial') {
      setTrialConversionDialogOpen(true);
    }
  }, [isTrialConversion, user]);

  // Consume sessionStorage welcome flag and ensure modal shows when state was lost (e.g. redirect via /dashboard)
  useEffect(() => {
    const s = typeof window !== 'undefined' ? sessionStorage.getItem('welcomeFromRegistration') : null;
    if (location.state?.fromRegistration === true || s) setShowWelcomeModal(true);
    if (s) sessionStorage.removeItem('welcomeFromRegistration');
  }, []);
  
  // Plans state
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [promotionalPrices, setPromotionalPrices] = useState({});
  const [siteOffers, setSiteOffers] = useState({});
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoDetails, setPromoDetails] = useState(null);
  const [verifyingPromo, setVerifyingPromo] = useState(false);
  
  // Activation key state
  const [activationKey, setActivationKey] = useState('');
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Payment state
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [gatewayConfigured, setGatewayConfigured] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
    checkGatewayStatus();
    
    // Load Razorpay script only once
    if (!window.Razorpay && !document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      loadRazorpayScript();
    } else if (window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await axios.get(`${API}/plans`, { withCredentials: true });
      const activePlans = response.data.plans || [];
      setPlans(activePlans);
      
      // Auto-select first plan
      if (activePlans.length > 0) {
        setSelectedPlan(activePlans[0]);
      }

      // Fetch promotional pricing for each plan if user is logged in
      if (user) {
        await fetchPromotionalPrices(activePlans);
      }
      
      // Fetch site-wide offers for all visitors
      await fetchSiteOffersForPlans(activePlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchPromotionalPrices = async (plansList) => {
    try {
      const promoData = {};
      for (const plan of plansList) {
        try {
          const res = await api.calculatePromotionalPrice(plan.name);
          if (res.data.has_promotion) {
            promoData[plan.name] = res.data;
          }
        } catch (e) {
          // No promotion for this plan, skip
        }
      }
      setPromotionalPrices(promoData);
    } catch (error) {
      console.error('Failed to fetch promotional prices:', error);
    }
  };

  const fetchSiteOffersForPlans = async (plansList) => {
    try {
      // Fetch active site-wide offers (public endpoint - no auth required)
      const response = await axios.get(`${API}/site-offers/active`, { withCredentials: true });
      const activeOffers = response.data.offers || [];
      
      // Calculate discounted prices for each plan
      const offerData = {};
      for (const plan of plansList) {
        for (const offer of activeOffers) {
          // Check if offer applies to this plan
          if (offer.plan_targets.length === 0 || offer.plan_targets.includes(plan.name)) {
            const originalPrice = plan.price;
            let discountedPrice;
            
            if (offer.discount_type === 'percentage') {
              discountedPrice = originalPrice - (originalPrice * offer.discount_value / 100);
            } else {
              discountedPrice = Math.max(0, originalPrice - offer.discount_value);
            }
            
            offerData[plan.name] = {
              ...offer,
              original_price: originalPrice,
              discounted_price: Math.round(discountedPrice * 100) / 100
            };
            break; // Use first matching offer
          }
        }
      }
      setSiteOffers(offerData);
    } catch (error) {
      console.error('Failed to fetch site offers:', error);
    }
  };

  const checkGatewayStatus = async () => {
    try {
      const response = await api.checkGatewayStatus();
      setGatewayConfigured(response.data.configured);
    } catch (error) {
      console.error('Failed to check gateway status:', error);
      setGatewayConfigured(false);
    }
  };

  const loadRazorpayScript = () => {
    // Check if Razorpay script is already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    // Check global flag to prevent multiple loads
    if (window.__RAZORPAY_LOADING__) {
      // Already loading, wait for it
      const checkInterval = setInterval(() => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return;
    }

    // Check if script tag already exists in DOM
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      window.__RAZORPAY_LOADING__ = true;
      existingScript.onload = () => {
        setRazorpayLoaded(true);
        window.__RAZORPAY_LOADING__ = false;
      };
      return;
    }

    // Set global flag before loading
    window.__RAZORPAY_LOADING__ = true;

    // Create and add new script tag
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
      window.__RAZORPAY_LOADING__ = false;
    };
    script.onerror = () => {
      window.__RAZORPAY_LOADING__ = false;
    };
    document.body.appendChild(script);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setVerifyingPromo(true);
    try {
      const response = await api.applyPromoCode(promoCode.trim());
      
      if (response.data.valid) {
        setPromoDetails(response.data);
        toast.success('✨ Promo code applied successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid promo code');
      setPromoDetails(null);
    } finally {
      setVerifyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoDetails(null);
    toast.info('Promo code removed');
  };

  const calculateDiscountedPrice = (price) => {
    if (!promoDetails) return price;

    if (promoDetails.discount_type === 'percentage') {
      return price - (price * promoDetails.discount_value / 100);
    } else {
      return Math.max(0, price - promoDetails.discount_value);
    }
  };

  const handleRazorpayPayment = async (plan) => {
    if (!gatewayConfigured) {
      // Show maintenance dialog when Razorpay is not configured
      setMaintenanceDialogOpen(true);
      return;
    }

    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please try again.');
      return;
    }

    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    setPaymentProcessing(true);

    const keyResponse = await api.getPublicKey();
    const razorpayKeyId = keyResponse.data.key_id;

    const commonOptions = {
      key: razorpayKeyId,
      name: 'GuestWorker',
      description: `${plan.name} - Subscription`,
      prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
      theme: { color: '#3B2ED0' },
      modal: { 
        ondismiss: () => { 
          setPaymentProcessing(false); 
          toast.info('Payment cancelled');
        }
      },
      handler: function (response) {
        // This will be overridden by specific handlers below
      }
    };

    try {
      // Use Razorpay Subscription API when plan has razorpay_plan_id (recurring); else one-time order
      if (plan.razorpay_plan_id && plan.id) {
        const subRes = await api.createSubscription({ plan_id: plan.id });
        const { subscription_id } = subRes.data;
        const options = {
          ...commonOptions,
          subscription_id,
          handler: async function (response) {
            try {
              await api.verifySubscriptionPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature
              });
              toast.success('🎉 Payment successful! Your subscription is now active!');
              navigate('/thank-you', {
                state: { 
                  planType: plan.name, 
                  paymentMethod: 'Razorpay (Subscription)', 
                  amount: plan.price, 
                  planValidity: `${plan.duration_days} days`,
                  promoApplied: promoDetails ? promoDetails.code : null
                }
              });
            } catch (e) {
              console.error('Subscription payment verification failed:', e);
              navigate('/payment-failed', {
                state: {
                  planName: plan.name,
                  errorMessage: e.response?.data?.detail || 'Payment verification failed. Please contact support.',
                  orderId: subscription_id
                }
              });
            } finally {
              setPaymentProcessing(false);
            }
          }
        };
        new window.Razorpay(options).open();
        return;
      }

      // One-time order flow
      const promoData = promotionalPrices[plan.name];
      const hasPromotion = !!promoData;
      const promotionalPrice = hasPromotion ? promoData.promotional_price : null;
      const finalPrice = hasPromotion ? promotionalPrice : (promoDetails ? calculateDiscountedPrice(plan.price) : plan.price);
      
      const orderResponse = await api.createPaymentOrder({
        amount: finalPrice,
        plan_type: plan.name,
        duration_days: plan.duration_days,
        promo_code: promoDetails ? promoDetails.code : null,
        promotion_id: hasPromotion ? promoData.promotion_id : null
      });
      const { order_id, amount, currency } = orderResponse.data;
      const options = {
        ...commonOptions,
        amount: amount * 100,
        currency: currency || 'INR',
        order_id,
        handler: async function (response) {
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('🎉 Payment successful! Your subscription is now active!');
            navigate('/thank-you', {
              state: {
                planType: plan.name,
                paymentMethod: 'Razorpay',
                amount,
                planValidity: `${plan.duration_days} days`,
                promoApplied: promoDetails ? promoDetails.code : null
              }
            });
          } catch (e) {
            console.error('Payment verification failed:', e);
            navigate('/payment-failed', {
              state: {
                planName: plan.name,
                errorMessage: e.response?.data?.detail || 'Payment verification failed. Please contact support.',
                orderId: order_id
              }
            });
          } finally {
            setPaymentProcessing(false);
          }
        }
      };
      
      // Handle Razorpay payment errors (card declined, network issues, etc.)
      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (response) {
        console.error('Payment failed:', response);
        setPaymentProcessing(false);
        navigate('/payment-failed', {
          state: {
            planName: plan.name,
            errorMessage: response.error?.description || response.error?.reason || 'Payment failed. Please try again or use a different payment method.',
            orderId: order_id,
            errorCode: response.error?.code
          }
        });
      });
      
      razorpayInstance.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentProcessing(false);
      navigate('/payment-failed', {
        state: {
          planName: plan.name,
          errorMessage: error.response?.data?.detail || 'Failed to initiate payment. Please try again.',
          orderId: null
        }
      });
    }
  };

  const handleActivateWithKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const responseData = await activatePlan(activationKey);
      const planName = responseData?.plan || 'Subscription Plan';
      const durationDays = responseData?.duration_days || 30;
      
      toast.success('🎉 Subscription activated successfully!');
      setKeyDialogOpen(false);
      
      // Redirect to thank you page with data
      navigate('/thank-you', {
        state: {
          planType: planName,
          activationKey: activationKey,
          planValidity: `${durationDays} days`
        }
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid activation key');
      setLoading(false);
    }
  };

  const handleTrialPaymentSetup = async (plan) => {
    if (!plan.razorpay_plan_id) {
      toast.error('This plan does not support auto-renewal. Please contact support.');
      return;
    }

    setSettingUpPayment(true);

    try {
      const response = await api.setupTrialPayment({ plan_id: plan.id });
      
      toast.success('🎉 ' + response.data.message);
      setTrialConversionDialogOpen(false);
      
      // Refresh user data
      await refreshUser();
      
      // Navigate to thank you page
      navigate('/thank-you', {
        state: {
          planType: plan.name,
          paymentMethod: 'Auto-renewal setup',
          amount: plan.price,
          planValidity: `Starts when trial ends`,
          trialConversion: true
        }
      });
    } catch (error) {
      console.error('Failed to setup trial payment:', error);
      toast.error(error.response?.data?.detail || 'Failed to setup payment method. Please try again.');
    } finally {
      setSettingUpPayment(false);
    }
  };

  const features = [
    { icon: Users, text: 'Unlimited Workers & Employers' },
    { icon: FileText, text: 'Dual Attendance Tracking System' },
    { icon: DollarSign, text: 'Complete Payment Management' },
    { icon: BarChart3, text: 'Real-time Analytics Dashboard' },
    { icon: Download, text: 'Export to Excel/PDF' },
    { icon: TrendingUp, text: 'Commission & Profit Tracking' },
    { icon: Shield, text: 'Secure Data Backup' },
    { icon: Clock, text: 'Access Anywhere, Anytime' }
  ];

  const benefits = [
    { title: 'Save 10+ Hours Weekly', desc: 'Automate your workforce management', icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { title: 'Increase Accuracy', desc: 'Eliminate manual calculation errors', icon: Check, color: 'from-green-500 to-emerald-500' },
    { title: 'Track Everything', desc: 'Complete visibility of operations', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
    { title: 'Grow Your Business', desc: 'Scale without additional overhead', icon: TrendingUp, color: 'from-orange-500 to-red-500' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#F8FAFF]" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/60 via-transparent to-[#EFF6FF]" />
      <div className="fixed inset-0 -z-10 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,46,208,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(99,102,241,0.12), transparent), radial-gradient(ellipse 60% 40% at 0% 80%, rgba(139,92,246,0.1), transparent)' }} />
      <div className="fixed inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #3B2ED0 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-14 pt-2 md:pt-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-[#3B2ED0] shadow-lg shadow-[#3B2ED0]/10 border border-[#3B2ED0]/15 mb-8">
              <Sparkles className="h-4 w-4" />
              <span>7-day free trial on Plus & Pro · No card required</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-5 tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">Choose your plan</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Start your free trial today. Full access from day one. Upgrade or cancel anytime.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-md shadow-gray-200/60 border border-gray-200/80 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-md shadow-gray-200/60 border border-gray-200/80 backdrop-blur-sm">
                <Shield className="h-4 w-4 text-[#3B2ED0]" />
                Secure payments
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-md shadow-gray-200/60 border border-gray-200/80 backdrop-blur-sm">
                <Clock className="h-4 w-4 text-amber-500" />
                Cancel anytime
              </span>
            </div>
          </div>

        {/* Promo code */}
        <div className="mb-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/80 border border-amber-200/90 shadow-lg shadow-amber-200/20">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Tag className="h-5 w-5 text-amber-950" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Have a promo code?</p>
              <p className="text-xs text-gray-600 mt-0.5">Applies to your first month.</p>
            </div>
          </div>
          {promoDetails ? (
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-green-300 shadow-sm">
              <div>
                <span className="font-semibold text-green-800">{promoDetails.code}</span>
                <span className="ml-2 text-xs text-gray-600">
                  {promoDetails.discount_type === 'percentage' ? `${promoDetails.discount_value}% off` : `₹${promoDetails.discount_value} off`}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemovePromo} className="text-red-600 h-9 w-9 p-0 rounded-lg hover:bg-red-50">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="w-36 h-10 text-sm border-amber-300/80 focus:border-amber-400 focus:ring-amber-400/30 rounded-xl"
              />
              <Button
                onClick={handleApplyPromo}
                disabled={verifyingPromo || !promoCode.trim()}
                className="h-10 px-5 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-amber-950 rounded-xl shadow-md"
              >
                {verifyingPromo ? 'Checking…' : 'Apply'}
              </Button>
            </div>
          )}
          {promoDetails && promoDetails.description && (
            <p className="w-full text-xs text-green-800 flex items-center gap-1.5 mt-1">
              <Check className="h-3.5 w-3.5 flex-shrink-0" />
              {promoDetails.description} (first month only)
            </p>
          )}
        </div>

        {/* Pricing Plans */}
        {loadingPlans ? (
          <div className="text-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/80 shadow-xl">
            <div className="animate-spin rounded-full h-14 w-14 border-2 border-gray-200 border-t-[#3B2ED0] mx-auto" />
            <p className="mt-6 text-gray-600 font-medium">Loading plans…</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="mb-12 rounded-3xl border border-gray-200 bg-white p-16 text-center shadow-lg">
            <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-900 text-xl font-semibold mb-2">No plans available right now</p>
            <p className="text-gray-600">Check back later or <Link to="/contact-us" className="text-[#3B2ED0] font-medium hover:underline">contact support</Link>.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {plans.map((plan, index) => {
              const promoData = promotionalPrices[plan.name];
              const hasPromotion = !!promoData;
              const siteOffer = siteOffers[plan.name];
              const hasSiteOffer = !!siteOffer;
              
              // Priority: Site-wide offer > User promotion > Promo code
              let finalPrice = plan.price;
              let showOriginalPrice = false;
              let discountSource = null;
              
              if (hasSiteOffer) {
                finalPrice = siteOffer.discounted_price;
                showOriginalPrice = true;
                discountSource = 'site_offer';
              } else if (hasPromotion) {
                finalPrice = promoData.promotional_price;
                showOriginalPrice = true;
                discountSource = 'promotion';
              } else if (promoDetails) {
                finalPrice = calculateDiscountedPrice(plan.price);
                showOriginalPrice = true;
                discountSource = 'promo_code';
              }
              
              const discountedPrice = finalPrice;
              const hasDiscount = showOriginalPrice && discountedPrice !== plan.price;
              const isPopular = index === 1;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden rounded-3xl border-2 bg-white shadow-lg transition-all duration-300 hover:shadow-xl ${
                    isPopular 
                      ? 'border-[#3B2ED0]/40 shadow-[#3B2ED0]/10 lg:-translate-y-1 ring-2 ring-[#3B2ED0]/10' 
                      : 'border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3B2ED0] via-[#4F46E5] to-[#6366F1]" />
                  )}
                  {isPopular && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-b-xl bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-lg">
                        <Star className="h-3.5 w-3.5 fill-white" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardHeader className={`text-center pb-6 ${isPopular ? 'pt-14' : 'pt-8'}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CardTitle className="text-2xl font-extrabold text-gray-900">
                        {plan.name.split(' ').map((w, i, arr) => {
                          const wl = w.toLowerCase();
                          const isPlus = wl === 'plus';
                          const isPro = wl === 'pro';
                          const isEnt = wl.includes('enterprise') || wl.includes('estate');
                          let color, displayText;
                          
                          if (isPlus) {
                            // Company logo color (indigo-purple gradient)
                            displayText = w + '+';
                          } else if (isPro) {
                            // Premium golden effect for Pro with crown
                            displayText = w;
                          } else if (isEnt) {
                            // Premium black glossy background with silver text for Enterprise
                            displayText = w;
                          } else {
                            displayText = w;
                          }
                          
                          return (
                            <span 
                              key={i} 
                              style={
                                color ? { color, fontWeight: 800 } : { fontWeight: 700 }
                              }
                              className={
                                isPlus 
                                  ? 'bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent font-extrabold' 
                                  : isPro 
                                    ? '' 
                                    : isEnt
                                      ? 'inline-block px-3 py-1 rounded-md bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]'
                                      : ''
                              }
                            >
                              {isEnt ? (
                                <span 
                                  className="bg-gradient-to-r from-silver-300 via-gray-200 to-silver-300 bg-clip-text text-transparent font-black italic"
                                  style={{
                                    backgroundImage: 'linear-gradient(135deg, #c0c0c0 0%, #e5e5e5 25%, #ffffff 50%, #e5e5e5 75%, #c0c0c0 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    textShadow: '0 0 10px rgba(255,255,255,0.3), 0 2px 4px rgba(255,255,255,0.2)',
                                    fontWeight: 900,
                                    fontStyle: 'italic',
                                    letterSpacing: '0.5px'
                                  }}
                                >
                                  {displayText}
                                </span>
                              ) : isPro ? (
                                <span className="relative inline-block">
                                  <svg width="0" height="0" style={{ position: 'absolute' }}>
                                    <defs>
                                      <linearGradient id="goldGradientProCrown" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#facc15" stopOpacity="1" />
                                        <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#ca8a04" stopOpacity="1" />
                                      </linearGradient>
                                    </defs>
                                  </svg>
                                  <Crown 
                                    className="absolute pointer-events-none"
                                    style={{
                                      width: '0.9em',
                                      height: '0.9em',
                                      fill: 'url(#goldGradientProCrown)',
                                      stroke: 'url(#goldGradientProCrown)',
                                      strokeWidth: 1.5,
                                      top: '-0.65em',
                                      left: '50%',
                                      transform: 'translateX(-50%) rotate(-15deg)',
                                      zIndex: 10
                                    }}
                                  />
                                  <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent font-extrabold">
                                    {displayText}
                                  </span>
                                </span>
                              ) : (
                                displayText
                              )}
                              {i < arr.length - 1 && !isEnt ? ' ' : (i < arr.length - 1 && isEnt ? ' ' : '')}
                            </span>
                          );
                        })}
                      </CardTitle>
                      {plan.label_color && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{backgroundColor: plan.label_color + '22', color: plan.label_color}}>
                          {user?.subscription_status === 'active' && user?.subscription_plan === plan.name ? 'Current Plan' : (plan.coming_soon ? 'Coming Soon' : 'New')}
                        </span>
                      )}
                      {!plan.label_color && user?.subscription_status === 'active' && user?.subscription_plan === plan.name && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          Current Plan
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <CardDescription className="text-gray-600 mt-1">{plan.description}</CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-6 p-6 sm:p-8 flex flex-col">
                    <div className="text-center py-2 flex-grow">
                      {hasDiscount && (
                        <div className="text-base text-gray-400 line-through mb-1">
                          {formatPrice(plan.price)}
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#3B2ED0] via-[#4F46E5] to-[#6366F1] bg-clip-text text-transparent">
                          {formatPrice(discountedPrice)}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-6">/ month · incl. GST</p>
                      {plan.one_time_price && (
                        <div className="text-sm text-gray-600 mt-1">One-time: ₹{plan.one_time_price}/month</div>
                      )}
                      {hasDiscount && (
                        <Badge className="mt-3 bg-green-100 text-green-700 border border-green-200 px-4 py-1">
                          🎉 Save {formatPrice(plan.price - discountedPrice)}!
                        </Badge>
                      )}
                      {hasSiteOffer && (
                        <div className="mt-3">
                          <Badge className={`bg-gradient-to-r ${
                            siteOffer.badge_color === 'red' ? 'from-red-500 to-pink-600' :
                            siteOffer.badge_color === 'orange' ? 'from-orange-500 to-amber-600' :
                            siteOffer.badge_color === 'green' ? 'from-green-500 to-emerald-600' :
                            siteOffer.badge_color === 'blue' ? 'from-blue-500 to-indigo-600' :
                            siteOffer.badge_color === 'purple' ? 'from-purple-500 to-pink-600' :
                            'from-red-500 to-pink-600'
                          } text-white border-0 px-4 py-1.5 shadow-md animate-pulse`}>
                            <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" />
                            {siteOffer.badge_text || siteOffer.offer_reason}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-2">
                            {siteOffer.offer_reason} - Valid until {new Date(siteOffer.valid_until).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {hasPromotion && !hasSiteOffer && (
                        <div className="mt-3">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 px-4 py-1.5 shadow-md">
                            <Gift className="h-3.5 w-3.5 mr-1.5 inline" />
                            {promoData.promotion_name}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-2">
                            Offer valid until {new Date(promoData.valid_until).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      {/* CTA section per plan */}
                      {user?.subscription_status === 'active' && user?.subscription_plan === plan.name ? (
                        <Button disabled className="w-full rounded-xl bg-emerald-600 text-white py-6 mt-6 font-semibold shadow-md">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Current Plan
                        </Button>
                      ) : !plan.coming_soon ? (
                        /* STRICT RULE: Show "Start Free Trial" ONLY to users who have NEVER activated trial before.
                           If trial_activated_at exists in DB, user has already used trial and should ONLY see "Buy Now".
                           This ensures anyone who has EVER had ANY plan (trial or paid) cannot use trial again. */
                        (() => {
                          const planNameLower = plan.name.toLowerCase();
                          const isPlusOrPro = (planNameLower.includes('plus') || planNameLower.includes('pro')) && !planNameLower.includes('enterprise');
                          
                          // STRICT CHECK: User has EVER used trial if trial_activated_at exists in database
                          // This field is set once when trial is activated and NEVER removed
                          // Even if subscription expires, this field remains to prevent re-using trial
                          const hasEverUsedTrial = user && user.trial_activated_at;
                          
                          // DEBUG: Log user data to diagnose issue
                          if (user && user.subscription_status !== 'active') {
                            console.log('🔍 TRIAL ELIGIBILITY CHECK:', {
                              plan: plan.name,
                              user_status: user.subscription_status,
                              trial_activated_at: user.trial_activated_at,
                              payment_method: user.payment_method,
                              hasEverUsedTrial: hasEverUsedTrial,
                              isPlusOrPro: isPlusOrPro
                            });
                          }
                          
                          // ONLY show trial button if:
                          // 1. Plus or Pro plan (not Enterprise)
                          // 2. User is logged in
                          // 3. User does NOT have active subscription
                          // 4. User has NEVER activated trial before (trial_activated_at does not exist)
                          const canShowTrial = isPlusOrPro && user && user.subscription_status !== 'active' && !hasEverUsedTrial;
                          const shouldShowBuyNow = !planNameLower.includes('enterprise');
                          
                          return canShowTrial ? (
                            <Button
                              onClick={async () => {
                                try {
                                  setTrialActivating(true);

                                  // Add a realistic delay (simulate processing)
                                  await new Promise(resolve => setTimeout(resolve, 1500));

                                  const res = await api.activateTrial({ plan_name: plan.name });
                                  const end = res?.data?.end;
                                  const planName = res?.data?.plan || plan.name;
                                  
                                  // Add another small delay before redirect
                                  await new Promise(resolve => setTimeout(resolve, 800));
                                  
                                  await refreshUser();
                                  toast.success('7-day Free Trial activated!');
                                  navigate('/thank-you', { 
                                    state: { 
                                      planType: planName,
                                      planValidity: '7 days',
                                      isTrial: true,
                                      end: end
                                    } 
                                  });
                                } catch (error) {
                                  toast.error(error.response?.data?.detail || 'Unable to activate trial');
                                  setTrialActivating(false);
                                }
                              }}
                              disabled={trialActivating}
                              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all py-6 mt-6"
                            >
                              {trialActivating ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Activating Trial...
                                </div>
                              ) : (
                                'Start Free Trial'
                              )}
                            </Button>
                          ) : shouldShowBuyNow ? (
                            gatewayConfigured ? (
                              <Button
                                onClick={() => handleRazorpayPayment(plan)}
                                disabled={paymentProcessing}
                                className="w-full rounded-xl bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white font-semibold shadow-lg shadow-[#3B2ED0]/25 hover:shadow-xl hover:shadow-[#3B2ED0]/30 hover:-translate-y-0.5 transition-all py-6 mt-6"
                              >
                                {paymentProcessing ? (
                                  <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                  </div>
                                ) : (
                                  'Buy Now'
                                )}
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => setMaintenanceDialogOpen(true)}
                                className="w-full rounded-xl bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white font-semibold shadow-lg shadow-[#3B2ED0]/25 hover:shadow-xl py-6 mt-6"
                              >
                                Buy Now
                              </Button>
                            )
                          ) : (
                            <Button disabled className="w-full rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed py-6 mt-6 font-medium">Coming Soon</Button>
                          );
                        })()
                      ) : (
                        <Button disabled className="w-full rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed py-6 mt-6 font-medium">Coming Soon</Button>
                      )}
                      {(() => {
                        const planNameLower = plan.name.toLowerCase();
                        const isPlusOrPro = (planNameLower.includes('plus') || planNameLower.includes('pro')) && !planNameLower.includes('enterprise');
                        const hasEverUsedTrial = user && user.trial_activated_at;
                        const canShowTrial = isPlusOrPro && user && user.subscription_status !== 'active' && !hasEverUsedTrial;
                        return !plan.coming_soon && canShowTrial && (
                          <div className="text-center text-xs text-gray-600 mt-2">No Credit-Card Needed</div>
                        );
                      })()}
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <div className="space-y-2.5 pt-2 border-t border-gray-100">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                              <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                            </div>
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Activation key */}
        <div className="mb-16 p-6 sm:p-8 rounded-3xl border-2 border-[#3B2ED0]/15 bg-white shadow-xl shadow-gray-200/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3B2ED0]/15 to-[#4F46E5]/10 flex items-center justify-center ring-1 ring-[#3B2ED0]/20">
                <Key className="h-7 w-7 text-[#3B2ED0]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Have an activation key?</h3>
                <p className="text-gray-600 mt-0.5">Activate your subscription instantly — no payment needed.</p>
              </div>
            </div>
            <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] px-6 py-3.5 font-semibold shadow-lg shadow-[#3B2ED0]/25">
                  <Key className="h-4 w-4 mr-2" />
                  Activate key
                </Button>
              </DialogTrigger>
                <DialogContent className="bg-slate-900 border border-white/20">
                  <DialogHeader>
                    <DialogTitle className="text-white text-2xl">Activate with Key</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleActivateWithKey} className="space-y-6 mt-6">
                    <div>
                      <Label className="text-white text-lg">Activation Key</Label>
                      <Input
                        value={activationKey}
                        onChange={(e) => setActivationKey(e.target.value)}
                        placeholder="Enter your activation key"
                        className="mt-3 bg-white/10 border-white/20 text-white placeholder-white/60"
                      />
                    </div>
                    <Button type="submit" disabled={loading || !activationKey} className="w-full bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white py-6 text-lg font-semibold">
                      {loading ? 'Activating...' : 'Activate Subscription'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
          </div>
        </div>

        {/* Features */}
        <section className="py-14 mt-2">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Included in all plans</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Everything you need to run your workforce operations.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-sm p-5 shadow-md shadow-gray-200/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#3B2ED0]/10 hover:border-[#3B2ED0]/20"
              >
                <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-[#3B2ED0]/15 to-[#4F46E5]/10 flex items-center justify-center transition-colors group-hover:from-[#3B2ED0]/20 group-hover:to-[#4F46E5]/15">
                  <feature.icon className="h-5 w-5 text-[#3B2ED0]" />
                </div>
                <p className="font-medium text-gray-800">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Why contractors choose us</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Outcomes that matter for your business.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-md shadow-gray-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-0.5"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16 mb-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Frequently asked questions</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Common questions about plans and billing.</p>
          </div>
          <Card className="rounded-3xl border-2 border-gray-200/80 bg-white shadow-xl shadow-gray-200/40 overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="cancel" className="px-6 sm:px-8 border-b border-[#3B2ED0]/10">
                <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline py-6 hover:text-[#3B2ED0] transition-colors [&>svg]:text-[#3B2ED0]/60">
                  Can I cancel my subscription anytime?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  Yes. You can cancel from your account settings at any time. Access continues until the end of your current billing period.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="promo" className="px-6 sm:px-8 border-b border-[#3B2ED0]/10">
                <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline py-6 hover:text-[#3B2ED0] transition-colors [&>svg]:text-[#3B2ED0]/60">
                  Do promo codes apply to renewals?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  No. Promo codes apply to the first month only. Standard pricing applies to subsequent renewals.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="payment" className="px-6 sm:px-8 border-b border-[#3B2ED0]/10">
                <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline py-6 hover:text-[#3B2ED0] transition-colors [&>svg]:text-[#3B2ED0]/60">
                  What payment methods are accepted?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  We accept credit and debit cards, UPI, net banking, and wallets via Razorpay.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="security" className="px-6 sm:px-8 border-b-0">
                <AccordionTrigger className="text-base font-semibold text-gray-900 hover:no-underline py-6 hover:text-[#3B2ED0] transition-colors [&>svg]:text-[#3B2ED0]/60">
                  Is my payment information secure?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  Yes. Payments are processed by Razorpay. We do not store your card details on our servers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </section>

        {/* Help CTA */}
        <div className="flex justify-center py-10">
          <Link
            to="/contact-us"
            className="group flex flex-col sm:flex-row items-center gap-3 sm:gap-4 rounded-2xl border-2 border-[#3B2ED0]/15 bg-white/95 px-6 sm:px-8 py-5 shadow-lg shadow-gray-200/50 ring-2 ring-[#3B2ED0]/5 transition-all duration-200 hover:shadow-xl hover:shadow-[#3B2ED0]/10 hover:border-[#3B2ED0]/25 hover:ring-[#3B2ED0]/10"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#3B2ED0]/15 to-[#4F46E5]/10 flex items-center justify-center transition-colors group-hover:from-[#3B2ED0]/20 group-hover:to-[#4F46E5]/15">
              <HelpCircle className="h-5 w-5 text-[#3B2ED0]" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-semibold text-gray-900">Need help choosing a plan?</p>
              <p className="text-sm text-gray-600 mt-0.5">We’re here to help — contact us for personalized advice.</p>
            </div>
            <span className="inline-flex items-center gap-2 text-[#3B2ED0] font-semibold group-hover:gap-3 transition-all">
              Contact us
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
      </div>

      {/* Welcome modal (post-registration) — premium */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-lg overflow-hidden border-0 p-0 gap-0 rounded-3xl shadow-[0_32px_64px_-12px_rgba(59,46,208,0.35),0_0_0_1px_rgba(255,255,255,0.05)_inset] [&>button]:text-white [&>button]:opacity-90 [&>button]:hover:opacity-100 [&>button]:right-4 [&>button]:top-4 [&>button]:h-9 [&>button]:w-9 [&>button]:rounded-full [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:transition-colors">
          <div className="relative bg-gradient-to-br from-[#1e1b4b] via-[#2d2882] to-[#3B2ED0] px-8 pt-12 pb-10 text-center overflow-hidden">
            {/* Ambient orbs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-violet-400/30 rounded-full blur-3xl" />
              <div className="absolute top-1/2 -right-8 w-32 h-32 bg-fuchsia-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 left-1/3 w-36 h-36 bg-indigo-400/25 rounded-full blur-3xl" />
            </div>
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              {/* Icon */}
              <div className="mx-auto mb-6 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-150" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm shadow-lg">
                    <CheckCircle2 className="h-10 w-10 text-emerald-300 drop-shadow-sm" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
              {/* Headline */}
              <p className="text-indigo-200 text-sm font-medium uppercase tracking-[0.2em] mb-2">You’re all set</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3 drop-shadow-sm">
                Welcome to GuestWorker{welcomeName ? `, ${welcomeName}` : ''}!
              </h2>
              <p className="text-white/85 text-base leading-relaxed max-w-sm mx-auto">
                Your account is ready. Pick a plan below to start your free trial — no credit card required.
              </p>
              {/* Trust pills */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 backdrop-blur-sm border border-white/10">
                  <Clock className="h-3.5 w-3.5 text-emerald-300" /> 7-day free trial
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 backdrop-blur-sm border border-white/10">
                  <Shield className="h-3.5 w-3.5 text-sky-300" /> No card required
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 backdrop-blur-sm border border-white/10">
                  <Zap className="h-3.5 w-3.5 text-amber-300" /> Cancel anytime
                </span>
              </div>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-6 bg-white border-t border-gray-100">
            <Button
              onClick={() => setShowWelcomeModal(false)}
              className="w-full bg-gradient-to-r from-[#3B2ED0] via-[#4F46E5] to-[#6366F1] hover:from-[#2A1FB8] hover:via-[#3D35D4] hover:to-[#4F46E5] text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-[#3B2ED0]/25 hover:shadow-xl hover:shadow-[#3B2ED0]/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Choose your plan
            </Button>
            <p className="text-center text-xs text-gray-500 mt-3">
              Full access from day one · Upgrade or cancel whenever you like
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Maintenance Dialog */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
              <DialogTitle className="text-xl">Payment System Under Maintenance</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Our payment gateway is currently unavailable. We're working to restore service as soon as possible.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-amber-900 font-semibold mb-2">Alternative Options:</p>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Contact our administrator to purchase an activation key</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Activation keys provide immediate access without payment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>Our support team can assist you with the purchase process</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setMaintenanceDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setMaintenanceDialogOpen(false);
                navigate('/contact-us');
              }}
              className="w-full sm:w-auto bg-[#3B2ED0] hover:bg-[#2A1FB8]"
            >
              Contact support
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trial Conversion Dialog */}
      <Dialog open={trialConversionDialogOpen} onOpenChange={setTrialConversionDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Add Payment Method for Seamless Renewal</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Your trial is ending soon. Set up auto-renewal now to continue without interruption.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">How it works:</p>
                  <ul className="space-y-1.5 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Add your payment method now (no charge yet)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Your trial continues as normal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Auto-renewal starts when trial ends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>No service interruption - seamless transition</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Choose your plan:</h3>
              <div className="grid gap-3">
                {plans.filter(p => p.razorpay_plan_id).map((plan) => (
                  <div
                    key={plan.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#3B2ED0] transition-colors cursor-pointer"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={selectedPlan?.id === plan.id}
                          onChange={() => setSelectedPlan(plan)}
                          className="h-4 w-4 text-[#3B2ED0]"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{plan.name}</p>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">₹{plan.price}</p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setTrialConversionDialogOpen(false)}
              className="w-full sm:w-auto"
              disabled={settingUpPayment}
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => selectedPlan && handleTrialPaymentSetup(selectedPlan)}
              disabled={!selectedPlan || settingUpPayment}
              className="w-full sm:w-auto bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white"
            >
              {settingUpPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Setting up...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
