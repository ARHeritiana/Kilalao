const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const catalog=require('../app/src/main/assets/catalog.js');
for(const width of [320,360,390,480,800])test(`All games fit ${width}px; navigation and dock have large targets`,async({page})=>{
 test.setTimeout(180000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:844});await page.goto('/');
 await expect(page.locator('.card')).toHaveCount(24);
 for(const filter of await page.locator('.filter').all()){await expect(filter).toBeInViewport();expect((await filter.boundingBox()).height).toBeGreaterThanOrEqual(48);}
 for(const g of catalog){
  await page.evaluate(id=>{location.hash='game/'+id;},g.id);
  await expect(page.locator('.game-heading h1')).toHaveText(g.name);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),g.id+' horizontal overflow').toBe(true);
  const modes=await page.locator('#mode option').allTextContents();
  for(const mode of modes){
   await page.locator('#mode').selectOption(mode);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),g.id+' / '+mode+' overflow').toBe(true);
   if(width<=480){const r=await page.locator('#mode').boundingBox();expect(r.width,g.id+' mode selector').toBeGreaterThan(200);}
  }
  for(const chip of await page.locator('[data-size]').all()){
   const size=await chip.getAttribute('data-size');await page.locator(`[data-size="${size}"]`).click();
   await expect(page.locator(`[data-size="${size}"]`)).toHaveAttribute('aria-pressed','true');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),g.id+' size '+size+' overflow').toBe(true);
   const r=await page.locator('#boardarea').boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(width+1);
  }
  for(const b of await page.locator('.screen-bar button').all()){await expect(b).toBeVisible();expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);}
  const dock=page.locator('.action-dock');await expect(dock).toBeVisible();
  for(const button of await dock.locator('a,button').all()){await expect(button).toBeInViewport({ratio:1});const r=await button.boundingBox();expect(r.height).toBeGreaterThanOrEqual(48);expect(r.width).toBeGreaterThanOrEqual(44);expect(await button.locator('span').evaluate(el=>el.scrollWidth<=el.clientWidth+1),g.id+' dock label fits').toBe(true);}
  expect(await page.locator('.back').evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(44);
  await page.locator('.action-dock [data-tab="rules"]').click();
  for(const tab of ['rules','strategy','research']){await page.locator('.learning-tabs [data-tab="'+tab+'"]').click();await expect(page.locator('.learning')).toBeVisible();}
  for(const button of await page.locator('.action-dock a,.action-dock button').all()){await expect(button).toBeInViewport({ratio:1});expect(await button.locator('span').evaluate(el=>el.scrollWidth<=el.clientWidth+1),g.id+' learning label fits').toBe(true);}
  await page.locator('#try-game').click();await expect(page.locator('#boardarea')).toBeVisible();
 }
 expect(errors).toEqual([]);
});
test('Cube renders in 3D, animates turns, orbits, and keeps controls reachable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/#game/rubik');
 await expect(page.locator('[data-cubie]')).toHaveCount(26);
 expect(await page.locator('.cube-view').evaluate(el=>getComputedStyle(el).transformStyle)).toBe('preserve-3d');
 await page.locator('.cube-rail [data-face="R"]').click();
 expect(await page.locator('.cubie-orbit').evaluateAll(els=>els.filter(el=>el.getAnimations().length>0).length)).toBe(9);
 await page.waitForTimeout(350);
 const scene=page.locator('#cube-scene'),r=await scene.boundingBox();
 await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2+60,r.y+r.height/2+20);await page.mouse.up();
 await expect(page.locator('.cube-view')).not.toHaveCSS('transform','matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');
 await page.locator('#cube-reset').click();
 const turns=await page.locator('.cube-rail').boundingBox(),dock=await page.locator('.action-dock').boundingBox();
 expect(turns.y+turns.height).toBeLessThanOrEqual(dock.y);
});
test('Move animation and reduced motion work in a real browser',async({page})=>{
 await page.setViewportSize({width:360,height:800});await page.goto('/#game/hanoi');
 await page.locator('[data-peg="0"]').click();await page.locator('[data-peg="1"]').click();
 expect(await page.locator('[data-motion="disk-1"]').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#undo').click();
 expect(await page.locator('[data-motion="disk-1"]').evaluate(el=>el.getAnimations().length)).toBe(0);
});
test('Learning URL survives reload and browser Back, and Android Back returns to Play',async({page})=>{
 await page.goto('/#game/hanoi');await page.locator('[data-peg="0"]').click();await page.locator('[data-peg="1"]').click();
 await page.locator('.action-dock [data-tab="rules"]').click();await page.locator('[data-tab="research"]').click();
 await expect(page).toHaveURL(/#game\/hanoi\/research$/);await page.reload();
 await expect(page.locator('.learning-tabs [data-tab="research"]')).toHaveAttribute('aria-pressed','true');
 await page.goBack();await expect(page.locator('.learning-tabs [data-tab="rules"]')).toHaveAttribute('aria-pressed','true');
 await page.evaluate(()=>navigateBack());await expect(page.locator('#boardarea')).toBeVisible();
 await expect(page.locator('.game-status')).toContainText('1 move');await page.locator('#undo').click();await expect(page.locator('.game-status')).toContainText('0 moves');
});
test('Short phones and landscape keep cube and puzzle controls scrollable above the dock',async({page})=>{
 for(const viewport of [{width:320,height:568},{width:844,height:390}]){
  await page.setViewportSize(viewport);
  for(const [id,selector] of [['rubik','.cube-rail'],['sudoku','.number-pad'],['sliding','.controls']]){
   await page.goto('/#game/'+id);if(id==='sliding')await page.locator('#mode').selectOption('Klotski');
   const control=page.locator(selector);await control.scrollIntoViewIfNeeded();
   const r=await control.boundingBox(),dock=await page.locator('.action-dock').boundingBox();
   expect(r.y,id+' top at '+viewport.width+'×'+viewport.height).toBeGreaterThanOrEqual(0);expect(r.y+r.height,id+' bottom at '+viewport.width+'×'+viewport.height).toBeLessThanOrEqual(dock.y);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
 }
});
test('Save phone screenshots for visual review',async({page})=>{
 fs.mkdirSync('screenshots',{recursive:true});await page.setViewportSize({width:390,height:844});
 for(const [name,hash] of [['home','home'],['hanoi','game/hanoi'],['sudoku','game/sudoku'],['cube','game/rubik'],['learning','learn/rubik']]){
  await page.goto('/#'+hash);await page.waitForTimeout(100);await page.screenshot({path:'screenshots/'+name+'.png',fullPage:false});
 }
});

test('Updates is reachable from Progress on a small phone and preserves the current game',async({page})=>{
 await page.setViewportSize({width:320,height:568});await page.goto('/#game/hanoi');
 await page.locator('[data-peg="0"]').click();await page.locator('[data-peg="1"]').click();
 await page.locator('.action-dock .back').click();await page.locator('#nav-progress').click();
 const update=page.locator('#app-updates');await update.scrollIntoViewIfNeeded();await expect(update).toBeInViewport({ratio:1});
 const box=await update.boundingBox(),nav=await page.locator('.main-nav').boundingBox();expect(box.height).toBeGreaterThanOrEqual(48);expect(box.y+box.height).toBeLessThanOrEqual(nav.y);
 await update.click();await expect(page.locator('#toast')).toContainText('Android app');
 await page.goto('/#game/hanoi');await expect(page.locator('.game-status')).toContainText('1 move');
});
test('Commands stay in the thumb zone: nothing interactive in the top strip, dock fits landscape, drag boards clear the gesture edges',async({page})=>{
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
  await page.setViewportSize(viewport);
  for(const id of ['hanoi','nim','tangram','sprouts','rubik','mastermind','twentyfour']){
   await page.goto('/#game/'+id);
   const top=await page.evaluate(()=>[...document.querySelectorAll('a,button,select,input')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.top<8;}).length);
   expect(top,id+' controls in the top strip').toBe(0);
   const dock=await page.locator('.action-dock').boundingBox();expect(dock.y+dock.height).toBeLessThanOrEqual(viewport.height+1);
   for(const b of await page.locator('.action-dock a,.action-dock button').all())await expect(b).toBeInViewport({ratio:1});
  }
 }
 await page.setViewportSize({width:360,height:740});
 for(const [id,selector] of [['tangram','#tangram-board'],['sprouts','#sprouts-board'],['rubik','#cube-scene']]){
  await page.goto('/#game/'+id);const r=await page.locator(selector).boundingBox();
  expect(r.x,id+' left gesture margin').toBeGreaterThanOrEqual(24);expect(360-(r.x+r.width),id+' right gesture margin').toBeGreaterThanOrEqual(24);
 }
});
test('Hex is a rhombus with a horizontal long diagonal, and each side border belongs to one player',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/#game/hex');
 const center=async i=>{const b=await page.locator(`[data-cell="${i}"]`).boundingBox();return{x:b.x+b.width/2,y:b.y+b.height/2};};
 const [left,top,bottom,right]=[await center(0),await center(4),await center(20),await center(24)];
 expect(Math.abs(left.y-right.y)).toBeLessThan(1);expect(Math.abs(top.x-bottom.x)).toBeLessThan(1);
 expect(right.x-left.x).toBeGreaterThan((bottom.y-top.y)*1.5);
 expect(await page.locator('.hex-board polyline').count()).toBe(4);
 await page.locator('[data-cell="12"]').click();await expect(page.locator('[data-motion="stone-12"]')).toHaveCount(1);
 await expect(page.locator('.game-status')).toContainText('Player 2');
});

