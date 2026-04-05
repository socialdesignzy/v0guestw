import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const worker = await prisma.worker.findUnique({
      where: { id: params.id },
      include: { user: true, employer: true, contractor: true },
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    // Verify ownership
    if (worker.contractorId !== (await prisma.contractor.findUnique({ where: { userId: session.userId } }))?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ worker });
  } catch (error) {
    console.error('Get worker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { aadharNumber, panNumber, bankAccount, ifscCode, upiId, emergencyPhone, status } = body;

    const worker = await prisma.worker.update({
      where: { id: params.id },
      data: {
        aadharNumber: aadharNumber || undefined,
        panNumber: panNumber || undefined,
        bankAccount: bankAccount || undefined,
        ifscCode: ifscCode || undefined,
        upiId: upiId || undefined,
        emergencyPhone: emergencyPhone || undefined,
        status: status || undefined,
      },
      include: { user: true },
    });

    return NextResponse.json({ worker });
  } catch (error) {
    console.error('Update worker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
