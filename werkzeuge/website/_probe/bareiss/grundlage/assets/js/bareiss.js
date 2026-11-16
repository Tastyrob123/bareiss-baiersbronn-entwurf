/* Hotel Bareiss · Bewegung, Lader, Leiste, Auswahl
   Handschrift (Website-Bau Kern 3): deckend von unten herein, sobald der Bereich den Rand berührt (Weg am Scrollen über view()),
   danach zoomt das Foto in seinen Rahmen; Überschriften rollen zeilenweise aus dem Schlitz. Nur transform und opacity, nativer Scroll.
   Erster Blick komplett: Die Seite bleibt verdeckt, bis die Bilder im ersten Bildschirm geladen sind (nur load), dann alles in einem Moment. */
(function () {
  var D = document, H = D.documentElement, ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1 Erster Blick ---------------------------------------------------------------- */
  function imBild(el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && r.width > 2; }
  /* Schrift gehört zum ersten Blick: erst zeigen, wenn Bilder und beide Hausschriften fertig sind */
  var schrift = !(D.fonts && D.fonts.load), bilderFertig = false;
  if (!schrift) Promise.all([D.fonts.load('440 1em Serif'), D.fonts.load('400 1em Sans')]).then(function () { return D.fonts.ready; }, function () {}).then(function () { schrift = true; if (bilderFertig) zeigen(); });
  function zeigen() {
    bilderFertig = true; if (!schrift) return;
    if (H.classList.contains('bereit')) return;
    try { kopf(); } catch (e) {}
    H.classList.add('bereit'); H.classList.remove('laed');
    requestAnimationFrame(function () { requestAnimationFrame(function () { D.querySelectorAll('.kopf-auf [data-schlitz]').forEach(function (h) { h.classList.add('da'); }); }); });
    D.dispatchEvent(new Event('bareiss:bereit'));
  }
  function warten() {
    var erste = [].slice.call(D.querySelectorAll('img')).filter(function (i) { return i.getAttribute('loading') !== 'lazy' || imBild(i); });
    erste.forEach(function (i) { if (imBild(i)) { i.loading = 'eager'; i.decoding = 'sync'; } });
    erste = erste.filter(imBild);
    var offen = erste.filter(function (i) { return !(i.complete && i.naturalWidth); }).length;
    if (!offen) return zeigen();
    erste.forEach(function (i) {
      if (i.complete && i.naturalWidth) return;
      var f = function () { if (--offen <= 0) zeigen(); };
      i.addEventListener('load', f, { once: true }); i.addEventListener('error', f, { once: true });
    });
    setTimeout(zeigen, 6000);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', warten); else warten();

  /* 1b Kopf jeder Unterseite (Robert 13.11.2026: «wow, ich bin jetzt im nächsten Abschnitt»): beim Öffnen eines Bereichs zoomen die Bilder
     heran, der Titel rollt aus dem Schlitz, Zeile, Text und Knöpfe steigen nach. Bilder sind dabei schon fertig und deckend (erster Blick komplett). */
  function kopf() {
    var k = D.querySelector('main>section:first-child');
    if (!k || ruhig || k.classList.contains('auftakt') || k.classList.contains('skopf') || k.classList.contains('kopf-auf')) return;
    k.classList.add('kopf-auf');
    k.querySelectorAll('img').forEach(function (im) {
      if (im.closest('svg,button,.auswahl,dialog,.zsn-planklein')) return;
      var r = im.getBoundingClientRect(); if (r.width < 160 || r.height < 120) return;
      var p = im.parentElement, pr = p.getBoundingClientRect(), gleich = function (a) { return Math.abs(a.width - r.width) < 4 && Math.abs(a.height - r.height) < 4; };
      if (gleich(pr)) { if (getComputedStyle(p).overflow === 'visible') p.style.overflow = 'hidden'; im.classList.add('kopf-b'); return; }
      for (var a = p; a && a !== k.parentElement; a = a.parentElement) { if (getComputedStyle(a).overflow !== 'visible') { if (gleich(a.getBoundingClientRect())) im.classList.add('kopf-b'); return; } }
    });
    k.querySelectorAll('h1,h2').forEach(function (h) { if (h.closest('dialog,.auswahl')) return; h.setAttribute('data-schlitz', ''); zeilen(h); });
    var T = 'p,.marke,.knoepfe,ul,dl,small,svg.wappen,.wappen,blockquote,.buchung,.zr-tafel,.tafel,.zr-zeile';
    var stuecke = [].filter.call(k.querySelectorAll(T), function (e) {
      if (e.closest('h1,h2,dialog,.auswahl,button')) return false;
      if (e.querySelector('.kopf-b')) return false;
      var o = e.parentElement.closest(T); if (o && k.contains(o)) return false;
      return !!(e.offsetParent || e.getClientRects().length);
    });
    stuecke.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
    stuecke.forEach(function (e, i) { e.classList.add('kopf-t'); e.style.setProperty('--ki', Math.min(i, 6)); });
  }

  /* 2 Überschriften in Zeilen für den Schlitz ------------------------------------- */
  /* Überschriften enthalten nur Text, <br> und <span class="ak"> (zweite Hälfte in der Akzentfarbe). */
  function zeilen(h) {
    if (h.dataset.z) return; h.dataset.z = '1';
    var woerter = [];
    (function lauf(knoten, ak) {
      knoten.childNodes.forEach(function (n) {
        if (n.nodeType === 3) n.textContent.split(/\s+/).forEach(function (w) { if (w) woerter.push({ t: w, ak: ak }); });
        else if (n.nodeName === 'BR') woerter.push({ br: 1 });
        else lauf(n, ak || (n.classList && n.classList.contains('ak')));
      });
    })(h, false);
    h.textContent = '';
    var spans = [];
    woerter.forEach(function (w, i) {
      if (w.br) { h.appendChild(D.createElement('br')); return; }
      var s = D.createElement('span'); s.textContent = w.t; s.style.whiteSpace = 'nowrap'; if (w.ak) s.className = 'ak'; s._w = w;   /* Wort mit Bindestrich nie beim Messen trennen, sonst entsteht eine kurze Zeile */
      h.appendChild(s); h.appendChild(D.createTextNode(' ')); spans.push(s);
    });
    var rows = [], top = null;
    spans.forEach(function (s) { var t = s.offsetTop; if (top === null || Math.abs(t - top) > 4) { top = t; rows.push([]); } rows[rows.length - 1].push(s._w); });
    h.textContent = '';
    rows.forEach(function (r, i) {
      var z = D.createElement('span'); z.className = 'zl';
      var inn = D.createElement('span'); inn.className = 'zi'; inn.style.setProperty('--z', i);
      r.forEach(function (w, k) {
        var t = w.t + (k < r.length - 1 ? ' ' : '');
        if (w.ak) { var s = D.createElement('span'); s.className = 'ak'; s.textContent = t; inn.appendChild(s); }
        else inn.appendChild(D.createTextNode(t));
      });
      inn.normalize();
      z.appendChild(inn); h.appendChild(z);
    });
  }

  /* 3 Auftritte ---------------------------------------------------------------- */
  var io = null, vor = null;
  /* Auftritt erst, wenn die Bilder darin geladen und entpackt sind (höchstens 2,5 s, damit nichts hängen bleibt) */
  function bereit(el, dann) {
    var ims = [].filter.call(el.tagName === 'IMG' ? [el] : el.querySelectorAll('img'), function (im) { return im.offsetParent !== null; });
    var n = ims.length, los = false, fertig = function () { if (!los) { los = true; dann(); } };
    if (!n) return fertig();
    var eins = function () { if (--n <= 0) fertig(); };
    ims.forEach(function (im) {
      var ent = function () { (im.decode ? im.decode() : Promise.resolve()).then(eins, eins); };
      if (im.complete && im.naturalWidth > 1) return ent();
      im.loading = 'eager'; im.addEventListener('load', ent, { once: true }); im.addEventListener('error', eins, { once: true });
    });
    setTimeout(fertig, 2500);
  }
  function sichtbar(e) { return !!(e.offsetParent || e.getClientRects().length); }
  var iof, FRUEH = '.kd6-brett';
  function vorbereiten(wurzel) {
    if (ruhig) { wurzel.querySelectorAll('[data-r],[data-schlitz]').forEach(function (e) { e.classList.add('da'); }); return; }
    markieren(wurzel);
    wurzel.querySelectorAll('[data-schlitz]').forEach(function (h) { if (sichtbar(h)) zeilen(h); });
    /* Wie Rivage (Robert 12.11.2026: «die Bilder warten einen Moment und ploppen dann in ihre Position»): jedes Bild wird anderthalb Bildschirme
       vorher geholt und entpackt; der Auftritt startet erst mit fertigem Bild, dann gleitet es ohne Nachladen herein */
    if (!vor) vor = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; vor.unobserve(e.target); var im = e.target; im.loading = 'eager'; if (im.decode) im.decode().catch(function () {}); });
    }, { rootMargin: '0px 0px 150% 0px', threshold: 0 });
    wurzel.querySelectorAll('main img[loading="lazy"]').forEach(function (im) { vor.observe(im); });
    if (!io) io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return;
        io.unobserve(e.target);
        bereit(e.target, function () { e.target.classList.add('da'); });
      });
    }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
    /* 3-Sterne-Brett (Robert 13.11.2026: die unteren Bilder «warten, bis ich reinscrolle … das muss schon eher passieren»): dort startet jedes Stück
       knapp vor dem Rand ohne Staffelung (45 % war zu früh: «der Effekt … komplett weg»), beim Hereinkommen fliegt es sichtbar hoch */
    if (!iof) iof = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return;
        iof.unobserve(e.target);
        bereit(e.target, function () { e.target.classList.add('da'); });
      });
    }, { rootMargin: '0px 0px 6% 0px', threshold: 0 });
    wurzel.querySelectorAll('[data-r],[data-schlitz],.rahmen,.zoom').forEach(function (e) {
      if (e.classList.contains('da') || e.closest('.fenster')) return;
      if (e.closest(FRUEH)) { e.style.setProperty('--i', 0); iof.observe(e); } else io.observe(e);
    });
  }
  /* Jedes Stück eines Abschnitts schwebt herauf: Bilder (b), Texte und Knöpfe (t); was schon ein Auftritt ist oder sich selbst bewegt, bleibt */
  var STUECK = '.rahmen, figure, h3, p, ul, ol, blockquote, .knoepfe, .knopf, .f-band__hinweis, small, article, .karte';
  var EIGEN = '[data-r], [data-gegenlauf], .buehne, [data-tausch], [data-stapel], [data-vergleich], [data-regler-wahl], [data-pfeil-wahl], [data-buchen], .buchung, .auswahl, dialog, .lb, .fenster, .auftakt, .skopf__t, .skopf__b, .fuss, .wschild, .wliste';
  function markieren(wurzel) {
    var bereiche = wurzel.querySelectorAll ? wurzel.querySelectorAll('main section:not(.fenster):not(.auftakt):not(.skopf)') : [];
    var liste = [].slice.call(bereiche); if (wurzel.matches && wurzel.matches('section')) liste.unshift(wurzel);
    liste.forEach(function (sek) {
      sek.querySelectorAll(STUECK).forEach(function (e) {
        if (e.closest(EIGEN) || e.closest('[data-schlitz]')) return;
        if (!sichtbar(e)) return;
        /* Grosse Kachel mit mehreren Fotos (Zimmer-Übersicht, Robert 13.11.2026: «zu ploppig»): nie als ein Block, jedes Foto, jeder Satz, jeder Knopf fliegt einzeln */
        if (e.tagName === 'ARTICLE' && e.querySelectorAll('.rahmen').length > 1) return;
        if (e.tagName === 'P' && e.textContent.trim().length >= 30 && ![].some.call(e.children, function (k) { return !(k.tagName === 'BR' || (k.tagName === 'SPAN' && k.classList.contains('ak'))); })) { e.setAttribute('data-schlitz', ''); return; }
        e.setAttribute('data-r', (e.matches('.rahmen, figure') || e.querySelector('img')) ? 'b' : 't');
        var i = 0, v = e.previousElementSibling; while (v && i < 5) { if (v.hasAttribute('data-r')) i++; v = v.previousElementSibling; }
        if (i) e.style.setProperty('--i', i);
      });
    });
  }
  /* Für die Wahlseite: eine frisch eingeblendete Fassung bekommt Schlitz und Auftritte */
  window.bareissNeu = function (wurzel) { vorbereiten(wurzel); };
  function auftritte() {
    if (D.fonts) D.fonts.ready.then(function () { vorbereiten(D); }); else vorbereiten(D);
  }
  D.addEventListener('bareiss:bereit', auftritte);
  if (H.classList.contains('bereit')) auftritte(); /* Seite war schon sichtbar, bevor dieser Teil lief (Bilder aus dem Zwischenspeicher) */

  /* 3b Fenster: Bildschicht nur sichtbar, solange das Fenster nahe ist */
  var fio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('sicht', e.isIntersecting); }); }, { rootMargin: '60% 0px 60% 0px' });
  /* Der Satz im Fenster rollt aus dem Schlitz, sobald das Fenster gut im Bild ist */
  var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.querySelectorAll('[data-schlitz]').forEach(function (z) { z.classList.add('da'); }); sio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -60% 0px' });
  D.querySelectorAll('.fenster').forEach(function (f) { sio.observe(f); });
  D.querySelectorAll('.fenster').forEach(function (f) { fio.observe(f); });

  /* 4 Leiste: weg beim Hinunterscrollen, zurück beim Hinaufscrollen ---------------- */
  var leiste = D.querySelector('.leiste'), letzt = scrollY, tick = false;
  if (leiste && D.body.classList.contains('unter')) leiste.classList.add('fest');
  addEventListener('scroll', function () {
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      var y = scrollY, d = y - letzt;
      if (leiste) {
        if (y < 80) leiste.classList.remove('weg');
        else if (d > 6) leiste.classList.add('weg');
        else if (d < -6) leiste.classList.remove('weg');
        leiste.classList.toggle('fest', y > 40 || D.body.classList.contains('unter'));
      }
      letzt = y; tick = false;
    });
  }, { passive: true });

  /* 5 Menü am Handy ------------------------------------------------------------- */
  var mk = D.querySelector('.leiste__menu'), mv = D.querySelector('.vollmenu');
  if (mk && mv) {
    mk.addEventListener('click', function () { var auf = !H.classList.contains('menu-auf'); H.classList.toggle('menu-auf', auf); mk.setAttribute('aria-expanded', auf); });
    mv.addEventListener('click', function (e) { if (e.target.closest('a') || e.target === mv) { H.classList.remove('menu-auf'); mk.setAttribute('aria-expanded', 'false'); } });
  }

  /* 6 Tauschen an derselben Stelle (Jahreszeit, Zimmerstufen, Altersgruppen) -------
     Das neue Bild liegt fertig geladen darüber und steigt von unten herauf; das alte bleibt deckend darunter. */
  D.querySelectorAll('[data-tausch]').forEach(function (g) {
    var knoepfe = g.querySelectorAll('[data-wahl]');
    knoepfe.forEach(function (k) {
      /* Ein Link wählt beim ersten Antippen nur aus und führt erst beim zweiten weiter; beim Überfahren wählt er nur aus */
      k.addEventListener('click', function (e) { if (k.tagName === 'A' && k.getAttribute('aria-pressed') !== 'true') e.preventDefault(); waehle(); });
      k.addEventListener('bareiss:zeig', waehle);
      function waehle() {
        var w = k.getAttribute('data-wahl');
        knoepfe.forEach(function (x) { x.setAttribute('aria-pressed', x === k); });
        g.querySelectorAll('[data-teil]').forEach(function (t) {
          var an = t.getAttribute('data-teil') === w;
          if (an && !t.classList.contains('an')) { t.classList.remove('raus'); void t.offsetWidth; t.classList.add('an', 'rein'); }
          else if (!an && t.classList.contains('an')) { t.classList.remove('an', 'rein'); t.classList.add('raus'); }
        });
        g.setAttribute('data-gewaehlt', w);
      }
    });
  });

  /* 7 Laufband: läuft weiter, nimmt waagerechtes Wischen an (Stufe 1 Nr. 18) -------- */
  D.querySelectorAll('[data-laufband]').forEach(function (b) {
    var spur = b.querySelector('.lb__spur'); if (!spur || ruhig) return;
    var x = 0, v = 0.35, schub = 0, w = 0, sicht = true;
    new IntersectionObserver(function (e) { sicht = e[0].isIntersecting; }).observe(b);
    b.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) schub += e.deltaX * 0.6; }, { passive: true });
    var sx = null; b.addEventListener('pointerdown', function (e) { sx = e.clientX; }); addEventListener('pointerup', function () { sx = null; });
    b.addEventListener('pointermove', function (e) { if (sx !== null && e.pointerType !== 'touch') { schub += (sx - e.clientX); sx = e.clientX; } });
    (function lauf() {
      if (!w) w = spur.scrollWidth / 2;
      if (sicht && w) { x += v + schub * 0.12; schub *= 0.88; if (x >= w) x -= w; if (x < 0) x += w; spur.style.transform = 'translate3d(' + (-x) + 'px,0,0)'; }
      requestAnimationFrame(lauf);
    })();
  });

  /* 8 Auswahl im Hausstil: Kalender und Gäste (nie die Browser-Auswahl) --------------- */
  var MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var TAG = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  function fmt(d) { return d ? (d.getDate() + '. ' + MON[d.getMonth()].slice(0, 3) + (MON[d.getMonth()].length > 3 ? '.' : '') + ' ' + d.getFullYear()) : ''; }
  D.querySelectorAll('[data-buchen]').forEach(function (form) {
    var st = { an: null, ab: null, erw: 2, kind: 0, monat: null }, heute = new Date(); heute.setHours(0, 0, 0, 0);
    st.monat = new Date(heute.getFullYear(), heute.getMonth(), 1);
    var tag = form.getAttribute('data-buchen') === 'tag', felder = form.querySelectorAll('[data-feld]:not([hidden])'), karte = form.querySelector('.auswahl');
    function zu() { karte.hidden = true; felder.forEach(function (f) { f.setAttribute('aria-expanded', 'false'); }); form.classList.remove('offen'); }
    function zeig(f) {
      var art = f.getAttribute('data-feld'); felder.forEach(function (x) { x.setAttribute('aria-expanded', x === f); });
      karte.hidden = false; form.classList.add('offen'); karte.setAttribute('data-art', art);
      art === 'gaeste' ? gaeste() : kalender(art);
    }
    function schreib() {
      form.querySelector('[data-feld="an"] .wert').textContent = st.an ? fmt(st.an) : 'Datum wählen';
      if (!tag) form.querySelector('[data-feld="ab"] .wert').textContent = st.ab ? fmt(st.ab) : 'Datum wählen';
      form.querySelector('[data-feld="gaeste"] .wert').textContent = tag ? st.erw + (st.erw === 1 ? ' Person' : ' Personen') : st.erw + (st.erw === 1 ? ' Erwachsener' : ' Erwachsene') + (st.kind ? ' · ' + st.kind + (st.kind === 1 ? ' Kind' : ' Kinder') : '');
    }
    function kalender(art) {
      var m = st.monat, h = '<div class="ka__kopf"><button type="button" class="ka__pf" data-m="-1" aria-label="Voriger Monat">‹</button><b>' + MON[m.getMonth()] + ' ' + m.getFullYear() + '</b><button type="button" class="ka__pf" data-m="1" aria-label="Nächster Monat">›</button></div><div class="ka__tage">';
      TAG.forEach(function (t) { h += '<i>' + t + '</i>'; });
      var erst = (m.getDay() + 6) % 7, n = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      for (var i = 0; i < erst; i++) h += '<span></span>';
      for (var d = 1; d <= n; d++) {
        var dt = new Date(m.getFullYear(), m.getMonth(), d), aus = dt < heute || (art === 'ab' && st.an && dt <= st.an) || (tag && [1, 2, 3].indexOf(dt.getDay()) >= 0);
        var c = (st.an && +dt === +st.an) || (st.ab && +dt === +st.ab) ? ' gew' : (st.an && st.ab && dt > st.an && dt < st.ab ? ' zw' : '');
        h += '<button type="button" class="ka__t' + c + '"' + (aus ? ' disabled' : '') + ' data-d="' + (+dt) + '">' + d + '</button>';
      }
      karte.innerHTML = h + '</div><p class="ka__fuss">' + (tag ? 'Donnerstag bis Sonntag geöffnet' : art === 'an' ? 'Anreise wählen' : 'Abreise wählen') + '</p>';
      karte.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); st.monat = new Date(m.getFullYear(), m.getMonth() + (+b.dataset.m), 1); kalender(art); }; });
      karte.querySelectorAll('[data-d]').forEach(function (b) {
        b.onclick = function (e) {
          e.stopPropagation(); var dt = new Date(+b.dataset.d);
          if (art === 'an') { st.an = dt; if (st.ab && st.ab <= dt) st.ab = null; schreib(); if (tag) zu(); else zeig(form.querySelector('[data-feld="ab"]')); }
          else { st.ab = dt; schreib(); zu(); }
        };
      });
    }
    function gaeste() {
      if (tag) { karte.innerHTML = '<div class="gz"><span>Personen</span><button type="button" data-g="erw" data-d="-1" aria-label="Weniger">−</button><b>' + st.erw + '</b><button type="button" data-g="erw" data-d="1" aria-label="Mehr">+</button></div><button type="button" class="gz__ok">Übernehmen</button>'; }
      else karte.innerHTML = '<div class="gz"><span>Erwachsene</span><button type="button" data-g="erw" data-d="-1" aria-label="Weniger">−</button><b>' + st.erw + '</b><button type="button" data-g="erw" data-d="1" aria-label="Mehr">+</button></div>' +
        '<div class="gz"><span>Kinder</span><button type="button" data-g="kind" data-d="-1" aria-label="Weniger">−</button><b>' + st.kind + '</b><button type="button" data-g="kind" data-d="1" aria-label="Mehr">+</button></div>' +
        '<button type="button" class="gz__ok">Übernehmen</button>';
      karte.querySelectorAll('[data-g]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); var k = b.dataset.g; st[k] = Math.max(k === 'erw' ? 1 : 0, Math.min(8, st[k] + (+b.dataset.d))); schreib(); gaeste(); }; });
      karte.querySelector('.gz__ok').onclick = function (e) { e.stopPropagation(); zu(); };
    }
    felder.forEach(function (f) { f.addEventListener('click', function (e) { e.stopPropagation(); f.getAttribute('aria-expanded') === 'true' ? zu() : zeig(f); }); });
    karte.addEventListener('click', function (e) { e.stopPropagation(); });
    D.addEventListener('click', zu); D.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
    schreib();
  });

  /* 9 Fenster: Anfrage (Tisch im Restaurant Bareiss) ------------------------------- */
  D.querySelectorAll('[data-oeffne]').forEach(function (k) {
    k.addEventListener('click', function (e) { var d = D.getElementById(k.getAttribute('data-oeffne')); if (d && d.showModal) { e.preventDefault(); d.showModal(); } });
  });
  D.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-zu]')) d.close(); });
    var f = d.querySelector('form'); if (f) f.addEventListener('submit', function (e) { e.preventDefault(); f.hidden = true; d.querySelector('.danke').hidden = false; });
  });

  /* 10 Stapel: ‹ › bringt die nächste Karte nach vorn (nur transform) */
  D.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-stapel-schritt]'); if (!b) return;
    var sek = b.closest('section'); var st = sek && sek.querySelector('[data-stapel]'); if (!st) return;
    var k = [].slice.call(st.children), n = k.length, d = +b.getAttribute('data-stapel-schritt');
    k.forEach(function (c) { var p = +c.getAttribute('data-pos'); c.setAttribute('data-pos', ((p - d) % n + n) % n); });
  });
  /* 11 Schieber Tag und Nacht */
  D.querySelectorAll('[data-vergleich]').forEach(function (v) {
    var r = v.querySelector('input[type=range]'); if (!r) return;
    var setz = function () { v.style.setProperty('--x', r.value + '%'); };
    r.addEventListener('input', setz); setz();
  });
  /* 12 Zeigen tauscht (Herkunftsorte): beim Überfahren wie Klick */
  D.addEventListener('mouseover', function (e) { var b = e.target.closest && e.target.closest('[data-zeig]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.dispatchEvent(new Event('bareiss:zeig')); });

  /* 13 Regler und Pfeile wählen einen Moment (Ferientag) */
  function momentWahl(box, i) {
    var t = box.querySelectorAll('.buehne>[data-teil]'), x = box.querySelectorAll('.texte>[data-teil]'), n = t.length; i = ((i % n) + n) % n;
    t.forEach(function (e, k) { var an = k === i; if (an && !e.classList.contains('an')) { e.classList.remove('raus'); void e.offsetWidth; e.classList.add('an', 'rein'); } else if (!an && e.classList.contains('an')) { e.classList.remove('an', 'rein'); e.classList.add('raus'); } });
    x.forEach(function (e, k) { e.classList.toggle('an', k === i); });
    box.dataset.i = i; var nr = box.querySelector('.f3-ff__nr'); if (nr) nr.textContent = (i + 1) + ' / ' + n;
  }
  D.addEventListener('input', function (e) { var b = e.target.closest && e.target.closest('[data-regler-wahl]'); if (b && e.target.type === 'range') momentWahl(b, +e.target.value); });
  D.addEventListener('click', function (e) { var k = e.target.closest && e.target.closest('[data-pfeil]'); if (!k) return; var b = k.closest('[data-pfeil-wahl]'); if (b) momentWahl(b, (+b.dataset.i || 0) + (+k.getAttribute('data-pfeil'))); });

  /* Gleiten: das Foto wandert beim Scrollen sacht in seinem Rahmen (höchstens 2 % der Rahmenhöhe) */
  if (!ruhig && 'IntersectionObserver' in window) {
    var gl = [], vh = innerHeight, offen = 0;
    D.querySelectorAll('main .rahmen').forEach(function (f) { if (f.closest('.buehne, .fenster, .auftakt')) return; var im = f.querySelectorAll('img'); if (im.length === 1) gl.push({ f: f, im: im[0], da: false }); });
    var gio = new IntersectionObserver(function (es) { es.forEach(function (e) { for (var i = 0; i < gl.length; i++) if (gl[i].f === e.target) gl[i].da = e.isIntersecting; }); }, { rootMargin: '10% 0px 10% 0px' });
    /* Wo der Browser es kann, gleitet das Foto auf der Scroll-Zeitachse (bareiss.css «Gleiten»): läuft im Takt des Scrollens, auch in Safari mit 120 Hz.
       Das Skript setzte translate nur mit dem Bildtakt des Hauptfadens (Safari 60 Hz) und liess die Fotos beim Hereinzoomen im Rahmen zittern.
       Ein Vorfahr mit overflow:hidden wäre eine eigene (stehende) Scrollfläche, die Zeitachse liefe dann nicht; dort clip, beschneidet gleich. */
    if (window.CSS && CSS.supports('animation-timeline: view()')) {
      gl.forEach(function (g) {
        g.f.classList.add('gl');
        for (var e = g.f.parentElement; e && e !== D.body; e = e.parentElement) { var cs = getComputedStyle(e); if (cs.overflowX === 'hidden' || cs.overflowY === 'hidden') e.classList.add('gl-clip'); }
      });
      gl = [];
    }
    gl.forEach(function (g) { gio.observe(g.f); });
    var gleite = function () {
      offen = 0;
      for (var i = 0; i < gl.length; i++) {
        var g = gl[i]; if (!g.da) continue;
        var r = g.f.getBoundingClientRect(), q = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
        q = q < -1 ? -1 : q > 1 ? 1 : q;
        g.im.style.translate = '0 ' + (q * r.height * .02).toFixed(1) + 'px';
      }
    };
    addEventListener('scroll', function () { if (!offen) offen = requestAnimationFrame(gleite); }, { passive: true });
    addEventListener('resize', function () { vh = innerHeight; gleite(); }, { passive: true });
    gleite();
  }

  /* Rampenlicht (Zimmer-Fassung 8): eine Karte in der Mitte, die Nachbarn am Rand; Pfeile oder Tippen auf einen Nachbarn holen ihn ins Licht */
  function rampe(b, i) {
    var k = b.querySelectorAll('[data-pos]'), n = k.length; i = ((i % n) + n) % n; b.dataset.i = i;
    k.forEach(function (e, j) { var d = j - i; if (d > n / 2) d -= n; if (d < -n / 2) d += n; e.setAttribute('data-rel', Math.abs(d) > 1 ? (d > 0 ? 2 : -2) : d); });
    var nr = b.querySelector('[data-rampe-nr]'); if (nr) nr.textContent = (i + 1) + ' / ' + n;
  }
  D.querySelectorAll('[data-rampe]').forEach(function (b) { rampe(b, 0); });
  D.addEventListener('click', function (e) {
    var s = e.target.closest && e.target.closest('[data-rampe-schritt]'); var b;
    if (s) { b = s.closest('[data-rampe]'); rampe(b, (+b.dataset.i || 0) + (+s.getAttribute('data-rampe-schritt'))); return; }
    var k = e.target.closest && e.target.closest('[data-rampe] [data-pos]');
    if (k && k.getAttribute('data-rel') !== '0') { e.preventDefault(); b = k.closest('[data-rampe]'); rampe(b, +k.getAttribute('data-pos')); }
  });
})();

/* Zimmer-Detailseite (09.11.2026): Umschalter zwischen den Zimmern einer Kategorie, Fotos durchblättern, Grundriss gross */
(function () {
  document.querySelectorAll('.zz').forEach(function (s) {
    var tabs = [].slice.call(s.querySelectorAll('.zz__wahl [role=tab]')), ps = [].slice.call(s.querySelectorAll('.zz__p'));
    function waehle(i) {
      ps.forEach(function (p, j) { p.hidden = j !== i; });
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
      if (window.bareissNeu) window.bareissNeu(ps[i]);
    }
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { waehle(i); }); });
    var h = location.hash.slice(1); ps.forEach(function (p, i) { if (p.id === h) waehle(i); });
    s.querySelectorAll('.zz__daumen').forEach(function (d) {
      var bs = [].slice.call(d.parentElement.querySelectorAll('.zz__buehne img')), kn = [].slice.call(d.querySelectorAll('button'));
      kn.forEach(function (b, i) { b.addEventListener('click', function () {
        bs.forEach(function (x, j) { x.classList.toggle('an', j === i); if (j === i) x.loading = 'eager'; });
        kn.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      }); });
    });
    var dlg = s.querySelector('.zz__gross');
    s.querySelectorAll('.zz__plan-auf').forEach(function (b) { b.addEventListener('click', function () {
      var im = b.querySelector('img'), gr = (im.getAttribute('srcset') || '').split(',').pop().trim().split(' ')[0]; dlg.querySelector('img').src = gr || im.currentSrc || im.src; dlg.querySelector('img').alt = im.alt; dlg.showModal();
    }); });
    if (dlg) { dlg.querySelector('.zz__zu').addEventListener('click', function () { dlg.close(); }); dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); }); }
  });
})();

