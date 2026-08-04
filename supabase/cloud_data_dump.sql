--
-- PostgreSQL database dump
--

\restrict yQrxy72KUxOjzCgzBT9qEmU2meUR82J20axViAFpMns9nNkJxkXZoCI91cLeBM5

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.booking_status AS ENUM (
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


--
-- Name: cleaner_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.cleaner_status AS ENUM (
    'available',
    'busy',
    'inactive'
);


--
-- Name: cleaner_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.cleaner_type AS ENUM (
    'individual',
    'company'
);


--
-- Name: invoice_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invoice_status AS ENUM (
    'draft',
    'issued',
    'unpaid',
    'part_paid',
    'paid',
    'overdue',
    'cancelled',
    'credited'
);


--
-- Name: notification_channel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_channel AS ENUM (
    'email',
    'sms',
    'whatsapp'
);


--
-- Name: notification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'failed'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'bank_transfer',
    'cash'
);


--
-- Name: photo_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.photo_category AS ENUM (
    'booking_enquiry',
    'before',
    'after'
);


--
-- Name: property_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.property_type AS ENUM (
    'house',
    'flat',
    'office',
    'commercial',
    'other'
);


--
-- Name: quote_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quote_status AS ENUM (
    'draft',
    'sent',
    'viewed',
    'accepted',
    'change_requested',
    'declined',
    'expired'
);


--
-- Name: service_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.service_type AS ENUM (
    'standard',
    'deep',
    'end_of_tenancy',
    'office',
    'commercial',
    'carpet',
    'one_off',
    'recurring'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'cleaner',
    'customer'
);


--
-- Name: generate_booking_reference(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_booking_reference() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM bookings WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.reference = 'CLS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


--
-- Name: generate_invoice_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_invoice_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM invoices WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer'::public.user_role),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    actor_role public.user_role,
    action text NOT NULL,
    record_type text NOT NULL,
    record_id uuid NOT NULL,
    old_value jsonb,
    new_value jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference text NOT NULL,
    customer_id uuid NOT NULL,
    address_id uuid,
    service_id uuid,
    status public.booking_status DEFAULT 'new_enquiry'::public.booking_status NOT NULL,
    service_type public.service_type,
    property_type public.property_type,
    bedrooms integer,
    bathrooms integer,
    commercial_area text,
    parking_notes text,
    preferred_date date,
    arrival_window text,
    alternative_date date,
    required_tasks text,
    extras text,
    has_pets boolean DEFAULT false,
    has_hazards boolean DEFAULT false,
    key_arrangements text,
    alarm_details text,
    customer_notes text,
    admin_notes text,
    rejected_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cleaners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cleaners (
    id uuid NOT NULL,
    cleaner_type public.cleaner_type DEFAULT 'individual'::public.cleaner_type NOT NULL,
    company_name text,
    address text,
    service_areas text[],
    status public.cleaner_status DEFAULT 'available'::public.cleaner_status NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    label text,
    line1 text NOT NULL,
    line2 text,
    city text NOT NULL,
    postcode text NOT NULL,
    property_type public.property_type DEFAULT 'house'::public.property_type NOT NULL,
    bedrooms integer,
    bathrooms integer,
    parking_notes text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number text NOT NULL,
    booking_id uuid NOT NULL,
    quote_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    token uuid DEFAULT gen_random_uuid() NOT NULL,
    status public.invoice_status DEFAULT 'unpaid'::public.invoice_status NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    vat_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    amount_paid numeric(10,2) DEFAULT 0 NOT NULL,
    due_date date,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    paid_at timestamp with time zone,
    notes text,
    pdf_path text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    cleaner_id uuid,
    secure_token uuid DEFAULT gen_random_uuid() NOT NULL,
    scheduled_date date,
    scheduled_time text,
    accepted_at timestamp with time zone,
    declined_at timestamp with time zone,
    declined_reason text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    cleaner_notes text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid,
    channel public.notification_channel NOT NULL,
    recipient_address text NOT NULL,
    subject text,
    body text,
    status public.notification_status DEFAULT 'pending'::public.notification_status NOT NULL,
    external_id text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    method public.payment_method NOT NULL,
    reference text,
    notes text,
    recorded_by uuid NOT NULL,
    payment_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    uploaded_by uuid NOT NULL,
    storage_path text NOT NULL,
    category public.photo_category NOT NULL,
    caption text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    role public.user_role DEFAULT 'customer'::public.user_role NOT NULL,
    full_name text,
    phone text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email text
);


--
-- Name: quote_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quote_id uuid NOT NULL,
    description text NOT NULL,
    quantity numeric(8,2) DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    status public.quote_status DEFAULT 'draft'::public.quote_status NOT NULL,
    token uuid DEFAULT gen_random_uuid() NOT NULL,
    scope text,
    terms text,
    expiry_date date NOT NULL,
    appointment_date date,
    appointment_time text,
    discount_amount numeric(10,2) DEFAULT 0,
    vat_rate numeric(5,2) DEFAULT 0,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    vat_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    sent_at timestamp with time zone,
    viewed_at timestamp with time zone,
    accepted_at timestamp with time zone,
    accepted_ip text,
    accepted_device text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    service_type public.service_type NOT NULL,
    base_price numeric(10,2),
    duration_mins integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, actor_id, actor_role, action, record_type, record_id, old_value, new_value, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, reference, customer_id, address_id, service_id, status, service_type, property_type, bedrooms, bathrooms, commercial_area, parking_notes, preferred_date, arrival_window, alternative_date, required_tasks, extras, has_pets, has_hazards, key_arrangements, alarm_details, customer_notes, admin_notes, rejected_reason, created_at, updated_at) FROM stdin;
