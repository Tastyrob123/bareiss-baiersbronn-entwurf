
const path = require('path');
const { chromium } = (() => { try { return require(process.env.HOME + '/Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'); } catch (_) { return require('playwright'); } })();
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://127.0.0.1:' + (process.env.WB_PORT || 9748) + '/werkbank/karte.html', { waitUntil: 'load' }); await p.evaluate(() => document.fonts && document.fonts.ready);
  // feste TrueType-Schnitte für den Druck (variable Schriften landen sonst als «Type 3» in der PDF, Apple-Vorschau zeichnet sie weich)
  await p.addStyleTag({ content: "@font-face{font-family:'PDruck';font-weight:100 380;src:url(/_werkbank/fonts/SourceSerif-Light.ttf)}@font-face{font-family:'PDruck';font-weight:381 900;src:url(/_werkbank/fonts/SourceSerif-Titel.ttf)}" +
    "@font-face{font-family:'IDruck';font-weight:400;src:url(/_werkbank/fonts/SourceSans-Regular.ttf)}@font-face{font-family:'IDruck';font-weight:500 900;src:url(/_werkbank/fonts/SourceSans-Medium.ttf)}" +
    "@font-face{font-family:'MDruck';src:url(/_werkbank/fonts/SourceSans-Regular.ttf)}:root{--serif:'PDruck',Georgia,serif!important;--sans:'IDruck',Arial,sans-serif!important;--mono:'MDruck',Arial,sans-serif!important}" +
    "body,body *{font-family:'IDruck',Arial,sans-serif}h1,h2,h3,h4,.mn-titel,[class*=mn-] b{font-family:'PDruck',Georgia,serif}" });
  await p.evaluate(() => document.fonts && document.fonts.ready); await p.waitForTimeout(800);
  await p.pdf({ path: process.argv[2], format: 'A4', printBackground: true, preferCSSPageSize: true }); await b.close(); console.log('PDF', process.argv[2]); })();
