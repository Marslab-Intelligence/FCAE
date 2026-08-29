'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Search, Plus, Check, X, GripVertical, Sparkles, ArrowRight,
  Trash2, Wand2, Package, LayoutGrid, Info, HelpCircle, Maximize2,
  RotateCcw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import {
  basePlans, getPlan, addOnCategories, allAddOns,
  includedAddOnsForPlan, isIncludedInPlan, type PlanId, type AddOn,
} from '@/lib/package-catalog';
import { useCurrency } from '@/components/CurrencyProvider';

interface SelectedItem {
  id: string;
  name: string;
  price: number;
  categoryLabel: string;
  custom?: boolean;
  note?: string;
  /** Bundled with the chosen tier — always selected, and never billed as an extra. */
  included?: boolean;
}

const STORAGE_KEY = 'sid-package-builder';

const categoryChips = [
  { id: 'all', label: 'All Services' },
  ...addOnCategories.map((c) => ({ id: c.id, label: c.label })),
];

const getHashOffset = (str: string, range: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % range) - (range / 2);
};

export function PackageBuilder({
  initialPlan = null,
  isSignedIn = false,
}: {
  initialPlan?: string | null;
  isSignedIn?: boolean;
}) {
  // These two must start from values the server can produce as well, otherwise
  // the first client render disagrees with the SSR markup and React throws a
  // hydration mismatch. Saved state is restored after mount instead.
  const [planId, setPlanId] = useState<PlanId>(() => getPlan(initialPlan).id);

  // Only what the client added themselves. Tier-bundled services are derived
  // below, so they can never drift out of sync with the chosen plan.
  const [extras, setExtras] = useState<SelectedItem[]>([]);

  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [dragOver, setDragOver] = useState(false);
  const [draggedAddOn, setDraggedAddOn] = useState<AddOn | null>(null);
  const [customName, setCustomName] = useState('');
  const [hydrated, setHydrated] = useState(false);
  
  // Tab control for mobile layout ('base' | 'addons' | 'package')
  const [mobileTab, setMobileTab] = useState<'base' | 'addons' | 'package'>('base');
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  // Package prices are stored in INR; `fmtK` renders them in the chosen currency.
  const { compact: fmtK } = useCurrency();

  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [maxSidebarOpen, setMaxSidebarOpen] = useState(true);
  const [maxLeftSidebarOpen, setMaxLeftSidebarOpen] = useState(true);
  const [maxSearch, setMaxSearch] = useState('');

  const handleResetLayout = (isMax: boolean) => {
    if (isMax) {
      setCustomMaxPositions({});
      try {
        localStorage.removeItem('sid-custom-max-positions');
      } catch {}
    } else {
      setCustomPositions({});
      try {
        localStorage.removeItem('sid-custom-positions');
      } catch {}
    }
  };

  const previewSvgRef = useRef<SVGSVGElement>(null);
  const maximizedSvgRef = useRef<SVGSVGElement>(null);

  const [activeDrag, setActiveDrag] = useState<{
    id: string;
    isMax: boolean;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [customMaxPositions, setCustomMaxPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Load custom layout positions from localStorage on mount
  useEffect(() => {
    try {
      const posRaw = localStorage.getItem('sid-custom-positions');
      if (posRaw) setCustomPositions(JSON.parse(posRaw));
      
      const maxPosRaw = localStorage.getItem('sid-custom-max-positions');
      if (maxPosRaw) setCustomMaxPositions(JSON.parse(maxPosRaw));
    } catch (e) {
      console.error("Error loading custom positions", e);
    }
  }, []);

  // Save custom layout positions to localStorage on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('sid-custom-positions', JSON.stringify(customPositions));
    } catch {}
  }, [customPositions, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('sid-custom-max-positions', JSON.stringify(customMaxPositions));
    } catch {}
  }, [customMaxPositions, hydrated]);

  const handlePointerDown = (
    e: React.PointerEvent,
    nodeId: string,
    isMax: boolean,
    nodeX: number,
    nodeY: number,
    svgElement: SVGSVGElement | null
  ) => {
    if (!svgElement) return;
    if (e.button !== 0) return; // Left click only
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    
    const point = svgElement.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    
    const ctm = svgElement.getScreenCTM();
    if (!ctm) return;
    const svgPoint = point.matrixTransform(ctm.inverse());
    
    setActiveDrag({
      id: nodeId,
      isMax,
      offsetX: svgPoint.x - nodeX,
      offsetY: svgPoint.y - nodeY,
    });
  };

  const handleSVGPointerMove = (e: React.PointerEvent, isMax: boolean) => {
    const svgElement = isMax ? maximizedSvgRef.current : previewSvgRef.current;
    if (!activeDrag || !svgElement) return;
    e.preventDefault();
    
    const point = svgElement.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    
    const ctm = svgElement.getScreenCTM();
    if (!ctm) return;
    const svgPoint = point.matrixTransform(ctm.inverse());
    
    const newX = svgPoint.x - activeDrag.offsetX;
    const newY = svgPoint.y - activeDrag.offsetY;
    
    if (isMax) {
      setCustomMaxPositions((prev) => ({
        ...prev,
        [activeDrag.id]: { x: newX, y: newY },
      }));
    } else {
      setCustomPositions((prev) => ({
        ...prev,
        [activeDrag.id]: { x: newX, y: newY },
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeDrag) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setActiveDrag(null);
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMaximized(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const dropRef = useRef<HTMLDivElement>(null);
  const plan = getPlan(planId);

  // ── Restore saved builder state, then mark hydrated ──
  // Runs after the first paint so the initial render still matches the SSR
  // markup; the restore lands as an ordinary update rather than during
  // hydration. The persist effect below is gated on `hydrated`, so it can't
  // overwrite storage before this has read it.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { planId?: PlanId; selected?: SelectedItem[] };
          if (!initialPlan && saved.planId && basePlans.some((p) => p.id === saved.planId)) {
            setPlanId(saved.planId);
          }
          if (Array.isArray(saved.selected)) {
            // Older saves stored tier-bundled services too; those are derived
            // from the plan now, so keep only genuine client additions.
            setExtras(saved.selected.filter((s) => !s.included));
          }
        }
      } catch {
        /* corrupt or unavailable storage — start fresh */
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, [initialPlan]);

  // ── Persist on change ──
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ planId, selected: extras }));
    } catch {
      /* storage full / unavailable */
    }
  }, [planId, extras, hydrated]);

  // ── Tier inclusions ────────────────────────────────────────────────────────
  // Choosing a tier pre-loads every service that tier bundles, and switching
  // tiers re-derives them: upgrading pulls newly covered services in,
  // downgrading drops the ones no longer covered. A service the client added
  // themselves simply stops being billed separately once a tier covers it.
  const selected = useMemo<SelectedItem[]>(() => {
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
  }, [planId, extras]);

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allAddOns.filter((a) => {
      const matchCat = activeCat === 'all' || a.categoryId === activeCat;
      const matchQ = !q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [search, activeCat]);

  const addOn = (a: { id: string; name: string; price: number; categoryLabel: string }) => {
    if (isIncludedInPlan(a.id, planId)) return; // already bundled with the tier
    setExtras((prev) =>
      prev.some((s) => s.id === a.id)
        ? prev
        : [...prev, { id: a.id, name: a.name, price: a.price, categoryLabel: a.categoryLabel }]
    );
  };

  // Bundled services live outside `extras`, so this can only ever remove an
  // item the client actually chose to add.
  const removeItem = (id: string) => setExtras((prev) => prev.filter((s) => s.id !== id));

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    setExtras((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name, price: 0, categoryLabel: 'Custom request', custom: true },
    ]);
    setCustomName('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setDraggedAddOn(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data?.id && data?.name) addOn(data);
    } catch {
      /* not a catalog payload */
    }
  };

  const knownItems = selected.filter((s) => !s.custom);
  const customItems = selected.filter((s) => s.custom);
  const includedItems = knownItems.filter((s) => s.included);
  const extraItems = knownItems.filter((s) => !s.included);
  // Bundled services are already paid for by the base tier — only extras add cost.
  const addOnsTotal = extraItems.reduce((sum, s) => sum + s.price, 0);
  const monthlyTotal = plan.priceMonthly + addOnsTotal;
  const annualMonthlyEquivalent = Math.round(monthlyTotal * 0.8);

  interface TopologyNode {
    id: string;
    label: string;
    type: 'root' | 'category' | 'service' | 'ghost-category' | 'ghost-service';
    x: number;
    y: number;
    color: string;
    icon?: string;
    price?: number;
    originalId?: string;
  }

  interface TopologyLink {
    id: string;
    from: { x: number; y: number };
    to: { x: number; y: number };
    color: string;
    animated: boolean;
    ghost?: boolean;
  }

    const topology = useMemo(() => {
    const nodes: TopologyNode[] = [];
    const links: TopologyLink[] = [];

    const rootX = 300;
    const rootY = 45;
    const rootColor = planId === 'foundation' ? '#a855f7' : planId === 'care' ? '#10b981' : planId === 'assure' ? '#f59e0b' : '#3b82f6';
    
    const actualRootX = customPositions['root']?.x ?? rootX;
    const actualRootY = customPositions['root']?.y ?? rootY;

    // Core Base Plan Node
    nodes.push({
      id: 'root',
      label: plan.name,
      type: 'root',
      x: actualRootX,
      y: actualRootY,
      icon: plan.icon,
      color: rootColor,
    });

    if (selected.length === 0) {
      // 3 Ghost category hubs (staggered for organic layout)
      const ghosts = [
        { id: 'g-ops', label: 'Cloud Ops', color: '#06b6d4', x: 140, y: 140, childX: 120, childY: 240, childLabel: 'Monitoring' },
        { id: 'g-sec', label: 'Security', color: '#a855f7', x: 300, y: 160, childX: 320, childY: 240, childLabel: 'Compliance' },
        { id: 'g-dev', label: 'DevOps', color: '#f97316', x: 460, y: 140, childX: 440, childY: 240, childLabel: 'Infrastructure' },
      ];

      ghosts.forEach((g) => {
        const actualHubX = customPositions[g.id]?.x ?? g.x;
        const actualHubY = customPositions[g.id]?.y ?? g.y;

        nodes.push({
          id: g.id,
          label: g.label,
          type: 'ghost-category',
          x: actualHubX,
          y: actualHubY,
          color: g.color,
        });
        links.push({
          id: `link-root-${g.id}`,
          from: { x: actualRootX, y: actualRootY + 30 },
          to: { x: actualHubX, y: actualHubY - 17 },
          color: g.color,
          animated: false,
          ghost: true,
        });

        const childId = `${g.id}-child`;
        const actualChildX = customPositions[childId]?.x ?? g.childX;
        const actualChildY = customPositions[childId]?.y ?? g.childY;

        nodes.push({
          id: childId,
          label: g.childLabel,
          type: 'ghost-service',
          x: actualChildX,
          y: actualChildY,
          color: g.color,
        });
        links.push({
          id: `link-${g.id}-child`,
          from: { x: actualHubX, y: actualHubY + 17 },
          to: { x: actualChildX, y: actualChildY - 25 },
          color: g.color,
          animated: false,
          ghost: true,
        });
      });
    } else {
      // Real selected categories & items
      const categoryGroups: Record<string, { label: string; color: string; items: SelectedItem[] }> = {};

      selected.forEach((item) => {
        const label = item.categoryLabel || 'Custom';
        let color = '#0ea5e9'; // sky
        if (label.toLowerCase().includes('operations')) color = '#06b6d4'; // cyan
        else if (label.toLowerCase().includes('finops') || label.toLowerCase().includes('cost')) color = '#10b981'; // emerald
        else if (label.toLowerCase().includes('security') || label.toLowerCase().includes('compliance')) color = '#a855f7'; // purple
        else if (label.toLowerCase().includes('devops') || label.toLowerCase().includes('platform')) color = '#f97316'; // orange
        else if (label.toLowerCase().includes('support')) color = '#f43f5e'; // rose
        else if (item.custom) color = '#0ea5e9';

        if (!categoryGroups[label]) {
          categoryGroups[label] = { label, color, items: [] };
        }
        categoryGroups[label].items.push(item);
      });

      const activeGroups = Object.values(categoryGroups);
      const numCats = activeGroups.length;

      // Distribute categories dynamically in a 600 width viewBox
      const totalWidth = Math.min(420, (numCats - 1) * 120); // 120px spacing per category, up to 420px total
      const startX = 300 - totalWidth / 2;

      activeGroups.forEach((group, groupIdx) => {
        // Stagger category hubs vertically to create an irregular tree shape
        const rawHubX = numCats === 1 ? 300 : startX + (totalWidth / (numCats - 1)) * groupIdx;
        const hubX = rawHubX + getHashOffset(group.label, 20); // up to +/- 10px stagger
        const hubY = 150 + (groupIdx % 2 === 0 ? 10 : -10) + getHashOffset(group.label, 12); // up to +/- 6px stagger
        const hubId = `hub-${group.label}`;

        const actualHubX = customPositions[hubId]?.x ?? hubX;
        const actualHubY = customPositions[hubId]?.y ?? hubY;

        nodes.push({
          id: hubId,
          label: group.label,
          type: 'category',
          x: actualHubX,
          y: actualHubY,
          color: group.color,
        });

        links.push({
          id: `link-root-${hubId}`,
          from: { x: actualRootX, y: actualRootY + 30 },
          to: { x: actualHubX, y: actualHubY - 17 },
          color: group.color,
          animated: true,
        });

        // Child services staggered horizontally under their hub in a beautiful zigzag chain
        let prevX = actualHubX;
        let prevY = actualHubY;
        let prevOffset = 17; // hub radius

        group.items.forEach((item, itemIdx) => {
          const xOffset = numCats <= 2 ? 22 : numCats === 3 ? 15 : 10;
          const serviceX = hubX + (itemIdx % 2 === 0 ? -xOffset : xOffset) + getHashOffset(item.name, 10);
          const serviceY = hubY + 90 + itemIdx * 75 + getHashOffset(item.name, 8);
          const serviceId = `service-${item.id}`;

          const actualServiceX = customPositions[serviceId]?.x ?? serviceX;
          const actualServiceY = customPositions[serviceId]?.y ?? serviceY;

          nodes.push({
            id: serviceId,
            label: item.name,
            type: 'service',
            x: actualServiceX,
            y: actualServiceY,
            color: group.color,
            price: item.price,
            originalId: item.id,
          });

          // Line connection in zigzag stacked sequence
          links.push({
            id: `link-${hubId}-${serviceId}`,
            from: { x: prevX, y: prevY + prevOffset },
            to: { x: actualServiceX, y: actualServiceY - 25 },
            color: group.color,
            animated: true,
          });

          prevX = actualServiceX;
          prevY = actualServiceY;
          prevOffset = 25; // service radius
        });
      });
    }

    return { nodes, links };
  }, [planId, selected, plan.name, plan.icon, customPositions]);

  const maxNodeY = useMemo(() => {
    if (topology.nodes.length === 0) return 400;
    return Math.max(400, Math.max(...topology.nodes.map((n) => n.y)) + 60);
  }, [topology.nodes]);

  const maximizedTopology = useMemo(() => {
    const nodes: TopologyNode[] = [];
    const links: TopologyLink[] = [];

    const rootX = 700; // Centered in a 1400 width viewBox
    const rootY = 55;
    const rootColor = planId === 'foundation' ? '#a855f7' : planId === 'care' ? '#10b981' : planId === 'assure' ? '#f59e0b' : '#3b82f6';
    
    const actualRootX = customMaxPositions['root']?.x ?? rootX;
    const actualRootY = customMaxPositions['root']?.y ?? rootY;

    // Core Base Plan Node
    nodes.push({
      id: 'root',
      label: plan.name,
      type: 'root',
      x: actualRootX,
      y: actualRootY,
      icon: plan.icon,
      color: rootColor,
    });

    if (selected.length === 0) {
      // 3 Ghost category hubs (staggered for organic layout in a 1400 width viewBox)
      const ghosts = [
        { id: 'g-ops', label: 'Cloud Operations', color: '#06b6d4', x: 350, y: 200, childX: 300, childY: 320, childLabel: 'Cloud Monitoring' },
        { id: 'g-sec', label: 'Security & Compliance', color: '#a855f7', x: 700, y: 220, childX: 720, childY: 320, childLabel: 'Vulnerability Scanning' },
        { id: 'g-support', label: 'Premium Support', color: '#f43f5e', x: 1050, y: 200, childX: 1000, childY: 320, childLabel: 'Dedicated Support' },
      ];

      ghosts.forEach((g) => {
        const actualHubX = customMaxPositions[g.id]?.x ?? g.x;
        const actualHubY = customMaxPositions[g.id]?.y ?? g.y;

        nodes.push({
          id: g.id,
          label: g.label,
          type: 'ghost-category',
          x: actualHubX,
          y: actualHubY,
          color: g.color,
        });
        links.push({
          id: `link-root-${g.id}`,
          from: { x: actualRootX, y: actualRootY + 28 },
          to: { x: actualHubX, y: actualHubY - 20 },
          color: g.color,
          animated: false,
          ghost: true,
        });

        const childId = `${g.id}-child`;
        const actualChildX = customMaxPositions[childId]?.x ?? g.childX;
        const actualChildY = customMaxPositions[childId]?.y ?? g.childY;

        nodes.push({
          id: childId,
          label: g.childLabel,
          type: 'ghost-service',
          x: actualChildX,
          y: actualChildY,
          color: g.color,
        });
        links.push({
          id: `link-${g.id}-child`,
          from: { x: actualHubX, y: actualHubY + 15 },
          to: { x: actualChildX, y: actualChildY - 32 },
          color: g.color,
          animated: false,
          ghost: true,
        });
      });
    } else {
      // Real selected categories & items
      const categoryGroups: Record<string, { label: string; color: string; items: SelectedItem[] }> = {};

      selected.forEach((item) => {
        const label = item.categoryLabel || 'Custom';
        let color = '#0ea5e9';
        if (label.toLowerCase().includes('operations')) color = '#06b6d4';
        else if (label.toLowerCase().includes('finops') || label.toLowerCase().includes('cost')) color = '#10b981';
        else if (label.toLowerCase().includes('security') || label.toLowerCase().includes('compliance')) color = '#a855f7';
        else if (label.toLowerCase().includes('devops') || label.toLowerCase().includes('platform')) color = '#f97316';
        else if (label.toLowerCase().includes('support')) color = '#f43f5e';

        if (!categoryGroups[label]) {
          categoryGroups[label] = { label, color, items: [] };
        }
        categoryGroups[label].items.push(item);
      });

      const activeGroups = Object.values(categoryGroups);
      const numCats = activeGroups.length;

      // Distribute categories dynamically in a 1400 width viewBox
      const totalWidth = Math.min(1100, (numCats - 1) * 300); // 300px spacing per category, up to 1100px total
      const startX = 700 - totalWidth / 2;

      activeGroups.forEach((group, groupIdx) => {
        // Stagger category hubs vertically to create an irregular tree shape
        const rawHubX = numCats === 1 ? 700 : startX + (totalWidth / (numCats - 1)) * groupIdx;
        const hubX = rawHubX + getHashOffset(group.label, 40); // up to +/- 20px stagger
        const hubY = 220 + (groupIdx % 2 === 0 ? 15 : -15) + getHashOffset(group.label, 20); // up to +/- 10px stagger
        const hubId = `hub-${group.label}`;

        const actualHubX = customMaxPositions[hubId]?.x ?? hubX;
        const actualHubY = customMaxPositions[hubId]?.y ?? hubY;

        nodes.push({
          id: hubId,
          label: group.label,
          type: 'category',
          x: actualHubX,
          y: actualHubY,
          color: group.color,
        });

        links.push({
          id: `link-root-${hubId}`,
          from: { x: actualRootX, y: actualRootY + 28 },
          to: { x: actualHubX, y: actualHubY - 20 },
          color: group.color,
          animated: true,
        });

        // Child services staggered horizontally under their hub in a beautiful zigzag chain
        let prevX = actualHubX;
        let prevY = actualHubY;
        let prevOffset = 20; // hub radius

        group.items.forEach((item, itemIdx) => {
          const xOffset = numCats <= 2 ? 35 : numCats === 3 ? 25 : 15;
          const serviceX = hubX + (itemIdx % 2 === 0 ? -xOffset : xOffset) + getHashOffset(item.name, 24);
          const serviceY = hubY + 110 + itemIdx * 80 + getHashOffset(item.name, 12);
          const serviceId = `service-${item.id}`;

          const actualServiceX = customMaxPositions[serviceId]?.x ?? serviceX;
          const actualServiceY = customMaxPositions[serviceId]?.y ?? serviceY;

          nodes.push({
            id: serviceId,
            label: item.name,
            type: 'service',
            x: actualServiceX,
            y: actualServiceY,
            color: group.color,
            price: item.price,
            originalId: item.id,
          });

          // Line connection in zigzag stacked sequence
          links.push({
            id: `link-${hubId}-${serviceId}`,
            from: { x: prevX, y: prevY + prevOffset },
            to: { x: actualServiceX, y: actualServiceY - 32 },
            color: group.color,
            animated: true,
          });

          prevX = actualServiceX;
          prevY = actualServiceY;
          prevOffset = 32; // service radius
        });
      });
    }

    return { nodes, links };
  }, [planId, selected, plan.name, plan.icon, customMaxPositions]);

  const maxMaximizedNodeY = useMemo(() => {
    if (maximizedTopology.nodes.length === 0) return 650;
    return Math.max(650, Math.max(...maximizedTopology.nodes.map((n) => n.y)) + 100);
  }, [maximizedTopology.nodes]);

  const summaryQuery = new URLSearchParams({
    plan: plan.name,
    services: selected.map((s) => s.name).join(', '),
  }).toString();
  // Signed-in clients already have an account, so they go straight to the
  // contact hand-off; everyone else fills in the lead form first and is then
  // sent to sign-up, where the email they just gave becomes their login.
  const ctaHref = isSignedIn ? `/contact?${summaryQuery}` : `/signup?redirect=${encodeURIComponent(`/build?plan=${planId}`)}`;
  const leadRedirect = `/sign-up?redirect=${encodeURIComponent(`/build?plan=${planId}`)}`;

  return (
    <section className={cn(
      "relative flex-1 min-h-0 pt-24 lg:pt-28 pb-6 overflow-hidden bg-transparent flex flex-col justify-start",
      isMaximized ? "z-60" : "z-10"
    )}>
      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-[10%] w-96 h-96 rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-96 h-96 rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col flex-1 min-h-0">
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent mb-2">
              <Package className="w-3.5 h-3.5" /> CoE Cloud Configurator
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-white leading-tight">
              Architect Your <span className="bg-linear-to-r from-accent via-purple-400 to-cyan bg-clip-text text-transparent">Managed Package</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-text-dim">
            <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-accent" /> Drag-and-drop enabled</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-cyan" /> 20% Annual Discount</span>
          </div>
        </div>

        {/* Mobile Tab Swapper */}
        <div className="flex lg:hidden bg-white/5 border border-white/10 rounded-xl p-1 mb-4 shrink-0">
          <button
            onClick={() => setMobileTab('base')}
            className={cn(
              'flex-1 py-2 text-xs font-semibold rounded-lg transition-all',
              mobileTab === 'base' ? 'bg-accent text-white shadow-sm' : 'text-text-dim hover:text-text'
            )}
          >
            1. Base Tier
          </button>
          <button
            onClick={() => setMobileTab('addons')}
            className={cn(
              'flex-1 py-2 text-xs font-semibold rounded-lg transition-all relative',
              mobileTab === 'addons' ? 'bg-accent text-white shadow-sm' : 'text-text-dim hover:text-text'
            )}
          >
            2. Services
            {selected.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan text-black font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#030305]">
                {selected.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileTab('package')}
            className={cn(
              'flex-1 py-2 text-xs font-semibold rounded-lg transition-all',
              mobileTab === 'package' ? 'bg-accent text-white shadow-sm' : 'text-text-dim hover:text-text'
            )}
          >
            3. Est: {fmtK(monthlyTotal)}
          </button>
        </div>

        {/* ── Dashboard Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.6fr_1.3fr] gap-4 items-stretch flex-1 min-h-0">

          {/* ═══ COLUMN 1: Base Tier Options & Custom ═══ */}
          <div className={cn(
            "lg:flex flex-col gap-4 h-full min-h-0",
            mobileTab === 'base' ? 'flex' : 'hidden lg:flex'
          )}>
            <div className="flex-1 rounded-2xl border border-white/10 bg-[#0a0a0f]/60 p-4 flex flex-col overflow-hidden min-h-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim mb-3 flex items-center gap-1">
                <span>01</span> Choose Base Tier
              </h2>

              <div className="space-y-2 overflow-y-auto flex-1 pr-1 -mr-1" data-lenis-prevent>
                {basePlans.map((p) => {
                  const active = p.id === planId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlanId(p.id)}
                      style={{ '--pg': p.glow } as React.CSSProperties}
                      className={cn(
                        'w-full text-left rounded-xl border p-3 transition-all duration-300 relative group overflow-hidden',
                        active
                          ? 'bg-white/8 border-white/20 shadow-[0_0_24px_-10px_var(--pg)]'
                          : 'bg-white/3 border-white/8 hover:border-white/15 hover:bg-white/5'
                      )}
                    >
                      {/* Left accent color strip */}
                      <div className={cn(
                        'absolute left-0 top-0 bottom-0 w-1 transition-all',
                        active ? p.accentText.replace('text-', 'bg-') : 'bg-transparent'
                      )} />

                      <div className="pl-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{p.icon}</span>
                            <span className={cn('font-display font-bold text-sm', p.accentText)}>{p.name}</span>
                          </div>
                          <span className="font-mono font-bold text-xs text-white">
                            {fmtK(p.priceMonthly)}<span className="text-[10px] text-text-dim font-normal">/mo</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted leading-tight line-clamp-1 group-hover:line-clamp-none transition-all">{p.tagline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Request Panel */}
            <div className="rounded-2xl border border-dashed border-accent/20 bg-accent/4 p-4 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-3.5 h-3.5 text-accent" />
                <h4 className="font-semibold text-white text-xs">Custom Request</h4>
              </div>
              <p className="text-[11px] text-text-dim mb-3 leading-relaxed">
                Describe a custom requirement. We&apos;ll scope & price it on call.
              </p>
              <div className="flex gap-1.5">
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                  placeholder="e.g. Multi-region DR automation"
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-text-dim text-xs focus:outline-none focus:border-accent/40 focus:bg-white/8 transition-all"
                />
                <button
                  onClick={addCustom}
                  disabled={!customName.trim()}
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-accent text-white hover:bg-accent-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ═══ COLUMN 2: Scrollable Add-On Catalog ═══ */}
          <div className={cn(
            "lg:flex flex-col h-full min-h-0",
            mobileTab === 'addons' ? 'flex' : 'hidden lg:flex'
          )}>
            <div className="flex-1 rounded-2xl border border-white/10 bg-[#0a0a0f]/60 p-4 flex flex-col overflow-hidden min-h-0">
              <div className="flex flex-col gap-3 mb-3 shrink-0">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim flex items-center justify-between">
                  <span>02 Add Add-On Services</span>
                  <span className="text-[10px] text-accent font-semibold">{filtered.length} found</span>
                </h2>

                {/* Search field */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search services (e.g. SOC2, FinOps, Alerting)..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-text-dim text-xs focus:outline-none focus:border-accent/40 focus:bg-white/8 transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-lg bg-white/8 flex items-center justify-center text-text-dim hover:text-text"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Categories tab pills (flex-wrap of tiny pills) */}
                <div className="flex flex-wrap gap-1">
                  {categoryChips.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCat(c.id)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all',
                        activeCat === c.id
                          ? 'bg-accent/15 border-accent/35 text-accent font-semibold'
                          : 'bg-white/3 border-white/5 text-text-dim hover:text-text hover:border-white/12'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* High-Density Add-on Service List */}
              <div className="flex-1 overflow-y-auto pr-1 -mr-1" data-lenis-prevent>
                {filtered.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-white/2 p-6 text-center">
                    <LayoutGrid className="w-6 h-6 text-text-dim mx-auto mb-2" />
                    <p className="text-text-muted text-xs">No matching services.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {filtered.map((a) => {
                      const inCart = selectedIds.has(a.id);
                      const isBundled = isIncludedInPlan(a.id, planId);
                      const isSameCategory = draggedAddOn && draggedAddOn.categoryId === a.categoryId;
                      const isDimmed = draggedAddOn !== null && !isSameCategory;

                      return (
                        <div
                          key={a.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify(a));
                            setDraggedAddOn(a);
                          }}
                          onDragEnd={() => {
                            setDraggedAddOn(null);
                            setDragOver(false);
                          }}
                          className={cn(
                            'group flex flex-col justify-between rounded-xl border p-2.5 transition-all text-left relative cursor-grab active:cursor-grabbing select-none',
                            isSameCategory
                              ? 'bg-accent/20 border-accent scale-102 shadow-[0_0_25px_rgba(168,85,247,0.5)] z-10'
                              : isDimmed
                              ? 'opacity-25 grayscale border-white/5 pointer-events-none'
                              : isBundled
                              ? 'bg-emerald-500/5 border-emerald-500/25'
                              : inCart
                              ? 'bg-accent/5 border-accent/25'
                              : 'bg-white/3 border-white/5 hover:border-white/12 hover:bg-white/5'
                          )}
                        >
                          <div className="flex items-start justify-between gap-1.5 mb-1.5">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <GripVertical className="w-3 h-3 text-text-dim/40 group-hover:text-accent shrink-0 transition-colors" />
                                <h4 className="font-semibold text-white text-xs leading-snug truncate">{a.name}</h4>
                              </div>
                              <p className="text-[10px] text-text-dim line-clamp-2 mt-0.5 leading-snug pl-4">{a.desc}</p>
                            </div>
                            <button
                              onClick={() => (isBundled ? undefined : inCart ? removeItem(a.id) : addOn(a))}
                              disabled={isBundled}
                              title={isBundled ? `Included in the ${plan.name} plan` : undefined}
                              className={cn(
                                'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border transition-all',
                                isBundled
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-default'
                                  : inCart
                                  ? 'bg-accent text-white border-accent hover:bg-red-500 hover:border-red-400'
                                  : 'bg-white/5 border-white/10 text-text-dim hover:bg-accent/15 hover:border-accent/30 hover:text-accent'
                              )}
                            >
                              {isBundled || inCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t border-white/5 mt-auto pl-4">
                            <span className="text-[9px] text-text-dim uppercase tracking-wider">{a.categoryLabel}</span>
                            {isBundled ? (
                              <span className="font-mono font-bold text-[10px] text-emerald-400 uppercase tracking-wider">Included</span>
                            ) : (
                              <span className="font-mono font-bold text-xs text-white">{fmtK(a.price)}<span className="text-[10px] text-text-dim font-normal">/mo</span></span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ COLUMN 3: Live BOM & Request Panel ═══ */}
          <div className={cn(
            "lg:flex flex-col h-full min-h-0",
            mobileTab === 'package' ? 'flex' : 'hidden lg:flex'
          )}>
            <div
              ref={dropRef}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => {
                if (!dropRef.current?.contains(e.relatedTarget as Node)) setDragOver(false);
              }}
              onDrop={handleDrop}
              className={cn(
                'flex-1 rounded-2xl border bg-[#0b0b12]/90 backdrop-blur-xl p-4 flex flex-col overflow-hidden transition-all duration-300',
                dragOver ? 'border-accent shadow-[0_0_30px_-10px_rgba(168,85,247,0.4)]' : 'border-white/10'
              )}
            >
              {/* Header with visual toggle */}
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim flex items-center gap-1.5">
                  <span>03</span> Live Config
                </h2>
                
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-[9px] font-semibold">
                    <button
                      onClick={() => setViewMode('tree')}
                      className={cn(
                        'px-2 py-0.5 rounded-md transition-all flex items-center gap-1',
                        viewMode === 'tree' ? 'bg-accent text-white shadow-sm' : 'text-text-dim hover:text-text'
                      )}
                    >
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Topology
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'px-2 py-0.5 rounded-md transition-all',
                        viewMode === 'list' ? 'bg-accent text-white shadow-sm' : 'text-text-dim hover:text-text'
                      )}
                    >
                      BOM List
                    </button>
                  </div>

                  {/* Maximize Workspace Button */}
                  {viewMode === 'tree' && (
                    <button
                      onClick={() => setIsMaximized(true)}
                      title="Expand interactive workspace"
                      className="p-1 rounded-lg bg-white/5 border border-white/10 text-text-dim hover:text-white transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {viewMode === 'tree' ? (
                /* Topology Tree View */
                <div className="flex-1 flex flex-col min-h-0 mb-3" data-lenis-prevent>
                  <div
                    onClick={() => setIsMaximized(true)}
                    className="relative w-full flex-1 rounded-xl border border-white/5 bg-black/40 overflow-hidden p-3 flex items-center justify-center transition-all duration-700 ease-out cursor-zoom-in group/canvas"
                  >
                    {/* HUD background grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />
                    
                    {/* Cost Savings Badge in Preview */}
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
                      Saving {fmtK(Math.round(monthlyTotal * 0.2 * 12))}/yr
                    </div>

                    {/* Expand workspace overlay hint */}
                    <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 px-2 py-1 rounded bg-black/80 border border-white/10 text-[8px] text-text-dim opacity-0 group-hover/canvas:opacity-100 transition-opacity duration-300 pointer-events-none uppercase tracking-wider font-mono">
                      <Maximize2 className="w-2 h-2 text-accent" /> Click to Expand
                    </div>
                    
                    <svg
                      ref={previewSvgRef}
                      onPointerMove={(e) => handleSVGPointerMove(e, false)}
                      viewBox={`0 0 600 ${maxNodeY}`}
                      className="w-full h-auto relative z-10 overflow-visible"
                    >
                      <defs>
                        {/* Glow filters and style tag for path keyframe animations */}
                        <filter id="glow-c" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="6" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <style>{`
                          @keyframes dash {
                            to {
                              stroke-dashoffset: -20;
                            }
                          }
                          .animate-dash {
                            stroke-dasharray: 6,4;
                            animation: dash 1.2s linear infinite;
                          }
                        `}</style>
                      </defs>

                      {/* Render Links */}
                      {topology.links.map((link) => {
                        const midY = (link.from.y + link.to.y) / 2;
                        const pathD = `M ${link.from.x} ${link.from.y} C ${link.from.x} ${midY}, ${link.to.x} ${midY}, ${link.to.x} ${link.to.y}`;
                        const isDimmed = hoveredNode && !link.id.includes(hoveredNode) && hoveredNode !== 'root';

                        return (
                          <path
                            key={link.id}
                            d={pathD}
                            fill="none"
                            stroke={link.color}
                            strokeWidth={link.ghost ? 1 : 2}
                            strokeOpacity={isDimmed ? 0.15 : link.ghost ? 0.25 : 0.7}
                            strokeDasharray={link.ghost ? "4,4" : undefined}
                            className={cn(
                              link.animated && !isDimmed && "animate-dash",
                              "transition-opacity duration-300"
                            )}
                          />
                        );
                      })}

                      {/* Render Nodes */}
                      {topology.nodes.map((n) => {
                        const isDimmed = hoveredNode && hoveredNode !== n.id && hoveredNode !== 'root';
                        
                        if (n.type === 'root') {
                          return (
                            <foreignObject
                              key={n.id}
                              x={n.x - 95}
                              y={n.y - 44}
                              width={190}
                              height={88}
                              className="overflow-visible"
                            >
                              <div
                                onMouseEnter={() => setHoveredNode(n.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                onPointerDown={(e) => handlePointerDown(e, n.id, false, n.x, n.y, previewSvgRef.current)}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                style={{
                                  borderColor: n.color,
                                  boxShadow: hoveredNode === n.id ? `0 0 22px ${n.color}80` : `0 0 18px -2px ${n.color}60`,
                                  touchAction: 'none',
                                }}
                                className="w-full h-full rounded-2xl border-2 bg-neutral-950 flex flex-col items-center justify-center p-2.5 text-center transition-all duration-300 cursor-grab active:cursor-grabbing select-none touch-none"
                              >
                                <span className="text-xl leading-none mb-1">{n.icon}</span>
                                <span style={{ textShadow: `0 0 12px ${n.color}90` }} className="text-[14px] font-black uppercase tracking-widest text-white leading-none">
                                  {n.label}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono font-semibold">
                                  Base Core
                                </span>
                              </div>
                            </foreignObject>
                          );
                        }

                        if (n.type === 'category') {
                          return (
                            <foreignObject
                              key={n.id}
                              x={n.x - 95}
                              y={n.y - 22}
                              width={190}
                              height={44}
                              className="overflow-visible"
                            >
                              <div
                                onMouseEnter={() => setHoveredNode(n.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                onPointerDown={(e) => handlePointerDown(e, n.id, false, n.x, n.y, previewSvgRef.current)}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                style={{
                                  borderColor: n.color,
                                  boxShadow: hoveredNode === n.id ? `0 0 14px ${n.color}50` : `0 0 10px ${n.color}25`,
                                  touchAction: 'none',
                                }}
                                className={cn(
                                  "w-full h-full rounded-xl border-2 bg-neutral-950 flex items-center justify-center text-center px-2 cursor-grab active:cursor-grabbing select-none touch-none transition-all duration-300",
                                  isDimmed ? "opacity-30" : "opacity-100"
                                )}
                              >
                                <span style={{ textShadow: `0 0 10px ${n.color}70` }} className="text-[13px] font-extrabold text-white uppercase tracking-wide leading-tight text-center wrap-break-word">
                                  {n.label}
                                </span>
                              </div>
                            </foreignObject>
                          );
                        }

                        if (n.type === 'ghost-category') {
                          return (
                            <foreignObject
                              key={n.id}
                              x={n.x - 95}
                              y={n.y - 22}
                              width={190}
                              height={44}
                              className="overflow-visible"
                            >
                              <div
                                onPointerDown={(e) => handlePointerDown(e, n.id, false, n.x, n.y, previewSvgRef.current)}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                style={{
                                  borderColor: `${n.color}40`,
                                  touchAction: 'none',
                                }}
                                className="w-full h-full rounded-xl border-2 border-dashed bg-white/3 flex items-center justify-center text-center px-2 opacity-65 cursor-grab active:cursor-grabbing select-none touch-none"
                              >
                                <span className="text-[13px] font-bold text-slate-300 uppercase tracking-wide leading-tight text-center wrap-break-word">
                                  {n.label}
                                </span>
                              </div>
                            </foreignObject>
                          );
                        }

                        if (n.type === 'ghost-service') {
                          return (
                            <foreignObject
                              key={n.id}
                              x={n.x - 95}
                              y={n.y - 34}
                              width={190}
                              height={68}
                              className="overflow-visible"
                            >
                              <div
                                onPointerDown={(e) => handlePointerDown(e, n.id, false, n.x, n.y, previewSvgRef.current)}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                style={{
                                  borderColor: `${n.color}30`,
                                  touchAction: 'none',
                                }}
                                className="w-full h-full rounded-xl border border-dashed bg-white/2 flex items-center justify-center px-2.5 opacity-60 cursor-grab active:cursor-grabbing select-none touch-none"
                              >
                                <span className="text-[12px] font-semibold text-slate-300 whitespace-normal wrap-break-word text-center line-clamp-2 leading-snug">
                                  {n.label}
                                </span>
                              </div>
                            </foreignObject>
                          );
                        }

                        return (
                          <foreignObject
                            key={n.id}
                            x={n.x - 95}
                            y={n.y - 34}
                            width={190}
                            height={68}
                            className="overflow-visible"
                          >
                            <div
                              onMouseEnter={() => setHoveredNode(n.id)}
                              onMouseLeave={() => setHoveredNode(null)}
                              onPointerDown={(e) => handlePointerDown(e, n.id, false, n.x, n.y, previewSvgRef.current)}
                              onPointerUp={handlePointerUp}
                              onPointerCancel={handlePointerUp}
                              style={{
                                borderColor: n.color,
                                boxShadow: hoveredNode === n.id ? `0 0 16px ${n.color}60` : `0 0 8px ${n.color}20`,
                                touchAction: 'none',
                              }}
                              className={cn(
                                "group/node w-full h-full rounded-xl border-2 bg-neutral-900 hover:bg-neutral-950 flex items-center justify-between px-2.5 relative shadow-lg cursor-grab active:cursor-grabbing select-none touch-none transition-all duration-300",
                                isDimmed ? "opacity-30" : "opacity-100"
                              )}
                            >
                              <div className="min-w-0 flex-1 pr-1">
                                <p style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }} className="text-[13px] font-bold text-white leading-snug whitespace-normal wrap-break-word line-clamp-2">
                                  {n.label}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5 leading-none font-semibold">
                                  +{fmtK(n.price || 0)}/mo
                                </p>
                              </div>
                              <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (n.originalId) removeItem(n.originalId);
                                }}
                                className="w-5.5 h-5.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </foreignObject>
                        );
                      })}</svg>
                  </div>
                </div>
              ) : (
                /* Original BOM List View */
                <>
                  {/* Base Tier Banner */}
                  <div className="rounded-xl border border-white/8 bg-white/3 p-3 mb-3 relative overflow-hidden"
                    style={{ '--pg': plan.glow } as React.CSSProperties}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{plan.icon}</span>
                        <div>
                          <p className="text-[9px] text-text-dim uppercase tracking-widest leading-none">Base Tier</p>
                          <h3 className={cn('font-display font-bold text-sm leading-none mt-0.5', plan.accentText)}>{plan.name}</h3>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-white">{fmtK(plan.priceMonthly)}/mo</span>
                    </div>
                  </div>

                  {/* Selected Add-ons List */}
                  <div className="flex-1 overflow-y-auto mb-3 pr-1 -mr-1" data-lenis-prevent>
                    {selected.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-white/8 py-8 px-4 h-full">
                        <div className="w-10 h-10 rounded-xl bg-white/3 border border-white/8 flex items-center justify-center mb-2">
                          <Package className="w-5 h-5 text-text-dim" />
                        </div>
                        <p className="text-text-muted font-medium text-xs">No services added yet</p>
                        <p className="text-[10px] text-text-dim mt-0.5">Click + on any service card in column 2</p>
                      </div>
                    ) : (
                      <Reorder.Group
                        axis="y"
                        values={selected}
                        onReorder={(next: SelectedItem[]) => setExtras(next.filter((i) => !i.included))}
                        className="space-y-1.5"
                      >
                        {selected.map((item) => (
                          <Reorder.Item
                            key={item.id}
                            value={item}
                            className={cn(
                              'group flex items-center justify-between p-2 rounded-lg border cursor-grab active:cursor-grabbing',
                              item.included
                                ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/8'
                                : 'bg-white/3 border-white/5 hover:bg-white/5'
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-text-dim/40 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                                <p className="text-[9px] text-text-dim">
                                  {item.custom
                                    ? 'Custom requirement'
                                    : item.included
                                    ? `${item.categoryLabel} · included in plan`
                                    : `${item.categoryLabel} · ${fmtK(item.price)}/mo`}
                                </p>
                              </div>
                            </div>
                            {item.included ? (
                              <span className="shrink-0 w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <Check className="w-3 h-3" />
                              </span>
                            ) : (
                              <button
                                onClick={() => removeItem(item.id)}
                                className="shrink-0 w-6 h-6 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all opacity-40 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}
                  </div>
                </>
              )}

              {/* Price Calculation & Quote Request */}
              <div className="border-t border-white/8 pt-3 mt-auto space-y-3 shrink-0">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-text-dim">
                    <span>Base Tier</span>
                    <span>{fmtK(plan.priceMonthly)}/mo</span>
                  </div>
                  {includedItems.length > 0 && (
                    <div className="flex justify-between text-emerald-400/80">
                      <span>{plan.name} Services ({includedItems.length})</span>
                      <span>Included</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-dim">
                    <span>Add-ons ({extraItems.length})</span>
                    <span>{extraItems.length > 0 ? `${fmtK(addOnsTotal)}/mo` : '—'}</span>
                  </div>
                  {customItems.length > 0 && (
                    <div className="flex justify-between text-cyan">
                      <span>Custom Requests ({customItems.length})</span>
                      <span>To be priced</span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-white/5" />

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-white">Est. Total</span>
                  <div className="text-right">
                    <span className="font-display font-black text-2xl text-white block leading-none">
                      {fmtK(monthlyTotal)}<span className="text-text-dim text-xs font-normal">/mo</span>
                    </span>
                    <p className="text-[10px] text-emerald-400 mt-1">Or {fmtK(annualMonthlyEquivalent)}/mo billed annually (-20%)</p>
                  </div>
                </div>

                {isSignedIn ? (
                  <Link href={ctaHref} className="block">
                    <button className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-bold text-xs hover:from-accent-glow hover:to-purple-500 shadow-[0_0_20px_-8px_rgba(168,85,247,0.5)] transition-all">
                      Request Custom Package <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => setLeadModalOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-bold text-xs hover:from-accent-glow hover:to-purple-500 shadow-[0_0_20px_-8px_rgba(168,85,247,0.5)] transition-all"
                  >
                    Sign Up &amp; Request Quote <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {extras.length > 0 && (
                  <button onClick={() => setExtras([])} className="w-full text-center text-[10px] text-text-dim hover:text-white transition-colors">
                    Reset Builder
                  </button>
                )}

                <div className="flex items-start gap-1.5 text-[9px] text-text-dim leading-relaxed bg-white/2 rounded-lg p-2 border border-white/5">
                  <Info className="w-3 h-3 shrink-0 mt-px text-accent" />
                  <span>indicative price. Confirmed after initial CoE scoping call.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FULL PAGE TOPOLOGY WORKSPACE ═══ */}
      <AnimatePresence>
        {isMaximized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-9999 bg-[#07070b]/98 backdrop-blur-2xl p-6 flex flex-col overflow-hidden"
          >
            {/* Header / HUD Title bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4 mb-4 sm:mb-6 shrink-0">
              <div>
                <h1 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent animate-pulse" /> Interactive Topology Workspace
                </h1>
                <p className="text-[11px] sm:text-xs text-text-dim mt-0.5 sm:mt-1">
                  Visualize connections, categories, and direct cost benefits in real-time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                {/* Cost Savings Dashboard Card */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 flex flex-col text-left sm:text-right">
                  <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold font-mono">Annual Savings</span>
                  <span className="text-sm sm:text-lg font-black text-emerald-400 font-display leading-none mt-0.5 sm:mt-1">
                    Saved {fmtK(Math.round(monthlyTotal * 0.2 * 12))}/yr
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reset Layout Button */}
                  <button
                    onClick={() => handleResetLayout(true)}
                    className="h-8 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 text-xs text-text-dim hover:text-white hover:bg-white/10 transition-all duration-300"
                    title="Reset custom layout layout to defaults"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>

                  <button
                    onClick={() => setIsMaximized(false)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    aria-label="Close interactive workspace"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Full-screen Canvas Area */}
            <div className="flex-1 relative min-h-0 w-full rounded-2xl border border-white/5 bg-black/40 overflow-hidden flex flex-row" data-lenis-prevent>
              {/* Left-docked glassmorphic Add-on Catalog sidebar */}
              <div
                className={cn(
                  "h-full bg-[#0a0a0f]/90 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden transition-all duration-300 ease-in-out shrink-0 relative z-20",
                  maxLeftSidebarOpen ? "w-80 opacity-100" : "w-12 opacity-90"
                )}
              >
                {maxLeftSidebarOpen ? (
                  <div className="flex-1 flex flex-col p-4 min-h-0">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Add-On Catalog</h3>
                      <button
                        onClick={() => setMaxLeftSidebarOpen(false)}
                        className="w-6 h-6 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-text-dim hover:text-white transition-all"
                        aria-label="Collapse catalog"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick search input */}
                    <div className="relative mb-3 shrink-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
                      <input
                        value={maxSearch}
                        onChange={(e) => setMaxSearch(e.target.value)}
                        placeholder="Search 20 add-ons..."
                        className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white/5 border border-white/8 text-white placeholder:text-text-dim text-xs focus:outline-none focus:border-accent/40 focus:bg-white/8 transition-all"
                      />
                      {maxSearch && (
                        <button
                          onClick={() => setMaxSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded bg-white/8 flex items-center justify-center text-text-dim hover:text-white"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Scrollable list of 20 add-ons */}
                    <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-4" data-lenis-prevent>
                      {addOnCategories.map((cat) => {
                        const Icon = cat.icon;
                        const matchedItems = cat.items.filter((item) => {
                          if (!maxSearch) return true;
                          const q = maxSearch.toLowerCase();
                          return item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
                        });

                        if (matchedItems.length === 0) return null;

                        return (
                          <div key={cat.id} className="space-y-1.5">
                            <h4 className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5", cat.color)}>
                              <Icon className="w-3.5 h-3.5" />
                              <span>{cat.label}</span>
                            </h4>
                            <div className="space-y-1.5">
                              {matchedItems.map((item) => {
                                const inCart = selectedIds.has(item.id);
                                const itemObj = { ...item, categoryId: cat.id, categoryLabel: cat.label };
                                const isSameCategory = draggedAddOn && (draggedAddOn.categoryId === cat.id || draggedAddOn.categoryLabel === cat.label);
                                const isDimmed = draggedAddOn !== null && !isSameCategory;

                                return (
                                  <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData('application/json', JSON.stringify(itemObj));
                                      setDraggedAddOn(itemObj);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedAddOn(null);
                                      setDragOver(false);
                                    }}
                                    className={cn(
                                      "group flex flex-col justify-between p-2.5 rounded-lg border text-left transition-all relative cursor-grab active:cursor-grabbing select-none",
                                      isSameCategory
                                        ? "bg-accent/20 border-accent scale-102 shadow-[0_0_25px_rgba(168,85,247,0.5)] z-10"
                                        : isDimmed
                                        ? "opacity-25 grayscale border-white/5 pointer-events-none"
                                        : inCart
                                        ? "bg-accent/5 border-accent/25"
                                        : "bg-white/3 border-white/5 hover:border-white/12 hover:bg-white/5"
                                    )}
                                  >
                                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1">
                                          <GripVertical className="w-3 h-3 text-text-dim/40 group-hover:text-accent shrink-0 transition-colors" />
                                          <p className="font-semibold text-white text-xs leading-snug truncate">{item.name}</p>
                                        </div>
                                        <p className="text-[10px] text-text-dim mt-0.5 line-clamp-2 leading-snug pl-4">{item.desc}</p>
                                      </div>
                                      <button
                                        onClick={() => {
                                          if (inCart) {
                                            removeItem(item.id);
                                          } else {
                                            addOn(itemObj);
                                          }
                                        }}
                                        className={cn(
                                          "shrink-0 w-6 h-6 rounded-md flex items-center justify-center border transition-all",
                                          inCart
                                            ? "bg-accent text-white border-accent hover:bg-red-500 hover:border-red-400"
                                            : "bg-white/5 border-white/10 text-text-dim hover:bg-accent/15 hover:border-accent/30 hover:text-accent"
                                        )}
                                      >
                                        {inCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-between pt-1.5 border-t border-white/5 mt-auto pl-4">
                                      <span className="text-[9px] text-text-dim uppercase tracking-wider">{cat.label}</span>
                                      <span className="font-mono font-bold text-xs text-white">
                                        {fmtK(item.price)}<span className="text-[10px] text-text-dim font-normal">/mo</span>
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center pt-4">
                    <button
                      onClick={() => setMaxLeftSidebarOpen(true)}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-text-dim hover:text-white transition-all"
                      aria-label="Expand catalog"
                      title="Expand Add-On Catalog"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Large Workspace Interactive Canvas */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex-1 overflow-auto relative p-6 flex items-center justify-center transition-colors duration-300",
                  dragOver ? "bg-accent/10 ring-2 ring-accent/60 ring-inset" : ""
                )}
              >
                {/* HUD background grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />

                {/* Floating Drag Overlay */}
                {draggedAddOn && (
                  <div className="absolute inset-4 z-40 rounded-2xl border-2 border-dashed border-accent bg-accent/10 backdrop-blur-md flex flex-col items-center justify-center gap-3 pointer-events-none transition-all animate-pulse shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                    <div className="p-4 rounded-full bg-accent/20 text-accent border border-accent/40 shadow-[0_0_30px_rgba(168,85,247,0.6)]">
                      <Plus className="w-10 h-10 animate-bounce" />
                    </div>
                    <div className="text-center">
                      <p className="font-display font-bold text-xl text-white">
                        Drop <span className="text-accent font-extrabold">{draggedAddOn.name}</span> here to add to Workspace
                      </p>
                      <p className="text-sm text-white/70 font-mono mt-1">
                        {draggedAddOn.categoryLabel} · {fmtK(draggedAddOn.price)}/mo
                      </p>
                    </div>
                  </div>
                )}

                <div className="w-full max-w-5xl my-auto">
                  <svg
                    ref={maximizedSvgRef}
                    onPointerMove={(e) => handleSVGPointerMove(e, true)}
                    viewBox={`0 0 1400 ${maxMaximizedNodeY}`}
                    className="w-full h-auto overflow-visible relative z-10"
                  >
                    {/* Render Links */}
                    {maximizedTopology.links.map((link) => {
                      const midY = (link.from.y + link.to.y) / 2;
                      const pathD = `M ${link.from.x} ${link.from.y} C ${link.from.x} ${midY}, ${link.to.x} ${midY}, ${link.to.x} ${link.to.y}`;
                      const isDimmed = hoveredNode && !link.id.includes(hoveredNode) && hoveredNode !== 'root';

                      return (
                        <path
                          key={link.id}
                          d={pathD}
                          fill="none"
                          stroke={link.color}
                          strokeWidth={link.ghost ? 1 : 2.5}
                          strokeOpacity={isDimmed ? 0.12 : link.ghost ? 0.25 : 0.85}
                          strokeDasharray={link.ghost ? "4,4" : undefined}
                          className={cn(
                            link.animated && !isDimmed && "animate-dash",
                            "transition-opacity duration-300"
                          )}
                        />
                      );
                    })}

                    {/* Render Nodes */}
                    {maximizedTopology.nodes.map((n) => {
                      const isDimmed = hoveredNode && hoveredNode !== n.id && hoveredNode !== 'root';
                      
                      if (n.type === 'root') {
                        return (
                          <foreignObject
                            key={n.id}
                            x={n.x - 100}
                            y={n.y - 48}
                            width={200}
                            height={96}
                            className="overflow-visible"
                          >
                            <div
                              onMouseEnter={() => setHoveredNode(n.id)}
                              onMouseLeave={() => setHoveredNode(null)}
                              onPointerDown={(e) => handlePointerDown(e, n.id, true, n.x, n.y, maximizedSvgRef.current)}
                              onPointerUp={handlePointerUp}
                              onPointerCancel={handlePointerUp}
                              style={{
                                borderColor: n.color,
                                boxShadow: hoveredNode === n.id ? `0 0 28px ${n.color}90` : `0 0 22px -2px ${n.color}70`,
                                touchAction: 'none',
                              }}
                              className="w-full h-full rounded-2xl border-2 bg-neutral-950 flex flex-col items-center justify-center p-3 text-center transition-all duration-300 cursor-grab active:cursor-grabbing select-none touch-none"
                            >
                              <span className="text-2xl leading-none mb-1.5">{n.icon}</span>
                              <span style={{ textShadow: `0 0 16px ${n.color}` }} className="text-[18px] font-black uppercase tracking-widest text-white leading-none">
                                {n.label}
                              </span>
                              <span className="text-[12px] text-slate-300 mt-1.5 uppercase tracking-wider font-mono font-bold">
                                Base Core Plan
                              </span>
                            </div>
                          </foreignObject>
                        );
                      }

                      if (n.type === 'category') {
                        const isCatMatch = draggedAddOn && (
                          n.label.toLowerCase().includes(draggedAddOn.categoryLabel.toLowerCase()) ||
                          draggedAddOn.categoryLabel.toLowerCase().includes(n.label.toLowerCase())
                        );

                        return (
                          <foreignObject
                            key={n.id}
                            x={n.x - 100}
                            y={n.y - 26}
                            width={200}
                            height={52}
                            className="overflow-visible"
                          >
                            <div
                              onMouseEnter={() => setHoveredNode(n.id)}
                              onMouseLeave={() => setHoveredNode(null)}
                              onPointerDown={(e) => handlePointerDown(e, n.id, true, n.x, n.y, maximizedSvgRef.current)}
                              onPointerUp={handlePointerUp}
                              onPointerCancel={handlePointerUp}
                              style={{
                                borderColor: isCatMatch ? '#a855f7' : n.color,
                                boxShadow: isCatMatch ? '0 0 35px #a855f7' : hoveredNode === n.id ? `0 0 18px ${n.color}60` : `0 0 12px ${n.color}30`,
                                touchAction: 'none',
                              }}
                              className={cn(
                                "w-full h-full rounded-xl border-2 bg-neutral-950 flex items-center justify-center text-center px-3 cursor-grab active:cursor-grabbing select-none touch-none transition-all duration-300",
                                isCatMatch ? "scale-110 z-30 animate-pulse bg-accent/30 border-accent" : isDimmed ? "opacity-35" : "opacity-100"
                              )}
                            >
                              <span style={{ textShadow: `0 0 14px ${n.color}80` }} className="text-[16px] font-extrabold text-white uppercase tracking-wide leading-tight text-center wrap-break-word">
                                {n.label}
                              </span>
                            </div>
                          </foreignObject>
                        );
                      }

                      if (n.type === 'ghost-category') {
                        const isCatMatch = draggedAddOn && (
                          n.label.toLowerCase().includes(draggedAddOn.categoryLabel.toLowerCase()) ||
                          draggedAddOn.categoryLabel.toLowerCase().includes(n.label.toLowerCase())
                        );

                        return (
                          <foreignObject
                            key={n.id}
                            x={n.x - 100}
                            y={n.y - 26}
                            width={200}
                            height={52}
                            className="overflow-visible"
                          >
                            <div
                              onPointerDown={(e) => handlePointerDown(e, n.id, true, n.x, n.y, maximizedSvgRef.current)}
                              onPointerUp={handlePointerUp}
                              onPointerCancel={handlePointerUp}
                              style={{
                                borderColor: isCatMatch ? '#a855f7' : `${n.color}45`,
                                touchAction: 'none',
                              }}
                              className={cn(
                                "w-full h-full rounded-xl border-2 border-dashed flex items-center justify-center text-center px-3 cursor-grab active:cursor-grabbing select-none touch-none transition-all duration-300",
                                isCatMatch ? "bg-accent/20 border-accent scale-105 animate-pulse" : "bg-white/4 opacity-70"
                              )}
                            >
                              <span className="text-[15px] font-bold text-slate-300 uppercase tracking-wide leading-tight text-center wrap-break-word">
                                {n.label}
                              </span>
                            </div>
                          </foreignObject>
                        );
                      }

                      if (n.type === 'ghost-service') {
                        return (
                          <foreignObject
                            key={n.id}
                            x={n.x - 100}
                            y={n.y - 38}
                            width={200}
                            height={76}
                            className="overflow-visible"
                          >
                            <div
                              onPointerDown={(e) => handlePointerDown(e, n.id, true, n.x, n.y, maximizedSvgRef.current)}
                              onPointerUp={handlePointerUp}
                              onPointerCancel={handlePointerUp}
                              style={{
                                borderColor: `${n.color}30`,
                                touchAction: 'none',
                              }}
                              className="w-full h-full rounded-xl border border-dashed bg-white/3 flex items-center justify-center px-3 opacity-65 cursor-grab active:cursor-grabbing select-none touch-none"
                            >
                              <span className="text-[14px] font-semibold text-slate-300 whitespace-normal wrap-break-word text-center line-clamp-2 leading-snug">
                                {n.label}
                              </span>
                            </div>
                          </foreignObject>
                        );
                      }

                      return (
                        <foreignObject
                          key={n.id}
                          x={n.x - 100}
                          y={n.y - 38}
                          width={200}
                          height={76}
                          className="overflow-visible"
                        >
                          <div
                            onMouseEnter={() => setHoveredNode(n.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            onPointerDown={(e) => handlePointerDown(e, n.id, true, n.x, n.y, maximizedSvgRef.current)}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            style={{
                              borderColor: n.color,
                              boxShadow: hoveredNode === n.id ? `0 0 20px ${n.color}70` : `0 0 10px ${n.color}30`,
                              touchAction: 'none',
                            }}
                            className={cn(
                              "group/node w-full h-full rounded-xl border-2 bg-neutral-900 hover:bg-neutral-950 flex items-center justify-between px-3 relative shadow-xl cursor-grab active:cursor-grabbing select-none touch-none transition-all duration-300",
                              isDimmed ? "opacity-35" : "opacity-100"
                            )}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }} className="text-[15px] font-bold text-white leading-snug whitespace-normal wrap-break-word line-clamp-2">
                                {n.label}
                              </p>
                              <p className="text-[13px] text-slate-300 font-mono mt-0.5 leading-none font-semibold">
                                +{fmtK(n.price || 0)}/mo
                              </p>
                            </div>
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  if (n.originalId) removeItem(n.originalId);
                              }}
                              className="w-5.5 h-5.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </foreignObject>
                      );
                    })}</svg>
                </div>
              </div>

              {/* Side-docked glassmorphic configuration details sidebar */}
              <div
                className={cn(
                  "h-full bg-neutral-950/85 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden transition-all duration-300 ease-in-out shrink-0 relative z-20",
                  maxSidebarOpen ? "w-80 opacity-100" : "w-12 opacity-90"
                )}
              >
                {maxSidebarOpen ? (
                  <div className="flex-1 flex flex-col p-4 min-h-0">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Configuration Summary</h3>
                      <button
                        onClick={() => setMaxSidebarOpen(false)}
                        className="w-6 h-6 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-text-dim hover:text-white transition-all"
                        aria-label="Collapse panel"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Base Core Detail */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3 shrink-0">
                      <span className="text-[9px] text-text-dim uppercase tracking-wider font-mono">Base Plan</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{plan.icon}</span> {plan.name}
                        </span>
                        <span className="text-xs font-mono text-white">{fmtK(plan.priceMonthly)}/mo</span>
                      </div>
                    </div>

                    {/* Selected items list */}
                    <div className="flex-1 min-h-0 space-y-2 mb-4 flex flex-col">
                      <span className="text-[9px] text-text-dim uppercase tracking-wider font-mono shrink-0">Selected Add-ons ({selected.length})</span>
                      {selected.length === 0 ? (
                        <p className="text-xs text-text-muted italic">No items selected.</p>
                      ) : (
                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1" data-lenis-prevent>
                          {selected.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/5 text-xs">
                              <span className="text-white truncate pr-2">{item.name}</span>
                              <span className="font-mono text-text-dim shrink-0">{fmtK(item.price)}/mo</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing / Savings Card */}
                    <div className="border-t border-white/10 pt-4 mt-auto space-y-2 shrink-0">
                      <div className="flex justify-between text-xs text-text-dim">
                        <span>Subtotal:</span>
                        <span>{fmtK(monthlyTotal)}/mo</span>
                      </div>
                      <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                        <span>Annual Discount (20%):</span>
                        <span>-{fmtK(Math.round(monthlyTotal * 0.2))}/mo</span>
                      </div>
                      <div className="h-px bg-white/10" />
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-sm font-semibold text-white">Effective Total:</span>
                        <span className="text-xl font-bold text-white font-mono">{fmtK(Math.round(monthlyTotal * 0.8))}/mo</span>
                      </div>
                      <p className="text-[9px] text-text-dim leading-normal mt-2">
                        * Billed annually at {fmtK(Math.round(monthlyTotal * 0.8 * 12))}/yr (Saving {fmtK(Math.round(monthlyTotal * 0.2 * 12))}/yr compared to monthly terms).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center pt-4">
                    <button
                      onClick={() => setMaxSidebarOpen(true)}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-text-dim hover:text-white transition-all"
                      aria-label="Expand panel"
                      title="Expand Configuration Summary"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LeadCaptureModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        planId={planId}
        planName={plan.name}
        includedServices={includedItems.map((s) => s.name)}
        extraServices={extraItems.map((s) => s.name)}
        customRequests={customItems.map((s) => s.name)}
        redirectTo={leadRedirect}
      />
    </section>
  );
}
