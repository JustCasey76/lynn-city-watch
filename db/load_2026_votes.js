/*
 * Loads REAL 2026 Lynn City Council votes (transcribed from the official
 * scanned minutes PDFs) from db/data/votes_2026.json into the database.
 *
 * Per-member positions follow the site's editorial methodology:
 *  - Councilors the minutes name individually get their stated position.
 *  - Other present councilors are DERIVED from the recorded tally (majority side).
 *  - Absent councilors are marked absent.
 *  - Every derived vote carries a note explaining exactly that.
 * Net local cost is set only from the funding source the minutes actually state
 * (Free Cash / transfers / stabilization = local money; grants / earmarks /
 * gifts = outside funding, $0 local); otherwise left undetermined.
 *
 * Idempotent per meeting (clears that meeting's votes, then reinserts).
 * Usage: DATABASE_URL=postgres://... node db/load_2026_votes.js
 */
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const url = process.env.DATABASE_URL;
if (!url) { console.error("Set DATABASE_URL"); process.exit(1); }
const useSsl = /sslmode=require/i.test(url) || process.env.PGSSL === "true" || /proxy\.rlwy\.net/.test(url);

const ALL = ["meaney", "matul", "alinsug", "maddrey", "paez", "hogan", "avery", "lapierre", "net", "field", "mcclain"];
const KEYS = { jan05: "JccEAN44", jan13: "JuUEAN0a", jan27: "KOUEANMa", feb24: "QOUEALsa", mar24: "xd8EAD4g", apr14: "BeUEAP4a", apr28: "rekEAFYW", may12: "iu8EAHEQ", may26: "xPQEAD8L" };
const fileUrl = k => `https://www.lynnma.gov/common/pages/GetFile.ashx?key=${k}`;

function matchId(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("alinsug")) return "alinsug";
  if (n.includes("matul")) return "matul";
  if (n.includes("megie") || n.includes("maddrey")) return "maddrey";
  if (n.includes("meaney")) return "meaney";
  if (n.includes("paez")) return "paez";
  if (n.includes("hogan")) return "hogan";
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

// classify net local cost from the documented funding source text
function fundingOf(spending, src) {
  if (spending == null) return { local: null, note: "" };
  const s = (src || "").toLowerCase();
  const outside = /grant|earmark|dese|dfa|massworks|mass cultural|cultural council|executive office|eopss|\beps\b|\bdvs\b|msba|school building|district attorney|health officers|gift|donation|finance agency/;
  const local = /free.?cash|transfer|stabiliz|reserve|wage stab|available balance/;
  if (outside.test(s)) return { local: 0, note: "Funded by outside money (" + (src || "grant/gift") + "); net local taxpayer cost from this action: $0." };
  if (local.test(s)) return { local: spending, note: "Funded from local city funds (" + (src || "Free Cash / transfer") + "); this reallocates money Lynn taxpayers provide." };
  return { local: null, note: src ? ("Stated funding source: " + src + ". Net local share not classified from the record.") : "The minutes do not state the funding source; net local cost could not be determined." };
}

const SKIP = /adjourn|accept the meeting minutes|acceptance of the meeting minutes|motion to adjourn/i;

(async () => {
  const pool = new Pool({ connectionString: url, ssl: useSsl ? { rejectUnauthorized: false } : false });
  const cat = {};
  (await pool.query("SELECT id, slug FROM categories")).rows.forEach(r => cat[r.slug] = r.id);
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "votes_2026.json"), "utf8"));

  let totalVotes = 0, totalPos = 0;
  for (const m of data) {
    const key = KEYS[m._slug] || m._key;
    const src = fileUrl(key);
    const d = new Date(m.meeting_date + "T00:00:00Z");
    const nice = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
    const title = `City Council Meeting — ${nice}`;
    const mres = await pool.query(
      `INSERT INTO meetings (meeting_date, body, title, minutes_url, source_url)
       VALUES ($1,'City Council',$2,$3,$3)
       ON CONFLICT (meeting_date, body, title) DO UPDATE SET minutes_url=EXCLUDED.minutes_url
       RETURNING id`, [m.meeting_date, title, src]);
    const meetingId = mres.rows[0].id;
    await pool.query("DELETE FROM votes WHERE meeting_id=$1", [meetingId]);

    const absentIds = new Set((m.absent_names || []).map(matchId).filter(Boolean));

    for (const v of m.votes) {
      if (v.tally_yes == null && SKIP.test(v.title || "")) continue;
      const hasTally = v.tally_yes != null;
      const named = {};
      (v.named_positions || []).forEach(p => { const id = matchId(p.name); if (id) named[id] = normPos(p.position); });
      const majority = (v.tally_no != null && v.tally_no > v.tally_yes) ? "no" : "yes";
      const presentCount = 11 - absentIds.size;
      const namedNonAbsent = Object.values(named).filter(p => p !== "absent").length;
      const isRollCall = hasTally && namedNonAbsent >= presentCount && presentCount > 0;

      const fund = fundingOf(v.spending_amount ?? null, v.funding_source);
      // build the transparency note
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
        const tuples = [], params = [vid];
        let i = 2;
        for (const id of ALL) {
          const pos = named[id] || (absentIds.has(id) ? "absent" : majority);
          tuples.push(`($1,$${i++},$${i++})`);
          params.push(id, pos);
          totalPos++;
        }
        await pool.query(
          `INSERT INTO vote_positions (vote_id, councilor_id, position) VALUES ${tuples.join(",")}
           ON CONFLICT (vote_id, councilor_id) DO UPDATE SET position=EXCLUDED.position`, params);
      }
    }
    console.log(`  ${m.meeting_date}: loaded ${m.votes.length} items`);
  }
  const rv = (await pool.query("SELECT COUNT(*)::int c FROM votes WHERE is_sample=false")).rows[0].c;
  console.log(`Done. Total real votes in DB: ${rv}. Positions written this run: ${totalPos}.`);
  await pool.end();
})().catch(e => { console.error("LOAD FAILED:", e.message); process.exit(1); });
