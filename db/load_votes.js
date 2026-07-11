/*
 * Loads REAL council votes transcribed from official Lynn City Council minutes
 * into the database (idempotent per meeting: clears that meeting's votes, then
 * re-inserts). Per-member positions are DERIVED from the recorded tally +
 * attendance where the minutes don't list members individually, and labeled as
 * such in the UI (per the site's editorial standard).
 *
 * Usage: DATABASE_URL=postgres://... node db/load_votes.js
 */
const { Pool } = require("pg");

const url = process.env.DATABASE_URL;
if (!url) { console.error("Set DATABASE_URL"); process.exit(1); }
const useSsl = /sslmode=require/i.test(url) || process.env.PGSSL === "true" || /proxy\.rlwy\.net/.test(url);

// All 11 current councilors (stable ids from the councilors table).
const ALL = ["meaney", "matul", "alinsug", "maddrey", "paez", "hogan", "avery", "lapierre", "net", "field", "mcclain"];

/*
 * MEETING: Lynn City Council, February 10, 2026.
 * Source (official minutes, scanned PDF): GetFile key 7c8EABYw.
 * Attendance: "11 Councilors Present" (all 11). Every recorded yea/nay vote was 11 YES 0 NO,
 * so each present councilor's position derives to YES.
 */
const MINUTES_URL = "https://www.lynnma.gov/common/pages/GetFile.ashx?key=7c8EABYw";
const MEETING = { date: "2026-02-10", title: "City Council Meeting — February 10, 2026", present: ALL, absent: [] };

// derived positions helper: everyone present -> given position; absentees -> 'absent'
const derive = (present, pos) => present.map(id => ({ id, position: pos })).concat(MEETING.absent.map(id => ({ id, position: "absent" })));
const DERIVED_NOTE = "Positions derived from the recorded vote tally and attendance; the minutes record the tally (11 YES 0 NO) and that all members were present, but do not list each member individually.";

const VOTES = [
  { title: "Appointment of Audrey Jimenez to the Human Rights Commission", item_type: "Appointment", category: "appointments",
    summary: "The council voted to grant Mayor Jared C. Nicholson's appointment of Audrey Jimenez to the Human Rights Commission (term expiring Dec 31, 2028). Moved by Councilor Avery, seconded by Councilor Hogan.",
    dept: "Human Rights Commission" },
  { title: "Set down public hearing — sign permit for Brixmor SPE 2, LLC at 1-51 State Street", item_type: "Motion", category: "zoning",
    summary: "The council voted to set down for a public hearing a petition by Marc Newman on behalf of Brixmor SPE 2, LLC for a sign permit at 1-51 State Street. Moved by Councilor Hogan, seconded by Councilor Field.",
    dept: "Inspectional Services" },
  { title: "Re-appointment of Constable Mark Ianuzzi", item_type: "Appointment", category: "appointments",
    summary: "On the report of the Committee on Public Safety and Criminal Justice, the council voted to grant the re-appointment of Constable Mark Ianuzzi (term expiring Feb 10, 2029). Moved by Councilor Hogan, seconded by Councilor Field.",
    dept: "Public Safety" },
  { title: "Accept $500 gift from the Friends of the GAR", item_type: "Order", category: "budget",
    summary: "The council voted to accept a $500 gift from the Friends of the GAR (under M.G.L. c.44, s.53A) to purchase food for the Elevator Ribbon Cutting Ceremony scheduled for 3/24/26. Moved by Councilor Net, seconded by Councilor Field.",
    dept: "General Government", spending: 500, fundLocal: 0, fundState: 0, fundFederal: 0,
    fundNote: "Funded by a private gift from the Friends of the GAR. Net local taxpayer cost: $0." },
  { title: "Certify $1,200,000 MassWorks grant for the Lynn South Harbor Project", item_type: "Order", category: "grants",
    summary: "The council voted to certify as an available fund $1,200,000 allotted to the Department of Community Development by the Massachusetts Executive Office of Economic Development (MassWorks / Community One Stop for Growth, FY26) for the Lynn South Harbor Project. Moved by Councilor Net, seconded by Councilor Field.",
    dept: "Community Development", spending: 1200000, fundLocal: 0, fundState: 1200000, fundFederal: 0,
    fundNote: "Funded by a Massachusetts state MassWorks grant. Net local taxpayer cost: $0." },
  { title: "Certify $103,600 Mass Cultural Council grant (FY26 Lynn Cultural Council)", item_type: "Order", category: "grants",
    summary: "The council voted to certify as an available fund $103,600 allotted to the Planning Department by the Mass Cultural Council for the FY26 Lynn Cultural Council Annual Grant Award. Moved by Councilor Net, seconded by Councilor Field.",
    dept: "Planning", spending: 103600, fundLocal: 0, fundState: 103600, fundFederal: 0,
    fundNote: "Funded by a Massachusetts Cultural Council grant. Net local taxpayer cost: $0." },
  { title: "Certify $25,217.39 grant to the Health Department (public health inclusion)", item_type: "Order", category: "grants",
    summary: "The council voted to certify as an available fund $25,217.39 allotted to the Health Department by the Massachusetts Health Officers Association to enhance public health by implementing inclusion solutions. Moved by Councilor Net, seconded by Councilor Field.",
    dept: "Health", spending: 25217.39, fundLocal: 0, fundState: 0, fundFederal: 0,
    fundNote: "Funded by an outside grant from the Massachusetts Health Officers Association. Net local taxpayer cost: $0." },
  { title: "Certify $46,875 grant to the Police Department (Essex County DA gang-crime ISA)", item_type: "Order", category: "police",
    summary: "The council voted to certify as an available fund $46,875 allotted to the Police Department by the Essex County District Attorney's Office to support an ISA between LPD and the Essex County DA to address gang-related crime. Moved by Councilor Net, seconded by Councilor Field.",
    dept: "Police", spending: 46875, fundLocal: 0, fundState: 0, fundFederal: 0,
    fundNote: "Funded by an Essex County District Attorney's Office grant. Net local taxpayer cost: $0." },
];

