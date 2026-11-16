/* Drucksachen & Feed · Newsletter-Baukasten, Oberfläche. Vorlagen (Inhalte aus katalog.js NEWSLETTER, nur Belegtes, Unbelegtes in [Klammern]),
   Bausteine anklicken und rechts bearbeiten, Reihenfolge ändern, Fotos des Hauses wählen, Prüfung, Export als .html und «HTML kopieren».
   Gespeichert wird im Browser (localStorage «ds-bareiss-mails»), erst sobald etwas geändert wird. Satz der Mail: mail-satz.js. */
(function () {
  try { sessionStorage.setItem('ds-bareiss-in-werkstatt', '1'); } catch (e) {}   // wer hier war, ist schon in der Werkstatt: die Übersicht zeigt keine Begrüssung (1.11.)
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const PFEIL = '<svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  const WEB = 'https://www.bareiss.com/', TEL = 'tel:+497442470', MAIL = 'mailto:info@bareiss.com', BUCHEN = 'https://booking.bareiss.com/?culture=de', GUTSCHEIN = 'https://booking.bareiss.com/vouchers?culture=de&selectedCategory=';
  const LOKAL = location.origin + location.pathname.replace(/[^/]*$/, '');
  let M = null;

  /* ---------- Vorlagen: Inhalte des Hauses (geschrieben von _bau/mails.py aus den Seiten des Hauses, der Karte und dem Kalender) ---------- */
  const NL = n => ((window.DSKATALOG && DSKATALOG.NEWSLETTER || []).find(x => x.n === n) || {}).inhalt || {};
  const VORLAGEN = [
    { key: "abend", n: "Winter-Special", wo: "an alle Gäste", foto: "g-winter", bau() { return {"betreff": "Winter-Special: 75 Jahre Gastfreundschaft", "vorschau": "Anreise am 13.12.26: fünf Übernachtungen, das Jubiläumsmenu, der Bareiss Winterwald und der Christkindlmarkt.", "versand": "mailchimp", "kopf": {"foto": "g-winter", "alt": "Das Hotel Bareiss im Winter"}, "fuss": {"abmelden": true}, "bloecke": [{"typ": "titel", "ueber": "Anreise am 13.12.26", "titel": "Winter-Special.", "unter": "75 Jahre Gastfreundschaft"}, {"typ": "text", "text": "Guten Tag,\n\n75 Jahre Gastfreundschaft und lebendige Leidenschaft – das Winter-Special ist unsere Einladung an Sie, in der Vorweihnachtszeit besondere Freude und Zeit mit uns zu teilen.", "ausr": "links"}, {"typ": "liste", "titel": "Das Arrangement beinhaltet", "eintraege": [{"name": "5 Übernachtungen im Rahmen der Bareiss Halbpension", "detail": "", "preis": ""}, {"name": "15 % Jubiläums-Nachlass auf den Angebotspreis", "detail": "", "preis": ""}, {"name": "Gutschein für ein Glas Winzersekt oder ein alkoholfreies Softgetränk pro Person, einlösbar im Forellenhof Buhlbach oder in der Wanderhütte Sattelei", "detail": "", "preis": ""}, {"name": "Jubiläumsmenu mit korrespondierenden Weinen an einem Abend Ihrer Wahl (Terminierung bei Anreise)", "detail": "", "preis": ""}, {"name": "exklusives Begrüßungs-Arrangement auf dem Zimmer", "detail": "", "preis": ""}, {"name": "Jubiläumsgeschenk zum Abschied", "detail": "", "preis": ""}]}, {"typ": "liste", "titel": "Angebotspreis für 6 Tage / 5 Übernachtungen", "eintraege": [{"name": "Einzelzimmer", "detail": "", "preis": "ab 1.505 €"}, {"name": "Einzelzimmer-Appartement", "detail": "", "preis": "ab 1.675 €"}, {"name": "Doppelzimmer", "detail": "", "preis": "ab 1.569 €"}, {"name": "Doppelzimmer groß", "detail": "", "preis": "ab 1.717 €"}, {"name": "Doppelzimmer-Appartement I", "detail": "", "preis": "ab 1.802 €"}, {"name": "Doppelzimmer-Appartement II", "detail": "", "preis": "ab 2.015 €"}, {"name": "Suite", "detail": "", "preis": "ab 2.185 €"}]}, {"typ": "text", "text": "Die Preise gelten pro Person. Die 15 % Jubiläumsrabatt sind bereits in den Preisen berücksichtigt.", "ausr": "mitte"}, {"typ": "knopf", "text": "Anrufen: +49 (0) 7442 47-0", "link": TEL}]}; } },
    { key: "warteliste", n: "Gourmet-Special", wo: "an Anfragen", foto: "u-gericht", bau() { return {"betreff": "Ihr Gourmet-Special im Bareiss", "vorschau": "Vier Übernachtungen und ein Mittagsmenu im 3-Sterne-Restaurant Bareiss mit 3 Glas korrespondierender Weine.", "versand": "anderes", "kopf": {"foto": "u-gericht", "alt": "Ein Gericht von Claus-Peter Lumpp"}, "fuss": {"abmelden": false}, "bloecke": [{"typ": "titel", "ueber": "Gourmeturlaub im Schwarzwald", "titel": "Gourmet-Special.", "unter": ""}, {"typ": "text", "text": "Guten Tag,\n\nvielen Dank für Ihre Anfrage. Das gehört zum Gourmet-Special:", "ausr": "links"}, {"typ": "liste", "titel": "", "eintraege": [{"name": "4 Übernachtungen im Rahmen der Bareiss Halbpension", "detail": "", "preis": ""}, {"name": "ein Mittagsmenu im 3-Sterne-Restaurant Bareiss mit 3 Glas korrespondierender Weine", "detail": "", "preis": ""}, {"name": "ein handsigniertes Exemplar »Nahaufnahmen« von Claus-Peter Lumpp und Stefan Leitner", "detail": "", "preis": ""}, {"name": "das Lieblingssalz von Claus-Peter Lumpp aus der Bareiss Genussmanufaktur für zuhause", "detail": "", "preis": ""}]}, {"typ": "liste", "titel": "Arrangementpreis für 5 Tage / 4 Nächte", "eintraege": [{"name": "Einzelzimmer", "detail": "", "preis": "ab 1.490 €"}, {"name": "Einzelzimmer-Appartement", "detail": "", "preis": "ab 1.650 €"}, {"name": "Doppelzimmer", "detail": "", "preis": "ab 1.510 €"}, {"name": "Doppelzimmer groß", "detail": "", "preis": "ab 1.650 €"}, {"name": "Doppelzimmer-Appartement I", "detail": "", "preis": "ab 1.730 €"}, {"name": "Doppelzimmer-Appartement II", "detail": "", "preis": "ab 1.830 €"}, {"name": "Suite", "detail": "", "preis": "ab 2.090 €"}]}, {"typ": "text", "text": "Anreise Montag oder Dienstag; Feiertage ausgenommen und jeweils vorbehaltlich Verfügbarkeit. Nicht buchbar vom 27.07. bis 30.08.2026.", "ausr": "mitte"}, {"typ": "knopf", "text": "Anrufen: +49 (0) 7442 47-0", "link": TEL}]}; } },
    { key: "rueckblick", n: "Advent und Weihnachten", wo: "an alle Gäste", foto: "k-ziegen-schnee", bau() { return {"betreff": "Advent und Weihnachten im Bareiss", "vorschau": "Der Bareiss Winterwald ab dem 22. November, der Christkindlmarkt, die Weihnachtsfeier und der Silvesterball.", "versand": "mailchimp", "kopf": {"foto": "k-ziegen-schnee", "alt": "Zwergziegen im Streichelzoo im Winter"}, "fuss": {"abmelden": true}, "bloecke": [{"typ": "titel", "ueber": "Aus dem Kalender des Hauses", "titel": "Advent und Weihnachten.", "unter": ""}, {"typ": "text", "text": "Das ganze Haus ist festlich geschmückt, durch alle Räume zieht ein süßer Duft und mit ein wenig Glück ist die Landschaft ringsum glitzernd in Winterweiß eingeschneit.", "ausr": "mitte"}, {"typ": "termine", "titel": "Die Termine", "eintraege": [{"wann": "22. November", "was": "Start des Bareiss Winterwaldes", "wo": ""}, {"wann": "26. November", "was": "Bezaubernder Abend im Morlokhof", "wo": ""}, {"wann": "29. November", "was": "Start des Christkindlmarkts", "wo": ""}, {"wann": "29. November", "was": "Adventskonzert in der Christuskirche", "wo": ""}, {"wann": "3. Dezember", "was": "Traditionsreicher Abend im Morlokhof", "wo": ""}, {"wann": "10. Dezember", "was": "Das Petermännle zu Besuch auf dem Morlokhof", "wo": ""}, {"wann": "24. Dezember", "was": "Festliche Weihnachtsfeier mit Konzert in der Hotelhalle", "wo": ""}, {"wann": "25. Dezember", "was": "Kinderweihnacht mit Fackelwanderung und Besuch vom Christkind", "wo": ""}, {"wann": "31. Dezember", "was": "Silvesterball mit großem Bareiss-Feuerwerk", "wo": ""}]}, {"typ": "foto", "foto": "g-winter", "alt": "Das Hotel Bareiss im Winter", "unterschrift": "Das Hotel Bareiss im Winter", "voll": false}, {"typ": "knopf", "text": "Zimmer anfragen", "link": BUCHEN}]}; } },
    { key: "einladung", n: "Restaurant Bareiss", wo: "an alle Gäste", foto: "r-tisch", bau() { return {"betreff": "Restaurant Bareiss: das Mittagsmenu", "vorschau": "Claus-Peter Lumpp, drei Michelin-Sterne: Donnerstag bis Sonntag mittags ab 12.00 Uhr und abends ab 19.00 Uhr.", "versand": "mailchimp", "kopf": {"foto": "r-saal", "alt": "Das Restaurant Bareiss mit Kamin und Rautenfenstern"}, "fuss": {"abmelden": true}, "bloecke": [{"typ": "titel", "ueber": "Drei Michelin-Sterne", "titel": "Das Mittagsmenu.", "unter": "von Claus-Peter Lumpp"}, {"typ": "text", "text": "Guten Tag,\n\nunser 3-Sterne-Restaurant Bareiss ist derzeit Donnerstag bis Sonntag, mittags ab 12.00 Uhr und abends ab 19.00 Uhr geöffnet. Das Mittagsmenu:", "ausr": "links"}, {"typ": "liste", "titel": "", "eintraege": [{"name": "Apéro Etagère", "detail": "", "preis": ""}, {"name": "Kaltes & warmes Amuse Bouche", "detail": "", "preis": ""}, {"name": "Marinierter Kingfisch", "detail": "mit Karotte, roter Shiso und Yuzu", "preis": ""}, {"name": "Gebratener Lammrücken", "detail": "mit Spitzkohl, konfierter Kartoffel und Thymianglace", "preis": ""}, {"name": "Lammschulter", "detail": "mit Chipotle und Salat vom Spitzkohl", "preis": ""}, {"name": "Birnen-Schokoladentörtchen", "detail": "mit Williamsbirnensorbet, Praliné und Karamelleis", "preis": ""}, {"name": "Friandises", "detail": "", "preis": ""}, {"name": "Confiserie & Pralinen vom Wagen", "detail": "", "preis": ""}]}, {"typ": "text", "text": "195 €", "ausr": "mitte"}, {"typ": "foto", "foto": "r-tisch", "alt": "Ein gedeckter Tisch im Restaurant Bareiss vor dem Rautenfenster", "unterschrift": "", "voll": false}, {"typ": "knopf", "text": "Tisch reservieren: +49 (0) 7442 47-0", "link": TEL}]}; } },
    { key: "ticket", n: "Reservierung", wo: "Bestätigungsmail", foto: "herz-tuer", bau() { return {"betreff": "Ihr Zimmer ist reserviert", "vorschau": "Wir freuen uns auf Ihren Besuch im Hotel Bareiss: der Kulinarische Ferientag von 7.00 Uhr bis zum Mitternachtsimbiss.", "versand": "anderes", "kopf": {"foto": "herz-tuer", "alt": "Ein rotes Herz mit «Herzlich willkommen» an einer Zimmertür"}, "fuss": {"abmelden": false}, "bloecke": [{"typ": "titel", "ueber": "Hotel Bareiss", "titel": "Ihr Zimmer ist reserviert.", "unter": ""}, {"typ": "text", "text": "Guten Tag,\n\nwir freuen uns auf Ihren Besuch im Hotel Bareiss in Baiersbronn-Mitteltal. Was immer Sie zu uns führt, wir heißen Sie herzlich willkommen in der Familie. Der Kulinarische Ferientag der Bareiss Halbpension:"}, {"typ": "termine", "titel": "", "eintraege": [{"wann": "ab 7.00 Uhr", "was": "Erlesene Kleinigkeiten, Tee und Kaffee in der Pooloase", "wo": ""}, {"wann": "8.00 bis 11.30 Uhr", "was": "Das Bareiss Frühstücksbuffet", "wo": ""}, {"wann": "Nachmittag", "was": "Kuchen und Gebäck", "wo": ""}, {"wann": "19.00 bis 20.00 Uhr", "was": "Dinner in den Hotelgast-Restaurants", "wo": ""}, {"wann": "Am späten Abend", "was": "Mitternachtsimbiss an der Hotelbar", "wo": ""}]}, {"typ": "text", "text": "Hotel Bareiss · Hermine-Bareiss-Weg 1 (vormals Gärtenbühlweg 14) · 72270 Baiersbronn-Mitteltal"}, {"typ": "knopf", "text": "Anrufen: +49 (0) 7442 47-0", "link": TEL}]}; } },
    { key: "danke", n: "Dankeschön", wo: "Dankesmail", foto: "teich-tag", bau() { return {"betreff": "Danke für Ihren Besuch", "vorschau": "Gastfreundschaft, die von Herzen kommt. Haben Sie Freude – lassen Sie es sich richtig gut gehen bei uns!", "versand": "anderes", "kopf": {"foto": "teich-tag", "alt": "Das Hotel Bareiss am Naturschwimmteich"}, "fuss": {"abmelden": false}, "bloecke": [{"typ": "titel", "ueber": "Hotel Bareiss", "titel": "Danke für Ihren Besuch.", "unter": ""}, {"typ": "text", "text": "Gastfreundschaft, die von Herzen kommt. Vertrautheit, die durch persönliche Zugewandtheit entsteht.", "ausr": "mitte"}, {"typ": "trenner"}, {"typ": "text", "text": "Was immer Sie zu uns führt, wir heißen Sie herzlich willkommen in der Familie. Haben Sie Freude – lassen Sie es sich richtig gut gehen bei uns!", "ausr": "mitte"}, {"typ": "knopf", "text": "Einen Gutschein verschenken", "link": GUTSCHEIN}]}; } },
    { key: 'leer', n: 'Leere E-Mail', wo: 'selbst aufbauen', foto: '', bau() {
      return { betreff: '', vorschau: '', versand: 'mailchimp', kopf: { foto: '' }, fuss: { abmelden: true },
        bloecke: [{ typ: 'titel', ueber: 'Hotel Bareiss', titel: 'Titel', unter: '' }, { typ: 'text', text: 'Ihr Text.' }] };
    } },
  ];

  const ARTEN = {
    titel: { n: 'Titel', ic: '<path d="M5 6h14M12 6v13"/>', neu: () => ({ typ: 'titel', ueber: 'Hotel Bareiss', titel: 'Titel', unter: '' }) },
    text: { n: 'Text', ic: '<path d="M4 6h16M4 10h16M4 14h16M4 18h10"/>', neu: () => ({ typ: 'text', text: 'Ihr Text.' }) },
    foto: { n: 'Foto', ic: '<path d="M4 5h16v14H4zM4 16l5-5 4 4 2.5-2.5L20 17"/>', neu: () => ({ typ: 'foto', foto: 'teich-tag', alt: 'Das Hotel Bareiss am Naturschwimmteich', unterschrift: '', voll: false }) },
    knopf: { n: 'Knopf', ic: '<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M14 12h3m-1.5-1.5L17 12l-1.5 1.5"/>', neu: () => ({ typ: 'knopf', text: 'Mehr erfahren', link: WEB }) },
    termine: { n: 'Termine', ic: '<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>', neu: () => ({ typ: 'termine', titel: '', eintraege: [{ wann: 'ab 7.00 Uhr', was: 'Pooloase', wo: '' }] }) },
    liste: { n: 'Preisliste', ic: '<path d="M4 7h11M4 12h11M4 17h11M18 7h2M18 12h2M18 17h2"/>', neu: () => ({ typ: 'liste', titel: '', eintraege: [{ name: 'Das Mittagsmenu', detail: 'Restaurant Bareiss', preis: '195 €' }] }) },
    trenner: { n: 'Zierlinie', ic: '<path d="M3 12h6M15 12h6M12 9l3 3-3 3-3-3z"/>', neu: () => ({ typ: 'trenner' }) },
  };

  /* ---------- Ablage im Browser ---------- */
  const lies = () => { try { return JSON.parse(localStorage.getItem('ds-bareiss-mails') || '[]'); } catch (e) { return []; } };
  const schreib = l => { try { localStorage.setItem('ds-bareiss-mails', JSON.stringify(l)); } catch (e) {} };
  let doc = null, id = null, wahl = null, geraet = 600, speicherT = 0;
  function neu(v) { doc = Object.assign({ name: v.n }, v.bau()); doc.vorlage = v.key; id = null; wahl = null; zeichne(); zeigeWahl(); markiere(); }
  function oeffne(e) { doc = JSON.parse(JSON.stringify(e.doc)); id = e.id; wahl = null; zeichne(); zeigeWahl(); markiere(); }
  let zeichneT = 0;
  function geaendert() {
    clearTimeout(zeichneT); zeichneT = setTimeout(() => zeichne(true), 140);
    clearTimeout(speicherT); speicherT = setTimeout(() => {
      const l = lies(); if (!id) id = 'm' + Date.now().toString(36);
      const e = { id, name: doc.name, vorlage: doc.vorlage, geaendert: Date.now(), doc };
      const i = l.findIndex(x => x.id === id); if (i >= 0) l[i] = e; else l.unshift(e);
      schreib(l); zeichneMeine(); markiere(); $('#mlGespeichert').classList.add('an'); setTimeout(() => $('#mlGespeichert').classList.remove('an'), 1400);
    }, 400);
  }

  /* ---------- Vorschau ---------- */
  let ifrScroll = 0;
  function zeichne(behalte) {
    const f = $('#mlRahmen'); if (behalte && f.contentWindow) ifrScroll = f.contentWindow.scrollY || 0;
    f.srcdoc = DSMAIL.html(doc, { basis: LOKAL, editor: true, M });
    $('#mlBetreff').textContent = doc.betreff || 'Kein Betreff';
    $('#mlVorschau').textContent = doc.vorschau || '';
    $('#mlName').value = doc.name || '';
    pruefung();
  }
  function rahmenGeladen() {
    const f = $('#mlRahmen'), d = f.contentDocument; if (!d || !d.body) return;
    const hoehe = () => { const t = d.body && d.body.querySelector('table'); f.style.height = Math.max(600, Math.ceil(t ? t.getBoundingClientRect().height : d.documentElement.scrollHeight)) + 'px'; };   /* Höhe der E-Mail selbst: sonst blieb unter dem Fuß ein leerer Streifen (Robert 10.11.2026) */
    hoehe(); d.querySelectorAll('img').forEach(i => i.complete || i.addEventListener('load', hoehe));
    if (d.fonts) d.fonts.ready.then(hoehe);
    if (wahl != null) { const el = d.querySelector(`[data-b="${wahl}"]`); if (el) el.classList.add('an'); }
    d.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = f.getBoundingClientRect(), k = r.width / f.offsetWidth; kippe(r.left + e.clientX * k, r.top + e.clientY * k); });
    d.addEventListener('click', e => { e.preventDefault(); const t = e.target.closest('[data-b]'); if (!t) return; const b = t.dataset.b; waehle(/^\d+$/.test(b) ? +b : b); });
  }
  /* 3D wie die Kacheln der Startseite: das Blatt neigt sich zur Maus, Licht wandert mit; gedreht wird um die Mitte des sichtbaren Ausschnitts */
  let kippRaf = 0, kippXY = null;
  function kippe(cx, cy) {
    kippXY = [cx, cy]; if (kippRaf) return;
    kippRaf = requestAnimationFrame(() => {
      kippRaf = 0; const b = $('#mlBlatt'), m = $('.ml-mitte'); if (!b || !kippXY) return;
      const r = b.getBoundingClientRect(), mr = m.getBoundingClientRect(), [x0, y0] = kippXY;
      const x = Math.max(-.5, Math.min(.5, (x0 - r.left) / r.width - .5)), y = Math.max(-.5, Math.min(.5, (y0 - mr.top) / mr.height - .5));
      b.style.transformOrigin = `50% ${Math.round(mr.top + mr.height / 2 - r.top)}px`;
      b.classList.add('kipp');
      b.style.setProperty('--ry', (x * 5).toFixed(2) + 'deg'); b.style.setProperty('--rx', (-y * 3.5).toFixed(2) + 'deg');
      b.style.setProperty('--gx', Math.round(x0 - r.left) + 'px'); b.style.setProperty('--gy', Math.round(y0 - r.top) + 'px');
    });
  }
  function loeseKipp() { kippXY = null; const b = $('#mlBlatt'); if (!b) return; b.classList.remove('kipp'); ['--rx', '--ry'].forEach(v => b.style.removeProperty(v)); }
  function markiereRahmen() { const d = $('#mlRahmen').contentDocument; if (!d) return; d.querySelectorAll('[data-b]').forEach(el => el.classList.toggle('an', String(wahl) === el.dataset.b)); }

  /* ---------- Rechte Platte: Baustein bearbeiten ---------- */
  const feld = (k, n, val, art = 'input', extra = '') => art === 'textarea'
    ? `<label class="ml-f"><span>${n}</span><textarea data-k="${k}" rows="${extra || 5}">${esc(val)}</textarea></label>`
    : `<label class="ml-f"><span>${n}</span><textarea class="ml-zeile" rows="1" data-k="${k}" spellcheck="${/link|url/.test(k) ? 'false' : 'true'}"${extra}>${esc(val)}</textarea></label>`;   // eine Zeile, die mitwächst statt den Text abzuschneiden (Messlauf 29.10.)
  /* Felder wachsen mit ihrem Text (Messlauf 29.10.2026: Vorschauzeile und Betreff ragten aus dem Kasten) */
  const wachse = box => (box || document).querySelectorAll('#mlFelder textarea').forEach(t => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; });
  const ausr = (b, std) => `<label class="ml-f"><span>Ausrichtung</span><select data-k="ausr"><option value="mitte"${(b.ausr || std) === 'mitte' ? ' selected' : ''}>Mittig</option><option value="links"${(b.ausr || std) === 'links' ? ' selected' : ''}>Linksbündig</option></select></label>`;
  function fotoFeld(b, kopf) {
    const src = b.url ? b.url : (b.foto ? DSMAIL.bildUrl(b.foto, LOKAL) : '');
    return `<div class="ml-f"><span>Foto</span><button class="ml-foto" data-akt="foto">${src ? `<img src="${esc(src)}" alt="">` : '<i>Kein Foto</i>'}<b>Foto wählen</b></button>
      ${kopf && (b.foto || b.url) ? '<button class="ml-mini" data-akt="ohnefoto">Ohne Kopfbild</button>' : ''}</div>
      ${feld('alt', 'Bildbeschreibung (für Mailprogramme ohne Bilder)', b.alt || '')}
      <details class="ml-mehr"${b.url ? ' open' : ''}><summary>Eigenes Foto über eine Adresse</summary>${feld('url', 'Bildadresse (https://…, zum Beispiel aus Mailchimp)', b.url || '')}</details>`;
  }
  function eintraege(b) {
    const sp = b.typ === 'termine' ? [['wann', 'Wann'], ['was', 'Was'], ['wo', 'Wo / Zusatz']] : [['name', 'Name'], ['detail', 'Beschreibung'], ['preis', 'Preis']];
    return `<div class="ml-eintraege">${(b.eintraege || []).map((e, j) => `<div class="ml-eintrag" data-j="${j}"><div class="ml-eintrag__kopf"><em>${j + 1}</em>
      <button class="rund rund--klein" data-akt="ehoch" title="Nach oben" ${j ? '' : 'disabled'}><svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg></button>
      <button class="rund rund--klein" data-akt="eweg" title="Entfernen" aria-label="Entfernen"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg></button></div>
      ${sp.map(([k, n]) => `<label class="ml-f ml-f--klein"><span>${n}</span><input type="text" data-e="${k}" value="${esc(e[k] || '')}"></label>`).join('')}</div>`).join('')}
      <button class="kn kn--klein kn--ohne ml-dazu" data-akt="edazu"><span>Eintrag hinzufügen</span></button></div>`;
  }
  function zeigeWahl() {
    const box = $('#mlFelder'), n = (doc.bloecke || []).length;
    if (wahl == null || wahl === 'mail') {
      box.innerHTML = `<div class="ml-kopfzeile"><h2><small>Einstellungen</small>Die E-Mail</h2></div>
        ${feld('name', 'Name in Ihrer Ablage', doc.name || '')}
        ${feld('betreff', 'Betreff', doc.betreff || '')}
        ${feld('vorschau', 'Vorschauzeile (erscheint im Posteingang nach dem Betreff)', doc.vorschau || '', 'textarea', 2)}
        <label class="ml-f"><span>Verschickt mit</span><select data-k="versand">${Object.entries(DSMAIL.VERSAND).map(([k, v]) => `<option value="${k}"${doc.versand === k ? ' selected' : ''}>${v.name}</option>`).join('')}</select></label>
        <p class="ml-leise ml-versand">Die Werkstatt verschickt selbst nichts. Wählen Sie hier das Programm, mit dem Sie Ihren Newsletter schon verschicken: Die Werkstatt setzt den Abmeldelink so, wie dieses Programm ihn braucht, und gibt Ihnen die fertige Mail zum Einfügen dort. Haben Sie kein solches Programm, wählen Sie «Anderes Programm»: Dann steht im Fuß [Abmeldelink], den ersetzen Sie vor dem Versand durch Ihren eigenen Link.</p>
        <p class="ml-leise ml-tipp">Tipp: Tippen Sie in der Vorschau einen Teil der E-Mail an, öffnet er sich hier zum Bearbeiten.</p>`;   // Versand und Bearbeiten getrennt erklärt (Robert 29.10.2026)
    } else if (wahl === 'kopf') {
      box.innerHTML = `<div class="ml-kopfzeile"><h2><small>Teil der E-Mail</small>Kopf</h2></div><p class="ml-leise">Oben stehen Zeichen und Name des Hauses, darunter das Kopfbild.</p>${fotoFeld(doc.kopf || {}, true)}`;
    } else if (wahl === 'fuss') {
      const f = doc.fuss || {};
      box.innerHTML = `<div class="ml-kopfzeile"><h2><small>Teil der E-Mail</small>Fuß</h2></div><p class="ml-leise">Adresse, Telefon, E-Mail und Website des Hauses stehen fest im Fuß.</p>
        <label class="haken"><input type="checkbox" data-k="abmelden"${f.abmelden !== false ? ' checked' : ''}> Abmeldelink zeigen (Pflicht bei Newslettern)</label>
        ${feld('text', 'Zusatz im Fuß (freiwillig)', f.text || '', 'textarea', 2)}`;
    } else {
      const b = doc.bloecke[wahl]; if (!b) { wahl = null; return zeigeWahl(); }
      let f = '';
      if (b.typ === 'titel') f = feld('ueber', 'Kleine Zeile darüber', b.ueber || '') + feld('titel', 'Titel', b.titel || '') + feld('unter', 'Unterzeile kursiv', b.unter || '') + ausr(b, 'mitte');
      if (b.typ === 'text') f = feld('text', 'Text (Leerzeile = neuer Absatz)', b.text || '', 'textarea', 8) + ausr(b, 'links');
      if (b.typ === 'foto') f = fotoFeld(b) + `<label class="haken"><input type="checkbox" data-k="voll"${b.voll ? ' checked' : ''}> Über die ganze Breite</label>` + feld('unterschrift', 'Bildunterschrift (freiwillig)', b.unterschrift || '') + feld('link', 'Link beim Antippen (freiwillig)', b.link || '');
      if (b.typ === 'knopf') f = feld('text', 'Beschriftung', b.text || '') + feld('link', 'Adresse (https://… oder tel:)', b.link || '')
        + `<div class="ml-chips"><button data-akt="lnk" data-l="${WEB}">Website</button><button data-akt="lnk" data-l="${TEL}">Telefon</button></div>`;
      if (b.typ === 'termine' || b.typ === 'liste') f = feld('titel', 'Überschrift (freiwillig)', b.titel || '') + eintraege(b);
      if (b.typ === 'trenner') f = '<p class="ml-leise">Eine feine Linie mit dem Zeichen des Hauses.</p>';
      box.innerHTML = `<div class="ml-kopfzeile"><h2><small>Baustein</small>${String(ARTEN[b.typ].n).replace(/ (\S+)$/, '\u00a0$1')}</h2><span class="ml-werk">
        <button class="rund rund--klein" data-akt="hoch" title="Nach oben" ${wahl ? '' : 'disabled'}><svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg></button>
        <button class="rund rund--klein" data-akt="runter" title="Nach unten" ${wahl < n - 1 ? '' : 'disabled'}><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>
        <button class="rund rund--klein" data-akt="doppeln" title="Doppeln"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg></button>
        <button class="rund rund--klein" data-akt="weg" title="Entfernen"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/></svg></button></span></div>${f}`;
    }
    $$('.ml-nav [data-teil]').forEach(x => x.classList.toggle('an', String(wahl ?? 'mail') === x.dataset.teil));
  }
  function waehle(w) { wahl = w; zeigeWahl(); markiereRahmen(); }
  function ziel() { if (wahl === 'kopf') return doc.kopf = doc.kopf || {}; if (wahl === 'fuss') return doc.fuss = doc.fuss || {}; if (wahl == null || wahl === 'mail') return doc; return doc.bloecke[wahl]; }

  function eingabe(e) {
    const t = e.target, z = ziel(); if (!z) return;
    if (t.dataset.k) { const k = t.dataset.k; z[k] = t.type === 'checkbox' ? t.checked : t.value; if (k === 'url' && t.value.trim()) z.foto = z.foto; }
    else if (t.dataset.e) { const j = +t.closest('[data-j]').dataset.j; z.eintraege[j][t.dataset.e] = t.value; }
    else return;
    geaendert();
  }
  function aktion(a, el) {
    const bl = doc.bloecke, z = ziel();
    if (a === 'hoch' || a === 'runter') { const j = wahl + (a === 'hoch' ? -1 : 1); [bl[wahl], bl[j]] = [bl[j], bl[wahl]]; wahl = j; }
    else if (a === 'doppeln') { bl.splice(wahl + 1, 0, JSON.parse(JSON.stringify(bl[wahl]))); wahl++; }
    else if (a === 'weg') { bl.splice(wahl, 1); wahl = bl.length ? Math.min(wahl, bl.length - 1) : null; }
    else if (a === 'edazu') { z.eintraege.push(z.typ === 'termine' ? { wann: '', was: '', wo: '' } : { name: '', detail: '', preis: '' }); }
    else if (a === 'eweg') { z.eintraege.splice(+el.closest('[data-j]').dataset.j, 1); }
    else if (a === 'ehoch') { const j = +el.closest('[data-j]').dataset.j; [z.eintraege[j - 1], z.eintraege[j]] = [z.eintraege[j], z.eintraege[j - 1]]; }
    else if (a === 'lnk') { z.link = el.dataset.l; }
    else if (a === 'ohnefoto') { z.foto = ''; z.url = ''; }
    else if (a === 'foto') return fotoWahl();
    else return;
    zeigeWahl(); geaendert();
  }
  function einfuegen(typ) {
    const b = ARTEN[typ].neu(), pos = typeof wahl === 'number' ? wahl + 1 : (wahl === 'kopf' ? 0 : doc.bloecke.length);
    doc.bloecke.splice(pos, 0, b); wahl = pos; zeigeWahl(); geaendert();
    setTimeout(() => { const d = $('#mlRahmen').contentDocument, el = d && d.querySelector(`[data-b="${pos}"]`); if (el) el.scrollIntoView({ block: 'center' }); }, 250);
  }

  /* ---------- Fotos des Hauses ---------- */
  let fGruppe = 'Alle';
  function fotoWahl() {
    const dlg = $('#mlFotos'), gruppen = ['Alle', ...new Set(M.bilder.map(b => b.gruppe))];
    $('#mlFotoGruppen').innerHTML = gruppen.map(g => `<button data-g="${esc(g)}" class="${g === fGruppe ? 'an' : ''}">${esc(g)}</button>`).join('');
    fotoRaster(); dlg.showModal(); $('#mlFotoSuche').focus();
  }
  function fotoRaster() {
    const q = $('#mlFotoSuche').value.trim().toLowerCase(), z = ziel() || {};
    const l = M.bilder.filter(b => (fGruppe === 'Alle' || b.gruppe === fGruppe) && (!q || (b.alt + ' ' + b.key + ' ' + b.gruppe).toLowerCase().includes(q)));
    $('#mlFotoRaster').innerHTML = l.map(b => `<button data-foto="${b.key}" class="${z.foto === b.key && !z.url ? 'an' : ''}" title="${esc(b.alt)}"><img loading="lazy" src="haeuser/bareiss/mini/${b.key}.webp" alt=""><span>${esc(b.alt)}</span></button>`).join('') || '<p class="ml-leise">Nichts gefunden.</p>';
  }

  /* ---------- Prüfung, Ausgabe ---------- */
  function pruefung() {
    const p = DSMAIL.pruefe(doc), z = $('#mlPruefZahl');
    z.textContent = p.length; z.parentElement.classList.toggle('gut', !p.length);
    $('#mlPruefListe').innerHTML = p.length ? p.map(x => `<button data-zu="${x.b}"><i></i><span>${esc(x.t)}</span></button>`).join('') : '<p class="ml-gut">Alles bereit zum Versand.</p>';
  }
  const dateiname = () => (doc.name || 'E-Mail').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.html';
  const fertig = () => DSMAIL.html(doc, { M });
  function hinweis(t) { const h = $('#mlHinweis'); h.innerHTML = t; h.hidden = false; h.classList.remove('an'); void h.offsetWidth; h.classList.add('an'); clearTimeout(h._t); h._t = setTimeout(() => { h.hidden = true; }, 5200); }
  async function kopiere() {
    const h = fertig();
    try { await navigator.clipboard.writeText(h); }
    catch (e) { const t = document.createElement('textarea'); t.value = h; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    const p = DSMAIL.pruefe(doc).length;
    hinweis(`<b>HTML kopiert.</b> Im Versandprogramm die Gestaltung mit eigenem Code wählen und einfügen.${p ? ` Vorher noch ${p} ${p === 1 ? 'Punkt' : 'Punkte'} der Prüfung erledigen.` : ''}`);
  }
  function speichere() {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([fertig()], { type: 'text/html;charset=utf-8' })); a.download = dateiname();
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    hinweis(`<b>${esc(dateiname())}</b> gespeichert. Die Datei lässt sich im Browser öffnen oder im Versandprogramm hochladen.`);
  }

  /* ---------- Linke Platte: Vorlagen, Meine E-Mails, Teile ---------- */
  function zeichneVorlagen() {
    $('#mlVorlagen').innerHTML = VORLAGEN.map(v => `<button data-vorlage="${v.key}"><span class="ml-vb"${v.foto ? ` style="background-image:url('haeuser/bareiss/mini/${v.foto}.webp')"` : ''}></span><span><b>${esc(v.n).replace(/ (\S+)$/, '\u00a0$1')}</b><small>${esc(v.wo)}</small></span></button>`).join('');
  }
  function zeichneMeine() {
    const l = lies(); $('#mlMeineZahl').textContent = l.length; $('#mlMeineBox').hidden = !l.length;
    $('#mlMeine').innerHTML = l.map(e => `<div class="ml-meine__e" data-id="${e.id}"><button data-mail="${e.id}"><b>${esc(e.name || 'E-Mail')}</b><small>${new Date(e.geaendert).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></button><button class="ml-x" data-loesch="${e.id}" title="Löschen" aria-label="Löschen"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg></button></div>`).join('');
  }
  function markiere() {
    $$('#mlVorlagen [data-vorlage]').forEach(b => b.classList.toggle('an', !id && doc.vorlage === b.dataset.vorlage));
    $$('#mlMeine [data-mail]').forEach(b => b.classList.toggle('an', id === b.dataset.mail));
  }

  async function los() {
    M = await (await fetch('haeuser/bareiss/marke.json')).json();
    const z = M.zeichen, svg = `<svg viewBox="${z.vb.join(' ')}">${z.pfade.map(d => `<path d="${d}"/>`).join('')}</svg>`;
    $('#mlZeichen').innerHTML = svg; $('#mlKapitelZeichen').innerHTML = svg;
    zeichneVorlagen(); zeichneMeine();
    $('#mlEinfuegen').innerHTML = Object.entries(ARTEN).map(([k, a]) => `<button data-neu="${k}"><svg viewBox="0 0 24 24">${a.ic}</svg><span>${String(a.n).replace(/ (\S+)$/, '\u00a0$1')}</span></button>`).join('');
    const q = new URLSearchParams(location.search), v = VORLAGEN.find(x => x.key === q.get('vorlage')), l = lies();
    const gesp = l.find(x => x.id === q.get('mail'));
    if (gesp) oeffne(gesp); else if (v) neu(v); else if (l.length) oeffne(l[0]); else neu(VORLAGEN[0]);

    $('#mlRahmen').addEventListener('load', () => { rahmenGeladen(); const w = $('#mlRahmen').contentWindow; if (ifrScroll) { w.scrollTo(0, ifrScroll); } });
    $('#mlFelder').addEventListener('input', eingabe); $('#mlFelder').addEventListener('change', eingabe);
    $('#mlFelder').addEventListener('input', e => { if (e.target.tagName === 'TEXTAREA') wachse(); });
    $('#mlFelder').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.classList.contains('ml-zeile')) { e.preventDefault(); e.target.blur(); } });
    new MutationObserver(() => requestAnimationFrame(() => wachse())).observe($('#mlFelder'), { childList: true }); addEventListener('resize', () => wachse()); wachse(); document.fonts.ready.then(() => wachse());
    document.addEventListener('click', e => {
      const t = e.target;
      const ak = t.closest('[data-akt]'); if (ak && !ak.disabled) return aktion(ak.dataset.akt, ak);
      const vo = t.closest('[data-vorlage]'); if (vo) return neu(VORLAGEN.find(x => x.key === vo.dataset.vorlage));
      const me = t.closest('[data-mail]'); if (me) return oeffne(lies().find(x => x.id === me.dataset.mail));
      const lo = t.closest('[data-loesch]'); if (lo) { if (!confirm('Diese E-Mail aus der Ablage löschen?')) return; schreib(lies().filter(x => x.id !== lo.dataset.loesch)); if (id === lo.dataset.loesch) id = null; zeichneMeine(); markiere(); return; }
      const nb = t.closest('[data-neu]'); if (nb) return einfuegen(nb.dataset.neu);
      const te = t.closest('[data-teil]'); if (te) return waehle(te.dataset.teil);
      const zu = t.closest('[data-zu]'); if (zu) { $('#mlPruefen').open = false; const b = zu.dataset.zu; waehle(/^\d+$/.test(b) ? +b : b); return; }
      const ge = t.closest('[data-geraet]'); if (ge) { geraet = +ge.dataset.geraet; $$('[data-geraet]').forEach(x => x.classList.toggle('an', x === ge)); $('#mlBuehne').style.setProperty('--w', geraet + 'px'); $('#mlBuehne').classList.toggle('ml-handy', geraet < 600); setTimeout(rahmenGeladen, 80); return; }
      const fo = t.closest('[data-foto]'); if (fo) { const z = ziel(), b = M.bilder.find(x => x.key === fo.dataset.foto); z.foto = b.key; z.url = ''; z.alt = b.alt; $('#mlFotos').close(); zeigeWahl(); geaendert(); return; }
      const g = t.closest('#mlFotoGruppen [data-g]'); if (g) { fGruppe = g.dataset.g; $$('#mlFotoGruppen button').forEach(x => x.classList.toggle('an', x === g)); fotoRaster(); return; }
    });
    $('.ml-mitte').addEventListener('pointermove', e => { if (e.pointerType === 'mouse') kippe(e.clientX, e.clientY); });
    $('.ml-mitte').addEventListener('pointerleave', loeseKipp);
    $('#mlRahmen').addEventListener('pointerleave', e => { const m = $('.ml-mitte').getBoundingClientRect(); if (e.clientX < m.left || e.clientX > m.right) loeseKipp(); });
    $('#mlFotoSuche').addEventListener('input', fotoRaster);
    $('#mlFotoZu').addEventListener('click', () => $('#mlFotos').close());
    $('#mlFotos').addEventListener('click', e => { if (e.target === $('#mlFotos')) $('#mlFotos').close(); });
    $('#mlName').addEventListener('input', e => { doc.name = e.target.value; geaendert(); });
    $('#mlKopieren').addEventListener('click', kopiere);
    $('#mlDatei').addEventListener('click', speichere);
    $('#mlFenster').addEventListener('click', () => { const w = window.open('', '_blank'); if (w) { w.document.open(); w.document.write(DSMAIL.html(doc, { basis: LOKAL, M })); w.document.close(); } });
    document.addEventListener('click', e => { const p = $('#mlPruefen'); if (p.open && !e.target.closest('#mlPruefen')) p.open = false; });
    document.body.classList.add('an');
    /* K5 (Tor 2, 30.10.2026): reicht die mittlere Spalte nicht (z. B. 1000 px), wird die Vorschau als Ganzes kleiner, nie angeschnitten und nie seitlich scrollend */
    let passt = false;
    const passe = () => { if (passt) return; const m = $('.ml-mitte'), b = $('#mlBuehne'); if (!m || !b) return; passt = true;
      Object.assign(b.style, { scale: '', transformOrigin: '', marginLeft: '', marginRight: '', marginBottom: '' });   // zoom schneidet in Safari das iframe ab, darum scale mit ausgeglichenen Rändern
      if (innerWidth > 980) { const g = getComputedStyle(m), frei = m.clientWidth - parseFloat(g.paddingLeft) - parseFloat(g.paddingRight), W = b.offsetWidth, H = b.offsetHeight, z = Math.min(1, frei / W);
        if (z < 1) Object.assign(b.style, { scale: z.toFixed(3), transformOrigin: '50% 0', marginLeft: `${-(W - z * W) / 2}px`, marginRight: `${-(W - z * W) / 2}px`, marginBottom: `${-(H - z * H)}px` }); }
      requestAnimationFrame(() => { passt = false; }); };
    addEventListener('resize', passe); new MutationObserver(passe).observe($('#mlBuehne'), { attributes: true, attributeFilter: ['style', 'class'] }); passe();
  }
  window.__ML = { get doc() { return doc; }, VORLAGEN, neu: k => neu(VORLAGEN.find(x => x.key === k)), html: o => DSMAIL.html(doc, o || { M }) };
  los();
})();