/* Zimmer-Detailseite, 15 Fassungen (zimmerdetail.py): Zimmer umschalten, Fotos tauschen, Grundriss gross, Bild tauscht beim Scrollen */
(function () {
  document.querySelectorAll('.zx').forEach(function (s) {
    var rs = [].slice.call(s.querySelectorAll('.zx-r')), dlg = s.querySelector('.zx-gross');
    function waehle(i) {
      rs.forEach(function (r) { r.hidden = +r.dataset.i !== i; });
      s.querySelectorAll('[role=tab][data-i]').forEach(function (t) { t.setAttribute('aria-selected', +t.dataset.i === i ? 'true' : 'false'); });
      if (window.bareissNeu) window.bareissNeu(rs[i]);
    }
    s.addEventListener('click', function (e) {
      var t = e.target.closest('[role=tab][data-i]');
      if (t) { waehle(+t.dataset.i); return; }
      var d = e.target.closest('.zx-daumen button');
      if (d) {
        var kn = [].slice.call(d.parentElement.children), i = kn.indexOf(d), bs = d.closest('[data-buehne]').querySelectorAll('.zx-bb img');
        bs.forEach(function (x, j) { x.classList.toggle('an', j === i); if (j === i) x.loading = 'eager'; });
        kn.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
        return;
      }
      var p = e.target.closest('.zx-plan-auf');
      if (p && dlg) {
        var im = p.querySelector('img'), gr = (im.getAttribute('srcset') || '').split(',').pop().trim().split(' ')[0];
        dlg.querySelector('img').src = gr || im.currentSrc || im.src; dlg.showModal(); return;
      }
      if (dlg && (e.target === dlg || e.target.closest('.zx-zu'))) dlg.close();
    });
    s.querySelectorAll('.zx6-g').forEach(function (g) {
      var ims = g.querySelectorAll('.zx6-bild img');
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { var n = +en.target.dataset.tausch; ims.forEach(function (im, j) { im.classList.toggle('an', j === n); }); } }); }, { rootMargin: '-45% 0px -45% 0px' });
      g.querySelectorAll('[data-tausch]').forEach(function (x) { io.observe(x); });
    });
  });
})();

