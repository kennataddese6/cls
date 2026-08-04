-- Create default admin account in local Supabase Auth
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  reauthentication_token,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@cleaningcompany.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin","full_name":"Company Admin"}',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Ensure profile role is admin
INSERT INTO public.profiles (id, role, full_name, phone)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin',
  'Company Admin',
  '+44 7700 900000'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Company Admin';
