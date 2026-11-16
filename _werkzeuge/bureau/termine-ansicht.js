/* termine-ansicht.js · Das Schaufenster (Hotel Bareiss, 09.11.2026; Vorlage: die Ansicht «Jasswochen» des Wellness & Spa vom 08.11.2026, davor «Termine»
   des Culinarium, 28.10.2026, und «DJ-Abende» von Wild Side, 31.10.2026): Ansicht «Themenwochen» im Schreibtisch des Stamms (window.WS_EIGEN, website.js).
   Die Arrangements mit festen Terminen (Naturerlebnis-Woche, Jubilarwochen, Kochkurse, Musewoche) sind Daten, kein Text: der Server liest sie
   (termine.py, Ursprung arrangements.json aus bareiss.com), hier werden ihre Termine gepflegt. Eingaben warten gelb und zählen in der Leiste mit;
   «Speichern» der Leiste legt sie in den Entwurf, «Veröffentlichen» bringt sie (mit den Änderungen an Texten und Fotos) in die Probe-Kopie
   (assets/daten/themenwochen.json). Frühere Fassungen und der ursprüngliche Stand lassen sich zurückholen. Vor website.js laden.
   Kein fester Farbwert: alles aus dem Kleid (--wo-*). */
(function () {
  'use strict';
  var API = '/_werkzeuge/bureau/api/termine';
  var TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var LAENGSTENS = 21;
  var L = null, liste = [], H = null;

  function kopie(x) { return JSON.parse(JSON.stringify(x)); }
  function basis() { return L ? (L.entwurf || L.stand) : []; }
  function gleich(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function nach(id, l) { return (l || []).find(function (t) { return t.id === id; }); }
  function thema(key) { return ((L && L.themen) || []).find(function (a) { return a.key === key; }) || { key: key, name: key }; }
  function datum(d) { var p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function gibt(d) { return !!d && /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(datum(d).getTime()) && datum(d).getMonth() + 1 === +d.split('-')[1]; }
  /* Ein Termin in Worten: «10.–17. Januar 2027», über den Monat «28. Juni bis 5. Juli 2026», über das Jahr «30. Dezember 2026 bis 3. Januar 2027» */
  function wann(t) {
    if (!gibt(t.von) || !gibt(t.bis)) return 'Datum fehlt';
    var a = datum(t.von), b = datum(t.bis);
    if (a.getFullYear() !== b.getFullYear()) return a.getDate() + '. ' + MONATE[a.getMonth()] + ' ' + a.getFullYear() + ' bis ' + b.getDate() + '. ' + MONATE[b.getMonth()] + ' ' + b.getFullYear();
    if (a.getMonth() !== b.getMonth()) return a.getDate() + '. ' + MONATE[a.getMonth()] + ' bis ' + b.getDate() + '. ' + MONATE[b.getMonth()] + ' ' + b.getFullYear();
    return a.getDate() + '.–' + b.getDate() + '. ' + MONATE[a.getMonth()] + ' ' + a.getFullYear();
  }
  function tage(t) {
    if (!gibt(t.von) || !gibt(t.bis)) return '';
    var a = datum(t.von), b = datum(t.bis), n = Math.round((b - a) / 864e5);
    return TAGE[a.getDay()] + ' bis ' + TAGE[b.getDay()] + ' · ' + (n + 1) + ' Tage, ' + n + (n === 1 ? ' Nacht' : ' Nächte');
  }
  function vorbei(t) { return L && L.heute && gibt(t.bis) && t.bis < L.heute; }
  /* Wie bareiss.com die Termine einer Themenwoche setzt: «10.01.–17.01., 25.04.–02.05. und 07.11.–14.11.2027» (wie termine.py › wortlaut) */
  function wortlaut(l) {
    var s = sortiert(l.filter(function (t) { return gibt(t.von) && gibt(t.bis); }));
    if (!s.length) return '';
    var jahre = {}; s.forEach(function (t) { jahre[t.von.slice(0, 4)] = 1; jahre[t.bis.slice(0, 4)] = 1; });
    var tm = function (d, mit) { return d.slice(8, 10) + '.' + d.slice(5, 7) + '.' + (mit ? d.slice(0, 4) : ''); }, teile;
    if (Object.keys(jahre).length === 1) { teile = s.map(function (t) { return tm(t.von) + '–' + tm(t.bis); }); teile[teile.length - 1] += s[s.length - 1].bis.slice(0, 4); }
    else teile = s.map(function (t) { return tm(t.von, t.von.slice(0, 4) !== t.bis.slice(0, 4)) + '–' + tm(t.bis, true); });
    return teile.length === 1 ? teile[0] : teile.slice(0, -1).join(', ') + ' und ' + teile[teile.length - 1];
  }

  async function ruf(methode, weg_, daten) {
    var r;
    try {
      var vorab = methode === 'GET' && !daten && !weg_ && window.__vorab && window.__vorab[API]; if (vorab) delete window.__vorab[API];   // beim Laden der Seite schon geholt (index.html)
      r = await (vorab || fetch(API + (weg_ ? '/' + weg_ : ''), { method: methode, headers: daten ? { 'Content-Type': 'application/json' } : {}, body: daten ? JSON.stringify(daten) : undefined, cache: 'no-store' }));
    } catch (e) { throw { fehler: 'NETZ · Der Server des Werkzeugs antwortet nicht. Ihre Eingaben bleiben stehen.', stichwort: 'netz' }; }
    var j = {}; try { j = await r.json(); } catch (e) { /* leer */ }
    if (!r.ok) { j.status = r.status; throw j; }
    return j;
  }
  function uebernehmen(neu, eingabenBehalten) {
    if (!neu || !Array.isArray(neu.stand)) return;   /* eine Antwort ohne Stand (z. B. ein Prüfprogramm, das jede Anfrage mit {ok:true} beantwortet) ändert nichts */
    L = neu;
    if (!eingabenBehalten) liste = kopie(basis());
  }
  /* Was geändert ist: zwischen zwei Listen, je Termin */
  function unterschiede(alt, neu) {
    var aus = [];
    neu.forEach(function (t) {
      var a = nach(t.id, alt);
      if (!a) aus.push({ art: 'neu', t: t });
      else if (!gleich(a, t)) aus.push({ art: 'geaendert', t: t, a: a });
    });
    alt.forEach(function (a) { if (!nach(a.id, neu)) aus.push({ art: 'weg', t: a }); });
    return aus;
  }
  function zeile(u) {
    var n = thema(u.t.arr).name;
    if (u.art === 'neu') return 'neuer Termin ' + n + ' ' + wann(u.t);
    if (u.art === 'weg') return 'herausgenommen: ' + n + ' ' + wann(u.t);
    return n + ' «' + wann(u.a) + '» wird «' + wann(u.t) + '»';
  }
  function offen() { return L ? unterschiede(basis(), sortiert(liste)).length : 0; }
  function sortiert(l) { return l.slice().sort(function (a, b) { return (a.von || '').localeCompare(b.von || '') || (a.arr || '').localeCompare(b.arr || ''); }); }
  function istHier() { return H && H.ansicht() === 'e:termine' && document.querySelector('#ws-mitte[data-ws-ansicht="e:termine"]'); }
  function ort() { return document.getElementById('ws-mitte'); }

  async function speichern() {
    try {
      var a = await ruf('POST', 'speichern', { termine: sortiert(liste), erwartet: L.kennung });
      uebernehmen(a, false);
      if (a.nichts) { H && H.melde(a.meldung); } else {
        var n = unterschiede(a.vorher, basis()), k = H.quit('Gespeichert', 'Themenwochen · ' + zeile(n[0] || { art: 'neu', t: basis()[0] || {} }) + (n.length > 1 ? ' und ' + H.mz(n.length - 1, 'weitere Änderung', 'weitere Änderungen') : ''), [
          H.taste('Vorher/nachher ansehen', function () { k.remove(); H.geh('e:termine').then(function () { var v = document.getElementById('cu-tv'); if (v) v.scrollIntoView({ block: 'start' }); }); }),
          H.taste('Rückgängig', function () { k.remove(); rueckgaengig(a.vorher); })], { 'data-ws-quittung': n.length, 'data-cu-termine': 'gespeichert' });
        setTimeout(function () { if (k.isConnected) k.remove(); }, 9000);
      }
      if (istHier()) zeichne(ort(), H);
      return true;
    } catch (e) {
      if (e.status === 409) { return konflikt(); }
      H.fehler(e);
      return false;
    }
  }
  async function rueckgaengig(vorher) {
    try { uebernehmen(await ruf('POST', 'speichern', { termine: vorher, erwartet: L.kennung }), false); H.melde('Rückgängig gemacht', { mehr: 'Die Themenwochen sind wie vor diesem Speichern.' }); }
    catch (e) { if (e.status === 409) { await neuLaden(true); H.melde('Inzwischen hat jemand anderes gespeichert.', { stichwort: 'konflikt' }); } else H.fehler(e); }
    H.neu(); if (istHier()) zeichne(ort(), H);
  }
  async function neuLaden(behalten) { uebernehmen(await ruf('GET', ''), behalten); }
  function konflikt() {
    return neuLaden(true).then(function () {
      return new Promise(function (fertig) {
        H.fenster('Zwei haben', 'gleichzeitig geändert.', H.el('div', { class: 'ws-form' },
          H.el('p', {}, 'In einem anderen Fenster wurden die Themenwochen inzwischen gespeichert. Ihre Eingaben sind nicht verloren und nichts wurde überschrieben.'),
          H.el('p', {}, 'Speichern Sie, gilt Ihre Liste, so wie sie hier steht.')), [
          { text: 'Meine Eingaben verwerfen', tun: function (zu) { zu(); liste = kopie(basis()); H.neu(); if (istHier()) zeichne(ort(), H); fertig(false); } },
          { text: 'Meine Eingaben speichern', haupt: true, tun: function (zu) { zu(); speichern().then(fertig); } }], { name: 'konflikt' });
      });
    });
  }

  /* ---------- Zeichnen */
  function blatt(t) {   // das Bild eines Termins: grosse Tage in Hausgold auf Tanne, darunter Monat und Jahr, oben der Name der Themenwoche
    var ok = gibt(t.von) && gibt(t.bis), a = ok ? datum(t.von) : null, b = ok ? datum(t.bis) : null, ein = ok && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    return '<figure class="cu-pl cu-tw" aria-hidden="true"><span class="cu-tw__ro">' + WO.esc(thema(t.arr).name) + '</span>' +
      '<b class="cu-tw__tage">' + (!ok ? '–' : ein ? a.getDate() + '.<i>–' + b.getDate() + '.</i>' : a.getDate() + '.' + (a.getMonth() + 1) + '.<i>–' + b.getDate() + '.' + (b.getMonth() + 1) + '.</i>') + '</b>' +
      '<span class="cu-tw__monat">' + (!ok ? '' : ein ? MONATE[a.getMonth()] + ' ' + a.getFullYear() : (a.getFullYear() === b.getFullYear() ? MONATE[a.getMonth()] + ' bis ' + MONATE[b.getMonth()] + ' ' + b.getFullYear() : a.getFullYear() + ' bis ' + b.getFullYear())) + '</span>' +
      '<span class="cu-tw__mit">Hotel Bareiss</span></figure>';
  }
  function feld(label, inhalt, art) { return H.el('label', { class: 'cu-f' + (art ? ' cu-f--' + art : '') }, H.el('span', { class: 'cu-f__l' }, label), inhalt); }
  function auswahlDatum(wert, beiWahl, wer) {   // Datum im Stil des Hauses (R21): Tag, Monat, Jahr als Auswahl, nie die des Betriebssystems
    var p = (wert || '').split('-'), j0 = new Date().getFullYear(), tg = [], mon = [], jahre = [];
    for (var i = 1; i <= 31; i++) tg.push({ wert: ('0' + i).slice(-2), text: i + '.' });
    MONATE.forEach(function (n, i) { mon.push({ wert: ('0' + (i + 1)).slice(-2), text: n }); });
    for (var j = j0 - 1; j <= j0 + 2; j++) jahre.push({ wert: String(j), text: String(j) });
    if (p[0] && !jahre.some(function (x) { return x.wert === p[0]; })) jahre.push({ wert: p[0], text: p[0] });
    var setze = function (k, w) { p[k] = w; beiWahl(p.join('-')); };
    return H.el('span', { class: 'cu-datum' }, H.auswahl(tg, p[2], function (w) { setze(2, w); }, wer + ': Tag'), H.auswahl(mon, p[1], function (w) { setze(1, w); }, wer + ': Monat'), H.auswahl(jahre, p[0], function (w) { setze(0, w); }, wer + ': Jahr'));
  }
  function pruefeEingabe(t) {
    if (!gibt(t.von)) return 'Den ersten Tag gibt es nicht.';
    if (!gibt(t.bis)) return 'Den letzten Tag gibt es nicht.';
    if (t.bis <= t.von) return 'Der letzte Tag liegt nach dem ersten.';
    if ((datum(t.bis) - datum(t.von)) / 864e5 > LAENGSTENS) return 'Ein Termin dauert höchstens ' + LAENGSTENS + ' Tage.';
    if (liste.some(function (x) { return x !== t && x.arr === t.arr && gibt(x.von) && gibt(x.bis) && x.von <= t.bis && t.von <= x.bis; })) return 'Dieser Termin überschneidet sich mit einem anderen Termin derselben Themenwoche.';
    return '';
  }
  function karte(t) {
    var b = nach(t.id, basis()), neu = !b, geaendert = b && !gleich(b, t);
    var fehler = pruefeEingabe(t);
    var meld = H.el('p', { class: 'cu-t__fehler', role: 'alert', hidden: !fehler }, fehler);
    var kopfZeile = H.el('p', { class: 'cu-t__wann' }, wann(t));
    var tagZeile = H.el('p', { class: 'cu-t__frei' }, tage(t));
    var bild = H.el('div', { class: 'cu-t__bild', html: blatt(t) });
    function neuZeichnen() {
      var f = pruefeEingabe(t); meld.textContent = f; meld.hidden = !f;
      kopfZeile.textContent = wann(t); tagZeile.textContent = tage(t); bild.innerHTML = blatt(t);
      var bb = nach(t.id, basis());
      k.classList.toggle('cu-t--offen', !bb || !gleich(bb, t));
      var w = document.querySelector('[data-cu-wortlaut="' + t.arr + '"]'); if (w) w.textContent = wortlaut(liste.filter(function (x) { return x.arr === t.arr; })) || 'Kein Termin';
      H.leiste();
    }
    var k = H.el('article', { class: 'cu-t' + (neu || geaendert ? ' cu-t--offen' : ''), 'data-cu-termin': t.id },
      bild,
      H.el('div', { class: 'cu-t__felder' },
        H.el('div', { class: 'cu-t__kopf' }, kopfZeile, neu ? H.el('span', { class: 'cu-t__marke' }, 'Neu') : vorbei(t) ? H.el('span', { class: 'cu-t__marke cu-t__marke--leise' }, 'Vorbei') : null),
        tagZeile,
        H.el('div', { class: 'cu-t__reihe' },
          feld('Erster Tag', auswahlDatum(t.von, function (w) { t.von = w; neuZeichnen(); }, 'Erster Tag'), 'datum'),
          feld('Letzter Tag', auswahlDatum(t.bis, function (w) { t.bis = w; neuZeichnen(); }, 'Letzter Tag'), 'datum')),
        vorbei(t) && !neu ? H.el('p', { class: 'cu-t__frei' }, 'Dieser Termin ist vorbei und steht noch bei den Arrangements. Mit «Herausnehmen» verschwindet er beim nächsten Veröffentlichen.') : null,
        meld,
        H.el('div', { class: 'cu-t__kn' },
          b && geaendert ? H.link('Wie gespeichert', function () { liste[liste.indexOf(t)] = kopie(b); zeichne(ort(), H); H.leiste(); }) : null,
          H.link(neu ? 'Wieder entfernen' : 'Herausnehmen', function () {
            var nr = liste.indexOf(t); liste.splice(nr, 1); zeichne(ort(), H); H.leiste(); H.neu();
            if (!neu) H.melde('Herausgenommen', { mehr: thema(t.arr).name + ', ' + wann(t) + '. Erst mit «Speichern» im Entwurf; jeder veröffentlichte Stand lässt sich zurückholen.' });
          }, { 'data-cu-weg': t.id }))));
    return k;
  }
  /* Neuer Termin einer Themenwoche: gleicher Wochentag und gleiche Länge wie ihr letzter Termin, vier Wochen später, ohne Überschneidung;
     hat sie keinen, ab dem nächsten Sonntag acht Tage (so laufen die Wochen des Hauses: Anreise Sonntag). */
  function neuerTermin(arr) {
    var eigene = sortiert(liste.filter(function (x) { return x.arr === arr && gibt(x.von) && gibt(x.bis); })), letzte = eigene[eigene.length - 1];
    var a, n;
    if (letzte) { a = datum(letzte.von); n = Math.round((datum(letzte.bis) - datum(letzte.von)) / 864e5); a.setDate(a.getDate() + 28); }
    else { a = L && L.heute ? datum(L.heute) : new Date(); a.setDate(a.getDate() + ((7 - a.getDay()) % 7 || 7)); n = 7; }
    for (var i = 0; i < 60; i++) {
      var e = new Date(a); e.setDate(e.getDate() + n);
      if (!eigene.some(function (x) { return x.von <= iso(e) && iso(a) <= x.bis; })) break;
      a.setDate(a.getDate() + 7);
    }
    var b = new Date(a); b.setDate(b.getDate() + n);
    var t = { id: 'n' + Date.now().toString(36).slice(-8), arr: arr, von: iso(a), bis: iso(b) };
    liste.push(t);
    zeichne(ort(), H); H.neu();
    var k = document.querySelector('[data-cu-termin="' + t.id + '"]'); if (k) { k.scrollIntoView({ block: 'center' }); k.classList.add('cu-t--leuchtet'); }
  }
  function neuWaehlen() {   // Knopf im Kopf: erst die Themenwoche wählen
    var wahl = (L.themen[0] || {}).key;
    var feldW = feld('Themenwoche', H.auswahl(L.themen.map(function (a) { return { wert: a.key, text: a.name }; }), wahl, function (w) { wahl = w; }, 'Themenwoche'));
    H.fenster('Neuer', 'Termin.', H.el('div', { class: 'ws-form' }, H.el('p', {}, 'Zu welcher Themenwoche gehört der Termin? Er steht danach mit einem Vorschlag in der Liste, Tage wählen Sie dort.'), feldW), [
      { text: 'Abbrechen' },
      { text: 'Termin anlegen', haupt: true, tun: function (zu) { zu(); neuerTermin(wahl); } }], { name: 'neuer-termin' });
  }

  function vergleich() {   // «Vorher, nachher»: veröffentlicht (durchgestrichen) gegen Entwurf (markiert)
    var u = L.wartet ? unterschiede(L.stand, L.entwurf) : [];
    var box = H.el('section', { class: 'cu-v', id: 'cu-tv' }, H.el('h2', { class: 'wo-zw' }, 'Vorher, ', H.el('em', {}, 'nachher')));
    if (!u.length) {
      var b0 = basis()[0] || (L.ursprung || [])[0], b1 = b0 ? { von: b0.von, bis: iso(new Date(datum(b0.bis).getTime() - 864e5)) } : null;
      box.append(H.el('p', { class: 'cu-leise' }, 'Im Entwurf wartet nichts. Was Sie speichern, steht hier: oben, was jetzt veröffentlicht ist, darunter, was nach dem Veröffentlichen gilt.'),
        b0 ? H.el('div', { class: 'cu-v__z cu-v__z--beispiel' }, H.el('span', { class: 'cu-v__mk' }, 'Beispiel'), H.el('s', {}, thema(b0.arr).name + ' ' + wann(b0)), H.el('mark', {}, thema(b0.arr).name + ' ' + wann(b1))) : null);
      return box;
    }
    u.forEach(function (x) {
      var n = thema(x.t.arr).name + ' ';
      box.append(H.el('div', { class: 'cu-v__z', 'data-cu-v': x.art },
        H.el('span', { class: 'cu-v__mk' }, x.art === 'neu' ? 'Neu' : x.art === 'weg' ? 'Entfällt' : 'Geändert'),
        x.art !== 'neu' ? H.el('s', {}, n + wann(x.a || x.t)) : null,
        x.art !== 'weg' ? H.el('mark', {}, n + wann(x.t)) : null));
    });
    box.append(H.el('div', { class: 'ws-reihe' }, H.link('Entwurf der Themenwochen verwerfen', function () {
      H.fenster('Entwurf der Themenwochen', 'verwerfen?', H.el('p', {}, H.mz(u.length, 'Änderung geht', 'Änderungen gehen') + ' verloren. Veröffentlicht bleibt, wie es ist.'), [
        { text: 'Abbrechen' },
        { text: 'Ja, verwerfen', haupt: true, tun: async function (zu) {
          zu();
          try { var a = await ruf('POST', 'verwerfen', { erwartet: L.kennung }); var vorher = a.vorher; uebernehmen(a, false); H.neu(); zeichne(ort(), H);
            var k = H.quit('Entwurf verworfen', 'Die Themenwochen stehen, wie sie veröffentlicht sind.', [H.taste('Rückgängig', function () { k.remove(); rueckgaengig(vorher); })]);
          } catch (e) { if (e.status === 409) { await neuLaden(true); H.melde('Inzwischen hat jemand anderes gespeichert.', { stichwort: 'konflikt' }); } else H.fehler(e); }
        } }], { name: 'verwerfen' });
    }, { 'data-cu-verwerfen': '1' })));
    return box;
  }
  function verlauf() {   // Frühere Fassungen (R14): Datum, Zahl, Notiz, «In den Entwurf holen», unten immer der ursprüngliche Stand
    var box = H.el('section', { class: 'cu-vl' }, H.el('h2', { class: 'wo-zw' }, 'Frühere ', H.el('em', {}, 'Fassungen')));
    var holen = function (nr, was) {
      return H.taste('In den Entwurf holen', async function () {
        try { uebernehmen(await ruf('POST', 'zurueckholen', { nr: nr, erwartet: L.kennung }), false); H.neu(); zeichne(ort(), H);
          H.melde('In den Entwurf geholt', { mehr: was + '. Es gilt erst, wenn Sie veröffentlichen.' });
        } catch (e) { if (e.status === 409) { await neuLaden(true); H.melde('Inzwischen hat jemand anderes gespeichert.', { stichwort: 'konflikt' }); } else H.fehler(e); }
      }, { 'data-cu-holen': String(nr) });
    };
    if (!L.verlauf.length) box.append(H.el('div', { class: 'cu-vl__z cu-vl__z--beispiel' }, H.el('span', { class: 'cu-v__mk' }, 'Beispiel'),
      H.el('b', {}, '9.11.2026, 18:30 Uhr'), H.el('span', {}, 'Veröffentlicht · ' + H.mz(L.ursprung.length, 'Termin', 'Termine') + ' · Notiz «Termine 2027»')));
    L.verlauf.forEach(function (v) {
      box.append(H.el('div', { class: 'cu-vl__z' }, H.el('b', {}, H.zeit(v.zeit)), H.el('span', {}, 'Veröffentlicht · ' + H.mz(v.zahl, 'Termin', 'Termine') + (v.notiz ? ' · Notiz «' + v.notiz + '»' : '')), holen(v.nr, 'Die Fassung vom ' + H.zeit(v.zeit))));
    });
    box.append(H.el('div', { class: 'cu-vl__z cu-vl__z--ur' }, H.el('b', {}, 'Ursprünglicher Stand'), H.el('span', {}, 'Wie bareiss.com die Termine führt · ' + H.mz(L.ursprung.length, 'Termin', 'Termine')), holen('ursprung', 'Der ursprüngliche Stand')));
    return box;
  }
  /* «So steht es bei den Arrangements»: je Themenwoche ihre Termine im Wortlaut von bareiss.com, aus den Eingaben, wie sie gerade stehen */
  function wortlautBox() {
    var box = H.el('section', { class: 'cu-vs cu-wl' }, H.el('h2', { class: 'wo-zw' }, 'So steht es ', H.el('em', {}, 'beim Arrangement')),
      H.el('p', { class: 'cu-leise' }, 'Die Termine jeder Themenwoche in einer Zeile, so wie das Haus sie bei seinen Arrangements setzt. Noch nicht gespeicherte Eingaben sind schon dabei.'));
    var tafel = H.el('div', { class: 'cu-wl__tafel' });
    L.themen.forEach(function (a) {
      tafel.append(H.el('div', { class: 'cu-wl__z' }, H.el('span', { class: 'cu-wl__u' }, a.unter || ''), H.el('b', {}, a.name),
        H.el('p', { class: 'cu-wl__t', 'data-cu-wortlaut': a.key }, wortlaut(liste.filter(function (x) { return x.arr === a.key; })) || 'Kein Termin')));
    });
    box.append(tafel, H.el('p', { class: 'cu-leise cu-wl__hin' }, 'Die Designstudie hat noch keine eigene Seite für die Arrangements. Veröffentlicht stehen die Termine als Daten in der Probe-Kopie bereit, für diese Seite, sobald sie gebaut ist.'));
    return box;
  }
  function gruppeKopf(a, zahl) {
    var f = '/assets/img/' + a.foto, fakt = [a.dauer, a.preis, a.anreise].filter(Boolean).join(' · ');
    return H.el('div', { class: 'cu-g__kopf' },
      H.el('figure', { class: 'cu-g__b', html: '<img src="' + f + '-640.webp" srcset="' + f + '-640.webp 640w, ' + f + '-1200.webp 1200w" sizes="(max-width:700px) 40vw, 220px" alt="' + WO.esc(a.foto_alt || a.name) + '" loading="eager" decoding="async">' }),
      H.el('div', { class: 'cu-g__t' }, H.el('span', { class: 'cu-g__u' }, a.unter || ''), H.el('h3', {}, a.name),
        H.el('p', { class: 'cu-g__f' }, (fakt ? fakt + ' · ' : '') + H.mz(zahl, 'Termin', 'Termine')),
        H.el('button', { class: 'wo-kn wo-kn--glas wo-kn--klein', type: 'button', 'data-cu-neu': a.key, html: '<span>Neuer Termin</span><i>' + (window.WO ? WO.ic('plus') : '') + '</i>', onclick: function () { neuerTermin(a.key); } })));
  }

  function zeichne(ziel, h) {
    H = h;
    var m = ziel || ort();
    var y = window.scrollY;
    if (m.querySelector(':scope > .cu-liste')) {   /* nach einer Eingabe: nur Liste, Wortlaut, Vergleich und Verlauf neu */
      m.querySelector(':scope > .cu-liste').replaceWith(listeBox(h));
      m.querySelector(':scope > .cu-wl').replaceWith(wortlautBox());
      m.querySelector(':scope > .cu-v').replaceWith(vergleich());
      m.querySelector(':scope > .cu-vl').replaceWith(verlauf());
      m.setAttribute('data-cu-termine', String(liste.length));
      return;
    }
    m.textContent = '';
    m.append(h.titel('Arrangements mit festen Terminen', 'Themenwochen', 'pflegen.', 'Naturerlebnis-Woche, Jubilarwochen, Kochkurse und Musewoche: je Termin der erste und der letzte Tag. Leistungen und Preise bleiben, wie das Haus sie schreibt.',
      [h.el('button', { class: 'wo-kn wo-kn--gold', type: 'button', 'data-cu-neu': '1', html: '<span>Neuer Termin</span><i>' + (window.WO ? WO.ic('plus') : '') + '</i>', onclick: neuWaehlen }),
       h.el('a', { class: 'wo-kn', href: '#cu-tv', html: '<span>Vorher, nachher</span><i>' + (window.WO ? WO.ic('auge') : '') + '</i>', onclick: function (ev) { ev.preventDefault(); var v = document.getElementById('cu-tv'); if (v) v.scrollIntoView({ block: 'start', behavior: 'smooth' }); } })]));
    m.append(listeBox(h), wortlautBox(), vergleich(), verlauf(),
      h.el('p', { class: 'cu-quelle' }, 'Ursprung der Themenwochen: ' + L.quelle + '. Die Website wird hier nie verändert; veröffentlicht wird in die Probe-Kopie.'));
    if (h.opt && h.opt.halten) window.scrollTo(0, y);
    m.setAttribute('data-cu-termine', String(liste.length));
  }
  function listeBox(h) {
    var box = h.el('section', { class: 'cu-liste', 'aria-label': 'Themenwochen und ihre Termine' });
    if (!liste.length) box.append(h.el('div', { class: 'cu-leer' }, h.el('p', {}, 'Gerade steht kein Termin in der Liste. Mindestens einer bleibt stehen. «Neuer Termin» bei einer Themenwoche füllt die Liste wieder, «Frühere Fassungen» holt einen gespeicherten Stand zurück.')));
    L.themen.forEach(function (a) {
      var eigene = sortiert(liste.filter(function (t) { return t.arr === a.key; }));
      var g = h.el('div', { class: 'cu-g', 'data-cu-thema': a.key }, gruppeKopf(a, eigene.length));
      if (!eigene.length) {
        var b0 = (L.ursprung || []).find(function (t) { return t.arr === a.key; }) || { arr: a.key, von: '', bis: '' };
        g.append(h.el('div', { class: 'cu-t cu-t--beispiel' }, h.el('div', { class: 'cu-t__bild', html: blatt(b0) }),
          h.el('div', { class: 'cu-t__felder' }, h.el('p', { class: 'cu-t__wann' }, 'Beispiel: ' + wann(b0)), h.el('p', { class: 'cu-t__frei' }, 'Diese Themenwoche hat gerade keinen Termin. Mit «Neuer Termin» legen Sie einen an.'))));
      }
      eigene.forEach(function (t) { g.append(karte(t)); });
      box.append(g);
    });
    return box;
  }

  window.WS_EIGEN = window.WS_EIGEN || {};
  window.WS_EIGEN.termine = {
    name: 'Themenwochen', gruppe: 'Das Haus', aufgabe: ['Neuer Termin', 'Die Themenwochen des Hauses: Termine eintragen, verschieben oder herausnehmen.'],
    bereit: function () { return ruf('GET', '').then(function (a) { uebernehmen(a, false); }); },
    zeichne: async function (ziel, h) { H = h; if (h.opt && h.opt.neuLaden) await neuLaden(true); zeichne(ziel, h); },
    offen: offen,
    wartet: function () { return L && L.wartet ? unterschiede(L.stand, L.entwurf).length : 0; },
    speichern: function () { if (!H) return Promise.resolve(false); return speichern(); },
    zeilen: function () { return L && L.wartet ? unterschiede(L.stand, L.entwurf).map(zeile) : []; },
    veroeffentlichen: async function (notiz) {
      var n = this.wartet();
      uebernehmen(await ruf('POST', 'veroeffentlichen', { erwartet: L.kennung, notiz: notiz }), true);
      if (istHier()) zeichne(ort(), H);
      return n;
    }
  };
})();

/* Abnahme-Tor 2, 30.10.2026 (S2, K7): Kacheltitel und -unterschriften der Übersicht («Einen Text ändern», «Preis oder Öffnungszeit») ohne einzelnes Wort in der
   letzten Zeile: die letzten zwei Wörter bleiben zusammen (Safari kennt den Umbruch «pretty» noch nicht) */
(function () {
  function fest() {
    document.querySelectorAll(':is(.wo-ag__t, .wo-bk__t) > :is(b, span):not([data-fest]):not(:has(*)), .ws-eintrag__t > b:not([data-fest])').forEach(function (b) {
      b.setAttribute('data-fest', '');
      var t = b.textContent.trim(), i = t.lastIndexOf(' '), j = i > 0 ? t.lastIndexOf(' ', i - 1) : -1;
      if (j < 0) { if (i > 0 && b.parentNode.classList.contains('ws-eintrag__t')) b.textContent = t.replace(' ', '\u00a0'); return; }   /* Namen aus zwei Wörtern bleiben ganz */
      b.textContent = t.slice(0, j + 1) + t.slice(j + 1).replace(' ', '\u00a0');
    });
  }
  /* Einträge eines Bereichs (Zimmerkategorien): «Ändern» unter dem Namen als Zeichen der Kachel (CSS ::after), damit die letzte Textzeile der Name bleibt */
  function aendernZeichen() {
    document.querySelectorAll('.ws-eintrag__auf:not([data-text])').forEach(function (e) { var t = e.textContent.trim(); if (!t) return; e.setAttribute('data-text', t); e.textContent = ''; });
  }
  /* Fenster «Foto tauschen»: der Bildtitel steht ganz (das gemeinsame Werkzeug kürzt ihn auf 48 Zeichen mit «…»; der volle steht im title) */
  function ganz() {
    document.querySelectorAll('.ws-fwahl:not([data-ganz])').forEach(function (k) {
      k.setAttribute('data-ganz', '');
      var t = k.querySelector('.ws-fwahl__t'), voll = k.getAttribute('title');
      if (!t) return;
      var text = (voll && /…$/.test(t.textContent)) ? (/^Eigenes Foto · /.test(t.textContent) ? 'Eigenes Foto · ' : '') + voll : t.textContent;
      var i = text.lastIndexOf(' ');   /* die letzten zwei Wörter bleiben zusammen: nie ein Wort allein in der letzten Zeile (Kriterium 7) */
      t.textContent = '';   /* die letzten zwei Wörter in einer Zeile, die nicht bricht (auch nicht am Bindestrich) */
      if (i > 0) { var j = text.lastIndexOf(' ', i - 1), ende = document.createElement('span'); ende.style.whiteSpace = 'nowrap'; ende.textContent = text.slice(j + 1); t.append(text.slice(0, j + 1), ende); }
      else t.textContent = text;
    });
  }
  /* Kein «×» als Zählzeichen (K24, Tor 2, 30.10.2026): «Link · 4× auf der Seite» heisst «Link · an 4 Stellen der Seite», «Steht 9× …» heisst «Steht an 9 Stellen …» */
  function ohneX() {
    document.querySelectorAll('.ws-st small, .ws-ang__lage, .ws-hoch, .ws-hoch *').forEach(function (e) {
      if (e.children.length) return;
      var t = e.textContent; if (t.indexOf('×') < 0) return;
      e.textContent = t.replace(/(\d+)× auf der Seite/g, '$1-mal auf der Seite').replace(/Steht (\d+)×/g, 'Steht an $1 Stellen').replace(/(\d+)\s*×\s*(\d+)/g, '$1 auf $2').replace(/(\d+)×/g, '$1-mal');   /* Masse wie in der Werkstatt: «1600 auf 1067» */
    });
  }
  /* Knopf «Website ansehen» im Kopf: zwischen 901 und 1240 px nur der runde Knauf (bureau.css); sein Name bleibt für Vorlesegeräte als aria-label */
  function knaufName() {
    document.querySelectorAll('#ws-kopf a.wo-kn--gold:not([aria-label])').forEach(function (a) { var t = a.textContent.trim(); if (t) a.setAttribute('aria-label', t); });
  }
  var plan = 0;
  /* Lange Werte in Feldern des Stamms (Bildbeschreibung, Google-Titel, Links der Angaben): ein einzeiliges Feld versteckt den Anfang (Kriterium 2). Daneben
     steht ein Textfeld, das umbricht; das Feld des Stamms bleibt (verborgen) die Quelle: Eingaben gehen als «input» an es, Werte, die der Stamm setzt
     («Wie ursprünglich»), erscheinen im Textfeld. Zeilenumbrüche werden zu Leerzeichen, Enter fügt keinen ein. */
  var WERT = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  function langfeld() {
    document.querySelectorAll('input#ws-alt:not([data-lang]), input[id^="ws-gt-t-"]:not([data-lang]), input[id^="ws-ang-"][type="url"]:not([data-lang]), input[id^="ws-ang-"][type="text"]:not([data-lang])').forEach(function (f) {
      f.setAttribute('data-lang', '');
      var t = document.createElement('textarea');
      t.className = 'ws-langfeld'; t.rows = 1; t.spellcheck = false; t.setAttribute('autocomplete', 'off');
      var lb = f.id && document.querySelector('label[for="' + CSS.escape(f.id) + '"]');
      if (lb) { if (!lb.id) lb.id = 'lb-' + f.id; t.setAttribute('aria-labelledby', lb.id); }
      t.value = f.value;
      var hoch = function () { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; };
      var spiegel = function () { t.disabled = f.disabled; t.setAttribute('aria-invalid', f.getAttribute('aria-invalid') || 'false'); };
      Object.defineProperty(f, 'value', { configurable: true, get: function () { return WERT.get.call(this); }, set: function (v) { WERT.set.call(this, v); if (t.value !== String(v)) { t.value = v; hoch(); } } });
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
      t.addEventListener('input', function () { var v = t.value.replace(/\s*\n\s*/g, ' '); if (v !== t.value) t.value = v; WERT.set.call(f, v); f.dispatchEvent(new Event('input', { bubbles: true })); hoch(); });
      if (window.MutationObserver) new MutationObserver(spiegel).observe(f, { attributes: true, attributeFilter: ['disabled', 'aria-invalid'] });
      spiegel();
      f.style.display = 'none';
      f.after(t);
      requestAnimationFrame(hoch);
      if (document.activeElement === f) t.focus();
    });
  }
  /* Breite Kacheln unter «Häufig gebraucht»: das Foto in der nächsten Stufe der Website (-1200 statt -640), sonst stand es unscharf vergrößert; fehlt die Stufe, bleibt das kleine */
  function scharf() {
    document.querySelectorAll('.ws-aufgaben > .wo-ag .wo-ag__b img:not([data-scharf])').forEach(function (i) {
      i.setAttribute('data-scharf', '');
      var alt = i.getAttribute('src') || '';
      if (!/-640\.webp/.test(alt) || innerWidth <= 700) return;
      i.addEventListener('error', function () { if (i.getAttribute('src') !== alt) i.setAttribute('src', alt); }, { once: true });
      i.setAttribute('src', alt.replace(/-640\.webp/, '-1200.webp'));
    });
  }
  /* Angaben des Hauses: der Satz des Stamms nennt Öffnungstage; das Haus führt hier Telefon, E-Mail, Adresse und die zwei Links zum Buchen */
  function angabenSatz() {
    var m = document.querySelector('#ws-mitte[data-ws-ansicht="angaben"]'); if (!m) return;
    m.querySelectorAll('p, span').forEach(function (e) { if (!e.children.length && /^Telefon, E-Mail, Adresse, Öffnungstage und die wichtigsten Links\./.test(e.textContent)) e.textContent = e.textContent.replace(/^Telefon, E-Mail, Adresse, Öffnungstage und die wichtigsten Links\./, 'Telefon, E-Mail, Adresse und die Links zum Buchen.'); });
  }
  /* Fotos der Foto-Gruppen eines Bereichs sofort laden und malen (WebKit malte spät geladene Bilder unter einem offenen Fenster nicht; Lösung wie im Gästebuch) */
  function sofort() {
    document.querySelectorAll('.ws-fotos .ws-foto img:not([data-sofort]), .cu-t__bild img:not([data-sofort])').forEach(function (i) {
      i.setAttribute('data-sofort', ''); i.loading = 'eager'; i.decoding = 'sync';
    });
  }
  /* Häufig gebraucht: der Stamm nimmt für die Aufgaben die Fotos der Bereiche, jedes Foto stand so zweimal in der Übersicht (Auftrag: jedes Foto nur
     einmal je Ansicht). Hier je Aufgabe ein eigenes, passendes Foto des Hauses (assets/img/bilder.json), keins der Bereichskacheln, kein Porträt.
     Ein Name des Stamms nach dem Haus: es hat keine Öffnungszeit, sondern Zeiten und Preise. */
  var AUFG_FOTO = { 'Neuer Termin': 'u-wegweiser', 'Einen Text ändern': 'u-hermine-stube', 'Preis oder Öffnungszeit': 't-kuchen', 'Preis oder Zeiten': 't-kuchen',
    'Telefon oder Adresse': 'g-winter', 'Foto tauschen': 'garten-licht', 'Gericht oder Preis auf der Karte': 'u-dessert', 'Hinweis für Gäste': 'u-oase',
    'Google-Texte': 'teich-liegen', 'Zimmer nachführen': 'z-appartement' };
  var AUFG_NAME = { 'Preis oder Öffnungszeit': 'Preis oder Zeiten' };
  var AUFG_SATZ = {};
  function aufgaben() {
    document.querySelectorAll('.ws-aufgaben > .wo-ag:not([data-haus-foto])').forEach(function (k) {
      var b = k.querySelector('.wo-ag__t > b'); if (!b) return;
      k.setAttribute('data-haus-foto', '');
      var t = b.textContent.replace(/\u00a0/g, ' ').trim();
      if (AUFG_NAME[t]) { t = AUFG_NAME[t]; b.textContent = t; }
      var sz = k.querySelector('.wo-ag__t > span'); if (AUFG_SATZ[t] && sz) sz.textContent = AUFG_SATZ[t];
      var f = AUFG_FOTO[t], i = k.querySelector('.wo-ag__b img');
      if (f && i) { i.setAttribute('data-scharf', ''); i.setAttribute('src', i.getAttribute('src').replace(/[^/]+-\d{3,4}\.webp(\?.*)?$/, f + (innerWidth <= 700 ? '-640.webp' : '-1200.webp'))); }   /* am Handy reicht die kleine Stufe (6× gedrosselt gemessen) */
    });
  }
  function nameZuerst() {
    document.querySelectorAll('.ws-eintrag__t:not([data-name-zuerst])').forEach(function (t) {
      var b = t.querySelector(':scope > b'); if (!b) return;
      t.setAttribute('data-name-zuerst', ''); t.insertBefore(b, t.firstChild);
      var m = t.querySelector(':scope > :not(b)');
      if (m && !m.children.length) {   /* der Punkt bleibt am Wort davor («3 Nächte ·» / «Halbpension»), die letzten zwei Wörter bleiben zusammen */
        var x = m.textContent.replace(/ · /g, '\u00a0· ');
        if (!/· \S+$/.test(x)) x = x.replace(/ (\S+)$/, '\u00a0$1');
        m.textContent = x;
      }
    });
  }
  function alles() { plan = 0; aufgaben(); nameZuerst(); sofort(); angabenSatz(); fest(); aendernZeichen(); ganz(); ohneX(); knaufName(); langfeld(); scharf(); }
  if (window.MutationObserver) new MutationObserver(function () { if (!plan) plan = requestAnimationFrame(alles); }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
