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
              <li><a href="unaccounted.html">Funds Not Fully Accounted For</a></li>
              <li><a href="corrections.html">Corrections &amp; Updates</a></li>
              <li><a href="index.html#sections">See all sections</a></li>
            </ul>
          </div>
        </div>
        <p class="disclaimer">
          This website is an independent civic transparency project. It is not affiliated with, endorsed by, or operated by the City of Lynn, Lynn City Council, Lynn Public Schools, Lynn Police Department, Lynn Fire Department, or any city agency. Information is compiled from public records and other cited sources. Users should review the original source documents before relying on any summary or analysis.
        </p>
        <p class="disclaimer" style="margin-top:12px">
          Data shown is compiled from official public records: the councilor roster and meeting schedule from lynnma.gov; the 2024–2026 voting record from the official council minutes; spending and revenue figures from the city's audited financial statements; and meeting videos from Lynn Community TV. Each item links to its source. Found an error or missing context? <a href="corrections.html">Submit a correction</a>.
        </p>
      </div>`;
  }

  /* ---------- Home ---------- */
  function renderHome() {
    const s = $("#section-grid");
    if (s) s.innerHTML = SECTIONS.map(x => `
      <a class="card link feat" href="${x.href}">
        <div class="n">${x.n}</div>
        <h3>${x.title}</h3>
        <p>${x.blurb}</p>
        <span class="soon ${x.ready ? "ready" : ""}">${x.ready ? "In prototype" : "Planned"}</span>
      </a>`).join("");

    const cf = $("#council-facts");
    if (cf) cf.innerHTML = `
      <div class="s"><b>${COUNCIL_FACTS.size}</b><span>Council members</span></div>
      <div class="s"><b>${COUNCIL_FACTS.ward}</b><span>Ward seats</span></div>
      <div class="s"><b>${COUNCIL_FACTS.atLarge}</b><span>At-large seats</span></div>
      <div class="s"><b>2&amp;4</b><span>Tuesdays / month</span></div>`;
  }

  /* ---------- Councilor grid ---------- */
  function renderCouncilors() {
    const grid = $("#councilor-grid");
    if (!grid) return;
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
        <div class="kpis" id="pf-kpis">
          <div class="kpi"><b>…</b><span>Attendance</span></div>
          <div class="kpi"><b>…</b><span>Recorded votes</span></div>
          <div class="kpi"><b>…</b><span>Voted yes</span></div>
          <div class="kpi"><b>…</b><span>No / abstain / present</span></div>
        </div>

        <div class="two-col">
          <div>
            <h2 class="h" style="margin-bottom:4px">Voting record</h2>
            <p class="sub" id="pf-note">Loading this member's recorded votes from the 2026 council minutes…</p>
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
              <p class="sub" style="margin:0">Not yet sourced. Will be added from council committee records.</p>
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
        $("#pf-kpis").innerHTML = `
          <div class="kpi"><b>${attPct == null ? "—" : attPct + "%"}</b><span>Attendance (${attended}/${total})</span></div>
          <div class="kpi"><b>${total}</b><span>Recorded votes</span></div>
          <div class="kpi"><b>${yes}</b><span>Voted yes</span></div>
          <div class="kpi"><b>${other}</b><span>No / abstain / present</span></div>`;
        $("#pf-note").innerHTML = `${total} recorded votes from official 2026 Lynn City Council minutes. Where the minutes do not list members individually, the position is derived from the recorded tally and attendance (noted on each vote). "No / abstain / present" counts any position other than yes or absent.`;
        const posClass = { yes: "result-pass", no: "result-split", abstain: "result-split", present: "result-split" };
        $("#pf-votes").innerHTML = votes.length ? votes.map(v => `
          <tr>
            <td data-label="Date" style="white-space:nowrap">${fmtDate(v.vote_date)}</td>
            <td class="cell-primary"><a href="votes.html?q=${encodeURIComponent(v.title.slice(0, 40))}">${v.title}</a></td>
            <td data-label="Category">${v.category ? `<span class="badge-cat">${v.category}</span>` : ""}</td>
            <td data-label="Their vote" class="${posClass[v.position] || ""}" style="text-transform:capitalize;font-weight:600">${v.position}</td>
            <td data-label="Result" style="white-space:nowrap">${v.result || ""}</td>
          </tr>`).join("") : `<tr><td colspan="5" style="padding:16px;color:var(--muted)">No recorded votes found for this member yet.</td></tr>`;
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

    $("#spend-topline").innerHTML = `
      <div class="s"><b>${usdM(revTot)}</b><span>FY25 General Fund revenue</span></div>
      <div class="s" style="color:#ffd9a8"><b>${cents(localTax)}¢</b><span>of each $1 from local taxes</span></div>
      <div class="s"><b>${cents(intergov)}¢</b><span>from intergovernmental</span></div>
      <div class="s"><b>${pct(propTax)}%</b><span>from property tax</span></div>`;

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

  /* ---------- Votes table (real votes from the database) ---------- */
  const usdShort = (n) => n == null ? "" : "$" + Number(n).toLocaleString("en-US");
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
          <td data-label="Date" style="white-space:nowrap">${fmtDate(v.vote_date)}</td>
          <td class="cell-primary">
            <div style="font-weight:600">${v.title}</div>
            ${v.plain_summary ? `<div style="color:var(--muted);font-size:13px;margin-top:3px">${v.plain_summary}</div>` : ""}
            ${v.notes ? `<div style="color:var(--muted);font-size:12px;margin-top:4px;font-style:italic">${v.notes}</div>` : ""}
            <div class="source-link" style="margin-top:5px">Source: <a href="${v.source_url}" target="_blank" rel="noopener">official minutes</a> · <button type="button" class="linkbtn" data-expand="${v.id}" aria-expanded="false">See how each member voted ▾</button></div>
            <div class="positions" id="pos-${v.id}" hidden></div>
          </td>
          <td data-label="Category">${v.category_name ? `<span class="badge-cat">${v.category_name}</span>` : ""}</td>
          <td data-label="Spending">${spendCell(v)}</td>
          <td data-label="Result" class="${resultClass(v)}" style="white-space:nowrap">${v.result || ""}</td>
        </tr>`;
    }
    function draw() {
      const cv = catSel.value, qv = (q.value || "").toLowerCase(), yv = yearSel ? yearSel.value : "all";
      const rows = all.filter(v =>
        (cv === "all" || v.category_name === cv) &&
        (yv === "all" || (v.vote_date || "").slice(0, 4) === yv) &&
        (!qv || (v.title + " " + (v.plain_summary || "")).toLowerCase().includes(qv)));
      count.textContent = `${rows.length} of ${all.length} recorded votes, transcribed from official minutes`;
      body.innerHTML = rows.length ? rows.map(row).join("") : `<tr><td colspan="5" style="padding:16px;color:var(--muted)">No votes match your filters.</td></tr>`;
    }
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
    if (q.length >= 3) groups.push({ name: "Search votes", items: [{ label: `Search votes for "${qraw}"`, sub: "Search the 2026 voting record", href: "votes.html?q=" + encodeURIComponent(qraw) }] });
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
    renderCouncilors();
    renderProfile();
    renderSpending();
    renderVotes();
    renderMeetings();
    renderUnaccounted();
    setupSearch();
    // prefill votes search from query
    const qparam = new URLSearchParams(location.search).get("q");
    if (qparam && $("#vote-search")) { $("#vote-search").value = qparam; $("#vote-search").dispatchEvent(new Event("input")); }
  });
})();
