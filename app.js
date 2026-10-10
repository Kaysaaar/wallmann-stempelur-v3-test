/* Wallmann V3 TEST — universal direct launch. NO cross-site iframe. */
'use strict';
(()=>{
  const status=document.getElementById('status'),launch=document.getElementById('launch');
  let url;
  try{
    url=new URL(window.WALLMANN_CONFIG.appsScriptUrl);
    if(url.origin!=='https://script.google.com'||
      !/^\/(?:macros\/s|a\/macros\/[^/]+\/s)\/[^/]+\/exec$/.test(url.pathname))throw Error('Ugyldig testadresse');
    if(url.username||url.password||url.search||url.hash)throw Error('Webappadresse skal slutte med /exec');
  }catch(err){status.textContent='Testadressen i config.js er ugyldig. Kontrollér den i GitHub.';return;}
  // Do not pass a GitHub bridge/session token. Direct mode manages session in its own origin.
  launch.href=url.href;launch.hidden=false;
  status.textContent='Åbner stempeluret direkte i Google…';
  try{window.location.replace(url.href);}catch(err){status.textContent='Tryk Åbn stempeluret.';}
})();
