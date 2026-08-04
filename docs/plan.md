# Cleaning Company Management System — Master Implementation Plan

> **Single source of truth for all development work.**
> Update task status here as work progresses. Never implement features not listed here without documenting the reason.

---

## Project Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| UI | shadcn/ui (radix-nova style) + Tailwind CSS v4 |
| Backend | Supabase (Auth, Database, Storage, RLS) |
| Forms | React Hook Form + Zod |
| State | Zustand (client-side) |
| Linting | Biome |

---

## Status Legend

| Symbol | Meaning |
|---|---|
| `[ ]` | Not started |
| `[/]` | In progress |
| `[x]` | Complete |

---

# Phase 0 — Template Cleanup & Project Baseline

**Objective:** Strip the template down to its reusable shell. Remove demo screens and placeholder data. Establish the project identity.

**Estimated Complexity:** Low
**Dependencies:** None

## Deliverables

- Clean project with only the shell (sidebar, layout, header, theming) intact
- Updated app name, metadata, and branding
- Removed demo sidebar items and replaced with CLS navigation structure
- Updated `app-config.ts` to CLS identity

## Implementation Order

1. Update `app-config.ts` — project name, meta title, description
2. Clear demo sidebar items from `sidebar-items.ts`
3. Remove or archive dashboard demo screens that will not be reused
4. Remove `AccountSwitcher` demo users or replace with auth-aware component placeholder
5. Remove `GitHubRepositoriesMenu` from dashboard header (not needed)
6. Verify the shell still builds and renders cleanly

## What to Keep from Template

- Sidebar shell (`AppSidebar`, `SidebarProvider`, `SidebarInset`)
- Header structure (layout controls, theme switcher, search dialog)
- All `src/components/ui/` components (do not modify)
- Auth pages (v2 layout is clean and reusable)
- `invoice/` dashboard screen — reuse for quote & invoice viewers
- `calendar/` — reuse for scheduling
- `users/` — reuse for cleaner management
- Theming system (presets, dark mode, font switching)
- Zustand store pattern
- Server actions pattern

## What to Remove / Replace

- Demo sidebar groups: Dashboards, Pages, Legacy, Misc
- `AccountSwitcher` demo user data (replace with real auth user)
- `GitHubRepositoriesMenu` header component
- All legacy dashboard screens under `(legacy)/`
- Demo data in `src/data/`

## Status

- [x] Update `app-config.ts`
- [x] Update `sidebar-items.ts` with CLS structure
- [x] Remove demo screens (keep: invoice, calendar, users, auth pages)
- [x] Remove `GitHubRepositoriesMenu` from header
- [x] Clean `src/data/users.ts` — replace with auth-aware placeholder
- [x] Verify dev server builds cleanly

---

# Phase 1 — Supabase Foundation

**Objective:** Configure Supabase project, install client libraries, establish auth, database schema, RLS policies, and storage buckets.

**Estimated Complexity:** High
**Dependencies:** Phase 0 complete

## Deliverables

- Supabase project created and environment variables configured
- Supabase client (server + browser) installed and initialised
- Database schema applied (all tables, enums, indexes, foreign keys)
- RLS policies applied per role
- Storage buckets created with access policies
- Middleware for session management

## Implementation Order

1. Install `@supabase/supabase-js` and `@supabase/ssr`
2. Add environment variables (`.env.local`)
3. Create `src/lib/supabase/` — server client, browser client, middleware client
4. Add `middleware.ts` to refresh sessions
5. Apply database migration (see `docs/database-schema.md`)
6. Apply RLS policies
7. Create storage buckets: `booking-photos`, `job-photos`

## Status

- [ ] Install Supabase packages
- [ ] Configure environment variables
- [ ] Create Supabase server client (`src/lib/supabase/server.ts`)
- [ ] Create Supabase browser client (`src/lib/supabase/client.ts`)
- [ ] Create middleware client (`src/lib/supabase/middleware.ts`)
- [ ] Add `middleware.ts` at project root
- [ ] Apply database schema migration
- [ ] Apply RLS policies
- [ ] Create `booking-photos` storage bucket
- [ ] Create `job-photos` storage bucket
- [ ] Verify session refresh works end-to-end

---

# Phase 2 — Authentication & Role System

**Objective:** Implement login, logout, session handling, and role-based access control (Admin / Cleaner / Customer) using Supabase Auth.

**Estimated Complexity:** Medium
**Dependencies:** Phase 1 complete

## Deliverables

- Login page (reuse auth/v2 layout)
- Logout action
- Session-aware middleware (redirect unauthenticated users)
- Role detection from `profiles` table
- Route guards per role
- Password reset flow

## User Roles

