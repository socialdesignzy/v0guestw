import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware'

let userSettingsStore: Record<string, any> = {}

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req)

  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = userSettingsStore[auth.userId] || {
      companyName: '',
      phone: '',
      address: '',
      emailNotifications: true,
      smsNotifications: false,
      theme: 'light',
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req)

  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    userSettingsStore[auth.userId] = body
    return NextResponse.json({ success: true, settings: body })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
