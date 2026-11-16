/* Besucher · Hotel Bareiss: Zählung auf der Website (Tasty Studios 09.11.2026). Quelle dieser Datei; auf der
   Website läge sie als assets/js/messung.js, auf jeder Seite vor </body> als <script src="assets/js/messung.js?v=…" defer></script>.
   NICHT eingebaut: die Website ändert niemand außer dem Website-Chat, und eingeschaltet wird erst auf Roberts Wort. Hier nur die Quelle.
   Herkunft: messung.js «Besucher» des Stamms (über die Zurbriggen-Werkbank), Ereignisse des Hotel Bareiss an den echten Wegen der Seiten im Projektstamm.

   Je Seite geht eine Zeile an /api/registre (lokal der Server «Besucher», online die Funktion api/registre.py, gleiche Adresse):
       r1 <seitenaufruf> <datei> <sprache> <geraet> <sekunden> <ereignisse|-> <herkunft|->
   einmal beim Öffnen (0 Sekunden), bei jedem gezählten Klick und beim Verlassen (Sekunden, in denen die Seite sichtbar war).
   Ohne Cookies und ohne Kennung im Gerät: «seitenaufruf» ist eine Zufallsfolge, die nur in dieser Variablen lebt und mit der Seite endet.
   Dass die Seiten eines Besuchs zusammenfinden, Land und Ort bestimmt der Server aus der Verbindung (registre.py); die Adresse speichert er nicht.
   «herkunft» ist nur der Name der Website, von der der Gast kam (zum Beispiel www.google.de), nie die ganze Adresse.
   «sprache» ist die Sprache des Browsers (die Website gibt es nur deutsch), sonst «xx».
   Nicht gezählt: automatische Browser (Prüfläufe), Seiten im Rahmen, die Werkzeuge und die Werkbank, Wahlseiten und Entwürfe (wahl.html,
   zimmer-wahl.html, v-*, stil-*) und Geräte mit der Marke «bareiss-nicht-zaehlen» im localStorage (das Einzige, was je im Gerät steht).
   Gebucht wird nicht auf dieser Website, sondern in der Zimmerbuchung des Hauses (booking.bareiss.com): gezählt wird nur, dass der Gast dorthin
   weitergeht, nie ein Inhalt (kein Name, keine E-Mail, keine Daten der Reise).

   Ereignisse (Schlüssel wie in allen Häusern, Bedeutung beim Hotel Bareiss):
     fenster  Leiste «Zimmer buchen» begonnen: erste Wahl in der Buchungsleiste (form[data-buchen]: Anreise, Abreise, Gäste)
     buchung  weiter zur Zimmerbuchung: Leiste abgeschickt («Zimmer buchen») oder ein Link zu booking.bareiss.com («Buchen», «Zimmer buchen»)
     booking  Zimmerkategorie gewählt: Link «Verfügbarkeit prüfen» auf «Zimmer und Suiten» und den Zimmerseiten (booking.bareiss.com)
     tisch    Tisch im Restaurant Bareiss angefragt: Fenster #tisch abgeschickt («Anfrage senden»), gezählt, wenn «Vielen Dank.» erscheint
     anfrage  Fenster «Tisch reservieren» geöffnet ([data-oeffne="tisch"], Link restaurant-bareiss.html#tisch-anfrage im Fuß)
     anruf    Telefon des Hauses (+49 7442 47-0)
     mail     E-Mail ans Haus (mailto:)
     chat     Gutscheine: Link booking.bareiss.com/vouchers im Fuß; die Website hat keinen Gäste-Chat, der Schlüssel bleibt wie in den anderen Häusern
     route    weiter zu den Betrieben im Tal (Links im-tal.html#forellenhof, #morlokhof, #sattelei im Fuß jeder Seite) */