/* Gegenlauf (Kaminstube 12, Robert 12.11.2026): zwei Fotospalten laufen beim Scrollen gegeneinander. Weg = Spaltenhöhe minus Fensterhöhe.
   Mit Scroll-Zeitachse läuft es in CSS (varianten.css), sonst hier im Takt des Scrollens; nur transform. */
(function () {
  var bx = Array.prototype.slice.call(document.querySelectorAll('[data-gegenlauf]'));
  if (!bx.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var css = !!(window.CSS && CSS.supports('animation-timeline: view()')), offen = 0;
  var miss = function () {
    bx.forEach(function (b) {
      var h = b.clientHeight, w = 0;
      Array.prototype.forEach.call(b.children, function (c) { w = Math.max(w, c.scrollHeight - h); });
      b.style.setProperty('--kk-weg', Math.max(0, w) + 'px'); b._weg = Math.max(0, w);
      if (css) b.classList.add('css-lauf');
    });
  };
  var lauf = function () {
    offen = 0; var vh = innerHeight;
    bx.forEach(function (b) {
      var r = b.getBoundingClientRect(); if (r.bottom < -50 || r.top > vh + 50) return;
      var p = (vh - r.top) / (vh + r.height); p = p < 0 ? 0 : p > 1 ? 1 : p;
      Array.prototype.forEach.call(b.children, function (c) {
        var y = c.getAttribute('data-lauf') === 'runter' ? -(1 - p) * b._weg : -p * b._weg;
        c.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      });
    });
  };
  miss();
  if ('ResizeObserver' in window) { var ro = new ResizeObserver(function () { miss(); if (!css) lauf(); }); bx.forEach(function (b) { ro.observe(b); Array.prototype.forEach.call(b.children, function (c) { ro.observe(c); }); }); }
  addEventListener('load', function () { miss(); if (!css) lauf(); });
  addEventListener('resize', function () { miss(); if (!css) lauf(); }, { passive: true });
  if (!css) { addEventListener('scroll', function () { if (!offen) offen = requestAnimationFrame(lauf); }, { passive: true }); lauf(); }
})();

/* Kulinarik Runde 3 (12.11.2026): [data-an] bekommt «an», sobald es gut im Bild ist (Anstossen, Lichter); Wendekarte dreht Keller und Bar */
(function () {
  var an = document.querySelectorAll('[data-an]');
  if (an.length) {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) an.forEach(function (e) { e.classList.add('an'); });
    else { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('an'); io.unobserve(e.target); } }); }, { threshold: .35 }); an.forEach(function (e) { io.observe(e); }); }
  }
  var wende = function (sec) { var um = sec.classList.toggle('um'); var k = sec.querySelector('[data-wende-knopf]'); if (k) k.textContent = um ? 'Zum Weinkeller' : 'Zur Hotelbar'; };
  document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-wende], [data-wende-knopf]'); if (t) wende(t.closest('.wd9')); });
  document.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-wende]')) { e.preventDefault(); wende(e.target.closest('.wd9')); } });
})();

