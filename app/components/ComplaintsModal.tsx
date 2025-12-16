// components/ComplaintsModal.tsx
'use client';

import { useEffect, useState } from 'react';

interface ComplaintsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComplaintsModal({ isOpen, onClose }: ComplaintsModalProps) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data when modal opens
  const fetchComplaints = async () => {
    setLoading(true);
    const res = await fetch('/api/complaints');
    const data = await res.json();
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchComplaints();
  }, [isOpen]);

  // Handle Status Change
  const handleStatusChange = async (id: number, newStatus: string) => {
    // Optimistic Update (Update UI immediately)
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));

    // API Call
    await fetch('/api/complaints', {
      method: 'PATCH',
      body: JSON.stringify({ id, status: newStatus }),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Complaints Board</h2>
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-bold">
              {complaints.filter(c => c.status === 'open').length} Open
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-0 flex-1 bg-gray-50/50">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading issues...</div>
          ) : complaints.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No complaints found. Good job!</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {complaints.map((c) => (
                <div key={c.id} className="p-6 bg-white hover:bg-gray-50 transition flex flex-col sm:flex-row gap-4 sm:items-start">
                  
                  {/* Status Indicator */}
                  <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${c.status === 'open' ? 'bg-amber-500 shadow-amber-200 shadow-sm' : 'bg-green-500'}`} />

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-800">{c.title}</h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{c.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 w-fit px-2 py-1 rounded">
                      <span className="font-medium text-gray-700">{c.tenant_name}</span>
                      <span>•</span>
                      <span>Room {c.room_number}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className={`
                        text-sm border rounded-lg px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer
                        ${c.status === 'open' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}
                      `}
                    >
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                      <option value="in_progress">In Progress</option>
                    </select>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}