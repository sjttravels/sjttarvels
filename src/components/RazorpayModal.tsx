import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, X } from 'lucide-react';

export const RazorpayModal: React.FC = () => {
  const { razorpayModal, closeRazorpayModal } = useApp();

  if (!razorpayModal.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="online-payment-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><AlertCircle className="h-5 w-5" /></span>
            <div>
              <h2 id="online-payment-title" className="font-black text-[#071B49]">Online payment unavailable</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">SJT is not processing online payments in this app yet. No payment has been made. You can close this message and choose payment directly with SJT when your booking is confirmed.</p>
            </div>
          </div>
          <button type="button" onClick={closeRazorpayModal} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <button type="button" onClick={closeRazorpayModal} className="mt-5 min-h-11 w-full rounded-xl bg-[#071B49] px-4 py-3 text-sm font-bold text-white hover:bg-blue-900">Close</button>
      </div>
    </div>
  );
};
