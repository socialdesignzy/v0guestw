'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EmployersPage() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/employers');
        setEmployers(res.data.employers);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Employers</h1>
      <div className="bg-card p-6 rounded-lg border border-border">
        {employers.length === 0 ? (
          <p className="text-muted-foreground">No employers added yet.</p>
        ) : (
          <div className="space-y-2">
            {employers.map((emp: any) => (
              <div key={emp.id} className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="font-semibold">{emp.user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{emp.user.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
