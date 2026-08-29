/**
 * src/lib/zoho.ts
 * Server-side Zoho Projects API service.
 * Uses OAuth 2.0 refresh token to get short-lived access tokens.
 * All calls are server-side only — credentials never reach the browser.
 */
import { createHash } from 'node:crypto';

const REGION   = process.env.ZOHO_REGION ?? 'in';
const AUTH_URL = `https://accounts.zoho.${REGION}/oauth/v2/token`;
const API_BASE = `https://projectsapi.zoho.${REGION}/restapi`;

/**
 * Custom-field label(s) on a Zoho project that hold the client's login email.
 * A project is shown to a client only when one of these fields contains that
 * client's exact email address. Comma/semicolon separated values are supported
 * so one project can serve several client logins.
 */
const CLIENT_EMAIL_FIELDS = (process.env.ZOHO_CLIENT_EMAIL_FIELD ?? 'Email,Client Email,Client_Email')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

/** How long a project snapshot is reused before Zoho is queried again. */
const SNAPSHOT_TTL_MS = Number(process.env.ZOHO_POLL_INTERVAL_MS ?? 15_000);
/** How long the portal-wide project list (used for email matching) is reused. */
const LIST_TTL_MS = Number(process.env.ZOHO_LIST_TTL_MS ?? 60_000);

/** Zoho caps a single page at 200 records; walk pages until one comes back short. */
const PAGE_SIZE = 200;
const MAX_PAGES = 25;

// ── Raw Zoho payloads ─────────────────────────────────────────────────────────
// Only the fields this integration actually reads. Zoho returns far more; the
// rest is deliberately left untyped rather than guessed at.

/**
 * Zoho reports custom fields in two shapes depending on the endpoint: the
 * project list returns bare `{ "Email": "a@b.com" }` objects, while some
 * endpoints return `{ label_name: "Email", value: "a@b.com" }`. Both are read.
 */
export interface ZohoCustomField {
  label_name?: string;
  column_name?: string;
  value?: string;
  [label: string]: string | undefined;
}

export interface ZohoRawProject {
  id_string: string;
  key?: string;
  name?: string;
  status?: string;
  description?: string;
  owner_name?: string;
  owner_email?: string;
  project_percent?: string | number;
  start_date?: string;
  end_date?: string;
  task_count?: { open?: number; closed?: number };
  custom_fields?: ZohoCustomField[];
}

export interface ZohoRawMilestone {
  id_string: string;
  name?: string;
  status?: string;
  flag?: string;
  start_date?: string;
  end_date?: string;
  completed_date?: string;
  owner_name?: string;
  percent_complete?: string | number;
}

export interface ZohoRawTask {
  id_string: string;
  name?: string;
  priority?: string;
  due_date?: string;
  start_date?: string;
  status?: { name?: string };
  milestone?: { id_string?: string; id?: string };
  tasklist?: { id_string?: string; id?: string; name?: string };
}

// ── Token Cache (in-memory, valid for ~55 mins) ───────────────────────────────
let _cachedToken: string | null = null;
let _tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (_cachedToken && now < _tokenExpiry) return _cachedToken;

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
      client_id:     process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      grant_type:    'refresh_token',
    }),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Zoho token refresh failed: ${res.status}`);

  const data = await res.json();
  if (!data.access_token) throw new Error('No access_token in Zoho response');

  _cachedToken = data.access_token as string;
  _tokenExpiry = now + 55 * 60 * 1000; // 55 minutes
  return _cachedToken;
}

// ── Zoho API Helper ───────────────────────────────────────────────────────────
async function zohoGet(path: string): Promise<Record<string, unknown>> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
    // Freshness is managed by the snapshot cache below, not by Next's fetch
    // cache — a stale HTTP layer here would make the live dashboard lie.
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoho API error [${res.status}]: ${err}`);
  }
  return res.json();
}

/**
 * Zoho paginates with a 1-based `index` and a `range` capped at 200. Without
 * this the default page of 100 silently truncates larger projects — a 110-task
 * project renders as 100 tasks with a wrong completion count.
 */
