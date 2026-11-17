// Vérification rapide sans dépendances : node test_modes.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const js = readFileSync('script.js', 'utf8');
const css = readFileSync('style.css', 'utf8');
const difficultySelect = html.split('id="ui-difficulty"')[1].split('</select>')[0];
const options = [...difficultySelect.matchAll(/<option value="([0-4])"/g)].map(match => match[1]);

assert.deepEqual(options, ['0', '1', '2', '3', '4']);
assert.match(html, /<option value="0" selected>/);
assert.doesNotMatch(html, /id="mode-menu"/);
assert.match(js, /uiDifficulty===0\|\|reduceMotion\.matches/);
assert.match(js, /if\(uiDifficulty>0\)\{chooseZoomTarget\(\);resetDoubleVision\(\)\}/);
assert.match(html, /v1\.11\.0/);
assert.match(html, /id="double-vision"[^>]*aria-hidden="true" hidden/);
assert.equal((html.match(/class="double-vision"/g)||[]).length,3);
assert.match(js, /uiDifficulty>0&&!reduceMotion\.matches/);
assert.match(js, /layer\.ctx\.drawImage\(boardCanvas,0,0\)/);
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
assert.match(js, /boardWrap\.style\.transform='none';ghostLayers\.forEach/);
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
// La vision multiple doit passer de 1 à 2 ou 3 copies, indépendantes.
const ghostStart=js.indexOf('// Jusqu\'à trois copies');
const ghostEnd=js.indexOf('// Les briques changent de teinte',ghostStart);
assert.ok(ghostStart>=0 && ghostEnd>ghostStart);
const ghostTest=new Function('uiDifficulty','Math',`
  const state='playing',reduceMotion={matches:false},boardCanvas={};
  const canvases=Array.from({length:3},()=>({
    hidden:true,style:{},
    getContext(){return {clearRect(){},drawImage(){}}}
  }));
  const document={querySelectorAll(){return canvases}};
  ${js.slice(ghostStart,ghostEnd)}
  resetDoubleVision();
  const initial=ghostLayers.filter(layer=>!layer.canvas.hidden).length;
  for(let i=0;i<70;i++)animateDoubleVision(100);
  return {
    initial,visible:ghostLayers.filter(layer=>!layer.canvas.hidden).length,
    layers:ghostLayers.map(layer=>({
      hue:layer.motion.hue,zoom:layer.motion.scale,rotation:layer.motion.rotate,
      opacity:layer.motion.opacity,style:layer.canvas.style
    }))
  };
`);
const ghostRandom=Object.create(Math);
ghostRandom.random=()=>.95;
assert.equal(ghostTest(0,ghostRandom).visible,0);
assert.equal(ghostTest(1,ghostRandom).visible,1);
assert.equal(ghostTest(2,ghostRandom).visible,1);
const triple=ghostTest(3,ghostRandom),quadruple=ghostTest(4,ghostRandom);
assert.equal(triple.visible,3);
assert.equal(quadruple.visible,3);
for(const result of [triple,quadruple]){
  assert.equal(result.layers.length,3);
  assert.notEqual(result.layers[0].style.transform,result.layers[1].style.transform);
  assert.notEqual(result.layers[1].style.transform,result.layers[2].style.transform);
  assert.notEqual(result.layers[0].hue.from,result.layers[1].hue.from);
  assert.notEqual(result.layers[1].hue.from,result.layers[2].hue.from);
  assert.notEqual(result.layers[0].opacity.max,result.layers[1].opacity.max);
  assert.notEqual(result.layers[0].zoom.max,result.layers[1].zoom.max);
}
ghostRandom.random=()=>.65;
assert.equal(ghostTest(3,ghostRandom).visible,2);
console.log('OK : vision double/triple/quadruple aléatoire, couches indépendantes.');

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


