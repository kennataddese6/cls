# Project Initialization

We are starting a brand new project.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Shadcn/UI
- Tailwind CSS
- Supabase
  - Authentication
  - Database
  - Storage
  - Row Level Security
- React Hook Form
- Zod

I have already cloned a Next.js + shadcn/ui Admin Dashboard template which will serve as the starting point of this project.

Do NOT start implementing features immediately.

---

## Step 1 — Review the Existing Template

Perform a complete review of the existing codebase.

Understand:

- folder structure
- routing
- layouts
- components
- dashboard structure
- authentication (if any)
- reusable components
- styling approach
- utilities
- providers
- state management
- existing tables
- existing APIs

Identify:

- what should be kept
- what should be removed
- what should be refactored
- opportunities to reuse components instead of rebuilding them

Do not modify code yet unless absolutely necessary.

---

## Step 2 — Review Project Documentation

Read every document inside

/docs

especially

- product-requirement-document.md
- requirements.md

Treat these documents as the single source of truth.

Understand

- business workflow
- user roles
- booking workflow
- quotation workflow
- invoice workflow
- cleaner workflow
- admin workflow
- security requirements

Do not skip any section.

---

## Step 3 — Produce an Implementation Plan

Create

docs/plan.md

This should become the master implementation plan for the entire project.

The plan should be broken into phases.

Each phase should contain

- objective
- deliverables
- dependencies
- estimated complexity
- implementation order
- testing checklist
- completion checklist

Example

# Phase 1

- Project setup
- Supabase configuration
- Authentication
- Database schema

Status

- [ ]
- [ ]

---

# Phase 2

...

Every task should be trackable.

---

## Step 4 — Create Project Documentation

Create any documentation files that will help make development faster, easier, and more maintainable.

Examples include

docs/

architecture.md
database-schema.md
api-spec.md
workflow.md
ui-pages.md
components.md
coding-standards.md
supabase.md
security.md
decisions.md
todo.md
changelog.md

Only create documentation that provides real value. Avoid unnecessary files.

---

## Step 5 — Database Planning

Before writing code,

design the database.

Identify

- tables
- relationships
- indexes
- foreign keys
- enums
- storage buckets
- RLS policies

Document everything before implementation.

---

## Step 6 — UI Planning

Identify every page required.

Separate them into

Public Pages

- Landing
- About
- Services
- Gallery
- Testimonials
- Contact
- Login

Admin Pages

Customer Pages

Cleaner Pages

List every page that will exist before implementation begins.

---

## Step 7 — Component Planning

Identify reusable components.

Examples

- Data Tables
- Forms
- Cards
- Dialogs
- Status Badges
- Upload Components
- Timeline
- Calendar
- Image Gallery
- Invoice Viewer
- Quote Builder

Reuse components whenever possible.

---

## Step 8 — Feature Breakdown

Break every feature into small implementation tasks.

Example

Booking

- UI
- Validation
- Database
- API
- Notifications
- Testing

Each task should be independently completable.

---

## Step 9 — Development Rules

Throughout development

- Always reuse existing components when possible.
- Avoid duplicate code.
- Keep components modular.
- Follow Next.js App Router best practices.
- Use Server Components where appropriate.
- Use Server Actions when appropriate.
- Use Supabase best practices.
- Keep TypeScript strict.
- Maintain responsive layouts.
- Follow shadcn/ui patterns.
- Build features incrementally.
- Update documentation as implementation progresses.
- Mark completed tasks in plan.md.
- Never implement features outside the agreed requirements without documenting the reason.

---

## Goal

Before writing production code, the project should have

- a complete implementation roadmap
- documented architecture
- documented database design
- documented workflows
- feature breakdown
- reusable component strategy
- project task tracker

Once planning is complete, implementation should proceed phase by phase while continuously updating the project documentation.