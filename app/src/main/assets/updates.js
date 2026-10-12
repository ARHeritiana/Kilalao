'use strict';
(() => {
 const native=window.KilalaoUpdates;
 const version=native?native.version():'1.2.1';
 const header=document.getElementById('app-updates');
 if(header)header.title='Kilalao '+version+' · Check for updates';
 document.addEventListener('click',event=>{
  if(!event.target.closest('[data-check-updates]'))return;
  if(native){saveGame();native.checkForUpdates();}
  else toast('Update installation is available in the Android app.');
 });
})();
