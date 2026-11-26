/*
 * Lynn Transparency Platform — client data (roster, categories, revenue,
 * spending-by-function, sources).
 * -------------------------------------------------------------
 * ALL figures here are REAL and sourced (last checked 2026-11-26):
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

/*
 * REAL: Council committee assignments for the 2026-2027 term.
 * Source: lynnma.gov "Committees" page, checked 2026-11-26. Ids match COUNCILORS.
 */
const COMMITTEES_SOURCE = "https://www.lynnma.gov/city_government/citycouncil/committees";
const COMMITTEES = [
  {"name": "Arts, Culture, Entertainment, and Tourism", "chairs": ["avery"], "members": ["paez", "meaney", "matul", "lapierre"]},
  {"name": "Budget", "chairs": ["matul"], "members": ["lapierre", "net", "field", "maddrey"]},
  {"name": "Civil Rights, Racial Equity, and Immigrant Advancement", "chairs": ["net"], "members": ["alinsug", "matul", "maddrey", "mcclain"]},
  {"name": "Councilor Appointment", "chairs": ["maddrey"], "members": ["mcclain", "matul", "paez", "avery"]},
  {"name": "Downtown Development", "chairs": ["maddrey", "paez"], "members": ["hogan", "field", "lapierre"]},
  {"name": "Economic, Labor, and Workforce Development", "chairs": ["hogan"], "members": ["field", "matul", "mcclain", "net"]},
  {"name": "Education", "chairs": ["lapierre"], "members": ["mcclain", "paez", "maddrey", "matul"]},
  {"name": "Election", "chairs": ["avery"], "members": ["field", "mcclain", "paez", "lapierre"]},
  {"name": "Environmental Affairs", "chairs": ["paez"], "members": ["lapierre", "mcclain", "maddrey", "matul"]},
  {"name": "General Electric (GE) Sub-Committee", "chairs": ["hogan", "avery"], "members": ["lapierre", "paez", "net"]},
  {"name": "Government Administration", "chairs": ["field"], "members": ["avery", "matul", "paez", "lapierre"]},
  {"name": "Housing and Community Development", "chairs": ["maddrey"], "members": ["net", "mcclain", "field", "paez"]},
  {"name": "Illegal Fireworks", "chairs": ["meaney"], "members": ["paez", "net", "mcclain", "avery"], "others": ["City Attorney Cronin", "Lynn Police Department Chief", "Lynn Fire Department Chief", "Bret Bennett, Inspectional Services Director", "Michael Donovan, Department of Public Works Commissioner", "Lisa Tobin, Public Health Director", "Representative of the Mayor's Office"]},
  {"name": "Licensing", "chairs": ["field"], "members": ["net", "avery", "maddrey", "hogan"]},
  {"name": "Trash and Litter", "chairs": ["field", "maddrey"], "members": ["paez", "net", "mcclain"], "others": ["Bret Bennett, Inspectional Services Director", "City Attorney Cronin", "Lisa Nerich, Department of Parks & Recreation Commissioner", "Michael J. Donovan, Department of Public Works Commissioner", "Jessica Chiappini, Parking Director", "Lauren Drago, Chief of Planning and Community Development", "Lennin Pena, School Committee Member"]},
  {"name": "Lynnway Development", "chairs": ["hogan"], "members": ["avery", "paez", "maddrey", "lapierre"]},
  {"name": "Opioid, Recovery, and Recreational Cannabis Sites", "chairs": ["field"], "members": ["mcclain", "paez", "maddrey", "lapierre"], "others": ["City Attorney Slattery", "Bret Bennett, Inspectional Services Director", "Danya Smith, EDIC Director"]},
  {"name": "Ordinance", "chairs": ["lapierre"], "members": ["field", "mcclain", "net", "hogan"]},
  {"name": "Personnel", "chairs": ["lapierre"], "members": ["matul", "hogan", "maddrey", "field"]},
  {"name": "Public Health", "chairs": ["field"], "members": ["mcclain", "meaney", "maddrey", "matul"]},
  {"name": "Public Property and Parks", "chairs": ["matul"], "members": ["hogan", "lapierre", "maddrey", "avery"]},
  {"name": "Public Safety and Criminal Justice", "chairs": ["hogan", "field"], "members": ["mcclain", "avery", "matul"]},
  {"name": "Public Works", "chairs": ["hogan"], "members": ["lapierre", "net", "avery", "matul"]},
  {"name": "Rules", "chairs": ["net"], "members": ["matul", "hogan", "paez", "maddrey"]},
  {"name": "Sister Cities and International Relations", "chairs": ["alinsug"], "members": ["net", "maddrey", "matul", "hogan"]},
  {"name": "Seniors and Elderly Affairs", "chairs": ["maddrey"], "members": ["field", "mcclain", "hogan", "avery"]},
  {"name": "Utilities", "chairs": ["matul"], "members": ["net", "paez", "maddrey", "hogan"]},
  {"name": "Veterans, Military Affairs, and Military Families", "chairs": ["mcclain", "meaney"], "members": ["hogan", "lapierre", "field"]},
  {"name": "Ways and Means", "chairs": ["net"], "members": ["alinsug", "field", "avery", "matul"]},
  {"name": "Women and Gender Equality", "chairs": ["mcclain"], "members": ["alinsug", "maddrey", "net", "paez"]},
  {"name": "Youth, Children, and Adolescence", "chairs": ["mcclain"], "members": ["lapierre", "paez", "maddrey", "matul"]},
  {"name": "Zoning", "chairs": ["matul"], "members": ["mcclain", "field", "paez", "meaney"]},
];

