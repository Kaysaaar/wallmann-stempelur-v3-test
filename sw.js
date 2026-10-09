/* V3 TEST: Cache only the public wrapper. Never cache Apps Script data or tokens. */
const PREFIX='wallmann-v3-'+encodeURIComponent(self.registration.scope)+'-';
const CACHE=PREFIX+'3.0.0-test.1';
const ASSETS=['./index.html','./styles.css','./app.js','./config.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener('fetch',e=>{
 const req=e.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 const allowed=ASSETS.some(p=>new URL(p,self.registration.scope).pathname===url.pathname);
 if(req.mode==='navigate'){e.respondWith(fetch(req).catch(()=>caches.open(CACHE).then(c=>c.match('./index.html'))));return;}
 if(!allowed)return;
 e.respondWith(fetch(req).then(r=>{if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)));}return r;}).catch(()=>caches.open(CACHE).then(c=>c.match(req))));
});
