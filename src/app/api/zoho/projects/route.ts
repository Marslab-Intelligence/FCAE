/**
 * GET /api/zoho/projects
 * The projects tagged with the logged-in client's email — never the whole
 * portal. Returning every project would expose all 29 client names, owners and
 * schedules to anyone with an account.
 */
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { findZohoProjectsByEmail } from '@/lib/zoho';
import type { ZohoProjectListItem } from '@/lib/zoho';

const PORTAL_ID = process.env.ZOHO_PORTAL_ID ?? 'marslab';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const raw = await findZohoProjectsByEmail(PORTAL_ID, user.email);

    const projects: ZohoProjectListItem[] = raw.map(p => ({
      id:                p.id_string,
      key:               p.key ?? '—',
      name:              p.name ?? '—',
      status:            p.status ?? 'active',
      owner:             p.owner_name ?? '—',
      completionPercent: Number(p.project_percent ?? 0),
      startDate:         p.start_date ?? '—',
      endDate:           p.end_date ?? '—',
    }));

    return NextResponse.json(projects, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (err) {
    console.error('[Zoho] projects list error:', err);
    return NextResponse.json({ error: 'Failed to fetch projects from Zoho.' }, { status: 502 });
  }
}
