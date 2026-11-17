'use strict';
const COLS=10,ROWS=20,SIZE=30;
const SHAPES={I:[[1,1,1,1]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1]],S:[[0,1,1],[1,1,0]],Z:[[1,1,0],[0,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]]};
const COLORS={I:'#00e5ff',O:'#ffe35a',T:'#b777ff',S:'#42f5a1',Z:'#ff547d',J:'#5e89ff',L:'#ffac4d'};
const boardCanvas=document.querySelector('#board'),ctx=boardCanvas.getContext('2d');
const nextCanvas=document.querySelector('#next'),nextCtx=nextCanvas.getContext('2d');
const scoreEl=document.querySelector('#score'),bestEl=document.querySelector('#best'),linesEl=document.querySelector('#lines'),levelEl=document.querySelector('#level');
const overlay=document.querySelector('#overlay'),overlayTitle=document.querySelector('#overlay-title'),overlayMessage=document.querySelector('#overlay-message');
const startBtn=document.querySelector('#start'),pauseBtn=document.querySelector('#pause'),menuBtn=document.querySelector('#menu');
const uiDifficultyWrap=document.querySelector('#ui-difficulty-wrap');
const uiDifficultySelect=document.querySelector('#ui-difficulty');
let uiDifficulty=Number(uiDifficultySelect.value);
uiDifficultySelect.addEventListener('change',()=>{uiDifficulty=Number(uiDifficultySelect.value)});

