import React, { useState, useEffect } from 'react';
import adminApi from '../utils/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await adminApi.activateUser(userId);
      toast.success('User activated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await adminApi.deactivateUser(userId);
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6" data-testid="admin-page">
      <div>
        <h1 className="text-3xl font-bold" style={{fontFamily: 'Manrope, sans-serif'}}>Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage all users and subscriptions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No users found</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id} className="p-4" data-testid={`user-card-${user.id}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
                          {user.subscription_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                      {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-600">Plan: <span className="font-medium capitalize">{user.subscription_plan}</span></span>
                        <span className="text-gray-600">Joined: <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span></span>
                      </div>
                    </div>
                    {user.role !== 'admin' && (
                      <div className="flex gap-2">
                        {user.subscription_status === 'inactive' ? (
                          <Button size="sm" onClick={() => handleActivate(user.id)} data-testid={`activate-user-${user.id}`}>
                            <Check className="mr-1 h-4 w-4" />
                            Activate
                          </Button>
                        ) : (
                          <Button size="sm" variant="destructive" onClick={() => handleDeactivate(user.id)} data-testid={`deactivate-user-${user.id}`}>
                            <X className="mr-1 h-4 w-4" />
                            Deactivate
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
