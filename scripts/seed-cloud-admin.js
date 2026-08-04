const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://nlfarcqrmpndesuljeme.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZmFyY3FybXBuZGVzdWxqZW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg1MzEwNCwiZXhwIjoyMTAxNDI5MTA0fQ._wWKCCROFrL0fmn6_9TUTJwwI-J4FJBT2ydbvBhXaQQ";

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAdmin() {
  console.log("Seeding Admin User on Supabase Cloud (IPv4)...");

  const adminEmail = "admin@cleaningcompany.com";
  const adminPassword = "Admin123!";

  // Create admin user via admin auth client
  const { data: userRes, error: createErr } = await adminSupabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      role: "admin",
      full_name: "Company Admin",
    },
  });

  let adminId;

  if (userRes && userRes.user) {
    adminId = userRes.user.id;
    console.log("✅ Admin user created successfully with ID:", adminId);
  } else if (createErr) {
    console.log("Admin creation response:", createErr.message);
    const { data: list, error: listErr } = await adminSupabase.auth.admin.listUsers();
    if (listErr) console.log("List users error:", listErr.message);
    const existing = list?.users?.find((u) => u.email === adminEmail);
    if (existing) {
      adminId = existing.id;
      console.log("Found existing admin user with ID:", adminId);
      await adminSupabase.auth.admin.updateUserById(adminId, {
        password: adminPassword,
        email_confirm: true,
        user_metadata: { role: "admin", full_name: "Company Admin" },
      });
    }
  }

  if (adminId) {
    // Upsert into public.profiles
    const { error: profileErr } = await adminSupabase.from("profiles").upsert({
      id: adminId,
      role: "admin",
      full_name: "Company Admin",
      email: adminEmail,
    });

    if (profileErr) {
      console.warn("Profiles upsert warning:", profileErr.message);
    } else {
      console.log("✅ Profile created for Admin!");
    }
  }

  // Create default cleaner user
  console.log("\nSeeding Cleaner User on Supabase Cloud...");
  const cleanerEmail = "kennataddese6@gmail.com";
  const cleanerPassword = "Cleaner123!";

  const { data: cleanerRes, error: cleanerErr } = await adminSupabase.auth.admin.createUser({
    email: cleanerEmail,
    password: cleanerPassword,
    email_confirm: true,
    user_metadata: {
      role: "cleaner",
      full_name: "Kenna Taddese Roba",
    },
  });

  let cleanerId;
  if (cleanerRes?.user) {
    cleanerId = cleanerRes.user.id;
    console.log("✅ Cleaner created with ID:", cleanerId);
  } else if (cleanerErr) {
    console.log("Cleaner creation note:", cleanerErr.message);
    const { data: list } = await adminSupabase.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === cleanerEmail);
    if (existing) cleanerId = existing.id;
  }

  if (cleanerId) {
    await adminSupabase.from("profiles").upsert({
      id: cleanerId,
      role: "cleaner",
      full_name: "Kenna Taddese Roba",
      email: cleanerEmail,
    });

    await adminSupabase.from("cleaners").upsert({
      id: cleanerId,
      cleaner_type: "individual",
      service_areas: ["North London", "Central London"],
      status: "available",
    });

    console.log("✅ Cleaner profile & directory record initialized!");
  }

  console.log("\n🎉 Cloud Seeding Complete!");
  console.log("Admin Login: admin@cleaningcompany.com / Admin123!");
  console.log("Cleaner Login: kennataddese6@gmail.com / Cleaner123!");
}

seedAdmin();
