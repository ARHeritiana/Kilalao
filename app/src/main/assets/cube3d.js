/* Local CSS 3D renderer. Coordinates and sticker colors come from the game engine. */
'use strict';
const Cube3D=(()=>{
 const faces={U:{normal:[0,1,0],axis:1,side:1,rotation:'rotateX(90deg)',name:'Up'},D:{normal:[0,-1,0],axis:1,side:-1,rotation:'rotateX(-90deg)',name:'Down'},F:{normal:[0,0,1],axis:2,side:1,rotation:'',name:'Front'},B:{normal:[0,0,-1],axis:2,side:-1,rotation:'rotateY(180deg)',name:'Back'},R:{normal:[1,0,0],axis:0,side:1,rotation:'rotateY(90deg)',name:'Right'},L:{normal:[-1,0,0],axis:0,side:-1,rotation:'rotateY(-90deg)',name:'Left'}};
 const colors={U:'#fff8e8',D:'#f6cf48',F:'#389c6f',B:'#3986ce',R:'#e56350',L:'#f2a347'};
 let view={x:-25,y:-35},chosen='F',drag=null;
 const same=(a,b)=>a.every((v,i)=>v===b[i]);
 function turnSpec(face,direction){const f=faces[face];return{axis:f.axis,side:f.side,cssAxis:'XYZ'[f.axis],angle:f.side*direction*90*(f.axis===1?-1:1)};}
 function render(s){
  const coords=s.n===2?[-1,1]:[-1,0,1],size=s.n===2?84:54,step=s.n===2?44:57;
  let cubies='';
  for(const x of coords)for(const y of coords)for(const z of coords){
   if(x===0&&y===0&&z===0)continue;
   const pos=[x,y,z];
   cubies+=`<div class="cubie-orbit" data-cubie="${pos.join(',')}"><div class="cubie" style="width:${size}px;height:${size}px;margin:${-size/2}px;transform:translate3d(${x*step}px,${-y*step}px,${z*step}px)">${Object.entries(faces).map(([face,f])=>{
    const sticker=s.stickers.find(st=>same(st.pos,pos)&&same(st.norm,f.normal));
    const label=sticker&&(s.n===3?pos.filter(v=>v===0).length===2:pos.every((v,i)=>i===f.axis||v===-1));
    return`<div class="cubie-side" style="transform:${f.rotation} translateZ(${size/2}px)">${sticker?`<div class="sticker ${face===chosen?'face-selected':''}" data-sticker-face="${face}" data-color="${sticker.color}" style="background:${colors[sticker.color]}">${label?`<span>${face}</span>`:''}</div>`:''}</div>`;
   }).join('')}</div></div>`;
  }
  return`<div class="cube-workspace"><div class="cube-scene" id="cube-scene" tabindex="0" role="group" aria-label="${s.n} by ${s.n} cube. Drag to orbit, or use arrow keys. Face letters stay attached to the reference axes." aria-describedby="cube-help"><div class="cube-shadow"></div><div class="cube-view" style="transform:rotateX(${view.x}deg) rotateY(${view.y}deg)">${cubies}</div></div><div class="cube-caption"><span id="cube-help">Drag to look around</span><button id="cube-reset" aria-label="Reset cube viewing angle">Reset view</button></div><div class="cube-face-picker" role="group" aria-label="Choose a face to turn">${['U','F','R','D','B','L'].map(f=>`<button data-cube-face="${f}" aria-pressed="${f===chosen}"><b>${f}</b> ${faces[f].name}</button>`).join('')}</div><div class="cube-turn-controls"><button data-face="${chosen}" data-turn="-1" aria-label="${chosen} counterclockwise">↶ <b>${chosen}′</b><small>Counterclockwise</small></button><button data-face="${chosen}" data-turn="1" aria-label="${chosen} clockwise"><b>${chosen}</b> ↷<small>Clockwise</small></button></div><p class="cube-notation">Turns are viewed looking straight at the chosen face.</p><details class="cube-accessible"><summary>All six faces · sticker colors</summary>${Object.entries(KilalaoEngine.cubeFaces(s)).map(([f,cs])=>`<p><b>${f} · ${faces[f].name}:</b> ${cs.map(c=>({U:'white',D:'yellow',F:'green',B:'blue',R:'red',L:'orange'})[c]).join(', ')}</p>`).join('')}</details></div>`;
 }
 function bind(root){
  const scene=root.querySelector('#cube-scene'),cube=root.querySelector('.cube-view');if(!scene)return;
  drag=null;
  const update=()=>{cube.style.transform=`rotateX(${view.x}deg) rotateY(${view.y}deg)`;};
  scene.addEventListener('pointerdown',e=>{if(drag||e.isPrimary===false)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,view:{...view}};scene.setPointerCapture?.(e.pointerId);scene.classList.add('orbiting');e.preventDefault();});
  scene.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;view.x=Math.max(-80,Math.min(80,drag.view.x-(e.clientY-drag.y)*.45));view.y=drag.view.y+(e.clientX-drag.x)*.45;update();});
  const finish=e=>{if(drag?.id!==e.pointerId)return;drag=null;scene.classList.remove('orbiting');};
  scene.addEventListener('pointerup',finish);scene.addEventListener('pointercancel',finish);scene.addEventListener('lostpointercapture',finish);
  scene.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowUp')view.x=Math.max(-80,view.x-10);if(e.key==='ArrowDown')view.x=Math.min(80,view.x+10);if(e.key==='ArrowLeft')view.y-=15;if(e.key==='ArrowRight')view.y+=15;update();});
  root.querySelector('#cube-reset').onclick=()=>{view={x:-25,y:-35};update();};
  root.querySelectorAll('[data-cube-face]').forEach(b=>b.onclick=()=>{
   chosen=b.dataset.cubeFace;
   root.querySelectorAll('[data-cube-face]').forEach(el=>el.setAttribute('aria-pressed',el===b));
   root.querySelectorAll('[data-sticker-face]').forEach(el=>el.classList.toggle('face-selected',el.dataset.stickerFace===chosen));
   root.querySelectorAll('[data-face]').forEach(el=>{const inverse=+el.dataset.turn===-1;el.dataset.face=chosen;el.setAttribute('aria-label',chosen+(inverse?' counterclockwise':' clockwise'));el.querySelector('b').textContent=chosen+(inverse?'′':'');});
  });
 }
 // The freshly rendered layer is already in its final state. Rotate it backwards
 // to its old pose, then animate to zero. Save and Undo remain synchronous.
 function animate(root,face,direction,run){
  const spec=turnSpec(face,direction);
  for(const el of root.querySelectorAll('[data-cubie]'))if(+el.dataset.cubie.split(',')[spec.axis]===spec.side)run(el,[{transform:`rotate${spec.cssAxis}(${-spec.angle}deg)`},{transform:`rotate${spec.cssAxis}(0deg)`}],300);
 }
 return{render,bind,animate,turnSpec};
})();
if(typeof module!=='undefined')module.exports=Cube3D;