/*
 * REAL: FY2027 city budget (July 1, 2026 - June 30, 2027), from the Mayor's
 * submitted budget dated May 9, 2026 ("Annual Municipal Budget FY2027",
 * Budget Summary pp.7-9, school funding p.73). FY2026 column = "Final" as
 * printed in the same document. This is the SUBMITTED budget; the Council's
 * adoption vote (hearing set for June 9, 2026) is not in the posted minutes.
 */
const BUDGET_FY27 = {
  fiscalYear: 2027,
  total: 577017037,
  totalPrior: 554040568,
  status: "Mayor's submitted budget, dated May 9, 2026",
  sourceLabel: "City of Lynn, Annual Municipal Budget FY2027 (Mayor's Budget page)",
  sourceUrl: "https://www.lynnma.gov/common/pages/GetFile.ashx?key=iukEAHEW",
  revenue: [
    { source: "State aid (Cherry Sheet)", fy26: 352947453, fy27: 366059945, kind: "state", note: "State aid to Lynn, mostly Chapter 70 school aid. The state also charges back $50,493,818 in Cherry Sheet assessments (listed under spending)." },
    { source: "Property taxes", fy26: 175371062, fy27: 181905338, kind: "localtax", note: "Levy limit under Proposition 2½: last year's limit + 2.5% ($4,384,277) + new growth ($2,150,000)." },
    { source: "Local receipts", fy26: 24316839, fy27: 25356319, kind: "local", note: "Motor-vehicle excise, fees, permits, fines, and charges for services." },
    { source: "Free Cash (one-time)", fy26: 799650, fy27: 2900000, kind: "local", note: "Prior-year surplus, used for one-time capital purchases." },
    { source: "Other transfers (Gannon, parking, COA, marina)", fy26: 605564, fy27: 795435, kind: "local", note: "Transfers from other city funds to cover related expenses and debt." },
  ],
  spending: [
    { name: "Lynn Public Schools", fy26: 269500000, fy27: 274000000 },
    { name: "Non-departmental (health insurance, other insurance, reserve, FICA)", fy26: 66365048, fy27: 70313057 },
    { name: "Public safety (police, fire, fire alarm, etc.)", fy26: 50952171, fy27: 53932864 },
    { name: "State & county Cherry Sheet assessments", fy26: 45510169, fy27: 50493818 },
    { name: "General government (incl. capital projects & school buildings)", fy26: 43406700, fy27: 45869802 },
    { name: "Pensions (contributory retirement)", fy26: 41499140, fy27: 43280423 },
    { name: "Public service (DPW, sanitation, snow, parking)", fy26: 18435417, fy27: 20331358 },
    { name: "Debt service", fy26: 10137390, fy27: 10137390 },
    { name: "Capital from Free Cash", fy26: 799650, fy27: 2900000 },
    { name: "Overlay (abatements & exemptions)", fy26: 1994971, fy27: 2089125 },
    { name: "Culture & recreation", fy26: 1826327, fy27: 1912312 },
    { name: "Health & welfare (Council on Aging, veterans)", fy26: 1288642, fy27: 1283700 },
    { name: "Wage stabilization fund", fy26: 2014801, fy27: 156000 },
    { name: "Cherry Sheet offsets", fy26: 310141, fy27: 317188 },
  ],
  departments: [
    { name: "Police", fy26: 25034525, fy27: 26808887 },
    { name: "Fire", fy26: 23904779, fy27: 25078060 },
    { name: "Health insurance", fy26: 56502755, fy27: 61452303 },
    { name: "Capital Projects", fy26: 16377321, fy27: 15955059 },
    { name: "Inspectional Services (schools)", fy26: 13225593, fy27: 14469853 },
    { name: "DPW Sanitation", fy26: 8760388, fy27: 9906764 },
    { name: "DPW", fy26: 6460984, fy27: 6960133 },
    { name: "Inspectional Services (city)", fy26: 2973483, fy27: 4633244 },
    { name: "Information Technology", fy26: 2112713, fy27: 2170884 },
    { name: "Library", fy26: 1319909, fy27: 1379998 },
    { name: "Mayor", fy26: 1021473, fy27: 1137139 },
  ],
  // School funding, FY2027 budget p.73 (Lynn Public Schools section)
  schools: {
    enrollment: 18077, enrollmentPrior: 18512,
    requiredNSS: 398807328,        // required Net School Spending (= foundation budget)
    chapter70: 327335160,          // state Chapter 70 aid
    requiredLocal: 71472168,       // required local contribution
    schoolDeptBudget: 274000000,   // school department line in the city budget summary
    schoolAllocationStated: 274200000, // allocation stated in the school section
  },
  freeCashCapital: [
    { dept: "DPW", use: "Fleet replacement (all departments)", amount: 537000 },
    { dept: "Police", use: "Patrol cars", amount: 504051 },
    { dept: "DPW", use: "Facility improvements & equipment", amount: 425000 },
    { dept: "Fire", use: "Western Ave station bathrooms", amount: 300000 },
    { dept: "IT / Fire Alarm", use: "Fiber loop", amount: 275000 },
    { dept: "GAR", use: "Exterior improvements", amount: 250000 },
    { dept: "DPW", use: "Essex Street title work", amount: 226000 },
    { dept: "IT", use: "Public safety switches & Windows 11", amount: 150000 },
    { dept: "DPW", use: "Trash barrel replacement", amount: 145000 },
    { dept: "Assessing", use: "Property inspections", amount: 48000 },
    { dept: "Police", use: "Roof engineering", amount: 39949 },
  ],
};

