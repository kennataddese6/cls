const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function inspectInvoices() {
  console.log("Inspecting existing invoices in Supabase Cloud...");

  const { data: invoices, error } = await adminSupabase
    .from("invoices")
    .select("*, booking:bookings(*, customer:customers(*))");

  console.log("Invoices Count:", invoices?.length, "Error:", error?.message);
  console.log("Invoices Data:", JSON.stringify(invoices, null, 2));

  // Check quotes
  const { data: quotes } = await adminSupabase.from("quotes").select("id, status, booking_id, total");
  console.log("Quotes Data:", quotes);
}

inspectInvoices();
