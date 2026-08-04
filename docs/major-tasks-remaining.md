# Major Tasks Remaining & Implementation Plan

## 1. Photo Evidence Upload System (Before & After Photos)
- [x] Create `PhotoUploadSection` component (`src/app/(cleaner)/cleaner/jobs/_components/photo-upload-section.tsx`) for cleaner job detail (`/cleaner/jobs/[id]`).
- [x] Support `before` and `after` photo categories.
- [x] Integrate file upload server action `uploadJobPhotoAction` to save to Supabase Storage `job-photos` bucket and `photos` database table.
- [x] Display uploaded photo gallery with category badges on Cleaner Job View (`/cleaner/jobs/[id]`) and Admin Job Detail (`/dashboard/jobs/[id]`).

## 2. PDF Invoice Download & Print View
- [x] Add PDF Print & Download layout to Invoice Detail page (`/dashboard/invoices/[id]`) and Customer Public Invoice Page (`/i/[token]`).
- [x] Professional print-formatted invoice document with company branding, line items, VAT breakdown, bank payment instructions, and payment status stamp.

## 3. Notifications & Real-Time Audit Log Timeline
- [x] Add Notifications Dropdown Menu in Admin Header (`src/app/(main)/dashboard/_components/header/notifications.tsx`).
- [x] Server action `getNotificationsList` and `markNotificationReadAction`.
- [x] Trigger audit log and notification records on every critical workflow transition:
  - New Booking Request Submitted
  - Quotation Created & Sent
  - Quote Accepted & Invoice Auto-Generated
  - Cleaner Assigned to Job
  - Job Started & Completed by Cleaner
  - Payment Recorded against Invoice

## 4. UI Polish & Comprehensive Production Readiness
- [x] Verify responsive layout across all screens (Mobile, Tablet, Desktop).
- [x] Ensure empty, loading, and disabled states across all dashboard screens.
- [x] Validate production build (`npm run build`) with zero errors.