/* Zimmer-Detailseite Runde 2 (zimmerraum2.py): Rundgang mit Pfeilen, Bildfolge von selbst, Bilderstapel zum Antippen */
(function () {
  document.querySelectorAll('.zy4-spur').forEach(function (sp) {
    var r = sp.parentElement, nr = r.querySelector('.zy4-nr b'), fs = sp.querySelectorAll('.zy4-f');
    var jetzt = function () { var m = sp.scrollLeft + sp.clientWidth / 2, best = 0, d = 1e9; fs.forEach(function (f, j) { var c = f.offsetLeft + f.offsetWidth / 2, x = Math.abs(c - m); if (x < d) { d = x; best = j; } }); return best; };
    sp.addEventListener('scroll', function () { if (nr) nr.textContent = jetzt() + 1; }, { passive: true });
    r.addEventListener('click', function (e) {
      var k = e.target.closest('[data-zy4]'); if (!k) return;
      var i = Math.max(0, Math.min(fs.length - 1, jetzt() + (+k.dataset.zy4))), f = fs[i];
      fs.forEach(function (x) { var im = x.querySelector('img'); if (im) im.loading = 'eager'; });
      sp.scrollTo({ left: f.offsetLeft - (sp.clientWidth - f.offsetWidth) / 2, behavior: 'smooth' });
    });
  });
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-zy5]').forEach(function (b) {
    var ims = b.querySelectorAll('.zy5-bilder img'), st = b.querySelectorAll('.zy5-striche button'), i = 0, uhr = null, sicht = false, T = 4500;
    if (ims.length < 2) return;
    var zeige = function (n) {
      i = (n + ims.length) % ims.length;
      ims.forEach(function (im, j) { im.classList.toggle('an', j === i); if (j === (i + 1) % ims.length) im.loading = 'eager'; });
      st.forEach(function (s, j) { s.classList.remove('laeuft'); s.classList.toggle('fertig', j < i); });
      void b.offsetWidth; if (st[i] && !ruhig) st[i].classList.add('laeuft');
      clearTimeout(uhr); if (sicht && !ruhig) uhr = setTimeout(function () { zeige(i + 1); }, T);
    };
    st.forEach(function (s, j) { s.addEventListener('click', function () { zeige(j); }); });
    new IntersectionObserver(function (es) { var v = es[0].isIntersecting && b.offsetParent !== null; if (v === sicht) return; sicht = v; if (sicht) zeige(i); else { clearTimeout(uhr); st.forEach(function (s) { s.classList.remove('laeuft'); }); } }, { threshold: .4 }).observe(b);
  });
  document.querySelectorAll('[data-zy13]').forEach(function (s) {
    var ks = [].slice.call(s.querySelectorAll('.zy13-k')), n = ks.length, oben = 0, z = s.parentElement.querySelector('.zy13-hin span');
    if (n < 2) return;
    s.addEventListener('click', function () {
      oben = (oben + 1) % n;
      ks.forEach(function (k, j) { var p = (j - oben + n) % n; k.style.setProperty('--p', p); if (p < 2) k.querySelector('img').loading = 'eager'; });
      if (z) z.textContent = oben + 1;
    });
  });
})();