// Classement : aucun pseudo ni envoi sans nouveau record et choix explicite.
assert.match(html,/id="publish-score"[^>]*hidden/);
assert.match(html,/id="publish-form" hidden/);
assert.match(html,/id="ranking-dialog"/);
assert.match(js,/publishBtn\.addEventListener\('click'/);
assert.match(js,/publishForm\.addEventListener\('submit',async event=>/);
assert.match(js,/rankingList\.append\(line\)/);
assert.match(js,/line\.textContent=/); // jamais innerHTML avec un pseudo distant
const overStart=js.indexOf('function gameOver(){');
const overEnd=js.indexOf('function goToMenu()',overStart);
assert.ok(overStart>=0&&overEnd>overStart);
const checkRecord=new Function('points','before','backendReady',`
  let state='playing',score=points,bestBeforeGame=before;
  const pauseBtn={},menuBtn={},rankingBtn={},publishBtn={hidden:true,disabled:true};
  const overlayMessage={textContent:''};
  let shown='';
  function showOverlay(title,message,button){shown=title+' '+message+' '+button;overlayMessage.textContent=message}
  const leaderboardReady=()=>backendReady;
  function syncMusic(){}
  ${js.slice(overStart,overEnd)}
  gameOver();
  return {shown,visible:!publishBtn.hidden,disabled:publishBtn.disabled,state};
`);
const normal=checkRecord(100,200,true);
assert.equal(normal.state,'over');
assert.equal(normal.visible,false);
assert.equal(checkRecord(201,200,true).visible,true);
assert.equal(checkRecord(201,200,true).disabled,false);
assert.equal(checkRecord(201,200,false).disabled,true);
const sql=readFileSync('supabase/leaderboard.sql','utf8');
assert.match(sql,/enable row level security/i);
assert.match(sql,/for select to anon/i);
assert.match(sql,/for insert to anon/i);
assert.match(sql,/revoke all on public\.scores from anon, authenticated/i);
assert.doesNotMatch(sql,/grant (?:update|delete)\b/i);
console.log('OK : publication facultative seulement sur record, lecture publique et RLS.');


// Les créations renvoient souvent HTTP 201 sans corps avec Prefer:return=minimal.
// Aucun message d'échec ni second envoi ne doit être provoqué par un JSON absent.
const requestStart=js.indexOf('async function leaderboardRequest(');
const requestEnd=js.indexOf('// Musique : la lecture',requestStart);
assert.ok(requestStart>=0&&requestEnd>requestStart);
const makeRequest=new Function('fetch',`
  const SUPABASE_URL='https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY='sb_publishable_test';
  ${js.slice(requestStart,requestEnd)}
  return leaderboardRequest;
`);
let parsed=false;
const successfulPost=makeRequest(async()=>({
  ok:true,status:201,json(){parsed=true;throw Error('Réponse vide')}
}));
assert.equal(await successfulPost('scores',{method:'POST',headers:{Prefer:'return=minimal'}}),null);
assert.equal(parsed,false);
const successfulGet=makeRequest(async()=>({
  ok:true,status:200,json(){parsed=true;return [{pseudo:'Test',score:100}]}
}));
assert.deepEqual(await successfulGet('scores?select=pseudo,score'),[{pseudo:'Test',score:100}]);
assert.equal(parsed,true);
const failedPost=makeRequest(async()=>({ok:false,status:400}));
await assert.rejects(failedPost('scores',{method:'POST',headers:{Prefer:'return=minimal'}}),/Supabase HTTP 400/);
console.log('OK : POST 201 sans JSON accepté ; GET lisible ; erreurs HTTP préservées.');

// Les records locaux ne se mélangent pas entre niveaux 0 à 4.
const recordStart=js.indexOf('let board,active,nextPiece');
const recordEnd=js.indexOf('function emptyBoard()',recordStart);
const statsStart=js.indexOf('function updateStats()');
const statsEnd=js.indexOf('function showOverlay(',statsStart);
assert.ok(recordStart>=0&&recordEnd>recordStart&&statsStart>=0&&statsEnd>statsStart);
const simulateRecords=new Function('localStorage',`
  const bestEl={textContent:''},bestLabel={textContent:''};
  const scoreEl={textContent:''},linesEl={textContent:''},levelEl={textContent:''};
  let uiDifficulty=0;
  ${js.slice(recordStart,recordEnd)}
  ${js.slice(statsStart,statsEnd)}
  return {
    select(level){uiDifficulty=level;showBest();return bestEl.textContent},
    play(points){score=points;updateStats()},
    label(){return bestLabel.textContent}
  };
`);
const stored=new Map([['tetripz-best','9000'],['tetripz-best-3','430']]);
const recordStorage={
  getItem(key){return stored.get(key)??null},
  setItem(key,value){stored.set(key,value)}
};
const records=simulateRecords(recordStorage);
assert.equal(records.select(0),'0');
assert.equal(records.select(3),'430');
assert.equal(records.label(),'RECORD · EFFETS 3');
records.play(400);
assert.equal(stored.get('tetripz-best-3'),'430'); // pas de régression du record
records.play(555);
assert.equal(stored.get('tetripz-best-3'),'555');
assert.equal(records.select(0),'0');
records.play(120);
assert.equal(stored.get('tetripz-best-0'),'120');
for(const level of [1,2,4])assert.equal(records.select(level),'0');
assert.equal(records.select(3),'555');
assert.equal(stored.get('tetripz-best'),'9000'); // ancien record conservé, non réattribué
assert.match(js,/uiDifficultySelect\.addEventListener\('change',\(\)=>\{uiDifficulty=Number\(uiDifficultySelect\.value\);showBest\(\)\}\)/);
assert.match(js,/function startGame\(\)\{bestBeforeGame=bestByDifficulty\[uiDifficulty\]/);
assert.match(html,/id="best-label"/);
console.log('OK : cinq records distincts, changement de difficulté, ancien record conservé.');

// La musique démarre uniquement pendant une partie, avec volume et arrêt réglables.
assert.match(html,/id="music"[^>]*src="tetripz\.mp3"[^>]*loop/);
assert.match(html,/id="music-volume" type="range"/);
assert.match(html,/id="music-toggle"[^>]*aria-pressed/);
assert.match(js,/syncMusic\(\)/);
const musicStart=js.indexOf('// Musique : la lecture');
const musicEnd=js.indexOf('const uiDifficultyWrap=',musicStart);
assert.ok(musicStart>=0&&musicEnd>musicStart);
const exerciseMusic=new Function('saved',`
  let state='ready';
  const data=new Map(saved);
  const localStorage={
    getItem(key){return data.get(key)??null},
    setItem(key,value){data.set(key,value)}
  };
  const musicElement={
    volume:0,plays:0,pauses:0,
    play(){this.plays++;return Promise.resolve()},
    pause(){this.pauses++}
  };
  const musicToggle={handlers:{},textContent:'',attrs:{},
    addEventListener(name,callback){this.handlers[name]=callback},
    setAttribute(name,value){this.attrs[name]=value}
  };
  const musicVolume={handlers:{},value:'40',
    addEventListener(name,callback){this.handlers[name]=callback}
  };
  const musicVolumeValue={textContent:''};
  const lookup={
    '#music':musicElement,'#music-toggle':musicToggle,
    '#music-volume':musicVolume,'#music-volume-value':musicVolumeValue
  };
  const document={querySelector(selector){return lookup[selector]}};
  ${js.slice(musicStart,musicEnd)}
  return {
    musicElement,musicToggle,musicVolume,musicVolumeValue,data,
    state(value){state=value;syncMusic()},
    toggle(){musicToggle.handlers.click()},
    volume(value){musicVolume.value=String(value);musicVolume.handlers.input()}
  };
`);
const soundtrack=exerciseMusic([['tetripz-music','off'],['tetripz-volume','65']]);
assert.equal(soundtrack.musicElement.plays,0);
assert.equal(soundtrack.musicElement.volume,.65);
assert.equal(soundtrack.musicVolumeValue.textContent,'65 %');
soundtrack.state('playing');
assert.equal(soundtrack.musicElement.plays,0); // arrêt enregistré
soundtrack.toggle();
assert.equal(soundtrack.musicElement.plays,1);
assert.equal(soundtrack.musicToggle.textContent,'COUPER');
soundtrack.volume(25);
assert.equal(soundtrack.musicElement.volume,.25);
assert.equal(soundtrack.data.get('tetripz-volume'),'25');
soundtrack.state('paused');
assert.ok(soundtrack.musicElement.pauses>=1);
soundtrack.state('playing');
assert.equal(soundtrack.musicElement.plays,2);
soundtrack.toggle();
assert.equal(soundtrack.musicToggle.textContent,'ACTIVER');
assert.equal(soundtrack.data.get('tetripz-music'),'off');
console.log('OK : musique activable, stoppable, volume conservé et pause synchronisée.');
