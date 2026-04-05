'use client'

import { useState, useEffect } from 'react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'GuestWorker',
    supportEmail: 'support@guestworker.in',
    maxTrialDays: 7,
    maintenanceMode: false,
    enableNewRegistrations: true,
    emailNotifications: true,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>

      <div className="max-w-2xl bg-white rounded-lg shadow p-6 border border-slate-200">
        <div className="space-y-6">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full border border-slate-300 rounded px-4 py-2"
            />
          </div>

          {/* Support Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full border border-slate-300 rounded px-4 py-2"
            />
          </div>

          {/* Trial Days */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trial Period (Days)
            </label>
            <input
              type="number"
              value={settings.maxTrialDays}
              onChange={(e) => setSettings({ ...settings, maxTrialDays: Number(e.target.value) })}
              className="w-full border border-slate-300 rounded px-4 py-2"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-4 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-700">Maintenance Mode</label>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-700">Enable New Registrations</label>
              <input
                type="checkbox"
                checked={settings.enableNewRegistrations}
                onChange={(e) => setSettings({ ...settings, enableNewRegistrations: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-700">Email Notifications</label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
          >
            Save Settings
          </button>
          {saved && <p className="text-green-600 font-medium">Settings saved successfully!</p>}
        </div>
      </div>
    </div>
  )
}
