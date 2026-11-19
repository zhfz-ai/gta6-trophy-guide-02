# Judge scorecard — gta6-trophy-guide-02 (Palmetto Trophy Ledger)

Judge criteria, in the brief's order (first difference decides):
1. Tracker & data — all 55 official names/descriptions/grades, saved progress, kind filters, spoiler shield, export/import.
2. Roadmap & missables — platinum order + missable flags built from the official descriptions.
3. Cited guidance — every guide in own words with named sources; uncited specifics earn nothing.
4. Fast, clear, polished — glanceable, readable, small first load, own look, no Rockstar assets.

## Candidates considered (scored 0–2 per criterion, in order)

| # | Concept | C1 tracker | C2 roadmap | C3 cited | C4 polish | Verdict |
|---|---------|-----------|------------|----------|-----------|---------|
| A | Plain checklist clone of the starter (names + one-line hints) | 1 | 0 | 0 | 1 | Loses C2/C3 to everything |
| B | Card grid, one card per trophy, guides in modals | 2 | 1 | 2 | 1 | Modals hide guides from screenshots; weaker C4 |
| C | Map-first guide (Leonida regions as the main nav) | 1 | 1 | 1 | 1 | Locations would need sources we cannot verify; C3 risk |
| D | Kanban board by stage, drag between columns | 1 | 2 | 1 | 1 | Fun, but dense data reads badly in a screenshot; C1 weaker |
| E | Printable text guide (long single article, no tracker state) | 0 | 2 | 2 | 1 | No saved progress/counters — fails C1 outright |
| F | **Ledger table: ruled rows, stage roadmap strip, stepper counters, spoiler shield, expandable cited guides** | 2 | 2 | 2 | 2 | **Picked** |
| G | Timeline view (story order only, activities appended) | 1 | 1 | 2 | 1 | Roadmap covers story only; C2 weaker than F |

## Why F wins, pairwise on criteria 1–2

- F vs A: A has no roadmap, no flags, no citations — F wins C2 and C3 decisively, ties C1 basics, wins C4 on density.
- F vs B: both track and cite; F's roadmap strip + stage progress bars are visible in the cover screenshot, B's modals are not — F wins C2 as *shown*, which is what the judge can check.
- F vs C: C would need location claims; the brief gives no credit for uncited specifics, and we refuse to invent totals — F wins C3 and C1.
- F vs D: D's roadmap is strong but counters and filters are cramped; F keeps every control on one screen — F wins C1/C4.
- F vs E: E has no tracker state at all — F wins C1 outright.
- F vs G: G orders by story only; F orders all 55 across 5 stages with counts — F wins C2.

## Density count (brief content units)

- 55/55 trophies with official name + description + grade; 55/55 original guides (~260–550 chars each).
- 14 window-risk flags, each with a reason tied to its official description; 1 reported-possibly-missable (Positive Mental Attitude) called out as unconfirmed.
- 17 verified numeric counters (100%, 250, 9, 42, 20, 8, 18, 3, 100, 50, 3, 100, 5, 5, 250000, 100000, 10); 9 trophies deliberately counter-less where no total is verified.
- 110 source citations (2 per trophy) across 6 named sources.
- Roadmap: 5 stages covering 12 + 7 + 28 + 6 + 2 = 55 trophies.
- Filters: 6 kind chips (all/story/missable/collectibles/activities/meta) + 5 grade chips + search + hide-earned + spoiler shield.

## Gate checklist

- [x] app/ static, offline, loads only data/trophies.json; source links are plain `<a href>`, never fetched.
- [x] No external fonts/images/scripts; no Rockstar logo or artwork.
- [x] trophies.json: 55 items, official names/descriptions/grades exact, non-blank guide on every item.
- [x] vendor/makefun-frontend.ts untouched (byte-identical to kit).
- [x] 4 screenshots, 1280×800 JPEG, each ≤ 256 KiB, real renders of this app.
- [x] main.ts deterministic: two runs → identical dossier sha256.
- [x] Kit check: 0 failed.
- [ ] X post live + POST.json filled (separate short recording, after the post) — not part of this build.
