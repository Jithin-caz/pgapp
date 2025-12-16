// app/dashboard/owner/tenants/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TenantProfile() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State for "Add Due" Modal
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [dueForm, setDueForm] = useState({ amount: '', month: '', dueDate: '' });

  // 1. Fetch Tenant Data
  const fetchTenantData = async () => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, [tenantId]);

  // 2. Handle Add Due
  const handleAddDue = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/dues', {
      method: 'POST',
      body: JSON.stringify({ ...dueForm, tenantId }),
    });
    setIsDueModalOpen(false);
    setDueForm({ amount: '', month: '', dueDate: '' });
    fetchTenantData(); // Refresh data
  };

  // 3. Handle Remove Tenant
  const handleRemoveTenant = async () => {
    if (!confirm('Are you sure? This will delete the tenant and free up the room.')) return;
    
    const res = await fetch(`/api/tenants/${tenantId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/dashboard/owner');
    } else {
      alert('Failed to delete tenant');
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Profile...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Tenant not found</div>;

  const { tenant, dues, complaints } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <button onClick={() => router.back()} className="text-sm text-gray-500 mb-6 hover:text-indigo-600 transition flex items-center gap-1">
        ← Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        {/* LEFT COLUMN: Tenant Details Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xl font-bold">
                {tenant.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{tenant.name}</h1>
                <p className="text-sm text-gray-500">Room {tenant.room_number}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-800">{tenant.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-800">{tenant.phone}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Joined</span>
                <span className="font-medium text-gray-800">{new Date(tenant.joined_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={() => setIsDueModalOpen(true)}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                + Add New Due
              </button>
              <button 
                onClick={handleRemoveTenant}
                className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Remove Tenant
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: History & Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Dues History Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Payment History</h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{dues.length} Records</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {dues.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No payment history available.</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3">Month</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dues.map((due: any) => (
                      <tr key={due.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-800">{due.month}</td>
                        <td className="px-6 py-4">₹{due.amount}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(due.due_date || due.generated_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            due.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {due.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Complaints History Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Complaints Log</h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{complaints.length} Records</span>
            </div>
            <div className="p-6 space-y-4">
              {complaints.length === 0 ? (
                <p className="text-gray-500 text-center">No complaints raised.</p>
              ) : (
                complaints.map((c: any) => (
                  <div key={c.id} className="flex items-start justify-between p-4 border rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-md transition">
                    <div>
                      <h3 className="font-semibold text-gray-800">{c.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Add Due Modal */}
      {isDueModalOpen && (
        <div className="fixed inset-0 text-black bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-4">Add New Due</h2>
            <form onSubmit={handleAddDue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input 
                  type="text"
                  placeholder="e.g. October 2023"
                  className="w-full border rounded p-2"
                  value={dueForm.month}
                  onChange={e => setDueForm({...dueForm, month: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input 
                  type="number"
                  placeholder="5000"
                  className="w-full border rounded p-2"
                  value={dueForm.amount}
                  onChange={e => setDueForm({...dueForm, amount: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input 
                  type="date"
                  className="w-full border rounded p-2"
                  value={dueForm.dueDate}
                  onChange={e => setDueForm({...dueForm, dueDate: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsDueModalOpen(false)}
                  className="flex-1 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save Due
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}