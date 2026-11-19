// Palmetto Trophy Ledger — entry program for make.fun bounty gta6-trophy-guide-02.
// Node 22, standard library only. It hands the guide in: copies this repo's app/ and
// screenshots/ into the output folder (/output in the grader, MAKEFUN_OUTPUT_DIR outside
// it) and writes dossier.json there with buildDossier from the vendored make.fun library.
// vendor/makefun-frontend.ts must stay byte-identical to the kit copy — the scorer rebuilds
// the dossier with its own copy and compares byte for byte.
//
// Caps below mirror the scorer's gate: the text cap shapes the dossier bytes; the rest
// refuse early anything the scorer would refuse anyway (over 4 screenshots or one over
// 256 KiB; over 993 entries or 48 MiB inside app/).
//
// Try it locally:  node serve.ts        (opens the guide at http://localhost:8080)
// Build output:    mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
