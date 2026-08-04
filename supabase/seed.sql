-- Seed initial services into local Supabase database

INSERT INTO public.services (id, name, description, service_type, base_price, duration_mins, is_active)
VALUES
  (gen_random_uuid(), 'Standard Cleaning', 'Regular domestic cleaning covering living areas, kitchen, bathrooms, and dusting.', 'standard', 80.00, 120, true),
  (gen_random_uuid(), 'Deep Cleaning', 'Thorough deep clean including inside appliances, skirting boards, windows, and detailed scrubbing.', 'deep', 150.00, 240, true),
  (gen_random_uuid(), 'End of Tenancy', 'Comprehensive move-in/move-out clean designed to meet landlord and estate agent deposit standards.', 'end_of_tenancy', 220.00, 360, true),
  (gen_random_uuid(), 'Office Cleaning', 'Professional office space cleaning, desk sanitisation, kitchen area, and waste disposal.', 'office', 120.00, 180, true),
  (gen_random_uuid(), 'Commercial Cleaning', 'Custom cleaning solutions for commercial properties, retail spaces, and venues.', 'commercial', 250.00, 300, true),
  (gen_random_uuid(), 'Carpet Cleaning', 'Hot water extraction and deep steam cleaning for carpets and rugs.', 'carpet', 90.00, 120, true)
ON CONFLICT DO NOTHING;
