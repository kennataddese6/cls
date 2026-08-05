const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEFAULT_CHECKLISTS = {
  standard: [
    "Dusting all accessible surfaces and furniture",
    "Vacuuming carpets and rugs",
    "Wiping and mopping hard floor surfaces",
    "Sanitising kitchen countertops and sink",
    "Scrubbing toilets, basins, and showers",
    "Emptying waste bins",
  ],
  deep: [
    "Everything in Standard Cleaning",
    "Deep oven and range hood cleaning",
    "Wiping inside kitchen appliances",
    "Wiping doors, frames, and light switches",
    "Cleaning skirting boards and window sills",
    "Limescale and soap scum removal in bathrooms",
  ],
  end_of_tenancy: [
    "100% Deposit return guarantee clean",
    "Deep cleaning inside all cupboards & drawers",
    "Full kitchen and appliance degreasing",
    "Deep bathroom descaling and sanitisation",
    "Internal window and frame cleaning",
    "Timestamped before & after photo evidence report",
  ],
  office: [
    "Workstation and desk sanitisation",
    "Keyboard and phone sanitisation",
    "Staff kitchen and breakroom cleaning",
    "Restroom cleaning and restocking check",
    "High-traffic floor care and vacuuming",
    "Tailored cleaning schedules (daily/weekly)",
  ],
};

async function fixChecklistColumn() {
  console.log("Checking services table checklist column...");

  const { data: services, error } = await adminSupabase.from("services").select("*");

  console.log("Found services count:", services?.length, "Error:", error?.message);

  if (services && services.length > 0) {
    for (const s of services) {
      let key = "standard";
      const nameLower = (s.name || s.title || "").toLowerCase();
      if (nameLower.includes("deep")) key = "deep";
      else if (nameLower.includes("tenancy")) key = "end_of_tenancy";
      else if (nameLower.includes("office") || nameLower.includes("commercial")) key = "office";

      const list = DEFAULT_CHECKLISTS[key];

      const { error: updateErr } = await adminSupabase
        .from("services")
        .update({
          title: s.name || s.title || "Cleaning Service",
          price: s.price || `From £${s.base_price || 80}`,
          duration: s.duration || `${Math.round((s.duration_mins || 120) / 60)} hours`,
          checklist: list,
        })
        .eq("id", s.id);

      console.log(`Updated service '${s.name || s.title}':`, updateErr ? updateErr.message : "SUCCESS");
    }
  }
}

fixChecklistColumn();
