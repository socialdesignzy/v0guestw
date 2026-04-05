'use client'

import { useEffect, useState } from 'react'

export default function AdminReportsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalEmployers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <p className="text-slate-600 text-sm font-medium">Total Users</p>
          <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <p className="text-slate-600 text-sm font-medium">Total Workers</p>
          <p className="text-4xl font-bold text-green-600">{stats.totalWorkers}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <p className="text-slate-600 text-sm font-medium">Total Employers</p>
          <p className="text-4xl font-bold text-purple-600">{stats.totalEmployers}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <p className="text-slate-600 text-sm font-medium">Active Subscriptions</p>
          <p className="text-4xl font-bold text-orange-600">{stats.activeSubscriptions}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
          <p className="text-4xl font-bold text-red-600">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200">
          <p className="text-slate-600 text-sm font-medium">Monthly Revenue</p>
          <p className="text-4xl font-bold text-indigo-600">₹{stats.monthlyRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6 border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <span>Average Users per Subscription</span>
            <span className="font-bold text-lg">{(stats.totalUsers / Math.max(stats.activeSubscriptions, 1)).toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <span>Workers to Employers Ratio</span>
            <span className="font-bold text-lg">{(stats.totalWorkers / Math.max(stats.totalEmployers, 1)).toFixed(1)}:1</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Subscription Growth Rate</span>
            <span className="font-bold text-lg text-green-600">+5.2%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
