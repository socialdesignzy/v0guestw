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

    // Get contractor's workers
    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.userId },
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const workers = await prisma.worker.findMany({
      where: { contractorId: contractor.id },
      include: { user: true, employer: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ workers });
  } catch (error) {
    console.error('Get workers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, fullName, phone, aadharNumber, panNumber, emergencyContact } = body;

    // Get contractor
    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.userId },
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // Create user first
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: require('bcryptjs').hashSync('temp_password_123', 10),
        fullName,
        phone,
        role: 'worker',
        verified: true,
      },
    });

    // Create worker profile
    const worker = await prisma.worker.create({
      data: {
        userId: user.id,
        contractorId: contractor.id,
        aadharNumber,
        panNumber,
        emergencyContact,
      },
      include: { user: true },
    });

    // Update contractor worker count
    await prisma.contractor.update({
      where: { id: contractor.id },
      data: { totalWorkers: { increment: 1 } },
    });

    await createSecurityLog(session.userId, 'worker_added', true, `Added worker: ${fullName}`);

    return NextResponse.json({ worker }, { status: 201 });
  } catch (error) {
    console.error('Create worker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
