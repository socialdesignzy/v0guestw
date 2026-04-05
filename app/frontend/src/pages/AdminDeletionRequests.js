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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { ArrowLeft, RefreshCw, Trash2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '../utils/adminApi';

export default function AdminDeletionRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const checkAuth = async () => {
    try {
      await adminApi.getAdminProfile();
    } catch {
      navigate('/admin/login');
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { skip: 0, limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getDeletionRequests(params);
      setRequests(res.data.requests || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      toast.error('Failed to load deletion requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await adminApi.approveDeletionRequest(selected.id);
      toast.success('Account and data deleted');
      setApproveOpen(false);
      setSelected(null);
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await adminApi.rejectDeletionRequest(selected.id);
      toast.success('Request rejected');
      setRejectOpen(false);
      setSelected(null);
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'pending') return <Badge className="bg-amber-500">{s}</Badge>;
    if (v === 'approved') return <Badge className="bg-green-600">{s}</Badge>;
    if (v === 'rejected') return <Badge className="bg-gray-500">{s}</Badge>;
    return <Badge variant="outline">{s || '–'}</Badge>;
  };
  const formatDate = (d) => (d ? new Date(d).toLocaleString('en-IN') : '–');

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Deletion Requests</h1>
            <p className="text-gray-600 mt-0.5">
              Review and approve or reject contractor account deletion requests. Approval permanently deletes all user data.
            </p>
          </div>
        </div>

        <Card className="border-2 border-gray-200/80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Requests</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
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
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No deletion requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{r.contractor_name || '–'}</div>
                            <div className="text-xs text-gray-500">{r.contractor_email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate text-gray-600" title={r.reason || ''}>
                          {r.reason || '–'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDate(r.requested_at)}</TableCell>
                        <TableCell>{statusBadge(r.status)}</TableCell>
                        <TableCell>
                          {r.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelected(r);
                                  setApproveOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelected(r);
                                  setRejectOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {total > 0 && (
              <div className="px-4 py-2 text-sm text-gray-500 border-t">
                Total: {total} request{total !== 1 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve deletion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account for <strong>{selected?.contractor_name}</strong> ({selected?.contractor_email})
              and all associated data (workers, employers, attendance, payments, etc.). This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Deleting…' : 'Approve & delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject deletion request?</AlertDialogTitle>
            <AlertDialogDescription>
              The request from <strong>{selected?.contractor_name}</strong> will be marked as rejected. Their account will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={actionLoading}>
              {actionLoading ? 'Rejecting…' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
