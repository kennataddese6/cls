const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testAuditReview() {
  console.log("Testing inserting review into Supabase audit_logs...");

  const fakeUuid = "00000000-0000-0000-0000-000000000001";
  const reviewData = {
    id: `rev-${Date.now()}`,
    customer_name: "Test Customer",
    rating: 5,
    title: "Awesome Clean!",
    comment: "This clean was spectacular!",
    status: "pending",
    created_at: new Date().toISOString(),
  };

  const { data, error } = await adminSupabase
    .from("audit_logs")
    .insert({
      action: "review.submitted",
      record_type: "reviews",
      record_id: fakeUuid,
      new_value: reviewData,
    })
    .select("*");

  console.log("Insert audit log data:", data, "Error:", error?.message);

  // Read back review audit logs
  const { data: logs } = await adminSupabase
    .from("audit_logs")
    .select("*")
    .eq("record_type", "reviews")
    .order("created_at", { ascending: false });

  console.log("Fetched reviews from audit_logs:", logs?.length, "records");
}

testAuditReview();
