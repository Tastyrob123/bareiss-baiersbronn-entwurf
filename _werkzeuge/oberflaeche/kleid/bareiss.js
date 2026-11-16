/* kleid/bareiss.js · Hauswerte für oberflaeche.js (Hotel Bareiss, Baiersbronn-Mitteltal; Werkbank-Chat 09.11.2026, Stamm: Kleid des Stamms).
   Im <head> VOR allen Stilen laden (ohne defer). Rahmen «Die Bühne»: Kopf Tanne wie die Wände des Restaurants Bareiss (#1f2621), Raum hell wie das Tischtuch (#f5f2ea).
   Liegt unter _werkzeuge/oberflaeche/ und wird von den Werkzeug-Servern unter /assets/oberflaeche/ ausgeliefert.
   Fotos und Schriften kommen aus der Website (/assets/img/<schlüssel>-<640|1200|…>.webp laut assets/img/bilder.json, /assets/fonts/), Zeichen: das Wappen HB mit drei Kugeln. */
window.WO_HAUS = { kurz: 'bareiss', name: 'Bareiss', voll: 'Hotel Bareiss', ort: 'Baiersbronn-Mitteltal', welt: 'hotel', rahmen: 'buehne', anrede: 'Sie',   /* Sie-Ansprache wie die Website */
  /* Außenfoto des Startbilds: das Haus am Naturschwimmteich bei Tag (assets/img/bilder.json › teich-tag; CHARAKTER.md 5 «Stärkstes Bild»).
     Jedes Foto der Website hat die Stufen 640 und 1200 (bilder.json › b); oberflaeche.js baut daraus srcset, nie eine Stufe über der genannten. */
  foto: '/assets/img/teich-tag-1200.webp', fotoKlein: '/assets/img/teich-tag-640.webp', fotoFarbe: '#1f2621',
  fotoStufen: [640, 1200], fotoAlt: 'Das Hotel Bareiss am Naturschwimmteich, dahinter das Tal',
  /* Je Werkzeug ein eigenes Foto im Startbild, nur aus assets/img/bilder.json */
  fotoJe: { website: ['teich-tag', 'Das Hotel Bareiss am Naturschwimmteich, dahinter das Tal'], karten: ['r-tisch', 'Ein gedeckter Tisch im Restaurant Bareiss'],
    gaeste: ['herz-tuer', 'Das Herz «Herzlich willkommen» an der Zimmertür'], marke: ['r-saal', 'Der Saal des Restaurants Bareiss mit den Rautenfenstern'],
    besuche: ['garten-licht', 'Der Garten des Hauses im Morgenlicht'], druck: ['s-kaminstube', 'Die Kaminstube, eine Blume auf dem Tisch'] },
  /* Zeichen: das Wappen HB mit drei Kugeln aus dem Logo des Hauses (assets/zeichen/wappen.svg, unverändert) */
  zeichen: '/assets/oberflaeche/kleid/bareiss-zeichen.svg', zeichenMass: 0.782, wortmarke: '/assets/oberflaeche/kleid/bareiss-marke.svg#wm', wortmarkeMass: 0.782,
  /* Namen der sieben Werkzeuge: die EINE Stelle (gleicher Satz wie in den anderen Häusern desselben Stamms); Dateien, Schlüssel und Adressen bleiben. */
  namen: { zentrale: 'Kontrollpanel', website: 'Website bearbeiten', karten: 'Karten & Preislisten', gaeste: 'Anfragen & Chat', marke: 'Markenbuch', besuche: 'Besucher', druck: 'Drucksachen & Feed' },
  saetze: { zentrale: 'Hier beginnt alles: ein Blick auf alle Werkzeuge und ihren Stand.',
    website: 'Die Website selbst pflegen: Texte, Fotos, Zimmer, Arrangements.',
    karten: 'Die Menüs des Restaurants Bareiss und der Stuben pflegen, daraus entstehen Karte und PDF.',
    gaeste: 'Anfragen der Gäste zu Zimmern, Restaurant, Wellness und Familie, mit Antwortentwurf.',
    marke: 'Wappen, Fotos, Farben und Schriften des Hauses an einem Ort.',
    besuche: 'Wer die Website besucht: woher, wann, welche Zimmer, wer buchen geht.',
    druck: 'Aushänge, Karten und Beiträge in der Sprache des Hauses entwerfen.' },
  wege: { zentrale: '/_werkzeuge/maison/', website: '/_werkzeuge/bureau/', karten: '/_werkzeuge/carte/', gaeste: '/_werkzeuge/reception/', marke: '/_werkzeuge/livre/', besuche: '/_werkzeuge/registre/', druck: '/_werkzeuge/imprimerie/' },
  /* Prüfserver je Werkzeug (Ports 9741–9749); Wege zwischen Werkzeugen immer 127.0.0.1, nie localhost (Fehlerbuch 10a) */
  ports: { zentrale: 9741, website: 9742, karten: 9743, gaeste: 9744, marke: 9745, besuche: 9746, druck: 9747, werkbank: 9748, website_lokal: 9749 } };
