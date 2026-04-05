import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Key, 
  Edit, 
  LogOut, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Shield,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  Eye,
  EyeOff,
  Info,
  Settings,
  Award,
  Activity
} from 'lucide-react';
import { api } from '../utils/api';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Dialogs
  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  
  // Forms
  const [newName, setNewName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  
  // Show/Hide passwords
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Weak',
    color: 'red',
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });
  
  // Statistics
  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalEmployers: 0,
    activeWorkers: 0
  });

  useEffect(() => {
    fetchAccountStats();
  }, []);

  useEffect(() => {
    calculatePasswordStrength(newPassword);
  }, [newPassword]);

  const fetchAccountStats = async () => {
    try {
      const [workersRes, employersRes] = await Promise.all([
        api.getWorkers(),
        api.getEmployers()
      ]);
      
      setStats({
        totalWorkers: workersRes.data.length,
        totalEmployers: employersRes.data.length,
        activeWorkers: workersRes.data.filter(w => w.status === 'active').length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const calculatePasswordStrength = (password) => {
    const checks = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
    
    // All checks must pass for it to be valid
    const allChecksPassed = Object.values(checks).every(Boolean);
    
    let score = 0;
    let label = 'Weak';
    let color = 'red';
    
    if (allChecksPassed) {
      if (password.length >= 8) {
        score = 100;
        label = 'Strong';
        color = 'green';
      } else {
        score = 75;
        label = 'Good';
        color = 'green';
      }
    } else {
      const passedChecks = Object.values(checks).filter(Boolean).length;
      if (passedChecks === 3) {
        score = 50;
        label = 'Fair';
        color = 'orange';
      } else {
        score = 25;
        label = 'Weak';
        color = 'red';
      }
    }
    
    setPasswordStrength({ score, label, color, checks });
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await api.updateProfile({ name: newName });
      toast.success('Name updated successfully!');
      setEditNameDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update name');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Check all required criteria are met
    if (!passwordStrength.checks.length || !passwordStrength.checks.uppercase || 
        !passwordStrength.checks.lowercase || !passwordStrength.checks.number) {
      toast.error('Password must include: 6+ characters, uppercase, lowercase, and number');
      return;
    }

    try {
      await api.changePassword({ old_password: oldPassword, new_password: newPassword });
      toast.success('Password changed successfully!');
      setChangePasswordDialogOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to change password';
      toast.error(errorMessage);
    }
  };

  const handleDeleteRequest = async (e) => {
    e.preventDefault();
    
    try {
      await api.requestAccountDeletion(deletionReason);
      toast.success('Account deletion request submitted. Admin will review your request.');
      setDeleteAccountDialogOpen(false);
      setDeletionReason('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit deletion request');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isPlanExpired = () => {
    if (user?.subscription_status === 'expired') return true;
    if (!user?.plan_end_date) return false;
    const endDate = new Date(user.plan_end_date);
    return endDate < new Date();
  };

  const getStatusBadge = () => {
    if (isPlanExpired()) {
      return <Badge className="bg-red-500 text-white hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" /> Expired</Badge>;
    }
    if (user?.subscription_status === 'active') {
      return <Badge className="bg-green-500 text-white hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
    }
    return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" /> Inactive</Badge>;
  };

  const getDaysRemaining = () => {
    if (!user?.plan_end_date) return null;
    
    const endDate = new Date(user.plan_end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getAccountAge = () => {
    if (!user?.created_at) return 'N/A';
    
    const createdDate = new Date(user.created_at);
    const today = new Date();
    const diffTime = today - createdDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const getProgressPercentage = () => {
    if (!user?.plan_end_date) return 0;
    
    const daysRemaining = getDaysRemaining();
    if (daysRemaining === null || daysRemaining < 0) return 0;
    
    // Assuming a 30-day plan
    const totalDays = 30;
    return Math.min(100, (daysRemaining / totalDays) * 100);
  };

  const getPlanTheme = () => {
    const planName = (user?.subscription_plan || '').toLowerCase();
    
    if (planName.includes('plus')) {
      // Violet/Indigo-Purple theme for Plus (matches pricing page)
      return {
        border: 'border-[#3B2ED0]/50',
        gradient: 'bg-gradient-to-br from-[#3B2ED0] via-[#4F46E5] to-violet-600',
        buttonGradient: 'bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4]',
        buttonOutline: 'border-[#3B2ED0]/50 hover:bg-[#3B2ED0]/10',
        cardShadow: 'shadow-indigo-100'
      };
    } else if (planName.includes('pro')) {
      // Premium Golden theme for Pro (matches pricing page golden effect)
      return {
        border: 'border-amber-300',
        gradient: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600',
        buttonGradient: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700',
        buttonOutline: 'border-amber-300 hover:bg-amber-50',
        cardShadow: 'shadow-amber-100'
      };
    } else if (planName.includes('enterprise') || planName.includes('estate')) {
      // Black and Shiny Silver theme for Enterprise (matches pricing page)
      return {
        border: 'border-gray-700',
        gradient: 'bg-gradient-to-br from-gray-900 via-black to-gray-900',
        buttonGradient: 'bg-gradient-to-r from-gray-700 to-slate-800 hover:from-gray-800 hover:to-slate-900',
        buttonOutline: 'border-gray-400 hover:bg-gray-100',
        textColor: 'text-gray-100',
        cardShadow: 'shadow-gray-900/50',
        silverAccent: true
      };
    } else {
      // Default theme (Free plan)
      return {
        border: 'border-gray-200',
        gradient: 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
        buttonGradient: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
        buttonOutline: 'border-gray-200 hover:bg-gray-50',
        cardShadow: 'shadow-gray-200'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#F8FAFF] p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {user?.name}
            </h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" />
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Statistics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 border-indigo-100 hover:border-[#3B2ED0]/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Workers</p>
                        <p className="text-3xl font-bold text-[#3B2ED0]">{stats.totalWorkers}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-[#3B2ED0]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Employers</p>
                        <p className="text-3xl font-bold text-purple-600">{stats.totalEmployers}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Active Workers</p>
                        <p className="text-3xl font-bold text-green-600">{stats.activeWorkers}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Information */}
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 border-b">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <User className="h-5 w-5 text-[#3B2ED0]" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Your personal details and account information</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Name */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                      </div>
                    </div>
                    <Dialog open={editNameDialogOpen} onOpenChange={setEditNameDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-[#3B2ED0]/30 hover:bg-[#3B2ED0]/10">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
                        <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-[#3B2ED0]/10 via-white to-[#4F46E5]/5 border-b border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#3B2ED0]/25 flex-shrink-0">
                              <User className="h-7 w-7 text-white" />
                            </div>
                            <div>
                              <DialogTitle className="text-xl font-bold text-gray-900">Update Your Name</DialogTitle>
                              <DialogDescription className="mt-1 text-gray-600">Change your display name. This will be shown across the app.</DialogDescription>
                            </div>
                          </div>
                        </div>
                        <form onSubmit={handleUpdateName} className="flex flex-col">
                          <div className="px-6 py-5">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-800">New Name</Label>
                              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter your full name" className="h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#3B2ED0]/20 focus:border-[#3B2ED0]" />
                            </div>
                          </div>
                          <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setEditNameDialogOpen(false)} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
                            <Button type="submit" className="bg-gradient-to-r from-[#3B2ED0] to-[#2A1FB8] hover:from-[#2A1FB8] hover:to-[#1F1A8F] text-white shadow-lg shadow-[#3B2ED0]/25 rounded-xl h-11 px-6 font-semibold">Update Name</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Email - Read Only */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Email Address</p>
                        <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-gray-100">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>

                  {/* Account Created */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
                        <p className="text-lg font-semibold text-gray-900">{getAccountAge()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Card */}
            <div className="space-y-6">
              <Card className={`border-2 ${getPlanTheme().border} ${getPlanTheme().cardShadow} shadow-lg overflow-hidden`}>
                <div className={`${getPlanTheme().gradient} p-6 ${getPlanTheme().textColor || 'text-white'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6" />
                      <h3 className="text-xl font-bold">Subscription</h3>
                    </div>
                    {getStatusBadge()}
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 text-sm">Plan Type</span>
                      <span className="font-bold">
                        {isPlanExpired() ? 'No Plan' : (user?.subscription_plan === 'none' || !user?.subscription_plan ? 'Free Plan' : user.subscription_plan)}
                      </span>
                    </div>

                    {user?.plan_end_date && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-white/90 text-sm">{isPlanExpired() ? 'Expired on' : 'Valid Until'}</span>
                          <span className="font-semibold">
                            {new Date(user.plan_end_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {!isPlanExpired() && getDaysRemaining() !== null && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-white/90 text-sm">Days Remaining</span>
                              <span className="font-bold text-xl">
                                {getDaysRemaining() >= 0 ? getDaysRemaining() : 0}
                              </span>
                            </div>
                            <Progress 
                              value={getProgressPercentage()} 
                              className="h-2 bg-white/30"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  {isPlanExpired() ? (
                    <Button 
                      onClick={() => navigate('/pricing')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Renew Plan by Paying
                    </Button>
                  ) : user?.subscription_status !== 'active' ? (
                    <Button 
                      onClick={() => navigate('/pricing')}
                      className={`w-full ${getPlanTheme().buttonGradient} text-white`}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Activate Subscription
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/manage-subscription')}
                      variant="outline"
                      className={`w-full ${getPlanTheme().buttonOutline}`}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-sm font-semibold text-gray-700">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Button
                    onClick={() => navigate('/workers')}
                    variant="outline"
                    className="w-full justify-start hover:bg-[#3B2ED0]/10 border-gray-200"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Workers
                  </Button>
                  <Button
                    onClick={() => navigate('/employers')}
                    variant="outline"
                    className="w-full justify-start hover:bg-purple-50 border-gray-200"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Manage Employers
                  </Button>
                  <Button
                    onClick={() => navigate('/commissions')}
                    variant="outline"
                    className="w-full justify-start hover:bg-green-50 border-gray-200"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Commissions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#F8FAFF] to-[#F8FAFF] border-b">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Key className="h-5 w-5 text-blue-600" />
                  Password
                </CardTitle>
                <CardDescription>Manage your account password</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Key className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Current Password</p>
                      <p className="text-lg font-semibold text-gray-900">••••••••••••</p>
                    </div>
                  </div>
                </div>

                <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                          <Key className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-bold text-gray-900">Change Your Password</DialogTitle>
                          <DialogDescription className="mt-1 text-gray-600">Choose a strong password to keep your account secure.</DialogDescription>
                        </div>
                      </div>
                    </div>
                    <form onSubmit={handleChangePassword} className="flex flex-col">
                      <div className="px-6 py-5 space-y-5">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">Current Password</Label>
                          <div className="relative">
                            <Input type={showOldPassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" className="pr-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                            <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">New Password</Label>
                          <div className="relative">
                            <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="pr-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                          </div>
                          {newPassword && (
                            <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Password Strength:</span>
                                <span className={`font-semibold ${passwordStrength.color === 'green' ? 'text-green-600' : passwordStrength.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>{passwordStrength.label}</span>
                              </div>
                              <Progress value={passwordStrength.score} className="h-2" />
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>{passwordStrength.checks.length ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} 6+ characters</div>
                                <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>{passwordStrength.checks.uppercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Uppercase</div>
                                <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>{passwordStrength.checks.lowercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Lowercase</div>
                                <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>{passwordStrength.checks.number ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Number</div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">Confirm New Password</Label>
                          <div className="relative">
                            <Input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="pr-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800">Password must be at least 6 characters and include uppercase, lowercase, and numbers.</p>
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setChangePasswordDialogOpen(false)} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
                        <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 px-6 font-semibold">Update Password</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start gap-2">
                    <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    Last password change: Never (or not tracked)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Shield className="h-5 w-5 text-green-600" />
                  Account Security
                </CardTitle>
                <CardDescription>Your account security status</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Email Verified</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Strong Password</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Account Active</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Protected</Badge>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Security Score</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={85} className="flex-1 h-3" />
                    <span className="text-2xl font-bold text-green-600">85%</span>
                  </div>
                  <p className="text-xs text-green-700 mt-2">Your account is well protected</p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 flex items-start gap-2">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    Keep your account secure by using a strong password and never sharing your credentials.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Settings className="h-5 w-5 text-gray-600" />
                Account Actions
              </CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="h-auto py-6 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 justify-start"
                >
                  <div className="flex items-start gap-4 w-full">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <LogOut className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-base mb-1">Log Out</div>
                      <div className="text-xs text-gray-500 font-normal">Sign out from your account securely</div>
                    </div>
                  </div>
                </Button>

                {/* Delete Account Button */}
                <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-auto py-6 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 justify-start"
                    >
                      <div className="flex items-start gap-4 w-full">
                        <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-base mb-1">Delete Account</div>
                          <div className="text-xs text-gray-500 font-normal">Permanently remove your account</div>
                        </div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
                    <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-red-50 via-white to-red-50/30 border-b border-red-100">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25 flex-shrink-0">
                          <AlertTriangle className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-bold text-gray-900">Request Account Deletion</DialogTitle>
                          <DialogDescription className="mt-1 text-gray-600">This sends a request to the admin team. Once approved, all your data will be permanently removed.</DialogDescription>
                        </div>
                      </div>
                    </div>
                    <form onSubmit={handleDeleteRequest} className="flex flex-col">
                      <div className="px-6 py-5 space-y-5">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">Reason for Deletion (Optional)</Label>
                          <Textarea value={deletionReason} onChange={(e) => setDeletionReason(e.target.value)} placeholder="Please let us know why you're leaving. Your feedback helps us improve..." className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[100px]" />
                        </div>
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                          <p className="text-sm text-red-800 font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Warning: This cannot be undone
                          </p>
                          <ul className="text-sm text-red-700 space-y-1.5 ml-6 list-disc">
                            <li>All workers and employers will be deleted</li>
                            <li>Attendance records will be permanently removed</li>
                            <li>Payment history will be lost</li>
                            <li>This action requires admin approval</li>
                          </ul>
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setDeleteAccountDialogOpen(false)} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 px-6 font-semibold">
                          <Trash2 className="h-4 w-4 mr-2" /> Submit Request
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-600" />
                  Need Help?
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  If you're having issues with your account or need assistance, please contact our support team.
                </p>
                <Button
                  onClick={() => navigate('/help-center')}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
