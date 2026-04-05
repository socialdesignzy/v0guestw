'use client'

import { useEffect, useState } from 'react'

interface SubscriptionPlan {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice: number
  maxWorkers: number
  maxRooms: number
  features: string[]
  active: boolean
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      const data = await response.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePlan = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch(`/api/subscriptions/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      })
      if (response.ok) {
        setEditingPlan(null)
        await fetchPlans()
      }
    } catch (error) {
      console.error('Error updating plan:', error)
    }
  }

  if (loading) return <div>Loading plans...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Subscription Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
            <div className="mb-4">
              <p className="text-sm text-slate-600">Monthly: ₹{plan.monthlyPrice}</p>
              <p className="text-sm text-slate-600">Yearly: ₹{plan.yearlyPrice}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm">Max Workers: {plan.maxWorkers}</p>
              <p className="text-sm">Max Rooms: {plan.maxRooms}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Features:</p>
              <ul className="text-sm space-y-1">
                {plan.features.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingPlan(plan)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  const newPlan = { ...plan, active: !plan.active }
                  handleUpdatePlan(newPlan)
                }}
                className={`flex-1 px-4 py-2 rounded ${plan.active ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'} text-white`}
              >
                {plan.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Plan: {editingPlan.name}</h2>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Monthly Price"
                value={editingPlan.monthlyPrice}
                onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Yearly Price"
                value={editingPlan.yearlyPrice}
                onChange={(e) => setEditingPlan({ ...editingPlan, yearlyPrice: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Max Workers"
                value={editingPlan.maxWorkers}
                onChange={(e) => setEditingPlan({ ...editingPlan, maxWorkers: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded px-3 py-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdatePlan(editingPlan)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
