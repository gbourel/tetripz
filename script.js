'use strict';
const COLS=10,ROWS=20,SIZE=30;
const SHAPES={I:[[1,1,1,1]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1]],S:[[0,1,1],[1,1,0]],Z:[[1,1,0],[0,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]]};
const COLORS={I:'#00e5ff',O:'#ffe35a',T:'#b777ff',S:'#42f5a1',Z:'#ff547d',J:'#5e89ff',L:'#ffac4d'};
const boardCanvas=document.querySelector('#board'),ctx=boardCanvas.getContext('2d');
const nextCanvas=document.querySelector('#next'),nextCtx=nextCanvas.getContext('2d');
const scoreEl=document.querySelector('#score'),bestEl=document.querySelector('#best'),linesEl=document.querySelector('#lines'),levelEl=document.querySelector('#level');
const overlay=document.querySelector('#overlay'),overlayTitle=document.querySelector('#overlay-title'),overlayMessage=document.querySelector('#overlay-message');
const startBtn=document.querySelector('#start'),pauseBtn=document.querySelector('#pause');
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
function showOverlay(title,message,button){overlayTitle.textContent=title;overlayMessage.textContent=message;startBtn.textContent=button;overlay.classList.remove('hidden')}
function startGame(){board=emptyBoard();bag=[];score=0;lines=0;level=1;dropCounter=0;nextPiece=createPiece();state='playing';spawn();updateStats();overlay.classList.add('hidden');pauseBtn.disabled=false;pauseBtn.textContent='PAUSE';lastTime=performance.now()}
function gameOver(){state='over';pauseBtn.disabled=true;showOverlay('GAME OVER',`Score : ${score.toLocaleString('fr-FR')}`,'REJOUER')}
function togglePause(){if(state==='playing'){state='paused';pauseBtn.textContent='REPRENDRE';showOverlay('PAUSE','Prends ton temps.','REPRENDRE')}else if(state==='paused'){state='playing';pauseBtn.textContent='PAUSE';overlay.classList.add('hidden');lastTime=performance.now()}}
function cell(context,x,y,color,size=SIZE,alpha=1){context.globalAlpha=alpha;context.fillStyle=color;context.fillRect(x*size+1,y*size+1,size-2,size-2);context.fillStyle='#ffffff35';context.fillRect(x*size+3,y*size+3,size-6,3);context.globalAlpha=1}
function draw(){ctx.fillStyle='#0b1226';ctx.fillRect(0,0,300,600);ctx.strokeStyle='#1a2742';ctx.lineWidth=.6;for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*SIZE,0);ctx.lineTo(x*SIZE,600);ctx.stroke()}for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*SIZE);ctx.lineTo(300,y*SIZE);ctx.stroke()}if(!board)return;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(board[y][x])cell(ctx,x,y,COLORS[board[y][x]]);if(active&&state!=='over'){let ghostY=active.y;while(!collides(active.matrix,active.x,ghostY+1))ghostY++;active.matrix.forEach((row,r)=>row.forEach((v,c)=>{if(v){cell(ctx,active.x+c,ghostY+r,COLORS[active.type],SIZE,.22);cell(ctx,active.x+c,active.y+r,COLORS[active.type])}}))}}
function drawNext(){nextCtx.fillStyle='#0b1226';nextCtx.fillRect(0,0,120,120);if(!nextPiece)return;const m=nextPiece.matrix,size=24,ox=(120-m[0].length*size)/2,oy=(120-m.length*size)/2;nextCtx.save();nextCtx.translate(ox,oy);m.forEach((row,r)=>row.forEach((v,c)=>{if(v)cell(nextCtx,c,r,COLORS[nextPiece.type],size)}));nextCtx.restore()}
function frame(time=0){const dt=Math.min(time-lastTime,100);lastTime=time;if(state==='playing'){dropCounter+=Math.max(0,dt);const interval=Math.max(85,850*Math.pow(.82,level-1));if(dropCounter>=interval){move(0,1);dropCounter=0}}draw();requestAnimationFrame(frame)}
function action(name){if(name==='left')move(-1,0);else if(name==='right')move(1,0);else if(name==='down'){if(move(0,1)){score++;updateStats()}dropCounter=0}else if(name==='rotate')rotate();else if(name==='drop')hardDrop()}
document.addEventListener('keydown',e=>{const map={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rotate',Space:'drop'};const key=e.code==='Space'?'Space':e.key;if(map[key]){e.preventDefault();if(!e.repeat||key!=='Space')action(map[key])}else if(key.toLowerCase()==='p'){e.preventDefault();if(!e.repeat)togglePause()}else if(key.toLowerCase()==='r'){e.preventDefault();if(!e.repeat)startGame()}});
document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>action(btn.dataset.action)));
startBtn.addEventListener('click',()=>state==='paused'?togglePause():startGame());pauseBtn.addEventListener('click',togglePause);
board=emptyBoard();showOverlay('PRÊT ?','Fais tomber les blocs !','JOUER');requestAnimationFrame(frame);
