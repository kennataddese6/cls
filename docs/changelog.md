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
