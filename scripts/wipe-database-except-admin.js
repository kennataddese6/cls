const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function wipeDatabaseExceptAdmin() {
  console.log("🧹 Wiping Supabase Cloud database while preserving Admin account...\n");

  try {
    // 1. Get Admin User ID
    const { data: userList } = await adminSupabase.auth.admin.listUsers();
    const adminUser = userList?.users?.find(
      (u) => u.email === "admin@cleaningcompany.com" || u.user_metadata?.role === "admin",
    );

    const adminId = adminUser ? adminUser.id : null;
    console.log("Preserved Admin User ID:", adminId);

    // 2. Delete dependent tables in order
    console.log("Deleting audit logs...");
    await adminSupabase.from("audit_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Deleting payments...");
    await adminSupabase.from("payments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Deleting invoices...");
    await adminSupabase.from("invoices").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Deleting quote_items...");
    await adminSupabase.from("quote_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Deleting quotes...");
    await adminSupabase.from("quotes").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Deleting job_notes...");
    try {
      await adminSupabase.from("job_notes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch {}

    console.log("Deleting jobs...");
    await adminSupabase.from("jobs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Deleting cleaner_ratings...");
    try {
      await adminSupabase.from("cleaner_ratings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch {}

    console.log("Deleting cleaners...");
    await adminSupabase.from("cleaners").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Deleting bookings...");
    await adminSupabase.from("bookings").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Deleting customer_addresses...");
    await adminSupabase.from("customer_addresses").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Deleting customers...");
    await adminSupabase.from("customers").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Deleting enquiries...");
    await adminSupabase.from("enquiries").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 3. Delete non-admin profiles
    if (adminId) {
      console.log("Deleting non-admin profiles...");
      await adminSupabase.from("profiles").delete().neq("id", adminId);
    } else {
      await adminSupabase.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // 4. Delete non-admin auth users
    if (userList?.users) {
      for (const u of userList.users) {
        if (u.id !== adminId && u.email !== "admin@cleaningcompany.com") {
          console.log(`Deleting auth user: ${u.email} (${u.id})`);
          await adminSupabase.auth.admin.deleteUser(u.id);
        }
      }
    }

    // 5. Ensure Admin Profile exists in profiles table
    if (adminId) {
      await adminSupabase.from("profiles").upsert({
        id: adminId,
        role: "admin",
        full_name: "Company Admin",
      });
      console.log("✅ Admin profile verified.");
    }

    console.log("\n🎉 Database successfully wiped! Ready for fresh testing.");
  } catch (err) {
    console.error("Error wiping database:", err);
  }
}

wipeDatabaseExceptAdmin();
