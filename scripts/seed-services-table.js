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
    title: "Standard Domestic Cleaning",
    price: "From £80",
    duration: "2 hours",
    description: "Regular home cleaning for kitchens, bathrooms, and living areas.",
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
    price: "From £150",
    duration: "4 hours",
    description: "Thorough deep clean including appliances and hard-to-reach areas.",
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
    price: "From £220",
    duration: "6 hours",
    description: "Deposit guarantee clean matching landlord standards.",
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
    price: "From £120",
    duration: "3 hours",
    description: "Professional workspace sanitisation and care.",
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

async function seedServicesTable() {
  console.log("Checking and seeding services table in Supabase Cloud...");

  const { data: existing, error: selectErr } = await adminSupabase.from("services").select("*");

  console.log("Existing services count:", existing?.length, "Error:", selectErr?.message);

  if (!existing || existing.length === 0) {
    console.log("Seeding initial services...");
    const { data: inserted, error: insertErr } = await adminSupabase
      .from("services")
      .insert(defaultServices)
      .select("*");

    console.log("Inserted services:", inserted?.length, "Error:", insertErr?.message);
  }
}

seedServicesTable();
