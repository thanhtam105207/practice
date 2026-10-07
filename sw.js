const CACHE='mimi-v20-20261008';
const APP=['./','./index.html','./ent-v8.js','./hsk1-data.js','./hsk1-app.js','./ja-app.js','./hsk1-listen.js','./mimi.js','./write.js','./hoc-ngoai-ngu.html','./supabase-config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
const CDN=/^https:\/\/(cdn\.jsdelivr\.net|cdn\.tailwindcss\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>Promise.all(APP.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||!r.url.startsWith('http'))return;
 if(CDN.test(r.url)){/* CDN: ưu tiên bản đã lưu, chưa có thì tải và lưu (kể cả script no-cors) */
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c)).catch(()=>{})}return res})));return}
 e.respondWith(fetch(r).then(res=>{if(res.ok&&new URL(r.url).origin===location.origin){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c)).catch(()=>{})}return res}).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):Response.error()))))});
