import { getPlan, includedAddOnsForPlan, type PlanId } from '@/lib/package-catalog';

/**
 * Single source of truth for "what did the visitor configure in /build" —
 * shared by PackageBuilder (writer), /cart and /checkout (readers), so the
 * cart/checkout flow can't drift from what the builder actually shows.
 */
export const BUILDER_STORAGE_KEY = 'sid-package-builder';

export interface SelectedItem {
  id: string;
  name: string;
  price: number;
  categoryLabel: string;
  custom?: boolean;
  note?: string;
  /** Bundled with the chosen tier — always selected, never billed as an extra. */
  included?: boolean;
}

/** Reads the persisted builder selection. Returns null if nothing was saved, storage is unavailable, or the data is corrupt. */
export function readBuilderSelection(): { planId: PlanId; extras: SelectedItem[] } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BUILDER_STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { planId?: string; selected?: SelectedItem[] };
    if (!saved.planId) return null;
    const extras = Array.isArray(saved.selected) ? saved.selected.filter((s) => !s.included) : [];
    return { planId: getPlan(saved.planId).id, extras };
  } catch {
    return null;
  }
}

/** Removes one extra (by id) from the persisted selection and returns the updated extras list. No-ops if nothing is saved. */
export function removeExtraFromBuilderSelection(id: string): SelectedItem[] {
  const current = readBuilderSelection();
  if (!current) return [];
  const extras = current.extras.filter((e) => e.id !== id);
  try {
    localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify({ planId: current.planId, selected: extras }));
  } catch {
    /* storage full / unavailable — in-memory state still updates for this render */
  }
  return extras;
}

/** Clears the builder selection entirely — called once a checkout attempt is actually submitted. */
export function clearBuilderSelection(): void {
  try {
    localStorage.removeItem(BUILDER_STORAGE_KEY);
  } catch {
    /* unavailable — nothing to do */
  }
}

/**
 * Merges tier-bundled services with the client's own extras — the same
 * derivation PackageBuilder uses for its own display, so this can't diverge.
 */
export function resolveFullSelection(planId: PlanId, extras: SelectedItem[]): SelectedItem[] {
  const bundled = includedAddOnsForPlan(planId);
  const bundledIds = new Set(bundled.map((a) => a.id));
  return [
    ...bundled.map((a) => ({
      id: a.id,
      name: a.name,
      price: a.price,
      categoryLabel: a.categoryLabel,
      included: true,
    })),
    ...extras.filter((e) => !bundledIds.has(e.id)),
  ];
}
