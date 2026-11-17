// Vérification rapide sans dépendances : node test_modes.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const js = readFileSync('script.js', 'utf8');
const css = readFileSync('style.css', 'utf8');
const options = [...html.matchAll(/<option value="([0-4])"/g)].map(match => match[1]);

assert.deepEqual(options, ['0', '1', '2', '3', '4']);
assert.match(html, /<option value="0" selected>/);
assert.doesNotMatch(html, /id="mode-menu"/);
assert.match(js, /uiDifficulty===0\|\|reduceMotion\.matches/);
assert.match(js, /if\(uiDifficulty>0\)\{chooseZoomTarget\(\);resetDoubleVision\(\)\}/);
assert.match(html, /v1\.5\.0/);
assert.match(html, /id="double-vision"[^>]*aria-hidden="true" hidden/);
assert.match(js, /doubleCanvas\.hidden=!visible/);
assert.match(js, /uiDifficulty>0&&!reduceMotion\.matches/);
assert.match(js, /doubleCtx\.drawImage\(boardCanvas,0,0\)/);
assert.match(js, /for\(const \[key,\[min,max\]\] of Object\.entries\(ranges\)\)/);
assert.match(css, /\.double-vision\{[^}]*pointer-events:none/);
assert.match(js, /difficultyMultiplier=\[1,2\.1,24,32\]/);
assert.match(js, /if\(uiDifficulty===4\)spinAngle\+=/);
assert.match(js, /spinDirection=Math\.random\(\)<\.5\?-1:1/);
assert.match(html, /id="menu" class="secondary" disabled>MENU<\/button>/);
assert.match(js, /menuBtn\.addEventListener\('click',goToMenu\)/);
assert.match(js, /function goToMenu\(\)/);
assert.match(js, /if\(state!=='playing'&&state!=='paused'\)return/);
assert.match(js, /state='ready'/);
assert.match(js, /boardWrap\.style\.transform='none';doubleCanvas\.hidden=true/);
assert.match(js, /showOverlay\('CHOISIS TON NIVEAU'/);

// Exécute la logique de coloration avec un hasard déterministe.
const start = js.indexOf('let brickHue=0');
const end = js.indexOf('let swellTime=', start);
assert.ok(start>=0 && end>start);
const palette = new Function('uiDifficulty', 'Math', `
  const state='playing', reduceMotion={matches:false};
  ${js.slice(start,end)}
  chooseBrickColors();animateBrickColors(1000);
  return {hue:brickHue,sat:brickSat,filter:brickFilter};
`);
const random = Object.create(Math);
random.random=()=>.75;
for (const level of [0,1,2]) assert.equal(palette(level,random).filter,'none');
const color3=palette(3,random),color4=palette(4,random);
assert.match(color3.filter,/hue-rotate/);
assert.ok(color4.hue>color3.hue && color4.sat>color3.sat);
assert.match(js,/ctx.filter=brickFilter/);
assert.match(js,/nextCtx.filter=brickFilter/);
console.log('OK : couleurs stables aux niveaux 0–2 et variantes aux niveaux 3–4.');

