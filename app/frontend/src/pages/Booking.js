import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Building2, Users, Calendar, Phone, MapPin, CheckCircle, XCircle, Trash2, Search, AlertCircle, Edit, CalendarCheck, Eye, Plus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

export default function Booking() {
  const { user } = useAuth();
  const [employers, setEmployers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateString, setDateString] = useState(formatDateToDDMMYYYY(new Date()));
  const [availabilityData, setAvailabilityData] = useState(null);
  const [activeTab, setActiveTab] = useState('date-view');
  
  // Dialog states
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  
  const [bookingForm, setBookingForm] = useState({
    date: new Date(),
    workers_count: '',
    selected_workers: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEmployersList();
  }, [employers, searchQuery]);

  useEffect(() => {
    const formatted = formatDateToDDMMYYYY(selectedDate);
    setDateString(formatted);
    // Always fetch availability data when date changes, regardless of active tab
    fetchAvailabilityData(formatted);
  }, [selectedDate]);

  // Fetch availability when booking form date changes
  useEffect(() => {
    if (bookingDialogOpen && bookingForm.date) {
      const formDateStr = formatDateToDDMMYYYY(bookingForm.date);
      if (!availabilityData || availabilityData.date !== formDateStr) {
        fetchAvailabilityData(formDateStr);
      }
    }
  }, [bookingForm.date, bookingDialogOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employersRes, workersRes, bookingsRes] = await Promise.all([
        api.getEmployers(),
        api.getWorkers(),
        api.getBookings()
      ]);
      
      // Filter only active employers
      const activeEmployers = employersRes.data.filter(e => e.status === 'Active');
      const activeWorkers = workersRes.data.filter(w => w.status === 'Active');
      
      setEmployers(activeEmployers);
      setWorkers(activeWorkers);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilityData = async (date) => {
    try {
      const response = await api.getBookingAvailability(date);
      setAvailabilityData(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to fetch availability data');
    }
  };


  const filterEmployersList = () => {
    let filtered = employers;
    
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.phone_number?.includes(searchQuery)
      );
    }
    
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredEmployers(filtered);
  };

  // Helper function to check if a date is in the past
  const isDatePast = (dateStr) => {
    const [day, month, year] = dateStr.split('-');
    const bookingDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < today;
  };

  const getBookingsForEmployer = (employerId) => {
    return bookings.filter(b => b.employer_id === employerId);
  };

  const getUpcomingBookingsForEmployer = (employerId) => {
    return bookings.filter(b => b.employer_id === employerId && !isDatePast(b.date));
  };

  const handleCreateBooking = (employer) => {
    setSelectedEmployer(employer);
    setEditingBooking(null);
    const initialDate = selectedDate;
    setBookingForm({
      date: initialDate,
      workers_count: '',
      selected_workers: []
    });
    // Fetch availability for the initial date
    fetchAvailabilityData(formatDateToDDMMYYYY(initialDate));
    setBookingDialogOpen(true);
  };

  const handleEditBooking = (booking) => {
    const employer = employers.find(e => e.id === booking.employer_id);
    setSelectedEmployer(employer);
    setEditingBooking(booking);
    
    // Parse date from DD-MM-YYYY to Date object
    const [day, month, year] = booking.date.split('-');
    const bookingDate = new Date(year, month - 1, day);
    
    setBookingForm({
      date: bookingDate,
      workers_count: booking.workers_count.toString(),
      selected_workers: booking.selected_workers || []
    });
    // Fetch availability for the booking date
    fetchAvailabilityData(booking.date);
    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployer) return;
    
    if (!bookingForm.workers_count || bookingForm.workers_count <= 0) {
      toast.error('Please enter a valid number of workers');
      return;
    }

    const dateStr = formatDateToDDMMYYYY(bookingForm.date);
    const workersCount = parseInt(bookingForm.workers_count);
    
    // Check for duplicate booking (same employer, same date) - only for new bookings
    // Only check upcoming bookings (not history)
    if (!editingBooking) {
      const existingBooking = upcomingBookings.find(
        b => b.employer_id === selectedEmployer.id && b.date === dateStr
      );
      
      if (existingBooking) {
        toast.error(`A booking already exists for ${selectedEmployer.name} on ${dateStr}. Please edit the existing booking instead.`);
        return;
      }
    }
    
    // Check if booking exceeds available workers
    // Fetch current availability for the date
    try {
      const availabilityRes = await api.getBookingAvailability(dateStr);
      const availableCount = availabilityRes.data.available_count;
      
      // If editing, add back the current booking's workers to available count
      let actualAvailable = availableCount;
      if (editingBooking) {
        actualAvailable += editingBooking.workers_count;
      }
      
      if (workersCount > actualAvailable) {
        toast.error(`Cannot book ${workersCount} workers. Only ${actualAvailable} worker${actualAvailable !== 1 ? 's are' : ' is'} available on this date.`);
        return;
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      // Continue with booking if availability check fails
    }
    
    // If workers are selected, validate count matches
    if (bookingForm.selected_workers.length > 0) {
      if (bookingForm.selected_workers.length !== workersCount) {
        toast.error(`Number of selected workers (${bookingForm.selected_workers.length}) must match workers count (${workersCount})`);
        return;
      }
    }

    try {
      if (editingBooking) {
        await api.updateBooking(editingBooking.id, {
          employer_id: selectedEmployer.id,
          date: dateStr,
          workers_count: parseInt(bookingForm.workers_count),
          selected_workers: bookingForm.selected_workers
        });
        toast.success('Booking updated successfully');
      } else {
        await api.createBooking({
          employer_id: selectedEmployer.id,
          date: dateStr,
          workers_count: parseInt(bookingForm.workers_count),
          selected_workers: bookingForm.selected_workers
        });
        toast.success('Booking created successfully');
      }
      
      setBookingDialogOpen(false);
      setSelectedEmployer(null);
      setEditingBooking(null);
      fetchData();
      if (activeTab === 'date-view') {
        fetchAvailabilityData(dateStr);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || (editingBooking ? 'Failed to update booking' : 'Failed to create booking');
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      await api.deleteBooking(bookingToDelete.id);
      toast.success('Booking deleted successfully');
      setDeleteConfirmOpen(false);
      setBookingToDelete(null);
      fetchData();
      if (activeTab === 'date-view') {
        fetchAvailabilityData(dateString);
      }
    } catch (error) {
      toast.error('Failed to delete booking');
    }
  };

  const toggleWorkerSelection = (workerId) => {
    setBookingForm(prev => {
      const isSelected = prev.selected_workers.includes(workerId);
      if (isSelected) {
        return {
          ...prev,
          selected_workers: prev.selected_workers.filter(id => id !== workerId)
        };
      } else {
        // If workers_count is set, limit selection
        if (prev.workers_count && prev.selected_workers.length >= parseInt(prev.workers_count)) {
          toast.error(`You can only select ${prev.workers_count} workers`);
          return prev;
        }
        return {
          ...prev,
          selected_workers: [...prev.selected_workers, workerId]
        };
      }
    });
  };

  // Get available workers for selected date (excluding already booked ones)
  const getAvailableWorkersForDate = () => {
    if (!availabilityData) return workers;
    
    const bookedWorkerIds = new Set(availabilityData.booked_worker_ids || []);
    return workers.filter(w => !bookedWorkerIds.has(w.id));
  };

  // Separate bookings into upcoming and history
  const upcomingBookings = bookings.filter(b => !isDatePast(b.date));
  const bookingHistory = bookings.filter(b => isDatePast(b.date));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-white rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-white rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalActiveEmployers = employers.length;
  const totalActiveWorkers = workers.length;
  const upcomingBookingsCount = upcomingBookings.length;
  const bookingHistoryCount = bookingHistory.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Bookings
          </h1>
          <p className="text-gray-600">Reserve workers for employers</p>
        </div>

        {/* Date Selector - Global for entire page */}
        <Card className="border border-gray-200 shadow-sm bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Label className="text-base font-semibold text-gray-900 mb-1 block">Select Date</Label>
                <p className="text-sm text-gray-600">Choose a date to view and manage bookings</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  minDate={new Date()}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#3B2ED0] focus:border-[#3B2ED0]"
                  wrapperClassName="w-full md:w-auto"
                />
                <Button
                  onClick={() => setSelectedDate(new Date())}
                  variant="outline"
                  size="sm"
                  className={`transition-all ${
                    formatDateToDDMMYYYY(selectedDate) === formatDateToDDMMYYYY(new Date()) 
                      ? 'bg-[#3B2ED0] text-white border-indigo-600 hover:bg-[#2A1FB8]' 
                      : 'hover:bg-[#3B2ED0]/10'
                  }`}
                >
                  Today
                </Button>
                <Button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedDate(tomorrow);
                  }}
                  variant="outline"
                  size="sm"
                  className={`transition-all ${
                    formatDateToDDMMYYYY(selectedDate) === formatDateToDDMMYYYY(new Date(new Date().setDate(new Date().getDate() + 1))) 
                      ? 'bg-[#3B2ED0] text-white border-indigo-600 hover:bg-[#2A1FB8]' 
                      : 'hover:bg-[#3B2ED0]/10'
                  }`}
                >
                  Tomorrow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Available Workers</p>
                  <p className="text-4xl font-bold text-green-600 mb-1">
                    {availabilityData && availabilityData.date === dateString 
                      ? availabilityData.available_count 
                      : totalActiveWorkers}
                  </p>
                  <p className="text-xs text-gray-500">Available on {dateString}</p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-sm">
                  <Users className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Bookings</p>
                  <p className="text-4xl font-bold text-[#3B2ED0] mb-1">
                    {availabilityData && availabilityData.date === dateString 
                      ? (availabilityData.bookings?.length || 0)
                      : bookings.filter(b => b.date === dateString).length}
                  </p>
                  <p className="text-xs text-gray-500">Bookings on {dateString}</p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="h-7 w-7 text-[#3B2ED0]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="date-view" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              View by Date
            </TabsTrigger>
            <TabsTrigger value="employers-view" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              View by Employer
            </TabsTrigger>
            <TabsTrigger value="history-view" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Booking History
            </TabsTrigger>
          </TabsList>

          {/* Date View Tab */}
          <TabsContent value="date-view" className="space-y-4">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Bookings for {dateString}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availabilityData && (
                  <>
                    {/* Quick Create Booking */}
                    {availabilityData.available_count > 0 && (
                      <div className="p-5 bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10 border border-[#3B2ED0]/30 rounded-lg shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                              <Plus className="h-4 w-4 text-[#3B2ED0]" />
                              Quick Create Booking
                            </h3>
                            <p className="text-sm text-gray-600">Create a new booking for {dateString}</p>
                          </div>
                          <Select
                            value=""
                            onValueChange={(employerId) => {
                              const employer = employers.find(e => e.id === employerId);
                              if (employer) {
                                // Check if booking already exists for this employer on this date
                                const existingBooking = upcomingBookings.find(
                                  b => b.employer_id === employer.id && b.date === dateString
                                );
                                if (existingBooking) {
                                  toast.error(`A booking already exists for ${employer.name} on ${dateString}. Please edit the existing booking instead.`);
                                  return;
                                }
                                handleCreateBooking(employer);
                              }
                            }}
                          >
                            <SelectTrigger className="w-full md:w-[250px] border-[#3B2ED0]/50 bg-white hover:bg-[#3B2ED0]/10 transition-colors">
                              <SelectValue placeholder="Select employer..." />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredEmployers.map((employer) => {
                                const hasBooking = upcomingBookings.some(
                                  b => b.employer_id === employer.id && b.date === dateString
                                );
                                return (
                                  <SelectItem 
                                    key={employer.id} 
                                    value={employer.id}
                                    disabled={hasBooking}
                                  >
                                    {employer.name}
                                    {hasBooking && ' (Already booked)'}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Bookings List */}
                    {availabilityData.bookings && availabilityData.bookings.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <CalendarCheck className="h-5 w-5 text-[#3B2ED0]" />
                            Bookings for {dateString}
                          </h3>
                          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                            {availabilityData.bookings.length} booking{availabilityData.bookings.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {availabilityData.bookings.map((booking) => {
                            const selectedWorkersList = booking.selected_workers && booking.selected_workers.length > 0
                              ? workers.filter(w => booking.selected_workers.includes(w.id))
                              : [];
                            
                            return (
                              <Card key={booking.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                                          <Building2 className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-gray-900 text-base">{booking.employer_name}</h4>
                                          {booking.employer_phone && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                              <Phone className="h-3 w-3" />
                                              {booking.employer_phone}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="ml-15 space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-sm font-medium px-2.5 py-1 border-[#3B2ED0]/30 text-[#3B2ED0] bg-[#3B2ED0]/10">
                                            {booking.workers_count} worker{booking.workers_count !== 1 ? 's' : ''} booked
                                          </Badge>
                                        </div>
                                        {selectedWorkersList.length > 0 && (
                                          <div className="mt-2 pt-2 border-t border-gray-100">
                                            <p className="text-xs font-medium text-gray-600 mb-1.5">Selected Workers:</p>
                                            <div className="flex flex-wrap gap-1.5">
                                              {selectedWorkersList.map((worker) => (
                                                <Badge key={worker.id} variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700">
                                                  {worker.name}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditBooking(booking)}
                                        className="border-[#3B2ED0]/50 text-[#3B2ED0] hover:bg-[#3B2ED0]/10 hover:border-[#3B2ED0]/60 transition-colors"
                                      >
                                        <Edit className="h-4 w-4 mr-1.5" />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteClick(booking)}
                                        className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4 mr-1.5" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CalendarCheck className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-gray-700 font-semibold text-lg mb-1">No bookings for {dateString}</p>
                        <p className="text-sm text-gray-500 mb-6">All {availabilityData.available_count} workers are available</p>
                        {availabilityData.available_count > 0 && (
                          <div className="mt-6">
                            <Select
                              value=""
                              onValueChange={(employerId) => {
                                const employer = employers.find(e => e.id === employerId);
                                if (employer) {
                                  // Check if booking already exists for this employer on this date (only upcoming)
                                  const existingBooking = upcomingBookings.find(
                                    b => b.employer_id === employer.id && b.date === dateString
                                  );
                                  if (existingBooking) {
                                    toast.error(`A booking already exists for ${employer.name} on ${dateString}. Please edit the existing booking instead.`);
                                    return;
                                  }
                                  handleCreateBooking(employer);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full md:w-[300px] mx-auto border-[#3B2ED0]/50 bg-white hover:bg-[#3B2ED0]/10 transition-colors">
                                <SelectValue placeholder="Create booking for..." />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredEmployers.map((employer) => {
                                  const hasBooking = upcomingBookings.some(
                                    b => b.employer_id === employer.id && b.date === dateString
                                  );
                                  return (
                                    <SelectItem 
                                      key={employer.id} 
                                      value={employer.id}
                                      disabled={hasBooking}
                                    >
                                      {employer.name}
                                      {hasBooking && ' (Already booked)'}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employers View Tab */}
          <TabsContent value="employers-view" className="space-y-4">
            {/* Search */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employers by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Employers Grid */}
            {filteredEmployers.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Employers Found</h3>
                  <p className="text-gray-600">Add active employers to create bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployers.map((employer) => {
                  const employerBookings = getUpcomingBookingsForEmployer(employer.id);
                  
                  return (
                    <Card 
                      key={employer.id} 
                      className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center">
                              <Building2 className="h-7 w-7 text-purple-600" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{employer.name}</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              {employer.phone_number && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{employer.phone_number}</span>
                                </div>
                              )}
                              {employer.work_location && (
                                <div className="flex items-center gap-1 truncate">
                                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{employer.work_location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
                            <p className="text-lg font-bold text-[#3B2ED0]">{employerBookings.length}</p>
                          </div>
                        </div>

                        {employerBookings.length > 0 && (
                          <div className="mb-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Recent Bookings:</p>
                            <div className="space-y-1">
                              {employerBookings.slice(0, 3).map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">{booking.date}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {booking.workers_count} workers
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={() => handleCreateBooking(employer)}
                          className="w-full bg-[#3B2ED0] hover:bg-[#2A1FB8] text-white"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Booking
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Booking History Tab */}
          <TabsContent value="history-view" className="space-y-4">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">Booking History</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Past bookings that have been completed</p>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {bookingHistoryCount} booking{bookingHistoryCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {bookingHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No booking history</p>
                    <p className="text-sm text-gray-500 mt-1">Past bookings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookingHistory
                      .sort((a, b) => {
                        // Sort by date descending (most recent first)
                        const [dayA, monthA, yearA] = a.date.split('-');
                        const [dayB, monthB, yearB] = b.date.split('-');
                        const dateA = new Date(yearA, monthA - 1, dayA);
                        const dateB = new Date(yearB, monthB - 1, dayB);
                        return dateB - dateA;
                      })
                      .map((booking) => {
                        const employer = employers.find(e => e.id === booking.employer_id);
                        const selectedWorkersList = booking.selected_workers && booking.selected_workers.length > 0
                          ? workers.filter(w => booking.selected_workers.includes(w.id))
                          : [];
                        
                        return (
                          <Card key={booking.id} className="border border-gray-200 shadow-sm bg-gray-50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <Building2 className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">
                                        {employer?.name || 'Unknown Employer'}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                                          {booking.date}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {booking.workers_count} worker{booking.workers_count !== 1 ? 's' : ''}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  {selectedWorkersList.length > 0 && (
                                    <div className="ml-13 mt-2">
                                      <p className="text-xs text-gray-500 mb-1">Selected Workers:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {selectedWorkersList.map((worker) => (
                                          <Badge key={worker.id} variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                                            {worker.name}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Dialog */}
        <Dialog open={bookingDialogOpen} onOpenChange={(open) => {
          setBookingDialogOpen(open);
          if (!open) {
            setSelectedEmployer(null);
            setEditingBooking(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-[#3B2ED0]/10 to-[#4F46E5]/10">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  editingBooking ? 'bg-orange-100' : 'bg-indigo-100'
                }`}>
                  {editingBooking ? (
                    <Edit className="h-6 w-6 text-orange-600" />
                  ) : (
                    <CalendarCheck className="h-6 w-6 text-[#3B2ED0]" />
                  )}
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    {editingBooking ? 'Edit Booking' : 'Create New Booking'}
                  </DialogTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedEmployer?.name && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {selectedEmployer.name}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleBookingSubmit} className="flex flex-col">
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
                {/* Booking Date Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Calendar className="h-4 w-4 text-[#3B2ED0]" />
                    <Label className="text-sm font-semibold text-gray-900">
                      Booking Date *
                    </Label>
                  </div>
                  <DatePicker
                    selected={bookingForm.date}
                    onChange={(date) => {
                      setBookingForm({ ...bookingForm, date });
                      // Fetch availability for the new date
                      if (date) {
                        fetchAvailabilityData(formatDateToDDMMYYYY(date));
                      }
                    }}
                    dateFormat="dd-MM-yyyy"
                    minDate={new Date()}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B2ED0] focus:border-[#3B2ED0] transition-all"
                    wrapperClassName="w-full"
                  />
                </div>

                {/* Number of Workers Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Users className="h-4 w-4 text-[#3B2ED0]" />
                    <Label className="text-sm font-semibold text-gray-900">
                      Number of Workers *
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min="1"
                      max={availabilityData && bookingForm.date && formatDateToDDMMYYYY(bookingForm.date) === availabilityData.date 
                        ? (editingBooking ? availabilityData.available_count + editingBooking.workers_count : availabilityData.available_count)
                        : undefined}
                      value={bookingForm.workers_count}
                      onChange={(e) => {
                        const count = e.target.value;
                        const countNum = parseInt(count) || 0;
                        
                        // Check if count exceeds available workers
                        if (count && availabilityData && bookingForm.date && formatDateToDDMMYYYY(bookingForm.date) === availabilityData.date) {
                          const maxAvailable = editingBooking 
                            ? availabilityData.available_count + editingBooking.workers_count 
                            : availabilityData.available_count;
                          
                          if (countNum > maxAvailable) {
                            toast.error(`Cannot book more than ${maxAvailable} workers. Only ${maxAvailable} worker${maxAvailable !== 1 ? 's are' : ' is'} available.`);
                            return;
                          }
                        }
                        
                        setBookingForm(prev => ({
                          ...prev,
                          workers_count: count,
                          // If count is reduced, remove excess selected workers
                          selected_workers: prev.selected_workers.slice(0, countNum)
                        }));
                      }}
                      placeholder="Enter number of workers"
                      required
                      className="text-lg font-semibold border-2 border-gray-300 focus:ring-2 focus:ring-[#3B2ED0] focus:border-[#3B2ED0]"
                    />
                    {availabilityData && bookingForm.date && formatDateToDDMMYYYY(bookingForm.date) === availabilityData.date && (
                      <div className={`p-3 rounded-lg border ${
                        bookingForm.workers_count && parseInt(bookingForm.workers_count) > (editingBooking 
                          ? availabilityData.available_count + editingBooking.workers_count 
                          : availabilityData.available_count)
                          ? 'bg-red-50 border-red-200'
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <p className={`text-sm font-medium flex items-center gap-2 ${
                          bookingForm.workers_count && parseInt(bookingForm.workers_count) > (editingBooking 
                            ? availabilityData.available_count + editingBooking.workers_count 
                            : availabilityData.available_count)
                            ? 'text-red-700'
                            : 'text-green-700'
                        }`}>
                          <Users className="h-4 w-4" />
                          <span>
                            Available workers: <span className="font-bold">
                              {editingBooking 
                                ? availabilityData.available_count + editingBooking.workers_count 
                                : availabilityData.available_count}
                            </span>
                          </span>
                          {bookingForm.workers_count && parseInt(bookingForm.workers_count) > (editingBooking 
                            ? availabilityData.available_count + editingBooking.workers_count 
                            : availabilityData.available_count) && (
                            <span className="ml-2 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              Exceeds available
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Worker Selection Section - Only show if workers_count is entered */}
                {bookingForm.workers_count && parseInt(bookingForm.workers_count) > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-[#3B2ED0]" />
                        <Label className="text-sm font-semibold text-gray-900">
                          Select Workers (Optional)
                        </Label>
                      </div>
                      {bookingForm.selected_workers.length > 0 && (
                        <Badge variant="outline" className="text-xs font-medium border-[#3B2ED0]/30 text-[#3B2ED0] bg-[#3B2ED0]/10">
                          {bookingForm.selected_workers.length} selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      {bookingForm.selected_workers.length > 0 
                        ? `${bookingForm.selected_workers.length} worker(s) selected. You can leave this empty to book without specifying workers.`
                        : 'Select specific workers or leave empty to book without specifying workers'}
                    </p>
                    <div className="border-2 border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                      {getAvailableWorkersForDate().length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 font-medium">No available workers</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {getAvailableWorkersForDate().map((worker) => {
                            const isSelected = bookingForm.selected_workers.includes(worker.id);
                            const isDisabled = bookingForm.workers_count && 
                              !isSelected && 
                              bookingForm.selected_workers.length >= parseInt(bookingForm.workers_count);
                            
                            return (
                              <div
                                key={worker.id}
                                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#3B2ED0]/10 border-[#3B2ED0]/50 shadow-sm'
                                    : isDisabled
                                    ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                                    : 'border-gray-200 hover:bg-white hover:border-[#3B2ED0]/30 hover:shadow-sm'
                                }`}
                                onClick={() => !isDisabled && toggleWorkerSelection(worker.id)}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleWorkerSelection(worker.id)}
                                  disabled={isDisabled}
                                  className="pointer-events-none"
                                />
                                <div className="flex-1">
                                  <p className={`text-sm font-medium ${
                                    isSelected ? 'text-indigo-900' : 'text-gray-900'
                                  }`}>
                                    {worker.name}
                                  </p>
                                  {worker.phone_number && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                      <Phone className="h-3 w-3" />
                                      {worker.phone_number}
                                    </p>
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="h-6 w-6 bg-[#3B2ED0] rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBookingDialogOpen(false);
                    setSelectedEmployer(null);
                    setEditingBooking(null);
                  }}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className={`${
                    editingBooking 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'bg-[#3B2ED0] hover:bg-[#2A1FB8]'
                  } text-white shadow-sm hover:shadow-md transition-all`}
                >
                  {editingBooking ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Booking
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Create Booking
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl font-bold">Delete Booking?</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1">
                    This action cannot be undone.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete the booking for <span className="font-semibold">{bookingToDelete?.employer_name || 'this employer'}</span> on <span className="font-semibold">{bookingToDelete?.date}</span>?
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteBooking}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
