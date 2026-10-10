// Retire the old GitHub iframe wrapper cache. No employee data are cached.
const OLD='wallmann-v3-';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith(OLD)).map(k=>caches.delete(k)));
  await self.registration.unregister();
  await self.clients.claim();
})()));