| Role | Access |
|---|---|
| `admin` | Full admin dashboard |
| `cleaner` | Cleaner portal only |
| `customer` | Customer portal (public booking + status pages) |

## Implementation Order

1. Adapt auth/v2 login page for real Supabase auth
2. Create `signIn`, `signOut` server actions
3. Add middleware route guards
4. Create `profiles` table trigger (on new user insert profile with role)
5. Create `useCurrentUser` hook
6. Create `getRoleFromSession` utility
7. Add unauthorized redirect for wrong-role access
8. Password reset page and email flow

## Status

- [ ] Adapt login page for Supabase auth
- [ ] Create `signIn` / `signOut` server actions
- [ ] Middleware route guards (admin, cleaner, customer)
- [ ] `profiles` table + trigger for role assignment
- [ ] `useCurrentUser` hook
- [ ] Role-based layout/route rendering
- [ ] Password reset page
- [ ] Test: admin login → admin dashboard
- [ ] Test: cleaner login → cleaner portal
- [ ] Test: unauthenticated → redirect to login

---

# Phase 3 — Public Website

**Objective:** Build the public-facing marketing website (landing page and supporting pages). This is the first thing customers see.

**Estimated Complexity:** Medium
**Dependencies:** Phase 0 (branding), Phase 1 (Supabase URL for booking form submission)

## Pages Required

| Route | Description |
|---|---|
| `/` | Landing page — hero, services overview, CTA |
| `/about` | Company about page |
| `/services` | Services listing with details |
| `/gallery` | Before/after photo gallery |
| `/testimonials` | Customer testimonials |
| `/contact` | Contact form |
| `/login` | Login redirect to auth/v2 |
| `/book` | Booking request form (Steps 2–4 of customer workflow) |

## Implementation Order

1. Create public layout (`src/app/(public)/layout.tsx`) — nav + footer
2. Landing page (`/`) with hero, services strip, CTA
3. Services page
4. About page
5. Gallery page
6. Testimonials page
7. Contact page
8. Booking form (`/book`) — multi-step form with Supabase submission

## Status

- [ ] Public layout (navbar + footer)
- [ ] Landing page
- [ ] Services page
- [ ] About page
- [ ] Gallery page
- [ ] Testimonials page
- [ ] Contact page
- [ ] Booking form (multi-step)
- [ ] Booking form submits to Supabase `bookings` table
- [ ] Booking confirmation page with job reference

---

# Phase 4 — Admin Dashboard Core

**Objective:** Build the admin dashboard shell with overview widgets and the navigation structure for all CLS screens.

**Estimated Complexity:** Medium
**Dependencies:** Phase 2 (auth), Phase 1 (database)

## Admin Navigation Structure

```
Overview
  └─ Dashboard (KPI overview)

Enquiries
  └─ All Enquiries

Quotations
  └─ All Quotes

Jobs
  └─ All Jobs
  └─ Calendar

Invoices
  └─ All Invoices

Cleaners
  └─ All Cleaners

Customers
  └─ All Customers

Payments
  └─ All Payments
```

## Dashboard KPI Widgets

- New Enquiries (today)
- Quotes Awaiting Response
- Today's Jobs
- Unassigned Jobs
- Overdue Invoices
- Open Issues

## Implementation Order

