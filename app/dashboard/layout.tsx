'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get('/api/auth/session');
        if (response.data.user) {
          setUser(response.data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Workers', href: '/dashboard/workers', icon: '👥' },
    { label: 'Employers', href: '/dashboard/employers', icon: '🏢' },
    { label: 'Rooms', href: '/dashboard/rooms', icon: '🏠' },
    { label: 'Bookings', href: '/dashboard/bookings', icon: '📅' },
    { label: 'Attendance', href: '/dashboard/attendance', icon: '✅' },
    { label: 'Payments', href: '/dashboard/payments', icon: '💳' },
    { label: 'Reports', href: '/dashboard/reports', icon: '📈' },
    ...(user.role === 'admin'
      ? [
          { label: 'Admin', href: '/admin', icon: '⚙️' },
          { label: 'Users', href: '/admin/users', icon: '👤' },
          { label: 'Security', href: '/admin/security', icon: '🔒' },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-transform ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">GuestWorker</h1>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            ☰
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
