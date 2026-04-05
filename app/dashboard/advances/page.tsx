'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdvancesPage() {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    workerId: '',
    amount: '',
    reason: '',
    deductionMonths: '1',
  });
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    fetchAdvances();
    fetchWorkers();
  }, []);

  const fetchAdvances = async () => {
    try {
      const res = await axios.get('/api/advances');
      setAdvances(res.data.advances);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await axios.get('/api/workers');
      setWorkers(res.data.workers);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/advances', formData);
      setFormData({ workerId: '', amount: '', reason: '', deductionMonths: '1' });
      setShowForm(false);
      await fetchAdvances();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Advances</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'Request Advance'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card p-6 rounded-lg border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Worker</label>
                <select
                  value={formData.workerId}
                  onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select worker</option>
                  {workers.map((w: any) => (
                    <option key={w.id} value={w.id}>
                      {w.user.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deduction Months</label>
                <input
                  type="number"
                  value={formData.deductionMonths}
                  onChange={(e) => setFormData({ ...formData, deductionMonths: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90"
            >
              Request Advance
            </button>
          </form>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {advances.length === 0 ? (
          <p className="p-6 text-muted-foreground">No advances yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Worker</th>
                <th className="px-6 py-3 text-left font-semibold">Amount</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Deduction Months</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {advances.map((adv: any) => (
                <tr key={adv.id}>
                  <td className="px-6 py-4">{adv.worker.user.fullName}</td>
                  <td className="px-6 py-4 font-semibold">₹{adv.amount}</td>
                  <td className="px-6 py-4">{adv.status}</td>
                  <td className="px-6 py-4">{adv.deductionMonths}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