/* Zimmerseite (zimmerseite.py): Foto oder Grundriss umschalten (zsm13), Namensliste mit grossem Foto (zsu5) */
(function () {
  document.querySelectorAll('[data-zsm13]').forEach(function (f) {
    var p = f.querySelector('.zsm13-plan');
    f.addEventListener('click', function (e) {
      var b = e.target.closest('[data-zsm13-w]'); if (!b) return;
      var plan = b.dataset.zsm13W === 'p';
      f.classList.toggle('plan', plan); p.hidden = !plan;
      f.querySelectorAll('[data-zsm13-w]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    });
  });
  document.querySelectorAll('[data-zsu5]').forEach(function (a) {
    var ls = a.querySelectorAll('.zsu5-l a'), ims = a.querySelectorAll('.zsu5-b img');
    var zeig = function (i) { ls.forEach(function (l, j) { l.classList.toggle('an', j === i); }); ims.forEach(function (im, j) { im.classList.toggle('an', j === i); if (j === i) im.loading = 'eager'; }); };
    ls.forEach(function (l, i) { l.addEventListener('mouseenter', function () { zeig(i); }); l.addEventListener('focus', function () { zeig(i); }); });
  });
})();

/* Zimmerseite Runde 2 (zimmerseite2.py): Mappe (zsn3), Vom Plan zum Raum (zsn4), Bild bleibt (zsn8), Fotoalbum (zsn9), Drehbühne (zsn15) */
(function () {
  var eager = function (r) { r.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; }); };
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-zsn3]'); if (!b) return;
    var m = b.closest('.zsn3-mappe'), auf = m.classList.toggle('auf'); b.setAttribute('aria-expanded', auf ? 'true' : 'false'); eager(m);
  });
  var stufen = [];
  document.querySelectorAll('[data-zsn4]').forEach(function (a) {
    var es = a.querySelectorAll('.zsn4-e'), st = a.querySelectorAll('.zsn4-striche i'), n = es.length;
    var setz = function (k) {
      a._k = k;
      es.forEach(function (e, j) { e.classList.toggle('an', j <= k); if (j <= k + 1) eager(e.tagName === 'IMG' ? e.parentElement : e); });
      st.forEach(function (s, j) { s.classList.toggle('an', j <= k); });
    };
    setz(0);
    stufen.push(function () {
      if (a.offsetParent === null || innerWidth <= 900) return;
      var r = a.querySelector('.zsn4-buehne').getBoundingClientRect(), p = (innerHeight * .9 - r.top) / (innerHeight * .9 - 80);
      var k = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
      if (k !== a._k) setz(k);
    });
    st.forEach(function (x, j) { x.addEventListener('click', function () { setz(j); }); });
    a.querySelector('.zsn4-buehne').addEventListener('click', function (e) { if (innerWidth <= 900 || e.target.closest('.zx-plan-auf')) return; setz((a._k + 1) % n); });
  });
  if (stufen.length) { var off = 0, lauf = function () { off = 0; stufen.forEach(function (f) { f(); }); }; addEventListener('scroll', function () { if (!off) off = requestAnimationFrame(lauf); }, { passive: true }); lauf(); }
  document.querySelectorAll('[data-zsn8]').forEach(function (a) {
    var ims = a.querySelectorAll('.zsn8-bilder img');
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; var k = +e.target.dataset.i; ims.forEach(function (im, j) { im.classList.toggle('an', j <= k); if (j <= k + 1) im.loading = 'eager'; }); }); }, { rootMargin: '-45% 0px -45% 0px' });
    a.querySelectorAll('.zsn8-teil').forEach(function (t) { io.observe(t); });
  });
  document.querySelectorAll('[data-zsn9]').forEach(function (b) {
    var bl = b.querySelectorAll('.zsn9-blatt'), n = bl.length, i = 0, steuer = b.parentElement.querySelector('.zsn9-steuer'), nr = steuer.querySelector('b');
    var geh = function (d) {
      var j = Math.max(0, Math.min(n, i + d)); if (j === i) return;
      if (j > i) bl[i].classList.add('um'); else bl[j].classList.remove('um');
      i = j; nr.textContent = i + 1;
      bl.forEach(function (x, k) { if (k <= i + 1) eager(x); });
    };
    steuer.addEventListener('click', function (e) { var k = e.target.closest('[data-zsn9-k]'); if (k) geh(+k.dataset.zsn9K); });
    b.addEventListener('click', function (e) {
      if (e.target.closest('.zx-plan-auf')) return;
      var t = e.target.closest('.zsn9-blatt');
      if ((t && t.classList.contains('um')) || e.target.closest('.zsn9-links')) geh(-1); else if (e.target.closest('.zsn9-rechts')) geh(1);
    });
  });
  document.querySelectorAll('[data-zsn15]').forEach(function (r) {
    var ks = [].slice.call(r.children), n = ks.length, s = 0, steuer = r.parentElement.querySelector('.zsn15-steuer'), nr = steuer.querySelector('b');
    var setz = function () {
      ks.forEach(function (k, i) {
        var p = ((i - s) % n + n) % n; if (p > n / 2) p -= n;
        var a = Math.abs(p);
        k.style.transform = 'translateX(' + (p * 64) + '%) translateZ(' + (-a * 120) + 'px) rotateY(' + (-p * 34) + 'deg)';
        k.style.zIndex = 10 - a; k.style.opacity = a > 1.5 ? 0 : 1; k.style.pointerEvents = a ? 'none' : '';
        if (a <= 2) k.querySelectorAll('img').forEach(function (im) { im.loading = 'eager'; });
      });
      nr.textContent = s + 1;
    };
    steuer.addEventListener('click', function (e) { var k = e.target.closest('[data-zsn15-k]'); if (!k) return; s = ((s + +k.dataset.zsn15K) % n + n) % n; setz(); });
    setz();
  });
})();

