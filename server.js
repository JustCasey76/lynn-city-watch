/*
 * Lynn City Watch server.
 * - Always serves the static site in prototype/.
 * - If DATABASE_URL is set, connects to Postgres, applies the schema + seed
 *   (idempotently) on boot, and exposes a read-only JSON API under /api/*.
 * - With no DATABASE_URL it degrades gracefully to a pure static server, so
 *   the site keeps working before the database is provisioned.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { syncVotes } = require("./db/sync");

const ROOT = path.join(__dirname, "prototype");
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL;

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".ico": "image/x-icon", ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8",
};

/* ---------------- database ---------------- */
let pool = null;
let dbReady = false;

async function initDb() {
  if (!DB_URL) {
    console.log("No DATABASE_URL set — running as static-only server.");
    return;
  }
  const { Pool } = require("pg");
  const useSsl = /sslmode=require/i.test(DB_URL) || process.env.PGSSL === "true";
  pool = new Pool({
    connectionString: DB_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    max: 5,
  });
  try {
    for (const f of ["schema.sql", "seed.sql"]) {
      const sql = fs.readFileSync(path.join(__dirname, "db", f), "utf8");
      await pool.query(sql);
      console.log(`Applied db/${f}`);
    }
    dbReady = true;
    console.log("Database ready.");
    // Load any new or corrected vote files from db/data (only files that changed).
    // Runs in the background; each file loads in one transaction, so visitors keep
    // seeing the previous data until the new data is complete.
    syncVotes(pool, { log: (m) => console.log(m) }).catch(e => console.error("Vote sync failed:", e.message));
    refreshMeetings(true).catch(e => console.error("Meetings refresh failed:", e.message));
  } catch (err) {
    console.error("Database init failed (serving static only):", err.message);
    dbReady = false;
  }
}

/* ---------------- Lynn Community TV: council meeting videos ---------------- */
const YT_CHANNEL_ID = "UCvTqaRye1kNWpfsuniCjPvg"; // Lynn Community TV
const YT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;
const MONTHS = { january:1, february:2, march:3, april:4, may:5, june:6, july:7, august:8, september:9, october:10, november:11, december:12 };
let lastMeetingsFetch = 0;

function decodeXml(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}
function parseTitleDate(title) {
  const m = title.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (m && MONTHS[m[1].toLowerCase()]) {
    const mm = String(MONTHS[m[1].toLowerCase()]).padStart(2, "0");
    const dd = String(parseInt(m[2], 10)).padStart(2, "0");
    return `${m[3]}-${mm}-${dd}`;
  }
  return null;
}

async function refreshMeetings(force) {
  if (!dbReady) return;
  if (!force && Date.now() - lastMeetingsFetch < 10 * 60 * 1000) return; // 10-min cache
  lastMeetingsFetch = Date.now();
  const resp = await fetch(YT_RSS, { headers: { "User-Agent": "LynnCityWatch/1.0" } });
  if (!resp.ok) throw new Error("RSS HTTP " + resp.status);
  const xml = await resp.text();
  const entries = xml.split("<entry>").slice(1);
  let added = 0;
  for (const e of entries) {
    const t = (e.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    const vid = (e.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/) || [])[1];
    const pub = (e.match(/<published>([\s\S]*?)<\/published>/) || [])[1];
    if (!t || !vid) continue;
    const title = decodeXml(t).trim();
    if (!/lynn city council/i.test(title)) continue;      // council meetings only
    const mdate = parseTitleDate(title) || (pub ? pub.slice(0, 10) : null);
    if (!mdate) continue;
    await pool.query(
      `INSERT INTO meetings (meeting_date, body, title, video_url, source_url, youtube_id, thumbnail_url, published_at)
       VALUES ($1,'City Council',$2,$3,$3,$4,$5,$6)
       ON CONFLICT (youtube_id) DO UPDATE SET title=EXCLUDED.title, meeting_date=EXCLUDED.meeting_date`,
      [mdate, title, `https://www.youtube.com/watch?v=${vid}`, vid, `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`, pub || null]);
    added++;
  }
  console.log(`Meetings refreshed: ${added} council videos processed.`);
}

