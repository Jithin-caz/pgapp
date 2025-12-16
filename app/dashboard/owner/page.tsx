// app/dashboard/owner/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AddTenantModal from '../../components/AddTenantModal';
import DuesModal from '../../components/DuesModal';
import ComplaintsModal from '../../components/ComplaintsModal';

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
  // --- STATE MANAGEMENT ---
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; number: string } | null>(null);

  // Modals Visibility State
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  const [isDuesModalOpen, setIsDuesModalOpen] = useState(false);
  const [isComplaintsModalOpen, setIsComplaintsModalOpen] = useState(false);

  // Rent Generation State
  const [isRentButtonActive, setIsRentButtonActive] = useState(false);
  const [isGeneratingRent, setIsGeneratingRent] = useState(false);
  
  const router = useRouter();

  // --- DATA FETCHING ---
  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error("Failed to load rooms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    
    // Logic: Rent button active only in first 5 days of the month
    const day = new Date().getDate();
    if (day <= 5) setIsRentButtonActive(true);
  }, []);

  // --- HANDLERS ---

  // 1. Handle clicking a room card
  const handleRoomClick = (room: RoomData) => {
    if (room.status === 'occupied' && room.tenant_id) {
      // If occupied, go to tenant profile
      router.push(`/dashboard/owner/tenants/${room.tenant_id}`);
    } else {
      // If empty, open "Add Tenant" modal
      setSelectedRoom({ id: room.id, number: room.room_number });
      setIsAddTenantModalOpen(true);
    }
  };

  // 2. Handle Generating Rent
  const handleGenerateRent = async () => {
    if (!isRentButtonActive) return;
    if (!confirm("Are you sure? This will generate rent dues for ALL active tenants for the current month.")) return;
    
    setIsGeneratingRent(true);
    try {
      const res = await fetch('/api/dues/generate', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        alert(`Successfully generated rent for ${data.month}`);
        fetchRooms(); // Refresh badges to show new dues
      } else {
        alert(data.error || 'Failed to generate rent');
      }
    } catch (error) {
      alert('An error occurred while generating rent.');
    } finally {
      setIsGeneratingRent(false);
    }
  };

  // --- RENDER ---
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Property Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. NAVBAR */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 shadow-sm gap-4 md:gap-0">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-md">PG</div>
           <h1 className="text-xl font-bold text-gray-800 tracking-tight">Owner Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap justify-center">
           {/* Generate Rent Button */}
           <button 
             onClick={handleGenerateRent}
             disabled={!isRentButtonActive || isGeneratingRent}
             className={`
               px-4 py-2 text-sm font-medium rounded-lg transition border flex items-center gap-2
               ${isRentButtonActive 
                 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200' 
                 : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'}
             `}
             title={isRentButtonActive ? "Generate rent for current month" : "Only available in first 5 days of month"}
           >
             {isGeneratingRent ? (
               <span className="animate-pulse">Generating...</span>
             ) : (
               <><span>+</span> Generate Rent</>
             )}
           </button>

           <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

           {/* View Complaints Button */}
           <button 
             onClick={() => setIsComplaintsModalOpen(true)}
             className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition px-3 py-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200"
           >
             Complaints
           </button>

           {/* View Pending Dues Button */}
           <button 
             onClick={() => setIsDuesModalOpen(true)}
             className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition px-3 py-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200"
           >
             Pending Dues
           </button>

           {/* Logout */}
           <button 
             onClick={() => router.push('/')} 
             className="text-red-500 hover:text-red-700 font-medium text-sm px-3 py-2 hover:bg-red-50 rounded transition"
           >
             Sign Out
           </button>
        </div>
      </nav>

      {/* 2. MAIN CONTENT (ROOM GRID) */}
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Room Overview</h2>
          <div className="text-xs text-gray-400">Total Rooms: {rooms.length}</div>
        </div>
        
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
                {/* Notification Badges (Top Right) */}
                {hasIssues && (
                  <div className="absolute -top-3 -right-2 flex flex-col gap-1 items-end z-10">
                    {room.due_count > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm ring-2 ring-white">
                        ₹{room.due_count} DUES
                      </span>
                    )}
                    {room.open_complaints_count > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm ring-2 ring-white">
                        ! ISSUE
                      </span>
                    )}
                  </div>
                )}

                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl font-bold text-gray-800 tracking-tight font-mono">{room.room_number}</span>
                  <div className={`w-3 h-3 rounded-full mt-2 ring-4 ring-opacity-20 ${isOccupied ? 'bg-indigo-500 ring-indigo-500' : 'bg-green-400 ring-green-400'}`}></div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-4 border-t border-gray-50">
                  {isOccupied ? (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Current Tenant</p>
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                           {room.tenant_name?.charAt(0)}
                         </div>
                         <p className="text-sm font-medium text-gray-700 truncate">{room.tenant_name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-green-600 gap-2 py-1 rounded group-hover:bg-green-100 transition">
                      <span className="text-sm font-bold">+ Add Tenant</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 3. MODALS */}
      
      {/* Add Tenant Modal */}
      <AddTenantModal 
        isOpen={isAddTenantModalOpen}
        onClose={() => setIsAddTenantModalOpen(false)}
        onSuccess={fetchRooms}
        roomId={selectedRoom?.id || null}
        roomNumber={selectedRoom?.number || ''}
      />

      {/* Dues Summary Modal */}
      <DuesModal 
        isOpen={isDuesModalOpen}
        onClose={() => setIsDuesModalOpen(false)}
      />

      {/* Complaints Board Modal */}
      <ComplaintsModal 
        isOpen={isComplaintsModalOpen}
        onClose={() => {
          setIsComplaintsModalOpen(false);
          fetchRooms(); // Refresh rooms to update "Issue" badges on cards
        }}
      />

    </div>
  );
}