// Vérification rapide sans dépendances : node test_modes.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const js = readFileSync('script.js', 'utf8');
const css = readFileSync('style.css', 'utf8');
const options = [...html.matchAll(/<option value="([0-4])"/g)].map(match => match[1]);

assert.deepEqual(options, ['1', '2', '3', '4', '0']);
assert.match(html, /<option value="0" selected>/);
assert.doesNotMatch(html, /id="mode-menu"/);
assert.match(js, /uiDifficulty===0\|\|reduceMotion\.matches/);
assert.match(js, /if\(uiDifficulty>0\)chooseZoomTarget\(\)/);
assert.match(html, /v1\.3\.0/);
assert.match(html, /id="double-vision"[^>]*aria-hidden="true" hidden/);
assert.match(js, /doubleCanvas\.hidden=!visible/);
assert.match(js, /uiDifficulty>0&&!reduceMotion\.matches/);
assert.match(js, /doubleCtx\.drawImage\(boardCanvas,0,0\)/);
assert.match(js, /for\(const \[key,\[min,max\]\] of Object\.entries\(ranges\)\)/);
assert.match(css, /\.double-vision\{[^}]*pointer-events:none/);
console.log('OK : 0 sans effets, 1 à 4 avec houle et copie translucide indépendante.');
