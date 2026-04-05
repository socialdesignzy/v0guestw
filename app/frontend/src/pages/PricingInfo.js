import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Check, ArrowLeft, Users, Shield, Zap, TrendingUp, Clock, Star, 
  Sparkles, Crown, BarChart3, Download, FileText, DollarSign, 
  CheckCircle2, ArrowRight, Globe, Lock, Headphones, Rocket, 
  Award, Target, ArrowUpRight, Play, CheckCircle
} from 'lucide-react';

export default function PricingInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [siteOffers, setSiteOffers] = useState({});

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { getApiBaseUrl } = await import('../utils/apiConfig');
        const host = getApiBaseUrl();
        const res = await fetch(`${host}/api/plans`, { credentials: 'include' });
        const data = await res.json();
        const activePlans = data.plans || [];
        setPlans(activePlans);
        
        // Fetch site-wide offers
        await fetchSiteOffers(host, activePlans);
      } catch (e) {
        setPlans([]);
      }
    };
    
    const fetchSiteOffers = async (host, plansList) => {
      try {
        const res = await fetch(`${host}/api/site-offers/active`);
        const data = await res.json();
        const activeOffers = data.offers || [];
        
        const offerData = {};
        for (const plan of plansList) {
          for (const offer of activeOffers) {
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
              break;
            }
          }
        }
        setSiteOffers(offerData);
      } catch (error) {
        console.error('Failed to fetch site offers:', error);
      }
    };
    
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFF] overflow-hidden relative">
      {/* Optimized Static Background - Same as Landing Page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply opacity-20" style={{ filter: 'blur(64px)' }}></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply opacity-20" style={{ filter: 'blur(64px)' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply opacity-15" style={{ filter: 'blur(64px)' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-[#3B2ED0]/20 to-[#4F46E5]/20 rounded-full" style={{ filter: 'blur(48px)' }}></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-[#3B2ED0]/15 to-[#22D3EE]/15 rounded-full" style={{ filter: 'blur(48px)' }}></div>
      </div>
      <div className="relative z-10">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-block mb-6">
            <span className="bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 text-[#3B2ED0] px-6 py-2 rounded-full text-sm font-semibold shadow-sm">
              <Crown className="h-4 w-4 inline mr-2" />
              Start Your Free Trial Today
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Simple, Transparent <span className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">Pricing Plans</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Choose the perfect plan for your business needs. All plans include powerful features to transform your workforce management.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
            {!user?.trial_activated_at && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span>7-Day Free Trial</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>

        {/* Dynamic Plans from API */}
        {plans && plans.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {plans.map((plan, idx) => (
              <Card key={plan.id || idx} className={`border-2 ${plan.coming_soon ? 'border-gray-200' : 'border-[#3B2ED0]/30'} shadow-xl bg-white relative`}>
                {!plan.coming_soon && idx === 0 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] text-white px-4 py-1 shadow-lg">
                      <Star className="h-3 w-3 inline mr-1 fill-white" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-12 pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name.split(' ').map((w, i, arr) => {
                      const wordLower = w.toLowerCase();
                      const isPlus = wordLower === 'plus';
                      const isPro = wordLower === 'pro';
                      const isEnterprise = wordLower.includes('enterprise') || wordLower.includes('estate');
                      let color, displayText;
                      
                      if (isPlus) {
                        // Company logo color (indigo-purple gradient)
                        displayText = w + '+';
                      } else if (isPro) {
                        // Premium golden effect for Pro with crown
                        displayText = w;
                      } else if (isEnterprise) {
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
                                : isEnterprise
                                  ? 'inline-block px-3 py-1 rounded-md bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]'
                                  : ''
                          }
                        >
                          {isEnterprise ? (
                            <span 
                              className="font-black italic"
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
                                  <linearGradient id="goldGradientProCrownInfo" x1="0%" y1="0%" x2="100%" y2="0%">
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
                                  fill: 'url(#goldGradientProCrownInfo)',
                                  stroke: 'url(#goldGradientProCrownInfo)',
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
                          {i < arr.length - 1 && !isEnterprise ? ' ' : (i < arr.length - 1 && isEnterprise ? ' ' : '')}
                        </span>
                      );
                    })}
                  </CardTitle>
                  {plan.description && (
                    <CardDescription className="text-gray-600 mt-2">{plan.description}</CardDescription>
                  )}
                  <div className="mt-6">
                    {!plan.coming_soon ? (
                      <>
                        {siteOffers[plan.name] && (
                          <div className="text-lg text-gray-400 line-through mb-1">
                            ₹{plan.price}
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-5xl font-bold bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">
                            ₹{siteOffers[plan.name]?.discounted_price || plan.price}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">INR / month (inclusive of GST)</p>
                        {siteOffers[plan.name] && (
                          <div className="mb-4">
                            <Badge className={`bg-gradient-to-r ${
                              siteOffers[plan.name].badge_color === 'red' ? 'from-red-500 to-pink-600' :
                              siteOffers[plan.name].badge_color === 'orange' ? 'from-orange-500 to-amber-600' :
                              siteOffers[plan.name].badge_color === 'green' ? 'from-green-500 to-emerald-600' :
                              siteOffers[plan.name].badge_color === 'blue' ? 'from-blue-500 to-indigo-600' :
                              siteOffers[plan.name].badge_color === 'purple' ? 'from-purple-500 to-pink-600' :
                              'from-red-500 to-pink-600'
                            } text-white border-0 px-4 py-1.5 shadow-md animate-pulse`}>
                              <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" />
                              {siteOffers[plan.name].badge_text || siteOffers[plan.name].offer_reason}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-2">
                              {siteOffers[plan.name].offer_reason} - Save ₹{plan.price - siteOffers[plan.name].discounted_price}!
                            </p>
                          </div>
                        )}
                        {plan.one_time_price && (
                          <div className="text-sm text-gray-600 mt-1">One-time: ₹{plan.one_time_price}/month</div>
                        )}
                        {/* Buttons moved here - right after price */}
                        <div className="mt-6">
                          {plan.name.toLowerCase().includes('contractor plus') || plan.name.toLowerCase().includes('pro') ? (
                            <>
                              <Link to="/register">
                                <Button className="w-full bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-lg hover:shadow-xl transition-all py-6">Start Free Trial</Button>
                              </Link>
                              <div className="text-xs text-gray-600 mt-2">No Credit-Card Needed</div>
                            </>
                          ) : (
                            <Link to="/register">
                              <Button className="w-full bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-lg hover:shadow-xl transition-all py-6">Get Started</Button>
                            </Link>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-4xl font-bold text-gray-400">Coming Soon</span>
                        </div>
                        <Button disabled className="w-full bg-gray-200 text-gray-500 cursor-not-allowed py-6 mt-6">Coming Soon</Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  {plan.features && (
                    <div className="space-y-3">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 ${plan.coming_soon ? 'text-gray-400' : 'text-green-600'} mt-0.5 flex-shrink-0`} />
                          <span className={`${plan.coming_soon ? 'text-gray-500' : 'text-gray-800'} font-medium`}>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Old static plans removed */}
      </section>

      {/* Features Highlight */}
      <section className="bg-white/50 rounded-3xl py-20 my-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Why Contractors Choose Us</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Users, title: 'Unlimited Workers', desc: 'Manage unlimited workers without restrictions', color: 'from-blue-500 to-cyan-500' },
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Get instant insights into your workforce', color: 'from-purple-500 to-pink-500' },
              { icon: Download, title: 'Export Reports', desc: 'Download Excel/PDF reports anytime', color: 'from-green-500 to-emerald-500' },
              { icon: Shield, title: 'Secure & Reliable', desc: 'Bank-level security for your data', color: 'from-orange-500 to-red-500' }
            ].map((feature, idx) => (
              <Card key={idx} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="container mx-auto px-6 py-16">
        <Card className="max-w-4xl mx-auto shadow-xl bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] border-0">
          <CardContent className="p-10 text-center text-white">
            <div className="flex justify-center mb-6">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-xl md:text-2xl font-medium italic mb-6 leading-relaxed">
              "GuestWorker transformed how I manage my workforce. The dual attendance tracking and payment management features saved me 10+ hours every week!"
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20"></div>
              <div className="text-left">
                <div className="font-bold">Rajesh Kumar</div>
                <div className="text-sm text-white/90">Construction Contractor, Mumbai</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="max-w-4xl mx-auto shadow-xl bg-white border border-gray-200">
          <CardContent className="p-10 text-center">
            {!user?.trial_activated_at && (
              <div className="inline-block mb-6">
                <Badge className="bg-green-100 text-green-700 border border-green-200 px-6 py-2">
                  <CheckCircle2 className="h-4 w-4 inline mr-2" />
                  7-Day Free Trial • No Credit Card Required
                </Badge>
              </div>
            )}
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Ready to Transform Your Workforce Management?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of contractors who streamlined their operations with GuestWorker. 
              Start your free trial today and see the difference!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white px-8 py-6 text-lg shadow-lg">
                  Start Free Trial Now
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 border-[#3B2ED0]/30 hover:border-[#3B2ED0]/50 hover:bg-[#3B2ED0]/10">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              🔒 Secure signup • 📱 Mobile friendly • ⚡ Instant activation
            </p>
          </CardContent>
        </Card>
      </section>

      <Footer />
      </div>
    </div>
  );
}
