import { pgTable, pgEnum, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { randomUUID } from 'node:crypto';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password'),
  googleId: text('google_id').unique(),
  name: text('name'),
  // A boolean column rather than a derived `exists(orders where status='paid')`
  // query: the maiom-sales-engine "deal won" webhook (see
  // src/app/api/crm/deal-won/route.ts) needs to be able to flip a user to a
  // client directly, without necessarily having an order row to point at yet
  // (e.g. an offline/manual payment the CRM records before FCAE checkout is
  // used at all). A derived-from-orders query can't represent that case.
  // When a real order *is* paid, its handler should set this too, so orders
  // stay the source of truth for "what/when" and this column stays the
  // source of truth for "is this account allowed into /account".
  isActiveClient: boolean('is_active_client').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const planTierEnum = pgEnum('plan_tier', ['foundation', 'care', 'assure', 'elite']);

export const savedPlans = pgTable('saved_plans', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  tier: planTierEnum('tier').notNull(),
  savedAt: timestamp('saved_at').notNull().defaultNow(),
});

export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'failed', 'refunded']);

/**
 * A checkout attempt for a plan (+ optional add-ons). `razorpayOrderId` /
 * `razorpayPaymentId` stay nullable until the Razorpay integration lands —
 * rows are created in `pending` status today from the checkout flow's
 * request-submission step, since real charging is deferred.
 */
export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // Text, not `planTierEnum`: an order can bundle add-ons alongside a tier
  // (e.g. the checkout page's "Assure plan + SOC 2 Audit + FinOps Dashboard"),
  // so this holds whatever plan/package identifier the checkout flow used,
  // matching the same convention as `leads.planId`.
  planId: text('plan_id').notNull(),
  // Whole currency units (rupees), matching package-catalog.ts's `priceMonthly`
  // convention — not paise/cents.
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  status: orderStatusEnum('status').notNull().default('pending'),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  paidAt: timestamp('paid_at'),
});

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'pending',
  'active',
  'paused',
  'cancelled',
]);

/**
 * The ongoing recurring relationship a paid plan creates — distinct from
 * `orders` (one checkout attempt) because a plan renews monthly without a
 * new checkout each time. `orderId` points at the order that originally
 * created it, but is nullable: the CRM "deal won" webhook (AGENTS.md #9)
 * could in principle mark someone an active client without FCAE ever having
 * run a checkout for them (an offline/manually-negotiated deal). Starts
 * `pending` and only becomes `active` once a real payment succeeds — with
 * Razorpay not wired up yet, every row here is `pending` today, same as
 * `orders`, but the shape is ready for when it isn't.
 */
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),
  planId: text('plan_id').notNull(),
  status: subscriptionStatusEnum('status').notNull().default('pending'),
  // Whole currency units (rupees) — same convention as orders.amount.
  amountMonthly: integer('amount_monthly').notNull(),
  currency: text('currency').notNull().default('INR'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  canceledAt: timestamp('canceled_at'),
});

export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'issued', 'paid', 'void']);

/**
 * Kept separate from `orders` rather than folded in: an order is "one
 * checkout attempt," but billing (especially once subscriptions renew
 * monthly) needs a 1-to-many history per order — each billing cycle gets its
 * own invoice row/number even though they trace back to the same order. A
 * folded design would force a new `orders` row per billing cycle instead,
 * which conflates "a customer tried to buy something" with "a bill was
 * issued," and would make `razorpayOrderId` ambiguous across cycles.
 */
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  // Nullable: set for a recurring billing-cycle invoice generated off a
  // subscription; null for a one-time invoice that only traces to `orderId`
  // (e.g. the SOC 2 audit add-on on the checkout page, which isn't recurring).
  subscriptionId: text('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  amountDue: integer('amount_due').notNull(),
  amountPaid: integer('amount_paid').notNull().default(0),
  status: invoiceStatusEnum('status').notNull().default('draft'),
  issuedAt: timestamp('issued_at'),
  dueAt: timestamp('due_at'),
  // Populated once PDF invoice generation exists; null until then.
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Throttles credential sign-in/sign-up attempts, keyed by `${email}:${ip}`.
 * One row per key, similar in spirit to `otpTokens.attempts` — increment on
 * each attempt within the window, lock out once the cap is hit.
 */
export const authAttempts = pgTable('auth_attempts', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  identifier: text('identifier').notNull().unique(),
  attempts: integer('attempts').notNull().default(0),
  windowStartedAt: timestamp('window_started_at').notNull().defaultNow(),
  lockedUntil: timestamp('locked_until'),
});

/** Short-lived OTP tokens for passwordless email sign-in */
export const otpTokens = pgTable('otp_tokens', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  email: text('email').notNull(),
  code: text('code').notNull(),          // 6-digit numeric string
  expiresAt: timestamp('expires_at').notNull(),
  attempts: integer('attempts').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Lead captured from the package builder's "Sign Up & Request Quote" flow.
 * Written before the visitor has an account, so there is no userId — the email
 * is what later ties a lead to the account they create.
 */
export const leads = pgTable('leads', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),

  // Company & contact
  companyName: text('company_name').notNull(),
  website: text('website'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  designation: text('designation'),
  email: text('email').notNull(),
  phone: text('phone'),
  industry: text('industry'),

  // Location
  physicalAddress: text('physical_address'),
  country: text('country'),
  state: text('state'),
  city: text('city'),
  postalCode: text('postal_code'),

  // Requirement
  existingEnvironment: text('existing_environment'),
  customerRequirement: text('customer_requirement'),
  customerBudget: integer('customer_budget'),

  // What they had configured in the builder when they asked for the quote
  planId: text('plan_id'),
  selectedServices: text('selected_services'),

  // Hand-off to the maiom-sales-engine CRM. The lead is always stored here
  // first; these columns record whether it made it across, so a CRM outage
  // costs a retry rather than the lead itself.
  crmLeadId: text('crm_lead_id'),
  crmSyncedAt: timestamp('crm_synced_at'),
  crmSyncError: text('crm_sync_error'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/** A support ticket raised by a client from the dashboard. */
export const tickets = pgTable('tickets', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  department: text('department').notNull(),
  requestType: text('request_type').notNull(),
  category: text('category').notNull(),
  subCategory: text('sub_category'),
  taskName: text('task_name'),
  requirements: text('requirements').notNull(),
  subject: text('subject').notNull(),
  description: text('description'),
  onBehalfOfCustomer: boolean('on_behalf_of_customer').notNull().default(false),
  // Required only when the ticket is raised on a customer's behalf.
  agentName: text('agent_name'),
  agentEmail: text('agent_email'),

  // Hand-off to Zoho Desk, mirroring how leads track their CRM sync.
  zohoTicketId: text('zoho_ticket_id'),
  zohoTicketNumber: text('zoho_ticket_number'),
  zohoSyncedAt: timestamp('zoho_synced_at'),
  zohoSyncError: text('zoho_sync_error'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/** Maps each client user to their assigned Zoho Project (for client isolation) */
export const clientProjects = pgTable('client_projects', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  zohoProjectId: text('zoho_project_id').notNull(),
  zohoPortalId: text('zoho_portal_id').notNull().default('marslab'),
  isActive: boolean('is_active').notNull().default(true),
  linkedAt: timestamp('linked_at').notNull().defaultNow(),
});
