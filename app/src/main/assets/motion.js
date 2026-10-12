/* Move feedback: stable piece identities, FLIP movement, color cross-fades,
   captures, the river crossing scene, and a short celebration on a win. */
'use strict';
const GameMotion=(()=>{
 let running=new Set(),serial=0;
 const SVGNS='http://www.w3.org/2000/svg',EASE='cubic-bezier(.2,.8,.2,1)',SWING='cubic-bezier(.45,0,.25,1)';
 const selector='[data-motion],[data-cell],[data-hole],[data-cut],[data-line],[data-piece],[data-block],[data-heap],[data-card],[data-guess],.guess-row,.win-banner';
 function reduced(){return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
 function key(el,index){for(const name of ['motion','cell','hole','cut','line','piece','block','heap','card','guess'])if(el.dataset[name]!=null)return name+':'+el.dataset[name];return el.classList[0]+':'+index;}
 const isSvg=el=>el.namespaceURI===SVGNS;
 function paint(el){const cs=window.getComputedStyle?.(el);if(!cs)return{};return isSvg(el)?{fill:cs.fill,stroke:cs.stroke}:{backgroundColor:cs.backgroundColor,color:cs.color};}
 function snapshot(root){const result=new Map();if(!root)return result;root.querySelectorAll(selector).forEach((el,i)=>{result.set(key(el,i),{rect:el.getBoundingClientRect(),svgRect:el.ownerSVGElement?.getBoundingClientRect(),html:el.outerHTML,paint:paint(el),el,hidden:el.classList.contains('gone')});});return result;}
 function cancel(){for(const animation of running)animation.cancel();running.clear();document.querySelectorAll('.motion-ghost').forEach(el=>el.remove());}
 function run(el,frames,duration=240,opts={}){if(reduced()||!el?.animate)return;const animation=el.animate(frames,{duration,easing:opts.easing||EASE,delay:opts.delay||0});running.add(animation);animation.finished?.catch(()=>{}).finally(()=>running.delete(animation));return animation;}
 // CSS transforms on SVG content use user units, not screen pixels.
 function svgScale(el){const svg=el.ownerSVGElement,vb=svg?.viewBox?.baseVal;if(!vb?.width)return 1;const r=svg.getBoundingClientRect();return r.width?Math.min(r.width/vb.width,r.height/vb.height||Infinity):1;}
 function centered(el){if(isSvg(el)){el.style.transformBox='fill-box';}el.style.transformOrigin='center';}
 const t=(x,y)=>`translate(${x}px,${y}px)`;
 // A fading, inert copy of an element that has left the board (or been captured).
 function ghost(id,prev){
  if(!prev?.rect.width)return;
  let copy=prev.el.cloneNode(true),rect=prev.rect;
  if(isSvg(prev.el)){const wrapper=prev.el.ownerSVGElement.cloneNode(false);wrapper.appendChild(copy);copy=wrapper;rect=prev.svgRect;}
  // Give cloned SVG definitions unique IDs and remove all interactive targets.
  const prefix='ghost-'+(++serial)+'-';
  for(const el of [copy,...copy.querySelectorAll('*')]){
   if(el.id){const old=el.id;el.id=prefix+old;copy.querySelectorAll('*').forEach(child=>{for(const attr of ['fill','stroke'])if(child.getAttribute(attr)===`url(#${old})`)child.setAttribute(attr,`url(#${prefix+old})`);});}
   el.setAttribute('tabindex','-1');el.removeAttribute('role');
  }
  copy.classList.add('motion-ghost');copy.setAttribute('aria-hidden','true');Object.assign(copy.style,{position:'fixed',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',margin:0,pointerEvents:'none',zIndex:20});document.body.appendChild(copy);
  const a=run(copy,[{opacity:.9,transform:'scale(1)'},{opacity:0,transform:'scale(.6)'}],280,{easing:'cubic-bezier(.4,0,1,1)'});if(a)a.finished?.catch(()=>{}).finally(()=>copy.remove());else copy.remove();
 }
 // Passengers step into the boat, ride across with it, and step out on the far bank.
 function crossRiver(before,after){
  const boat=after.get('motion:boat'),oldBoat=before.get('motion:boat');if(!boat||!oldBoat?.rect.width)return 0;
  const duration=1150,board=.22,land=.78,bdx=oldBoat.rect.left-boat.rect.left;
  if(Math.abs(bdx)<2)return 0;
  run(boat.el,[{transform:`translateX(${bdx}px)`,offset:0},{transform:`translateX(${bdx}px) rotate(0deg)`,offset:board,easing:SWING},{transform:`translateX(${bdx/2}px) rotate(${bdx>0?2:-2}deg)`,offset:.5,easing:SWING},{transform:'translateX(0) rotate(0deg)',offset:land},{transform:'translateX(0)',offset:1}],duration,{easing:'linear'});
  const riders=[...after].filter(([id,now])=>id!=='motion:boat'&&id.startsWith('motion:')&&before.get(id)&&Math.abs(before.get(id).rect.left-now.rect.left)>boat.rect.width/3);
  riders.forEach(([id,now],i)=>{
   const prev=before.get(id),icon=now.el.querySelector('svg')?.getBoundingClientRect().height||now.rect.height,offset=riders.length===1?0:(i-.5)*boat.rect.width*.42;
   const seat=r=>({x:r.left+r.width/2+offset-now.rect.width/2-now.rect.left,y:r.top+r.height*.5-icon-now.rect.top});
   const p0={x:prev.rect.left-now.rect.left,y:prev.rect.top-now.rect.top},p1=seat(oldBoat.rect),p2=seat(boat.rect);
   run(now.el,[{transform:t(p0.x,p0.y),offset:0,easing:'ease-out'},{transform:t((p0.x+p1.x)/2,(p0.y+p1.y)/2-16),offset:board/2,easing:'ease-in'},{transform:t(p1.x,p1.y),offset:board,easing:SWING},{transform:t(p2.x,p2.y),offset:land,easing:'ease-out'},{transform:t(p2.x/2,p2.y/2-16),offset:land+(1-land)/2,easing:'ease-in'},{transform:t(0,0),offset:1}],duration,{easing:'linear'});
   for(const label of now.el.querySelectorAll('small,b'))run(label,[{opacity:1},{opacity:0,offset:board*.8},{opacity:0,offset:land+.04},{opacity:1}],duration,{easing:'linear'});
  });
  return duration;
 }
 function celebrate(root,delay){
  [...root.querySelectorAll('[data-motion],[data-cell],[data-hole],[data-piece],[data-block]')].slice(0,40).forEach((el,i)=>{centered(el);run(el,[{transform:'none'},{transform:'translateY(-6px) scale(1.05)',offset:.4},{transform:'none'}],440,{delay:delay+i*28,easing:'ease-in-out'});});
 }
 function reject(root){run(root,[{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(6px)'},{transform:'translateX(-4px)'},{transform:'translateX(2px)'},{transform:'translateX(0)'}],320,{easing:'ease-out'});}
 function play(before,root,oldState,newState,action={}){
  if(!root||reduced()||!root.animate)return;
  if(newState.id==='rubik'){
   if(!action.face){
    // Undo may restore either a longer or a shorter scramble trail.
    for(const face of ['U','D','F','B','L','R'])for(const direction of [-1,1]){
     const candidate=KilalaoEngine.clone(oldState);KilalaoEngine.cubeTurn(candidate,face,direction);
     if(JSON.stringify(candidate.stickers)===JSON.stringify(newState.stickers))action={face,direction};
    }
   }
   if(action.face){Cube3D.animate(root,action.face,action.direction,(el,frames)=>run(el,frames,360,{easing:SWING}));return;}
  }
  const after=snapshot(root);let longest=300;
  if(newState.id==='river'){longest=crossRiver(before,after)||longest;if(newState.won&&!oldState.won)celebrate(root,longest);return;}
  // Capture and jump games identify a moving piece by the action rather than its color.
  const moves=new Map(),captured=[];
  if(newState.id==='clobber'&&action.to!=null){moves.set('cell:'+action.to,'cell:'+action.from);captured.push('cell:'+action.to);}
  if(newState.id==='peg'&&action.to!=null){
   moves.set('hole:'+action.to,'hole:'+action.from);
   const a=oldState.cells[action.from],b=oldState.cells[action.to],mid=oldState.cells.findIndex(v=>v.r*2===a.r+b.r&&v.c*2===a.c+b.c);
   if(mid>=0)captured.push('hole:'+mid);
  }
  if(newState.id==='frogs'&&action.index!=null)moves.set('cell:'+oldState.board.indexOf(0),'cell:'+action.index);
  const sources=new Set(moves.values());
  for(const [id,now] of after){
   const prev=before.get(moves.get(id)||id);
   if(sources.has(id)&&!moves.has(id))continue;// The vacated square needs no cue.
   if(captured.includes(id)&&!moves.has(id))continue;// Its ghost fades instead.
   if(!prev){centered(now.el);run(now.el,[{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(1)'}],260);continue;}
   if(newState.id==='tangram'&&id==='piece:'+action.index&&(action.rotate||action.flip)){
    const a=newState.pieces[action.index],b=oldState.pieces[action.index];
    now.el.style.transformBox='view-box';now.el.style.transformOrigin=`${a.x}px ${a.y}px`;
    // Reflection happens in the piece's local frame, which may be rotated.
    const turn=action.rotate?'rotate(-45deg)':`rotate(${a.angle}deg) scaleX(-1) rotate(${-a.angle}deg)`;
    run(now.el,[{transform:`translate(${b.x-a.x}px,${b.y-a.y}px) ${turn}`},{transform:'translate(0px,0px) rotate(0deg)'}],320,{easing:SWING});continue;
   }
   const dx=prev.rect.left-now.rect.left,dy=prev.rect.top-now.rect.top;
   if((Math.abs(dx)>1||Math.abs(dy)>1)&&prev.rect.width&&now.rect.width){
    const k=svgScale(now.el),x=dx/k,y=dy/k;centered(now.el);
    if(newState.id==='hanoi'&&id.startsWith('motion:disk-')){
     // Lift clear of the pegs, carry across, then lower onto the new stack.
     const tower=now.el.closest('.peg-tower')?.getBoundingClientRect(),lift=Math.min(y,(tower?tower.top+21:now.rect.top-90)-now.rect.top);
     run(now.el,[{transform:t(x,y),easing:'ease-out'},{transform:t(x,lift),offset:.3,easing:SWING},{transform:t(0,lift),offset:.7,easing:'ease-in'},{transform:t(0,0)}],560,{easing:'linear'});longest=600;continue;
    }
    // A jump over another piece arcs; a slide stays flat.
    const jump=moves.has(id)&&Math.hypot(dx,dy)>now.rect.width*1.5;
    run(now.el,jump?[{transform:t(x,y)+' scale(1)'},{transform:t(x/2,y/2-now.rect.height*.45/k)+' scale(1.12)',offset:.5},{transform:t(0,0)+' scale(1)'}]:[{transform:t(x,y)},{transform:t(0,0)}],jump?360:isSvg(now.el)?240:260,{easing:jump?SWING:EASE});
   }else if(prev.html!==now.html&&!id.startsWith('line:')){
    // Colors cross-fade from their old values; a small settle marks the change.
    const from=prev.paint,to=paint(now.el),recolor=Object.keys(to).some(k=>from[k]&&from[k]!==to[k]);centered(now.el);
    run(now.el,recolor?[{...from,transform:'scale(.92)'},{...to,transform:'scale(1)'}]:[{opacity:.55,transform:'scale(.9)'},{opacity:1,transform:'scale(1)'}],recolor?300:220);
   }
  }
  // Removed pieces fade above the board. SVG branches retain their original
  // viewBox, avoiding any change of coordinate systems while fading.
  for(const [id,prev] of before)if((!after.has(id)||after.get(id).hidden&&!prev.hidden)&&prev.rect.width&&(!isSvg(prev.el)||id.startsWith('cut:')))ghost(id,prev);
  for(const id of captured)ghost(id,before.get(id));
  // Newly drawn connections grow along their true path.
  root.querySelectorAll('[data-draw]').forEach(el=>{const id=el.dataset.draw;if(oldState.edges?.[id])return;const length=el.getTotalLength?.();if(length)run(el,[{strokeDasharray:`${length}`,strokeDashoffset:length},{strokeDasharray:`${length}`,strokeDashoffset:0}],320,{easing:'ease-out'});});
  if(newState.won&&!oldState.won)celebrate(root,longest);
 }
 return{snapshot,play,cancel,run,reduced,reject};
})();
