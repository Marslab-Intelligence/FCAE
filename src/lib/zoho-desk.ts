import 'server-only';
import { resolveRoutedDepartment } from '@/lib/ticket-taxonomy';

/**
 * Ticket hand-off to Zoho Desk.
 *
 * Desk is a different product from Zoho Projects and needs its own OAuth grant
 * (Desk.tickets.CREATE), organisation id and per-department ids. Until those
 * are configured this stays inert — tickets are still captured locally and can
 * be replayed once credentials exist.
 */

const BASE_URL = process.env.ZOHO_DESK_API_URL ?? `https://desk.zoho.${process.env.ZOHO_REGION ?? 'in'}`;
const ORG_ID = process.env.ZOHO_DESK_ORG_ID ?? '';
const CLIENT_ID = process.env.ZOHO_DESK_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.ZOHO_DESK_CLIENT_SECRET ?? '';
const REFRESH_TOKEN = process.env.ZOHO_DESK_REFRESH_TOKEN ?? '';
const TIMEOUT_MS = Number(process.env.ZOHO_DESK_TIMEOUT_MS ?? 10000);

/** Maps a taxonomy department name onto its Zoho Desk ids. */
function deskIdsFor(department: string): { departmentId: string; layoutId: string | null } | null {
  const read = (raw: string | undefined) => {
    try {
      return JSON.parse(raw ?? '{}') as Record<string, string>;
    } catch {
      return {};
    }
  };
  const departmentId = read(process.env.ZOHO_DESK_DEPARTMENT_IDS)[department];
  if (!departmentId) return null;
  // layoutId is mandatory on this org's ticket layouts.
  return { departmentId, layoutId: read(process.env.ZOHO_DESK_LAYOUT_IDS)[department] ?? null };
}

export function isZohoDeskConfigured(): boolean {
  return Boolean(ORG_ID && CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN);
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const res = await fetch(`https://accounts.zoho.${process.env.ZOHO_REGION ?? 'in'}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: REFRESH_TOKEN, client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET, grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Desk token refresh failed: ${JSON.stringify(data).slice(0, 200)}`);
  cachedToken = data.access_token as string;
  tokenExpiry = Date.now() + 55 * 60 * 1000;
  return cachedToken;
}

export interface DeskTicketInput {
  department: string;
  requestType: string;
  category: string;
  subCategory: string | null;
  taskName: string | null;
  requirements: string;
  subject: string;
  description: string | null;
  contactEmail: string;
  contactName: string;
  onBehalfOfCustomer?: boolean;
  agentName?: string | null;
  agentEmail?: string | null;
}

export type DeskResult =
  | { ok: true; ticketId: string; ticketNumber: string | null }
  | { ok: false; error: string };

export async function createZohoDeskTicket(input: DeskTicketInput): Promise<DeskResult> {
  if (!isZohoDeskConfigured()) return { ok: false, error: 'Zoho Desk is not configured' };

  // A pending department has no queue of its own, so the ticket is created in
  // its fallback. The originating department is recorded on the ticket so the
  // receiving team can see where it came from.
  const routedTo = resolveRoutedDepartment(input.department);
  const isRerouted = routedTo !== input.department;

  const ids = deskIdsFor(routedTo);
  if (!ids) return { ok: false, error: `No Zoho Desk department id mapped for "${routedTo}"` };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const token = await getAccessToken();
    // Custom-field API names taken from the Desk layout metadata, so the
    // picklists land in the real fields rather than as text in the description.
    const body = {
      subject: isRerouted ? `[${input.department}] ${input.subject}` : input.subject,
      departmentId: ids.departmentId,
      ...(ids.layoutId ? { layoutId: ids.layoutId } : {}),
      description: isRerouted
        ? `Raised under ${input.department} (queue not yet live — routed to ${routedTo}).\n\n${input.description ?? ''}`.trim()
        : input.description ?? '',
      contact: { email: input.contactEmail, lastName: input.contactName },
      channel: 'Web',
      cf: {
        cf_request_type: input.requestType,
        cf_ticket_category: input.category,
        cf_ticket_sub_category: input.subCategory ?? undefined,
        cf_requirements: input.requirements,
        cf_submitting_ticket_on_behalf_of_customer: String(input.onBehalfOfCustomer ?? false),
        ...(input.taskName ? { cf_task_name: input.taskName } : {}),
        ...(input.onBehalfOfCustomer
          ? { cf_by_agent_name: input.agentName ?? '', cf_agent_email: input.agentEmail ?? '' }
          : {}),
      },
    };

    const res = await fetch(`${BASE_URL}/api/v1/tickets`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        orgId: ORG_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    });

    const text = await res.text();
    if (!res.ok) return { ok: false, error: `Desk responded ${res.status}: ${text.slice(0, 300)}` };

    const json = JSON.parse(text);
    return { ok: true, ticketId: String(json.id ?? ''), ticketNumber: json.ticketNumber ?? null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error && err.name === 'AbortError'
        ? `Zoho Desk did not respond within ${TIMEOUT_MS}ms`
        : err instanceof Error ? err.message : 'Unknown Desk error',
    };
  } finally {
    clearTimeout(timer);
  }
}

export interface DeskTicketStatus {
  ticketNumber: string;
  status: string;
  /** Desk's coarse bucket: Open / On Hold / Closed. */
  statusType: string | null;
  closedTime: string | null;
  webUrl: string | null;
}

/**
 * Live status for tickets we already created. Read-only and best-effort — if
 * Desk is unreachable the dashboard still lists what was raised, just without
 * an up-to-date status.
 */
export async function fetchDeskTicketStatuses(
  ticketIds: string[],
): Promise<Record<string, DeskTicketStatus>> {
  if (!isZohoDeskConfigured() || ticketIds.length === 0) return {};

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const token = await getAccessToken();
    const results = await Promise.all(
      ticketIds.map(async (id) => {
        try {
          const res = await fetch(`${BASE_URL}/api/v1/tickets/${id}`, {
            headers: { Authorization: `Zoho-oauthtoken ${token}`, orgId: ORG_ID },
            cache: 'no-store',
            signal: controller.signal,
          });
          if (!res.ok) return null;
          const t = await res.json();
          return [
            id,
            {
              ticketNumber: String(t.ticketNumber ?? ''),
              status: String(t.status ?? ''),
              statusType: t.statusType ?? null,
              closedTime: t.closedTime ?? null,
              webUrl: t.webUrl ?? null,
            } satisfies DeskTicketStatus,
          ] as const;
        } catch {
          return null;
        }
      }),
    );
    return Object.fromEntries(results.filter(Boolean) as [string, DeskTicketStatus][]);
  } catch {
    return {};
  } finally {
    clearTimeout(timer);
  }
}
