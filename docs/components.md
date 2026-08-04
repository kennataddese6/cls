# Components

Reusable component strategy for the CLS project.

---

## Principle

> Reuse before rebuild. Every component should live at the right level of abstraction: screen-specific stays in `_components/`, shared moves to `src/components/` only when reused by a second feature.

---

## shadcn/ui Foundation (Do Not Modify)

All located in `src/components/ui/`. Available for use everywhere:

| Component | Use Case |
|---|---|
| `Button` | All CTA and action buttons |
| `Card` | All content cards and panels |
| `Table` | All data tables |
| `Dialog` | Modals and confirmations |
| `Sheet` | Slide-in panels (mobile forms, details) |
| `Form` + `Field` | All form fields with React Hook Form |
| `Input`, `Select`, `Textarea` | Form inputs |
| `Badge` | Status labels |
| `Tabs` | Tab navigation within pages |
| `Avatar` | User/cleaner profile images |
| `Separator` | Layout dividers |
| `Skeleton` | Loading states |
| `Empty` | Empty state placeholder |
| `Sonner` (Toast) | Notifications and feedback |
| `Calendar` | Date pickers |
| `Combobox` | Searchable selects |
| `Spinner` | Loading indicators |

---

## Shared Application Components (`src/components/`)

These will be built as they become reusable across multiple features.

### StatusBadge

A styled badge that maps a status string to a color variant.

```tsx
<StatusBadge status="new_enquiry" />
<StatusBadge status="completed" />
<StatusBadge status="overdue" />
```

Used in: Enquiry list, Quote list, Job list, Invoice list, Job detail

### StatusTimeline

Renders an audit log as a vertical timeline.

```tsx
<StatusTimeline bookingId={id} />
```

Used in: Enquiry detail, Job detail, Invoice detail

### PhotoGallery

Grid of photos with lightbox. Supports categories (before/after).

```tsx
<PhotoGallery bookingId={id} category="before" />
<PhotoGallery bookingId={id} />
```

Used in: Enquiry detail, Job detail

### PhotoUploader

Drag-and-drop + click-to-upload. Compresses images client-side before uploading to Supabase Storage.

```tsx
<PhotoUploader
  bookingId={id}
  category="before"
  onUploadComplete={handleComplete}
/>
```

Used in: Booking form (enquiry photos), Cleaner job detail (before/after)

### DataTable

Generic, reusable table with sorting, filtering, pagination. Built on `@tanstack/react-table`.

```tsx
<DataTable
  columns={columns}
  data={data}
  filterColumn="status"
/>
```

Used in: Enquiries list, Quotes list, Jobs list, Invoices list, Cleaners list, Customers list, Payments list

### KpiCard

Metric card with title, value, trend, and icon.

```tsx
<KpiCard
  title="New Enquiries"
  value={12}
  trend="+3 today"
  icon={ClipboardList}
/>
```

Used in: Admin overview

### CustomerInfoPanel

Displays customer name, email, phone, and address in a structured panel.

```tsx
<CustomerInfoPanel customerId={id} />
```

Used in: Enquiry detail, Job detail (admin view), Job detail (cleaner view)

### NotesPanel

Dual-column notes display: Admin Notes + Customer Notes with inline edit capability.

```tsx
<NotesPanel bookingId={id} />
```

Used in: Enquiry detail, Job detail

### ActionBar

Sticky bottom or top bar containing the primary actions for a detail page.

```tsx
<ActionBar>
  <Button>Create Quote</Button>
  <Button variant="destructive">Reject</Button>
</ActionBar>
```

Used in: Enquiry detail, Quote detail, Job detail

### CopyButton

One-click copy with toast feedback.

```tsx
<CopyButton value="john@example.com" label="Email copied" />
```

Used in: Cleaner credentials panel

### SecureJobLinkPanel

Displays the generated secure job link with copy button.

```tsx
<SecureJobLinkPanel jobToken={token} />
```

