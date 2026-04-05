import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { formatDateToDDMMYYYY, getThisWeekRange, getLastWeekRange, getThisMonthRange, getThisYearRange } from '../utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
import { toast } from 'sonner';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Search,
  Filter,
  IndianRupee,
  Calendar,
  Download,
  Eye,
  Plus,
  Check,
  Trash2,
  AlertTriangle,
  FileText,
  CalendarDays,
  CheckCircle,
  Banknote,
  Receipt,
  DollarSign,
  Award,
  Building2,
  Users,
  MessageCircle
} from 'lucide-react';

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL params on initial load
    const tabParam = searchParams.get('tab');
    return tabParam === 'collect' ? 'collect' : 'settle'; // Default to 'settle'
  });
  const [loading, setLoading] = useState(true);

  // Date filters
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeStartDate, setActiveStartDate] = useState(null);
  const [activeEndDate, setActiveEndDate] = useState(null);

  // Employer data
  const [employerSummaries, setEmployerSummaries] = useState([]);
  const [employerSearch, setEmployerSearch] = useState('');
  const [employerSearchInput, setEmployerSearchInput] = useState('');  // Separate input state
  const [employerFilter, setEmployerFilter] = useState('all');

  // Worker data
  const [workerSummaries, setWorkerSummaries] = useState([]);
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerSearchInput, setWorkerSearchInput] = useState('');  // Separate input state
  const [workerFilter, setWorkerFilter] = useState('all');

  const [workers, setWorkers] = useState([]);

  // Dialogs
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [employerHistoryDialogOpen, setEmployerHistoryDialogOpen] = useState(false);
  const [workerHistoryDialogOpen, setWorkerHistoryDialogOpen] = useState(false);
  const [reverseConfirmDialog, setReverseConfirmDialog] = useState({ open: false, type: null, id: null, amount: 0 });
  const [employerWorkHistoryDialogOpen, setEmployerWorkHistoryDialogOpen] = useState(false);
  const [employerHistoryTab, setEmployerHistoryTab] = useState('payments');
  const [workerHistoryTab, setWorkerHistoryTab] = useState('settlements');
  const [workerWorkHistoryDialogOpen, setWorkerWorkHistoryDialogOpen] = useState(false);
  const [whatsappPhoneDialogOpen, setWhatsappPhoneDialogOpen] = useState(false);
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState('');
  const [whatsappEmployer, setWhatsappEmployer] = useState(null);
  const [settleAllDialogOpen, setSettleAllDialogOpen] = useState(false);

  // Selected items
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [employerHistory, setEmployerHistory] = useState([]);
  const [workerHistory, setWorkerHistory] = useState([]);
  const [employerWorkHistory, setEmployerWorkHistory] = useState(null);
  const [workerWorkHistory, setWorkerWorkHistory] = useState(null);

  // Forms
  const [collectForm, setCollectForm] = useState({
    amount: '',
    advance_deducted: 0,
    payment_mode: 'Cash',
    remarks: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const [settleForm, setSettleForm] = useState({
    advance_to_deduct: 0,
    extra_charge_amount: 0,
    extra_charge_reason: '',
    advance_given_amount: '',
    advance_given_reason: '',
    amount_to_settle: 0
  });

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmployerSearch(employerSearchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [employerSearchInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWorkerSearch(workerSearchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [workerSearchInput]);

  // Sync URL params with active tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'settle' || tabParam === 'collect') {
      if (activeTab !== tabParam) {
        setActiveTab(tabParam);
      }
    } else if (!tabParam) {
      // If no tab param, set default to settle (only on initial load)
      if (activeTab === 'settle') {
        setSearchParams({ tab: 'settle' }, { replace: true });
      }
    }
  }, [searchParams]); // Run when searchParams change

  useEffect(() => {
    fetchData();
  }, [activeTab, employerSearch, employerFilter, workerSearch, workerFilter, activeStartDate, activeEndDate]);

  useEffect(() => {
    // Apply date filter when changed
    if (dateFilter !== 'custom') {
      applyDateFilter();
    }
  }, [dateFilter]);

  const applyDateFilter = () => {
    if (dateFilter === 'all') {
      setActiveStartDate(null);
      setActiveEndDate(null);
    } else if (dateFilter === 'this_week') {
      const range = getThisWeekRange();
      setActiveStartDate(range.start);
      setActiveEndDate(range.end);
      setCustomStartDate(range.startDate);
      setCustomEndDate(range.endDate);
    } else if (dateFilter === 'last_week') {
      const range = getLastWeekRange();
      setActiveStartDate(range.start);
      setActiveEndDate(range.end);
      setCustomStartDate(range.startDate);
      setCustomEndDate(range.endDate);
    } else if (dateFilter === 'this_month') {
      const range = getThisMonthRange();
      setActiveStartDate(range.start);
      setActiveEndDate(range.end);
      setCustomStartDate(range.startDate);
      setCustomEndDate(range.endDate);
    } else if (dateFilter === 'this_year') {
      const range = getThisYearRange();
      setActiveStartDate(range.start);
      setActiveEndDate(range.end);
      setCustomStartDate(range.startDate);
      setCustomEndDate(range.endDate);
    }
  };

  const applyCustomDateFilter = () => {
    if (customStartDate && customEndDate) {
      setActiveStartDate(formatDateToDDMMYYYY(customStartDate));
      setActiveEndDate(formatDateToDDMMYYYY(customEndDate));
      toast.success('Custom date range applied');
    } else {
      toast.error('Please select both start and end dates');
    }
  };

  // Helper function to sort by pending amount (descending)
  const sortByPendingAmount = (items) => {
    return [...items].sort((a, b) => {
      const amountA = a.total_pending || a.pending_settlement || 0;
      const amountB = b.total_pending || b.pending_settlement || 0;
      return amountB - amountA; // Descending order (highest first)
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'collect') {
        const response = await api.getEmployerSummaries(
          employerSearch, 
          employerFilter,
          activeStartDate,
          activeEndDate
        );
        // Sort employers by pending amount (highest first)
        setEmployerSummaries(sortByPendingAmount(response.data));
      } else if (activeTab === 'settle') {
        const response = await api.getWorkerSummaries(
          workerSearch, 
          workerFilter,
          activeStartDate,
          activeEndDate
        );
        // Sort workers by pending settlement (highest first)
        setWorkerSummaries(sortByPendingAmount(response.data));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch data', error);
      }
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ============ Collect Payment Functions ============
  const openCollectDialog = (employer) => {
    setSelectedEmployer(employer);
    if (process.env.NODE_ENV === 'development') {
      console.log('Opening collect dialog for employer:', employer);
      console.log('Advance received:', employer?.advance_received);
    }
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    // Set default amount to full pending amount (minus any advance to deduct)
    const fullPendingAmount = employer.total_pending || 0;
    setCollectForm({ 
      amount: fullPendingAmount.toString(), 
      advance_deducted: 0,
      payment_mode: 'Cash', 
      remarks: '',
      payment_date: today
    });
    setCollectDialogOpen(true);
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    
    if (!collectForm.amount || parseFloat(collectForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!collectForm.payment_date) {
      toast.error('Please select a payment date');
      return;
    }

    try {
      // Convert YYYY-MM-DD to ISO format for backend
      const paymentDate = new Date(collectForm.payment_date).toISOString();
      
      const totalSettled = parseFloat(collectForm.amount) + parseFloat(collectForm.advance_deducted || 0);
      
      await api.collectPayment({
        employer_id: selectedEmployer.employer_id,
        amount: parseFloat(collectForm.amount),
        advance_deducted: parseFloat(collectForm.advance_deducted || 0),
        payment_mode: collectForm.payment_mode,
        remarks: collectForm.remarks,
        payment_date: paymentDate
      });
      
      const successMsg = collectForm.advance_deducted > 0
        ? `Payment collected! Cash: ₹${parseFloat(collectForm.amount).toLocaleString()}, Advance: ₹${parseFloat(collectForm.advance_deducted).toLocaleString()} (Total: ₹${totalSettled.toLocaleString()})`
        : `Payment of ₹${parseFloat(collectForm.amount).toLocaleString()} collected successfully!`;
      
      toast.success(successMsg, { duration: 5000 });
      setCollectDialogOpen(false);
      fetchData();
    } catch (error) {
      // ✅ Handle 400 errors (validation failures) with prominent warning
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || 'Invalid payment amount', {
          duration: 6000,
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '2px solid #F59E0B',
            fontWeight: 'bold',
            maxWidth: '600px',
          },
        });
      } else {
        toast.error(error.response?.data?.detail || 'Failed to collect payment');
      }
    }
  };

  const openEmployerHistory = async (employer) => {
    setSelectedEmployer(employer);
    try {
      // Fetch both payment history and work history
      const [paymentResponse, workResponse] = await Promise.all([
        api.getEmployerHistory(employer.employer_id, null, null),
        api.getEmployerWorkHistory(employer.employer_id, null, null)
      ]);
      setEmployerHistory(paymentResponse.data);
      setEmployerWorkHistory(workResponse.data);
      setEmployerHistoryDialogOpen(true);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load employer history:', error);
      }
      toast.error('Failed to load employer history');
    }
  };

  // ============ WhatsApp Integration Functions ============
  const generateWhatsAppMessage = (employer) => {
    const pendingAmount = employer.total_pending || 0;
    const employerName = employer.employer_name || 'Employer';
    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    let message = `Dear ${employerName},\n\n`;
    message += `This is a reminder regarding your pending payment.\n\n`;
    message += `Pending Amount: ₹${pendingAmount.toLocaleString()}\n`;
    message += `Date: ${currentDate}\n\n`;
    message += `Please arrange the payment at your earliest convenience.\n\n`;
    message += `Thank you.`;
    
    return message;
  };

  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // If it starts with 0, remove it (Indian numbers)
    if (digits.startsWith('0')) {
      return digits.substring(1);
    }
    // If it starts with +91, remove it
    if (digits.startsWith('91') && digits.length > 10) {
      return digits.substring(2);
    }
    return digits;
  };

  const handleWhatsAppClick = (employer) => {
    setWhatsappEmployer(employer);
    const phoneNumber = employer.phone_number;
    
    if (!phoneNumber || phoneNumber.trim() === '') {
      // Show dialog to enter phone number
      setWhatsappPhoneNumber('');
      setWhatsappPhoneDialogOpen(true);
    } else {
      // Generate WhatsApp link and open it
      openWhatsApp(employer, phoneNumber);
    }
  };

  const openWhatsApp = (employer, phoneNumber) => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    // For India, add country code 91 if not present
    const countryCode = formattedPhone.length === 10 ? '91' : '';
    const fullPhoneNumber = countryCode + formattedPhone;
    
    const message = generateWhatsAppMessage(employer);
    const encodedMessage = encodeURIComponent(message);
    
    // Use wa.me API link
    const whatsappUrl = `https://wa.me/${fullPhoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSavePhoneAndSendWhatsApp = async () => {
    if (!whatsappPhoneNumber || whatsappPhoneNumber.trim() === '') {
      toast.error('Please enter a valid phone number');
      return;
    }

    const formattedPhone = formatPhoneNumber(whatsappPhoneNumber);
    if (formattedPhone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      // Update employer phone number
      await api.updateEmployer(whatsappEmployer.employer_id, {
        phone_number: formattedPhone
      });
      
      toast.success('Phone number saved successfully');
      setWhatsappPhoneDialogOpen(false);
      
      // Refresh employer data
      await fetchData();
      
      // Open WhatsApp with the saved phone number
      openWhatsApp(whatsappEmployer, formattedPhone);
      
      // Update the local employer data
      setWhatsappEmployer({ ...whatsappEmployer, phone_number: formattedPhone });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save phone number');
    }
  };

  const handleReversePayment = (paymentId, amount) => {
    setReverseConfirmDialog({
      open: true,
      type: 'payment',
      id: paymentId,
      amount: amount
    });
  };

  const handleReverseSettlement = (settlementId, amount) => {
    setReverseConfirmDialog({
      open: true,
      type: 'settlement',
      id: settlementId,
      amount: amount
    });
  };

  const confirmReverse = async () => {
    try {
      if (reverseConfirmDialog.type === 'payment') {
        await api.reversePaymentCollection(reverseConfirmDialog.id);
        toast.success(`Payment of ₹${reverseConfirmDialog.amount.toLocaleString()} reversed successfully!`);
        
        // Refresh employer history if dialog is open
        if (employerHistoryDialogOpen && selectedEmployer) {
          const response = await api.getEmployerHistory(
            selectedEmployer.employer_id,
            activeStartDate,
            activeEndDate
          );
          setEmployerHistory(response.data);
        }
      } else if (reverseConfirmDialog.type === 'settlement') {
        await api.reverseWageSettlement(reverseConfirmDialog.id);
        toast.success(`Settlement of ₹${reverseConfirmDialog.amount.toLocaleString()} reversed successfully!`);
        
        // Refresh worker history if dialog is open
        if (workerHistoryDialogOpen && selectedWorker) {
          const response = await api.getWorkerHistory(
            selectedWorker.worker_id,
            activeStartDate,
            activeEndDate
          );
          setWorkerHistory(response.data);
        }
      }
      
      // Refresh main data
      fetchData();
      setReverseConfirmDialog({ open: false, type: null, id: null, amount: 0 });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reverse transaction');
    }
  };

  const exportEmployerHistory = (employerId) => {
    const url = api.exportEmployerHistory(employerId);
    window.open(url, '_blank');
  };

  // ============ Settle Wage Functions ============
  const openSettleDialog = async (worker) => {
    setSelectedWorker(worker);
    const pendingWage = worker.pending_settlement || worker.pending_wage || 0;
    const advanceBalance = worker.advance_paid || worker.advance_balance || 0;
    const extraCharges = worker.extra_charges || 0;
    const netPayable = Math.max(0, pendingWage - advanceBalance - extraCharges);
    setSettleForm({
      advance_to_deduct: advanceBalance,
      extra_charge_amount: 0,
      extra_charge_reason: '',
      advance_given_amount: '',
      advance_given_reason: '',
      amount_to_settle: netPayable // Auto-populate with total payable
    });
    setSettleDialogOpen(true);
  };

  const handleSettleAll = () => {
    const workersToSettle = workerSummaries.filter(w => w.net_pending > 0);
    
    if (workersToSettle.length === 0) {
      toast.info('No workers with pending amounts to settle');
      return;
    }

    // Open dialog to show details
    setSettleAllDialogOpen(true);
  };

  const confirmSettleAll = async () => {
    const workersToSettle = workerSummaries.filter(w => w.net_pending > 0);
    
    setSettleAllDialogOpen(false);
    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    try {
      for (const worker of workersToSettle) {
        try {
          const pendingWage = worker.pending_settlement || worker.pending_wage || 0;
          const advanceBalance = worker.advance_paid || worker.advance_balance || 0;
          const extraCharges = worker.extra_charges || 0;
          const netPayable = Math.max(0, pendingWage - advanceBalance - extraCharges);

          if (netPayable <= 0) {
            continue; // Skip workers with no net payable
          }

          await api.settleWage({
            worker_id: worker.worker_id,
            start_date: activeStartDate || formatDateToDDMMYYYY(new Date()),
            end_date: activeEndDate || formatDateToDDMMYYYY(new Date()),
            advance_deducted: advanceBalance,
            charges_deducted: extraCharges,
            amount_paid: netPayable,
            settlement_type: 'full',
            extra_charge_amount: 0,
            extra_charge_reason: ''
          });
          
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`${worker.worker_name}: ${error.response?.data?.detail || 'Failed to settle'}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully settled ${successCount} worker(s)!`, { duration: 5000 });
      }
      if (failCount > 0) {
        toast.error(`Failed to settle ${failCount} worker(s). Check console for details.`, { duration: 6000 });
        if (process.env.NODE_ENV === 'development') {
          console.error('Settle All Errors:', errors);
        }
      }
      
      // Refresh data
      await fetchData();
    } catch (error) {
      toast.error('An error occurred while settling workers');
      if (process.env.NODE_ENV === 'development') {
        console.error('Settle All Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPayable = () => {
    if (!selectedWorker) return 0;
    
    // FIX: Handle both field names (pending_wage and pending_settlement)
    const totalPending = selectedWorker.pending_wage ?? selectedWorker.pending_settlement ?? 0;
    const advanceDeduct = parseFloat(settleForm.advance_to_deduct) || 0;
    const existingCharges = selectedWorker.extra_charges ?? 0;
    const newCharge = parseFloat(settleForm.extra_charge_amount) || 0;
    
    return Math.max(0, totalPending - advanceDeduct - existingCharges - newCharge);
  };

  const handleSettleWage = async (e) => {
    e.preventDefault();
    
    if (!settleForm.amount_to_settle || parseFloat(settleForm.amount_to_settle) <= 0) {
      toast.error('Please enter a valid settlement amount');
      return;
    }

    const advanceDeduct = parseFloat(settleForm.advance_to_deduct) || 0;
    const amountToSettle = parseFloat(settleForm.amount_to_settle);
    const extraChargeAmount = parseFloat(settleForm.extra_charge_amount) || 0;
    const totalPayable = calculateTotalPayable();
    const isFull = amountToSettle >= totalPayable;

    try {
      await api.settleWage({
        worker_id: selectedWorker.worker_id,
        start_date: activeStartDate || formatDateToDDMMYYYY(new Date()),
        end_date: activeEndDate || formatDateToDDMMYYYY(new Date()),
        advance_deducted: advanceDeduct,
        charges_deducted: (selectedWorker.extra_charges || 0) + extraChargeAmount,
        amount_paid: amountToSettle,
        settlement_type: isFull ? 'full' : 'partial',
        extra_charge_amount: extraChargeAmount,
        extra_charge_reason: settleForm.extra_charge_reason
      });
      
      // Create success message with details
      let successMsg = isFull ? 'Full wage settled successfully!' : `Partial payment of ₹${amountToSettle.toLocaleString()} recorded`;
      if (advanceDeduct > 0 || extraChargeAmount > 0) {
        const details = [];
        if (advanceDeduct > 0) details.push(`Advance: ₹${advanceDeduct.toLocaleString()}`);
        if (extraChargeAmount > 0) details.push(`Charges: ₹${extraChargeAmount.toLocaleString()}`);
        successMsg += ` (${details.join(', ')})`;
      }
      
      toast.success(successMsg, { duration: 5000 });
      setSettleDialogOpen(false);
      fetchData();
    } catch (error) {
      // ✅ Handle 400 errors (validation failures) with prominent warning
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || 'Invalid settlement amount', {
          duration: 6000,
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '2px solid #F59E0B',
            fontWeight: 'bold',
            maxWidth: '600px',
          },
        });
      } else {
        toast.error(error.response?.data?.detail || 'Failed to settle wage');
      }
    }
  };

  const openWorkerHistory = async (worker) => {
    setSelectedWorker(worker);
    try {
      // Fetch both settlement history and work history
      const [settlementResponse, workResponse] = await Promise.all([
        api.getWorkerHistory(worker.worker_id, null, null),
        api.getWorkerWorkHistory(worker.worker_id, null, null)
      ]);
      setWorkerHistory(settlementResponse.data);
      setWorkerWorkHistory(workResponse.data);
      setWorkerHistoryDialogOpen(true);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load worker history:', error);
      }
      toast.error('Failed to load worker history');
    }
  };

  const exportWorkerHistory = (workerId) => {
    const url = api.exportWorkerHistory(workerId);
    window.open(url, '_blank');
  };

  const downloadFullStatement = (type, id) => {
    if (type === 'employer') {
      const url = api.exportEmployerHistory(id);
      window.open(url, '_blank');
    } else {
      const url = api.exportWorkerHistory(id);
      window.open(url, '_blank');
    }
  };

  const downloadMonthlyStatement = (type, id, monthKey) => {
    // Generate a filtered statement for a specific month
    // For now, open the full statement - backend would need enhancement for monthly filtering
    if (type === 'employer') {
      const url = api.exportEmployerHistory(id);
      window.open(url, '_blank');
    } else {
      const url = api.exportWorkerHistory(id);
      window.open(url, '_blank');
    }
    toast.info('Monthly statement feature - Full statement downloaded. Month-specific filtering coming soon!');
  };

  // Helper function to group payment/settlement history by month
  const groupPaymentsByMonth = (history) => {
    const grouped = {};
    
    if (!history || history.length === 0) {
      return [];
    }
    
    history.forEach(record => {
      let date;
      try {
        date = new Date(record.date);
        if (isNaN(date.getTime())) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Invalid date:', record.date);
          }
          return;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error parsing date:', record.date, error);
        }
        return;
      }
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          monthLabel,
          records: [],
          totalAmount: 0,
          count: 0
        };
      }
      
      grouped[monthKey].records.push(record);
      grouped[monthKey].totalAmount += record.total_settled || record.amount_paid || record.amount_settled || 0;
      grouped[monthKey].count++;
    });
    
    // Convert to array and sort by month (newest first)
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, data]) => ({ monthKey: key, ...data }));
  };

  // Helper function to group history by month
  const groupByMonth = (history) => {
    const grouped = {};
    
    if (!history || history.length === 0) {
      return [];
    }
    
    history.forEach(record => {
      // Parse date from various formats
      let date;
      if (record.date) {
        // Check if it's DD-MM-YYYY format
        if (record.date.includes('-') && record.date.split('-').length === 3) {
          const parts = record.date.split('-');
          // Check if first part is day (DD-MM-YYYY)
          if (parts[0].length <= 2) {
            // DD-MM-YYYY format
            date = new Date(parts[2], parts[1] - 1, parts[0]);
          } else {
            // Might be ISO format or YYYY-MM-DD, try standard parsing
            date = new Date(record.date);
          }
        } else {
          // Try standard date parsing (handles ISO format)
          date = new Date(record.date);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Record without date:', record);
        }
        return;
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Invalid date:', record.date, record);
        }
        return;
      }
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          monthLabel,
          records: [],
          totalAmount: 0,
          count: 0
        };
      }
      
      grouped[monthKey].records.push(record);
      grouped[monthKey].totalAmount += record.amount || record.amount_paid || record.wage_earned || 0;
      grouped[monthKey].count++;
    });
    
    // Convert to array and sort by month (newest first)
    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, value]) => value);
  };

  const openEmployerWorkHistory = async (employer) => {
    setSelectedEmployer(employer);
    try {
      // Fetch ALL work history (no date filtering)
      const response = await api.getEmployerWorkHistory(
        employer.employer_id,
        null,  // Don't filter work history by date
        null
      );
      setEmployerWorkHistory(response.data);
      setEmployerWorkHistoryDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load work history');
    }
  };

  const openWorkerWorkHistory = async (worker) => {
    setSelectedWorker(worker);
    try {
      // Fetch ALL work history (no date filtering)
      const response = await api.getWorkerWorkHistory(
        worker.worker_id,
        null,  // Don't filter work history by date
        null
      );
      setWorkerWorkHistory(response.data);
      setWorkerWorkHistoryDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load work history');
    }
  };

  // ============ Advance Functions (for Settlement) ============
  const handleGiveAdvanceInSettlement = async () => {
    if (!settleForm.advance_given_amount || parseFloat(settleForm.advance_given_amount) <= 0) {
      toast.error('Please enter valid advance amount');
      return;
    }

    try {
      await api.createAdvance({
        worker_id: selectedWorker.worker_id,
        amount: parseFloat(settleForm.advance_given_amount),
        purpose: settleForm.advance_given_reason || 'Given during settlement'
      });
      
      toast.success('Advance recorded successfully');
      // Update selected worker's advance balance for UI
      setSelectedWorker({
        ...selectedWorker,
        advance_balance: selectedWorker.advance_balance + parseFloat(settleForm.advance_given_amount)
      });
      // Clear the advance given fields
      setSettleForm({
        ...settleForm,
        advance_given_amount: '',
        advance_given_reason: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record advance');
    }
  };

  // Helper to get worker name
  const getWorkerName = (id) => workers.find(w => w.id === id)?.name || 'Unknown';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="animate-pulse space-y-5">
            <div className="h-20 bg-white rounded-lg"></div>
            <div className="h-96 bg-white rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
      {/* Simplified Header */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
              Payments
            </h1>
            <p className="text-sm text-gray-500">Manage collections and settlements</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[160px] h-9 border-gray-300 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="last_week">Last Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-[120px] h-9 border-gray-300 bg-white text-sm"
                />
                <span className="text-gray-400 text-xs">to</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-[120px] h-9 border-gray-300 bg-white text-sm"
                />
                <Button
                  onClick={applyCustomDateFilter}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-xs"
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simplified Tabs */}
      <Card className="shadow-sm border border-gray-200">
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setSearchParams({ tab: value }, { replace: true });
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 h-auto">
            <TabsTrigger 
              value="settle" 
              className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm flex items-center justify-center gap-2 py-3 transition-all rounded-md text-sm font-medium"
            >
              <TrendingUp className="h-4 w-4" />
              Settle Wage
            </TabsTrigger>
            <TabsTrigger 
              value="collect" 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center justify-center gap-2 py-3 transition-all rounded-md text-sm font-medium"
            >
              <Wallet className="h-4 w-4" />
              Collect Payment
            </TabsTrigger>
          </TabsList>

          {/* Tab: Collect Payment (Employers) */}
          <TabsContent value="collect" className="mt-4 p-5 space-y-4">
            {/* Simplified Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Total Pending</p>
                <p className="text-2xl font-semibold text-blue-900">
                  ₹{employerSummaries.reduce((sum, e) => sum + (e.total_pending || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">Total Collected</p>
                <p className="text-2xl font-semibold text-green-900">
                  ₹{employerSummaries.reduce((sum, e) => sum + (e.total_collected || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-600 mb-1">Pending Employers</p>
                <p className="text-2xl font-semibold text-amber-900">
                  {employerSummaries.filter(e => e.status !== 'Paid').length} / {employerSummaries.length}
                </p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employers..."
                  value={employerSearchInput}
                  onChange={(e) => setEmployerSearchInput(e.target.value)}
                  className="pl-10 border-gray-300 bg-white h-10"
                />
              </div>
              <Select value={employerFilter} onValueChange={setEmployerFilter}>
                <SelectTrigger className="w-[140px] border-gray-300 bg-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="paid">Settled Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Simplified Employer List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {employerSummaries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Wallet className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    {employerSearchInput ? 'No employers found' : 'No employers yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {employerSummaries.map((employer) => (
                    <div key={employer.employer_id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-gray-900">{employer.employer_name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              employer.status === 'Paid' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {employer.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{employer.phone_number}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-gray-500 text-xs mb-0.5">Pending</p>
                            <p className="font-semibold text-red-600">₹{employer.total_pending.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500 text-xs mb-0.5">Collected</p>
                            <p className="font-semibold text-green-600">₹{employer.total_collected.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            {employer.status !== 'Paid' && employer.total_pending > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleWhatsAppClick(employer)}
                                className="h-8 px-3 text-xs border-green-300 text-green-700 hover:bg-green-50"
                                title="Send WhatsApp message about pending payment"
                              >
                                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                                WhatsApp
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => openCollectDialog(employer)}
                              className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Collect
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEmployerHistory(employer)}
                              className="h-8 px-3 text-xs border-gray-300"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              History
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Settle Wage (Workers) */}
          <TabsContent value="settle" className="mt-4 p-5 space-y-4">
            {/* Simplified Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">Total Pending</p>
                <p className="text-2xl font-semibold text-green-900">
                  ₹{workerSummaries.reduce((sum, w) => sum + (w.net_pending || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Total Wage Due</p>
                <p className="text-2xl font-semibold text-blue-900">
                  ₹{workerSummaries.reduce((sum, w) => sum + ((w.pending_settlement || w.pending_wage || 0)), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-600 mb-1">Pending Workers</p>
                <p className="text-2xl font-semibold text-amber-900">
                  {workerSummaries.filter(w => w.status !== 'Settled').length} / {workerSummaries.length}
                </p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workers..."
                  value={workerSearchInput}
                  onChange={(e) => setWorkerSearchInput(e.target.value)}
                  className="pl-10 border-gray-300 bg-white h-10"
                />
              </div>
              <Select value={workerFilter} onValueChange={setWorkerFilter}>
                <SelectTrigger className="w-[140px] border-gray-300 bg-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="settled">Settled Only</SelectItem>
                </SelectContent>
              </Select>
              {workerSummaries.filter(w => w.net_pending > 0).length > 0 && (
                <Button
                  onClick={handleSettleAll}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-10 px-4 font-semibold shadow-md"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Settle All
                </Button>
              )}
            </div>

            {/* Simplified Worker List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {workerSummaries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    {workerSearchInput ? 'No workers found' : 'No workers yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {workerSummaries.map((worker) => (
                    <div key={worker.worker_id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-gray-900">{worker.worker_name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              worker.status === 'Settled' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {worker.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{worker.phone_number}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-right">
                            <p className="text-gray-500 text-xs mb-0.5">Pending</p>
                            <p className="font-semibold text-gray-900">₹{(worker.pending_settlement || worker.pending_wage || 0).toLocaleString()}</p>
                          </div>
                          {(worker.advance_paid || worker.advance_balance || 0) > 0 && (
                            <div className="text-right">
                              <p className="text-gray-500 text-xs mb-0.5">Advance</p>
                              <p className="font-semibold text-amber-600">₹{(worker.advance_paid || worker.advance_balance || 0).toLocaleString()}</p>
                            </div>
                          )}
                          {(worker.extra_charges || 0) > 0 && (
                            <div className="text-right">
                              <p className="text-gray-500 text-xs mb-0.5">Extra Charges</p>
                              <p className="font-semibold text-red-600">₹{(worker.extra_charges || 0).toLocaleString()}</p>
                            </div>
                          )}
                          <div className="text-right">
                            <p className="text-gray-500 text-xs mb-0.5">Net Payable</p>
                            <p className="font-semibold text-green-600">₹{worker.net_pending.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => openSettleDialog(worker)}
                              className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
                            >
                              <TrendingUp className="h-3.5 w-3.5 mr-1" />
                              Settle
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openWorkerHistory(worker)}
                              className="h-8 px-3 text-xs border-gray-300"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              History
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </Card>

      {/* Collect Payment Dialog - Simplified */}
      <Dialog open={collectDialogOpen} onOpenChange={setCollectDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col border-gray-200/80 shadow-2xl">
          <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                <Banknote className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Collect Payment</DialogTitle>
                <DialogDescription className="mt-1 text-gray-600">{selectedEmployer?.employer_name} — Record payment received from employer.</DialogDescription>
              </div>
            </div>
          </div>
          <form onSubmit={handleCollectPayment} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {/* Pending Amount Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Pending</p>
                    <p className="text-xl font-semibold text-blue-900">
                      ₹{selectedEmployer?.total_pending.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Remaining</p>
                    <p className="text-lg font-semibold text-gray-700">
                      ₹{Math.max(0, (selectedEmployer?.total_pending || 0) - parseFloat(collectForm.amount || 0) - parseFloat(collectForm.advance_deducted || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cash Amount Input */}
              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-1 block">
                  Cash Amount (₹) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={collectForm.amount}
                  onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })}
                  onWheel={(e) => e.target.blur()}
                  className="text-lg font-medium border-gray-300 focus:border-blue-500 h-11"
                  autoFocus
                />
              </div>

              {/* Advance Deduction - Only show if employer has advance */}
              {selectedEmployer?.advance_received > 0 && (
                <div>
                  <Label htmlFor="advance_deducted" className="text-sm font-medium text-gray-700 mb-1 block">
                    Deduct from Advance (Optional)
                  </Label>
                  <div className="text-xs text-gray-500 mb-2">
                    Available: ₹{selectedEmployer?.advance_received?.toLocaleString() || 0}
                  </div>
                  <Input
                    id="advance_deducted"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={collectForm.advance_deducted}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (value <= (selectedEmployer?.advance_received || 0)) {
                        setCollectForm({ ...collectForm, advance_deducted: e.target.value });
                      } else {
                        toast.error(`Cannot deduct more than ₹${selectedEmployer?.advance_received?.toLocaleString()}`);
                      }
                    }}
                    onWheel={(e) => e.target.blur()}
                    className="border-gray-300 focus:border-blue-500 h-10"
                    max={selectedEmployer?.advance_received}
                  />
                </div>
              )}

              {/* Total Summary */}
              {(parseFloat(collectForm.amount || 0) > 0 || parseFloat(collectForm.advance_deducted || 0) > 0) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 flex justify-between mb-1">
                    <span>Total Settlement:</span>
                    <span className="font-semibold text-gray-900">₹{(parseFloat(collectForm.amount || 0) + parseFloat(collectForm.advance_deducted || 0)).toLocaleString()}</span>
                  </p>
                  {collectForm.advance_deducted > 0 && (
                    <p className="text-xs text-gray-500">
                      Cash: ₹{parseFloat(collectForm.amount || 0).toLocaleString()} + Advance: ₹{parseFloat(collectForm.advance_deducted || 0).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Date and Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="payment_date" className="text-sm font-medium text-gray-700 mb-1 block">
                    Payment Date *
                  </Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={collectForm.payment_date}
                    onChange={(e) => setCollectForm({ ...collectForm, payment_date: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 h-10"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="payment_mode" className="text-sm font-medium text-gray-700 mb-1 block">
                    Payment Mode
                  </Label>
                  <Select
                    value={collectForm.payment_mode}
                    onValueChange={(value) => setCollectForm({ ...collectForm, payment_mode: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <Label htmlFor="remarks" className="text-sm font-medium text-gray-700 mb-1 block">
                  Remarks (Optional)
                </Label>
                <Input id="remarks" placeholder="Add any notes..." value={collectForm.remarks} onChange={(e) => setCollectForm({ ...collectForm, remarks: e.target.value })} className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-11 rounded-xl" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setCollectDialogOpen(false)} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 px-6 font-semibold">
                {(parseFloat(collectForm.amount || 0) + parseFloat(collectForm.advance_deducted || 0)) >= (selectedEmployer?.total_pending || 0) ? 'Settle Full Payment' : 'Collect Payment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Employer History Dialog - Combined Payment and Work History */}
      <Dialog open={employerHistoryDialogOpen} onOpenChange={setEmployerHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-blue-900 bg-clip-text text-transparent">
              History - {employerHistory?.employer_name || employerWorkHistory?.employer_name}
            </DialogTitle>
            <DialogDescription className="text-base">
              {(employerHistory?.employer_name || employerWorkHistory?.employer_name)} • {(employerHistory?.employer_company || employerWorkHistory?.employer_company) || 'N/A'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={employerHistoryTab} onValueChange={setEmployerHistoryTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="payments">Payment History</TabsTrigger>
              <TabsTrigger value="work">Work History</TabsTrigger>
            </TabsList>

            {/* Payment History Tab */}
            <TabsContent value="payments" className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-blue-200 shadow-sm">
                  <div className="text-xs text-blue-700 font-semibold mb-1 uppercase tracking-wide">Current Pending</div>
                  <div className="text-3xl font-bold text-blue-900">
                    ₹{employerHistory?.current_pending?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border-2 border-green-200 shadow-sm">
                  <div className="text-xs text-green-700 font-semibold mb-1 uppercase tracking-wide">Total Settled</div>
                  <div className="text-3xl font-bold text-green-900">
                    ₹{(employerHistory?.history?.reduce((sum, p) => sum + (p.total_settled || p.amount_paid || 0), 0) || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Cash: ₹{(employerHistory?.history?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0).toLocaleString()}
                    {(employerHistory?.history?.reduce((sum, p) => sum + (p.advance_deducted || 0), 0) || 0) > 0 && (
                      <span> • Advance: ₹{(employerHistory?.history?.reduce((sum, p) => sum + (p.advance_deducted || 0), 0) || 0).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200 shadow-sm">
                  <div className="text-xs text-slate-700 font-semibold mb-1 uppercase tracking-wide">Total Transactions</div>
                  <div className="text-3xl font-bold text-slate-900">{employerHistory?.history?.length || 0}</div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-between items-center pb-2 border-b-2 border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Payment Records
                </h3>
                <Button
                  size="sm"
                  onClick={() => downloadFullStatement('employer', selectedEmployer?.employer_id)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Statement
                </Button>
              </div>
              
              {/* Monthly Grouped Payment Records */}
              <div className="space-y-4">
                {employerHistory?.history?.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No payment history found</p>
                  </div>
                ) : (
                  groupPaymentsByMonth(employerHistory?.history || []).map((monthGroup) => (
                    <div key={monthGroup.monthKey} className="border-2 border-orange-200 rounded-lg overflow-hidden shadow-md">
                      {/* Month Header */}
                      <div className="bg-gradient-to-r from-orange-100 to-red-100 px-4 py-3 flex justify-between items-center border-b-2 border-orange-200">
                        <div>
                          <h4 className="font-bold text-lg text-orange-900">{monthGroup.monthLabel}</h4>
                          <p className="text-sm text-orange-700">{monthGroup.count} transaction{monthGroup.count > 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-orange-700 font-medium">Monthly Total</div>
                          <div className="text-2xl font-bold text-green-700">₹{monthGroup.totalAmount.toLocaleString()}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadMonthlyStatement('employer', selectedEmployer?.employer_id, monthGroup.monthKey)}
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Monthly Statement
                        </Button>
                      </div>

                      {/* Month Records Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-orange-50 border-b border-orange-200">
                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Date</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Cash</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Advance</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Total</th>
                              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Mode</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Remarks</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Balance After</th>
                              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthGroup.records.map((payment, idx) => {
                              // Calculate balance after this payment
                              const allPaymentsAfterThis = employerHistory.history
                                .filter(p => new Date(p.date) > new Date(payment.date))
                                .reduce((sum, p) => sum + (p.total_settled || p.amount_paid || 0), 0);
                              const balanceAfterPayment = employerHistory.current_pending + allPaymentsAfterThis;
                              
                              return (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-orange-25 transition-colors">
                                  <td className="py-2 px-3 text-sm">
                                    {new Date(payment.date).toLocaleDateString('en-GB', { 
                                      day: '2-digit', 
                                      month: 'short'
                                    })}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-right">
                                    <span className="font-bold text-green-600">₹{payment.amount_paid.toLocaleString()}</span>
                                  </td>
                                  <td className="py-2 px-3 text-sm text-right">
                                    {payment.advance_deducted > 0 ? (
                                      <span className="font-semibold text-amber-600">₹{payment.advance_deducted.toLocaleString()}</span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-right">
                                    <span className="font-bold text-blue-700">₹{(payment.total_settled || payment.amount_paid).toLocaleString()}</span>
                                  </td>
                                  <td className="py-2 px-3 text-sm text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      payment.payment_mode === 'Cash' ? 'bg-amber-100 text-amber-700' :
                                      payment.payment_mode === 'Online' ? 'bg-blue-100 text-blue-700' :
                                      'bg-purple-100 text-purple-700'
                                    }`}>
                                      {payment.payment_mode}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-sm text-gray-600 max-w-xs truncate" title={payment.remarks}>
                                    {payment.remarks || '-'}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-right font-semibold text-orange-600">
                                    ₹{balanceAfterPayment.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleReversePayment(payment.id, payment.total_settled || payment.amount_paid)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                                      title="Reverse this payment"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Work History Tab */}
            <TabsContent value="work" className="space-y-5">
              {/* Invoice Generation Button - Top Position */}
              <div className="flex justify-center pt-2 pb-4 border-b">
                <Button
                  onClick={async () => {
                    const { getApiBaseUrl } = await import('../utils/apiConfig');
                    const baseUrl = getApiBaseUrl();
                    const url = `${baseUrl}/api/employers/${selectedEmployer?.employer_id}/work-history/invoice?${activeStartDate ? `start_date=${activeStartDate}&` : ''}${activeEndDate ? `end_date=${activeEndDate}` : ''}`;
                    window.open(url, '_blank');
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 flex items-center gap-2 shadow-lg"
                >
                  <Download className="h-5 w-5" />
                  Generate Complete Invoice
                </Button>
              </div>

              {/* Summary Cards - Top Position */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700 font-medium mb-1">Total Days</div>
                  <div className="text-2xl font-bold text-blue-900">{employerWorkHistory?.total_days || 0}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-sm text-green-700 font-medium mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-green-900">
                    ₹{employerWorkHistory?.total_amount?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-700 font-medium mb-1">Avg Per Day</div>
                  <div className="text-2xl font-bold text-purple-900">
                    ₹{employerWorkHistory?.total_days > 0 
                      ? Math.round(employerWorkHistory.total_amount / employerWorkHistory.total_days).toLocaleString()
                      : '0'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {(dateFilter === 'all' || dateFilter === 'this_year') && employerWorkHistory?.history?.length > 0 ? (
                  // Month-wise grouped view
                  <div className="space-y-6">
                    {groupByMonth(employerWorkHistory.history).map((monthGroup, monthIdx) => {
                      // Calculate month start and end dates for invoice
                      const firstRecord = monthGroup.records[0];
                      const lastRecord = monthGroup.records[monthGroup.records.length - 1];
                      
                      return (
                        <div key={monthIdx} className="border-2 border-blue-200 rounded-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <h3 className="text-lg font-bold">{monthGroup.monthLabel}</h3>
                                <p className="text-xs opacity-90">{monthGroup.count} work days</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">₹{monthGroup.totalAmount.toLocaleString()}</div>
                                <div className="text-xs opacity-90">Monthly Total</div>
                              </div>
                            </div>
                            <div className="flex justify-center pt-2">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  const { getApiBaseUrl } = await import('../utils/apiConfig');
                                  const baseUrl = getApiBaseUrl();
                                  const url = `${baseUrl}/api/employers/${selectedEmployer?.employer_id}/work-history/invoice?start_date=${firstRecord.date}&end_date=${lastRecord.date}`;
                                  window.open(url, '_blank');
                                }}
                                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-4 py-1 flex items-center gap-2 text-xs"
                              >
                                <Download className="h-3 w-3" />
                                Monthly Invoice
                              </Button>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-blue-50 border-b border-blue-200">
                                  <th className="text-left py-2 px-3 text-xs font-semibold text-blue-900">Date</th>
                                  <th className="text-center py-2 px-3 text-xs font-semibold text-blue-900">Workers</th>
                                  <th className="text-left py-2 px-3 text-xs font-semibold text-blue-900">Worker Names</th>
                                  <th className="text-right py-2 px-3 text-xs font-semibold text-blue-900">Amount</th>
                                  <th className="text-left py-2 px-3 text-xs font-semibold text-blue-900">Extra</th>
                                  <th className="text-left py-2 px-3 text-xs font-semibold text-blue-900">Remarks</th>
                                </tr>
                              </thead>
                              <tbody>
                                {monthGroup.records.map((record, idx) => (
                                  <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50">
                                    <td className="py-2 px-3 text-xs font-medium">{record.date}</td>
                                    <td className="py-2 px-3 text-xs text-center">
                                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                                        {record.workers_count}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-xs max-w-[150px]">
                                      {record.selected_workers && record.selected_workers.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {record.selected_workers.slice(0, 3).map((name, i) => (
                                            <span key={i} className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                              {name}
                                            </span>
                                          ))}
                                          {record.selected_workers.length > 3 && (
                                            <span className="text-xs text-gray-500">+{record.selected_workers.length - 3}</span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-xs text-right font-semibold text-blue-600">
                                      ₹{record.amount?.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-3 text-xs">
                                      {record.additional_charges > 0 ? (
                                        <span className="text-orange-600 font-semibold">
                                          +₹{record.additional_charges?.toLocaleString()}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-xs text-gray-600 truncate max-w-[100px]" title={record.remarks}>
                                      {record.remarks || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Regular detailed view for specific date ranges
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-50 border-b-2 border-blue-200">
                          <th className="text-left py-3 px-3 text-sm font-semibold text-blue-900">Date</th>
                          <th className="text-center py-3 px-3 text-sm font-semibold text-blue-900">Workers</th>
                          <th className="text-left py-3 px-3 text-sm font-semibold text-blue-900">Worker Names</th>
                          <th className="text-right py-3 px-3 text-sm font-semibold text-blue-900">Amount</th>
                          <th className="text-left py-3 px-3 text-sm font-semibold text-blue-900">Extra Charges</th>
                          <th className="text-left py-3 px-3 text-sm font-semibold text-blue-900">Remarks</th>
                          <th className="text-right py-3 px-3 text-sm font-semibold text-blue-900">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employerWorkHistory?.history?.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-8 text-gray-500">
                              No work history found for the selected period
                            </td>
                          </tr>
                        ) : (
                          employerWorkHistory?.history?.map((record, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50">
                              <td className="py-3 px-3 text-sm font-medium">{record.date}</td>
                              <td className="py-3 px-3 text-sm text-center">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                  {record.workers_count}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-sm max-w-[200px]">
                                {record.selected_workers && record.selected_workers.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {record.selected_workers.map((name, i) => (
                                      <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">Not specified</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-sm text-right font-semibold text-blue-600">
                                ₹{record.amount?.toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-sm">
                                {record.additional_charges > 0 ? (
                                  <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-orange-600 font-semibold">
                                      +₹{record.additional_charges?.toLocaleString()}
                                    </span>
                                    {record.additional_charges_reason && (
                                      <span className="text-xs text-gray-600 italic" title={record.additional_charges_reason}>
                                        {record.additional_charges_reason.length > 25 
                                          ? record.additional_charges_reason.substring(0, 25) + '...' 
                                          : record.additional_charges_reason}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-sm">
                                {record.remarks ? (
                                  <span className="text-xs text-gray-600 italic" title={record.remarks}>
                                    {record.remarks.length > 30 
                                      ? record.remarks.substring(0, 30) + '...' 
                                      : record.remarks}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-sm text-right font-bold text-green-600">
                                ₹{record.cumulative_total?.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Settle Wage Dialog - Simplified */}
      <Dialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col border-gray-200/80 shadow-2xl">
          <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-green-50 via-white to-emerald-50/50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25 flex-shrink-0">
                <Receipt className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Settle Wage</DialogTitle>
                <DialogDescription className="mt-1 text-gray-600">{selectedWorker?.worker_name} — Pay pending wage to worker.</DialogDescription>
              </div>
            </div>
          </div>
          <form onSubmit={handleSettleWage} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {/* Payment Breakdown */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Pending Wage</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{(selectedWorker?.pending_settlement || selectedWorker?.pending_wage || 0).toLocaleString()}
                    </p>
                  </div>
                  {(selectedWorker?.advance_paid || selectedWorker?.advance_balance || 0) > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Advance Balance</p>
                      <p className="text-lg font-semibold text-amber-600">
                        ₹{(selectedWorker?.advance_paid || selectedWorker?.advance_balance || 0).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {(selectedWorker?.extra_charges || 0) > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Extra Charges</p>
                      <p className="text-lg font-semibold text-red-600">
                        ₹{(selectedWorker?.extra_charges || 0).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-700">Net Payable</p>
                    <p className="text-xl font-semibold text-green-600">₹{calculateTotalPayable().toLocaleString()}</p>
                  </div>
                  {((selectedWorker?.advance_paid || selectedWorker?.advance_balance || 0) > 0 || (selectedWorker?.extra_charges || 0) > 0) && (
                    <div className="mt-2 text-xs text-gray-500">
                      {selectedWorker?.advance_paid > 0 && (
                        <span className="mr-3">Advance: ₹{(selectedWorker?.advance_paid || selectedWorker?.advance_balance || 0).toLocaleString()}</span>
                      )}
                      {selectedWorker?.extra_charges > 0 && (
                        <span>Charges: ₹{(selectedWorker?.extra_charges || 0).toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Advance Deduction */}
              {(selectedWorker?.advance_paid || selectedWorker?.advance_balance || 0) > 0 && (
                <div>
                  <Label htmlFor="advance_deduct" className="text-sm font-medium text-gray-700 mb-1 block">
                    Deduct Advance (₹)
                  </Label>
                  <Input
                    id="advance_deduct"
                    type="number"
                    value={settleForm.advance_to_deduct}
                    onChange={(e) => setSettleForm({ ...settleForm, advance_to_deduct: e.target.value })}
                    onWheel={(e) => e.target.blur()}
                    className="border-gray-300 focus:border-green-500 h-10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: ₹{selectedWorker?.advance_balance.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Settlement Amount */}
              <div>
                <Label htmlFor="amount_settle" className="text-sm font-medium text-gray-700 mb-1 block">
                  Amount to Pay (₹) *
                </Label>
                <Input
                  id="amount_settle"
                  type="number"
                  placeholder="0"
                  value={settleForm.amount_to_settle}
                  onChange={(e) => setSettleForm({ ...settleForm, amount_to_settle: e.target.value })}
                  onWheel={(e) => e.target.blur()}
                  className="text-lg font-medium border-gray-300 focus:border-green-500 h-11"
                />
              </div>

              {/* Extra Charges */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Extra Charges (Optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="extra_charge_amount" className="text-xs text-gray-600 mb-1 block">Amount (₹)</Label>
                    <Input
                      id="extra_charge_amount"
                      type="number"
                      placeholder="0"
                      value={settleForm.extra_charge_amount}
                      onChange={(e) => setSettleForm({ ...settleForm, extra_charge_amount: e.target.value })}
                      onWheel={(e) => e.target.blur()}
                      className="border-gray-300 focus:border-red-500 h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="extra_charge_reason" className="text-xs text-gray-600 mb-1 block">Reason</Label>
                    <Input
                      id="extra_charge_reason"
                      placeholder="e.g., Tool damage"
                      value={settleForm.extra_charge_reason}
                      onChange={(e) => setSettleForm({ ...settleForm, extra_charge_reason: e.target.value })}
                      className="border-gray-300 focus:border-red-500 h-9"
                    />
                  </div>
                </div>
              </div>

              {parseFloat(settleForm.amount_to_settle || 0) < calculateTotalPayable() && (
                <p className="text-center text-sm text-gray-500">
                  Remaining: ₹{Math.max(0, calculateTotalPayable() - parseFloat(settleForm.amount_to_settle || 0)).toLocaleString()}
                </p>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setSettleDialogOpen(false)} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25 rounded-xl h-11 px-6 font-semibold">
                {parseFloat(settleForm.amount_to_settle || 0) >= calculateTotalPayable() ? 'Pay Full Settlement' : `Pay ₹${parseFloat(settleForm.amount_to_settle || 0).toLocaleString()}`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Worker History Dialog - Combined Settlement and Work History */}
      <Dialog open={workerHistoryDialogOpen} onOpenChange={setWorkerHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
              History - {workerHistory?.worker_name || workerWorkHistory?.worker_name}
            </DialogTitle>
            <DialogDescription className="text-base">
              {workerHistory?.worker_name || workerWorkHistory?.worker_name} • Worker ID: {selectedWorker?.worker_id}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={workerHistoryTab} onValueChange={setWorkerHistoryTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="settlements">Settlement History</TabsTrigger>
              <TabsTrigger value="work">Work History</TabsTrigger>
            </TabsList>

            {/* Settlement History Tab */}
            <TabsContent value="settlements" className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-lg border-2 border-emerald-200 shadow-sm">
                  <div className="text-xs text-emerald-700 font-semibold mb-1 uppercase tracking-wide">Current Pending</div>
                  <div className="text-2xl font-bold text-emerald-900">
                    ₹{workerHistory?.current_pending?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border-2 border-green-200 shadow-sm">
                  <div className="text-xs text-green-700 font-semibold mb-1 uppercase tracking-wide">Total Settled</div>
                  <div className="text-2xl font-bold text-green-900">
                    ₹{(workerHistory?.history?.reduce((sum, s) => sum + (s.amount_settled || 0), 0) || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg border-2 border-amber-200 shadow-sm">
                  <div className="text-xs text-amber-700 font-semibold mb-1 uppercase tracking-wide">Advance Balance</div>
                  <div className="text-2xl font-bold text-amber-900">
                    ₹{workerHistory?.current_advance?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 shadow-sm">
                  <div className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">Total Transactions</div>
                  <div className="text-2xl font-bold text-blue-900">{workerHistory?.history?.length || 0}</div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-between items-center pb-2 border-b-2 border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Settlement Records
                </h3>
                <Button
                  size="sm"
                  onClick={() => downloadFullStatement('worker', selectedWorker?.worker_id)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Statement
                </Button>
              </div>
              
              {/* Monthly Grouped Settlement Records */}
              <div className="space-y-4">
                {workerHistory?.history?.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No settlement history found</p>
                  </div>
                ) : (
                  groupPaymentsByMonth(workerHistory?.history || []).map((monthGroup) => (
                    <div key={monthGroup.monthKey} className="border-2 border-blue-200 rounded-lg overflow-hidden shadow-md">
                      {/* Month Header */}
                      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-3 flex justify-between items-center border-b-2 border-blue-200">
                        <div>
                          <h4 className="font-bold text-lg text-blue-900">{monthGroup.monthLabel}</h4>
                          <p className="text-sm text-blue-700">{monthGroup.count} settlement{monthGroup.count > 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-blue-700 font-medium">Monthly Total</div>
                          <div className="text-2xl font-bold text-green-700">₹{monthGroup.totalAmount.toLocaleString()}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadMonthlyStatement('worker', selectedWorker?.worker_id, monthGroup.monthKey)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Monthly Statement
                        </Button>
                      </div>

                      {/* Month Records Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-blue-50 border-b border-blue-200">
                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Date</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Amount Paid</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Advance Used</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Charges</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Net Settled</th>
                              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Type</th>
                              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthGroup.records.map((settlement, idx) => {
                              const netSettled = settlement.amount_settled + settlement.advance_deducted + settlement.charges_deducted;
                              
                              return (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-blue-25 transition-colors">
                                  <td className="py-2 px-3 text-sm">
                                    {new Date(settlement.date).toLocaleDateString('en-GB', { 
                                      day: '2-digit', 
                                      month: 'short'
                                    })}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-right">
                                    <span className="font-bold text-green-600">₹{settlement.amount_settled.toLocaleString()}</span>
                                  </td>
                                  <td className="py-2 px-3 text-sm text-right text-orange-600">
                                    {settlement.advance_deducted > 0 ? (
                                      `₹${settlement.advance_deducted.toLocaleString()}`
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-right text-red-600">
                                    {settlement.charges_deducted > 0 ? (
                                      `₹${settlement.charges_deducted.toLocaleString()}`
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-sm text-right font-bold text-blue-600">
                                    ₹{netSettled.toLocaleString()}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      settlement.settlement_type === 'full' 
                                        ? 'bg-green-100 text-green-700 font-semibold' 
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {settlement.settlement_type === 'full' ? 'Full' : 'Partial'}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleReverseSettlement(settlement.id, settlement.amount_settled)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                                      title="Reverse this settlement"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Work History Tab */}
            <TabsContent value="work" className="space-y-5">
              {/* Invoice Generation Button - Top Position */}
              <div className="flex justify-center pt-2 pb-4 border-b">
                <Button
                  onClick={() => {
                    const invoiceUrl = api.generateWorkerInvoice(
                      selectedWorker?.worker_id,
                      activeStartDate,
                      activeEndDate
                    );
                    window.open(invoiceUrl, '_blank');
                  }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Complete Wage Statement
                </Button>
              </div>
              
              {/* Summary Cards - Top Position */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-xs text-green-700 font-medium mb-1">Present Days</div>
                  <div className="text-xl font-bold text-green-900">{workerWorkHistory?.present_days || 0}</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="text-xs text-red-700 font-medium mb-1">Absent Days</div>
                  <div className="text-xl font-bold text-red-900">{workerWorkHistory?.absent_days || 0}</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 font-medium mb-1">Total Earned</div>
                  <div className="text-xl font-bold text-blue-900">
                    ₹{workerWorkHistory?.total_wage_earned?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-700 font-medium mb-1">Avg Per Day</div>
                  <div className="text-xl font-bold text-purple-900">
                    ₹{workerWorkHistory?.present_days > 0 
                      ? Math.round(workerWorkHistory.total_wage_earned / workerWorkHistory.present_days).toLocaleString()
                      : '0'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {(dateFilter === 'all' || dateFilter === 'this_year') && workerWorkHistory?.history?.length > 0 ? (
                  // Month-wise grouped view
                  <div className="space-y-6">
                    {groupByMonth(workerWorkHistory.history).map((monthGroup, monthIdx) => (
                      <div key={monthIdx} className="border-2 border-blue-200 rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-bold">{monthGroup.monthLabel}</h3>
                            <p className="text-xs opacity-90">{monthGroup.count} days</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">₹{monthGroup.totalAmount.toLocaleString()}</div>
                            <div className="text-xs opacity-90">Monthly Earned</div>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-green-50 border-b border-green-200">
                                <th className="text-left py-2 px-3 text-xs font-semibold text-green-900">Date</th>
                                <th className="text-center py-2 px-3 text-xs font-semibold text-green-900">Status</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-green-900">Employer</th>
                                <th className="text-right py-2 px-3 text-xs font-semibold text-green-900">Wage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {monthGroup.records.map((record, idx) => (
                                <tr key={idx} className={`border-b border-gray-100 hover:bg-green-50 ${
                                  record.status === 'Absent' ? 'bg-red-50' : 
                                  record.status === 'Present' ? 'bg-green-50' : ''
                                }`}>
                                  <td className="py-2 px-3 text-xs font-medium">{record.date}</td>
                                  <td className="py-2 px-3 text-xs text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                      record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {record.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-xs">
                                    {record.employer_name ? (
                                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                                        {record.employer_name}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-xs">-</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-right font-semibold text-green-600">
                                    ₹{record.wage_earned?.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Regular detailed view for specific date ranges
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-50 border-b-2 border-blue-200">
                          <th className="text-left py-3 px-3 text-sm font-semibold text-blue-900">Date</th>
                          <th className="text-center py-3 px-3 text-sm font-semibold text-blue-900">Status</th>
                          <th className="text-left py-3 px-3 text-sm font-semibold text-blue-900">Employer</th>
                          <th className="text-right py-3 px-3 text-sm font-semibold text-blue-900">Wage Earned</th>
                          <th className="text-right py-3 px-3 text-sm font-semibold text-blue-900">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workerWorkHistory?.history?.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-8 text-gray-500">
                              No work history found for the selected period
                            </td>
                          </tr>
                        ) : (
                          workerWorkHistory?.history?.map((record, idx) => (
                            <tr key={idx} className={`border-b border-gray-100 hover:bg-blue-50 ${
                              record.status === 'Absent' ? 'bg-red-50' : 
                              record.status === 'Present' ? 'bg-green-50' : ''
                            }`}>
                              <td className="py-3 px-3 text-sm font-medium">{record.date}</td>
                              <td className="py-3 px-3 text-sm text-center">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {record.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-sm">
                                {record.employer_name ? (
                                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                    {record.employer_name}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">-</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-sm text-right font-semibold text-green-600">
                                ₹{record.wage_earned?.toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-sm text-right font-bold text-blue-600">
                                ₹{record.cumulative_wage?.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Reverse Confirmation Dialog */}
      <Dialog open={reverseConfirmDialog.open} onOpenChange={(open) => setReverseConfirmDialog({ ...reverseConfirmDialog, open })}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
          <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-red-50 via-white to-amber-50/50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25 flex-shrink-0">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Confirm Reversal</DialogTitle>
                <DialogDescription className="mt-1 text-gray-600">This will reverse the {reverseConfirmDialog.type === 'payment' ? 'payment collection' : 'wage settlement'} and update balances accordingly.</DialogDescription>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-2">What will happen:</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {reverseConfirmDialog.type === 'payment' ? (
                      <><li>• Payment record will be deleted</li><li>• ₹{reverseConfirmDialog.amount.toLocaleString()} will be added back to employer&apos;s pending payment</li><li>• Attendance records will remain unchanged</li></>
                    ) : (
                      <><li>• Settlement record will be deleted</li><li>• ₹{reverseConfirmDialog.amount.toLocaleString()} will be added back to worker&apos;s pending wage</li><li>• Any deducted advances will be restored</li></>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm font-semibold text-red-900">Amount to be reversed: ₹{reverseConfirmDialog.amount.toLocaleString()}</p>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button variant="outline" onClick={() => setReverseConfirmDialog({ open: false, type: null, id: null, amount: 0 })} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
            <Button onClick={confirmReverse} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 px-6 font-semibold">Confirm Reversal</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Phone Number Dialog */}
      <Dialog open={whatsappPhoneDialogOpen} onOpenChange={setWhatsappPhoneDialogOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 gap-0 overflow-hidden border-gray-200/80 shadow-2xl">
          <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-green-50 via-white to-emerald-50/50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25 flex-shrink-0">
                <MessageCircle className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Enter Phone Number</DialogTitle>
                <DialogDescription className="mt-1 text-gray-600">Mobile number for {whatsappEmployer?.employer_name || 'this employer'} to send WhatsApp message.</DialogDescription>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone" className="text-sm font-semibold text-gray-800">Mobile Number *</Label>
              <Input id="whatsapp-phone" type="tel" placeholder="Enter 10-digit mobile number" value={whatsappPhoneNumber} onChange={(e) => { const value = e.target.value.replace(/\D/g, '').slice(0, 10); setWhatsappPhoneNumber(value); }} className="text-lg font-medium border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 h-11 rounded-xl" autoFocus />
              <p className="text-xs text-gray-500">10-digit number without country code</p>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button variant="outline" onClick={() => { setWhatsappPhoneDialogOpen(false); setWhatsappPhoneNumber(''); setWhatsappEmployer(null); }} className="rounded-xl h-11 px-5 border-gray-300">Cancel</Button>
            <Button onClick={handleSavePhoneAndSendWhatsApp} disabled={!whatsappPhoneNumber || whatsappPhoneNumber.length < 10} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25 rounded-xl h-11 px-6 font-semibold">Save & Send</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settle All Confirmation Dialog */}
      <Dialog open={settleAllDialogOpen} onOpenChange={setSettleAllDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 text-xl">
              <CheckCircle className="h-6 w-6" />
              Settle All Workers
            </DialogTitle>
            <DialogDescription>
              Review the details before settling all workers with pending amounts
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {(() => {
              const workersToSettle = workerSummaries.filter(w => w.net_pending > 0);
              const totalAmount = workersToSettle.reduce((sum, w) => sum + w.net_pending, 0);
              const totalAdvance = workersToSettle.reduce((sum, w) => sum + (w.advance_paid || w.advance_balance || 0), 0);
              const totalCharges = workersToSettle.reduce((sum, w) => sum + (w.extra_charges || 0), 0);
              const totalPending = workersToSettle.reduce((sum, w) => sum + (w.pending_settlement || w.pending_wage || 0), 0);

              return (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">Total Workers</p>
                      <p className="text-xl font-bold text-blue-900">{workersToSettle.length}</p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-green-900">₹{totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-600 mb-1">Total Advance</p>
                      <p className="text-xl font-bold text-amber-900">₹{totalAdvance.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600 mb-1">Total Charges</p>
                      <p className="text-xl font-bold text-red-900">₹{totalCharges.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Settlement Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Pending Wage:</span>
                        <span className="font-semibold">₹{totalPending.toLocaleString()}</span>
                      </div>
                      {totalAdvance > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Less: Advance Deducted:</span>
                          <span className="font-semibold text-amber-600">-₹{totalAdvance.toLocaleString()}</span>
                        </div>
                      )}
                      {totalCharges > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Less: Extra Charges:</span>
                          <span className="font-semibold text-red-600">-₹{totalCharges.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-300 flex justify-between">
                        <span className="font-semibold text-gray-900">Net Payable:</span>
                        <span className="font-bold text-green-600 text-lg">₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Worker List */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-900">Workers to be Settled ({workersToSettle.length})</h4>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Worker</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Pending</th>
                            {totalAdvance > 0 && (
                              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Advance</th>
                            )}
                            {totalCharges > 0 && (
                              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Charges</th>
                            )}
                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Net Payable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {workersToSettle.map((worker) => (
                            <tr key={worker.worker_id} className="hover:bg-gray-50">
                              <td className="py-2 px-3 font-medium text-gray-900">{worker.worker_name}</td>
                              <td className="py-2 px-3 text-right text-gray-700">
                                ₹{(worker.pending_settlement || worker.pending_wage || 0).toLocaleString()}
                              </td>
                              {totalAdvance > 0 && (
                                <td className="py-2 px-3 text-right text-amber-600">
                                  {(worker.advance_paid || worker.advance_balance || 0) > 0 ? (
                                    `₹${(worker.advance_paid || worker.advance_balance || 0).toLocaleString()}`
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              )}
                              {totalCharges > 0 && (
                                <td className="py-2 px-3 text-right text-red-600">
                                  {(worker.extra_charges || 0) > 0 ? (
                                    `₹${(worker.extra_charges || 0).toLocaleString()}`
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              )}
                              <td className="py-2 px-3 text-right font-semibold text-green-600">
                                ₹{worker.net_pending.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-1">Important:</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>• All {workersToSettle.length} worker(s) will be settled with their net payable amounts</li>
                          <li>• Advance amounts and extra charges will be deducted automatically</li>
                          <li>• Each settlement will be recorded in payment history</li>
                          <li>• This action cannot be undone easily (you can reverse individual settlements if needed)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setSettleAllDialogOpen(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSettleAll}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm & Settle All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
