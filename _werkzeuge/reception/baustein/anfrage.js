/* Anschluss der Anfragen der Website an das Gästebuch · Hotel Bareiss, Baiersbronn-Mitteltal (09.11.2026, Master Werkzeug-Bau E12/E24/E33,
   Muster: Baustein der Vorlage). Auf der Website gibt es zwei Wege, dem Haus zu schreiben:
     1. das Fenster «Ein Tisch im Restaurant Bareiss» (dialog#tisch, Knöpfe «Tisch reservieren» / «Tisch anfragen»): es zeigt heute nur «Vielen Dank»,
        geschickt wird nichts. Mit dem Baustein geht die Anfrage beim Abschicken in den Eingang des Gästebuchs; «Vielen Dank» erscheint erst nach der Annahme (E33).
     2. die Mail-Verweise «info@bareiss.com» im Fuß und auf der Anreise-Seite: sie öffnen das Mailprogramm. Mit dem Baustein öffnen sie ein ruhiges
        Anfrage-Blatt am rechten Rand (E24): Anreise, Abreise (im Beauty & Spa Wunschtag und Uhrzeit), Gäste, Name, E-Mail oder Telefon, Nachricht.
   Die Art der Anfrage kommt aus der Seite (Zimmer, Tisch, Beauty & Spa, Familie, sonst Nachricht). Geht etwas schief, bleibt alles Eingegebene stehen,
   und das Blatt nennt Telefon und E-Mail des Hauses. Die Skripte der Website bleiben unverändert; ohne den Baustein bleibt die Website, wie sie ist.
   Einbinden (Website-Chat, nicht von Hand): <script src="assets/js/anfrage.js?v={V}" defer></script> am Ende jeder Seite.
   Ziel: /_werkzeuge/reception/api/formular (anders mit <script … data-api="/_werkzeuge/reception/api/formular"> oder window.WS_ANFRAGE_API). */
