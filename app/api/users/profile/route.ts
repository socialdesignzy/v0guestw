import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSecurityLog } from '@/lib/logging';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        contractor: true,
        employer: true,
        worker: true,
        sessions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        verified: user.verified,
        createdAt: user.createdAt,
        contractor: user.contractor,
        employer: user.employer,
        worker: user.worker,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, avatar } = body;

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        fullName: fullName || undefined,
        phone: phone || undefined,
        avatar: avatar || undefined,
      },
      include: {
        contractor: true,
        employer: true,
        worker: true,
      },
    });

    await createSecurityLog(
      session.userId,
      'profile_update',
      true,
      'User profile updated'
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        verified: user.verified,
        contractor: user.contractor,
        employer: user.employer,
        worker: user.worker,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
