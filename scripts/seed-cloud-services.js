const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://nlfarcqrmpndesuljeme.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZmFyY3FybXBuZGVzdWxqZW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg1MzEwNCwiZXhwIjoyMTAxNDI5MTA0fQ._wWKCCROFrL0fmn6_9TUTJwwI-J4FJBT2ydbvBhXaQQ";

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEFAULT_SERVICES = [
  {
    title: "Standard Domestic Cleaning",
    price: "£80.00",
    base_price: 80,
    duration: "2 hours",
    estimated_duration_hours: 2,
    description: "Comprehensive home cleaning covering kitchens, bathrooms, living areas, and bedrooms.",
    checklist: [
      "Dusting all accessible surfaces and furniture",
      "Vacuuming carpets and rugs",
      "Wiping and mopping hard floor surfaces",
      "Sanitising kitchen countertops and sink",
      "Scrubbing toilets, basins, and showers",
      "Emptying waste bins",
    ],
  },
  {
    title: "Deep Spring Cleaning",
    price: "£150.00",
    base_price: 150,
    duration: "4 hours",
    estimated_duration_hours: 4,
    description: "Thorough deep clean targeting built-up dirt, limescale, appliances, and hard-to-reach spaces.",
    checklist: [
      "Everything in Standard Cleaning",
      "Deep oven and range hood cleaning",
      "Wiping inside kitchen appliances",
      "Wiping doors, frames, and light switches",
      "Cleaning skirting boards and window sills",
      "Limescale and soap scum removal in bathrooms",
    ],
  },
  {
    title: "End of Tenancy Cleaning",
    price: "£220.00",
    base_price: 220,
    duration: "6 hours",
    estimated_duration_hours: 6,
    description: "Strict deposit-guaranteed cleaning for tenants, estate agents, and landlords.",
    checklist: [
      "100% Deposit return guarantee clean",
      "Deep cleaning inside all cupboards & drawers",
      "Full kitchen and appliance degreasing",
      "Deep bathroom descaling and sanitisation",
      "Internal window and frame cleaning",
      "Timestamped before & after photo evidence report",
    ],
  },
  {
    title: "Office & Commercial Cleaning",
    price: "£120.00",
    base_price: 120,
    duration: "3 hours",
    estimated_duration_hours: 3,
    description: "Flexible, high-standard commercial cleaning for offices, clinics, and retail properties.",
    checklist: [
      "Workstation and desk sanitisation",
      "Keyboard and phone sanitisation",
      "Staff kitchen and breakroom cleaning",
      "Restroom cleaning and restocking check",
      "High-traffic floor care and vacuuming",
      "Tailored cleaning schedules (daily/weekly)",
    ],
  },
];

async function seedServices() {
  console.log("Seeding Services into Supabase Cloud database...");

  for (const s of DEFAULT_SERVICES) {
    const { data: existing } = await adminSupabase.from("services").select("id").eq("title", s.title).maybeSingle();

    if (existing) {
      console.log(`Service "${s.title}" already exists with ID:`, existing.id);
      const { error } = await adminSupabase.from("services").update(s).eq("id", existing.id);

      if (error) console.log("Update note:", error.message);
    } else {
      const { data: created, error } = await adminSupabase.from("services").insert(s).select().single();

      if (error) {
        console.log(`Insert note for "${s.title}":`, error.message);
        // Fallback insert without checklist/price if columns are absent
        const { data: fallback, error: fbErr } = await adminSupabase
          .from("services")
          .insert({
            title: s.title,
            base_price: s.base_price,
            estimated_duration_hours: s.estimated_duration_hours,
            description: s.description,
          })
          .select()
          .single();

        if (fallback) console.log(`✅ Fallback inserted "${s.title}" with ID:`, fallback.id);
        if (fbErr) console.log("Fallback error:", fbErr.message);
      } else if (created) {
        console.log(`✅ Seeded "${s.title}" with ID:`, created.id);
      }
    }
  }

  console.log("\n🎉 Services Seeding Complete!");
}

seedServices();
