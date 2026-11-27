/* Lynn Transparency Platform — prototype behavior */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const initials = (name) => {
    const honorifics = new Set(["dr", "mr", "mrs", "ms", "esq", "jr", "sr", "ii", "iii"]);
    const words = name
      .replace(/["'].*?["']/g, " ")        // drop nicknames in quotes
      .replace(/,/g, " ")                    // drop comma suffixes
      .split(/\s+/)
      .map(w => w.replace(/\./g, "").trim())
      .filter(w => w.length > 1 && !honorifics.has(w.toLowerCase())); // skip titles + single-letter initials
    if (words.length === 0) return "?";
    const first = words[0][0];
    const last = words.length > 1 ? words[words.length - 1][0] : "";
    return (first + last).toUpperCase();
  };

  const NAV = [
    { href: "index.html", label: "Home" },
    { href: "councilors.html", label: "Councilors" },
    { href: "votes.html", label: "Votes" },
    { href: "spending.html", label: "Spending" },
    { href: "meetings.html", label: "Meetings" },
    { href: "records.html", label: "Records Tracker" },
    { href: "index.html#sections", label: "All Sections" },
  ];
  const money = (m) => "$" + m.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + "M";

  function renderHeader() {
    const here = (location.pathname.split("/").pop() || "index.html");
    const links = NAV.map(n => {
      const isActive = n.href.split("#")[0] === here;
      return `<a class="${isActive ? "active" : ""}" href="${n.href}"${isActive ? ' aria-current="page"' : ""}>${n.label}</a>`;
    }).join("");
    const el = $("#site-header");
    if (!el) return;
    el.innerHTML = `
      <a class="skip-link" href="#main">Skip to main content</a>
      <div class="wrap">
        <a class="brand" href="index.html">
          <span class="mark" aria-hidden="true">L</span>
          <span>Lynn City Watch<small>Public records, made auditable</small></span>
        </a>
        <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">☰</button>
        <nav class="nav" id="primary-nav" aria-label="Primary">${links}</nav>
      </div>`;
    const toggle = $(".nav-toggle", el);
    toggle.addEventListener("click", () => {
      const open = el.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.textContent = open ? "✕" : "☰";
    });
  }

  function renderFooter() {
    const el = $("#site-footer");
    if (!el) return;
    el.innerHTML = `
      <div class="wrap">
        <div class="cols">
          <div>
            <h4>Lynn City Watch</h4>
            <p style="margin:0">A fact-based civic transparency project. Every claim links to an official public record. Where a record is missing, we say so.</p>
          </div>
          <div>
            <h4>Official Sources</h4>
            <ul>
              <li><a href="${SOURCES.councilRoster}" target="_blank" rel="noopener">City Council roster</a></li>
              <li><a href="${SOURCES.municipalMeetings}" target="_blank" rel="noopener">Meeting agendas &amp; minutes</a></li>
              <li><a href="${SOURCES.mayorBudget}" target="_blank" rel="noopener">Mayor's Budget</a></li>
              <li><a href="${SOURCES.financials}" target="_blank" rel="noopener">Financial statements</a></li>
            </ul>
          </div>
          <div>
            <h4>Sections</h4>
            <ul>
              <li><a href="councilors.html">Councilor Profiles</a></li>
              <li><a href="votes.html">Voting Database</a></li>
              <li><a href="spending.html">Spending Dashboard</a></li>
              <li><a href="immigration.html">Immigration-Related Spending</a></li>
              <li><a href="records.html">Public Records Tracker</a></li>
              <li><a href="unaccounted.html">Amounts Not Fully Explained</a></li>
              <li><a href="corrections.html">Corrections &amp; Updates</a></li>
              <li><a href="index.html#sections">See all sections</a></li>
            </ul>
          </div>
        </div>
        <p class="disclaimer">
          This website is an independent civic transparency project. It is not affiliated with, endorsed by, or operated by the City of Lynn, Lynn City Council, Lynn Public Schools, Lynn Police Department, Lynn Fire Department, or any city agency. Information is compiled from public records and other cited sources. Users should review the original source documents before relying on any summary or analysis.
        </p>
        <p class="disclaimer" style="margin-top:12px">
          Data shown is compiled from official public records: the councilor roster and meeting schedule from lynnma.gov; the 2024–2026 voting record from the official council minutes; spending and revenue figures from the city's budget and audited financial statements; committee assignments from lynnma.gov; and meeting videos from Lynn Community TV. Each item links to its source. Found an error or missing context? <a href="corrections.html">Submit a correction</a>.
        </p>
      </div>`;
  }

  /* ---------- Home ---------- */
  function renderHome() {
    const s = $("#section-grid");
    // Only sections that exist are shown; unbuilt ideas stay in the build plan, not on the page.
    if (s) s.innerHTML = SECTIONS.filter(x => x.ready).map(x => `
      <a class="card link feat" href="${x.href}">
        <h3>${x.title}</h3>
        <p>${x.blurb}</p>
        <span class="go">Open →</span>
      </a>`).join("");

    const cf = $("#council-facts");
    if (cf) cf.innerHTML = `
      <div class="s"><b>${COUNCIL_FACTS.size}</b><span>Council members</span></div>
      <div class="s"><b>${COUNCIL_FACTS.ward}</b><span>Ward seats</span></div>
      <div class="s"><b>${COUNCIL_FACTS.atLarge}</b><span>At-large seats</span></div>
      <div class="s"><b>2&amp;4</b><span>Tuesdays / month</span></div>`;

    const fresh = $("#data-fresh");
    if (fresh) (async () => {
      try {
        const r = await fetch("/api/status");
        if (!r.ok) throw new Error("api");
        const st = await r.json();
        const approvedNotPosted = MINUTES_2026.filter(m => !m.key && m.approved).length;
        const recentNotPosted = MINUTES_2026.filter(m => !m.key && !m.approved).length;
        fresh.innerHTML = `
          <span><b>${Number(st.votes).toLocaleString("en-US")}</b> recorded votes from <b>${st.meetings}</b> meetings</span>
          <span>Votes current through <b>${fmtDate(String(st.latest_date))}</b></span>
          <span>Budget: <b>FY${BUDGET_FY27.fiscalYear}</b></span>
          <span><a href="records.html" style="color:#ffd9a8">${approvedNotPosted} approved set of minutes not posted · ${recentNotPosted} recent sets not posted yet →</a></span>`;
      } catch (e) { fresh.remove(); }
    })();
  }

  /* ---------- Home: "2026 at City Hall" (hand-checked highlights + live counts) ---------- */
  function renderWatch() {
    const list = $("#watch-list");
    if (!list || typeof HIGHLIGHTS === "undefined") return;
    const KIND = { closer: "Worth a closer look", good: "Good news", decision: "Key decision" };
    const ruleById = {};
    HIGHLIGHT_RULES.closer.concat(HIGHLIGHT_RULES.good).forEach(r => (ruleById[r.id] = r));
    const isoish = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
    const srcHtml = (x) => {
      const url = x.k ? "https://www.lynnma.gov/common/pages/GetFile.ashx?key=" + x.k : x.u;
      const label = isoish(x.d) ? fmtDate(x.d) + " minutes" : x.d;
      return `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;
    };
    const topicSel = $("#watch-topic");
    topicSel.innerHTML = `<option value="all">All topics</option>` + HIGHLIGHT_TOPICS.map(t => `<option>${t}</option>`).join("");
    let kind = "all", showAll = false;
    function draw() {
      const t = topicSel.value;
      const items = HIGHLIGHTS
        .filter(h => (kind === "all" || h.kind === kind) && (t === "all" || h.topic === t))
        .sort((a, b) => b.date.localeCompare(a.date));
      const LIMIT = 9;
      const shown = showAll ? items : items.slice(0, LIMIT);
      list.innerHTML = items.length ? shown.map(h => {
        const rule = h.rule && ruleById[h.rule];
        return `<article class="wcard ${h.kind}">
          <div class="meta"><span class="kind">${KIND[h.kind]}</span><span>·</span><span>${h.topic}</span>${isoish(h.date) ? `<span>·</span><span>${fmtDate(h.date)}</span>` : ""}</div>
          <h3>${h.title}</h3>
          <p>${h.facts}</p>
          ${h.reason ? `<div class="why"><b>Why, according to the record:</b> ${h.reason}</div>` : ""}
          ${rule && h.kind !== "decision" ? `<div class="rule">Flag: <b>${rule.label}</b> — ${rule.text}</div>` : ""}
          <div class="src">Source: ${h.src.map(srcHtml).join(" · ")}${h.link ? ` · <a href="${h.link}">More on this →</a>` : ""}</div>
        </article>`;
      }).join("") : `<p class="sub">Nothing in this view yet.</p>`;
      if (items.length > shown.length) {
        list.insertAdjacentHTML("beforeend", `<div style="grid-column:1/-1"><button type="button" class="btn-ghost" id="watch-more">Show all ${items.length} items</button></div>`);
        $("#watch-more").addEventListener("click", () => { showAll = true; draw(); });
      }
    }
    $$(".seg button").forEach(b => b.addEventListener("click", () => {
      kind = b.dataset.kind;
      $$(".seg button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      draw();
    }));
    topicSel.addEventListener("change", draw);
    draw();

    $("#watch-rules").innerHTML = `
      <p class="sub" style="margin:10px 0 0">"Worth a closer look" means the official record shows one of the patterns below. It is <b>not</b> a finding that anything was improper, and we never guess at anyone's motives. "Good news" also follows fixed rules. Items were last checked ${fmtDate(HIGHLIGHTS_CHECKED)}.</p>
      <h4><span class="dot closer"></span>Worth a closer look</h4>
      <ul>${HIGHLIGHT_RULES.closer.map(r => `<li><b>${r.label}:</b> ${r.text}</li>`).join("")}</ul>
      <h4><span class="dot good"></span>Good news</h4>
      <ul>${HIGHLIGHT_RULES.good.map(r => `<li><b>${r.label}:</b> ${r.text}</li>`).join("")}</ul>
      <h4><span class="dot decision"></span>Key decisions</h4>
      <ul><li>Major actions by the Mayor or Council, shown without a label of good or bad.</li></ul>
      <p class="sub" style="margin:12px 0 0">Spot something wrong or missing? <a href="corrections.html">Send a correction</a>.</p>`;

    // Live counts for 2026, computed from every recorded vote by the same written rules.
    (async () => {
      const box = $("#watch-stats");
      try {
        const r = await fetch("/api/votes?year=2026");
        if (!r.ok) throw new Error("api");
        const v = await r.json();
        const money = v.filter(x => x.spending_amount != null);
        const sum = (a) => a.reduce((t, x) => t + Number(x.spending_amount), 0);
        const split = v.filter(x => (x.tally_no || 0) > 0 || (x.dissent_count || 0) > 0 || /\babstain\w*|\bvot\w* present\b/i.test((x.result || "") + " " + (x.plain_summary || "")));
        const pastYear = money.filter(x => /prior year|bills? of prior|\bPY\b/i.test(x.title || ""));
        const emergency = money.filter(x => /emergency/i.test((x.plain_summary || "") + " " + (x.result || "")));
        const noOutcome = v.filter(x => /no outcome|no result/i.test(x.result || ""));
        const outside = money.filter(x => x.funding_local === 0);
        const latest = v.map(x => String(x.vote_date).slice(0, 10)).sort().pop();
        box.innerHTML = `
          <div class="wstat good"><b>${usdM(sum(outside))}</b><span>outside money accepted in ${outside.length} votes, $0 local cost</span></div>
          <div class="wstat closer"><b>${split.length}</b><span>votes where the Council split (a no, abstain, or present)</span></div>
          <div class="wstat closer"><b>${pastYear.length} · ${usd(sum(pastYear))}</b><span>payments of bills from a past fiscal year</span></div>
          <div class="wstat closer"><b>${emergency.length} of ${money.length}</b><span>money votes passed as “special emergency” orders</span></div>
          <div class="wstat closer"><b>${noOutcome.length}</b><span>motions with no outcome written in the minutes</span></div>
          <p class="source-link" style="grid-column:1/-1;margin:0">Counted from all ${v.length} recorded 2026 votes through ${fmtDate(latest)}. "Special emergency" is the minutes' own wording for these orders. <a href="votes.html">Browse the votes →</a></p>`;
      } catch (e) { box.hidden = true; }
    })();
  }

  /* ---------- What the council titles mean (from the City Charter) ---------- */
  function titleDefsHtml(keys) {
    return `<dl class="defs">${keys.map(k => {
      const d = TITLE_DEFS[k];
      return `<div><dt>${d.label}</dt><dd>${d.text} <span class="cite">${d.cite}</span></dd></div>`;
    }).join("")}</dl>`;
  }

  /* ---------- Councilor grid ---------- */
  function renderCouncilors() {
    const grid = $("#councilor-grid");
    if (!grid) return;
    const defs = $("#title-defs");
    if (defs && typeof TITLE_DEFS !== "undefined") defs.innerHTML = `
      <h3 style="margin:0 0 4px">What the titles mean</h3>
      <p class="sub" style="font-size:14px;margin:0 0 12px">Lynn's council has 11 members: 7 ward councilors and 4 at-large councilors.</p>
      ${titleDefsHtml(["ward", "atlarge", "term", "president", "vp", "chair"])}
      <p class="source-link" style="margin:12px 0 0">Sources: <a href="${CHARTER_SOURCE}" target="_blank" rel="noopener">Lynn City Charter, Article 2</a> (text posted by the city's Charter Review Committee; the final adopted version is not posted, but the section numbers cited in 2026 council minutes match it) · <a href="${COUNCIL_PAGE}" target="_blank" rel="noopener">City Council page</a>.</p>`;
    const draw = (list) => grid.innerHTML = list.map(c => {
      let tag = c.type === "atlarge"
        ? `<span class="tag atlarge">At-Large</span>`
        : `<span class="tag ward">${c.seat}</span>`;
      if (c.title.includes("President") && !c.title.includes("Vice")) tag += ` <span class="tag pres">President</span>`;
      if (c.title.includes("Vice")) tag += ` <span class="tag vp">Vice President</span>`;
      return `
        <a class="card link cn" href="councilor.html?id=${c.id}">
          <div class="avatar">${initials(c.name)}</div>
          <h3>${c.name}</h3>
          <div class="seat" style="margin-bottom:10px">${c.seat}${c.title ? " · " + c.title : ""}</div>
          <div>${tag}</div>
        </a>`;
    }).join("");
    draw(COUNCILORS);

    const filter = $("#seat-filter");
    if (filter) filter.addEventListener("change", () => {
      const v = filter.value;
      draw(v === "all" ? COUNCILORS : COUNCILORS.filter(c => c.type === v));
    });
  }

  /* ---------- committee assignments (real, from lynnma.gov) ---------- */
  function committeeHtml(id) {
    if (typeof COMMITTEES === "undefined") return "";
    const mine = COMMITTEES.filter(k => k.chairs.includes(id) || k.members.includes(id))
      .sort((a, b) => (b.chairs.includes(id) - a.chairs.includes(id)) || a.name.localeCompare(b.name));
    const list = mine.length
      ? `<ul class="committee-list">${mine.map(k => `<li><span>${k.name}</span>${k.chairs.includes(id) ? `<span class="chip info">${k.chairs.length > 1 ? "Co-chair" : "Chair"}</span>` : ""}</li>`).join("")}</ul>`
      : `<p class="sub" style="margin:0">Not listed on any committee on the city's page.</p>`;
    return list + `<p class="source-link" style="margin-top:12px">${mine.length} committees · Source: <a href="${COMMITTEES_SOURCE}" target="_blank" rel="noopener">City Council committees page</a> (checked ${RECORDS_CHECKED})</p>`;
  }

  /* ---------- Single profile ---------- */
  function renderProfile() {
    const host = $("#profile");
    if (!host) return;
    const id = new URLSearchParams(location.search).get("id");
    const c = COUNCILORS.find(x => x.id === id) || COUNCILORS[0];

    $("#profile-head").innerHTML = `
      <div class="wrap">
        <p class="crumb" style="color:#9fb2c6;margin-top:0"><a href="councilors.html" style="color:#c9d6e5">← All councilors</a></p>
        <div class="row">
          <div class="avatar">${initials(c.name)}</div>
          <div>
            <h1>${c.name}</h1>
            <div class="meta">${c.seat}${c.title ? " · " + c.title : ""} · Lynn City Council</div>
          </div>
        </div>
      </div>`;

    host.innerHTML = `
      <div class="wrap">
        <div class="card seat-card" style="margin-bottom:18px">
          <h2 class="h" style="font-size:20px;margin:0 0 4px">About this seat</h2>
          <p class="sub" style="font-size:14px;margin:0 0 12px">What this councilor's roles on the Lynn City Council mean.</p>
          ${titleDefsHtml([c.type === "atlarge" ? "atlarge" : "ward"]
            .concat(c.title.includes("Vice") ? ["vp"] : c.title.includes("President") ? ["president"] : [])
            .concat(typeof COMMITTEES !== "undefined" && COMMITTEES.some(k => k.chairs.includes(c.id)) ? ["chair"] : [])
            .concat(["term"]))}
          ${(() => {
            if (typeof COMMITTEES === "undefined") return "";
            const led = COMMITTEES.filter(k => k.chairs.includes(c.id));
            if (!led.length) return "";
            const solo = led.filter(k => k.chairs.length === 1).map(k => k.name);
            const co = led.filter(k => k.chairs.length > 1).map(k => k.name);
            return `<p style="margin:12px 0 0;font-size:14px"><b>Leads:</b> ${solo.length ? "chair of " + solo.join(" · ") : ""}${solo.length && co.length ? "; " : ""}${co.length ? "co-chair of " + co.join(" · ") : ""}.</p>`;
          })()}
          <p class="source-link" style="margin:12px 0 0">${c.type === "ward" ? `<a href="${WARD_MAP(c.seat.replace(/\D/g, ""))}" target="_blank" rel="noopener">See the ${c.seat} map</a> (city PDF) · ` : ""}Source: <a href="${CHARTER_SOURCE}" target="_blank" rel="noopener">Lynn City Charter, Article 2</a> · <a href="councilors.html#title-defs">All council titles</a></p>
        </div>

        <div class="kpis" id="pf-kpis">
          <div class="kpi"><b>…</b><span>Attendance</span></div>
          <div class="kpi"><b>…</b><span>Recorded votes</span></div>
          <div class="kpi"><b>…</b><span>Voted yes</span></div>
          <div class="kpi"><b>…</b><span>No / abstain / present</span></div>
        </div>

        <div class="two-col">
          <div>
            <h2 class="h" style="margin-bottom:4px">Voting record</h2>
            <p class="sub" id="pf-note">Loading this member's recorded votes from the official council minutes…</p>
            <div class="tablewrap" tabindex="0" role="region" aria-label="Voting record for ${c.name}">
              <table class="responsive">
                <thead><tr><th scope="col">Date</th><th scope="col">Item</th><th scope="col">Category</th><th scope="col">Their vote</th><th scope="col">Result</th></tr></thead>
                <tbody id="pf-votes"><tr><td colspan="5" style="padding:16px;color:var(--muted)">Loading…</td></tr></tbody>
              </table>
            </div>
          </div>

          <aside>
            <div class="card">
              <h3 style="margin:0 0 12px">Contact</h3>
              <ul class="contact-list">
                <li><span class="k">Seat</span><span>${c.seat}</span></li>
                ${c.title ? `<li><span class="k">Role</span><span>${c.title}</span></li>` : ""}
                <li><span class="k">Phone</span><span>${c.phone}</span></li>
                <li><span class="k">Email</span><span><a href="${SOURCES.councilRoster}" target="_blank" rel="noopener">via city page</a></span></li>
              </ul>
              <p class="source-link" style="margin-top:14px">Source: <a href="${SOURCES.councilRoster}" target="_blank" rel="noopener">Official council roster</a></p>
            </div>
            <div class="card" style="margin-top:16px">
              <h3 style="margin:0 0 8px">Committee assignments</h3>
              ${committeeHtml(c.id)}
            </div>
          </aside>
        </div>
      </div>`;
    document.title = c.name + " — Lynn City Watch";

    (async () => {
      try {
        const res = await fetch("/api/councilors/" + encodeURIComponent(c.id));
        if (!res.ok) throw new Error("api");
        const data = await res.json();
        const votes = data.votes || [];
        const tally = {}; (data.tally || []).forEach(t => tally[t.position] = t.n);
        const total = Object.values(tally).reduce((a, b) => a + b, 0);
        const absent = tally.absent || 0, yes = tally.yes || 0;
        const other = total - yes - absent;
        const attended = total - absent;
        const attPct = total ? Math.round((attended / total) * 100) : null;
        // meeting-level view: a meeting counts as attended if the member is recorded on any vote that night
        const byDate = {};
        votes.forEach(v => { const d = String(v.vote_date).slice(0, 10); byDate[d] = byDate[d] || v.position !== "absent"; });
        const mtgAll = Object.keys(byDate).length, mtgPresent = Object.values(byDate).filter(Boolean).length;
        $("#pf-kpis").innerHTML = `
          <div class="kpi"><b>${attPct == null ? "—" : attPct + "%"}</b><span>Present for ${attended} of ${total} votes · ${mtgPresent} of ${mtgAll} meetings</span></div>
          <div class="kpi"><b>${total}</b><span>Recorded votes</span></div>
          <div class="kpi"><b>${yes}</b><span>Voted yes</span></div>
          <div class="kpi"><b>${other}</b><span>No / abstain / present</span></div>`;
        const yrs = votes.map(v => String(v.vote_date).slice(0, 4)).sort();
        const span = yrs.length ? (yrs[0] === yrs[yrs.length - 1] ? yrs[0] : yrs[0] + "–" + yrs[yrs.length - 1]) : "";
        $("#pf-note").innerHTML = `${total} recorded votes from official Lynn City Council minutes${span ? " (" + span + ")" : ""}. Where the minutes do not list members individually, the position is derived from the recorded tally and attendance (noted on each vote). "No / abstain / present" counts any position other than yes or absent.`;
        const posClass = { yes: "result-pass", no: "result-split", abstain: "result-split", present: "result-split" };
        const rowHtml = (v) => `
          <tr>
            <td data-label="Date" style="white-space:nowrap">${fmtDate(v.vote_date)}</td>
            <td class="cell-primary"><a href="votes.html?q=${encodeURIComponent(v.title.slice(0, 40))}">${v.title}</a></td>
            <td data-label="Category">${v.category ? `<span class="badge-cat">${v.category}</span>` : ""}</td>
            <td data-label="Their vote" class="${posClass[v.position] || ""}" style="text-transform:capitalize;font-weight:600">${v.position}</td>
            <td data-label="Result">${v.result || ""}</td>
          </tr>`;
        const PAGE = 50;
        let shown = 0;
        const more = () => {
          const next = votes.slice(shown, shown + PAGE);
          $("#pf-votes").insertAdjacentHTML("beforeend", next.map(rowHtml).join(""));
          shown += next.length;
          const btn = $("#pf-more");
          if (btn) { btn.hidden = shown >= votes.length; btn.textContent = `Show ${Math.min(PAGE, votes.length - shown)} more (${shown} of ${votes.length} shown)`; }
        };
        $("#pf-votes").innerHTML = votes.length ? "" : `<tr><td colspan="5" style="padding:16px;color:var(--muted)">No recorded votes found for this member yet.</td></tr>`;
        if (votes.length) {
          $("#pf-votes").closest(".tablewrap").insertAdjacentHTML("afterend", `<button type="button" class="btn-ghost" id="pf-more" style="margin-top:12px"></button>`);
          $("#pf-more").addEventListener("click", more);
          more();
        }
      } catch (e) {
        $("#pf-note").textContent = "This member's voting record is temporarily unavailable. The underlying minutes remain available from the city's meeting page.";
        $("#pf-votes").innerHTML = "";
      }
    })();
  }

  /* ---------- Spending dashboard ---------- */
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const usdM = (n) => "$" + (n / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "M";

  function renderSpending() {
    if (!$("#spend-body")) return;

    // ---- REAL: citywide General Fund revenue mix (audited FY2025) ----
    const rev = CITY_REVENUE.sources;
    const revTot = CITY_REVENUE.totalRevenue || rev.reduce((a, s) => a + s.amount, 0);
    const sumKind = (k) => rev.filter(s => s.kind === k).reduce((a, s) => a + s.amount, 0);
    const localTax = sumKind("localtax");
    const intergov = sumKind("intergov");
    const propTax = (rev.find(s => /property/i.test(s.source)) || {}).amount || 0;
    const cents = (n) => Math.round((n / revTot) * 100);
    const pct = (n) => (Math.round((n / revTot) * 1000) / 10).toFixed(1);

    renderFY27();

    $("#spend-headline").innerHTML = `
      <div class="card" style="border-left:4px solid var(--accent)">
        <h2 class="h" style="margin-top:0">In Lynn's FY2025 audited General Fund, about <span style="color:var(--accent)">${cents(localTax)}¢</span> of every $1 in revenue came from local taxes.</h2>
        <p class="sub" style="margin-bottom:10px">About ${cents(intergov)}¢ came from intergovernmental revenue, which generally includes state and federal funding (the audit does not split that line into state vs. federal). Property taxes alone were about ${pct(propTax)}¢.</p>
        <p class="sub" style="margin-bottom:0"><b>Important:</b> these figures describe the citywide <b>revenue mix</b> — not how any single department, program, or vote is funded. The net local cost of a specific item is calculated only where the records document that item's own funding sources; we never apply this citywide average to an individual expense.</p>
        <p class="source-link" style="margin:12px 0 0">Source: <a href="${CITY_REVENUE.sourceUrl}" target="_blank" rel="noopener">${CITY_REVENUE.sourceLabel}</a> — ${CITY_REVENUE.basis}.</p>
      </div>`;

    // revenue mix bar + legend (REAL)
    const kindColor = { localtax: "var(--accent)", intergov: "var(--accent-2)", other: "#94a3b8" };
    $("#revenue-bar").innerHTML = rev.map(s =>
      `<div title="${s.source}: ${usd(s.amount)}" style="width:${(s.amount / revTot) * 100}%;background:${kindColor[s.kind] || "#94a3b8"};height:100%"></div>`
    ).join("");
    $("#revenue-legend").innerHTML = rev.map(s => `
      <li style="margin-bottom:10px">
        <span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${kindColor[s.kind] || "#94a3b8"};margin-right:8px"></span>
        <b>${usd(s.amount)}</b> — ${s.source} (${pct(s.amount)}%)
        <span style="color:var(--muted);font-size:12.5px;display:block;margin-left:19px">${s.note || ""}</span>
      </li>`).join("");

    // ---- REAL: General Fund spending by function (audited FY2025) ----
    const fns = GF_EXPENDITURES.functions.slice().sort((a, b) => b.actual - a.actual);
    const maxA = Math.max(...fns.map(f => f.actual));
    const totalActual = fns.reduce((a, f) => a + f.actual, 0);
    $("#spend-body").innerHTML = fns.map(f => {
      const varr = f.final - f.actual;                       // positive = spent under budget
      const share = Math.round((f.actual / totalActual) * 100);
      return `
        <tr>
          <td class="cell-primary" style="font-weight:600">${f.name}</td>
          <td data-label="Final budget" style="white-space:nowrap;color:var(--muted)">${usd(f.final)}</td>
          <td data-label="Actual spent" style="white-space:nowrap;font-weight:700;color:var(--ink-2)">${usd(f.actual)}</td>
          <td data-label="Vs budget" style="white-space:nowrap;color:${varr >= 0 ? "var(--good)" : "var(--bad)"}">${usd(Math.abs(varr))} ${varr >= 0 ? "under" : "over"}</td>
          <td data-label="Share" style="min-width:150px">
            <div style="display:flex;align-items:center;gap:8px;flex:1">
              <div style="flex:1;background:#eef2f6;border-radius:6px;height:8px;overflow:hidden">
                <div style="width:${Math.round((f.actual / maxA) * 100)}%;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-2))"></div>
              </div>
              <span style="font-size:12px;color:var(--muted);white-space:nowrap">${share}%</span>
            </div>
          </td>
        </tr>`;
    }).join("");
  }

  /* ---------- FY2027 budget (Mayor's submitted budget, real) ---------- */
  function renderFY27() {
    const B = typeof BUDGET_FY27 !== "undefined" ? BUDGET_FY27 : null;
    if (!B || !$("#fy27-body")) return;
    const rev = B.revenue, tot = B.total;
    const by = (k) => rev.filter(r => r.kind === k).reduce((a, r) => a + r.fy27, 0);
    const state = by("state"), prop = by("localtax"), local = prop + by("local");
    const c = (n) => Math.round((n / tot) * 100);
    const chg = B.total - B.totalPrior;
    $("#spend-topline").innerHTML = `
      <div class="s"><b>${usdM(tot)}</b><span>FY2027 city budget</span></div>
      <div class="s"><b>${c(state)}¢</b><span>of each $1 from state aid</span></div>
      <div class="s" style="color:#ffd9a8"><b>${c(prop)}¢</b><span>from local property tax</span></div>
      <div class="s"><b>+${usdM(chg)}</b><span>vs. FY2026 (+${(chg / B.totalPrior * 100).toFixed(1)}%)</span></div>`;
    $("#fy27-intro").innerHTML = `The ${B.status} totals <b>${usd(tot)}</b> for July 1, 2026 – June 30, 2027, up ${usd(chg)} from FY2026. About <b>${c(state)}¢ of every $1</b> is state aid and about <b>${c(local)}¢</b> is raised locally (property tax, excise, fees, and last year's surplus). <b>Note:</b> this is the budget the Mayor submitted. The Council's hearing on it was set for June 9, 2026, and the minutes of that meeting <a href="records.html">have not been posted</a>, so we can't yet show the final adopted version.`;

    const col = { state: "var(--accent-2)", localtax: "var(--accent)", local: "#7aa7f5" };
    $("#fy27-bar").innerHTML = rev.map(r => `<div title="${r.source}: ${usd(r.fy27)}" style="width:${(r.fy27 / tot) * 100}%;background:${col[r.kind]}"></div>`).join("");
    $("#fy27-rev").innerHTML = rev.map(r => `
      <li><span class="sw" style="background:${col[r.kind]}"></span>
        <span class="lbl">${r.source}<small>${r.note}</small></span>
        <span class="amt">${usdM(r.fy27)}<small>${(r.fy27 / tot * 100).toFixed(1)}%</small></span></li>`).join("");

    const S = B.schools;
    const share = (n) => (n / S.requiredNSS * 100).toFixed(1);
    $("#fy27-schools").innerHTML = `
      <p style="margin:0 0 10px">State law sets a minimum Lynn must spend on schools (<b>required net school spending</b>): <b>${usd(S.requiredNSS)}</b> for FY2027, for ${S.enrollment.toLocaleString("en-US")} students.</p>
      <div class="split" role="img" aria-label="State pays ${share(S.chapter70)} percent, Lynn pays ${share(S.requiredLocal)} percent">
        <div style="width:${share(S.chapter70)}%;background:var(--accent-2)">State ${share(S.chapter70)}%</div>
        <div style="width:${share(S.requiredLocal)}%;background:var(--accent)">Local</div>
      </div>
      <ul class="legend">
        <li><span class="sw" style="background:var(--accent-2)"></span><span class="lbl">Chapter 70 state school aid</span><span class="amt">${usdM(S.chapter70)}</span></li>
        <li><span class="sw" style="background:var(--accent)"></span><span class="lbl">Required local contribution<small>The minimum Lynn taxpayers must put in.</small></span><span class="amt">${usdM(S.requiredLocal)}</span></li>
      </ul>
      <p class="sub" style="font-size:13px;margin:10px 0 0">So the required local share is about <b>${share(S.requiredLocal)}¢ of each school dollar</b>. Required school spending also counts costs outside the ${usdM(S.schoolDeptBudget)} school department line, such as employee benefits and school building upkeep. Enrollment fell from ${S.enrollmentPrior.toLocaleString("en-US")} to ${S.enrollment.toLocaleString("en-US")}. The school section states a ${usd(S.schoolAllocationStated)} allocation; the budget summary shows ${usd(S.schoolDeptBudget)}.</p>`;

    const sp = B.spending.slice().sort((a, b) => b.fy27 - a.fy27);
    const max = sp[0].fy27;
    $("#fy27-body").innerHTML = sp.map(r => {
      const d = r.fy27 - r.fy26;
      return `<tr>
        <td class="cell-primary" style="font-weight:600">${r.name}</td>
        <td data-label="FY2026 final" style="white-space:nowrap;color:var(--muted)">${usd(r.fy26)}</td>
        <td data-label="FY2027 submitted" style="white-space:nowrap;font-weight:700;color:var(--ink-2)">${usd(r.fy27)}</td>
        <td data-label="Change" style="white-space:nowrap;color:${d > 0 ? "var(--bad)" : d < 0 ? "var(--good)" : "var(--muted)"}">${d === 0 ? "no change" : (d > 0 ? "+" : "−") + usd(Math.abs(d))}</td>
        <td data-label="Share" style="min-width:140px"><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;background:#eef2f6;border-radius:6px;height:8px;overflow:hidden"><div style="width:${Math.round(r.fy27 / max * 100)}%;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-2))"></div></div><span style="font-size:12px;color:var(--muted)">${(r.fy27 / tot * 100).toFixed(1)}%</span></div></td>
      </tr>`;
    }).join("");

    $("#fy27-depts").innerHTML = B.departments.slice().sort((a, b) => b.fy27 - a.fy27).map(r => {
      const pc = ((r.fy27 - r.fy26) / r.fy26 * 100);
      return `<li><span class="lbl">${r.name}</span><span class="amt">${usdM(r.fy27)}<small style="color:${pc > 0 ? "var(--bad)" : "var(--good)"}">${pc > 0 ? "+" : ""}${pc.toFixed(1)}%</small></span></li>`;
    }).join("");
    $("#fy27-capital").innerHTML = B.freeCashCapital.map(r =>
      `<li><span class="lbl">${r.use}<small>${r.dept}</small></span><span class="amt">${usd(r.amount)}</span></li>`).join("");
    $("#fy27-source").innerHTML = `Source: <a href="${B.sourceUrl}" target="_blank" rel="noopener">${B.sourceLabel}</a> — budget summary (pp. 7–9), revenue and capital (pp. 22–25), Lynn Public Schools (p. 73). Figures are as printed; the FY2026 column is the "Final" column in the same document.`;
  }

  /* ---------- Public records tracker ---------- */
  function renderRecords() {
    const host = $("#minutes-body");
    if (!host) return;
    const today = new Date(RECORDS_CHECKED + "T00:00:00Z");
    const days = (a, b) => Math.round((new Date(b + "T00:00:00Z") - new Date(a + "T00:00:00Z")) / 864e5);
    const posted = MINUTES_2026.filter(m => m.key);
    const approvedNotPosted = MINUTES_2026.filter(m => !m.key && m.approved);
    const recent = MINUTES_2026.filter(m => !m.key && !m.approved);
    // Observed timing, computed from the city's own list (not a legal deadline).
    const lags = posted.map(m => days(m.date, m.listed)).sort((a, b) => a - b);
    const usual = lags[Math.floor(lags.length / 2)];                       // median days, meeting -> on the list
    const quick = lags.filter(d => d <= usual).length;
    const afterApproval = posted.filter(m => m.approved).map(m => days(m.approved, m.listed));
    const nextDay = afterApproval.filter(d => d <= 2).length;
    $("#rec-topline").innerHTML = `
      <div class="s"><b>${posted.length} of ${MINUTES_2026.length}</b><span>2026 meetings with minutes posted</span></div>
      <div class="s" style="color:#ffd9a8"><b>${approvedNotPosted.length}</b><span>approved by the Council but not posted</span></div>
      <div class="s"><b>${recent.length}</b><span>recent meetings, minutes not posted yet</span></div>
      <div class="s"><b>${RECORDS_FINDINGS.filter(f => f.status === "missing").length}</b><span>other key documents not posted</span></div>`;
    const pat = $("#rec-pattern");
    if (pat) pat.innerHTML = `
      <h3 style="margin:0 0 6px">Are missing minutes unusual?</h3>
      <p style="margin:0 0 8px">Usually, no — a short wait is normal. The Council approves each meeting's minutes at a <b>later</b> meeting, and in 2026 the city has put them on its list soon after: in ${nextDay} of the ${afterApproval.length} cases where we can see both dates, within 2 days of approval. Counting from the meeting itself, half of the 2026 minutes appeared within <b>${usual} days</b> (${quick} of ${posted.length}).</p>
      <p style="margin:0;color:var(--muted);font-size:13.5px">So the most recent meetings showing "not posted yet" are mostly waiting on that normal approval step. The exception is <b>June 9</b>: the Council approved those minutes on June 23, and they still are not on the list. These timings are what we observed on the city's list; they are not a legal deadline. State law requires minutes to be approved "in a timely manner" and given to anyone who asks within 10 days.</p>`;
    host.innerHTML = MINUTES_2026.map(m => {
      const since = days(m.date, RECORDS_CHECKED);
      let status;
      let auto = "";
      if (m.key) status = `<span class="chip ok">Posted</span>`;
      else if (m.approved) status = `<span class="chip miss">Approved, not posted</span>`;
      else {
        status = since <= usual ? `<span class="chip info">Not posted yet — within the usual wait</span>`
                                : `<span class="chip wait">Not posted yet — longer than usual</span>`;
        const laterMeeting = MINUTES_2026.some(x => x.date > m.date);
        auto = laterMeeting
          ? `Minutes usually go up after the Council approves them at a later meeting. We can't yet see whether these were approved, because the minutes of the meetings that would show it are not posted either.`
          : `Minutes usually go up after the Council approves them at a later meeting; no regular meeting has been held since this one yet (next scheduled: Dec 8, 2026).`;
      }
      return `<tr>
        <td data-label="Meeting" style="white-space:nowrap;font-weight:600">${fmtDate(m.date)}${m.label ? `<div style="font-weight:400;font-size:12.5px;color:var(--muted)">${m.label}</div>` : ""}</td>
        <td data-label="Status">${status}</td>
        <td data-label="On city list">${m.listed ? fmtDate(m.listed) : (m.key ? "—" : `${since} days since meeting`)}</td>
        <td data-label="Approved by Council">${m.approved ? fmtDate(m.approved) : "—"}</td>
        <td class="cell-primary" data-label="Notes" style="font-size:13.5px">${m.key ? `<a href="https://www.lynnma.gov/common/pages/GetFile.ashx?key=${m.key}" target="_blank" rel="noopener">Open minutes</a> · <a href="votes.html?date=${m.date}">See votes</a>` : ""}${m.note || auto ? `<div style="color:var(--muted);margin-top:3px">${m.note || auto}</div>` : ""}</td>
      </tr>`;
    }).join("");
    const chip = { missing: `<span class="chip miss">Missing</span>`, access: `<span class="chip wait">Access problem</span>`, pending: `<span class="chip info">Promised, not yet posted</span>` };
    $("#rec-findings").innerHTML = RECORDS_FINDINGS.map(f => `
      <div class="card" style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:baseline">
          <h3 style="margin:0;font-size:17px">${f.title}</h3>${chip[f.status] || ""}
        </div>
        <p style="margin:8px 0 8px">${f.detail}</p>
        <p class="source-link" style="margin:0">Where we looked: <a href="${f.url}" target="_blank" rel="noopener">${f.url.replace("https://www.", "")}</a> · checked ${fmtDate(RECORDS_CHECKED)}</p>
      </div>`).join("");
  }

  /* ---------- Votes table (real votes from the database) ---------- */
  const usdShort = (n) => {
    if (n == null) return "";
    const x = Number(n), cents = Math.round(x * 100) % 100 !== 0;
    return "$" + x.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
  };
  async function renderVotes() {
    const body = $("#votes-body");
    if (!body) return;
    const catSel = $("#cat-filter"), q = $("#vote-search"), count = $("#vote-count");

    let all = [];
    try {
      const res = await fetch("/api/votes");
      if (!res.ok) throw new Error("api");
      all = await res.json();
    } catch (e) {
      count.textContent = "The live vote database is temporarily unavailable.";
      body.innerHTML = `<tr><td colspan="5" style="padding:16px;color:var(--muted)">You can read the source minutes on the <a href="https://www.lynnma.gov/city_government/citycouncil/meeting" target="_blank" rel="noopener">city's meeting page</a>.</td></tr>`;
      return;
    }

    const cats = Array.from(new Set(all.map(v => v.category_name).filter(Boolean))).sort();
    catSel.innerHTML = `<option value="all">All categories</option>` + cats.map(c => `<option>${c}</option>`).join("");
    const yearSel = $("#year-filter");
    const years = Array.from(new Set(all.map(v => (v.vote_date || "").slice(0, 4)).filter(Boolean))).sort().reverse();
    if (yearSel) yearSel.innerHTML = `<option value="all">All years</option>` + years.map(y => `<option>${y}</option>`).join("");

    const resultClass = (v) => (v.tally_no && v.tally_no > 0) ? "result-split" : "result-pass";
    function spendCell(v) {
      if (v.spending_amount == null) return "—";
      let s = `<div style="font-weight:600">${usdShort(v.spending_amount)}</div>`;
      if (v.funding_local === 0) s += `<div style="font-size:12px;color:var(--good)">Net local: $0</div>`;
      else if (v.funding_local != null) s += `<div style="font-size:12px;color:var(--ink-2)">Net local: ${usdShort(v.funding_local)}</div>`;
      else s += `<div style="font-size:12px;color:var(--muted)">Net local: not classified</div>`;
      return s;
    }
    function row(v) {
      return `
        <tr data-vote="${v.id}">
          <td data-label="Date">${fmtDate(v.vote_date)}</td>
          <td class="cell-primary">
            <div style="font-weight:600">${v.title}</div>
            ${v.plain_summary ? `<div style="color:var(--muted);font-size:13px;margin-top:3px">${v.plain_summary}</div>` : ""}
            ${v.notes ? `<div style="color:var(--muted);font-size:12px;margin-top:4px;font-style:italic">${v.notes}</div>` : ""}
            <div class="source-link" style="margin-top:5px">Source: <a href="${v.source_url}" target="_blank" rel="noopener">official minutes</a>${v.tally_yes != null ? ` · <button type="button" class="linkbtn" data-expand="${v.id}" aria-expanded="false">See how each member voted ▾</button>` : ` · <span style="color:var(--muted)">no vote count recorded</span>`}</div>
            <div class="positions" id="pos-${v.id}" hidden></div>
          </td>
          <td data-label="Category">${v.category_name ? `<span class="badge-cat">${v.category_name}</span>` : ""}</td>
          <td data-label="Spending">${spendCell(v)}</td>
          <td data-label="Result" class="${resultClass(v)}">${v.result || ""}</td>
        </tr>`;
    }
    function draw() {
      const cv = catSel.value, qv = (q.value || "").toLowerCase(), yv = yearSel ? yearSel.value : "all";
      const rows = all.filter(v =>
        (cv === "all" || v.category_name === cv) &&
        (yv === "all" || (v.vote_date || "").slice(0, 4) === yv) &&
        (!dateParam || (v.vote_date || "").slice(0, 10) === dateParam) &&
        (!qv || (v.title + " " + (v.plain_summary || "")).toLowerCase().includes(qv)));
      count.innerHTML = `${rows.length} of ${all.length} recorded votes, transcribed from official minutes` +
        (dateParam ? ` · showing the ${fmtDate(dateParam)} meeting only · <a href="votes.html">show all</a>` : "");
      body.innerHTML = rows.length ? rows.map(row).join("") : `<tr><td colspan="5" style="padding:16px;color:var(--muted)">No votes match your filters.</td></tr>`;
    }
    const dateParam = /^\d{4}-\d{2}-\d{2}$/.test(new URLSearchParams(location.search).get("date") || "") ? new URLSearchParams(location.search).get("date") : null;
    const preCat = new URLSearchParams(location.search).get("category");
    if (preCat && cats.includes(preCat)) catSel.value = preCat;
    const qp = new URLSearchParams(location.search).get("q");
    if (qp) q.value = qp;
    catSel.addEventListener("change", draw);
    if (yearSel) yearSel.addEventListener("change", draw);
    q.addEventListener("input", draw);

    // expand a row to show per-member positions (fetched on demand)
    const POS_ORDER = { no: 0, abstain: 1, present: 2, recused: 3, absent: 4, yes: 5 };
    const posColor = { yes: "var(--good)", no: "var(--bad)", abstain: "var(--warn)", present: "var(--warn)", recused: "var(--muted)", absent: "var(--muted)" };
    body.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-expand]");
      if (!btn) return;
      const id = btn.getAttribute("data-expand");
      const box = $("#pos-" + id);
      if (!box) return;
      if (!box.hidden) { box.hidden = true; btn.setAttribute("aria-expanded", "false"); btn.textContent = "See how each member voted ▾"; return; }
      btn.setAttribute("aria-expanded", "true"); btn.textContent = "Hide member votes ▴";
      box.hidden = false;
      if (box.dataset.loaded) return;
      box.innerHTML = `<span style="color:var(--muted);font-size:13px">Loading…</span>`;
      try {
        const res = await fetch("/api/votes/" + id);
        const data = await res.json();
        const positions = (data.positions || []).slice().sort((a, b) => (POS_ORDER[a.position] ?? 9) - (POS_ORDER[b.position] ?? 9));
        box.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">` + positions.map(p =>
          `<span style="font-size:12.5px;border:1px solid var(--line);border-radius:999px;padding:3px 10px"><b style="color:${posColor[p.position] || "var(--text)"};text-transform:capitalize">${p.position}</b> · ${p.name.replace(/"[^"]*"\s*/g, "")} <span style="color:var(--muted)">(${p.seat})</span></span>`
        ).join("") + `</div>`;
        box.dataset.loaded = "1";
      } catch (err) {
        box.innerHTML = `<span style="color:var(--muted);font-size:13px">Member breakdown unavailable.</span>`;
      }
    });
    draw();
  }

  /* ---------- meetings (real Lynn Community TV council videos) ---------- */
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtDate(s) {
    const p = (s || "").slice(0, 10).split("-");
    if (p.length !== 3) return s || "";
    return `${MON[(+p[1]) - 1]} ${+p[2]}, ${p[0]}`;
  }
  async function renderMeetings() {
    const host = $("#meetings-list");
    if (!host) return;
    try {
      const res = await fetch("/api/meetings");
      if (!res.ok) throw new Error("api " + res.status);
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) {
        host.innerHTML = `<div class="banner warn" style="grid-column:1/-1"><span class="ic">!</span><div>No meeting videos are loaded yet. You can watch all meetings directly on <a href="https://www.youtube.com/@LynnCommunityTV" target="_blank" rel="noopener">Lynn Community TV</a>.</div></div>`;
        return;
      }
      host.innerHTML = data.map(m => {
        const clean = m.title.replace(/\s*\|\s*[A-Za-z]+\s+\d{1,2},\s*\d{4}\s*$/, "").trim();
        return `<a class="card link" style="padding:0;overflow:hidden" href="${m.video_url}" target="_blank" rel="noopener">
          <div style="position:relative;aspect-ratio:16/9;background:#000">
            <img src="${m.thumbnail_url}" alt="Video thumbnail" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">
            <span aria-hidden="true" style="position:absolute;inset:0;display:grid;place-items:center">
              <span style="width:52px;height:52px;border-radius:50%;background:rgba(11,26,43,.72);color:#fff;display:grid;place-items:center;font-size:18px">▶</span>
            </span>
          </div>
          <div style="padding:14px 15px">
            <div style="font-weight:600;font-size:14px;line-height:1.35">${clean}</div>
            <div style="color:var(--muted);font-size:13px;margin-top:5px">${fmtDate(m.meeting_date)} · City Council</div>
          </div>
        </a>`;
      }).join("");
    } catch (e) {
      host.innerHTML = `<div class="banner warn" style="grid-column:1/-1"><span class="ic">!</span><div>The live meeting feed is temporarily unavailable. Watch all Lynn City Council meetings on <a href="https://www.youtube.com/@LynnCommunityTV" target="_blank" rel="noopener">Lynn Community TV</a>.</div></div>`;
    }
  }

  /* ---------- unaccounted funds tracker (facts-only records-gap ledger) ---------- */
  async function renderUnaccounted() {
    const host = $("#unaccounted-list");
    if (!host) return;
    try {
      const res = await fetch("/api/unaccounted");
      if (!res.ok) throw new Error("api " + res.status);
      const rows = await res.json();
      if (!rows.length) {
        host.innerHTML = `<div class="card"><p style="margin:0;color:var(--muted)">No items are currently logged. As budgets, audits, and meeting records are reviewed, any funds that cannot be traced in the public record will be listed here with full sourcing.</p></div>`;
        return;
      }
      host.innerHTML = rows.map(r => `
        <div class="card" style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:baseline">
            <h3 style="margin:0;font-size:17px">${r.item}</h3>
            <div style="white-space:nowrap;font-weight:700">${r.amount != null ? "$" + Number(r.amount).toLocaleString("en-US") + (r.amount_is_estimate ? " (estimate)" : "") : "Amount not determinable"}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px">
            ${r.fiscal_year ? `<span class="badge-cat">FY${r.fiscal_year}</span>` : ""}
            ${r.confidence ? `<span class="badge-cat">Confidence: ${r.confidence}</span>` : ""}
            <span class="badge-cat">Status: ${r.status}</span>
            <span class="badge-cat">Logged ${String(r.logged_date).slice(0, 10)}</span>
          </div>
          <p style="margin:0 0 8px"><b>What the records show:</b> ${r.what_records_show}</p>
          <p style="margin:0 0 8px"><b>What the records do not show:</b> ${r.what_records_do_not_show}</p>
          ${r.records_reviewed ? `<p style="margin:0 0 8px;color:var(--muted);font-size:13.5px"><b>Records reviewed:</b> ${r.records_reviewed}</p>` : ""}
          ${r.source_url ? `<p class="source-link" style="margin:0">Source: <a href="${r.source_url}" target="_blank" rel="noopener">original document</a></p>` : ""}
        </div>`).join("");
    } catch (e) {
      host.innerHTML = `<div class="banner warn"><span class="ic">!</span><div>The tracker is temporarily unavailable. All underlying documents remain available from the official sources linked below.</div></div>`;
    }
  }

  /* ---------- immigration-related spending (curated, sourced view) ---------- */
  async function renderImmigration() {
    const host = $("#immigration-list");
    if (!host) return;
    // Precise match: genuine immigration / newcomer / refugee / asylum items only.
    // Word boundaries avoid false positives (e.g. "attorney appeared in favor").
    const RX = /\b(immigrant|immigration|newcomer|refugee|asylum|undocumented|migrant|sanctuary)\b/i;
    const AID = /\b(legal aid|legal defense|legal representation|legal services|deportation defense|removal defense)\b/i;
    try {
      const res = await fetch("/api/votes");
      if (!res.ok) throw new Error("api " + res.status);
      const all = await res.json();
      const items = all
        .filter(v => RX.test((v.title || "") + " " + (v.plain_summary || "") + " " + (v.notes || "")))
        .sort((a, b) => (b.vote_date || "").localeCompare(a.vote_date || ""));

      const funded = items.filter(v => v.spending_amount != null);
      const gross = funded.reduce((a, v) => a + Number(v.spending_amount), 0);
      // net local = sum of documented local funding; only counts where classified
      const localItems = items.filter(v => v.funding_local != null);
      const netLocal = localItems.reduce((a, v) => a + Number(v.funding_local), 0);
      // legal-aid-for-immigrants items: match BOTH immigration and legal-aid terms
      const legalAid = items.filter(v => AID.test((v.title || "") + " " + (v.plain_summary || "")));
      const years = items.map(v => (v.vote_date || "").slice(0, 4)).filter(Boolean).sort();
      const span = years.length ? (years[0] === years[years.length - 1] ? years[0] : years[0] + "–" + years[years.length - 1]) : "—";

      const topline = $("#imm-topline");
      if (topline) topline.innerHTML = `
        <div class="s"><b>${usd(gross)}</b><span>gross moved through Council (${span})</span></div>
        <div class="s" style="color:#bff0c6"><b>${usd(netLocal)}</b><span>documented local taxpayer cost</span></div>
        <div class="s"><b>${items.length}</b><span>immigration-related items</span></div>
        <div class="s"><b>${legalAid.length}</b><span>items funding immigrant legal aid</span></div>`;

      const headline = $("#imm-headline");
      if (headline) headline.innerHTML = `
        <div class="card" style="border-left:4px solid var(--accent)">
          <h2 class="h" style="margin-top:0">In the recorded 2024&ndash;2026 council votes, immigration-related items totaled <span style="color:var(--accent)">${usd(gross)}</span> gross &mdash; with <span style="color:var(--accent)">${usd(netLocal)}</span> in documented local taxpayer cost.</h2>
          <p class="sub" style="margin-bottom:10px">Every funded item was an <b>outside grant passed through to the Lynn School Department</b> for multilingual, newcomer, or refugee <b>education</b> support (state/federal money, recorded as $0 local cost). ${legalAid.length === 0 ? "The council records reviewed show <b>no</b> appropriation for immigrant legal aid, legal defense, or deportation representation &mdash; documented local cost for that purpose: <b>$0</b>." : ""}</p>
          <p class="sub" style="margin-bottom:0">These are the specific items the records identify. See the caveat below on what council votes do and do not capture.</p>
        </div>`;

      if (!items.length) {
        host.innerHTML = `<div class="card"><p style="margin:0;color:var(--muted)">No immigration-related items were found in the recorded votes currently loaded.</p></div>`;
        return;
      }

      const spend = (v) => {
        if (v.spending_amount == null) return `<span class="badge-cat">No city funds — policy / resolution</span>`;
        let s = `<b>${usdShort(v.spending_amount)}</b> gross`;
        if (v.funding_local === 0) s += ` &middot; <span style="color:var(--good)">net local taxpayer cost $0 (outside-funded)</span>`;
        else if (v.funding_local != null) s += ` &middot; net local taxpayer cost ${usdShort(v.funding_local)}`;
        else s += ` &middot; <span style="color:var(--muted)">net local cost not classified in the record</span>`;
        return s;
      };

      host.innerHTML = items.map(v => `
        <div class="card" style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:baseline">
            <h3 style="margin:0;font-size:17px;flex:1;min-width:240px">${v.title}</h3>
            <div style="white-space:nowrap;color:var(--muted);font-size:13.5px">${fmtDate(v.vote_date)}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px">
            ${v.category_name ? `<span class="badge-cat">${v.category_name}</span>` : ""}
            ${v.result ? `<span class="badge-cat">${v.result}</span>` : ""}
          </div>
          <p style="margin:0 0 10px">${spend(v)}</p>
          ${v.plain_summary ? `<p class="sub" style="margin:0 0 8px">${v.plain_summary}</p>` : ""}
          ${v.notes ? `<p style="margin:0 0 8px;color:var(--muted);font-size:13px;font-style:italic">${v.notes}</p>` : ""}
          ${v.source_url ? `<p class="source-link" style="margin:0">Source: <a href="${v.source_url}" target="_blank" rel="noopener">official minutes</a></p>` : ""}
        </div>`).join("");
    } catch (e) {
      host.innerHTML = `<div class="banner warn"><span class="ic">!</span><div>This view is temporarily unavailable. You can read the underlying records on the <a href="https://www.lynnma.gov/city_government/citycouncil/meeting" target="_blank" rel="noopener">city's meeting page</a>.</div></div>`;
    }
  }

  /* ---------- predictive search (suggests after 3 characters) ---------- */
  function highlight(text, q) {
    const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }

  function buildSuggestions(qraw) {
    const q = qraw.toLowerCase(), groups = [];
    const people = COUNCILORS.filter(c => c.name.toLowerCase().includes(q)).slice(0, 5)
      .map(c => ({ label: c.name, sub: c.seat + (c.title ? " · " + c.title : ""), href: "councilor.html?id=" + c.id }));
    if (people.length) groups.push({ name: "Councilors", items: people });
    const topics = CATEGORIES.filter(n => n.toLowerCase().includes(q)).slice(0, 5)
      .map(n => ({ label: n, sub: "Filter votes by topic", href: "votes.html?category=" + encodeURIComponent(n) }));
    if (topics.length) groups.push({ name: "Topics", items: topics });
    // free-text vote search routes to the live votes database
    if (q.length >= 3) groups.push({ name: "Search votes", items: [{ label: `Search votes for "${qraw}"`, sub: "Search the 2024–2026 voting record", href: "votes.html?q=" + encodeURIComponent(qraw) }] });
    const pages = SECTIONS.filter(s => s.ready && s.title.toLowerCase().includes(q)).slice(0, 4)
      .map(s => ({ label: s.title, sub: s.blurb, href: s.href }));
    if (pages.length) groups.push({ name: "Pages", items: pages });
    return groups;
  }

  function setupSearch() {
    const form = $("#home-search");
    if (!form) return;
    const input = form.querySelector("input");
    const wrap = document.createElement("div");
    wrap.className = "search-wrap";
    form.parentNode.insertBefore(wrap, form);
    wrap.appendChild(form);
    const box = document.createElement("div");
    box.className = "suggestions"; box.id = "search-suggestions"; box.setAttribute("role", "listbox");
    wrap.appendChild(box);
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", "search-suggestions");
    input.setAttribute("autocomplete", "off");

    let items = [], active = -1, timer = null;
    const close = () => { box.classList.remove("open"); input.setAttribute("aria-expanded", "false"); active = -1; };
    const go = (href) => { if (href && href !== "#") location.href = href; };

    function render(q) {
      const groups = buildSuggestions(q); items = [];
      if (!groups.length) {
        box.innerHTML = `<div class="empty">No matches for “${q.replace(/[<>&]/g, "")}”. Try a councilor, a topic, or a keyword.</div>`;
      } else {
        let html = "";
        groups.forEach(g => {
          html += `<div class="sugg-group">${g.name}</div>`;
          g.items.forEach(it => {
            const idx = items.length; items.push(it);
            html += `<a class="sugg" role="option" id="sugg-${idx}" href="${it.href}"><span class="s-label">${highlight(it.label, q.toLowerCase())}</span><span class="s-sub">${it.sub}</span></a>`;
          });
        });
        box.innerHTML = html;
      }
      box.classList.add("open"); input.setAttribute("aria-expanded", "true"); active = -1;
    }
    function setActive(n) {
      const nodes = box.querySelectorAll(".sugg"); if (!nodes.length) return;
      active = (n + nodes.length) % nodes.length;
      nodes.forEach((el, i) => el.classList.toggle("active", i === active));
      input.setAttribute("aria-activedescendant", "sugg-" + active);
      nodes[active].scrollIntoView({ block: "nearest" });
    }
    input.addEventListener("input", () => {
      const v = input.value.trim(); clearTimeout(timer);
      if (v.length < 3) { close(); return; }
      timer = setTimeout(() => render(v), 130);
    });
    input.addEventListener("keydown", (e) => {
      if (!box.classList.contains("open")) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Enter" && active >= 0 && items[active]) { e.preventDefault(); go(items[active].href); }
      else if (e.key === "Escape") { close(); }
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (active >= 0 && items[active]) return go(items[active].href);
      const term = input.value.trim();
      location.href = "votes.html" + (term ? "?q=" + encodeURIComponent(term) : "");
    });
    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
    input.addEventListener("focus", () => { const v = input.value.trim(); if (v.length >= 3) render(v); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    renderHome();
    renderWatch();
    renderCouncilors();
    renderProfile();
    renderSpending();
    renderVotes();
    renderMeetings();
    renderUnaccounted();
    renderImmigration();
    renderRecords();
    setupSearch();
    // prefill votes search from query
    const qparam = new URLSearchParams(location.search).get("q");
    if (qparam && $("#vote-search")) { $("#vote-search").value = qparam; $("#vote-search").dispatchEvent(new Event("input")); }
  });
})();
