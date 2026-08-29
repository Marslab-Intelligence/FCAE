'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Clock, Check, Loader2, Layers, Award,
  FolderKanban, Calendar, User2, BarChart3, Link2,
  ChevronDown, ChevronUp, Tag, Flag, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ZohoProjectMapped, ZohoMilestoneMapped, ZohoTaskMapped } from '@/lib/zoho';

// ─── Status & Color Helpers ──────────────────────────────────────────────────
function statusLabel(s: ZohoMilestoneMapped['status']) {
  if (s === 'completed') return 'Completed';
  if (s === 'inprogress') return 'In Progress';
  return 'Upcoming';
}

function priorityColor(p: ZohoTaskMapped['priority']) {
  if (p === 'high') return 'text-rose-400';
  if (p === 'medium') return 'text-amber-300';
  if (p === 'low') return 'text-cyan-400';
  return 'text-text-dim';
}

function taskStatusIcon(s: ZohoTaskMapped['status']) {
  if (s === 'closed') return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
  if (s === 'inprogress') return <Loader2 className="w-4 h-4 text-amber-300 animate-spin shrink-0" />;
  return <Clock className="w-4 h-4 text-text-dim/50 shrink-0" />;
}

// ─── Milestone Card ───────────────────────────────────────────────────────────
function MilestoneCard({ m, index }: { m: ZohoMilestoneMapped; index: number }) {
  const [open, setOpen] = useState(m.status === 'inprogress');
  const isCompleted = m.status === 'completed';
  const isActive = m.status === 'inprogress';

  return (
    <div className={cn(
      'rounded-3xl border transition-all duration-300 relative md:ml-14',
      isCompleted ? 'glass-card border-emerald-500/30'
        : isActive ? 'border-amber-500/50 bg-linear-to-br from-[#1a1509]/90 via-[#0e0c07]/95 to-[#080705]/95 shadow-[0_0_30px_rgba(234,179,8,0.12)]'
          : 'bg-white/2 border-white/10 opacity-80'
    )}>
      {/* Timeline Node */}
      <div className={cn(
        'absolute -left-14 top-6 w-8 h-8 rounded-full border-2 hidden md:flex items-center justify-center bg-[#0a0a0a] z-10',
        isCompleted ? 'border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
          : isActive ? 'border-amber-400 text-amber-300 animate-pulse shadow-[0_0_14px_rgba(234,179,8,0.4)]'
            : 'border-white/15 text-text-dim'
      )}>
        {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-[10px] font-bold font-mono">{index + 1}</span>}
      </div>

      {/* Header */}
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(
              'px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border',
              isCompleted ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : isActive ? 'text-amber-300 bg-amber-500/15 border-amber-500/30 animate-pulse'
                  : 'text-text-dim bg-white/5 border-white/10'
            )}>
              {statusLabel(m.status)}
            </span>
            <span className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono border',
              m.flag === 'external' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
            )}>
              <Tag className="w-2.5 h-2.5 inline mr-1" />
              {m.flag === 'external' ? 'Client-Visible' : 'Internal'}
            </span>
            <span className="text-[10px] font-mono text-text-dim flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {isCompleted ? `Done ${m.completedDate ?? m.endDate}` : `Due ${m.endDate}`}
            </span>
            <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
              <User2 className="w-3 h-3" /> {m.ownerName}
            </span>
          </div>

          <h4 className="font-display font-extrabold text-lg sm:text-xl text-text tracking-tight truncate">
            {m.name}
          </h4>

          {isActive && (
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-amber-400 to-emerald-400 shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                  style={{ width: `${m.completionPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 shrink-0">{m.completionPercent}%</span>
            </div>
          )}
        </div>

        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 transition-colors', open ? 'bg-accent/15 border-accent/30 text-accent' : 'bg-white/5 border-white/10 text-text-dim')}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Task List */}
      {open && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3 border-t border-white/8">
          <p className="text-[10px] font-mono text-text-dim uppercase tracking-widest pt-4">
            Tasks & Deliverables · {m.tasks.filter(t => t.status === 'closed').length}/{m.tasks.length} Complete
          </p>
          {m.tasks.length === 0 ? (
            <p className="text-xs text-text-dim italic">No tasks in this milestone.</p>
          ) : (
            <div className="space-y-2">
              {m.tasks.map((task) => (
                <div key={task.id} className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border text-sm transition-all',
                  task.status === 'closed' ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-300/80'
                    : task.status === 'inprogress' ? 'bg-amber-500/8 border-amber-500/25 text-amber-200'
                      : 'bg-white/3 border-white/8 text-text-dim'
                )}>
                  {taskStatusIcon(task.status)}
                  <span className="flex-1 truncate">{task.name}</span>
                  <span className={cn('text-[10px] font-mono font-bold shrink-0', priorityColor(task.priority))}>
                    <Flag className="w-3 h-3 inline mr-0.5" />{task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-16">
      <div className="h-10 w-80 rounded-xl bg-white/5" />
      <div className="h-44 rounded-3xl bg-white/5" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/5" />)}
      </div>
      {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-3xl bg-white/5" />)}
    </div>
  );
}

// ─── Project Entry / Fallback Notice (shown until a project is assigned) ───
function NoProjectFoundNotice({ userEmail }: { userEmail: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 pb-16">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/25 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.15)]">
          <User2 className="w-10 h-10 text-accent" />
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#0a0a0a] animate-pulse" />
      </div>

      {/* Copy */}
      <div className="text-center space-y-3 max-w-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">Automatic Email Sync</span>
        </div>
        <h1 className="font-display font-extrabold text-fluid-h1 text-text tracking-tight">
          No Active Project Found
        </h1>
        <p className="text-text-muted text-sm leading-relaxed">
          We checked Zoho Projects for <code className="text-amber-300 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">{userEmail || 'your email'}</code> but didn&apos;t find an assigned project yet.
        </p>
        <p className="text-text-dim text-xs">
          Once your project is created in Zoho Projects with your email, your roadmap will appear here automatically on login.
        </p>
      </div>

      {/* Assignment is driven entirely by the email tag in Zoho — there is no
          manual link path, so the only action here is to re-check the sync. */}
      <div className="w-full max-w-lg">
        <button
          onClick={() => window.location.reload()}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-accent hover:bg-accent/90 text-white font-display font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Re-check Zoho Sync
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function ProjectDashboard({
  project,
  onRefresh,
  lastRefresh,
  refreshing,
}: {
  project: ZohoProjectMapped;
  onRefresh: () => void;
  lastRefresh: Date | null;
  refreshing: boolean;
}) {
  const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
  const activeMilestone = project.milestones.find(m => m.status === 'inprogress');

  return (
    <div className="space-y-8 pb-16">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">
              Zoho Projects · Auto-Synced
            </span>
          </div>
          <h1 className="font-display font-extrabold text-fluid-h1 text-text tracking-tight">
            Project Progress & Roadmap
          </h1>
          <p className="text-text-muted text-sm mt-1 max-w-xl">
            Live milestone tracking and task deliverables synced automatically from Zoho Projects.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start flex-wrap">
          {lastRefresh && (
            <span className="text-[10px] font-mono text-text-dim hidden sm:block">
              Synced {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-text-dim hover:text-text hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} /> Refresh
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-mono bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
            <Link2 className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Zoho · Live
          </div>
        </div>
      </div>

      {/* ── Project Overview Card ── */}
      <div className="rounded-3xl border border-accent/20 glass-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start gap-6 relative z-10">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
              <FolderKanban className="w-7 h-7 text-accent" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {project.status}
                </span>
                <span className="text-[10px] font-mono text-text-dim flex items-center gap-1">
                  <User2 className="w-3 h-3" /> {project.owner}
                </span>
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-text tracking-tight">{project.name}</h2>
              {project.description && (
                <p className="text-text-muted text-sm mt-1 font-light">{project.description}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-[11px] font-mono text-text-dim">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Start: {project.startDate}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> End: {project.endDate}</span>
              </div>
            </div>
          </div>

          {/* Overall Completion */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 shrink-0 space-y-3 min-w-50">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-text-dim flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Overall</span>
              <span className="font-display font-black text-2xl text-accent">{project.completionPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/5">
              <div
                className="h-full rounded-full bg-linear-to-r from-accent via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-all duration-700"
                style={{ width: `${project.completionPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-text-dim">
              <span className="text-emerald-400">{project.closedTasks} done</span>
              <span className="text-amber-300">{project.openTasks} open</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card space-y-1">
          <span className="text-[10px] text-text-dim font-mono uppercase tracking-wider">Milestones Done</span>
          <p className="font-display font-bold text-2xl text-emerald-400">{completedMilestones} <span className="text-xs text-text-dim">/ {project.milestones.length}</span></p>
          <p className="text-[10px] text-text-muted">Zoho Milestones</p>
        </div>
        <div className="p-5 rounded-2xl glass-card space-y-1">
          <span className="text-[10px] text-text-dim font-mono uppercase tracking-wider">Tasks Closed</span>
          <p className="font-display font-bold text-2xl text-cyan-400">{project.closedTasks}</p>
          <p className="text-[10px] text-text-muted">{project.openTasks} remaining open</p>
        </div>
        <div className="p-5 rounded-2xl glass-card space-y-1">
          <span className="text-[10px] text-text-dim font-mono uppercase tracking-wider">Active Milestone</span>
          <p className="font-display font-bold text-lg text-amber-300 leading-tight truncate">
            {activeMilestone ? activeMilestone.name.split(' ').slice(0, 3).join(' ') : '—'}
          </p>
          <p className="text-[10px] text-text-muted">
            {activeMilestone ? `${activeMilestone.completionPercent}% complete` : 'None active'}
          </p>
        </div>
        <div className="p-5 rounded-2xl glass-card space-y-1">
          <span className="text-[10px] text-text-dim font-mono uppercase tracking-wider">Project End</span>
          <p className="font-display font-bold text-xl text-purple-400">{project.endDate}</p>
          <p className="text-[10px] text-text-muted">Target completion</p>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="space-y-6 pt-2">
        <div>
          <h3 className="font-display font-bold text-2xl text-text flex items-center gap-2">
            <Layers className="w-6 h-6 text-accent" /> Milestones & Deliverables
          </h3>
          <p className="text-text-muted text-sm mt-1">
            Phase-by-phase breakdown with task status from Zoho Projects.
          </p>
        </div>

        <div className="space-y-4 relative">
          <div className="absolute left-[1.85rem] top-4 bottom-4 w-0.5 bg-linear-to-b from-emerald-500 via-amber-500 to-white/10 hidden md:block" />
          {project.milestones.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm glass-card rounded-3xl">
              No milestones found in this project.
            </div>
          ) : (
            project.milestones.map((m, idx) => (
              <MilestoneCard key={m.id} m={m} index={idx} />
            ))
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/2 border border-white/8 text-[11px] font-mono text-text-dim">
        <Award className="w-4 h-4 text-accent shrink-0" />
        <span>
          Source: <strong className="text-text-muted">Zoho Projects API</strong> · Project ID: <code className="text-accent">{project.id}</code>
        </span>
      </div>
    </div>
  );
}

/** How often the browser asks the server for the latest snapshot. */
const LIVE_POLL_MS = 1000;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const [phase, setPhase] = useState<'init' | 'entry' | 'loading' | 'dashboard'>('init');
  const [project, setProject] = useState<ZohoProjectMapped | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Latest snapshot hash — re-render only when the data genuinely changed, so a
  // once-per-second poll doesn't thrash the DOM or collapse expanded milestones.
  const hashRef = useRef<string | null>(null);
  // Guards against overlapping polls if a request outlives its interval tick.
  const inFlightRef = useRef(false);

  // ── Live sync loop ──────────────────────────────────────────────────────────
  // Polls once a second. The server answers from its Zoho snapshot cache, so
  // this is cheap: Zoho itself is only re-read once per ZOHO_POLL_INTERVAL_MS.
  useEffect(() => {
    let cancelled = false;

    const poll = async (force = false) => {
      if (cancelled || inFlightRef.current) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

      inFlightRef.current = true;
      try {
        const res = await fetch(`/api/zoho/project${force ? '?force=1' : ''}`, { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;

        if (data.userEmail) setUserEmail(data.userEmail);

        if (!res.ok || data.error) {
          // Only fall back to the empty state when the client truly has no
          // project. A transient Zoho/network blip must not wipe a live board.
          if (data.error === 'NO_PROJECT') {
            hashRef.current = null;
            setProject(null);
            setPhase('entry');
          } else {
            setPhase(p => (p === 'init' ? 'entry' : p));
          }
          return;
        }

        if (data.hash !== hashRef.current) {
          hashRef.current = data.hash;
          setProject(data.project);
        }
        setLastRefresh(new Date(data.fetchedAt ?? Date.now()));
        setPhase('dashboard');
      } catch {
        if (!cancelled) setPhase(p => (p === 'init' ? 'entry' : p));
      } finally {
        inFlightRef.current = false;
      }
    };

    poll();
    const id = setInterval(poll, LIVE_POLL_MS);
    // Catch up immediately when the tab regains focus rather than waiting a tick.
    const onVisible = () => { if (document.visibilityState === 'visible') poll(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // Manual refresh — `force=1` bypasses the server snapshot cache and re-reads Zoho now
  const handleRefresh = () => {
    if (!project) return;
    setRefreshing(true);
    fetch('/api/zoho/project?force=1', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          hashRef.current = data.hash ?? null;
          setProject(data.project);
          setLastRefresh(new Date(data.fetchedAt ?? Date.now()));
        }
      })
      .finally(() => setRefreshing(false));
  };

  if (phase === 'init' || phase === 'loading') return <LoadingSkeleton />;

  if (phase === 'entry') {
    return (
      <NoProjectFoundNotice userEmail={userEmail} />
    );
  }

  if (phase === 'dashboard' && project) {
    return (
      <ProjectDashboard
        project={project}
        onRefresh={handleRefresh}
        lastRefresh={lastRefresh}
        refreshing={refreshing}
      />
    );
  }

  return null;
}
