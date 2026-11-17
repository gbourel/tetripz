// Vérification rapide sans dépendances : node test_modes.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const js = readFileSync('script.js', 'utf8');

assert.match(html, /id="ui-difficulty-wrap" class="ui-difficulty-wrap">/);
assert.match(html, /<option value="4">/);
assert.match(js, /uiDifficultyWrap\.hidden=state==='paused'/);
assert.doesNotMatch(js, /uiDifficultyWrap\.hidden=mode!=='ui'/);
assert.match(html, /v1\.1\.1/);
console.log('OK : sélecteur visible au menu et 4 niveaux disponibles.');
