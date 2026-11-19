// Vice Ledger — offline tracker for the 55 GTA VI PS5 trophies.
// Loads data/trophies.json (this app's own file), keeps earned ticks and
// counted-progress steppers in localStorage, and renders the 5-stage
// roadmap with live bars, a next-up queue, missable early warnings,
// kind/grade filters, search, spoiler-safe mode, and one cited guide per
// trophy. No network requests: source links open only when followed.

const STORAGE_KEY = "vice-ledger-progress-v1";
const KINDS = ["story", "missable", "collectibles", "activities", "meta"];
const GRADES = ["platinum", "gold", "silver", "bronze"];
const STAGES = [
  { n: 1, title: "Story chapters & missions", text: "Gone Fishing, Chapters 1-4, the named missions (Breakfast Run, The Cartel Heist, Child's Play, Headliners, VCIA Takedown, Operation Savage Glory) and the final mission." },
  { n: 2, title: "Stranger strands", text: "Finish the strands for Andy, Kenton, Billy, Randy and Tyrone plus Bret's hunt — 8 strands total. Do them as they appear; givers can move on." },
  { n: 3, title: "Activities & counts", text: "250 stunts, 42 Shooting Range golds, 20 race wins, 50 challenges, robberies, partner trophies and the money counters." },
  { n: 4, title: "Collectibles & exploration", text: "3 card sets, 100 WAiNK It locations, meditation spots, 100 vehicles, all of Leonida and every garage property." },
  { n: 5, title: "Endgame: 100% & platinum", text: "A Long Road (100% completion, gold) once everything above is done — then Vice Got a Price!, the platinum, pops on its own." },
];

const state = {
  trophies: [],
  earned: new Set(),
  counts: {},
  kind: "all",
  grade: "all",
  query: "",
  spoiler: false,
  hideEarned: false,
  open: new Set(),
};

const el = (id) => document.getElementById(id);

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      state.earned = new Set(data.filter((x) => Number.isInteger(x)));
      return;
    }
    if (Array.isArray(data.earned)) state.earned = new Set(data.earned.filter((x) => Number.isInteger(x)));
    if (data.counts && typeof data.counts === "object") {
      for (const [k, v] of Object.entries(data.counts)) {
        const id = Number(k);
        if (Number.isInteger(id) && Number.isFinite(v)) state.counts[id] = Math.max(0, Math.floor(v));
      }
    }
  } catch { /* corrupted storage: start fresh */ }
}

