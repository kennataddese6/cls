const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testPhotoInsert() {
  console.log("Testing insert into photos table...");

  // 1. Get first booking and first profile
  const { data: booking } = await adminSupabase.from("bookings").select("id").limit(1).single();
  const { data: profile } = await adminSupabase.from("profiles").select("id").limit(1).single();

  console.log("Booking ID:", booking?.id, "Profile ID:", profile?.id);

  if (!booking) {
    console.log("No bookings found in DB.");
    return;
  }

  // 2. Try inserting a photo record
  const { data, error } = await adminSupabase
    .from("photos")
    .insert({
      booking_id: booking.id,
      uploaded_by: profile?.id || null,
      storage_path: "test/test_before.jpg",
      category: "before",
    })
    .select("*");

  console.log("Insert result data:", data, "Error:", error);
}

testPhotoInsert();
