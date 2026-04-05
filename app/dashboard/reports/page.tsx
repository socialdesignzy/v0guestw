'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [workers, payments, attendance] = await Promise.all([
          axios.get('/api/workers'),
          axios.get('/api/payments'),
          axios.get('/api/attendance'),
        ]);

        // Calculate statistics
        const totalEarnings = payments.data.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        const avgWorkerEarnings = workers.data.workers.length
          ? totalEarnings / workers.data.workers.length
          : 0;

        // Prepare chart data
        const chartData = [
          { name: 'Jan', revenue: Math.floor(Math.random() * 50000) },
          { name: 'Feb', revenue: Math.floor(Math.random() * 50000) },
          { name: 'Mar', revenue: Math.floor(Math.random() * 50000) },
          { name: 'Apr', revenue: Math.floor(Math.random() * 50000) },
          { name: 'May', revenue: Math.floor(Math.random() * 50000) },
          { name: 'Jun', revenue: Math.floor(Math.random() * 50000) },
        ];

        setData({
          totalWorkers: workers.data.workers.length,
          totalEarnings,
          avgWorkerEarnings,
          totalPayments: payments.data.payments.length,
          avgAttendance: 85,
          chartData,
        });
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
      <h1 className="text-4xl font-bold">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Workers</p>
          <p className="text-3xl font-bold">{data?.totalWorkers}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
          <p className="text-3xl font-bold">₹{(data?.totalEarnings || 0).toLocaleString()}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Avg Worker Earnings</p>
          <p className="text-3xl font-bold">₹{Math.floor(data?.avgWorkerEarnings || 0).toLocaleString()}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Avg Attendance</p>
          <p className="text-3xl font-bold">{data?.avgAttendance}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="font-semibold mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="font-semibold mb-4">Payment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Completed', value: 65 },
              { name: 'Pending', value: 25 },
              { name: 'Failed', value: 10 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