(function () {
  'use strict';
  var n = navigator, d = document, w = window;
  if (w.__registre || !n.sendBeacon || n.webdriver || w.self !== w.top) return;
  try { if (w.localStorage.getItem('bareiss-nicht-zaehlen') === '1') return; } catch (e) { /* privat: zählt normal */ }
  var teile = location.pathname.split('/'), datei = teile.pop() || 'index.html';
  if (/^(_werkzeuge|werkzeuge|werkbank|_werkbank|maison|marke|reception|registre|imprimerie|_qa|_sicherung|_alt|_varianten|wahl)$/.test(teile[1] || '')) return;   /* Werkzeuge und Werkbank zählen nie */
  if (!/^[a-z0-9-]{1,60}\.html$/.test(datei) || /^(v-|stil-)|wahl|varianten|^vorschau|^404/.test(datei)) return;
  w.__registre = 1;
  var SPRACHEN = ' de en fr it nl es pt zh ja ko ar ';
  var sp = String(n.language || 'de').slice(0, 2).toLowerCase();
  if (SPRACHEN.indexOf(' ' + sp + ' ') < 0) sp = 'xx';
  var breit = function (px) { return !!(w.matchMedia && w.matchMedia('(max-width:' + px + 'px)').matches); };
  var geraet = breit(700) ? 'handy' : breit(1060) ? 'tablet' : 'rechner';
  var her = '-';
  try { var r = d.referrer ? new URL(d.referrer).hostname.toLowerCase() : ''; if (r && r !== location.hostname && /^[a-z0-9.-]{3,60}$/.test(r)) her = r; } catch (e) {}
  var HAUS_TEL = /^tel:\+?(49744247-?0|0744247-?0)$/;
  var pv, war, liste, sichtbar, seit, gesendet;
  function neu() {
    pv = (Math.random().toString(36) + '000000').slice(2, 8);
    war = {}; liste = []; sichtbar = 0; gesendet = '';
    seit = d.visibilityState === 'hidden' ? 0 : Date.now();
    sende();
  }
  function sek() { return Math.min(1800, Math.round((sichtbar + (seit ? Date.now() - seit : 0)) / 1000)); }
  function sende() {
    var zeile = 'r1 ' + pv + ' ' + datei + ' ' + sp + ' ' + geraet + ' ' + sek() + ' ' + (liste.length ? liste.join(',') : '-') + ' ' + her;
    if (zeile === gesendet) return;
    gesendet = zeile;
    try { n.sendBeacon('/api/registre', zeile); } catch (e) {}   /* wartet auf keine Antwort */
  }
  function zaehle(was) {
    if (war[was]) return;
    war[was] = 1; liste.push(was);
    sende();
  }
  function weg() { if (seit) { sichtbar += Date.now() - seit; seit = 0; } sende(); }
  neu();
  d.addEventListener('visibilitychange', function () { if (d.visibilityState === 'hidden') weg(); else if (!seit) seit = Date.now(); });
  w.addEventListener('pagehide', weg);
  w.addEventListener('pageshow', function (e) { if (e.persisted) neu(); });   /* zurück aus dem Seitenspeicher des Browsers: neuer Aufruf */

  /* Buchungsleiste «Zimmer buchen» (form[data-buchen] auf jeder Seite): begonnen mit der ersten Wahl (Anreise, Abreise, Gäste), abgeschickt = weiter zur Zimmerbuchung */
  var leiste = function (t) { return t && t.closest && t.closest('form[data-buchen]'); };
  d.addEventListener('submit', function (e) {
    var f = e.target;
    if (leiste(f)) { zaehle('fenster'); zaehle('buchung'); }
    else if (f && f.closest && f.closest('dialog#tisch')) {   /* Tischanfrage: zählt erst, wenn die Seite «Vielen Dank.» zeigt (bareiss.js blendet .danke ein) */
      setTimeout(function () { var dk = d.querySelector('dialog#tisch .danke'); if (dk && !dk.hidden) zaehle('tisch'); }, 0);
    }
  }, true);

  d.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    if (leiste(t) && t.closest('.buchung__f, .auswahl')) { zaehle('fenster'); return; }
    if (t.closest('[data-oeffne="tisch"]')) { zaehle('anfrage'); return; }
    var a = t.closest('a[href]'); if (!a) return;
    var h = (a.getAttribute('href') || '').replace(/\s/g, ''), host = (a.hostname || '').toLowerCase(), pfad = a.pathname || '', text = a.textContent || '';
    if (/^tel:/i.test(h)) { if (HAUS_TEL.test(h)) zaehle('anruf'); }
    else if (/^mailto:/i.test(h)) zaehle('mail');
    else if (host === 'booking.bareiss.com' && /^\/vouchers/.test(pfad)) zaehle('chat');
    else if (host === 'booking.bareiss.com') zaehle(/Verfügbarkeit/i.test(text) ? 'booking' : 'buchung');
    else if (/(^|\/)restaurant-bareiss\.html$/.test(pfad) && a.hash === '#tisch-anfrage') zaehle('anfrage');
    else if (/(^|\/)im-tal\.html$/.test(pfad) && /^#(forellenhof|morlokhof|sattelei)$/.test(a.hash)) zaehle('route');
  }, true);
})();
