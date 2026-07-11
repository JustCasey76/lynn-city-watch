# Lynn, MA City Hall Transparency Platform — Build Plan

*A plain-English plan for turning Lynn's public records into a searchable, fact-based accountability website.*

Last updated: 2026-07-11

---

## The one rule that shapes everything

Every fact on this site must trace back to an official public record with a link.
Nothing is invented. Where a record is missing, the site **says so out loud** — that
absence is itself a transparency finding, not a blank to be filled with a guess.

That rule is why the first thing we did was pull the *real* council roster, meeting
schedule, and record locations from the City of Lynn's own website before writing a
single page.

---

## What we confirmed is real (our starting data)

**Council = 11 members: 7 ward + 4 at-large.** Source: lynnma.gov council page.

| Seat | Member | Role |
|------|--------|------|
| Ward 1 | Dr. Peter D. Meaney | |
| Ward 2 | Obed A. Matul | |
| Ward 3 | Constantino "Coco" Alinsug | **Council President** |
| Ward 4 | Natasha S. Megie-Maddrey, Esq. | |
| Ward 5 | Cardeliz Paez | |
| Ward 6 | Frederick "Fred" W. Hogan | **Council Vice President** |
| Ward 7 | Jordan T. Avery | |
| At-Large | Brian P. LaPierre | |
| At-Large | Hong L. Net | |
| At-Large | Brian M. Field | |
| At-Large | Nicole D. McClain | |

**Where the records live (our source pipeline):**
- Council agendas + minutes and a "Meeting Archive" — lynnma.gov council pages
- Meeting schedule: 2nd & 4th Tuesdays, 6 PM, 4th-floor Council Chamber, City Hall
- Budgets — CFO / "Mayor's Budget" page
- Audited financial statements — Comptroller page
- Also useful: Lynn Community TV (meeting video archive), MA state budget portal

---

## How the site is built (the tech, in plain terms)

- **A modern static React site.** Fast, sleek, cheap to host (Vercel/Netlify, free tier),
  nothing to patch or get hacked like WordPress plugins.
- **The data lives in plain structured files** (one record per vote, per councilor, per
  budget line), each carrying its own source link. The website is just a clean way to
  read and search those records. This keeps facts and presentation separate — anyone can
  audit the underlying data.
- **Adding/updating records** = editing structured files (later we can add a simple admin
  screen so you don't touch code).
- **The AI research assistant (feature 11)** runs on top of that same source data and is
  only ever allowed to summarize what's in the records — with citations — never to
  speculate.

---

## The 11 sections — build order

We build in layers so you see real, working results early instead of waiting for
everything at once.

**Phase 1 — Prototype (this delivery):** Homepage + Councilor Profiles (flagship),
plus a preview of the Voting Database, using the real roster. Clearly-labeled sample
rows show how votes/spending will look before we ingest the real records.

**Phase 2 — Real data spine:**
1. **Councilor Profiles** — fill in committee assignments, attendance, votes, statements.
2. **Voting Record Database** — the searchable core; every vote categorized and sourced.
3. **Document Library** — the underlying records, organized and linked.

**Phase 3 — Money & accountability:**
4. **Spending Transparency Dashboard** — budget by department, over time, **plus the net
   local cost**: every spending area shows total dollars, then strips out state aid (the
   MA "Cherry Sheet," including Chapter 70 school aid) and federal funds to reveal what
   actually comes out of local Lynn property taxes. A $190M school budget may cost local
   taxpayers far less than a $38M police budget once outside money is removed — that
   comparison is the point.
5. **Compare Priorities Tool** — side-by-side spending/voting comparisons, using net local
   cost so the comparison reflects real taxpayer burden, not sticker prices.
6. **Transparency Scorecards** — measurable, methodology-explained, never name-calling.

**Phase 4 — Issues & access:**
7. **Hot Topic Issue Pages** — everything on one topic in one place.
8. **Public Records + Missing Information Tracker** — what we asked for, what the city
   provided, what's late or missing.

**Phase 5 — Intelligence layer:**
9. **Search & Filter System** across everything.
10. **Agentic Topic Summaries** — the AI assistant, source-bound.

**Always on — Editorial Standards:** sources on every claim, facts separated from opinion,
estimates labeled, missing info flagged, a public corrections archive.

---

## What I need from you as we go

- Confirmation on tone/branding (name, colors, logo) — the prototype proposes a direction.
- Any records you already have in hand (speeds up Phase 2 a lot).
- Sign-off before we publish anything live (nothing goes public without your OK).

---

## What "done right" looks like

A resident can land on the site, type "police budget" or a councilor's name, and get:
plain-English summary → the exact votes and dollars → the source documents → and an
honest note on what the public record still doesn't show. City Hall becomes auditable.
