/*
 * Keeps the database in step with the vote files in db/data/votes_*.json.
 *
 * The JSON files are the source of truth: each one is a list of meetings
 * transcribed from the official Lynn City Council minutes. On every server
 * boot we hash each file and reload only the files that changed since the
 * last load, so committing a new or corrected file and deploying is all it
 * takes to update the live site.
 *
 * Loading a file is all-or-nothing (one transaction). For every meeting date
 * in the file, existing votes on that date are removed and re-inserted, so a
 * reload never leaves duplicates behind.
 *
 * Per-member positions follow the site's editorial method:
 *  - members the minutes name individually get exactly that position;
 *  - other present members are derived from the recorded tally (majority side)
 *    and the vote's note says so;
 *  - absent members are marked absent.
 * Net local cost is set only from the funding source the minutes state.
 *
 * Manual run:  DATABASE_URL=postgres://... node db/sync.js [--force]
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "data");
const fileUrl = (key) => `https://www.lynnma.gov/common/pages/GetFile.ashx?key=${key}`;

/* Council term rosters, so a vote is never credited to someone not in office. */
const CONTINUING = ["meaney", "matul", "alinsug", "maddrey", "hogan", "lapierre", "net", "field", "mcclain"];
const ROSTERS = [
  { from: "2024-01-01", ids: CONTINUING.concat(["chakoutis", "walsh"]) }, // 2024-2025 term
  { from: "2026-01-01", ids: CONTINUING.concat(["paez", "avery"]) },      // 2026-2027 term
];
function rosterFor(date) {
  let r = ROSTERS[0].ids;
  for (const t of ROSTERS) if (date >= t.from) r = t.ids;
  return r;
}

function matchId(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("alinsug")) return "alinsug";
  if (n.includes("matul")) return "matul";
  if (n.includes("megie") || n.includes("maddrey")) return "maddrey";
  if (n.includes("meaney")) return "meaney";
  if (n.includes("paez")) return "paez";
  if (n.includes("chakoutis")) return "chakoutis";
  if (n.includes("hogan")) return "hogan";
  if (n.includes("walsh")) return "walsh";
  if (n.includes("lapierr")) return "lapierre";
  if (n.includes("mcclain")) return "mcclain";
  if (n.includes("field")) return "field";
  if (n.includes("avery") || n.includes("jordan")) return "avery";
  if (/\bnet\b/.test(n)) return "net";
  return null;
}

function normPos(p) {
  const s = (p || "").toLowerCase();
  if (s.startsWith("yes") || s === "yea" || s === "aye") return "yes";
  if (s.startsWith("no") || s === "nay") return "no";
  if (s.startsWith("abstain")) return "abstain";
  if (s.startsWith("present")) return "present";
  if (s.startsWith("recus")) return "recused";
  if (s.startsWith("absent")) return "absent";
  return s || "yes";
}

const OUTSIDE = /grant|earmark|dese|dfa|massworks|mass cultural|cultural council|executive office|eopss|\beps\b|\bdvs\b|msba|school building|district attorney|health officers|gift|donation|finance agency|reimburs|federal|state of massachusetts|commonwealth|mass ?dot|department of transportation|chapter 90|mass ?save|eversource|national grid|energy resource|homeland security|massachusetts department|gaming commission|foundation/;
const LOCAL = /free.?cash|transfer|stabiliz|reserve|wage stab|available balance|overlay|retained earning/;
function fundingOf(spending, src) {
  if (spending == null) return { local: null, note: "" };
  const s = (src || "").toLowerCase();
  if (OUTSIDE.test(s)) return { local: 0, note: "Funded by outside money (" + (src || "grant/gift") + "); net local taxpayer cost from this action: $0." };
  if (LOCAL.test(s)) return { local: spending, note: "Funded from local city funds (" + (src || "Free Cash / transfer") + "); this reallocates money Lynn taxpayers provide." };
  return { local: null, note: src ? ("Stated funding source: " + src + ". Net local share not classified from the record.") : "The minutes do not state the funding source; net local cost could not be determined." };
}

const SKIP = /adjourn|accept the meeting minutes|acceptance of the meeting minutes|motion to adjourn/i;
const PASSED = /passed|elected|confirmed|carried|adopted|appointed|granted|approved|accepted/i;
const NOT_PASSED = /failed|denied|tabled|referred|withdrawn|defeated/i;

