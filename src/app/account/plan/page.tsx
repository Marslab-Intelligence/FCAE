import type { Metadata } from 'next';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import {
  CheckCircle2, ArrowUpRight, Clock, Sparkles, Shield, Activity, Package, Lock,
} from 'lucide-react';
import { db } from '@/db/client';
import { savedPlans } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import {
  basePlans, getPlan, planOrder, planSupport, includedAddOnsForPlan, allAddOns,
} from '@/lib/package-catalog';
import { formatPrice } from '@/lib/currency';

export const metadata: Metadata = {
  title: 'My Package & Tier — SID Managed Cloud',
};

/** Nothing chosen yet — say so plainly rather than showing a plan they don't have. */
function NoPlanSelected() {
  return (
    <div className="space-y-10 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="text-xs font-mono font-bold tracking-widest text-text-dim uppercase">Subscription Portal</span>
        </div>
        <h1 className="font-display font-extrabold text-fluid-h1 text-text tracking-tight">
          My Package &amp; Tier
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center text-center gap-5 py-16 rounded-3xl border border-dashed border-white/12 bg-white/2">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Package className="w-8 h-8 text-text-dim" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="font-display font-bold text-xl text-text">No package selected yet</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Once you choose a managed cloud tier, your SLA window, included service
            areas and commercials will appear here.
          </p>
        </div>
        <Link
          href="/plans"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-accent to-purple-600 text-white font-bold text-sm hover:from-accent-glow hover:to-purple-500 transition-all"
        >
          <Sparkles className="w-4 h-4" /> Choose your package
        </Link>
      </div>
    </div>
  );
}

export default async function MyPlanPage() {
  const user = await getCurrentUser();
  if (!user) return <NoPlanSelected />;

  const [saved] = await db
    .select()
    .from(savedPlans)
    .where(eq(savedPlans.userId, user.id))
    .limit(1);

  if (!saved) return <NoPlanSelected />;

  // Everything below is derived from the tier the client actually chose.
  const plan = getPlan(saved.tier);
  const support = planSupport[plan.id];
  const included = includedAddOnsForPlan(plan.id);
  const includedIds = new Set(included.map((s) => s.id));
  const notIncluded = allAddOns.filter((s) => !includedIds.has(s.id));

  const tierIndex = planOrder.indexOf(plan.id);
  const nextTier = tierIndex < planOrder.length - 1 ? getPlan(planOrder[tierIndex + 1]) : null;

  const selectedOn = saved.savedAt.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="space-y-10 pb-12">
      {/* Page Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">Active Subscription Portal</span>
          </div>
          <h1 className="font-display font-extrabold text-fluid-h1 text-text tracking-tight">
            My Package &amp; Tier
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Your operational SLA window, active tier benefits and included service areas.
          </p>
        </div>

        {nextTier && (
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-linear-to-r from-accent to-purple-600 text-white font-bold text-sm hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Upgrade to {nextTier.name} ({planSupport[nextTier.id].window})
          </Link>
        )}
      </div>

      {/* Active Tier Card */}
      <div className="relative rounded-3xl border border-amber-500/40 bg-linear-to-br from-[#1c160a]/90 via-[#0e0c07]/95 to-[#080705]/95 backdrop-blur-2xl p-6 sm:p-8 space-y-8 shadow-[0_0_50px_rgba(234,179,8,0.12)] overflow-hidden glass-card">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/12 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Active Subscription
              </span>
              <span className="text-xs font-mono text-text-dim flex items-center gap-1">
                Selected: <strong className="text-text font-semibold">{selectedOn}</strong>
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-white/5 text-text-muted border border-white/10">
                {plan.category}
              </span>
            </div>

            <h2 className="font-display font-extrabold text-fluid-h3 text-white tracking-tight leading-snug">
              {plan.name} ({support.window}) Managed Cloud Plan
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
              {plan.tagline}.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-left lg:text-right shrink-0 min-w-48 space-y-1">
            <p className="text-xs font-mono text-text-dim uppercase tracking-wider">Tier Investment</p>
            <p className="font-display font-black text-fluid-h3 text-white tracking-tight">
              {formatPrice(plan.priceMonthly, 'INR')}
            </p>
            <p className="text-xs text-amber-300 font-medium">per month + GST</p>
            <span className="inline-block text-[10px] text-emerald-400 font-mono pt-1">
              ✓ {formatPrice(plan.priceYearly, 'INR')}/mo billed annually
            </span>
          </div>
        </div>

        {/* Service areas actually covered by this tier */}
        <div className="relative z-10 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-white/50">
            {included.length} service area{included.length === 1 ? '' : 's'} included in {plan.name}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {included.map((service) => (
              <div
                key={service.id}
                className="p-5 rounded-2xl bg-white/3 border border-white/10 hover:border-white/20 hover:bg-white/6 transition-all duration-300 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="inline-block text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border text-amber-300 bg-amber-500/10 border-amber-500/25">
                    FROM {service.categoryLabel.toUpperCase()}
                  </span>
                  <h3 className="font-display font-bold text-base text-white tracking-tight">
                    {service.name}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    {service.desc}
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Included in your active tier</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support commitment for this tier */}
        <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-white">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <span>
              Support: <strong className="text-amber-300 font-bold">{support.days}, {support.timings}</strong>
              {' '}| P1 incident support: <strong className="text-emerald-400 font-bold">{support.p1}</strong>
              {' '}| Fair usage: <strong className="text-white/90 font-semibold">{support.fairUsage}</strong>
            </span>
          </div>

          <Link
            href="/sla"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white hover:underline transition-colors ml-auto sm:ml-0"
          >
            View Full SLA Terms &amp; Incident Matrix <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Tier ladder — real catalog prices, current tier marked */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl text-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Plan Tier Comparison
          </h3>
          <span className="text-xs text-text-dim font-mono">
            Current position: tier {tierIndex + 1} of {planOrder.length}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {basePlans.map((tier) => {
            const isActive = tier.id === plan.id;
            return (
              <div
                key={tier.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)]'
                    : 'bg-white/3 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-text-dim uppercase">
                    {planSupport[tier.id].window} Support
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      ACTIVE PLAN
                    </span>
                  )}
                </div>
                <h4 className="font-display font-bold text-lg text-text">{tier.name}</h4>
                <p className="font-mono font-bold text-sm text-text-muted mt-1">
                  {formatPrice(tier.priceMonthly, 'INR')}{' '}
                  <span className="text-[10px] font-normal text-text-dim">/mo</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* What a higher tier would add — omitted entirely on Elite */}
      {notIncluded.length > 0 && nextTier && (
        <div className="space-y-4 pt-2">
          <div>
            <h3 className="font-display font-bold text-xl text-text flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" /> Available on a higher tier
            </h3>
            <p className="text-text-muted text-sm mt-1">
              {notIncluded.length} further service area{notIncluded.length === 1 ? '' : 's'} unlock as you move up from {plan.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notIncluded.map((service) => (
              <div
                key={service.id}
                className="p-5 rounded-2xl bg-white/2 border border-white/10 hover:border-white/20 transition-all duration-300 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border text-text-dim bg-white/5 border-white/15">
                    {service.categoryLabel.toUpperCase()}
                  </span>
                  <Lock className="w-3.5 h-3.5 text-text-dim shrink-0" />
                </div>
                <h4 className="font-display font-bold text-base text-text tracking-tight">{service.name}</h4>
                <p className="text-xs text-text-muted leading-relaxed font-light">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
