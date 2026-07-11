/*
 * General loader for REAL council votes transcribed from official minutes.
 * Reads db/data/<DATA_FILE> (default votes_2026.json) and loads votes +
 * per-member positions, choosing the correct COUNCIL TERM ROSTER by year so
 * votes are never attributed to members who were not on the council that year.
 *
 *   2024-2025 term: Wards 5 & 7 held by Chakoutis & Walsh.
 *   2026-2027 term: Wards 5 & 7 held by Paez & Avery.
 *
 * Methodology: named roll-call/dissent/abstain/present used verbatim; other
 * present members derived from the recorded tally (majority) and labeled;
 * absentees marked absent. Funding classified only from the documented source.
 * Idempotent per meeting. Usage: DATA_FILE=votes_2025.json DATABASE_URL=... node db/load_votes_json.js
 */
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const url = process.env.DATABASE_URL;
if (!url) { console.error("Set DATABASE_URL"); process.exit(1); }
const DATA_FILE = process.env.DATA_FILE || "votes_2026.json";
const useSsl = /sslmode=require/i.test(url) || process.env.PGSSL === "true" || /proxy\.rlwy\.net/.test(url);

const CONTINUING = ["meaney", "matul", "alinsug", "maddrey", "hogan", "lapierre", "net", "field", "mcclain"];
const ROSTER_2425 = CONTINUING.concat(["chakoutis", "walsh"]);
const ROSTER_2026 = CONTINUING.concat(["paez", "avery"]);
const rosterFor = (dateStr) => (parseInt((dateStr || "").slice(0, 4), 10) >= 2026 ? ROSTER_2026 : ROSTER_2425);

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
  if (n.includes("net")) return "net";
  return null;
}
const normPos = p => {
  const s = (p || "").toLowerCase();
  if (s.startsWith("yes") || s === "yea" || s === "aye") return "yes";
  if (s.startsWith("no") || s === "nay") return "no";
  if (s.startsWith("abstain")) return "abstain";
  if (s.startsWith("present")) return "present";
  if (s.startsWith("recus")) return "recused";
  if (s.startsWith("absent")) return "absent";
  return s || "yes";
};
function fundingOf(spending, src) {
  if (spending == null) return { local: null, note: "" };
  const s = (src || "").toLowerCase();
  const outside = /grant|earmark|dese|dfa|massworks|mass cultural|cultural council|executive office|eopss|\beps\b|\bdvs\b|msba|school building|district attorney|health officers|gift|donation|finance agency|reimburs|federal|state of massachusetts|commonwealth/;
  const local = /free.?cash|transfer|stabiliz|reserve|wage stab|available balance|overlay|retained earning/;
  if (outside.test(s)) return { local: 0, note: "Funded by outside money (" + (src || "grant/gift") + "); net local taxpayer cost from this action: $0." };
  if (local.test(s)) return { local: spending, note: "Funded from local city funds (" + (src || "Free Cash / transfer") + "); this reallocates money Lynn taxpayers provide." };
  return { local: null, note: src ? ("Stated funding source: " + src + ". Net local share not classified from the record.") : "The minutes do not state the funding source; net local cost could not be determined." };
}
const SKIP = /adjourn|accept the meeting minutes|acceptance of the meeting minutes|motion to adjourn/i;

