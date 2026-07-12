/*
 * Lynn Transparency Platform — client data (roster, categories, revenue,
 * spending-by-function, sources).
 * -------------------------------------------------------------
 * ALL figures here are REAL and sourced:
 *   - councilor roster, seats, titles, source links: City of Lynn (lynnma.gov)
 *   - citywide revenue mix + General Fund spending by function: Lynn audited
 *     financial statements, FY2025 (budgetary comparison schedule, p.83)
 * The voting record, per-member positions, attendance, and meeting videos are
 * served live from the database (see /api), not from this file.
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
  "Housing", "Zoning & Development", "Immigration-related", "Legal Services", "Social policy",
  "LGBTQ-related policy", "Accessibility-related policy", "Infrastructure", "Public Works", "City Services",
  "Transparency", "Ethics", "Appointments", "Grants",
];

/*
 * REAL: General Fund expenditures by function — Lynn audited financial
 * statements, year ended June 30, 2025 (budgetary comparison schedule, p.83).
 * "final" = final budget, "actual" = actual expenditures. Exact dollars.
 * The audit reports spending by function, not the state/federal funding split
 * per function, so a per-function "net local cost" is NOT derivable from this
 * document — see the citywide revenue mix and the per-vote net local figures.
 */
const GF_EXPENDITURES = {
  sample: false,
  fiscalYear: 2025,
  basis: "General Fund — audited actual expenditures (year ended June 30, 2025)",
  sourceLabel: "City of Lynn audited financial statements, FY2025 (budgetary comparison schedule, p.83)",
  sourceUrl: "https://www.lynnma.gov/city_government/departments/comptrollers/financial_statements",
  functions: [
    { name: "Education (Lynn Public Schools)", final: 291073391, actual: 290202340 },
    { name: "Employee benefits (pensions, insurance)", final: 96696083, actual: 96635879 },
    { name: "Public safety (police, fire, inspections)", final: 61903826, actual: 58717482 },
    { name: "Intergovernmental assessments", final: 41872578, actual: 41738796 },
    { name: "Public works", final: 22257804, actual: 20772075 },
    { name: "General government", final: 13963604, actual: 13229788 },
    { name: "Debt service", final: 7445503, actual: 5927814 },
    { name: "Culture and recreation", final: 1391615, actual: 1381486 },
    { name: "Health and human services", final: 1047364, actual: 980151 },
  ],
};

/*
 * Citywide General Fund revenue mix — REAL, from Lynn's audited financial
 * statements, year ended June 30, 2025 (FY2025), General Fund budgetary
 * comparison schedule, "Actual" column (audit p.83). Dollars are exact.
 * This is a REVENUE mix, not a spending mix, and does not describe how any
 * single department/program/vote is funded.
 */
const CITY_REVENUE = {
  sample: false,
  fiscalYear: 2025,
  basis: "General Fund — audited actual revenues (year ended June 30, 2025)",
  totalRevenue: 523450373,
  sourceLabel: "City of Lynn audited financial statements, FY2025",
  sourceUrl: "https://www.lynnma.gov/city_government/departments/comptrollers/financial_statements",
  sources: [
    { source: "Property taxes", amount: 165943910, kind: "localtax", note: "Real estate and personal property taxes raised locally; the levy is limited by Proposition 2½." },
    { source: "Excise taxes", amount: 12209359, kind: "localtax", note: "Chiefly motor-vehicle excise; raised locally." },
    { source: "Penalties, interest & other taxes", amount: 2061226, kind: "localtax", note: "Tax-related penalties and interest." },
    { source: "Intergovernmental revenue", amount: 325066934, kind: "intergov", note: "Generally includes state and federal sources; the audit does not break this single line into state vs. federal." },
    { source: "Charges for services", amount: 5378270, kind: "other", note: "Local departmental charges for city services." },
    { source: "Licenses and permits", amount: 5027846, kind: "other", note: "Local licensing and permitting fees." },
    { source: "Fines and forfeitures", amount: 3934350, kind: "other", note: "Local fines and forfeitures." },
    { source: "Investment income", amount: 3598462, kind: "other", note: "Interest and investment earnings." },
    { source: "Miscellaneous", amount: 230016, kind: "other", note: "Other miscellaneous General Fund revenue." },
  ],
};

const SECTIONS = [
  { n: 1,  title: "Councilor Profiles",        blurb: "How each of the 11 members votes, attends, and sponsors.", href: "councilors.html", ready: true },
  { n: 2,  title: "Voting Record Database",    blurb: "Every vote, searchable by member, date, topic, and money.", href: "votes.html", ready: true },
  { n: 3,  title: "Spending Dashboard",        blurb: "Where money goes — and what it really costs YOU after state & federal funds.", href: "spending.html", ready: true },
  { n: "▶", title: "Council Meetings",         blurb: "Watch every recorded Lynn City Council meeting (Lynn Community TV).", href: "meetings.html", ready: true },
  { n: "§", title: "Funds Not Fully Accounted For", blurb: "Money the public records don't fully explain — facts only, no accusations.", href: "unaccounted.html", ready: true },
  { n: 4,  title: "Hot Topic Issue Pages",     blurb: "All the facts on one issue, in one place.", href: "#", ready: false },
  { n: 5,  title: "Transparency Scorecards",   blurb: "Measurable records — never name-calling.", href: "#", ready: false },
  { n: 6,  title: "Public Records Tracker",    blurb: "What we requested, and whether the city delivered.", href: "#", ready: false },
  { n: 7,  title: "Document Library",          blurb: "The underlying records, organized and linked.", href: "#", ready: false },
  { n: 8,  title: "Compare Priorities Tool",   blurb: "Side-by-side: e.g. police funding vs. legal services.", href: "#", ready: false },
  { n: 9,  title: "Search Everything",         blurb: "One search across votes, money, docs, and people.", href: "#", ready: false },
  { n: 10, title: "Agentic Topic Summaries",   blurb: "AI that explains the records — with citations only.", href: "#", ready: false },
];
