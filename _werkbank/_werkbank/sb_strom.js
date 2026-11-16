// Aufnahmen der Beigaben für die Objekte der Werkbank (Wegweiser und Fuß «Alles auf einen Blick»), Hotel Bareiss (09.11.2026, Vorlage Zurbriggen/Culinarium).
//   WB_PORT=9068 node _werkbank/sb_strom.js  →  _werkbank/ansichten/Strom/<name>-rechner.jpg (1440 × 900, doppelte Dichte), angebot-handy.jpg
// Nur ansehen, nichts wird gespeichert oder abgeschickt. Seiten, die es noch nicht gibt, werden übersprungen.
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const HIER = __dirname, ROOT = path.join(HIER, '..'), B = 'http://127.0.0.1:' + (process.env.WB_PORT || 9748) + '/';
const ZIEL = path.join(HIER, 'ansichten', 'Strom');
const STUECKE = [['analyse', 'befund/index.html'], ['feed', 'feed/index.html'], ['geprueft', 'werkbank/geprueft/index.html'], ['angebot', 'werkbank/karte.html'],
  // das Markenbuch aus dem Werkzeug des Hauses (Markenbuch, Port 9745, nur angesehen)
  ['markenbuch', '/_werkzeuge/livre/buch.html']];
(async () => {
  fs.mkdirSync(ZIEL, { recursive: true });
  const b = await chromium.launch({ headless: true });
  for (const [name, seite] of STUECKE) {
    const datei = seite.startsWith('file://') ? decodeURIComponent(seite.slice(7)) : path.join(ROOT, seite);
    if (!seite.startsWith('http') && !fs.existsSync(datei)) { console.log('fehlt', seite); continue; }
    for (const [art, vp] of [['rechner', { width: 1440, height: 900 }], ...(name === 'angebot' ? [['handy', { width: 390, height: 844 }]] : [])]) {
      const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, ...(vp.width < 700 ? { isMobile: true, hasTouch: true } : {}) });
      const p = await ctx.newPage();
      await p.goto(/^(file|http)/.test(seite) ? seite : B + seite, { waitUntil: 'load' }); await p.evaluate(() => document.fonts && document.fonts.ready); await p.waitForTimeout(3600);
      await p.screenshot({ path: path.join(ZIEL, `${name}-${art}.jpg`), quality: 88 });
      console.log('aufgenommen', name, art); await ctx.close();
    }
  }
  await b.close();
})();
