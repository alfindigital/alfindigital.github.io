(() => {
  "use strict";
  const USER = "alfindigital";
  const EMAIL = "gmail@alfindigital.com";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const cssMs = (name, fb) => { const v = parseFloat(getComputedStyle(root).getPropertyValue(name)); return Number.isFinite(v) ? v : fb; };

  /* ---------- theme (icon swap) ---------- */
  const themeSwap = $("#theme-swap");
  const isDark = () => {
    const t = root.getAttribute("data-theme");
    return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  };
  const paintTheme = () => { themeSwap.dataset.state = isDark() ? "b" : "a"; };
  const toggleTheme = () => {
    const next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    paintTheme();
  };
  $("#theme-toggle").addEventListener("click", toggleTheme);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paintTheme);
  paintTheme();

  /* ---------- toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("is-open");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-open"), 1800);
  };

  /* ---------- copy email (icon swap + toast) ---------- */
  const copySwap = $("#copy-swap");
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(EMAIL); toast("Email copied"); }
    catch (e) { toast(EMAIL); }
    copySwap.dataset.state = "b";
    setTimeout(() => { copySwap.dataset.state = "a"; }, 1800);
  };
  $("#copy-mail").addEventListener("click", copyEmail);

  /* ---------- hero: texts reveal ---------- */
  const hero = $("#hero");
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-shown")));

  /* ---------- scroll reveal ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- tabs sliding (shared) ---------- */
  const movePill = (pill, el, animate) => {
    if (!el || !el.offsetParent) return;
    const set = () => { pill.style.transform = `translateX(${el.offsetLeft}px)`; pill.style.width = `${el.offsetWidth}px`; };
    if (animate) { set(); return; }
    const prev = pill.style.transition;
    pill.style.transition = "none";
    set();
    void pill.offsetWidth;
    pill.style.transition = prev;
  };

  /* ---------- showcase ---------- */
  const shotTabs = $("#shot-tabs");
  const shotPill = $(".t-tabs-pill", shotTabs);
  const tabBtns = $$(".t-tab", shotTabs);
  const shots = $$(".shot");
  const cap = $("#caption");
  const capTitle = $("#cap-title"), capDesc = $("#cap-desc"), capLive = $("#cap-live"), capRepo = $("#cap-repo");
  let capTimer;
  const selectShot = (i, animate = true) => {
    tabBtns.forEach((b, j) => b.setAttribute("aria-selected", String(i === j)));
    shots.forEach((s, j) => s.classList.toggle("is-active", i === j));
    movePill(shotPill, tabBtns[i], animate);
    const s = shots[i];
    cap.classList.remove("is-shown");
    cap.classList.add("is-hiding");
    clearTimeout(capTimer);
    capTimer = setTimeout(() => {
      capTitle.textContent = s.dataset.title;
      capDesc.textContent = s.dataset.desc;
      capLive.firstChild.textContent = "Open live ";
      capLive.href = s.dataset.live;
      capRepo.href = s.dataset.repo;
      cap.classList.remove("is-hiding");
      void cap.offsetHeight;
      cap.classList.add("is-shown");
    }, reduce ? 0 : 200);
  };
  tabBtns.forEach((b, i) => b.addEventListener("click", () => selectShot(i)));
  shotTabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const cur = tabBtns.findIndex((b) => b.getAttribute("aria-selected") === "true");
    const next = (cur + (e.key === "ArrowRight" ? 1 : -1) + tabBtns.length) % tabBtns.length;
    tabBtns[next].focus();
    selectShot(next);
  });
  requestAnimationFrame(() => movePill(shotPill, tabBtns[0], false));

  /* ---------- nav pill + scroll spy ---------- */
  const navLinks = $("#nav-links");
  const navPill = $(".t-tabs-pill", navLinks);
  const navAnchors = $$("a", navLinks);
  navPill.style.opacity = "0";
  const setNav = (id) => {
    const a = navAnchors.find((x) => x.getAttribute("href") === "#" + id);
    navAnchors.forEach((x) => x.removeAttribute("aria-current"));
    if (!a) { navPill.style.opacity = "0"; return; }
    a.setAttribute("aria-current", "true");
    const first = navPill.style.opacity === "0";
    movePill(navPill, a, !first);
    navPill.style.opacity = "1";
  };
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setNav(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["showcase", "work", "activity", "try", "contact"].forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }
  window.addEventListener("resize", () => {
    movePill(shotPill, tabBtns.find((b) => b.getAttribute("aria-selected") === "true"), false);
    movePill(filterPill, filterBtns.find((b) => b.getAttribute("aria-selected") === "true"), false);
    const cur = navAnchors.find((a) => a.getAttribute("aria-current"));
    if (cur) movePill(navPill, cur, false);
  });

  /* ---------- number pop-in ---------- */
  const setDigits = (el, str) => {
    el.classList.remove("is-animating");
    el.replaceChildren();
    const chars = String(str).split("");
    chars.forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "t-digit";
      span.textContent = ch;
      if (i === chars.length - 2) span.dataset.stagger = "1";
      else if (i === chars.length - 1) span.dataset.stagger = "2";
      el.appendChild(span);
    });
    void el.offsetHeight;
    el.classList.add("is-animating");
  };

  /* ---------- GitHub live data ---------- */
  const rel = (iso) => {
    const d = (Date.parse(iso) - Date.now()) / 864e5;
    const f = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (Math.abs(d) < 30) return f.format(Math.round(d), "day");
    if (Math.abs(d) < 365) return f.format(Math.round(d / 30), "month");
    return f.format(Math.round(d / 365), "year");
  };
  const getJSON = async (url) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 9000);
    try {
      const r = await fetch(url, { signal: ctl.signal, headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  };
  const fmt = new Intl.NumberFormat("en");
  const live = $("#live");
  const skel = $("#skel");

  Promise.allSettled([
    getJSON(`https://api.github.com/users/${USER}`),
    getJSON(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`),
    getJSON(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`),
  ]).then(([u, r, c]) => {
    if (u.status === "rejected" && r.status === "rejected" && c.status === "rejected") {
      live.dataset.state = "error";
      return;
    }
    if (u.status === "fulfilled") {
      setDigits($("#fig-repos"), fmt.format(u.value.public_repos));
      setDigits($("#fig-followers"), fmt.format(u.value.followers));
    }
    if (r.status === "fulfilled") {
      const repos = r.value;
      const byName = new Map(repos.map((x) => [x.name, x]));
      $$(".row").forEach((row) => {
        const x = byName.get(row.dataset.repo);
        const t = $("[data-pushed]", row);
        if (x && t) { t.dateTime = x.pushed_at; t.textContent = rel(x.pushed_at); t.title = "Last pushed " + x.pushed_at.slice(0, 10); }
      });
      const own = repos.filter((x) => !x.fork && x.language);
      const counts = {};
      own.forEach((x) => { counts[x.language] = (counts[x.language] || 0) + 1; });
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (entries.length) {
        const known = ["TypeScript", "JavaScript", "Python", "HTML"];
        const top = entries.slice(0, 4);
        const rest = entries.slice(4).reduce((n, e) => n + e[1], 0);
        if (rest) top.push(["Other", rest]);
        const bar = $("#langbar"), list = $("#langlist");
        top.forEach(([lang, n]) => {
          const key = known.includes(lang) ? lang : "other";
          const seg = document.createElement("i");
          seg.dataset.lang = key;
          seg.style.width = (n / own.length * 100) + "%";
          bar.appendChild(seg);
          const li = document.createElement("li");
          const dot = document.createElement("i");
          dot.className = "dot"; dot.dataset.lang = key;
          li.append(dot, `${lang} ${Math.round(n / own.length * 100)}%`);
          list.appendChild(li);
        });
        bar.setAttribute("aria-label", "Language share: " + top.map(([l, n]) => `${l} ${Math.round(n / own.length * 100)}%`).join(", "));
        $("#langs").hidden = false;
        $("#langs").style.marginTop = "28px";
      }
    }
    if (c.status === "fulfilled" && c.value.contributions && c.value.contributions.length) {
      const days = c.value.contributions;
      const heat = $("#heat");
      const first = new Date(days[0].date + "T00:00:00Z").getUTCDay();
      const frag = document.createDocumentFragment();
      for (let i = 0; i < first; i++) { const pad = document.createElement("i"); pad.style.visibility = "hidden"; frag.appendChild(pad); }
      days.forEach((x) => {
        const cell = document.createElement("i");
        cell.dataset.l = x.level;
        cell.title = `${x.count} contribution${x.count === 1 ? "" : "s"} on ${x.date}`;
        frag.appendChild(cell);
      });
      heat.style.gridTemplateColumns = `repeat(${Math.ceil((first + days.length) / 7)}, minmax(0, 1fr))`;
      heat.appendChild(frag);
      const total = c.value.total && c.value.total.lastYear;
      if (total != null) {
        setDigits($("#fig-contrib"), fmt.format(total));
        heat.setAttribute("aria-label", `Contribution graph: ${fmt.format(total)} contributions in the last year`);
      }
    } else {
      skel.hidden = true;
    }
    skel.classList.add("is-revealed");
    skel.dataset.state = "ready";
    live.dataset.state = "ready";
  });

  /* ---------- project index: filter + accordion ---------- */
  const filterTabs = $("#filter-tabs");
  const filterPill = $(".t-tabs-pill", filterTabs);
  const filterBtns = $$(".t-tab", filterTabs);
  const rows = $$(".row");
  const acc = $("#acc"), accHead = $("#acc-head"), accInner = $("#acc-inner"), more = $("#more");
  const setAcc = (open) => {
    acc.dataset.open = String(open);
    accHead.setAttribute("aria-expanded", String(open));
    $("#acc-label").textContent = open ? "Show fewer" : `Show ${$$("#rows-b .row").length} more`;
    if (open) accInner.removeAttribute("inert"); else accInner.setAttribute("inert", "");
  };
  accHead.addEventListener("click", () => setAcc(acc.dataset.open !== "true"));
  filterBtns.forEach((btn) => btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
    movePill(filterPill, btn, true);
    const f = btn.dataset.filter;
    rows.forEach((row) => {
      const show = f === "all" || row.dataset.cat === f;
      row.hidden = !show;
      row.classList.remove("fade");
      if (show && !reduce) { void row.offsetWidth; row.classList.add("fade"); }
    });
    if (f === "all") { more.hidden = false; setAcc(false); }
    else { more.hidden = true; setAcc(true); }
  }));
  requestAnimationFrame(() => movePill(filterPill, filterBtns[0], false));

  /* ---------- beres-style demo ---------- */
  const tasksEl = $("#tasks"), emptyEl = $("#tasks-empty");
  const dateFmt = new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short" });
  const svgIcon = (name) => {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", "ic"); s.setAttribute("aria-hidden", "true");
    const u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#i-" + name);
    s.appendChild(u);
    return s;
  };
  const parse = (text) => {
    let s = " " + text.trim() + " ";
    const chips = [];
    const take = (re, fn) => { const m = s.match(re); if (m) { s = s.replace(re, " "); fn(m); } };
    let date = null;
    take(/\b(hari ini|besok|lusa)\b/i, (m) => {
      const add = { "hari ini": 0, besok: 1, lusa: 2 }[m[1].toLowerCase()];
      date = new Date(); date.setDate(date.getDate() + add);
    });
    let time = null;
    take(/\bjam\s+(\d{1,2})(?:[.:](\d{2}))?\b/i, (m) => {
      const h = Math.min(+m[1], 23), mi = m[2] ? Math.min(+m[2], 59) : 0;
      time = String(h).padStart(2, "0") + ":" + String(mi).padStart(2, "0");
    });
    let prio = null;
    take(/\s!p([1-3])\b/i, (m) => { prio = "P" + m[1]; });
    let tag = null;
    take(/\s#([\p{L}\p{N}_-]+)/u, (m) => { tag = m[1]; });
    if (date) chips.push(["calendar-blank", dateFmt.format(date)]);
    if (time) chips.push(["clock", time]);
    if (prio) chips.push(["flag", prio, prio === "P1" ? "chip--p1" : ""]);
    if (tag) chips.push(["hash", tag]);
    return { title: s.replace(/\s+/g, " ").trim(), chips };
  };
  const addTask = (text, animate = true) => {
    const { title, chips } = parse(text);
    if (!title) return false;
    const li = document.createElement("li");
    li.className = "task";
    const check = document.createElement("button");
    check.type = "button"; check.className = "t-check"; check.setAttribute("role", "checkbox");
    check.setAttribute("aria-checked", "false"); check.setAttribute("aria-label", "Done: " + title);
    check.innerHTML = '<svg viewBox="0 0 10.1668 10.1668" aria-hidden="true"><path d="M1 5.52L3.92 9.17L9.17 1"/></svg>';
    const body = document.createElement("div");
    const t = document.createElement("div");
    t.className = "task-title"; t.textContent = title;
    body.appendChild(t);
    if (chips.length) {
      const wrap = document.createElement("div");
      wrap.className = "chips";
      chips.forEach(([icon, label, cls]) => {
        const c = document.createElement("span");
        c.className = "chip" + (cls ? " " + cls : "");
        c.append(svgIcon(icon), label);
        wrap.appendChild(c);
      });
      body.appendChild(wrap);
    }
    check.addEventListener("click", () => {
      const done = check.getAttribute("aria-checked") !== "true";
      check.setAttribute("aria-checked", String(done));
      li.dataset.done = String(done);
    });
    li.append(check, body);
    tasksEl.prepend(li);
    emptyEl.hidden = true;
    if (animate && !reduce) { void li.offsetHeight; requestAnimationFrame(() => li.classList.add("is-in")); }
    else li.classList.add("is-in");
    return true;
  };
  ["beli galon hari ini #rumah", "bayar kos besok jam 9 !p1 #keuangan"].forEach((s) => addTask(s, false));
  $("#demo-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#demo-input");
    if (addTask(input.value)) { input.value = ""; }
    input.focus();
  });

  /* ---------- command menu (modal) ---------- */
  const scrim = $("#scrim"), pal = $("#pal"), input = $("#pal-input"), list = $("#pal-list");
  const go = (id) => () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };
  const commands = [
    { label: "Go to work", hint: "#work", run: go("work") },
    { label: "Go to activity", hint: "#activity", run: go("activity") },
    { label: "Try the task demo", hint: "#try", run: go("try") },
    { label: "Go to contact", hint: "#contact", run: go("contact") },
    { label: "Open GitHub profile", hint: "github.com", run: () => window.open(`https://github.com/${USER}`, "_blank", "noopener") },
    { label: "Copy email address", hint: "clipboard", run: copyEmail },
    { label: "Switch colour theme", hint: "light / dark", run: toggleTheme },
  ];
  let shown = [], sel = 0, lastFocus = null, closeTimer;
  const render = () => {
    const q = input.value.trim().toLowerCase();
    shown = commands.filter((c) => c.label.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.textContent = "";
    if (!shown.length) {
      const e = document.createElement("li");
      e.className = "empty"; e.setAttribute("role", "presentation"); e.textContent = "No matching command";
      list.appendChild(e);
      return;
    }
    shown.forEach((c, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === sel));
      const a = document.createElement("span"); a.textContent = c.label;
      const b = document.createElement("small"); b.textContent = c.hint;
      li.append(a, b);
      li.addEventListener("mousemove", () => { if (sel !== i) { sel = i; render(); } });
      li.addEventListener("click", () => run(c));
      list.appendChild(li);
    });
  };
  const open = () => {
    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    scrim.hidden = false;
    scrim.classList.add("open");
    pal.classList.remove("is-closing");
    input.value = ""; sel = 0; render();
    void pal.offsetWidth;
    pal.classList.add("is-open");
    input.focus();
  };
  const close = () => {
    pal.classList.remove("is-open");
    pal.classList.add("is-closing");
    closeTimer = setTimeout(() => {
      pal.classList.remove("is-closing");
      scrim.classList.remove("open");
      scrim.hidden = true;
    }, reduce ? 0 : cssMs("--modal-close-dur", 150));
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  const run = (c) => { close(); setTimeout(c.run, 60); };
  $("#open-palette").addEventListener("click", open);
  scrim.addEventListener("mousedown", (e) => { if (e.target === scrim) close(); });
  input.addEventListener("input", () => { sel = 0; render(); });
  document.addEventListener("keydown", (e) => {
    const isOpen = scrim.classList.contains("open") && pal.classList.contains("is-open");
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); isOpen ? close() : open(); return; }
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); render(); }
    else if (e.key === "Enter") { e.preventDefault(); if (shown[sel]) run(shown[sel]); }
    else if (e.key === "Tab") { e.preventDefault(); input.focus(); }
  });
})();
