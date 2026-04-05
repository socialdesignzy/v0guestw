'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Worker {
  id: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
  aadharNumber: string;
  panNumber: string;
  totalEarnings: number;
  totalAttendance: number;
  status: string;
  createdAt: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    aadharNumber: '',
    panNumber: '',
    emergencyContact: '',
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get('/api/workers');
      setWorkers(response.data.workers || []);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post('/api/workers', formData);
      setFormData({
        email: '',
        fullName: '',
        phone: '',
        aadharNumber: '',
        panNumber: '',
        emergencyContact: '',
      });
      setShowForm(false);
      await fetchWorkers();
    } catch (error) {
      console.error('Failed to add worker:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading workers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Workers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'Add Worker'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card p-6 rounded-lg border border-border">
          <form onSubmit={handleAddWorker} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Aadhar Number</label>
                <input
                  type="text"
                  value={formData.aadharNumber}
                  onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">PAN Number</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Emergency Contact</label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90"
            >
              Add Worker
            </button>
          </form>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {workers.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No workers yet. Add your first worker to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Earnings</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Attendance</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">{worker.user.fullName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{worker.user.email}</td>
                  <td className="px-6 py-4 text-sm">{worker.user.phone}</td>
                  <td className="px-6 py-4 font-semibold">₹{worker.totalEarnings.toLocaleString()}</td>
                  <td className="px-6 py-4">{worker.totalAttendance} days</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        worker.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {worker.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