/* Lokal (Prüfserver je Werkzeug) zeigen die Wege zu den ANDEREN Werkzeugen auf deren eigenen Server unter 127.0.0.1, nie auf den eigenen Port
   (Fund im Stamm 28.10.2026: der Knopf zur Zentrale öffnete /_werkzeuge/maison/ auf dem eigenen Port ohne Stand-Wege; Fehlerbuch 10a). Online bleiben sie relativ.
   Wer selbst schon absolute Wege setzt: nur Wege umschreiben, die noch mit «/» beginnen (WO_HAUS.wegeLokal = true zeigt, dass es hier geschah). */
(function () {
  if (!/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) return;
  Object.keys(WO_HAUS.wege).forEach(function (k) {
    var p = WO_HAUS.ports[k], w = WO_HAUS.wege[k];
    if (p && String(p) !== location.port && w.charAt(0) === '/') WO_HAUS.wege[k] = 'http://127.0.0.1:' + p + w;
  });
  WO_HAUS.wegeLokal = true;
})();
document.documentElement.setAttribute('data-wo-haus', WO_HAUS.kurz);
document.documentElement.setAttribute('data-wo-rahmen', WO_HAUS.rahmen);
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
/* Bewegung der Werkzeuge (29.10.2026): bewegung.js neben oberflaeche.js, async und mit wenig Vorrang nachgeladen, damit es nie vor dem ersten Knopf steht */
(function () {
  var me = document.currentScript, s = document.createElement('script');
  s.src = (me && me.src ? new URL('../bewegung.js', me.src).href : '/assets/oberflaeche/bewegung.js') + '?v=4';   /* Fassung hochzählen, wenn bewegung.js sich ändert */
  s.async = true; s.setAttribute('fetchpriority', 'low'); document.head.appendChild(s);
})();
/* Titel fliegen zeilenweise hoch (Kriterium 37, 30.10.2026). WO_ZEILEN(el) setzt jedes Wort eines Titels in <span class="wo-w"> und schreibt die Zeile als --z daran;
   die Wörter einer Zeile steigen zusammen, Zeile für Zeile gestaffelt. Ändert sich dabei der Umbruch (Silbentrennung, sehr lange Wörter), bleibt der Titel unberührt.
   Hier im Kleid (ohne defer), damit der Titel des Startbilds schon vor dem ersten Bild geteilt ist; bewegung.js nutzt dieselbe Funktion für die Zwischentitel. */
window.WO_ZEILEN = function (el) {
  if (!el || el.hasAttribute('data-wo-zl')) return !!(el && el.classList.contains('wo-zl'));
  var h0 = el.offsetHeight; if (!h0) return false;   /* verborgen: später, wenn er zu sehen ist */
  el.setAttribute('data-wo-zl', '');
  var w0 = Math.max(el.scrollWidth, el.clientWidth), roh = el.innerHTML, tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), t, ts = [];
  while ((t = tw.nextNode())) if (/\S/.test(t.data) && !t.parentNode.closest('svg')) ts.push(t);
  if (!ts.length) return false;
  ts.forEach(function (t) {
    var f = document.createDocumentFragment();
    t.data.split(/(\s+)/).forEach(function (s) {
      if (!s) return;
      if (/^\s+$/.test(s)) { f.appendChild(document.createTextNode(s)); return; }
      var w = document.createElement('span'); w.className = 'wo-w'; w.textContent = s; f.appendChild(w);
    });
    t.parentNode.replaceChild(f, t);
  });
  if (el.offsetHeight !== h0 || el.scrollWidth > w0 + 1) { el.innerHTML = roh; return false; }
  var z = -1, oben = -1e9, halb = parseFloat(getComputedStyle(el).fontSize) * 0.5;
  el.querySelectorAll('.wo-w').forEach(function (w) { var y = w.getBoundingClientRect().top; if (y > oben + halb) { z++; oben = y; } if (z) w.style.setProperty('--z', z); });
  el.classList.add('wo-zl');
  return true;
};
/* Der Titel des Startbilds: geteilt, sobald er im Dokument steht (vor dem ersten Bild, der Auftritt beginnt erst nach 0,18 s) */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('MutationObserver' in window)) return;
  var plan = 0;
  function teile() {
    plan = 0;
    document.querySelectorAll('.wo-sb__h:not([data-wo-zl])').forEach(function (h) {
      if (document.documentElement.classList.contains('still')) return;
      var a = h.getAnimations ? h.getAnimations() : [];
      if (a.some(function (x) { return (x.currentTime || 0) > 120; })) { h.setAttribute('data-wo-zl', ''); return; }   /* läuft schon: bleibt ein Block, nie zurückspringen */
      WO_ZEILEN(h);
    });
  }
  new MutationObserver(function () { if (!plan && document.querySelector('.wo-sb__h:not([data-wo-zl])')) { plan = 1; Promise.resolve().then(teile); } })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
