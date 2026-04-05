'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/payments');
        setPayments(res.data.payments);
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
      <h1 className="text-4xl font-bold">Payments</h1>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {payments.length === 0 ? (
          <p className="p-6 text-muted-foreground">No payments yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Transaction ID</th>
                <th className="px-6 py-3 text-left font-semibold">Amount</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment: any) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 font-mono text-sm">{payment.transactionId}</td>
                  <td className="px-6 py-4 font-semibold">₹{payment.amount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