async function zohoGetAll<T>(path: string, key: string, extraQuery = ''): Promise<T[]> {
  const out: T[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const index = page * PAGE_SIZE + 1;
    const sep = path.includes('?') ? '&' : '?';
    const data = await zohoGet(`${path}${sep}index=${index}&range=${PAGE_SIZE}${extraQuery}`);
    const batch = (data?.[key] ?? []) as T[];
    out.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return out;
}

// ── Public API Functions ──────────────────────────────────────────────────────

/** Fetch project summary */
export async function fetchZohoProject(portalId: string, projectId: string): Promise<ZohoRawProject | null> {
  const data = await zohoGet(`/portal/${portalId}/projects/${projectId}/`);
  const projects = (data.projects ?? []) as ZohoRawProject[];
  return projects[0] ?? null;
}

/** Fetch all milestones for a project (every status, all pages) */
export async function fetchZohoMilestones(portalId: string, projectId: string): Promise<ZohoRawMilestone[]> {
  return zohoGetAll<ZohoRawMilestone>(
    `/portal/${portalId}/projects/${projectId}/milestones/`, 'milestones', '&status=all',
  );
}

/** Fetch all tasks for a project at project level (every status, all pages) */
export async function fetchZohoTasks(portalId: string, projectId: string): Promise<ZohoRawTask[]> {
  return zohoGetAll<ZohoRawTask>(
    `/portal/${portalId}/projects/${projectId}/tasks/`, 'tasks', '&status=all',
  );
}

/** Fetch all projects in the portal (uncached — prefer `getProjectList`) */
export async function fetchAllZohoProjects(portalId: string): Promise<ZohoRawProject[]> {
  return zohoGetAll<ZohoRawProject>(`/portal/${portalId}/projects/`, 'projects');
}

// ── Caching + single-flight ───────────────────────────────────────────────────
// The dashboard polls once per second for a live feel. Those polls are served
// from these caches; Zoho itself is queried at most once per TTL, and concurrent
// viewers of the same project share a single in-flight request.

interface CacheEntry<T> { data: T; at: number }

let _listCache: CacheEntry<ZohoRawProject[]> | null = null;
const _snapshotCache = new Map<string, CacheEntry<ZohoProjectMapped>>();
const _inFlight = new Map<string, Promise<unknown>>();

function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = _inFlight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = fn().finally(() => _inFlight.delete(key));
  _inFlight.set(key, p);
  return p;
}

/** Portal project list, cached for LIST_TTL_MS. */
export async function getProjectList(portalId: string, force = false): Promise<ZohoRawProject[]> {
  if (!force && _listCache && Date.now() - _listCache.at < LIST_TTL_MS) return _listCache.data;
  return singleFlight(`list:${portalId}`, async () => {
    const data = await fetchAllZohoProjects(portalId);
    _listCache = { data, at: Date.now() };
    return data;
  });
}

export interface ProjectSnapshot {
  project: ZohoProjectMapped;
  /** Changes only when the rendered data changes — lets the client skip re-renders. */
  hash: string;
  /** When this data was actually read from Zoho. */
  fetchedAt: number;
  /** True when served from cache rather than a fresh Zoho read. */
  cached: boolean;
}

function hashProject(p: ZohoProjectMapped): string {
  return createHash('sha1').update(JSON.stringify(p)).digest('hex').slice(0, 16);
}

/** A fully mapped project, refreshed from Zoho at most once per SNAPSHOT_TTL_MS. */
export async function getProjectSnapshot(
  portalId: string,
  projectId: string,
  force = false,
): Promise<ProjectSnapshot | null> {
  const hit = _snapshotCache.get(projectId);
  if (!force && hit && Date.now() - hit.at < SNAPSHOT_TTL_MS) {
    return { project: hit.data, hash: hashProject(hit.data), fetchedAt: hit.at, cached: true };
  }

  return singleFlight(`snap:${projectId}`, async () => {
    const [project, milestones, allTasks] = await Promise.all([
      fetchZohoProject(portalId, projectId),
      fetchZohoMilestones(portalId, projectId).catch(() => [] as ZohoRawMilestone[]),
      fetchZohoTasks(portalId, projectId).catch(() => [] as ZohoRawTask[]),
    ]);
    if (!project) return null;

    const mapped = mapZohoResponse(project, milestones, allTasks);
    const at = Date.now();
    _snapshotCache.set(projectId, { data: mapped, at });
    return { project: mapped, hash: hashProject(mapped), fetchedAt: at, cached: false };
  });
}

