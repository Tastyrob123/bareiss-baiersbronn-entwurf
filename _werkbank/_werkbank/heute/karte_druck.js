// Druck des eigenen Satzes einer Karte (sb_karten.py › eigener_satz): node heute/karte_druck.js <html> <pdf>. Chromium headless, eigene Instanz, nichts online.
const path = require('path');
const { chromium } = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.goto('file://' + path.resolve(process.argv[2]), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: process.argv[3], width: '210mm', height: '297mm', printBackground: true, preferCSSPageSize: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
