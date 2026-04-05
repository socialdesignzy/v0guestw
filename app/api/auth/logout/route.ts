import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie, getSession } from '@/lib/auth';
import { createSecurityLog } from '@/lib/logging';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (session) {
      await createSecurityLog(session.userId, 'logout', true);
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
