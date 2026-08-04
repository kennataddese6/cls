# Cleaning Company Management System
## MVP Implementation Priority

This document defines the implementation priority for the MVP. The goal is to first build the complete customer booking workflow before adding secondary management features.

---

# Primary Goal

Build a complete cleaning service platform where:

1. A customer can request a cleaning service.
2. The company reviews the request.
3. The company sends a quotation.
4. The customer accepts the quotation.
5. The system generates an invoice.
6. The admin assigns a cleaner.
7. The cleaner receives a secure job link.
8. The cleaner completes the work with before/after photo evidence.
9. The admin closes the job and records payment.

Everything else should support this workflow.

---

# Phase 1 — Public Website

The website should first include the public-facing pages.

## Required Pages

- Landing Page
- About
- Services
- Gallery
- Testimonials
- Contact
- Login

The landing page should clearly explain the cleaning services and encourage visitors to request a quote or book a cleaning service.

---

# Phase 2 — Company Administration

After authentication, the company administrator should have access to an admin dashboard.

The company manages every aspect of the business from this dashboard.

## Company can manage

- Cleaning Services
- Cleaners
- Customers
- Bookings
- Quotations
- Invoices
- Payments
- Job Assignments

---

# Service Management

The company should be able to create and manage cleaning services.

Examples

- Standard Cleaning
- Deep Cleaning
- End of Tenancy
- Office Cleaning
- Commercial Cleaning
- Carpet Cleaning

Each service should contain:

- Name
- Description
- Pricing information
- Estimated duration
- Active/Inactive status

---

# Cleaner Management

The company should be able to create cleaner accounts.

Each cleaner should have:

- Name
- Individual or Company
- Email
- Phone Number
- Address
- Service Areas
- Status (Available, Busy, Inactive)

## Password Generation

The system should automatically generate a strong password.

Example:

```
Email:
john@example.com

Password:
Q7@kL92!pN
```

The admin should be able to copy the credentials with one click.

Example

```
Email copied
Password copied
```

The company will send these credentials to the cleaner manually through WhatsApp.

The system is **not responsible** for sending WhatsApp messages during the MVP.

---

# Customer Booking Workflow

This is the most important workflow.

## Step 1

Customer visits the website.

## Step 2

Customer selects a cleaning service.

## Step 3

Customer fills in booking information.

Example information

- Name
- Email
- Phone
- Property Address
- Property Type
- Bedrooms
- Bathrooms
- Preferred Date
- Preferred Time
- Notes
- Optional Images

## Step 4

Customer submits booking.

System creates

- Booking
- Customer (if new)
- Job Reference

Status

```
New Enquiry
```

---

# Quotation Workflow

The admin reviews the booking.

The admin can:

- Review customer details
- Review uploaded images
- Contact customer
- Modify booking information
- Prepare quotation

Quotation contains:

- Services
- Line Items
- Price
- VAT (if applicable)
- Total
- Terms
- Expiry Date

Customer receives the quotation.

Customer can

- Accept
- Request Changes
- Decline

---

# Invoice Workflow

Only after quotation acceptance.

System automatically creates:

- Invoice Number
- PDF Invoice
- Invoice Record

Status

```
Unpaid
```

The invoice is linked to

- Customer
- Booking
- Accepted Quote

---

# Job Assignment Workflow

Once the quotation has been accepted and the invoice has been created, the admin assigns a cleaner.

Admin selects

- Cleaner
- Scheduled Date
- Scheduled Time

System updates the booking status.

```
Assigned
```

---

# Secure Cleaner Link

After assigning the cleaner, the system generates a secure job link.

Example

```
https://domain.com/jobs/secure-token
```

The admin copies this link and sends it manually to the cleaner using WhatsApp.

No automatic WhatsApp integration is required for MVP.

---

# Cleaner Workflow

When the cleaner opens the secure link:

If already logged in

→ Redirect directly to the assigned job.

Otherwise

→ Redirect to Login.

After login

→ Automatically return to the assigned job.

The cleaner should only be able to access their assigned jobs.

Never another cleaner's jobs.

---

# Job Screen

The cleaner should see

Customer

- Name
- Address
- Phone

Job

- Service
- Notes
- Date
- Time

Actions

- Accept Job
- Decline Job
- Start Job
- Upload Before Photos
- Upload After Photos
- Add Notes
- Complete Job

---

# Before & After Evidence

Before beginning work

Cleaner uploads

- Before Images

After completing work

Cleaner uploads

- After Images

Images are stored against the booking.

Each image should include

- Timestamp
- Uploaded By
- Category

Categories

- Before
- After

---

# Job Completion

Cleaner presses

```
Complete Job
```

Status becomes

```
Completed Pending Review
```

The admin reviews the completed work.

After approval

Status becomes

```
Completed
```

---

# Payment Workflow

Admin records payment.

Supported payment methods

- Bank Transfer
- Cash

Invoice updates

```
Paid
```

---

# Supporting Features

These features support the core workflow.

## Dashboard

Show

- New Bookings
- Pending Quotations
- Pending Invoices
- Assigned Jobs
- Active Jobs
- Completed Jobs

---

## Cleaner Dashboard

Show

- Assigned Jobs
- Accepted Jobs
- Completed Jobs
- Declined Jobs

---

## Booking Management

Admin should be able to

- Search bookings
- Filter bookings
- View booking timeline
- View customer history

---

## Cleaner Management

Admin should be able to view

- Available cleaners
- Busy cleaners
- Completed jobs
- Current assignments
- Work history

---

## Communication

Maintain communication history between

Customer ↔ Company

Examples

- Booking discussions
- Quotation revisions
- Invoice questions

This history should remain attached to the booking.

---

# Status Workflow

Booking

```
New Enquiry
↓

Under Review
↓

Quotation Sent
↓

Quotation Accepted
↓

Invoice Generated
↓

Cleaner Assigned
↓

Cleaner Accepted
↓

In Progress
↓

Completed Pending Review
↓

Completed
↓

Paid
```

---

# MVP Success Criteria

The MVP is complete when the following workflow works end-to-end.

Customer

↓

Books a cleaning service

↓

Admin reviews booking

↓

Admin creates quotation

↓

Customer accepts quotation

↓

System generates invoice

↓

Admin assigns cleaner

↓

Admin copies secure job link

↓

Cleaner opens secure link

↓

Cleaner uploads before photos

↓

Cleaner completes work

↓

Cleaner uploads after photos

↓

Admin reviews completion

↓

Payment is recorded

↓

Job is closed

All additional features should support and improve this core workflow rather than replace or complicate it.