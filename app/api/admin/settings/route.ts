import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware'

const DEFAULT_SETTINGS = {
  siteName: 'GuestWorker',
  supportEmail: 'support@guestworker.in',
  maxTrialDays: 7,
  maintenanceMode: false,
  enableNewRegistrations: true,
  emailNotifications: true,
}

let appSettings = DEFAULT_SETTINGS

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req)

  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(appSettings)
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req)

  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    appSettings = { ...appSettings, ...body }
    return NextResponse.json({ success: true, settings: appSettings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
