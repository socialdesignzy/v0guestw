import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTransactionId } from '@/lib/helpers';

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

    const payments = await prisma.payment.findMany({
      where: { contractorId: contractor.id },
      include: { user: true, booking: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ payments });
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
    const { userId, amount, description, bookingId } = body;

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.userId },
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        contractorId: contractor.id,
        bookingId,
        amount: parseFloat(amount),
        transactionId: generateTransactionId(),
        description,
        status: 'pending',
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