async function loadFile(client, file, data) {
  const cat = {};
  (await client.query("SELECT id, slug FROM categories")).rows.forEach(r => (cat[r.slug] = r.id));
  const known = new Set((await client.query("SELECT id FROM councilors")).rows.map(r => r.id));

  // Clear every date this file covers first (some dates have two minutes files).
  const dates = [...new Set(data.map(m => m.meeting_date))];
  await client.query("DELETE FROM votes WHERE vote_date = ANY($1::date[])", [dates]);

  let votes = 0, positions = 0;
  const unmapped = new Set();
  for (const m of data) {
    const src = m._key ? fileUrl(m._key) : (m.source_url || "");
    const roster = rosterFor(m.meeting_date).filter(id => known.has(id));
    const nice = new Date(m.meeting_date + "T00:00:00Z")
      .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
    const title = `City Council Meeting — ${nice}`;
    const mres = await client.query(
      `INSERT INTO meetings (meeting_date, body, title, minutes_url, source_url)
       VALUES ($1,'City Council',$2,$3,$3)
       ON CONFLICT (meeting_date, body, title) DO UPDATE SET minutes_url=EXCLUDED.minutes_url, source_url=EXCLUDED.source_url
       RETURNING id`, [m.meeting_date, title, src]);
    const meetingId = mres.rows[0].id;

    const absentIds = new Set((m.absent_names || []).map(matchId).filter(Boolean));
    for (const v of m.votes || []) {
      if (v.tally_yes == null && SKIP.test(v.title || "")) continue;
      const hasTally = v.tally_yes != null;
      const named = {};
      (v.named_positions || []).forEach(p => {
        const id = matchId(p.name);
        if (id) named[id] = normPos(p.position); else if (p.name) unmapped.add(p.name);
      });
      const majority = (v.tally_no != null && v.tally_no > v.tally_yes) ? "no" : "yes";
      const presentCount = roster.length - [...absentIds].filter(id => roster.includes(id)).length;
      const namedNonAbsent = Object.values(named).filter(p => p !== "absent").length;
      const isRollCall = hasTally && presentCount > 0 && namedNonAbsent >= presentCount;
      const fund = fundingOf(v.spending_amount ?? null, v.funding_source);
      let note = fund.note ? fund.note + " " : "";
      if (hasTally) {
        if (isRollCall) note += "Each member's position is recorded individually in the minutes (roll call).";
        else if (Object.keys(named).length && Object.values(named).every(p => p === "absent")) note += "The minutes name the members absent for this vote; the remaining present members' positions are derived from the recorded tally.";
        else if (Object.keys(named).length) note += "The minutes name the members who broke from the majority or were absent; the remaining present members' positions are derived from the recorded tally.";
        else note += "The minutes record the tally and attendance but do not list each member individually; positions shown are derived from the tally and attendance.";
      }
      const result = v.result || "";
      const passed = PASSED.test(result) && !NOT_PASSED.test(result);
      const r = await client.query(
        `INSERT INTO votes (meeting_id, vote_date, title, plain_summary, category_id, item_type, result, passed,
           is_roll_call, tally_yes, tally_no, spending_amount, funding_local, department, source_url, notes, is_sample)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,false) RETURNING id`,
        [meetingId, m.meeting_date, v.title, v.summary || "", cat[v.category] || null, v.item_type || "",
         result, passed, isRollCall, v.tally_yes ?? null, v.tally_no ?? null,
         v.spending_amount ?? null, fund.local, v.department || "", src, note.trim()]);
      votes++;
      if (!hasTally) continue;
      const vid = r.rows[0].id;
      const rows = [];
      for (const id of roster) rows.push([id, named[id] || (absentIds.has(id) ? "absent" : majority)]);
      for (const id of Object.keys(named)) if (!roster.includes(id) && known.has(id)) rows.push([id, named[id]]);
      const params = [vid], tuples = [];
      rows.forEach(([id, pos], i) => { tuples.push(`($1,$${i * 2 + 2},$${i * 2 + 3})`); params.push(id, pos); });
      await client.query(
        `INSERT INTO vote_positions (vote_id, councilor_id, position) VALUES ${tuples.join(",")}
         ON CONFLICT (vote_id, councilor_id) DO UPDATE SET position=EXCLUDED.position`, params);
      positions += rows.length;
    }
  }
  return { meetings: data.length, votes, positions, unmapped: [...unmapped] };
}

/* Reload any vote file whose contents changed since it was last loaded. */
async function syncVotes(pool, { force = false, log = console.log } = {}) {
  await pool.query(`CREATE TABLE IF NOT EXISTS data_loads (
    file TEXT PRIMARY KEY, sha256 TEXT NOT NULL, loaded_at TIMESTAMPTZ DEFAULT now(), summary TEXT DEFAULT '')`);
  const files = fs.readdirSync(DATA_DIR).filter(f => /^votes_\d{4}\.json$/.test(f)).sort();
  const done = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(DATA_DIR, file));
    const sha = crypto.createHash("sha256").update(raw).digest("hex");
    const prev = await pool.query("SELECT sha256 FROM data_loads WHERE file=$1", [file]);
    if (!force && prev.rows[0] && prev.rows[0].sha256 === sha) continue;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const s = await loadFile(client, file, JSON.parse(raw.toString("utf8")));
      const summary = `${s.meetings} meetings, ${s.votes} votes, ${s.positions} member positions`;
      await client.query(
        `INSERT INTO data_loads (file, sha256, summary) VALUES ($1,$2,$3)
         ON CONFLICT (file) DO UPDATE SET sha256=EXCLUDED.sha256, summary=EXCLUDED.summary, loaded_at=now()`,
        [file, sha, summary]);
      await client.query("COMMIT");
      log(`Loaded ${file}: ${summary}` + (s.unmapped.length ? ` (unmapped names: ${s.unmapped.join(", ")})` : ""));
      done.push(file);
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      log(`Could not load ${file} (left unchanged): ${e.message}`);
    } finally {
      client.release();
    }
  }
  return done;
}

module.exports = { syncVotes, rosterFor, matchId, fundingOf };

if (require.main === module) {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("Set DATABASE_URL"); process.exit(1); }
  const { Pool } = require("pg");
  const useSsl = /sslmode=require/i.test(url) || process.env.PGSSL === "true" || /proxy\.rlwy\.net/.test(url);
  const pool = new Pool({ connectionString: url, ssl: useSsl ? { rejectUnauthorized: false } : false });
  syncVotes(pool, { force: process.argv.includes("--force") })
    .then(async (done) => {
      const n = (await pool.query("SELECT COUNT(*)::int n FROM votes")).rows[0].n;
      console.log(`${done.length} file(s) loaded. Votes in database: ${n}.`);
    })
    .catch(e => { console.error("SYNC FAILED:", e.message); process.exitCode = 1; })
    .finally(() => pool.end());
}
