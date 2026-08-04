const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listTables() {
  const tables = [
    "bookings",
    "quotes",
    "jobs",
    "invoices",
    "customers",
    "cleaners",
    "profiles",
    "audit_logs",
    "customer_addresses",
    "photos",
    "services",
    "reviews",
    "cleaner_ratings",
    "comments",
  ];

  for (const t of tables) {
    const { data, error } = await adminSupabase.from(t).select("id").limit(1);
    console.log(`Table '${t}':`, error ? `ERROR (${error.message})` : `EXISTS (${data?.length} rows)`);
  }
}

listTables();
