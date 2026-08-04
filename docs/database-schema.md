# Database Schema

Complete database design for the Cleaning Company Management System.

---

## Enums

```sql
-- Booking / Job status
CREATE TYPE booking_status AS ENUM (
  'new_enquiry',
  'under_review',
  'quotation_sent',
  'quotation_accepted',
  'invoice_generated',
  'cleaner_assigned',
  'cleaner_accepted',
  'in_progress',
  'completed_pending_review',
  'completed',
  'paid',
  'cancelled',
  'rejected'
);

-- Quote status
CREATE TYPE quote_status AS ENUM (
  'draft',
  'sent',
  'viewed',
  'accepted',
  'change_requested',
  'declined',
  'expired'
);

-- Invoice status
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'issued',
  'unpaid',
  'part_paid',
  'paid',
  'overdue',
  'cancelled',
  'credited'
);

-- User role
CREATE TYPE user_role AS ENUM (
  'admin',
  'cleaner',
  'customer'
);

-- Payment method
CREATE TYPE payment_method AS ENUM (
  'bank_transfer',
  'cash'
);

-- Cleaner type
CREATE TYPE cleaner_type AS ENUM (
  'individual',
  'company'
);

-- Cleaner availability status
CREATE TYPE cleaner_status AS ENUM (
  'available',
  'busy',
  'inactive'
);

-- Photo category
CREATE TYPE photo_category AS ENUM (
  'booking_enquiry',
  'before',
  'after'
);

-- Property type
CREATE TYPE property_type AS ENUM (
  'house',
  'flat',
  'office',
  'commercial',
  'other'
);

-- Service type
CREATE TYPE service_type AS ENUM (
  'standard',
  'deep',
  'end_of_tenancy',
  'office',
  'commercial',
  'carpet',
  'one_off',
  'recurring'
);

-- Notification channel
CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'whatsapp'
);

-- Notification status
CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'failed'
);
```

---

## Tables

### profiles

Extends `auth.users`. Created automatically via trigger on new user signup.

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'customer',
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### services

Cleaning services offered by the company.

```sql
CREATE TABLE services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  service_type  service_type NOT NULL,
  base_price    NUMERIC(10,2),
  duration_mins INT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### cleaners

Cleaner profile (separate from profiles table for extended cleaner data).

```sql
CREATE TABLE cleaners (
  id            UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  cleaner_type  cleaner_type NOT NULL DEFAULT 'individual',
  company_name  TEXT,
  address       TEXT,
  service_areas TEXT[],
  status        cleaner_status NOT NULL DEFAULT 'available',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### customers

Customer profile.

```sql
CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name  TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email)
);
```

### customer_addresses

A customer can have multiple addresses.

```sql
CREATE TABLE customer_addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label         TEXT,  -- e.g. 'Home', 'Office'
  line1         TEXT NOT NULL,
  line2         TEXT,
  city          TEXT NOT NULL,
  postcode      TEXT NOT NULL,
  property_type property_type NOT NULL DEFAULT 'house',
  bedrooms      INT,
  bathrooms     INT,
  parking_notes TEXT,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### bookings

Core booking/enquiry record. Created when a customer submits a booking form.

```sql
CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference         TEXT NOT NULL UNIQUE,   -- e.g. CLS-2026-0001
  customer_id       UUID NOT NULL REFERENCES customers(id),
  address_id        UUID REFERENCES customer_addresses(id),
  service_id        UUID REFERENCES services(id),
  status            booking_status NOT NULL DEFAULT 'new_enquiry',

  -- Booking details
  service_type      service_type,
  property_type     property_type,
  bedrooms          INT,
  bathrooms         INT,
  commercial_area   TEXT,
  parking_notes     TEXT,
  preferred_date    DATE,
  arrival_window    TEXT,  -- e.g. 'Morning (8am–12pm)'
  alternative_date  DATE,
  required_tasks    TEXT,
  extras            TEXT,
  has_pets          BOOLEAN DEFAULT FALSE,
  has_hazards       BOOLEAN DEFAULT FALSE,
  key_arrangements  TEXT,
  alarm_details     TEXT,
  customer_notes    TEXT,

  -- Internal
  admin_notes       TEXT,
  rejected_reason   TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
```

### photos

Photos uploaded against a booking (enquiry photos, before/after job photos).

```sql
CREATE TABLE photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  storage_path TEXT NOT NULL,   -- Supabase Storage path
  category    photo_category NOT NULL,
  caption     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_booking_id ON photos(booking_id);
```

### quotes

Quote sent to a customer for a booking.

```sql
CREATE TABLE quotes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  version       INT NOT NULL DEFAULT 1,
  status        quote_status NOT NULL DEFAULT 'draft',
  token         UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),  -- public access token

  -- Content
  scope         TEXT,
  terms         TEXT,
  expiry_date   DATE NOT NULL,
  appointment_date DATE,
  appointment_time TEXT,
  discount_amount  NUMERIC(10,2) DEFAULT 0,
  vat_rate      NUMERIC(5,2) DEFAULT 0,   -- percentage, e.g. 20.00
  subtotal      NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  total         NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Tracking
  sent_at       TIMESTAMPTZ,
  viewed_at     TIMESTAMPTZ,

  -- Acceptance
  accepted_at   TIMESTAMPTZ,
  accepted_ip   TEXT,
  accepted_device TEXT,

  created_by    UUID NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_booking_id ON quotes(booking_id);
