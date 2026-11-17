'use strict';
const COLS=10,ROWS=20,SIZE=30;
const SHAPES={I:[[1,1,1,1]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1]],S:[[0,1,1],[1,1,0]],Z:[[1,1,0],[0,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]]};
const COLORS={I:'#00e5ff',O:'#ffe35a',T:'#b777ff',S:'#42f5a1',Z:'#ff547d',J:'#5e89ff',L:'#ffac4d'};
// French for French-language browsers; English for other browser languages.
const browserLanguages=navigator.languages?.length?navigator.languages:[navigator.language||'en'];
const appLanguage=browserLanguages.map(locale=>locale.toLowerCase().split('-')[0]).find(locale=>locale==='fr'||locale==='en')||'en';
const english={
  "ARCADE / BLOCK PARTY":"ARCADE / BLOCK PARTY",
  "SCORE":"SCORE",
  "LIGNES":"LINES",
  "NIVEAU":"LEVEL",
  "CHOISIS TON NIVEAU":"CHOOSE YOUR LEVEL",
  "Choisis l’intensité des effets.":"Choose your visual effects intensity.",
  "INTENSITÉ DES EFFETS":"EFFECTS INTENSITY",
  "0 · Normal (sans effets)":"0 · Normal (no effects)",
  "1 · Un peu":"1 · A little",
  "2 · Ça va":"2 · All right",
  "3 · Oups":"3 · Uh-oh",
  "4 · Trop pris":"4 · Way too much",
  "JOUER":"PLAY",
  "PUBLIER MON RECORD":"SUBMIT MY RECORD",
  "PSEUDO (2 À 20 CARACTÈRES)":"NAME (2–20 CHARACTERS)",
  "ENVOYER":"SUBMIT",
  "ANNULER":"CANCEL",
  "PROCHAINE PIÈCE":"NEXT PIECE",
  "COMMANDES":"CONTROLS",
  "Déplacer":"Move",
  "Tourner":"Rotate",
  "Descendre":"Soft drop",
  "Espace":"Space",
  "Chute rapide":"Hard drop",
  "Pause":"Pause",
  "Rejouer":"Restart",
  "REJOUER":"RESTART",
  "PAUSE":"PAUSE",
  "REPRENDRE":"RESUME",
  "MENU":"MENU",
  "CLASSEMENT":"LEADERBOARD",
  "MUSIQUE":"MUSIC",
  "COUPER":"MUTE",
  "ACTIVER":"UNMUTE",
  "VOLUME":"VOLUME",
  "DESCENDRE":"DOWN",
  "CHUTE":"DROP",
  "Maintiens ◀, ▶ ou ▼ pour répéter · Touche le plateau pour tourner":"Hold ◀, ▶ or ▼ to repeat · Tap the board to rotate",
  "TOP 10 MONDIAL":"GLOBAL TOP 10",
  "NIVEAU D'EFFETS":"EFFECTS LEVEL",
  "0 · Normal":"0 · Normal",
  "FERMER":"CLOSE",
  "A JOUER AVEC MODERATION":"PLAY IN MODERATION",
  "Jeu Tetripz":"Tetripz game",
  "Plateau Tetris de 10 colonnes et 20 lignes":"Tetris board with 10 columns and 20 rows",
  "Niveau des effets":"Effects level",
  "Aperçu de la prochaine pièce":"Next piece preview",
  "Volume de la musique":"Music volume",
  "Commandes tactiles":"Touch controls",
  "Déplacer à gauche":"Move left",
  "Tourner la pièce":"Rotate piece",
  "Déplacer à droite":"Move right",
  "Descendre plus vite":"Soft drop",
  "Faire tomber immédiatement":"Hard drop",
  "Version du jeu":"Game version",
  "RECORD · EFFETS":"BEST · EFFECTS",
  "GAME OVER":"GAME OVER",
  "Nouveau record :":"New personal best:",
  "Score :":"Score:",
  "Classement mondial à configurer.":"Global leaderboard needs configuration.",
  "Record publié ! Merci pour ta participation.":"Record submitted! Thanks for playing.",
  "Publication impossible. Réessaie plus tard.":"Couldn't submit the score. Try again later.",
  "Choisis un pseudo de 2 à 20 caractères.":"Enter a name between 2 and 20 characters.",
  "Publication en cours…":"Submitting score…",
  "Classement mondial non configuré.":"Global leaderboard is not configured.",
  "Chargement…":"Loading…",
  "Aucun score publié à ce niveau.":"No scores submitted for this level yet.",
  "Classement indisponible pour le moment.":"Leaderboard is currently unavailable.",
  "Prends ton temps.":"Take your time."
};
const tr=text=>appLanguage==='en'?(english[text]??text):text;
const formatScore=value=>Number(value).toLocaleString(appLanguage==='fr'?'fr-FR':'en-US');
document.documentElement.lang=appLanguage;
document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=tr(el.dataset.i18n)});
document.querySelectorAll('[data-i18n-aria-label]').forEach(el=>{el.setAttribute('aria-label',tr(el.dataset.i18nAriaLabel))});
const boardCanvas=document.querySelector('#board'),ctx=boardCanvas.getContext('2d');
const nextCanvas=document.querySelector('#next'),nextCtx=nextCanvas.getContext('2d');
const scoreEl=document.querySelector('#score'),bestEl=document.querySelector('#best'),bestLabel=document.querySelector('#best-label'),linesEl=document.querySelector('#lines'),levelEl=document.querySelector('#level');
const overlay=document.querySelector('#overlay'),overlayTitle=document.querySelector('#overlay-title'),overlayMessage=document.querySelector('#overlay-message');
const startBtn=document.querySelector('#start'),pauseBtn=document.querySelector('#pause'),menuBtn=document.querySelector('#menu');
const publishBtn=document.querySelector('#publish-score'),publishForm=document.querySelector('#publish-form');
const publishName=document.querySelector('#publish-name'),publishStatus=document.querySelector('#publish-status');
const confirmPublishBtn=document.querySelector('#confirm-publish');
const rankingBtn=document.querySelector('#ranking'),rankingDialog=document.querySelector('#ranking-dialog');
const rankingLevel=document.querySelector('#ranking-level'),rankingList=document.querySelector('#ranking-list'),rankingStatus=document.querySelector('#ranking-status');
// Clé PUBLIQUE uniquement (jamais de clé secret/service_role) : voir README.
const SUPABASE_URL='https://pmpguuqcpljcyrkffgdk.supabase.co',SUPABASE_PUBLISHABLE_KEY='sb_publishable_SeTAHD6jyQ8fnI1ZD5lPHw_YKwPnal4';
const leaderboardReady=()=>SUPABASE_URL.startsWith('https://')&&SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_');
async function leaderboardRequest(path,options={}){
  const response=await fetch(`${SUPABASE_URL.replace(/\/$/,'')}/rest/v1/${path}`,{
    ...options,headers:{apikey:SUPABASE_PUBLISHABLE_KEY,...options.headers}
  });
  if(!response.ok)throw Error(`Supabase HTTP ${response.status}`);
  return response.status===204||options.headers?.Prefer==='return=minimal'?null:response.json();
}
// Musique indépendante de la partie : tentative immédiate, puis premier geste si autoplay bloqué.
const music=document.querySelector('#music'),musicToggle=document.querySelector('#music-toggle');
const musicVolume=document.querySelector('#music-volume'),musicVolumeValue=document.querySelector('#music-volume-value');
let musicEnabled=true;
try{
  musicEnabled=localStorage.getItem('tetripz-music')!=='off';
  const saved=localStorage.getItem('tetripz-volume');
  if(saved!==null&&Number(saved)>=0&&Number(saved)<=100)musicVolume.value=String(Number(saved));
}catch(_e){}
music.volume=Number(musicVolume.value)/100;
musicVolumeValue.textContent=`${musicVolume.value} %`;
function syncMusic(){
  musicToggle.textContent=tr(musicEnabled?'COUPER':'ACTIVER');
  musicToggle.setAttribute('aria-pressed',String(musicEnabled));
  if(musicEnabled)music.play().catch(()=>{}); // Autoplay peut être refusé avant une interaction.
  else music.pause();
}
function unlockMusic(){
  if(musicEnabled&&music.paused)syncMusic();
}
document.addEventListener('pointerdown',unlockMusic,{once:true});
document.addEventListener('keydown',unlockMusic,{once:true});
musicToggle.addEventListener('click',()=>{
  musicEnabled=!musicEnabled;
  try{localStorage.setItem('tetripz-music',musicEnabled?'on':'off')}catch(_e){}
  syncMusic();
});
musicVolume.addEventListener('input',()=>{
  music.volume=Number(musicVolume.value)/100;
  musicVolumeValue.textContent=`${musicVolume.value} %`;
  try{localStorage.setItem('tetripz-volume',musicVolume.value)}catch(_e){}
});
const uiDifficultyWrap=document.querySelector('#ui-difficulty-wrap');
const uiDifficultySelect=document.querySelector('#ui-difficulty');
let uiDifficulty=Number(uiDifficultySelect.value);
uiDifficultySelect.addEventListener('change',()=>{uiDifficulty=Number(uiDifficultySelect.value);showBest()});

