import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../utils/adminApi';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  Mail, MailOpen, Send, CheckCircle, Trash2, Search, Filter,
  AlertCircle, MessageSquare, Clock, User, ArrowLeft, RefreshCw, Eye,
  Users, Building2, Calendar, Phone, MapPin, X, ChevronLeft, Flag, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

import { getApiUrl } from '../utils/apiConfig';
const API = getApiUrl();
axios.defaults.withCredentials = true;

export default function AdminMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chat view states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  
  // User profile dialog
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchStats();
    fetchUnreadCount();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMessages(false); // Silent refresh
      fetchStats();
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [statusFilter, typeFilter, priorityFilter, searchQuery]);

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const params = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter && typeFilter !== 'all') params.type = typeFilter;
      if (priorityFilter && priorityFilter !== 'all') params.priority = priorityFilter;
      if (searchQuery) params.search = searchQuery;
      
      const response = await axios.get(`${API}/admin/messages`, { params });
      setMessages(response.data.messages || []);
      
      // If a message is selected, update it
      if (selectedMessage) {
        const updatedMessage = response.data.messages.find(m => m.id === selectedMessage.id);
        if (updatedMessage) {
          setSelectedMessage(updatedMessage);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin/login');
      } else {
        toast.error('Failed to fetch messages');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/messages/stats/summary`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await adminApi.getAdminUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    setReplyText('');
    
    // Mark as opened by admin (for notification tracking)
    try {
      await adminApi.markMessageOpenedByAdmin(message.id);
    } catch (error) {
      console.error('Failed to mark as opened:', error);
    }
    
    // Mark as read (for status tracking)
    if (message.status === 'unread') {
      try {
        await axios.put(`${API}/admin/messages/${message.id}/status`, {
          status: 'read'
        }, {
          withCredentials: true
        });
        fetchMessages(false);
        fetchStats();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    } else {
      // Even if already read, still refresh to update UI
      fetchMessages(false);
      fetchStats();
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setReplyLoading(true);
    try {
      await axios.post(`${API}/admin/messages/${selectedMessage.id}/reply`, {
        reply: replyText
      }, {
        withCredentials: true
      });
      toast.success('Reply sent successfully');
      setReplyText('');
      await fetchMessages(false);
      fetchStats();
      
      // Update selected message
      const updatedMessage = messages.find(m => m.id === selectedMessage.id);
      if (updatedMessage) {
        setSelectedMessage(updatedMessage);
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleMarkAsResolved = async () => {
    try {
      await axios.put(`${API}/admin/messages/${selectedMessage.id}/status`, {
        status: 'resolved'
      }, {
        withCredentials: true
      });
      toast.success('Message marked as resolved');
      fetchMessages();
      fetchStats();
      
      // Update selected message
      const updatedMessage = messages.find(m => m.id === selectedMessage.id);
      if (updatedMessage) {
        setSelectedMessage(updatedMessage);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleReopenConversation = async () => {
    try {
      await axios.put(`${API}/admin/messages/${selectedMessage.id}/status`, {
        status: 'replied'
      }, {
        withCredentials: true
      });
      toast.success('Conversation reopened');
      fetchMessages();
      fetchStats();
      
      // Update selected message
      const updatedMessage = messages.find(m => m.id === selectedMessage.id);
      if (updatedMessage) {
        setSelectedMessage(updatedMessage);
      }
    } catch (error) {
      toast.error('Failed to reopen conversation');
    }
  };

  const handleChangePriority = async (newPriority) => {
    try {
      await axios.put(`${API}/admin/messages/${selectedMessage.id}/status`, {
        priority: newPriority
      }, {
        withCredentials: true
      });
      toast.success(`Priority updated to ${newPriority}`);
      fetchMessages(false);
      
      // Update selected message
      const updatedMessage = { ...selectedMessage, priority: newPriority };
      setSelectedMessage(updatedMessage);
    } catch (error) {
      toast.error('Failed to update priority');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await axios.delete(`${API}/admin/messages/${messageId}`, {
        withCredentials: true
      });
      toast.success('Message deleted');
      setSelectedMessage(null);
      fetchMessages();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleViewProfile = async (userId) => {
    setProfileLoading(true);
    setShowProfileDialog(true);
    try {
      const response = await adminApi.getUserProfileForAdmin(userId);
      setUserProfile(response.data);
    } catch (error) {
      toast.error('Failed to load user profile');
      setShowProfileDialog(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      unread: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      replied: 'bg-green-100 text-green-800',
      resolved: 'bg-purple-100 text-purple-800'
    };
    return variants[status] || variants.read;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-800'
    };
    return variants[priority] || variants.normal;
  };

  const getPriorityIcon = (priority) => {
    const colors = {
      low: 'text-gray-400',
      normal: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return <Flag className={`h-4 w-4 ${colors[priority] || colors.normal}`} />;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-8 w-8" />
                  Messages Center
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 text-sm">
                      {unreadCount} need attention
                    </Badge>
                  )}
                </h1>
                <p className="text-purple-100 mt-1">Manage user communications</p>
              </div>
            </div>
            <Button
              onClick={() => fetchMessages()}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unread</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.unread_messages}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Replied</p>
                    <p className="text-3xl font-bold text-green-600">{stats.replied_messages}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.resolved_messages}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_messages}</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="bug_report">Bug Report</SelectItem>
                  <SelectItem value="account_deletion">Account Deletion</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface - Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <Card className="lg:col-span-1 min-h-[600px] max-h-[calc(100vh-320px)] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Conversations ({messages.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No messages</p>
                </div>
              ) : (
                <div className="divide-y">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedMessage?.id === message.id ? 'bg-[#3B2ED0]/10 border-l-4 border-indigo-600' : ''
                      } ${message.status === 'unread' ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{message.user_name}</p>
                            <p className="text-xs text-gray-500 truncate">{message.user_email}</p>
                          </div>
                        </div>
                        {getPriorityIcon(message.priority)}
                      </div>
                      <p className="font-medium text-sm mb-1 line-clamp-1">{message.subject}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{message.message}</p>
                      <div className="flex items-center justify-between">
                        <Badge className={`${getStatusBadge(message.status)} text-xs`}>
                          {message.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatTime(message.updated_at || message.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat View */}
          <Card className="lg:col-span-2 min-h-[600px] max-h-[calc(100vh-320px)] flex flex-col">
            {selectedMessage ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMessage(null)}
                        className="lg:hidden"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedMessage.user_name}</h3>
                        <p className="text-sm text-gray-600">{selectedMessage.user_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(selectedMessage.user_id)}
                      >
                        <User className="h-4 w-4 mr-1" />
                        Profile
                      </Button>
                      <Select value={selectedMessage.priority} onValueChange={handleChangePriority}>
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedMessage.status !== 'resolved' ? (
                        <Button
                          size="sm"
                          onClick={handleMarkAsResolved}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleReopenConversation}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reopen
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Message Meta Info */}
                  <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
                    <Badge className={getPriorityBadge(selectedMessage.priority)}>
                      {selectedMessage.priority}
                    </Badge>
                    <Badge className={getStatusBadge(selectedMessage.status)}>
                      {selectedMessage.status}
                    </Badge>
                    <Badge variant="outline">
                      {selectedMessage.type.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {formatTime(selectedMessage.created_at)}
                    </div>
                  </div>

                  {/* User Activity Tracking */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">User Activity:</span>
                      <span className={`${selectedMessage.opened_by_user ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedMessage.opened_by_user ? '✓ Opened' : '✗ Not opened yet'}
                      </span>
                      {selectedMessage.opened_by_user_at && (
                        <span className="text-gray-600">
                          • First: {formatTime(selectedMessage.opened_by_user_at)}
                        </span>
                      )}
                      {selectedMessage.user_last_seen_at && (
                        <span className="text-gray-600">
                          • Last: {formatTime(selectedMessage.user_last_seen_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Conversation Thread */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {/* Subject */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-500">
                    <p className="font-semibold text-gray-900 mb-1">Subject:</p>
                    <p className="text-gray-700">{selectedMessage.subject}</p>
                  </div>

                  {/* Initial Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{selectedMessage.user_name}</span>
                          <span className="text-xs text-gray-500">{formatTime(selectedMessage.created_at)}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedMessage.replies && selectedMessage.replies.map((reply, index) => (
                    <div key={reply.id || index} className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        reply.sender === 'admin' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {reply.sender === 'admin' ? (
                          <MessageSquare className="h-5 w-5 text-white" />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`rounded-lg shadow-sm p-4 ${
                          reply.sender === 'admin' ? 'bg-green-50' : 'bg-white'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">
                              {reply.sender === 'admin' ? `Admin (${reply.sender_name})` : reply.sender_name}
                            </span>
                            <span className="text-xs text-gray-500">{formatTime(reply.created_at)}</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Reply Input */}
                {selectedMessage.status !== 'resolved' ? (
                  <div className="border-t p-4 bg-white">
                    <div className="space-y-3">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        rows={3}
                        className="resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleSendReply();
                          }
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Press Ctrl+Enter to send</p>
                        <Button
                          onClick={handleSendReply}
                          disabled={replyLoading || !replyText.trim()}
                          className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4]"
                        >
                          {replyLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t p-4 bg-purple-50">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="font-semibold text-purple-900">This conversation is resolved</p>
                      <p className="text-sm text-purple-700 mt-1">User cannot reply to this message</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a message from the list to view and reply</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {profileLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          ) : userProfile ? (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{userProfile.user.name}</h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {userProfile.user.email}
                  </p>
                  {userProfile.user.phone && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {userProfile.user.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{userProfile.stats.total_workers}</p>
                  <p className="text-sm text-gray-600">Workers</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <Building2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{userProfile.stats.total_employers}</p>
                  <p className="text-sm text-gray-600">Employers</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <MessageSquare className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{userProfile.stats.total_messages}</p>
                  <p className="text-sm text-gray-600">Messages</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <Sparkles className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-orange-600 uppercase">{userProfile.stats.subscription_plan}</p>
                  <p className="text-sm text-gray-600 capitalize">{userProfile.stats.subscription_status}</p>
                </div>
              </div>

              {/* Subscription Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Subscription Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Plan:</p>
                    <p className="font-medium capitalize">{userProfile.stats.subscription_plan}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className="font-medium capitalize">{userProfile.stats.subscription_status}</p>
                  </div>
                  {userProfile.user.subscription_start_date && (
                    <div>
                      <p className="text-gray-600">Start Date:</p>
                      <p className="font-medium">{new Date(userProfile.user.subscription_start_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {userProfile.user.subscription_end_date && (
                    <div>
                      <p className="text-gray-600">End Date:</p>
                      <p className="font-medium">{new Date(userProfile.user.subscription_end_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Account Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">User ID:</p>
                    <p className="font-mono text-xs">{userProfile.user.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created:</p>
                    <p className="font-medium">{new Date(userProfile.user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
