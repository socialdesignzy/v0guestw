'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/bookings');
        setBookings(res.data.bookings);
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
      <h1 className="text-4xl font-bold">Bookings</h1>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {bookings.length === 0 ? (
          <p className="p-6 text-muted-foreground">No bookings yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Room</th>
                <th className="px-6 py-3 text-left font-semibold">Worker</th>
                <th className="px-6 py-3 text-left font-semibold">Dates</th>
                <th className="px-6 py-3 text-left font-semibold">Total Price</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking: any) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4">{booking.room.name}</td>
                  <td className="px-6 py-4">{booking.worker.user.fullName}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(booking.checkInDate).toLocaleDateString()} -{' '}
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-semibold">₹{booking.totalPrice}</td>
                  <td className="px-6 py-4">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
