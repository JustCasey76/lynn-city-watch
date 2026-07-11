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
    { href: "index.html#sections", label: "All Sections" },
  ];
  const money = (m) => "$" + m.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + "M";

  function renderHeader() {
    const here = (location.pathname.split("/").pop() || "index.html");
    const links = NAV.map(n => {
      const active = n.href.split("#")[0] === here ? " active" : "";
      return `<a class="${active.trim()}" href="${n.href}">${n.label}</a>`;
    }).join("");
    const el = $("#site-header");
    if (el) el.innerHTML = `
      <div class="wrap">
        <a class="brand" href="index.html">
          <span class="mark">L</span>
          <span>Lynn City Watch<small>Public records, made auditable</small></span>
        </a>
        <nav class="nav">${links}</nav>
      </div>`;
  }

  function renderFooter() {
    const el = $("#site-footer");
    if (!el) return;
    el.innerHTML = `
      <div class="wrap">
        <div class="cols">
          <div>
            <h4>Lynn City Watch</h4>
            <p style="margin:0;max-width:42ch">A fact-based civic transparency project. Every claim links to an official public record. Where a record is missing, we say so.</p>
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
              <li><a href="index.html#sections">See all 10 →</a></li>
            </ul>
          </div>
        </div>
        <p class="disclaimer">
          <b>Prototype.</b> The councilor roster, seats, titles, meeting schedule, and source links are real, pulled from lynnma.gov on 2026-07-11.
          Vote rows, attendance figures, and dollar amounts marked <span class="flag-sample">Sample</span> are illustrative placeholders shown only to demonstrate the interface — they are not real records and will be replaced with sourced data before launch.
          This is an independent project and is not affiliated with the City of Lynn.
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
    const myVotes = VOTES; // in prototype, all sample votes shown for illustration

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
        <div class="kpis">
          <div class="kpi"><b>—</b><span>Attendance</span></div>
          <div class="kpi"><b>—</b><span>Votes recorded</span></div>
          <div class="kpi"><b>—</b><span>Items sponsored</span></div>
          <div class="kpi"><b>—</b><span>With administration</span></div>
        </div>
        <div class="banner warn" style="margin-bottom:28px">
          <span class="ic">!</span>
          <div><b>These metrics are not yet populated.</b> Attendance, voting, and sponsorship figures will be filled in from official minutes and vote records. Empty here means "not yet sourced," never estimated.</div>
        </div>

        <div class="two-col">
          <div>
            <h2 class="h">This profile will answer</h2>
            <ul class="answers" style="padding-left:18px;margin-top:6px">
              <li><span class="callq">How does ${c.name.split(" ")[0]} vote?</span> — full sourced voting record.</li>
              <li><span class="callq">What do they support or oppose?</span> — patterns by issue category.</li>
              <li><span class="callq">Are they consistent?</span> — votes vs. public statements.</li>
              <li><span class="callq">Do they attend?</span> — meeting attendance from minutes.</li>
              <li><span class="callq">With or against the administration?</span> — alignment on key votes.</li>
            </ul>

            <h2 class="h" style="margin-top:32px">Voting record <span class="flag-sample">Sample data</span></h2>
            <p class="sub">Illustrative rows below show the format. Real votes come from official minutes.</p>
            <div class="tablewrap">
              <table>
                <thead><tr><th>Date</th><th>Item</th><th>Category</th><th>Result</th></tr></thead>
                <tbody>${myVotes.map(v => `
                  <tr>
                    <td>${v.date}</td>
                    <td>${v.title.replace("SAMPLE — ", "")}</td>
                    <td><span class="badge-cat">${v.category}</span></td>
                    <td class="${v.result.includes("11–0") || v.result.includes("10–1") ? "result-pass" : "result-split"}">${v.result}</td>
                  </tr>`).join("")}
                </tbody>
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
              <p class="sub" style="margin:0">Not yet sourced. Will be pulled from council records.</p>
            </div>
          </aside>
        </div>
      </div>`;
    document.title = c.name + " — Lynn City Watch";
  }

  /* ---------- Spending dashboard ---------- */
  function renderSpending() {
    if (!$("#spend-body")) return;

    // department rows with computed net local cost
    const rows = SPENDING.map(d => {
      const local = d.total - d.federal - d.state;
      return { ...d, local, localPct: Math.round((local / d.total) * 100) };
    });
    const tot = rows.reduce((a, r) => a + r.total, 0);
    const fed = rows.reduce((a, r) => a + r.federal, 0);
    const st = rows.reduce((a, r) => a + r.state, 0);
    const loc = tot - fed - st;
    const localCents = Math.round((loc / tot) * 100);

    // top-line hero numbers
    $("#spend-topline").innerHTML = `
      <div class="s"><b>${money(tot)}</b><span>Total dept. spending</span></div>
      <div class="s" style="color:#ffd9a8"><b>${money(loc)}</b><span>Paid by local taxes</span></div>
      <div class="s"><b>${money(st + fed)}</b><span>State + federal funds</span></div>
      <div class="s"><b>${localCents}¢</b><span>of each $1 is local</span></div>`;

    // the headline explainer
    $("#spend-headline").innerHTML = `
      <div class="card" style="border-left:4px solid var(--accent)">
        <h2 class="h" style="margin-top:0">Of every $1 the city spends here, about <span style="color:var(--accent)">${localCents}¢</span> comes out of local Lynn taxes.</h2>
        <p class="sub" style="margin-bottom:0">The rest is paid by state aid and federal funds. This page strips those out so you can see
        the <b>net local cost</b> — what a spending choice actually costs Lynn property taxpayers, not the sticker price.</p>
      </div>`;

    // department table
    const maxLocal = Math.max(...rows.map(r => r.local));
    $("#spend-body").innerHTML = rows
      .sort((a, b) => b.local - a.local)
      .map(d => `
        <tr>
          <td>
            <div style="font-weight:600">${d.dept} <span class="flag-sample">Sample</span></div>
            ${d.note ? `<div style="color:var(--muted);font-size:12.5px;margin-top:3px">${d.note}</div>` : ""}
          </td>
          <td style="white-space:nowrap">${money(d.total)}</td>
          <td style="white-space:nowrap;color:var(--muted)">${money(d.federal)}</td>
          <td style="white-space:nowrap;color:var(--muted)">${money(d.state)}</td>
          <td style="white-space:nowrap;font-weight:700;color:var(--ink-2)">${money(d.local)}</td>
          <td style="min-width:150px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;background:#eef2f6;border-radius:6px;height:8px;overflow:hidden">
                <div style="width:${Math.round((d.local / maxLocal) * 100)}%;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-2))"></div>
              </div>
              <span style="font-size:12px;color:var(--muted);white-space:nowrap">${d.localPct}% local</span>
            </div>
          </td>
        </tr>`).join("");

    // revenue mix
    const rev = CITY_REVENUE.sources;
    const revTot = rev.reduce((a, s) => a + s.amount, 0);
    const kindColor = { local: "var(--accent)", state: "var(--accent-2)", federal: "var(--warn)" };
    $("#revenue-bar").innerHTML = rev.map(s =>
      `<div title="${s.source}: ${money(s.amount)}" style="width:${(s.amount / revTot) * 100}%;background:${kindColor[s.kind]};height:100%"></div>`
    ).join("");
    $("#revenue-legend").innerHTML = rev.map(s => `
      <li>
        <span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${kindColor[s.kind]};margin-right:8px"></span>
        <b>${money(s.amount)}</b> — ${s.source}
        <span style="color:var(--muted);font-size:12.5px;display:block;margin-left:19px">${s.note}</span>
      </li>`).join("");
  }

  /* ---------- Votes table ---------- */
  function renderVotes() {
    const body = $("#votes-body");
    if (!body) return;
    const catSel = $("#cat-filter"), q = $("#vote-search"), count = $("#vote-count");
    // populate categories present in data
    const cats = Array.from(new Set(VOTES.map(v => v.category))).sort();
    catSel.innerHTML = `<option value="all">All categories</option>` + cats.map(c => `<option>${c}</option>`).join("");

    function draw() {
      const cv = catSel.value, qv = (q.value || "").toLowerCase();
      const rows = VOTES.filter(v =>
        (cv === "all" || v.category === cv) &&
        (v.title.toLowerCase().includes(qv) || v.summary.toLowerCase().includes(qv)));
      count.textContent = `${rows.length} of ${VOTES.length} sample votes shown`;
      body.innerHTML = rows.map(v => `
        <tr>
          <td style="white-space:nowrap">${v.date}</td>
          <td>
            <div style="font-weight:600">${v.title.replace("SAMPLE — ", "")} <span class="flag-sample">Sample</span></div>
            <div style="color:var(--muted);font-size:13px;margin-top:3px">${v.summary}</div>
            <div class="source-link" style="margin-top:5px">Source: <a href="${v.source}" target="_blank" rel="noopener">meeting record</a></div>
          </td>
          <td><span class="badge-cat">${v.category}</span></td>
          <td style="white-space:nowrap">${v.type}</td>
          <td>${v.spending}</td>
          <td class="${v.result.includes("11–0") || v.result.includes("10–1") ? "result-pass" : "result-split"};white-space:nowrap">${v.result}</td>
        </tr>`).join("");
    }
    catSel.addEventListener("change", draw);
    q.addEventListener("input", draw);
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    renderHome();
    renderCouncilors();
    renderProfile();
    renderSpending();
    renderVotes();
    // route home search box to votes page
    const hs = $("#home-search");
    if (hs) hs.addEventListener("submit", (e) => {
      e.preventDefault();
      const term = $("#home-search input").value.trim();
      location.href = "votes.html" + (term ? "?q=" + encodeURIComponent(term) : "");
    });
    // prefill votes search from query
    const qparam = new URLSearchParams(location.search).get("q");
    if (qparam && $("#vote-search")) { $("#vote-search").value = qparam; $("#vote-search").dispatchEvent(new Event("input")); }
  });
})();
