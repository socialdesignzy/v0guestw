import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
  CreditCard,
  RefreshCw,
  Wrench,
  CheckCircle,
  XCircle,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '../utils/adminApi';

export default function AdminPaymentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [gateway, setGateway] = useState(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  const checkAuth = async () => {
    try {
      await adminApi.getAdminProfile();
    } catch {
      navigate('/admin/login');
    }
  };

  const fetchGateway = async () => {
    try {
      const res = await adminApi.getGatewayStatus();
      setGateway(res.data);
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      setGateway({ configured: false, active: false, maintenance: false });
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { skip: 0, limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getPaymentOrders(params);
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      toast.error('Failed to load payment orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchGateway();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleMaintenanceToggle = async () => {
    if (!gateway) return;
    setMaintenanceLoading(true);
    try {
      await adminApi.setPaymentMaintenance(!gateway.maintenance);
      toast.success('Maintenance mode ' + (gateway.maintenance ? 'disabled' : 'enabled'));
      await fetchGateway();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to update maintenance');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const planDisplay = (o) => o.plan_type || o.plan_name || '–';
  const methodDisplay = (o) =>
    o.payment_method === 'activation_key' ? 'Activation key' : 'Razorpay';
  const statusBadge = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'paid' || v === 'success') return <Badge className="bg-green-600">{s}</Badge>;
    if (v === 'failed') return <Badge className="bg-red-600">{s}</Badge>;
    if (v === 'created') return <Badge className="bg-amber-500">{s}</Badge>;
    return <Badge variant="outline">{s || '–'}</Badge>;
  };
  const formatDate = (d) => (d ? new Date(d).toLocaleString('en-IN') : '–');
  const formatAmount = (a) =>
    a != null && a > 0 ? `₹${Number(a).toLocaleString('en-IN')}` : '–';

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Payment Orders & Gateway</h1>

        {/* Gateway & Maintenance */}
        <Card className="border-2 border-gray-200/80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Payment Gateway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                {gateway?.configured ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {gateway?.configured ? 'Configured' : 'Not configured'}
                </span>
              </div>
              {gateway?.test_mode && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  Test mode
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Active:</span>
                {gateway?.active ? (
                  <Badge className="bg-green-600">Yes</Badge>
                ) : (
                  <Badge className="bg-gray-500">No</Badge>
                )}
              </div>
              {gateway?.maintenance && (
                <Badge className="bg-amber-500">Maintenance mode on</Badge>
              )}
              <Button
                size="sm"
                variant={gateway?.maintenance ? 'default' : 'outline'}
                onClick={handleMaintenanceToggle}
                disabled={maintenanceLoading || !gateway?.configured}
                className="ml-auto"
              >
                <Wrench className="h-4 w-4 mr-2" />
                {maintenanceLoading ? 'Updating…' : gateway?.maintenance ? 'Disable maintenance' : 'Enable maintenance'}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              When maintenance is on, the public gateway is inactive and the pricing page shows a maintenance message.
            </p>
          </CardContent>
        </Card>

        {/* Payment orders */}
        <Card className="border-2 border-gray-200/80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="success">Success (key)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No payment orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((o) => (
                      <TableRow key={o.id || o.razorpay_order_id || o.contractor_id + (o.created_at || '')}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{o.contractor_name || '–'}</div>
                            <div className="text-xs text-gray-500">{o.contractor_email || o.contractor_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatAmount(o.amount)}</TableCell>
                        <TableCell>{planDisplay(o)}</TableCell>
                        <TableCell>
                          {o.payment_method === 'activation_key' ? (
                            <span className="inline-flex items-center gap-1">
                              <Key className="h-3.5 w-3.5" /> Activation key
                            </span>
                          ) : (
                            'Razorpay'
                          )}
                        </TableCell>
                        <TableCell>{statusBadge(o.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDate(o.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {total > 0 && (
              <div className="px-4 py-2 text-sm text-gray-500 border-t">
                Total: {total} order{total !== 1 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
