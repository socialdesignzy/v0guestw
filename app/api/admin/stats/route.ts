import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req)

  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [totalUsers, totalWorkers, totalEmployers, activeSubscriptions, totalRevenue] =
      await Promise.all([
        prisma.user.count(),
        prisma.worker.count(),
        prisma.employer.count(),
        prisma.subscription.count({ where: { status: 'active' } }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'completed' },
        }),
      ])

    const currentMonth = new Date()
    currentMonth.setDate(1)

    const monthlyRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'completed',
        createdAt: { gte: currentMonth },
      },
    })

    return NextResponse.json({
      totalUsers,
      totalWorkers,
      totalEmployers,
      activeSubscriptions,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
