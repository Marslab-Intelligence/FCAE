'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Plus, Search, Sparkles, ShoppingCart,
  Maximize2, X, RotateCcw, ChevronLeft, ChevronRight,
  GripVertical, LayoutGrid, Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/components/CurrencyProvider';
import {
  allAddOns, addOnCategories, getPlan, isIncludedInPlan, planOrder, type PlanId, type AddOn
} from '@/lib/package-catalog';

const STORAGE_KEY = 'sid-account-addons-requested';

interface TopologyNode {
  id: string;
  label: string;
  type: 'root' | 'category' | 'service' | 'ghost-category' | 'ghost-service';
  x: number;
  y: number;
  icon?: string;
  color: string;
  price?: number;
  originalId?: string;
  included?: boolean;
}

interface TopologyLink {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  animated: boolean;
  ghost?: boolean;
}

function getHashOffset(str: string, maxOffset: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const norm = (Math.abs(hash) % 1000) / 1000;
  return (norm - 0.5) * maxOffset;
}

export function AddOnsCatalog({ planId: initialPlanId }: { planId: PlanId | null }) {
  const { price } = useCurrency();
  const effectivePlanId: PlanId = initialPlanId || 'foundation';
  const plan = getPlan(effectivePlanId);

  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'grid'>('split');
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedAddOn, setDraggedAddOn] = useState<AddOn | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [customMaxPositions, setCustomMaxPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [activeDrag, setActiveDrag] = useState<{
    id: string;
    isMax: boolean;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [maxSearch, setMaxSearch] = useState('');
  const [maxLeftSidebarOpen, setMaxLeftSidebarOpen] = useState(true);
  const [maxSidebarOpen, setMaxSidebarOpen] = useState(true);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const previewSvgRef = useRef<SVGSVGElement>(null);
  const maximizedSvgRef = useRef<SVGSVGElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Restore saved requests
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setRequestedIds(JSON.parse(saved));
        }
      } catch {}
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Save requests
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requestedIds));
    } catch {}
  }, [requestedIds, hydrated]);

  const includedSet = useMemo(
    () => new Set(allAddOns.filter((a) => isIncludedInPlan(a.id, effectivePlanId)).map((a) => a.id)),
    [effectivePlanId]
  );

  const selectedExtras = useMemo(
    () => allAddOns.filter((a) => requestedIds.includes(a.id) && !includedSet.has(a.id)),
    [requestedIds, includedSet]
  );

  const allActiveServices = useMemo(() => {
    const inc = allAddOns.filter((a) => includedSet.has(a.id)).map((a) => ({ ...a, included: true }));
    const ext = selectedExtras.map((a) => ({ ...a, included: false }));
    return [...inc, ...ext];
  }, [includedSet, selectedExtras]);

  const categories = ['All', ...addOnCategories.map((c) => c.label)];

  const filtered = allAddOns.filter((a) => {
    const matchesCategory = activeCategory === 'All' || a.categoryLabel === activeCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const toggleService = (service: AddOn) => {
    if (includedSet.has(service.id)) return;
    setRequestedIds((prev) =>
      prev.includes(service.id) ? prev.filter((id) => id !== service.id) : [...prev, service.id]
    );
  };

  const removeExtra = (id: string) => {
    setRequestedIds((prev) => prev.filter((i) => i !== id));
  };

  // Drag-and-drop to canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const data = JSON.parse(raw) as AddOn;
      if (data && data.id && !includedSet.has(data.id) && !requestedIds.includes(data.id)) {
        setRequestedIds((prev) => [...prev, data.id]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SVG node pointer dragging
  const handlePointerDown = (
    e: React.PointerEvent,
    nodeId: string,
    isMax: boolean,
    nodeX: number,
    nodeY: number,
    svgElement: SVGSVGElement | null
  ) => {
    if (!svgElement || e.button !== 0) return;
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
      setCustomMaxPositions((prev) => ({ ...prev, [activeDrag.id]: { x: newX, y: newY } }));
    } else {
      setCustomPositions((prev) => ({ ...prev, [activeDrag.id]: { x: newX, y: newY } }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeDrag) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setActiveDrag(null);
  };

  // Topology builder
  const topology = useMemo(() => {
    const nodes: TopologyNode[] = [];
    const links: TopologyLink[] = [];

    const rootX = 300;
    const rootY = 48;
    const rootColor = '#38bdf8';

    const actualRootX = customPositions['root']?.x ?? rootX;
    const actualRootY = customPositions['root']?.y ?? rootY;

    nodes.push({
      id: 'root',
      label: plan.name,
      type: 'root',
      x: actualRootX,
      y: actualRootY,
      icon: plan.icon,
      color: rootColor,
    });

    const categoryGroups: Record<string, { label: string; color: string; items: typeof allActiveServices }> = {};

    allActiveServices.forEach((item) => {
      const label = item.categoryLabel || 'Services';
      let color = '#38bdf8'; // electric cyan
      if (label.toLowerCase().includes('operations')) color = '#06b6d4';
      else if (label.toLowerCase().includes('finops') || label.toLowerCase().includes('cost')) color = '#10b981';
      else if (label.toLowerCase().includes('security') || label.toLowerCase().includes('governance')) color = '#a855f7';
      else if (label.toLowerCase().includes('continuity') || label.toLowerCase().includes('dr')) color = '#f59e0b';
      else if (label.toLowerCase().includes('review') || label.toLowerCase().includes('executive')) color = '#ec4899';

      if (!categoryGroups[label]) {
        categoryGroups[label] = { label, color, items: [] };
      }
      categoryGroups[label].items.push(item);
    });

    const activeGroups = Object.values(categoryGroups);
    const numCats = activeGroups.length;
    const totalWidth = Math.min(420, (numCats - 1) * 110);
    const startX = 300 - totalWidth / 2;

    activeGroups.forEach((group, groupIdx) => {
      const rawHubX = numCats === 1 ? 300 : startX + (totalWidth / Math.max(1, numCats - 1)) * groupIdx;
      const hubX = rawHubX + getHashOffset(group.label, 12);
      const hubY = 105 + (groupIdx % 2 === 0 ? 6 : -6) + getHashOffset(group.label, 8);
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
        from: { x: actualRootX, y: actualRootY + 24 },
        to: { x: actualHubX, y: actualHubY - 14 },
        color: group.color,
        animated: true,
      });

      let prevX = actualHubX;
      let prevY = actualHubY;
      let prevOffset = 14;

      group.items.forEach((item, itemIdx) => {
        const xOffset = numCats <= 2 ? 14 : 10;
        const serviceX = hubX + (itemIdx % 2 === 0 ? -xOffset : xOffset) + getHashOffset(item.name, 6);
        const serviceY = hubY + 60 + itemIdx * 54 + getHashOffset(item.name, 5);
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
          included: item.included,
        });

        links.push({
          id: `link-${hubId}-${serviceId}`,
          from: { x: prevX, y: prevY + prevOffset },
          to: { x: actualServiceX, y: actualServiceY - 18 },
          color: group.color,
          animated: true,
        });

        prevX = actualServiceX;
        prevY = actualServiceY;
        prevOffset = 18;
      });
    });

    return { nodes, links };
  }, [plan, allActiveServices, customPositions]);

  const maxNodeY = useMemo(() => {
    if (topology.nodes.length === 0) return 240;
    return Math.max(220, Math.max(...topology.nodes.map((n) => n.y)) + 36);
  }, [topology.nodes]);

  // Maximized topology
  const maximizedTopology = useMemo(() => {
    const nodes: TopologyNode[] = [];
    const links: TopologyLink[] = [];

    const rootX = 700;
    const rootY = 55;
    const rootColor = '#38bdf8';

    const actualRootX = customMaxPositions['root']?.x ?? rootX;
    const actualRootY = customMaxPositions['root']?.y ?? rootY;

    nodes.push({
      id: 'root',
      label: plan.name,
      type: 'root',
      x: actualRootX,
      y: actualRootY,
      icon: plan.icon,
      color: rootColor,
    });

    const categoryGroups: Record<string, { label: string; color: string; items: typeof allActiveServices }> = {};

    allActiveServices.forEach((item) => {
      const label = item.categoryLabel || 'Services';
      let color = '#38bdf8';
      if (label.toLowerCase().includes('operations')) color = '#06b6d4';
      else if (label.toLowerCase().includes('finops') || label.toLowerCase().includes('cost')) color = '#10b981';
      else if (label.toLowerCase().includes('security') || label.toLowerCase().includes('governance')) color = '#a855f7';
      else if (label.toLowerCase().includes('continuity') || label.toLowerCase().includes('dr')) color = '#f59e0b';
      else if (label.toLowerCase().includes('review') || label.toLowerCase().includes('executive')) color = '#ec4899';

      if (!categoryGroups[label]) {
        categoryGroups[label] = { label, color, items: [] };
      }
      categoryGroups[label].items.push(item);
    });

    const activeGroups = Object.values(categoryGroups);
    const numCats = activeGroups.length;
    const totalWidth = Math.min(1100, Math.max(500, (numCats - 1) * 280));
    const startX = 700 - totalWidth / 2;

    activeGroups.forEach((group, groupIdx) => {
      const hubX = numCats === 1 ? 700 : startX + (totalWidth / Math.max(1, numCats - 1)) * groupIdx;
      const hubY = 190 + (groupIdx % 2 === 0 ? 12 : -12);
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
        from: { x: actualRootX, y: actualRootY + 36 },
        to: { x: actualHubX, y: actualHubY - 26 },
        color: group.color,
        animated: true,
      });

      let prevX = actualHubX;
      let prevY = actualHubY;
      let prevOffset = 26;

      group.items.forEach((item, itemIdx) => {
        const serviceX = hubX + (itemIdx % 2 === 0 ? -30 : 30);
        const serviceY = hubY + 110 + itemIdx * 90;
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
          included: item.included,
        });

        links.push({
          id: `link-${hubId}-${serviceId}`,
          from: { x: prevX, y: prevY + prevOffset },
          to: { x: actualServiceX, y: actualServiceY - 34 },
          color: group.color,
          animated: true,
        });

        prevX = actualServiceX;
        prevY = actualServiceY;
        prevOffset = 34;
      });
    });

    return { nodes, links };
  }, [plan, allActiveServices, customMaxPositions]);

  const maxMaximizedNodeY = useMemo(() => {
    if (maximizedTopology.nodes.length === 0) return 650;
    return Math.max(650, Math.max(...maximizedTopology.nodes.map((n) => n.y)) + 90);
  }, [maximizedTopology.nodes]);

  const extrasMonthlyTotal = useMemo(
    () => selectedExtras.reduce((sum, item) => sum + (item.price || 0), 0),
    [selectedExtras]
  );

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-fluid-h1 text-text flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-accent shrink-0 animate-pulse" /> Add-On Services &amp; Architecture Tree
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Visual interactive topology of your <strong className="text-accent">{plan.name}</strong> managed cloud package. Add services directly to the live tree.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* View Mode Toggle Buttons */}
          <div className="flex bg-bg-card border border-border rounded-xl p-1 text-xs font-semibold shadow-xs">
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'split' ? 'bg-accent text-white shadow-sm font-bold' : 'text-text-muted hover:text-text'
              )}
            >
              <Network className="w-3.5 h-3.5" /> Interactive Tree &amp; Catalog
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'grid' ? 'bg-accent text-white shadow-sm font-bold' : 'text-text-muted hover:text-text'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Full Grid
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
            <Check className="w-3.5 h-3.5" /> {includedSet.size} Active
          </span>
          {selectedExtras.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/15 border border-accent/30 text-accent text-xs font-bold shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <ShoppingCart className="w-3.5 h-3.5" /> +{selectedExtras.length} Add-on{selectedExtras.length > 1 ? 's' : ''} ({price(extrasMonthlyTotal)}/mo)
            </span>
          )}
        </div>
      </div>

      {/* ── Search & Category Filters Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                activeCategory === c
                  ? 'bg-accent text-white border-accent shadow-xs'
                  : 'bg-white/4 text-text-muted border-white/10 hover:text-text hover:border-white/20'
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative lg:ml-auto lg:w-80">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 15 add-on services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg-card border border-border text-xs text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded text-text-dim hover:text-text"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Interactive Section ── */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1.15fr] gap-5 items-stretch min-h-155">
          {/* ═══ COLUMN 1: Add-On Services Catalog ═══ */}
          <div className="rounded-2xl border border-white/10 bg-[#080d1a]/80 backdrop-blur-xl p-4 flex flex-col overflow-hidden min-h-145">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim flex items-center gap-1.5">
                <span className="text-accent font-mono">01</span> Add-On Services Catalog
              </h2>
              <span className="text-[11px] text-accent font-semibold">{filtered.length} available</span>
            </div>

            <p className="text-[11px] text-text-dim mb-3">
              Click <strong className="text-white">+</strong> or drag service cards directly onto the Topology canvas.
            </p>

            {/* Scrollable service list */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2.5" data-lenis-prevent>
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-dim">No matching services found.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {filtered.map((service) => {
                    const isIncluded = includedSet.has(service.id);
                    const isAdded = requestedIds.includes(service.id);
                    const isSameCategory = draggedAddOn && draggedAddOn.categoryId === service.categoryId;
                    const isDimmed = draggedAddOn !== null && !isSameCategory;

                    return (
                      <div
                        key={service.id}
                        draggable={!isIncluded}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify(service));
                          setDraggedAddOn(service);
                        }}
                        onDragEnd={() => {
                          setDraggedAddOn(null);
                          setDragOver(false);
                        }}
                        className={cn(
                          'group flex flex-col justify-between p-3 rounded-xl border transition-all text-left relative select-none',
                          isIncluded
                            ? 'bg-emerald-500/5 border-emerald-500/25'
                            : isAdded
                            ? 'bg-accent/10 border-accent/40 shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-1 ring-accent/30'
                            : isDimmed
                            ? 'opacity-25 grayscale border-white/5 pointer-events-none'
                            : 'bg-white/3 border-white/8 hover:border-white/20 hover:bg-white/5 cursor-grab active:cursor-grabbing'
                        )}
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {!isIncluded && <GripVertical className="w-3.5 h-3.5 text-text-dim/40 group-hover:text-accent shrink-0 transition-colors" />}
                              <h4 className="font-semibold text-white text-xs leading-snug truncate">{service.name}</h4>
                            </div>
                            <p className="text-[10px] text-text-muted line-clamp-2 mt-1 leading-relaxed pl-1">{service.desc}</p>
                          </div>
                          <button
                            onClick={() => toggleService(service)}
                            disabled={isIncluded}
                            title={isIncluded ? `Included in your ${plan.name} plan` : isAdded ? 'Remove from tree' : 'Add to architecture tree'}
                            className={cn(
                              'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer',
                              isIncluded
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-default'
                                : isAdded
                                ? 'bg-accent text-white border-accent hover:bg-red-500 hover:border-red-400'
                                : 'bg-white/5 border-white/10 text-text-muted hover:bg-accent/20 hover:border-accent hover:text-white'
                            )}
                          >
                            {isIncluded || isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                          <span className="text-[9px] text-text-dim uppercase tracking-wider font-semibold">{service.categoryLabel}</span>
                          {isIncluded ? (
                            <span className="font-mono font-bold text-[10px] text-emerald-400 uppercase tracking-wider">Plan Covered</span>
                          ) : (
                            <span className="font-mono font-bold text-xs text-white">
                              {price(service.price)}<span className="text-[10px] text-text-dim font-normal">/mo</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ═══ COLUMN 2: Interactive Topology Architecture Tree ═══ */}
          <div className="rounded-2xl border border-white/10 bg-[#080d1a]/80 backdrop-blur-xl p-4 flex flex-col overflow-hidden min-h-145">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-dim flex items-center gap-1.5">
                <span className="text-accent font-mono">02</span> Live Architecture Topology Tree
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMaximized(true)}
                  title="Expand interactive workspace"
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-text-dim hover:text-white hover:border-white/20 transition-all cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Drop & Interactive Canvas Area */}
            <div
              ref={dropRef}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => {
                if (!dropRef.current?.contains(e.relatedTarget as Node)) setDragOver(false);
              }}
              onDrop={handleDrop}
              className={cn(
                'flex-1 rounded-xl border bg-black/50 overflow-hidden relative p-2 flex items-center justify-center transition-all duration-300 min-h-62.5 sm:min-h-70 max-h-80 cursor-zoom-in group/canvas',
                dragOver ? 'border-accent shadow-[0_0_30px_-5px_rgba(56,189,248,0.4)]' : 'border-white/5'
              )}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName !== 'BUTTON' && !(e.target as HTMLElement).closest('button')) {
                  setIsMaximized(true);
                }
              }}
            >
              {/* HUD background grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />

              {/* Status Badges */}
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-accent/10 border border-accent/30 text-[9px] text-accent font-bold uppercase tracking-wider font-mono shadow-xs">
                  <Network className="w-2.5 h-2.5" /> {allActiveServices.length} Active Nodes
                </div>
              </div>

              <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 border border-white/10 text-[8px] text-text-dim opacity-0 group-hover/canvas:opacity-100 transition-opacity duration-300 pointer-events-none uppercase tracking-wider font-mono">
                <Maximize2 className="w-2.5 h-2.5 text-accent" /> Click to Expand
              </div>

              <svg
                ref={previewSvgRef}
                onPointerMove={(e) => handleSVGPointerMove(e, false)}
                viewBox={`0 0 600 ${maxNodeY}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full max-h-60 sm:max-h-67.5 relative z-10 overflow-visible mx-auto select-none"
              >
                <defs>
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
                      strokeWidth={2}
                      strokeOpacity={isDimmed ? 0.15 : 0.75}
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
                        x={n.x - 70}
                        y={n.y - 24}
                        width={140}
                        height={48}
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
                            boxShadow: hoveredNode === n.id ? `0 0 16px ${n.color}80` : `0 0 10px -2px ${n.color}50`,
                            touchAction: 'none',
                          }}
                          className="w-full h-full rounded-xl border bg-neutral-950 flex items-center justify-center gap-1.5 px-2 text-center transition-all duration-300 cursor-grab active:cursor-grabbing select-none"
                        >
                          <span className="text-sm leading-none">{n.icon}</span>
                          <div className="text-left leading-none">
                            <p style={{ textShadow: `0 0 8px ${n.color}90` }} className="text-[11px] font-black uppercase tracking-wider text-white">
                              {n.label}
                            </p>
                            <p className="text-[8px] text-accent mt-0.5 uppercase tracking-wider font-mono font-semibold">
                              Core Plan
                            </p>
                          </div>
                        </div>
                      </foreignObject>
                    );
                  }

                  if (n.type === 'category') {
                    return (
                      <foreignObject
                        key={n.id}
                        x={n.x - 65}
                        y={n.y - 15}
                        width={130}
                        height={30}
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
                            boxShadow: hoveredNode === n.id ? `0 0 10px ${n.color}50` : `0 0 6px ${n.color}25`,
                            touchAction: 'none',
                          }}
                          className={cn(
                            "w-full h-full rounded-lg border bg-neutral-950 flex items-center justify-center text-center px-2 cursor-grab active:cursor-grabbing select-none transition-all duration-300",
                            isDimmed ? "opacity-30" : "opacity-100"
                          )}
                        >
                          <span style={{ textShadow: `0 0 8px ${n.color}70` }} className="text-[10px] font-extrabold text-white uppercase tracking-wider leading-tight text-center truncate">
                            {n.label}
                          </span>
                        </div>
                      </foreignObject>
                    );
                  }

                  return (
                    <foreignObject
                      key={n.id}
                      x={n.x - 75}
                      y={n.y - 20}
                      width={150}
                      height={40}
                      className="overflow-visible"
                    >
                      <div
                        onMouseEnter={() => setHoveredNode(n.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onPointerDown={(e) => handlePointerDown(e, n.id, false, n.x, n.y, previewSvgRef.current)}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        style={{
                          borderColor: n.included ? '#10b981' : n.color,
                          boxShadow: hoveredNode === n.id ? `0 0 12px ${n.color}60` : `0 0 6px ${n.color}20`,
                          touchAction: 'none',
                        }}
                        className={cn(
                          "group/node w-full h-full rounded-lg border bg-neutral-900 hover:bg-neutral-950 flex items-center justify-between px-2 relative shadow-md cursor-grab active:cursor-grabbing select-none transition-all duration-300",
                          isDimmed ? "opacity-30" : "opacity-100"
                        )}
                      >
                        <div className="min-w-0 flex-1 pr-1">
                          <p style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }} className="text-[10px] font-bold text-white leading-tight truncate">
                            {n.label}
                          </p>
                          <p className={cn("text-[8px] font-mono mt-0.5 leading-none font-semibold", n.included ? "text-emerald-400" : "text-slate-400")}>
                            {n.included ? "Included" : `+${price(n.price || 0)}/mo`}
                          </p>
                        </div>
                        {!n.included && (
                          <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (n.originalId) removeExtra(n.originalId);
                            }}
                            className="w-4 h-4 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors shrink-0 cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </foreignObject>
                  );
                })}
              </svg>
            </div>

            {/* Price & Confirmation Summary Bar */}
            <div className="pt-3 border-t border-white/8 mt-3 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Requested Add-ons ({selectedExtras.length})</span>
                <span className="font-mono font-bold text-white">
                  {selectedExtras.length > 0 ? `+${price(extrasMonthlyTotal)}/mo` : 'None added yet'}
                </span>
              </div>

              {selectedExtras.length > 0 ? (
                <button
                  onClick={() => {
                    setRequestSuccess(true);
                    setTimeout(() => setRequestSuccess(false), 4000);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-accent to-blue-600 text-white font-bold text-xs hover:from-accent-glow hover:to-blue-500 shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)] transition-all cursor-pointer"
                >
                  {requestSuccess ? (
                    <><Check className="w-4 h-4" /> Request Submitted to Cloud Engineers!</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Request Architecture Upgrade (+{price(extrasMonthlyTotal)}/mo)</>
                  )}
                </button>
              ) : (
                <p className="text-[10px] text-text-dim text-center py-1">
                  Click <strong>+</strong> on any service in the left catalog to attach it to your architecture tree.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 pt-1">
          {filtered.map((service) => {
            const isIncluded = includedSet.has(service.id);
            const isRequested = requestedIds.includes(service.id);

            return (
              <div
                key={service.id}
                className={cn(
                  'p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 glass-card',
                  isIncluded
                    ? 'border-emerald-500/40 ring-1 ring-emerald-500/25 bg-emerald-500/5'
                    : isRequested
                    ? 'border-accent/60 ring-1 ring-accent/40 bg-accent/5'
                    : 'glass-card-hover'
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border text-accent bg-accent/10 border-accent/25">
                      {service.categoryLabel}
                    </span>
                    {isIncluded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border text-emerald-300 bg-emerald-500/15 border-emerald-500/30">
                        <Check className="w-3 h-3" /> Core Plan
                      </span>
                    ) : isRequested ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border text-accent bg-accent/20 border-accent/40">
                        <Network className="w-3 h-3" /> In Tree
                      </span>
                    ) : null}
                  </div>

                  <h3 className="font-semibold text-base text-white mb-1.5 leading-snug">{service.name}</h3>
                  <p className="text-xs text-text-muted mb-4 leading-relaxed">{service.desc}</p>
                </div>

                <div className="pt-3 border-t border-border mt-2 space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display font-bold text-lg text-white">
                        {isIncluded ? 'Included in Plan' : price(service.price)}
                      </p>
                      <p className="text-[11px] text-text-dim truncate">
                        {isIncluded ? `Covered by ${plan.name}` : 'Added to your package tree'}
                      </p>
                    </div>
                  </div>

                  {isIncluded ? (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                      <Check className="w-4 h-4" /> Active Core Service
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleService(service)}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                        isRequested
                          ? 'bg-accent text-white border-accent shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                          : 'bg-white/5 text-text-muted border-white/10 hover:text-white hover:border-accent/40 hover:bg-white/8'
                      )}
                    >
                      {isRequested ? <><Check className="w-4 h-4" /> In Architecture Tree (Click to remove)</> : <><Plus className="w-4 h-4" /> Add to Architecture Tree</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ FULLSCREEN MAXIMIZED TOPOLOGY WORKSPACE MODAL ═══ */}
      <AnimatePresence>
        {isMaximized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 z-9999 bg-[#030712]/98 backdrop-blur-2xl p-6 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4 shrink-0">
              <div>
                <h1 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-accent animate-pulse" /> Full Architecture Topology Workspace
                </h1>
                <p className="text-xs text-text-muted mt-1">
                  Drag and arrange nodes, connect service areas, and visualize your <span className="text-accent font-semibold">{plan.name}</span> environment in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setCustomPositions({});
                    setCustomMaxPositions({});
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 text-xs text-text-muted hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Layout
                </button>
                <button
                  onClick={() => setIsMaximized(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Canvas + Catalog Sidebar */}
            <div className="flex-1 relative min-h-0 w-full rounded-2xl border border-white/8 bg-black/40 overflow-hidden flex flex-row">
              {/* Left Catalog Sidebar */}
              <div
                className={cn(
                  "h-full bg-[#080d1a]/95 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden transition-all duration-300 shrink-0 relative z-20",
                  maxLeftSidebarOpen ? "w-80 opacity-100" : "w-12 opacity-90"
                )}
              >
                {maxLeftSidebarOpen ? (
                  <div className="flex-1 flex flex-col p-4 min-h-0">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Add-On Catalog</h3>
                      <button
                        onClick={() => setMaxLeftSidebarOpen(false)}
                        className="w-6 h-6 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-text-dim hover:text-white cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative mb-3 shrink-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
                      <input
                        value={maxSearch}
                        onChange={(e) => setMaxSearch(e.target.value)}
                        placeholder="Search services..."
                        className="w-full pl-8 pr-4 py-1.5 rounded-lg bg-white/5 border border-white/8 text-white placeholder:text-text-dim text-xs focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1" data-lenis-prevent>
                      {allAddOns
                        .filter((item) => !maxSearch || item.name.toLowerCase().includes(maxSearch.toLowerCase()))
                        .map((item) => {
                          const isIncluded = includedSet.has(item.id);
                          const isAdded = requestedIds.includes(item.id);

                          return (
                            <div
                              key={item.id}
                              draggable={!isIncluded}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify(item));
                                setDraggedAddOn(item);
                              }}
                              onDragEnd={() => {
                                setDraggedAddOn(null);
                                setDragOver(false);
                              }}
                              className={cn(
                                "p-2.5 rounded-xl border text-left transition-all relative select-none",
                                isIncluded
                                  ? "bg-emerald-500/5 border-emerald-500/20"
                                  : isAdded
                                  ? "bg-accent/15 border-accent/40"
                                  : "bg-white/3 border-white/5 hover:border-white/15 cursor-grab active:cursor-grabbing"
                              )}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-white text-xs truncate">{item.name}</p>
                                  <p className="text-[10px] text-text-dim">{item.categoryLabel} · {isIncluded ? 'Plan Covered' : `${price(item.price)}/mo`}</p>
                                </div>
                                <button
                                  onClick={() => toggleService(item)}
                                  disabled={isIncluded}
                                  className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 cursor-pointer",
                                    isIncluded
                                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                      : isAdded
                                      ? "bg-accent text-white border-accent hover:bg-red-500"
                                      : "bg-white/5 border-white/10 text-text-muted hover:bg-accent/20 hover:text-white"
                                  )}
                                >
                                  {isIncluded || isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                </button>
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
                      className="w-8 h-8 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-text-dim hover:text-white cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Large Interactive Canvas */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex-1 overflow-auto relative p-6 flex items-center justify-center transition-colors duration-300",
                  dragOver ? "bg-accent/10 ring-2 ring-accent/60 ring-inset" : ""
                )}
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />

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
                          strokeWidth={2.5}
                          strokeOpacity={isDimmed ? 0.15 : 0.85}
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
                                boxShadow: hoveredNode === n.id ? `0 0 28px ${n.color}90` : `0 0 20px -2px ${n.color}70`,
                                touchAction: 'none',
                              }}
                              className="w-full h-full rounded-2xl border-2 bg-neutral-950 flex flex-col items-center justify-center p-3 text-center transition-all duration-300 cursor-grab active:cursor-grabbing select-none"
                            >
                              <span className="text-2xl leading-none mb-1.5">{n.icon}</span>
                              <span style={{ textShadow: `0 0 16px ${n.color}` }} className="text-[18px] font-black uppercase tracking-widest text-white leading-none">
                                {n.label}
                              </span>
                              <span className="text-[12px] text-accent mt-1.5 uppercase tracking-wider font-mono font-bold">
                                Active Base Plan
                              </span>
                            </div>
                          </foreignObject>
                        );
                      }

                      if (n.type === 'category') {
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
                                borderColor: n.color,
                                boxShadow: hoveredNode === n.id ? `0 0 18px ${n.color}60` : `0 0 12px ${n.color}30`,
                                touchAction: 'none',
                              }}
                              className={cn(
                                "w-full h-full rounded-xl border-2 bg-neutral-950 flex items-center justify-center text-center px-3 cursor-grab active:cursor-grabbing select-none transition-all duration-300",
                                isDimmed ? "opacity-35" : "opacity-100"
                              )}
                            >
                              <span style={{ textShadow: `0 0 14px ${n.color}80` }} className="text-[15px] font-extrabold text-white uppercase tracking-wide leading-tight text-center truncate">
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
                              borderColor: n.included ? '#10b981' : n.color,
                              boxShadow: hoveredNode === n.id ? `0 0 20px ${n.color}70` : `0 0 10px ${n.color}30`,
                              touchAction: 'none',
                            }}
                            className={cn(
                              "group/node w-full h-full rounded-xl border-2 bg-neutral-900 hover:bg-neutral-950 flex items-center justify-between px-3 relative shadow-xl cursor-grab active:cursor-grabbing select-none transition-all duration-300",
                              isDimmed ? "opacity-35" : "opacity-100"
                            )}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }} className="text-[14px] font-bold text-white leading-snug line-clamp-2">
                                {n.label}
                              </p>
                              <p className={cn("text-[12px] font-mono mt-0.5 leading-none font-semibold", n.included ? "text-emerald-400" : "text-slate-300")}>
                                {n.included ? "Plan Covered" : `+${price(n.price || 0)}/mo`}
                              </p>
                            </div>
                            {!n.included && (
                              <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (n.originalId) removeExtra(n.originalId);
                                }}
                                className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors shrink-0 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </foreignObject>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Right Configuration Sidebar */}
              <div
                className={cn(
                  "h-full bg-neutral-950/90 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden transition-all duration-300 shrink-0 relative z-20",
                  maxSidebarOpen ? "w-80 opacity-100" : "w-12 opacity-90"
                )}
              >
                {maxSidebarOpen ? (
                  <div className="flex-1 flex flex-col p-4 min-h-0">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim">Architecture Summary</h3>
                      <button
                        onClick={() => setMaxSidebarOpen(false)}
                        className="w-6 h-6 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-text-dim hover:text-white cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3 shrink-0">
                      <span className="text-[9px] text-text-dim uppercase tracking-wider font-mono">Current Base Plan</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{plan.icon}</span> {plan.name}
                        </span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">{price(plan.priceMonthly)}/mo</span>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 space-y-2 mb-4 flex flex-col">
                      <span className="text-[9px] text-text-dim uppercase tracking-wider font-mono shrink-0">
                        Active Services ({allActiveServices.length})
                      </span>
                      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1" data-lenis-prevent>
                        {allActiveServices.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/5 text-xs">
                            <span className="text-white truncate pr-2">{item.name}</span>
                            <span className={cn("font-mono shrink-0", item.included ? "text-emerald-400" : "text-accent")}>
                              {item.included ? "Included" : `+${price(item.price)}/mo`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 mt-auto space-y-2 shrink-0">
                      <div className="flex justify-between text-xs text-text-dim">
                        <span>Base Plan:</span>
                        <span>{price(plan.priceMonthly)}/mo</span>
                      </div>
                      <div className="flex justify-between text-xs text-accent">
                        <span>Requested Add-ons ({selectedExtras.length}):</span>
                        <span>+{price(extrasMonthlyTotal)}/mo</span>
                      </div>
                      <div className="h-px bg-white/10" />
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-sm font-semibold text-white">Estimated Total:</span>
                        <span className="text-xl font-bold text-white font-mono">{price(plan.priceMonthly + extrasMonthlyTotal)}/mo</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center pt-4">
                    <button
                      onClick={() => setMaxSidebarOpen(true)}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-text-dim hover:text-white cursor-pointer"
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
    </div>
  );
}

export { planOrder };
