// Vice Ledger — make.fun entry program (Node 22, standard library only).
// The guide lives in this repo's app/ folder: plain static files opened at
// app/index.html, fully offline, holding the 55-trophy list, the 5-stage
// roadmap, missable early warnings, counted-progress steppers and one
// cited guide per trophy in app/data/trophies.json. This program hands
// the entry in: it copies app/ and screenshots/ to /output and writes
// /output/dossier.json with the vendored make.fun library, so the judge
// reads exactly these files. vendor/makefun-frontend.ts must stay
// byte-identical to the kit's copy — the scorer rebuilds the dossier with
// its own copy and compares bytes. POST.json is not copied: the house
// reads the X post address from the repository at the submitted commit.
//
// Try it locally:  node serve.ts   then open http://localhost:8080
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(join(repoRoot, "screenshots"))) {
  cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });
}

// Caps mirror the scorer's gate: dossier text capped at 160 KiB, at most 4
// screenshots of at most 256 KiB, app/ at most 993 entries and 48 MiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
console.log(`dossier written to ${join(outputDir, "dossier.json")}`);
