// app/dashboard/tenant/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TenantDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Data
  const fetchData = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const user = JSON.parse(storedUser);
    
    const res = await fetch(`/api/tenant/dashboard?id=${user.id}`);
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Pay Function (Single or Bulk)
  const handlePay = async (ids: number[]) => {
    if (ids.length === 0) return;
    if (!confirm(`Proceed to pay for ${ids.length} invoice(s)?`)) return;

    setProcessingPayment(true);

    // Loop through IDs and pay them (Simple Implementation)
    // In production, you would have a bulk API endpoint
    try {
      await Promise.all(ids.map(id => 
        fetch('/api/dues', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })
      ));
      
      alert('Payment Successful!');
      fetchData(); // Refresh to show updated status
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const storedUser = localStorage.getItem('user');
    const user = JSON.parse(storedUser!);

    await fetch('/api/tenant/complaints', {
      method: 'POST',
      body: JSON.stringify({ tenantId: user.id, ...complaintForm }),
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    setComplaintForm({ title: '', description: '' });
    fetchData();
    alert('Complaint raised successfully!');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>;
  if (!data) return null;

  const { tenant, dues, complaints } = data;
  
  const pendingDues = dues.filter((d: any) => d.status === 'pending');
  const totalDue = pendingDues.reduce((sum: number, d: any) => sum + Number(d.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">My Home</h1>
          <p className="text-xs text-gray-500">Room {tenant.room_number}</p>
        </div>
        <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium text-sm">
          Sign Out
        </button>
      </nav>

      <main className="p-6 max-w-4xl mx-auto space-y-8">
        
        {/* SECTION 1: DUES OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Total Due Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Payable</h2>
              <div className="text-4xl font-bold text-gray-800">₹{totalDue.toLocaleString()}</div>
            </div>
            
            {totalDue > 0 ? (
              <button 
                onClick={() => handlePay(pendingDues.map((d: any) => d.id))}
                disabled={processingPayment}
                className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-indigo-100 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {processingPayment ? 'Processing...' : 'Pay All Now'}
              </button>
            ) : (
               <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg w-fit">
                 <span>✓</span> <span className="text-sm font-medium">All dues paid</span>
               </div>
            )}
          </div>

          {/* Dues List (Mini) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Invoices</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {dues.length === 0 ? <p className="text-sm text-gray-400">No payment history.</p> : dues.map((due: any) => (
                <div key={due.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-50 bg-gray-50/50">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{due.month}</div>
                    <div className="text-xs text-gray-500">Due: {new Date(due.due_date || due.generated_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="font-bold text-gray-800">₹{due.amount}</div>
                    
                    {due.status === 'pending' ? (
                       <button 
                         onClick={() => handlePay([due.id])}
                         disabled={processingPayment}
                         className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
                       >
                         Pay
                       </button>
                    ) : (
                       <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-1 rounded">
                         Paid
                       </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: COMPLAINTS */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">My Complaints</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition shadow-sm"
            >
              + Raise Complaint
            </button>
          </div>

          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400">No complaints raised yet.</p>
              </div>
            ) : (
              complaints.map((c: any) => (
                <div key={c.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{c.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        c.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                        c.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.description}</p>
                    <p className="text-xs text-gray-400 pt-2">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* RAISE COMPLAINT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Raise a Complaint</h2>
            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Issue Title</label>
                <input 
                  required
                  placeholder="e.g., Fan not working"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={complaintForm.title}
                  onChange={e => setComplaintForm({...complaintForm, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Describe the issue in detail..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={complaintForm.description}
                  onChange={e => setComplaintForm({...complaintForm, description: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}