let board,active,nextPiece,bag=[],score=0,lines=0,level=1,state='ready',lastTime=0,dropCounter=0;
let bestBeforeGame=0,publishedThisGame=false;
// Les anciens scores globaux restent dans "tetripz-best" : leur difficulté est inconnue.
const bestByDifficulty=Array.from({length:5},(_,i)=>{
  try{return Math.max(0,Number(localStorage.getItem(`tetripz-best-${i}`))||0)}
  catch(_e){return 0}
});
function showBest(){
  bestEl.textContent=formatScore(bestByDifficulty[uiDifficulty]);
  bestLabel.textContent=`${tr('RECORD · EFFETS')} ${uiDifficulty}`;
}
showBest();
function emptyBoard(){return Array.from({length:ROWS},()=>Array(COLS).fill(null))}
function randomType(){if(!bag.length){bag=Object.keys(SHAPES);for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}}return bag.pop()}
function createPiece(){const type=randomType();return{type,matrix:SHAPES[type].map(row=>row.slice()),x:0,y:0}}
function spawn(){active=nextPiece||createPiece();nextPiece=createPiece();active.x=Math.floor((COLS-active.matrix[0].length)/2);active.y=0;drawNext();if(collides(active.matrix,active.x,active.y))gameOver()}
function collides(matrix,x,y){for(let r=0;r<matrix.length;r++)for(let c=0;c<matrix[r].length;c++)if(matrix[r][c]){const xx=x+c,yy=y+r;if(xx<0||xx>=COLS||yy>=ROWS||(yy>=0&&board[yy][xx]))return true}return false}
function move(dx,dy){if(state!=='playing')return false;if(!collides(active.matrix,active.x+dx,active.y+dy)){active.x+=dx;active.y+=dy;return true}if(dy>0)lockPiece();return false}
function rotate(){if(state!=='playing')return;const m=active.matrix;const rotated=m[0].map((_,i)=>m.map(row=>row[i]).reverse());for(const dx of [0,-1,1,-2,2])if(!collides(rotated,active.x+dx,active.y)){active.matrix=rotated;active.x+=dx;break}}
function hardDrop(){if(state!=='playing')return;let n=0;while(!collides(active.matrix,active.x,active.y+1)){active.y++;n++}score+=n*2;lockPiece()}
function lockPiece(){for(let r=0;r<active.matrix.length;r++)for(let c=0;c<active.matrix[r].length;c++)if(active.matrix[r][c]){const y=active.y+r;if(y<0){gameOver();return}board[y][active.x+c]=active.type}let cleared=0;for(let y=ROWS-1;y>=0;y--){if(board[y].every(Boolean)){board.splice(y,1);board.unshift(Array(COLS).fill(null));cleared++;y++}}if(cleared){score+=[0,100,300,500,800][cleared]*level;lines+=cleared;level=Math.floor(lines/10)+1}updateStats();spawn();dropCounter=0}
function updateStats(){scoreEl.textContent=formatScore(score);linesEl.textContent=lines;levelEl.textContent=level;if(score>bestByDifficulty[uiDifficulty]){bestByDifficulty[uiDifficulty]=score;showBest();try{localStorage.setItem(`tetripz-best-${uiDifficulty}`,String(score))}catch(_e){}}}
function showOverlay(title,message,button){
  uiDifficultyWrap.hidden=state!=='ready';
  publishBtn.hidden=true;publishForm.hidden=true;
  overlayTitle.textContent=tr(title);overlayMessage.textContent=tr(message);
  startBtn.textContent=tr(button);overlay.classList.remove('hidden');
}
function startGame(){bestBeforeGame=bestByDifficulty[uiDifficulty];publishedThisGame=false;rankingBtn.disabled=true;uiDifficultyWrap.hidden=true;publishBtn.hidden=true;publishForm.hidden=true;wobbleTime=0;brickHue=0;brickSat=1;brickFilter='none';if(uiDifficulty>=3)chooseBrickColors();swellTime=0;spinAngle=0;spinDirection=Math.random()<.5?-1:1;zoomScale=1;zoomFrom=1;zoomTarget=1;zoomElapsed=0;if(uiDifficulty>0){chooseZoomTarget();resetDoubleVision()}board=emptyBoard();bag=[];score=0;lines=0;level=1;dropCounter=0;nextPiece=createPiece();state='playing';spawn();updateStats();overlay.classList.add('hidden');pauseBtn.disabled=false;menuBtn.disabled=false;pauseBtn.textContent=tr('PAUSE');lastTime=performance.now();syncMusic()}
function gameOver(){
  state='over';pauseBtn.disabled=true;menuBtn.disabled=true;rankingBtn.disabled=false;
  const record=score>0&&score>bestBeforeGame;
  showOverlay('GAME OVER',record?`${tr('Nouveau record :')} ${formatScore(score)} !`:`${tr('Score :')} ${formatScore(score)}`,'REJOUER');
  publishBtn.hidden=!record;
  publishBtn.disabled=!leaderboardReady();
  if(record&&!leaderboardReady())overlayMessage.textContent+=' '+tr('Classement mondial à configurer.');
  syncMusic();
}
function goToMenu(){
  if(state!=='playing'&&state!=='paused')return;
  state='ready';
  board=emptyBoard();active=null;nextPiece=null;
  score=0;lines=0;level=1;dropCounter=0;
  updateStats();drawNext();
  boardWrap.style.transform='none';ghostLayers.forEach(layer=>{layer.canvas.hidden=true});
  pauseBtn.disabled=true;pauseBtn.textContent=tr('PAUSE');menuBtn.disabled=true;rankingBtn.disabled=false;
  showOverlay('CHOISIS TON NIVEAU','Choisis l’intensité des effets.','JOUER');
  syncMusic();
}
// Aucune publication automatique : le pseudo n'est demandé qu'après un clic volontaire.
publishBtn.addEventListener('click',()=>{
  if(state!=='over'||score<=bestBeforeGame||publishedThisGame||!leaderboardReady())return;
  publishBtn.hidden=true;publishForm.hidden=false;
  publishName.value='';publishStatus.textContent='';publishName.focus();
});
document.querySelector('#cancel-publish').addEventListener('click',()=>{
  publishForm.hidden=true;publishBtn.hidden=false;
  publishName.value='';
});
publishForm.addEventListener('submit',async event=>{
  event.preventDefault();
  const pseudo=publishName.value.trim().replace(/\s+/g,' ');
  if(pseudo.length<2||pseudo.length>20){publishStatus.textContent=tr('Choisis un pseudo de 2 à 20 caractères.');return}
  if(state!=='over'||score<=bestBeforeGame||publishedThisGame||!leaderboardReady())return;
  confirmPublishBtn.disabled=true;publishStatus.textContent=tr('Publication en cours…');
  const gameScore=score,gameDifficulty=uiDifficulty;
  try{
    await leaderboardRequest('scores',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({pseudo,score:gameScore,difficulty:gameDifficulty})});
    publishedThisGame=true;
    if(state==='over'){
      publishForm.hidden=true;publishBtn.hidden=true;
      overlayMessage.textContent=tr('Record publié ! Merci pour ta participation.');
    }
  }catch(_error){
    publishStatus.textContent=tr('Publication impossible. Réessaie plus tard.');
  }finally{confirmPublishBtn.disabled=false}
});
async function loadRanking(){
  const difficulty=Number(rankingLevel.value);
  rankingList.replaceChildren();
  if(!leaderboardReady()){rankingStatus.textContent=tr('Classement mondial non configuré.');return}
  rankingStatus.textContent=tr('Chargement…');
  try{
    const results=await leaderboardRequest(`scores?select=pseudo,score&difficulty=eq.${difficulty}&order=score.desc,created_at.asc&limit=10`);
    if(!rankingDialog.open||Number(rankingLevel.value)!==difficulty)return;
    results.forEach((entry,index)=>{
      const line=document.createElement('li');
      line.textContent=`${index+1}. ${entry.pseudo} — ${formatScore(entry.score)}`;
      rankingList.append(line);
    });
    rankingStatus.textContent=results.length?'':tr('Aucun score publié à ce niveau.');
  }catch(_error){rankingStatus.textContent=tr('Classement indisponible pour le moment.')}
}
rankingBtn.addEventListener('click',()=>{
  rankingLevel.value=String(uiDifficulty);
  rankingDialog.showModal();
  loadRanking();
});
rankingLevel.addEventListener('change',loadRanking);
document.querySelector('#ranking-close').addEventListener('click',()=>rankingDialog.close());
function togglePause(){if(state==='playing'){state='paused';pauseBtn.textContent=tr('REPRENDRE');showOverlay('PAUSE','Prends ton temps.','REPRENDRE')}else if(state==='paused'){state='playing';pauseBtn.textContent=tr('PAUSE');overlay.classList.add('hidden');lastTime=performance.now()}syncMusic()}
let wobbleTime=0;
function cell(context,x,y,color,size=SIZE,alpha=1){
  const power=state==='playing'&&!reduceMotion.matches?[0,0,.045,.095,.16][uiDifficulty]:0;
  let px=x*size,py=y*size,phase=0,speed=0;
  if(power){
    // Chaque case a sa propre oscillation de rebond, d'écrasement et de contour.
    phase=x*2.73+y*4.91+(context===nextCtx?7.11:0);
    speed=4.1+1.7*Math.sin(phase*1.83);
    const bounce=Math.sin(wobbleTime*speed*1.65+phase*1.7);
    const squash=power*(Math.sin(wobbleTime*speed+phase)+.25*bounce);
    context.save();
    context.translate((x+.5)*size,(y+.5)*size+power*size*.55*bounce);
    context.rotate(power*.3*Math.sin(wobbleTime*speed*.7+phase*1.3));
    context.scale(1+squash,1-squash);
    px=py=-size/2;
  }
  context.globalAlpha=alpha;
  context.fillStyle=color;
  if(power){
    const left=px+1,top=py+1,right=px+size-1,bottom=py+size-1;
    const radius=size*power*(.2+.8*(1+Math.sin(wobbleTime*speed*.8+phase))/2);
    const bend=size*power*.55;
    const topCurve=bend*Math.sin(wobbleTime*speed+phase);
    const rightCurve=bend*Math.sin(wobbleTime*speed*.83+phase+1.7);
    const bottomCurve=bend*Math.sin(wobbleTime*speed*1.13+phase+3.1);
    const leftCurve=bend*Math.sin(wobbleTime*speed*.91+phase+4.5);
    context.beginPath();
    context.moveTo(left+radius,top);
    context.bezierCurveTo(left+size*.32,top+topCurve,left+size*.68,top+topCurve,right-radius,top);
    context.quadraticCurveTo(right,top,right,top+radius);
    context.bezierCurveTo(right+rightCurve,top+size*.32,right+rightCurve,top+size*.68,right,bottom-radius);
    context.quadraticCurveTo(right,bottom,right-radius,bottom);
    context.bezierCurveTo(left+size*.68,bottom+bottomCurve,left+size*.32,bottom+bottomCurve,left+radius,bottom);
    context.quadraticCurveTo(left,bottom,left,bottom-radius);
    context.bezierCurveTo(left+leftCurve,top+size*.68,left+leftCurve,top+size*.32,left,top+radius);
    context.quadraticCurveTo(left,top,left+radius,top);
    context.closePath();
    context.fill();
    context.clip(); // Le reflet ne déborde pas des bords incurvés.
  }else{
    context.fillRect(px+1,py+1,size-2,size-2);
  }
  context.fillStyle='#ffffff35';
  context.fillRect(px+3,py+3,size-6,3);
  context.globalAlpha=1;
  if(power)context.restore();
}
function draw(){
  ctx.filter='none';
  ctx.fillStyle='#0b1226';ctx.fillRect(0,0,300,600);
  ctx.strokeStyle='#1a2742';ctx.lineWidth=.6;
  for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*SIZE,0);ctx.lineTo(x*SIZE,600);ctx.stroke()}
  for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*SIZE);ctx.lineTo(300,y*SIZE);ctx.stroke()}
  if(!board)return;
  ctx.filter=brickFilter;
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(board[y][x])cell(ctx,x,y,COLORS[board[y][x]]);
  if(active&&state!=='over'){
    let ghostY=active.y;
    while(!collides(active.matrix,active.x,ghostY+1))ghostY++;
    active.matrix.forEach((row,r)=>row.forEach((v,c)=>{if(v){
      cell(ctx,active.x+c,ghostY+r,COLORS[active.type],SIZE,.22);
      cell(ctx,active.x+c,active.y+r,COLORS[active.type]);
    }}));
  }
  ctx.filter='none';
}
function drawNext(){
  nextCtx.filter='none';
  nextCtx.fillStyle='#0b1226';nextCtx.fillRect(0,0,120,120);
  if(!nextPiece)return;
  const m=nextPiece.matrix,size=24,ox=(120-m[0].length*size)/2,oy=(120-m.length*size)/2;
  nextCtx.save();nextCtx.translate(ox,oy);
  nextCtx.filter=brickFilter;
  m.forEach((row,r)=>row.forEach((v,c)=>{if(v)cell(nextCtx,c,r,COLORS[nextPiece.type],size)}));
  nextCtx.restore();
}


