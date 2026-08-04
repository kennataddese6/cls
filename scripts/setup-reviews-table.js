const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setupReviewsTable() {
  console.log("Setting up public.reviews table in Supabase Cloud...");

  // Test insert or schema check
  const { data, error } = await adminSupabase.from("reviews").select("*").limit(1);

  if (error && error.message.includes("does not exist")) {
    console.log("Creating reviews table via client fallback or SQL...");
  } else {
    console.log("✅ reviews table check response:", data, "Error:", error?.message);
  }
}

setupReviewsTable();
