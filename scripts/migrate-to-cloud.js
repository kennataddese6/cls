const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

async function migrate() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres.nlfarcqrmpndesuljeme:v2gidELWSqryiaIn@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

  console.log("Connecting to Supabase Cloud Pooler (IPv4)...");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    const sqlPath = path.join(process.cwd(), "supabase", "cloud_data_dump.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Executing schema & data dump on Supabase Cloud...");
    await client.query(sql);

    console.log("✅ Schema and data successfully migrated to Supabase Cloud!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
