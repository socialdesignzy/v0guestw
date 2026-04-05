import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Users, Target, Heart, Award, Rocket, Shield, Globe, Zap,
  ArrowRight, CheckCircle, Star, TrendingUp, Building2
} from 'lucide-react';

export default function About() {

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      desc: 'We are committed to simplifying workforce management for contractors across India.',
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      title: 'User-Centric',
      desc: 'Every feature is designed with our users in mind, ensuring the best experience.',
      color: 'text-red-600'
    },
    {
      icon: Award,
      title: 'Excellence',
      desc: 'We strive for excellence in everything we do, from design to customer support.',
      color: 'text-yellow-600'
    },
    {
      icon: Rocket,
      title: 'Innovation',
      desc: 'Constantly innovating to bring you the latest features and technologies.',
      color: 'text-purple-600'
    }
  ];

  const highlights = [
    { icon: Target, title: 'Purpose-Built', desc: 'Designed specifically for contractor workforce management' },
    { icon: Zap, title: 'Modern Technology', desc: 'Built with cutting-edge cloud infrastructure' },
    { icon: Heart, title: 'User-First', desc: 'Every feature designed with contractors in mind' },
    { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security and data protection' }
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
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            About <span className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">GuestWorker</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-0 leading-relaxed">
            A Software-as-a-Service platform by <strong className="text-[#3B2ED0]">Designzy Technologies</strong>, we're on a mission to revolutionize workforce management for contractors across India, making it simpler, faster, and more efficient.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section 
        id="story-section"
        className="container mx-auto px-6 py-12"
      >
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  GuestWorker, developed by <strong>Designzy Technologies</strong>, was born from a simple observation: contractors managing migrant workers were spending countless hours on paperwork, manual calculations, and administrative tasks. We saw an opportunity to transform this process through technology.
                </p>
                <p>
                  Launched in 2026, GuestWorker represents the next generation of workforce management solutions. Backed by the expertise of Designzy Technologies, our team of developers, designers, and industry experts work tirelessly to create a platform that's both powerful and easy to use.
                </p>
                <p>
                  We're building a platform that addresses the real challenges contractors face every day. Our vision is to become India's leading workforce management platform, helping contractors grow their businesses while ensuring fair and transparent management of their workers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          <Card 
            id="mission"
            className="border-2 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all"
          >
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                To empower contractors with powerful, easy-to-use tools that simplify workforce management, save time, and help them grow their businesses while ensuring transparency and fairness for all workers.
              </p>
            </CardContent>
          </Card>

          <Card 
            id="vision"
            className="border-2 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all"
          >
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                To become India's leading workforce management platform, setting the standard for transparency, efficiency, and innovation in contractor-worker relationships.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section 
        id="values-section"
        className="container mx-auto px-6 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, idx) => {
            const Icon = value.icon;
            return (
              <Card key={idx} className="border-2 hover:shadow-xl transition-all bg-white/80 backdrop-blur-sm text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#3B2ED0]/10 to-[#4F46E5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className={`h-8 w-8 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Highlights */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-3xl p-12 shadow-2xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What Sets Us Apart</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Built for the modern contractor
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center hover:bg-white/20 transition-colors">
                  <Icon className="h-10 w-10 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/90 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section 
        id="why-choose"
        className="container mx-auto px-6 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose GuestWorker?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Here's what makes us different
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Fast & Efficient', desc: 'Lightning-fast performance that saves you time' },
            { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security and data protection' },
            { icon: Globe, title: 'Accessible Anywhere', desc: 'Cloud-based platform accessible from any device' },
            { icon: Award, title: 'Modern Platform', desc: 'Built with latest technology and best practices' },
            { icon: Heart, title: 'User-Friendly', desc: 'Intuitive design that anyone can use' },
            { icon: CheckCircle, title: 'Comprehensive', desc: 'All features you need in one platform' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="border-2 hover:shadow-xl transition-all bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#3B2ED0]/10 to-[#4F46E5]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-[#3B2ED0]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
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
            Join Us on This Journey
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of the workforce management revolution. Start your free trial today!
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
                Contact Us
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