let board,active,nextPiece,bag=[],score=0,lines=0,level=1,best=0,state='ready',lastTime=0,dropCounter=0;
try{best=Number(localStorage.getItem('tetripz-best'))||0}catch(_e){}bestEl.textContent=best;
function emptyBoard(){return Array.from({length:ROWS},()=>Array(COLS).fill(null))}
function randomType(){if(!bag.length){bag=Object.keys(SHAPES);for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}}return bag.pop()}
function createPiece(){const type=randomType();return{type,matrix:SHAPES[type].map(row=>row.slice()),x:0,y:0}}
function spawn(){active=nextPiece||createPiece();nextPiece=createPiece();active.x=Math.floor((COLS-active.matrix[0].length)/2);active.y=0;drawNext();if(collides(active.matrix,active.x,active.y))gameOver()}
function collides(matrix,x,y){for(let r=0;r<matrix.length;r++)for(let c=0;c<matrix[r].length;c++)if(matrix[r][c]){const xx=x+c,yy=y+r;if(xx<0||xx>=COLS||yy>=ROWS||(yy>=0&&board[yy][xx]))return true}return false}
function move(dx,dy){if(state!=='playing')return false;if(!collides(active.matrix,active.x+dx,active.y+dy)){active.x+=dx;active.y+=dy;return true}if(dy>0)lockPiece();return false}
function rotate(){if(state!=='playing')return;const m=active.matrix;const rotated=m[0].map((_,i)=>m.map(row=>row[i]).reverse());for(const dx of [0,-1,1,-2,2])if(!collides(rotated,active.x+dx,active.y)){active.matrix=rotated;active.x+=dx;break}}
function hardDrop(){if(state!=='playing')return;let n=0;while(!collides(active.matrix,active.x,active.y+1)){active.y++;n++}score+=n*2;lockPiece()}
function lockPiece(){for(let r=0;r<active.matrix.length;r++)for(let c=0;c<active.matrix[r].length;c++)if(active.matrix[r][c]){const y=active.y+r;if(y<0){gameOver();return}board[y][active.x+c]=active.type}let cleared=0;for(let y=ROWS-1;y>=0;y--){if(board[y].every(Boolean)){board.splice(y,1);board.unshift(Array(COLS).fill(null));cleared++;y++}}if(cleared){score+=[0,100,300,500,800][cleared]*level;lines+=cleared;level=Math.floor(lines/10)+1}updateStats();spawn();dropCounter=0}
function updateStats(){scoreEl.textContent=score.toLocaleString('fr-FR');linesEl.textContent=lines;levelEl.textContent=level;if(score>best){best=score;bestEl.textContent=best.toLocaleString('fr-FR');try{localStorage.setItem('tetripz-best',String(best))}catch(_e){}}}
function showOverlay(title,message,button){uiDifficultyWrap.hidden=state==='paused';overlayTitle.textContent=title;overlayMessage.textContent=message;startBtn.textContent=button;overlay.classList.remove('hidden')}
function startGame(){uiDifficultyWrap.hidden=true;wobbleTime=0;brickHue=0;brickSat=1;brickFilter='none';if(uiDifficulty>=3)chooseBrickColors();swellTime=0;spinAngle=0;spinDirection=Math.random()<.5?-1:1;zoomScale=1;zoomFrom=1;zoomTarget=1;zoomElapsed=0;if(uiDifficulty>0){chooseZoomTarget();resetDoubleVision()}board=emptyBoard();bag=[];score=0;lines=0;level=1;dropCounter=0;nextPiece=createPiece();state='playing';spawn();updateStats();overlay.classList.add('hidden');pauseBtn.disabled=false;menuBtn.disabled=false;pauseBtn.textContent='PAUSE';lastTime=performance.now()}
function gameOver(){state='over';pauseBtn.disabled=true;menuBtn.disabled=true;showOverlay('GAME OVER',`Score : ${score.toLocaleString('fr-FR')}`,'REJOUER')}
function goToMenu(){
  if(state!=='playing'&&state!=='paused')return;
  state='ready';
  board=emptyBoard();active=null;nextPiece=null;
  score=0;lines=0;level=1;dropCounter=0;
  updateStats();drawNext();
  boardWrap.style.transform='none';doubleCanvas.hidden=true;
  pauseBtn.disabled=true;pauseBtn.textContent='PAUSE';menuBtn.disabled=true;
  showOverlay('CHOISIS TON NIVEAU','Choisis l’intensité des effets.','JOUER');
}
function togglePause(){if(state==='playing'){state='paused';pauseBtn.textContent='REPRENDRE';showOverlay('PAUSE','Prends ton temps.','REPRENDRE')}else if(state==='paused'){state='playing';pauseBtn.textContent='PAUSE';overlay.classList.add('hidden');lastTime=performance.now()}}
let wobbleTime=0;
function cell(context,x,y,color,size=SIZE,alpha=1){
  const power=state==='playing'&&!reduceMotion.matches?[0,0,.045,.095,.16][uiDifficulty]:0;
  let px=x*size,py=y*size;
  if(power){
    // Chaque case possède sa phase et sa fréquence : rebond et écrasement indépendants.
    const phase=x*2.73+y*4.91+(context===nextCtx?7.11:0);
    const speed=4.1+1.7*Math.sin(phase*1.83);
    const bounce=Math.sin(wobbleTime*speed*1.65+phase*1.7);
    const squash=power*(Math.sin(wobbleTime*speed+phase)+.25*bounce);
    context.save();
    context.translate((x+.5)*size,(y+.5)*size+power*size*.55*bounce);
    context.rotate(power*.3*Math.sin(wobbleTime*speed*.7+phase*1.3));
    context.scale(1+squash,1-squash);
    px=py=-size/2;
  }
  context.globalAlpha=alpha;
  context.fillStyle=color;context.fillRect(px+1,py+1,size-2,size-2);
  context.fillStyle='#ffffff35';context.fillRect(px+3,py+3,size-6,3);
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
// Une copie du canvas du jeu, déformée indépendamment de la houle.
const doubleCanvas=document.querySelector('#double-vision'),doubleCtx=doubleCanvas.getContext('2d');
let doubleMotion={};
function resetDoubleVision(){
  const k=uiDifficulty;
  const ranges={x:[-9*k,9*k],y:[-12*k,12*k],rotate:[-3*k,3*k],scale:[1-.08*k,1+.08*k],opacity:[.06+.02*k,.12+.06*k],hue:[120,240]};
  doubleMotion={};
  for(const [key,[min,max]] of Object.entries(ranges)){
    const from=key==='scale'?1:key==='opacity'?min:key==='hue'?180:0;
    doubleMotion[key]={from,value:from,to:min+Math.random()*(max-min),min,max,elapsed:0,duration:1+Math.random()*2.8};
  }
}
function animateDoubleVision(dt){
  const visible=state==='playing'&&uiDifficulty>0&&!reduceMotion.matches;
  doubleCanvas.hidden=!visible;
  if(!visible)return;
  for(const motion of Object.values(doubleMotion)){
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
  const {x,y,rotate,scale,opacity,hue}=doubleMotion;
  doubleCanvas.style.transform=`translate(${x.value.toFixed(1)}px,${y.value.toFixed(1)}px) rotate(${rotate.value.toFixed(1)}deg) scale(${scale.value.toFixed(3)})`;
  doubleCanvas.style.opacity=opacity.value.toFixed(3);
  doubleCanvas.style.filter=`hue-rotate(${hue.value.toFixed(0)}deg) saturate(1.7)`;
  doubleCtx.clearRect(0,0,300,600);
  doubleCtx.drawImage(boardCanvas,0,0);
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
board=emptyBoard();showOverlay('CHOISIS TON NIVEAU','Choisis l’intensité des effets.','JOUER');requestAnimationFrame(frame);
