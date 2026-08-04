# Changelog

All notable changes to the CLS project, in reverse chronological order.

---

## [Unreleased]

### Added
- `docs/plan.md` — Master implementation plan (Phase 0–11)
- `docs/architecture.md` — System architecture and directory structure
- `docs/database-schema.md` — Complete database schema (tables, enums, RLS, triggers)
- `docs/workflow.md` — End-to-end workflow documentation
- `docs/ui-pages.md` — All pages inventory across all portals
- `docs/components.md` — Component strategy and reuse plan
- `docs/supabase.md` — Supabase setup and usage guide
- `docs/security.md` — Security requirements and implementation
- `docs/coding-standards.md` — Code conventions and patterns
- `docs/decisions.md` — Open decisions tracker
- `docs/changelog.md` — Project changelog

### Added
- Local Supabase database integration (`.env.local` + `supabase/migrations/20260804000000_init_cls.sql`)
- 15 core database tables, enums, triggers (`handle_new_user`, `set_updated_at`, `generate_booking_reference`, `generate_invoice_number`), and storage buckets
- Initial cleaning services seed script (`supabase/seed.sql`) & default admin seed (`supabase/seed_admin.sql`)
- Supabase Auth server actions (`src/server/auth-actions.ts`) & role-based middleware guards
- Public marketing website pages (`/`, `/services`, `/about`, `/gallery`, `/testimonials`, `/contact`)
- Interactive multi-step customer booking wizard (`/book` & `/book/confirmation`)
- Admin Overview Dashboard (`/dashboard/overview`) with live KPI metrics and recent enquiries feed
- Enquiries Management system (`/dashboard/enquiries` & `/dashboard/enquiries/[id]`) with audit timeline and status actions
- Customer Directory & Detail views (`/dashboard/customers` & `/dashboard/customers/[id]`)
- Interactive Quotation Builder (`/dashboard/quotes/new`), line items table, discount & VAT calculations
- Public Customer Quotation View (`/q/[token]`) with terms acceptance, payment method selection, and auto-invoice generation
- Automated Invoice Management (`/dashboard/invoices`, `/dashboard/invoices/[id]`, `/i/[token]`) & Payment Recording (`/dashboard/payments`)
- Cleaner Account Management (`/dashboard/cleaners/new`) with auto password generation and WhatsApp copy credentials
- Job Assignment system (`/dashboard/jobs`, `/dashboard/jobs/[id]`, `/dashboard/jobs/calendar`), secure token URL generator, and WhatsApp link copy
- Secure WhatsApp entry point handler (`/jobs/[token]`)
- Dedicated Cleaner Portal (`/cleaner/dashboard` & `/cleaner/jobs/[id]`) with Job Accept, Decline, Start, Complete, and Admin Approval workflow

### Changed
- Updated `app-config.ts` with Cleaning Management System identity and metadata
- Replaced demo sidebar items in `sidebar-items.ts` with CLS admin navigation structure
- Removed demo `GitHubRepositoriesMenu` from dashboard layout header
- Updated `src/data/users.ts` with CLS admin placeholder
- Set `/dashboard` root to redirect to `/dashboard/overview`

---

## Format

This changelog follows [Keep a Changelog](https://keepachangelog.com) format.

Sections: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`
