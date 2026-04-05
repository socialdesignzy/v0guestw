import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar, 
  CalendarCheck,
  IndianRupee, 
  FileText, 
  User,
  Shield,
  Menu,
  X,
  HelpCircle,
  CreditCard,
  Settings,
  Lock,
  LogOut,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash,
  Receipt,
  MessageSquare,
  Wallet,
  TrendingUp,
  KeyRound,
  PieChart,
  DollarSign,
  BarChart3,
  AlertCircle,
  CircleHelp,
  DoorOpen,
  Wrench,
  ArrowLeft,
  Gift,
  UserX,
  Sparkles
} from 'lucide-react';
import api from './utils/api';

// User-facing Pages (always loaded)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Employers from './pages/Employers';
import Attendance from './pages/Attendance';
import Booking from './pages/Booking';
import Payments from './pages/Payments';
import Advance from './pages/Advance';
import ExtraCharges from './pages/ExtraCharges';
import Rooms from './pages/Rooms';
import Commissions from './pages/Commissions';
import AttendanceReport from './pages/AttendanceReport';
import Account from './pages/Account';
import ManageSubscription from './pages/ManageSubscription';
import HelpCenter from './pages/HelpCenter';
import OnlineResources from './pages/OnlineResources';
import ThankYou from './pages/ThankYou';
import PaymentFailed from './pages/PaymentFailed';
import PricingPage from './pages/PricingPage';
import PricingInfo from './pages/PricingInfo';
import TrialActivated from './pages/TrialActivated';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import ContactUs from './pages/ContactUs';
import Features from './pages/Features';
import About from './pages/About';
import FAQ from './pages/FAQ';

