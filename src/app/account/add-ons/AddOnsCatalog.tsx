'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Plus, Search, Sparkles, Lock, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/components/CurrencyProvider';
import {
  allAddOns, addOnCategories, getPlan, planOrder, isIncludedInPlan, type PlanId,
} from '@/lib/package-catalog';

/** Tier badge colours, matching the builder so the two read as one catalog. */
const TIER_STYLE: Record<string, string> = {
  Foundation: 'text-blue-300 bg-blue-500/10 border-blue-500/25',
  Care:       'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  Assure:     'text-amber-300 bg-amber-500/10 border-amber-500/25',
  Elite:      'text-purple-300 bg-purple-500/10 border-purple-500/25',
};

export function AddOnsCatalog({ planId }: { planId: PlanId | null }) {
  const { price } = useCurrency();
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  /** Extras the client is requesting on top of what their tier already covers. */
  const [requested, setRequested] = useState<Record<string, boolean>>({});

  const plan = planId ? getPlan(planId) : null;

  const included = useMemo(
    () => new Set(planId ? allAddOns.filter((a) => isIncludedInPlan(a.id, planId)).map((a) => a.id) : []),
    [planId],
  );

  const categories = ['All', ...addOnCategories.map((c) => c.label)];

  const filtered = allAddOns.filter((a) => {
    const matchesCategory = activeCategory === 'All' || a.categoryLabel === activeCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const requestedCount = Object.values(requested).filter(Boolean).length;

  const toggle = (id: string) => {
    if (included.has(id)) return; // already covered — nothing to request
    setRequested((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-fluid-h1 text-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent shrink-0" /> Add-On Services Catalog
          </h1>
          <p className="text-text-muted text-sm mt-1">
            All {allAddOns.length} SID service areas.{' '}
            {plan
              ? <>Your <strong className="text-text">{plan.name}</strong> plan already covers {included.size} of them.</>
              : <>Choose a plan to see what your package covers.</>}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
            <Check className="w-3.5 h-3.5" /> {included.size} included
          </span>
          {requestedCount > 0 && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs font-semibold">
              <ShoppingCart className="w-3.5 h-3.5" /> {requestedCount} requested
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all',
                activeCategory === c
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white/4 text-text-muted border-white/10 hover:text-text hover:border-white/20',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative lg:ml-auto lg:w-72">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-card border border-border text-xs text-text placeholder:text-text-dim focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-text-dim">No services match that search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 pt-1">
          {filtered.map((service) => {
            const isIncluded = included.has(service.id);
            const isRequested = !!requested[service.id];
            const unlockTier = getPlan(service.categoryId).name;

            return (
              <div
                key={service.id}
                className={cn(
                  'p-5 rounded-xl border flex flex-col justify-between transition-all duration-200 glass-card',
                  isIncluded
                    ? 'border-emerald-500/40 ring-1 ring-emerald-500/25 bg-emerald-500/5'
                    : isRequested
                      ? 'border-accent/60 ring-1 ring-accent/40 bg-accent/5'
                      : 'glass-card-hover',
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border', TIER_STYLE[service.categoryLabel])}>
                      {service.categoryLabel}
                    </span>
                    {isIncluded ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border text-emerald-300 bg-emerald-500/15 border-emerald-500/30">
                        <Check className="w-3 h-3" /> Added
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-text-dim">
                        <Lock className="w-3 h-3" /> {unlockTier}+
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-fluid-h3 text-text mb-1.5 leading-snug">{service.name}</h3>
                  <p className="text-fluid-sm text-text-muted mb-4">{service.desc}</p>
                </div>

                <div className="pt-3 border-t border-border mt-2 space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display font-bold text-lg text-text">
                        {isIncluded ? 'Included' : price(service.price)}
                      </p>
                      <p className="text-[11px] text-text-dim truncate">
                        {isIncluded ? `Covered by ${plan?.name}` : 'Added to your package'}
                      </p>
                    </div>
                  </div>

                  {isIncluded ? (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                      <Check className="w-4 h-4" /> Active Service
                    </div>
                  ) : (
                    <button
                      onClick={() => toggle(service.id)}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold border transition-all',
                        isRequested
                          ? 'bg-accent text-white border-accent'
                          : 'bg-white/5 text-text-muted border-white/10 hover:text-text hover:border-accent/40',
                      )}
                    >
                      {isRequested ? <><Check className="w-4 h-4" /> Requested</> : <><Plus className="w-4 h-4" /> Request this service</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upgrade hint */}
      {plan && included.size < allAddOns.length && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-white/3">
          <p className="text-sm text-text-muted">
            {allAddOns.length - included.size} further service areas unlock on a higher tier than {plan.name}.
          </p>
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold text-xs hover:from-accent-glow hover:to-purple-500 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Compare plans
          </Link>
        </div>
      )}
    </div>
  );
}

/** Tier order is exported for callers that need to reason about upgrades. */
export { planOrder };
