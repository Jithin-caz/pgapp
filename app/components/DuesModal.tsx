// components/DuesModal.tsx
'use client';

import { useEffect, useState } from 'react';

interface DuesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DuesModal({ isOpen, onClose }: DuesModalProps) {
  const [activeTab, setActiveTab] = useState<'month' | 'tenant'>('month');
  const [data, setData] = useState<{ byMonth: any[], byTenant: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/dues/summary')
        .then(res => res.json())
        .then(res => {
          setData(res);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Pending Dues Overview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('month')}
            className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'month' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            By Month
          </button>
          <button 
            onClick={() => setActiveTab('tenant')}
            className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'tenant' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            By Tenant
          </button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-y-auto flex-1">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading summary...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                <tr>
                  {activeTab === 'month' ? (
                    <>
                      <th className="px-6 py-3">Month</th>
                      <th className="px-6 py-3">Pending Count</th>
                      <th className="px-6 py-3 text-right">Total Amount</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3">Tenant (Room)</th>
                      <th className="px-6 py-3">Months Pending</th>
                      <th className="px-6 py-3 text-right">Total Due</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeTab === 'month' ? (
                   data?.byMonth.length === 0 ? <tr><td colSpan={3} className="p-4 text-center text-gray-400">No pending dues</td></tr> :
                   data?.byMonth.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{row.month}</td>
                      <td className="px-6 py-4 text-red-600 bg-red-50 inline-block m-2 rounded-full text-xs font-bold px-2">{row.count} Tenants</td>
                      <td className="px-6 py-4 text-right font-mono">₹{row.total}</td>
                    </tr>
                  ))
                ) : (
                  data?.byTenant.length === 0 ? <tr><td colSpan={3} className="p-4 text-center text-gray-400">No pending dues</td></tr> :
                  data?.byTenant.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {row.name} <span className="text-gray-400 text-xs">(Rm {row.room_number})</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={row.months}>{row.months}</td>
                      <td className="px-6 py-4 text-right font-mono text-red-600">₹{row.total_due}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}