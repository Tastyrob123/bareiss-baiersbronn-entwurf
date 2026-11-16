/* Zimmer-Wahlseite Bareiss, Runde 3: Bedienung der Galerie-Fassungen. Bewegt wird nur über transform und opacity.
   [data-zn-w]    Blättern im Bild: Teile .zn-t[data-i] (Klasse an), Wahl über [data-zn-zu] und [data-zn-schritt], Anzeige [data-zn-nr]
   [data-zg-spur] Bildreihe zum Wischen: Pfeile schieben die Reihe um ein Foto weiter (die Reihe selbst scrollt nativ) */
(function () {
  var D = document;
  var alle = function (s, w) { return [].slice.call((w || D).querySelectorAll(s)); };

  alle('[data-zn-w]').forEach(function (g) {
    var teile = alle('.zn-t', g), n = teile.length, jetzt = 0;
    function zu(i) {
      i = ((i % n) + n) % n; if (i === jetzt) return;
      var alt = jetzt; jetzt = i;
      teile.forEach(function (t) { var k = +t.dataset.i; t.classList.toggle('weg', k === alt); t.classList.toggle('an', k === i); });
      alle('[data-zn-zu]', g).forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.znZu === i); });
      alle('[data-zn-nr]', g).forEach(function (s) { s.textContent = (i + 1) + ' / ' + n; });
    }
    alle('[data-zn-zu]', g).forEach(function (b) { b.addEventListener('click', function () { zu(+b.dataset.znZu); }); });
    alle('[data-zn-schritt]', g).forEach(function (b) { b.addEventListener('click', function () { zu(jetzt + (+b.dataset.znSchritt)); }); });
  });

  alle('[data-zg-spur]').forEach(function (b) {
    b.addEventListener('click', function () {
      var spur = b.closest('article, section').querySelector('.zg6-spur'), f = spur.querySelector('.rahmen');
      spur.scrollBy({ left: (+b.dataset.zgSpur) * (f ? f.offsetWidth + 16 : spur.clientWidth * .8), behavior: 'smooth' });
    });
  });
})();

/* Kulinarik-Fassungen (kulinarikfassungen.py): Vorhang, Wisch, Fotostapel, scrollend erzählt */
(function () {
  var D = document, ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var alle = function (s, w) { return [].slice.call((w || D).querySelectorAll(s)); };
  /* Vorhang geht auf, sobald die Bühne gut im Bild ist */
  var vio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('auf'); vio.unobserve(e.target); } }); }, { threshold: 0.35 });
  alle('[data-kf-vorhang]').forEach(function (v) { if (ruhig) v.classList.add('auf'); else vio.observe(v); });
  /* Wisch: Linie ziehen, nur transform */
  alle('[data-kf-wisch]').forEach(function (b) {
    var oben = b.querySelector('.kk13-oben'), innen = b.querySelector('.kk13-innen'), griff = b.querySelector('.kk13-griff'), p = .5, zieht = false;
    function setzen() { var px = p * b.clientWidth; oben.style.transform = 'translate3d(' + px + 'px,0,0)'; innen.style.transform = 'translate3d(' + (-px) + 'px,0,0)'; griff.style.transform = 'translate3d(' + px + 'px,0,0)'; }
    function von(e) { var r = b.getBoundingClientRect(); p = Math.min(.96, Math.max(.04, (e.clientX - r.left) / r.width)); setzen(); }
    b.addEventListener('pointerdown', function (e) { zieht = true; b.setPointerCapture(e.pointerId); von(e); });
    b.addEventListener('pointermove', function (e) { if (zieht) von(e); });
    b.addEventListener('pointerup', function () { zieht = false; }); b.addEventListener('pointercancel', function () { zieht = false; });
    new ResizeObserver(setzen).observe(b); setzen();
  });
  /* Fotostapel: ein Tipp legt das oberste nach hinten */
  alle('[data-kf-stapel]').forEach(function (s) {
    var a = alle('.kr10-a', s), reihe = a.map(function (x, k) { return k; });
    function legen() { reihe.forEach(function (k, pos) { a[k].style.zIndex = a.length - pos; a[k].classList.toggle('oben', pos === 0); }); }
    legen();
    s.addEventListener('click', function () {
      var k = reihe.shift(); reihe.push(k); var x = a[k];
      x.classList.remove('fort'); void x.offsetWidth; x.classList.add('fort'); legen(); x.style.zIndex = 99;
      setTimeout(legen, 320); setTimeout(function () { x.classList.remove('fort'); }, 660);
    });
  });
  /* Scrollend erzählt: das stehende Foto wechselt mit dem Absatz in der Bildmitte */
  alle('[data-kf-erzaehl]').forEach(function (g) {
    var f = alle('.kw9-f', g);
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var i = e.target.dataset.i; f.forEach(function (x) { x.classList.toggle('an', x.dataset.i === i); }); } }); }, { rootMargin: '-45% 0px -45% 0px' });
    alle('.kw9-s', g).forEach(function (s) { io.observe(s); });
  });
})();