(async () => {
  const pool = new Pool({ connectionString: url, ssl: useSsl ? { rejectUnauthorized: false } : false });
  const cat = {};
  (await pool.query("SELECT id, slug FROM categories")).rows.forEach(r => cat[r.slug] = r.id);
  const known = new Set((await pool.query("SELECT id FROM councilors")).rows.map(r => r.id));
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "data", DATA_FILE), "utf8"));

  let totalVotes = 0, totalPos = 0, skippedNames = new Set();
  for (const m of data) {
    const src = m._key ? `https://www.lynnma.gov/common/pages/GetFile.ashx?key=${m._key}` : (m.source_url || "");
    const roster = rosterFor(m.meeting_date).filter(id => known.has(id));
    const d = new Date(m.meeting_date + "T00:00:00Z");
    const nice = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
    const title = `City Council Meeting — ${nice}`;
    const mres = await pool.query(
      `INSERT INTO meetings (meeting_date, body, title, minutes_url, source_url)
       VALUES ($1,'City Council',$2,$3,$3)
       ON CONFLICT (meeting_date, body, title) DO UPDATE SET minutes_url=EXCLUDED.minutes_url RETURNING id`,
      [m.meeting_date, title, src]);
    const meetingId = mres.rows[0].id;
    await pool.query("DELETE FROM votes WHERE meeting_id=$1", [meetingId]);

    const absentIds = new Set((m.absent_names || []).map(matchId).filter(Boolean));
    for (const v of m.votes) {
      if (v.tally_yes == null && SKIP.test(v.title || "")) continue;
      const hasTally = v.tally_yes != null;
      const named = {};
      (v.named_positions || []).forEach(p => { const id = matchId(p.name); if (id) named[id] = normPos(p.position); else if (p.name) skippedNames.add(p.name); });
      const majority = (v.tally_no != null && v.tally_no > v.tally_yes) ? "no" : "yes";
      const presentCount = roster.length - [...absentIds].filter(id => roster.includes(id)).length;
      const namedNonAbsent = Object.values(named).filter(p => p !== "absent").length;
      const isRollCall = hasTally && namedNonAbsent >= presentCount && presentCount > 0;
      const fund = fundingOf(v.spending_amount ?? null, v.funding_source);
      let note = fund.note ? fund.note + " " : "";
      if (hasTally) {
        if (isRollCall) note += "Each member's position is recorded individually in the minutes (roll call).";
        else if (Object.keys(named).length) note += "The minutes name the members who broke from the majority; the remaining present members' positions are derived from the recorded tally.";
        else note += "The minutes record the tally and attendance but do not list each member individually; positions shown are derived from the tally and attendance.";
      }
      const passed = /passed|elected|confirmed|carried|adopted|appointed|granted/i.test(v.result || "") && !/failed|denied|tabled/i.test(v.result || "");
      const r = await pool.query(
        `INSERT INTO votes (meeting_id, vote_date, title, plain_summary, category_id, item_type, result, passed,
          is_roll_call, tally_yes, tally_no, spending_amount, funding_local, department, source_url, notes, is_sample)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,false) RETURNING id`,
        [meetingId, m.meeting_date, v.title, v.summary || "", cat[v.category] || null, v.item_type || "",
         v.result || "", passed, isRollCall, v.tally_yes ?? null, v.tally_no ?? null,
         v.spending_amount ?? null, fund.local, v.department || "", src, note.trim()]);
      const vid = r.rows[0].id;
      totalVotes++;
      if (hasTally) {
        const tuples = [], params = [vid]; let i = 2;
        for (const id of roster) {
          const pos = named[id] || (absentIds.has(id) ? "absent" : majority);
          tuples.push(`($1,$${i++},$${i++})`); params.push(id, pos); totalPos++;
        }
        // include any named councilor outside the roster who is known (rare)
        for (const id of Object.keys(named)) {
          if (!roster.includes(id) && known.has(id)) { tuples.push(`($1,$${i++},$${i++})`); params.push(id, named[id]); totalPos++; }
        }
        await pool.query(
          `INSERT INTO vote_positions (vote_id, councilor_id, position) VALUES ${tuples.join(",")}
           ON CONFLICT (vote_id, councilor_id) DO UPDATE SET position=EXCLUDED.position`, params);
      }
    }
    console.log(`  ${m.meeting_date}: ${m.votes.length} items`);
  }
  const rv = (await pool.query("SELECT COUNT(*)::int c FROM votes WHERE is_sample=false")).rows[0].c;
  if (skippedNames.size) console.log("Unmapped names (no position written):", [...skippedNames]);
  console.log(`Done (${DATA_FILE}). Total real votes in DB: ${rv}. Positions written this run: ${totalPos}.`);
  await pool.end();
})().catch(e => { console.error("LOAD FAILED:", e.message); process.exit(1); });
