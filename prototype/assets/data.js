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
 * REAL: what each council title means. Quoted/paraphrased from the Lynn City
 * Charter, Article 2 (Sections 2-1 and 2-2), as posted by the city's Charter
 * Review Committee (January 2025 text). The city has not posted the final
 * adopted charter, but the section numbers cited in the 2026 council minutes
 * (2-8, 3-3, 3-4, 6-1) match this text. Composition and 2-year terms are also
 * stated on the city's City Council page.
 */
const CHARTER_SOURCE = "https://www.lynnma.gov/city_government/boards_and_commissions/charter_review_committee";
const COUNCIL_PAGE = "https://www.lynnma.gov/city_government/citycouncil";
const TITLE_DEFS = {
  ward: { label: "Ward Councilor",
    text: "Represents one of Lynn's 7 wards (neighborhood districts). Only voters who live in that ward elect this seat. One councilor is elected from each ward.",
    cite: "Charter §2-1(a)" },
  atlarge: { label: "Councilor At-Large",
    text: "Represents the whole city. All Lynn voters, in every ward, vote for the 4 at-large seats.",
    cite: "Charter §2-1(a)" },
  term: { label: "Term",
    text: "Every councilor serves a 2-year term starting the first business day of January after the election. Elections are held in odd-numbered years.",
    cite: "Charter §2-1(c); City Council page" },
  president: { label: "Council President",
    text: "Chosen by the full council from among its members each January (roll call; a majority of all 11 councilors is needed). The President runs council meetings, keeps order, and rules on questions of procedure, and votes like any other councilor.",
    cite: "Charter §2-2" },
  vp: { label: "Council Vice President",
    text: "Chosen by the full council from among its members each January, by a separate roll call. Acts as President when the President is absent.",
    cite: "Charter §2-2" },
  chair: { label: "Committee Chair / Co-chair",
    text: "The councilor the city lists as leading that council committee.",
    cite: "City Council committees page" },
};
const WARD_MAP = (n) => `https://www.lynnma.gov/UserFiles/Servers/Server_109726/File/CityGovernment/City%20Council/WardMaps/Ward${n}.pdf`;

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
const RECORDS_CHECKED = "2026-11-27";
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
    detail: "The Mayor's FY2027 budget ($577,017,037) was set down for a public hearing at the June 9, 2026 meeting. The Council accepted the June 9 minutes on June 23, 2026, but no June 9 minutes file appears in the city's 2026 minutes list. Until it is posted, the Council's recorded action on the FY2027 budget is not available in the public record we reviewed. This is unusual: it is the only 2026 meeting whose minutes the Council approved that are not on the list, while other 2026 minutes have usually appeared within a day or two of approval.",
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

/*
 * REAL: "What happened at City Hall" — hand-checked highlights from the 2026
 * official records, shown on the home page. Every statement below is taken
 * from the cited record. Nothing is inferred: where the record gives no reason,
 * the item says so.
 *
 * kind:  "closer"   = Worth a closer look (meets one of HIGHLIGHT_RULES.closer)
 *        "good"     = Good news (meets one of HIGHLIGHT_RULES.good)
 *        "decision" = Key decision (a major action, shown without a judgment)
 * src:   minutes file keys (lynnma.gov GetFile) or full URLs, with the date.
 */
