import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { 
  MessageSquare, Send, HelpCircle, AlertCircle, 
  MessageCircle, Bug, CheckCircle, Mail, 
  Clock, User, Reply, BookOpen, Zap, Shield,
  TrendingUp, FileText, Search, Sparkles, ArrowRight,
  Phone, Globe, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeView, setActiveView] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'support',
    subject: '',
    message: '',
    priority: 'normal'
  });
  
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showConversationDialog, setShowConversationDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  
  const openedMessageIdRef = React.useRef(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveView(tabParam);
    }
  }, [searchParams]);
  
  useEffect(() => {
    const messageId = searchParams.get('message_id');
    
    // Only open if we have messages, messageId exists, and we haven't opened this message yet
    if (messageId && messages.length > 0 && openedMessageIdRef.current !== messageId) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        openedMessageIdRef.current = messageId;
        handleOpenConversation(message);
      }
    }
  }, [messages, searchParams]);

  const messageTypes = [
    { value: 'support', label: 'General Support', icon: HelpCircle, color: 'from-blue-500 to-blue-600', description: 'Get help with features and functionality' },
    { value: 'feedback', label: 'Product Feedback', icon: MessageCircle, color: 'from-green-500 to-green-600', description: 'Share your ideas and suggestions' },
    { value: 'bug_report', label: 'Report a Bug', icon: Bug, color: 'from-orange-500 to-orange-600', description: 'Found something not working right?' },
  ];

  const quickLinks = [
    { title: 'Getting Started Guide', icon: BookOpen, description: 'Learn the basics of GuestWorker', color: 'bg-blue-500', link: '/resources#getting-started' },
    { title: 'Managing Workers', icon: User, description: 'Add, edit, and organize your workforce', color: 'bg-green-500', link: '/resources#workers' },
    { title: 'Attendance Tracking', icon: CheckCircle, description: 'Mark and manage daily attendance', color: 'bg-purple-500', link: '/resources#attendance' },
    { title: 'Payment Processing', icon: TrendingUp, description: 'Handle wages and commissions', color: 'bg-orange-500', link: '/resources#payments' },
    { title: 'Reports & Analytics', icon: FileText, description: 'Generate insights from your data', color: 'bg-pink-500', link: '/resources#reports' },
    { title: 'Account Settings', icon: Shield, description: 'Manage your profile and preferences', color: 'bg-indigo-500', link: '/resources#account' },
  ];

  useEffect(() => {
    fetchUserMessages();
  }, []);

  const fetchUserMessages = async () => {
    setMessagesLoading(true);
    try {
      const response = await api.getUserMessages();
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load your messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.sendMessage(formData);
      
      toast.success('Message sent successfully! We\'ll respond soon.');
      
      setFormData({
        type: 'support',
        subject: '',
        message: '',
        priority: 'normal'
      });
      
      fetchUserMessages();
      setActiveView('messages');
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpenConversation = async (message) => {
    setSelectedMessage(message);
    setShowConversationDialog(true);
    setReplyText('');

    try {
      await api.markMessageOpened(message.id);
      fetchUserMessages();
      window.dispatchEvent(new CustomEvent('refreshUnreadCount'));
    } catch (error) {
      console.error('Failed to mark message as opened:', error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setReplyLoading(true);
    try {
      await api.replyToMessage(selectedMessage.id, replyText);
      toast.success('Reply sent successfully!');
      setReplyText('');
      
      await fetchUserMessages();
      
      const updatedMessage = messages.find(m => m.id === selectedMessage.id);
      if (updatedMessage) {
        setSelectedMessage(updatedMessage);
      }
      
      window.dispatchEvent(new CustomEvent('refreshUnreadCount'));
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'unread': { label: 'New', className: 'bg-blue-500 text-white' },
      'read': { label: 'Read', className: 'bg-gray-500 text-white' },
      'replied': { label: 'Replied', className: 'bg-green-500 text-white' },
      'resolved': { label: 'Resolved', className: 'bg-purple-500 text-white' }
    };
    const config = statusConfig[status] || statusConfig['unread'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'urgent': { label: 'Urgent', className: 'bg-red-100 text-red-700 border-red-300' },
      'high': { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-300' },
      'normal': { label: 'Normal', className: 'bg-blue-100 text-blue-700 border-blue-300' },
      'low': { label: 'Low', className: 'bg-gray-100 text-gray-700 border-gray-300' }
    };
    const config = priorityConfig[priority] || priorityConfig['normal'];
    return <Badge variant="outline" className={`${config.className} border`}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#3B2ED0] via-[#4F46E5] to-[#6366F1] overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-xl">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Help Center
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Get instant support, explore resources, and connect with our team
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for help articles, guides, or FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto">
            <Button
              variant={activeView === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveView('overview')}
              className={`rounded-full px-6 ${activeView === 'overview' ? 'bg-[#3B2ED0] text-white shadow-lg' : 'hover:bg-gray-100'}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeView === 'new' ? 'default' : 'ghost'}
              onClick={() => setActiveView('new')}
              className={`rounded-full px-6 ${activeView === 'new' ? 'bg-[#3B2ED0] text-white shadow-lg' : 'hover:bg-gray-100'}`}
            >
              <Send className="h-4 w-4 mr-2" />
              New Message
            </Button>
            <Button
              variant={activeView === 'messages' ? 'default' : 'ghost'}
              onClick={() => setActiveView('messages')}
              className={`rounded-full px-6 ${activeView === 'messages' ? 'bg-[#3B2ED0] text-white shadow-lg' : 'hover:bg-gray-100'}`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              My Messages
              {messages.filter(m => m.has_unread_admin_reply).length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {messages.filter(m => m.has_unread_admin_reply).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="space-y-12">
            {/* Quick Actions */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                  <p className="text-gray-600">Get help fast with these common tasks</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {messageTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.value}
                      className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 hover:border-[#3B2ED0]/50 overflow-hidden"
                      onClick={() => {
                        handleInputChange('type', type.value);
                        setActiveView('new');
                      }}
                    >
                      <div className={`h-2 bg-gradient-to-r ${type.color}`}></div>
                      <CardContent className="p-6">
                        <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${type.color} rounded-2xl mb-4 shadow-lg`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#3B2ED0] transition-colors">
                          {type.label}
                        </h3>
                        <p className="text-gray-600 mb-4">{type.description}</p>
                        <div className="flex items-center text-[#3B2ED0] font-semibold group-hover:gap-2 transition-all">
                          Get Started
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Popular Resources */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Popular Resources</h2>
                  <p className="text-gray-600">Browse our most helpful guides and tutorials</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => navigate(link.link)}
                      className="group flex items-start gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#3B2ED0]/50 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className={`${link.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#3B2ED0] transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-600">{link.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#3B2ED0] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Email Support</h3>
                      <p className="text-sm text-gray-600">We typically respond within 24-48 hours</p>
                    </div>
                  </div>
                  <a href="mailto:support@guestworker.app" className="text-blue-600 font-semibold hover:underline">
                    support@guestworker.app
                  </a>
                </CardContent>
              </Card>

              <Card 
                className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white cursor-pointer hover:shadow-xl hover:border-green-300 transition-all group"
                onClick={() => navigate('/resources')}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">Online Resources</h3>
                      <p className="text-sm text-gray-600">Access guides, FAQs, and tutorials</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-green-600 font-semibold">Available 24/7</p>
                    <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* New Message View */}
        {activeView === 'new' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Send a New Message</h2>
              <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-2 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-[#3B2ED0]/5 to-[#4F46E5]/5 border-b-2">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Mail className="h-6 w-6 text-[#3B2ED0]" />
                      Message Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Message Type Selection */}
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Message Type</Label>
                        <div className="grid grid-cols-1 gap-3">
                          {messageTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = formData.type === type.value;
                            return (
                              <div
                                key={type.value}
                                onClick={() => handleInputChange('type', type.value)}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-[#3B2ED0] bg-[#3B2ED0]/5 shadow-md'
                                    : 'border-gray-200 hover:border-[#3B2ED0]/30 hover:bg-gray-50'
                                }`}
                              >
                                <div className={`w-12 h-12 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                  <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{type.label}</h4>
                                  <p className="text-sm text-gray-600">{type.description}</p>
                                </div>
                                {isSelected && <CheckCircle className="h-6 w-6 text-[#3B2ED0]" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold">Your Email</Label>
                        <Input
                          value={user?.email || ''}
                          disabled
                          className="mt-2 h-12 bg-gray-50 text-gray-700"
                        />
                      </div>

                      <div>
                        <Label className="text-base font-semibold">Priority Level</Label>
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                          <SelectTrigger className="mt-2 h-12">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                Low - General inquiry
                              </div>
                            </SelectItem>
                            <SelectItem value="normal">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Normal - Standard request
                              </div>
                            </SelectItem>
                            <SelectItem value="high">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                High - Important issue
                              </div>
                            </SelectItem>
                            <SelectItem value="urgent">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Urgent - Critical problem
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-semibold">Subject <span className="text-red-500">*</span></Label>
                        <Input
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder="Brief description of your message"
                          className="mt-2 h-12"
                          maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-1.5">{formData.subject.length}/200 characters</p>
                      </div>

                      <div>
                        <Label className="text-base font-semibold">Message <span className="text-red-500">*</span></Label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Describe your issue or question in detail..."
                          rows={8}
                          className="mt-2 resize-none"
                          maxLength={2000}
                        />
                        <p className="text-xs text-gray-500 mt-1.5">{formData.message.length}/2000 characters</p>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveView('overview')}
                          className="flex-1 h-12 text-base"
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 h-12 text-base bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] shadow-lg"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900">Response Times</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Urgent</span>
                        <span className="text-sm font-semibold text-red-600">4-8 hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">High</span>
                        <span className="text-sm font-semibold text-orange-600">12-24 hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Normal</span>
                        <span className="text-sm font-semibold text-blue-600">24-48 hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Low</span>
                        <span className="text-sm font-semibold text-gray-600">2-3 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] text-white overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg">What Happens Next?</h3>
                    </div>
                    <ul className="space-y-2.5 text-sm text-white/90">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Your message is sent to our support team</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>We review and respond based on priority</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>You'll see replies in "My Messages"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Continue the conversation anytime</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Messages View */}
        {activeView === 'messages' && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Conversations</h2>
              <p className="text-gray-600">View and manage all your support messages in one place</p>
            </div>

            {messagesLoading ? (
              <Card className="border-2">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3B2ED0] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your messages...</p>
                  </div>
                </CardContent>
              </Card>
            ) : messages.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-16">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                      <MessageSquare className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600 mb-6">Start a conversation with our support team</p>
                    <Button
                      onClick={() => setActiveView('new')}
                      className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] h-12 px-8"
                    >
                      <Send className="mr-2 h-5 w-5" />
                      Send Your First Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card
                    key={message.id}
                    onClick={() => handleOpenConversation(message)}
                    className={`group cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 border-2 ${
                      message.has_unread_admin_reply
                        ? 'border-blue-300 bg-blue-50/50 shadow-lg'
                        : 'border-gray-200 hover:border-[#3B2ED0]/50'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-[#3B2ED0] transition-colors">
                              {message.subject}
                            </h3>
                            {message.has_unread_admin_reply && (
                              <Badge className="bg-blue-500 text-white shadow-md animate-pulse">
                                New Reply
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 line-clamp-2 mb-4">{message.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {formatDate(message.updated_at || message.created_at)}
                            </div>
                            {message.replies && message.replies.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <MessageCircle className="h-4 w-4" />
                                {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {getStatusBadge(message.status)}
                          {getPriorityBadge(message.priority)}
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#3B2ED0] group-hover:translate-x-1 transition-all mt-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conversation Dialog */}
      <Dialog open={showConversationDialog} onOpenChange={(open) => {
        setShowConversationDialog(open);
        if (!open) {
          // Clear message_id from URL when closing dialog
          const currentParams = new URLSearchParams(searchParams);
          if (currentParams.has('message_id')) {
            currentParams.delete('message_id');
            navigate(`/help?${currentParams.toString()}`, { replace: true });
          }
          openedMessageIdRef.current = null;
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-3">{selectedMessage?.subject}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedMessage && getStatusBadge(selectedMessage.status)}
                  {selectedMessage && getPriorityBadge(selectedMessage.priority)}
                  <Badge variant="outline" className="text-xs border-gray-300">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedMessage && formatDate(selectedMessage.created_at)}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 mt-6">
              {/* Initial Message */}
              <div className="bg-gradient-to-br from-[#3B2ED0]/10 to-[#4F46E5]/10 rounded-2xl p-6 border-2 border-[#3B2ED0]/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-900">You</span>
                      <span className="text-xs text-gray-500">{formatDate(selectedMessage.created_at)}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {selectedMessage.replies && selectedMessage.replies.map((reply, index) => (
                <div
                  key={reply.id || index}
                  className={`rounded-2xl p-6 border-2 ${
                    reply.sender === 'admin'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : 'bg-gradient-to-br from-[#3B2ED0]/10 to-[#4F46E5]/10 border-[#3B2ED0]/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      reply.sender === 'admin' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5]'
                    }`}>
                      {reply.sender === 'admin' ? (
                        <MessageSquare className="h-6 w-6 text-white" />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-gray-900">
                          {reply.sender === 'admin' ? `Support Team (${reply.sender_name})` : 'You'}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Reply Section */}
              <div className="border-t-2 pt-6 mt-6">
                {selectedMessage.status === 'resolved' ? (
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-2xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mb-4">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Conversation Resolved</h3>
                    <p className="text-purple-700 mb-4">
                      This conversation has been marked as resolved. If you have a new question, please start a new conversation.
                    </p>
                    <Button
                      onClick={() => {
                        setShowConversationDialog(false);
                        setActiveView('new');
                      }}
                      className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Start New Conversation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label className="text-base font-bold flex items-center gap-2">
                      <Reply className="h-5 w-5 text-[#3B2ED0]" />
                      Send a Reply
                    </Label>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={5}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={replyLoading || !replyText.trim()}
                      className="w-full h-12 bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-base shadow-lg"
                    >
                      {replyLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending Reply...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
