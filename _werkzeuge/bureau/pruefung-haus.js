/* pruefung-haus.js · Prüfseite im Rahmen des Hotel Bareiss (09.11.2026; Vorlage: Wellness & Spa, Wild Side, Culinarium, aus dem Vorbild Schäfli): Name des Werkzeugs aus der einen Stelle, «Zum Werkzeug» führt in dieses Werkzeug, nicht in den Stamm. */
(function () {
  var z = document.getElementById('wsp-zurueck'); if (z) z.href = '/_werkzeuge/bureau/';
  var n = window.WO_HAUS && WO_HAUS.namen && WO_HAUS.namen.website;
  /* welt.js des Stamms füllt [data-werkzeug] erst nach dem Laden mit seinem Weltnamen («Le Bureau»): der Name des Hauses wird danach noch einmal gesetzt */
  function setze() { if (n) { document.querySelectorAll('[data-werkzeug]').forEach(function (e) { if (e.textContent !== n) e.textContent = n; }); document.title = 'Prüfung · ' + n + ' · ' + (WO_HAUS.voll || WO_HAUS.name); } }
  setze(); document.addEventListener('DOMContentLoaded', setze); window.addEventListener('load', function () { setze(); setTimeout(setze, 200); });
})();
/* Themenwochen (09.11.2026, Vorlage: Jasswochen des Wellness & Spa, Termine des Culinarium): eigener Teil der Prüfung (Quelle arrangements.json, Speicher,
   Sicherung) und die Lexikon-Einträge der Stichworte aus termine.py und termine-ansicht.js. Das Lexikon des Stamms bleibt unverändert; diese Einträge
   stehen darunter mit eigener Kennung lex-<stichwort> und öffnen sich, wenn «Was tun?» dorthin führt. */
