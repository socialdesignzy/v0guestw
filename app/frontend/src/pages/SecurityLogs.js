import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { 
  Shield, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Filter, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Globe,
  AlertCircle,
  TrendingUp,
  Activity,
  ArrowLeft,
  Eye,
  CheckCheck,
  Square,
  CheckSquare
} from 'lucide-react';
import adminApi from '../utils/adminApi';

export default function SecurityLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total_events: 0,
    by_severity: { critical: 0, high: 0, medium: 0, low: 0 },
    by_type: {},
    top_ips: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [pagination, setPagination] = useState({ total: 0, skip: 0, limit: 100, has_more: false });
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    event_type: 'all',
    severity: 'all',
    ip_address: '',
    email: '',
    time_range: '24h',
    resolved: 'false',
  });

  useEffect(() => {
    // Wrap in try-catch to prevent component crashes
    try {
      fetchLogs();
    } catch (error) {
      console.error('Error in useEffect:', error);
      setLoading(false);
    }
  }, [filters.event_type, filters.severity, filters.time_range, filters.resolved]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        skip: pagination.skip,
        limit: pagination.limit,
      };
      
      // Convert "all" to empty string and remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === 'all') {
          params[key] = '';
        }
        if (!params[key] || params[key] === '') {
          delete params[key];
        }
      });

      const response = await adminApi.getSecurityLogs(params);
      
      // Safely set data with fallbacks
      setLogs(response.data?.logs || []);
      setStats(response.data?.stats || {
        total_events: 0,
        by_severity: { critical: 0, high: 0, medium: 0, low: 0 },
        by_type: {},
        top_ips: []
      });
      setPagination(response.data?.pagination || { total: 0, skip: 0, limit: 100, has_more: false });
    } catch (error) {
      console.error('Failed to fetch security logs:', error);
      toast.error('Failed to load security logs: ' + (error.response?.data?.detail || error.message));
      // Set safe defaults on error
      setLogs([]);
      setStats({
        total_events: 0,
        by_severity: { critical: 0, high: 0, medium: 0, low: 0 },
        by_type: {},
        top_ips: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, skip: 0 });
    fetchLogs();
  };

  const handleAcknowledge = async (logId) => {
    try {
      await adminApi.acknowledgeSecurityLog(logId);
      toast.success('Security log acknowledged');
      fetchLogs();
    } catch (error) {
      console.error('Failed to acknowledge log:', error);
      toast.error('Failed to acknowledge: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleResolve = async () => {
    if (!selectedLog) return;
    
    try {
      if (!selectedLog.id) {
        toast.error('Invalid log ID');
        return;
      }
      await adminApi.resolveSecurityLog(selectedLog.id, resolveNotes);
      toast.success('Security log marked as resolved');
      setSelectedLog(null);
      setResolveNotes('');
      fetchLogs();
    } catch (error) {
      console.error('Failed to resolve log:', error);
      toast.error('Failed to resolve security log: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleBulkAcknowledge = async () => {
    if (selectedLogs.length === 0) {
      toast.error('No logs selected');
      return;
    }

    setBulkActionLoading(true);
    try {
      const response = await adminApi.bulkAcknowledgeSecurityLogs(selectedLogs);
      toast.success(response.data.message);
      setSelectedLogs([]);
      fetchLogs();
    } catch (error) {
      console.error('Failed to bulk acknowledge:', error);
      toast.error('Failed to acknowledge logs: ' + (error.response?.data?.detail || error.message));
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleSelectLog = (logId) => {
    setSelectedLogs(prev => 
      prev.includes(logId) ? prev.filter(id => id !== logId) : [...prev, logId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map(log => log.id));
    }
  };

  const getSeverityColor = (severity) => {
    if (!severity) return 'bg-gray-100 text-gray-700 border border-gray-300';
    const severityLower = severity.toLowerCase();
    switch (severityLower) {
      case 'critical': return 'bg-red-100 text-red-700 border border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-700 border border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getEventTypeLabel = (eventType) => {
    if (!eventType) return 'Unknown Event';
    try {
      return eventType.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    } catch (error) {
      console.error('Error formatting event type:', error);
      return eventType || 'Unknown Event';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown Time';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown Time';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/admin/dashboard')} 
                variant="outline" 
                size="icon"
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-[#3B2ED0]" />
                  Security Monitor
                </h1>
                <p className="text-gray-600 mt-1">Review and manage security events</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedLogs.length > 0 && (
                <Button 
                  onClick={handleBulkAcknowledge} 
                  disabled={bulkActionLoading}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Acknowledge {selectedLogs.length} Selected
                </Button>
              )}
              <Button onClick={fetchLogs} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats?.total_events || 0}</div>
                <p className="text-sm text-gray-500 mt-1">In selected period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Critical
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats?.by_severity?.critical || 0}</div>
                <p className="text-sm text-gray-500 mt-1">Requires immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  High
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats?.by_severity?.high || 0}</div>
                <p className="text-sm text-gray-500 mt-1">High priority events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Failed Logins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{(stats?.by_type?.failed_login || 0) + (stats?.by_type?.admin_login_failed || 0)}</div>
                <p className="text-sm text-gray-500 mt-1">Blocked attempts</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>Severity</Label>
                <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Event Type</Label>
                <Select value={filters.event_type} onValueChange={(value) => setFilters({ ...filters, event_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="failed_login">Failed Login</SelectItem>
                    <SelectItem value="admin_login_failed">Admin Login Failed</SelectItem>
                    <SelectItem value="account_locked">Account Locked</SelectItem>
                    <SelectItem value="disposable_email">Disposable Email</SelectItem>
                    <SelectItem value="weak_password">Weak Password</SelectItem>
                    <SelectItem value="registration_blocked">Registration Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Time Range</Label>
                <Select value={filters.time_range} onValueChange={(value) => setFilters({ ...filters, time_range: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filters.resolved} onValueChange={(value) => setFilters({ ...filters, resolved: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Unresolved</SelectItem>
                    <SelectItem value="true">Resolved</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Search</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="IP or Email" 
                    value={filters.email || filters.ip_address}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value, ip_address: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top IPs */}
        {stats && stats.top_ips && stats.top_ips.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Top Suspicious IPs
              </CardTitle>
              <CardDescription>IP addresses with the most security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.top_ips.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => setFilters({ ...filters, ip_address: item.ip })}>
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-sm">{item.ip}</span>
                    </div>
                    <Badge variant="destructive">{item.count} events</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Security Events Log</CardTitle>
            <CardDescription>
              Showing {logs.length} of {pagination.total} events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                <p className="text-gray-500 mt-2">Loading security logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No security events found</p>
                <p className="text-sm text-gray-400">Your system is secure!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Select All Header */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectAll();
                    }}
                    className="flex items-center justify-center h-5 w-5 rounded border-2 border-gray-400 hover:border-blue-500 transition-colors"
                  >
                    {selectedLogs.length === logs.length && logs.length > 0 ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedLogs.length > 0 ? `${selectedLogs.length} selected` : 'Select all'}
                  </span>
                </div>

                {logs.map((log, index) => (
                  <div
                    key={log.id || `log-${index}`}
                    className={`border rounded-lg p-4 transition-all ${
                      selectedLogs.includes(log.id) 
                        ? 'bg-blue-50 border-blue-300 shadow-md' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectLog(log.id);
                        }}
                        className="flex items-center justify-center h-5 w-5 rounded border-2 border-gray-400 hover:border-blue-500 transition-colors mt-1"
                      >
                        {selectedLogs.includes(log.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity ? log.severity.toUpperCase() : 'UNKNOWN'}
                          </Badge>
                          <span className="font-medium text-gray-900">
                            {getEventTypeLabel(log.event_type)}
                          </span>
                          {log.acknowledged && !log.resolved && (
                            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                              <Eye className="h-3 w-3 mr-1" />
                              Acknowledged
                            </Badge>
                          )}
                          {log.resolved && (
                            <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {log.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span className="truncate">{log.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Globe className="h-4 w-4" />
                            <span className="font-mono text-xs">{log.ip_address || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimestamp(log.timestamp)}</span>
                          </div>
                          {log.endpoint && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{log.endpoint}</span>
                            </div>
                          )}
                        </div>

                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                            <strong>Details:</strong> {JSON.stringify(log.details)}
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          {!log.acknowledged && !log.resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcknowledge(log.id);
                              }}
                              className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            className="text-xs"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.has_more && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPagination({ ...pagination, skip: pagination.skip + pagination.limit });
                    fetchLogs();
                  }}
                >
                  Load More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log Details Dialog */}
      <Dialog open={selectedLog !== null} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Security Event Details
            </DialogTitle>
            <DialogDescription>
              Event ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Severity</Label>
                  <Badge className={`${getSeverityColor(selectedLog.severity)} mt-1`}>
                    {selectedLog.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-600">Event Type</Label>
                  <p className="font-medium mt-1">{getEventTypeLabel(selectedLog.event_type)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">IP Address</Label>
                  <p className="font-mono text-sm mt-1">{selectedLog.ip_address}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Timestamp</Label>
                  <p className="text-sm mt-1">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
              </div>

              {selectedLog.email && (
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium mt-1">{selectedLog.email}</p>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <Label className="text-gray-600">User Agent</Label>
                  <p className="text-sm text-gray-700 mt-1 break-all">{selectedLog.user_agent}</p>
                </div>
              )}

              {selectedLog.endpoint && (
                <div>
                  <Label className="text-gray-600">Endpoint</Label>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-sm">{selectedLog.endpoint}</code>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <Label className="text-gray-600">Additional Details</Label>
                  <pre className="bg-gray-100 p-3 rounded mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.resolved ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                    <CheckCircle className="h-5 w-5" />
                    Resolved
                  </div>
                  <p className="text-sm text-green-700">
                    Resolved by: {selectedLog.resolved_by || 'Unknown'}
                  </p>
                  {selectedLog.notes && (
                    <p className="text-sm text-green-700 mt-1">
                      Notes: {selectedLog.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Mark as Resolved</Label>
                  <Textarea
                    placeholder="Add notes about this security event (optional)..."
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleResolve} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

