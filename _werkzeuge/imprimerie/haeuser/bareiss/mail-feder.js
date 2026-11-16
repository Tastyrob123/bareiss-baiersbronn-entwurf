/* Hereinschweben im Newsletter-Baukasten (Hotel Bareiss, 09.11.2026; Prüfskript Punkt 11): am Handy steht der Baukasten untereinander und wird gescrollt.
   Was unterhalb des ersten Bildschirms steht (Vorlagen, Bausteine, Felder, das Blatt), schwebt mit feder.css herein, sobald es am unteren Rand auftaucht.
   Gleiche Rezeptur wie feder.js der Übersicht; Felder, in die man gerade tippt, werden nie neu markiert. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var SEL = '.ml-vorlagen>button, .ml-meine>*, .ml-nav, .ml-blatt, .ml-einfuegen, .ml-felder>*';
  var io = new IntersectionObserver(function (es) {
    es.filter(function (e) { return e.isIntersecting; }).forEach(function (e, n) {
      var el = e.target; io.unobserve(el); el.style.setProperty('--i', Math.min(n, 4)); el.classList.add('da');
      el.addEventListener('animationend', function f(ev) { if (ev.target === el) { el.classList.add('gespielt'); el.removeEventListener('animationend', f); } });
    });
  }, { rootMargin: '0px 0px 8% 0px' });
  function markiere() { document.querySelectorAll(SEL).forEach(function (el) { if (el.hasAttribute('data-fd') || el.contains(document.activeElement)) return; el.setAttribute('data-fd', ''); io.observe(el); }); }
  var plan = 0;
  function los() { new MutationObserver(function () { if (!plan) plan = requestAnimationFrame(function () { plan = 0; markiere(); }); }).observe(document.body, { childList: true, subtree: true }); markiere(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
