const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createReviewsTable() {
  console.log("Creating/Checking public.reviews table in Supabase Cloud...");

  // Try creating a test row or executing SQL via rpc if available
  const { data, error } = await adminSupabase.from("reviews").select("*").limit(1);

  console.log("Select from reviews result:", data, "Error:", error?.message);

  if (error && error.message.includes("does not exist")) {
    console.log("Attempting SQL execute if rpc exists...");
    const { error: rpcErr } = await adminSupabase.rpc("exec_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          booking_id UUID,
          customer_name TEXT NOT NULL,
          rating INT NOT NULL DEFAULT 5,
          title TEXT,
          comment TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `,
    });
    console.log("RPC exec result error:", rpcErr?.message);
  }
}

createReviewsTable();
