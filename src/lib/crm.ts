import 'server-only';

/**
 * Hand-off from the website's own `leads` table into the maiom-sales-engine CRM.
 *
 * The website is always the first writer: a quote request is stored locally and
 * only then pushed across. If the CRM is unreachable the lead is still captured
 * and the failure is recorded on the row, so nothing is lost to an outage.
 */

const CRM_BASE_URL = process.env.CRM_API_URL ?? '';
const CRM_API_KEY = process.env.CRM_API_KEY ?? '';
const CRM_INTAKE_PATH = process.env.CRM_INTAKE_PATH ?? '/api/v1/public/leads';
const CRM_TIMEOUT_MS = Number(process.env.CRM_TIMEOUT_MS ?? 8000);

/**
 * The CRM stores `industry` as a Prisma enum, so free text has to be mapped
 * onto it. Anything unrecognised becomes OTHER — the typed value still travels
 * in the requirement text, so no detail is lost.
 */
const INDUSTRY_MAP: Record<string, string> = {
  'information technology': 'INFORMATION_TECHNOLOGY',
  'technology': 'TECHNOLOGY',
  'healthcare': 'HEALTHCARE',
  'financial services': 'BANKING_AND_FINANCIAL_SERVICES',
  'banking': 'BANKING_AND_FINANCIAL_SERVICES',
  'finance': 'FINANCE',
  'insurance': 'INSURANCE',
  'retail & e-commerce': 'E_COMMERCE',
  'retail': 'RETAIL',
  'e-commerce': 'E_COMMERCE',
  'manufacturing': 'MANUFACTURING',
  'education': 'EDUCATION',
  'logistics & transportation': 'LOGISTICS_AND_TRANSPORTATION',
  'logistics': 'LOGISTICS',
  'media & entertainment': 'MEDIA_AND_ENTERTAINMENT',
  'media': 'MEDIA',
  'real estate': 'REAL_ESTATE',
  'government & public sector': 'GOVERNMENT',
  'government': 'GOVERNMENT',
  'telecom': 'TELECOM',
  'telecommunications': 'TELECOMMUNICATIONS',
  'energy': 'ENERGY',
  'energy and utilities': 'ENERGY_AND_UTILITIES',
  'hospitality': 'HOSPITALITY',
  'professional services': 'PROFESSIONAL_SERVICES',
};

export function toCrmIndustry(industry: string | null | undefined): string {
  if (!industry) return 'OTHER';
  return INDUSTRY_MAP[industry.trim().toLowerCase()] ?? 'OTHER';
}

export interface CrmLeadPayload {
  companyName: string;
  website: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  industry: string;
  leadSource: 'WEBSITE';
  customerRequirement: string | null;
  customerBudget: number | null;
  /** Free-text industry when it didn't map onto the enum. */
  industryLabel?: string | null;
  /** Package context, so sales opens the lead knowing what was configured. */
  planId?: string | null;
  selectedServices?: string | null;
}

export type CrmPushResult =
  | { ok: true; crmLeadId: string }
  | { ok: false; error: string };

export function isCrmConfigured(): boolean {
  return Boolean(CRM_BASE_URL && CRM_API_KEY);
}

export async function pushLeadToCrm(payload: CrmLeadPayload): Promise<CrmPushResult> {
  if (!isCrmConfigured()) {
    return { ok: false, error: 'CRM not configured (set CRM_API_URL and CRM_API_KEY)' };
  }

  const url = `${CRM_BASE_URL.replace(/\/$/, '')}${CRM_INTAKE_PATH}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Machine-to-machine credential; the intake route has no user session.
        'x-api-key': CRM_API_KEY,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: controller.signal,
    });

    const text = await res.text();
    if (!res.ok) {
      return { ok: false, error: `CRM responded ${res.status}: ${text.slice(0, 300)}` };
    }

    let crmLeadId = '';
    try {
      const json = JSON.parse(text);
      crmLeadId = json?.data?.leadId ?? json?.data?.id ?? json?.leadId ?? json?.id ?? '';
    } catch {
      /* a 2xx without parseable JSON still counts as delivered */
    }
    return { ok: true, crmLeadId };
  } catch (err) {
    const reason =
      err instanceof Error && err.name === 'AbortError'
        ? `CRM did not respond within ${CRM_TIMEOUT_MS}ms`
        : err instanceof Error
          ? err.message
          : 'Unknown CRM error';
    return { ok: false, error: reason };
  } finally {
    clearTimeout(timer);
  }
}
