/* Rundum-Blick (Robert 14.11.2026): ein Rundum-Bild des Zimmers, mit Maus oder Finger drehen.
   Reines WebGL ohne Bibliothek: ein Rechteck, der Blickstrahl je Bildpunkt liest das Rundum-Bild.
   Gezeichnet wird nur, wenn sich der Blick ändert und der Abschnitt im Bild ist (Regel 55). */
(function () {
  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}';
  var FS = 'precision highp float;varying vec2 v;uniform sampler2D t;uniform float gier,nick,tanf,seit,hoch;' +
    'void main(){vec3 d=normalize(vec3(v.x*tanf*seit,v.y*tanf,-1.));' +
    'float c=cos(nick),s=sin(nick);d=vec3(d.x,d.y*c-d.z*s,d.y*s+d.z*c);' +
    'c=cos(gier);s=sin(gier);d=vec3(d.x*c-d.z*s,d.y,d.x*s+d.z*c);' +
    'float u=atan(d.x,-d.z)/6.2831853+.5;float w=clamp(.5-asin(clamp(d.y,-1.,1.))/hoch,0.,1.);' +
    'gl_FragColor=texture2D(t,vec2(u,w));}';

  document.querySelectorAll('[data-rundum]').forEach(function (b) {
    var cv = b.querySelector('canvas'), gl = null, bereit = false, sichtbar = false, offen = false;
    var gier = +(b.dataset.gier || 0) * Math.PI / 180, nick = 0, fov = +(b.dataset.fov || 78) * Math.PI / 180;
    var hoch = +(b.dataset.hoch || 90) * Math.PI / 180, vg = 0, vn = 0, zieh = null, selbst = true, lauf = 0, u = {};

    function start() {
      if (offen) return; offen = true;
      try { gl = cv.getContext('webgl', { antialias: false, alpha: false }); } catch (e) { gl = null; }
      if (!gl) { b.classList.add('ru--flach'); return; }
      var pr = gl.createProgram();
      [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]].forEach(function (x) { var s = gl.createShader(x[0]); gl.shaderSource(s, x[1]); gl.compileShader(s); gl.attachShader(pr, s); });
      gl.linkProgram(pr); gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var a = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      ['gier', 'nick', 'tanf', 'seit', 'hoch'].forEach(function (n) { u[n] = gl.getUniformLocation(pr, n); });
      var klein = Math.min(innerWidth, innerHeight) < 700 || gl.getParameter(gl.MAX_TEXTURE_SIZE) < 8192;
      var im = new Image();
      im.onload = function () {
        var tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
        bereit = true; mass(); zeichne(); b.classList.add('ru--da'); takt();
      };
      im.src = klein ? b.dataset.srcKlein : b.dataset.src;
    }
    function mass() {
      var r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2), w = Math.round(r.width * d), h = Math.round(r.height * d);
      if (w && h && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    }
    function zeichne() {
      if (!bereit) return;
      gl.uniform1f(u.gier, gier); gl.uniform1f(u.nick, nick); gl.uniform1f(u.tanf, Math.tan(fov / 2)); gl.uniform1f(u.seit, cv.width / cv.height); gl.uniform1f(u.hoch, hoch);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function grenze() { var g = Math.max(0, hoch / 2 - fov / 2 - 0.01); nick = Math.max(-g, Math.min(g, nick)); }
    function takt() {
      if (lauf || !bereit) return;
      lauf = requestAnimationFrame(function schritt() {
        lauf = 0;
        if (!sichtbar) return;
        var ruhig = false;
        if (zieh) { ruhig = true; }
        else if (Math.abs(vg) > 0.00008 || Math.abs(vn) > 0.00008) { gier += vg; nick += vn; vg *= 0.93; vn *= 0.93; grenze(); }
        else if (selbst) { gier += 0.0011; }        // dreht sacht, bis jemand anfasst
        else { ruhig = true; }
        zeichne();
        if (!ruhig || zieh) lauf = requestAnimationFrame(schritt);
      });
    }
    cv.addEventListener('pointerdown', function (e) {
      if (!bereit) return;
      zieh = { x: e.clientX, y: e.clientY }; vg = vn = 0; selbst = false; b.classList.add('ru--zieht', 'ru--benutzt');
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      takt();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!zieh) return;
      var k = fov / cv.getBoundingClientRect().height, dx = (e.clientX - zieh.x) * k, dy = (e.clientY - zieh.y) * k;
      gier -= dx; nick += dy; vg = -dx; vn = dy; grenze(); zieh.x = e.clientX; zieh.y = e.clientY;
    });
    function los() { if (!zieh) return; zieh = null; b.classList.remove('ru--zieht'); takt(); }
    cv.addEventListener('pointerup', los); cv.addEventListener('pointercancel', los);
    cv.addEventListener('keydown', function (e) {
      var s = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }[e.key];
      if (!s) return; e.preventDefault(); selbst = false; b.classList.add('ru--benutzt'); gier += s[0]; nick += s[1]; grenze(); zeichne();
    });
    b.querySelectorAll('[data-ru-k]').forEach(function (k) {
      k.addEventListener('click', function () { selbst = false; b.classList.add('ru--benutzt'); vg = +k.dataset.ruK * 0.035; takt(); });
    });
    addEventListener('resize', function () { if (bereit) { mass(); zeichne(); } });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { sichtbar = e.isIntersecting; if (sichtbar) { start(); takt(); } });
      }, { rootMargin: '1200px 0px' }).observe(b);
    } else { sichtbar = true; start(); }
  });
})();