ce1605d4-c887-4759-9041-e3f9315b300d	CLS-2026-0001	73aee61a-b4d6-4686-a78e-de28fe1ec5bc	dbffaa5e-cca4-425d-b928-e72b8f0f7292	\N	completed	deep	house	2	1	\N		2026-08-06	Morning (08:00 - 12:00)	2026-08-20			f	f		\N	fdafsa	\N	\N	2026-08-04 12:52:29.1133+00	2026-08-04 14:50:58.820889+00
\.


--
-- Data for Name: cleaners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cleaners (id, cleaner_type, company_name, address, service_areas, status, notes, created_at, updated_at) FROM stdin;
e2b2d893-b35a-4e50-8715-9030290465e3	individual	\N	\N	{"North London","Central London"}	available	\N	2026-08-04 12:58:46.520268+00	2026-08-04 12:58:46.520268+00
\.


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_addresses (id, customer_id, label, line1, line2, city, postcode, property_type, bedrooms, bathrooms, parking_notes, is_default, created_at) FROM stdin;
dbffaa5e-cca4-425d-b928-e72b8f0f7292	73aee61a-b4d6-4686-a78e-de28fe1ec5bc	\N	Yeka	\N	London	1000	house	2	1		f	2026-08-04 12:52:29.086632+00
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, profile_id, full_name, email, phone, notes, created_at, updated_at) FROM stdin;
73aee61a-b4d6-4686-a78e-de28fe1ec5bc	\N	Kenna Taddese	kennataddese6@gmail.com	+251991374186	\N	2026-08-04 12:52:29.060936+00	2026-08-04 12:52:29.060936+00
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, invoice_number, booking_id, quote_id, customer_id, token, status, subtotal, vat_amount, total, amount_paid, due_date, issued_at, paid_at, notes, pdf_path, created_at, updated_at) FROM stdin;
42dc6118-b244-4424-a70a-2783b89c5a21	INV-2026-0001	ce1605d4-c887-4759-9041-e3f9315b300d	f858bf4b-20b5-42e7-80e5-fecf53d37baa	73aee61a-b4d6-4686-a78e-de28fe1ec5bc	9fd2be3e-fea0-4de8-8fa1-e87bdc469d0a	paid	80.00	16.00	96.00	96.00	2026-08-11	2026-08-04 12:55:40.335682+00	2026-08-04 12:56:27.146+00	\N	\N	2026-08-04 12:55:40.335682+00	2026-08-04 12:56:27.150973+00
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobs (id, booking_id, cleaner_id, secure_token, scheduled_date, scheduled_time, accepted_at, declined_at, declined_reason, started_at, completed_at, cleaner_notes, admin_notes, created_at, updated_at) FROM stdin;
2b18a206-88d5-499a-9a67-0fa5dae398b5	ce1605d4-c887-4759-9041-e3f9315b300d	e2b2d893-b35a-4e50-8715-9030290465e3	b6f6ed5b-d34f-4d34-9f83-08860e0f29f9	2026-08-06	Morning (08:00 - 12:00)	2026-08-04 14:34:55.285+00	\N	\N	2026-08-04 14:38:00.116+00	2026-08-04 14:48:23.53+00		\N	2026-08-04 13:08:45.600604+00	2026-08-04 14:48:23.539837+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, recipient_id, channel, recipient_address, subject, body, status, external_id, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, invoice_id, amount, method, reference, notes, recorded_by, payment_date, created_at) FROM stdin;
6010b3bf-9dd2-48af-be94-040e13af379e	42dc6118-b244-4424-a70a-2783b89c5a21	96.00	bank_transfer	\N	\N	a0000000-0000-0000-0000-000000000001	2026-08-04	2026-08-04 12:56:27.141175+00
\.


