import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Search, ArrowLeft, Eye, Ban, CheckCircle, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
axios.defaults.withCredentials = true;

export default function AdminContractors() {
  const navigate = useNavigate();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contractorDetails, setContractorDetails] = useState(null);

  useEffect(() => {
    fetchContractors();
  }, [search, statusFilter]);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      
      const response = await axios.get(`${API}/admin/contractors`, { params });
      setContractors(response.data.contractors);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin/login');
      } else {
        toast.error('Failed to fetch contractors');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (contractor) => {
    try {
      const response = await axios.get(`${API}/admin/contractors/${contractor.id}`);
      setContractorDetails(response.data);
      setSelectedContractor(contractor);
      setShowDetailsDialog(true);
    } catch (error) {
      toast.error('Failed to fetch contractor details');
    }
  };

  const handleUpdateStatus = async (contractorId, newStatus) => {
    try {
      await axios.put(`${API}/admin/contractors/${contractorId}/status`, {
        subscription_status: newStatus
      });
      toast.success('Contractor status updated');
      fetchContractors();
      setShowDetailsDialog(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteContractor = async () => {
    if (!selectedContractor) return;
    
    try {
      await axios.delete(`${API}/admin/contractors/${selectedContractor.id}`);
      toast.success('Contractor deleted successfully');
      fetchContractors();
      setShowDeleteDialog(false);
      setSelectedContractor(null);
    } catch (error) {
      toast.error('Failed to delete contractor');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin/dashboard')}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Contractor Management</h1>
              <p className="text-purple-100 mt-1">View and manage all contractors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contractors List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Contractors ({contractors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading contractors...</p>
              </div>
            ) : contractors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No contractors found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Workers</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Employers</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Status</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractors.map((contractor) => (
                      <tr key={contractor.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{contractor.name}</td>
                        <td className="p-4 text-sm text-gray-600">{contractor.email}</td>
                        <td className="p-4 text-sm text-gray-600">{contractor.phone_number}</td>
                        <td className="p-4 text-center">{contractor.worker_count || 0}</td>
                        <td className="p-4 text-center">{contractor.employer_count || 0}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            contractor.subscription_status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : contractor.subscription_status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {contractor.subscription_status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleViewDetails(contractor)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedContractor(contractor);
                                setShowDeleteDialog(true);
                              }}
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contractor Details</DialogTitle>
          </DialogHeader>
          {contractorDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{contractorDetails.contractor.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{contractorDetails.contractor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{contractorDetails.contractor.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">{contractorDetails.contractor.subscription_status}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-blue-600">{contractorDetails.workers.length}</p>
                    <p className="text-sm text-gray-600">Workers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-green-600">{contractorDetails.employers.length}</p>
                    <p className="text-sm text-gray-600">Employers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-purple-600">{contractorDetails.attendance_count}</p>
                    <p className="text-sm text-gray-600">Attendance Records</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                {contractorDetails.contractor.subscription_status !== 'active' && (
                  <Button
                    onClick={() => handleUpdateStatus(contractorDetails.contractor.id, 'active')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
                {contractorDetails.contractor.subscription_status !== 'suspended' && (
                  <Button
                    onClick={() => handleUpdateStatus(contractorDetails.contractor.id, 'suspended')}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedContractor?.name}</strong>? 
            This will permanently delete all their data including workers, employers, attendance records, and payments.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContractor}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
