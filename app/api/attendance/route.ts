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

    // Get attendance records for contractor
    const attendance = await prisma.attendance.findMany({
      where: { contractorId: contractor.id },
      include: { worker: { include: { user: true } }, employer: { include: { user: true } } },
      orderBy: { date: 'desc' },
      take: 100,
    });

    return NextResponse.json({ attendance });
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
    const { workerId, employerId, date, status, hoursWorked, dailyWage, overtime, notes } = body;

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.userId },
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // Mark attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        workerId_employerId_date: {
          workerId,
          employerId,
          date: new Date(date),
        },
      },
      create: {
        workerId,
        employerId,
        contractorId: contractor.id,
        date: new Date(date),
        status,
        hoursWorked: parseFloat(hoursWorked),
        dailyWage: parseFloat(dailyWage),
        overtime: parseFloat(overtime),
        notes,
      },
      update: {
        status,
        hoursWorked: parseFloat(hoursWorked),
        dailyWage: parseFloat(dailyWage),
        overtime: parseFloat(overtime),
        notes,
      },
    });

    // Update worker attendance count
    if (status === 'present' || status === 'half-day') {
      await prisma.worker.update({
        where: { id: workerId },
        data: { totalAttendance: { increment: 1 } },
      });
    }

    return NextResponse.json({ attendance }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
