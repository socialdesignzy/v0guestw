import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get admin statistics
  const [totalUsers, totalContractors, totalWorkers, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.contractor.count(),
    prisma.worker.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' },
    }),
  ]);

  const recentLogs = await prisma.securityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Users</p>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Contractors</p>
          <p className="text-3xl font-bold">{totalContractors}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Workers</p>
          <p className="text-3xl font-bold">{totalWorkers}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
          <p className="text-3xl font-bold">₹{(totalRevenue._sum.amount || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users" className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition">
          <p className="text-lg font-semibold mb-2">👤 User Management</p>
          <p className="text-sm text-muted-foreground">Manage all users and roles</p>
        </Link>
        <Link href="/admin/security" className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition">
          <p className="text-lg font-semibold mb-2">🔒 Security Logs</p>
          <p className="text-sm text-muted-foreground">View security and login events</p>
        </Link>
        <Link href="/admin/plans" className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition">
          <p className="text-lg font-semibold mb-2">📋 Plan Management</p>
          <p className="text-sm text-muted-foreground">Manage subscription plans</p>
        </Link>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="font-semibold mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex justify-between items-center pb-3 border-b text-sm">
              <div>
                <p className="font-medium">{log.user.email}</p>
                <p className="text-muted-foreground">{log.action}</p>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
