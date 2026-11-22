const CACHE='hanzi-v8.3-wowmao';
const FONT_CACHE='wowmao-wenkai-1.7.0';
const FONT_ROOT='https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./cat-round.mp3','./cat-chapter.mp3'];
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
 // Safari media requests can require byte ranges, including offline.
 if(/\/cat-(round|chapter)\.mp3$/.test(new URL(req.url).pathname)){
  e.respondWith((async()=>{const c=await caches.open(CACHE);let full=await c.match(req.url);if(!full){full=await fetch(req.url,{cache:'reload'});if(full.ok&&full.status===200)try{await c.put(req.url,full.clone())}catch(e){}}const range=req.headers.get('Range');if(!range||full.status!==200)return full;const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m)return full;const bytes=await full.arrayBuffer(),n=bytes.byteLength;if(!m[1]&&!m[2])return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+n}});const start=m[1]?Number(m[1]):Math.max(0,n-Number(m[2]));const end=m[1]&&m[2]?Math.min(n-1,Number(m[2])):n-1;if(start>=n||start>end)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+n}});return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${n}`,'Content-Length':String(end-start+1)}})})());return;
 }
 e.respondWith((async()=>{
  const c=await caches.open(CACHE);const nav=req.mode==='navigate';
  try{const response=await fetch(req,{cache:'no-store'});if(response.ok){try{await c.put(nav?new URL('./index.html',self.registration.scope):req,response.clone())}catch(err){}}return response}
  catch(err){return (await c.match(req))||(nav?await c.match(new URL('./index.html',self.registration.scope)):null)||Response.error()}
 })());
});
