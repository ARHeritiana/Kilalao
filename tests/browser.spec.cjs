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
 await page.locator('[data-cube-face="R"]').click();await page.locator('[data-turn="1"]').click();
 expect(await page.locator('.cubie-orbit').evaluateAll(els=>els.filter(el=>el.getAnimations().length>0).length)).toBe(9);
 await page.waitForTimeout(350);
 const scene=page.locator('#cube-scene'),r=await scene.boundingBox();
 await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2+60,r.y+r.height/2+20);await page.mouse.up();
 await expect(page.locator('.cube-view')).not.toHaveCSS('transform','matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');
 await page.locator('#cube-reset').click();
 const turns=await page.locator('.cube-turn-controls').boundingBox(),dock=await page.locator('.action-dock').boundingBox();
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
  for(const [id,selector] of [['rubik','.cube-turn-controls'],['sudoku','.number-pad'],['sliding','.controls']]){
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