/** Drop caches for a project — call from the Zoho webhook for instant updates. */
export function invalidateProject(projectId?: string) {
  if (projectId) _snapshotCache.delete(projectId);
  else _snapshotCache.clear();
  _listCache = null;
}

// ── Client email tagging ──────────────────────────────────────────────────────

/**
 * Emails a Zoho project is tagged with, read from its custom fields.
 *
 * Deliberately ignores `owner_email` and every other field: those hold SID staff
 * addresses, so honouring them would hand a client whichever project an employee
 * happens to own. Only an explicit custom-field tag grants access.
 */
export function extractClientEmails(project: ZohoRawProject): string[] {
  const fields = Array.isArray(project?.custom_fields) ? project.custom_fields : [];
  const emails = new Set<string>();

  const collect = (raw: unknown) => {
    for (const part of String(raw ?? '').split(/[,;\s]+/)) {
      const email = part.trim().toLowerCase();
      if (email.includes('@')) emails.add(email);
    }
  };

  const isEmailField = (label: string) => CLIENT_EMAIL_FIELDS.includes(label.trim().toLowerCase());

  for (const f of fields) {
    if (!f || typeof f !== 'object') continue;

    // Shape A — the project list: { "Email": "a@b.com" }
    for (const [key, value] of Object.entries(f)) {
      if (key === 'label_name' || key === 'column_name' || key === 'value') continue;
      if (isEmailField(key)) collect(value);
    }

    // Shape B — labelled field: { label_name: "Email", value: "a@b.com" }
    const label = String(f.label_name ?? f.column_name ?? '');
    if (label && isEmailField(label)) collect(f.value);
  }

  return [...emails];
}

/** Whether a project is tagged with this exact client email. */
export function projectMatchesEmail(project: ZohoRawProject, email: string): boolean {
  const target = (email ?? '').trim().toLowerCase();
  if (!target) return false;
  return extractClientEmails(project).includes(target);
}

/**
 * Every project tagged with this client's email. Exact, case-insensitive match
 * on the client-email custom field — never a substring scan of the project JSON.
 */
export async function findZohoProjectsByEmail(portalId: string, clientEmail: string): Promise<ZohoRawProject[]> {
  if (!clientEmail?.includes('@')) return [];
  const projects = await getProjectList(portalId).catch(() => [] as ZohoRawProject[]);
  return projects.filter(p => projectMatchesEmail(p, clientEmail));
}

/** The single project a client should see, or null. */
export async function findZohoProjectByEmail(portalId: string, clientEmail: string): Promise<ZohoRawProject | null> {
  const matches = await findZohoProjectsByEmail(portalId, clientEmail);
  return matches[0] ?? null;
}

// ── Response Mapper ───────────────────────────────────────────────────────────

export interface ZohoProjectListItem {
  id: string;    // numeric id_string e.g. "218607000002220227"
  key: string;   // short key e.g. "MA-57"
  name: string;
  status: string;
  owner: string;
  completionPercent: number;
  startDate: string;
  endDate: string;
}

export interface ZohoTaskMapped {
  id: string;
  name: string;
  status: 'open' | 'inprogress' | 'closed';
  priority: 'high' | 'medium' | 'low' | 'none';
  dueDate?: string;
}

export interface ZohoMilestoneMapped {
  id: string;
  name: string;
  status: 'completed' | 'notstarted' | 'inprogress';
  startDate: string;
  endDate: string;
  completedDate?: string;
  ownerName: string;
  completionPercent: number;
  flag: 'internal' | 'external';
  tasks: ZohoTaskMapped[];
}

export interface ZohoProjectMapped {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  owner: string;
  startDate: string;
  endDate: string;
  completionPercent: number;
  openTasks: number;
  closedTasks: number;
  isConnected: boolean;
  milestones: ZohoMilestoneMapped[];
}

function mapTaskStatus(t: ZohoRawTask): ZohoTaskMapped['status'] {
  const s = (t.status?.name ?? '').toLowerCase();
  if (s === 'closed' || s === 'completed') return 'closed';
  if (s.includes('progress')) return 'inprogress';
  return 'open';
}

function mapPriority(p: string): ZohoTaskMapped['priority'] {
  if (p === 'high') return 'high';
  if (p === 'medium') return 'medium';
  if (p === 'low') return 'low';
  return 'none';
}