// Admin Pages (lazy loaded - code split into separate chunks)
// These will NOT be downloaded by regular users, only by admins
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminMessages = React.lazy(() => import('./pages/AdminMessages'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const SecurityLogs = React.lazy(() => import('./pages/SecurityLogs'));
const ActivationKeys = React.lazy(() => import('./pages/ActivationKeys'));
const PlanManagement = React.lazy(() => import('./pages/PlanManagement'));
const AdminNotifications = React.lazy(() => import('./pages/AdminNotifications'));
const AdminPromotions = React.lazy(() => import('./pages/AdminPromotions'));
const AdminSiteOffers = React.lazy(() => import('./pages/AdminSiteOffers'));
const AdminTrialSettings = React.lazy(() => import('./pages/AdminTrialSettings'));
const AdminDeletedUsers = React.lazy(() => import('./pages/AdminDeletedUsers'));
const AdminContactMessages = React.lazy(() => import('./pages/AdminContactMessages'));
const AdminPaymentOrders = React.lazy(() => import('./pages/AdminPaymentOrders'));
const AdminPlatformRevenue = React.lazy(() => import('./pages/AdminPlatformRevenue'));
const AdminDeletionRequests = React.lazy(() => import('./pages/AdminDeletionRequests'));
const PaymentGatewaySettings = React.lazy(() => import('./pages/PaymentGatewaySettings'));

function MaintenanceScreen({ onLogout }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFF] p-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Wrench className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Scheduled Maintenance</h1>
        <p className="text-gray-600 mb-6">
          We&apos;re currently performing scheduled maintenance. Please try again later. Thank you for your patience.
        </p>
        <Button onClick={onLogout} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );
}

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarMinimized, setSidebarMinimized] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);
  const [siteMaintenance, setSiteMaintenance] = React.useState(undefined);

  // Fetch site maintenance for contractors (admins are not blocked)
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      api.getSiteMaintenance()
        .then((res) => setSiteMaintenance(!!res.data?.maintenance))
        .catch(() => setSiteMaintenance(false));
    } else {
      setSiteMaintenance(false);
    }
  }, [user]);

  // Fetch unread count for contractors
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      fetchUnreadCount();
      
      // Refresh every 60 seconds
      const interval = setInterval(fetchUnreadCount, 60000);
      
      // Listen for custom event to refresh immediately
      const handleRefresh = () => fetchUnreadCount();
      window.addEventListener('refreshUnreadCount', handleRefresh);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('refreshUnreadCount', handleRefresh);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.getUserUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications(10);
      setNotifications(res.data.items || []);
      setUnreadNotifications((res.data.items || []).filter(n => !n.read).length);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
      const intv = setInterval(fetchNotifications, 60000);
      return () => clearInterval(intv);
    }
  }, [user]);


  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Organized contractor navigation with groups
  const contractorNav = [
    {
      group: 'Main',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Workers', path: '/workers', icon: Users },
        { name: 'Employers', path: '/employers', icon: Building2 },
      ]
    },
    {
      group: 'Operations',
      items: [
        { name: 'Attendance', path: '/attendance', icon: Calendar },
        { name: 'Booking', path: '/booking', icon: CalendarCheck },
        { name: 'Payments', path: '/payments', icon: IndianRupee },
        { name: 'Advances', path: '/advance', icon: Wallet },
        { name: 'Rooms', path: '/rooms', icon: DoorOpen },
        { name: 'Extra Charges', path: '/extra-charges', icon: DollarSign },
      ]
    },
    {
      group: 'Reports',
      items: [
        { name: 'Commissions', path: '/commissions', icon: TrendingUp },
        { name: 'Attendance Report', path: '/attendance-report', icon: BarChart3 },
      ]
    },
    {
      group: 'Account',
      items: [
        { name: 'Settings', path: '/account', icon: Settings },
        { name: 'Subscription', path: '/manage-subscription', icon: CreditCard },
        { name: 'Help & Support', path: '/help', icon: CircleHelp, showBadge: true },
      ]
    },
  ];

  // Organized admin navigation with groups
  const adminNav = [
    {
      group: 'Overview',
      items: [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      group: 'User Management',
      items: [
        { name: 'Contractors', path: '/admin/contractors', icon: Users },
        { name: 'Deletion Requests', path: '/admin/deletion-requests', icon: Shield },
        { name: 'Deleted Users', path: '/admin/deleted-users', icon: UserX },
        { name: 'Activation Keys', path: '/admin/activation-keys', icon: KeyRound },
        { name: 'Security Logs', path: '/admin/security-logs', icon: Lock },
      ]
    },
    {
      group: 'Subscription & Plans',
      items: [
        { name: 'Plan Management', path: '/admin/plans', icon: PieChart },
        { name: 'Trial Settings', path: '/admin/trial-settings', icon: CreditCard },
        { name: 'Payment Orders', path: '/admin/payment-orders', icon: DollarSign },
        { name: 'Platform Revenue', path: '/admin/platform-revenue', icon: TrendingUp },
      ]
    },
    {
      group: 'Communications',
      items: [
        { name: 'Notifications', path: '/admin/notifications', icon: Bell },
        { name: 'Promotions/Offers', path: '/admin/promotions', icon: Gift },
        { name: 'Site-Wide Offers', path: '/admin/site-offers', icon: Sparkles },
        { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
        { name: 'Contact Messages', path: '/admin/contact-messages', icon: Receipt },
      ]
    },
  ];

  const navItems = user?.role === 'admin' ? adminNav : contractorNav;
  const flatNavItems = navItems.flatMap(group => group.items.map(item => ({ ...item, group: group.group })));

  if (siteMaintenance === true) {
    return <MaintenanceScreen onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100" style={{ backgroundColor: '#F8FAFF' }}>
      {/* Mobile Header - Enhanced */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg shadow-[#3B2ED0]/30">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">GuestWorker</h1>
            <p className="text-xs text-gray-500 font-medium">Simple & Easy</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Notifications */}
          <DropdownMenu onOpenChange={async (open) => {
            if (open) {
              await api.markAttendanceReminderRead();
              fetchNotifications();
            }
          }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-[#3B2ED0]/10 rounded-lg transition-all">
                <Bell className="h-5 w-5 text-gray-700" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0 shadow-xl border border-gray-200" align="end">
              <div className="px-4 py-3 bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-gray-900">Notifications</span>
                  {unreadNotifications > 0 && (
                    <span className="ml-2 text-xs font-medium text-[#3B2ED0] bg-white px-2 py-0.5 rounded-full">
                      {unreadNotifications} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button 
                    onClick={async () => { await api.markAllNotificationsRead(); fetchNotifications(); }} 
                    className="text-xs font-medium text-[#3B2ED0] hover:text-[#2A1FB8] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500">All caught up!</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div 
                      key={n.id} 
                      className={`px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                        n.read ? 'bg-white' : 'bg-[#3B2ED0]/5'
                      }`}
                      onClick={async () => {
                        await api.markNotificationRead(n.id);
                        fetchNotifications();
                        if (n.link) {
                          navigate(n.link);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                          n.read ? 'bg-gray-300' : 'bg-[#3B2ED0]'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold mb-1 ${
                            n.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {n.title}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2 mb-2">{n.message}</div>
                          {n.action_url && n.action_label && (
                            <Link to={n.action_url}>
                              <Button 
                                size="sm" 
                                className="w-full mt-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-semibold"
                                onClick={async (e) => { 
                                  e.stopPropagation();
                                  await api.markNotificationRead(n.id); 
                                  fetchNotifications(); 
                                }}
                              >
                                {n.action_label}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-[#3B2ED0]/10 transition-all rounded-full">
                <Avatar className="h-9 w-9 border-2 border-[#3B2ED0]/30 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] text-white text-xs font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-3 shadow-xl border border-gray-200" align="end">
              {/* User Info Header */}
              <div className="px-3 py-3 mb-2 bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 rounded-lg border border-[#3B2ED0]/20">
                <p className="text-xs font-semibold text-[#3B2ED0] uppercase tracking-wider mb-2">Account</p>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] text-white text-sm font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                  </div>
                </div>
                {user?.subscription_plan && (
                  <Badge className="w-fit bg-[#3B2ED0] text-white text-xs px-2 py-0.5 font-medium">
                    {user.subscription_plan}
                  </Badge>
                )}
              </div>
              
              <DropdownMenuSeparator className="my-2" />
              
              {/* Menu Items */}
              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem 
                  onClick={() => navigate('/account')}
                  className="px-3 py-2.5 cursor-pointer rounded-lg hover:bg-[#3B2ED0]/10 transition-colors"
                >
                  <Settings className="mr-3 h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/manage-subscription')}
                  className="px-3 py-2.5 cursor-pointer rounded-lg hover:bg-[#3B2ED0]/10 transition-colors"
                >
                  <CreditCard className="mr-3 h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Manage Subscription</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/help')}
                  className="px-3 py-2.5 cursor-pointer rounded-lg hover:bg-[#3B2ED0]/10 transition-colors"
                >
                  <HelpCircle className="mr-3 h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Help & Support</span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5 font-semibold">
                      {unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator className="my-2" />
              
              {/* Logout */}
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="px-3 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-[#3B2ED0]/10 transition-all rounded-lg"
          >
            {sidebarOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
          </Button>
        </div>
      </div>

      {/* Desktop Top Bar - Enhanced */}
      <div className={`hidden lg:block fixed top-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm transition-all duration-300 ${
        sidebarMinimized ? 'left-20' : 'left-64'
      }`}>
        <div className="flex items-center justify-between px-6 py-3.5">
          {/* Back to Dashboard Button */}
          <div className="flex items-center gap-4">
            {location.pathname !== '/dashboard' && (
              <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
                className="hover:bg-[#3B2ED0]/10 text-gray-700 hover:text-[#3B2ED0] transition-all font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
          </div>
          
          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Help & Support Quick Link */}
            <Link to="/help">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-[#3B2ED0]/10 rounded-lg text-gray-700 hover:text-[#3B2ED0] transition-all"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="hidden xl:inline">Help</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Notification Center */}
            <DropdownMenu onOpenChange={async (open) => {
              if (open) {
                await api.markAttendanceReminderRead();
                fetchNotifications();
              }
            }}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative hover:bg-[#3B2ED0]/10 rounded-lg text-gray-700 hover:text-[#3B2ED0] transition-all">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 p-0 shadow-xl border border-gray-200" align="end">
                <div className="px-5 py-4 bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-gray-900">Notifications</span>
                    {unreadNotifications > 0 && (
                      <span className="ml-2 text-xs font-medium text-[#3B2ED0] bg-white px-2 py-0.5 rounded-full">
                        {unreadNotifications} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={async () => { await api.markAllNotificationsRead(); fetchNotifications(); }} 
                      className="text-xs font-medium text-[#3B2ED0] hover:text-[#2A1FB8] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">All caught up!</p>
                      <p className="text-xs text-gray-400 mt-1">No notifications to show</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`px-5 py-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          n.read ? 'bg-white hover:bg-gray-50' : 'bg-[#3B2ED0]/5 hover:bg-[#3B2ED0]/10'
                        }`}
                        onClick={async () => {
                          await api.markNotificationRead(n.id);
                          fetchNotifications();
                          if (n.link) {
                            navigate(n.link);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                            n.read ? 'bg-gray-300' : 'bg-[#3B2ED0]'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold mb-1 ${
                              n.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {n.title}
                            </div>
                            <div className="text-xs text-gray-600 mb-3 whitespace-pre-line leading-relaxed">
                              {n.message}
                            </div>
                            {n.action_url && n.action_label && (
                              <Link to={n.action_url}>
                                <Button 
                                  size="sm" 
                                  className="w-full mb-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                                  onClick={async (e) => { 
                                    e.stopPropagation();
                                    await api.markNotificationRead(n.id); 
                                    fetchNotifications(); 
                                  }}
                                >
                                  <CreditCard className="h-3.5 w-3.5 mr-2" />
                                  {n.action_label}
                                </Button>
                              </Link>
                            )}
                            <div className="flex items-center gap-3">
                              {!n.read && (
                                <button 
                                  onClick={async () => { await api.markNotificationRead(n.id); fetchNotifications(); }} 
                                  className="text-xs font-medium text-[#3B2ED0] hover:text-[#2A1FB8] hover:underline transition-colors"
                                >
                                  Mark as read
                                </button>
                              )}
                              <button 
                                onClick={async () => { await api.deleteNotification(n.id); fetchNotifications(); }} 
                                className="text-xs font-medium text-gray-500 hover:text-red-600 hover:underline transition-colors flex items-center gap-1"
                              >
                                <Trash className="h-3 w-3" /> 
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-center">
                    <Link to="/help">
                      <button className="text-xs font-medium text-[#3B2ED0] hover:text-[#2A1FB8] hover:underline">
                        View all notifications
                      </button>
                    </Link>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-[#3B2ED0]/10 rounded-xl transition-all group">
                  <Avatar className="h-9 w-9 border-2 border-[#3B2ED0]/30 shadow-sm group-hover:border-[#3B2ED0]/50 transition-colors">
                    <AvatarFallback className="bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] text-white text-sm font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</span>
                    <span className="text-xs text-gray-500 font-medium">
                      {(() => {
                        const isExpired = user?.subscription_status === 'expired' || 
                          (user?.plan_end_date && new Date(user.plan_end_date) < new Date());
                        return isExpired ? 'No Plan' : (user?.subscription_plan || 'Free Plan');
                      })()}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-3 shadow-xl border border-gray-200" align="end">
                {/* User Info Header */}
                <div className="px-3 py-3 mb-2 bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 rounded-lg border border-[#3B2ED0]/20">
                  <p className="text-xs font-semibold text-[#3B2ED0] uppercase tracking-wider mb-2">Account</p>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] text-white text-sm font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                    </div>
                  </div>
                  {(() => {
                    const isExpired = user?.subscription_status === 'expired' || 
                      (user?.plan_end_date && new Date(user.plan_end_date) < new Date());
                    const planDisplay = isExpired ? 'No Plan' : (user?.subscription_plan || 'Free Plan');
                    return planDisplay !== 'Free Plan' && (
                      <Badge className="w-fit bg-[#3B2ED0] text-white text-xs px-2 py-0.5 font-medium">
                        {planDisplay}
                      </Badge>
                    );
                  })()}
                </div>
                
                <DropdownMenuSeparator className="my-2" />
                
                {/* Menu Items */}
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem 
                    onClick={() => navigate('/account')}
                    className="px-3 py-2.5 cursor-pointer rounded-lg hover:bg-[#3B2ED0]/10 transition-colors"
                  >
                    <Settings className="mr-3 h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/manage-subscription')}
                    className="px-3 py-2.5 cursor-pointer rounded-lg hover:bg-[#3B2ED0]/10 transition-colors"
                  >
                    <CreditCard className="mr-3 h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Manage Subscription</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/help')}
                    className="px-3 py-2.5 cursor-pointer rounded-lg hover:bg-[#3B2ED0]/10 transition-colors"
                  >
                    <HelpCircle className="mr-3 h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Help & Support</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5 font-semibold">
                        {unreadCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator className="my-2" />
                
                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="px-3 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg font-semibold hover:bg-red-50 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <aside className={
        `fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarMinimized ? 'lg:w-20' : 'lg:w-64'} w-64`
      }>
        {/* Minimize Toggle Button - On the border line */}
        <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarMinimized(!sidebarMinimized)}
            className="h-9 w-9 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-[#3B2ED0]/50 dark:hover:border-[#3B2ED0] transition-all rounded-full text-gray-600 hover:text-[#3B2ED0] dark:text-gray-300 dark:hover:text-indigo-400 hover:scale-110"
            title={sidebarMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {sidebarMinimized ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Header */}
        <div className={`border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-all duration-300 ${
          sidebarMinimized ? 'p-4' : 'p-6'
        }`}>
          <div className={`flex items-center gap-3 ${sidebarMinimized ? 'justify-center' : ''}`}>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg shadow-[#3B2ED0]/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            {!sidebarMinimized && (
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">
                  GuestWorker
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Simple & Easy</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="overflow-y-auto h-[calc(100vh-120px)] scrollbar-thin">
          <div className={`space-y-6 transition-all duration-300 ${sidebarMinimized ? 'p-2' : 'p-4'}`}>
            {navItems.map((group, groupIndex) => (
              <div key={group.group || groupIndex} className="space-y-1">
                {group.group && !sidebarMinimized && (
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group.group}
                    </h3>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || 
                      (item.path !== '/dashboard' && item.path !== '/account' && location.pathname.startsWith(item.path));
                    const showBadge = item.showBadge && item.path === '/help' && unreadCount > 0;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={
                          `group flex items-center rounded-lg transition-all duration-200 relative ${
                            sidebarMinimized 
                              ? 'justify-center px-2 py-2.5' 
                              : 'gap-3 px-4 py-2.5'
                          } ${
                            isActive
                              ? 'bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 text-[#2A1FB8] dark:text-[#3B2ED0]/70 font-semibold shadow-sm border-l-4 border-[#3B2ED0]'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                          }`
                        }
                        data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        title={sidebarMinimized ? item.name : ''}
                      >
                        <Icon className={`w-5 h-5 transition-transform duration-200 flex-shrink-0 ${
                          isActive 
                            ? 'text-[#3B2ED0] dark:text-[#3B2ED0]/80' 
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-[#3B2ED0] dark:group-hover:text-[#3B2ED0]/80'
                        } ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                        {!sidebarMinimized && (
                          <>
                            <span className="flex-1 text-sm">{item.name}</span>
                            {showBadge && (
                              <Badge 
                                variant="destructive" 
                                className="ml-auto text-xs px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center font-semibold animate-pulse"
                              >
                                {unreadCount}
                              </Badge>
                            )}
                          </>
                        )}
                        {isActive && !sidebarMinimized && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#3B2ED0] rounded-l-full"></div>
                        )}
                        {showBadge && sidebarMinimized && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white dark:border-gray-900"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`lg:pt-20 transition-all duration-300 ${
        sidebarMinimized ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        <main>
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

/** Minimal chrome for logged-in users without an active plan: top bar (logo + user menu), no sidebar. */
function MinimalLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [siteMaintenance, setSiteMaintenance] = React.useState(undefined);

  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      api.getSiteMaintenance()
        .then((res) => setSiteMaintenance(!!res.data?.maintenance))
        .catch(() => setSiteMaintenance(false));
    } else {
      setSiteMaintenance(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (siteMaintenance === true) {
    return <MaintenanceScreen onLogout={handleLogout} />;
  }

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFF' }}>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm flex items-center justify-between px-4 lg:px-6">
        <Link
          to="/pricing"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg shadow-[#3B2ED0]/20">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">GuestWorker</span>
            <p className="text-xs text-gray-500 font-medium">Choose your plan</p>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10 pl-2 pr-3 rounded-xl hover:bg-[#3B2ED0]/10">
              <Avatar className="h-8 w-8 border-2 border-[#3B2ED0]/20">
                <AvatarFallback className="bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] text-white text-sm font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">{user?.name || 'User'}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 shadow-xl border border-gray-200" align="end">
            <DropdownMenuItem onClick={() => navigate('/pricing')} className="cursor-pointer">
              <DollarSign className="mr-3 h-4 w-4" />
              Pricing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/account')} className="cursor-pointer">
              <Settings className="mr-3 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/manage-subscription')} className="cursor-pointer">
              <CreditCard className="mr-3 h-4 w-4" />
              Manage subscription
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/help')} className="cursor-pointer">
              <HelpCircle className="mr-3 h-4 w-4" />
              Help
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-3 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, hasActiveSubscription } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B2ED0]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    if (requireAdmin) {
      return <Layout>{children}</Layout>;
    }
    return <Navigate to="/admin" replace />;
  }

  if (!hasActiveSubscription()) {
    const allowedWithoutPlan = ['/pricing', '/account', '/manage-subscription', '/help'];
    if (allowedWithoutPlan.includes(pathname)) {
      return <MinimalLayout>{children}</MinimalLayout>;
    }
    return <Navigate to="/pricing" replace />;
  }

  if (requireAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B2ED0]"></div>
      </div>
    );
  }

  if (user) {
    if (pathname === '/register') {
      return <Navigate to="/pricing" replace state={{ fromRegistration: true, name: user.name }} />;
    }
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

// Global error boundary for app routes (non-admin routes bubble here)
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">
              An unexpected error occurred. Try reloading the page.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-[#3B2ED0] hover:bg-indigo-700 text-white">
              Reload page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Error Boundary for lazy-loaded admin routes
class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin route loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center max-w-2xl mx-auto p-6">
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
              <h2 className="text-lg font-bold mb-2">Failed to Load Admin Panel</h2>
              <p className="text-sm mb-3">
                This could be due to network issues or insufficient permissions.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded text-left">
                  <p className="text-xs font-mono text-red-900 mb-1">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-red-700">Stack Trace</summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-40 text-red-900">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => window.location.href = '/admin/login'}
              className="px-4 py-2 bg-[#3B2ED0] text-white rounded hover:bg-indigo-700 mr-2"
            >
              Return to Admin Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component for lazy-loaded admin routes
function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B2ED0] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading admin panel...</p>
      </div>
    </div>
  );
}

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppErrorBoundary>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/pricing-info" element={<PricingInfo />} />
          <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
          <Route path="/trial-activated" element={<ProtectedRoute><TrialActivated /></ProtectedRoute>} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/workers" element={<ProtectedRoute><Workers /></ProtectedRoute>} />
          <Route path="/employers" element={<ProtectedRoute><Employers /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/advance" element={<ProtectedRoute><Advance /></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
          <Route path="/extra-charges" element={<ProtectedRoute><ExtraCharges /></ProtectedRoute>} />
          <Route path="/commissions" element={<ProtectedRoute><Commissions /></ProtectedRoute>} />
          <Route path="/attendance-report" element={<ProtectedRoute><AttendanceReport /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/manage-subscription" element={<ProtectedRoute><ManageSubscription /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><OnlineResources /></ProtectedRoute>} />
          <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          
          {/* Admin Panel Routes - Code Split (Lazy Loaded) with Error Boundary */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminLogin />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/dashboard" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminDashboard />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/contractors" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <UserManagement />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/activation-keys" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <ActivationKeys />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/plans" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <PlanManagement />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/messages" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminMessages />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/notifications" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminNotifications />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/promotions" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminPromotions />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/site-offers" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminSiteOffers />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/trial-settings" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminTrialSettings />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/deleted-users" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminDeletedUsers />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/security-logs" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <SecurityLogs />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/contact-messages" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminContactMessages />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/payment-orders" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminPaymentOrders />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/platform-revenue" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminPlatformRevenue />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/deletion-requests" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <AdminDeletionRequests />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          <Route path="/admin/gateway-settings" element={
            <AdminErrorBoundary>
              <React.Suspense fallback={<AdminLoadingFallback />}>
                <PaymentGatewaySettings />
              </React.Suspense>
            </AdminErrorBoundary>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AppErrorBoundary>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