const HIGHLIGHTS_CHECKED = "2026-11-26";
const HIGHLIGHT_RULES = {
  closer: [
    { id: "split", label: "The Council split", text: "At least one councilor voted no, abstained, or voted present." },
    { id: "overrun", label: "Over budget or over cost", text: "The record itself says a cost ran over, or spending went well past its budget line." },
    { id: "nopurpose", label: "Purpose not stated", text: "A large transfer where the minutes do not say what the money is for." },
    { id: "repeat", label: "Repeated item", text: "The same amount for the same kind of bill was approved more than once." },
    { id: "removal", label: "Removal or non-reappointment", text: "The Council acted to remove someone from, or not reappoint someone to, a public board." },
    { id: "record", label: "Record problem", text: "The official minutes are missing, have no recorded outcome, or contain a printing error." },
    { id: "pastyear", label: "Bills from a past year", text: "Paying invoices from a fiscal year that has already closed." },
  ],
  good: [
    { id: "outside", label: "Outside money", text: "State, federal, or private money came in, with $0 cost to local taxpayers on that vote." },
    { id: "underbudget", label: "Under budget", text: "Audited spending came in below the approved budget." },
    { id: "reserves", label: "Stronger finances", text: "An official finance document reports reserves or long-term liabilities improving." },
  ],
};
const HIGHLIGHT_TOPICS = ["Mayor's decisions", "Staff & appointments", "DPW & streets", "Money & budget", "Public safety", "Immigration", "Schools", "Records & process"];
const KEY = (k) => "https://www.lynnma.gov/common/pages/GetFile.ashx?key=" + k;
const HIGHLIGHTS = [
  /* ---------- Mayor's decisions ---------- */
  { date: "2026-09-08", topic: "Mayor's decisions", kind: "decision", rule: "split",
    title: "Council rejected the Mayor's Administrative Code, then approved a revised version",
    facts: "On July 7 the Council voted 9-2 to deny the Mayor's proposed Administrative Code dated June 5, 2026 (Councilors Field and Net voted no). A motion under Charter Section 6-1 asked the Mayor to prepare a revised code addressing the Council's concerns with two councilors chosen by the Council President. On September 8 the Council approved the amended code (dated July 8, as amended through August 28) 9-1, with Councilor Meaney voting no.",
    reason: "The minutes record the motions and votes but do not list the Council's specific concerns.",
    src: [{ d: "2026-07-07", k: "WA0FAKLy" }, { d: "2026-09-08", k: "SiEFALDe" }] },
  { date: "2026-05-12", topic: "Mayor's decisions", kind: "decision",
    title: "Mayor submitted a $577,017,037 budget for FY2027",
    facts: "The Mayor's letter (May 9, 2026) says the budget \"adds no new positions,\" moves the language access program into permanent positions in the Mayor's Office, and uses opioid settlement funds and $100,000 in surplus ARPA funds for summer youth jobs. The Council set the public hearing for June 9, 2026.",
    reason: null,
    src: [{ d: "2026-05-12", k: "iu8EAHEQ" }, { d: "FY2027 budget", u: KEY("iukEAHEW") }], link: "spending.html#fy27" },
  { date: "2026-10-13", topic: "Mayor's decisions", kind: "decision",
    title: "Two department heads given second titles under the new Administrative Code",
    facts: "The Mayor appointed Human Resources Director Drew Russo to also serve as Chief Administrative Officer (Section A-502) and Director of Public Health Lisa Tobin to also serve as Chief of Health and Human Services (Section A-506). Both were approved 11-0 by roll call.",
    reason: "The minutes cite the code sections; they do not state other reasons.",
    src: [{ d: "2026-10-13", k: "ySsFADPU" }] },

  /* ---------- Staff & appointments ---------- */
  { date: "2026-09-22", topic: "Staff & appointments", kind: "decision",
    title: "Department heads confirmed in 2026",
    facts: "City Solicitor John P. Slattery (Apr 14, 11-0) · Commissioner of Public Works Michael J. Donovan (Jul 7, 11-0) · Parking Director Jessica Chiappini, reappointed (Sep 8, 10-0) · Director of Public Health Lisa Tobin, reappointed (Sep 8, 10-0) · Parks and Recreation Commissioner Lisa Nerich (Sep 22, 9-0) · Director of Capital Projects Brendon Duffy, effective Sep 23 (Sep 22, 9-0).",
    reason: "The minutes do not say why any of these positions changed hands or were up for appointment.",
    src: [{ d: "2026-04-14", k: "BeUEAP4a" }, { d: "2026-07-07", k: "WA0FAKLy" }, { d: "2026-09-08", k: "SiEFALDe" }, { d: "2026-09-22", k: "NCcFAM7Y" }] },
  { date: "2026-09-08", topic: "Staff & appointments", kind: "closer", rule: "record",
    title: "Planning Director post filled on a temporary basis",
    facts: "The Mayor designated Lauren Drago to perform the duties of Principal Planning Director, effective August 24, 2026, \"on a temporary basis until the position is permanently filled\" (Charter Section 3-4). The motion was to accept the letter for the files; no result is recorded.",
    reason: "The minutes do not say why the position became vacant.",
    src: [{ d: "2026-09-08", k: "SiEFALDe" }] },
  { date: "2026-02-24", topic: "Staff & appointments", kind: "decision",
    title: "New City Clerk / Chief of Elections",
    facts: "The Council's Personnel Committee referred Attorney James P. Lamanna for City Clerk / Chief of Election to the full Council for a vote. Later 2026 minutes address the clerk as Mr. Lamanna and refer to \"Chief of Elections Jim Lamanna.\"",
    reason: "The minutes reviewed do not state why the position was open, and we did not find the full Council's confirmation vote in the 2026 minutes we transcribed.",
    src: [{ d: "2026-02-24", k: "QOUEALsa" }, { d: "2026-07-07", k: "WA0FAKLy" }] },
  { date: "2026-09-08", topic: "Staff & appointments", kind: "closer", rule: "removal",
    title: "Council voted not to reappoint a Human Rights Commission member",
    facts: "After an interview, Councilors Avery and Matul moved not to reappoint Cristian Recinos to the Lynn Human Rights Commission; the motion carried (no tally recorded). The reappointment had been tabled on August 4.",
    reason: "The minutes do not state a reason.",
    src: [{ d: "2026-08-04", k: "GxsFAOHk" }, { d: "2026-09-08", k: "SiEFALDe" }] },
  { date: "2026-01-27", topic: "Staff & appointments", kind: "closer", rule: "removal",
    title: "Council moved to remove two Water and Sewer Commissioners",
    facts: "After a January 12 Commission vote to rescind the appointment of Chairman Michael Celona, the Council voted 9-2 (Field and LaPierre no) to have the Law Department draft Preliminary Notices of Removal for cause for Commissioners Richard Colucci and Vincent Lozzi, Jr. On Feb 24, motions were made to accept Mr. Colucci's letter declining a hearing, and to rescind Mr. Lozzi's notice after he wrote that he would not seek reappointment when his term ends June 30 — but no result is recorded for either motion. The Council then filled its Commission seat three times in 2026: Councilor Matul (Jan 27, after Councilor Meaney resigned the role), Thomas O'Shea (Apr 28, 7-3 with 1 present), and John M. Walsh (Jul 7, 8-2).",
    reason: "The minutes record statements by the Council President and Vice President about the January 12 vote but do not spell out the grounds for removal.",
    src: [{ d: "2026-01-27", k: "KOUEANMa" }, { d: "2026-02-24", k: "QOUEALsa" }, { d: "2026-04-28", k: "rekEAFYW" }, { d: "2026-07-07", k: "WA0FAKLy" }] },

  /* ---------- DPW & streets ---------- */
  { date: "2026-05-26", topic: "DPW & streets", kind: "closer", rule: "overrun",
    title: "$4.92 million added to snow and ice; the budget line was $1.65 million",
    facts: "The Council transferred $4,921,640 from Free Cash to DPW Snow and Ice (10-0, emergency order). The FY2026 Snow & Ice budget line was $1,650,000.",
    reason: "The CFO's letter in the FY2027 budget says the 2025–26 winter brought 63.4 inches of snow and a record number of salt and sanding events, costing more than $6 million, and that Free Cash \"supported the snow deficit.\"",
    src: [{ d: "2026-05-26", k: "xPQEAD8L" }, { d: "FY2027 budget", u: KEY("iukEAHEW") }] },
  { date: "2026-09-08", topic: "DPW & streets", kind: "closer", rule: "nopurpose",
    title: "$2.3 million transferred to the Essex Street account; the minutes don't describe the work",
    facts: "May 26: $390,000 from the Cannabis Fund to Essex Street Expense (9-0; Councilor Avery abstained). Sep 8: $1,912,000 from Capital Stabilization to Essex Street Expense (10-0). Both passed as emergency orders. The FY2027 budget separately lists $226,000 in Free Cash for \"Essex Street Title work.\"",
    reason: "The minutes name only the account, not the project or what the money buys.",
    src: [{ d: "2026-05-26", k: "xPQEAD8L" }, { d: "2026-09-08", k: "SiEFALDe" }] },
  { date: "2026-05-12", topic: "DPW & streets", kind: "closer", rule: "nopurpose",
    title: "$792,913 from the reserve to DPW Sanitation",
    facts: "Transferred from Reserve to DPW Sanitation as an emergency order, 11-0. The FY2026 DPW Sanitation budget was $8,760,388.",
    reason: "The minutes do not state what the extra money was needed for.",
    src: [{ d: "2026-05-12", k: "iu8EAHEQ" }] },
  { date: "2026-10-13", topic: "DPW & streets", kind: "closer", rule: "repeat",
    title: "Same $4,094.75 DPW prior-year bill amount approved twice",
    facts: "Sep 22: \"$4,094.75 From DPW Expense to DPW Bills of Prior Year\" (9-0). Oct 13: \"$4,094.75 – From DPW Expense to fund a DPW Bill of Prior Year\" (10-0). We checked both original pages.",
    reason: "The minutes do not identify the bill or vendor, so they do not show whether these are two different bills.",
    src: [{ d: "2026-09-22", k: "NCcFAM7Y" }, { d: "2026-10-13", k: "ySsFADPU" }] },
  { date: "2026-08-04", topic: "DPW & streets", kind: "good", rule: "outside",
    title: "$4.6 million in state road and traffic-safety money",
    facts: "Apr 28: $2,396,622 from MassDOT to design and build roadway safety improvements in the \"High Injury Network\" (11-0). Aug 4: MassDOT Chapter 90 road funding of $2,051,861.17 and a Complete Streets construction grant of $160,806.78 (10-0).",
    reason: null,
    src: [{ d: "2026-04-28", k: "rekEAFYW" }, { d: "2026-08-04", k: "GxsFAOHk" }] },
  { date: "2026-08-04", topic: "Schools", kind: "good", rule: "outside",
    title: "$9 million from outside sources for heat pumps at Lynn Tech (LTVI)",
    facts: "Two certifications for the Transforming Energy in Schools Initiative: $6,894,617 from Eversource and National Grid as MassSave sponsors, and $2,080,526 from the Department of Energy Resources (as printed: \"Department of Energy Resource\"). Both 10-0.",
    reason: null,
    src: [{ d: "2026-08-04", k: "GxsFAOHk" }] },
  { date: "2026-02-10", topic: "Money & budget", kind: "good", rule: "outside",
    title: "$1.2 million state MassWorks grant for the South Harbor project",
    facts: "Allotted to the Department of Community Development by the Massachusetts Executive Office of Economic Development, grant period March 2026 to June 2028 (11-0).",
    reason: null,
    src: [{ d: "2026-02-10", k: "7c8EABYw" }] },

  /* ---------- Public safety ---------- */
  { date: "2026-10-13", topic: "Public safety", kind: "decision",
    title: "Flock license-plate cameras: Police Chief in favor, 12 speakers opposed; Council ordered a review",
    facts: "At an Oct 13 public hearing the Police Chief spoke in favor and 12 people spoke in opposition (10 from Lynn, 2 from Salem). The Council approved a motion requiring regular Police updates on how the system is used and any misuse, a Law Department report within 45 days on options including an ordinance with privacy protections and \"our authority to prohibit\" the system, and a decision on next steps within 90 days.",
    reason: "The September 8 committee report says the discussion covered \"the ongoing investigation, uses of the Flock System, and public concerns\"; the minutes do not describe the investigation.",
    src: [{ d: "2026-09-08", k: "SiEFALDe" }, { d: "2026-10-13", k: "ySsFADPU" }] },
  { date: "2026-01-27", topic: "Public safety", kind: "closer", rule: "overrun",
    title: "Fayette Fire Station construction overage",
    facts: "Jan 27: $400,000 from Free Cash \"to fund overage on ongoing construction\" and $238,000 from ER Stabilization for the station's build-out (both 11-0). May 26: a further $335,000 from Free Cash to \"Fayette Street Expense\" (10-0).",
    reason: "The minutes do not say what caused the overage, or whether the May 26 transfer is for the same project.",
    src: [{ d: "2026-01-27", k: "KOUEANMa" }, { d: "2026-05-26", k: "xPQEAD8L" }] },
  { date: "2026-10-13", topic: "Public safety", kind: "good", rule: "outside",
    title: "$854,055 federal grant to replace 81 firefighter air packs",
    facts: "A Department of Homeland Security grant (printed as the \"Assistant to Firefighters Grant\") funds replacement of 81 SCBA (breathing apparatus) units and facepieces (10-0). Also in 2026: a $50,000 state earmark (Executive Office of Public Safety and Security) to combat gun violence (Jan 13) and $410,000 from \"the Department of Health and Human Services\" for the Calm Team program (Sep 22).",
    reason: null,
    src: [{ d: "2026-01-13", k: "JuUEAN0a" }, { d: "2026-09-22", k: "NCcFAM7Y" }, { d: "2026-10-13", k: "ySsFADPU" }] },

  /* ---------- Immigration ---------- */
  { date: "2026-05-12", topic: "Immigration", kind: "decision",
    title: "Council passed a resolution on ICE enforcement, 11-0",
    facts: "Sponsored by Councilor LaPierre, the resolution says certain federal immigration enforcement actions should be condemned, urges city officials to enforce laws protecting residents, and directs the Mayor to send it to the state's federal delegation, the Governor, and the Attorney General. It carried no spending.",
    reason: null,
    src: [{ d: "2026-05-12", k: "iu8EAHEQ" }], link: "immigration.html" },
  { date: "2026-05-09", topic: "Immigration", kind: "decision",
    title: "Language access program made permanent in the FY2027 budget",
    facts: "The Mayor's budget letter says ARPA funding for language access is ending, so those duties were moved into permanent positions in the Mayor's Office, and departments that asked were given two-way \"pocket talk\" translation devices. See the Immigration-Related Spending page for every council vote on the topic since 2024.",
    reason: "Stated in the Mayor's letter: \"This is the last budget year we have to expend American Rescue Plan Act (ARPA) funds,\" and it names summer youth jobs and language access as the \"two major exceptions\" to avoiding fiscal cliffs when ARPA ends.",
    src: [{ d: "FY2027 budget", u: KEY("iukEAHEW") }], link: "immigration.html" },

  /* ---------- Schools ---------- */
  { date: "2026-09-22", topic: "Schools", kind: "good", rule: "outside",
    title: "$16.7 million in DESE school grants accepted on Sep 22",
    facts: "On Sep 22 the Council accepted seven Department of Elementary and Secondary Education grants for Lynn Public Schools totaling $16,696,758, including $8,557,898 for Title I and $5,267,571 for special education (IDEA), each 9-0.",
    reason: null,
    src: [{ d: "2026-09-22", k: "NCcFAM7Y" }] },
  { date: "2026-01-27", topic: "Schools", kind: "decision",
    title: "$7.25 million from Free Cash for 195 Market Street",
    facts: "Appropriated for the Phase II build-out of 195 Market Street (11-0). The FY2027 budget says the building will become the schools' central office and expand Frederick Douglass Academy, letting the school system \"redirect about $800,000 in operating leases.\"",
    reason: "Stated in the FY2027 budget (Capital Projects section).",
    src: [{ d: "2026-01-27", k: "KOUEANMa" }, { d: "FY2027 budget", u: KEY("iukEAHEW") }] },

  /* ---------- Money & budget ---------- */
  { date: "2025-06-30", topic: "Money & budget", kind: "good", rule: "underbudget",
    title: "FY2025: every spending area came in under budget",
    facts: "The audited FY2025 General Fund shows actual spending below the final budget in all nine spending functions — $8,065,957 under in total ($529,585,811 spent against $537,651,768 budgeted).",
    reason: null,
    src: [{ d: "FY2025 audit, p.83", u: "https://www.lynnma.gov/city_government/departments/comptrollers/financial_statements" }], link: "spending.html" },
  { date: "2026-05-09", topic: "Money & budget", kind: "good", rule: "reserves",
    title: "Free Cash certified at $23.7 million; retiree health fund paid into again",
    facts: "The FY2027 budget's finance section reports Free Cash certified at $23.7 million (4.3% of the annual budget, up from 4.1%) and the OPEB (retiree health) trust funded for the fourth year in a row.",
    reason: null,
    src: [{ d: "FY2027 budget, p.36", u: KEY("iukEAHEW") }] },
  { date: "2026-05-09", topic: "Money & budget", kind: "closer", rule: "record",
    title: "FY2026 budget tables don't add up in two places",
    facts: "In the FY2027 budget's FY2026 column, the Non-Departmental total is $799,650 more than its listed lines, and the Reserve Fund is shown as $1,644,500 in the summary but $1,444,500 in the detail.",
    reason: "The document does not explain either difference.",
    src: [{ d: "FY2027 budget, pp.8–10", u: KEY("iukEAHEW") }], link: "unaccounted.html" },

  /* ---------- Records & process ---------- */
  { date: "2026-06-09", topic: "Records & process", kind: "closer", rule: "record",
    title: "June 9 minutes (FY2027 budget hearing) are not on the city's website",
    facts: "The FY2027 budget hearing was set for June 9, 2026. The Council accepted the June 9 minutes on June 23, but the file is not on the city's 2026 minutes list. That is unusual: other 2026 minutes have usually appeared on the list within a day or two of the Council approving them. (Minutes for the most recent meetings, Oct 27, Nov 10 and Nov 24, are not posted yet either, but those are still inside or near the usual wait for approval.)",
    reason: null,
    src: [{ d: "2026-06-23", k: "Bv0EAP0C" }, { d: "City minutes list", u: "https://www.lynnma.gov/city_government/citycouncil/meeting" }], link: "records.html" },
  { date: "2026-09-22", topic: "Records & process", kind: "closer", rule: "record",
    title: "Printing errors in the official minutes",
    facts: "Sep 22: the Diamond District historic study motion is printed as \"made by Councilor Paez and seconded by Councilor Paez.\" Sep 8: a Gaming Commission grant is printed as \"$51,3000.00.\" Mar 10: a school grant is printed as \"$213.875.\" Jun 23: a health grant is printed as \"$125.000.00.\"",
    reason: null,
    src: [{ d: "2026-03-10", k: "ydkEADIm" }, { d: "2026-06-23", k: "Bv0EAP0C" }, { d: "2026-09-08", k: "SiEFALDe" }, { d: "2026-09-22", k: "NCcFAM7Y" }] },
];

