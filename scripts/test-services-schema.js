const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const defaultServices = [
  {
    name: "Standard Domestic Cleaning",
    service_type: "standard",
    base_price: 80.0,
    duration_mins: 120,
    description: "Regular home cleaning for kitchens, bathrooms, and living areas.",
  },
  {
    name: "Deep Spring Cleaning",
    service_type: "deep",
    base_price: 150.0,
    duration_mins: 240,
    description: "Thorough deep clean including appliances and hard-to-reach areas.",
  },
  {
    name: "End of Tenancy Cleaning",
    service_type: "end_of_tenancy",
    base_price: 220.0,
    duration_mins: 360,
    description: "Deposit guarantee clean matching landlord standards.",
  },
  {
    name: "Office & Commercial Cleaning",
    service_type: "office",
    base_price: 120.0,
    duration_mins: 180,
    description: "Professional workspace sanitisation and care.",
  },
];

async function testServicesSchema() {
  console.log("Checking services in Supabase Cloud...");

  const { data: existing, error: err } = await adminSupabase.from("services").select("*");
  console.log("Existing rows count:", existing?.length, "Error:", err?.message);

  if (!existing || existing.length === 0) {
    console.log("Seeding default services into database...");
    const { data: inserted, error: insertErr } = await adminSupabase
      .from("services")
      .insert(defaultServices)
      .select("*");

    console.log("Inserted count:", inserted?.length, "Error:", insertErr?.message);
  }
}

testServicesSchema();