test('Large boards keep tappable cells sideways, and the browser screen bar enters and leaves full screen',async({page})=>{
 await page.setViewportSize({width:844,height:390});await page.goto('/#game/hex');await page.locator('[data-size="11"]').click();
 const board=page.locator('.hex-board svg');await board.scrollIntoViewIfNeeded();const box=await board.boundingBox(),dock=await page.locator('.action-dock').boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(dock.y+1);const cell=await page.locator('[data-cell="60"]').boundingBox();expect(cell.width).toBeGreaterThanOrEqual(30);
 await page.goto('/#game/queens');await page.locator('[data-size="10"]').click();expect((await page.locator('[data-cell="0"]').boundingBox()).width).toBeGreaterThanOrEqual(28);
 await page.locator('[data-screen="fullscreen"]').click();
 await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(true);await expect(page.locator('body')).toHaveClass(/fullscreen/);
 await page.locator('[data-screen="fullscreen"]').click();await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(false);
});

test('River boat and passengers cross together; peg captures fade; unsafe moves shake',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/#game/river');
 await page.locator('.boat-hull').click();
 expect(await page.locator('#boardarea').evaluate(el=>el.getAnimations().length)).toBe(1);
 await expect(page.locator('.game-status')).toContainText('0 moves');
 const boat=await page.locator('[data-motion="boat"]').boundingBox();
 await page.locator('[data-board="goat"]').click();await page.waitForTimeout(400);await page.locator('.boat-hull').click();
 await page.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=a.effect.getComputedTiming().duration/2;}));
 const goat=await page.locator('[data-motion="goat"]').boundingBox(),moving=await page.locator('[data-motion="boat"]').boundingBox();
 expect(moving.x).toBeGreaterThan(boat.x+10);const centre=goat.x+goat.width/2;expect(centre).toBeGreaterThan(moving.x);expect(centre).toBeLessThan(moving.x+moving.width);
 await page.goto('/#game/peg');
 const [from,to]=await page.evaluate(()=>{for(let f=0;f<current.cells.length;f++)for(let t=0;t<current.cells.length;t++)if(E.move(current,{from:f,to:t}).ok)return[f,t];});
 await page.locator(`[data-hole="${from}"]`).click();await page.locator(`[data-hole="${to}"]`).click();
 await expect(page.locator('.motion-ghost')).toHaveCount(1);
});