/* Zimmerseite Runde 3 (zimmerseite3.py): Bildleiste im Kopf tauscht das grosse Foto (zrk10) */
(function () {
  document.querySelectorAll('.zrk10-b').forEach(function (b) {
    var ims = b.querySelectorAll('.zx-bb img'), ds = b.querySelectorAll('.zrk10-d button');
    ds.forEach(function (d, i) {
      d.addEventListener('click', function () {
        ims.forEach(function (im, j) { im.classList.toggle('an', j === i); if (j === i) im.loading = 'eager'; });
        ds.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      });
    });
  });
})();
/* Fotoband im Ausklang der Anreise (ng9): läuft nur, solange es im Bild ist */
(function () { var b = document.querySelectorAll('.ng9-lauf'); if (!b.length) return;
  if (!('IntersectionObserver' in window)) { b.forEach(function (e) { e.classList.add('laeuft'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('laeuft', e.isIntersecting); }); });
  b.forEach(function (e) { io.observe(e); }); })();

/* Rundgang über den Grundriss (rundgang.py): Standpunkt im Plan oder Pfeil tauscht das grosse Foto */
(function () {
  document.querySelectorAll('[data-rundgang]').forEach(function (r) {
    var ims = r.querySelectorAll('.rg-f'), ps = r.querySelectorAll('.rg-p'), wo = r.querySelector('[data-rg-wo]'), n = ps.length, s = 0;
    function setz(i) {
      var vor = s;
      s = ((i % n) + n) % n;
      if (s === vor) return;
      ims.forEach(function (im, j) { im.classList.toggle('war', j === vor); im.classList.toggle('an', j === s); if (Math.abs(j - s) <= 1) im.loading = 'eager'; });
      ps.forEach(function (p, j) { p.setAttribute('aria-pressed', j === s ? 'true' : 'false'); });
      wo.textContent = ps[s].dataset.rgName;
    }
    ps.forEach(function (p, i) { p.addEventListener('click', function () { setz(i); }); });
    r.querySelectorAll('[data-rg-k]').forEach(function (k) { k.addEventListener('click', function () { setz(s + +k.dataset.rgK); }); });
  });
})();
/* Karriere: Reiter der Bereiche (karriere.html, Robert 14.11.2026). */
(function () {
  var rr = document.querySelectorAll('.ka-r'); if (!rr.length) return;
  rr.forEach(function (r) { r.addEventListener('click', function () {
    rr.forEach(function (x) { var an = x === r; x.setAttribute('aria-selected', an ? 'true' : 'false'); var f = document.getElementById(x.getAttribute('aria-controls')); if (an) f.removeAttribute('hidden'); else f.setAttribute('hidden', ''); });
  }); });
})();
/* Karriere-Fassung «Band zum Blättern»: Pfeile schieben das Band um eine Karte (karriere-wahl.html, Robert 14.11.2026) */
document.addEventListener('click', function (e) { var b = e.target.closest('[data-kb7]'); if (!b) return; var l = b.closest('.kb').querySelector('.kb7-l'); var c = l.querySelector('li'); l.scrollBy({ left: (+b.dataset.kb7) * (c ? c.offsetWidth + 16 : 300), behavior: 'smooth' }); });