(function () {
  'use strict';
  var D = document, skript = D.currentScript;
  var API = window.WS_ANFRAGE_API || (skript && skript.getAttribute('data-api')) || '/_werkzeuge/reception/api/formular';
  var WEGE = 'Telefon +49 7442 47-0 oder info@bareiss.com';
  var MAIL = /^mailto:info@bareiss\.com/i;
  var seiteName = function () { var t = (D.title || '').split(/ · | \| | — /)[0].trim(); return /^Hotel Bareiss$/.test(t) ? 'Startseite' : t; };
  /* Art der Anfrage aus der Seite: Tisch auf den Seiten der Restaurants, Beauty & Spa bei Wellness, Familie, Zimmer auf den Zimmerseiten, sonst Nachricht */
  function art() {
    var p = location.pathname;
    if (/restaurant-bareiss\.html|kulinarik\.html/.test(p)) return { art: 'tisch', formular: 'tisch' };
    if (/wellness\.html/.test(p)) return { art: 'spa', formular: 'spa' };
    if (/familie\.html/.test(p)) return { art: 'familie', formular: 'familie' };
    if (/zimmer[\w-]*\.html/.test(p)) return { art: 'zimmer', formular: 'zimmer' };
    return { art: 'nachricht', formular: 'allgemein' };
  }
  function senden(daten) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (r) { if (!r.ok) throw new Error(String((r.j && r.j.fehler) || '').replace(/^[A-ZÄÖÜ-]+ · /, '') || 'Ihre Anfrage kam nicht an.'); return r.j; });
  }
  function grund(err) { return (err && err.message && !/fetch|network|load/i.test(err.message) ? err.message : 'Ihre Anfrage kam nicht an.') + ' Bitte gleich noch einmal versuchen, oder direkt: ' + WEGE + '.'; }
  var STIL = '.za-h{position:fixed;inset:0;z-index:90;display:flex;justify-content:flex-end;background:rgba(21,26,22,.38)}' +
    '.za-b{width:min(440px,100%);height:100%;overflow:auto;padding:34px 30px 40px;box-sizing:border-box;background:#f5f2ea;color:#2f2a27;font:16px/1.55 "Sans",system-ui,sans-serif;box-shadow:inset 1px 0 0 rgba(201,177,1,.6),-30px 0 60px -30px rgba(21,26,22,.6)}' +
    '.za-b h2{font:400 30px/1.1 "Serif",Georgia,serif;margin:8px 0 18px;color:#1f2621}.za-b small{font:13px "Sans",system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#968401}' +
    '.za-b label{display:block;margin:0 0 12px}.za-b label span{display:block;font:13px "Sans",system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6b625d;margin-bottom:4px}' +
    '.za-b input,.za-b textarea{width:100%;box-sizing:border-box;padding:11px 14px;border:0;border-radius:14px;background:#faf8f4;box-shadow:inset 0 0 0 1px rgba(31,38,33,.16);font:inherit;color:inherit}' +
    '.za-z{display:grid;grid-template-columns:1fr 1fr;gap:12px}.za-k{display:flex;gap:12px;align-items:center;margin-top:18px}' +
    '.za-k button{border:0;border-radius:14px;padding:13px 22px;font:13px "Sans",system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;cursor:pointer}' +
    '.za-los{background:#1f2621;color:#f5f2ea;box-shadow:inset 0 0 0 1px #c9b101}.za-zu{background:none;color:#6b625d;box-shadow:inset 0 0 0 1px rgba(31,38,33,.2)}' +
    '.za-m{margin-top:16px;padding:12px 14px;border-radius:14px;background:#ece6d8}.za-f{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}';
  function feld(n, t, typ, mehr) { return '<label><span>' + t + '</span>' + (typ === 'lang' ? '<textarea name="' + n + '" rows="4"' + (mehr || '') + '></textarea>' : '<input name="' + n + '" type="' + typ + '"' + (mehr || '') + '>') + '</label>'; }
  function blatt() {
    var x = art(), spa = x.art === 'spa', tisch = x.art === 'tisch';
    var h = D.createElement('div'); h.className = 'za-h';
    h.innerHTML = '<style>' + STIL + '</style><form class="za-b" novalidate><small>Anfrage</small><h2>' +
      (spa ? 'Ihre Zeit im Beauty & Spa.' : tisch ? 'Ihr Tisch bei uns.' : x.art === 'familie' ? 'Ihre Familienferien.' : 'Ihre Anfrage an das Haus.') + '</h2>' +
      '<div class="za-z">' + feld('an', spa || tisch ? 'Wunschtag' : 'Anreise', 'date') + feld('ab', spa || tisch ? 'Uhrzeit' : 'Abreise', spa || tisch ? 'time' : 'date') + '</div>' +
      feld('personen', 'Gäste', 'number', ' min="1" max="20" value="2"') + feld('name', 'Name', 'text', ' autocomplete="name" required') +
      feld('kontakt', 'E-Mail oder Telefon', 'text', ' autocomplete="email" required') + feld('nachricht', 'Ihre Nachricht', 'lang') +
      '<input class="za-f" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="za-k"><button class="za-los" type="submit">Anfrage senden</button><button class="za-zu" type="button">Schließen</button></div><p class="za-m" hidden></p></form>';
    var f = h.querySelector('form'), m = h.querySelector('.za-m'), w = function (n) { var e = f.querySelector('[name="' + n + '"]'); return e ? String(e.value || '').trim() : ''; };
    var zu = function () { h.remove(); };
    h.querySelector('.za-zu').onclick = zu; h.onclick = function (e) { if (e.target === h) zu(); };
    f.onsubmit = function (e) {
      e.preventDefault();
      if (!w('name') || !w('kontakt')) { m.hidden = false; m.textContent = 'Bitte Name und E-Mail oder Telefon angeben, damit das Haus antworten kann.'; return; }
      var kurz = spa || tisch, zeilen = [];
      zeilen.push((kurz ? 'Wunschtag: ' : 'Anreise: ') + (w('an') || '-'));
      zeilen.push((kurz ? 'Uhrzeit: ' : 'Abreise: ') + (w('ab') || '-'));
      zeilen.push('Gäste: ' + (w('personen') || '-'));
      if (w('nachricht')) zeilen.push('Ihre Nachricht: ' + w('nachricht'));
      var k = f.querySelector('.za-los'); k.disabled = true;
      senden({ art: x.art, formular: x.formular, name: w('name'), kontakt: w('kontakt'), datum: w('an') + (w('ab') && !kurz ? ' bis ' + w('ab') : ''), uhrzeit: kurz ? w('ab') : '',
        personen: w('personen'), allergene: [], anliegen: w('nachricht').slice(0, 300), nachricht: zeilen.join('\n'),
        seite: location.pathname + location.hash, seite_name: seiteName(), sprache: (D.documentElement.lang || 'de').slice(0, 2), website: w('website') })
        .then(function () {
          f.innerHTML = '<small>Anfrage</small><h2>Herzlichen Dank.</h2><p>Ihre Anfrage liegt bei unserem Reservierungsteam. Wir melden uns persönlich bei Ihnen.</p><div class="za-k"><button class="za-zu" type="button">Schließen</button></div>';
          f.querySelector('.za-zu').onclick = zu;
        })
        .catch(function (err) { m.hidden = false; m.textContent = grund(err); k.disabled = false; });
    };
    D.body.appendChild(h); f.querySelector('input').focus();
  }
  /* 1 Fenster «Ein Tisch im Restaurant Bareiss»: Abschicken im Fang-Durchlauf abfangen, «Vielen Dank» erst nach der Annahme */
  D.addEventListener('submit', function (e) {
    var f = e.target, d = f && f.closest ? f.closest('dialog#tisch') : null;
    if (!d) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var w = function (n) { var x = f.querySelector('[name="' + n + '"]'); return x ? String(x.value || '').trim() : ''; };
    var wert = function (k) { var x = f.querySelector('[data-feld="' + k + '"] .wert'); return x ? x.textContent.trim() : ''; };
    var tag = wert('an'), gaeste = wert('gaeste'), p = f.querySelector('.za-m');
    if (!p) { p = D.createElement('p'); p.className = 'za-m'; p.style.cssText = 'margin:14px 0 0;padding:12px 14px;border-radius:14px;background:#ece6d8;color:#2f2a27'; f.appendChild(p); }
    p.hidden = true;
    if (!w('name') || !w('kontakt')) { p.hidden = false; p.textContent = 'Bitte Name und Telefon oder E-Mail angeben, damit das Restaurant antworten kann.'; return; }
    var k = f.querySelector('[type="submit"]'); if (k) k.disabled = true;
    var zeilen = ['Restaurant: 3-Sterne-Restaurant Bareiss', 'Datum: ' + (tag && !/wählen/.test(tag) ? tag : '-'), 'Gäste: ' + (gaeste || '-')];
    if (w('wunsch')) zeilen.push('Ihr Wunsch: ' + w('wunsch'));
    var pers = parseInt(gaeste, 10);
    senden({ art: 'tisch', formular: 'tisch', name: w('name'), kontakt: w('kontakt'), datum: tag && !/wählen/.test(tag) ? tag : '', personen: isNaN(pers) ? '' : pers,
      allergene: [], anliegen: ('Ein Tisch im Restaurant Bareiss. ' + w('wunsch')).trim().slice(0, 300), nachricht: zeilen.join('\n'),
      seite: location.pathname + '#tisch', seite_name: seiteName(), sprache: (D.documentElement.lang || 'de').slice(0, 2), website: '' })
      .then(function () { f.hidden = true; var dk = d.querySelector('.danke'); if (dk) dk.hidden = false; })
      .catch(function (err) { p.hidden = false; p.textContent = grund(err); if (k) k.disabled = false; });
  }, true);
  /* 2 Mail-Verweise an das Haus öffnen das Anfrage-Blatt statt des Mailprogramms */
  D.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !MAIL.test(a.getAttribute('href') || '')) return;
    e.preventDefault(); e.stopImmediatePropagation(); blatt();
  }, true);
})();