CREATE INDEX idx_quotes_token ON quotes(token);
```

### quote_items

Line items within a quote.

```sql
CREATE TABLE quote_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id    UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    NUMERIC(8,2) NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10,2) NOT NULL,
  total       NUMERIC(10,2) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0
);
```

### invoices

Invoice generated on quote acceptance.

```sql
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT NOT NULL UNIQUE,  -- INV-2026-0001
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  quote_id        UUID NOT NULL REFERENCES quotes(id),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  token           UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),  -- public access token
  status          invoice_status NOT NULL DEFAULT 'unpaid',

  subtotal        NUMERIC(10,2) NOT NULL,
  vat_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  amount_paid     NUMERIC(10,2) NOT NULL DEFAULT 0,

  due_date        DATE,
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at         TIMESTAMPTZ,

  notes           TEXT,
  pdf_path        TEXT,  -- Supabase Storage path

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### payments

Payment records linked to an invoice.

```sql
CREATE TABLE payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id     UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL,
  method         payment_method NOT NULL,
  reference      TEXT,  -- bank transfer ref or cash receipt note
  notes          TEXT,
  recorded_by    UUID NOT NULL REFERENCES profiles(id),
  payment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### jobs

A job is created when a cleaner is assigned to a booking. Tracks the operational side.

```sql
CREATE TABLE jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL UNIQUE REFERENCES bookings(id),
  cleaner_id      UUID REFERENCES cleaners(id),
  secure_token    UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

  scheduled_date  DATE,
  scheduled_time  TEXT,

  accepted_at     TIMESTAMPTZ,
  declined_at     TIMESTAMPTZ,
  declined_reason TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,

  cleaner_notes   TEXT,
  admin_notes     TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_cleaner_id ON jobs(cleaner_id);
CREATE INDEX idx_jobs_secure_token ON jobs(secure_token);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
```

### audit_logs

Immutable audit trail. Every status change and significant action.

```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_role  user_role,
  action      TEXT NOT NULL,       -- e.g. 'booking.status_changed'
  record_type TEXT NOT NULL,       -- e.g. 'bookings'
  record_id   UUID NOT NULL,
  old_value   JSONB,
  new_value   JSONB,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_record ON audit_logs(record_type, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### notifications

Notification delivery tracking.

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel     notification_channel NOT NULL,
  recipient_address TEXT NOT NULL,  -- email or phone
  subject     TEXT,
  body        TEXT,
  status      notification_status NOT NULL DEFAULT 'pending',
  external_id TEXT,    -- provider message ID
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### settings

Application-level settings (company info, notification config, etc.)

```sql
CREATE TABLE settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Storage Buckets

| Bucket | Access | Contents |
|---|---|---|
| `booking-photos` | Private | Photos uploaded at booking enquiry (customer uploads) |
| `job-photos` | Private | Before/after photos uploaded by cleaners |

### Bucket Policies

**booking-photos:**
- Admin: read + write all
- Customer: write own booking photos (insert only, based on booking ownership)
- Cleaner: no access

**job-photos:**
- Admin: read all
- Cleaner: write own job photos (insert only, based on job assignment)

---

## Key Relationships

```
auth.users
  └─ profiles (1:1)
       ├─ customers (1:1, via profile_id — optional for guest bookings)
       └─ cleaners (1:1)

customers
  ├─ customer_addresses (1:many)
  └─ bookings (1:many)
       ├─ photos (1:many)
       ├─ quotes (1:many)
       │    └─ quote_items (1:many)
       ├─ invoices (1:1)
       │    └─ payments (1:many)
       └─ jobs (1:1)

profiles → audit_logs (actor)
bookings → audit_logs (record)
```

---

## Triggers

### Auto-create profile on signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

### Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
-- (repeat for: profiles, customers, services, cleaners, quotes, invoices, jobs, settings)
```

### Sequential booking reference

```sql
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM bookings WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.reference = 'CLS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE PROCEDURE generate_booking_reference();
```

### Sequential invoice number

```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM invoices WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE PROCEDURE generate_invoice_number();
```

---

## RLS Policies

### profiles

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles: own read" ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles: own update" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles: admin read all" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

### bookings

```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "bookings: admin all" ON bookings
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Customers can read their own bookings
CREATE POLICY "bookings: customer read own" ON bookings FOR SELECT
  USING (customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid()));
```

### jobs

```sql
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "jobs: admin all" ON jobs
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Cleaners can only see/update their own assigned jobs
CREATE POLICY "jobs: cleaner own read" ON jobs FOR SELECT
  USING (cleaner_id = auth.uid());

CREATE POLICY "jobs: cleaner own update" ON jobs FOR UPDATE
  USING (cleaner_id = auth.uid());
```

### quotes

```sql
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "quotes: admin all" ON quotes
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Public token access handled at application layer (no RLS bypass needed)
-- Customer quote acceptance goes through a Server Action that validates the token
```

### photos

```sql
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos: admin all" ON photos
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "photos: cleaner own" ON photos FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "photos: cleaner read own jobs" ON photos FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN jobs j ON j.booking_id = b.id
      WHERE j.cleaner_id = auth.uid()
    )
  );
```

### audit_logs (insert-only for all authenticated users)

```sql
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs: admin read all" ON audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Inserts happen via SECURITY DEFINER functions only
```

---

## Indexes Summary

| Table | Index |
|---|---|
| bookings | customer_id, status, created_at DESC |
| photos | booking_id |
| quotes | booking_id, token |
| invoices | booking_id, customer_id, status |
| jobs | cleaner_id, secure_token, scheduled_date |
| audit_logs | (record_type, record_id), created_at DESC |
