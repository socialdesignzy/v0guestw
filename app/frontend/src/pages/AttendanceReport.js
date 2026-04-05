import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Award,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  ArrowLeft,
  Search,
  Download,
  RefreshCw,
  Trophy,
  Medal,
  Target,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '../utils/apiConfig';

const API = getApiUrl();
axios.defaults.withCredentials = true;

export default function AttendanceReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Overview data
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Worker analysis
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [workerAnalysis, setWorkerAnalysis] = useState(null);
  const [workerPeriod, setWorkerPeriod] = useState('all');
  
  // Leaderboard
  const [leaderboard, setLeaderboard] = useState(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all');

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAnalytics();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab, dateRange, leaderboardPeriod]);

  useEffect(() => {
    if (selectedWorker && activeTab === 'worker-analysis') {
      fetchWorkerAnalysis();
    }
  }, [selectedWorker, workerPeriod]);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(`${API}/workers`, { withCredentials: true });
      setWorkers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (dateRange === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      } else if (dateRange === 'month') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        params.start_date = firstDay.toISOString().split('T')[0];
        params.end_date = now.toISOString().split('T')[0];
      } else if (dateRange === 'year') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), 0, 1);
        params.start_date = firstDay.toISOString().split('T')[0];
        params.end_date = now.toISOString().split('T')[0];
      }
      // If dateRange is 'all', don't send date params to get all data

      const response = await axios.get(`${API}/reports/attendance-analytics`, {
        params,
        withCredentials: true
      });
      
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load attendance analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkerAnalysis = async () => {
    if (!selectedWorker) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${API}/reports/worker-attendance-analysis/${selectedWorker}`,
        {
          params: { period: workerPeriod },
          withCredentials: true
        }
      );
      setWorkerAnalysis(response.data);
    } catch (error) {
      console.error('Failed to fetch worker analysis:', error);
      toast.error('Failed to load worker analysis');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/reports/attendance-leaderboard`, {
        params: { period: leaderboardPeriod },
        withCredentials: true
      });
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getDayColor = (day, trends) => {
    if (!trends[day]) return 'bg-gray-100';
    const percentage = trends[day].attendance_percentage;
    if (percentage >= 90) return 'bg-green-100 border-green-300';
    if (percentage >= 75) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getDayTextColor = (day, trends) => {
    if (!trends[day]) return 'text-gray-600';
    const percentage = trends[day].attendance_percentage;
    if (percentage >= 90) return 'text-green-900';
    if (percentage >= 75) return 'text-yellow-900';
    return 'text-red-900';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600 fill-orange-600" />;
    return <span className="text-sm font-semibold text-gray-600">#{rank}</span>;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Professional Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-200">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Attendance Analytics
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Comprehensive insights and performance tracking</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-2">
          <TabsList className="grid w-full grid-cols-3 bg-gray-50/50 rounded-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="worker-analysis" 
              className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Worker Analysis</span>
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard" 
              className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Compact Date Range Filter */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Period:</span>
                </div>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40 h-9 border-gray-200 hover:border-blue-400 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📊 All Time</SelectItem>
                    <SelectItem value="month">📅 This Month</SelectItem>
                    <SelectItem value="year">📆 This Year</SelectItem>
                    <SelectItem value="custom">🔧 Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                {dateRange === 'custom' && (
                  <>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-40 h-9 border-gray-200 hover:border-blue-400 transition-colors"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-40 h-9 border-gray-200 hover:border-blue-400 transition-colors"
                    />
                    <Button 
                      onClick={fetchAnalytics}
                      size="sm"
                      className="h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Search className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <Activity className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading analytics...</p>
            </div>
          ) : analytics && analytics.overall_stats ? (
            <>
              {/* Professional Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-12 w-12 rounded-xl bg-white/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                        <Activity className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge className="bg-blue-600 shadow-md">Overall</Badge>
                    </div>
                    <p className="text-4xl font-bold text-blue-900 mb-1">
                      {analytics.overall_stats.attendance_percentage}%
                    </p>
                    <p className="text-sm font-medium text-blue-700">Attendance Rate</p>
                  </CardContent>
                </Card>

                <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 via-emerald-100 to-green-100 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-12 w-12 rounded-xl bg-white/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                        <UserCheck className="h-6 w-6 text-green-600" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-4xl font-bold text-green-900 mb-1">
                      {analytics.overall_stats.present_count}
                    </p>
                    <p className="text-sm font-medium text-green-700">Total Present</p>
                  </CardContent>
                </Card>

                <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 via-rose-100 to-red-100 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-12 w-12 rounded-xl bg-white/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                        <UserX className="h-6 w-6 text-red-600" />
                      </div>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-4xl font-bold text-red-900 mb-1">
                      {analytics.overall_stats.absent_count}
                    </p>
                    <p className="text-sm font-medium text-red-700">Total Absent</p>
                  </CardContent>
                </Card>

                <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-violet-100 to-purple-100 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-12 w-12 rounded-xl bg-white/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-4xl font-bold text-purple-900 mb-1">
                      {analytics.overall_stats.unique_dates}
                    </p>
                    <p className="text-sm font-medium text-purple-700">Days Tracked</p>
                  </CardContent>
                </Card>
              </div>

              {/* Professional Day of Week Trends */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">Day-of-Week Trends</CardTitle>
                      <CardDescription className="mt-1">
                        Attendance patterns across different days
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(analytics.day_of_week_trends || {}).map(([day, stats]) => (
                      <Card 
                        key={day}
                        className={`group border-0 shadow-md hover:shadow-lg transition-all duration-300 ${getDayColor(day, analytics.day_of_week_trends)}`}
                      >
                        <CardContent className="p-5">
                          <h3 className={`font-bold text-lg mb-3 flex items-center gap-2 ${getDayTextColor(day, analytics.day_of_week_trends)}`}>
                            <div className="h-2 w-2 rounded-full bg-current"></div>
                            {day}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Present:</span>
                              <span className="font-semibold text-green-700">{stats.present_count}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Absent:</span>
                              <span className="font-semibold text-red-700">{stats.absent_count}</span>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Rate:</span>
                                <Badge className={
                                  stats.attendance_percentage >= 90 ? 'bg-green-600' :
                                  stats.attendance_percentage >= 75 ? 'bg-yellow-600' :
                                  'bg-red-600'
                                }>
                                  {stats.attendance_percentage}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Professional Smart Predictions */}
              {analytics.predictions && analytics.predictions.length > 0 && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full -mr-32 -mt-32"></div>
                  <CardHeader className="border-b border-orange-100 relative">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">Smart Predictions</CardTitle>
                        <CardDescription className="mt-1">
                          AI-powered insights from historical patterns
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 relative">
                    <div className="space-y-3">
                      {analytics.predictions.map((prediction, idx) => (
                        <div 
                          key={idx}
                          className="group flex items-start gap-4 bg-white rounded-xl p-5 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                            <AlertTriangle className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{prediction.message}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {prediction.based_on} • Absence rate: {prediction.absence_rate}%
                            </p>
                            <Badge 
                              className={`mt-2 ${
                                prediction.confidence === 'High' ? 'bg-red-600' : 'bg-yellow-600'
                              }`}
                            >
                              {prediction.confidence} Confidence
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Data for Selected Period
                </h3>
                <p className="text-gray-600 mb-4">
                  {dateRange === 'month' && "No attendance records found for this month."}
                  {dateRange === 'year' && "No attendance records found for this year."}
                  {dateRange === 'custom' && "No attendance records found for the selected date range."}
                  {dateRange === 'all' && "No attendance data found in the system."}
                </p>
                {dateRange !== 'all' && (
                  <Button 
                    onClick={() => setDateRange('all')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Time Data
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Professional Worker Analysis Tab */}
        <TabsContent value="worker-analysis" className="space-y-6">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Worker:</span>
                </div>
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger className="w-56 h-9 border-gray-200 hover:border-indigo-400 transition-colors">
                    <SelectValue placeholder="Choose a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={workerPeriod} onValueChange={setWorkerPeriod}>
                  <SelectTrigger className="w-40 h-9 border-gray-200 hover:border-indigo-400 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📊 All Time</SelectItem>
                    <SelectItem value="monthly">📅 This Month</SelectItem>
                    <SelectItem value="yearly">📆 This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                <Users className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading worker analysis...</p>
            </div>
          ) : workerAnalysis && workerAnalysis.worker_info ? (
            <>
              {/* Professional Worker Info Card */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full -mr-48 -mt-48"></div>
                <CardHeader className="border-b border-blue-100 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold">{workerAnalysis.worker_info.name}</CardTitle>
                        <CardDescription className="text-base mt-1 flex items-center gap-2">
                          <span className="text-gray-600">{workerAnalysis.worker_info.phone}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={
                      workerAnalysis.worker_info.status === 'Active' 
                        ? 'bg-green-600 shadow-md text-white px-4 py-2' 
                        : 'bg-gray-600 shadow-md text-white px-4 py-2'
                    }>
                      {workerAnalysis.worker_info.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 relative">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="group text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0">
                      <div className="h-10 w-10 mx-auto mb-2 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-3xl font-bold text-blue-900">
                        {workerAnalysis.overall_stats.attendance_percentage}%
                      </p>
                      <p className="text-sm font-medium text-blue-700 mt-1">Attendance Rate</p>
                    </div>
                    <div className="group text-center p-5 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0">
                      <div className="h-10 w-10 mx-auto mb-2 rounded-lg bg-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-3xl font-bold text-green-900">
                        {workerAnalysis.overall_stats.present_days}
                      </p>
                      <p className="text-sm font-medium text-green-700 mt-1">Present Days</p>
                    </div>
                    <div className="group text-center p-5 bg-gradient-to-br from-red-50 to-rose-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0">
                      <div className="h-10 w-10 mx-auto mb-2 rounded-lg bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserX className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-3xl font-bold text-red-900">
                        {workerAnalysis.overall_stats.absent_days}
                      </p>
                      <p className="text-sm font-medium text-red-700 mt-1">Absent Days</p>
                    </div>
                    <div className="group text-center p-5 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0">
                      <div className="h-10 w-10 mx-auto mb-2 rounded-lg bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-3xl font-bold text-purple-900">
                        {workerAnalysis.overall_stats.total_days}
                      </p>
                      <p className="text-sm font-medium text-purple-700 mt-1">Total Days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Monthly Breakdown */}
              {Object.keys(workerAnalysis.monthly_breakdown || {}).length > 0 && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-semibold">Monthly Breakdown</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(workerAnalysis.monthly_breakdown).map(([month, stats]) => (
                        <Card key={month} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                          <CardContent className="p-5">
                            <h4 className="font-semibold text-gray-900 mb-3">{month}</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Present:</span>
                                <span className="font-semibold text-green-700">{stats.present}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Absent:</span>
                                <span className="font-semibold text-red-700">{stats.absent}</span>
                              </div>
                              <div className="pt-2 border-t">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600">Rate:</span>
                                  <Badge className={
                                    stats.attendance_percentage >= 90 ? 'bg-green-600' :
                                    stats.attendance_percentage >= 75 ? 'bg-yellow-600' :
                                    'bg-red-600'
                                  }>
                                    {stats.attendance_percentage}%
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Absence Patterns */}
              {workerAnalysis.patterns && workerAnalysis.patterns.consecutive_absences && 
               workerAnalysis.patterns.consecutive_absences.length > 0 && (
                <Card className="border-2 border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      Absence Patterns Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workerAnalysis.patterns.consecutive_absences.map((pattern, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-yellow-200">
                          <p className="font-semibold text-gray-900">
                            {pattern.count} consecutive absences
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            From {pattern.start_date} to {pattern.end_date}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Worker Predictions */}
              {workerAnalysis.predictions && workerAnalysis.predictions.length > 0 && (
                <Card className="border-2 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      Predictions for {workerAnalysis.worker_info.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workerAnalysis.predictions.map((pred, idx) => (
                        <div key={idx} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <p className="font-semibold text-gray-900">{pred.message}</p>
                          <p className="text-sm text-gray-600 mt-1">{pred.based_on}</p>
                          <Badge className={`mt-2 ${pred.confidence === 'High' ? 'bg-red-600' : 'bg-yellow-600'}`}>
                            {pred.confidence} Confidence • {pred.absence_rate}% absence rate
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : selectedWorker ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No attendance data found for this worker</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Select a worker to view detailed analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Professional Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Period:</span>
                </div>
                <Select value={leaderboardPeriod} onValueChange={setLeaderboardPeriod}>
                  <SelectTrigger className="w-40 h-9 border-gray-200 hover:border-yellow-400 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏆 All Time</SelectItem>
                  <SelectItem value="monthly">📅 This Month</SelectItem>
                  <SelectItem value="yearly">📆 This Year</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-yellow-200 border-t-yellow-600 animate-spin"></div>
                <Trophy className="h-6 w-6 text-yellow-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading leaderboard...</p>
            </div>
          ) : leaderboard && leaderboard.leaderboard && leaderboard.leaderboard.length > 0 ? (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-yellow-50/30 to-orange-50/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200/20 rounded-full -mr-48 -mt-48"></div>
              <CardHeader className="border-b border-yellow-100 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 relative">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Trophy className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-700 to-orange-700 bg-clip-text text-transparent">
                      Attendance Leaderboard
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {leaderboard.period_label} • Top performers ranked by attendance
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 relative">
                <div className="space-y-3">
                  {leaderboard.leaderboard.map((entry) => (
                    <div
                      key={entry.worker_id}
                      className={`group flex items-center gap-4 p-5 rounded-xl border-0 shadow-md hover:shadow-xl transition-all duration-300 ${
                        entry.rank === 1
                          ? 'bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 scale-105'
                          : entry.rank === 2
                          ? 'bg-gradient-to-r from-gray-100 via-slate-100 to-gray-100'
                          : entry.rank === 3
                          ? 'bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100'
                          : 'bg-white hover:bg-blue-50'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-14 h-14 rounded-xl shadow-lg ${
                        entry.rank <= 3 ? 'bg-white' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
                      }`}>
                        {getRankBadge(entry.rank)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">{entry.worker_name}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            {entry.present_days} days
                          </span>
                          <span className="text-xs text-gray-500">
                            of {entry.total_days} total
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`text-base px-4 py-2 shadow-md ${
                          entry.attendance_percentage >= 95 ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                          entry.attendance_percentage >= 85 ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                          entry.attendance_percentage >= 75 ? 'bg-gradient-to-r from-yellow-600 to-amber-600' :
                          'bg-gradient-to-r from-gray-600 to-slate-600'
                        }`}>
                          {entry.attendance_percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardContent className="p-12 text-center">
                <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Leaderboard Data
                </h3>
                <p className="text-gray-600 mb-4">
                  {leaderboardPeriod === 'monthly' && "No attendance records found for this month."}
                  {leaderboardPeriod === 'yearly' && "No attendance records found for this year."}
                  {leaderboardPeriod === 'all' && "No attendance data available to generate leaderboard."}
                </p>
                {leaderboardPeriod !== 'all' && (
                  <Button 
                    onClick={() => setLeaderboardPeriod('all')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    View All Time Leaderboard
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
