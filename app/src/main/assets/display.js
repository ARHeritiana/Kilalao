/* Screen controls for game screens: rotation (auto, wide, tall) and full screen.
   The Android app provides KilalaoDisplay; a browser falls back to the Fullscreen and Screen Orientation APIs.
   Choices are remembered on this device and apply only while a game is open. */
'use strict';
const ScreenControl=(()=>{
 const KEY='kilalao-display',native=window.KilalaoDisplay;
 let pref={orientation:'auto',fullscreen:false},inGame=false;
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(['auto','landscape','portrait'].includes(saved.orientation))pref.orientation=saved.orientation;pref.fullscreen=saved.fullscreen===true;}catch{}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(pref));}catch{}}
 function browserFullscreen(on,fromTap){
  const root=document.documentElement;
  if(on&&!document.fullscreenElement&&root.requestFullscreen){if(fromTap)return root.requestFullscreen({navigationUI:'hide'}).catch(()=>{});}
  else if(!on&&document.fullscreenElement)return document.exitFullscreen().catch(()=>{});
  return Promise.resolve();
 }
 function browserOrientation(o,fromTap){
  const so=window.screen?.orientation;if(!so)return;
  if(o==='auto'){so.unlock?.();return;}
  // Browsers only lock rotation in full screen, so a tap on Wide/Tall enters it first.
  const lock=()=>so.lock?.(o).catch(()=>{if(fromTap&&typeof toast==='function')toast('This browser cannot turn the screen. The Android app can, or rotate your device.');});
  if(fromTap&&!document.fullscreenElement&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().then(lock,lock);else lock();
 }
 function apply(game,fromTap=false){
  inGame=!!game;
  const fs=inGame&&pref.fullscreen,o=inGame?pref.orientation:'auto';
  document.body.classList.toggle('fullscreen',fs);
  if(native){try{native.setFullscreen(fs);native.setOrientation(o);}catch{}return;}
  browserFullscreen(fs,fromTap);
  if(fromTap||o==='auto')browserOrientation(o,fromTap);
 }
 // Leaving browser full screen with Escape or Back turns the preference off, so the button stays truthful.
 document.addEventListener('fullscreenchange',()=>{if(!native&&!document.fullscreenElement&&pref.fullscreen&&inGame){pref.fullscreen=false;save();document.body.classList.remove('fullscreen');if(typeof renderGame==='function'&&typeof current!=='undefined'&&current)renderGame();}});
 const ICON={auto:'<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',landscape:'<rect x="3" y="7" width="18" height="10" rx="2"/>',portrait:'<rect x="7" y="3" width="10" height="18" rx="2"/>',enter:'<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>',exit:'<path d="M9 4v5H4"/><path d="M15 4v5h5"/><path d="M9 20v-5H4"/><path d="M15 20v-5h5"/>'};
 const svg=name=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICON[name]}</svg>`;
 function bar(){
  const o=pref.orientation,fs=pref.fullscreen;
  return`<div class="screen-bar" role="group" aria-label="Screen"><div class="screen-options" role="group" aria-label="Rotation">${[['auto','Auto'],['landscape','Wide'],['portrait','Tall']].map(([v,label])=>`<button type="button" data-screen="${v}" aria-pressed="${o===v}" class="${o===v?'active':''}" aria-label="${{auto:'Rotate automatically',landscape:'Turn the screen sideways',portrait:'Keep the screen upright'}[v]}">${svg(v)}<span>${label}</span></button>`).join('')}</div><button type="button" data-screen="fullscreen" aria-pressed="${fs}" class="screen-full ${fs?'active':''}">${svg(fs?'exit':'enter')}<span>${fs?'Exit full screen':'Full screen'}</span></button></div>`;
 }
 function bind(onChange){
  document.querySelectorAll('[data-screen]').forEach(el=>el.onclick=()=>{
   const v=el.dataset.screen;
   if(v==='fullscreen')pref.fullscreen=!pref.fullscreen;else pref.orientation=v;
   save();apply(true,true);onChange?.();
  });
 }
 return{apply,bar,bind,get pref(){return{...pref};}};
})();
