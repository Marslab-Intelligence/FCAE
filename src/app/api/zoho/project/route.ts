/**
 * GET  /api/zoho/project   — the Zoho project assigned to the logged-in client
 * POST /api/zoho/project   — link a project by ID/key (still requires the email tag)
 *
 * Isolation rule: a project is served only when its client-email custom field in
 * Zoho contains the session user's exact email. The project id is never taken
 * from the request — it is resolved from the session on every call, and the
 * saved mapping is re-verified against Zoho each time so that untagging a
 * project in Zoho revokes dashboard access on the next poll.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db/client';
import { clientProjects } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import {
  getProjectList,
  getProjectSnapshot,
  findZohoProjectsByEmail,
  projectMatchesEmail,
} from '@/lib/zoho';
import type { ZohoRawProject } from '@/lib/zoho';

const PORTAL_ID = process.env.ZOHO_PORTAL_ID ?? 'marslab';

/** Never let a CDN or the browser cache a per-client, live payload. */
const LIVE_HEADERS = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

async function saveMapping(userId: string, projectId: string) {
  const [existing] = await db
    .select({ id: clientProjects.id })
    .from(clientProjects)
    .where(eq(clientProjects.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(clientProjects)
      .set({ zohoProjectId: projectId, zohoPortalId: PORTAL_ID, isActive: true })
      .where(eq(clientProjects.userId, userId));
  } else {
    await db.insert(clientProjects).values({
      id: randomUUID(),
      userId,
      zohoProjectId: projectId,
      zohoPortalId: PORTAL_ID,
      isActive: true,
    });
  }
}

/**
 * The project this user is entitled to, or null.
 *
 * A stored mapping is only a shortcut — it is still checked against the live
 * Zoho tag, so a mapping can never outlive the entitlement that created it.
 */
async function resolveEntitledProjectId(userId: string, email: string): Promise<string | null> {
  const matches = await findZohoProjectsByEmail(PORTAL_ID, email);
  const matchedIds = matches.map(p => p.id_string);

  const [mapping] = await db
    .select()
    .from(clientProjects)
    .where(eq(clientProjects.userId, userId))
    .limit(1);

  // Saved project still carries this client's email tag — keep using it.
  if (mapping?.isActive && matchedIds.includes(mapping.zohoProjectId)) {
    return mapping.zohoProjectId;
  }

  if (matchedIds.length === 0) {
    // Tag removed in Zoho (or never existed): drop the stale mapping so the
    // client stops seeing a project they are no longer assigned to.
    if (mapping) {
      await db
        .update(clientProjects)
        .set({ isActive: false })
        .where(eq(clientProjects.userId, userId))
        .catch(() => {});
    }
    return null;
  }

  const resolved = matchedIds[0];
  await saveMapping(userId, resolved).catch(() => {});
  return resolved;
}

// ── GET: the assigned project, polled live by the dashboard ───────────────────
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: LIVE_HEADERS });

  const force = req.nextUrl.searchParams.get('force') === '1';

  let projectId: string | null;
  try {
    projectId = await resolveEntitledProjectId(user.id, user.email);
  } catch (err) {
    console.error('[Zoho] entitlement lookup failed:', err);
    return NextResponse.json(
      { error: 'Could not reach Zoho Projects.' },
      { status: 502, headers: LIVE_HEADERS },
    );
  }

  if (!projectId) {
    return NextResponse.json(
      { error: 'NO_PROJECT', userEmail: user.email },
      { status: 404, headers: LIVE_HEADERS },
    );
  }

  try {
    const snapshot = await getProjectSnapshot(PORTAL_ID, projectId, force);
    if (!snapshot) {
      return NextResponse.json(
        { error: 'NO_PROJECT', userEmail: user.email },
        { status: 404, headers: LIVE_HEADERS },
      );
    }
    return NextResponse.json(snapshot, { headers: LIVE_HEADERS });
  } catch (err) {
    console.error('[Zoho] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch from Zoho Projects.' },
      { status: 502, headers: LIVE_HEADERS },
    );
  }
}

// ── POST: link by project ID or key — entitlement still enforced ──────────────
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: LIVE_HEADERS });

  const body = await req.json().catch(() => ({}));
  const input = String(body.projectId ?? '').trim();

  if (!input) {
    return NextResponse.json({ error: 'Project ID is required.' }, { status: 400, headers: LIVE_HEADERS });
  }

  let projects: ZohoRawProject[];
  try {
    projects = await getProjectList(PORTAL_ID);
  } catch {
    return NextResponse.json({ error: 'Could not connect to Zoho Projects.' }, { status: 502, headers: LIVE_HEADERS });
  }

  const target = projects.find(
    p =>
      p.id_string === input ||
      String(p.key ?? '').toLowerCase() === input.toLowerCase(),
  );

  if (!target) {
    return NextResponse.json(
      { error: `No project found for "${input}". Check the ID or key and try again.` },
      { status: 404, headers: LIVE_HEADERS },
    );
  }

  // The check that makes manual linking safe: without it, any signed-in client
  // could type another client's project key and read their roadmap.
  if (!projectMatchesEmail(target, user.email)) {
    console.warn(`[Zoho] ${user.email} attempted to link untagged project ${target.key}`);
    return NextResponse.json(
      {
        error:
          `Project "${target.key}" is not assigned to ${user.email}. ` +
          `Ask your SID project manager to add your email to that project in Zoho.`,
      },
      { status: 403, headers: LIVE_HEADERS },
    );
  }

  try {
    const snapshot = await getProjectSnapshot(PORTAL_ID, target.id_string, true);
    if (!snapshot) {
      return NextResponse.json({ error: 'Project could not be loaded from Zoho.' }, { status: 404, headers: LIVE_HEADERS });
    }
    await saveMapping(user.id, target.id_string);
    return NextResponse.json(snapshot, { headers: LIVE_HEADERS });
  } catch (err) {
    console.error('[Zoho] POST error:', err);
    return NextResponse.json({ error: 'Could not fetch project. Please try again.' }, { status: 502, headers: LIVE_HEADERS });
  }
}