const send = (res, code, obj) => {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
};

// Derive net local cost only when the outside (state/federal) share is actually
// recorded. If nothing about the funding is known, leave it unknown (null) —
// never assume an item is 100% locally funded.
function withLocal(row) {
  const t = row.spending_amount, f = row.funding_federal, s = row.funding_state;
  let local = row.funding_local;
  if (local == null && t != null && (f != null || s != null)) local = Number(t) - Number(f || 0) - Number(s || 0);
  const num = (x) => (x == null ? null : Number(x)); // Postgres NUMERIC arrives as text
  return { ...row, spending_amount: num(t), funding_local: num(local) };
}

/* ---------------- API ---------------- */
async function handleApi(req, res, url) {
  if (!dbReady) return send(res, 503, { error: "database not connected yet" });
  const p = url.pathname;
  const q = url.searchParams;

  if (p === "/api/health") return send(res, 200, { ok: true, db: dbReady });

  // How current the data is: latest meeting with recorded votes, totals, last loads.
  if (p === "/api/status") {
    const v = await pool.query(
      `SELECT COUNT(*)::int AS votes, COUNT(DISTINCT vote_date)::int AS meetings,
              MIN(vote_date) AS first_date, MAX(vote_date) AS latest_date,
              COALESCE(SUM(spending_amount),0)::float AS spending
         FROM votes WHERE NOT is_sample`);
    const loads = await pool.query("SELECT file, summary, loaded_at FROM data_loads ORDER BY file")
      .catch(() => ({ rows: [] }));
    return send(res, 200, { ...v.rows[0], loads: loads.rows });
  }

  if (p === "/api/meetings") {
    refreshMeetings(false).catch(e => console.error("Meetings refresh:", e.message)); // fire-and-forget
    const { rows } = await pool.query(
      `SELECT meeting_date, body, title, video_url, source_url, youtube_id, thumbnail_url
         FROM meetings WHERE youtube_id IS NOT NULL
        ORDER BY meeting_date DESC, published_at DESC LIMIT 100`);
    return send(res, 200, rows);
  }

  if (p === "/api/categories") {
    const { rows } = await pool.query("SELECT id, slug, name FROM categories ORDER BY sort, name");
    return send(res, 200, rows);
  }

  if (p === "/api/councilors") {
    const { rows } = await pool.query(
      "SELECT id,name,seat,seat_type,ward_number,title,phone,email,profile_url,source_url FROM councilors WHERE active ORDER BY ward_number NULLS LAST, name");
    return send(res, 200, rows);
  }

  // /api/councilors/:id  -> profile + their recorded positions
  let m = p.match(/^\/api\/councilors\/([\w-]+)$/);
  if (m) {
    const c = await pool.query("SELECT * FROM councilors WHERE id=$1", [m[1]]);
    if (!c.rows.length) return send(res, 404, { error: "not found" });
    const votes = await pool.query(
      `SELECT v.id, v.vote_date, v.title, v.plain_summary, v.result, v.item_type,
              cat.name AS category, vp.position
         FROM vote_positions vp
         JOIN votes v ON v.id = vp.vote_id
         LEFT JOIN categories cat ON cat.id = v.category_id
        WHERE vp.councilor_id = $1
        ORDER BY v.vote_date DESC`, [m[1]]);
    const tally = await pool.query(
      "SELECT position, COUNT(*)::int AS n FROM vote_positions WHERE councilor_id=$1 GROUP BY position", [m[1]]);
    return send(res, 200, { councilor: c.rows[0], votes: votes.rows, tally: tally.rows });
  }

  if (p === "/api/votes") {
    const params = [], where = [];
    if (q.get("category")) { params.push(q.get("category")); where.push(`cat.slug = $${params.length}`); }
    if (q.get("q")) { params.push(`%${q.get("q").toLowerCase()}%`); where.push(`(LOWER(v.title) LIKE $${params.length} OR LOWER(v.plain_summary) LIKE $${params.length})`); }
    if (q.get("councilor")) { params.push(q.get("councilor")); where.push(`v.id IN (SELECT vote_id FROM vote_positions WHERE councilor_id = $${params.length})`); }
    if (/^\d{4}$/.test(q.get("year") || "")) { params.push(q.get("year")); where.push(`EXTRACT(YEAR FROM v.vote_date) = $${params.length}`); }
    const sql = `SELECT v.*, cat.name AS category_name, cat.slug AS category_slug,
                        m.minutes_url, m.meeting_date
                   FROM votes v
                   LEFT JOIN categories cat ON cat.id = v.category_id
                   LEFT JOIN meetings m ON m.id = v.meeting_id
                   ${where.length ? "WHERE " + where.join(" AND ") : ""}
                   ORDER BY v.vote_date DESC LIMIT 3000`;
    const { rows } = await pool.query(sql, params);
    return send(res, 200, rows.map(withLocal));
  }

  m = p.match(/^\/api\/votes\/(\d+)$/);
  if (m) {
    const v = await pool.query(
      `SELECT v.*, cat.name AS category_name FROM votes v
         LEFT JOIN categories cat ON cat.id=v.category_id WHERE v.id=$1`, [m[1]]);
    if (!v.rows.length) return send(res, 404, { error: "not found" });
    const pos = await pool.query(
      `SELECT vp.position, c.id AS councilor_id, c.name, c.seat
         FROM vote_positions vp JOIN councilors c ON c.id=vp.councilor_id
        WHERE vp.vote_id=$1 ORDER BY c.ward_number NULLS LAST, c.name`, [m[1]]);
    return send(res, 200, { vote: withLocal(v.rows[0]), positions: pos.rows });
  }

  if (p === "/api/unaccounted") {
    const { rows } = await pool.query(
      `SELECT fiscal_year, item, amount, amount_is_estimate, what_records_show,
              what_records_do_not_show, records_reviewed, source_url, confidence,
              status, logged_date, notes
         FROM unaccounted_funds
        ORDER BY fiscal_year DESC NULLS LAST, amount DESC NULLS LAST`);
    return send(res, 200, rows);
  }

  if (p === "/api/spending") {
    const fy = q.get("fy");
    const budget = await pool.query(
      `SELECT b.*, cat.name AS category_name FROM budget_items b
         LEFT JOIN categories cat ON cat.id=b.category_id
        ${fy ? "WHERE b.fiscal_year=$1" : ""} ORDER BY b.total DESC`, fy ? [fy] : []);
    const revenue = await pool.query(
      `SELECT * FROM revenue_sources ${fy ? "WHERE fiscal_year=$1" : ""} ORDER BY amount DESC`, fy ? [fy] : []);
    return send(res, 200, { budget: budget.rows, revenue: revenue.rows });
  }

  return send(res, 404, { error: "unknown endpoint" });
}

/* ---------------- static ---------------- */
function serveStatic(req, res, url) {
  let urlPath = decodeURIComponent(url.pathname);
  if (urlPath === "/") urlPath = "/index.html";
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
  const filePath = path.join(ROOT, safe);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end('<h1>404 — Not found</h1><p><a href="/">Back to home</a></p>');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url).catch(err => {
      console.error("API error:", err.message);
      send(res, 500, { error: "internal error" });
    });
    return;
  }
  serveStatic(req, res, url);
});

initDb().finally(() => {
  server.listen(PORT, () => console.log(`Lynn City Watch on port ${PORT} (db: ${dbReady ? "on" : "off"})`));
});
