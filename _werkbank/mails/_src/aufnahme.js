// Mails des Hotel Bareiss (Agent bareiss-werkbank 09.11.2026, Vorlage Zurbriggen-Werkbank): Wappen und Logo als PNG für die Mails (Mailprogramme zeigen kein SVG)
// und der obere Teil jeder Mail als Bild für die Werkbank, doppelte Dichte.
// node mails/_src/aufnahme.js   (Server 9748 läuft; vorher python3 mails/_src/bau.py)  → mails/img/zeichen.png, _werkbank/ansichten/Mails/NN.jpg
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const ROOT = path.join(__dirname, '..', '..'), B = 'http://127.0.0.1:' + (process.env.WB_PORT || 9748) + '/';
const liste = JSON.parse(fs.readFileSync(path.join(__dirname, 'werkbank.json'), 'utf8'));
(async () => {
  const b = await chromium.launch({ headless: true });
  try {
  const z = await b.newPage({ viewport: { width: 400, height: 540 }, deviceScaleFactor: 1 });
  // Das Wappen HB mit drei Kugeln in Hausgold (Kopf der Übersicht) und das ganze Logo in Weiß (Kopf jeder Mail), beide aus den Vektoren des Hauses
  const x = fs.readFileSync(path.join(ROOT, '..', '_werkzeuge/oberflaeche/kleid/bareiss-zeichen.svg'), 'utf8').replace(/fill="currentColor"/, 'fill="#C9B101"');
  await z.setContent('<body style="margin:0;background:transparent"><div id="z" style="width:200px">' + x.replace('<svg ', '<svg style="display:block;width:200px;height:auto" ') + '</div></body>');
  fs.mkdirSync(path.join(ROOT, 'mails/img'), { recursive: true });
  await (await z.$('#z')).screenshot({ path: path.join(ROOT, 'mails/img/zeichen.png'), omitBackground: true });
  const nz = fs.readFileSync(path.join(__dirname, 'logo-weiss.svg'), 'utf8');
  await z.setViewportSize({ width: 900, height: 900 });
  await z.setContent('<body style="margin:0;background:transparent"><div id="w" style="width:300px"><img style="display:block;width:300px;height:auto" src="data:image/svg+xml;base64,' + Buffer.from(nz).toString('base64') + '"></div></body>');
  await z.waitForTimeout(300);
  await (await z.$('#w')).screenshot({ path: path.join(ROOT, 'mails/img/logo.png'), omitBackground: true });
  await z.close();
  const ziel = path.join(ROOT, '_werkbank/ansichten/Mails'); fs.mkdirSync(ziel, { recursive: true });
  for (const [nr, ordner] of liste) {
    const p = await b.newPage({ viewport: { width: 640, height: 900 }, deviceScaleFactor: 2 });
    await p.goto(B + 'mails/' + ordner + '/index.html', { waitUntil: 'load' }); await p.waitForTimeout(1200);
    await p.screenshot({ path: path.join(ziel, nr + '.jpg'), quality: 88, clip: { x: 0, y: 0, width: 640, height: 940 }, fullPage: true });
    console.log('Mail', nr, ordner); await p.close();
  }
  } finally { await b.close(); }
})();
