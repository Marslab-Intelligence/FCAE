import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { CheckCircle2, Clock, XCircle, RotateCcw, CreditCard, ReceiptText } from 'lucide-react';
import { db } from '@/db/client';
import { orders } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice } from '@/lib/currency';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Payments — SID Managed Cloud',
};

const STATUS_STYLE: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  paid: { label: 'Paid', className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  pending: { label: 'Pending', className: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  failed: { label: 'Failed', className: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle },
  refunded: { label: 'Refunded', className: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: RotateCcw },
};

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  const rows = user
    ? await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt))
    : [];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-display font-bold text-3xl text-text">Payments</h1>
        <p className="text-text-muted text-sm mt-1">Payment methods and billing history for your account.</p>
      </div>

      {/* Payment methods — no online payment gateway is live yet (Razorpay
          integration pending, see AGENTS.md). Never render raw card fields
          here even as a placeholder. */}
      <div className="p-6 rounded-3xl glass-card space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <CreditCard className="w-5 h-5" />
          </div>
          <h2 className="font-display font-bold text-lg text-text">Payment Methods</h2>
        </div>
        <p className="text-sm text-text-muted">
          Online card and bank payment is coming soon. Until then, our team will contact you directly to arrange
          billing for your plan.
        </p>
      </div>

      {/* Transaction history */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-text">Recent Transactions</h2>
              <p className="text-xs text-text-muted mt-0.5">Full invoice history is available under Invoices.</p>
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <ReceiptText className="w-12 h-12 text-text-dim mx-auto mb-3" />
            <p className="font-semibold text-text mb-1">No transactions yet</p>
            <p className="text-text-muted text-sm">Your payment history will appear here once billing begins.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {rows.map((order) => {
              const status = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm text-text">{order.planId}</p>
                    <p className="text-[10px] text-text-dim mt-0.5">
                      {order.createdAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-display font-bold text-sm text-text">{formatPrice(order.amount, 'INR')}</p>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1',
                        status.className
                      )}
                    >
                      <StatusIcon className="w-3 h-3" /> {status.label.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
