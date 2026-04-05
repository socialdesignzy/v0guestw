'use client'

import { useState, useEffect } from 'react'

interface UserSettings {
  companyName: string
  phone: string
  address: string
  emailNotifications: boolean
  smsNotifications: boolean
  theme: 'light' | 'dark'
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    companyName: '',
    phone: '',
    address: '',
    emailNotifications: true,
    smsNotifications: false,
    theme: 'light',
  })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/users/settings')
      const data = await response.json()
      setSettings(data.settings || settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/users/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  if (loading) return <div className="p-6">Loading settings...</div>

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Settings & Preferences</h1>

      <div className="space-y-6">
        {/* Company Information */}
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <h2 className="text-xl font-bold mb-4">Company Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full border border-slate-300 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full border border-slate-300 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full border border-slate-300 rounded px-4 py-2"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-medium">Email Notifications</label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-medium">SMS Notifications</label>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <h2 className="text-xl font-bold mb-4">Display Preferences</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })}
              className="w-full border border-slate-300 rounded px-4 py-2"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
          >
            Save Settings
          </button>
          {saved && <p className="text-green-600 font-medium flex items-center">✓ Saved successfully</p>}
        </div>
      </div>
    </div>
  )
}
