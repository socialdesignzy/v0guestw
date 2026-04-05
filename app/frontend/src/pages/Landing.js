import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import AnimatedCounter from '../components/AnimatedCounter';
import api from '../utils/api';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';

const API = getApiUrl();
import {
  Users, FileText, DollarSign, TrendingUp, CheckCircle, Shield, Clock, BarChart3,
  Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, MessageSquare,
  Play, ArrowRight, Zap, Globe, Lock, Award, Star, ChevronRight, Building2,
  Calendar, IndianRupee, Wallet, PieChart, Sparkles, Rocket, Target, Heart, HelpCircle, X, Smartphone
} from 'lucide-react';

// Typewriter/Rotating Text Component
function RotatingText({ words, className = '' }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.substring(0, displayText.length + 1));
          setTypingSpeed(150);
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(currentWord.substring(0, displayText.length - 1));
          setTypingSpeed(100);
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentWordIndex, words, typingSpeed]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function Landing() {
  const [isVisible, setIsVisible] = useState({});
  const [stats, setStats] = useState({
    active_contractors: 0,
    total_workers: 0,
    total_payments: 0,
    payments_display: '₹0'
  });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [heroAnimated, setHeroAnimated] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [showOfferBanner, setShowOfferBanner] = useState(true);
  const observerRef = useRef(null);

  // Animate hero section immediately on mount
  useEffect(() => {
    // Small delay to ensure smooth initial render
    const timer = setTimeout(() => {
      setHeroAnimated(true);
      setIsVisible({
        'hero-badge': true,
        'hero-title': true,
        'hero-desc': true,
        'hero-cta': true,
        'hero-stats': true
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Fetch active site-wide offers
  useEffect(() => {
    const fetchActiveOffers = async () => {
      try {
        const response = await axios.get(`${API}/site-offers/active`);
        const offers = response.data.offers || [];
        if (offers.length > 0) {
          setActiveOffer(offers[0]); // Show first active offer
        }
      } catch (error) {
        console.error('Failed to fetch active offers:', error);
      }
    };
    fetchActiveOffers();
  }, []);

  // Fetch landing page stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getLandingStats();
        if (response.data) {
          const totalPayments = response.data.total_payments || 0;
          const paymentsInLakhs = totalPayments / 100000;
          let paymentsDisplay;
          
          if (paymentsInLakhs >= 10) {
            paymentsDisplay = `₹${(paymentsInLakhs / 10).toFixed(1)}Cr`;
          } else if (paymentsInLakhs >= 1) {
            paymentsDisplay = `₹${paymentsInLakhs.toFixed(1)}L`;
          } else if (totalPayments >= 1000) {
            paymentsDisplay = `₹${(totalPayments / 1000).toFixed(0)}K`;
          } else {
            paymentsDisplay = `₹${totalPayments}`;
          }
          
          setStats({
            active_contractors: response.data.total_contractors || 0,
            total_workers: response.data.total_workers || 0,
            total_payments: totalPayments,
            payments_display: paymentsDisplay
          });
          setStatsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to fetch landing stats:', error);
        // Use fallback values if API fails
        setStats({
          active_contractors: 0,
          total_workers: 0,
          total_payments: 0,
          payments_display: '₹0'
        });
        setStatsLoaded(true);
      }
    };

    fetchStats();
  }, []);

  // IntersectionObserver for sections below hero
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => {
      // Skip hero elements as they're handled separately
      if (!el.id.startsWith('hero-')) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const rotatingWords = ['Effortlessly', 'Intelligently', 'Seamlessly', 'Efficiently'];

  const statsDisplay = [
    { 
      value: stats.active_contractors, 
      label: 'Active Contractors', 
      icon: Users,
      suffix: '+',
      isNumber: true
    },
    { 
      value: stats.total_workers, 
      label: 'Workers Managed', 
      icon: CheckCircle,
      suffix: '+',
      isNumber: true
    },
    { 
      value: stats.payments_display, 
      label: 'Payments Processed', 
      icon: IndianRupee,
      isNumber: false
    },
    { 
      value: 99.9, 
      label: 'Uptime', 
      icon: Shield,
      suffix: '%',
      decimals: 1,
      isNumber: true
    }
  ];

  const features = [
    {
      icon: Users,
      title: 'Worker Management',
      desc: 'Complete worker profiles with documents, status tracking, and unlimited capacity',
      gradient: 'from-blue-500 to-cyan-500',
      color: 'blue'
    },
    {
      icon: Calendar,
      title: 'Dual Attendance',
      desc: 'Revolutionary dual-perspective attendance system with real-time synchronization',
      gradient: 'from-[#3B2ED0] to-[#4F46E5]',
      color: 'purple'
    },
    {
      icon: IndianRupee,
      title: 'Payment Tracking',
      desc: 'Automated wage calculations, advance management, and instant settlements',
      gradient: 'from-green-500 to-emerald-500',
      color: 'green'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      desc: 'Real-time dashboards, comprehensive reports, and actionable business insights',
      gradient: 'from-orange-500 to-red-500',
      color: 'orange'
    },
    {
      icon: Building2,
      title: 'Employer Management',
      desc: 'Multi-employer support with intelligent booking and assignment systems',
      gradient: 'from-[#3B2ED0] to-[#22D3EE]',
      color: 'indigo'
    },
    {
      icon: Wallet,
      title: 'Advance Management',
      desc: 'Smart advance tracking with automated settlement and balance management',
      gradient: 'from-teal-500 to-cyan-500',
      color: 'teal'
    },
    {
      icon: PieChart,
      title: 'Commission Tracking',
      desc: 'Automated commission calculations with profitability analysis and forecasting',
      gradient: 'from-rose-500 to-pink-500',
      color: 'rose'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      desc: 'Enterprise-grade security with automatic backups and 99.9% uptime guarantee',
      gradient: 'from-[#3B2ED0] to-[#4F46E5]',
      color: 'violet'
    }
  ];

  const benefits = [
    { icon: Clock, text: 'Save 10+ hours weekly - eliminate manual paperwork forever', color: 'text-blue-600' },
    { icon: Shield, text: 'Bank-level security with automatic daily backups', color: 'text-green-600' },
    { icon: Globe, text: 'Access from anywhere - cloud-based, always available', color: 'text-[#3B2ED0]' },
    { icon: TrendingUp, text: 'Track profitability and commission in real-time', color: 'text-orange-600' },
    { icon: Zap, text: 'Lightning-fast performance - optimized for speed', color: 'text-yellow-600' },
    { icon: Award, text: 'Trusted by 100+ contractors across India', color: 'text-[#3B2ED0]' }
  ];


  return (
    <div className="min-h-screen bg-[#F8FAFF] overflow-hidden relative">
      {/* Optimized Static Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Simplified Static Gradients - No animations for better performance */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply opacity-20" style={{ filter: 'blur(64px)' }}></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply opacity-20" style={{ filter: 'blur(64px)' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply opacity-15" style={{ filter: 'blur(64px)' }}></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
        
        {/* Static Gradient Orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-[#3B2ED0]/20 to-[#4F46E5]/20 rounded-full" style={{ filter: 'blur(48px)' }}></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-[#3B2ED0]/15 to-[#22D3EE]/15 rounded-full" style={{ filter: 'blur(48px)' }}></div>
      </div>

      {/* Offer Banner */}
      {activeOffer && showOfferBanner && (
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-3 px-4 relative z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="font-bold text-sm md:text-base">{activeOffer.offer_reason}</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-white/30"></div>
              <p className="text-sm md:text-base flex-1">
                {activeOffer.name} - Get {activeOffer.discount_type === 'percentage' ? `${activeOffer.discount_value}% OFF` : `₹${activeOffer.discount_value} OFF`} on all plans!
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeOffer.badge_text && (
                <span className="bg-white text-red-600 px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg animate-bounce">
                  {activeOffer.badge_text}
                </span>
              )}
              <button
                onClick={() => setShowOfferBanner(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-white/95 sticky top-0 z-50 shadow-sm relative">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">
              GuestWorker
            </h1>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="/features" className="text-gray-700 hover:text-[#3B2ED0] transition-colors font-medium">
              Features
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-[#3B2ED0] transition-colors font-medium">
              About
            </Link>
            <Link to="/pricing-info" className="text-gray-700 hover:text-[#3B2ED0] transition-colors font-medium">
              Pricing
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-[#3B2ED0] transition-colors font-medium">
              FAQ
            </Link>
            <Link to="/contact-us" className="text-gray-700 hover:text-[#3B2ED0] transition-colors font-medium">
              Contact
            </Link>
          </nav>
          <div className="flex gap-3 items-center">
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-[#3B2ED0]/10" data-testid="header-login-btn">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all" data-testid="header-register-btn">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto relative z-10">
          <div 
            id="hero-badge"
            className={`inline-block mb-6 transition-all duration-1000 ${heroAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '0.1s', transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          >
            <span className="bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 text-[#3B2ED0] px-6 py-2 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              India's #1 Workforce Management Platform
            </span>
          </div>
          <h1 
            id="hero-title"
            className={`text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight transition-all duration-1000 ${heroAnimated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
            style={{ transitionDelay: '0.3s', transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          >
            Transform Your Workforce Management{' '}
            <span className="text-gradient-animate bg-gradient-to-r from-[#3B2ED0] via-[#4F46E5] to-[#22D3EE] bg-clip-text text-transparent block md:inline">
              <RotatingText words={rotatingWords} />
            </span>
          </h1>
          <p 
            id="hero-desc"
            className={`text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto font-medium transition-all duration-1000 ${heroAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '0.5s', transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          >
            Automate attendance, streamline payments, and grow your business. <span className="font-semibold text-[#3B2ED0]">Trusted by 100+ contractors</span> across India.
          </p>
          <div 
            id="hero-cta"
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 ${heroAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '0.7s', transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          >
            <Link to="/register">
              <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all group" data-testid="hero-cta-btn">
                Start Free Trial - No Credit Card
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/pricing-info">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-[#3B2ED0]/30 hover:border-[#3B2ED0]/50 hover:bg-[#3B2ED0]/10">
                View Pricing Plans
              </Button>
            </Link>
          </div>
          <div 
            className={`flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-gray-500 transition-all duration-1000 ${heroAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '0.8s', transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>7-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Only ₹499/month</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div 
            id="hero-stats"
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 transition-all duration-1000 ${heroAnimated && statsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '1s', transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          >
            {statsDisplay.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white/95 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <Icon className="h-8 w-8 text-[#3B2ED0] mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.isNumber ? (
                      <AnimatedCounter 
                        end={stat.value} 
                        suffix={stat.suffix || ''}
                        decimals={stat.decimals || 0}
                        duration={2000}
                      />
                    ) : (
                      <span>{stat.value}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose GuestWorker Section */}
      <section 
        id="why-choose-section"
        data-animate
        className={`relative container mx-auto px-6 pt-12 pb-10 transition-all duration-1000 ${isVisible['why-choose-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 text-[#3B2ED0] px-4 py-1 rounded-full text-sm font-semibold">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for Modern Contractors
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage workers, track attendance, and grow your business - all in one powerful platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unlimited Workers</h3>
              <p className="text-gray-600">Manage unlimited workers and employers with detailed profiles, photos, and contact information</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Attendance</h3>
              <p className="text-gray-600">Track daily attendance with automatic wage calculations and payment tracking</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Reports</h3>
              <p className="text-gray-600">Get instant insights with comprehensive reports and analytics dashboard</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Bank-grade security with automatic backups and 99.9% uptime guarantee</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-8 border border-cyan-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Ready</h3>
              <p className="text-gray-600">Access from anywhere on any device - web, iOS, and Android apps available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section 
        id="features-section"
        data-animate
        className={`relative container mx-auto px-6 pt-10 pb-12 transition-all duration-1000 ${isVisible['features-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      >
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 text-[#3B2ED0] px-4 py-1 rounded-full text-sm font-semibold">
              Powerful Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools designed to eliminate manual work, reduce errors, and accelerate your business growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={idx} 
                className="border-2 hover:border-[#3B2ED0]/30 hover:shadow-xl transition-shadow group cursor-pointer relative overflow-hidden bg-white"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B2ED0]/5 to-[#4F46E5]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 text-center relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#3B2ED0] transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link to="/features">
            <Button variant="outline" size="lg" className="group">
              Explore All Features
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section 
        id="benefits-section"
        data-animate
        className={`relative container mx-auto px-6 pt-12 pb-10 transition-all duration-1000 ${isVisible['benefits-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Successful Contractors Choose GuestWorker
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Join hundreds of contractors who've transformed their businesses and eliminated the stress of manual workforce management.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div 
                    key={idx} 
                    className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow group border border-gray-100 hover:border-[#3B2ED0]/30"
                  >
                    <div className="bg-gradient-to-br from-[#3B2ED0]/10 to-[#4F46E5]/10 p-3 rounded-lg">
                      <Icon className={`h-6 w-6 ${benefit.color}`} />
                    </div>
                    <p className="text-lg text-gray-700 pt-1 font-medium">{benefit.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-3xl p-8 shadow-2xl">
              <div className="space-y-4">
                {[
                  { label: 'Active Contractors', value: stats.active_contractors, icon: Users, suffix: '+', isNumber: true },
                  { label: 'Workers Managed', value: stats.total_workers, icon: CheckCircle, suffix: '+', isNumber: true },
                  { label: 'Payments Processed', value: stats.payments_display, icon: IndianRupee, isNumber: false }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-white/10 backdrop-blur rounded-2xl p-6 hover:bg-white/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/90 font-medium">{stat.label}</span>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-4xl font-bold text-white">
                        {stat.isNumber && statsLoaded ? (
                          <AnimatedCounter 
                            end={stat.value} 
                            suffix={stat.suffix || ''}
                            duration={2000}
                          />
                        ) : (
                          <span>{stat.value}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section 
        id="cta-section"
        data-animate
        className={`relative container mx-auto px-6 pt-4 pb-16 transition-all duration-1000 ${isVisible['cta-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      >
        <div className="bg-gradient-to-br from-[#3B2ED0] via-[#4F46E5] to-[#22D3EE] rounded-3xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          <div className="relative z-10">
            <Rocket className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of successful contractors who've eliminated manual work, reduced errors, and accelerated their growth. Start your 7-day free trial today - no credit card required!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-[#3B2ED0] hover:bg-gray-100 text-lg px-10 py-7 shadow-xl transform hover:scale-105 transition-all group">
                  Start Your Free Trial Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/pricing-info">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-7">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
            <p className="text-white/80 mt-6 text-sm">
              ✓ 7-Day Free Trial • ✓ No Credit Card Required • ✓ Cancel Anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12 relative">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">GuestWorker</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                A digital workforce management platform by <span className="text-[#22D3EE] font-semibold">Designzy Technologies</span>. Empowering contractors to manage migrant workers efficiently, transparently, and profitably.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#3B2ED0] transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#3B2ED0] transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#3B2ED0] transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#3B2ED0] transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/features" className="hover:text-[#22D3EE] transition-colors">Features</Link></li>
                <li><Link to="/about" className="hover:text-[#22D3EE] transition-colors">About Us</Link></li>
                <li><Link to="/pricing-info" className="hover:text-[#22D3EE] transition-colors">Pricing</Link></li>
                <li><Link to="/login" className="hover:text-[#22D3EE] transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-[#22D3EE] transition-colors">Register</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terms-and-conditions" className="hover:text-[#22D3EE] transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-[#22D3EE] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/refund-policy" className="hover:text-[#22D3EE] transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/contact-us" className="hover:text-[#22D3EE] transition-colors text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#22D3EE]" />
                    Send us a Message
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#22D3EE]" />
                  <a href="mailto:support@guestworker.app" className="hover:text-[#22D3EE] transition-colors text-sm">
                    support@guestworker.app
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#22D3EE]" />
                  <span className="text-sm">+91 XXXXX XXXXX</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#22D3EE]" />
                  <span className="text-sm">India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2026 GuestWorker. All rights reserved. Made with <Heart className="inline h-4 w-4 text-red-500" /> for contractors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
