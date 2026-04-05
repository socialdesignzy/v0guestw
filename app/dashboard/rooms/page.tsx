'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/rooms');
        setRooms(res.data.rooms);
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
      <h1 className="text-4xl font-bold">Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room: any) => (
          <div key={room.id} className="bg-card p-6 rounded-lg border border-border">
            <h3 className="font-semibold text-lg">{room.name}</h3>
            <p className="text-sm text-muted-foreground">{room.description}</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm">Capacity: {room.capacity} persons</p>
              <p className="font-semibold">₹{room.price}/night</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
