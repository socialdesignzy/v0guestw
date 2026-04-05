'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data.users);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">User Management</h1>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-left font-semibold">Verified</th>
              <th className="px-6 py-3 text-left font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user: any) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.fullName}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={user.verified ? 'text-green-600' : 'text-red-600'}>
                    {user.verified ? '✓' : '✗'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
