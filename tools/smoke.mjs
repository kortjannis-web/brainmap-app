// Rauchtest für dist/ (vorher: npm run dist). Prüft im echten Chromium:
// Start ohne JS-Fehler, Versionsnummer, Service Worker, Start offline und automatisches Update.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.webmanifest':'application/manifest+json', '.png':'image/png' };
let fakeVersion = null;   // gesetzt = Server meldet eine neuere Version
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  if (p === 'version.json' && fakeVersion) { res.writeHead(200, { 'content-type':TYPES['.json'] }); res.end(JSON.stringify({ version:fakeVersion })); return; }
  const f = join('dist', p);
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type':TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const url = `http://localhost:${server.address().port}/`;

const fail = msg => { console.error('FEHLER: ' + msg); process.exitCode = 1; };
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath:process.env.CHROMIUM_PATH } : {});
const ctx = await browser.newContext();
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));

try {
  const version = JSON.parse(readFileSync('dist/version.json', 'utf8')).version;
  await page.goto(url);
  await page.waitForFunction(() => navigator.serviceWorker.controller || null, null, { timeout:15000 }).catch(() => {});
  if (!await page.evaluate(() => !!navigator.serviceWorker.controller)) await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout:15000 });
  console.log('ok  Service Worker aktiv');

  const shown = await page.textContent('#app-ver');
  if (!shown.includes(version)) fail(`Version im Hilfe-Fenster "${shown}" statt "${version}"`); else console.log('ok  Version ' + version);
  if (!await page.$('.node')) fail('kein Block auf der Fläche nach dem Start'); else console.log('ok  Fläche mit Block');

  await ctx.setOffline(true);
  await page.reload();
  if (!await page.$('.node')) fail('startet offline nicht'); else console.log('ok  Start offline');
  await ctx.setOffline(false);

  // Neue Version auf dem Server: kurz nach dem Start lädt die App von selbst neu
  await page.reload();
  fakeVersion = 'test-neu';
  const reloaded = page.waitForEvent('framenavigated', { timeout:15000 }).then(() => true, () => false);
  if (!await reloaded) fail('kein automatisches Neuladen bei neuer Version'); else console.log('ok  Auto-Update lädt neu');

  if (errors.length) fail('JS-Fehler:\n' + errors.join('\n')); else console.log('ok  keine JS-Fehler');
} catch (err) {
  fail(String(err));
} finally {
  await browser.close();
  server.close();
}