function saveProgress() {
  const payload = { earned: [...state.earned].sort((a, b) => a - b), counts: state.counts };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function applyUrlPreset() {
  const q = new URLSearchParams(location.search);
  if (q.get("spoiler") === "1") state.spoiler = true;
  const kind = q.get("kind");
  if (kind && (kind === "all" || KINDS.includes(kind))) state.kind = kind;
  const grade = q.get("grade");
  if (grade && (grade === "all" || GRADES.includes(grade))) state.grade = grade;
  const earned = q.get("earned");
  if (earned) {
    for (const part of earned.split(",")) {
      const id = Number(part);
      if (Number.isInteger(id) && id > 0) state.earned.add(id);
    }
  }
  const counts = q.get("counts");
  if (counts) {
    for (const part of counts.split(",")) {
      const [idText, valueText] = part.split(":");
      const id = Number(idText);
      const value = Number(valueText);
      if (Number.isInteger(id) && id > 0 && Number.isFinite(value)) state.counts[id] = Math.max(0, Math.floor(value));
    }
  }
  const open = q.get("open");
  if (open) {
    for (const part of open.split(",")) {
      const id = Number(part);
      if (Number.isInteger(id) && id > 0) state.open.add(id);
    }
  }
  const query = q.get("q");
  if (query) state.query = query.trim().toLowerCase();
  if (q.get("compact") === "1") document.body.classList.add("compact");
}

function countOf(t) {
  return state.counts[t.id] || 0;
}

function isEarned(t) {
  if (state.earned.has(t.id)) return true;
  return t.count !== null && t.count !== undefined && countOf(t) >= t.count;
}

function kindOf(t) {
  if (state.kind === "missable") return t.missable === true;
  return state.kind === "all" || t.kind === state.kind;
}

function visible(t) {
  if (!kindOf(t)) return false;
  if (state.grade !== "all" && t.grade !== state.grade) return false;
  if (state.hideEarned && isEarned(t)) return false;
  if (state.query) {
    const hay = `${t.name} ${t.description}`.toLowerCase();
    if (!hay.includes(state.query)) return false;
  }
  return true;
}

function isHiddenBySpoiler(t) {
  return state.spoiler && t.kind === "story" && !isEarned(t);
}

function formatCount(t, value) {
  const num = value.toLocaleString("en-US");
  if (t.count_label && t.count_label.startsWith("$")) return `$${num}`;
  return num;
}

function renderHeader() {
  const total = state.trophies.length;
  const done = state.trophies.filter(isEarned).length;
  el("tally-count").textContent = `${done} / ${total} earned`;
  el("tally-pct").textContent = total ? `${Math.round((done / total) * 100)}%` : "0%";
  el("tally-fill").style.width = total ? `${(done / total) * 100}%` : "0";
  el("tally-grades").innerHTML = GRADES.map((g) => {
    const all = state.trophies.filter((t) => t.grade === g);
    const got = all.filter(isEarned).length;
    return `<span>${g[0].toUpperCase() + g.slice(1)} <b>${got}/${all.length}</b></span>`;
  }).join("");
}

function renderStages() {
  el("stage-list").innerHTML = STAGES.map((s) => {
    const all = state.trophies.filter((t) => t.stage === s.n);
    const got = all.filter(isEarned).length;
    const pct = all.length ? Math.round((got / all.length) * 100) : 0;
    return `<li class="stage-row"><div class="stage-top"><span class="stage-name">${s.title}</span><span class="stage-n">Stage ${s.n}</span></div><p class="stage-desc">${s.text}</p><div class="stage-bar"><i style="width:${pct}%"></i></div><div class="stage-count">${got} / ${all.length} trophies earned</div></li>`;
  }).join("");
}

function roadmapOrder(t) {
  return t.stage * 1000 + t.id;
}

function renderNext() {
  const next = state.trophies.filter((t) => !isEarned(t)).sort((a, b) => roadmapOrder(a) - roadmapOrder(b)).slice(0, 5);
  el("next-list").innerHTML = next.length
    ? next.map((t) => `<li><span class="nx-stage">Stage ${t.stage}</span><br>${isHiddenBySpoiler(t) ? "Hidden story trophy" : t.name}</li>`).join("")
    : `<li>All 55 earned — platinum complete.</li>`;
}

function renderWarnings() {
  const warned = state.trophies.filter((t) => t.missable && !isEarned(t)).sort((a, b) => roadmapOrder(a) - roadmapOrder(b));
  el("warn-list").innerHTML = warned.length
    ? warned.map((t) => `<li><span class="wn-stage">Stage ${t.stage} &middot; ${t.grade}</span><br>${t.name}</li>`).join("")
    : `<li>No unearned window-risk trophies left.</li>`;
}

function chipRow(containerId, values, current, labelFor, countFor, onPick) {
  const box = el(containerId);
  box.innerHTML = "";
  for (const v of values) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (v === current ? " active" : "");
    b.innerHTML = `${labelFor(v)} <span class="n">${countFor(v)}</span>`;
    b.addEventListener("click", () => onPick(v));
    box.appendChild(b);
  }
}

function renderChips() {
  chipRow("kind-chips", ["all", ...KINDS], state.kind,
    (v) => (v === "all" ? "All kinds" : v[0].toUpperCase() + v.slice(1)),
    (v) => v === "all" ? state.trophies.length : v === "missable" ? state.trophies.filter((t) => t.missable).length : state.trophies.filter((t) => t.kind === v).length,
    (v) => { state.kind = v; render(); });
  chipRow("grade-chips", ["all", ...GRADES], state.grade,
    (v) => (v === "all" ? "All grades" : v[0].toUpperCase() + v.slice(1)),
    (v) => v === "all" ? state.trophies.length : state.trophies.filter((t) => t.grade === v).length,
    (v) => { state.grade = v; render(); });
}

