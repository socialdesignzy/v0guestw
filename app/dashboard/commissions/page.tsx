'use client'

import { useEffect, useState } from 'react'

interface Commission {
  id: string
  workerId: string
  workerName: string
  amount: number
  rate: number
  period: string
  status: 'pending' | 'calculated' | 'paid'
  createdAt: string
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')

  useEffect(() => {
    fetchCommissions()
  }, [filter])

  const fetchCommissions = async () => {
    try {
      const query = filter !== 'all' ? `?status=${filter}` : ''
      const response = await fetch(`/api/commissions${query}`)
      const data = await response.json()
      setCommissions(data.commissions || [])
    } catch (error) {
      console.error('Error fetching commissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayCommission = async (id: string) => {
    try {
      const response = await fetch(`/api/commissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      if (response.ok) {
        await fetchCommissions()
      }
    } catch (error) {
      console.error('Error updating commission:', error)
    }
  }

  if (loading) return <div className="p-6">Loading commissions...</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Commission Management</h1>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded ${filter === 'paid' ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}
        >
          Paid
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Worker</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Rate</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Period</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((commission) => (
              <tr key={commission.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-6 py-4">{commission.workerName}</td>
                <td className="px-6 py-4 font-semibold">₹{commission.amount.toLocaleString()}</td>
                <td className="px-6 py-4">{commission.rate}%</td>
                <td className="px-6 py-4 text-sm">{commission.period}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      commission.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {commission.status !== 'paid' && (
                    <button
                      onClick={() => handlePayCommission(commission.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-bold mb-2">Commission Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-600">Total Commissions</p>
            <p className="text-2xl font-bold">
              ₹{commissions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Pending</p>
            <p className="text-2xl font-bold">
              ₹{commissions.filter((c) => c.status !== 'paid').reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Paid</p>
            <p className="text-2xl font-bold">
              ₹{commissions.filter((c) => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
