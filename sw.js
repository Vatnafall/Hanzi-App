const CACHE='hanzi-v7.4-wowmao';
const FONT_CACHE='wowmao-wenkai-1.7.0';
const FONT_ROOT='https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 await c.addAll(FILES.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})));
 await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('hanzi-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 if(req.url.startsWith(FONT_ROOT)){
  e.respondWith((async()=>{const c=await caches.open(FONT_CACHE);const hit=await c.match(req);if(hit)return hit;const response=await fetch(req);if(response.ok||response.type==='opaque'){try{await c.put(req,response.clone())}catch(err){}}return response})());return;
 }
 if(new URL(req.url).origin!==self.location.origin)return;
 e.respondWith((async()=>{
  const c=await caches.open(CACHE);const nav=req.mode==='navigate';
  try{const response=await fetch(req,{cache:'no-store'});if(response.ok){try{await c.put(nav?new URL('./index.html',self.registration.scope):req,response.clone())}catch(err){}}return response}
  catch(err){return (await c.match(req))||(nav?await c.match(new URL('./index.html',self.registration.scope)):null)||Response.error()}
 })());
});
