import type { Metadata } from 'next';
import { FileText, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Invoices — SID Managed Cloud',
};

const invoices = [
  { id: 'INV-2025-001', date: 'Jan 1, 2025', amount: '₹1,20,000', status: 'Paid', plan: 'Assure' },
  { id: 'INV-2024-012', date: 'Dec 1, 2024', amount: '₹1,20,000', status: 'Paid', plan: 'Assure' },
  { id: 'INV-2024-011', date: 'Nov 1, 2024', amount: '₹1,20,000', status: 'Paid', plan: 'Assure' },
  { id: 'INV-2024-010', date: 'Oct 1, 2024', amount: '₹95,000', status: 'Paid', plan: 'Care' },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-text">Invoices</h1>
        <p className="text-text-muted mt-1">Download your invoices and billing history.</p>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display font-semibold text-base text-text">Billing History</h2>
          <span className="text-xs text-text-dim">GST invoice available for all payments</span>
        </div>
        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-text-dim mx-auto mb-3" />
            <p className="font-semibold text-text mb-1">No invoices yet</p>
            <p className="text-text-muted text-sm">Your invoices will appear here once your plan is active.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {invoices.map(inv => (
              <div key={inv.id} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{inv.id}</p>
                  <p className="text-xs text-text-dim mt-0.5">{inv.date} · {inv.plan} Plan</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-base text-text">{inv.amount}</p>
                  <span className="text-xs text-emerald-400 font-medium">{inv.status}</span>
                </div>
                <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-dim hover:text-text hover:bg-white/8 transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
