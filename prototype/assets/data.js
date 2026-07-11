/*
 * Lynn Transparency Platform — prototype data
 * -------------------------------------------------------------
 * REAL DATA: the councilor roster, seats, titles, and the record
 * source locations below were pulled from the City of Lynn's own
 * website (lynnma.gov) on 2026-07-11.
 *
 * SAMPLE DATA: vote rows, attendance %, and spending figures marked
 * with `sample: true` are ILLUSTRATIVE placeholders so you can see how
 * the interface behaves. They are clearly labeled everywhere in the UI
 * and must be replaced with sourced records before launch. Nothing
 * fabricated is ever shown as if it were real.
 * -------------------------------------------------------------
 */

const SOURCES = {
  councilRoster: "https://www.lynnma.gov/city_government/citycouncil/councilors",
  meetingInfo: "https://www.lynnma.gov/city_government/citycouncil/meeting",
  municipalMeetings: "https://www.lynnma.gov/community/municipal_meetings_page",
  mayorBudget: "https://www.lynnma.gov/city_government/departments/cfo/mayor_s_budget",
  financials: "https://www.lynnma.gov/city_government/departments/comptrollers/financial_statements",
  lynnTV: "https://lynntv.org/watch-online/programs/city-council-meetings/",
};

/* ---- REAL: the 11 current councilors ---- */
const COUNCILORS = [
  { id: "meaney",  name: "Dr. Peter D. Meaney",            seat: "Ward 1", type: "ward",     title: "",                       phone: "617-304-5791" },
  { id: "matul",   name: "Obed A. Matul",                  seat: "Ward 2", type: "ward",     title: "",                       phone: "781-632-1270" },
  { id: "alinsug", name: 'Constantino "Coco" Alinsug',     seat: "Ward 3", type: "ward",     title: "Council President",      phone: "781-913-3747" },
  { id: "maddrey", name: "Natasha S. Megie-Maddrey, Esq.", seat: "Ward 4", type: "ward",     title: "",                       phone: "781-910-3992" },
  { id: "paez",    name: "Cardeliz Paez",                  seat: "Ward 5", type: "ward",     title: "",                       phone: "781-200-4982" },
  { id: "hogan",   name: 'Frederick "Fred" W. Hogan',      seat: "Ward 6", type: "ward",     title: "Council Vice President", phone: "781-910-3891" },
  { id: "avery",   name: "Jordan T. Avery",                seat: "Ward 7", type: "ward",     title: "",                       phone: "781-200-4984" },
  { id: "lapierre",name: "Brian P. LaPierre",              seat: "At-Large", type: "atlarge", title: "",                      phone: "617-974-1243" },
  { id: "net",     name: "Hong L. Net",                    seat: "At-Large", type: "atlarge", title: "",                      phone: "781-910-4906" },
  { id: "field",   name: "Brian M. Field",                 seat: "At-Large", type: "atlarge", title: "",                      phone: "781-953-4841" },
  { id: "mcclain", name: "Nicole D. McClain",              seat: "At-Large", type: "atlarge", title: "",                      phone: "781-261-0786" },
];

/* ---- REAL: council facts ---- */
const COUNCIL_FACTS = {
  size: 11,
  ward: 7,
  atLarge: 4,
  meets: "2nd & 4th Tuesdays, 6:00 PM",
  location: "Council Chamber, 4th Floor, Lynn City Hall, 3 City Hall Square",
  schedule2026: "Jan 13 & 27 · Feb 10 & 24 · Mar 10 & 24 · Apr 14 & 28 · May 12 & 26 · Jun 9 & 23 · Jul 7 · Aug 4 · Sep 8 & 22 · Oct 13 & 27 · Nov 10 & 24 · Dec 8 & 15",
};

/* ---- Vote issue categories (from the project spec) ---- */
const CATEGORIES = [
  "Public Safety", "Police", "Fire", "Schools", "Taxes", "Budget & Spending",
  "Housing", "Zoning & Development", "Immigration", "Legal Services", "Social Issues",
  "LGBTQ / Pride", "Accessibility", "Infrastructure", "Public Works", "City Services",
  "Transparency", "Ethics", "Appointments", "Grants",
];

