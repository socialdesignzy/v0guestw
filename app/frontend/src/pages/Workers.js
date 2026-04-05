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
import { Plus, Edit, Trash2, Download, Users, Search, Phone, MapPin, Calendar, IndianRupee, X, Check, AlertTriangle, User, DollarSign, FileText, Wallet, TrendingUp, DoorOpen } from 'lucide-react';
import { toast } from 'sonner';
import { getTodayDDMMYYYY } from '../utils/dateUtils';
import UpgradeDialog from '../components/UpgradeDialog';
import { PageLoading, PageError, EmptyState } from '../components/PageStates';

export default function Workers() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [workerToToggle, setWorkerToToggle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address: '',
    wage_per_day: 450,
    wage_from_employer: 500,
    date_of_joining: getTodayDDMMYYYY(),
    notes: '',
    room_id: '',
    initial_pending_settlement: 0,
    initial_advance_paid: 0
  });

  useEffect(() => {
    fetchWorkers();
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const r = await api.getRooms();
      setRooms(r.data || []);
    } catch {
      setRooms([]);
    }
  };

  useEffect(() => {
    filterWorkersList();
  }, [workers, filterStatus, searchQuery]);

  const checkLimitBeforeAdding = async () => {
    try {
      const limitsResponse = await api.getSubscriptionLimits();
      const limits = limitsResponse.data;
      
      if (limits.worker_limit_reached) {
        setLimitInfo({
          currentPlan: limits.plan_name,
          limit: limits.max_workers,
          resourceType: 'worker'
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

  const handleAddWorkerClick = async () => {
    const canAdd = await checkLimitBeforeAdding();
    if (canAdd) {
      setDialogOpen(true);
      resetForm();
    }
  };

  const fetchWorkers = async (isRefetch = false) => {
    try {
      if (!isRefetch) { setLoading(true); setError(null); }
      const response = await api.getWorkers();
      setWorkers(response.data);
    } catch (err) {
      if (isRefetch) toast.error('Failed to fetch workers');
      else setError(err.response?.data?.detail || 'Failed to fetch workers');
    } finally {
      if (!isRefetch) setLoading(false);
    }
  };

  const filterWorkersList = () => {
    let filtered = workers;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(w => w.status.toLowerCase() === filterStatus.toLowerCase());
    }
    
    if (searchQuery) {
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.phone_number?.includes(searchQuery)
      );
    }
    
    filtered.sort((a, b) => {
      if (a.status === 'Active' && b.status !== 'Active') return -1;
      if (a.status !== 'Active' && b.status === 'Active') return 1;
      return a.name.localeCompare(b.name);
    });
    
    setFilteredWorkers(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        const updatePayload = { ...formData, room_id: formData.room_id || null };
        await api.updateWorker(editingWorker.id, updatePayload);
        toast.success('Worker updated successfully!');
      } else {
        await api.createWorker(formData);
        toast.success('Worker added successfully!');
      }
      fetchWorkers(true);
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Operation failed';
      const status = error.response?.status;
      
      if (status === 403 && errorMessage.includes('limit reached')) {
        const limitMatch = errorMessage.match(/maximum (\d+) workers/);
        const planMatch = errorMessage.match(/Your plan \((.+?)\)/);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 50;
        const currentPlan = planMatch ? planMatch[1] : user?.subscription_plan || 'Current Plan';
        
        setLimitInfo({
          currentPlan,
          limit,
          resourceType: 'worker'
        });
        setUpgradeDialogOpen(true);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      phone_number: worker.phone_number || '',
      address: worker.address || '',
      wage_per_day: worker.wage_per_day,
      wage_from_employer: worker.wage_from_employer || 500,
      date_of_joining: worker.date_of_joining,
      notes: worker.notes || '',
      room_id: worker.room_id || '',
      initial_pending_settlement: 0,
      initial_advance_paid: 0
    });
    setDialogOpen(true);
  };

  const handleDelete = (worker) => {
    setWorkerToDelete(worker);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!workerToDelete) return;
    try {
      await api.deleteWorker(workerToDelete.id);
      toast.success('Worker deleted successfully!');
      fetchWorkers(true);
      setDeleteConfirmOpen(false);
      setWorkerToDelete(null);
    } catch (error) {
      toast.error('Failed to delete worker');
    }
  };

  const handleToggleStatus = (worker) => {
    setWorkerToToggle(worker);
    setStatusConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!workerToToggle) return;
    try {
      const newStatus = workerToToggle.status === 'Active' ? 'Inactive' : 'Active';
      await api.updateWorker(workerToToggle.id, { ...workerToToggle, status: newStatus });
      toast.success(`Worker ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
      fetchWorkers(true);
      setStatusConfirmOpen(false);
      setWorkerToToggle(null);
    } catch (error) {
      toast.error(`Failed to update worker status`);
    }
  };

  const resetForm = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      phone_number: '',
      address: '',
      wage_per_day: 450,
      wage_from_employer: 500,
      date_of_joining: getTodayDDMMYYYY(),
      notes: '',
      room_id: '',
      initial_pending_settlement: 0,
      initial_advance_paid: 0
    });
  };

  const handleExport = () => {
    window.open(api.exportWorkers(), '_blank');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6 md:p-8">
        <PageError message={error} onRetry={() => { setError(null); fetchWorkers(); }} retrying={loading} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6 md:p-8">
        <PageLoading variant="default" />
      </div>
    );
  }

  const activeWorkers = workers.filter(w => w.status === 'Active').length;
  const inactiveWorkers = workers.filter(w => w.status === 'Inactive').length;
  const totalWages = workers.reduce((sum, w) => sum + (w.wage_per_day || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Workers
          </h1>
          <p className="text-gray-600">Manage your workforce</p>
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
                  <SelectItem value="all">All Workers</SelectItem>
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
                  onClick={handleAddWorkerClick}
                  className="bg-[#3B2ED0] hover:bg-[#2A1FB8] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Worker
                </Button>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[#3B2ED0] rounded-lg flex items-center justify-center">
                        {editingWorker ? (
                          <Edit className="h-5 w-5 text-white" />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                          {editingWorker ? 'Edit Worker' : 'Add New Worker'}
                        </DialogTitle>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {editingWorker ? 'Update worker information' : 'Enter worker details below'}
                        </p>
                      </div>
                    </div>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
                      {/* Basic Information Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <User className="h-4 w-4 text-[#3B2ED0]" />
                          <h3 className="font-semibold text-gray-900">Basic Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                              className="mt-2"
                              placeholder="Enter worker's full name"
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
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Date of Joining</Label>
                            <div className="relative mt-2">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                value={formData.date_of_joining}
                                onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                                className="pl-10"
                                placeholder="DD-MM-YYYY"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Room</Label>
                            <div className="relative mt-2">
                              <DoorOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Select
                                value={formData.room_id || 'none'}
                                onValueChange={(v) => setFormData({ ...formData, room_id: v === 'none' ? '' : v })}
                              >
                                <SelectTrigger className="pl-10">
                                  <SelectValue placeholder="No room" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No room</SelectItem>
                                  {rooms.map((r) => (
                                    <SelectItem key={r.id} value={r.id}>
                                      {r.name}{r.key_number ? ` (${r.key_number})` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">For splitting shared bills (gas, electricity, etc.)</p>
                          </div>
                        </div>
                      </div>

                      {/* Wage Information Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <h3 className="font-semibold text-gray-900">Wage Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Wage to Worker (₹/day) *</Label>
                            <div className="flex items-center gap-2">
                              <IndianRupee className="h-5 w-5 text-green-600" />
                              <Input
                                type="number"
                                value={formData.wage_per_day}
                                onChange={(e) => setFormData({ ...formData, wage_per_day: parseInt(e.target.value) })}
                                required
                                className="text-lg font-semibold border-green-300"
                                placeholder="450"
                              />
                            </div>
                            <p className="text-xs text-green-700 mt-2">Amount you pay to this worker per day</p>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Rate from Employer (₹/day) *</Label>
                            <div className="flex items-center gap-2">
                              <IndianRupee className="h-5 w-5 text-blue-600" />
                              <Input
                                type="number"
                                value={formData.wage_from_employer}
                                onChange={(e) => setFormData({ ...formData, wage_from_employer: parseInt(e.target.value) })}
                                required
                                className="text-lg font-semibold border-blue-300"
                                placeholder="500"
                              />
                            </div>
                            <p className="text-xs text-blue-700 mt-2">Amount employer pays for this worker</p>
                          </div>
                          <div className="md:col-span-2 bg-[#3B2ED0]/10 border border-[#3B2ED0]/30 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Daily Profit</p>
                                <p className="text-2xl font-bold text-[#3B2ED0] mt-1">
                                  ₹{(formData.wage_from_employer - formData.wage_per_day).toLocaleString()}
                                </p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-[#3B2ED0]" />
                            </div>
                            <p className="text-xs text-[#3B2ED0] mt-2">
                              Your commission per day per worker
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Migration Settings - Only for new workers */}
                      {!editingWorker && (
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
                                  Enter any existing pending wages or advances if you're moving data from another system.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Pending Wage (₹)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.initial_pending_settlement}
                                onChange={(e) => setFormData({ ...formData, initial_pending_settlement: parseFloat(e.target.value) || 0 })}
                                className="mt-2"
                                placeholder="0.00"
                              />
                              <p className="text-xs text-gray-500 mt-1.5">Amount you owe to this worker</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Advance Paid (₹)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.initial_advance_paid}
                                onChange={(e) => setFormData({ ...formData, initial_advance_paid: parseFloat(e.target.value) || 0 })}
                                className="mt-2"
                                placeholder="0.00"
                              />
                              <p className="text-xs text-gray-500 mt-1.5">Advance already paid to worker</p>
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
                          placeholder="Any additional information about this worker..."
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
                        {editingWorker ? 'Update Worker' : 'Add Worker'}
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
                  <p className="text-sm text-gray-600 mb-1">Total Workers</p>
                  <p className="text-3xl font-bold text-gray-900">{workers.length}</p>
                </div>
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#3B2ED0]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Workers</p>
                  <p className="text-3xl font-bold text-green-600">{activeWorkers}</p>
                  <p className="text-xs text-gray-500 mt-1">{inactiveWorkers} inactive</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Daily Wages</p>
                  <p className="text-3xl font-bold text-orange-600">₹{totalWages.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Per day</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workers List */}
        {filteredWorkers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={workers.length > 0 ? 'No workers match your search or filter' : 'No Workers Found'}
            description={workers.length > 0 ? 'Try adjusting your search or filter' : 'Get started by adding your first worker'}
            action={workers.length > 0 ? (
              <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}>
                Clear filters
              </Button>
            ) : (
              <Button onClick={handleAddWorkerClick} className="bg-[#3B2ED0] hover:bg-[#2A1FB8] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Worker
              </Button>
            )}
          />
        ) : (
          <div className="grid gap-4">
            {filteredWorkers.map((worker) => {
              const profitPerDay = (worker.wage_from_employer || 500) - worker.wage_per_day;
              return (
                <Card key={worker.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="relative">
                            <div className="h-14 w-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                              <Users className="h-7 w-7 text-[#3B2ED0]" />
                            </div>
                            {worker.status === 'Active' && (
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{worker.name}</h3>
                              <Badge className={worker.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                                {worker.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                              {worker.phone_number && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  {worker.phone_number}
                                </span>
                              )}
                              {worker.address && (
                                <span className="flex items-center gap-1 truncate max-w-xs">
                                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{worker.address}</span>
                                </span>
                              )}
                              {worker.date_of_joining && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {new Date(worker.date_of_joining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                                <IndianRupee className="h-3 w-3 mr-1" />
                                Wage: ₹{worker.wage_per_day}/day
                              </Badge>
                              <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                                <IndianRupee className="h-3 w-3 mr-1" />
                                Rate: ₹{worker.wage_from_employer || 500}/day
                              </Badge>
                              <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                                <IndianRupee className="h-3 w-3 mr-1" />
                                Profit: ₹{profitPerDay}/day
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-2 lg:border-l lg:pl-4 lg:border-gray-200">
                        <Button
                          onClick={() => handleEdit(worker)}
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:flex-none"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleToggleStatus(worker)}
                          variant="outline"
                          size="sm"
                          className={`flex-1 lg:flex-none ${
                            worker.status === 'Active' 
                              ? 'border-orange-300 text-orange-700 hover:bg-orange-50' 
                              : 'border-green-300 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {worker.status === 'Active' ? (
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
                          onClick={() => handleDelete(worker)}
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
              );
            })}
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
            suggestedPlan={limitInfo.limit === 50 ? "Contractor Pro" : "Enterprise"}
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
                  <AlertDialogTitle className="text-xl font-bold">Delete Worker?</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1">
                    This action cannot be undone.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{workerToDelete?.name}</span>? All associated data will be removed.
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Worker
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
                  workerToToggle?.status === 'Active' ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    workerToToggle?.status === 'Active' ? 'text-orange-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl font-bold">Change Status?</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1">
                    This will update the worker's status.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to {workerToToggle?.status === 'Active' ? 'deactivate' : 'activate'} <span className="font-semibold text-gray-900">{workerToToggle?.name}</span>?
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmToggleStatus}
                className={`${
                  workerToToggle?.status === 'Active' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                Yes, {workerToToggle?.status === 'Active' ? 'Deactivate' : 'Activate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