Used in: Job detail (admin view, after assignment)

---

## Screen-Specific Components (stay in `_components/`)

These are co-located with their route and should not be extracted until reused.

### Admin Overview

| Component | Description |
|---|---|
| `KpiStrip` | Row of KPI cards |
| `RecentActivityFeed` | Latest booking/status changes |
| `UpcomingJobsList` | Today's scheduled jobs |

### Enquiry Detail

| Component | Description |
|---|---|
| `EnquiryHeader` | Reference, status badge, breadcrumb |
| `BookingDetailsPanel` | Service, property, schedule info |
| `EnquiryActions` | Status action buttons |

### Quote Builder

| Component | Description |
|---|---|
| `LineItemsTable` | Editable line items (description, qty, price, total) |
| `QuoteAdjustments` | Discount + VAT fields |
| `QuoteTotals` | Calculated subtotal / VAT / total |
| `QuotePreview` | Read-only quote as it appears to the customer |

### Cleaner Management

| Component | Description |
|---|---|
| `CleanerCredentialsPanel` | Displays generated email + password with copy buttons |
| `CleanerStatusBadge` | Available / Busy / Inactive |
| `CleanerJobHistory` | Past jobs table for a cleaner |

### Job Assignment

| Component | Description |
|---|---|
| `AssignCleanerForm` | Select cleaner, date, time |
| `CleanerAvailabilityPicker` | Filtered cleaner selector (available only) |
| `SecureJobLinkPanel` | Token link display with copy |

### Cleaner Portal

| Component | Description |
|---|---|
| `CleanerJobCard` | Job summary card for dashboard |
| `JobActionButtons` | Accept / Decline / Start / Complete context-aware buttons |
| `BeforeAfterUploader` | Tabbed photo uploader (before / after) |

### Public Booking Form

| Component | Description |
|---|---|
| `BookingFormStepper` | Multi-step progress indicator |
| `ServiceSelector` | Card-based service type picker |
| `PropertyForm` | Address + property detail fields |
| `ScheduleForm` | Date picker + arrival window select |
| `JobDetailsForm` | Tasks, extras, hazards, keys, notes |
| `PhotoUploadStep` | Optional image upload |
| `ContactForm` | Name, email, phone, GDPR consent |
| `BookingReviewStep` | Read-only summary before submit |

### Public Token Views

| Component | Description |
|---|---|
| `QuoteDocument` | Styled quote for customer view |
| `QuoteAcceptanceForm` | Accept/decline/request changes + payment method |
| `InvoiceDocument` | Styled invoice for customer view |

---

## Reuse Strategy from Template

The following template screens contain patterns and components worth reusing directly:

| Template Screen | What to Reuse |
|---|---|
| `invoice/` | `invoice-paper.tsx`, `invoice-items.tsx`, `invoice-adjustments.tsx` — adapt for CLS quotes + invoices |
| `calendar/` | Calendar component for job scheduling |
| `users/` | Table pattern + action menus for cleaner/customer lists |
| `crm/` | KPI card strip pattern, opportunities table pattern |
| `finance/` | KPI card + chart patterns for admin overview |
| `infrastructure/` | Header pattern with action row |

---

## Form Validation Pattern

All forms use React Hook Form + Zod:

```ts
// src/app/(main)/dashboard/enquiries/_components/enquiry-schema.ts
import { z } from "zod";

export const enquirySchema = z.object({
  status: z.enum(["under_review", "rejected"]),
  admin_notes: z.string().optional(),
});

export type EnquiryFormValues = z.infer<typeof enquirySchema>;
```

---

## Server Action Pattern

```ts
// src/server/booking-actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const supabase = await createSupabaseServerClient();

  // Always verify session + role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Forbidden");

  await supabase.from("bookings").update({ status }).eq("id", bookingId);
  await supabase.from("audit_logs").insert({ ... });

  revalidatePath(`/dashboard/enquiries/${bookingId}`);
}
```
