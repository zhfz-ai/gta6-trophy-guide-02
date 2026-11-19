# Palmetto Trophy Ledger — GTA VI trophy guide & tracker

[![make.fun gta6-trophy-guide-02](https://make.fun/badge/gta6-trophy-guide-02.svg)](https://make.fun/bounty/gta6-trophy-guide-02)
[![rank](https://make.fun/badge/gta6-trophy-guide-02/zhfz-ai/gta6-trophy-guide-02/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-02)
[![reward](https://make.fun/badge/gta6-trophy-guide-02/zhfz-ai/gta6-trophy-guide-02/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-02)

An offline guide and tracker for all 55 GTA VI PlayStation 5 trophies, built for the
[make.fun bounty gta6-trophy-guide-02](https://make.fun/bounty/gta6-trophy-guide-02) ($250 in real rewards).
Join make.fun with my referral: https://make.fun/r/ygzr8d2m

## What it does

- **The full official list** — every trophy with its PlayStation name, description and grade
  (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PSN; no online trophies).
- **A 5-stage platinum roadmap** — story → stranger strands → activities & counts → collectibles → endgame,
  with a progress bar per stage.
- **14 window-risk flags** built from the official descriptions, each with its reason. Only
  *Positive Mental Attitude* is reported as possibly missable (unconfirmed) — the guide says so plainly.
- **Saved counters** for the 17 trophies with verified totals (250 stunts, 42 range golds, 100 WAiNK
  spots, $250,000 laundered…); hitting a target marks the trophy earned. Where no total is verified,
  the guide shows no counter rather than inventing a number.
- **Cited guides** — every trophy's guide is written for this page and names two sources
  (PSNProfiles, Exophase, PowerPyx, GTA Wiki, Press Start, EGamers). Where sources disagree
  (meditation spots: 18 vs 15), the guide says so.
- **Filters & spoiler shield** — by kind (story / missable / collectibles / activities / meta) and grade,
  text search, hide-earned, and a spoiler setting that hides story trophy names until earned.
- **Export / import** your progress as JSON; everything is saved in your browser. The app itself
  loads nothing from the network — source links open only when you follow them.

## Run it

```
node serve.ts
```

Then open http://localhost:8080. No build step, no dependencies — plain static files under `app/`.

## Entry program

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output folder and
writes `dossier.json` with the vendored make.fun library:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

See `JUDGE-SCORECARD.md` for how this design was picked, and `X-POST.md` for the companion post on X.
