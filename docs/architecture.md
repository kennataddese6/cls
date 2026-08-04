# Architecture

## System Overview

The Cleaning Company Management System (CLS) is a multi-tenant web application with three distinct user portals sharing a single Next.js codebase.

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App Router                │
├─────────────────┬───────────────┬───────────────────┤
│  Public Website │  Admin Portal │  Cleaner Portal   │
│  /(public)      │  /(main)/     │  /(cleaner)/      │
│                 │  dashboard/   │  cleaner/         │
├─────────────────┴───────────────┴───────────────────┤
│              Supabase Backend                       │
│  Auth │ PostgreSQL │ Storage │ RLS │ Edge Functions  │
└─────────────────────────────────────────────────────┘
```

## Route Groups

| Group | Path | Description |
|---|---|---|
| `(public)` | `/`, `/book`, `/services`, etc. | Public marketing + booking |
| `(main)` | `/dashboard/*` | Admin portal (protected, role=admin) |
| `(cleaner)` | `/cleaner/*` | Cleaner portal (protected, role=cleaner) |
| `(token)` | `/q/[token]`, `/i/[token]`, `/jobs/[token]` | Token-gated public views |
| `(auth)` | `/auth/v2/login`, `/auth/v2/register` | Shared auth pages |

## Middleware

`middleware.ts` at the project root handles:

1. Supabase session refresh on every request
2. Route guards:
   - `/dashboard/*` → requires `role=admin`
   - `/cleaner/*` → requires `role=cleaner`
   - Unauthenticated users redirected to `/auth/v2/login`
3. Token routes (`/q/`, `/i/`, `/jobs/`) → no auth required, validated by token lookup

## Data Flow

### Booking Submission (Customer)

```
Customer fills /book form
  → React Hook Form + Zod validation
  → Server Action
  → Supabase insert: bookings + customers (upsert)
  → Supabase insert: audit_logs
  → Email notification to admin
  → Redirect to /book/confirmation?ref=JOB-XXXX
```

### Quote Acceptance (Customer)

```
Customer visits /q/[token]
  → Load quote by token (no auth required)
  → Customer accepts
  → Server Action:
      - Update quote.status = 'accepted'
      - Update booking.status = 'quotation_accepted'
      - Auto-create invoice record
      - Insert audit_log
  → Email: invoice sent to customer
  → Redirect to confirmation
```

### Job Completion (Cleaner)

```
Cleaner opens /jobs/[token]
  → Middleware: if unauthenticated, redirect to login with ?next=/jobs/[token]
  → After login, return to /jobs/[token]
  → RLS: verify job.cleaner_id = auth.uid()
  → Cleaner uploads photos → Supabase Storage (job-photos bucket)
  → Cleaner submits completion
  → Server Action:
      - Update job.status = 'completed_pending_review'
      - Insert audit_log
  → Email: admin notified
```

## Directory Structure

```
src/
├── app/
│   ├── (public)/                 # Public website
│   │   ├── layout.tsx            # Public nav + footer
│   │   ├── page.tsx              # Landing
│   │   ├── about/
│   │   ├── services/
│   │   ├── gallery/
│   │   ├── testimonials/
│   │   ├── contact/
│   │   └── book/
│   ├── (main)/                   # Admin portal
│   │   ├── auth/
│   │   │   └── v2/               # Login/register pages
│   │   └── dashboard/
│   │       ├── layout.tsx        # Dashboard shell
│   │       ├── overview/         # Admin overview
│   │       ├── enquiries/
│   │       ├── quotes/
│   │       ├── jobs/
│   │       ├── invoices/
│   │       ├── cleaners/
│   │       ├── customers/
│   │       └── payments/
│   ├── (cleaner)/                # Cleaner portal
│   │   └── cleaner/
│   │       ├── layout.tsx        # Cleaner shell
│   │       ├── dashboard/
│   │       └── jobs/[id]/
│   ├── (token)/                  # Public token-gated views
│   │   ├── q/[token]/            # Quote acceptance
│   │   ├── i/[token]/            # Invoice view
│   │   └── jobs/[token]/         # Secure cleaner job link
│   ├── globals.css
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # shadcn/ui (do not modify)
│   └── [shared components]
├── lib/
│   ├── supabase/
│   │   ├── server.ts             # Server-side Supabase client
│   │   ├── client.ts             # Browser-side Supabase client
│   │   └── middleware.ts         # Middleware Supabase client
│   ├── fonts/
│   ├── preferences/
│   └── utils.ts
├── hooks/
│   ├── use-current-user.ts       # Auth-aware user hook
│   └── [other hooks]
├── navigation/
│   └── sidebar/
│       └── sidebar-items.ts      # CLS admin nav structure
├── server/
│   ├── server-actions.ts         # Shared server actions
│   ├── auth-actions.ts           # signIn, signOut, resetPassword
│   ├── booking-actions.ts        # Booking CRUD
│   ├── quote-actions.ts          # Quote CRUD
│   ├── invoice-actions.ts        # Invoice generation
│   └── job-actions.ts            # Job status + photo upload
└── styles/
    └── presets/
```

## State Management

| Layer | Tool | Use Case |
|---|---|---|
| Server state | Supabase (direct) | All DB reads via Server Components |
| Form state | React Hook Form | All forms |
| UI state | Zustand | Preferences, sidebar state |
| Client cache | None (MVP) | Use Next.js fetch cache + revalidation |

## Authentication Architecture

- Supabase Auth handles sessions
- Sessions stored in cookies via `@supabase/ssr`
- `middleware.ts` refreshes expired sessions on every request
- `profiles` table extends `auth.users` with role + profile data
- RLS policies enforce data access per role at database level

## Security Layers

1. Middleware: route-level role guards
2. Server Actions: always verify session + role before any mutation
3. RLS: database-level enforcement (final defense)
4. Storage policies: role-based bucket access
5. Token links: validated by DB lookup, not auth session
