import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      contractor: true,
      employer: true,
      worker: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome, {user.fullName}</h1>
        <p className="text-muted-foreground">
          {user.role === 'contractor' && "Manage your workforce efficiently"}
          {user.role === 'employer' && "Manage your workers and bookings"}
          {user.role === 'worker' && "Track your work and earnings"}
          {user.role === 'admin' && "Administer the platform"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {user.contractor && (
          <>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">Total Workers</div>
              <div className="text-3xl font-bold">{user.contractor.totalWorkers}</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">Total Earnings</div>
              <div className="text-3xl font-bold">₹{user.contractor.totalEarnings.toLocaleString()}</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">Total Advances</div>
              <div className="text-3xl font-bold">₹{user.contractor.totalAdvances.toLocaleString()}</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">Rating</div>
              <div className="text-3xl font-bold">⭐ {user.contractor.rating.toFixed(1)}</div>
            </div>
          </>
        )}

        {user.employer && (
          <>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">Total Workers</div>
              <div className="text-3xl font-bold">{user.employer.totalWorkers}</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">Total Payments</div>
              <div className="text-3xl font-bold">₹{user.employer.totalPayments.toLocaleString()}</div>
            </div>
          </>
        )}

        {user.worker && (
          <>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">Total Earnings</div>
              <div className="text-3xl font-bold">₹{user.worker.totalEarnings.toLocaleString()}</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">Total Attendance</div>
              <div className="text-3xl font-bold">{user.worker.totalAttendance}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
