const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function fixBucketPublic() {
  console.log("Checking buckets on Supabase Cloud...");

  const { data: buckets, error: getErr } = await adminSupabase.storage.listBuckets();
  console.log("Existing buckets:", buckets, "Error:", getErr?.message);

  // Update job-photos bucket to public: true
  const { data: updateData, error: updateErr } = await adminSupabase.storage.updateBucket("job-photos", {
    public: true,
  });

  console.log("Update bucket result:", updateData, "Error:", updateErr?.message);

  // Also update booking-photos if exists
  await adminSupabase.storage.updateBucket("booking-photos", { public: true }).catch(() => {});
}

fixBucketPublic();
