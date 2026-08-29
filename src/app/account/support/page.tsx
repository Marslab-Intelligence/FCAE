import type { Metadata } from 'next';
import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { Ticket, Plus, Clock, CheckCircle2, AlertCircle, Shield, ExternalLink } from 'lucide-react';
import { db } from '@/db/client';
import { tickets as ticketsTable } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { fetchDeskTicketStatuses } from '@/lib/zoho-desk';
import { SlaSeverityMatrix } from '@/components/SlaSeverityMatrix';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Support Tickets — SID Managed Cloud',
};

/** Desk's own status names, bucketed for display. */
function bucketOf(status: string | undefined, statusType: string | null | undefined) {
  const s = (statusType || status || '').toLowerCase();
  if (s.includes('closed')) return 'closed' as const;
  if (s.includes('hold') || s.includes('waiting') || s.includes('approval')) return 'onhold' as const;
  return 'open' as const;
}

const BUCKET_UI = {
  open:   { icon: AlertCircle, color: 'text-amber-400', label: 'Open' },
  onhold: { icon: Clock, color: 'text-blue-400', label: 'On Hold' },
  closed: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Closed' },
};

function relative(from: Date, now: number) {
  const mins = Math.round((now - from.getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return from.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Summarisable { bucket: 'open' | 'onhold' | 'closed'; closedTime: Date | null }

/** Clock-dependent counts, computed outside the render path. */
function summarise<T extends Summarisable>(items: T[]) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  return {
    now,
    openCount: items.filter((t) => t.bucket !== 'closed').length,
    resolved30: items.filter(
      (t) => t.bucket === 'closed' && t.closedTime && t.closedTime.getTime() >= thirtyDaysAgo,
    ),
  };
}

export default async function SupportPage() {
  const user = await getCurrentUser();

  const rows = user
    ? await db
        .select()
        .from(ticketsTable)
        .where(eq(ticketsTable.userId, user.id))
        .orderBy(desc(ticketsTable.createdAt))
    : [];

  // Enrich with live Desk status where the hand-off succeeded.
  const deskIds = rows.map((r) => r.zohoTicketId).filter((v): v is string => !!v);
  const live = await fetchDeskTicketStatuses(deskIds);

  const enriched = rows.map((r) => {
    const l = r.zohoTicketId ? live[r.zohoTicketId] : undefined;
    return {
      ...r,
      liveStatus: l?.status ?? null,
      bucket: bucketOf(l?.status, l?.statusType),
      closedTime: l?.closedTime ? new Date(l.closedTime) : null,
      webUrl: l?.webUrl ?? null,
      number: r.zohoTicketNumber ?? l?.ticketNumber ?? null,
    };
  });

  const { now, openCount, resolved30 } = summarise(enriched);
  const durations = resolved30
    .map((t) => (t.closedTime!.getTime() - t.createdAt.getTime()) / 3600000)
    .filter((h) => h >= 0);
  const avgHours = durations.length
    ? (durations.reduce((a, b) => a + b, 0) / durations.length)
    : null;

  const stats = [
    { label: 'Open', value: enriched.length ? String(openCount) : '—' },
    { label: 'Resolved (30d)', value: enriched.length ? String(resolved30.length) : '—' },
    { label: 'Avg Resolution', value: avgHours !== null ? `${avgHours.toFixed(1)}h` : '—' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-fluid-h1 text-text">Support Tickets</h1>
          <p className="text-text-muted mt-1">Track and manage your support requests.</p>
        </div>
        <Link href="/account/support/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold text-sm hover:from-accent-glow hover:to-purple-500 shadow-[0_0_25px_-8px_rgba(168,85,247,0.6)] transition-all">
          <Plus className="w-4 h-4" /> Raise Ticket
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-3 sm:p-4 rounded-2xl border bg-white/3 border-white/10 text-center">
            <p className={cn('font-display font-bold text-xl sm:text-2xl', s.value === '—' ? 'text-text-dim' : 'text-text')}>{s.value}</p>
            <p className="text-[10px] sm:text-xs text-text-muted mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Incident Response & SLA Severity Matrix */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="font-display font-bold text-xl text-text flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" /> Incident Response &amp; SLA Guarantees
          </h2>
          <p className="text-text-muted text-sm mt-1">Guaranteed response windows and target impact scenarios per severity level.</p>
        </div>
        <SlaSeverityMatrix />
      </div>

      {/* Tickets */}
      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display font-semibold text-base text-text">Your Tickets</h2>
          {enriched.length > 0 && (
            <span className="text-xs text-text-dim">{enriched.length} total</span>
          )}
        </div>

        {enriched.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-text-dim mx-auto mb-3" />
            <p className="font-semibold text-text mb-1">No support tickets yet</p>
            <p className="text-text-muted text-sm">Your support requests will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {enriched.map((t) => {
              const ui = BUCKET_UI[t.bucket];
              const StatusIcon = ui.icon;
              return (
                <div key={t.id} className="flex flex-wrap items-start gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {t.number && <span className="text-xs font-mono text-accent">#{t.number}</span>}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white/5 text-text-muted border-white/15">
                        {t.department}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white/5 text-text-dim border-white/10">
                        {t.requestType}
                      </span>
                      {!t.zohoTicketId && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-500/10 text-amber-300 border-amber-500/25">
                          Not yet synced
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text leading-snug">{t.subject}</p>
                    <p className="text-xs text-text-dim mt-1">
                      {t.category}{t.subCategory ? ` · ${t.subCategory}` : ''}
                    </p>
                    <p className="text-xs text-text-dim mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Raised {relative(t.createdAt, now)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={cn('flex items-center gap-1.5 text-xs font-medium', ui.color)}>
                      <StatusIcon className="w-4 h-4" />
                      {t.liveStatus ?? ui.label}
                    </span>
                    {t.webUrl && (
                      <a href={t.webUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-text-dim hover:text-accent transition-colors">
                        Open in Desk <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
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
