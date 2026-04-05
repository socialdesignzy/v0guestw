import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Users, HelpCircle, MessageSquare, ArrowRight, Search, CheckCircle, Shield,
  CreditCard, Clock, Globe, Lock, Zap, FileText, BarChart3, Building2
} from 'lucide-react';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: 'General Questions',
      icon: HelpCircle,
      questions: [
        {
          q: 'What is GuestWorker and who is it for?',
          a: 'GuestWorker is a comprehensive digital workforce management platform designed specifically for contractors who manage migrant workers. It helps you automate attendance tracking, streamline payment management, track commissions, and manage your entire workforce efficiently. Whether you\'re a small contractor managing 10 workers or a large operation with hundreds of workers, GuestWorker simplifies your daily operations.'
        },
        {
          q: 'How does GuestWorker help contractors save time?',
          a: 'GuestWorker automates manual processes that typically take hours. Our platform eliminates paperwork, automates calculations for wages and commissions, provides real-time attendance tracking, and generates reports instantly. On average, contractors save 10+ hours per week by using GuestWorker instead of manual methods.'
        },
        {
          q: 'Is GuestWorker suitable for small contractors?',
          a: 'Absolutely! GuestWorker is designed for contractors of all sizes. Our Contractor Plus plan is perfect for small to medium contractors managing up to 50 workers. The platform is easy to use, requires no technical knowledge, and you can start with our 7-day free trial to see if it fits your needs.'
        },
        {
          q: 'Do I need any technical knowledge to use GuestWorker?',
          a: 'No technical knowledge is required! GuestWorker is designed to be intuitive and user-friendly. Our interface is simple and straightforward, and we provide comprehensive support to help you get started. If you can use a smartphone, you can use GuestWorker.'
        }
      ]
    },
    {
      title: 'Features & Functionality',
      icon: Zap,
      questions: [
        {
          q: 'What is the dual attendance system?',
          a: 'Our dual attendance system is a unique feature that allows both workers and employers to mark attendance independently. Workers can mark their own attendance, and employers can also verify and mark attendance. The system syncs in real-time, creating transparency and reducing disputes. This dual-perspective approach ensures accuracy and builds trust between all parties.'
        },
        {
          q: 'Can I manage unlimited workers?',
          a: 'The number of workers you can manage depends on your subscription plan. Contractor Plus allows up to 50 workers, Contractor Pro allows up to 250 workers, and Enterprise plan offers unlimited workers. All plans allow unlimited attendance records, payments, and other data entries.'
        },
        {
          q: 'How does payment tracking work?',
          a: 'GuestWorker provides comprehensive payment management including wage calculations, advance tracking, settlement calculations, and payment history. You can track payments from employers, manage worker wages, handle advances, and automatically calculate settlements. All payment data is stored securely and can be exported for accounting purposes.'
        },
        {
          q: 'Can I export my data?',
          a: 'Yes! GuestWorker allows you to export all your data including worker lists, attendance records, payment summaries, and reports in Excel and PDF formats. This makes it easy to share information with accountants, maintain records, and create backups.'
        },
        {
          q: 'How does commission tracking work?',
          a: 'Our commission tracking feature automatically calculates your commission based on the payments received from employers and wages paid to workers. You can view real-time commission reports, track profitability, and analyze your business performance through detailed analytics and dashboards.'
        },
        {
          q: 'Can I access GuestWorker on mobile devices?',
          a: 'Yes! GuestWorker is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. You can access your account from anywhere, anytime, as long as you have an internet connection. This is especially useful for marking attendance on-site or checking data while on the go.'
        }
      ]
    },
    {
      title: 'Pricing & Subscriptions',
      icon: CreditCard,
      questions: [
        {
          q: 'What are the subscription plans and pricing?',
          a: 'We offer three plans: Contractor Plus (₹499/month) for up to 50 workers and 25 employers, Contractor Pro (₹999/month) for up to 250 workers and 100 employers, and Enterprise (₹1999/month) with unlimited workers and employers. All plans include all core features, with higher plans offering more capacity and priority support.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major payment methods through our secure payment gateway including credit cards, debit cards, UPI, net banking, and digital wallets. All transactions are processed securely and you\'ll receive a receipt for every payment.'
        },
        {
          q: 'Are there any hidden fees?',
          a: 'No hidden fees! The price you see is the price you pay. All plans are billed monthly, and the price includes GST. There are no setup fees, transaction fees, or additional charges. The only exception is if you choose to upgrade or downgrade your plan mid-cycle, which will be prorated accordingly.'
        },
        {
          q: 'Can I change my plan later?',
          a: 'Yes, you can upgrade or downgrade your plan at any time from your account settings. If you upgrade, you\'ll get immediate access to the higher plan features. If you downgrade, the changes will take effect at the end of your current billing period. Prorated charges or credits will be applied as needed.'
        },
        {
          q: 'What happens if I exceed my plan limits?',
          a: 'If you approach your plan limits, you\'ll receive notifications. You can either upgrade to a higher plan or contact our support team to discuss your options. We won\'t delete your existing data, but you may need to upgrade to add more workers or employers.'
        }
      ]
    },
    {
      title: 'Free Trial',
      icon: Clock,
      questions: [
        {
          q: 'How does the 7-day free trial work?',
          a: 'When you sign up, you automatically get a 7-day free trial with full access to all premium features. No credit card is required to start your trial. You can explore all features, add workers, track attendance, and use the platform just like a paid subscriber. After 7 days, you can choose to subscribe to continue using the platform.'
        },
        {
          q: 'Do I need a credit card for the free trial?',
          a: 'No credit card is required! You can start your 7-day free trial completely free. We only ask for payment information when you decide to subscribe after your trial period ends.'
        },
        {
          q: 'What happens after my free trial ends?',
          a: 'After your 7-day free trial ends, you\'ll need to subscribe to a plan to continue using GuestWorker. Your data will be preserved, and you can choose any plan that suits your needs. If you don\'t subscribe, your account will remain but with limited access to features.'
        },
        {
          q: 'Can I extend my free trial?',
          a: 'The standard free trial is 7 days. However, if you need more time to evaluate the platform, please contact our support team, and we\'ll be happy to discuss your situation and see if we can accommodate your needs.'
        }
      ]
    },
    {
      title: 'Security & Data',
      icon: Shield,
      questions: [
        {
          q: 'How secure is my data?',
          a: 'We take data security very seriously. GuestWorker uses enterprise-grade encryption, secure cloud storage, and follows industry best practices for data protection. All data is encrypted in transit and at rest. We also perform automatic daily backups to ensure your data is never lost.'
        },
        {
          q: 'Where is my data stored?',
          a: 'Your data is stored securely in cloud servers with automatic backups. We use enterprise-grade infrastructure to ensure high availability and data protection. All data centers comply with international security standards.'
        },
        {
          q: 'Can I delete my data?',
          a: 'Yes, you have full control over your data. You can delete individual records or request complete account deletion. However, we recommend exporting your data before deletion as this action cannot be undone. Contact support if you need assistance with data deletion.'
        },
        {
          q: 'Who can access my data?',
          a: 'Only you and authorized users you invite can access your data. We never share your data with third parties. Our support team may access your account only with your explicit permission to help resolve issues. All access is logged and monitored for security.'
        },
        {
          q: 'What is your uptime guarantee?',
          a: 'We strive to maintain high availability and reliability. We use robust cloud infrastructure and monitoring systems to ensure continuous service. In the rare event of any issues, we work quickly to restore service and keep users informed.'
        }
      ]
    },
    {
      title: 'Account & Support',
      icon: MessageSquare,
      questions: [
        {
          q: 'How do I cancel my subscription?',
          a: 'You can cancel your subscription at any time from your account settings. Simply go to "Manage Subscription" and click "Cancel Subscription". You\'ll continue to have access to all features until the end of your current billing period. There are no cancellation fees or penalties.'
        },
        {
          q: 'Will I get a refund if I cancel?',
          a: 'Refunds are handled on a case-by-case basis. If you cancel mid-cycle, you\'ll continue to have access until the end of your billing period. For refund requests, please contact our support team, and we\'ll review your situation according to our refund policy.'
        },
        {
          q: 'What kind of support do you provide?',
          a: 'We offer comprehensive customer support through multiple channels: email support, in-app messaging, help center with detailed guides, and video tutorials. Our support team is responsive and committed to helping you succeed with GuestWorker. Higher-tier plans include priority support.'
        },
        {
          q: 'How do I contact customer support?',
          a: 'You can contact us through the "Contact Us" page on our website, send an email to support@guestworker.app, or use the in-app messaging feature. We typically respond within 24 hours, and priority support customers get faster responses.'
        },
        {
          q: 'Do you provide training or onboarding?',
          a: 'Yes! We provide comprehensive onboarding materials including video tutorials, step-by-step guides, and a knowledge base. Our support team is also available to help you get started. We want to ensure you can use GuestWorker effectively from day one.'
        },
        {
          q: 'Can multiple people use the same account?',
          a: 'Each account is designed for a single contractor. However, you can add team members or assistants with appropriate permissions. For organizations needing multiple separate accounts, we recommend our Enterprise plan which offers better collaboration features.'
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(qa => 
      qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qa.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
              <HelpCircle className="h-4 w-4" />
              Frequently Asked Questions
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Everything You Need to <span className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">Know</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            Find answers to common questions about GuestWorker. Can't find what you're looking for? Contact our support team.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#3B2ED0] focus:outline-none text-lg bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          {filteredCategories.map((category, categoryIdx) => {
            const Icon = category.icon;
            return (
              <div
                key={categoryIdx}
                id={`category-${categoryIdx}`}
                className="transition-all duration-300"
              >
                <Card className="border-2 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#3B2ED0]/10 to-[#4F46E5]/10 rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6 text-[#3B2ED0]" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, idx) => (
                        <AccordionItem 
                          key={idx} 
                          value={`item-${categoryIdx}-${idx}`}
                          className="border-b border-gray-200 last:border-b-0"
                        >
                          <AccordionTrigger className="text-left font-semibold text-lg text-gray-900 hover:text-[#3B2ED0] py-4">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-700 leading-relaxed pt-2 pb-4">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* No Results Message */}
        {searchQuery && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">Try searching with different keywords</p>
            <Button onClick={() => setSearchQuery('')} variant="outline">
              Clear Search
            </Button>
          </div>
        )}
      </section>

      {/* Still Have Questions CTA */}
      <section className="container mx-auto px-6 py-20">
        <Card className="max-w-4xl mx-auto shadow-xl bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] border-0">
          <CardContent className="p-12 text-center text-white">
            <MessageSquare className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Our support team is here to help! Get in touch and we'll respond as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us">
                <Button size="lg" className="bg-white text-[#3B2ED0] hover:bg-gray-100 text-lg px-8 py-6 shadow-xl group">
                  Contact Support
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
      </div>
    </div>
  );
}
