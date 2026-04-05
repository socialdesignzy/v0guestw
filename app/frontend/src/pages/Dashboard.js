import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Users, Building2, TrendingUp, IndianRupee, Activity, ArrowUp, ArrowDown, 
  Calendar, CalendarCheck, Wallet, Receipt, AlertCircle, CheckCircle2, 
  UserCheck, DollarSign, BarChart3, Zap, ArrowRight, Briefcase, PieChart,
  Target, X, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PageLoading, PageError } from '../components/PageStates';
import { TrialExpiryBanner } from '../components/TrialExpiryBanner';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('today');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    fetchTotalCommission();
    checkWelcomeMessage();
  }, [timeFilter, user]);

  const checkWelcomeMessage = () => {
    if (!user?.id) return;

    // Check if user recently activated a trial/plan
    const trialActivationKey = `trial_activated_${user.id}`;
    const welcomeDismissedKey = `welcome_dismissed_${user.id}`;
    
    // Check if trial was just activated (within last 24 hours)
    const trialActivated = localStorage.getItem(trialActivationKey);
    const welcomeDismissed = localStorage.getItem(welcomeDismissedKey);
    
    if (trialActivated && !welcomeDismissed) {
      const activationTime = parseInt(trialActivated, 10);
      const now = Date.now();
      const hoursSinceActivation = (now - activationTime) / (1000 * 60 * 60);
      
      // Show welcome message if activated within last 24 hours and not dismissed
      if (hoursSinceActivation < 24) {
        setShowWelcomeMessage(true);
      }
    } else if (user?.trial_activated_at && !welcomeDismissed) {
      // Fallback: check if user has trial_activated_at timestamp (first visit after activation)
      try {
        const activationDate = new Date(user.trial_activated_at);
        const daysSinceActivation = (Date.now() - activationDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Show welcome message if activated within last 7 days and not dismissed
        if (daysSinceActivation < 7) {
          setShowWelcomeMessage(true);
        }
      } catch (e) {
        // Invalid date, skip
      }
    }
  };

  const handleDismissWelcome = () => {
    if (user?.id) {
      localStorage.setItem(`welcome_dismissed_${user.id}`, Date.now().toString());
    }
    setShowWelcomeMessage(false);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsRes = await api.getDashboardStats({ filter: timeFilter });
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCommission = async () => {
    try {
      // Fetch all commissions without date filter to get total
      const commissionsRes = await api.getCommissionsReport();
      const total = commissionsRes.data.reduce((sum, comm) => sum + (comm.commission_amount || 0), 0);
      setTotalCommission(total);
    } catch (error) {
      console.error('Failed to fetch total commission', error);
      // Don't show error toast for this, just set to 0
      setTotalCommission(0);
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate metrics
  const attendanceRate = stats?.active_workers > 0 
    ? Math.round((stats?.workers_present / stats?.active_workers) * 100) 
    : 0;

  const cashIn = stats?.payments_collected || 0;
  const cashOut = stats?.wages_settled || 0;
  const netCashFlow = cashIn - cashOut;

  const pendingPayments = stats?.pending_payments || 0;
  const pendingWages = stats?.pending_wages || 0;

  // Get filter label
  const getFilterLabel = () => {
    switch(timeFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'Today';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <PageError message={error} onRetry={() => { setError(null); fetchDashboardData(); }} retrying={loading} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <PageLoading variant="cards" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Trial Expiry Banner - Shows at top when trial is expiring */}
      <TrialExpiryBanner />
      
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Welcome Message Banner */}
          {showWelcomeMessage && (
          <div className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] rounded-xl p-6 border border-[#3B2ED0] shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
            </div>
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white mb-2">
                  Welcome to GuestWorker!
                </h3>
                <p className="text-white/90 mb-4 leading-relaxed">
                  {user?.subscription_plan 
                    ? `Your ${user.subscription_plan} trial is active. Get started by adding your first worker, setting up employers, or exploring the dashboard features.`
                    : 'Your trial is active. Get started by adding your first worker, setting up employers, or exploring the dashboard features.'
                  }
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/workers">
                    <Button 
                      size="sm"
                      className="bg-white text-[#3B2ED0] hover:bg-[#3B2ED0]/10 font-medium"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Add Workers
                    </Button>
                  </Link>
                  <Link to="/employers">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Add Employers
                    </Button>
                  </Link>
                  <Link to="/help">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                    >
                      View Help Center
                    </Button>
                  </Link>
                </div>
              </div>
              <button
                onClick={handleDismissWelcome}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                aria-label="Dismiss welcome message"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        )}
        
        {/* Welcome Header */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/booking" className="inline-flex">
                <Button 
                  size="default"
                  className="bg-gradient-to-r from-[#3B2ED0] to-[#2A1FB8] hover:from-[#2A1FB8] hover:to-[#1F1A8F] text-white font-semibold shadow-lg shadow-[#3B2ED0]/30 hover:shadow-xl hover:shadow-[#3B2ED0]/40 hover:scale-105 active:scale-100 transition-all duration-200 px-5 py-2.5 border-0"
                >
                  <CalendarCheck className="h-5 w-5 mr-2" />
                  Booking
                </Button>
              </Link>
              <Link to="/attendance" className="inline-flex">
                <Button 
                  size="default"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-100 transition-all duration-200 px-5 py-2.5 border-0"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Attendance
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Workers */}
          <Link to="/workers">
            <Card className="border border-gray-200 hover:border-[#3B2ED0]/50 hover:shadow-lg transition-all cursor-pointer bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Workers</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats?.active_workers || 0}</h3>
                    <p className="text-xs text-gray-500 mt-1">Active</p>
                  </div>
                  <div className="w-14 h-14 bg-[#3B2ED0]/10 rounded-xl flex items-center justify-center">
                    <Users className="h-7 w-7 text-[#3B2ED0]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Total Employers */}
          <Link to="/employers">
            <Card className="border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Employers</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats?.active_employers || 0}</h3>
                    <p className="text-xs text-gray-500 mt-1">Active</p>
                  </div>
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Attendance Today */}
          <Link to="/attendance">
            <Card className="border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Present {getFilterLabel()}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats?.workers_present || 0}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`h-2 w-2 rounded-full ${attendanceRate >= 80 ? 'bg-green-500' : attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                      <p className={`text-xs font-medium ${attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {attendanceRate}% present
                      </p>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="h-7 w-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Commission Earned */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Commission {getFilterLabel()}</p>
                  <h3 className="text-3xl font-bold text-gray-900">₹{(stats?.total_commission || 0).toLocaleString()}</h3>
                  <p className="text-xs text-gray-500 mt-1">Total earnings</p>
                </div>
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Money Overview & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Money Overview */}
          <Card className="lg:col-span-2 border border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Money Overview</CardTitle>
                  <CardDescription className="text-sm">Financial summary for {getFilterLabel().toLowerCase()}</CardDescription>
                </div>
                <Link to="/payments">
                  <Button variant="outline" size="sm" className="border-gray-300">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Cash Flow Section */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <ArrowDown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Money In</p>
                      <p className="text-xs text-gray-500">From Employers</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{cashIn.toLocaleString()}</p>
                </div>

                <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <ArrowUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Money Out</p>
                      <p className="text-xs text-gray-500">To Workers</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{cashOut.toLocaleString()}</p>
                </div>

                <div className={`${netCashFlow >= 0 ? 'bg-[#3B2ED0]/10 border-[#3B2ED0]/30' : 'bg-gray-50 border-gray-300'} rounded-xl p-5 border`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${netCashFlow >= 0 ? 'bg-[#3B2ED0]' : 'bg-gray-600'} rounded-lg flex items-center justify-center`}>
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Net Balance</p>
                      <p className="text-xs text-gray-500">{netCashFlow >= 0 ? 'Profit' : 'Loss'}</p>
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-[#3B2ED0]' : 'text-gray-600'}`}>
                    {netCashFlow >= 0 ? '+' : ''}₹{Math.abs(netCashFlow).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Pending Items */}
              {(pendingPayments > 0 || pendingWages > 0) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Pending Actions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {pendingPayments > 0 && (
                      <Link to="/payments?tab=collect">
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <span className="text-sm font-semibold text-gray-900">Pending Payments</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900 mb-1">₹{pendingPayments.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">To collect from employers</p>
                        </div>
                      </Link>
                    )}

                    {pendingWages > 0 && (
                      <Link to="/payments?tab=settle">
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3 mb-2">
                            <Receipt className="h-5 w-5 text-purple-600" />
                            <span className="text-sm font-semibold text-gray-900">Pending Wages</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900 mb-1">₹{pendingWages.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">To settle with workers</p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* No Pending Items */}
              {pendingPayments === 0 && pendingWages === 0 && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900">All Clear!</p>
                  <p className="text-xs text-green-700 mt-1">No pending payments or wages</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-sm">Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Link to="/workers">
                <Button className="w-full justify-start h-12 bg-[#3B2ED0] hover:bg-[#2A1FB8] text-white" data-testid="quick-add-worker">
                  <Users className="mr-3 h-5 w-5" />
                  <span>Add Worker</span>
                </Button>
              </Link>

              <Link to="/employers">
                <Button variant="outline" className="w-full justify-start h-12 border-gray-300" data-testid="quick-add-employer">
                  <Building2 className="mr-3 h-5 w-5" />
                  <span>Add Employer</span>
                </Button>
              </Link>

              <Link to="/attendance">
                <Button variant="outline" className="w-full justify-start h-12 border-gray-300" data-testid="quick-mark-attendance">
                  <Activity className="mr-3 h-5 w-5" />
                  <span>Mark Attendance</span>
                </Button>
              </Link>

              <Link to="/payments">
                <Button variant="outline" className="w-full justify-start h-12 border-gray-300">
                  <IndianRupee className="mr-3 h-5 w-5" />
                  <span>Record Payment</span>
                </Button>
              </Link>

              <Link to="/commissions">
                <Button variant="outline" className="w-full justify-start h-12 border-gray-300">
                  <PieChart className="mr-3 h-5 w-5" />
                  <span>View Reports</span>
                </Button>
              </Link>

              <Link to="/advance">
                <Button variant="outline" className="w-full justify-start h-12 border-gray-300">
                  <Wallet className="mr-3 h-5 w-5" />
                  <span>Manage Advances</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Attendence Rate</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.workers_present || 0} of {stats?.active_workers || 0} workers
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Employers Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.employers_today || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">{getFilterLabel().toLowerCase()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Commission Earned</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalCommission.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        </div>
      </div>
    </div>
  );
}
