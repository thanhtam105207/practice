/* Mimi UX: thanh công cụ riêng cho từng môn, thanh định vị, bài tập nghe. Chạy sau mimi.js. */
(()=>{
const $=id=>document.getElementById(id),LS=localStorage;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const xp=(k,r)=>{try{window.ent303AwardXP&&window.ent303AwardXP(k,r)}catch(e){}};
const TABS={
 zh:[['home','🏠','Trang chủ'],['words','📚','Từ vựng'],['cards','🃏','Thẻ'],['alpha','🔤','Phát âm'],['write','✍️','Viết'],['listen','🎧','Nghe'],['quiz','🎯','Quiz'],['acct','👤','Tôi']],
 ja:[['home','🏠','Trang chủ'],['kana','あ','Chữ cái'],['words','📚','Từ vựng'],['cards','🃏','Thẻ'],['write','✍️','Viết'],['listen','🎧','Nghe'],['quiz','🎯','Quiz'],['acct','👤','Tôi']]};
const INFO={
 home:['Trang chủ','Tổng quan và lộ trình học'],words:['Từ vựng','Danh sách từ, đánh dấu từ đã thuộc'],cards:['Thẻ ghi nhớ','Lật thẻ để ôn từng từ'],
 alpha:['Phát âm','Thanh điệu, phụ âm, vần, chữ Hán'],kana:['Chữ cái','Bảng Hiragana và Katakana'],write:['Luyện viết','Xem mẫu rồi tự viết theo nét'],
 listen:['Nghe','Bài tập nghe và nghe giáo trình'],quiz:['Quiz','10 câu ngẫu nhiên, có chấm điểm']};
const NAME={zh:'🇨🇳 Tiếng Trung HSK1',ja:'🇯🇵 Tiếng Nhật N5'};
let tab='home';
const subj=()=>{const s=document.body.dataset.subject;return s==='zh'||s==='ja'?s:null};

document.head.insertAdjacentHTML('beforeend',`<style id="mx-css">
.bottom-nav-inner>button.nav-zj{display:none!important}
body[data-subject=zh] .bottom-nav,body[data-subject=ja] .bottom-nav{display:none!important}
body[data-subject=zh] #unit-hero,body[data-subject=ja] #unit-hero{display:none!important}
body:not([data-subject=zh]):not([data-subject=ja]) #mx-bar,body:not([data-subject=zh]):not([data-subject=ja]) #mx-hero{display:none!important}
body[data-subject=zh] header p[data-guide],body[data-subject=ja] header p[data-guide]{display:block!important}
#mx-bar{position:fixed;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:1000;width:min(680px,calc(100% - 14px));padding:5px;border-radius:22px;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border:1px solid var(--acc-b,#ffe4e6);box-shadow:0 10px 30px rgba(0,0,0,.14)}
body[data-mode=dark] #mx-bar{background:rgba(30,32,64,.95);border-color:#33365f}
#mx-bar>div{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:3px}
#mx-bar button{min-height:54px;border-radius:16px;border:0;background:transparent;color:#6b7280;font-size:10px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;line-height:1.1;padding:2px 0}
body[data-mode=dark] #mx-bar button{color:#c7c9e6}
#mx-bar button i{font-style:normal;font-size:18px;line-height:18px}
#mx-bar button.on{background:linear-gradient(135deg,var(--acc,#f43f5e),var(--acc2,#fb923c));color:#fff;box-shadow:0 6px 14px rgba(244,63,94,.28)}
#mx-hero{display:flex;align-items:center;gap:12px;padding:10px 14px;margin-bottom:12px;border-radius:20px;color:#fff;background:linear-gradient(135deg,var(--acc,#f43f5e),var(--acc2,#fb923c));box-shadow:0 8px 22px rgba(0,0,0,.14)}
#mx-hero button{flex:none;min-height:40px;padding:0 14px;border-radius:14px;background:rgba(255,255,255,.22);color:#fff;font-weight:800;font-size:13px}
#mx-hero b{display:block;font-size:17px;font-weight:900;line-height:1.2}#mx-hero small{display:block;opacity:.92;font-weight:700;font-size:12px}
#mx-hero.mx-home{display:none}
body[data-subject=zh] header .mx-sub,body[data-subject=ja] header .mx-sub{display:block}
@media(max-width:700px){body[data-subject=zh],body[data-subject=ja]{padding-bottom:96px}}
.mxl-sel{width:100%;padding:10px;border-radius:14px;border:1px solid var(--acc-b,#ffe4e6);font-weight:700;background:#fff;color:#334155;margin:6px 0}
.mxl-in{width:100%;padding:12px;border-radius:14px;border:2px solid var(--acc-b,#ffe4e6);font-size:1.2rem;text-align:center;margin:10px 0;background:#fff;color:#111}
</style>`);

/* ---- thanh công cụ ---- */
function buildBar(){let b=$('mx-bar');if(!b){b=document.createElement('nav');b.id='mx-bar';b.setAttribute('aria-label','Điều hướng môn học');document.body.appendChild(b)}
 const s=subj();if(!s){b.innerHTML='';return}
 b.innerHTML='<div>'+TABS[s].map(t=>`<button type="button" data-t="${t[0]}" onclick="MX.go('${t[0]}')"><i>${t[1]}</i><span>${t[2]}</span></button>`).join('')+'</div>';
 let h=$('mx-hero');if(!h){h=document.createElement('div');h.id='mx-hero';const m=$('unit-hero');m&&m.parentNode.insertBefore(h,m)}
 let p=document.querySelector('header p[data-guide]');if(p){p.classList.add('mx-sub');p.textContent=(window.Mimi&&Mimi.subjects[s].sub)||''}
 sync()}
function sync(){const s=subj();if(!s)return;
 document.querySelectorAll('#mx-bar button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
 const h=$('mx-hero');if(h){const i=INFO[tab]||INFO.home;h.classList.toggle('mx-home',tab==='home');
  h.innerHTML=`<button type="button" onclick="MX.go('home')">← Trang chủ</button><div style="min-width:0"><small>${NAME[s]}</small><b>${i[0]}</b><small>${i[1]}</small></div>`}}
function setTab(t){tab=t;sync()}

/* ---- điều hướng ---- */
function go(t){const s=subj();if(!s)return;
 if(t==='acct'){const a=[...document.querySelectorAll('.bottom-nav-inner button')].find(b=>/Tài khoản/.test(b.textContent));if(a)a.click();return}
 setTab(t);
 if(t==='listen'){try{switchSection(s)}catch(e){}if(s==='zh'){Z_.go({v:'listen'})}else{listenHub($('ja-section'))}window.scrollTo(0,0);return}
 if(s==='ja'&&t==='kana'){try{switchSection('ja')}catch(e){}JA.show('kana');return}
 if(t==='write'){try{switchSection(s)}catch(e){}if(s==='zh'){Z_.go({v:'home'});Write.han()}else{JA.show('kana');Write.kana('hira')}return}
 if(s==='zh'&&t==='alpha'){try{switchSection('zh')}catch(e){}Z_.go({v:'intro',t:'t'});return}
 if(s==='zh'&&t==='quiz'){try{switchSection('zh')}catch(e){}Z_.go({v:'quiz',i:-1});return}
 Mimi.tab(t)}
/* theo dõi khi người dùng bấm nút bên trong trang */
function wrap(){
 if(window.Z_&&!Z_.__mx){const g=Z_.go;Z_.go=function(z){const m={home:'home',words:'words',lesson:'words',cards:'cards',intro:'alpha',quiz:'quiz',listen:'listen'};setTab(m[z.v]||'home');return g.apply(this,arguments)};Z_.__mx=1}
 if(window.JA&&!JA.__mx){const g=JA.show;JA.show=function(v){const m={home:'home',words:'words',cards:'cards',kana:'kana',quiz:'quiz'};setTab(m[v]||'home');return g.apply(this,arguments)};JA.__mx=1}}

/* ---- Bài tập nghe (tạo từ danh sách từ + giọng đọc của trình duyệt) ---- */
const SRC=s=>{ if(s==='zh'){const H=(window.HSK1||{}).lessons||[];return{lang:'zh',groups:H.map(l=>({id:'L'+l.n,name:`Bài ${l.n}: ${l.t} (${l.vi})`,items:l.w.map(w=>({t:w[0],r:w[1],m:w[2]}))})),say:t=>ZH.say({dataset:{t}})}}
 const d=window.JA&&JA.data?JA.data():{ALL:[]};return{lang:'ja',groups:d.ALL.map((g,i)=>({id:'T'+i,name:`${g.e} ${g.t}`,items:g.w.map(w=>({t:w[0],r:w[1],m:w[2]}))})),say:t=>JA.say(t)}};
const normR=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z\u3040-\u30ff\u4e00-\u9fff]/g,'');
let L=null;
function listenHub(a){if(!a)return;const s=subj(),src=SRC(s);
 const sw=s==='zh'?`<div class="zrow"><button class="zb pri">📝 Bài tập nghe</button><button class="zb" onclick="ZL.mode='au';ZL.draw($('zh-section'),ZL.o||0)">📖 Nghe giáo trình</button></div>`:'';
 a.classList.remove('hidden');
 if(!L||L.s!==s||L.stage==='pick'){a.innerHTML=sw+`<div class="zc" style="background:linear-gradient(135deg,var(--acc,#f43f5e),var(--acc2,#fb923c));color:#fff"><h2 class="text-xl font-black">🎧 Bài tập nghe</h2><p style="opacity:.9">Nghe một từ rồi chọn nghĩa, chữ hoặc cách đọc, hoặc gõ lại cái bạn nghe. Mỗi lượt 10 câu.</p></div>
 <div class="zc"><b>Chọn phạm vi</b><select id="mxl-scope" class="mxl-sel"><option value="*">Tất cả</option>${src.groups.map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select>
 <button class="zb pri" style="width:100%;margin-top:10px" onclick="MX.start()">▶ Bắt đầu nghe</button>
 <p class="zm" style="margin-top:8px">Cần giọng đọc ${s==='zh'?'tiếng Trung':'tiếng Nhật'} trên thiết bị. Nếu không nghe thấy gì, hãy cài giọng đọc trong cài đặt hệ thống.</p></div>`;L={s,stage:'pick'};return}
 const q=L.q[L.n];
 if(L.n>=L.q.length){const p=L.sc/L.q.length;if(!L.done){L.done=1;if(p>=1)xp('quiz_complete_100');else if(p>=.8)xp('quiz_complete_80')}
  a.innerHTML=sw+`<div class="zc" style="text-align:center"><div style="font-size:3rem">${p>=.8?'🏆':p>=.5?'👍':'💪'}</div><h3 class="text-xl font-black">${L.sc}/${L.q.length} câu đúng</h3>${L.bad.length?'<p class="zm" style="margin-top:8px">Cần nghe lại:</p>'+L.bad.map(w=>`<div class="zr"><span class="h">${esc(w.t)}</span><div class="zg1"><div>${esc(w.r)}</div><div class="zm">${esc(w.m)}</div></div><button class="zb" onclick="MX.say('${esc(w.t)}')">🔊</button></div>`).join(''):''}
  <div class="zrow" style="margin-top:12px"><button class="zb pri" onclick="MX.start(1)">Làm lại</button><button class="zb" onclick="MX.pick()">Đổi phạm vi</button></div></div>`;return}
 const w=q.w,head=`<div class="zc"><div class="zm">Câu ${L.n+1}/${L.q.length}</div><div class="zpg"><i style="width:${L.n/L.q.length*100}%"></i></div><div style="text-align:center;margin:14px 0"><button class="zb pri" style="font-size:1.1rem;padding:14px 22px" onclick="MX.say('${esc(w.t)}')">🔊 Nghe lại</button><p class="zm" style="margin-top:8px">${{m:'Từ này nghĩa là gì?',t:'Chọn chữ viết đúng',r:'Chọn cách đọc đúng',d:'Gõ cách đọc (không cần dấu) hoặc chữ bạn nghe'}[q.ty]}</p></div>`;
 if(q.ty==='d'){a.innerHTML=sw+head+`<input id="mxl-in" class="mxl-in" autocomplete="off" autocapitalize="off" placeholder="Gõ ở đây…"><button class="zb pri" style="width:100%" onclick="MX.check()">Kiểm tra</button><div id="mxl-fb"></div></div>`;const i=$('mxl-in');i.onkeydown=e=>{if(e.key==='Enter')MX.check()};i.focus()}
 else{const f={m:'m',t:'t',r:'r'}[q.ty];a.innerHTML=sw+head+q.o.map(o=>`<button class="zo" data-k="${o===w?1:0}" style="${f==='t'?'font-size:1.6rem':''}">${esc(o[f])}</button>`).join('')+`<div id="mxl-fb"></div></div>`;
  a.querySelectorAll('.zo').forEach(b=>b.onclick=()=>{const ok=b.dataset.k==='1';a.querySelectorAll('.zo').forEach(x=>{x.disabled=true;if(x.dataset.k==='1')x.classList.add('good')});if(!ok)b.classList.add('bad');MX.fin(ok)})}
 setTimeout(()=>src.say(w.t),250)}
const MX={go,sync,
 say:t=>SRC(subj()).say(t),
 pick(){L=null;listenHub($(subj()+'-section'))},
 start(again){const s=subj(),src=SRC(s);let sc=again&&L?L.scope:($('mxl-scope')||{}).value||'*';
  let pool=src.groups.filter(g=>sc==='*'||g.id===sc).flatMap(g=>g.items);if(pool.length<4)pool=src.groups.flatMap(g=>g.items);
  const all=src.groups.flatMap(g=>g.items),q=shuf(pool).slice(0,10).map((w,n)=>{const ok=['t','r','d'].concat(w.m&&w.m!==w.r?['m']:[]);const ty=ok[(n+Math.floor(Math.random()*4))%ok.length];
   const o=[w],seen=new Set([w[ty==='m'?'m':ty==='t'?'t':'r']]);for(const x of shuf(all)){if(o.length>=4)break;const v=x[ty==='m'?'m':ty==='t'?'t':'r'];if(!seen.has(v)){seen.add(v);o.push(x)}}return{w,ty,o:shuf(o)}});
  L={s,stage:'run',scope:sc,q,n:0,sc:0,bad:[]};listenHub($(s+'-section'))},
 check(){const q=L.q[L.n],v=($('mxl-in')||{}).value||'';const ok=!!v.trim()&&(normR(v)===normR(q.w.r)||v.trim()===q.w.t);const i=$('mxl-in');if(i)i.disabled=true;MX.fin(ok)},
 fin(ok){const q=L.q[L.n],w=q.w;if(ok){L.sc++;xp('vocab_correct');try{correctFx()}catch(e){}}else{L.bad.push(w);try{wrongFx()}catch(e){}}
  $('mxl-fb').innerHTML=`<div class="zm" style="margin-top:8px">${ok?'✅ Chính xác!':'❌ Chưa đúng.'} <b>${esc(w.t)}</b> · ${esc(w.r)} · ${esc(w.m)}</div><button class="zb pri" style="width:100%;margin-top:8px" onclick="MX.next()">Tiếp →</button>`},
 next(){L.n++;listenHub($(subj()+'-section'))}};
window.MX=MX;

/* zh: trang Nghe có 2 chế độ (bài tập / giáo trình) */
function hookZL(){if(!window.ZL||ZL.__mx)return;const orig=ZL.draw;ZL.mode=ZL.mode||'ex';
 ZL.draw=function(a,open){if(ZL.mode==='au'){orig.call(ZL,a,open);a.insertAdjacentHTML('afterbegin',`<div class="zrow"><button class="zb" onclick="ZL.mode='ex';MX.pick()">📝 Bài tập nghe</button><button class="zb pri">📖 Nghe giáo trình</button></div>`)}else{ZL.mode='ex';listenHub(a)}};ZL.__mx=1}

function init(){hookZL();wrap();buildBar();new MutationObserver(()=>{buildBar();wrap()}).observe(document.body,{attributes:true,attributeFilter:['data-subject']})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
})();