const SECTIONS = [
  { n: 1,  title: "Councilor Profiles",        blurb: "How each of the 11 members votes, their attendance, and their committees.", href: "councilors.html", ready: true },
  { n: 2,  title: "Voting Record Database",    blurb: "Every vote, searchable by member, date, topic, and money.", href: "votes.html", ready: true },
  { n: 3,  title: "Spending Dashboard",        blurb: "The FY2027 budget, audited FY2025 spending, and how much is paid locally vs. by state aid.", href: "spending.html", ready: true },
  { n: "$", title: "Immigration-Related Spending", blurb: "Every council-recorded item on immigration, with funding source and local cost.", href: "immigration.html", ready: true },
  { n: "▶", title: "Council Meetings",         blurb: "Watch every recorded Lynn City Council meeting (Lynn Community TV).", href: "meetings.html", ready: true },
  { n: "§", title: "Amounts Not Fully Explained", blurb: "Amounts the published documents don't fully break down or explain.", href: "unaccounted.html", ready: true },
  { n: 4,  title: "Hot Topic Issue Pages",     blurb: "All the facts on one issue, in one place.", href: "#", ready: false },
  { n: 5,  title: "Transparency Scorecards",   blurb: "Measurable, documented records only.", href: "#", ready: false },
  { n: 6,  title: "Public Records Tracker",    blurb: "Which minutes, budgets, and audits the city has posted, and which are missing.", href: "records.html", ready: true },
  { n: "✎", title: "Corrections & Updates",   blurb: "Every change to the site's data, logged in public. Report an error here.", href: "corrections.html", ready: true },
  { n: 7,  title: "Document Library",          blurb: "The underlying records, organized and linked.", href: "#", ready: false },
  { n: 8,  title: "Compare Priorities Tool",   blurb: "Side-by-side: e.g. police funding vs. legal services.", href: "#", ready: false },
  { n: 9,  title: "Search Everything",         blurb: "One search across votes, money, docs, and people.", href: "#", ready: false },
  { n: 10, title: "Agentic Topic Summaries",   blurb: "AI that explains the records — with citations only.", href: "#", ready: false },
];
