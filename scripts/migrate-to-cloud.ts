import { Client } from "pg";
import * as fs from "node:fs";
import * as path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function migrate() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:v2gidELWSqryiaIn@db.nlfarcqrmpndesuljeme.supabase.co:5432/postgres";

  console.log("Connecting to Supabase Cloud PostgreSQL...");

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
