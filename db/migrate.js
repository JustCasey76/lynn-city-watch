/*
 * Applies schema.sql then seed.sql to the database in DATABASE_URL.
 * Idempotent — safe to run repeatedly. Usage:
 *   DATABASE_URL=postgres://... node db/migrate.js
 * The server also applies these on boot; this script is for manual runs
 * (validation, one-off migrations, seeding a fresh database).
 */
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const url = process.env.DATABASE_URL;
if (!url) { console.error("Set DATABASE_URL"); process.exit(1); }
const useSsl = /sslmode=require/i.test(url) || process.env.PGSSL === "true" || /proxy\.rlwy\.net/.test(url);

(async () => {
  const pool = new Pool({ connectionString: url, ssl: useSsl ? { rejectUnauthorized: false } : false });
  for (const f of ["schema.sql", "seed.sql"]) {
    const sql = fs.readFileSync(path.join(__dirname, f), "utf8");
    await pool.query(sql);
    console.log("applied", f);
  }
  const c = await pool.query("SELECT COUNT(*)::int n FROM councilors");
  const cat = await pool.query("SELECT COUNT(*)::int n FROM categories");
  const sample = await pool.query(
    "SELECT id, seat, title FROM councilors ORDER BY ward_number NULLS LAST, name LIMIT 4");
  console.log(`councilors=${c.rows[0].n} categories=${cat.rows[0].n}`);
  console.log(JSON.stringify(sample.rows));
  await pool.end();
})().catch(e => { console.error("MIGRATE FAILED:", e.message); process.exit(1); });
