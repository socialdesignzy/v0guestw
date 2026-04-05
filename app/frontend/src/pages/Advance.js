import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Plus, CreditCard, Users, Building2, Search, Trash2, Calendar, DollarSign, Wallet, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

export default function Advance() {
  const [workers, setWorkers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [workerAdvances, setWorkerAdvances] = useState([]);
  const [employerAdvances, setEmployerAdvances] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employerDialogOpen, setEmployerDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  
  // Simplified filter states
  const [searchQuery, setSearchQuery] = useState('');
  
  const [advanceForm, setAdvanceForm] = useState({
    worker_id: '',
    amount: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [employerAdvanceForm, setEmployerAdvanceForm] = useState({
    employer_id: '',
    amount: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workersRes, employersRes, workerAdvRes, empAdvRes] = await Promise.all([
        api.getWorkers(),
        api.getEmployers(),
        api.getAdvances(),
        api.getEmployerAdvances().catch(() => ({ data: [] }))
      ]);
      setWorkers(workersRes.data);
      setEmployers(employersRes.data);
      setWorkerAdvances(workerAdvRes.data);
      setEmployerAdvances(empAdvRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkerAdvance = async (e) => {
    e.preventDefault();
    
    if (!advanceForm.worker_id || !advanceForm.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await api.createAdvance({
        ...advanceForm,
        amount: parseFloat(advanceForm.amount)
      });
      
      toast.success('Worker advance recorded successfully');
      setDialogOpen(false);
      setAdvanceForm({ worker_id: '', amount: '', purpose: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record advance');
    }
  };
  
  const handleCreateEmployerAdvance = async (e) => {
    e.preventDefault();
    
    if (!employerAdvanceForm.employer_id || !employerAdvanceForm.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await api.createEmployerAdvance({
        employer_id: employerAdvanceForm.employer_id,
        amount: parseFloat(employerAdvanceForm.amount),
        purpose: employerAdvanceForm.purpose,
        date: employerAdvanceForm.date
      });
      
      toast.success('Employer advance recorded successfully');
      setEmployerDialogOpen(false);
      setEmployerAdvanceForm({ employer_id: '', amount: '', purpose: '', date: new Date().toISOString().split('T')[0] });
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record employer advance');
    }
  };

  const handleDeleteAdvance = async () => {
    if (!deleteConfirmId || !deleteType) return;
    
    try {
      if (deleteType === 'worker') {
        await api.deleteAdvance(deleteConfirmId);
        toast.success('Worker advance deleted successfully');
      } else {
        await api.deleteEmployerAdvance(deleteConfirmId);
        toast.success('Employer advance deleted successfully');
      }
      setDeleteConfirmId(null);
      setDeleteType(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete advance');
      setDeleteConfirmId(null);
      setDeleteType(null);
    }
  };

  const getWorkerName = (id) => workers.find(w => w.id === id)?.name || 'Unknown';
  const getEmployerName = (id) => employers.find(e => e.id === id)?.name || 'Unknown';

  // Simplified filtering - just search
  const filteredWorkerAdvances = workerAdvances.filter(adv => {
    if (searchQuery) {
      const workerName = getWorkerName(adv.worker_id).toLowerCase();
      return workerName.includes(searchQuery.toLowerCase());
    }
    return true;
  });
  
  const filteredEmployerAdvances = employerAdvances.filter(adv => {
    if (searchQuery) {
      const employerName = getEmployerName(adv.employer_id).toLowerCase();
      return employerName.includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-white/50 rounded-xl w-1/3"></div>
          <div className="h-96 bg-white/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalWorkerAdvances = filteredWorkerAdvances.reduce((sum, adv) => sum + adv.amount, 0);
  const totalEmployerAdvances = filteredEmployerAdvances.reduce((sum, adv) => sum + adv.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Advances
          </h1>
          <p className="text-gray-600">Manage advance payments for workers and employers</p>
        </div>

        {/* Tabs for Employer and Worker Advances */}
        <Tabs defaultValue="worker" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger value="worker" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Worker Advances
              </TabsTrigger>
              <TabsTrigger value="employer" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Building2 className="h-4 w-4 mr-2" />
                Employer Advances
              </TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Worker Advances Tab */}
          <TabsContent value="worker" className="space-y-6">
            {/* Summary Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Given to Workers</p>
                    <p className="text-3xl font-bold text-emerald-600">₹{totalWorkerAdvances.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">{filteredWorkerAdvances.length} transaction{filteredWorkerAdvances.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="h-16 w-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Worker Advances Table */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Worker Advance History</CardTitle>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Give Advance
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
                      <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
                            <Wallet className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">Give Advance to Worker</DialogTitle>
                            <DialogDescription className="mt-1 text-gray-600">Record advance payment given to a worker. It will be deducted from future wage settlements.</DialogDescription>
                          </div>
                        </div>
                      </div>
                      <form onSubmit={handleCreateWorkerAdvance} className="flex flex-col">
                        <div className="px-6 py-5 space-y-5">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Worker *</Label>
                            <Select value={advanceForm.worker_id} onValueChange={(v) => setAdvanceForm({ ...advanceForm, worker_id: v })}>
                              <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                                <SelectValue placeholder="Select worker" />
                              </SelectTrigger>
                              <SelectContent>
                                {workers.map((w) => (
                                  <SelectItem key={w.id} value={w.id}>{w.name} {w.advance_paid ? `(₹${w.advance_paid})` : ''}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-800">Date *</Label>
                              <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input type="date" value={advanceForm.date} onChange={(e) => setAdvanceForm({ ...advanceForm, date: e.target.value })} max={new Date().toISOString().split('T')[0]} className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-800">Amount (₹) *</Label>
                              <div className="relative">
                                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input type="number" placeholder="0" value={advanceForm.amount} onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })} onWheel={(e) => e.target.blur()} className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Purpose</Label>
                            <Textarea placeholder="Reason for advance (optional)..." value={advanceForm.purpose} onChange={(e) => setAdvanceForm({ ...advanceForm, purpose: e.target.value })} className="rounded-xl border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[88px]" rows={3} />
                          </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
                          <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/25 rounded-xl h-11 px-6 font-semibold">
                            <Plus className="h-4 w-4 mr-2" /> Give Advance
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Worker</th>
                        <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Purpose</th>
                        <th className="text-center py-3 px-6 text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkerAdvances.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-12 text-gray-500">
                            <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-lg font-medium">No worker advances found</p>
                            <p className="text-sm mt-1">
                              {workerAdvances.length === 0 
                                ? 'Click "Give Advance" to record a new advance payment'
                                : 'Try adjusting your search'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredWorkerAdvances
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((advance) => (
                            <tr key={advance.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-6 text-gray-900">
                                {new Date(advance.date).toLocaleDateString('en-GB', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </td>
                              <td className="py-3 px-6 font-medium text-gray-900">{getWorkerName(advance.worker_id)}</td>
                              <td className="py-3 px-6 text-right">
                                <span className="font-bold text-emerald-600">₹{advance.amount.toLocaleString()}</span>
                              </td>
                              <td className="py-3 px-6 text-gray-600">{advance.purpose || '-'}</td>
                              <td className="py-3 px-6 text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteConfirmId(advance.id);
                                    setDeleteType('worker');
                                  }}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employer Advances Tab */}
          <TabsContent value="employer" className="space-y-6">
            {/* Summary Card */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Received from Employers</p>
                    <p className="text-3xl font-bold text-blue-600">₹{totalEmployerAdvances.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">{filteredEmployerAdvances.length} transaction{filteredEmployerAdvances.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employer Advances Table */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Employer Advance History</CardTitle>
                  <Dialog open={employerDialogOpen} onOpenChange={setEmployerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Receive Advance
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
                      <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                            <Building2 className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">Receive Advance from Employer</DialogTitle>
                            <DialogDescription className="mt-1 text-gray-600">Record advance received from an employer. It will be deducted from future payment collections.</DialogDescription>
                          </div>
                        </div>
                      </div>
                      <form onSubmit={handleCreateEmployerAdvance} className="flex flex-col">
                        <div className="px-6 py-5 space-y-5">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Employer *</Label>
                            <Select value={employerAdvanceForm.employer_id} onValueChange={(v) => setEmployerAdvanceForm({ ...employerAdvanceForm, employer_id: v })}>
                              <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                <SelectValue placeholder="Select employer" />
                              </SelectTrigger>
                              <SelectContent>
                                {employers.map((e) => (
                                  <SelectItem key={e.id} value={e.id}>{e.name} {e.advance_received ? `(₹${e.advance_received})` : ''}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-800">Date *</Label>
                              <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input type="date" value={employerAdvanceForm.date} onChange={(e) => setEmployerAdvanceForm({ ...employerAdvanceForm, date: e.target.value })} max={new Date().toISOString().split('T')[0]} className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-800">Amount (₹) *</Label>
                              <div className="relative">
                                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input type="number" placeholder="0" value={employerAdvanceForm.amount} onChange={(e) => setEmployerAdvanceForm({ ...employerAdvanceForm, amount: e.target.value })} onWheel={(e) => e.target.blur()} className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Purpose</Label>
                            <Textarea placeholder="Reason for advance (optional)..." value={employerAdvanceForm.purpose} onChange={(e) => setEmployerAdvanceForm({ ...employerAdvanceForm, purpose: e.target.value })} className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[88px]" rows={3} />
                          </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                          <Button type="button" variant="outline" onClick={() => setEmployerDialogOpen(false)} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
                          <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 px-6 font-semibold">
                            <Plus className="h-4 w-4 mr-2" /> Receive Advance
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Employer</th>
                        <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Purpose</th>
                        <th className="text-center py-3 px-6 text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployerAdvances.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-12 text-gray-500">
                            <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-lg font-medium">No employer advances found</p>
                            <p className="text-sm mt-1">
                              {employerAdvances.length === 0 
                                ? 'Click "Receive Advance" to record a new employer advance'
                                : 'Try adjusting your search'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredEmployerAdvances
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((advance) => (
                            <tr key={advance.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-6 text-gray-900">
                                {new Date(advance.date).toLocaleDateString('en-GB', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </td>
                              <td className="py-3 px-6 font-medium text-gray-900">{getEmployerName(advance.employer_id)}</td>
                              <td className="py-3 px-6 text-right">
                                <span className="font-bold text-blue-600">₹{advance.amount.toLocaleString()}</span>
                              </td>
                              <td className="py-3 px-6 text-gray-600">{advance.purpose || '-'}</td>
                              <td className="py-3 px-6 text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteConfirmId(advance.id);
                                    setDeleteType('employer');
                                  }}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the {deleteType} advance record. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAdvance}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Advance
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