/*
 * ---- SAMPLE: illustrative vote rows ----
 * These demonstrate the data model + interface ONLY. Replace with
 * sourced records from official minutes before launch.
 */
const VOTES = [
  {
    id: "s1", sample: true, date: "2026-05-12",
    title: "SAMPLE — Order to appropriate funds for police department overtime",
    category: "Police", type: "Budget item", result: "Passed 8–3",
    summary: "Illustrative example of how a spending vote will be summarized in plain English, with the dollar impact and department shown.",
    spending: "$1,200,000 (sample)", department: "Police",
    effect: "Expanded", source: SOURCES.municipalMeetings,
  },
  {
    id: "s2", sample: true, date: "2026-04-28",
    title: "SAMPLE — Ordinance amending zoning for downtown mixed-use district",
    category: "Zoning & Development", type: "Ordinance", result: "Passed 7–4",
    summary: "Illustrative example of a split vote on a development/zoning change.",
    spending: "None", department: "Inspectional Services",
    effect: "Redirected", source: SOURCES.municipalMeetings,
  },
  {
    id: "s3", sample: true, date: "2026-04-14",
    title: "SAMPLE — Resolution supporting expanded public-records posting online",
    category: "Transparency", type: "Resolution", result: "Passed 11–0",
    summary: "Illustrative example of a unanimous transparency-related resolution.",
    spending: "None", department: "City Clerk",
    effect: "Expanded", source: SOURCES.municipalMeetings,
  },
  {
    id: "s4", sample: true, date: "2026-03-24",
    title: "SAMPLE — Appropriation for fire apparatus replacement",
    category: "Fire", type: "Budget item", result: "Passed 10–1",
    summary: "Illustrative example of a public-safety capital spending vote.",
    spending: "$850,000 (sample)", department: "Fire",
    effect: "Expanded", source: SOURCES.municipalMeetings,
  },
  {
    id: "s5", sample: true, date: "2026-03-10",
    title: "SAMPLE — Appointment to the Zoning Board of Appeals",
    category: "Appointments", type: "Appointment", result: "Passed 6–5",
    summary: "Illustrative example of a closely-divided appointment vote.",
    spending: "None", department: "Boards & Commissions",
    effect: "Delayed", source: SOURCES.municipalMeetings,
  },
];

/* ---- SAMPLE: illustrative spending snapshot (for home dashboard teaser) ---- */
const SPENDING_TEASER = [
  { dept: "Schools",       amount: 0.0, sample: true },
  { dept: "Police",        amount: 0.0, sample: true },
  { dept: "Fire",          amount: 0.0, sample: true },
  { dept: "Public Works",  amount: 0.0, sample: true },
  { dept: "Administration",amount: 0.0, sample: true },
];

const SECTIONS = [
  { n: 1,  title: "Councilor Profiles",        blurb: "How each of the 11 members votes, attends, and sponsors.", href: "councilors.html", ready: true },
  { n: 2,  title: "Voting Record Database",    blurb: "Every vote, searchable by member, date, topic, and money.", href: "votes.html", ready: true },
  { n: 3,  title: "Spending Dashboard",        blurb: "Where taxpayer money goes, by department, over time.", href: "#", ready: false },
  { n: 4,  title: "Hot Topic Issue Pages",     blurb: "All the facts on one issue, in one place.", href: "#", ready: false },
  { n: 5,  title: "Transparency Scorecards",   blurb: "Measurable records — never name-calling.", href: "#", ready: false },
  { n: 6,  title: "Public Records Tracker",    blurb: "What we requested, and whether the city delivered.", href: "#", ready: false },
  { n: 7,  title: "Document Library",          blurb: "The underlying records, organized and linked.", href: "#", ready: false },
  { n: 8,  title: "Compare Priorities Tool",   blurb: "Side-by-side: e.g. police funding vs. legal services.", href: "#", ready: false },
  { n: 9,  title: "Search Everything",         blurb: "One search across votes, money, docs, and people.", href: "#", ready: false },
  { n: 10, title: "Agentic Topic Summaries",   blurb: "AI that explains the records — with citations only.", href: "#", ready: false },
];
