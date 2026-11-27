# Lynn City Watch

A fact-based civic transparency and accountability platform for Lynn, Massachusetts city
government. It turns public records into a searchable, source-linked resource so residents
can see how councilors vote, where taxpayer money goes, and whether City Hall is being open
and consistent.

## The one rule

Every fact on this site traces back to an official public record, with a link. Nothing is
invented. Where a record is missing, the site says so — that absence is itself a
transparency finding, not a blank to fill with a guess.

## What it will cover

1. Councilor Profiles — how each of the 11 members votes, attends, and sponsors
2. Voting Record Database — every vote, searchable by member, date, topic, and money
3. Spending Dashboard — where taxpayer money goes, and **what it actually costs local
   taxpayers** after state and federal funds are removed
4. Hot Topic Issue Pages
5. Transparency Scorecards
6. Public Records + Missing Information Tracker
7. Document Library
8. Compare Priorities Tool
9. Search Everything
10. Agentic Topic Summaries (AI that explains the records, with citations only)

## Real data (confirmed from lynnma.gov)

- Council: 11 members — 7 ward + 4 at-large
- President: Coco Alinsug (Ward 3) · Vice President: Fred Hogan (Ward 6)
- Meets 2nd & 4th Tuesdays, 6 PM, 4th-floor Council Chamber, Lynn City Hall
- Sources: council agendas/minutes + Meeting Archive (lynnma.gov), Mayor's Budget (CFO),
  audited financials (Comptroller), meeting video (Lynn Community TV)

## Project layout

- [`BUILD-PLAN.md`](BUILD-PLAN.md) — the plain-English build plan
- [`prototype/`](prototype/) — clickable static prototype (home, councilor profiles,
  voting database)

## Running locally

```bash
npm install
node server.js                       # static site only, no database
DATABASE_URL=postgres://... node server.js   # full site with the vote database
```

Then open http://localhost:3000.

## How the data gets updated

- **Council votes** live in `db/data/votes_YYYY.json`, one entry per meeting,
  transcribed from the official minutes (each meeting carries its city file key,
  so every vote links to its source PDF).
- On every boot the server runs `db/sync.js`, which reloads any vote file whose
  contents changed since the last load (all-or-nothing, in one transaction).
  **To publish new votes: add or fix the JSON, commit, deploy.** No manual
  database step. To force a full reload: `DATABASE_URL=... node db/sync.js --force`.
- **Budget, committees, and the records tracker** live in
  `prototype/assets/data.js`, each with its source link and the date it was checked.
- `GET /api/status` shows how current the vote data is.

## Status (as of November 26, 2026)

- Voting record: January 2024 through the October 13, 2026 meeting
  (1,306 recorded votes from 57 meetings). Minutes for Oct 27, Nov 10 and
  Nov 24, 2026 were not yet posted by the city; June 9, 2026 minutes were
  approved but never posted (see the Records Tracker page).
- Spending: FY2027 Mayor's submitted budget ($577,017,037) and FY2025 audited
  financial statements (the latest audit the city has posted).
- Councilor profiles include committee assignments from lynnma.gov.

This is an independent project and is not affiliated with the City of Lynn.
