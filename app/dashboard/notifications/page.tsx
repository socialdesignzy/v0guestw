'use client'

import { useEffect, useState } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  if (loading) return <div className="p-6">Loading notifications...</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg p-4 border ${
                notification.read
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                  <p className="text-slate-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="ml-4 text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
