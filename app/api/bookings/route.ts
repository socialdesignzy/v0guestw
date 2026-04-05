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

    const bookings = await prisma.booking.findMany({
      where: { contractorId: contractor.id },
      include: { room: true, worker: { include: { user: true } }, employer: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
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
    const { roomId, workerId, employerId, checkInDate, checkOutDate, pricePerNight } = body;

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.userId },
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * parseFloat(pricePerNight);

    const booking = await prisma.booking.create({
      data: {
        roomId,
        workerId,
        employerId,
        contractorId: contractor.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalNights: nights,
        pricePerNight: parseFloat(pricePerNight),
        totalPrice,
      },
      include: { room: true, worker: true, employer: true },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
