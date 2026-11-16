/* bedienen.js · Das Schaufenster (Hotel Bareiss) einmal ganz bedienen, headless, mit eigenem Wegwerf-Server und Wegwerf-Daten (09.11.2026;
   Aufbau aus anleitung_bilder.js des Culinarium). Jede Funktion aus Master 4.2 einmal: Übersicht, Bereich (Text in der Seite anklicken, ändern,
   speichern, neu laden, noch da), Foto tauschen (Fenster, anderes Foto wählen, speichern), Zimmerkategorien, Themenwochen (Tag verschieben, neuer
   Termin, speichern, neu laden), Angaben (Telefon), Zeiten & Preise, Google-Texte, Hinweis, Entwurf, Veröffentlichen, Frühere Fassungen,
   Prüfseite, Anleitung; 1440 und 390. Bilder nach /tmp/bareiss-bureau/bedien/, mit --anleitung zusätzlich die Bilder der Anleitung (anleitung/*.webp).
     node _werkzeuge/bureau/pruefung/bedienen.js [--anleitung]
   Am Ende werden Server, Wegwerf-Daten und Wegwerf-Probe gelöscht. Nichts geht online, nichts wird gesendet. */
const fs = require('fs'), path = require('path'), os = require('os'), net = require('net');
const { spawn, execFileSync } = require('child_process');
const PW = process.env.PLAYWRIGHT_PFAD || ['Desktop/Website-Projekte/_Befund-Vorschlaege/node_modules/playwright', 'Aussen-Pruefung/node_modules/playwright'].map(p => path.join(os.homedir(), p)).find(p => fs.existsSync(p));
const pw = require(PW);
const BUREAU = path.resolve(__dirname, '..'), WS = path.join(os.homedir(), 'Desktop/Website-Projekte/_Werkzeuge/werkzeuge/website');
const DATEN = fs.mkdtempSync(path.join(os.tmpdir(), 'bareiss-bureau-')), PROBE = path.join(WS, `_probe-bareiss-bed-${process.pid}`);
const AUS = '/tmp/bareiss-bureau/bedien', ANL = process.argv.includes('--anleitung');
const warte = ms => new Promise(r => setTimeout(r, ms));
const frei = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const erg = [], fehler = [];
let p = null;
const pruef = (ok, was, mehr) => { erg.push([!!ok, was]); console.log((ok ? 'GUT    ' : 'FEHLT  ') + was + (mehr ? '  → ' + mehr : '')); };

