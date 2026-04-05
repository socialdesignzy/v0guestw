import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all employers for a contractor
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

    const employers = await prisma.employer.findMany({
      where: { contractorId: contractor.id },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ employers });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new employer
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { email, fullName, phone, companyName, designation } = body;

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.userId },
    });

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: require('bcryptjs').hashSync('temp_password_123', 10),
        fullName,
        phone,
        role: 'employer',
      },
    });

    const employer = await prisma.employer.create({
      data: {
        userId: user.id,
        contractorId: contractor.id,
        companyName,
        designation,
      },
      include: { user: true },
    });

    return NextResponse.json({ employer }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