/*
 * REAL: Records tracker — what the city has and has not posted.
 * Checked against lynnma.gov on 2026-11-26. "Listing date" is the date the
 * city's document list shows for the file; it reflects the latest upload, so
 * it can be later than the first posting (e.g. a corrected file).
 */
const RECORDS_CHECKED = "2026-11-26";
const MINUTES_SOURCE = "https://www.lynnma.gov/city_government/citycouncil/meeting";
const MINUTES_2026 = [
  { date: "2026-01-05", label: "Inaugural meeting", key: "JccEAN44", listed: "2026-01-28" },
  { date: "2026-01-13", key: "JuUEAN0a", listed: "2026-04-30", approved: "2026-02-10" },
  { date: "2026-01-27", key: "KOUEANMa", listed: "2026-04-30", approved: "2026-02-10" },
  { date: "2026-02-10", key: "7c8EABYw", listed: "2026-02-25" },
  { date: "2026-02-24", key: "QOUEALsa", listed: "2026-04-30" },
  { date: "2026-03-10", key: "ydkEADIm", listed: "2026-03-25", approved: "2026-03-24" },
  { date: "2026-03-24", key: "xd8EAD4g", listed: "2026-04-16" },
  { date: "2026-04-14", key: "BeUEAP4a", listed: "2026-08-06", note: "Revised minutes (clerical error) accepted Aug 4, 2026" },
  { date: "2026-04-28", key: "rekEAFYW", listed: "2026-05-13", approved: "2026-05-12" },
  { date: "2026-05-12", key: "iu8EAHEQ", listed: "2026-05-27", approved: "2026-05-26" },
  { date: "2026-05-26", key: "xPQEAD8L", listed: "2026-06-11" },
  { date: "2026-06-09", approved: "2026-06-23", note: "FY2027 budget public hearing was scheduled for this meeting. The Council accepted these minutes on June 23, but they are not on the city's list." },
  { date: "2026-06-23", key: "Bv0EAP0C", listed: "2026-07-09", approved: "2026-07-07" },
  { date: "2026-07-07", key: "WA0FAKLy", listed: "2026-08-06", approved: "2026-08-04" },
  { date: "2026-08-04", key: "GxsFAOHk", listed: "2026-09-10" },
  { date: "2026-09-08", key: "SiEFALDe", listed: "2026-09-24" },
  { date: "2026-09-22", key: "NCcFAM7Y", listed: "2026-10-14", approved: "2026-10-13" },
  { date: "2026-10-13", key: "ySsFADPU", listed: "2026-10-29" },
  { date: "2026-10-27" },
  { date: "2026-11-10" },
  { date: "2026-11-24" },
];
const RECORDS_FINDINGS = [
  { title: "June 9, 2026 council minutes are not posted",
    status: "missing",
    detail: "The Mayor's FY2027 budget ($577,017,037) was set down for a public hearing at the June 9, 2026 meeting. The Council accepted the June 9 minutes on June 23, 2026, but no June 9 minutes file appears in the city's 2026 minutes list. Until it is posted, the Council's recorded action on the FY2027 budget is not available in the public record we reviewed.",
    url: MINUTES_SOURCE },
  { title: "Adopted (final) budgets are not posted for FY2022–FY2027",
    status: "missing",
    detail: "The Mayor's Budget page lists only a submitted or proposed version for each year from FY2022 through FY2027 (for FY2027: \"FY2027 BUDGET\", the Mayor's submitted budget dated May 9, 2026). The last year with a budget labeled as final/approved by the Council is FY2021.",
    url: "https://www.lynnma.gov/city_government/departments/cfo/mayor_s_budget" },
  { title: "FY2024 audited financial statements are not in the Comptroller's archive",
    status: "missing",
    detail: "The Comptroller's Financial Statement Archive lists statements for 2003–2023 and 2025, but none for the year ended June 30, 2024. The 2025 entry is labeled \"For the Year Ending June 30, 2026\", but the linked file is the audit for the year ended June 30, 2025.",
    url: "https://www.lynnma.gov/city_government/departments/comptrollers/financial_statements" },
  { title: "2026 council minutes are scanned images with no searchable text",
    status: "access",
    detail: "Every 2026 minutes file we downloaded is a scanned image PDF with no text layer. They can't be searched or copied, and screen readers can't read them. Older minutes (through 2021) include text.",
    url: MINUTES_SOURCE },
  { title: "Capital Improvement Plan not yet posted",
    status: "pending",
    detail: "The FY2027 budget says the city's first in-house Capital Improvement Plan \"will be posted as a separate document on the City's website.\" No such document appears on the Mayor's Budget page.",
    url: "https://www.lynnma.gov/city_government/departments/cfo/mayor_s_budget" },
];

