const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function verifyPhotoUrl() {
  const url =
    "https://nlfarcqrmpndesuljeme.supabase.co/storage/v1/object/public/job-photos/4f56752d-a48c-4ab8-9311-3b891f26f555/before_1785873535595.jpg";

  try {
    const res = await fetch(url);
    console.log("Fetch Status Code for photo URL:", res.status, res.statusText);
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

verifyPhotoUrl();
