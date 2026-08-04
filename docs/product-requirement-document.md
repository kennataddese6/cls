# Cleaning Company Management System
Version: MVP v1.0

---

# Project Overview

## Goal
Build a web application for a cleaning company that allows:

- Customers to request cleaning services
- Admins to manage quotes, schedules, cleaners, invoices and payments
- Cleaners to receive and complete assigned jobs
- Automatic invoice generation
- Photo evidence management
- WhatsApp notifications

---

# User Roles

## Customer

Permissions

- Submit booking request
- Upload property photos
- Accept or decline quotations
- Select payment method
- View booking status
- View invoices

---

## Administrator

Permissions

- Manage enquiries
- Manage customers
- Create quotations
- Assign cleaners
- Manage schedules
- Review photos
- Generate invoices
- Record payments
- View reports

---

## Cleaner

Permissions

- View assigned jobs
- Accept or decline assignments
- Open navigation
- Upload before photos
- Upload after photos
- Add notes
- Update job status

---

## System

Responsibilities

- Generate unique job references
- Generate invoices
- Send notifications
- Store audit logs
- Manage secure links
- Enforce permissions

---

# Complete Workflow

## 1. Customer Booking

Customer

- Select service
- Enter property details
- Choose preferred date
- Describe work
- Upload optional photos

System

- Create Job Reference
- Status = New Enquiry
- Notify Admin

---

## 2. Quote Creation

Admin

- Review enquiry
- Contact customer if needed
- Create quotation

Quote includes

- Scope
- Price
- VAT
- Expiry
- Appointment

System sends

- Email
- SMS
- WhatsApp

---

## 3. Quote Acceptance

Customer may

- Accept
- Request Changes
- Decline

Acceptance requires

- Agree to Terms
- Select payment method

System stores

- Time
- IP Address
- Device
- Accepted quote version

---

## 4. Invoice Generation

Trigger

Customer accepts quotation

System

- Generate sequential invoice number
- Generate PDF
- Save invoice
- Email invoice

Initial Status

Unpaid

---

## 5. Job Assignment

Admin

- Select available cleaner
- Assign job

System

- Notify cleaner
- Generate secure WhatsApp link

---

## 6. Cleaner Workflow

Cleaner

- Accept or decline

If declined

- Return to Unassigned
- Notify Admin

If accepted

- Start job
- Upload before photos
- Complete checklist
- Upload after photos
- Add notes
- Submit completion

Status

Completed Pending Review

---

## 7. Customer Review

Customer

- Confirm satisfaction
- Report issue

Admin

- Review
- Close job

---

## 8. Payment

Payment Types

- Bank Transfer
- Cash After Cleaning

Admin

- Record payment

Invoice Status

Paid

Receipt

Optional

---

# Customer Booking Form

## Service

- Domestic
- Commercial
- Standard
- Deep
- End of Tenancy
- Office
- One-off
- Recurring

## Property

- Address
- Postcode
- Property Type
- Bedrooms
- Bathrooms
- Commercial Area
- Parking Notes

## Schedule

- Preferred Date
- Arrival Window
- Alternative Date

## Job Details

- Required Tasks
- Extras
- Pets
- Hazards
- Keys
- Alarm
- Notes

## Photos

Supported

- JPG
- PNG
- HEIC

Requirements

- Compress uploads
- Upload progress
- Consent notice

---

# Admin Dashboard

## Overview

Show

- New enquiries
- Quotes awaiting response
- Today's jobs
- Unassigned jobs
- Overdue invoices
- Open issues

---

## Enquiries

Features

- Search
- Filter
- Review photos
- Contact customer
- Create quote
- Reject spam

---

## Quotes

Features

- Line items
- Discounts
- VAT
- Version history
- Send
- Track opens
- Track acceptance

---

## Calendar

Features

- Day
- Week
- Month
- Drag and Drop Assignment
- Conflict Detection

---

## Jobs

Features

- Timeline
- Cleaner Notes
- Customer Notes
- Photos
- Status History

---

## Invoices

Features

- PDF Download
- Payment Recording
- Credit
- Cancel
- Audit Trail

---

# WhatsApp Integration

Triggers

- Job Assigned
- Job Accepted
- Job Declined
- Reminder
- Job Completed

Requirements

- Official WhatsApp Business API
- Store Message ID
- Store Delivery Status
- Retry Failed Messages

---

# Status Machines

## Enquiry

New Enquiry

↓

Under Review

↓

Quoted

Rejected

Cancelled

---

## Quote

Draft

↓

Sent

↓

Viewed

↓

Accepted

Declined

Expired

Change Requested

---

## Job

Unconfirmed

↓

Confirmed

↓

Unassigned

↓

Assigned

↓

Accepted

↓

In Progress

↓

Completed Pending Review

↓

Closed

Issue Raised

Cancelled

---

## Invoice

Draft

↓

Issued

↓

Unpaid

↓

Part Paid

↓

Paid

Overdue

Cancelled

Credited

---

# Core Data Models

## Customer

- ID
- Name
- Email
- Mobile
- Addresses
- Consent

## Cleaner

- ID
- Name
- Skills
- Areas
- Availability

## Job

- Reference
- Customer
- Service
- Schedule
- Cleaner
- Status

## Quote

- Version
- Line Items
- Total
- VAT
- Expiry

## Invoice

- Number
- Total
- Payment Method
- Status
- PDF

## Photo

- File ID
- Category
- Timestamp
- Caption

## Notification

- Channel
- Recipient
- Status
- Message ID

## Audit Log

- User
- Action
- Record
- Timestamp

---

# Security Requirements

- Role-based access
- HTTPS only
- Secure authentication
- Password reset
- Optional MFA for Admins
- Encrypted photo storage
- Expiring secure links
- File validation
- GDPR compliance
- Backups
- Error logging

---

# MVP Acceptance Criteria

- Customer can submit booking
- Admin can create quotation
- Customer can accept quotation
- Invoice generated automatically
- Admin can assign cleaner
- Cleaner can complete job
- Before/After photos stored
- Payments recorded
- Unauthorized access prevented

---

# Development Phases

## Phase 1

Foundation

- Authentication
- Database
- Roles
- Settings

## Phase 2

Customer Flow

- Booking
- Quotes
- Acceptance

## Phase 3

Operations

- Dashboard
- Scheduling
- Cleaner Portal

## Phase 4

Evidence

- Photos
- Checklist
- Completion

## Phase 5

Finance

- Invoices
- Payments

## Phase 6

Messaging & QA

- WhatsApp
- Retry Logic
- Audit Logs
- Security Testing

---

# Open Decisions

- Company branding
- Pricing rules
- VAT settings
- Customer accounts vs secure links
- Photo retention policy
- WhatsApp provider
- Cleaner payment details
- Hosting and maintenance