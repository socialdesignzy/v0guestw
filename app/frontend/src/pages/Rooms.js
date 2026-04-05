import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Plus,
  Edit,
  Trash2,
  DoorOpen,
  Users,
  Key,
  UserPlus,
  UserMinus,
  Search,
  Hash,
  Phone,
  Sparkles,
  Receipt,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [roomForMembers, setRoomForMembers] = useState(null);
  const [roomMembers, setRoomMembers] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    key_number: '',
    max_occupants: '',
  });
  const [addWorkerId, setAddWorkerId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, workersRes] = await Promise.all([
        api.getRooms(),
        api.getWorkers(),
      ]);
      setRooms(roomsRes.data);
      setWorkers(workersRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error(error.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingRoom(null);
    setFormData({ name: '', key_number: '', max_occupants: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (e, room) => {
    e?.stopPropagation?.();
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      key_number: room.key_number || '',
      max_occupants: room.max_occupants ? String(room.max_occupants) : '',
    });
    setDialogOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Room name is required');
      return;
    }
    try {
      const payload = {
        name: formData.name.trim(),
        key_number: formData.key_number.trim() || undefined,
        max_occupants: formData.max_occupants ? parseInt(formData.max_occupants, 10) : undefined,
      };
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, payload);
        toast.success('Room updated successfully');
      } else {
        await api.createRoom(payload);
        toast.success('Room created successfully');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save room');
    }
  };

  const handleDelete = async (e) => {
    e?.stopPropagation?.();
    if (!deleteConfirmId) return;
    try {
      await api.deleteRoom(deleteConfirmId);
      toast.success('Room deleted successfully');
      setDeleteConfirmId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete room');
    }
  };

  const openMembersDialog = async (e, room) => {
    e?.stopPropagation?.();
    setRoomForMembers(room);
    setAddWorkerId('');
    try {
      const res = await api.getRoom(room.id);
      setRoomMembers(res.data.members || []);
    } catch (err) {
      toast.error('Failed to load room members');
    }
    setMembersDialogOpen(true);
  };

  const handleRemoveFromRoom = async (workerId) => {
    try {
      await api.updateWorker(workerId, { room_id: null });
      toast.success('Worker removed from room');
      const res = await api.getRoom(roomForMembers.id);
      setRoomMembers(res.data.members || []);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove worker');
    }
  };

  const handleAddToRoom = async () => {
    if (!addWorkerId || !roomForMembers) return;
    try {
      await api.updateWorker(addWorkerId, { room_id: roomForMembers.id });
      toast.success('Worker added to room');
      setAddWorkerId('');
      const res = await api.getRoom(roomForMembers.id);
      setRoomMembers(res.data.members || []);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add worker');
    }
  };

  const maxOcc = roomForMembers?.max_occupants;
  const atMax = typeof maxOcc === 'number' && maxOcc > 0 && roomMembers.length >= maxOcc;
  const availableToAdd = workers.filter(
    (w) => w.status === 'Active' && w.room_id !== roomForMembers?.id
  );

  const filteredRooms = rooms.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.key_number || '').toLowerCase().includes(q)
    );
  });

  const totalOccupants = rooms.reduce((s, r) => s + (r.member_count || 0), 0);
  const atCapacity = rooms.filter((r) => {
    const m = r.member_count || 0;
    const mx = r.max_occupants;
    return typeof mx === 'number' && mx > 0 && m >= mx;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 bg-white rounded-2xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25">
                <DoorOpen className="h-6 w-6" />
              </span>
              Rooms
            </h1>
            <p className="text-gray-600 max-w-xl">
              Group workers by room to split shared bills like gas and electricity equally. Manage members and capacity in one place.
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/30 transition-all shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Room
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{rooms.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center">
                  <DoorOpen className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Occupants</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalOccupants}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#3B2ED0]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rooms at Capacity</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{atCapacity}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search rooms by name or key number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 bg-gray-50/50 focus:bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Room cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRooms.length === 0 ? (
            <Card className="md:col-span-2 xl:col-span-3 border border-dashed border-gray-300 bg-white/50">
              <CardContent className="p-16 text-center">
                <div className="mx-auto h-20 w-20 rounded-2xl bg-teal-100 flex items-center justify-center mb-6">
                  <DoorOpen className="h-10 w-10 text-teal-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No rooms yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                  Create rooms to group workers and split shared bills like gas, electricity, and maintenance easily.
                </p>
                <Button onClick={openCreateDialog} className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/25">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first room
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRooms.map((room) => {
              const count = room.member_count || 0;
              const max = room.max_occupants;
              const hasMax = typeof max === 'number' && max > 0;
              const pct = hasMax ? Math.min(100, (count / max) * 100) : 100;
              const isFull = hasMax && count >= max;
              return (
                <Card
                  key={room.id}
                  className="group border border-gray-200/80 bg-white shadow-sm hover:shadow-xl hover:border-teal-200/80 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={(e) => openMembersDialog(e, room)}
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-teal-400" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center flex-shrink-0 border border-teal-100">
                          <DoorOpen className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg font-semibold text-gray-900 truncate">{room.name}</CardTitle>
                          {room.key_number && (
                            <Badge variant="outline" className="mt-1.5 text-xs font-medium border-teal-200 text-teal-700 bg-teal-50/50">
                              <Key className="h-3 w-3 mr-1" />
                              {room.key_number}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                          onClick={(e) => openEditDialog(e, room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(room.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700">Occupancy</span>
                        <span className={isFull ? 'font-semibold text-amber-600' : 'text-gray-500'}>
                          {count} / {hasMax ? max : '∞'}
                        </span>
                      </div>
                      {hasMax ? (
                        <Progress value={pct} className="h-2" />
                      ) : (
                        <div className="h-2 w-full rounded-full bg-gray-100" />
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm text-gray-500">
                        {count} {count === 1 ? 'member' : 'members'}
                      </span>
                      <span className="inline-flex items-center text-sm font-medium text-teal-600 group-hover:gap-2 gap-1 transition-all">
                        View members
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Create/Edit Room Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
            {/* Header */}
            <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-teal-50 via-white to-teal-50/50 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25 flex-shrink-0">
                  <DoorOpen className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    {editingRoom ? 'Edit Room' : 'Create New Room'}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-gray-600">
                    {editingRoom
                      ? 'Update the room details. Changes will apply immediately.'
                      : 'Add a room to group workers and split shared bills like gas and electricity.'}
                  </DialogDescription>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveRoom} className="flex flex-col">
              <div className="px-6 py-5 space-y-5">
                {/* Room Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800">Room Name *</Label>
                  <div className="relative">
                    <DoorOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Room 101, Block A, Dormitory B"
                      required
                      className="pl-11 h-11 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Display name shown across the app</p>
                </div>

                {/* Key Number */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800">Key Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.key_number}
                      onChange={(e) => setFormData({ ...formData, key_number: e.target.value })}
                      placeholder="e.g., 101, A-2, B-12"
                      className="pl-11 h-11 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Optional. Physical key or door identifier</p>
                </div>

                {/* Max Occupants */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800">Maximum Occupants</Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        min="0"
                        value={formData.max_occupants}
                        onChange={(e) => setFormData({ ...formData, max_occupants: e.target.value })}
                        placeholder="No limit"
                        className="pl-11 h-11 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[2, 3, 4, 6].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setFormData({ ...formData, max_occupants: String(n) })}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            formData.max_occupants === String(n)
                              ? 'bg-teal-100 text-teal-700 border border-teal-200'
                              : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200 hover:text-gray-800'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, max_occupants: '' })}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          !formData.max_occupants
                            ? 'bg-teal-100 text-teal-700 border border-teal-200'
                            : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200 hover:text-gray-800'
                        }`}
                      >
                        No limit
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Leave empty or choose &quot;No limit&quot; for unlimited capacity</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-gray-300 rounded-xl h-11 px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/25 rounded-xl h-11 px-6 font-semibold"
                >
                  {editingRoom ? 'Save changes' : 'Create room'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Manage Members Dialog */}
        <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            {/* Dialog header with room info */}
            <div className="px-6 py-5 bg-gradient-to-br from-teal-50 to-white border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
                    <DoorOpen className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900">{roomForMembers?.name}</DialogTitle>
                    <DialogDescription className="mt-0.5">
                      {roomForMembers?.key_number && (
                        <Badge variant="outline" className="mr-2 border-teal-200 text-teal-700 bg-teal-50/50">
                          <Key className="h-3 w-3 mr-1" />
                          {roomForMembers.key_number}
                        </Badge>
                      )}
                      {roomMembers.length} of {roomForMembers?.max_occupants || '∞'} occupants
                    </DialogDescription>
                    <Link
                      to="/extra-charges"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
                      onClick={() => setMembersDialogOpen(false)}
                    >
                      <Receipt className="h-4 w-4" />
                      Split a bill by this room
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Add worker */}
              <Card className="border border-dashed border-teal-200 bg-teal-50/30">
                <CardContent className="p-4">
                  <Label className="text-sm font-semibold text-gray-700">Add worker to room</Label>
                  <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    <Select
                      value={addWorkerId}
                      onValueChange={setAddWorkerId}
                      disabled={atMax || availableToAdd.length === 0}
                    >
                      <SelectTrigger className="flex-1 bg-white border-gray-200">
                        <SelectValue
                          placeholder={
                            atMax
                              ? 'Room is full'
                              : availableToAdd.length === 0
                              ? 'No workers available to add'
                              : 'Select a worker'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableToAdd.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                            {w.room_id ? ' · in another room' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={handleAddToRoom}
                      disabled={!addWorkerId || atMax}
                      className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  {atMax && (
                    <p className="text-sm text-amber-700 mt-2 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      This room has reached its maximum capacity.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Current members */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold text-gray-700">Current members</Label>
                  <span className="text-sm text-gray-500">{roomMembers.length} workers</span>
                </div>
                {roomMembers.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-14 text-center">
                    <div className="mx-auto h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      <Users className="h-7 w-7 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-700">No members yet</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                      Add workers to this room to split shared bills (gas, electricity, etc.) in Extra Charges.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[280px] pr-3">
                    <div className="space-y-2">
                      {roomMembers.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-teal-100 hover:bg-teal-50/20 transition-colors"
                        >
                          <Avatar className="h-11 w-11 rounded-xl border-2 border-white shadow-sm">
                            <AvatarFallback className="rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 font-semibold text-sm">
                              {getInitials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{m.name}</p>
                            {m.phone_number && (
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                <Phone className="h-3.5 w-3.5" />
                                {m.phone_number}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={m.status === 'Active' ? 'default' : 'secondary'}
                            className={
                              m.status === 'Active'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }
                          >
                            {m.status || 'Active'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                            onClick={() => handleRemoveFromRoom(m.id)}
                            title="Remove from room"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this room?</AlertDialogTitle>
              <AlertDialogDescription>
                Workers in this room will be unassigned. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