--
-- Data for Name: photos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.photos (id, booking_id, uploaded_by, storage_path, category, caption, created_at) FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, role, full_name, phone, avatar_url, created_at, updated_at, email) FROM stdin;
a0000000-0000-0000-0000-000000000001	admin	Company Admin	\N	\N	2026-08-04 10:56:57.801325+00	2026-08-04 12:46:22.658048+00	admin@cleaningcompany.com
e2b2d893-b35a-4e50-8715-9030290465e3	cleaner	Kenna Taddese	+251991374186	\N	2026-08-04 12:58:46.315867+00	2026-08-04 12:58:46.455224+00	kennataddese6@gmail.com
\.


--
-- Data for Name: quote_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_items (id, quote_id, description, quantity, unit_price, total, sort_order) FROM stdin;
51f56696-fac1-44c6-a0cc-039a86a4075a	f858bf4b-20b5-42e7-80e5-fecf53d37baa	Standard Cleaning Service	1.00	80.00	80.00	0
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotes (id, booking_id, version, status, token, scope, terms, expiry_date, appointment_date, appointment_time, discount_amount, vat_rate, subtotal, vat_amount, total, sent_at, viewed_at, accepted_at, accepted_ip, accepted_device, created_by, created_at, updated_at) FROM stdin;
f858bf4b-20b5-42e7-80e5-fecf53d37baa	ce1605d4-c887-4759-9041-e3f9315b300d	1	accepted	c8e4581b-5fd1-4b39-b6c4-5532500f58e8	Professional domestic/commercial cleaning service as agreed.	Payment due upon completion of service. Quotation valid for 14 days from issue.	2026-08-18	2026-08-07	Morning (09:00 AM)	0.00	20.00	80.00	16.00	96.00	2026-08-04 12:54:52.878+00	2026-08-04 12:55:05.672+00	2026-08-04 12:55:40.242+00	\N	\N	a0000000-0000-0000-0000-000000000001	2026-08-04 12:54:52.914176+00	2026-08-04 12:55:40.256721+00
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, name, description, service_type, base_price, duration_mins, is_active, created_at, updated_at) FROM stdin;
3e6306c8-1a6f-420d-83a1-20407c738d6a	Standard Cleaning	Regular domestic cleaning covering living areas, kitchen, bathrooms, and dusting.	standard	80.00	120	t	2026-08-04 10:56:09.377038+00	2026-08-04 10:56:09.377038+00
29963c6b-a0cf-43f7-91ca-9eea969c02f3	Deep Cleaning	Thorough deep clean including inside appliances, skirting boards, windows, and detailed scrubbing.	deep	150.00	240	t	2026-08-04 10:56:09.377038+00	2026-08-04 10:56:09.377038+00
2f6d2667-a2c8-464c-a3ee-33982231419a	End of Tenancy	Comprehensive move-in/move-out clean designed to meet landlord and estate agent deposit standards.	end_of_tenancy	220.00	360	t	2026-08-04 10:56:09.377038+00	2026-08-04 10:56:09.377038+00
f6fc84f9-3c1d-4345-8f7f-49e36bdcbf3a	Office Cleaning	Professional office space cleaning, desk sanitisation, kitchen area, and waste disposal.	office	120.00	180	t	2026-08-04 10:56:09.377038+00	2026-08-04 10:56:09.377038+00
56cf6b7d-0a9d-4e65-b2f6-55be06b33c58	Commercial Cleaning	Custom cleaning solutions for commercial properties, retail spaces, and venues.	commercial	250.00	300	t	2026-08-04 10:56:09.377038+00	2026-08-04 10:56:09.377038+00
ec33244f-5d55-4df5-a425-3458fd83a0e5	Carpet Cleaning	Hot water extraction and deep steam cleaning for carpets and rugs.	carpet	90.00	120	t	2026-08-04 10:56:09.377038+00	2026-08-04 10:56:09.377038+00
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (key, value, updated_at) FROM stdin;
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_reference_key UNIQUE (reference);


