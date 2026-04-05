import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { CheckCircle, XCircle, Copy, Edit, Trash2, Lock, Users, Calendar, Building, UserCheck, Search, IndianRupee, AlertCircle, X, CalendarCheck, ArrowRight, Printer, FileDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

// Backend API configuration
const BACKEND_HOST = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.guestworker.app' 
    : `http://${window.location.hostname}:8000`);
const API = `${BACKEND_HOST}/api`;
axios.defaults.withCredentials = true;

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('employer');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateString, setDateString] = useState(formatDateToDDMMYYYY(new Date()));
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  
  // Simplified filter states
  const [workerStatusFilter, setWorkerStatusFilter] = useState('all');
  
  const [employers, setEmployers] = useState([]);
  const [workers, setWorkers] = useState([]);
  
  // Employer entry form
  const [employerForm, setEmployerForm] = useState({
    employer_id: '',
    workers_count: '',
    selected_workers: [],
    payment_per_worker: '',  // Will be set from preferences
    additional_charges: '',
    charge_description: '',
    extra_payment_per_worker: '',
    extra_payment_reason: '',
    remarks: ''
  });
  
  const [editingRecord, setEditingRecord] = useState(null);
  const [savedEmployerRecords, setSavedEmployerRecords] = useState([]);
  
  // Worker attendance
  const [workerAttendance, setWorkerAttendance] = useState({});
  const [savedWorkerRecords, setSavedWorkerRecords] = useState([]);
  
  // Dialogs
  const [showWorkerSelectDialog, setShowWorkerSelectDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyDialogData, setCopyDialogData] = useState(null);
  const [showDefaultWageDialog, setShowDefaultWageDialog] = useState(false);
  const [defaultWageInput, setDefaultWageInput] = useState('450');
  const [defaultEmployerRateInput, setDefaultEmployerRateInput] = useState('500');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  
  const [allocatedWorkerIds, setAllocatedWorkerIds] = useState(new Set());
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [availableWorkersCount, setAvailableWorkersCount] = useState(0);
  const [totalAssignedInEmployerMode, setTotalAssignedInEmployerMode] = useState(0);
  
  const [preferences, setPreferences] = useState({ default_worker_wage: 450.0, default_employer_rate: 500.0 });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const formatted = formatDateToDDMMYYYY(selectedDate);
    setDateString(formatted);
    if (workers.length > 0) {
      fetchSavedAttendance(formatted);
    }
  }, [selectedDate, workers]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailable();
      updateAllocatedWorkersSet();
      fetchBookings();
    }
  }, [selectedDate, savedEmployerRecords, editingRecord]);

  // Set default payment_per_worker when preferences are loaded
  useEffect(() => {
    if (preferences.default_employer_rate) {
      setEmployerForm(prev => ({
        ...prev,
        payment_per_worker: String(preferences.default_employer_rate)
      }));
    }
  }, [preferences.default_employer_rate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employersRes, workersRes, preferencesRes] = await Promise.all([
        api.getEmployers(),
        api.getWorkers(),
        api.getPreferences().catch(() => ({ data: { default_worker_wage: 450.0 } }))
      ]);
      const activeEmployers = employersRes.data.filter(e => e.status === 'Active');
      const activeWorkers = workersRes.data.filter(w => w.status === 'Active');
      
      setEmployers(activeEmployers);
      setWorkers(activeWorkers);
      const prefs = preferencesRes.data || { default_worker_wage: 450.0, default_employer_rate: 500.0 };
      setPreferences(prefs);
      setDefaultWageInput(String(prefs.default_worker_wage || 450));
      setDefaultEmployerRateInput(String(prefs.default_employer_rate || 500));
      
      // Set payment_per_worker to default employer rate
      setEmployerForm(prev => ({
        ...prev,
        payment_per_worker: String(prefs.default_employer_rate || 500)
      }));
      
      const formatted = formatDateToDDMMYYYY(selectedDate);
      if (activeWorkers.length > 0) {
        await fetchSavedAttendanceWithWorkers(formatted, activeWorkers);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const formatted = formatDateToDDMMYYYY(selectedDate);
      const response = await api.getBookings({ date: formatted });
      setBookings(response.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchAvailable = async () => {
    try {
      const formattedDate = formatDateToDDMMYYYY(selectedDate);
      const res = await axios.get(`${API}/attendance/available-workers`, {
        params: { date: formattedDate },
        withCredentials: true
      });
      setAvailableWorkers(res.data.available_workers || []);
      setAvailableWorkersCount(res.data.available_count || 0);
      setTotalAssignedInEmployerMode(res.data.total_assigned_in_employer_mode || 0);
    } catch (err) {
      console.error("Failed to load available workers:", err);
    }
  };

  const updateAllocatedWorkersSet = () => {
    const newSet = new Set();
    savedEmployerRecords.forEach(rec => {
      if (rec.selected_workers && Array.isArray(rec.selected_workers)) {
        if (editingRecord && editingRecord.id === rec.id) {
          return;
        }
        rec.selected_workers.forEach(wId => {
          newSet.add(String(wId));
        });
      }
    });
    setAllocatedWorkerIds(newSet);
  };

  const fetchSavedAttendanceWithWorkers = async (date, workersList) => {
    let workerStates = {};

    try {
      const response = await axios.get(`${API}/attendance/fetch`, { params: { date }, withCredentials: true });
      const records = response.data;

      const empRecords = records.filter(r => r.mode === 'employer');
      const workerRecords = records.filter(r => r.mode === 'worker');

      setSavedEmployerRecords(empRecords);
      setSavedWorkerRecords(workerRecords);

      // Initialize worker attendance state
      workersList.forEach(w => {
        workerStates[w.id] = { 
          status: 'Pending', 
          employer_id: '', 
          locked: false, 
          saved: false 
        };
      });

      // Apply saved worker-based attendance
      workerRecords.forEach(record => {
        if (workerStates[record.worker_id]) {
          workerStates[record.worker_id] = {
            status: record.status,
            employer_id: record.employer_id || '',
            locked: false,
            saved: true
          };
        }
      });

      // Apply employer-based attendance
      empRecords.forEach(empRec => {
        empRec.selected_workers?.forEach(wId => {
          if (workerStates[wId]) {
            workerStates[wId] = {
              status: 'Present',
              employer_id: empRec.employer_id,
              locked: true,
              saved: true,
              via_employer: true
            };
          }
        });
      });

      setWorkerAttendance(workerStates);
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    }
  };

  const fetchSavedAttendance = async (date) => {
    if (workers.length > 0) {
      await fetchSavedAttendanceWithWorkers(date, workers);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    resetForms();
  };

  const resetForms = () => {
    setEmployerForm({
      employer_id: '',
      workers_count: '',
      selected_workers: [],
      payment_per_worker: String(preferences.default_employer_rate || 500),
      additional_charges: '',
      charge_description: '',
      extra_payment_per_worker: '',
      extra_payment_reason: '',
      remarks: ''
    });
    setEditingRecord(null);
  };

  const handleEmployerFormChange = (field, value) => {
    setEmployerForm(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'workers_count') {
        const count = parseInt(value || 0);
        if (count > availableWorkersCount) {
          toast.error(`Only ${availableWorkersCount} workers available!`);
          return prev;
        }
        updated.selected_workers = [];
      }
      
      return updated;
    });
  };

  const handleWorkerSelection = (workerId) => {
    const count = parseInt(employerForm.workers_count || 0);
    const isPartOfEditRecord = editingRecord && 
                             editingRecord.selected_workers && 
                             editingRecord.selected_workers.includes(workerId);
  
    if (!isPartOfEditRecord && allocatedWorkerIds.has(String(workerId))) {
      toast.error('This worker is already assigned to another employer today');
      return;
    }
  
    setEmployerForm(prev => {
      const selected = prev.selected_workers.includes(workerId)
        ? prev.selected_workers.filter(id => id !== workerId)
        : prev.selected_workers.length < count
        ? [...prev.selected_workers, workerId]
        : prev.selected_workers;
      return { ...prev, selected_workers: selected };
    });
  };

  const getUnallocatedWorkers = () => {
    const result = workers.filter(w => {
      if (editingRecord && editingRecord.selected_workers && 
          editingRecord.selected_workers.includes(w.id)) {
        return true;
      }
      return !allocatedWorkerIds.has(String(w.id));
    });
    return result.sort((a, b) => a.name.localeCompare(b.name));
  };

  const getAvailableEmployers = () => {
    const assignedEmployerIds = new Set();
    savedEmployerRecords.forEach(rec => {
      assignedEmployerIds.add(rec.employer_id);
    });
    if (editingRecord) {
      assignedEmployerIds.delete(editingRecord.employer_id);
    }
    return employers.filter(e => !assignedEmployerIds.has(e.id)).sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleConvertBookingToAttendance = (booking) => {
    const employer = employers.find(e => e.id === booking.employer_id);
    if (!employer) {
      toast.error('Employer not found');
      return;
    }

    // Check if attendance already exists for this employer on this date
    const existingAttendance = savedEmployerRecords.find(
      r => r.employer_id === booking.employer_id
    );
    
    if (existingAttendance) {
      toast.error(`Attendance already exists for ${employer.name} on ${dateString}. Please edit the existing attendance instead.`);
      return;
    }

    // Pre-fill the form with booking data
    setEmployerForm({
      employer_id: booking.employer_id,
      workers_count: booking.workers_count.toString(),
      selected_workers: booking.selected_workers || [],
      payment_per_worker: preferences.default_worker_wage || 500,
      additional_charges: '',
      charge_description: '',
      extra_payment_per_worker: '',
      extra_payment_reason: '',
      remarks: `Converted from booking`
    });
    
    setEditingRecord(null);
    toast.success(`Booking for ${employer.name} loaded. Review and save attendance.`);
    
    // Scroll to the form section
    setTimeout(() => {
      const formElement = document.querySelector('[data-attendance-form]');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSaveEmployerAttendance = async () => {
    if (!employerForm.employer_id || !employerForm.workers_count) {
      toast.error('Please select an employer and enter worker count');
      return;
    }

    const count = parseInt(employerForm.workers_count);

    if (count > availableWorkersCount) {
      toast.error(`Cannot assign ${count} workers. Only ${availableWorkersCount} available.`);
      return;
    }

    if (employerForm.selected_workers.length > 0 &&
        employerForm.selected_workers.length !== count) {
      toast.error(`Please select exactly ${count} workers or leave unselected.`);
      return;
    }

    if ((!employerForm.selected_workers || employerForm.selected_workers.length === 0) && 
        (!employerForm.payment_per_worker || parseFloat(employerForm.payment_per_worker) <= 0)) {
      toast.error('Please enter Payment Per Worker amount');
      return;
    }

    try {
      if (editingRecord) {
        await axios.delete(`${API}/attendance/${editingRecord.id}`, { withCredentials: true });
      }

      await axios.post(
        `${API}/attendance/bulk`,
        {
          date: dateString,
          mode: 'employer',
          employer_entries: [{
            employer_id: employerForm.employer_id,
            workers_count: count,
            selected_workers: employerForm.selected_workers,
            payment_per_worker: parseFloat(employerForm.payment_per_worker),
            additional_charges: parseFloat(employerForm.additional_charges || 0),
            charge_description: employerForm.charge_description || '',
            extra_payment_per_worker: parseFloat(employerForm.extra_payment_per_worker || 0),
            extra_payment_reason: employerForm.extra_payment_reason || '',
            remarks: employerForm.remarks || '',
          }],
        },
        { withCredentials: true }
      );

      toast.success(editingRecord ? 'Attendance updated successfully!' : 'Attendance saved successfully!');
      resetForms();
      await fetchData();
      await fetchAvailable();
      await fetchBookings();
      updateAllocatedWorkersSet();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save attendance');
    }
  };

  const handleEditEmployerRecord = (record) => {
    setEditingRecord(record);
    const additionalCharges = record.additional_charges?.[0]?.amount || 0;
    const paymentPerWorker = record.selected_workers && record.selected_workers.length > 0
      ? Math.round((record.wage_amount - additionalCharges) / (record.workers_count || 1))
      : Math.round((record.wage_amount - additionalCharges) / (record.workers_count || 1));
    
    const extraPayment = record.extra_payment_per_worker || 0;
    const extraPaymentReason = record.extra_payment_reason || '';
    
    setEmployerForm({
      employer_id: record.employer_id,
      workers_count: record.workers_count || '',
      selected_workers: record.selected_workers || [],
      payment_per_worker: paymentPerWorker,
      additional_charges: additionalCharges.toString(),
      charge_description: record.additional_charges?.[0]?.description || '',
      extra_payment_per_worker: extraPayment.toString(),
      extra_payment_reason: extraPaymentReason,
      remarks: record.remarks || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEmployerRecord = async (recordId) => {
    const record = savedEmployerRecords.find(r => r.id === recordId);
    if (record) {
      setRecordToDelete(record);
      setDeleteConfirmOpen(true);
    }
  };
  
  const confirmDelete = async () => {
    if (!recordToDelete) return;
    
    try {
      await axios.delete(`${API}/attendance/${recordToDelete.id}`, { withCredentials: true });
      toast.success('Attendance record deleted successfully');
      setDeleteConfirmOpen(false);
      setRecordToDelete(null);
      await fetchData();
      await fetchAvailable();
      await fetchBookings();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || 'Cannot delete this record');
      } else {
        toast.error('Failed to delete attendance');
      }
    }
  };

  const handleWorkerStatusChange = (workerId, status) => {
    setWorkerAttendance(prev => {
      const current = prev[workerId] || {};
      if (current.locked) {
        toast.warning('Cannot change status for workers assigned via employer mode');
        return prev;
      }
      return {
        ...prev,
        [workerId]: { 
          status, 
          saved: false,
          locked: false,
          employer_id: status === 'Present' ? (current.employer_id || '') : ''
        }
      };
    });
  };

  const handleMarkAllPresent = () => {
    const unlockedWorkers = workers.filter(w => !workerAttendance[w.id]?.locked);
    const allMarkedPresent = unlockedWorkers.every(w => workerAttendance[w.id]?.status === 'Present' && !workerAttendance[w.id]?.saved);
    
    const updated = {};
    workers.forEach(w => {
      const current = workerAttendance[w.id];
      if (!current?.locked) {
        updated[w.id] = allMarkedPresent
          ? { status: 'Pending', employer_id: '', locked: false, saved: false }
          : { status: 'Present', employer_id: '', locked: false, saved: false };
      } else {
        updated[w.id] = current;
      }
    });
    setWorkerAttendance(updated);
  };

  const handleMarkAllAbsent = () => {
    const unlockedWorkers = workers.filter(w => !workerAttendance[w.id]?.locked);
    const allMarkedAbsent = unlockedWorkers.every(w => workerAttendance[w.id]?.status === 'Absent' && !workerAttendance[w.id]?.saved);
    
    const updated = {};
    workers.forEach(w => {
      const current = workerAttendance[w.id];
      if (!current?.locked) {
        updated[w.id] = allMarkedAbsent
          ? { status: 'Pending', employer_id: '', locked: false, saved: false }
          : { status: 'Absent', employer_id: '', locked: false, saved: false };
      } else {
        updated[w.id] = current;
      }
    });
    setWorkerAttendance(updated);
  };

  const handleWorkerEmployerChange = (workerId, employerId) => {
    setWorkerAttendance(prev => ({
      ...prev,
      [workerId]: { ...prev[workerId], employer_id: employerId }
    }));
  };

  const handleSaveWorkerAttendance = async () => {
    const entries = Object.entries(workerAttendance)
      .filter(([_, data]) => !data.saved && !data.locked && data.status !== 'Pending')
      .map(([workerId, data]) => ({
        worker_id: workerId,
        status: data.status,
        employer_id: data.employer_id || ''
      }));

    if (entries.length === 0) {
      toast.error('No new attendance to save');
      return;
    }

    try {
      await axios.post(`${API}/attendance/bulk`, {
        date: dateString,
        mode: 'worker',
        worker_entries: entries
      }, { withCredentials: true });

      toast.success(`Worker attendance saved for ${entries.length} worker(s)!`);
      await fetchData();
      await fetchAvailable();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save attendance');
    }
  };

  const handleDeleteWorkerRecord = async (workerId) => {
    const record = savedWorkerRecords.find(r => r.worker_id === workerId);
    if (!record) return;

    const state = workerAttendance[workerId];
    if (state?.locked) {
      toast.error('This worker was marked via Employer attendance. Edit from Employer tab.');
      return;
    }

    try {
      await axios.delete(`${API}/attendance/${record.id}`, { withCredentials: true });
      toast.success('Worker attendance deleted');
      await fetchData();
      await fetchAvailable();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleCopyOneDayBefore = async () => {
    const oneDayBefore = new Date(selectedDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    const oneDayBeforeString = formatDateToDDMMYYYY(oneDayBefore);

    try {
      const response = await axios.get(`${API}/attendance/fetch`, { 
        params: { date: oneDayBeforeString },
        withCredentials: true
      });
      const data = response.data;
      
      if (data.length === 0) {
        toast.info(`No attendance records found for ${oneDayBeforeString}`);
        return;
      }

      setCopyDialogData({
        fromDate: oneDayBeforeString,
        toDate: dateString,
        data: data
      });
      setShowCopyDialog(true);
    } catch (error) {
      toast.error('Failed to fetch previous attendance');
    }
  };

  const confirmCopy = async () => {
    if (!copyDialogData || !copyDialogData.data || copyDialogData.data.length === 0) {
      toast.info('No data to copy');
      setShowCopyDialog(false);
      return;
    }

    try {
      const employerEntries = copyDialogData.data
        .filter(r => r.mode === 'employer')
        .map(r => ({
          employer_id: r.employer_id,
          workers_count: r.workers_count || 0,
          selected_workers: r.selected_workers || [],
          payment_per_worker: r.wage_amount / (r.workers_count || 1),
          additional_charges: r.additional_charges?.[0]?.amount || 0,
          charge_description: r.additional_charges?.[0]?.description || ''
        }));

      const workerEntries = copyDialogData.data
        .filter(r => r.mode === 'worker')
        .map(r => ({
          worker_id: r.worker_id,
          status: r.status,
          employer_id: r.employer_id || ''
        }));

      if (employerEntries.length > 0) {
        await axios.post(`${API}/attendance/bulk`, {
          date: dateString,
          mode: 'employer',
          employer_entries: employerEntries
        }, { withCredentials: true });
      }

      if (workerEntries.length > 0) {
        await axios.post(`${API}/attendance/bulk`, {
          date: dateString,
          mode: 'worker',
          worker_entries: workerEntries
        }, { withCredentials: true });
      }

      toast.success(`Attendance copied from ${copyDialogData.fromDate} to ${copyDialogData.toDate}!`);
      setShowCopyDialog(false);
      await fetchData();
      await fetchAvailable();
    } catch (error) {
      toast.error('Failed to copy attendance');
    }
  };

  const handleSaveDefaultWage = async () => {
    try {
      const wageValue = parseFloat(defaultWageInput);
      const employerRateValue = parseFloat(defaultEmployerRateInput);
      
      if (isNaN(wageValue) || wageValue <= 0) {
        toast.error('Please enter a valid worker wage amount');
        return;
      }
      
      if (isNaN(employerRateValue) || employerRateValue <= 0) {
        toast.error('Please enter a valid employer rate amount');
        return;
      }
      
      await api.updatePreferences({ 
        default_worker_wage: wageValue,
        default_employer_rate: employerRateValue 
      });
      setPreferences(prev => ({ 
        ...prev, 
        default_worker_wage: wageValue,
        default_employer_rate: employerRateValue 
      }));
      setShowDefaultWageDialog(false);
      toast.success(`Default rates updated successfully!`);
    } catch (error) {
      toast.error('Failed to save default rates');
    }
  };

  const calculateTotalAmount = () => {
    const additionalCharges = parseFloat(employerForm.additional_charges || 0);
    const extraPaymentPerWorker = parseFloat(employerForm.extra_payment_per_worker || 0);
    const selectedWorkersCount = employerForm.selected_workers?.length || 0;
    const extraPaymentTotal = extraPaymentPerWorker * selectedWorkersCount;
    
    if (employerForm.payment_per_worker && parseFloat(employerForm.payment_per_worker) > 0) {
      const paymentPerWorker = parseFloat(employerForm.payment_per_worker);
      const workersCount = parseInt(employerForm.workers_count || 0);
      return (paymentPerWorker * workersCount) + additionalCharges + extraPaymentTotal;
    }
    
    if (employerForm.selected_workers && employerForm.selected_workers.length > 0) {
      const selectedWorkersData = workers.filter(w => employerForm.selected_workers.includes(w.id));
      const totalFromWorkerRates = selectedWorkersData.reduce((sum, worker) => {
        return sum + (worker.wage_from_employer || 500);
      }, 0);
      return totalFromWorkerRates + additionalCharges + extraPaymentTotal;
    }
    
    if (parseInt(employerForm.workers_count || 0) === workers.length && workers.length > 0) {
      const totalFromAllWorkers = workers.reduce((sum, worker) => {
        return sum + (worker.wage_from_employer || 500);
      }, 0);
      return totalFromAllWorkers + additionalCharges + extraPaymentTotal;
    }
    
    return (parseInt(employerForm.workers_count || 0) * parseFloat(employerForm.payment_per_worker || 0)) + additionalCharges + extraPaymentTotal;
  };

  const calculateExpectedCommission = () => {
    if (employerForm.payment_per_worker && parseFloat(employerForm.payment_per_worker) > 0) {
      const paymentPerWorker = parseFloat(employerForm.payment_per_worker);
      const workersCount = parseInt(employerForm.workers_count || 0);
      const totalAmountFromEmployer = paymentPerWorker * workersCount;
      
      if (employerForm.selected_workers && employerForm.selected_workers.length > 0) {
        const selectedWorkersData = workers.filter(w => employerForm.selected_workers.includes(w.id));
        const totalWagePaid = selectedWorkersData.reduce((sum, worker) => sum + (worker.wage_per_day || 0), 0);
        return totalAmountFromEmployer - totalWagePaid;
      } else if (workersCount === workers.length && workers.length > 0) {
        const totalWagePaid = workers.reduce((sum, worker) => sum + (worker.wage_per_day || 0), 0);
        return totalAmountFromEmployer - totalWagePaid;
      } else if (workersCount > 0) {
        const defaultWage = preferences.default_worker_wage || 450;
        const estimatedTotalWage = defaultWage * workersCount;
        return totalAmountFromEmployer - estimatedTotalWage;
      }
    }
    
    if (employerForm.selected_workers && employerForm.selected_workers.length > 0) {
      const selectedWorkersData = workers.filter(w => employerForm.selected_workers.includes(w.id));
      return selectedWorkersData.reduce((sum, worker) => {
        return sum + ((worker.wage_from_employer || 500) - (worker.wage_per_day || 0));
      }, 0);
    }
    
    if (parseInt(employerForm.workers_count || 0) === workers.length && workers.length > 0) {
      return workers.reduce((sum, worker) => {
        return sum + ((worker.wage_from_employer || 500) - (worker.wage_per_day || 0));
      }, 0);
    }
    
    return 0;
  };

  const getUnmarkedWorkers = () => {
    const filtered = workers.filter(w => {
      const state = workerAttendance[w.id];
      if (state?.locked) return false;
      return !state || state.status === 'Pending';
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    if (workerSearchTerm.trim()) {
      return filtered.filter(w => w.name.toLowerCase().includes(workerSearchTerm.toLowerCase()));
    }
    return filtered;
  };

  const getMarkedWorkers = () => {
    const filtered = workers.filter(w => {
      const state = workerAttendance[w.id];
      if (!state || (state.status === 'Pending' && !state.locked)) return false;
      
      if (workerStatusFilter !== 'all') {
        if (workerStatusFilter === 'present' && state.status !== 'Present') return false;
        if (workerStatusFilter === 'absent' && state.status !== 'Absent') return false;
      }
      
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    if (workerSearchTerm) {
      return filtered.filter(w => w.name.toLowerCase().includes(workerSearchTerm.toLowerCase()));
    }
    return filtered;
  };

  const getPendingToSaveCount = () => {
    return Object.values(workerAttendance).filter(
      w => !w.saved && !w.locked && w.status !== 'Pending'
    ).length;
  };

  const getEmployerName = (employerId) => {
    const employer = employers.find(e => e.id === employerId);
    return employer?.name || 'Unknown';
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || 'Unknown';
  };

  const escapeCsv = (val) => {
    const s = String(val ?? '');
    if (/[,\n"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const escapeHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const handlePrint = () => {
    const employerRows = savedEmployerRecords
      .sort((a, b) => (getEmployerName(a.employer_id) || '').localeCompare(getEmployerName(b.employer_id) || ''))
      .map((r) => {
        const emp = getEmployerName(r.employer_id);
        const names = (r.selected_workers || []).map((id) => getWorkerName(id)).filter(Boolean).join(', ') || '—';
        const extra = [r.extra_payment_per_worker > 0 && `₹${r.extra_payment_per_worker}/worker`, r.additional_charges?.[0]?.amount > 0 && `₹${r.additional_charges[0].amount}`].filter(Boolean).join('; ') || '—';
        return { emp, count: r.workers_count || 0, names, total: r.wage_amount || 0, extra, remarks: r.remarks || '—' };
      });

    const workerRows = workers
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((w) => {
        const s = workerAttendance[w.id];
        const status = s?.status || 'Pending';
        const emp = s?.employer_id ? getEmployerName(s.employer_id) : '—';
        return { name: w.name, status, employer: emp };
      });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Attendance - ${dateString}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 1.5rem; margin: 0 0 8px 0; }
    .date { color: #666; margin-bottom: 24px; }
    section { margin-bottom: 28px; }
    h2 { font-size: 1.1rem; margin: 0 0 12px 0; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; font-weight: 600; }
    .summary { background: #f9fafb; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
    .print-footer { margin-top: 24px; font-size: 12px; color: #6b7280; }
    @media print { body { padding: 16px; } .print-footer { margin-top: 10px; page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>Attendance</h1>
  <p class="date">Date: ${dateString}</p>
  <div class="summary">
    Employer records: ${employerRows.length} &nbsp;|&nbsp;
    Workers present: ${workerRows.filter((r) => r.status === 'Present').length} &nbsp;|&nbsp;
    Workers absent: ${workerRows.filter((r) => r.status === 'Absent').length} &nbsp;|&nbsp;
    Pending: ${workerRows.filter((r) => r.status === 'Pending').length}
  </div>
  <section>
    <h2>Employer-based</h2>
    <table>
      <thead><tr><th>Employer</th><th>Workers</th><th>Names</th><th>Total (₹)</th><th>Extra / Charges</th><th>Remarks</th></tr></thead>
      <tbody>
        ${employerRows.length ? employerRows.map((r) => `<tr><td>${escapeHtml(r.emp)}</td><td>${r.count}</td><td>${escapeHtml(r.names)}</td><td>₹${Number(r.total).toLocaleString()}</td><td>${escapeHtml(r.extra)}</td><td>${escapeHtml(r.remarks)}</td></tr>`).join('') : '<tr><td colspan="6">No employer records</td></tr>'}
      </tbody>
    </table>
  </section>
  <section>
    <h2>Worker-wise</h2>
    <table>
      <thead><tr><th>Worker</th><th>Status</th><th>Employer</th></tr></thead>
      <tbody>
        ${workerRows.map((r) => `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.status)}</td><td>${escapeHtml(r.employer)}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>
  <p class="print-footer"><strong style="color:#3B2ED0;">GuestWorker</strong> · guestworker.in · ${dateString}</p>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (!win) { toast.error('Please allow pop-ups to print.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const handleExportCSV = () => {
    const lines = [
      'GuestWorker · guestworker.in',
      'Attendance Report',
      `Date,${dateString}`,
      `Generated,${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      '',
      'Employer-based',
      ['Employer', 'Workers', 'Worker Names', 'Total (₹)', 'Extra/Charges', 'Remarks'].map(escapeCsv).join(','),
      ...savedEmployerRecords
        .sort((a, b) => (getEmployerName(a.employer_id) || '').localeCompare(getEmployerName(b.employer_id) || ''))
        .map((r) => {
          const names = (r.selected_workers || []).map((id) => getWorkerName(id)).filter(Boolean).join('; ') || '';
          const extra = [r.extra_payment_per_worker > 0 && `₹${r.extra_payment_per_worker}/worker`, r.additional_charges?.[0]?.amount > 0 && `₹${r.additional_charges[0].amount}`].filter(Boolean).join('; ') || '';
          return [getEmployerName(r.employer_id), r.workers_count || 0, names, r.wage_amount || 0, extra, r.remarks || ''].map(escapeCsv).join(',');
        }),
      '',
      'Worker-wise',
      ['Worker', 'Status', 'Employer'].map(escapeCsv).join(','),
      ...workers
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((w) => {
          const s = workerAttendance[w.id];
          const status = s?.status || 'Pending';
          const emp = s?.employer_id ? getEmployerName(s.employer_id) : '';
          return [w.name, status, emp].map(escapeCsv).join(',');
        }),
    ];
    const csv = lines.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `attendance-${dateString.replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Attendance exported to CSV');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-white rounded-xl"></div>
            <div className="h-96 bg-white rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const isToday = dateString === formatDateToDDMMYYYY(new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Attendance
          </h1>
          <p className="text-gray-600">Mark and track worker attendance</p>
        </div>

        {/* Date Selection & Quick Stats */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Select Date</Label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="dd-MM-yyyy"
                    maxDate={new Date()}
                    className="text-xl font-bold text-gray-900 border-0 p-0 focus:ring-0 cursor-pointer bg-transparent hover:text-[#3B2ED0] transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 min-w-[120px]">
                  <p className="text-xs font-medium text-green-700 mb-0.5">Available Workers</p>
                  <p className="text-2xl font-bold text-green-600">{availableWorkersCount}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 min-w-[120px]">
                  <p className="text-xs font-medium text-blue-700 mb-0.5">Assigned Today</p>
                  <p className="text-2xl font-bold text-blue-600">{totalAssignedInEmployerMode}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDefaultWageDialog(true)}
                    size="sm"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <IndianRupee className="h-4 w-4 mr-2" />
                    Set Default Wages
                  </Button>
                  {!isToday && (
                    <Button
                      variant="outline"
                      onClick={handleCopyOneDayBefore}
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Previous Day
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    size="sm"
                    className="border-[#3B2ED0]/50 text-[#3B2ED0] hover:bg-[#3B2ED0]/10"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportCSV}
                    size="sm"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs - More Visible */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="border-2 border-[#3B2ED0]/30 shadow-lg bg-gradient-to-r from-[#3B2ED0]/10 to-[#F8FAFF] sticky top-4 z-10">
            <CardContent className="p-4">
              <div className="text-center mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-1">Choose Attendance Method</p>
                <p className="text-xs text-gray-600">Select how you want to mark attendance for today</p>
              </div>
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-2 border-[#3B2ED0]/30 shadow-md h-auto p-1">
                <TabsTrigger 
                  value="employer"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3B2ED0] data-[state=active]:to-[#2A1FB8] data-[state=active]:text-white data-[state=active]:shadow-lg py-4 px-6 transition-all rounded-lg font-semibold text-sm flex flex-col items-center gap-2 hover:bg-[#3B2ED0]/10"
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    <span>Employer-Based</span>
                  </div>
                  <span className="text-xs font-normal opacity-80">Assign workers to employers</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="worker"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg py-4 px-6 transition-all rounded-lg font-semibold text-sm flex flex-col items-center gap-2 hover:bg-blue-100"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Worker-Based</span>
                  </div>
                  <span className="text-xs font-normal opacity-80">Mark individual workers</span>
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* EMPLOYER TAB */}
          <TabsContent value="employer" className="space-y-6">
            {/* Bookings Section - Convert to Attendance */}
            {bookings.length > 0 && (
              <Card className="border-2 border-[#3B2ED0]/30 shadow-sm bg-gradient-to-br from-[#3B2ED0]/10 to-[#4F46E5]/10">
                <CardHeader className="border-b border-[#3B2ED0]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[#3B2ED0] rounded-lg flex items-center justify-center">
                        <CalendarCheck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">
                          Bookings for {dateString}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Convert bookings to attendance with one click
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm font-medium border-[#3B2ED0]/50 text-[#3B2ED0] bg-white">
                      {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {bookings.map((booking) => {
                      const employer = employers.find(e => e.id === booking.employer_id);
                      const hasAttendance = savedEmployerRecords.some(
                        r => r.employer_id === booking.employer_id
                      );
                      const selectedWorkersList = booking.selected_workers && booking.selected_workers.length > 0
                        ? workers.filter(w => booking.selected_workers.includes(w.id))
                        : [];
                      
                      return (
                        <Card 
                          key={booking.id} 
                          className={`border-2 ${
                            hasAttendance 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-[#3B2ED0]/30 bg-white hover:shadow-md'
                          } transition-all`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                    hasAttendance 
                                      ? 'bg-green-500' 
                                      : 'bg-[#3B2ED0]/10'
                                  }`}>
                                    <Building className={`h-5 w-5 ${
                                      hasAttendance ? 'text-white' : 'text-[#3B2ED0]'
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 text-base">
                                      {employer?.name || 'Unknown Employer'}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs font-medium">
                                        {booking.workers_count} worker{booking.workers_count !== 1 ? 's' : ''}
                                      </Badge>
                                      {hasAttendance && (
                                        <Badge className="text-xs bg-green-600 text-white">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Attendance Saved
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {selectedWorkersList.length > 0 && (
                                  <div className="ml-13 mt-2 pt-2 border-t border-gray-200">
                                    <p className="text-xs font-medium text-gray-600 mb-1.5">Selected Workers:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {selectedWorkersList.map((worker) => (
                                        <Badge key={worker.id} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                          {worker.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {!hasAttendance && (
                                <Button
                                  onClick={() => handleConvertBookingToAttendance(booking)}
                                  className="bg-[#3B2ED0] hover:bg-[#2A1FB8] text-white shadow-sm hover:shadow-md transition-all"
                                  size="sm"
                                >
                                  <ArrowRight className="h-4 w-4 mr-1.5" />
                                  Convert to Attendance
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Employer Attendance Form */}
            <Card className="border border-gray-200 shadow-sm bg-white" data-attendance-form>
              <CardHeader className="bg-gradient-to-r from-[#3B2ED0]/10 to-[#F8FAFF] border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#3B2ED0] rounded-lg flex items-center justify-center">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {editingRecord ? '✏️ Edit Attendance Record' : '➕ Record New Attendance'}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {editingRecord ? 'Update attendance details below' : 'Fill in the details to assign workers to an employer'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Step 1: Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 bg-[#3B2ED0] text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <h3 className="text-base font-semibold text-gray-800">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        Employer <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={employerForm.employer_id}
                        onValueChange={(val) => handleEmployerFormChange('employer_id', val)}
                      >
                        <SelectTrigger className="h-11 border-gray-300 focus:border-[#3B2ED0] focus:ring-[#3B2ED0]">
                          <SelectValue placeholder="Choose an employer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableEmployers().map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                          {getAvailableEmployers().length === 0 && (
                            <div className="p-3 text-sm text-gray-500 text-center">
                              All employers already recorded for this date
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        Number of Workers <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={employerForm.workers_count}
                        onChange={(e) => handleEmployerFormChange('workers_count', e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        placeholder="Enter number of workers"
                        className="h-11 border-gray-300 focus:border-[#3B2ED0] focus:ring-[#3B2ED0]"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                        <p className="text-xs text-gray-600">{availableWorkersCount} workers available</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Worker Selection */}
                {employerForm.workers_count && parseInt(employerForm.workers_count) > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 bg-[#3B2ED0] text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <h3 className="text-base font-semibold text-gray-800">Worker Selection</h3>
                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-white ml-auto">
                        Optional
                      </Badge>
                    </div>
                    <div className="bg-gradient-to-br from-[#F8FAFF] to-[#F8FAFF] border-2 border-blue-200 rounded-xl p-5 space-y-4">
                      {employerForm.selected_workers.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Workers Selected</p>
                                <p className="text-xs text-gray-600">Using individual worker rates for accurate commission</p>
                              </div>
                            </div>
                            <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                              {employerForm.selected_workers.length} selected
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowWorkerSelectDialog(true)}
                              size="sm"
                              className="flex-1 border-blue-400 text-blue-700 hover:bg-blue-100 font-medium"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Selection
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                handleEmployerFormChange('selected_workers', []);
                                toast.info('Worker selection cleared. Using default rate.');
                              }}
                              size="sm"
                              className="border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Clear
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <p className="text-sm font-semibold text-gray-900">Select Specific Workers</p>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Select specific workers to use their individual rates, or skip to use the default rate for all {employerForm.workers_count} worker{parseInt(employerForm.workers_count) !== 1 ? 's' : ''}.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={() => setShowWorkerSelectDialog(true)}
                              size="sm"
                              className="flex-1 bg-[#3B2ED0] hover:bg-[#2A1FB8] text-white font-medium shadow-sm"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Select Workers
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                handleEmployerFormChange('selected_workers', []);
                                toast.success('Skipped. Using default rate for all workers.');
                              }}
                              size="sm"
                              className="border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Skip
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Details */}
                {parseInt(employerForm.workers_count || 0) > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 bg-[#3B2ED0] text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <h3 className="text-base font-semibold text-gray-800">Payment Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(!employerForm.selected_workers || employerForm.selected_workers.length === 0) && (
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            Payment Per Worker (₹) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            value={employerForm.payment_per_worker}
                            onChange={(e) => handleEmployerFormChange('payment_per_worker', e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            placeholder={String(preferences.default_employer_rate || 500)}
                            className="h-11 border-gray-300 focus:border-[#3B2ED0] focus:ring-[#3B2ED0]"
                          />
                          <p className="text-xs text-gray-500 mt-1.5">Amount employer will pay per worker (Default: ₹{preferences.default_employer_rate || 500})</p>
                        </div>
                      )}

                      {/* Extra Payment Per Worker - Only shown when workers are selected */}
                      {employerForm.selected_workers && employerForm.selected_workers.length > 0 && (
                        <>
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-2">
                              Extra Payment Per Worker (₹) 
                              <span className="text-xs text-gray-500 font-normal ml-1">(Optional)</span>
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={employerForm.extra_payment_per_worker}
                              onChange={(e) => handleEmployerFormChange('extra_payment_per_worker', e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              placeholder="0"
                              className="h-11 border-gray-300 focus:border-[#3B2ED0] focus:ring-[#3B2ED0]"
                            />
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                              <p className="text-xs text-blue-800 font-medium">
                                Each worker gets: ₹{parseFloat(employerForm.extra_payment_per_worker || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-blue-700 mt-0.5">
                                Employer pays total: ₹{(parseFloat(employerForm.extra_payment_per_worker || 0) * employerForm.selected_workers.length).toLocaleString()} ({employerForm.selected_workers.length} workers)
                              </p>
                            </div>
                          </div>

                          {parseFloat(employerForm.extra_payment_per_worker || 0) > 0 && (
                            <div>
                              <Label className="text-sm font-semibold text-gray-700 mb-2">Reason for Extra Payment</Label>
                              <Input
                                value={employerForm.extra_payment_reason}
                                onChange={(e) => handleEmployerFormChange('extra_payment_reason', e.target.value)}
                                placeholder="e.g., Hard work, Overtime, Special task"
                                className="h-11 border-gray-300 focus:border-[#3B2ED0] focus:ring-[#3B2ED0]"
                              />
                            </div>
                          )}
                        </>
                      )}

                      <div>
                        <Label className="text-sm font-semibold text-gray-700 mb-2">Additional Charges (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={employerForm.additional_charges}
                          onChange={(e) => handleEmployerFormChange('additional_charges', e.target.value)}
                          onWheel={(e) => e.target.blur()}
                          placeholder="0"
                          className="h-11 border-gray-300 focus:border-[#3B2ED0] focus:ring-[#3B2ED0]"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">Extra charges like transport, materials, etc.</p>
                      </div>

                      {parseFloat(employerForm.additional_charges || 0) > 0 && (
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-2">Reason for Additional Charges</Label>
                          <Input
                            value={employerForm.charge_description}
                            onChange={(e) => handleEmployerFormChange('charge_description', e.target.value)}
                            placeholder="e.g., Transport, Materials"
                            className="h-11 border-gray-300 focus:border-[#3B2ED0] focus:ring-[#3B2ED0]"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <Label className="text-sm font-semibold text-gray-700 mb-2">Remarks (Optional)</Label>
                        <Textarea
                          value={employerForm.remarks}
                          onChange={(e) => handleEmployerFormChange('remarks', e.target.value)}
                          placeholder="Any additional notes or comments..."
                          rows={3}
                          className="border-gray-300 focus:border-[#3B2ED0] focus:ring-[#3B2ED0]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary */}
                {employerForm.employer_id && employerForm.workers_count && (
                  <div className="bg-gradient-to-br from-[#3B2ED0]/10 via-[#F8FAFF] to-[#3B2ED0]/10 border-2 border-[#3B2ED0]/30 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 bg-[#3B2ED0] rounded-lg flex items-center justify-center">
                        <IndianRupee className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Payment Summary</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-[#3B2ED0]/30">
                        <span className="text-sm font-semibold text-gray-700">Total Amount to Collect</span>
                        <span className="text-3xl font-bold text-[#3B2ED0]">₹{calculateTotalAmount().toLocaleString()}</span>
                      </div>
                      {employerForm.selected_workers && employerForm.selected_workers.length > 0 && parseFloat(employerForm.extra_payment_per_worker || 0) > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-medium text-blue-900">Extra Payment to Workers</span>
                              {employerForm.extra_payment_reason && (
                                <p className="text-xs text-blue-700 italic mt-0.5">({employerForm.extra_payment_reason})</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-blue-600">
                                ₹{parseFloat(employerForm.extra_payment_per_worker || 0).toLocaleString()}/worker
                              </span>
                              <p className="text-xs text-blue-700">
                                Total: ₹{(parseFloat(employerForm.extra_payment_per_worker || 0) * employerForm.selected_workers.length).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {calculateExpectedCommission() > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-green-900">Expected Commission</span>
                            <span className="text-xl font-bold text-green-600">₹{calculateExpectedCommission().toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {editingRecord && (
                    <Button
                      onClick={resetForms}
                      variant="outline"
                      className="flex-1 h-11 border-gray-300 hover:bg-gray-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveEmployerAttendance}
                    className="flex-1 h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-md"
                    disabled={!employerForm.employer_id || !employerForm.workers_count}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {editingRecord ? 'Update Attendance' : 'Save Attendance'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Employer Records */}
            {savedEmployerRecords.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Saved Records</h3>
                      <p className="text-sm text-gray-600">{savedEmployerRecords.length} attendance record{savedEmployerRecords.length !== 1 ? 's' : ''} saved</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedEmployerRecords
                    .sort((a, b) => {
                      const empA = employers.find(e => e.id === a.employer_id);
                      const empB = employers.find(e => e.id === b.employer_id);
                      return (empA?.name || '').localeCompare(empB?.name || '');
                    })
                    .map((record) => {
                      const employer = employers.find(e => e.id === record.employer_id);
                      const selectedWorkersData = record.selected_workers?.map(wId => 
                        workers.find(w => w.id === wId)
                      ).filter(Boolean) || [];
                      const additionalCharges = record.additional_charges?.[0]?.amount || 0;
                      const chargeDescription = record.additional_charges?.[0]?.description || '';
                      const extraPayment = record.extra_payment_per_worker || 0;
                      const extraPaymentReason = record.extra_payment_reason || '';
                      
                      return (
                        <Card key={record.id} className="border border-gray-200 shadow-sm hover:shadow-lg transition-all bg-white">
                          <CardHeader className="bg-gradient-to-r from-[#3B2ED0]/10 to-[#F8FAFF] border-b border-gray-200 pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-[#3B2ED0] rounded-lg flex items-center justify-center">
                                  <Building className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-base">{employer?.name || 'Unknown'}</h4>
                                  <Badge variant="outline" className="text-xs mt-1 border-[#3B2ED0]/50 text-[#3B2ED0]">
                                    {record.workers_count} worker{record.workers_count !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteEmployerRecord(record.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                              <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                              <span className="text-2xl font-bold text-green-600">₹{record.wage_amount.toLocaleString()}</span>
                            </div>
                            {selectedWorkersData.length > 0 && (
                              <div className="text-xs text-gray-600 pt-2 border-t">
                                <span className="font-medium">Workers: </span>
                                {selectedWorkersData.map(w => w.name).join(', ')}
                              </div>
                            )}
                            {extraPayment > 0 && selectedWorkersData.length > 0 && (
                              <div className="text-xs text-blue-600 bg-blue-50 rounded p-2">
                                <span className="font-medium">Extra Payment: </span>
                                ₹{extraPayment.toLocaleString()}/worker 
                                <span className="text-gray-600"> (Total: ₹{(extraPayment * selectedWorkersData.length).toLocaleString()})</span>
                                {extraPaymentReason && (
                                  <div className="text-gray-500 italic mt-1">Reason: {extraPaymentReason}</div>
                                )}
                              </div>
                            )}
                            {additionalCharges > 0 && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Extra: </span>
                                ₹{additionalCharges} {chargeDescription && `(${chargeDescription})`}
                              </div>
                            )}
                            {record.remarks && (
                              <div className="text-xs text-gray-600 italic pt-1 border-t">
                                {record.remarks}
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEmployerRecord(record)}
                              className="w-full mt-2"
                            >
                              <Edit className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* WORKER TAB */}
          <TabsContent value="worker" className="space-y-6">
            {/* Search and Filter */}
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-[#F8FAFF] to-[#F8FAFF] border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Mark Individual Workers</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Mark attendance for each worker individually</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search workers by name..."
                      value={workerSearchTerm}
                      onChange={(e) => setWorkerSearchTerm(e.target.value)}
                      className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <Select value={workerStatusFilter} onValueChange={setWorkerStatusFilter}>
                    <SelectTrigger className="w-full md:w-48 h-11 border-gray-300 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Workers</SelectItem>
                      <SelectItem value="present">Present Only</SelectItem>
                      <SelectItem value="absent">Absent Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleMarkAllPresent}
                      size="sm"
                      variant="outline"
                      className="h-11 border-green-300 text-green-700 hover:bg-green-50 font-medium"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark All Present
                    </Button>
                    <Button
                      onClick={handleMarkAllAbsent}
                      size="sm"
                      variant="outline"
                      className="h-11 border-red-300 text-red-700 hover:bg-red-50 font-medium"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Mark All Absent
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unmarked Workers */}
            {getUnmarkedWorkers().length > 0 && workerStatusFilter === 'all' && (
              <Card className="border-2 border-orange-300 shadow-md bg-white">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">Pending Marking</CardTitle>
                      <p className="text-sm text-gray-600">{getUnmarkedWorkers().length} worker{getUnmarkedWorkers().length !== 1 ? 's' : ''} need attendance marking</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getUnmarkedWorkers().map(worker => {
                      const state = workerAttendance[worker.id] || { status: 'Pending' };
                      return (
                        <Card key={worker.id} className="border border-gray-200 hover:border-[#3B2ED0]/50 hover:shadow-md transition-all bg-white">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 text-base">{worker.name}</h3>
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 font-medium">
                                Pending
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => handleWorkerStatusChange(worker.id, 'Present')}
                                className={`h-10 text-sm font-medium transition-all ${
                                  state.status === 'Present'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 hover:bg-green-50 text-gray-700 border border-gray-300'
                                }`}
                              >
                                <CheckCircle className="mr-1.5 h-4 w-4" />
                                Present
                              </Button>
                              <Button
                                onClick={() => handleWorkerStatusChange(worker.id, 'Absent')}
                                className={`h-10 text-sm font-medium transition-all ${
                                  state.status === 'Absent'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-gray-100 hover:bg-red-50 text-gray-700 border border-gray-300'
                                }`}
                              >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Absent
                              </Button>
                            </div>
                            {state.status === 'Present' && (
                              <div className="pt-3 border-t border-gray-200">
                                <Label className="text-xs font-semibold text-gray-700 mb-2 block">Assign Employer (Optional)</Label>
                                <Select
                                  value={state.employer_id || ''}
                                  onValueChange={(val) => handleWorkerEmployerChange(worker.id, val)}
                                >
                                  <SelectTrigger className="h-9 text-sm border-gray-300">
                                    <SelectValue placeholder="Select employer..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {employers.sort((a, b) => a.name.localeCompare(b.name)).map(emp => (
                                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            {getPendingToSaveCount() > 0 && (
              <div className="sticky bottom-4 z-20">
                <Card className="border-2 border-green-500 shadow-xl bg-white">
                  <CardContent className="p-4">
                    <Button
                      onClick={handleSaveWorkerAttendance}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Save Attendance for {getPendingToSaveCount()} Worker{getPendingToSaveCount() !== 1 ? 's' : ''}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Marked Workers */}
            {getMarkedWorkers().length > 0 && (
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">Recorded Attendance</CardTitle>
                      <p className="text-sm text-gray-600">{getMarkedWorkers().length} worker{getMarkedWorkers().length !== 1 ? 's' : ''} marked</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 border-green-300">
                      {getMarkedWorkers().length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {getMarkedWorkers().map(worker => {
                    const state = workerAttendance[worker.id];
                    if (!state) return null;
                    
                    return (
                      <Card 
                        key={worker.id} 
                        className={`p-4 border-l-4 shadow-sm transition-all hover:shadow-md ${
                          state.status === 'Present' 
                            ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50' 
                            : 'border-l-red-500 bg-gradient-to-r from-red-50 to-rose-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-bold text-gray-900 text-base">{worker.name}</p>
                              <Badge className={`${state.status === 'Present' ? 'bg-green-600' : 'bg-red-600'} text-white font-medium`}>
                                {state.status === 'Present' ? (
                                  <span className="flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5" /> Present
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    <XCircle className="h-3.5 w-3.5" /> Absent
                                  </span>
                                )}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                              {state.employer_id && (
                                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                                  <Building className="h-3.5 w-3.5 text-[#3B2ED0]" />
                                  <span className="text-xs font-medium text-gray-700">{getEmployerName(state.employer_id)}</span>
                                </div>
                              )}
                              {state.locked && (
                                <Badge variant="secondary" className="flex items-center gap-1.5 text-xs bg-[#3B2ED0]/10 text-[#3B2ED0] border-[#3B2ED0]/50">
                                  <Lock className="h-3.5 w-3.5" />
                                  Via Employer
                                </Badge>
                              )}
                            </div>
                          </div>
                          {!state.locked && state.saved && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteWorkerRecord(worker.id)}
                              className="text-red-600 hover:bg-red-50 rounded-lg h-9 w-9 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Worker Selection Dialog */}
        <Dialog open={showWorkerSelectDialog} onOpenChange={setShowWorkerSelectDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 border-gray-200/80 shadow-2xl">
            <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-[#3B2ED0]/10 via-white to-[#4F46E5]/5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#3B2ED0]/25 flex-shrink-0">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">Select Workers</DialogTitle>
                  <DialogDescription className="mt-1 text-gray-600">{employerForm.selected_workers.length} of {employerForm.workers_count || 0} selected. Pick workers for this employer.</DialogDescription>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <Input
                placeholder="Search workers by name..."
                className="border-gray-300"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const items = document.querySelectorAll('.worker-checkbox-item');
                  items.forEach(item => {
                    const text = item.textContent?.toLowerCase() || '';
                    item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
                  });
                }}
              />
              <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {getUnallocatedWorkers().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No available workers</p>
                    </div>
                  ) : (
                    getUnallocatedWorkers().map(worker => {
                      const isSelected = employerForm.selected_workers.includes(worker.id);
                      const isDisabled = !isSelected && employerForm.selected_workers.length >= parseInt(employerForm.workers_count || 0);

                      return (
                        <div
                          key={worker.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all worker-checkbox-item ${
                            isSelected
                              ? 'border-[#3B2ED0]/60 bg-[#3B2ED0]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => !isDisabled && handleWorkerSelection(worker.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => !isDisabled && handleWorkerSelection(worker.id)}
                            disabled={isDisabled}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{worker.name}</p>
                            <p className="text-xs text-gray-500">₹{worker.wage_from_employer || 500}/day from employer</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
              <Button variant="outline" onClick={() => setShowWorkerSelectDialog(false)} className="rounded-xl h-11 px-5 border-gray-300">Done</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Copy Dialog */}
        <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
          <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
            <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
                  <Copy className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">Copy Attendance</DialogTitle>
                  <DialogDescription className="mt-1 text-gray-600">Copy all attendance records from the previous day to today.</DialogDescription>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-900 mb-1">From Date:</p>
                <p className="text-base font-bold text-blue-600">{copyDialogData?.fromDate}</p>
              </div>
              <div className="text-center"><div className="text-2xl text-gray-400">↓</div></div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-900 mb-1">To Date:</p>
                <p className="text-base font-bold text-green-600">{copyDialogData?.toDate}</p>
              </div>
              <p className="text-xs text-gray-600 text-center bg-gray-50 p-3 rounded-xl">This will copy all attendance records from the previous day.</p>
            </div>
            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCopyDialog(false)} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
              <Button onClick={confirmCopy} className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg shadow-amber-500/25 rounded-xl h-11 px-6 font-semibold"><Copy className="h-4 w-4 mr-2" /> Copy & Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Default Rates Dialog */}
        <Dialog open={showDefaultWageDialog} onOpenChange={setShowDefaultWageDialog}>
          <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
            <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-[#3B2ED0]/10 via-white to-[#4F46E5]/5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#3B2ED0]/25 flex-shrink-0">
                  <IndianRupee className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">Set Default Rates</DialogTitle>
                  <DialogDescription className="mt-1 text-gray-600">Configure default wage rates for workers and employers</DialogDescription>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Default Wage to Workers */}
              <div className="space-y-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <Label className="text-sm font-bold text-blue-900">Default Wage to Workers (₹/day)</Label>
                </div>
                <Input 
                  type="number" 
                  value={defaultWageInput} 
                  onChange={(e) => setDefaultWageInput(e.target.value)} 
                  onWheel={(e) => e.target.blur()} 
                  className="h-11 rounded-xl border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-semibold bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  placeholder="450" 
                  min="0" 
                  step="10" 
                />
                <p className="text-xs text-blue-700 font-medium">Amount you pay to each worker per day</p>
                {preferences.default_worker_wage && <p className="text-xs text-blue-600 font-medium">Current: ₹{preferences.default_worker_wage}/day</p>}
              </div>

              {/* Default Rate from Employers */}
              <div className="space-y-2 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Building className="h-4 w-4 text-white" />
                  </div>
                  <Label className="text-sm font-bold text-green-900">Default Rate from Employers (₹/day)</Label>
                </div>
                <Input 
                  type="number" 
                  value={defaultEmployerRateInput} 
                  onChange={(e) => setDefaultEmployerRateInput(e.target.value)} 
                  onWheel={(e) => e.target.blur()} 
                  className="h-11 rounded-xl border-green-300 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-lg font-semibold bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  placeholder="500" 
                  min="0" 
                  step="10" 
                />
                <p className="text-xs text-green-700 font-medium">Amount you collect from employer per worker per day</p>
                {preferences.default_employer_rate && <p className="text-xs text-green-600 font-medium">Current: ₹{preferences.default_employer_rate}/day</p>}
              </div>

              {/* Commission Preview */}
              {defaultWageInput && defaultEmployerRateInput && (
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <p className="text-sm font-bold text-purple-900">Estimated Commission per Worker</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    ₹{Math.max(0, parseFloat(defaultEmployerRateInput || 0) - parseFloat(defaultWageInput || 0))}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">= ₹{defaultEmployerRateInput} (from employer) - ₹{defaultWageInput} (to worker)</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => { 
                  setShowDefaultWageDialog(false); 
                  setDefaultWageInput(String(preferences.default_worker_wage || 450));
                  setDefaultEmployerRateInput(String(preferences.default_employer_rate || 500));
                }} 
                className="rounded-xl h-11 px-5 border-gray-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveDefaultWage} 
                className="bg-gradient-to-r from-[#3B2ED0] to-[#2A1FB8] hover:from-[#2A1FB8] hover:to-[#1F1A8F] text-white shadow-lg shadow-[#3B2ED0]/25 rounded-xl h-11 px-6 font-semibold"
              >
                Save Default Rates
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl font-bold">Delete Attendance Record?</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1">
                    This action cannot be undone.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete attendance for <span className="font-semibold text-gray-900">{recordToDelete && getEmployerName(recordToDelete.employer_id)}</span>?
                {recordToDelete?.selected_workers?.length > 0 && (
                  <span className="block mt-2 text-sm text-gray-600">
                    This will also remove attendance for {recordToDelete.selected_workers.length} assigned worker(s).
                  </span>
                )}
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Record
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
