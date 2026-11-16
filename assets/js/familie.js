/* Familie-Fassungen: Foto tauscht beim Scrollen (ft10). Zum Absatz in der Bildmitte gehört sein Foto; das neue blendet über das alte. */
(function () {
  var D = document;
  function an(g, n) { g.querySelectorAll('[data-fm-b]').forEach(function (b) { b.classList.toggle('an', b.getAttribute('data-fm-b') === n); }); }
  D.querySelectorAll('[data-fm-tausch]').forEach(function (g) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) an(g, e.target.getAttribute('data-fm')); }); }, { rootMargin: '-45% 0px -45% 0px' });
    g.querySelectorAll('[data-fm]').forEach(function (a) { io.observe(a); });
  });
})();
