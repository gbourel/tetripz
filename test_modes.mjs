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
assert.match(html, /v1\.7\.0/);
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
// La vision double conserve une teinte décalée même au début de l'animation.
const ghostStart = js.indexOf('function resetDoubleVision()');
const ghostEnd = js.indexOf('function animateDoubleVision(dt)', ghostStart);
assert.ok(ghostStart >= 0 && ghostEnd > ghostStart);
const ghostPalette = new Function('uiDifficulty', 'Math', `
  let doubleMotion = {};
  ${js.slice(ghostStart,ghostEnd)}
  resetDoubleVision();
  return doubleMotion.hue;
`);
for(const level of [1,2,3,4]){
  const hue = ghostPalette(level,random);
  assert.equal(hue.from,180);
  assert.ok(hue.to>=120 && hue.to<=240);
  assert.equal(hue.min,120);
  assert.equal(hue.max,240);
}
// Chaque carré se déforme différemment, avec une intensité croissante.
const wobbleStart=js.indexOf('let wobbleTime=0;');
const wobbleEnd=js.indexOf('function draw(){',wobbleStart);
assert.ok(wobbleStart>=0 && wobbleEnd>wobbleStart);
const wobbleCheck=new Function('uiDifficulty','time',`
  const state='playing', reduceMotion={matches:false}, SIZE=30, nextCtx={};
  ${js.slice(wobbleStart,wobbleEnd)}
  wobbleTime=time;
  const scales=[],curves=[],rounded=[];
  let clips=0;
  const context={
    save(){},restore(){},translate(){},rotate(){},fillRect(){},
    scale(x,y){scales.push({x,y})},
    beginPath(){},moveTo(x){rounded.push(x+14)},
    bezierCurveTo(...points){curves.push(points)},
    quadraticCurveTo(){},closePath(){},fill(){},clip(){clips++}
  };
  cell(context,0,0,'#00e5ff');
  cell(context,1,0,'#00e5ff');
  return {scales,curves,rounded,clips};
`);
for(const difficulty of [0,1]){
  const normal=wobbleCheck(difficulty,1.2);
  assert.equal(normal.scales.length,0);
  assert.equal(normal.curves.length,0);
}
const wobble2=wobbleCheck(2,1.2),wobble3=wobbleCheck(3,1.2),wobble4=wobbleCheck(4,1.2);
assert.equal(wobble2.scales.length,2);
assert.notEqual(wobble2.scales[0].x,wobble2.scales[1].x);
assert.ok(Math.abs(wobble2.scales[0].x-1)<Math.abs(wobble3.scales[0].x-1));
assert.ok(Math.abs(wobble3.scales[0].x-1)<Math.abs(wobble4.scales[0].x-1));
for(const wobble of [wobble2,wobble3,wobble4]){
  assert.equal(wobble.curves.length,8); // 4 bords courbés par carré
  assert.equal(wobble.rounded.length,2);
  assert.equal(wobble.clips,2);
  assert.notEqual(wobble.curves[0][1],wobble.curves[4][1]);
}
assert.ok(wobble2.rounded[0]<wobble3.rounded[0]);
assert.ok(wobble3.rounded[0]<wobble4.rounded[0]);
assert.ok(Math.abs(wobble2.curves[0][1]+14)<Math.abs(wobble3.curves[0][1]+14));
assert.ok(Math.abs(wobble3.curves[0][1]+14)<Math.abs(wobble4.curves[0][1]+14));
assert.match(js,/uiDifficulty>=2\)drawNext\(\)/);
console.log('OK : bords courbés, coins arrondis et carrés indépendants aux niveaux 2–4.');

