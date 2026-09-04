/**
 * Engineering case studies for the Blog & Resources page.
 *
 * Every fact here traces back to a source document per project — either a
 * code-first teardown of the actual repository, or (for FCAE CORE) the
 * product's own functional integration overview. No metric is invented:
 * where a source document explicitly says a number is unverified/inferred,
 * this file omits it rather than presenting it as fact.
 */

export type CaseStudyStatus =
  | 'Production'
  | 'In active development'
  | 'Under release validation';

export interface CaseStudyStat {
  label: string;
  value: string;
}

export interface CaseStudyFeature {
  title: string;
  body: string;
}

export interface CaseStudyDecision {
  title: string;
  reason: string;
  benefit: string;
  tradeoff: string;
}

export interface CaseStudyUser {
  role: string;
  need: string;
}

export interface CaseStudyResource {
  label: string;
  description: string;
  href?: string;
  external?: boolean;
}

export interface CaseStudyAccent {
  hex: string;
  text: string;
  border: string;
  bg: string;
  glow: string;
}

export interface CaseStudy {
  slug: string;
  index: string;
  name: string;
  category: string;
  status: CaseStudyStatus;
  tagline: string;
  accent: CaseStudyAccent;
  stats: CaseStudyStat[];
  summary: string;
  problem: string[];
  users: CaseStudyUser[];
  features: CaseStudyFeature[];
  stack: { layer: string; tech: string }[];
  decisions: CaseStudyDecision[];
  resources: CaseStudyResource[];
}

