import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminSecurityPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  const logs = await prisma.securityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: true },
  });

  // Group by action
  const actionCounts = logs.reduce(
    (acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Count failed logins
  const failedLogins = logs.filter((l) => l.action === 'failed_login').length;
  const successLogins = logs.filter((l) => l.action === 'login').length;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Security Logs</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Events</p>
          <p className="text-3xl font-bold">{logs.length}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Successful Logins</p>
          <p className="text-3xl font-bold text-green-600">{successLogins}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Failed Logins</p>
          <p className="text-3xl font-bold text-red-600">{failedLogins}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-2">Unique Actions</p>
          <p className="text-3xl font-bold">{Object.keys(actionCounts).length}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">User</th>
              <th className="px-6 py-3 text-left font-semibold">Action</th>
              <th className="px-6 py-3 text-left font-semibold">IP Address</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 text-sm">{log.user.email}</td>
                <td className="px-6 py-4 text-sm">{log.action}</td>
                <td className="px-6 py-4 text-sm font-mono">{log.ipAddress || '-'}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {log.success ? 'Success' : 'Failed'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
