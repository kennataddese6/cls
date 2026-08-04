const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testStorageBucket() {
  console.log("Testing Supabase Storage bucket 'job-photos'...");

  const testBuffer = Buffer.from("test image content");
  const { data, error } = await adminSupabase.storage
    .from("job-photos")
    .upload("test/ping.txt", testBuffer, { upsert: true, contentType: "text/plain" });

  console.log("Upload result data:", data, "Error:", error?.message || error);

  if (error && error.message.includes("not found")) {
    console.log("Bucket job-photos not found. Creating bucket job-photos...");
    const { data: bucketData, error: bucketErr } = await adminSupabase.storage.createBucket("job-photos", {
      public: true,
    });
    console.log("Create bucket result:", bucketData, "Error:", bucketErr?.message);
  }
}

testStorageBucket();
