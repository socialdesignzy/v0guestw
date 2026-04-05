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

    const commissions = await prisma.commission.findMany({
      where: { contractorId: contractor.id },
      include: { user: true, worker: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ commissions });
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
    const { workerId, amount, percentage, commissionType } = body;

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.userId },
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const commission = await prisma.commission.create({
      data: {
        userId: session.userId,
        contractorId: contractor.id,
        workerId,
        amount: parseFloat(amount),
        percentage: parseFloat(percentage),
        commissionType,
        status: 'pending',
      },
      include: { user: true, worker: true },
    });

    return NextResponse.json({ commission }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
