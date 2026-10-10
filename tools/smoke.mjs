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
const errors = [];

// Nachgebautes Supabase (Auth + PostgREST für die Tabelle maps), damit der Sync ohne Internet testbar ist
const SUPA = 'https://dclqzugjddhvvqepctlr.supabase.co';
const cloudRows = new Map();
async function mockSupabase(ctx) {
  await ctx.route(SUPA + '/**', async route => {
    const req = route.request(), u = new URL(req.url()), json = (status, body) => route.fulfill({ status, contentType:'application/json', body:JSON.stringify(body) });
    if (u.pathname === '/auth/v1/token') {
      const b = req.postDataJSON();
      if (u.searchParams.get('grant_type') === 'password' && b.password !== 'geheim') return json(400, { error_description:'Invalid login credentials' });
      return json(200, { access_token:'t', refresh_token:'r', expires_in:3600, user:{ email:b.email || 'ich@test.de' } });
    }
    if (req.headers().authorization !== 'Bearer t') return json(401, { message:'JWT' });
    const eq = k => (u.searchParams.get(k) || '').replace(/^eq\./, '');
    const pick = r => { const sel = u.searchParams.get('select'); if (!sel) return r; const o = {}; for (const k of sel.split(',')) o[k] = r[k]; return o; };
    const m = req.method();
    if (m === 'GET') return json(200, [...cloudRows.values()].filter(r => !eq('id') || r.id === eq('id')).map(pick));
    if (m === 'POST') { const b = req.postDataJSON(); cloudRows.set(b.id, b); return json(201, [pick(b)]); }
    if (m === 'PATCH') {
      const r = cloudRows.get(eq('id'));
      if (!r || String(r.rev) !== eq('rev')) return json(200, []);
      Object.assign(r, req.postDataJSON()); return json(200, [pick(r)]);
    }
    if (m === 'DELETE') { cloudRows.delete(eq('id')); return route.fulfill({ status:204 }); }
    return json(405, {});
  });
}
async function device(browser) {
  const ctx = await browser.newContext(); await mockSupabase(ctx);
  await ctx.addInitScript(() => localStorage.setItem('brainmap-tour', '1'));   // Kurz-Tutorial würde Klicks abfangen
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(String(e)));
  await page.goto(url); await page.waitForSelector('.node');
  await page.click('#btn-sync'); await page.fill('#cl-mail', 'ich@test.de'); await page.fill('#cl-pass', 'geheim'); await page.click('#cl-login');
  await page.waitForSelector('#cl-logout');
  return page;
}
const addNode = (p, title) => p.evaluate(t => { createNode(500, 300, { title:t }); commit(); }, title);
const titles = p => p.evaluate(() => Object.values(doc.nodes).map(n => n.title));
async function syncTest(browser) {
  const a = await device(browser);
  await a.fill('#cl-name', 'Testbuch'); await a.click('#cl-up');
  await a.waitForFunction(() => sync.link && sync.link.name === 'Testbuch');
  if (cloudRows.size !== 1) return fail('Hochladen hat keine Cloud-Zeile angelegt');
  console.log('ok  Sync: hochgeladen');

  const b = await device(browser);
  await b.click('#cloud [data-open]');
  await b.waitForFunction(() => fileName === 'Testbuch');
  console.log('ok  Sync: zweites Gerät öffnet die Cloud-Datei');

  await addNode(a, 'Vom Laptop');
  await a.waitForFunction(() => sync.link && !sync.link.dirty, null, { timeout:10000 });
  await b.evaluate(() => syncPull());
  await b.waitForFunction(() => Object.values(doc.nodes).some(n => n.title === 'Vom Laptop'), null, { timeout:10000 });
  console.log('ok  Sync: Änderung kommt auf dem anderen Gerät an');

  // Konflikt: beide ändern, a lädt zuerst hoch, b muss fragen
  await addNode(a, 'Von A');
  await a.waitForFunction(() => sync.link && !sync.link.dirty, null, { timeout:10000 });
  await addNode(b, 'Von B');
  await b.waitForFunction(() => document.querySelector('#ask').style.display === 'block', null, { timeout:10000 });
  await b.click('#ask [data-v="1"]');   // Meine behalten
  await b.waitForFunction(() => sync.link && !sync.link.dirty, null, { timeout:10000 });
  const cloud = JSON.parse([...cloudRows.values()][0].data);
  const t = Object.values(cloud.nodes).map(n => n.title);
  if (!t.includes('Von B') || t.includes('Von A')) fail('Konflikt: "Meine behalten" hat nicht die Fassung von B hochgeladen');
  else console.log('ok  Sync: Konflikt wird gefragt, gewählte Fassung gilt');
  const kept = await b.evaluate(() => idb.backups().then(l => l.map(x => x.name)));
  if (!kept.some(n => n.includes('(Cloud'))) fail('Konflikt: verworfene Fassung fehlt in den Sicherungskopien');
  else console.log('ok  Sync: verworfene Fassung in den Sicherungskopien');
  await a.evaluate(() => syncPull());
  await a.waitForFunction(() => Object.values(doc.nodes).some(n => n.title === 'Von B'), null, { timeout:10000 });
  console.log('ok  Sync: erstes Gerät übernimmt die Entscheidung');
  if (!(await titles(a)).includes('Vom Laptop')) fail('Sync: alter Inhalt verloren');
}

const fail = msg => { console.error('FEHLER: ' + msg); process.exitCode = 1; };
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath:process.env.CHROMIUM_PATH } : {});
const ctx = await browser.newContext();
const page = await ctx.newPage();
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

  fakeVersion = null;
  await syncTest(browser);

  if (errors.length) fail('JS-Fehler:\n' + errors.join('\n')); else console.log('ok  keine JS-Fehler');
} catch (err) {
  fail(String(err));
} finally {
  await browser.close();
  server.close();
}
