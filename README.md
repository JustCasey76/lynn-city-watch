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

## Running the prototype locally

```bash
cd prototype
python -m http.server 8747
# then open http://localhost:8747/index.html
```

## Status

Early prototype. The councilor roster, seats, titles, meeting schedule, and source links
are real. Vote rows and dollar figures marked **Sample** are placeholders demonstrating the
interface and will be replaced with sourced records before launch.

This is an independent project and is not affiliated with the City of Lynn.
