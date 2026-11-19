# Judge scorecard — gta6-trophy-guide-02 (Vice Ledger)

Brief (kit RULES.txt, "The judge"): offline guide + tracker for the 55 PS5
trophies of GTA VI (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on
PSN; no online trophies). The judge sees one screenshot sheet (cover large,
three small) plus a source outline with a Totals line. JSON contents reach
the judge only through the screenshots. Criteria in order; the first
criterion where two entries differ decides, unless a later one differs by
much more. Scored 0-2 per criterion, in the brief's order.

Criteria:
1. Tracker and its data: every trophy with official name, description and
   grade; saved progress; filters (story, missable, collectibles,
   activities); spoiler setting hiding story trophies until earned;
   export and import.
2. Roadmap and missables: roadmap to the platinum and missable flags built
   from the official descriptions (chapters/missions, collectibles/counts,
   order), shown in the app.
3. Cited guidance: each guide says where its facts come from, in the
   entry's own words. No credit for an uncited specific. A guide repeating
   the description adds nothing.
4. Fast, clear, polished: a glance finds a trophy and its guide; readable
   type/layout; small first load; a coherent look of its own. Rockstar art
   or copied guide text loses.

## Candidates (6)

### A. Vice Ledger — rail roadmap + counted steppers + next-up queue (PICK)
Left rail: 5-stage roadmap with per-stage progress bars, a "Next up" queue
(first unearned trophies in roadmap order) and a missable early-warning
list. Main column: search, kind/grade chips with counts, spoiler toggle,
hide-earned, export/import/reset; wide trophy cards with official
name/description/grade badges, a saved counter stepper for every trophy
whose description or cited PSN target gives a number, and an expandable
guide with missable note and two named sources. Dark teal/coral look.
- C1 2/2: all 55 with name/description/grade, localStorage ticks AND
  counters, kind+grade filters, spoiler hides story names/descriptions,
  export/import carries ticks and counters.
- C2 2/2: 5 stages in roadmap order with live bars; 14 window-risk flags,
  each reason tied to its description's wording (stranger strands,
  partner conditions, VCIA window, choice counter, second attempt,
  meditation spots), ordered as an early-warning list.
- C3 2/2: 55 original guides (what/where/how + missable note), each with
  two named sources; unverified totals (drone locations, areas, gangs,
  garages) are never stated as numbers — the guide points at the cited
  list instead; the 18-vs-15 meditation disagreement is stated plainly.
- C4 2/2: first load is index + css + js only; data is a runtime fetch of
  the app's own file; cover shows progress, roadmap, filters, counters
  and an open cited guide in one screen.

### B. Platinum Road clone — light paper guide pane (REJECT)
Checklist + guide pane + roadmap + spoiler on a light paper look.
- C1 2/2, C2 2/2, C3 1/2 (guides thinner, no counters), C4 1/2.
- Rejected: it mirrors the house strong anchor's shape and look; the
  judge's C4 rewards a coherent look of its own, and A beats it on C1
  (saved counters) before looks are reached.

### C. Starter-plus table — sortable table tracker (REJECT)
The starter table with grade filter, search and longer hints.
- C1 1/2 (no kind filters, no spoiler), C2 0/2 (no roadmap, no
  missables), C3 1/2, C4 1/2. Loses on C1 and C2 outright.

### D. Leonida atlas — map-first collectible tracker (REJECT)
A stylised map with pins for collectibles and activities.
- C1 1/2 (collectibles strong, story/meta thin), C2 1/2, C3 0/2: pin
  locations would be specifics with no source the judge can check, and
  C3 gives them no credit; invented pins also risk the finalist review.
  C4 1/2. Loses on C1/C3.

### E. Card-deck collector — collectible sets as decks (REJECT)
Card-set decks, WAiNK and vehicle collections as the whole app.
- C1 1/2 (only collectibles tracked in depth), C2 1/2, C3 1/2, C4 2/2.
  Pretty but narrow; loses on C1 breadth.

### F. Text-only field guide — long-form chapters, no tracker (REJECT)
Written chapters per trophy group with sources, no checklist state.
- C1 0/2 (no saved progress, no filters, no spoiler), C2 1/2, C3 2/2,
  C4 1/2. Fails criterion 1 outright; C3 strength never gets reached.

## Pick
A (Vice Ledger) wins every head-to-head on criteria 1-2: it is the only
candidate with saved counters beside saved ticks, a roadmap that shows
live stage progress, and missable reasons tied line-by-line to the
official descriptions, while keeping every guide cited and every
unverified number unstated.

## Density count (brief content units)
- 55 trophies x (official name + description + grade + kind + stage +
  guide + 2 sources) = 55 guides, 110 source citations.
- 17 trophies carry a verified numeric target with a saved stepper
  (250 stunts, 42 range golds, 20 races, 100 WAiNK spots, 50 challenges,
  100 vehicles, $250k/$100k counters, 100% and more).
- 5 roadmap stages with live earned/total bars; 14 missable flags with
  reasons; 4 kind filters + 4 grade filters + search + hide-earned +
  spoiler; export/import of ticks and counters.
- 4 screenshots: cover (progress + roadmap + filters + open cited guide),
  counters view, missable early-warning view, spoiler-safe view.

## Gate checklist
- [x] app/data/trophies.json: exactly the 55 official names, every guide
      non-blank, every trophy has sources.
- [x] No http/https loads in app/ (only <a href> source links).
- [x] vendor/makefun-frontend.ts byte-identical to the kit.
- [x] main.ts copies app/ + screenshots/ and writes dossier.json with the
      kit caps (163840 / 4 x 262144 / 993 / 50331648).
- [x] 4 real JPEG screenshots of this app, 1280x800, each <= 256 KiB.
- [x] LICENSE (OSI) and .makefun/owner.json untouched.
- [ ] POST.json placeholder replaced only with a real X post URL.
      (Pending the @vinalezz post — see X-POST.md. No URL fabricated.)

First load (dossier Totals): 3 files, 8,530 bytes gzip-9 (27,123 raw);
whole app 4 files, 77,083 bytes. Dossier deterministic across two runs.
