const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://nlfarcqrmpndesuljeme.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZmFyY3FybXBuZGVzdWxqZW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg1MzEwNCwiZXhwIjoyMTAxNDI5MTA0fQ._wWKCCROFrL0fmn6_9TUTJwwI-J4FJBT2ydbvBhXaQQ";

const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

async function checkQuoteFkey() {
  console.log("Inspecting profiles and auth users on Supabase Cloud...");

  const { data: profiles, error: profErr } = await adminSupabase.from("profiles").select("*");
  console.log("Profiles in Cloud DB:", profiles, "Error:", profErr?.message);

  const { data: userList, error: authErr } = await adminSupabase.auth.admin.listUsers();
  console.log("Auth Users count:", userList?.users?.length, "Error:", authErr?.message);

  if (userList?.users) {
    for (const u of userList.users) {
      console.log(`User ID: ${u.id} | Email: ${u.email} | Metadata role: ${u.user_metadata?.role}`);
    }
  }
}

checkQuoteFkey();
