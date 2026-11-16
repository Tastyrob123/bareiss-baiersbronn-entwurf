/* Wahlseite Bareiss: Jeder Abschnitt (.wahl) trägt seine Fassungen (.wv, 0 = heute).
   ← → (oder seitwärts wischen) schaltet den Abschnitt in der Bildmitte. Stand in der Adresse (?w=…) und im Browser gemerkt.
   Schild unten links: Abschnitt, Nummer, Name. Klick aufs Schild: Übersicht mit allen Abschnitten, dort auch ‹ › je Abschnitt. */
(function () {
  var D = document, AB = [].slice.call(D.querySelectorAll('.wsek')), stand = {}, KEY = 'bareiss-wahl' + ((location.pathname.match(/\/([a-z]+)-wahl\.html$/) || ['', ''])[1] ? '-' + location.pathname.match(/\/([a-z]+)-wahl\.html$/)[1] : '');   /* je Wahlseite ein eigener Speicher (zimmer-wahl → -zimmer, kulinarik-wahl → -kulinarik) */
  var schildEl = D.querySelector('.wschild'), listeEl = D.querySelector('.wliste');

  function lesen() {
    var s = new URLSearchParams(location.search).get('w');
    if (!s) { try { s = localStorage.getItem(KEY) || ''; } catch (e) { s = ''; } }
    s.split('~').forEach(function (p) { var m = p.split('.'); if (m.length === 2 && !isNaN(+m[1])) stand[m[0]] = +m[1]; });
  }
  function kurz() { return AB.map(function (a) { return a.dataset.ab + '.' + (stand[a.dataset.ab] || 0); }).join('~'); }
  function schreiben() {
    var s = kurz();
    try { localStorage.setItem(KEY, s); } catch (e) {}
    try { history.replaceState(null, '', location.pathname + '?w=' + s); } catch (e) {}
  }
  function fassung(a, n) { return a.querySelector(':scope>.wv[data-n="' + n + '"]'); }
  function zeige(a, n, still) {
    var max = +a.dataset.anzahl; n = ((n % max) + max) % max;
    a.querySelectorAll(':scope>.wv').forEach(function (v) { v.hidden = +v.dataset.n !== n; });
    stand[a.dataset.ab] = n;
    var v = fassung(a, n);
    if (window.bareissNeu && !still) window.bareissNeu(v);
    if (!still) {
      var r = a.getBoundingClientRect();
      if (r.bottom < innerHeight * 0.45 || r.top > innerHeight * 0.45) window.scrollTo(0, scrollY + r.top);
    }
    if (a.dataset.ab === 'auftakt') { var l = D.querySelector('.leiste'); if (l) l.classList.toggle('leiste--hell', !!(v && v.querySelector('.a-sz,.a-ra'))); }
    schild(a); schreiben(); if (!listeEl.hidden) liste();
  }
  function aktuell() {
    var m = innerHeight * 0.45, best = null;
    AB.forEach(function (a) { var r = a.getBoundingClientRect(); if (r.height > 0 && r.top <= m && r.bottom > m) best = a; });
    return best;
  }
  function zwei(n) { return (n < 10 ? '0' : '') + n; }
  var letzter = null;
  function schild(a) {
    a = a || aktuell() || letzter; if (!a) return; letzter = a;
    var n = stand[a.dataset.ab] || 0, v = fassung(a, n);
    schildEl.querySelector('[data-ws-ab]').textContent = a.dataset.titel;
    schildEl.querySelector('[data-ws-nr]').textContent = zwei(n) + ' / ' + zwei(+a.dataset.anzahl - 1);
    schildEl.querySelector('[data-ws-name]').textContent = v ? v.dataset.name : '';
  }
  function liste() {
    var h = '<p>Deine Wahl: ' + AB.map(function (a) { return a.dataset.titel + ' ' + (stand[a.dataset.ab] || 0); }).join(' · ') + '</p>';
    AB.forEach(function (a, i) {
      var n = stand[a.dataset.ab] || 0, v = fassung(a, n);
      h += '<div style="display:grid;grid-template-columns:1fr auto auto;gap:4px;align-items:center"><button type="button" data-geh="' + i + '"><span style="margin:0;color:inherit;font-size:13.5px">' + a.dataset.titel +
        '<span>' + (v ? v.dataset.name : '') + '</span></span><em>' + zwei(n) + '</em></button>' +
        '<button type="button" data-schalt="' + i + '" data-d="-1" aria-label="Vorige Fassung" style="width:34px;justify-content:center;display:flex">‹</button>' +
        '<button type="button" data-schalt="' + i + '" data-d="1" aria-label="Nächste Fassung" style="width:34px;justify-content:center;display:flex">›</button></div>';
    });
    listeEl.innerHTML = h;
  }
  listeEl.addEventListener('click', function (e) {
    var g = e.target.closest('[data-geh]'), s = e.target.closest('[data-schalt]');
    if (g) { var a = AB[+g.dataset.geh]; window.scrollTo(0, scrollY + a.getBoundingClientRect().top); schild(a); }
    if (s) { var b = AB[+s.dataset.schalt]; zeige(b, (stand[b.dataset.ab] || 0) + (+s.dataset.d), true); if (window.bareissNeu) window.bareissNeu(fassung(b, stand[b.dataset.ab])); }
  });
  function umschalten() { listeEl.hidden = !listeEl.hidden; if (!listeEl.hidden) liste(); }
  schildEl.addEventListener('click', umschalten);
  schildEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); umschalten(); } });

  function schritt(d) { var a = aktuell(); if (!a) return; zeige(a, (stand[a.dataset.ab] || 0) + d); }
  D.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var t = e.target; if (t && (t.matches('input,textarea,select') || t.closest('dialog[open]'))) return;
    e.preventDefault(); schritt(e.key === 'ArrowRight' ? 1 : -1);
  });
  /* seitwärts wischen (Trackpad), ausser in Bändern, die selbst seitwärts laufen */
  var summe = 0, zuletzt = 0;
  addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.4 || Math.abs(e.deltaX) < 3) return;
    if (e.target.closest && e.target.closest('.f-band,.tag__bahn,[data-laufband],dialog')) return;
    e.preventDefault();
    var jetzt = Date.now(); if (jetzt - zuletzt < 700) { summe = 0; return; }
    summe += e.deltaX;
    if (Math.abs(summe) > 120) { schritt(summe > 0 ? 1 : -1); summe = 0; zuletzt = jetzt; }
  }, { passive: false });
  var tx = null, ty = null;
  addEventListener('touchstart', function (e) { if (e.target.closest('.f-band,.tag__bahn,[data-laufband],dialog,.wliste')) { tx = null; return; } tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', function (e) {
    if (tx === null) return; var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty; tx = null;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 50) schritt(dx < 0 ? 1 : -1);
  }, { passive: true });
  var tk = false;
  addEventListener('scroll', function () { if (tk) return; tk = true; requestAnimationFrame(function () { schild(); tk = false; }); }, { passive: true });
  /* Bild wählen: schon beim Zeigen mit der Maus tauschen */
  D.addEventListener('mouseover', function (e) { var b = e.target.closest && e.target.closest('.f-lb__l [data-wahl]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); });

  window.wahlZeige = function (id, n) { var a = AB.filter(function (x) { return x.dataset.ab === id; })[0]; zeige(a, n, true); if (window.bareissNeu) window.bareissNeu(fassung(a, n)); return a; };
  lesen();
  AB.forEach(function (a) { zeige(a, stand[a.dataset.ab] || 0, true); });
  schild(AB[0]);
})();
