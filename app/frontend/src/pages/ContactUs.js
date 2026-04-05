import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Users, ArrowLeft, Mail, Send, MessageSquare, CheckCircle, Phone, MapPin, 
  Clock, HelpCircle, Headphones, Shield, Zap, Globe, Facebook, Twitter, 
  Linkedin, Instagram, Building2, Award, TrendingUp, FileText, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    if (formData.message.length < 10) {
      toast.error('Message must be at least 10 characters long');
      return;
    }

    setLoading(true);
    try {
      const { getApiBaseUrl } = await import('../utils/apiConfig');
      const host = getApiBaseUrl();
      
      // Include category in subject if provided
      const subjectWithCategory = formData.category 
        ? `[${formData.category}] ${formData.subject}`
        : formData.subject;
      
      const response = await fetch(`${host}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject: subjectWithCategory
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send message');
      }

      toast.success('Message sent successfully! We will get back to you soon.');
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: ''
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending message:', error);
      }
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      value: 'support@guestworker.app',
      description: 'Send us an email anytime',
      link: 'mailto:support@guestworker.app',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      value: '+91-XXX-XXX-XXXX',
      description: 'Call us during business hours',
      link: 'tel:+91XXXXXXXXXX',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: MapPin,
      title: 'Office Address',
      value: 'India',
      description: 'Visit us at our office',
      link: '#',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const helpCategories = [
    {
      icon: Building2,
      title: 'Account & Billing',
      description: 'Questions about your account, subscription, or billing'
    },
    {
      icon: Users,
      title: 'Worker Management',
      description: 'Help with managing workers, attendance, and records'
    },
    {
      icon: CreditCard,
      title: 'Payments & Commissions',
      description: 'Payment processing, commissions, and financial queries'
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Account security, privacy concerns, and data protection'
    },
    {
      icon: FileText,
      title: 'Technical Support',
      description: 'Technical issues, bugs, or feature requests'
    },
    {
      icon: TrendingUp,
      title: 'Business Inquiries',
      description: 'Partnerships, enterprise solutions, and business opportunities'
    }
  ];

  const faqs = [
    {
      question: 'How quickly will I receive a response?',
      answer: 'We typically respond to all inquiries within 24-48 hours during business days. For urgent matters, please mention "URGENT" in your subject line.'
    },
    {
      question: 'What information should I include in my message?',
      answer: 'Please include your account email (if applicable), a clear description of your issue or question, and any relevant details that can help us assist you better.'
    },
    {
      question: 'Can I schedule a demo or consultation?',
      answer: 'Yes! Please mention in your message that you\'d like to schedule a demo, and our team will coordinate a time that works for you.'
    },
    {
      question: 'Do you offer phone support?',
      answer: 'Phone support is available for enterprise customers. For standard support, email is the fastest way to reach us, and we respond promptly.'
    },
    {
      question: 'How do I report a bug or technical issue?',
      answer: 'Please use the contact form and select "Technical Support" as the category. Include details about the issue, steps to reproduce, and any error messages you\'ve encountered.'
    },
    {
      question: 'Is my information secure?',
      answer: 'Absolutely. We take data security seriously and follow industry best practices. All communications are encrypted and handled according to our Privacy Policy.'
    }
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: 'https://facebook.com/guestworker', color: 'hover:text-blue-600' },
    { icon: Twitter, name: 'Twitter', url: 'https://twitter.com/guestworker', color: 'hover:text-sky-500' },
    { icon: Linkedin, name: 'LinkedIn', url: 'https://linkedin.com/company/guestworker', color: 'hover:text-blue-700' },
    { icon: Instagram, name: 'Instagram', url: 'https://instagram.com/guestworker', color: 'hover:text-pink-600' }
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
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B2ED0]/5 via-transparent to-[#4F46E5]/5"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-2xl mb-6 shadow-xl">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Get in <span className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">Touch</span>
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                We're here to help! Whether you have questions, need support, or want to learn more about GuestWorker, our team is ready to assist you.
              </p>
              <p className="text-lg text-gray-500">
                Reach out through any of the channels below, and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </section>

      {/* Contact Methods */}
      <section className="py-12 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className="border-2 hover:border-[#3B2ED0]/30 transition-all hover:shadow-xl group">
                  <CardHeader>
                    <div className={`w-14 h-14 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href={method.link}
                      className="text-[#3B2ED0] font-semibold hover:underline text-lg block mb-2"
                    >
                      {method.value}
                    </a>
                    {method.title === 'Email Support' && (
                      <p className="text-sm text-gray-500">
                        Response within 24-48 hours
                      </p>
                    )}
                    {method.title === 'Phone Support' && (
                      <p className="text-sm text-gray-500">
                        Mon-Fri, 9:00 AM - 6:00 PM IST
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Office Hours Card */}
          <Card className="border-2 border-[#3B2ED0]/20 bg-gradient-to-br from-[#3B2ED0]/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
                  <div className="space-y-1 text-gray-700">
                    <p><span className="font-semibold">Monday - Friday:</span> 9:00 AM - 6:00 PM IST</p>
                    <p><span className="font-semibold">Saturday:</span> 10:00 AM - 2:00 PM IST</p>
                    <p><span className="font-semibold">Sunday:</span> Closed</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    We monitor emails outside business hours and will respond as soon as possible. For urgent matters, please mark your email as "URGENT".
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What We Can Help With */}
      <section className="py-16 bg-gradient-to-br from-[#F8FAFF] to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Can We Help You?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our support team is ready to assist you with a wide range of topics. Choose a category that best describes your inquiry.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="border-2 hover:border-[#3B2ED0]/30 transition-all hover:shadow-lg group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#3B2ED0]/10 to-[#4F46E5]/10 rounded-xl flex items-center justify-center mb-4 group-hover:from-[#3B2ED0] group-hover:to-[#4F46E5] transition-all">
                      <Icon className="h-6 w-6 text-[#3B2ED0] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-2">
                <CardHeader className="bg-gradient-to-r from-[#3B2ED0]/5 to-[#4F46E5]/5">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Headphones className="h-6 w-6 text-[#3B2ED0]" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="text-base">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">Message Sent Successfully!</h3>
                      <p className="text-gray-600 mb-2 text-lg">
                        Thank you for contacting us. We have received your message and will get back to you soon.
                      </p>
                      <p className="text-sm text-gray-500 mb-8">
                        You should receive a confirmation email shortly. Our team typically responds within 24-48 hours.
                      </p>
                      <Button 
                        onClick={() => setSubmitted(false)}
                        className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-lg"
                        size="lg"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="text-base font-semibold">
                            Your Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="mt-2 h-11"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-base font-semibold">
                            Your Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="mt-2 h-11"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="category" className="text-base font-semibold">
                          Category (Optional)
                        </Label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="mt-2 flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B2ED0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select a category...</option>
                          <option value="Account & Billing">Account & Billing</option>
                          <option value="Worker Management">Worker Management</option>
                          <option value="Payments & Commissions">Payments & Commissions</option>
                          <option value="Security & Privacy">Security & Privacy</option>
                          <option value="Technical Support">Technical Support</option>
                          <option value="Business Inquiries">Business Inquiries</option>
                          <option value="General Inquiry">General Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="subject" className="text-base font-semibold">
                          Subject <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="How can we help you?"
                          required
                          className="mt-2 h-11"
                          maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.subject.length}/200 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-base font-semibold">
                          Message <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us more about your question or concern. Please include any relevant details that can help us assist you better..."
                          required
                          rows={8}
                          className="mt-2 resize-none"
                          maxLength={2000}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.message.length}/2000 characters (minimum 10 characters)
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-lg h-12 text-base font-semibold"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Zap className="h-5 w-5 mr-2 animate-pulse" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-gray-500 pt-2">
                        By submitting this form, you agree to our{' '}
                        <Link to="/privacy-policy" className="text-[#3B2ED0] hover:underline font-medium">
                          Privacy Policy
                        </Link>
                        {' '}and{' '}
                        <Link to="/terms-and-conditions" className="text-[#3B2ED0] hover:underline font-medium">
                          Terms of Service
                        </Link>
                        . Your information will be kept confidential and used only to respond to your inquiry.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="border-2 border-[#3B2ED0]/20 bg-gradient-to-br from-[#3B2ED0]/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#3B2ED0]" />
                    Quick Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900">Average Response Time</p>
                      <p className="text-2xl font-bold text-[#3B2ED0]">24-48 hours</p>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">For urgent matters:</p>
                      <p className="text-sm font-medium text-gray-900">Include "URGENT" in your subject line</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#3B2ED0]" />
                    Security & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    We take your privacy seriously. All communications are encrypted and handled according to industry standards.
                  </p>
                  <Link 
                    to="/privacy-policy" 
                    className="text-sm text-[#3B2ED0] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    Read our Privacy Policy
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#3B2ED0]" />
                    Follow Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-600 transition-all hover:border-[#3B2ED0] ${social.color} hover:scale-110`}
                          aria-label={social.name}
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Stay updated with our latest news and updates
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-br from-[#F8FAFF] to-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl mb-4 shadow-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Find quick answers to common questions about contacting us
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-2 hover:border-[#3B2ED0]/30 transition-all">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start gap-2">
                    <span className="text-[#3B2ED0] font-bold">Q{index + 1}.</span>
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 pl-7">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Still have questions? Don't hesitate to reach out!
            </p>
            <Link to="#contact-form">
              <Button className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-lg">
                Contact Us Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-12 bg-white border-t">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Additional Resources
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/help-center">
                <Card className="border-2 hover:border-[#3B2ED0]/30 transition-all hover:shadow-lg cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-8 w-8 text-[#3B2ED0] mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Help Center</h4>
                    <p className="text-sm text-gray-600">Browse our knowledge base</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/pricing">
                <Card className="border-2 hover:border-[#3B2ED0]/30 transition-all hover:shadow-lg cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <Award className="h-8 w-8 text-[#3B2ED0] mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Pricing Plans</h4>
                    <p className="text-sm text-gray-600">View our subscription options</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/features">
                <Card className="border-2 hover:border-[#3B2ED0]/30 transition-all hover:shadow-lg cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <Zap className="h-8 w-8 text-[#3B2ED0] mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                    <p className="text-sm text-gray-600">Explore what we offer</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      </div>
    </div>
  );
}
