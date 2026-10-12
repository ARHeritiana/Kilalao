/* Guided demos. A finger glides to real controls and uses them while a recorded
   voice explains; captions show the same words. The player's own game is set
   aside and restored afterwards, and nothing from the demo is saved. */
'use strict';
const Demo=(()=>{
 let run=null;
 const STOP=Symbol('stop');
 const active=()=>!!run;
 const find=t=>typeof t==='string'?document.querySelector(t):t;
 function check(){if(!run||run.aborted)throw STOP;}
 const sleep=ms=>new Promise(r=>setTimeout(r,run?.fast?ms*.04:ms));
 async function pause(ms){check();await sleep(ms);check();}
 function centre(el){const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
 function svgPoint(svg,x,y){const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;return{x:r.left+x*r.width/vb.width,y:r.top+y*r.height/vb.height};}
 async function reveal(el){const r=el.getBoundingClientRect(),top=run.bar.getBoundingClientRect().bottom+12,dock=document.querySelector('.action-dock')?.getBoundingClientRect().top??innerHeight;if(r.top<top||r.bottom>dock-8){el.scrollIntoView({block:'center',behavior:GameMotion.reduced()||run.fast?'auto':'smooth'});await pause(420);}}
 async function glide(x,y,ms=460){
  check();const f=run.finger,from=run.at||{x:innerWidth/2,y:innerHeight*.75};run.at={x,y};
  f.style.transform=`translate(${x}px,${y}px)`;f.classList.add('shown');
  if(!run.fast&&!GameMotion.reduced()&&f.animate)await f.animate([{transform:`translate(${from.x}px,${from.y}px)`},{transform:`translate(${x}px,${y}px)`}],{duration:ms,easing:'cubic-bezier(.45,0,.25,1)'}).finished.catch(()=>{});
  check();
 }
 async function press(){const f=run.finger;f.classList.add('down');await pause(110);f.classList.remove('down');const ring=document.createElement('span');ring.className='demo-ripple';ring.style.transform=f.style.transform;document.body.appendChild(ring);setTimeout(()=>ring.remove(),600);}
 // Helpers available to scripts.
 const h={
  async point(target){const el=find(target);if(!el)return;await reveal(el);const c=centre(el);await glide(c.x,c.y);},
  async tap(target,after=380){
   let el=find(target);if(!el)return;await reveal(el);el=find(target)||el;const c=centre(el);await glide(c.x,c.y);await press();check();
   if(typeof el.click==='function')el.click();else el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
   await pause(after);
  },
  // A finger drag through client points, sent as real pointer events.
  async drag(target,points,ms=900,after=500){
   const el=find(target);if(!el)return;await reveal(el);const pts=typeof points==='function'?points():points;
   await glide(pts[0].x,pts[0].y);const fire=(type,p,to=el)=>to.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,clientX:p.x,clientY:p.y,pointerId:77,isPrimary:true,pointerType:'touch',button:0,buttons:type==='pointerup'?0:1}));
   run.finger.classList.add('down');fire('pointerdown',pts[0]);
   const steps=Math.max(8,Math.round(ms/30));
   for(let k=1;k<=steps;k++){
    const t=k/steps*(pts.length-1),i=Math.min(pts.length-2,Math.floor(t)),u=t-i,p={x:pts[i].x+(pts[i+1].x-pts[i].x)*u,y:pts[i].y+(pts[i+1].y-pts[i].y)*u};
    run.at=p;run.finger.style.transform=`translate(${p.x}px,${p.y}px)`;fire('pointermove',p);await pause(ms/steps);
   }
   run.finger.classList.remove('down');fire('pointerup',pts[pts.length-1]);await pause(after);
  },
  // A press and release without movement, for controls that listen to pointers.
  async press(target,after=500){const el=find(target);if(!el)return;await reveal(el);const c=centre(el);await h.drag(el,[c,c],120,after);},
  svg:(selector,x,y)=>svgPoint(document.querySelector(selector),x,y),
  wait:ms=>pause(ms),
 };
 function speak(id,i,text){
  return new Promise(resolve=>{
   const fallback=()=>sleep(Math.max(1600,text.length*58)).then(resolve);
   if(run.fast||run.silent||!run.audio){fallback();return;}
   const a=run.audio;let done=false;const end=()=>{if(!done){done=true;resolve();}};
   a.onended=end;a.onerror=()=>{if(!done){done=true;fallback();}};run.stopVoice=end;
   a.src=`voice/${id}-${i+1}.ogg`;a.play().catch(()=>{if(!done){done=true;fallback();}});
  });
 }
 function ui(id,count){
  const bar=document.createElement('div');bar.className='demo-bar';bar.setAttribute('role','status');bar.setAttribute('aria-live','polite');
  bar.innerHTML=`<div class="demo-head"><span class="demo-badge">Demo</span><span class="demo-dots">${Array.from({length:count},()=>'<i></i>').join('')}</span><button class="demo-mute" aria-pressed="false" aria-label="Mute the voice">🔊</button><button class="demo-stop">Stop</button></div><p></p>`;
  bar.querySelector('.demo-stop').onclick=()=>stop();
  bar.querySelector('.demo-mute').onclick=e=>{const b=e.currentTarget,muted=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',muted);b.textContent=muted?'🔇':'🔊';b.setAttribute('aria-label',muted?'Unmute the voice':'Mute the voice');if(run?.audio)run.audio.muted=muted;};
  const finger=document.createElement('div');finger.className='demo-finger';finger.setAttribute('aria-hidden','true');
  document.body.append(bar,finger);document.body.classList.add('demo-running');
  return{bar,finger};
 }
 async function start(id,opts={}){
  const script=SCRIPTS[id],text=DEMO_TEXT[id];if(!script||!text||run)return false;
  if(activeTab!=='play')showTab('play');
  const stash={current,history,selected,pick,slot,guess:guess.slice(),cardsSelected:cardsSelected.slice(),riverLoad,scroll:scrollY};
  run={id,stash,aborted:false,fast:!!opts.fast,silent:!!opts.silent,audio:opts.fast||opts.silent?null:new Audio(),...ui(id,text.length)};
  if(run.audio)run.audio.preload='auto';
  GameMotion.cancel();
  current=E.init(id,script.mode||(E.MODES[id]||[])[0],7);history=[];selected=null;pick=null;slot=0;guess=[0,1,2,3];cardsSelected=[];riverLoad={key:'',ids:[]};
  renderGame();window.scrollTo(0,0);
  let completed=false;
  try{
   await pause(350);
   for(let i=0;i<text.length;i++){
    check();run.bar.querySelector('p').textContent=text[i];run.bar.querySelectorAll('.demo-dots i').forEach((dot,k)=>dot.classList.toggle('on',k<=i));
    await Promise.all([speak(id,i,text[i]),script.steps[i]?.(h,current)]);
    await pause(450);
   }
   completed=true;
   opts.inspect?.(current,history.length);
  }catch(e){if(e!==STOP)console.error(e);}
  finish(completed);
  return completed;
 }
 function finish(completed,quiet=false){
  if(!run)return;const r=run;run=null;r.aborted=true;
  if(r.audio){r.audio.pause();r.audio.removeAttribute('src');}
  r.bar.remove();r.finger.remove();document.querySelectorAll('.demo-ripple').forEach(x=>x.remove());document.body.classList.remove('demo-running');
  GameMotion.cancel();
  ({current,history,selected,pick,slot,cardsSelected,riverLoad}=r.stash);guess=r.stash.guess;
  if(quiet)return;
  renderGame();window.scrollTo(0,r.stash.scroll);
  toast(completed?'That’s the idea. Your own game is just as you left it.':'Demo stopped. Your game is just as you left it.');
 }
 function stop(quiet=false){if(!run)return;run.aborted=true;run.stopVoice?.();finish(false,quiet);}

 // ---- Game scripts: step i runs while line i is spoken. ----
 const hanoiNext=s=>{const key=t=>JSON.stringify(t.stacks),q=[[s,[]]],seen=new Set([key(s)]);while(q.length){const [t,path]=q.shift();if(t.stacks[t.stacks.length-1].length===t.n)return path[0];for(let f=0;f<t.stacks.length;f++)for(let to=0;to<t.stacks.length;to++){const r=E.move(t,{from:f,to});if(r.ok&&!seen.has(key(r.state))){seen.add(key(r.state));q.push([r.state,[...path,[f,to]]]);}}}};
 async function hanoiMoves(h,n){for(let k=0;k<n;k++){const [f,t]=hanoiNext(current);await h.tap(`[data-peg="${f}"]`,420);await h.tap(`[data-peg="${t}"]`,820);}}
 const cellTap=(h,...cells)=>cells.reduce((p,c)=>p.then(()=>h.tap(`[data-cell="${c}"]`,520)),Promise.resolve());
 const pieceCentre=b=>{const poly=E.piecePoly(b);return poly.reduce((m,v)=>({x:m.x+v.x/poly.length,y:m.y+v.y/poly.length}),{x:0,y:0});};
 async function tangramHome(h,i){const b=current.pieces[i],from=pieceCentre(b),to=pieceCentre({...b,x:b.target[0],y:b.target[1]});await h.drag(`[data-piece="${i}"]`,()=>[h.svg('#tangram-board',from.x,from.y),h.svg('#tangram-board',(from.x+to.x)/2,(from.y+to.y)/2-20),h.svg('#tangram-board',to.x+7,to.y-6)],1000,700);}
 function kakuroSolution(s){const res=[];const go=i=>{if(i===9)return E.kakuroValid({...s,board:res});for(let d=1;d<=9;d++){res[i]=d;const r=Math.floor(i/3),c=i%3,row=res.slice(r*3,r*3+c+1),col=[0,1,2].slice(0,r+1).map(k=>res[k*3+c]);if(new Set(row).size===row.length&&new Set(col).size===col.length&&row.reduce((a,b)=>a+b,0)<=s.rowClues[r]&&col.reduce((a,b)=>a+b,0)<=s.colClues[c]&&go(i+1))return true;}res.length=i;return false;};go(0);return res;}
 async function keys24(h,expr){for(const ch of expr.replace(/\*/g,'×').replace(/\//g,'÷').replace(/-/g,'−').match(/\d+|[^\s\d]/g)){if(/\d/.test(ch)){const key=[...document.querySelectorAll('[data-num-index]')].find(b=>b.dataset.key24===ch&&!b.disabled);await h.tap(key,180);}else await h.tap(`[data-key24="${ch}"]`,180);}}
 async function riverRow(h,who){if(who)await h.tap(`[data-board="${who}"]`,520);await h.tap('.boat-hull',1400);}
 const SCRIPTS={
  hanoi:{mode:'Classic',steps:[h=>h.point('[data-peg="2"]'),h=>hanoiMoves(h,1),h=>hanoiMoves(h,4)]},
  nim:{mode:'Normal Nim',steps:[h=>h.point('[data-heap="0"]'),async h=>{await h.tap('[data-stone="0:1"]',600);await h.tap('#take',900);},async h=>{await h.tap('[data-stone="2:2"]',600);await h.tap('#take',900);},async h=>{await h.wait(2200);await h.tap('[data-stone="1:3"]',600);await h.tap('#take',900);}]},
  chomp:{steps:[h=>h.point('[data-cell="0"]'),h=>cellTap(h,9),h=>cellTap(h,14)]},
  domineering:{steps:[null,h=>cellTap(h,7,16),h=>cellTap(h,22,3)]},
  clobber:{steps:[null,async h=>{await h.tap('[data-cell="0"]',900);await h.tap('[data-cell="1"]',800);},async h=>{await h.tap('[data-cell="5"]',900);await h.tap('[data-cell="6"]',800);}]},
  hackenbush:{steps:[null,async h=>{await h.tap('[data-cut="0"]',900);await h.tap('[data-cut="1"]',1000);}]},
  sprouts:{steps:[null,h=>h.drag('#sprouts-board',()=>[[100,100],[140,62],[200,46],[260,62],[300,100]].map(([x,y])=>h.svg('#sprouts-board',x,y)),1200,800),h=>h.drag('#sprouts-board',()=>[[200,280],[150,250],[110,180],[100,100]].map(([x,y])=>h.svg('#sprouts-board',x,y)),1100,800)]},
  boxes:{steps:[null,async h=>{for(const l of ['h:0:0','v:0:0','h:1:0'])await h.tap(`[data-line="${l}"]`,450);},async h=>{await h.tap('[data-line="v:0:1"]',900);await h.tap('[data-line="h:3:2"]',600);}]},
  hex:{steps:[null,h=>cellTap(h,12,7,17)]},
  sim:{steps:[null,async h=>{for(const v of [0,3,1,4])await h.tap(`[data-vertex="${v}"]`,400);}]},
  peg:{mode:'Triangle',steps:[null,async h=>{await h.tap('[data-hole="3"]',900);await h.tap('[data-hole="0"]',900);},async h=>{const s=current;for(let f=0;f<s.cells.length;f++)for(let t=0;t<s.cells.length;t++)if(E.move(s,{from:f,to:t}).ok){await h.tap(`[data-hole="${f}"]`,700);await h.tap(`[data-hole="${t}"]`,700);return;}}]},
  lights:{steps:[null,h=>cellTap(h,...E.lightsSolution(current).slice(0,3)),h=>cellTap(h,...E.lightsSolution(current))]},
  sliding:{mode:'8 Puzzle',steps:[null,async h=>{
   // The far end of the gap's row, then the far end of its column: each slides a run.
   const far=(z,line)=>line.reduce((b,i)=>Math.abs(i-z)>Math.abs(b-z)?i:b,z);
   let z=current.board.indexOf(0),r=Math.floor(z/3);await h.tap(`[data-cell="${far(z,[r*3,r*3+1,r*3+2])}"]`,900);
   z=current.board.indexOf(0);await h.tap(`[data-cell="${far(z,[z%3,z%3+3,z%3+6])}"]`,900);}]},
  frogs:{steps:[null,h=>cellTap(h,...E.shortestFrog(current).slice(0,3)),h=>cellTap(h,...E.shortestFrog(current).slice(0,4))]},
  sudoku:{steps:[null,h=>h.tap(`[data-cell="${current.fixed.findIndex(v=>!v)}"]`,500),async h=>{const i=selected??current.fixed.findIndex(v=>!v);await h.tap(`[data-number="${current.solution[i]}"]`,600);}]},
  nonogram:{steps:[null,async h=>{const row=current.rowClues.findIndex(c=>c[0]===5);await cellTap(h,...[0,1,2,3,4].map(c=>row*5+c));},async h=>{await h.tap('[data-brush="-1"]',400);await cellTap(h,current.target.findIndex(v=>!v));await h.tap('[data-brush="1"]',300);}]},
  kakuro:{steps:[null,async h=>{const sol=kakuroSolution(current);for(const i of [6,7,8]){await h.tap(`[data-cell="${i}"]`,300);await h.tap(`[data-number="${sol[i]}"]`,450);}}]},
  mastermind:{steps:[null,async h=>{for(const c of [0,0,1,1])await h.tap(`[data-color-pick="${c}"]`,260);await h.tap('#submit-guess',900);},async h=>{for(const c of [2,2,3,3])await h.tap(`[data-color-pick="${c}"]`,260);await h.tap('#submit-guess',900);}]},
  set:{steps:[h=>h.point('[data-card="0"]'),async h=>{await h.wait(1800);for(const i of E.findSet(current.hand))await h.tap(`[data-card="${i}"]`,450);}]},
  queens:{steps:[null,h=>cellTap(h,0,10,17),async h=>{await cellTap(h,17);await cellTap(h,20);}]},
  tangram:{steps:[null,async h=>{await tangramHome(h,1);await tangramHome(h,6);},async h=>{await h.press('[data-piece="3"]',500);await h.press('[data-piece="3"]',900);}]},
  rubik:{mode:'3×3',steps:[h=>h.point('#cube-scene'),async h=>{const sticker='[data-cubie="1,1,1"] [data-sticker-face="F"]',el=document.querySelector(sticker),c=centre(el);await h.drag(sticker,[c,{x:c.x+4,y:c.y-70}],600,900);const top=document.querySelector('[data-cubie="0,1,1"] [data-sticker-face="F"]'),d=centre(top);await h.drag(top,[d,{x:d.x-80,y:d.y+6}],600,900);},async h=>{const r=document.querySelector('#cube-scene').getBoundingClientRect();await h.drag('#cube-scene',[{x:r.left+18,y:r.bottom-30},{x:r.left+120,y:r.bottom-50}],900,500);await h.tap('.cube-rail [data-face="U"]',900);await h.tap('#hint',600);}]},
  river:{mode:'Farmer',steps:[h=>h.point('.boat-hull'),h=>riverRow(h,'goat'),async h=>{await riverRow(h,null);await riverRow(h,'wolf');},h=>riverRow(h,'goat')]},
  twentyfour:{steps:[null,async h=>{await keys24(h,E.solve24(current.numbers).replace(/^\((.*)\)$/,'$1'));},h=>h.tap('#check24',900)]}
 };
 return{start,stop,active,SCRIPTS};
})();
