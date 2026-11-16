/* Die vier Menus: Reiter, Buchrücken, Preiskacheln und Pfeile schalten das sichtbare Blatt (13.11.2026). */
(function () {
  var D = document;
  function zeige(wurzel, n) {
    var gruppe = wurzel.querySelector('[data-mk-gruppe]'); if (!gruppe) return;
    var bl = gruppe.querySelectorAll('[data-mk-blatt]'), max = bl.length;
    n = ((n % max) + max) % max;
    bl.forEach(function (b) { b.hidden = +b.dataset.mkBlatt !== n; });
    wurzel.querySelectorAll('[data-mk]').forEach(function (k) { k.setAttribute('aria-selected', +k.dataset.mk === n ? 'true' : 'false'); });
    if (window.bareissNeu) window.bareissNeu(bl[n]);
  }
  function wechsle(wurzel, n) {   // Kartenwechsel: das alte Blatt gleitet weg, das neue kommt aus dem Stapel (14.11.2026)
    var gruppe = wurzel.querySelector('[data-mk-gruppe]'); if (!gruppe) return;
    var max = gruppe.querySelectorAll('[data-mk-blatt]').length, a = jetzt(wurzel);
    n = ((n % max) + max) % max;
    if (n === a) return;
    var vor = ((n - a + max) % max) <= max / 2;
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { zeige(wurzel, n); return; }
    gruppe.classList.remove('mk-vor', 'mk-zur');
    gruppe.classList.add(vor ? 'mk-weg' : 'mk-weg-z');
    setTimeout(function () {
      gruppe.classList.remove('mk-weg', 'mk-weg-z');
      zeige(wurzel, n);
      gruppe.classList.add(vor ? 'mk-vor' : 'mk-zur');
      setTimeout(function () { gruppe.classList.remove('mk-vor', 'mk-zur'); }, 900);
    }, 230);
  }
  function jetzt(wurzel) {
    var a = wurzel.querySelector('[data-mk][aria-selected="true"]');
    return a ? +a.dataset.mk : 0;
  }
  function zumKopf(wurzel) {   // nach dem Blättern steht man wieder am Anfang der offenen Karte
    var z = wurzel.querySelector('.mk-blaetter') || wurzel;
    var leiste = D.querySelector('.leiste');
    var hoch = (leiste ? leiste.getBoundingClientRect().height : 0) + 26;
    var y = scrollY + z.getBoundingClientRect().top - hoch;
    if (Math.abs(y - scrollY) > 8) scrollTo({ top: y, behavior: 'smooth' });
  }
  D.addEventListener('click', function (e) {
    var k = e.target.closest && e.target.closest('[data-mk]');
    if (k) { var w = k.closest('.mk'); if (w) { wechsle(w, +k.dataset.mk); return; } }
    var s = e.target.closest && e.target.closest('[data-mk-schritt]');
    if (s) { var w2 = s.closest('.mk'); if (w2) { wechsle(w2, jetzt(w2) + (+s.dataset.mkSchritt)); zumKopf(w2); } }
  });
})();
