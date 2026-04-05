'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/attendance');
        setAttendance(res.data.attendance);
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
      <h1 className="text-4xl font-bold">Attendance</h1>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {attendance.length === 0 ? (
          <p className="p-6 text-muted-foreground">No attendance records.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Worker</th>
                <th className="px-6 py-3 text-left font-semibold">Date</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Hours</th>
                <th className="px-6 py-3 text-left font-semibold">Wage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendance.map((att: any) => (
                <tr key={att.id}>
                  <td className="px-6 py-4">{att.worker.user.fullName}</td>
                  <td className="px-6 py-4">{new Date(att.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{att.status}</td>
                  <td className="px-6 py-4">{att.hoursWorked}</td>
                  <td className="px-6 py-4">₹{att.dailyWage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