(async () => {
  const pool = new Pool({ connectionString: url, ssl: useSsl ? { rejectUnauthorized: false } : false });
  const cat = {};
  (await pool.query("SELECT id, slug FROM categories")).rows.forEach(r => cat[r.slug] = r.id);

  // upsert the meeting
  const mres = await pool.query(
    `INSERT INTO meetings (meeting_date, body, title, minutes_url, source_url)
     VALUES ($1,'City Council',$2,$3,$3)
     ON CONFLICT (meeting_date, body, title) DO UPDATE SET minutes_url=EXCLUDED.minutes_url
     RETURNING id`, [MEETING.date, MEETING.title, MINUTES_URL]);
  const meetingId = mres.rows[0].id;

  // idempotent: clear this meeting's votes then reinsert
  await pool.query("DELETE FROM votes WHERE meeting_id=$1", [meetingId]);

  for (const v of VOTES) {
    const r = await pool.query(
      `INSERT INTO votes (meeting_id, vote_date, title, plain_summary, category_id, item_type, result, passed,
        is_roll_call, tally_yes, tally_no, tally_abstain, tally_absent,
        spending_amount, funding_local, funding_state, funding_federal, department, source_url, notes, is_sample)
       VALUES ($1,$2,$3,$4,$5,$6,'Passed 11–0',true,false,11,0,0,0,$7,$8,$9,$10,$11,$12,$13,false)
       RETURNING id`,
      [meetingId, MEETING.date, v.title, v.summary, cat[v.category] || null, v.item_type,
       v.spending ?? null, v.fundLocal ?? null, v.fundState ?? null, v.fundFederal ?? null,
       v.dept || "", MINUTES_URL,
       (v.fundNote ? v.fundNote + " " : "") + DERIVED_NOTE]);
    const vid = r.rows[0].id;
    for (const p of derive(MEETING.present, "yes")) {
      await pool.query(
        `INSERT INTO vote_positions (vote_id, councilor_id, position) VALUES ($1,$2,$3)
         ON CONFLICT (vote_id, councilor_id) DO UPDATE SET position=EXCLUDED.position`,
        [vid, p.id, p.position]);
    }
  }
  const n = (await pool.query("SELECT COUNT(*)::int c FROM votes WHERE is_sample=false")).rows[0].c;
  const pos = (await pool.query("SELECT COUNT(*)::int c FROM vote_positions")).rows[0].c;
  console.log(`Loaded ${VOTES.length} real votes for ${MEETING.date}. Total real votes in DB: ${n}. Positions: ${pos}.`);
  await pool.end();
})().catch(e => { console.error("LOAD FAILED:", e.message); process.exit(1); });