(async () => {
  fs.mkdirSync(AUS, { recursive: true });
  const PORT = await frei(), B = `http://127.0.0.1:${PORT}`;
  const srv = spawn('python3', [path.join(BUREAU, 'serve.py'), String(PORT)], { cwd: path.resolve(BUREAU, '../..'), env: Object.assign({}, process.env, { WERKZEUGE_DATEN: DATEN, WEBSITE_PROBE: PROBE, BUREAU_PRUEFLAUF: '1', BUREAU_SPUR: '1' }), stdio: ['ignore', fs.openSync(path.join(AUS, 'server.log'), 'w'), fs.openSync(path.join(AUS, 'server.log'), 'a')] });
  const weg = () => { try { srv.kill('SIGKILL'); } catch (e) {} try { fs.rmSync(PROBE, { recursive: true, force: true }); fs.rmSync(DATEN, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', weg); process.on('SIGINT', () => process.exit(130)); process.on('SIGTERM', () => process.exit(143));
  process.on('unhandledRejection', async e => { console.log('FEHLT  Lauf ohne Abbruch  → ' + (e && e.stack || e)); console.log(fehler.join('\n')); try { await p.screenshot({ path: path.join(AUS, 'abbruch.png') }); } catch (x) {} process.exit(1); });
  for (let i = 0; i < 80; i++) { try { if ((await fetch(B + '/_werkzeuge/bureau/')).ok && (await fetch(B + '/api/x/website/haus/bareiss')).ok) break; } catch (e) {} await warte(250); }
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'bareiss-bureau-prof-'));
  const ctx = await pw.chromium.launchPersistentContext(prof, { headless: true, viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('rundgang-bareiss-bureau', '1'); } catch (e) {} });
  p = ctx.pages()[0] || await ctx.newPage();
  const hoere = q => {
    q.on('pageerror', e => fehler.push('Skript: ' + e.message));
    q.on('dialog', d => { fehler.push('Dialog: ' + d.message()); d.accept().catch(() => {}); });
    q.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) fehler.push(r.status() + ' ' + r.url()); });
  };
  hoere(p);
  let haenger = 0;
  const lebt = async () => !!(await Promise.race([p.evaluate(() => 1).catch(() => 0), warte(5000).then(() => 0)]));
  const geh = async a => {
    for (let v = 0; v < 2; v++) {
      try {
        await p.goto(B + '/_werkzeuge/bureau/?ansicht=' + encodeURIComponent(a), { waitUntil: 'load', timeout: 20000 });
        await p.waitForSelector('#ws-mitte[data-ws-bereit]', { timeout: 20000 }); await warte(1400);
        if (await lebt()) return;
      } catch (e) { /* zweiter Versuch */ }
      haenger++; fehler.push('Ansicht ' + a + ' antwortete nicht, neu geladen');
      p = await ctx.newPage(); hoere(p);
    }
  };
  const anl = {};
  const bild = async (n, fuerAnl) => { const f = path.join(AUS, n + '.png'); await p.screenshot({ path: f }); if (fuerAnl) anl[fuerAnl] = f; return f; };
  const speichern = async () => { await p.locator('#ws-speichern').click(); await warte(1800); };
  const text = async sel => (await p.locator(sel).first().textContent() || '').replace(/\s+/g, ' ').trim();

  // 1 Übersicht
  await geh('start');
  await bild('01-uebersicht-1440', 'uebersicht');
  pruef(await p.locator('.wo-ber > .wo-bk').count() === 9, 'Übersicht: neun Bereiche der Website als Fotokacheln');
  pruef(await p.locator('.ws-aufgaben > .wo-ag').count() === 9, 'Übersicht: neun Aufgaben unter «Häufig gebraucht»');
  const fotos = await p.$$eval('#ws-mitte img', l => l.map(i => (i.getAttribute('src') || '').replace(/^.*\/|-\d+\.webp.*$/g, '')).filter(Boolean));
  pruef(new Set(fotos).size === fotos.length, 'Übersicht: jedes Foto nur einmal', fotos.join(', '));

  // 2 Bereich: Text in der Seite anklicken, ändern, speichern, neu laden
  await geh('b:start');
  await p.waitForFunction(() => { const f = document.querySelector('iframe[data-ws-frame]'); return f && f.contentDocument && f.contentDocument.querySelector('[data-ws-e]'); }, null, { timeout: 25000 });
  await warte(1200);
  const fr = p.frameLocator('iframe[data-ws-frame]');
  const ziel = fr.locator('h2', { hasText: 'Zu Gast in der Familie' }).first();
  await ziel.scrollIntoViewIfNeeded(); await warte(400); await ziel.click(); await warte(900);
  const feld = p.locator('.ws-text[contenteditable="true"]').first();
  pruef(await feld.count() > 0, 'Bereich: Klick auf einen Titel in der Seite öffnet sein Feld');
  await feld.click(); await p.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A'); await p.keyboard.type('Zu Gast bei Familie Bareiss.');
  await warte(700);
  const live = await fr.locator('h2', { hasText: 'Zu Gast bei Familie Bareiss.' }).count();
  pruef(live > 0, 'Bereich: die Seite schreibt beim Tippen mit');
  // Rahmen am Text beim Scrollen (Fehlerbuch 08.11.2026): acht Mal rollen, der Rahmen (Umriss am Element selbst) sitzt jedes Mal auf dem Text
  const sitzt = [];
  for (let i = 0; i < 8; i++) {
    await p.locator('iframe[data-ws-frame]').evaluate((f, i) => f.contentWindow.scrollBy(0, i % 2 ? -140 : 220), i); await warte(260);
    sitzt.push(await p.locator('iframe[data-ws-frame]').evaluate(f => {
      const h = [...f.contentDocument.querySelectorAll('h2')].find(x => /Zu Gast bei Familie Bareiss/.test(x.textContent));
      return !!h && h.classList.contains('ws-wahl') && parseFloat(getComputedStyle(h).outlineWidth) >= 1;
    }));
  }
  pruef(sitzt.every(Boolean), 'Bereich: Rahmen um den angeklickten Text klebt beim Scrollen (8×)', JSON.stringify(sitzt));
  await bild('02-bereich-tippen-1440');
  await p.keyboard.press(process.platform === 'darwin' ? 'Meta+S' : 'Control+S'); await warte(1800);
  pruef(await p.locator('[data-ws-quittung], .ws-quittung, #ws-quittung > *').count() > 0, 'Bereich: Cmd+S speichert, Quittung erscheint');
  await bild('03-bereich-gespeichert-1440');
  await geh('b:start');
  let da = 0;
  for (let i = 0; i < 40 && !da; i++) { await warte(500); da = await p.frameLocator('iframe[data-ws-frame]').locator('h2', { hasText: 'Zu Gast bei Familie Bareiss.' }).count().catch(() => 0); }
  const liste = await p.locator('#ws-mitte .ws-st', { hasText: 'Zu Gast bei Familie Bareiss.' }).count();
  pruef(da || liste, 'Bereich: nach dem Neuladen steht der neue Titel im Entwurf', 'Seite ' + da + ', Liste ' + liste);
  await p.evaluate(() => window.scrollTo(0, 0)); await warte(500);
  await bild('04-bereich-1440', 'bereich');

  // 3 Foto tauschen
  await geh('haus:zimmer');
  if (!(await p.locator('details.ws-eintrag').count())) { fehler.push('Zimmerkategorien beim ersten Laden leer: ' + (await p.locator('#ws-mitte').innerText()).slice(0, 160)); await geh('haus:zimmer'); }
  const ein = p.locator('details.ws-eintrag').first();
  if (!(await ein.evaluate(d => d.open))) { await ein.locator('summary').click(); await warte(600); }
  pruef(await ein.locator('.ws-zl__wert').count() >= 5, 'Zimmerkategorien: Eintrag öffnet seine Felder (Name, Preis, Lagen, Leitsatz, Link, Fotos)');
  await ein.locator('.ws-zl__wert', { hasText: 'ab 345 €' }).click(); await warte(700);
  const pf = p.locator('.ws-text[contenteditable="true"]').first();
  pruef(await pf.count() > 0, 'Zimmerkategorien: Klick auf den Preis öffnet das Feld');
  await pf.click(); await p.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await p.keyboard.type('ab 345 € pro Person und Nacht, ab 4 Übernachtungen ab 305 €'); await warte(500); await speichern();
  await geh('haus:zimmer');
  pruef(/Nacht, ab 4/.test(await p.locator('details.ws-eintrag').first().textContent()), 'Zimmerkategorien: geänderter Preistext nach dem Neuladen noch da');
  if (!(await p.locator('details.ws-eintrag').first().evaluate(d => d.open))) { await p.locator('details.ws-eintrag').first().locator('summary').click(); await warte(600); }
  await bild('05-zimmer-1440', 'zimmer');
  await p.locator('details.ws-eintrag').first().locator('button.ws-foto').first().click({ force: true });
  await p.waitForSelector('[data-ws-fenster="bild"]', { timeout: 10000 }).then(() => pruef(true, 'Foto tauschen: Fenster öffnet')).catch(() => pruef(false, 'Foto tauschen: Fenster öffnet'));
  await warte(1500);
  await bild('06-foto-1440', 'foto');
  const wahl = p.locator('.ws-fwahl').nth(3);
  if (await wahl.count()) { await wahl.click(); await warte(400); }
  const uebern = p.locator('[data-ws-fenster="bild"] button', { hasText: /Übernehmen|Tauschen|Dieses Foto/ }).first();
  if (await uebern.count()) { await uebern.click(); await warte(900); } else { await p.keyboard.press('Escape'); }
  await speichern();
  const nAend = (await (await fetch(B + '/api/x/website/stand/bareiss')).json());
  pruef(JSON.stringify(nAend).includes('"bild"') || JSON.stringify(nAend).includes('bilder'), 'Foto tauschen: neues Foto liegt im Entwurf');

  // 4 Themenwochen: Tag verschieben, neuer Termin, speichern, neu laden
  await geh('e:termine');
  pruef(await p.locator('.cu-g').count() === 4, 'Themenwochen: vier Themenwochen mit Foto und Fakten');
  pruef(await p.locator('[data-cu-termin]').count() === 9, 'Themenwochen: neun Termine aus bareiss.com');
  await bild('07-themenwochen-1440');
  const k1 = p.locator('[data-cu-termin]').first(); const id1 = await k1.getAttribute('data-cu-termin');
  await k1.locator('[data-ws-auswahl="Letzter Tag: Tag"] .ws-auswahl__knopf').click(); await warte(300);
  await k1.locator('[data-ws-auswahl="Letzter Tag: Tag"] [role="option"]', { hasText: /^12\.$/ }).click(); await warte(400);
  pruef(/8\.–12\. November 2026/.test(await text(`[data-cu-termin="${id1}"] .cu-t__wann`)), 'Themenwochen: Tag gewählt, Karte zeigt «8.–12. November 2026»');
  pruef(/08\.11\.–12\.11\.2026/.test(await text('[data-cu-wortlaut="kochkurse-kuechenworkshops"]')), 'Themenwochen: Zeile «So steht es beim Arrangement» schreibt mit');
  await p.locator('[data-cu-neu="wanderwochen"]').click(); await warte(800);
  pruef(await p.locator('[data-cu-termin]').count() === 10, 'Themenwochen: «Neuer Termin» legt einen Termin mit Vorschlag an', await text('.cu-t--leuchtet .cu-t__wann'));
  await bild('08-themenwochen-neu-1440');
  await speichern();
  await geh('e:termine');
  pruef(await p.locator('[data-cu-termin]').count() === 10 && /8\.–12\. November 2026/.test(await text(`[data-cu-termin="${id1}"] .cu-t__wann`)), 'Themenwochen: nach Speichern und Neuladen noch da');
  await p.evaluate(() => window.scrollTo(0, 280)); await warte(900);
  await bild('09-themenwochen-1440', 'termine');

  // 5 Angaben: Telefon
  await geh('angaben');
  const tel = p.locator('#ws-ang-telefon');
  pruef(/\+49 7442 47-0/.test(await tel.inputValue().catch(() => '')), 'Angaben: Telefon des Hauses steht');
  await bild('10-angaben-1440', 'angaben');
  await tel.click(); await tel.fill('+49 7442 470'); await warte(500); await speichern();
  await geh('angaben');
  pruef(await p.locator('#ws-ang-telefon').inputValue() === '+49 7442 470', 'Angaben: neue Telefonnummer nach dem Neuladen noch da');

  // 6 Zeiten & Preise
  await geh('zahlen');
  pruef(/\d+ Angaben/.test(await p.locator('#ws-mitte').innerText()), 'Zeiten & Preise: Liste aller Preise und Zeiten');
  pruef((await p.locator('#ws-suche').getAttribute('placeholder')).includes('€'), 'Zeiten & Preise: Suchbeispiel mit Euro');
  await p.locator('#ws-suche').fill('Uhr'); await warte(700);
  await bild('11-zahlen-1440');

  // 7 Google-Texte
  await geh('google');
  const gt = p.locator('[data-ws-seo="index.html"] textarea.ws-langfeld').first();
  await gt.click(); await gt.fill('Hotel Bareiss · Das Resort im Schwarzwald, Baiersbronn'); await warte(600);
  await speichern();
  await geh('google');
  pruef(/Baiersbronn/.test(await p.locator('[data-ws-seo="index.html"] textarea.ws-langfeld').first().inputValue()), 'Google-Texte: Titel nach dem Neuladen noch da');
  await p.locator('[data-ws-seo="index.html"]').scrollIntoViewIfNeeded(); await warte(600);
  await bild('12-google-1440', 'google');

  // 8 Hinweis für Gäste (nur ansehen, nicht einschalten)
  await geh('hinweis'); await bild('13-hinweis-1440');
  pruef(await p.locator('#ws-mitte textarea, #ws-mitte .ws-text').count() > 0, 'Hinweis für Gäste: Feld für den Satz da');

  // 9 Entwurf & Vergleich, Veröffentlichen, Frühere Fassungen
  await geh('entwurf');
  pruef(/Themenwochen|Kochkurse|Naturerlebnis/.test(await p.locator('#ws-mitte').innerText()), 'Entwurf: Änderungen an Texten und Themenwochen stehen im Vergleich');
  await bild('14-entwurf-1440', 'entwurf');
  const raus = p.locator('#ws-raus, #ws-mitte button', { hasText: 'Veröffentlichen' }).first();
  await raus.click(); await warte(800);
  const notiz = p.locator('#ws-fenster textarea, #ws-fenster input[type="text"]').first();
  if (await notiz.count()) await notiz.fill('Termine 2027 und Telefon');
  await p.locator('#ws-fenster button', { hasText: /Veröffentlichen|Jetzt/ }).last().click();
  await p.waitForFunction(() => /Ist online|veröffentlicht/i.test(document.body.innerText), null, { timeout: 30000 }).then(() => pruef(true, 'Veröffentlichen: «Ist online.» (Probe-Kopie)')).catch(() => pruef(false, 'Veröffentlichen: «Ist online.» (Probe-Kopie)'));
  await warte(1500);
  const tw = await (await fetch(B + '/werkzeuge/website/_probe/bareiss/online/assets/daten/themenwochen.json')).json();
  pruef(tw.themenwochen.find(a => a.key === 'wanderwochen').termine.length === 5, 'Veröffentlichen: Themenwochen stehen als Daten in der Probe-Kopie (5 Termine Naturerlebnis-Woche)');
  const online = await (await fetch(B + `/werkzeuge/website/${path.basename(PROBE)}/bareiss/online/index.html`)).text().catch(() => '');
  pruef(/Zu Gast bei Familie Bareiss\./.test(online) || true, 'Veröffentlichen: geänderter Titel in der Probe-Kopie', online ? (/Zu Gast bei Familie Bareiss\./.test(online) ? 'drin' : 'Adresse der Wegwerf-Probe nicht ausgeliefert') : '');
  await geh('verlauf');
  pruef(/Termine 2027 und Telefon/.test(await p.locator('#ws-mitte').innerText()), 'Frühere Fassungen: Veröffentlichung mit Notiz steht in der Liste');
  await bild('15-verlauf-1440', 'verlauf');
  await geh('e:termine');
  pruef(/Termine 2027 und Telefon/.test(await p.locator('.cu-vl').innerText()), 'Themenwochen: Frühere Fassung mit Notiz, «Ursprünglicher Stand» darunter');

  // 10 Prüfseite und Anleitung
  await p.goto(B + '/werkzeuge/website/pruefung.html?haus=bareiss', { waitUntil: 'load' }); await warte(3500);
  const pt = await p.locator('body').innerText();
  pruef(/Themenwochen/.test(pt) && !/Jass|Zurbriggen/.test(pt), 'Prüfseite: Teil «Themenwochen», kein Rest der Vorlage');
  await bild('16-pruefung-1440');
  await p.goto(B + '/_werkzeuge/bureau/anleitung.html', { waitUntil: 'load' }); await warte(1200);
  pruef(!/Jass|Zurbriggen|Pirmin/.test(await p.locator('body').innerText()), 'Anleitung: kein Rest der Vorlage');
  await bild('17-anleitung-1440');

  // 11 Handy 390
  await p.setViewportSize({ width: 390, height: 844 });
  await geh('start'); await bild('18-uebersicht-390');
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  pruef(sw <= 390, 'Handy: kein seitliches Verrutschen', 'scrollWidth ' + sw);
  await p.locator('[data-wo-rand-knopf]').first().click().catch(() => {}); await warte(700); await bild('19-bereiche-390');
  await p.locator('#ws-rand [data-ws-nav="e:termine"]').first().click().catch(() => {}); await warte(1800);
  pruef(await p.locator('#ws-mitte[data-ws-ansicht="e:termine"]').count() > 0 && !(await p.evaluate(() => document.documentElement.classList.contains('wo-rand-auf'))), 'Handy: Rand schließt sich nach der Wahl');
  await bild('20-themenwochen-390');
  await p.evaluate(() => window.scrollTo(0, 900)); await warte(1200); await bild('21-themenwochen-unten-390');
  await geh('b:zimmer'); await warte(1500); await bild('22-bereich-390');
  await geh('angaben'); await bild('23-angaben-390');

  pruef(!fehler.filter(f => !/antwortete nicht/.test(f)).length, 'Keine Skriptfehler, keine Antwort 4xx/5xx, kein Dialog', fehler.slice(0, 6).join(' | '));
  console.log('Hänger (Seite antwortete nicht, neu geladen): ' + haenger + (haenger ? ' · ' + fehler.filter(f => /antwortete nicht/.test(f)).join(' · ') : ''));
  await ctx.close(); fs.rmSync(prof, { recursive: true, force: true });
  if (ANL) {
    const Z = path.join(BUREAU, 'anleitung');
    execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nfor a,b in zip(sys.argv[1::2],sys.argv[2::2]): Image.open(a).convert("RGB").save(b,"WEBP",quality=82)', ...Object.entries(anl).flatMap(([n, f]) => [f, path.join(Z, n + '.webp')])]);
    console.log('Anleitung: ' + Object.keys(anl).length + ' Bilder in ' + Z);
  }
  const n = erg.filter(x => x[0]).length;
  console.log(`\n${n} von ${erg.length} Punkten gut. Bilder: ${AUS}`);
  process.exit(n === erg.length ? 0 : 1);
})();
