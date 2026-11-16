document.documentElement.classList.add('js');   /* Bewegung nur mit Skript; als Datei statt eingebettet (Sicherheitsregel online) */
/* Erster Blick komplett (Auftrag 10, CLAUDE.md): die Seite bleibt verdeckt (html.laed), bis die Fotos der Fenster im ersten Bild geladen sind
   und die Schrift da ist; dann alles in einem Moment, die Auftritte beginnen genau dann. Höchstens 2,4 s (CSS-Rückfall in maison.css ohne Skript). */
(function(){var d=document.documentElement,fertig=0;function zeig(){if(fertig)return;fertig=1;d.classList.remove('laed')}
setTimeout(zeig,2400);
document.addEventListener('DOMContentLoaded',function(){
  var bilder=[].slice.call(document.querySelectorAll('.m-f5 img,.m-oben img')),warte=bilder.filter(function(i){var r=i.getBoundingClientRect();return r.width&&r.height&&r.top<innerHeight}).map(function(i){
    return i.complete?Promise.resolve():new Promise(function(ok){i.addEventListener('load',ok,{once:true});i.addEventListener('error',ok,{once:true})})});
  if(document.fonts&&document.fonts.load)warte.push(Promise.all([document.fonts.load('440 40px Serif'),document.fonts.load('400 16px Sans')]).catch(function(){}));
  Promise.all(warte).then(function(){requestAnimationFrame(zeig)});
});})();
/* Fehlermelder (R03), vor allem anderen: Skriptfehler in den Browser (bareiss_werkzeuge_fehler) und an den Server-Teil (studio/api/fehler, wenn es ihn gibt).
   Netzfehler nie melden, höchstens 20 je Seite, eigener Fehlschlag wird nicht erneut gemeldet. */
(function(){var zahl=0;function merk(t){t=String(t);window.MAISON_FEHLER=t;if(++zahl>20||/Load failed|access control|abort|NetworkError|Failed to fetch/i.test(t))return;
try{var a=JSON.parse(localStorage.getItem('bareiss_werkzeuge_fehler')||'[]');a.unshift({zeit:new Date().toISOString(),art:'maison',text:('Zentrale: '+t).slice(0,400),ort:location.pathname});localStorage.setItem('bareiss_werkzeuge_fehler',JSON.stringify(a.slice(0,30)))}catch(e){}
try{fetch('/studio/api/fehler',{method:'POST',headers:{'Content-Type':'application/json','X-Studio':'1'},body:JSON.stringify({text:('Zentrale · '+t).slice(0,600)}),keepalive:true}).catch(function(){})}catch(e){}}
window.addEventListener('error',function(e){if(e.target&&e.target.tagName==='SCRIPT'){window.MAISON_FEHLER='Die Datei '+e.target.getAttribute('src').split('?')[0]+' ließ sich nicht laden.';return}merk((e.message||'Fehler')+' · '+(e.filename||'').split('/').pop()+':'+(e.lineno||''))},true);
window.addEventListener('unhandledrejection',function(e){merk('Versprechen: '+((e.reason&&e.reason.message)||e.reason))});
/* Startfehler-Tür (R04): ist maison.js beim Laden nicht durchgelaufen, sagt die Seite es und zeigt alles ohne Bewegung. Wache nach 12 s. */
function tuer(){if(window.MAISON_BEREIT)return;var t=document.getElementById('tuer');if(!t||!t.hidden)return;
document.documentElement.classList.remove('js','laed');document.getElementById('tuer-t').textContent=window.MAISON_FEHLER||'Das Programm der Seite ist nicht durchgelaufen.';t.hidden=false}
window.addEventListener('load',tuer);setTimeout(tuer,12000);})();