1. Update `sidebar-items.ts` with CLS admin navigation
2. Create admin dashboard overview page (`/dashboard/overview`)
3. Build KPI stat cards (reuse card patterns from finance/CRM screens)
4. Build activity feed widget (recent bookings/status changes)
5. Build upcoming jobs widget (today's schedule)

## Status

- [ ] Update `sidebar-items.ts` for CLS admin navigation
- [ ] Admin overview page (`/dashboard/overview`)
- [ ] KPI cards: new enquiries, quotes awaiting, today's jobs, unassigned, overdue invoices
- [ ] Recent activity feed
- [ ] Upcoming jobs widget

---

# Phase 5 — Enquiries & Customer Management

**Objective:** Give admins the ability to view, search, filter, and manage customer enquiries (bookings in New Enquiry / Under Review status).

**Estimated Complexity:** Medium
**Dependencies:** Phase 4

## Pages

| Route | Description |
|---|---|
| `/dashboard/enquiries` | Enquiries list with filters |
| `/dashboard/enquiries/[id]` | Enquiry detail view |
| `/dashboard/customers` | Customer list |
| `/dashboard/customers/[id]` | Customer detail + booking history |

## Enquiry Detail Features

- Customer info panel
- Booking details (service, property, schedule)
- Uploaded photos gallery
- Communication notes (internal + customer-facing)
- Status history timeline
- Actions: Mark Under Review, Reject, Create Quote

## Status

- [ ] Enquiries list page with search + filter
- [ ] Enquiry detail page
- [ ] Photo gallery in enquiry detail
- [ ] Status timeline component
- [ ] Status update actions
- [ ] Create Quote button (links to Phase 6)
- [ ] Customers list page
- [ ] Customer detail page with booking history

---

# Phase 6 — Quotation Workflow

**Objective:** Allow admins to create, send, and track quotations. Allow customers to view and accept/decline quotes.

**Estimated Complexity:** High
**Dependencies:** Phase 5

## Pages

| Route | Description |
|---|---|
| `/dashboard/quotes` | All quotes list |
| `/dashboard/quotes/[id]` | Quote detail + edit |
| `/dashboard/quotes/new?bookingId=` | Create quote for a booking |
| `/q/[token]` | Public customer quote view (accept/decline) |

## Quote Builder Features

- Line items (service, extras, custom)
- Discount field
- VAT toggle
- Expiry date
- Terms text
- Version history
- Send to customer (generates public token link)

## Customer Quote View (`/q/[token]`)

- Read-only quote view
- Accept / Request Changes / Decline buttons
- Terms agreement checkbox
- Payment method selection on acceptance
- Records: timestamp, IP, device, accepted quote version

## Status

- [ ] Quote list page
- [ ] Quote builder form
- [ ] Line items table (add/remove/edit)
- [ ] Discount + VAT calculation
- [ ] Save as draft / Send actions
- [ ] Generate public quote token
- [ ] Public customer quote page (`/q/[token]`)
- [ ] Customer: Accept quote (triggers invoice generation)
- [ ] Customer: Request Changes
- [ ] Customer: Decline
- [ ] Quote status machine (Draft → Sent → Viewed → Accepted/Declined/Expired)
- [ ] Quote version history

---

# Phase 7 — Invoice Generation & Payment

**Objective:** Automatically generate an invoice when a quote is accepted. Allow admins to record payment.

**Estimated Complexity:** Medium
**Dependencies:** Phase 6

## Pages

| Route | Description |
|---|---|
| `/dashboard/invoices` | All invoices list |
| `/dashboard/invoices/[id]` | Invoice detail + payment recording |
| `/i/[token]` | Public customer invoice view |

## Invoice Auto-Generation

Triggered by: Customer accepts quotation

- Sequential invoice number (INV-YYYY-XXXX)
- PDF generation (reuse `invoice-paper.tsx` from template)
- Link to: customer, booking, accepted quote
- Initial status: `Unpaid`

## Payment Recording

- Supported methods: Bank Transfer, Cash
- Admin records: amount, method, date, notes
- Invoice status → `Paid`
- Optional receipt

## Status

- [ ] Invoice auto-generated on quote acceptance
- [ ] Sequential invoice number logic
- [ ] Invoice list page
- [ ] Invoice detail page
- [ ] PDF rendering (reuse/adapt template invoice components)
- [ ] PDF download
- [ ] Payment recording form
- [ ] Invoice status machine (Draft → Issued → Unpaid → Part Paid → Paid / Overdue / Cancelled)
- [ ] Overdue detection (cron or on-read)
- [ ] Public invoice view (`/i/[token]`)

---

# Phase 8 — Job Assignment & Cleaner Management

**Objective:** Admin assigns cleaners to jobs. System generates secure job links. Manage cleaner accounts.

**Estimated Complexity:** Medium
**Dependencies:** Phase 7

## Pages

| Route | Description |
|---|---|
| `/dashboard/jobs` | All jobs list |
| `/dashboard/jobs/[id]` | Job detail (admin view) |
| `/dashboard/jobs/calendar` | Calendar view of jobs |
| `/dashboard/cleaners` | Cleaner list |
| `/dashboard/cleaners/[id]` | Cleaner profile + job history |
| `/dashboard/cleaners/new` | Create cleaner account |

## Cleaner Account Creation

- Name, type (individual/company), email, phone, address, service areas
- Auto-generate strong password
- One-click copy: email + password (for manual WhatsApp sharing)
- Create Supabase auth user with `cleaner` role

## Job Assignment

- Admin selects cleaner, date, time
- Booking status → `Cleaner Assigned`
- System generates secure job token (UUID-based URL)
- Admin copies link for WhatsApp sharing

## Secure Job Link

```
https://[domain]/jobs/[secure-token]
```

- If cleaner already logged in → redirect to job
- If not → redirect to login → return to job after auth
- Cleaner can only see their own jobs (enforced via RLS)

## Status

- [ ] Jobs list page with status filter
- [ ] Job detail page (admin view) — customer info, service, schedule, photos, timeline
- [ ] Calendar view of jobs (reuse template calendar)
- [ ] Cleaner list page
- [ ] Cleaner detail page
- [ ] Create cleaner form
- [ ] Auto-generate strong password on creation
- [ ] Copy credentials button
- [ ] Job assignment form (select cleaner, date, time)
- [ ] Generate secure job token on assignment
- [ ] Copy job link button

---

# Phase 9 — Cleaner Portal & Job Completion Workflow

**Objective:** Cleaners log in and manage their assigned jobs through a dedicated portal. Upload before/after photos. Complete jobs.

**Estimated Complexity:** Medium
**Dependencies:** Phase 8

## Pages

| Route | Description |
|---|---|
| `/cleaner/dashboard` | Cleaner overview — assigned, accepted, completed, declined jobs |
| `/cleaner/jobs/[id]` | Job detail — customer, address, actions |
| `/jobs/[token]` | Secure job link entry point |

## Job Screen Actions

- Accept Job
- Decline Job
- Start Job (status → `In Progress`)
- Upload Before Photos
- Upload After Photos
- Add Notes
- Complete Job (status → `Completed Pending Review`)

## Admin Review & Close

- Admin reviews completed job
- Reviews before/after photos
- Approves → status → `Completed`
- If issue raised → `Issue Raised`

## Photo Storage

- Stored in Supabase Storage (`job-photos` bucket)
- Metadata: booking_id, uploaded_by, category (before/after), timestamp
- Compressed before upload
- HEIC, JPG, PNG supported

## Status

- [ ] Cleaner portal layout (separate from admin dashboard)
- [ ] Cleaner dashboard page
- [ ] Secure job link handler (`/jobs/[token]`)
- [ ] Job detail page (cleaner view)
- [ ] Accept / Decline actions
- [ ] Start Job action
- [ ] Before photo upload with compression + progress
- [ ] After photo upload with compression + progress
- [ ] Notes input
- [ ] Complete Job action
- [ ] Admin job review page (approve / raise issue)
- [ ] Status machine: Assigned → Accepted → In Progress → Completed Pending Review → Completed

---

# Phase 10 — Notifications & Audit Log

**Objective:** Send email notifications at key workflow events. Maintain a full audit log.

**Estimated Complexity:** Medium
**Dependencies:** Phase 9

## Notification Events

| Event | Recipients |
|---|---|
| New booking submitted | Admin |
| Quote sent | Customer |
| Quote accepted | Admin |
| Invoice generated | Customer |
| Job assigned | Cleaner |
| Job declined by cleaner | Admin |
| Job completed | Admin |
| Payment recorded | Customer |

## Notification Channels (MVP)

- Email (via Supabase + Resend or similar)
- WhatsApp — manual (admin copies link)

## Audit Log

- Every status change logged
- Logged: user, action, record ID, timestamp, old value, new value
- Visible in admin job detail timeline

## Status

- [ ] Email notification setup (provider config)
- [ ] Notification triggers per event (server actions / Supabase webhooks)
- [ ] Audit log table inserts on every status change
- [ ] Admin timeline component reads audit log
- [ ] Email templates for each event

---

# Phase 11 — Security Hardening & Polish

**Objective:** Ensure all security requirements are met, RLS is correct, and the app is production-ready.

**Estimated Complexity:** Medium
**Dependencies:** All prior phases

## Checklist

- [ ] Verify RLS policies: cleaner can only see own jobs
- [ ] Verify RLS policies: customer can only see own bookings/quotes/invoices
- [ ] Secure job token expiry logic
- [ ] File upload validation (type, size limits)
- [ ] HTTPS enforced (hosting config)
- [ ] Input sanitisation on all forms
- [ ] Error boundaries on all pages
- [ ] Loading, empty, and error states on all screens
- [ ] Responsive layouts verified (mobile, tablet, desktop)
- [ ] Dark mode verified on all new screens
- [ ] Accessibility: keyboard nav, ARIA labels, focus states
- [ ] Rate limiting on booking submission and auth
- [ ] GDPR: consent notice on booking form photo upload

---

# MVP Success Criteria

The MVP is complete when all of the following work end-to-end:

- [ ] Customer submits booking from public website
- [ ] Admin reviews booking in dashboard
- [ ] Admin creates and sends quotation
- [ ] Customer accepts quote via public token link
- [ ] Invoice auto-generated and sent to customer
- [ ] Admin assigns cleaner and copies secure job link
- [ ] Cleaner opens secure link, logs in, and sees their job
- [ ] Cleaner uploads before photos, completes work, uploads after photos
- [ ] Cleaner submits job as complete
- [ ] Admin reviews and approves completion
- [ ] Admin records payment
- [ ] All status changes reflected correctly throughout

---

# Implementation Notes

- Never implement features outside the agreed requirements without documenting the reason in `docs/decisions.md`
- Mark tasks `[x]` as they are completed
- Update `docs/changelog.md` with each significant change
- Run `npm run build` and `npm run check` before marking a phase complete
