/* Emergency reliability mode: disable PWA interception on iOS. */
self.addEventListener('install',event=>{
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    try{
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.startsWith('it-picnik-2026-')).map(k=>caches.delete(k)));
    }catch(e){}
    try{await self.clients.claim();}catch(e){}
    try{await self.registration.unregister();}catch(e){}
  })());
});

/* Intentionally no fetch handler: every request goes directly to the network. */
