import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Checkbox } from '../components/ui/checkbox';
import { 
  Plus, 
  Receipt, 
  Users, 
  Trash2, 
  Search, 
  DollarSign,
  Calculator,
  DoorOpen,
  Calendar,
  IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExtraCharges() {
  const [workers, setWorkers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [extraCharges, setExtraCharges] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [roomSplitDialogOpen, setRoomSplitDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Simplified filter - just search
  const [searchQuery, setSearchQuery] = useState('');
  
  const [chargeForm, setChargeForm] = useState({
    worker_id: '',
    amount: '',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [bulkChargeForm, setBulkChargeForm] = useState({
    total_amount: '',
    reason: '',
    date: new Date().toISOString().split('T')[0],
    selected_workers: []
  });

  const [roomSplitForm, setRoomSplitForm] = useState({
    room_id: '',
    total_amount: '',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workersRes, roomsRes, chargesRes] = await Promise.all([
        api.getWorkers(),
        api.getRooms(),
        api.getExtraCharges()
      ]);
      setWorkers(workersRes.data);
      setRooms(roomsRes.data || []);
      setExtraCharges(chargesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(error.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCharge = async (e) => {
    e.preventDefault();
    
    if (!chargeForm.worker_id || !chargeForm.amount || !chargeForm.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await api.createExtraCharge({
        worker_id: chargeForm.worker_id,
        amount: parseFloat(chargeForm.amount),
        reason: chargeForm.reason,
        date: chargeForm.date
      });
      
      toast.success('Extra charge added successfully');
      setDialogOpen(false);
      setChargeForm({ worker_id: '', amount: '', reason: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add charge');
    }
  };

  const handleCreateBulkCharge = async (e) => {
    e.preventDefault();
    
    if (!bulkChargeForm.total_amount || !bulkChargeForm.reason || bulkChargeForm.selected_workers.length === 0) {
      toast.error('Please fill all required fields and select workers');
      return;
    }

    const totalAmount = parseFloat(bulkChargeForm.total_amount);
    const selectedCount = bulkChargeForm.selected_workers.length;
    const amountPerWorker = totalAmount / selectedCount;
    
    const charges = bulkChargeForm.selected_workers.map(worker_id => ({
      worker_id,
      amount: parseFloat(amountPerWorker.toFixed(2)),
      reason: bulkChargeForm.reason,
      date: bulkChargeForm.date
    }));

    try {
      for (const charge of charges) {
        await api.createExtraCharge(charge);
      }
      
      toast.success(`Extra charge split among ${selectedCount} worker(s) successfully`);
      setBulkDialogOpen(false);
      setBulkChargeForm({ 
        total_amount: '', 
        reason: '', 
        date: new Date().toISOString().split('T')[0],
        selected_workers: []
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add charges');
    }
  };

  const handleSplitByRoom = async (e) => {
    e.preventDefault();
    if (!roomSplitForm.room_id || !roomSplitForm.total_amount || !roomSplitForm.reason) {
      toast.error('Please fill room, amount and reason');
      return;
    }
    try {
      const res = await api.splitExtraChargeByRoom({
        room_id: roomSplitForm.room_id,
        total_amount: parseFloat(roomSplitForm.total_amount),
        reason: roomSplitForm.reason,
        date: roomSplitForm.date
      });
      toast.success(res.data?.message || 'Bill split among room members successfully');
      setRoomSplitDialogOpen(false);
      setRoomSplitForm({ room_id: '', total_amount: '', reason: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to split by room');
    }
  };

  const handleDeleteCharge = async () => {
    if (!deleteConfirmId) return;
    
    try {
      await api.deleteExtraCharge(deleteConfirmId);
      toast.success('Extra charge deleted successfully');
      setDeleteConfirmId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete charge');
    }
  };

  const toggleWorkerSelection = (workerId) => {
    const isSelected = bulkChargeForm.selected_workers.includes(workerId);
    if (isSelected) {
      setBulkChargeForm({
        ...bulkChargeForm,
        selected_workers: bulkChargeForm.selected_workers.filter(id => id !== workerId)
      });
    } else {
      setBulkChargeForm({
        ...bulkChargeForm,
        selected_workers: [...bulkChargeForm.selected_workers, workerId]
      });
    }
  };

  const selectAllWorkers = () => {
    setBulkChargeForm({
      ...bulkChargeForm,
      selected_workers: workers.map(w => w.id)
    });
  };

  const deselectAllWorkers = () => {
    setBulkChargeForm({
      ...bulkChargeForm,
      selected_workers: []
    });
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown';
  };

  // Simplified filtering - just search
  const filteredCharges = extraCharges.filter(charge => {
    if (searchQuery) {
      const workerName = getWorkerName(charge.worker_id).toLowerCase();
      const reason = charge.reason.toLowerCase();
      return workerName.includes(searchQuery.toLowerCase()) || reason.includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const totalAmount = filteredCharges.reduce((sum, charge) => sum + charge.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-white/50 rounded-xl w-1/3"></div>
          <div className="h-96 bg-white/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Extra Charges
          </h1>
          <p className="text-gray-600">Manage extra charges like bills, courier fees, and other deductions</p>
        </div>

        {/* Search and Actions */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by worker or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-auto">
                <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-gray-300">
                      <Calculator className="h-4 w-4 mr-2" />
                      Split Bill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-gray-200/80 shadow-2xl">
                    <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
                          <Calculator className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-bold text-gray-900">Split Bill Among Workers</DialogTitle>
                          <DialogDescription className="mt-1 text-gray-600">Enter the total bill amount and select workers to split it equally. Each worker will get an equal share.</DialogDescription>
                        </div>
                      </div>
                    </div>
                    <form onSubmit={handleCreateBulkCharge} className="flex flex-col flex-1 overflow-hidden">
                      <div className="px-6 py-5 space-y-5 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Total Bill Amount (₹) *</Label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input type="number" value={bulkChargeForm.total_amount} onChange={(e) => setBulkChargeForm({ ...bulkChargeForm, total_amount: e.target.value })} placeholder="e.g., 1000" required onWheel={(e) => e.target.blur()} className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Date *</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input type="date" value={bulkChargeForm.date} onChange={(e) => setBulkChargeForm({ ...bulkChargeForm, date: e.target.value })} required className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">Reason/Description *</Label>
                          <Textarea value={bulkChargeForm.reason} onChange={(e) => setBulkChargeForm({ ...bulkChargeForm, reason: e.target.value })} placeholder="e.g., Electricity bill, Courier collection, etc." required className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-h-[88px]" rows={3} />
                        </div>
                        {bulkChargeForm.total_amount && bulkChargeForm.selected_workers.length > 0 && (
                          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <span className="text-sm font-semibold text-orange-900">₹{(parseFloat(bulkChargeForm.total_amount) / bulkChargeForm.selected_workers.length).toFixed(2)} per worker</span>
                            <span className="text-xs text-orange-700 ml-1">— ₹{bulkChargeForm.total_amount} ÷ {bulkChargeForm.selected_workers.length} workers</span>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-gray-800">Select Workers ({bulkChargeForm.selected_workers.length} selected)</Label>
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={selectAllWorkers} disabled={workers.length === bulkChargeForm.selected_workers.length} className="rounded-lg h-8">Select All</Button>
                              <Button type="button" variant="outline" size="sm" onClick={deselectAllWorkers} disabled={bulkChargeForm.selected_workers.length === 0} className="rounded-lg h-8">Deselect All</Button>
                            </div>
                          </div>
                          <div className="border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2 bg-gray-50/50">
                            {workers.length === 0 ? <p className="text-center text-gray-500 text-sm py-4">No workers found</p> : workers.map((w) => (
                              <div key={w.id} className="flex items-center space-x-2">
                                <Checkbox id={`worker-${w.id}`} checked={bulkChargeForm.selected_workers.includes(w.id)} onCheckedChange={() => toggleWorkerSelection(w.id)} />
                                <Label htmlFor={`worker-${w.id}`} className="flex-1 cursor-pointer text-sm">{w.name}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => { setBulkDialogOpen(false); setBulkChargeForm({ total_amount: '', reason: '', date: new Date().toISOString().split('T')[0], selected_workers: [] }); }} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
                        <Button type="submit" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-500/25 rounded-xl h-11 px-6 font-semibold"><Calculator className="mr-2 h-4 w-4" /> Split & Add Charges</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={roomSplitDialogOpen} onOpenChange={setRoomSplitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-gray-300">
                      <DoorOpen className="h-4 w-4 mr-2" />
                      Split by Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
                    <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-orange-50 via-white to-teal-50/30 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
                          <DoorOpen className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-bold text-gray-900">Split Bill by Room</DialogTitle>
                          <DialogDescription className="mt-1 text-gray-600">Split a shared bill (gas, electricity, etc.) equally among all workers in a room.</DialogDescription>
                        </div>
                      </div>
                    </div>
                    <form onSubmit={handleSplitByRoom} className="flex flex-col">
                      <div className="px-6 py-5 space-y-5">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">Room *</Label>
                          <Select value={roomSplitForm.room_id} onValueChange={(v) => setRoomSplitForm({ ...roomSplitForm, room_id: v })} required>
                            <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                              <SelectValue placeholder="Select a room" />
                            </SelectTrigger>
                            <SelectContent>
                              {rooms.filter((r) => (r.member_count || 0) > 0).map((r) => (
                                <SelectItem key={r.id} value={r.id}>{r.name}{r.key_number ? ` (${r.key_number})` : ''} — {r.member_count || 0} workers</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {rooms.filter((r) => (r.member_count || 0) > 0).length === 0 && <p className="text-xs text-amber-600">No rooms with workers. Create rooms and add workers first.</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Total Amount (₹) *</Label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input type="number" value={roomSplitForm.total_amount} onChange={(e) => setRoomSplitForm({ ...roomSplitForm, total_amount: e.target.value })} placeholder="e.g., 1500" required onWheel={(e) => e.target.blur()} className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Date *</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input type="date" value={roomSplitForm.date} onChange={(e) => setRoomSplitForm({ ...roomSplitForm, date: e.target.value })} required className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">Reason/Description *</Label>
                          <Textarea value={roomSplitForm.reason} onChange={(e) => setRoomSplitForm({ ...roomSplitForm, reason: e.target.value })} placeholder="e.g., Electricity bill, Gas bill, etc." required className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-h-[80px]" rows={2} />
                        </div>
                        {roomSplitForm.room_id && roomSplitForm.total_amount && (() => { const r = rooms.find((x) => x.id === roomSplitForm.room_id); const n = r?.member_count || 0; return n > 0 ? <div className="bg-orange-50 border border-orange-200 rounded-xl p-4"><span className="text-sm font-semibold text-orange-900">₹{(parseFloat(roomSplitForm.total_amount) / n).toFixed(2)} per worker</span><span className="text-xs text-orange-700 ml-1">({n} workers)</span></div> : null; })()}
                      </div>
                      <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setRoomSplitDialogOpen(false)} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
                        <Button type="submit" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-500/25 rounded-xl h-11 px-6 font-semibold"><DoorOpen className="h-4 w-4 mr-2" /> Split by Room</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Charge
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
                    <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
                          <Receipt className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <DialogTitle className="text-xl font-bold text-gray-900">Add Extra Charge</DialogTitle>
                          <DialogDescription className="mt-1 text-gray-600">Record a charge for a specific worker. It will be deducted from their next wage settlement.</DialogDescription>
                        </div>
                      </div>
                    </div>
                    <form onSubmit={handleCreateCharge} className="flex flex-col">
                      <div className="px-6 py-5 space-y-5">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">Worker *</Label>
                          <Select value={chargeForm.worker_id} onValueChange={(v) => setChargeForm({ ...chargeForm, worker_id: v })} required>
                            <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                              <SelectValue placeholder="Select a worker" />
                            </SelectTrigger>
                            <SelectContent>
                              {workers.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Amount (₹) *</Label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input type="number" value={chargeForm.amount} onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })} placeholder="e.g., 500" required onWheel={(e) => e.target.blur()} className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Date *</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input type="date" value={chargeForm.date} onChange={(e) => setChargeForm({ ...chargeForm, date: e.target.value })} required className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-800">Reason/Description *</Label>
                          <Textarea value={chargeForm.reason} onChange={(e) => setChargeForm({ ...chargeForm, reason: e.target.value })} placeholder="e.g., Courier collection, electricity bill, etc." required className="rounded-xl border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-h-[88px]" rows={3} />
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setChargeForm({ worker_id: '', amount: '', reason: '', date: new Date().toISOString().split('T')[0] }); }} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
                        <Button type="submit" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-500/25 rounded-xl h-11 px-6 font-semibold"><Plus className="mr-2 h-4 w-4" /> Add Charge</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Extra Charges</p>
                <p className="text-3xl font-bold text-orange-600">₹{totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{filteredCharges.length} charge{filteredCharges.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="h-16 w-16 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charges Table */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl">Extra Charges History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Worker</th>
                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Reason</th>
                    <th className="text-center py-3 px-6 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCharges.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-gray-500">
                        <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">No extra charges found</p>
                        <p className="text-sm mt-1">
                          {searchQuery ? 'Try adjusting your search' : 'Extra charges will appear here'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCharges
                      .sort((a, b) => {
                        // Sort by date (newest first)
                        const dateA = new Date(a.date.split('-').reverse().join('-'));
                        const dateB = new Date(b.date.split('-').reverse().join('-'));
                        return dateB - dateA;
                      })
                      .map((charge) => (
                        <tr key={charge.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-6 text-gray-900">
                            {charge.date}
                          </td>
                          <td className="py-3 px-6 font-medium text-gray-900">
                            {getWorkerName(charge.worker_id)}
                          </td>
                          <td className="py-3 px-6 text-right">
                            <span className="font-bold text-orange-600">₹{charge.amount.toLocaleString()}</span>
                          </td>
                          <td className="py-3 px-6 text-gray-600">
                            {charge.reason}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirmId(charge.id)}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Extra Charge?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this extra charge record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCharge}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Charge
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
