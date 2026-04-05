import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.userId },
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const advances = await prisma.advance.findMany({
      where: { contractorId: contractor.id },
      include: { user: true, worker: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ advances });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { workerId, amount, reason, deductionMonths } = body;

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.userId },
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const advance = await prisma.advance.create({
      data: {
        userId: session.userId,
        contractorId: contractor.id,
        workerId,
        amount: parseFloat(amount),
        reason,
        deductionMonths: parseInt(deductionMonths) || 1,
        status: 'pending',
      },
      include: { user: true, worker: true },
    });

    return NextResponse.json({ advance }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
