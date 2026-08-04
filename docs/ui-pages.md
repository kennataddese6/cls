# UI Pages

Complete list of every page in the application, grouped by portal.

---

## Public Website

| Route | Page | Description | Auth Required |
|---|---|---|---|
| `/` | Landing | Hero, services overview, testimonial strip, CTA | No |
| `/about` | About | Company story, team, values | No |
| `/services` | Services | All services with pricing and details | No |
| `/gallery` | Gallery | Before/after photo showcase | No |
| `/testimonials` | Testimonials | Customer reviews | No |
| `/contact` | Contact | Contact form + company info | No |
| `/book` | Booking Form | Multi-step booking request form | No |
| `/book/confirmation` | Booking Confirmation | Displays job reference, next steps | No |

### Booking Form — Steps

| Step | Fields |
|---|---|
| 1. Service | Service type selection |
| 2. Property | Address, property type, bedrooms, bathrooms, parking notes |
| 3. Schedule | Preferred date, arrival window, alternative date |
| 4. Details | Required tasks, extras, pets, hazards, keys, alarm, notes |
| 5. Photos | Optional image upload (JPG, PNG, HEIC) |
| 6. Contact | Name, email, phone, GDPR consent |
| 7. Review & Submit | Summary before submission |

---

## Token-Gated Views (No Login Required)

| Route | Page | Description |
|---|---|---|
| `/q/[token]` | Quote View | Customer reads and accepts/declines quotation |
| `/i/[token]` | Invoice View | Customer reads their invoice |
| `/jobs/[token]` | Secure Job Entry | Cleaners enter via secure link; redirects to login if needed |

---

## Authentication Pages

| Route | Page | Description |
|---|---|---|
| `/auth/v2/login` | Login | Shared login for admin + cleaner |
| `/auth/v2/register` | Register | Not public — admin creates cleaner accounts |
| `/auth/v2/reset-password` | Reset Password | Password reset flow |

---

## Admin Dashboard

> All admin routes prefixed with `/dashboard/`. Requires `role=admin`.

### Overview

| Route | Page | Description |
|---|---|---|
| `/dashboard` | Redirect | Redirects to `/dashboard/overview` |
| `/dashboard/overview` | Admin Overview | KPI cards, activity feed, upcoming jobs |

### Enquiries

| Route | Page | Description |
|---|---|---|
| `/dashboard/enquiries` | Enquiries List | All enquiries, searchable + filterable by status |
| `/dashboard/enquiries/[id]` | Enquiry Detail | Full booking detail, photos, notes, status actions |

### Quotations

| Route | Page | Description |
|---|---|---|
| `/dashboard/quotes` | Quotes List | All quotes with status filter |
| `/dashboard/quotes/new` | Create Quote | Quote builder (link from enquiry detail) |
| `/dashboard/quotes/[id]` | Quote Detail | View, edit, send, version history |

### Jobs

| Route | Page | Description |
|---|---|---|
| `/dashboard/jobs` | Jobs List | All jobs with status + date filter |
| `/dashboard/jobs/[id]` | Job Detail | Full job view — assignment, photos, timeline |
| `/dashboard/jobs/calendar` | Job Calendar | Day/week/month calendar view of scheduled jobs |

### Invoices

| Route | Page | Description |
|---|---|---|
| `/dashboard/invoices` | Invoices List | All invoices with status filter |
| `/dashboard/invoices/[id]` | Invoice Detail | Invoice view, PDF download, payment recording |

### Cleaners

| Route | Page | Description |
|---|---|---|
| `/dashboard/cleaners` | Cleaners List | All cleaners, availability status |
| `/dashboard/cleaners/new` | Create Cleaner | Create account, auto-generate password, copy credentials |
| `/dashboard/cleaners/[id]` | Cleaner Profile | Profile, current jobs, work history |

### Customers

| Route | Page | Description |
|---|---|---|
| `/dashboard/customers` | Customers List | All customers, searchable |
| `/dashboard/customers/[id]` | Customer Profile | Customer details, address book, booking history |

### Payments

| Route | Page | Description |
|---|---|---|
| `/dashboard/payments` | Payments List | All recorded payments |

---

## Cleaner Portal

> All cleaner routes prefixed with `/cleaner/`. Requires `role=cleaner`.

| Route | Page | Description |
|---|---|---|
| `/cleaner` | Redirect | Redirects to `/cleaner/dashboard` |
| `/cleaner/dashboard` | Cleaner Overview | Columns: Assigned, Accepted, In Progress, Completed, Declined |
| `/cleaner/jobs/[id]` | Job Detail | Customer info, address, job details, photo upload, action buttons |

---

## Error / System Pages

| Route | Page | Description |
|---|---|---|
| `/unauthorized` | Unauthorized | Shown when user accesses a route above their role |
| `/not-found` | 404 | Not found (already exists in template) |

---

## Page Component Breakdown

### Admin Overview (`/dashboard/overview`)

```
AdminOverviewPage
  ├─ KpiStrip
  │    ├─ KpiCard (New Enquiries)
  │    ├─ KpiCard (Quotes Awaiting)
  │    ├─ KpiCard (Today's Jobs)
  │    ├─ KpiCard (Unassigned Jobs)
  │    ├─ KpiCard (Overdue Invoices)
  │    └─ KpiCard (Open Issues)
  ├─ RecentActivityFeed
  └─ UpcomingJobsList
```

### Enquiry Detail (`/dashboard/enquiries/[id]`)

```
EnquiryDetailPage
  ├─ EnquiryHeader (reference, status badge, actions)
  ├─ CustomerInfoPanel
  ├─ BookingDetailsPanel (service, property, schedule)
  ├─ PhotoGallery (enquiry photos)
  ├─ StatusTimeline (audit log)
  ├─ NotesPanel (admin + customer notes)
  └─ ActionBar (Mark Under Review | Create Quote | Reject)
```

### Quote Builder (`/dashboard/quotes/new`)

```
QuoteBuilderPage
  ├─ QuoteHeader (booking reference, customer name)
  ├─ AppointmentSection (date, time)
  ├─ LineItemsTable (add/remove/edit rows)
  ├─ QuoteAdjustments (discount, VAT)
  ├─ QuoteTotals (subtotal, VAT, total)
  ├─ QuoteTerms (expiry, terms text)
  └─ QuoteActions (Save Draft | Send to Customer)
```

### Job Detail — Cleaner View (`/cleaner/jobs/[id]`)

```
CleanerJobDetailPage
  ├─ JobHeader (reference, service, status badge)
  ├─ CustomerInfoPanel (name, address, phone)
  ├─ SchedulePanel (date, time)
  ├─ NotesPanel (admin notes, special instructions)
  ├─ PhotoUploadSection
  │    ├─ BeforePhotosUpload
  │    └─ AfterPhotosUpload
  └─ ActionBar (Accept | Decline | Start | Complete)
```