--
-- Name: cleaners cleaners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_pkey PRIMARY KEY (id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_token_key UNIQUE (token);


--
-- Name: jobs jobs_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_booking_id_key UNIQUE (booking_id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_secure_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_secure_token_key UNIQUE (secure_token);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: quote_items quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_token_key UNIQUE (token);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_record; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_record ON public.audit_logs USING btree (record_type, record_id);


--
-- Name: idx_bookings_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_created_at ON public.bookings USING btree (created_at DESC);


--
-- Name: idx_bookings_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_customer_id ON public.bookings USING btree (customer_id);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_invoices_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_booking_id ON public.invoices USING btree (booking_id);


--
-- Name: idx_invoices_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_customer_id ON public.invoices USING btree (customer_id);


--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);


--
-- Name: idx_jobs_cleaner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_cleaner_id ON public.jobs USING btree (cleaner_id);


--
-- Name: idx_jobs_scheduled_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_scheduled_date ON public.jobs USING btree (scheduled_date);


--
-- Name: idx_jobs_secure_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_jobs_secure_token ON public.jobs USING btree (secure_token);


--
-- Name: idx_photos_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_photos_booking_id ON public.photos USING btree (booking_id);


--
-- Name: idx_quotes_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_booking_id ON public.quotes USING btree (booking_id);


--
-- Name: idx_quotes_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_token ON public.quotes USING btree (token);


--
-- Name: bookings set_booking_reference; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_booking_reference BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.generate_booking_reference();


--
-- Name: invoices set_invoice_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_invoice_number BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();


--
-- Name: bookings set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: cleaners set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cleaners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: customers set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: invoices set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: jobs set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: profiles set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: quotes set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: services set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: audit_logs audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.customer_addresses(id);


--
-- Name: bookings bookings_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: bookings bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: cleaners cleaners_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customers customers_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: invoices invoices_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id);


--
-- Name: jobs jobs_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: jobs jobs_cleaner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_cleaner_id_fkey FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: payments payments_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.profiles(id);


--
-- Name: photos photos_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: photos photos_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: quote_items quote_items_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs audit_logs_admin_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY audit_logs_admin_read ON public.audit_logs FOR SELECT USING (public.is_admin());


--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings bookings_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bookings_admin_all ON public.bookings USING (public.is_admin());


--
-- Name: bookings bookings_customer_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bookings_customer_read ON public.bookings FOR SELECT USING ((customer_id IN ( SELECT customers.id
   FROM public.customers
  WHERE (customers.profile_id = auth.uid()))));


--
-- Name: bookings bookings_public_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bookings_public_insert ON public.bookings FOR INSERT WITH CHECK (true);


--
-- Name: bookings bookings_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY bookings_public_select ON public.bookings FOR SELECT USING (true);


--
-- Name: cleaners; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cleaners ENABLE ROW LEVEL SECURITY;

--
-- Name: cleaners cleaners_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cleaners_admin_all ON public.cleaners USING (public.is_admin());


--
-- Name: cleaners cleaners_read_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY cleaners_read_own ON public.cleaners FOR SELECT USING ((id = auth.uid()));


--
-- Name: customer_addresses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_addresses customer_addresses_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customer_addresses_admin_all ON public.customer_addresses USING (public.is_admin());


--
-- Name: customer_addresses customer_addresses_public_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customer_addresses_public_insert ON public.customer_addresses FOR INSERT WITH CHECK (true);


--
-- Name: customer_addresses customer_addresses_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customer_addresses_public_select ON public.customer_addresses FOR SELECT USING (true);


--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- Name: customers customers_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customers_admin_all ON public.customers USING (public.is_admin());


--
-- Name: customers customers_public_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customers_public_insert ON public.customers FOR INSERT WITH CHECK (true);


--
-- Name: customers customers_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customers_public_select ON public.customers FOR SELECT USING (true);


--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices invoices_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY invoices_admin_all ON public.invoices USING (public.is_admin());


--
-- Name: invoices invoices_public_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY invoices_public_insert ON public.invoices FOR INSERT WITH CHECK (true);


