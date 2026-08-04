const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testQuoteInsert() {
  console.log("Testing quote creation with verified admin profile...");

  const adminUserId = "8cad2b38-c59a-4667-937d-2db0486817d4";

  // 1. Ensure admin profile exists in profiles table
  const { data: prof, error: profErr } = await adminSupabase
    .from("profiles")
    .upsert({
      id: adminUserId,
      role: "admin",
      full_name: "Company Admin",
    })
    .select();

  console.log("Admin Profile in DB:", prof, "Error:", profErr?.message);

  // 2. Fetch or create a test booking to attach quote to
  let { data: booking } = await adminSupabase.from("bookings").select("id").limit(1).maybeSingle();

  if (!booking) {
    // Create test customer
    const { data: cust } = await adminSupabase
      .from("customers")
      .insert({
        full_name: "Test Quote Customer",
        email: "testquote@example.com",
        phone: "+447000000000",
      })
      .select()
      .single();

    const { data: newB } = await adminSupabase
      .from("bookings")
      .insert({
        customer_id: cust.id,
        service_type: "Standard Domestic Cleaning",
        status: "pending_quotation",
        total_price: 150.0,
      })
      .select()
      .single();

    booking = newB;
  }

  console.log("Booking ID for quote:", booking.id);

  // 3. Test quote insertion with created_by = adminUserId
  const { data: newQuote, error: quoteErr } = await adminSupabase
    .from("quotes")
    .insert({
      booking_id: booking.id,
      version: 1,
      status: "draft",
      scope: "Test Scope",
      terms: "Test Terms",
      expiry_date: "2026-08-15",
      subtotal: 150,
      vat_amount: 0,
      total: 150,
      created_by: adminUserId,
    })
    .select("id, token")
    .single();

  console.log("🎉 Created Quote Result:", newQuote, "Error:", quoteErr?.message);
}

testQuoteInsert();
