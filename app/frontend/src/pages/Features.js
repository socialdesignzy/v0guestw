import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Users, FileText, DollarSign, TrendingUp, CheckCircle, Shield, Clock, BarChart3,
  Building2, Calendar, IndianRupee, Wallet, PieChart, Zap, Globe, Lock, Award,
  ArrowRight, Sparkles, Target, Heart, Rocket, Bell, MessageSquare, Smartphone,
  Download, RefreshCw, Settings
} from 'lucide-react';

export default function Features() {

  const mainFeatures = [
    {
      icon: Users,
      title: 'Worker Management',
      description: 'Comprehensive worker profile management with complete details, documents, and status tracking.',
      features: [
        'Unlimited worker profiles',
        'Document storage and management',
        'Worker status tracking',
        'Search and filter capabilities',
        'Export worker data'
      ],
      gradient: 'from-blue-500 to-cyan-500',
      color: 'blue'
    },
    {
      icon: Calendar,
      title: 'Dual Attendance System',
      description: 'Track attendance from both worker and employer perspectives with real-time synchronization.',
      features: [
        'Worker-side attendance marking',
        'Employer-side attendance verification',
        'Real-time sync and updates',
        'Attendance history and reports',
        'Automated conflict resolution'
      ],
      gradient: 'from-purple-500 to-pink-500',
      color: 'purple'
    },
    {
      icon: IndianRupee,
      title: 'Payment Management',
      description: 'Complete payment tracking system for wages, advances, settlements, and commissions.',
      features: [
        'Wage calculation and tracking',
        'Advance payment management',
        'Settlement calculations',
        'Payment history and reports',
        'Multiple payment methods'
      ],
      gradient: 'from-green-500 to-emerald-500',
      color: 'green'
    },
    {
      icon: Building2,
      title: 'Employer Management',
      description: 'Manage multiple employers, track bookings, and streamline your operations efficiently.',
      features: [
        'Multiple employer profiles',
        'Booking management system',
        'Employer-worker assignments',
        'Communication tracking',
        'Performance analytics'
      ],
      gradient: 'from-[#3B2ED0] to-[#22D3EE]',
      color: 'indigo'
    },
    {
      icon: Wallet,
      title: 'Advance Tracking',
      description: 'Track and manage worker advances with automated settlement calculations and reporting.',
      features: [
        'Advance request management',
        'Automated settlement calculations',
        'Advance history tracking',
        'Settlement reports',
        'Balance management'
      ],
      gradient: 'from-teal-500 to-cyan-500',
      color: 'teal'
    },
    {
      icon: PieChart,
      title: 'Commission & Analytics',
      description: 'Automated commission calculations and comprehensive analytics for profitability insights.',
      features: [
        'Automated commission calculation',
        'Profitability analysis',
        'Real-time dashboards',
        'Custom reports generation',
        'Data export capabilities'
      ],
      gradient: 'from-orange-500 to-red-500',
      color: 'orange'
    },
    {
      icon: BarChart3,
      title: 'Smart Reports',
      description: 'Generate detailed reports and insights to make data-driven decisions for your business.',
      features: [
        'Attendance reports',
        'Payment summaries',
        'Worker performance reports',
        'Financial analytics',
        'Custom report builder'
      ],
      gradient: 'from-rose-500 to-pink-500',
      color: 'rose'
    },
    {
      icon: Shield,
      title: 'Security & Data Protection',
      description: 'Enterprise-grade security with automatic backups and data encryption to keep your information safe.',
      features: [
        'Encrypted data storage',
        'Automatic daily backups',
        'Role-based access control',
        'Secure cloud infrastructure',
        'Data privacy compliance'
      ],
      gradient: 'from-[#3B2ED0] to-[#4F46E5]',
      color: 'violet'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Stay updated with real-time notifications for attendance, payments, and important events.',
      features: [
        'Real-time push notifications',
        'Customizable alert preferences',
        'Attendance reminders',
        'Payment due alerts',
        'System updates and announcements'
      ],
      gradient: 'from-amber-500 to-orange-500',
      color: 'amber'
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Access your workforce management tools from any device, anywhere, anytime.',
      features: [
        'Fully responsive design',
        'Mobile-optimized interface',
        'Touch-friendly controls',
        'Works on all devices',
        'Offline data sync'
      ],
      gradient: 'from-violet-500 to-purple-500',
      color: 'violet'
    }
  ];

  const additionalFeatures = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed and performance' },
    { icon: Globe, title: 'Cloud-Based', desc: 'Access from anywhere, anytime' },
    { icon: Lock, title: 'Secure', desc: 'Enterprise-grade data protection' },
    { icon: Award, title: 'Reliable', desc: 'Built for consistent performance' },
    { icon: Target, title: 'Accurate', desc: 'Precise calculations and tracking' },
    { icon: Heart, title: 'User-Friendly', desc: 'Intuitive and easy to use' },
    { icon: Download, title: 'Export Data', desc: 'Download reports anytime' },
    { icon: RefreshCw, title: 'Auto-Sync', desc: 'Real-time data synchronization' },
    { icon: MessageSquare, title: 'Support', desc: '24/7 customer assistance' },
    { icon: Settings, title: 'Customizable', desc: 'Tailor to your needs' }
  ];

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
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6">
            <span className="bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 text-[#3B2ED0] px-6 py-2 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Complete Feature Set
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Powerful Features for <span className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">Modern Workforce Management</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            Everything you need to manage your workforce efficiently, from attendance tracking to payment management.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/pricing-info">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-[#3B2ED0]/30 hover:border-[#3B2ED0]/50 hover:bg-[#3B2ED0]/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="space-y-20">
          {mainFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            const isEven = idx % 2 === 0;
            
            return (
              <div
                key={idx}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div className={isEven ? '' : 'md:order-2'}>
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">{feature.title}</h2>
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={isEven ? 'md:order-2' : ''}>
                  <Card className="border-2 hover:shadow-2xl transition-all bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                      <div className={`aspect-video bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}>
                        <Icon className="h-24 w-24 text-white/80" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Additional Features Grid */}
      <section 
        id="additional-features"
        className="container mx-auto px-6 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            More Reasons to Choose GuestWorker
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Additional features that make GuestWorker the best choice for workforce management
          </p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {additionalFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="border-2 hover:border-[#3B2ED0]/30 hover:shadow-xl transition-all text-center bg-white/80 backdrop-blur-sm group">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#3B2ED0]/10 to-[#4F46E5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-[#3B2ED0]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-[#3B2ED0] via-[#4F46E5] to-pink-600 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
          <Rocket className="h-16 w-16 text-white mx-auto mb-6 animate-float" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start your free trial today and experience the power of GuestWorker
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-[#3B2ED0] hover:bg-gray-100 text-lg px-10 py-7 shadow-xl transform hover:scale-105 transition-all group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact-us">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-7">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
}
