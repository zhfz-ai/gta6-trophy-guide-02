// Palmetto Trophy Ledger — offline tracker for the 55 GTA VI PS5 trophies.
// Loads only its own data/trophies.json; source links open on click and are never fetched.
'use strict';

const STORE_KEY = 'palmetto-trophy-ledger-v1';
const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'meta'];
const GRADES = ['all', 'platinum', 'gold', 'silver', 'bronze'];
const STAGE_INFO = [
  { n: 1, name: 'Stage 1 · Story', detail: 'Chapters and named missions (12 trophies). Unmissable — just play.' },
  { n: 2, name: 'Stage 2 · Stranger strands', detail: 'Andy, Kenton, Billy, Randy, Tyrone, Bret + the 8-strand silver. Finish strands while they are live.' },
  { n: 3, name: 'Stage 3 · Activities & counts', detail: 'Stunts, races, range golds, robberies, money (28 trophies). Counters auto-earn at target.' },
  { n: 4, name: 'Stage 4 · Collectibles', detail: 'Meditation spots, card sets, WAiNK, vehicles, map, garages. Sweep region by region.' },
  { n: 5, name: 'Stage 5 · Endgame', detail: '100% completion, then the platinum pops on its own.' }
];

let trophies = [];
let state = loadState();

function defaultState() {
  return { earned: {}, counts: {}, kind: 'all', grade: 'all', search: '', hideEarned: false, spoiler: false, open: {} };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { /* storage unavailable: run in memory */ }
  return defaultState();
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

// URL presets (used for screenshots and shareable views):
//   ?earned=2,3,7  ?counts=15:180,52:90000  ?kind=missable  ?grade=silver  ?spoiler=1  ?open=28  ?hide=1  ?q=race
function applyUrlPresets() {
  const q = new URLSearchParams(location.search);
  if (q.get('earned')) q.get('earned').split(',').forEach(function (s) { const id = parseInt(s, 10); if (id) state.earned[id] = true; });
  if (q.get('counts')) q.get('counts').split(',').forEach(function (pair) {
    const bits = pair.split(':'); const id = parseInt(bits[0], 10); const n = parseInt(bits[1], 10);
    if (id && !isNaN(n)) state.counts[id] = n;
  });
  if (q.get('kind') && KINDS.includes(q.get('kind'))) state.kind = q.get('kind');
  if (q.get('grade') && GRADES.includes(q.get('grade'))) state.grade = q.get('grade');
  if (q.get('spoiler') === '1') state.spoiler = true;
  if (q.get('hide') === '1') state.hideEarned = true;
  if (q.get('q')) state.search = q.get('q');
  if (q.get('open')) q.get('open').split(',').forEach(function (s) { const id = parseInt(s, 10); if (id) state.open[id] = true; });
}

function isEarned(t) {
  if (state.earned[t.id]) return true;
  if (t.count !== null && (state.counts[t.id] || 0) >= t.count) return true;
  return false;
}
function matchesKind(t) {
  if (state.kind === 'all') return true;
  if (state.kind === 'missable') return t.missable === true;
  return t.kind === state.kind;
}
function visibleTrophies() {
  const needle = state.search.trim().toLowerCase();
  return trophies.filter(function (t) {
    if (!matchesKind(t)) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.hideEarned && isEarned(t)) return false;
    if (needle) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind).toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderStages() {
  const list = document.getElementById('stage-list');
  list.textContent = '';
  STAGE_INFO.forEach(function (info) {
    const inStage = trophies.filter(function (t) { return t.stage === info.n; });
    const done = inStage.filter(isEarned).length;
    const card = el('li', 'stage-card' + (done === inStage.length ? ' done' : ''));
    card.appendChild(el('div', 'stage-name', info.name));
    card.appendChild(el('div', 'stage-detail', info.detail));
    const bar = el('div', 'stage-bar'); const fill = el('div', 'stage-fill');
    fill.style.width = (inStage.length ? Math.round(done * 100 / inStage.length) : 0) + '%';
    bar.appendChild(fill); card.appendChild(bar);
    card.appendChild(el('div', 'stage-count', done + ' / ' + inStage.length + ' earned'));
    list.appendChild(card);
  });
}

function renderScore() {
  const total = trophies.length;
  const done = trophies.filter(isEarned).length;
  document.getElementById('earned-count').textContent = done;
  document.getElementById('score-fill').style.width = (total ? Math.round(done * 100 / total) : 0) + '%';
  const by = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  trophies.forEach(function (t) { by[t.grade][1]++; if (isEarned(t)) by[t.grade][0]++; });
  document.getElementById('grade-line').textContent =
    'Platinum ' + by.platinum[0] + '/' + by.platinum[1] + ' · Gold ' + by.gold[0] + '/' + by.gold[1] +
    ' · Silver ' + by.silver[0] + '/' + by.silver[1] + ' · Bronze ' + by.bronze[0] + '/' + by.bronze[1];
}

function renderChips() {
  const kindBox = document.getElementById('kind-filters');
  kindBox.textContent = '';
  KINDS.forEach(function (k) {
    const b = el('button', 'chip' + (k === 'missable' ? ' warn' : '') + (state.kind === k ? ' active' : ''), k === 'all' ? 'All kinds' : k[0].toUpperCase() + k.slice(1));
    b.type = 'button';
    b.addEventListener('click', function () { state.kind = k; saveState(); renderAll(); });
    kindBox.appendChild(b);
  });
  const gradeBox = document.getElementById('grade-filters');
  gradeBox.textContent = '';
  GRADES.forEach(function (g) {
    const b = el('button', 'chip' + (state.grade === g ? ' active' : ''), g === 'all' ? 'All grades' : g[0].toUpperCase() + g.slice(1));
    b.type = 'button';
    b.addEventListener('click', function () { state.grade = g; saveState(); renderAll(); });
    gradeBox.appendChild(b);
  });
}

function renderCounterCell(t, cell) {
  if (t.count === null) {
    cell.appendChild(el('span', 'no-count', 'no verified total — see guide'));
    return;
  }
  const wrap = el('div', 'counter');
  const minus = el('button', '', '−'); minus.type = 'button'; minus.title = 'One less';
  const input = document.createElement('input');
  input.type = 'number'; input.min = '0'; input.value = state.counts[t.id] || 0;
  input.setAttribute('aria-label', 'Count for ' + t.name);
  const plus = el('button', '', '+'); plus.type = 'button'; plus.title = 'One more';
  const of = el('span', 'of', '/ ' + t.count.toLocaleString('en-US') + ' ' + t.count_label);
  wrap.appendChild(minus); wrap.appendChild(input); wrap.appendChild(plus); wrap.appendChild(of);
  if (isEarned(t)) wrap.appendChild(el('span', 'done-mark', '✓ target hit'));
  function setCount(n) {
    state.counts[t.id] = Math.max(0, n || 0);
    if (state.counts[t.id] >= t.count) state.earned[t.id] = true;
    saveState(); renderAll();
  }
  minus.addEventListener('click', function () { setCount((state.counts[t.id] || 0) - 1); });
  plus.addEventListener('click', function () { setCount((state.counts[t.id] || 0) + 1); });
  input.addEventListener('change', function () { setCount(parseInt(input.value, 10)); });
  cell.appendChild(wrap);
}

function renderRows() {
  const tbody = document.getElementById('rows');
  tbody.textContent = '';
  const vis = visibleTrophies();
  document.getElementById('result-count').textContent = 'Showing ' + vis.length + ' of ' + trophies.length + ' trophies';
  document.getElementById('empty-note').hidden = vis.length !== 0;
  vis.forEach(function (t) {
    const earned = isEarned(t);
    const hideStory = state.spoiler && t.kind === 'story' && !earned;
    const tr = el('tr', earned ? 'earned' : '');
    const checkCell = el('td', 'col-check');
    const box = document.createElement('input');
    box.type = 'checkbox'; box.checked = earned;
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('change', function () { state.earned[t.id] = box.checked; saveState(); renderAll(); });
    checkCell.appendChild(box); tr.appendChild(checkCell);
    tr.appendChild(el('td', 'col-id', String(t.id)));
    const nameCell = el('td', '');
    if (hideStory) {
      nameCell.appendChild(el('div', 'tname hidden-name', 'Hidden story trophy'));
      nameCell.appendChild(el('div', 'tdesc', 'Name and description hidden by the spoiler shield until earned.'));
    } else {
      nameCell.appendChild(el('div', 'tname', t.name));
      nameCell.appendChild(el('div', 'tdesc', t.description));
    }
    if (t.missable) nameCell.appendChild(el('span', 'missable-flag', '⚠ WINDOW RISK'));
    tr.appendChild(nameCell);
    const gradeCell = el('td', '');
    gradeCell.appendChild(el('span', 'badge ' + t.grade, t.grade));
    tr.appendChild(gradeCell);
    tr.appendChild(el('td', 'kind-tag', t.kind + ' · stage ' + t.stage));
    const countCell = el('td', '');
    renderCounterCell(t, countCell);
    tr.appendChild(countCell);
    const guideCell = el('td', '');
    const gb = el('button', 'guide-btn', state.open[t.id] ? 'Hide guide' : 'Read guide');
    gb.type = 'button';
    gb.addEventListener('click', function () { state.open[t.id] = !state.open[t.id]; saveState(); renderRows(); });
    guideCell.appendChild(gb);
    tr.appendChild(guideCell);
    tbody.appendChild(tr);
    if (state.open[t.id]) {
      const gr = el('tr', 'guide-row');
      const td = el('td', 'guide-text');
      td.colSpan = 7;
      td.appendChild(el('p', '', hideStory ? 'Guide hidden by the spoiler shield until this story trophy is earned.' : t.guide));
      if (t.missable && t.missable_reason) td.appendChild(el('div', 'missable-note', t.missable_reason));
      const src = el('p', 'sources-line', 'Sources: ');
      t.sources.forEach(function (s, i) {
        if (i) src.appendChild(document.createTextNode(' · '));
        const a = el('a', '', s.name);
        a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        src.appendChild(a);
      });
      td.appendChild(src);
      gr.appendChild(td);
      tbody.appendChild(gr);
    }
  });
}

function renderAll() {
  renderScore();
  renderStages();
  renderChips();
  renderRows();
  document.getElementById('search').value = state.search;
  document.getElementById('hide-earned').checked = state.hideEarned;
  document.getElementById('spoiler').checked = state.spoiler;
}

function wireToolbar() {
  document.getElementById('search').addEventListener('input', function (e) { state.search = e.target.value; saveState(); renderRows(); renderScore(); });
  document.getElementById('hide-earned').addEventListener('change', function (e) { state.hideEarned = e.target.checked; saveState(); renderAll(); });
  document.getElementById('spoiler').addEventListener('change', function (e) { state.spoiler = e.target.checked; saveState(); renderAll(); });
  document.getElementById('export-btn').addEventListener('click', function () {
    const payload = JSON.stringify({ app: 'palmetto-trophy-ledger', version: 1, earned: state.earned, counts: state.counts }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'palmetto-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById('import-file').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(function (text) {
      try {
        const data = JSON.parse(text);
        if (data && typeof data === 'object') {
          if (data.earned) state.earned = data.earned;
          if (data.counts) state.counts = data.counts;
          saveState(); renderAll();
        }
      } catch (err) { /* bad file: keep current progress */ }
    });
  });
  document.getElementById('reset-btn').addEventListener('click', function () {
    state = defaultState();
    saveState(); renderAll();
  });
}

applyUrlPresets();
fetch('data/trophies.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    trophies = (data.trophies || data).slice().sort(function (a, b) { return a.id - b.id; });
    wireToolbar();
    renderAll();
  })
  .catch(function () {
    document.getElementById('result-count').textContent = 'Could not load data/trophies.json — serve the app/ folder over HTTP (node serve.ts).';
  });
