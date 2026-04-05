import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Plus, Edit, Trash2, Download, Building2, Search, Phone, MapPin, IndianRupee, X, Check, AlertTriangle, Briefcase, FileText, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import UpgradeDialog from '../components/UpgradeDialog';

export default function Employers() {
  const { user } = useAuth();
  const [employers, setEmployers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employerToDelete, setEmployerToDelete] = useState(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [employerToToggle, setEmployerToToggle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address: '',
    work_location: '',
    notes: '',
    initial_pending_payment: 0
  });

  useEffect(() => {
    fetchEmployers();
  }, []);

  useEffect(() => {
    filterEmployersList();
  }, [employers, filterStatus, searchQuery]);

  const checkLimitBeforeAdding = async () => {
    try {
      const limitsResponse = await api.getSubscriptionLimits();
      const limits = limitsResponse.data;
      
      if (limits.employer_limit_reached) {
        setLimitInfo({
          currentPlan: limits.plan_name,
          limit: limits.max_employers,
          resourceType: 'employer'
        });
        setUpgradeDialogOpen(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check limits:', error);
      return true;
    }
  };

  const handleAddEmployerClick = async () => {
    const canAdd = await checkLimitBeforeAdding();
    if (canAdd) {
      setDialogOpen(true);
      resetForm();
    }
  };

  const fetchEmployers = async () => {
    try {
      const response = await api.getEmployers();
      setEmployers(response.data);
    } catch (error) {
      toast.error('Failed to fetch employers');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployersList = () => {
    let filtered = employers;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status.toLowerCase() === filterStatus.toLowerCase());
    }
    
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.phone_number?.includes(searchQuery)
      );
    }
    
    filtered.sort((a, b) => {
      if (a.status === 'Active' && b.status !== 'Active') return -1;
      if (a.status !== 'Active' && b.status === 'Active') return 1;
      return a.name.localeCompare(b.name);
    });
    
    setFilteredEmployers(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployer) {
        await api.updateEmployer(editingEmployer.id, formData);
        toast.success('Employer updated successfully!');
      } else {
        await api.createEmployer(formData);
        toast.success('Employer added successfully!');
      }
      fetchEmployers();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Operation failed';
      const status = error.response?.status;
      
      if (status === 403 && errorMessage.includes('limit reached')) {
        const limitMatch = errorMessage.match(/maximum (\d+) employers/);
        const planMatch = errorMessage.match(/Your plan \((.+?)\)/);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 25;
        const currentPlan = planMatch ? planMatch[1] : user?.subscription_plan || 'Current Plan';
        
        setLimitInfo({
          currentPlan,
          limit,
          resourceType: 'employer'
        });
        setUpgradeDialogOpen(true);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleEdit = (employer) => {
    setEditingEmployer(employer);
    setFormData({
      name: employer.name,
      phone_number: employer.phone_number || '',
      address: employer.address || '',
      work_location: employer.work_location || '',
      notes: employer.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = (employer) => {
    setEmployerToDelete(employer);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!employerToDelete) return;
    try {
      await api.deleteEmployer(employerToDelete.id);
      toast.success('Employer deleted successfully!');
      fetchEmployers();
      setDeleteConfirmOpen(false);
      setEmployerToDelete(null);
    } catch (error) {
      toast.error('Failed to delete employer');
    }
  };

  const handleToggleStatus = (employer) => {
    setEmployerToToggle(employer);
    setStatusConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!employerToToggle) return;
    try {
      const newStatus = employerToToggle.status === 'Active' ? 'Inactive' : 'Active';
      await api.updateEmployer(employerToToggle.id, { ...employerToToggle, status: newStatus });
      toast.success(`Employer ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      fetchEmployers();
      setStatusConfirmOpen(false);
      setEmployerToToggle(null);
    } catch (error) {
      toast.error(`Failed to update employer status`);
    }
  };

  const resetForm = () => {
    setEditingEmployer(null);
    setFormData({
      name: '',
      phone_number: '',
      address: '',
      work_location: '',
      notes: '',
      initial_pending_payment: 0
    });
  };

  const handleExport = () => {
    window.open(api.exportEmployers(), '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-white rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeEmployers = employers.filter(e => e.status === 'Active').length;
  const inactiveEmployers = employers.filter(e => e.status === 'Inactive').length;
  const totalPending = employers.reduce((sum, e) => sum + (e.pending_payment || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Employers
          </h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>

        {/* Search and Filter */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employers</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleExport}
                variant="outline"
                className="border-gray-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <Button 
                  onClick={handleAddEmployerClick}
                  className="bg-[#3B2ED0] hover:bg-[#2A1FB8] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employer
                </Button>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        {editingEmployer ? (
                          <Edit className="h-5 w-5 text-white" />
                        ) : (
                          <Building2 className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                          {editingEmployer ? 'Edit Employer' : 'Add New Employer'}
                        </DialogTitle>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {editingEmployer ? 'Update employer information' : 'Enter employer details below'}
                        </p>
                      </div>
                    </div>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
                      {/* Basic Information Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <Briefcase className="h-4 w-4 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">Basic Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Employer Name *</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                              className="mt-2"
                              placeholder="Enter employer or company name"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                            <div className="relative mt-2">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                className="pl-10"
                                placeholder="10-digit mobile number"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-gray-700">Address</Label>
                            <div className="relative mt-2">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="pl-10"
                                placeholder="Street address, City, State"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-gray-700">Work Location</Label>
                            <div className="relative mt-2">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                              <Input
                                value={formData.work_location}
                                onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
                                className="pl-10"
                                placeholder="e.g., Site A, Building B, Project Location"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">Specific location where workers will be assigned</p>
                          </div>
                        </div>
                      </div>

                      {/* Migration Settings - Only for new employers */}
                      {!editingEmployer && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Wallet className="h-4 w-4 text-amber-600" />
                            <h3 className="font-semibold text-gray-900">Migration Settings</h3>
                            <Badge variant="outline" className="ml-auto text-xs border-amber-300 text-amber-700">Optional</Badge>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-amber-900">Migrating from another platform?</p>
                                <p className="text-xs text-amber-700 mt-1">
                                  Enter any existing pending payment if you're moving data from another system.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Pending Payment from Employer (₹)</Label>
                            <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="flex items-center gap-2">
                                <IndianRupee className="h-5 w-5 text-orange-600" />
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={formData.initial_pending_payment}
                                  onChange={(e) => setFormData({ ...formData, initial_pending_payment: parseFloat(e.target.value) || 0 })}
                                  className="text-lg font-semibold border-orange-300 bg-white"
                                  placeholder="0.00"
                                />
                              </div>
                              <p className="text-xs text-orange-700 mt-2">Amount this employer owes you from before migration</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Notes */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">Additional Notes</h3>
                          <Badge variant="outline" className="ml-auto text-xs">Optional</Badge>
                        </div>
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="min-h-[100px]"
                          placeholder="Any additional information about this employer (payment terms, special requirements, etc.)..."
                        />
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-[#3B2ED0] hover:bg-[#2A1FB8] text-white px-6"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {editingEmployer ? 'Update Employer' : 'Add Employer'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Employers</p>
                  <p className="text-3xl font-bold text-gray-900">{employers.length}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Employers</p>
                  <p className="text-3xl font-bold text-green-600">{activeEmployers}</p>
                  <p className="text-xs text-gray-500 mt-1">{inactiveEmployers} inactive</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
                  <p className="text-3xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">To collect</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employers List */}
        {filteredEmployers.length === 0 ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Employers Found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first employer</p>
              <Button
                onClick={handleAddEmployerClick}
                className="bg-[#3B2ED0] hover:bg-[#2A1FB8] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Employer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEmployers.map((employer) => (
              <Card key={employer.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="relative">
                          <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Building2 className="h-7 w-7 text-purple-600" />
                          </div>
                          {employer.status === 'Active' && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{employer.name}</h3>
                            <Badge className={employer.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                              {employer.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                            {employer.phone_number && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4 text-gray-400" />
                                {employer.phone_number}
                              </span>
                            )}
                            {employer.work_location && (
                              <span className="flex items-center gap-1 truncate max-w-xs">
                                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{employer.work_location}</span>
                              </span>
                            )}
                            {employer.address && (
                              <span className="flex items-center gap-1 truncate max-w-xs">
                                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{employer.address}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {employer.pending_payment > 0 && (
                              <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                                <IndianRupee className="h-3 w-3 mr-1" />
                                ₹{employer.pending_payment.toLocaleString()} Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 lg:border-l lg:pl-4 lg:border-gray-200">
                      <Button
                        onClick={() => handleEdit(employer)}
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleToggleStatus(employer)}
                        variant="outline"
                        size="sm"
                        className={`flex-1 lg:flex-none ${
                          employer.status === 'Active' 
                            ? 'border-orange-300 text-orange-700 hover:bg-orange-50' 
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {employer.status === 'Active' ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDelete(employer)}
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upgrade Dialog */}
        {limitInfo && (
          <UpgradeDialog
            open={upgradeDialogOpen}
            onOpenChange={setUpgradeDialogOpen}
            currentPlan={limitInfo.currentPlan}
            resourceType={limitInfo.resourceType}
            currentLimit={limitInfo.limit}
            suggestedPlan={limitInfo.limit === 25 ? "Contractor Pro" : "Enterprise"}
          />
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl font-bold">Delete Employer?</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1">
                    This action cannot be undone.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{employerToDelete?.name}</span>? All associated data will be removed.
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Employer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Status Toggle Confirmation */}
        <AlertDialog open={statusConfirmOpen} onOpenChange={setStatusConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  employerToToggle?.status === 'Active' ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    employerToToggle?.status === 'Active' ? 'text-orange-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl font-bold">Change Status?</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1">
                    This will update the employer's status.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to {employerToToggle?.status === 'Active' ? 'deactivate' : 'activate'} <span className="font-semibold text-gray-900">{employerToToggle?.name}</span>?
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmToggleStatus}
                className={`${
                  employerToToggle?.status === 'Active' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                Yes, {employerToToggle?.status === 'Active' ? 'Deactivate' : 'Activate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
