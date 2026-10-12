/* Local CSS 3D renderer. Coordinates and sticker colors come from the game engine.
   Swiping across a sticker turns the row or column under the finger; dragging
   beside the cube orbits the camera; the side rail turns whole faces. */
'use strict';
const Cube3D=(()=>{
 const faces={U:{normal:[0,1,0],axis:1,side:1,rotation:'rotateX(90deg)',name:'Up'},D:{normal:[0,-1,0],axis:1,side:-1,rotation:'rotateX(-90deg)',name:'Down'},F:{normal:[0,0,1],axis:2,side:1,rotation:'',name:'Front'},B:{normal:[0,0,-1],axis:2,side:-1,rotation:'rotateY(180deg)',name:'Back'},R:{normal:[1,0,0],axis:0,side:1,rotation:'rotateY(90deg)',name:'Right'},L:{normal:[-1,0,0],axis:0,side:-1,rotation:'rotateY(-90deg)',name:'Left'}};
 // [axis, layer, reference side]; matches the engine's CUBE_LAYERS.
 const layers={U:[1,1,1],D:[1,-1,-1],F:[2,1,1],B:[2,-1,-1],R:[0,1,1],L:[0,-1,-1],M:[0,0,-1],E:[1,0,-1],S:[2,0,1]};
 const colors={U:'#fff8e8',D:'#f6cf48',F:'#389c6f',B:'#3986ce',R:'#e56350',L:'#f2a347'};
 let view={x:-25,y:-35},turnDir=1,drag=null;
 const same=(a,b)=>a.every((v,i)=>v===b[i]);
 function turnSpec(face,direction){const [axis,side,ref]=layers[face];return{axis,side,cssAxis:'XYZ'[axis],angle:ref*direction*90*(axis===1?-1:1)};}
 const railLabel=(f,d)=>`Turn ${faces[f].name} face ${d===1?'clockwise':'counterclockwise'}`;
 function render(s){
  const coords=s.n===2?[-1,1]:[-1,0,1],size=s.n===2?84:54,step=s.n===2?44:57;
  let cubies='';
  for(const x of coords)for(const y of coords)for(const z of coords){
   if(x===0&&y===0&&z===0)continue;
   const pos=[x,y,z];
   cubies+=`<div class="cubie-orbit" data-cubie="${pos.join(',')}"><div class="cubie" style="width:${size}px;height:${size}px;margin:${-size/2}px;transform:translate3d(${x*step}px,${-y*step}px,${z*step}px)">${Object.entries(faces).map(([face,f])=>{
    const sticker=s.stickers.find(st=>same(st.pos,pos)&&same(st.norm,f.normal));
    const label=sticker&&(s.n===3?pos.filter(v=>v===0).length===2:pos.every((v,i)=>i===f.axis||v===-1));
    return`<div class="cubie-side" style="transform:${f.rotation} translateZ(${size/2}px)">${sticker?`<div class="sticker" data-sticker-face="${face}" data-color="${sticker.color}" style="background:${colors[sticker.color]}">${label?`<span>${face}</span>`:''}</div>`:''}</div>`;
   }).join('')}</div></div>`;
  }
  return`<div class="cube-workspace"><div class="cube-stage"><div class="cube-scene" id="cube-scene" tabindex="0" role="group" aria-label="${s.n} by ${s.n} cube. Swipe across the cube to turn a row or column. Drag beside it, or use the arrow keys, to look around." aria-describedby="cube-help"><div class="cube-shadow"></div><div class="cube-view" style="transform:rotateX(${view.x}deg) rotateY(${view.y}deg)">${cubies}</div></div><div class="cube-rail" role="group" aria-label="Turn a face"><button class="cube-dir" data-cube-dir aria-pressed="${turnDir===-1}" aria-label="Turn direction: ${turnDir===1?'clockwise':'counterclockwise'}. Tap to switch."><span aria-hidden="true">${turnDir===1?'↻':'↺'}</span></button>${['U','F','R','D','B','L'].map(f=>`<button data-face="${f}" data-turn="${turnDir}" aria-label="${railLabel(f,turnDir)}"><b>${f}${turnDir===1?'':'′'}</b></button>`).join('')}</div></div><div class="cube-caption"><span id="cube-help">Swipe the cube to turn a row · drag beside it to look around</span><button id="cube-reset" aria-label="Reset cube viewing angle">Reset view</button></div><details class="cube-accessible"><summary>All six faces · sticker colors</summary>${Object.entries(KilalaoEngine.cubeFaces(s)).map(([f,cs])=>`<p><b>${f} · ${faces[f].name}:</b> ${cs.map(c=>({U:'white',D:'yellow',F:'green',B:'blue',R:'red',L:'orange'})[c]).join(', ')}</p>`).join('')}</details></div>`;
 }
 // Engine vector -> screen direction under the current camera (CSS y points down).
 function project(v){
  const rx=view.x*Math.PI/180,ry=view.y*Math.PI/180,c=[v[0],-v[1],v[2]];
  const x=c[0]*Math.cos(ry)+c[2]*Math.sin(ry),y=c[1],z=-c[0]*Math.sin(ry)+c[2]*Math.cos(ry);
  return[x,y*Math.cos(rx)-z*Math.sin(rx)];
 }
 // The layer move whose on-face motion best matches the swipe.
 function swipeMove(pos,normal,dx,dy,n){
  const nAxis=normal.findIndex(v=>v!==0);let best=null;
  for(let k=0;k<3;k++){
   if(k===nAxis)continue;
   const name=Object.keys(layers).find(f=>layers[f][0]===k&&layers[f][1]===pos[k]);
   if(!name||(n===2&&pos[k]===0))continue;
   // A +1 turn is a right-handed rotation by q·90° about axis k: the sticker
   // centre starts moving along q·(e_k × r), flattened onto its own face.
   const q=-layers[name][2],r=pos.map((v,i)=>v+normal[i]/2),e=[0,0,0];e[k]=1;
   const v=[e[1]*r[2]-e[2]*r[1],e[2]*r[0]-e[0]*r[2],e[0]*r[1]-e[1]*r[0]].map(x=>q*x),along=v.reduce((a,x,i)=>a+x*normal[i],0),t=v.map((x,i)=>x-along*normal[i]);
   const [sx,sy]=project(t),len=Math.hypot(sx,sy);
   if(len<.15*Math.hypot(...t))continue;
   const score=(dx*sx+dy*sy)/len;
   if(!best||Math.abs(score)>Math.abs(best.score))best={face:name,direction:score>0?1:-1,score};
  }
  return best&&Math.abs(best.score)>Math.hypot(dx,dy)*.35?{face:best.face,direction:best.direction}:null;
 }
 function bind(root,opts={}){
  const scene=root.querySelector('#cube-scene'),cube=root.querySelector('.cube-view');if(!scene)return;
  drag=null;
  const update=()=>{cube.style.transform=`rotateX(${view.x}deg) rotateY(${view.y}deg)`;};
  scene.addEventListener('pointerdown',e=>{
   if(drag||e.isPrimary===false)return;
   const sticker=e.target.closest?.('[data-sticker-face]');
   drag={id:e.pointerId,x:e.clientX,y:e.clientY,view:{...view},sticker,done:false};
   scene.setPointerCapture?.(e.pointerId);if(!sticker)scene.classList.add('orbiting');e.preventDefault();
  });
  scene.addEventListener('pointermove',e=>{
   if(!drag||drag.id!==e.pointerId||drag.done)return;
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(drag.sticker){
    if(Math.hypot(dx,dy)<16)return;
    const pos=drag.sticker.closest('[data-cubie]').dataset.cubie.split(',').map(Number),n=root.querySelectorAll('[data-cubie]').length===26?3:2;
    const move=swipeMove(pos,faces[drag.sticker.dataset.stickerFace].normal,dx,dy,n);
    drag.done=true;if(move)opts.turn?.(move.face,move.direction);return;
   }
   view.x=Math.max(-80,Math.min(80,drag.view.x-dy*.45));view.y=drag.view.y+dx*.45;update();
  });
  const finish=e=>{if(drag?.id!==e.pointerId)return;drag=null;scene.classList.remove('orbiting');};
  scene.addEventListener('pointerup',finish);scene.addEventListener('pointercancel',finish);scene.addEventListener('lostpointercapture',finish);
  scene.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowUp')view.x=Math.max(-80,view.x-10);if(e.key==='ArrowDown')view.x=Math.min(80,view.x+10);if(e.key==='ArrowLeft')view.y-=15;if(e.key==='ArrowRight')view.y+=15;update();});
  root.querySelector('#cube-reset').onclick=()=>{view={x:-25,y:-35};update();};
  const dirButton=root.querySelector('[data-cube-dir]');
  dirButton.onclick=()=>{
   turnDir=-turnDir;
   dirButton.setAttribute('aria-pressed',turnDir===-1);dirButton.setAttribute('aria-label',`Turn direction: ${turnDir===1?'clockwise':'counterclockwise'}. Tap to switch.`);dirButton.querySelector('span').textContent=turnDir===1?'↻':'↺';
   root.querySelectorAll('.cube-rail [data-face]').forEach(b=>{b.dataset.turn=turnDir;b.setAttribute('aria-label',railLabel(b.dataset.face,turnDir));b.querySelector('b').textContent=b.dataset.face+(turnDir===1?'':'′');});
  };
  // Pointing at a rail key previews the stickers of that face.
  root.querySelectorAll('.cube-rail [data-face]').forEach(b=>{
   const show=on=>root.querySelectorAll(`[data-sticker-face="${b.dataset.face}"]`).forEach(el=>el.classList.toggle('face-selected',on));
   b.addEventListener('pointerenter',()=>show(true));b.addEventListener('pointerleave',()=>show(false));b.addEventListener('focus',()=>show(true));b.addEventListener('blur',()=>show(false));
  });
 }
 // The freshly rendered layer is already in its final state. Rotate it backwards
 // to its old pose, then animate to zero. Save and Undo remain synchronous.
 function animate(root,face,direction,run){
  const spec=turnSpec(face,direction);
  for(const el of root.querySelectorAll('[data-cubie]'))if(+el.dataset.cubie.split(',')[spec.axis]===spec.side)run(el,[{transform:`rotate${spec.cssAxis}(${-spec.angle}deg)`},{transform:`rotate${spec.cssAxis}(0deg)`}],300);
 }
 return{render,bind,animate,turnSpec,swipeMove,project,setView:v=>{view={...v};}};
})();
if(typeof module!=='undefined')module.exports=Cube3D;