// Houle visuelle : uniquement le plateau, les boutons restent fixes et utilisables.
const boardWrap=document.querySelector('.board-wrap');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
// Jusqu'à trois copies du plateau, chacune avec sa propre animation.
const ghostLayers=Array.from(document.querySelectorAll('.double-vision'),canvas=>({
  canvas,ctx:canvas.getContext('2d'),motion:{}
}));
let ghostCount=1,ghostTimer=0;
function resetDoubleVision(){
  ghostCount=1;
  ghostTimer=2+Math.random()*2;
  ghostLayers.forEach((layer,index)=>{
    const k=uiDifficulty,spread=1+index*.35,fade=1/(1+index*.6);
    const hues=[[120,240],[35,115],[245,325]];
    const ranges={
      x:[-9*k*spread,9*k*spread],
      y:[-12*k*spread,12*k*spread],
      rotate:[-3*k*spread,3*k*spread],
      scale:[1-.08*k*spread,1+.08*k*spread],
      opacity:[(.06+.02*k)*fade,(.12+.06*k)*fade],
      hue:hues[index],
      sat:[1.1,2.5]
    };
    layer.motion={};
    for(const [key,[min,max]] of Object.entries(ranges)){
      const from=index>0?min+Math.random()*(max-min):key==='scale'?1:key==='opacity'?min:key==='hue'?180:key==='sat'?1.7:0;
      layer.motion[key]={from,value:from,to:min+Math.random()*(max-min),min,max,elapsed:0,duration:1+Math.random()*2.8};
    }
    layer.canvas.hidden=true;
  });
}
function animateDoubleVision(dt){
  const active=state==='playing'&&uiDifficulty>0&&!reduceMotion.matches;
  if(active&&uiDifficulty>=3){
    ghostTimer-=Math.max(0,dt)/1000;
    if(ghostTimer<=0){
      const roll=Math.random();
      // Une, deux ou trois copies : quatre images au total au maximum.
      ghostCount=uiDifficulty===3?(roll<.45?1:roll<.9?2:3):(roll<.15?1:roll<.5?2:3);
      ghostTimer=(uiDifficulty===4?2.2:3.5)+Math.random()*2.5;
    }
  }
  ghostLayers.forEach((layer,index)=>{
    const visible=active&&index<ghostCount;
    layer.canvas.hidden=!visible;
    if(!visible)return;
    for(const motion of Object.values(layer.motion)){
      motion.elapsed=Math.min(motion.duration,motion.elapsed+Math.max(0,dt)/1000);
      const p=motion.elapsed/motion.duration;
      const eased=p*p*(3-2*p);
      motion.value=motion.from+(motion.to-motion.from)*eased;
      if(p===1){
        motion.from=motion.value;
        motion.to=motion.min+Math.random()*(motion.max-motion.min);
        motion.elapsed=0;
        motion.duration=1+Math.random()*2.8;
      }
    }
    const {x,y,rotate,scale,opacity,hue,sat}=layer.motion;
    layer.canvas.style.transform=`translate(${x.value.toFixed(1)}px,${y.value.toFixed(1)}px) rotate(${rotate.value.toFixed(1)}deg) scale(${scale.value.toFixed(3)})`;
    layer.canvas.style.opacity=opacity.value.toFixed(3);
    layer.canvas.style.filter=`hue-rotate(${hue.value.toFixed(0)}deg) saturate(${sat.value.toFixed(2)})`;
    layer.ctx.clearRect(0,0,300,600);
    layer.ctx.drawImage(boardCanvas,0,0);
  });
}
// Les briques changent de teinte et de saturation, sans modifier le fond ni la grille.
let brickHue=0,brickSat=1,brickFilter='none';
let brickFromHue=0,brickFromSat=1,brickToHue=0,brickToSat=1,brickElapsed=0,brickDuration=1;
function chooseBrickColors(){
  brickFromHue=brickHue;brickFromSat=brickSat;
  brickToHue=Math.random()*360;
  brickToSat=uiDifficulty===4 ? 0.2+Math.random()*2.6 : 0.55+Math.random()*1.3;
  brickElapsed=0;
  brickDuration=uiDifficulty===4?1+Math.random()*1.4:2.2+Math.random()*2;
}
function animateBrickColors(dt){
  if(state!=='playing'||uiDifficulty<3||reduceMotion.matches)return;
  brickElapsed=Math.min(brickDuration,brickElapsed+Math.max(0,dt)/1000);
  const p=brickElapsed/brickDuration,eased=p*p*(3-2*p);
  brickHue=brickFromHue+(brickToHue-brickFromHue)*eased;
  brickSat=brickFromSat+(brickToSat-brickFromSat)*eased;
  brickFilter=`hue-rotate(${brickHue.toFixed(1)}deg) saturate(${brickSat.toFixed(2)})`;
  if(p===1)chooseBrickColors();
}
let swellTime=0,spinAngle=0,spinDirection=1;
// Zoom organique : cible aléatoire, interpolation douce sans à-coups.
let zoomScale=1,zoomFrom=1,zoomTarget=1,zoomElapsed=0,zoomDuration=2;
function chooseZoomTarget(){
  zoomFrom=zoomScale;
  const ranges=[.09,.20,.30,.45];
  const amplitude=ranges[uiDifficulty-1];
  zoomTarget=1-amplitude+Math.random()*amplitude*2;
  zoomElapsed=0;
  zoomDuration=(1.8+Math.random()*2.4)*(1-(uiDifficulty-1)*.13);
}

