const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function testAcceptInvoice() {
  const token = "cd74badb-895a-4542-8ae1-d89a6f7c843e"; // or check accepted quote
  const { data: quote, error: findErr } = await adminSupabase
    .from("quotes")
    .select("id, booking_id, total, status, booking:bookings(customer_id)")
    .eq("id", "aa77ea9e-3fcf-4296-8a42-6b94c8d833bc")
    .single();

  console.log("Quote found:", quote, "Error:", findErr?.message);

  const invRef = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const customerId = quote?.booking?.customer_id || null;

  const insertPayload = {
    invoice_number: invRef,
    customer_id: customerId,
    booking_id: quote.booking_id,
    quote_id: quote.id,
    status: "unpaid",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: dueDate.toISOString().split("T")[0],
    subtotal: quote.total,
    tax_amount: 0,
    total_amount: quote.total,
    amount_paid: 0,
    balance_due: quote.total,
  };

  const { data: invoice, error: invErr } = await adminSupabase
    .from("invoices")
    .insert(insertPayload)
    .select("*, booking:bookings(*, customer:customers(*))")
    .single();

  console.log("Invoice Insert Result:", invoice, "Error:", invErr?.message);
}

testAcceptInvoice();