function mapMilestoneStatus(m: ZohoRawMilestone): ZohoMilestoneMapped['status'] {
  const s = (m.status ?? '').toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'notstarted' || s === 'not started') return 'notstarted';
  return 'inprogress';
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function mapZohoResponse(
  project: ZohoRawProject,
  milestones: ZohoRawMilestone[],
  allTasks: ZohoRawTask[]
): ZohoProjectMapped {
  const sectionsMap = new Map<string, ZohoMilestoneMapped>();

  // 1. Add explicit milestones from Zoho if provided
  milestones.forEach((m) => {
    sectionsMap.set(m.id_string, {
      id: m.id_string,
      name: decodeHtmlEntities(m.name ?? ''),
      status: mapMilestoneStatus(m),
      startDate: m.start_date ?? '—',
      endDate: m.end_date ?? '—',
      completedDate: m.completed_date,
      ownerName: m.owner_name ?? '—',
      completionPercent: Number(m.percent_complete ?? 0),
      flag: m.flag === 'external' ? 'external' : 'internal',
      tasks: [],
    });
  });

  // 2. Map all tasks to their Milestone or Tasklist
  allTasks.forEach((t) => {
    const mappedTask: ZohoTaskMapped = {
      id: t.id_string,
      name: decodeHtmlEntities(t.name ?? ''),
      status: mapTaskStatus(t),
      priority: mapPriority(t.priority ?? 'none'),
      dueDate: t.due_date,
    };

    const msId = t.milestone?.id_string ?? t.milestone?.id;
    const tlId = t.tasklist?.id_string ?? t.tasklist?.id;
    const tlName = decodeHtmlEntities(t.tasklist?.name ?? 'General Tasks');

    if (msId && sectionsMap.has(msId)) {
      sectionsMap.get(msId)!.tasks.push(mappedTask);
    } else if (tlId) {
      if (!sectionsMap.has(tlId)) {
        sectionsMap.set(tlId, {
          id: tlId,
          name: tlName,
          status: 'inprogress',
          startDate: t.start_date ?? '—',
          endDate: t.due_date ?? '—',
          ownerName: project.owner_name ?? '—',
          completionPercent: 0,
          flag: 'external',
          tasks: [],
        });
      }
      sectionsMap.get(tlId)!.tasks.push(mappedTask);
    } else {
      const fallbackId = '__general__';
      if (!sectionsMap.has(fallbackId)) {
        sectionsMap.set(fallbackId, {
          id: fallbackId,
          name: 'General Tasks',
          status: 'inprogress',
          startDate: '—',
          endDate: '—',
          ownerName: project.owner_name ?? '—',
          completionPercent: 0,
          flag: 'external',
          tasks: [],
        });
      }
      sectionsMap.get(fallbackId)!.tasks.push(mappedTask);
    }
  });

  // 3. Filter out empty milestones if tasklists were created instead, or recalculate percent
  const finalSections: ZohoMilestoneMapped[] = [];
  sectionsMap.forEach(section => {
    if (section.tasks.length > 0) {
      const closedCount = section.tasks.filter(t => t.status === 'closed').length;
      const totalCount = section.tasks.length;
      section.completionPercent = Math.round((closedCount / totalCount) * 100);
      if (closedCount === totalCount) section.status = 'completed';
      else if (closedCount > 0 || section.tasks.some(t => t.status === 'inprogress')) section.status = 'inprogress';
      else section.status = 'notstarted';
      finalSections.push(section);
    } else if (milestones.some(m => m.id_string === section.id)) {
      // Include empty milestones only if no tasklists exist at all
      finalSections.push(section);
    }
  });

  // If we have sections with tasks, exclude empty milestones to keep UI clean
  const sectionsWithTasks = finalSections.filter(s => s.tasks.length > 0);
  const displayMilestones = sectionsWithTasks.length > 0 ? sectionsWithTasks : finalSections;

  return {
    id: project.id_string,
    name: decodeHtmlEntities(project.name ?? ''),
    description: project.description?.replace(/<[^>]+>/g, '') ?? '',
    status: project.status === 'active' ? 'active' : 'completed',
    owner: project.owner_name ?? '—',
    startDate: project.start_date ?? '—',
    endDate: project.end_date ?? '—',
    completionPercent: Number(project.project_percent ?? 0),
    openTasks: Number(project.task_count?.open ?? 0),
    closedTasks: Number(project.task_count?.closed ?? 0),
    isConnected: true,
    milestones: displayMilestones,
  };
}
