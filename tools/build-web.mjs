// Baut die Web-App nach dist/: index.html (Brainmap.html mit Versionsnummer, Manifest und Service Worker),
// dazu sw.js, Manifest, Icons und version.json. Läuft lokal (npm run dist) und in der Pages-Action.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import vm from 'node:vm';

const out = 'dist';
let sha = process.env.GITHUB_SHA || '';
if (!sha) try { sha = execSync('git rev-parse HEAD').toString().trim(); } catch (_) { sha = 'lokal'; }
const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
const version = `${sha.slice(0, 7)} · ${stamp} UTC`;

let html = readFileSync('Brainmap.html', 'utf8');
const rep = (alt, neu) => {
  const n = html.split(alt).length - 1;
  if (n !== 1) throw new Error(`"${alt}" kommt ${n}-mal vor, erwartet genau einmal`);
  html = html.replace(alt, () => neu);
};

// Syntax prüfen, bevor etwas veröffentlicht wird
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!scripts.length) throw new Error('kein <script> in Brainmap.html gefunden');
scripts.forEach((s, i) => new vm.Script(s, { filename:`Brainmap.html <script> ${i + 1}` }));

rep("const APP_VERSION = 'dev';", `const APP_VERSION = ${JSON.stringify(version)};`);
rep('<title>Brainmap</title>', '<title>Brainmap</title>\n' +
  '<link rel="manifest" href="manifest.webmanifest">\n' +
  '<meta name="theme-color" content="#2a2a30">\n' +
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n' +
  '<meta name="apple-mobile-web-app-capable" content="yes">\n' +
  '<meta name="mobile-web-app-capable" content="yes">\n' +
  '<meta name="apple-mobile-web-app-title" content="Brainmap">');

rmSync(out, { recursive:true, force:true });
mkdirSync(out, { recursive:true });
writeFileSync(`${out}/index.html`, html);
for (const f of readdirSync('web')) copyFileSync(`web/${f}`, `${out}/${f}`);
writeFileSync(`${out}/version.json`, JSON.stringify({ version }) + '\n');
writeFileSync(`${out}/.nojekyll`, '');
console.log(`dist/ gebaut, Version ${version}`);