(function () {
  var LEX = [
    { id: 'termine-quelle', titel: 'Die Themenwochen des Hauses sind nicht lesbar', sehen: 'Die Ansicht «Themenwochen» startet nicht, oder hier steht «Themenwochen des Hauses» rot.',
      grund: 'Die Themenwochen kommen aus _werkzeuge/bureau/arrangements.json, gelesen aus den Arrangement-Seiten von bareiss.com. Die Datei fehlt oder wurde von Hand geändert.',
      tun: 'Nichts ist verloren: Entwurf und veröffentlichte Termine liegen im Speicher des Werkzeugs. python3 _werkzeuge/bureau/arrangements_lesen.py im Hausordner legt die Datei neu an, dann diese Seite neu laden.' },
    { id: 'termine-speicher', titel: 'Der Speicher der Themenwochen ist beschädigt', sehen: 'Meldung «SPEICHER · Die Datei der Themenwochen und ihre Sicherung sind beide unlesbar».',
      grund: 'Die Datei _werkzeuge/bureau/_daten/termine.json und ihre Sicherung termine.json.gut sind beide kaputt (zum Beispiel von Hand geändert).',
      tun: 'Die Datei aus einer Sicherung des Rechners zurückholen oder beide Dateien entfernen: dann gilt wieder der ursprüngliche Stand von bareiss.com.' },
    { id: 'termin-datum', titel: 'Diesen Tag gibt es nicht', sehen: 'Meldung «DATUM · Der erste (letzte) Tag fehlt oder diesen Tag gibt es nicht», die Karte zeigt «Den ersten Tag gibt es nicht».',
      grund: 'Tag und Monat passen nicht zusammen, zum Beispiel der 31. November.', tun: 'Tag, Monat und Jahr neu wählen, dann speichern.' },
    { id: 'termin-folge', titel: 'Der letzte Tag liegt vor dem ersten', sehen: 'Meldung «FOLGE · Der letzte Tag liegt nach dem ersten».',
      grund: 'Beim Verschieben wurde nur der erste Tag geändert, der letzte steht noch davor.', tun: 'Den letzten Tag nach dem ersten wählen, dann speichern.' },
    { id: 'termin-lang', titel: 'Der Termin ist zu lang', sehen: 'Meldung «LÄNGE · Ein Termin dauert höchstens 21 Tage».',
      grund: 'Zwischen erstem und letztem Tag liegen mehr als drei Wochen; vermutlich ist ein Monat oder ein Tag verwählt.', tun: 'Den letzten Tag prüfen, dann speichern.' },
    { id: 'termin-doppelt', titel: 'Zwei Termine einer Themenwoche überschneiden sich', sehen: 'Meldung «DOPPELT · Zwei Termine der … überschneiden sich».',
      grund: 'Ein Termin wurde zweimal angelegt oder in die Tage eines anderen derselben Themenwoche verschoben.', tun: 'Bei einem der beiden die Tage ändern, oder ihn mit «Wieder entfernen» herausnehmen.' },
    { id: 'termin-leer', titel: 'Kein Termin mehr in der Liste', sehen: 'Meldung «LEER · Mindestens ein Termin bleibt stehen».',
      grund: 'Ohne Termin stünden die Themenwochen ohne Daten.', tun: '«Neuer Termin» bei einer Themenwoche oder «Frühere Fassungen» füllt die Liste wieder, dann speichern.' },
    { id: 'termin-viele', titel: 'Zu viele Termine', sehen: 'Meldung «THEMENWOCHEN · Höchstens 40 Termine stehen gleichzeitig».',
      grund: 'Die Übersicht bleibt so lesbar.', tun: 'Vergangene Termine «Herausnehmen», dann speichern.' },
    { id: 'termin-falsch', titel: 'Ein Termin ist unvollständig', sehen: 'Meldung «TERMIN · …» mit Kennung, Themenwoche oder Liste.',
      grund: 'Die Anfrage kam nicht aus dem Werkzeug oder wurde unterwegs verändert.', tun: 'Die Seite neu laden und die Eingabe wiederholen. Bleibt es, den Wortlaut der Meldung Ihrem Ansprechpartner schicken.' },
    { id: 'fassung-unbekannt', titel: 'Diese frühere Fassung gibt es nicht mehr', sehen: 'Meldung «FASSUNG · Diese frühere Fassung gibt es nicht».',
      grund: 'Die Liste der früheren Fassungen hält die letzten 60; ältere fallen heraus.', tun: 'Die Seite neu laden und eine Fassung aus der Liste wählen, oder den ursprünglichen Stand.' },
    { id: 'netz', titel: 'Der Server antwortet nicht', sehen: 'Meldung «NETZ · Der Server des Werkzeugs antwortet nicht».',
      grund: 'Die Verbindung ist weg oder der Server des Werkzeugs läuft nicht.', tun: 'Ihre Eingaben bleiben stehen. Verbindung prüfen, dann noch einmal «Speichern». Läuft der Server nicht: python3 _werkzeuge/bureau/serve.py 9742 im Hausordner.' }
  ];
  function el(tag, attrs, kinder) { var e = document.createElement(tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); (kinder || []).forEach(function (k) { e.append(k); }); return e; }
  var lex = document.querySelector('[aria-labelledby="wsp-t4"]');
  if (!lex) return;
  var teil = el('section', { class: 'wsp-teil', 'aria-labelledby': 'wsp-t-termine', 'data-cu-pruefung': 'termine' }, [
    el('div', {}, [el('p', { class: 'kap' }, [el('span', {}, ['Viertens'])]), el('h2', { class: 't-zwischen', id: 'wsp-t-termine' }, ['Themenwochen'])]),
    el('div', { class: 'platte wsp-punkte', id: 'cu-termine-punkte' }, [el('p', { class: 'wsp-wartet' }, ['Wird geprüft …'])])]);
  lex.parentNode.insertBefore(teil, lex);
  var ort = el('div', { class: 'wsp-lexikon', id: 'cu-lexikon' });
  lex.append(el('p', { class: 'kap', style: 'margin-top:28px' }, [el('span', {}, ['Themenwochen'])]), ort);
  LEX.forEach(function (l) {
    ort.append(el('details', { class: 'platte wsp-lex', id: 'lex-' + l.id }, [el('summary', {}, [l.titel]),
      el('dl', {}, [el('dt', { class: 'angabe' }, ['Sehen']), el('dd', {}, [l.sehen]), el('dt', { class: 'angabe' }, ['Grund']), el('dd', {}, [l.grund]), el('dt', { class: 'angabe' }, ['Tun']), el('dd', {}, [l.tun])])]));
  });
  function oeffne() {
    var e = location.hash.indexOf('#lex-') === 0 && document.getElementById(location.hash.slice(1));
    if (e && ort.contains(e)) { e.open = true; setTimeout(function () { e.scrollIntoView({ block: 'start' }); }, 0); }
  }
  window.addEventListener('hashchange', oeffne); oeffne();
  ['/_werkzeuge/bureau/api/termine/pruefung'].forEach(function (adr, nr) { fetch(adr, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
    var p = document.getElementById('cu-termine-punkte'), w = p.querySelector('.wsp-wartet'); if (w) w.remove();
    (d.punkte || []).forEach(function (x) {
      p.append(el('div', { class: 'wsp-punkt', 'data-gut': x.gut ? 'ja' : 'nein', 'data-punkt': nr ? 'gaeste' : 'termine', style: 'order:' + nr }, [
        el('span', { class: 'wsp-punkt__z' }, [x.gut ? '✓' : '–']), el('span', { class: 'wsp-punkt__t' }, [x.titel]),
        el('span', { class: 'wsp-punkt__x' }, [x.text + ' ', !x.gut && x.stichwort ? el('a', { href: '#lex-' + x.stichwort }, ['Was tun?']) : ''])]));
    });
  }).catch(function () { var p = document.getElementById('cu-termine-punkte'); p.textContent = 'Der Server des Werkzeugs antwortet nicht (Stichwort netz).'; }); });
})();