function animateSwell(dt){
  if(state!=='playing'||uiDifficulty===0||reduceMotion.matches){
    boardWrap.style.transform='none';
    return;
  }
  swellTime+=Math.max(0,dt)/1000;
  const t=swellTime;
  zoomElapsed+=Math.max(0,dt)/1000;
  const progress=Math.min(1,zoomElapsed/zoomDuration);
  const eased=progress*progress*(3-2*progress);
  zoomScale=zoomFrom+(zoomTarget-zoomFrom)*eased;
  if(progress>=1)chooseZoomTarget();
  // Deux oscillations lentes superposées donnent un balancement organique.
  // L'amplitude augmente très légèrement avec le niveau, sans devenir excessive.
  const difficultyMultiplier=[1,2.1,24,32][uiDifficulty-1];
  const intensity=Math.min(1.35,1+(level-1)*.025)*difficultyMultiplier;
  // Au niveau 4, une rotation continue ondulante finit par dépasser 360°, dans un sens aléatoire.
  if(uiDifficulty===4)spinAngle+=Math.max(0,dt)/1000*(48+16*Math.sin(t*.6))*spinDirection;
  const angle=(Math.sin(t*.9)*1.15+Math.sin(t*.41+1.1)*.45)*intensity+(uiDifficulty===4?spinAngle:0);
  const x=(Math.sin(t*.74+.6)*4+Math.sin(t*.29)*2)*intensity;
  const y=(Math.sin(t*.61+2)*3+Math.sin(t*.35)*1.5)*intensity;
  boardWrap.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${angle.toFixed(2)}deg) scale(${zoomScale.toFixed(4)})`;
}
function frame(time=0){const dt=Math.min(time-lastTime,100);lastTime=time;if(state==='playing'){dropCounter+=Math.max(0,dt);const interval=Math.max(85,850*Math.pow(.82,level-1));if(dropCounter>=interval){move(0,1);dropCounter=0}}animateSwell(dt);animateBrickColors(dt);if(state==='playing'&&uiDifficulty>=2&&!reduceMotion.matches)wobbleTime+=Math.max(0,dt)/1000;draw();if(state==='playing'&&uiDifficulty>=2)drawNext();animateDoubleVision(dt);requestAnimationFrame(frame)}
function action(name){if(name==='left')move(-1,0);else if(name==='right')move(1,0);else if(name==='down'){if(move(0,1)){score++;updateStats()}dropCounter=0}else if(name==='rotate')rotate();else if(name==='drop')hardDrop()}
document.addEventListener('keydown',e=>{const map={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rotate',Space:'drop'};const key=e.code==='Space'?'Space':e.key;if(map[key]){e.preventDefault();if(!e.repeat||key!=='Space')action(map[key])}else if(key.toLowerCase()==='p'){e.preventDefault();if(!e.repeat)togglePause()}else if(key.toLowerCase()==='r'){e.preventDefault();if(!e.repeat)startGame()}});
// Maintenir gauche/droite/bas pour répéter, appui simple pour rotation/chute.
document.querySelectorAll('[data-action]').forEach(btn=>{
  const name=btn.dataset.action;
  let delayTimer=null,repeatTimer=null,activePointer=null;
  const stop=()=>{
    clearTimeout(delayTimer);clearInterval(repeatTimer);
    delayTimer=null;repeatTimer=null;activePointer=null;
  };
  btn.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    e.preventDefault();
    stop();
    activePointer=e.pointerId;
    try{btn.setPointerCapture(e.pointerId)}catch(_e){}
    action(name);
    if(['left','right','down'].includes(name)){
      delayTimer=setTimeout(()=>{repeatTimer=setInterval(()=>action(name),85)},230);
    }
  });
  btn.addEventListener('pointerup',stop);
  btn.addEventListener('pointercancel',stop);
  btn.addEventListener('lostpointercapture',stop);
  btn.addEventListener('contextmenu',e=>e.preventDefault());
});
// Toucher le plateau fait pivoter la pièce ; glisser horizontalement la déplace.
let boardTouch=null;
boardCanvas.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'||state!=='playing')return;
  e.preventDefault();
  boardTouch={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
  try{boardCanvas.setPointerCapture(e.pointerId)}catch(_e){}
});
boardCanvas.addEventListener('pointermove',e=>{
  if(!boardTouch||e.pointerId!==boardTouch.id||state!=='playing')return;
  e.preventDefault();
  const cellWidth=boardCanvas.getBoundingClientRect().width/COLS;
  const dx=e.clientX-boardTouch.x;
  if(Math.abs(dx)>=cellWidth*.75){
    const steps=Math.trunc(dx/(cellWidth*.75));
    for(let i=0;i<Math.min(Math.abs(steps),COLS);i++)action(steps>0?'right':'left');
    boardTouch.x+=steps*cellWidth*.75;
    boardTouch.moved=true;
  }
});
boardCanvas.addEventListener('pointerup',e=>{
  if(!boardTouch||e.pointerId!==boardTouch.id)return;
  e.preventDefault();
  if(!boardTouch.moved)action('rotate');
  boardTouch=null;
});
boardCanvas.addEventListener('pointercancel',()=>{boardTouch=null});
startBtn.addEventListener('click',()=>state==='paused'?togglePause():startGame());pauseBtn.addEventListener('click',togglePause);menuBtn.addEventListener('click',goToMenu);
board=emptyBoard();showOverlay('CHOISIS TON NIVEAU','Choisis l’intensité des effets.','JOUER');syncMusic();requestAnimationFrame(frame);