const accents: Record<string, CaseStudyAccent> = {
  blue: { hex: '#60a5fa', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10', glow: 'rgba(96,165,250,0.35)' },
  emerald: { hex: '#34d399', text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', glow: 'rgba(52,211,153,0.35)' },
  amber: { hex: '#fbbf24', text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', glow: 'rgba(251,191,36,0.35)' },
  purple: { hex: '#c084fc', text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', glow: 'rgba(192,132,252,0.35)' },
};

export const caseStudies: CaseStudy[] = [
  {
    slug: 'dpaas',
    index: '01',
    name: 'DPaaS',
    category: 'AI Content & SEO Platform',
    status: 'In active development',
    tagline: 'One dashboard, replacing the six tools an agency juggles per client, every month.',
    accent: accents.blue,
    stats: [
      { label: 'Backend modules', value: '22' },
      { label: 'Prisma data models', value: '60+' },
      { label: 'AI pipeline stages', value: '3' },
      { label: 'E2E test specs', value: '17' },
    ],
    summary:
      'DPaaS is a multi-tenant NestJS/Next.js SaaS platform that lets digital marketing agencies run SEO audits, sync Google Analytics/Search Console data, generate AI blog and social content, publish to WordPress and social platforms, and produce client-facing PDF reports — all from one dashboard, with a human-approval gate in front of everything the AI drafts.',
    problem: [
      'An agency servicing N clients needs, per client, per month: manual GA4/GSC pulls, a manual SEO crawl, a content calendar in a spreadsheet, blog posts written or outsourced, social posts scheduled across three-plus platforms, and a client report assembled by hand.',
      'That work is billed as "SEO management," but margins shrink as client count grows because most of it is manual data-gathering. Staff context-switch across five-plus tools with no single source of truth on a client\'s SEO health, and per-client Google OAuth setup does not scale. Ungoverned AI use — pasting into a chat tool — leaves no audit trail of cost, model, or accuracy. And when a 2am sync job fails, there is nothing to page on and nothing to point to when a client asks what happened.',
    ],
    users: [
      { role: 'SUPER_ADMIN', need: 'Full administrative control across every tenant on the platform.' },
      { role: 'AGENCY_MANAGER', need: 'Manages clients and websites, triggers syncs and audits, generates and approves AI content, connects accounts, and generates reports.' },
      { role: 'CLIENT_USER', need: 'Read-only visibility into dashboards, reports, and analytics scoped to their own organization.' },
    ],
    features: [
      { title: 'Central Google OAuth integration', body: 'One DPaaS-owned OAuth app connects to every client\'s GA4/Search Console account, with tokens encrypted at rest — removing per-client Cloud project setup entirely.' },
      { title: 'Parallel GA4 & Search Console sync', body: 'Six GA4 reports pulled concurrently, plus Search Console clicks/impressions/CTR/position by query and page — turning raw API calls into fast, queryable local data.' },
      { title: 'SEO audit engine', body: 'A crawler evaluates titles, links, images, and LCP, classifying issues by severity — automating audits agencies otherwise bill hourly.' },
      { title: 'AI content generation, checked by code that never trusts the model', body: 'An LLM drafts a structured brief and article against a JSON schema; thirteen deterministic, rule-based checks — independent of the model — grade the output before a human ever sees it.' },
      { title: 'WordPress publishing & social scheduling', body: 'Closes the loop from AI draft to a live post via the WordPress REST API, plus AI-generated social images/video scheduled across Facebook, Instagram, LinkedIn, and Google Business Profile.' },
      { title: 'Snapshot-based executive PDF reporting', body: 'Seven report types across fifteen KPIs, rendered from already-collected data — no live API calls at render time, so the web preview always matches the exported PDF.' },
    ],
    stack: [
      { layer: 'Frontend', tech: 'Next.js 14 (App Router), React 18, TanStack Query, Tailwind CSS, Framer Motion' },
      { layer: 'Backend', tech: 'NestJS 10 on Node.js, strict TypeScript across the monorepo' },
      { layer: 'Data', tech: 'PostgreSQL 16 via Prisma 7, a 12-domain schema of 60+ models across 17 migrations' },
      { layer: 'Async work', tech: 'Redis + BullMQ for AI media generation jobs' },
      { layer: 'AI / ML', tech: 'NVIDIA hosted text LLM, FLUX.1 image generation, Cosmos video' },
      { layer: 'Automation', tech: 'n8n as a cron/webhook orchestrator carrying zero business logic of its own' },
      { layer: 'Testing', tech: 'Jest (50 unit specs) and Playwright (17 E2E specs)' },
    ],
    decisions: [
      {
        title: 'The frontend never talks to a third party directly',
        reason: 'Prevent API secrets — Google, NVIDIA, WordPress — from ever reaching the browser.',
        benefit: 'Strong secret isolation: every external call funnels through one audited surface.',
        tradeoff: 'All external latency now funnels through the API tier, with no way for the client to bypass it.',
      },
      {
        title: 'Deterministic QA lives outside the LLM',
        reason: 'A language model\'s own self-assessment is not reproducible or independently verifiable.',
        benefit: 'AI output is auditable by code that never drifts with the model, rather than being a black box.',
        tradeoff: 'Rule-based checks catch structural problems, not factual accuracy — human review still covers that.',
      },
      {
        title: 'Database-level compare-and-swap on publish status',
        reason: 'Concurrent retries from the automation layer could otherwise publish the same post twice.',
        benefit: 'No external post is ever created twice, and no external locking service is needed.',
        tradeoff: 'Requires a disciplined status-machine model enforced consistently across every publish path.',
      },
    ],
    resources: [
      { label: 'Full code-first teardown', description: '24-section technical analysis of the actual DPaaS repository — architecture, data model, security posture, and the finished blog draft this case study is based on.', href: 'https://claude.ai/code/artifact/63c7c5ad-fdb2-4e39-b1e3-094c9999ed6b', external: true },
    ],
  },
  {
    slug: 'renewalpro',
    index: '02',
    name: 'RenewalPro',
    category: 'Internal Revenue-Protection System',
    status: 'Production',
    tagline: 'Every resold contract on a machine-enforced reminder ladder — with an AI agent that drafts outreach a human still has to approve.',
    accent: accents.emerald,
    stats: [
      { label: 'Reminder checkpoints', value: '30/20/15/10/5/3/0d' },
      { label: 'Contract ledger columns', value: '≈60' },
      { label: 'Independent safety vetoes', value: '9' },
      { label: 'Agent LLM', value: 'Gemini 2.5 Flash' },
    ],
    summary:
      'RenewalPro (internal codename RMT) is MarsLab\'s own operations system for keeping resold software and service contracts — Google Workspace, Microsoft 365, SSL certificates, storage, security suites — from expiring unnoticed. Every renewal record carries two prices: what MarsLab pays the vendor, and what the client pays MarsLab. The margin between them is the business, and RenewalPro\'s job is to stop that margin leaking through a silently-lapsed contract.',
    problem: [
      'MarsLab\'s revenue is a spread on someone else\'s subscription, and that spread only exists while the contract is active. The moment a renewal lapses without anyone noticing, the resale margin — and often the client relationship — is gone. It is the same "who\'s tracking the spreadsheet" failure every reseller hits once it outgrows a handful of accounts: no forcing function to follow up at 30/15/5 days out, no record of why a deal was lost, and invoice status living as a separate, easily desynced fact from payment status.',
      'Before RenewalPro, follow-up ran on a shared spreadsheet and memory, invoice and payment status were manually reconciled against Zoho Books, and there was no consistent record of why a renewal was lost. After: every contract carries a machine-enforced reminder ladder, a locked edit-approval workflow prevents silent field changes, an expired record forces a mandatory reason before a rep can move on, and — the newest layer — a daily risk-scored sweep flags accounts before they go quiet.',
    ],
    users: [
      { role: 'Sales / CST rep', need: 'Know what\'s expiring in their book of accounts, log field visits, never miss a follow-up.' },
      { role: 'Admin / ops lead', need: 'See the whole portfolio, approve risky edits, audit who did what and when.' },
      { role: 'Finance-adjacent admin', need: 'Trustworthy profit and payment numbers reconciled against Zoho Books.' },
      { role: 'Approval Inbox reviewer', need: 'Decide, per drafted message, whether an AI-proposed action is safe to send.' },
    ],
    features: [
      { title: 'The reminder ladder', body: 'Emails the client and CCs sales at exactly 30/20/15/10/5/3/0 days out, tracked per-contract with seven independent sent-flags so nothing double-fires. The core anti-leak mechanism the whole product exists for.' },
      { title: 'Locked-record edit approval', body: 'Sales cannot freely edit a locked record — they file a reason via a request-edit flow, and an admin approves it in-app or by emailed link. Forces accountability on financially sensitive changes.' },
      { title: 'Mandatory expiry reason', body: 'A floating widget nags a rep every 60 seconds until an expired-without-reason record is explained, converting silent churn into a searchable reason code.' },
      { title: 'Zoho Books invoice sync', body: 'An inbound webhook matches an invoice to a renewal via a custom "RMT ID" field and writes invoice number, value, date, and a derived payment state — removing a manual reconciliation step.' },
      { title: 'Daily AI risk sweep with an Approval Inbox', body: 'A deterministic risk scorer (no LLM) flags at-risk accounts; Gemini drafts outreach; nine independent, code-level vetoes run before a human ever sees the draft in an approval queue.' },
      { title: 'Field-visit GPS tracking', body: 'Start/check-in/check-out with a live breadcrumb trail and arrival-distance verification against the client\'s stored coordinates.' },
    ],
    stack: [
      { layer: 'Frontend', tech: 'React 18.3 + Vite 6, Tailwind 3.4, Recharts, Framer Motion, three.js' },
      { layer: 'Backend', tech: 'Node 20, Express 4, ESM — a single process serves both the SPA and the API' },
      { layer: 'Data', tech: 'PostgreSQL via the pg driver — no ORM, hand-written idempotent DDL that self-migrates on boot' },
      { layer: 'Auth', tech: 'Zoho OAuth as the sole login path, JWT access token + HttpOnly refresh cookie' },
      { layer: 'AI agent', tech: 'Google Gemini 2.5 Flash via one funnel client every agent module calls through' },
      { layer: 'Messaging', tech: 'nodemailer (SMTP), Zoho Cliq webhooks, in-process Server-Sent Events for live table pushes' },
      { layer: 'Infra', tech: 'Docker multi-stage build, AWS ECR → EC2 → k3s' },
    ],
    decisions: [
      {
        title: 'The agent proposes; it never mutates money, invoices, or ladder flags on its own',
        reason: 'An LLM drafting a client-facing email, unsupervised, is a reputational and financial risk surface.',
        benefit: 'A hard, code-enforced boundary: the natural-language editor blocks any edit touching cost, invoice, payment, or ladder fields by regex before the model is even asked, and every drafted message must clear an independent safety gate before a human sees it.',
        tradeoff: 'Real friction for the sales user — the chat cannot do the one thing most tempting to ask it for.',
      },
      {
        title: 'The model never writes SQL, ever',
        reason: 'A free-text "answer anything" feature backed by a bare LLM-to-SQL pipeline is a classic injection and data-exfiltration surface.',
        benefit: 'Gemini only emits a JSON query specification — column, operator, value — which a query engine compiles against a hardcoded allow-list and appends row-level scoping to, after the model\'s clauses, unconditionally.',
        tradeoff: 'The agent can only ever answer questions about the single renewals table — a deliberate scope cut.',
      },
      {
        title: 'Fail-closed on the LLM, not fail-open',
        reason: 'A missing API key or exhausted quota should not crash the nightly sweep or silently do something worse.',
        benefit: 'Every Gemini-calling function returns a structured failure instead of throwing, and the daily sweep falls back to deterministic, rules-based template text.',
        tradeoff: 'A hardcoded free-tier request ceiling means the agent quietly degrades to templated prose for the rest of most days.',
      },
    ],
    resources: [
      { label: 'Full field notes', description: 'A ground-up, evidence-tagged read of the RenewalPro repository — architecture, data model, the agent\'s safety layer, and the finished blog draft this case study is based on.', href: 'https://claude.ai/code/artifact/0bd76237-8545-4bf6-968c-0689d6bd784c', external: true },
    ],
  },
  {
    slug: 'ocr-smart-scan',
    index: '03',
    name: 'OCR Smart Scan',
    category: 'Document Intelligence Platform',
    status: 'Production',
    tagline: 'From an unopened attachment to a validated, posted invoice — with a full audit trail behind every field.',
    accent: accents.amber,
    stats: [
      { label: 'Ingestion channels', value: '6' },
      { label: 'Pipeline stages', value: '6' },
      { label: 'Reasoning models raced per document', value: '4' },
      { label: 'Fallback rungs before human review', value: '5' },
    ],
    summary:
      'OCR Smart Scan is the platform that turns finance documents built for human eyes into structured data software can post. Invoices arrive from five or six unconnected channels — a shared mailbox, an FTP drop, a SharePoint folder, a scanner, sometimes still paper — and today a person becomes the router, retyping roughly fourteen fields per document by hand. OCR Smart Scan converges every channel into one queue, extracts exactly the fields finance posts, verifies them against the page itself, and hands off only what a human doesn\'t need to touch.',
    problem: [
      'Ask an accounts-payable team where their invoices come from and you get five different answers, because none of those channels talk to each other. A person opens each file, reads roughly fourteen fields off it, and types them into the ERP — invoice number, date, supplier, GSTIN, place of supply, taxable value, tax, total. At month-end they do it faster, which is where the errors come from.',
      'The cost is rarely the typing — it\'s everything downstream of a digit typed wrong. A transposed tax figure becomes a reconciliation failure next quarter. A misread GSTIN — an I for a 1, an O for a 0 on a faxed scan — becomes a blocked input-tax credit claim and a phone call to the supplier. A duplicate invoice paid twice becomes a recovery process. And because nothing is tracked, the honest answer to "did you get my invoice?" is usually "let me check."',
    ],
    users: [
      { role: 'Finance / accounts-payable team', need: 'Stop manually re-keying fourteen fields per invoice across five unconnected inboxes.' },
      { role: 'Security & compliance', need: 'Trust that an arbitrary inbound file has been validated — not just parsed — before it touches anything downstream, and that PII is flagged automatically.' },
      { role: 'Operations / finance lead', need: 'See exactly where a document is in the pipeline, and encode the same low-risk approval decision once instead of remaking it by hand every time.' },
    ],
    features: [
      { title: 'Six ingestion channels, one queue', body: 'Direct upload, IMAP mailbox, FTP poller, OneDrive, SharePoint, and a REST API all converge on a single processing queue, each tagged with its source so provenance survives into the audit log.' },
      { title: 'A security gate ahead of the engine', body: 'Extension whitelist, magic-byte matching, PDF structure inspection, ClamAV antivirus, and SHA-256 dedup — every inbound file is validated before it reaches the parser, not after.' },
      { title: 'Routing as a cost decision', body: 'Cheap, network-free computer-vision heuristics (blur variance, contrast, table detection) run before any model call, sending clean documents down a sub-100ms path and only routing degraded or complex ones to the AI pipeline.' },
      { title: 'Transcribe, reason, then look again', body: 'A document-parsing model transcribes the page; several reasoning models race to map it into a strict JSON schema within a bounded deadline; a vision model then checks the structured result back against the actual page image — the stage that catches a confident, plausible, wrong answer.' },
      { title: 'GSTIN checksum self-correction', body: 'When OCR returns a tax ID that fails its checksum, the platform tries the handful of substitutions scanners actually make (O↔0, I↔1, S↔5, B↔8) and accepts only a variant that both validates and is supported by the document text — a field that would otherwise be a human exception resolving itself.' },
      { title: 'A rules engine that encodes judgment once', body: 'Conditions combine across document type, confidence, vendor, and amount to auto-approve, tag, or flag a document — so human attention concentrates on the minority of documents that genuinely need it.' },
    ],
    stack: [
      { layer: 'Interface', tech: 'React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI, shadcn/ui, Framer Motion' },
      { layer: 'Visualisation', tech: 'Spline and Three.js — a 3D pipeline assistant that reflects the live processing stage' },
      { layer: 'API', tech: 'Python 3.12, FastAPI, Uvicorn, Pydantic, WebSockets for live per-document status' },
      { layer: 'Vision & OCR', tech: 'NVIDIA NIM hosted models, Tesseract, OpenCV, Pillow, pypdf, pdf2image' },
      { layer: 'Data', tech: 'PostgreSQL 16, SQLAlchemy 2.0' },
      { layer: 'Async work', tech: 'Celery + Redis, with separate concurrency caps for hosted-model calls and local CPU-bound OCR' },
      { layer: 'Security', tech: 'ClamAV, JWT, Authentik or Azure AD (OIDC), magic-byte validation' },
      { layer: 'Delivery', tech: 'Docker Compose, k3s, GitHub Actions, AWS ECR, OIDC deploy auth' },
    ],
    decisions: [
      {
        title: 'Not every document deserves a large model',
        reason: 'Vision-language model calls carry real latency and cost; most documents don\'t need one.',
        benefit: 'A classifier that costs almost nothing — no network call — decides everything downstream: clean receipts take a sub-100ms path, degraded or complex documents go to the AI pipeline where accuracy is worth the latency.',
        tradeoff: 'The classification step has to be conservative enough to catch documents that only look simple.',
      },
      {
        title: 'Racing several models beats picking one upfront',
        reason: 'Model selection is usually a fixed configuration decision; some layouts are genuinely harder than others.',
        benefit: 'Several models start side by side against a bounded deadline, and the platform takes the first complete answer — small fast models usually win, and a larger one steps in when a layout is genuinely hard.',
        tradeoff: 'Running several models concurrently costs more per document than committing to one.',
      },
      {
        title: 'Visual verification exists because a confident wrong answer is the real failure mode',
        reason: 'A language model reasoning over a transcript can produce a number that reads correctly but isn\'t on the page.',
        benefit: 'Sending the structured result back to a vision model, together with the page image, catches the plausible hallucination before it reaches a human or an ERP.',
        tradeoff: 'A third model call per document, on top of transcription and reasoning.',
      },
    ],
    resources: [
      { label: 'Extraction result shape', description: 'The exact JSON contract returned to the application per document — status, classification, extracted fields, and PII findings.', external: false },
      { label: 'The five-rung fallback ladder', description: 'What happens, in order, when the primary strategy fails: retry with the alternate strategy, hard fallback to Tesseract, then a clean handoff to human review rather than a silently half-filled record.', external: false },
    ],
  },
  {
    slug: 'fcae-core',
    index: '04',
    name: 'FCAE CORE',
    category: 'Observability & Incident Intelligence Module',
    status: 'Under release validation',
    tagline: 'A pluggable monitoring and incident-intelligence module any platform can embed — monitoring truth, not a synthetic stand-in for it.',
    accent: accents.purple,
    stats: [
      { label: 'Functional modules', value: '13' },
      { label: 'Integration patterns', value: '4' },
      { label: 'Scope levels enforced', value: '5' },
      { label: 'Fabricated telemetry tolerated', value: '0' },
    ],
    summary:
      'FCAE CORE is a centralized observability, monitoring, incident-intelligence, and operational-visibility module designed to be integrated into a parent enterprise application, management portal, or operations platform — rather than rebuilt separately inside every product that needs it. It gives operators one trustworthy view across infrastructure, Linux and Windows systems, services, containers, databases, logs, alerts, incidents, and certificate state, while the parent application keeps ownership of its own business workflows and user experience.',
    problem: [
      'Every product that needs operational visibility ends up building its own monitoring, health, alerting, investigation, and incident stack — per customer environment, from scratch. That work is rarely a product\'s actual differentiator, and it\'s the same correlation problem every time: metrics, service states, logs, alerts, and incidents live in separate places, so troubleshooting means manually stitching them back together under pressure.',
      'FCAE CORE\'s starting principle is direct: when data is available, show the authoritative measured value; when it is unavailable, stale, unsupported, or not configured, say so explicitly rather than presenting a synthetic value. Missing data is never treated as zero. A genuine measured zero stays zero. Stale data is never labelled live. An offline resource is never labelled healthy. That distinction matters most exactly when it\'s embedded into someone else\'s product, because operational decisions, incident response, and customer communication end up depending on whatever state is displayed.',
    ],
    users: [
      { role: 'Platform Administrator', need: 'Full oversight across every client and environment the module is monitoring.' },
      { role: 'Client / Environment Administrator', need: 'Manage monitoring scope and configuration within their own authorized boundary.' },
      { role: 'Operator, Editor, Viewer', need: 'Move from a high-level health view to a scoped investigation without combining separate tools by hand.' },
      { role: 'The parent application itself', need: 'Own its business workflows and UX while consuming monitoring truth through an agreed integration boundary — the primary architectural "user" of the module.' },
    ],
    features: [
      { title: 'Fleet & resource monitoring', body: 'Shows every monitored resource\'s liveness/freshness, operating-system identity, environment context, and health state.' },
      { title: 'Linux & Windows server monitoring', body: 'CPU, memory, disk, filesystems, network, processes, services, uptime, and supported history for both operating systems.' },
      { title: 'Kubernetes & containers', body: 'Visibility into clusters, nodes, pods, workloads, storage, events, readiness, and restarts where available.' },
      { title: 'Database, web & application server monitoring', body: 'Availability plus supported session, performance, transaction, lock/wait, replication, and capacity indicators; site/pool/worker and request-level health for web and application servers.' },
      { title: 'Alert & incident management', body: 'Rule-based detection with severity and affected-resource linkage, plus incident records carrying timelines, related evidence, investigation context, and resolution history.' },
      { title: 'Certificate monitoring', body: 'Tracks supported certificate inventory, validity, expiry, and warning/critical state, so a certificate risk surfaces before it becomes an outage.' },
    ],
    stack: [
      { layer: 'Integration model', tech: 'Embedded monitoring views, data/API integration, event-driven integration, and contextual navigation into a pre-scoped investigation view — usable independently or combined' },
      { layer: 'Scope model', tech: 'Platform → Client → Environment/Cluster → Resources → Users, with authorized client/environment scope preserved through every navigation and data-access path' },
      { layer: 'In active build-out', tech: 'Distributed tracing & APM, Security/SIEM correlation, Synthetics, Real User Monitoring & session replay, and evidence-grounded AI incident intelligence' },
    ],
    decisions: [
      {
        title: 'The Data Truth Principle is enforced everywhere, not just documented',
        reason: 'A parent application\'s incident response, alerting, and customer communication all end up depending on whatever state FCAE CORE displays.',
        benefit: 'An upstream failure is never silently replaced by a sample or fabricated value — the module reports "unknown" or "stale" rather than guessing, so the parent application can trust both a value and its state.',
        tradeoff: 'Conservative status labelling — capabilities are marked partially available rather than claimed as finished, even where the underlying telemetry already works.',
      },
      {
        title: 'Four integration patterns instead of one fixed embed',
        reason: 'How much user experience a parent application wants to own varies a great deal by product.',
        benefit: 'A consuming team can embed full monitoring screens, consume structured outputs to build its own views, subscribe to state-change events, or simply deep-link into a pre-scoped investigation — independently or in combination.',
        tradeoff: 'More integration surface area to document and keep contractually stable across four distinct patterns.',
      },
      {
        title: 'AI capabilities stay advisory, with human approval as the default',
        reason: 'Evidence-grounded investigation assistance is only trustworthy if it can\'t take unsupervised action.',
        benefit: 'FCAE CORE does not perform uncontrolled destructive production changes — recommendations and summaries are offered, but remediation still runs through a human.',
        tradeoff: 'Slower time-to-resolution than a fully autonomous remediation loop would offer, by design.',
      },
    ],
    resources: [
      { label: 'Functional status matrix', description: 'Every module\'s current integration maturity — PARTIALLY AVAILABLE, IN PROGRESS, or PLANNED — read directly off the product\'s own functional integration overview.', external: false },
    ],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

/** OCR Smart Scan resource: the five-rung fallback ladder from "Designed to degrade". */
export const ocrFallbackLadder: { rung: number; description: string; mode: 'AUTOMATIC' | 'HUMAN' }[] = [
  { rung: 1, description: 'Selected strategy runs — full three-stage pipeline, or the fast path as routed.', mode: 'AUTOMATIC' },
  { rung: 2, description: 'Primary failed — the other strategy is attempted in its place.', mode: 'AUTOMATIC' },
  { rung: 3, description: 'Both failed — hard fallback to Tesseract + heuristic field extraction.', mode: 'AUTOMATIC' },
  { rung: 4, description: 'Text extracted, required fields incomplete — status: requires_human_review.', mode: 'HUMAN' },
  { rung: 5, description: 'Nothing readable — record persists with the error, queued for reprocessing.', mode: 'HUMAN' },
];

/** OCR Smart Scan resource: the extraction result shape returned to the application. */
export const ocrExtractionSample = `{
  "status": "ready_for_cft",
  "extraction_method": "AI Native Text Reasoning + Vision Verify (Parallel)",
  "strategy_used": "ai_3_stage_pipeline",
  "classification": {
    "document_type": "invoice",
    "image_quality": "high",
    "confidence": 0.91
  },
  "extracted_data": {
    "invoice_number": "MSL/24-25/0918",
    "invoice_date": "2025-08-18",
    "vendor_name": "Northline Freight",
    "client_gstin": "29AABCN2377H1ZQ",
    "taxable_amount": "184500.00",
    "tax_amount": "33210.00",
    "total_amount": "217710.00"
  },
  "pii": {
    "detected": true,
    "findings": { "phone": { "count": 2 } },
    "compliance_tags": ["GDPR"]
  }
}`;

/** FCAE CORE resource: the functional status matrix, from the product's own integration overview. */
export const fcaeCoreStatusMatrix: { capability: string; status: 'PARTIALLY AVAILABLE' | 'IN PROGRESS' | 'PLANNED'; value: string }[] = [
  { capability: 'Overview Dashboard', status: 'PARTIALLY AVAILABLE', value: 'Parent-level operational summary.' },
  { capability: 'Fleet & Resource Monitoring', status: 'PARTIALLY AVAILABLE', value: 'Estate visibility and resource navigation.' },
  { capability: 'Linux Server Monitoring', status: 'PARTIALLY AVAILABLE', value: 'Linux infrastructure troubleshooting.' },
  { capability: 'Windows Server Monitoring', status: 'PARTIALLY AVAILABLE', value: 'Windows infrastructure troubleshooting.' },
  { capability: 'Kubernetes & Containers', status: 'PARTIALLY AVAILABLE', value: 'Container and orchestration operations.' },
  { capability: 'Database Monitoring', status: 'PARTIALLY AVAILABLE', value: 'Database health and bottleneck investigation.' },
  { capability: 'Web & Application Servers', status: 'PARTIALLY AVAILABLE', value: 'Web/application runtime investigation.' },
  { capability: 'Operational Logs', status: 'PARTIALLY AVAILABLE', value: 'Evidence during operational investigation.' },
  { capability: 'Alert Management', status: 'PARTIALLY AVAILABLE', value: 'Proactive detection and triage.' },
  { capability: 'Incident Management', status: 'PARTIALLY AVAILABLE', value: 'Standard investigation and resolution record.' },
  { capability: 'Notifications & Routing', status: 'PARTIALLY AVAILABLE', value: 'External operational workflow connectivity.' },
  { capability: 'Certificate Monitoring', status: 'PARTIALLY AVAILABLE', value: 'Expiry-risk governance.' },
  { capability: 'Traces & APM', status: 'IN PROGRESS', value: 'Transaction latency and dependency analysis.' },
  { capability: 'Security / SIEM', status: 'IN PROGRESS', value: 'Security and operational evidence correlation.' },
  { capability: 'AI & Incident Intelligence', status: 'IN PROGRESS', value: 'Evidence-based diagnosis and reporting.' },
  { capability: 'Synthetics', status: 'PLANNED', value: 'Outside-in availability assurance.' },
  { capability: 'RUM & Session Replay', status: 'PLANNED', value: 'Real-user experience investigation.' },
];
