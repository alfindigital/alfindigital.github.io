(() => {
  "use strict";
  const USER = "alfindigital";
  const EMAIL = "gmail@alfindigital.com";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- helpers ---------- */
  const rel = (iso) => {
    const d = (Date.parse(iso) - Date.now()) / 864e5;
    const f = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (Math.abs(d) < 30) return f.format(Math.round(d), "day");
    if (Math.abs(d) < 365) return f.format(Math.round(d / 30), "month");
    return f.format(Math.round(d / 365), "year");
  };
  const getJSON = async (url) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(url, { signal: ctl.signal, headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  };
  const toast = (msg) => {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 1800);
  };

  /* ---------- live profile (hero card + stats) ---------- */
  getJSON(`https://api.github.com/users/${USER}`).then((u) => {
    const set = (k, v, quoted) => {
      const el = $(`[data-k="${k}"]`);
      if (el && v != null) el.textContent = quoted ? JSON.stringify(String(v)) : String(v);
    };
    set("login", u.login, true);
    set("name", u.name, true);
    set("bio", u.bio, true);
    set("location", u.location, true);
    set("public_repos", u.public_repos);
    set("followers", u.followers);
    set("created_at", (u.created_at || "").slice(0, 10), true);
    const s = $("#api-status");
    s.textContent = "200 OK";
    s.dataset.state = "live";
    const stat = (k, v) => { const el = $(`[data-stat="${k}"]`); if (el) el.textContent = v; };
    stat("public_repos", u.public_repos);
    stat("followers", u.followers);
    stat("since", new Date(u.created_at).getUTCFullYear());
  }).catch(() => {});

  /* ---------- repos: updated times + language bar ---------- */
  getJSON(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`).then((repos) => {
    const byName = new Map(repos.map((r) => [r.name, r]));
    $$(".card").forEach((c) => {
      const r = byName.get(c.dataset.repo);
      const t = $("[data-pushed]", c);
      if (r && t) { t.dateTime = r.pushed_at; t.textContent = rel(r.pushed_at); t.title = "Last pushed " + r.pushed_at.slice(0, 10); }
    });
    const own = repos.filter((r) => !r.fork && r.language);
    const counts = {};
    own.forEach((r) => { counts[r.language] = (counts[r.language] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return;
    const known = ["TypeScript", "JavaScript", "Python", "HTML"];
    const top = entries.slice(0, 4);
    const rest = entries.slice(4).reduce((n, e) => n + e[1], 0);
    if (rest) top.push(["Other", rest]);
    const total = own.length;
    const bar = $("#langbar");
    const list = $("#langlist");
    top.forEach(([lang, n]) => {
      const key = known.includes(lang) ? lang : "other";
      const seg = document.createElement("i");
      seg.dataset.lang = key;
      seg.style.width = (n / total * 100) + "%";
      bar.appendChild(seg);
      const li = document.createElement("li");
      const dot = document.createElement("i");
      dot.className = "dot";
      dot.dataset.lang = key;
      li.append(dot, `${lang} ${Math.round(n / total * 100)}%`);
      list.appendChild(li);
    });
    bar.setAttribute("aria-label", "Language share: " + top.map(([l, n]) => `${l} ${Math.round(n / total * 100)}%`).join(", "));
    $("#langs").hidden = false;
  }).catch(() => {});

  /* ---------- contribution graph ---------- */
  getJSON(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`).then((d) => {
    const days = d.contributions || [];
    if (!days.length) throw new Error("empty");
    const heat = $("#heat");
    const first = new Date(days[0].date + "T00:00:00Z").getUTCDay();
    const frag = document.createDocumentFragment();
    for (let i = 0; i < first; i++) { const pad = document.createElement("i"); pad.style.visibility = "hidden"; frag.appendChild(pad); }
    days.forEach((x) => {
      const c = document.createElement("i");
      c.dataset.l = x.level;
      c.title = `${x.count} contribution${x.count === 1 ? "" : "s"} on ${x.date}`;
      frag.appendChild(c);
    });
    const weeks = Math.ceil((first + days.length) / 7);
    heat.style.gridTemplateColumns = `repeat(${weeks}, minmax(0, 1fr))`;
    heat.appendChild(frag);
    const total = d.total && d.total.lastYear;
    const fmt = new Intl.NumberFormat("en");
    $("#heat-total").textContent = `${fmt.format(total)} contributions in the last year`;
    $('[data-stat="contribs"]').textContent = fmt.format(total);
    $("#graph").dataset.state = "on";
  }).catch(() => {});

  /* ---------- project filters ---------- */
  const chips = $$(".chip");
  const cards = $$(".card");
  chips.forEach((chip) => chip.addEventListener("click", () => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    const f = chip.dataset.filter;
    cards.forEach((c) => {
      const show = f === "all" || c.dataset.cat === f;
      c.hidden = !show;
      c.classList.remove("fade");
      if (show && !reduce) { void c.offsetWidth; c.classList.add("fade"); }
    });
  }));

  /* ---------- command palette ---------- */
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $("#kbd-hint").textContent = isMac ? "⌘ K" : "Ctrl K";
  const pal = $("#palette");
  const input = $("#pal-input");
  const list = $("#pal-list");
  const go = (id) => () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };
  const commands = [
    { label: "Go to Work", hint: "#work", run: go("work") },
    { label: "Go to Activity", hint: "#activity", run: go("activity") },
    { label: "Go to Approach", hint: "#approach", run: go("approach") },
    { label: "Go to Contact", hint: "#contact", run: go("contact") },
    { label: "Open GitHub profile", hint: "github.com", run: () => window.open(`https://github.com/${USER}`, "_blank", "noopener") },
    { label: "Copy email address", hint: "clipboard", run: async () => {
        try { await navigator.clipboard.writeText(EMAIL); toast("Email copied"); } catch { toast(EMAIL); }
      } },
  ];
  let shown = [];
  let sel = 0;
  let lastFocus = null;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    shown = commands.filter((c) => c.label.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.textContent = "";
    if (!shown.length) {
      const e = document.createElement("li");
      e.className = "empty";
      e.setAttribute("role", "presentation");
      e.textContent = "No matching command";
      list.appendChild(e);
      return;
    }
    shown.forEach((c, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === sel));
      const a = document.createElement("span"); a.textContent = c.label;
      const b = document.createElement("span"); b.textContent = c.hint;
      li.append(a, b);
      li.addEventListener("mousemove", () => { if (sel !== i) { sel = i; render(); } });
      li.addEventListener("click", () => run(c));
      list.appendChild(li);
    });
  };
  const open = () => {
    lastFocus = document.activeElement;
    pal.hidden = false;
    pal.classList.add("open");
    input.value = "";
    sel = 0;
    render();
    input.focus();
  };
  const close = () => {
    pal.classList.remove("open");
    pal.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  const run = (c) => { close(); c.run(); };

  $("#open-palette").addEventListener("click", open);
  pal.addEventListener("mousedown", (e) => { if (e.target === pal) close(); });
  input.addEventListener("input", () => { sel = 0; render(); });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pal.classList.contains("open") ? close() : open();
      return;
    }
    if (!pal.classList.contains("open")) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); render(); }
    else if (e.key === "Enter") { e.preventDefault(); if (shown[sel]) run(shown[sel]); }
    else if (e.key === "Tab") { e.preventDefault(); input.focus(); }
  });
})();