--
-- Name: invoices invoices_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY invoices_public_select ON public.invoices FOR SELECT USING (true);


--
-- Name: jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: jobs jobs_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY jobs_admin_all ON public.jobs USING (public.is_admin());


--
-- Name: jobs jobs_cleaner_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY jobs_cleaner_read ON public.jobs FOR SELECT USING ((cleaner_id = auth.uid()));


--
-- Name: jobs jobs_cleaner_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY jobs_cleaner_update ON public.jobs FOR UPDATE USING ((cleaner_id = auth.uid()));


--
-- Name: jobs jobs_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY jobs_public_select ON public.jobs FOR SELECT USING (true);


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_admin_all ON public.notifications USING (public.is_admin());


--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: payments payments_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY payments_admin_all ON public.payments USING (public.is_admin());


--
-- Name: photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

--
-- Name: photos photos_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY photos_admin_all ON public.photos USING (public.is_admin());


--
-- Name: photos photos_cleaner_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY photos_cleaner_insert ON public.photos FOR INSERT WITH CHECK ((uploaded_by = auth.uid()));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_admin_all ON public.profiles USING (public.is_admin());


--
-- Name: profiles profiles_own_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_own_update ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: profiles profiles_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (true);


--
-- Name: quote_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_items quote_items_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY quote_items_admin_all ON public.quote_items USING (public.is_admin());


--
-- Name: quote_items quote_items_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY quote_items_public_select ON public.quote_items FOR SELECT USING (true);


--
-- Name: quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: quotes quotes_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY quotes_admin_all ON public.quotes USING (public.is_admin());


--
-- Name: quotes quotes_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY quotes_public_select ON public.quotes FOR SELECT USING (true);


--
-- Name: quotes quotes_public_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY quotes_public_update ON public.quotes FOR UPDATE USING (true);


--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- Name: services services_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY services_admin_all ON public.services USING (public.is_admin());


--
-- Name: services services_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY services_public_read ON public.services FOR SELECT USING ((is_active = true));


--
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- Name: settings settings_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY settings_admin_all ON public.settings USING (public.is_admin());


--
-- PostgreSQL database dump complete
--

\unrestrict yQrxy72KUxOjzCgzBT9qEmU2meUR82J20axViAFpMns9nNkJxkXZoCI91cLeBM5

--
-- PostgreSQL database dump
--

\restrict c5JY7RB4opyLa7QkUIWDUMDmkDbugLtscnHWewkOtPMFNCduZlsZJOkTF6GZB7A

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	a0000000-0000-0000-0000-000000000001	authenticated	authenticated	admin@cleaningcompany.com	$2a$06$gx2qHU7/fIfQ9o3Nlr/8Heqd6JwLrBkgutO6l9ZI7R6umlKzEW/G2	2026-08-04 10:56:57.801325+00	\N		\N		\N			\N	2026-08-04 14:31:19.387646+00	{"provider": "email", "providers": ["email"]}	{"role": "admin", "full_name": "Company Admin"}	\N	2026-08-04 10:56:57.801325+00	2026-08-04 14:31:19.400109+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e2b2d893-b35a-4e50-8715-9030290465e3	authenticated	authenticated	kennataddese6@gmail.com	$2a$10$/aRjxbuGQFJeha63ZRXSaeRdgz25xcyqM1mwK/IjHqWXqxPTfJNWy	2026-08-04 14:34:18.947933+00	\N		\N		\N			\N	2026-08-04 14:34:42.824856+00	{"provider": "email", "providers": ["email"]}	{"role": "cleaner", "full_name": "Kenna Taddese", "email_verified": true}	\N	2026-08-04 12:58:46.316148+00	2026-08-04 14:34:42.829937+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
e2b2d893-b35a-4e50-8715-9030290465e3	e2b2d893-b35a-4e50-8715-9030290465e3	{"sub": "e2b2d893-b35a-4e50-8715-9030290465e3", "email": "kennataddese6@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-04 12:58:46.318836+00	2026-08-04 12:58:46.31887+00	2026-08-04 12:58:46.31887+00	1931e7d1-743d-40f4-bc9a-2b0b0d07080f
\.


--
-- PostgreSQL database dump complete
--

\unrestrict c5JY7RB4opyLa7QkUIWDUMDmkDbugLtscnHWewkOtPMFNCduZlsZJOkTF6GZB7A

