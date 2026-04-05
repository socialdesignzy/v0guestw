import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  ArrowLeft,
  DollarSign,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Key,
  Download,
  ExternalLink,
  Receipt,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import adminApi from '../utils/adminApi';

const RAZORPAY_DASHBOARD_PAYMENTS = 'https://dashboard.razorpay.com/app/payments';
const RAZORPAY_DASHBOARD_ORDERS = 'https://dashboard.razorpay.com/app/orders';

export default function AdminPlatformRevenue() {
  const navigate = useNavigate();
  const [data, setData] = useState({ total_amount: 0, by_method: {}, total_count: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('');
  const [skip, setSkip] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const limit = 50;

  const checkAuth = async () => {
    try {
      await adminApi.getAdminProfile();
    } catch {
      navigate('/admin/login');
    }
  };

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const params = { skip, limit };
      if (methodFilter) params.payment_method = methodFilter;
      const res = await adminApi.getPlatformRevenue(params);
      setData(res.data || {});
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      toast.error('Failed to load platform revenue');
      setData({ total_amount: 0, by_method: {}, total_count: 0, items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [methodFilter, skip]);

  const formatDate = (d) => (d ? new Date(d).toLocaleString('en-IN') : '–');
  const formatAmount = (a) =>
    a != null && a > 0 ? `₹${Number(a).toLocaleString('en-IN')}` : '₹0';

  const methodLabel = (m) => {
    if (m === 'razorpay') return 'Razorpay';
    if (m === 'razorpay_subscription') return 'Razorpay (Recurring)';
    if (m === 'activation_key') return 'Activation Key (Paid)';
    return m || '–';
  };

  const handleDeleteOne = async (id) => {
    setDeletingId(id);
    try {
      await adminApi.deletePlatformRevenueRecord(id);
      toast.success('Revenue record deleted');
      fetchRevenue();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    setDeleteAllLoading(true);
    try {
      const res = await adminApi.deleteAllPlatformRevenueRecords();
      toast.success(`Deleted ${res.data?.deleted_count ?? 0} revenue record(s)`);
      setDeleteAllOpen(false);
      fetchRevenue();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to delete all');
    } finally {
      setDeleteAllLoading(false);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ['Date', 'User', 'Email', 'Amount (₹)', 'Payment Method', 'Plan', 'Razorpay Payment ID', 'Razorpay Order ID', 'Activation Key'].join(','),
      ...(data.items || []).map((i) =>
        [
          formatDate(i.created_at),
          `"${(i.contractor_name || '').replace(/"/g, '""')}"`,
          `"${(i.contractor_email || '').replace(/"/g, '""')}"`,
          i.amount ?? '',
          methodLabel(i.payment_method),
          `"${(i.plan_name || '').replace(/"/g, '""')}"`,
          i.razorpay_payment_id || '',
          i.razorpay_order_id || '',
          i.activation_key || '',
        ].join(',')
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-revenue-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const byMethod = data.by_method || {};
  const items = data.items || [];
  const totalCount = data.total_count || 0;
  const hasMore = skip + items.length < totalCount;

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-[#3B2ED0]" />
            Platform Revenue
          </h1>
          <p className="text-gray-600 mt-1">
            All revenue: Razorpay payments, subscriptions, and paid activation keys. Use Razorpay IDs to find invoices in Razorpay Dashboard.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-[#3B2ED0]/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-[#3B2ED0]">{formatAmount(data.total_amount)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-[#3B2ED0]/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Razorpay (one-time)</p>
                  <p className="text-xl font-bold text-green-600">{formatAmount(byMethod.razorpay)}</p>
                </div>
                <CreditCard className="h-9 w-9 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Razorpay (Recurring)</p>
                  <p className="text-xl font-bold text-blue-600">{formatAmount(byMethod.razorpay_subscription)}</p>
                </div>
                <Receipt className="h-9 w-9 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activation Key (Paid)</p>
                  <p className="text-xl font-bold text-amber-600">{formatAmount(byMethod.activation_key)}</p>
                </div>
                <Key className="h-9 w-9 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and export */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Revenue records</CardTitle>
                <CardDescription>
                  {totalCount} record{totalCount !== 1 ? 's' : ''}. Filter by payment method or export CSV.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={methodFilter || 'all'} onValueChange={(v) => { setMethodFilter(v === 'all' ? '' : v); setSkip(0); }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    <SelectItem value="razorpay">Razorpay (one-time)</SelectItem>
                    <SelectItem value="razorpay_subscription">Razorpay (Recurring)</SelectItem>
                    <SelectItem value="activation_key">Activation Key (Paid)</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={items.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => setDeleteAllOpen(true)}
                  disabled={items.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete all
                </Button>
                <Button variant="ghost" size="sm" onClick={() => fetchRevenue()} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment method</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Razorpay / Invoice</TableHead>
                    <TableHead>Activation key</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                        No revenue records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((i) => (
                      <TableRow key={i.id || i.created_at + i.contractor_id}>
                        <TableCell className="whitespace-nowrap text-sm">{formatDate(i.created_at)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{i.contractor_name || '–'}</div>
                            <div className="text-xs text-gray-500">{i.contractor_email || '–'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-[#3B2ED0]">{formatAmount(i.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              i.payment_method === 'razorpay'
                                ? 'bg-green-600'
                                : i.payment_method === 'razorpay_subscription'
                                ? 'bg-blue-600'
                                : 'bg-amber-600'
                            }
                          >
                            {i.payment_method_label || methodLabel(i.payment_method)}
                          </Badge>
                        </TableCell>
                        <TableCell>{i.plan_name || '–'}</TableCell>
                        <TableCell>
                          {i.razorpay_payment_id || i.razorpay_order_id ? (
                            <div className="flex flex-wrap items-center gap-1">
                              {i.razorpay_payment_id && (
                                <a
                                  href={`${RAZORPAY_DASHBOARD_PAYMENTS}/${i.razorpay_payment_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5"
                                >
                                  {i.razorpay_payment_id}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {i.razorpay_order_id && !i.razorpay_payment_id && (
                                <a
                                  href={RAZORPAY_DASHBOARD_ORDERS}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-gray-600 hover:underline"
                                >
                                  {i.razorpay_order_id}
                                  <ExternalLink className="h-3 w-3 ml-0.5 inline" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">–</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {i.activation_key ? (
                            <code className="text-xs bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">{i.activation_key}</code>
                          ) : (
                            <span className="text-gray-400">–</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm('Delete this revenue record? This cannot be undone.')) {
                                handleDeleteOne(i.id);
                              }
                            }}
                            disabled={deletingId === i.id}
                          >
                            {deletingId === i.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {(skip > 0 || hasMore) && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-500">
                  Showing {skip + 1}–{skip + items.length} of {totalCount}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSkip(Math.max(0, skip - limit))} disabled={skip === 0}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSkip(skip + limit)} disabled={!hasMore}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all revenue records?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all {totalCount} revenue record(s). Platform revenue and dashboard totals will go to zero. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteAllLoading}>Cancel</AlertDialogCancel>
              <Button
                onClick={handleDeleteAll}
                disabled={deleteAllLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteAllLoading ? 'Deleting…' : 'Delete all'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