function sourceLine(t) {
  const links = (t.sources || []).map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name}</a>`).join(" &middot; ");
  return `<p class="sources">Sources: ${links}</p>`;
}

function counterHtml(t) {
  if (t.count === null || t.count === undefined) return "";
  const value = countOf(t);
  const pct = t.count ? Math.min(100, Math.round((value / t.count) * 100)) : 0;
  const label = t.count_label || "count";
  return `<div class="counter" role="group" aria-label="Progress counter for ${t.name}">
      <button type="button" data-step="-1" data-id="${t.id}" aria-label="Decrease ${label}">&minus;</button>
      <span class="counter-val"><b>${formatCount(t, value)}</b> / ${formatCount(t, t.count)} ${label}</span>
      <button type="button" data-step="1" data-id="${t.id}" aria-label="Increase ${label}">+</button>
    </div>
    <div class="counter-bar"><i style="width:${pct}%"></i></div>`;
}

function cardHtml(t) {
  const earned = isEarned(t);
  const hidden = isHiddenBySpoiler(t);
  const name = hidden ? "Hidden story trophy" : t.name;
  const desc = hidden ? "Name and description hidden until earned (spoiler-safe mode)." : t.description;
  const open = state.open.has(t.id);
  const badges = [
    `<span class="badge grade-${t.grade}">${t.grade}</span>`,
    `<span class="badge">${t.kind}</span>`,
    `<span class="badge">stage ${t.stage}</span>`,
    t.missable ? `<span class="badge missable">missable</span>` : "",
    t.count !== null && t.count !== undefined ? `<span class="badge target">target: ${formatCount(t, t.count)} ${t.count_label || ""}</span>` : "",
  ].join("");
  const guide = open ? `<div class="guide-body">
      ${t.missable && t.missable_reason ? `<p class="missable-note"><strong>Why it can be missed:</strong> ${t.missable_reason}</p>` : ""}
      <p>${t.guide}</p>
      ${sourceLine(t)}
    </div>` : "";
  return `<article class="card${earned ? " earned" : ""}" id="trophy-${t.id}">
    <div class="card-head">
      <input type="checkbox" data-id="${t.id}" ${earned ? "checked" : ""} aria-label="Mark ${hidden ? "hidden trophy" : t.name} as earned">
      <div class="card-main">
        <p class="card-name${hidden ? " hidden-name" : ""}">${name}</p>
        <p class="card-desc">${desc}</p>
        <div class="badges">${badges}</div>
        ${hidden ? "" : counterHtml(t)}
        ${hidden ? "" : `<button type="button" class="guide-toggle" data-open="${t.id}">${open ? "Hide guide" : "Show guide & sources"}</button>`}
        ${hidden ? "" : guide}
      </div>
    </div>
  </article>`;
}

function renderList() {
  const shown = state.trophies.filter(visible);
  el("cards").innerHTML = shown.map(cardHtml).join("");
  el("empty").hidden = shown.length > 0;
  el("result-line").textContent = `Showing ${shown.length} of ${state.trophies.length} trophies` +
    (state.kind === "missable" ? " — missable only" : "") +
    (state.spoiler ? " — spoiler-safe on" : "");
  for (const box of el("cards").querySelectorAll('input[type="checkbox"]')) {
    box.addEventListener("change", () => {
      const id = Number(box.dataset.id);
      if (box.checked) state.earned.add(id); else state.earned.delete(id);
      saveProgress();
      render();
    });
  }
  for (const btn of el("cards").querySelectorAll("[data-open]")) {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.open);
      if (state.open.has(id)) state.open.delete(id); else state.open.add(id);
      render();
    });
  }
  for (const btn of el("cards").querySelectorAll("[data-step]")) {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const step = Number(btn.dataset.step);
      const trophy = state.trophies.find((t) => t.id === id);
      if (!trophy || trophy.count === null || trophy.count === undefined) return;
      const jump = trophy.count >= 10000 ? 1000 : trophy.count >= 100 ? 10 : 1;
      const next = Math.max(0, Math.min(trophy.count, countOf(trophy) + step * jump));
      state.counts[id] = next;
      if (next >= trophy.count) state.earned.add(id);
      saveProgress();
      render();
    });
  }
}

function render() {
  renderHeader();
  renderStages();
  renderNext();
  renderWarnings();
  renderChips();
  renderList();
}

function exportProgress() {
  const payload = { app: "vice-ledger", version: 1, exported: new Date().toISOString(), earned: [...state.earned].sort((a, b) => a - b), counts: state.counts };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gta6-trophy-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  file.text().then((text) => {
    try {
      const data = JSON.parse(text);
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error("bad file");
      state.earned = new Set(ids.filter((x) => Number.isInteger(x)));
      state.counts = {};
      if (data && !Array.isArray(data) && data.counts && typeof data.counts === "object") {
        for (const [k, v] of Object.entries(data.counts)) {
          const id = Number(k);
          if (Number.isInteger(id) && Number.isFinite(v)) state.counts[id] = Math.max(0, Math.floor(v));
        }
      }
      saveProgress();
      render();
      el("save-note").textContent = `Imported ${state.earned.size} earned trophies.`;
    } catch {
      el("save-note").textContent = "Import failed: not a progress file from this tracker.";
    }
  });
}

function wireControls() {
  el("search").addEventListener("input", (e) => { state.query = e.target.value.trim().toLowerCase(); renderList(); });
  el("spoiler").addEventListener("change", (e) => { state.spoiler = e.target.checked; renderList(); });
  el("hide-earned").addEventListener("change", (e) => { state.hideEarned = e.target.checked; renderList(); });
  el("export").addEventListener("click", exportProgress);
  el("import-btn").addEventListener("click", () => el("import-file").click());
  el("import-file").addEventListener("change", (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
  el("reset").addEventListener("click", () => {
    state.earned.clear();
    state.counts = {};
    saveProgress();
    render();
  });
  el("spoiler").checked = state.spoiler;
  if (state.query) el("search").value = state.query;
}

async function boot() {
  loadProgress();
  applyUrlPreset();
  const res = await fetch("data/trophies.json");
  const data = await res.json();
  state.trophies = Array.isArray(data) ? data : data.trophies;
  wireControls();
  render();
}

boot();