test('Cube camera maths matches the browser, and a real finger swipe turns a row',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/#game/rubik');
 const err=await page.evaluate(()=>{let worst=0;for(const v of [{x:-25,y:-35},{x:40,y:120},{x:-70,y:250}]){Cube3D.setView(v);const m=new DOMMatrix(`rotateX(${v.x}deg) rotateY(${v.y}deg)`);for(const d of [[1,0,0],[0,1,0],[0,0,1],[1,-1,.5]]){const p=m.transformPoint(new DOMPoint(d[0],-d[1],d[2])),q=Cube3D.project(d);worst=Math.max(worst,Math.abs(p.x-q[0]),Math.abs(p.y-q[1]));}}Cube3D.setView({x:-25,y:-35});return worst;});
 expect(err).toBeLessThan(1e-9);
 await page.evaluate(()=>renderGame());
 const sticker=page.locator('[data-cubie="1,1,1"] [data-sticker-face="F"]'),box=await sticker.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y-40,{steps:5});await page.mouse.up();
 await expect(page.locator('.game-status')).toContainText('1 move');
 expect(await page.evaluate(()=>JSON.stringify(current.trail[current.trail.length-1]))).toBe('["R",1]');
 const view=await page.locator('.cube-view').getAttribute('style');
 const scene=await page.locator('#cube-scene').boundingBox();
 await page.mouse.move(scene.x+12,scene.y+12);await page.mouse.down();await page.mouse.move(scene.x+70,scene.y+30,{steps:4});await page.mouse.up();
 expect(await page.locator('.cube-view').getAttribute('style')).not.toBe(view);
 await expect(page.locator('.game-status')).toContainText('1 move');
});

test('Every game demo makes only legal moves through the real controls and restores the player\'s game',async({page})=>{
 test.setTimeout(240000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});
 for(const g of catalog){
  await page.goto('/#game/'+g.id);await expect(page.locator('#boardarea')).toBeVisible();
  const before=await page.evaluate(()=>JSON.stringify(current));
  const r=await page.evaluate(async id=>{let rejected=[];const reject=GameMotion.reject,say=toast;GameMotion.reject=root=>{rejected.push(document.querySelector('#toast').textContent);reject(root);};let end;const ok=await Demo.start(id,{fast:true,inspect:(state,undo)=>{end={moves:state.moves,undo};}});GameMotion.reject=reject;return{ok,end,rejected};},g.id);
  expect(r.ok,g.id+' demo completed').toBe(true);
  expect(r.rejected,g.id+' demo made no illegal move').toEqual([]);
  expect(r.end.undo,g.id+' demo moved pieces').toBeGreaterThan(0);
  expect(await page.evaluate(()=>JSON.stringify(current)),g.id+' game restored').toBe(before);
  await expect(page.locator('.demo-bar')).toHaveCount(0);
 }
 expect(errors).toEqual([]);
});
