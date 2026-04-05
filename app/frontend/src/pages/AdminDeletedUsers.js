import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import adminApi from '../utils/adminApi';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, UserX, Calendar, Mail, Phone, Users, Briefcase, 
  ClipboardList, CreditCard, Filter, Search, RefreshCw, AlertTriangle
} from 'lucide-react';

const AdminDeletedUsers = () => {
  const navigate = useNavigate();
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ skip: 0, limit: 50, total: 0 });

  useEffect(() => {
    loadDeletedUsers();
    loadStats();
  }, [filterType, pagination.skip]);

  const loadDeletedUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDeletedUsers(filterType, pagination.skip, pagination.limit);
      setDeletedUsers(res.data.deleted_users || []);
      setPagination(prev => ({ ...prev, total: res.data.total }));
    } catch (e) {
      console.error('Failed to load deleted users', e);
      toast.error('Failed to load deleted users');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await adminApi.getDeletedUsersStats();
      setStats(res.data);
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  const getDeletionTypeBadge = (type) => {
    const types = {
      'user_requested': { label: 'User Requested', color: 'bg-blue-100 text-blue-700' },
      'admin_approved': { label: 'Admin Approved', color: 'bg-purple-100 text-purple-700' },
      'auto_inactive': { label: 'Auto Cleanup', color: 'bg-orange-100 text-orange-700' }
    };
    const config = types[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const filteredUsers = deletedUsers.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.contractor_name?.toLowerCase().includes(query) ||
      user.contractor_email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserX className="h-8 w-8 text-red-600" />
              Deleted Users Archive
            </h1>
            <p className="text-gray-600 mt-1">View archived information of deleted user accounts</p>
          </div>
          <Button onClick={loadDeletedUsers} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Deleted</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_deleted}</p>
                </div>
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">User Requested</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.by_type.user_requested}</p>
                </div>
                <UserX className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Auto Cleanup</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.by_type.auto_inactive}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last 30 Days</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.recent_deletions_30_days}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === null ? "default" : "outline"}
                onClick={() => setFilterType(null)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                All
              </Button>
              <Button
                variant={filterType === 'user_requested' ? "default" : "outline"}
                onClick={() => setFilterType('user_requested')}
              >
                User Requested
              </Button>
              <Button
                variant={filterType === 'auto_inactive' ? "default" : "outline"}
                onClick={() => setFilterType('auto_inactive')}
              >
                Auto Cleanup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deleted Users List */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading deleted users...</p>
          </CardContent>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UserX className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No deleted users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {user.contractor_name}
                      {getDeletionTypeBadge(user.deletion_type)}
                    </CardTitle>
                    <CardDescription className="mt-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {user.contractor_email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      Deleted: {formatDate(user.deleted_at)}
                    </div>
                    {user.deleted_by && (
                      <div className="text-xs mt-1">By: {user.deleted_by}</div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Workers</p>
                      <p className="font-semibold">{user.total_workers}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-600">Employers</p>
                      <p className="font-semibold">{user.total_employers}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-600">Attendance</p>
                      <p className="font-semibold">{user.total_attendance_records}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">Payments</p>
                      <p className="font-semibold">{user.total_payments}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-600">
                    {user.subscription_plan && (
                      <div>
                        <span className="font-medium">Plan:</span> {user.subscription_plan}
                      </div>
                    )}
                    {user.subscription_status && (
                      <div>
                        <span className="font-medium">Status:</span> {user.subscription_status}
                      </div>
                    )}
                    {user.account_created_at && (
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(user.account_created_at)}
                      </div>
                    )}
                    {user.last_login_at && (
                      <div>
                        <span className="font-medium">Last Login:</span> {formatDate(user.last_login_at)}
                      </div>
                    )}
                    {user.deletion_reason && (
                      <div className="col-span-2">
                        <span className="font-medium">Reason:</span> {user.deletion_reason}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
              disabled={pagination.skip === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
              disabled={pagination.skip + pagination.limit >= pagination.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeletedUsers;
