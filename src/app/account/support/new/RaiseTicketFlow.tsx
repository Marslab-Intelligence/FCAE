'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, AlertCircle, CheckCircle2, Cloud, GitBranch, Server, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  departments, isDepartmentReady, isDepartmentPending, resolveRoutedDepartment, getDepartment,
  getRequestTypes, getCategories, getSubCategories, getTasks,
} from '@/lib/ticket-taxonomy';
import { submitTicketAction } from '../actions';

const DEPT_STYLE: Record<string, { initials: string; icon: typeof Cloud; accent: string }> = {
  'Cloud Infra':   { initials: 'CI', icon: Cloud,      accent: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30' },
  'Dev_Ops':       { initials: 'DE', icon: GitBranch,  accent: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
  'IT Infra':      { initials: 'II', icon: Server,     accent: 'text-violet-300 bg-violet-500/15 border-violet-500/30' },
  'Tally Support': { initials: 'TS', icon: Calculator, accent: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
};

const labelCls = 'block text-[10px] font-mono font-bold uppercase tracking-wider text-text-dim mb-1.5';
const fieldCls =
  'w-full bg-white/4 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text ' +
  'placeholder:text-text-dim/50 focus:outline-none focus:border-accent/50 focus:bg-white/6 ' +
  'transition-all disabled:opacity-40 disabled:cursor-not-allowed';

function Field({ id, label, required, error, children }: {
  id: string; label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {required && <span className="text-rose-400">* </span>}{label}
      </label>
      {children}
      {error && <p className="text-[10px] text-rose-400 mt-1">{error}</p>}
    </div>
  );
}

export function RaiseTicketFlow() {
  const [department, setDepartment] = useState<string | null>(null);
  const [requestType, setRequestType] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [taskName, setTaskName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [onBehalf, setOnBehalf] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ ticketNumber: string | null } | null>(null);

  const hasTaskLevel = department ? getDepartment(department)?.hasTaskLevel ?? false : false;

  const requestTypes = useMemo(() => (department ? getRequestTypes(department) : []), [department]);
  const categories = useMemo(
    () => (department && requestType ? getCategories(department, requestType) : []),
    [department, requestType],
  );
  const subCategories = useMemo(
    () => (department && requestType && category ? getSubCategories(department, requestType, category) : []),
    [department, requestType, category],
  );
  const tasks = useMemo(
    () => (department && requestType && category ? getTasks(department, requestType, category, subCategory) : []),
    [department, requestType, category, subCategory],
  );

  // Selecting a parent invalidates everything below it.
  const pickRequestType = (v: string) => { setRequestType(v); setCategory(''); setSubCategory(''); setTaskName(''); };
  const pickCategory = (v: string) => { setCategory(v); setSubCategory(''); setTaskName(''); };
  const pickSubCategory = (v: string) => { setSubCategory(v); setTaskName(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !department) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const result = await submitTicketAction({
        department, requestType, category,
        subCategory: subCategory || undefined,
        taskName: taskName || undefined,
        requirements, subject,
        description: description || undefined,
        onBehalfOfCustomer: onBehalf,
        agentName: agentName || undefined,
        agentEmail: agentEmail || undefined,
      });

      if (!result.ok) {
        setErrors(result.fieldErrors);
        setFormError(result.message ?? 'Please correct the highlighted fields.');
        return;
      }
      setCreated({ ticketNumber: result.ticketNumber });
    } catch (err) {
      console.error('[RaiseTicket] submit failed:', err);
      setFormError('Something went wrong raising your ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-5 py-20">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h1 className="font-display font-bold text-2xl text-text">Ticket raised</h1>
          <p className="text-sm text-text-muted">
            {created.ticketNumber
              ? <>Your ticket <strong className="text-text">#{created.ticketNumber}</strong> has been created with the {department} team.</>
              : <>Your request has been recorded with the {department} team and will be picked up shortly.</>}
          </p>
        </div>
        <Link href="/account/support" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-text hover:bg-white/10 transition-all">
          Back to Support
        </Link>
      </div>
    );
  }

  // ── Step 1: pick a department ──
  if (!department) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/account/support" className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-dim hover:text-text transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-text">Departments</h1>
            <p className="text-text-muted text-sm">Choose the team that should handle your request.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const style = DEPT_STYLE[dept] ?? DEPT_STYLE['Cloud Infra'];
            const ready = isDepartmentReady(dept);
            const pending = isDepartmentPending(dept);
            const Icon = style.icon;
            return (
              <div key={dept} className="p-5 rounded-2xl glass-card flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center text-xs font-bold', style.accent)}>
                    {style.initials}
                  </div>
                  <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
                    <Icon className="w-4 h-4 text-text-dim" /> {dept}
                  </h2>
                  {pending && (
                    <span className="ml-auto shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold border text-amber-300 bg-amber-500/10 border-amber-500/30">
                      Under process
                    </span>
                  )}
                </div>
                {pending && (
                  <p className="text-xs text-text-dim -mt-2">
                    This desk is still being set up. Your ticket is handled by the{' '}
                    <strong className="text-text-muted">{resolveRoutedDepartment(dept)}</strong> team in the meantime.
                  </p>
                )}
                <button
                  onClick={() => setDepartment(dept)}
                  disabled={!ready}
                  title={ready ? undefined : 'Ticket categories for this department are not loaded yet'}
                  className={cn(
                    'self-start px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    ready
                      ? 'bg-linear-to-r from-accent to-purple-600 text-white hover:from-accent-glow hover:to-purple-500'
                      : 'bg-white/5 border border-white/10 text-text-dim cursor-not-allowed',
                  )}
                >
                  {ready ? 'Submit Ticket' : 'Categories pending'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Step 2: the ticket form ──
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDepartment(null)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-dim hover:text-text transition-all"
          aria-label="Back to departments"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-display font-bold text-2xl text-text">Submit a ticket</h1>
          <p className="text-text-muted text-sm">{department}</p>
        </div>
      </div>

      {isDepartmentPending(department) && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/25 text-amber-200 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            The <strong>{department}</strong> desk is still being set up. Your ticket will be
            raised with the <strong>{resolveRoutedDepartment(department)}</strong> team, who will
            route it internally.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl glass-card p-6 space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-text-dim">Ticket Information</p>

        <Field id="department" label="Department" required>
          <input id="department" value={department} disabled className={fieldCls} />
        </Field>

        <label className="flex items-center gap-2.5 text-sm text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={onBehalf}
            onChange={(e) => {
              setOnBehalf(e.target.checked);
              if (!e.target.checked) { setAgentName(''); setAgentEmail(''); }
            }}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-accent"
          />
          Submitting ticket on behalf of customer
        </label>

        {/* Who is raising it, revealed only when the box is ticked. */}
        {onBehalf && (
          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/3 border border-white/10">
            <Field id="agentName" label="By Agent Name" required error={errors.agentName}>
              <input id="agentName" value={agentName} onChange={(e) => setAgentName(e.target.value)}
                maxLength={255} placeholder="Agent raising this ticket" className={fieldCls} />
            </Field>
            <Field id="agentEmail" label="Agent Email" required error={errors.agentEmail}>
              <input id="agentEmail" type="email" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)}
                maxLength={254} placeholder="agent@sidcloud.com" className={fieldCls} />
            </Field>
          </div>
        )}

        <Field id="requestType" label="Request Type" required error={errors.requestType}>
          <select id="requestType" value={requestType} onChange={(e) => pickRequestType(e.target.value)}
            className={cn(fieldCls, 'cursor-pointer')}>
            <option value="" className="bg-[#0a0e1a]">-None-</option>
            {requestTypes.map((t) => <option key={t} value={t} className="bg-[#0a0e1a]">{t}</option>)}
          </select>
        </Field>

        <Field id="category" label="Ticket Category" required error={errors.category}>
          <select id="category" value={category} onChange={(e) => pickCategory(e.target.value)}
            disabled={!requestType} className={cn(fieldCls, 'cursor-pointer')}>
            <option value="" className="bg-[#0a0e1a]">{requestType ? '-None-' : 'Select a request type first'}</option>
            {categories.map((c) => <option key={c} value={c} className="bg-[#0a0e1a]">{c}</option>)}
          </select>
        </Field>

        <Field id="subCategory" label="Ticket Sub Category" required error={errors.subCategory}>
          <select id="subCategory" value={subCategory} onChange={(e) => pickSubCategory(e.target.value)}
            disabled={!category} className={cn(fieldCls, 'cursor-pointer')}>
            <option value="" className="bg-[#0a0e1a]">{category ? '-None-' : 'Select a category first'}</option>
            {subCategories.map((s) => <option key={s} value={s} className="bg-[#0a0e1a]">{s}</option>)}
          </select>
        </Field>

        {/* Only Cloud Infra nests a fourth level; the other layouts have no Task field. */}
        {hasTaskLevel && (
          <Field id="taskName" label="Task Name - Description" required error={errors.taskName}>
            <select id="taskName" value={taskName} onChange={(e) => setTaskName(e.target.value)}
              disabled={tasks.length === 0} className={cn(fieldCls, 'cursor-pointer')}>
              <option value="" className="bg-[#0a0e1a]">
                {tasks.length === 0 ? 'Select a sub category first' : '-None-'}
              </option>
              {tasks.map((t) => <option key={t} value={t} className="bg-[#0a0e1a]">{t}</option>)}
            </select>
          </Field>
        )}

        <Field id="requirements" label="Requirements" required error={errors.requirements}>
          <input id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)}
            placeholder="What exactly do you need?" className={fieldCls} />
        </Field>

        <Field id="subject" label="Subject" required error={errors.subject}>
          <input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="Short summary of the request" className={fieldCls} />
        </Field>

        <Field id="description" label="Description" error={errors.description}>
          <textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Any extra detail that helps the engineer"
            data-lenis-prevent className={cn(fieldCls, 'resize-y min-h-28')} />
        </Field>

        {formError && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/8 border border-rose-500/25 text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-bold text-sm hover:from-accent-glow hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Raising ticket…</> : <><Send className="w-4 h-4" /> Submit</>}
          </button>
          <Link href="/account/support"
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-text-dim hover:text-text text-sm font-medium transition-all flex items-center">
            Discard
          </Link>
        </div>
      </form>
    </div>
  );
}
