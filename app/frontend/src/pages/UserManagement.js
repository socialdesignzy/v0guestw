import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Users, Search, Filter, Download, ArrowUpDown, Eye, Ban, Check, Trash2, 
  Key, Edit, DollarSign, Activity, ArrowLeft, Calendar, Building, 
  Briefcase, TrendingUp, RefreshCw, UserX, UserCheck, Mail, Phone,
  MoreVertical, FileText, AlertCircle, Shield, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

import { getApiUrl } from '../utils/apiConfig';
const API = getApiUrl();
axios.defaults.withCredentials = true;

export default function UserManagement() {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedContractors, setSelectedContractors] = useState([]);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [contractorDetails, setContractorDetails] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [workerStats, setWorkerStats] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  
  // Dialog states
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [showChangeValidityDialog, setShowChangeValidityDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  
  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [extendDays, setExtendDays] = useState(0);
  const [newStatus, setNewStatus] = useState('');
  const [editProfile, setEditProfile] = useState({ name: '', email: '', phone_number: '' });
  const [validityAction, setValidityAction] = useState('add_days');
  const [validityDays, setValidityDays] = useState(30);

  useEffect(() => {
    fetchContractors();
  }, [statusFilter]);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await axios.get(`${API}/admin/contractors`, { params });
      setContractors(response.data.contractors || []);
    } catch (error) {
      toast.error('Failed to fetch contractors');
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchContractors();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedContractors = () => {
    const sorted = [...contractors].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    return sorted;
  };

  const handleSelectContractor = (contractorId) => {
    setSelectedContractors(prev => {
      if (prev.includes(contractorId)) {
        return prev.filter(id => id !== contractorId);
      } else {
        return [...prev, contractorId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedContractors.length === contractors.length) {
      setSelectedContractors([]);
    } else {
      setSelectedContractors(contractors.map(c => c.id));
    }
  };

  const handleViewProfile = async (contractor) => {
    setSelectedContractor(contractor);
    setShowProfileDrawer(true);
    
    try {
      const [detailsRes, financialRes, statsRes, activityRes] = await Promise.all([
        axios.get(`${API}/admin/contractors/${contractor.id}`),
        axios.get(`${API}/admin/contractors/${contractor.id}/financial-summary`),
        axios.get(`${API}/admin/contractors/${contractor.id}/workers-stats`),
        axios.get(`${API}/admin/contractors/${contractor.id}/activity-log`)
      ]);
      
      setContractorDetails(detailsRes.data);
      setFinancialSummary(financialRes.data);
      setWorkerStats(statsRes.data);
      setActivityLog(activityRes.data);
    } catch (error) {
      toast.error('Failed to fetch contractor details');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      await axios.post(`${API}/admin/contractors/${selectedContractor.id}/reset-password`, {
        new_password: newPassword
      });
      toast.success('Password reset successfully');
      setShowResetPasswordDialog(false);
      setNewPassword('');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleDeleteContractor = async () => {
    if (confirmEmail !== selectedContractor.email) {
      toast.error('Email does not match');
      return;
    }
    
    try {
      await axios.delete(`${API}/admin/contractors/${selectedContractor.id}`);
      toast.success('Contractor deleted successfully');
      setShowDeleteDialog(false);
      setConfirmEmail('');
      setShowProfileDrawer(false);
      fetchContractors();
    } catch (error) {
      toast.error('Failed to delete contractor');
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }
    
    try {
      await axios.put(`${API}/admin/contractors/${selectedContractor.id}/plan`, {
        plan: selectedPlan,
        extend_days: extendDays
      });
      toast.success('Subscription plan updated successfully');
      setShowChangePlanDialog(false);
      setSelectedPlan('');
      setExtendDays(0);
      fetchContractors();
      if (showProfileDrawer) {
        handleViewProfile(selectedContractor);
      }
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  const handleChangeStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }
    
    try {
      await axios.put(`${API}/admin/contractors/${selectedContractor.id}/status`, {
        subscription_status: newStatus
      });
      toast.success('Status updated successfully');
      setShowStatusDialog(false);
      setNewStatus('');
      fetchContractors();
      if (showProfileDrawer) {
        handleViewProfile(selectedContractor);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedContractors.length === 0) {
      toast.error('Please select contractors and action');
      return;
    }
    
    try {
      await axios.post(`${API}/admin/bulk-actions`, {
        action: bulkAction,
        contractor_ids: selectedContractors
      });
      toast.success(`Bulk ${bulkAction} completed successfully`);
      setShowBulkActionDialog(false);
      setBulkAction('');
      setSelectedContractors([]);
      fetchContractors();
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      await axios.put(`${API}/admin/contractors/${selectedContractor.id}/profile`, editProfile);
      toast.success('Profile updated successfully');
      setShowEditProfileDialog(false);
      fetchContractors();
      if (showProfileDrawer) {
        handleViewProfile(selectedContractor);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    }
  };
  
  const handleChangeValidity = async () => {
    try {
      const payload = {
        action: validityAction,
        days: validityDays
      };
      
      await axios.put(`${API}/admin/contractors/${selectedContractor.id}/validity`, payload);
      toast.success('Subscription validity updated successfully');
      setShowChangeValidityDialog(false);
      setValidityDays(30);
      fetchContractors();
      if (showProfileDrawer) {
        handleViewProfile(selectedContractor);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update validity');
    }
  };

  const handleExportData = async (contractorId) => {
    try {
      const response = await axios.get(`${API}/admin/contractors/${contractorId}/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contractor_${contractorId}_data.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-500 hover:bg-green-500 text-white',
      suspended: 'bg-red-500 hover:bg-red-500 text-white',
      expired: 'bg-orange-500 hover:bg-orange-500 text-white',
      inactive: 'bg-gray-500 hover:bg-gray-500 text-white'
    };
    return variants[status] || variants.inactive;
  };

  // Calculate stats
  const stats = {
    total: contractors.length,
    active: contractors.filter(c => c.subscription_status === 'active').length,
    expired: contractors.filter(c => c.subscription_status === 'expired').length,
    suspended: contractors.filter(c => c.subscription_status === 'suspended').length,
    totalWorkers: contractors.reduce((sum, c) => sum + (c.worker_count || 0), 0),
    totalEmployers: contractors.reduce((sum, c) => sum + (c.employer_count || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-[#F8FAFF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3B2ED0] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading contractors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#F8FAFF]">
      {/* Modern Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/admin/dashboard')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500">Manage all contractors and their accounts</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowBulkActionDialog(true)}
                disabled={selectedContractors.length === 0}
                variant="outline"
                size="sm"
                className="relative"
              >
                <Edit className="mr-2 h-4 w-4" />
                Bulk Actions
                {selectedContractors.length > 0 && (
                  <Badge className="ml-2 bg-[#3B2ED0] hover:bg-[#3B2ED0]">
                    {selectedContractors.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-xs text-gray-600 mt-1">Total Users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardContent className="p-4">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-gray-600 mt-1">Active</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
            <CardContent className="p-4">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-3xl font-bold text-orange-600">{stats.expired}</p>
                <p className="text-xs text-gray-600 mt-1">Expired</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-red-500 to-pink-500"></div>
            <CardContent className="p-4">
              <div className="text-center">
                <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="text-3xl font-bold text-red-600">{stats.suspended}</p>
                <p className="text-xs text-gray-600 mt-1">Suspended</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <CardContent className="p-4">
              <div className="text-center">
                <Briefcase className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-3xl font-bold text-purple-600">{stats.totalWorkers}</p>
                <p className="text-xs text-gray-600 mt-1">Total Workers</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
            <CardContent className="p-4">
              <div className="text-center">
                <Building className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-3xl font-bold text-yellow-600">{stats.totalEmployers}</p>
                <p className="text-xs text-gray-600 mt-1">Total Employers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5]"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-[#3B2ED0]" />
              Search & Filter
            </CardTitle>
            <CardDescription>Find and filter contractors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1 bg-[#3B2ED0] hover:bg-[#2A1FB8]">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={fetchContractors}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-[#3B2ED0]">{contractors.length}</span> contractor(s)
              </p>
              {selectedContractors.length > 0 && (
                <Badge className="bg-[#3B2ED0]">
                  {selectedContractors.length} selected
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contractors Table */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedContractors.length === contractors.length && contractors.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        Contractor Name
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Plan</TableHead>
                    <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('subscription_status')}>
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold">Workers</TableHead>
                    <TableHead className="text-center font-semibold">Employers</TableHead>
                    <TableHead className="cursor-pointer font-semibold" onClick={() => handleSort('created_at')}>
                      <div className="flex items-center gap-1">
                        Joined
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedContractors().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No contractors found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getSortedContractors().map((contractor) => (
                      <TableRow 
                        key={contractor.id} 
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={(e) => {
                          if (e.target.type !== 'checkbox' && !e.target.closest('button')) {
                            handleViewProfile(contractor);
                          }
                        }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedContractors.includes(contractor.id)}
                            onCheckedChange={() => handleSelectContractor(contractor.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {contractor.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{contractor.name || 'N/A'}</p>
                              {contractor.business_name && (
                                <p className="text-xs text-gray-500">{contractor.business_name}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs">{contractor.email}</span>
                            </div>
                            {contractor.phone_number && (
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-xs">{contractor.phone_number}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-medium">
                            {contractor.subscription_plan === 'none' || !contractor.subscription_plan ? 'Free Plan' : contractor.subscription_plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(contractor.subscription_status)}>
                            {contractor.subscription_status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {contractor.subscription_status === 'suspended' && <XCircle className="h-3 w-3 mr-1" />}
                            {contractor.subscription_status === 'expired' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {contractor.subscription_status || 'inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-lg">
                            <Briefcase className="h-3 w-3 text-purple-600" />
                            <span className="font-semibold text-purple-700">{contractor.worker_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg">
                            <Building className="h-3 w-3 text-yellow-600" />
                            <span className="font-semibold text-yellow-700">{contractor.employer_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {contractor.created_at ? new Date(contractor.created_at).toLocaleDateString('en-IN') : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewProfile(contractor)}>
                                <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                <span>View Profile</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedContractor(contractor);
                                setShowStatusDialog(true);
                              }}>
                                {contractor.subscription_status === 'active' ? (
                                  <><UserX className="mr-2 h-4 w-4 text-orange-600" />Suspend Account</>
                                ) : (
                                  <><UserCheck className="mr-2 h-4 w-4 text-green-600" />Activate Account</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedContractor(contractor);
                                setShowResetPasswordDialog(true);
                              }}>
                                <Key className="mr-2 h-4 w-4 text-purple-600" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedContractor(contractor);
                                setShowChangePlanDialog(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4 text-[#3B2ED0]" />
                                Change Plan
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportData(contractor.id)}>
                                <Download className="mr-2 h-4 w-4 text-green-600" />
                                Export Data
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedContractor(contractor);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keep all existing dialogs and drawers - they're already good */}
      {/* Profile Drawer - unchanged but with modern styling */}
      <Sheet open={showProfileDrawer} onOpenChange={setShowProfileDrawer}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                {selectedContractor?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              Contractor Profile
            </SheetTitle>
            <SheetDescription>
              Detailed information about {selectedContractor?.name}
            </SheetDescription>
          </SheetHeader>
          
          {contractorDetails && (
            <div className="mt-6 space-y-6">
              {/* Basic Info */}
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditProfile({
                          name: contractorDetails.contractor.name,
                          email: contractorDetails.contractor.email,
                          phone_number: contractorDetails.contractor.phone_number || ''
                        });
                        setShowEditProfileDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{contractorDetails.contractor.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium">{contractorDetails.contractor.business_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-sm">{contractorDetails.contractor.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{contractorDetails.contractor.phone_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Subscription Plan</p>
                      <Badge variant="outline">{contractorDetails.contractor.subscription_plan}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className={getStatusBadge(contractorDetails.contractor.subscription_status)}>
                        {contractorDetails.contractor.subscription_status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium text-sm capitalize">
                        {contractorDetails.contractor.payment_method === 'activation_key' 
                          ? 'Activation Key' 
                          : contractorDetails.contractor.payment_method || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined Date</p>
                      <p className="font-medium text-sm">
                        {new Date(contractorDetails.contractor.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Plan Start Date</p>
                      <p className="font-medium text-sm">
                        {contractorDetails.contractor.plan_start_date || contractorDetails.contractor.subscription_start_date
                          ? new Date(contractorDetails.contractor.plan_start_date || contractorDetails.contractor.subscription_start_date).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Plan End Date (Validity)</p>
                      <p className="font-medium text-sm">
                        {contractorDetails.contractor.plan_end_date || contractorDetails.contractor.subscription_end_date
                          ? new Date(contractorDetails.contractor.plan_end_date || contractorDetails.contractor.subscription_end_date).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              {financialSummary && (
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <p className="text-xs text-gray-600 mb-1">Total Wages Processed</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{financialSummary.total_wages_processed?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <p className="text-xs text-gray-600 mb-1">Commission Earned</p>
                        <p className="text-2xl font-bold text-purple-600">
                          ₹{financialSummary.commission_earned?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-gray-600 mb-1">Payments Collected</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{financialSummary.payments_collected?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
                        <p className="text-xs text-gray-600 mb-1">Outstanding</p>
                        <p className="text-2xl font-bold text-orange-600">
                          ₹{financialSummary.outstanding_balances?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Worker Statistics */}
              {workerStats && (
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      Worker Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-600">Total Workers</span>
                        <span className="text-2xl font-bold text-gray-900">{workerStats.total_workers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <span className="text-sm text-gray-600">Active</span>
                        <span className="text-2xl font-bold text-green-600">{workerStats.active_workers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
                        <span className="text-sm text-gray-600">Inactive</span>
                        <span className="text-2xl font-bold text-red-600">{workerStats.inactive_workers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-[#F8FAFF] to-[#F8FAFF] rounded-xl border border-blue-100">
                        <span className="text-sm text-gray-600">Attendance (7d)</span>
                        <span className="text-2xl font-bold text-blue-600">{workerStats.attendance_last_7_days}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              {activityLog && activityLog.length > 0 && (
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5]"></div>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-[#3B2ED0]" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {activityLog.slice(0, 10).map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className={`p-2 rounded-xl ${
                            activity.type === 'attendance' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {activity.type === 'attendance' ? (
                              <Calendar className="h-4 w-4 text-blue-600" />
                            ) : (
                              <DollarSign className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-600">{activity.details}</p>
                            <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button
                  onClick={() => setShowResetPasswordDialog(true)}
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </Button>
                <Button
                  onClick={() => setShowStatusDialog(true)}
                  variant="outline"
                  className="border-[#3B2ED0]/30 text-[#3B2ED0] hover:bg-[#3B2ED0]/10"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Change Status
                </Button>
                <Button
                  onClick={() => setShowChangePlanDialog(true)}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Change Plan
                </Button>
                <Button
                  onClick={() => setShowChangeValidityDialog(true)}
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Change Validity
                </Button>
                <Button
                  onClick={() => handleExportData(selectedContractor.id)}
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* All existing dialogs remain unchanged */}
      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Contractor Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedContractor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="mt-1"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowResetPasswordDialog(false);
              setNewPassword('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} className="bg-[#3B2ED0] hover:bg-[#2A1FB8]">
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Contractor Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Contractor Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contractor account and all associated data including workers, employers, attendance records, and payments.
              <div className="mt-4">
                <p className="font-medium text-gray-900 mb-2">
                  To confirm, please type the contractor's email:
                </p>
                <Input
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={selectedContractor?.email}
                  className="font-mono text-sm"
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmEmail('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContractor}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Plan Dialog */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Update subscription plan for {selectedContractor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Select Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contractor Plus">Contractor Plus</SelectItem>
                  <SelectItem value="Contractor Pro">Contractor Pro</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Extend Days</label>
              <Input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="mt-1"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-1">
                Extend subscription by additional days (optional)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowChangePlanDialog(false);
              setSelectedPlan('');
              setExtendDays(0);
            }}>
              Cancel
            </Button>
            <Button onClick={handleChangePlan} className="bg-[#3B2ED0] hover:bg-[#2A1FB8]">
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Account Status</DialogTitle>
            <DialogDescription>
              Update subscription status for {selectedContractor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Select Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newStatus === 'suspended' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Suspended contractors will be locked out of their account until reactivated.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowStatusDialog(false);
              setNewStatus('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleChangeStatus} className="bg-[#3B2ED0] hover:bg-[#2A1FB8]">
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Perform action on {selectedContractors.length} selected contractor(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Select Action</label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate Accounts</SelectItem>
                  <SelectItem value="suspend">Suspend Accounts</SelectItem>
                  <SelectItem value="delete">Delete Accounts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkAction === 'delete' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently delete all selected contractors and their data. This action cannot be undone.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowBulkActionDialog(false);
              setBulkAction('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAction}
              className={bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3B2ED0] hover:bg-[#2A1FB8]'}
            >
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contractor Profile</DialogTitle>
            <DialogDescription>
              Update contractor's name, email, and phone number
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editProfile.name}
                onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                placeholder="Enter name"
                className="mt-1"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editProfile.email}
                onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                placeholder="Enter email"
                className="mt-1"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={editProfile.phone_number}
                onChange={(e) => setEditProfile({ ...editProfile, phone_number: e.target.value })}
                placeholder="Enter phone number"
                className="mt-1"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile} className="bg-[#3B2ED0] hover:bg-[#2A1FB8]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Validity Dialog */}
      <Dialog open={showChangeValidityDialog} onOpenChange={setShowChangeValidityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Validity</DialogTitle>
            <DialogDescription>
              Update the subscription end date for {selectedContractor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select value={validityAction} onValueChange={setValidityAction}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_days">Add Days (Extend from current)</SelectItem>
                  <SelectItem value="set_days">Set Days (From today)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Number of Days</label>
              <Input
                type="number"
                min="1"
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                className="mt-1"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-1">
                {validityAction === 'add_days' 
                  ? 'Days to add to the current end date' 
                  : 'Total days of validity from today'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowChangeValidityDialog(false);
              setValidityDays(30);
            }}>
              Cancel
            </Button>
            <Button onClick={handleChangeValidity} className="bg-[#3B2ED0] hover:bg-[#2A1FB8]">
              Update Validity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
