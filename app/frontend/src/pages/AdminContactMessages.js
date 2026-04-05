import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../utils/adminApi';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  Mail, MailOpen, Trash2, Search, Filter, CheckCircle, XCircle,
  MessageSquare, Clock, User, ArrowLeft, RefreshCw, Eye, Send
} from 'lucide-react';
import { toast } from 'sonner';

import { getApiUrl } from '../utils/apiConfig';
const API = getApiUrl();
axios.defaults.withCredentials = true;

export default function AdminContactMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [admin, setAdmin] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // View dialog
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (admin) {
      fetchMessages();
    }
  }, [statusFilter, searchQuery, admin]);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/admin/me`, {
        withCredentials: true
      });
      setAdmin(response.data);
    } catch (error) {
      console.error('Admin auth failed:', error);
      navigate('/admin/login');
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await axios.get(`${API}/admin/contact-messages?${params}`, {
        withCredentials: true
      });
      
      setMessages(response.data.messages || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setShowDialog(true);
    
    // Mark as read if unread
    if (message.status === 'unread') {
      try {
        await axios.put(
          `${API}/admin/contact-messages/${message.id}/status`,
          { status: 'read' },
          { withCredentials: true }
        );
        fetchMessages();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await axios.put(
        `${API}/admin/contact-messages/${messageId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(`Status updated to ${newStatus}`);
      fetchMessages();
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/admin/contact-messages/${messageId}`, {
        withCredentials: true
      });
      toast.success('Contact message deleted');
      fetchMessages();
      if (selectedMessage && selectedMessage.id === messageId) {
        setShowDialog(false);
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      unread: { variant: 'destructive', label: 'Unread' },
      read: { variant: 'secondary', label: 'Read' },
      replied: { variant: 'default', label: 'Replied' },
      resolved: { variant: 'outline', label: 'Resolved' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6" data-testid="admin-contact-messages-page">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/dashboard')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold" style={{fontFamily: 'Manrope, sans-serif'}}>
              Contact Messages
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            Messages from unlogged users via the contact form
          </p>
        </div>
        <Button onClick={fetchMessages} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <Mail className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-green-600">
                  {messages.filter(m => m.status === 'replied').length}
                </p>
              </div>
              <Send className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-600">
                  {messages.filter(m => m.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, subject, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {!admin ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Verifying authentication...</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No contact messages found
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    message.status === 'unread' ? 'border-l-4 border-l-red-500' : ''
                  }`}
                  onClick={() => handleViewMessage(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{message.subject}</h3>
                          {getStatusBadge(message.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{message.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{message.email}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 line-clamp-2 mb-2">{message.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(message.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMessage(message);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(message.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedMessage.subject}</span>
                  {getStatusBadge(selectedMessage.status)}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{selectedMessage.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`mailto:${selectedMessage.email}`}
                      className="text-[#3B2ED0] hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(selectedMessage.created_at)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Message</h4>
                  <div className="bg-white border rounded-lg p-4 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {selectedMessage.status !== 'replied' && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Mark as Replied
                    </Button>
                  )}
                  {selectedMessage.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(selectedMessage.id, 'resolved')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`;
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

