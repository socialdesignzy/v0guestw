import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Get current subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.userId,
        status: { in: ['active', 'trial'] },
      },
      include: { plan: true },
    });

    // Get all available plans
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
    });

    return NextResponse.json({ subscription, plans });
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
    const { planId, billingCycle = 'monthly' } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const contractor = await prisma.contractor.findUnique({
      where: { userId: session.userId },
    });

    if (!contractor) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    // Create Razorpay subscription
    const amount = billingCycle === 'yearly' ? (plan.yearlyPrice || plan.monthlyPrice * 12) : plan.monthlyPrice;
    const interval = billingCycle === 'yearly' ? 12 : 1;

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.floor(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `sub_${contractor.id}`,
        notes: {
          planId,
          userId: session.userId,
        },
      });

      // Create subscription record with trial
      const now = new Date();
      const trialEnd = new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000);
      const periodEnd = new Date(now.getTime() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);

      const subscription = await prisma.subscription.create({
        data: {
          userId: session.userId,
          contractorId: contractor.id,
          planId,
          status: plan.trialDays > 0 ? 'trial' : 'active',
          trialEndsAt: plan.trialDays > 0 ? trialEnd : null,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          razorpaySubscriptionId: razorpayOrder.id,
        },
        include: { plan: true },
      });

      return NextResponse.json({
        subscription,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
      });
    } catch (razorpayError) {
      console.error('Razorpay error:', razorpayError);
      return NextResponse.json(
        { error: 'Failed to create payment order' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
