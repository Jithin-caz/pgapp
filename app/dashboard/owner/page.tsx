'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AddTenantModal from '../../components/AddTenantModel'; // Import the new component

// Types
interface RoomData {
  id: number;
  room_number: string;
  status: 'available' | 'occupied';
  tenant_id?: number;
  tenant_name?: string;
  due_count: number;
  open_complaints_count: number;
}

export default function OwnerDashboard() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; number: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const fetchRooms = async () => {
    const res = await fetch('/api/rooms');
    const data = await res.json();
    setRooms(data);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomClick = (room: RoomData) => {
    if (room.status === 'occupied' && room.tenant_id) {
      router.push(`/dashboard/owner/tenants/${room.tenant_id}`);
    } else {
      // Set the selected room details for the modal
      setSelectedRoom({ id: room.id, number: room.room_number });
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">PG</div>
           <h1 className="text-xl font-bold text-gray-800">Owner Dashboard</h1>
        </div>
        <div className="space-x-6 text-sm">
          <Link href="/dashboard/owner/dues" className="text-gray-500 hover:text-indigo-600 font-medium transition">
            Pending Dues
          </Link>
          <button onClick={() => router.push('/')} className="text-red-500 hover:text-red-700 font-medium transition">
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="p-8 max-w-7xl mx-auto">
        <h2 className="text-gray-500 text-sm font-medium mb-6 uppercase tracking-wider">Property Status</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rooms.map((room) => {
            const isOccupied = room.status === 'occupied';
            const hasIssues = room.due_count > 0 || room.open_complaints_count > 0;

            return (
              <div 
                key={room.id}
                onClick={() => handleRoomClick(room)}
                className={`
                  group relative p-6 rounded-2xl border cursor-pointer transition-all duration-200
                  ${isOccupied 
                    ? 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-lg' 
                    : 'bg-white border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50/30'
                  }
                `}
              >
                {/* Notification Badge */}
                {hasIssues && (
                  <div className="absolute -top-2 -right-2 flex flex-col gap-1 items-end">
                    {room.due_count > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        ₹ DUE
                      </span>
                    )}
                    {room.open_complaints_count > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        ! ISSUE
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl font-bold text-gray-800 tracking-tight">{room.room_number}</span>
                  <div className={`w-3 h-3 rounded-full mt-2 ${isOccupied ? 'bg-indigo-500' : 'bg-green-400'}`}></div>
                </div>

                <div className="mt-4">
                  {isOccupied ? (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">Tenant</p>
                      <p className="text-sm font-medium text-gray-700 truncate">{room.tenant_name}</p>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600 gap-2 group-hover:text-green-700">
                      <span className="text-sm font-medium">+ Add Tenant</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* The New Component */}
      <AddTenantModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRooms}
        roomId={selectedRoom?.id || null}
        roomNumber={selectedRoom?.number || ''}
      />

    </div>
  );
}