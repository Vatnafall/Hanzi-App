const CACHE='hanzi-v6.7.2-wowmao';
const FONT_CACHE='wowmao-wenkai-1.7.0';
const FONT_ROOT='https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('hanzi-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET')return;
 if(req.url.startsWith(FONT_ROOT)){
  e.respondWith((async()=>{
   const c=await caches.open(FONT_CACHE);
   const hit=await c.match(req);if(hit)return hit;
   const response=await fetch(req);
   if(response.ok||response.type==='opaque'){try{await c.put(req,response.clone())}catch(err){}}
   return response;
  })());return;
 }
 if(new URL(req.url).origin!==self.location.origin)return;
 e.respondWith(fetch(req).then(r=>{if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)))}return r}).catch(async()=>await caches.match(req)||(req.mode==='navigate'?await caches.match('./index.html'):Response.error())));
});