const SECTIONS = [
  { n: 1,  title: "Councilor Profiles",        blurb: "How each of the 11 members votes, attends, and sponsors.", href: "councilors.html", ready: true },
  { n: 2,  title: "Voting Record Database",    blurb: "Every vote, searchable by member, date, topic, and money.", href: "votes.html", ready: true },
  { n: 3,  title: "Spending Dashboard",        blurb: "The FY2027 budget, audited FY2025 spending, and what it really costs YOU after state aid.", href: "spending.html", ready: true },
  { n: "$", title: "Immigration-Related Spending", blurb: "Every council-recorded item on immigration, with funding source and local cost.", href: "immigration.html", ready: true },
  { n: "▶", title: "Council Meetings",         blurb: "Watch every recorded Lynn City Council meeting (Lynn Community TV).", href: "meetings.html", ready: true },
  { n: "§", title: "Funds Not Fully Accounted For", blurb: "Money the public records don't fully explain — facts only, no accusations.", href: "unaccounted.html", ready: true },
  { n: 4,  title: "Hot Topic Issue Pages",     blurb: "All the facts on one issue, in one place.", href: "#", ready: false },
  { n: 5,  title: "Transparency Scorecards",   blurb: "Measurable records — never name-calling.", href: "#", ready: false },
  { n: 6,  title: "Public Records Tracker",    blurb: "Which minutes, budgets, and audits the city has posted, and which are missing.", href: "records.html", ready: true },
  { n: 7,  title: "Document Library",          blurb: "The underlying records, organized and linked.", href: "#", ready: false },
  { n: 8,  title: "Compare Priorities Tool",   blurb: "Side-by-side: e.g. police funding vs. legal services.", href: "#", ready: false },
  { n: 9,  title: "Search Everything",         blurb: "One search across votes, money, docs, and people.", href: "#", ready: false },
  { n: 10, title: "Agentic Topic Summaries",   blurb: "AI that explains the records — with citations only.", href: "#", ready: false },
];
