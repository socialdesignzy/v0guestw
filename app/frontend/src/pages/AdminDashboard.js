import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { 
  Users, Building, Briefcase, DollarSign, TrendingUp, LogOut, UserCog, 
  Key, MessageSquare, CreditCard, Shield, AlertTriangle, Award, 
  Activity, Clock, CheckCircle, XCircle, ArrowRight, BarChart3, Megaphone, Mail,
  Wallet, Trash2, Wrench, Gift, UserX
} from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '../utils/adminApi';

import { getApiUrl } from '../utils/apiConfig';
const API = getApiUrl();
axios.defaults.withCredentials = true;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [messageStats, setMessageStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [contactUnreadCount, setContactUnreadCount] = useState(0);
  const [securityDashboard, setSecurityDashboard] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletionPendingCount, setDeletionPendingCount] = useState(0);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [siteMaintenance, setSiteMaintenance] = useState(false);
  const [siteMaintenanceLoading, setSiteMaintenanceLoading] = useState(false);
  const [platformRevenue, setPlatformRevenue] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchStats();
    fetchMessageStats();
    fetchUnreadCount();
    fetchContactUnreadCount();
    fetchSecurityDashboard();
    fetchDeletionPending();
    fetchGatewayStatus();
    fetchSiteMaintenance();
    fetchPlatformRevenue();
  }, []);

  const fetchSiteMaintenance = async () => {
    try {
      const res = await adminApi.getSiteMaintenance();
      setSiteMaintenance(!!res.data?.maintenance);
    } catch {
      setSiteMaintenance(false);
    }
  };

  const fetchPlatformRevenue = async () => {
    try {
      const res = await adminApi.getPlatformRevenue({ limit: 1 });
      setPlatformRevenue(res.data);
    } catch {
      setPlatformRevenue(null);
    }
  };

  const fetchDeletionPending = async () => {
    try {
      const res = await adminApi.getDeletionRequests({ status: 'pending', limit: 1 });
      setDeletionPendingCount(res.data?.total ?? 0);
    } catch {
      setDeletionPendingCount(0);
    }
  };

  const fetchGatewayStatus = async () => {
    try {
      const res = await adminApi.getGatewayStatus();
      setGatewayStatus(res.data);
    } catch {
      setGatewayStatus(null);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/admin/me`);
      setAdmin(response.data);
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/messages/stats/summary`);
      setMessageStats(response.data);
    } catch (error) {
      console.error('Failed to fetch message stats:', error);
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

  const fetchContactUnreadCount = async () => {
    try {
      const response = await axios.get(`${API}/admin/contact-messages?status=unread`, {
        withCredentials: true
      });
      setContactUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch contact unread count:', error);
    }
  };

  const fetchSecurityDashboard = async () => {
    try {
      const response = await adminApi.getSecurityDashboard();
      setSecurityDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch security dashboard:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/admin/logout`);
      navigate('/admin/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-[#F8FAFF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3B2ED0] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-[#3B2ED0] via-[#4F46E5] to-[#6366F1] border-b border-white/20 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-2xl border border-white/30">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Admin Dashboard</h1>
                <p className="text-sm text-white/90 font-medium">Welcome back, {admin?.name}! 👋</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/admin/messages')}
                variant="outline"
                size="sm"
                className="relative bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-red-500 hover:border-red-600 backdrop-blur-sm transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Security Alert Banner (only show if NEW threats since last login) */}
        {securityDashboard && securityDashboard.new_threats_since_login > 0 && (
          <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900 mb-1">Security Alerts Detected</h3>
                    <p className="text-sm text-red-700 mb-4">
                      {securityDashboard.new_threats_since_login} new high/critical security event{securityDashboard.new_threats_since_login !== 1 ? 's' : ''} since your last login
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Badge className="bg-red-600 text-white">
                        {securityDashboard.threats_24h} threats (24h)
                      </Badge>
                      <Badge className="bg-orange-600 text-white">
                        {securityDashboard.failed_logins_24h} failed logins
                      </Badge>
                      <Badge className="bg-yellow-600 text-white">
                        {securityDashboard.active_lockouts} active lockouts
                      </Badge>
                      {securityDashboard.unresolved_critical > 0 && (
                        <Badge className="bg-purple-600 text-white">
                          {securityDashboard.unresolved_critical} unresolved critical
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/admin/security-logs')}
                  className="bg-red-600 hover:bg-red-700 flex-shrink-0"
                >
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Site-wide Maintenance */}
        <Card className={`border-2 shadow-lg overflow-hidden ${siteMaintenance ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50' : 'border-gray-200'}`}>
          <div className={`h-2 ${siteMaintenance ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gray-200'}`}></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${siteMaintenance ? 'bg-amber-100' : 'bg-gray-100'}`}>
                  <Wrench className={`h-6 w-6 ${siteMaintenance ? 'text-amber-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Site-wide maintenance</h3>
                  <p className="text-sm text-gray-600">
                    {siteMaintenance
                      ? 'Contractors see a maintenance message and cannot use the app. Admin functions work normally.'
                      : 'When enabled, all contractors see a maintenance message after login. Only admin routes work.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={siteMaintenance ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'}>
                  {siteMaintenance ? 'ON' : 'OFF'}
                </Badge>
                <Switch
                  checked={siteMaintenance}
                  disabled={siteMaintenanceLoading}
                  onCheckedChange={async (checked) => {
                    setSiteMaintenanceLoading(true);
                    try {
                      await adminApi.setSiteMaintenance(!!checked);
                      setSiteMaintenance(!!checked);
                      toast.success(checked ? 'Site maintenance enabled' : 'Site maintenance disabled');
                    } catch (e) {
                      toast.error('Failed to update maintenance setting');
                    } finally {
                      setSiteMaintenanceLoading(false);
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Platform Overview</h2>
              <p className="text-sm text-gray-600">Real-time insights and key metrics</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Contractors */}
            <Card className="overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-white">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Contractors</p>
                    <p className="text-4xl font-bold text-gray-900">{stats?.total_contractors || 0}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {stats?.active_contractors || 0} active
                      </Badge>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Workers */}
            <Card className="overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-white">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">Active Workers</p>
                    <p className="text-4xl font-bold text-gray-900">{stats?.total_workers || 0}</p>
                    <p className="text-xs text-gray-500 mt-3">Across all contractors</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Employers */}
            <Card className="overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-white">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">Active Employers</p>
                    <p className="text-4xl font-bold text-gray-900">{stats?.total_employers || 0}</p>
                    <p className="text-xs text-gray-500 mt-3">System-wide</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Revenue */}
            <Card 
              className="overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg cursor-pointer bg-white group"
              onClick={() => navigate('/admin/platform-revenue')}
            >
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:h-3 transition-all"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">Platform Revenue</p>
                    <p className="text-4xl font-bold text-gray-900">₹{stats?.platform_revenue?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500 mt-3">From subscriptions & paid keys • View details</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Quick Management</h2>
            <p className="text-sm text-gray-600">Access key administrative functions</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            <Card 
              className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 group"
              onClick={() => navigate('/admin/contractors')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all">
                  <UserCog className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Manage Users</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 group"
              onClick={() => navigate('/admin/activation-keys')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all">
                  <Key className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Activation Keys</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-orange-500 group"
              onClick={() => navigate('/admin/plans')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Plan Management</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] relative"
              onClick={() => navigate('/admin/messages')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <MessageSquare className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Messages</p>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-pink-500 to-rose-600"
              onClick={() => navigate('/admin/notifications')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Megaphone className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Send Notifications</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-purple-500 to-pink-600"
              onClick={() => navigate('/admin/promotions')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Gift className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Promotions/Offers</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-yellow-500 to-amber-600"
              onClick={() => navigate('/admin/site-offers')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Gift className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Site-Wide Offers</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600"
              onClick={() => navigate('/admin/gateway-settings')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <CreditCard className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Payment Gateway</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-red-500 to-red-600 relative"
              onClick={() => navigate('/admin/security-logs')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Security Logs</p>
                {securityDashboard && securityDashboard.unresolved_critical > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    {securityDashboard.unresolved_critical}
                  </span>
                )}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-cyan-500 to-teal-600 relative"
              onClick={() => navigate('/admin/contact-messages')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Mail className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Contact Messages</p>
                {contactUnreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    {contactUnreadCount}
                  </span>
                )}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-gray-600 to-gray-800 relative"
              onClick={() => navigate('/admin/deleted-users')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <UserX className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Deleted Users</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-indigo-500 to-violet-600 relative"
              onClick={() => navigate('/admin/payment-orders')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Wallet className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Payment Orders</p>
                {gatewayStatus?.maintenance && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-xs rounded-full px-1.5 h-5 flex items-center justify-center font-bold shadow-lg">
                    Maintenance
                  </span>
                )}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-rose-600 to-red-700 relative"
              onClick={() => navigate('/admin/deletion-requests')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Trash2 className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white">Deletion Requests</p>
                {deletionPendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-rose-700 text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    {deletionPendingCount}
                  </span>
                )}
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-emerald-500 to-green-600 group"
              onClick={() => navigate('/admin/platform-revenue')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm font-bold text-white mb-2">Platform Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ₹{platformRevenue?.total_amount?.toLocaleString('en-IN') || '0'}
                </p>
                <p className="text-xs text-white/80 mt-1">All-time total</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Financial Overview & Messages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Overview */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Financial Overview
              </CardTitle>
              <CardDescription>Platform-wide financial metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Payments Collected</p>
                    <p className="text-2xl font-bold text-green-700">₹{stats?.total_payments_collected?.toLocaleString() || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Wages Paid</p>
                    <p className="text-2xl font-bold text-blue-700">₹{stats?.total_wages_paid?.toLocaleString() || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Platform Revenue</p>
                    <p className="text-2xl font-bold text-purple-700">₹{stats?.platform_revenue?.toLocaleString() || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="mb-1">• Revenue from Razorpay payments & activation keys</p>
                <p>• Test mode users not included in revenue calculations</p>
              </div>
            </CardContent>
          </Card>

          {/* Messages Center */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5]"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#3B2ED0]" />
                    Messages Center
                  </CardTitle>
                  <CardDescription>User communication overview</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate('/admin/messages')}
                  className="bg-[#3B2ED0] hover:bg-[#2A1FB8]"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {messageStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => navigate('/admin/messages?status=unread')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-medium text-orange-700">Unread</p>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      </div>
                      <p className="text-3xl font-bold text-orange-600">{messageStats.unread_messages}</p>
                    </div>

                    <div 
                      className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => navigate('/admin/messages?status=replied')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-medium text-green-700">Replied</p>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-600">{messageStats.replied_messages}</p>
                    </div>

                    <div 
                      className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => navigate('/admin/messages?status=resolved')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-medium text-purple-700">Resolved</p>
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-3xl font-bold text-purple-600">{messageStats.resolved_messages}</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-medium text-blue-700">Total</p>
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{messageStats.total_messages}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-gray-700 mb-3">By Message Type:</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Account Deletion</span>
                        <Badge className="bg-red-100 text-red-700">{messageStats.by_type.account_deletion}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Support</span>
                        <Badge className="bg-blue-100 text-blue-700">{messageStats.by_type.support}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Feedback</span>
                        <Badge className="bg-green-100 text-green-700">{messageStats.by_type.feedback}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Bug Reports</span>
                        <Badge className="bg-orange-100 text-orange-700">{messageStats.by_type.bug_report}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-3">Loading messages...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Contractors */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Recent Contractors
                </CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/contractors')}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recent_contractors?.slice(0, 5).map((contractor, index) => (
                <div 
                  key={contractor.id} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate('/admin/contractors')}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {contractor.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{contractor.name}</p>
                      <p className="text-sm text-gray-500">{contractor.email}</p>
                    </div>
                  </div>
                  <Badge className={
                    contractor.subscription_status === 'active' 
                      ? 'bg-green-500 hover:bg-green-500 text-white' 
                      : 'bg-red-500 hover:bg-red-500 text-white'
                  }>
                    {contractor.subscription_status === 'active' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
