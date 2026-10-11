/* Move feedback: stable piece identities, FLIP movement, and changed-cell cues. */
'use strict';
const GameMotion=(()=>{
 let running=new Set(),serial=0;
 const selector='[data-motion],[data-cell],[data-hole],[data-cut],[data-line],[data-piece],[data-block],[data-heap],[data-card],[data-guess],.guess-row,.river-bank,.river-water,.win-banner';
 function reduced(){return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
 function key(el,index){for(const name of ['motion','cell','hole','cut','line','piece','block','heap','card','guess'])if(el.dataset[name]!=null)return name+':'+el.dataset[name];return el.classList[0]+':'+index;}
 function snapshot(root){const result=new Map();if(!root)return result;root.querySelectorAll(selector).forEach((el,i)=>{result.set(key(el,i),{rect:el.getBoundingClientRect(),svgRect:el.ownerSVGElement?.getBoundingClientRect(),html:el.outerHTML,el,hidden:el.classList.contains('gone')});});return result;}
 function cancel(){for(const animation of running)animation.cancel();running.clear();document.querySelectorAll('.motion-ghost').forEach(el=>el.remove());}
 function run(el,frames,duration=220){if(reduced()||!el?.animate)return;const animation=el.animate(frames,{duration,easing:'cubic-bezier(.2,.8,.2,1)'});running.add(animation);animation.finished?.catch(()=>{}).finally(()=>running.delete(animation));return animation;}
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
   if(action.face){Cube3D.animate(root,action.face,action.direction,run);return;}
  }
  let changes=0;const after=snapshot(root);
  for(const [id,now] of after){
   let prev=before.get(id);
   // Capture/jump games identify a moving piece by the action rather than color.
   if(['clobber','peg'].includes(newState.id)&&id===(newState.id==='peg'?'hole:':'cell:')+action.to)prev=before.get((newState.id==='peg'?'hole:':'cell:')+action.from);
   if(newState.id==='frogs'&&action.index!=null&&id==='cell:'+oldState.board.indexOf(0))prev=before.get('cell:'+action.index);
   if(!prev){run(now.el,[{opacity:0,transform:'scale(.85)'},{opacity:1,transform:'scale(1)'}]);changes++;continue;}
   if(newState.id==='tangram'&&id==='piece:'+action.index&&(action.rotate||action.flip)){
    const a=newState.pieces[action.index],b=oldState.pieces[action.index],svg=now.el.ownerSVGElement,rect=svg.getBoundingClientRect(),dx=(b.x-a.x)*rect.width/500,dy=(b.y-a.y)*rect.height/420;
    now.el.style.transformBox='view-box';now.el.style.transformOrigin=`${a.x/5}% ${a.y/4.2}%`;
    const transform=action.rotate?'rotate(-45deg)':'scaleX(-1)';
    // Reflection happens in the piece's local frame, which may be rotated.
    const flip=`rotate(${a.angle}deg) scaleX(-1) rotate(${-a.angle}deg)`;
    run(now.el,[{transform:`translate(${dx}px,${dy}px) ${action.rotate?transform:flip}`},{transform:'translate(0,0) rotate(0deg)'}],240);changes++;continue;
   }
   const dx=prev.rect.left-now.rect.left,dy=prev.rect.top-now.rect.top;
   if((Math.abs(dx)>1||Math.abs(dy)>1)&&prev.rect.width&&now.rect.width){
    const svg=now.el.namespaceURI==='http://www.w3.org/2000/svg';
    now.el.style.transformOrigin='center';
    run(now.el,[{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],svg?220:260);changes++;
   }else if(prev.html!==now.html){
    run(now.el,[{opacity:.45},{opacity:1}],180);changes++;
   }
  }
  // Removed pieces fade above the board. SVG branches retain their original
  // viewBox, avoiding any change of coordinate systems while fading.
  for(const [id,prev] of before)if((!after.has(id)||after.get(id).hidden&&!prev.hidden)&&prev.rect.width){
   let ghost=prev.el.cloneNode(true),rect=prev.rect;
   if(prev.el.namespaceURI==='http://www.w3.org/2000/svg'){
    if(!id.startsWith('cut:'))continue;
    const svg=prev.el.ownerSVGElement;rect=prev.svgRect;const wrapper=svg.cloneNode(false);wrapper.appendChild(ghost);ghost=wrapper;
   }
   // Give cloned SVG definitions unique IDs and remove all interactive targets.
   const prefix='ghost-'+(++serial)+'-';
   for(const el of [ghost,...ghost.querySelectorAll('*')]){
    if(el.id){const old=el.id;el.id=prefix+old;ghost.querySelectorAll('*').forEach(child=>{for(const attr of ['fill','stroke'])if(child.getAttribute(attr)===`url(#${old})`)child.setAttribute(attr,`url(#${prefix+old})`);});}
    el.setAttribute('tabindex','-1');el.removeAttribute('role');
   }
   ghost.classList.add('motion-ghost');ghost.setAttribute('aria-hidden','true');Object.assign(ghost.style,{position:'fixed',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',margin:0,pointerEvents:'none',zIndex:20});document.body.appendChild(ghost);const a=run(ghost,[{opacity:.8,transform:'scale(1)'},{opacity:0,transform:'scale(.7)'}]);if(a)a.finished?.catch(()=>{}).finally(()=>ghost.remove());else ghost.remove();changes++;
  }
  // Newly drawn connections grow along their true path.
  root.querySelectorAll('[data-draw]').forEach(el=>{const id=el.dataset.draw;if(oldState.edges?.[id])return;const length=el.getTotalLength?.();if(length)run(el,[{strokeDasharray:`${length}`,strokeDashoffset:length},{strokeDasharray:`${length}`,strokeDashoffset:0}],260);});
  if(newState.id==='river'){const boat=root.querySelector('.river-water');run(boat,[{transform:`translateX(${(newState.boat??newState.banks?.[0])===1?-50:50}px)`,opacity:.4},{transform:'translateX(0)',opacity:1}],300);}
  if(!changes)run(root,[{opacity:.65},{opacity:1}],180);
 }
 return{snapshot,play,cancel,run,reduced};
})();
