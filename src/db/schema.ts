import { pgTable, pgEnum, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { randomUUID } from 'node:crypto';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password'),
  googleId: text('google_id').unique(),
  name: text('name'),
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
