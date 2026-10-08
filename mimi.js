/* 🌸 Mimi – Language Practice
   Khung 3 môn NGANG HÀNG: English • 中文 (HSK) • 日本語 (N5).
   - Màn chọn môn (hub) + "Mimi Progress"
   - Chip môn học ở header, thanh điều hướng theo môn
   - Trang chủ môn Tiếng Nhật (nội dung đầy đủ làm ở bước sau)
   Không chứa nội dung sách. Tiến độ chỉ ĐỌC từ dữ liệu sẵn có (chưa đồng bộ Supabase – Bước 5). */
(()=>{
if(window.Mimi)return;
const LS=localStorage,$=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* Tạm thời: số từ hiện có trong hoc-ngoai-ngu.html (Hiragana + N5 cơ bản). Cập nhật ở Bước 11. */
const JA_TOTAL=53;
const SUBJ={
  en:{flag:'🇬🇧',name:'English',label:'Tiếng Anh',chip:'English',sub:'Top Notch 3 • Từ vựng • Ngữ pháp • Quiz',c1:'#f43f5e',c2:'#fb923c'},
  zh:{flag:'🇨🇳',name:'中文',label:'Tiếng Trung • HSK1',chip:'中文 HSK1',navLabel:'Tiếng Trung',sub:'Thanh điệu • Pinyin • Chữ Hán • 15 bài',c1:'#dc2626',c2:'#f59e0b'},
  ja:{flag:'🇯🇵',name:'日本語',label:'Tiếng Nhật • N5',chip:'日本語 N5',navLabel:'Tiếng Nhật',sub:'Hiragana • Katakana • Minna no Nihongo',c1:'#ec4899',c2:'#6366f1'}
};
let cur='en';
const saved=LS.getItem('MIMI_SUBJ')||'en'; /* môn lần trước – đọc trước khi app tự chuyển trang */

/* ---------- tiến độ (chỉ đọc) ---------- */
function statEn(){try{let n=0,t=0;for(let i=1;i<=10;i++){const u=unitsData[i];(u&&u.vocab||[]).forEach(v=>{t++;if(learnedCardsSet.has(v.word))n++})}return[n,t]}catch(e){return[0,0]}}
function statZh(){try{const H=(window.HSK1||{}).lessons||[],all=H.flatMap(l=>l.w.map(w=>w[0]));let P={};try{P=JSON.parse(LS.getItem('PE_ZH')||'{}')}catch(e){}return[all.filter(c=>P[c]).length,all.length]}catch(e){return[0,0]}}
function statJa(){try{let P={};try{P=JSON.parse(LS.getItem('PE_LANG')||'{}')}catch(e){}const n=Object.keys(P).filter(k=>k.slice(0,3)==='ja:'&&P[k]).length;return[Math.min(n,JA_TOTAL),JA_TOTAL]}catch(e){return[0,JA_TOTAL]}}
const stats=()=>({en:statEn(),zh:statZh(),ja:statJa()});
const pct=(n,t)=>t?Math.min(100,Math.round(n/t*100)):0;

/* ---------- CSS ---------- */
document.head.insertAdjacentHTML('beforeend',`<style id="mimi-css">
.mm-wrap{max-width:860px;margin:0 auto;padding:max(28px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(28px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));color:#334155}
body[data-mode=dark] .mm-wrap{color:#e5e7eb}
.mm-top{display:flex;align-items:center;min-height:44px}
.mm-hero{text-align:center;margin:6px 0 22px}
.mm-logo{font-size:64px;line-height:1;animation:mmfloat 3s ease-in-out infinite}
@keyframes mmfloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-8px) rotate(3deg)}}
.mm-hero h1{font-size:34px;font-weight:900;margin:8px 0 0;letter-spacing:-.5px}
.mm-hero .mm-tag{font-weight:800;opacity:.65;font-size:14px;letter-spacing:.5px}
.mm-hero .mm-hi{margin-top:10px;font-weight:800;font-size:17px}
.mm-grid{display:grid;gap:14px;grid-template-columns:1fr}
@media(min-width:720px){.mm-grid{grid-template-columns:repeat(3,1fr)}}
.mm-card{display:flex;align-items:center;gap:16px;width:100%;min-height:92px;text-align:left;padding:16px 18px;border-radius:26px;border:1px solid var(--acc-b,#ffe4e6);background:var(--card,rgba(255,255,255,.96));color:inherit;box-shadow:0 10px 30px rgba(0,0,0,.07);position:relative;overflow:hidden;cursor:pointer;transition:transform .15s,box-shadow .15s}
.mm-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:7px;background:linear-gradient(180deg,var(--c1),var(--c2))}
.mm-card:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(0,0,0,.12)}
.mm-card:active{transform:scale(.985)}
.mm-flag{font-size:40px;line-height:1;flex:none}
.mm-txt{display:flex;flex-direction:column;gap:2px;min-width:0}
.mm-name{font-size:24px;font-weight:900;line-height:1.15}
.mm-lab{font-size:13px;font-weight:800;opacity:.75}
.mm-sub{font-size:12px;font-weight:700;opacity:.55;line-height:1.35;margin-top:2px}
.mm-go{margin-top:6px;font-size:12px;font-weight:900;color:var(--c1)}
@media(min-width:720px){.mm-card{flex-direction:column;text-align:center;padding:22px 16px 18px}.mm-txt{align-items:center}.mm-card:before{width:auto;height:7px;right:0;bottom:auto;background:linear-gradient(90deg,var(--c1),var(--c2))}.mm-flag{font-size:46px}}
.mm-box{margin-top:20px;border-radius:26px;padding:18px;border:1px solid var(--acc-b,#ffe4e6);background:var(--card,rgba(255,255,255,.96));box-shadow:0 8px 25px rgba(0,0,0,.05)}
.mm-box h3{font-size:16px;font-weight:900;margin:0 0 12px}
.mm-row{margin:12px 0}
.mm-row .mm-rl{display:flex;justify-content:space-between;gap:10px;font-weight:900;font-size:14px;margin-bottom:6px}
.mm-row .mm-rl small{font-weight:800;opacity:.6;font-size:12px}
.mm-bar{display:block;height:12px;border-radius:99px;background:rgba(0,0,0,.08);overflow:hidden}
body[data-mode=dark] .mm-bar{background:rgba(255,255,255,.14)}
.mm-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--c1),var(--c2));min-width:0;transition:width .5s}
.mm-extra{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.mm-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:46px;padding:10px 18px;border-radius:16px;border:1px solid var(--acc-b,#ffd7dd);background:var(--card,#fff);color:inherit;font-weight:900;font-size:14px;text-decoration:none;cursor:pointer}
.mm-btn.pri{background:linear-gradient(135deg,#f43f5e,#fb923c);color:#fff;border:0}
/* Chip môn học + nav theo môn */
#mimi-subj{white-space:nowrap}
#nav-mimi,#nav-subj{display:none}
body[data-subject=zh] .bottom-nav-inner>button:not(#nav-mimi):not(#nav-subj):not(#nav-account),
body[data-subject=ja] .bottom-nav-inner>button:not(#nav-mimi):not(#nav-subj):not(#nav-account){display:none!important}
body[data-subject=zh] #nav-mimi,body[data-subject=zh] #nav-subj,body[data-subject=ja] #nav-mimi,body[data-subject=ja] #nav-subj{display:flex!important}
body[data-subject=zh] .bottom-nav-inner,body[data-subject=ja] .bottom-nav-inner{grid-template-columns:repeat(3,minmax(0,1fr))!important}
#nav-mimi{order:1}#nav-subj{order:2}#nav-account{order:3}
body[data-subject=zh] #unit-select,body[data-subject=ja] #unit-select,body[data-subject=zh] #col-tools,body[data-subject=ja] #col-tools,
body[data-subject=zh] header p[data-guide],body[data-subject=ja] header p[data-guide]{display:none!important}
/* tai thỏ / cạnh màn hình */
header{padding-top:env(safe-area-inset-top)}
@media(max-width:640px){main.flex-grow{padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right))}}
/* Trang chủ Tiếng Nhật */
#ja-section{padding-bottom:20px}
.mm-jhero{border-radius:28px;padding:22px;color:#fff;background:linear-gradient(135deg,#ec4899,#6366f1);box-shadow:0 12px 30px rgba(99,102,241,.25)}
.mm-jhero h2{font-size:28px;font-weight:900;margin:4px 0}
.mm-jhero p{opacity:.92;font-weight:700;font-size:14px}
.mm-jhero .mm-bar{background:rgba(255,255,255,.3);margin-top:12px}
.mm-jhero .mm-bar i{background:#fff}
.mm-road{list-style:none;margin:0;padding:0}
.mm-road li{display:flex;align-items:center;gap:10px;padding:11px 0;border-top:1px solid rgba(0,0,0,.07);font-weight:800;font-size:14px}
body[data-mode=dark] .mm-road li{border-color:rgba(255,255,255,.1)}
.mm-road li:first-child{border-top:0}
.mm-road .mm-st{margin-left:auto;font-size:11px;padding:3px 9px;border-radius:99px;background:rgba(0,0,0,.07);white-space:nowrap}
.mm-road .mm-st.ok{background:#dcfce7;color:#166534}
body[data-mode=dark] .mm-road .mm-st{background:rgba(255,255,255,.12)}
</style>`);

/* ---------- Hub chọn môn ---------- */
function hub(name,acctHtml){
  const st=stats(),canClose=LS.getItem('ENT303_ONBOARDED')==='1';
  const card=k=>{const s=SUBJ[k];return `<button type="button" class="mm-card" style="--c1:${s.c1};--c2:${s.c2}" onclick="Mimi.open('${k}')"><span class="mm-flag">${s.flag}</span><span class="mm-txt"><b class="mm-name">${s.name}</b><span class="mm-lab">${s.label}</span><span class="mm-sub">${s.sub}</span><span class="mm-go">Vào học →</span></span></button>`};
  const row=k=>{const s=SUBJ[k],[n,t]=st[k],p=pct(n,t);return `<div class="mm-row" style="--c1:${s.c1};--c2:${s.c2}"><div class="mm-rl"><span>${s.flag} ${k==='zh'?'HSK1':k==='ja'?'N5':'English'}</span><small>${n}/${t} từ • ${p}%</small></div><span class="mm-bar"><i style="width:${p}%"></i></span></div>`};
  return `<div class="mm-wrap">${canClose?'<div class="mm-top"><button class="back-btn" onclick="COLX.close()">← Đóng</button></div>':''}
<div class="mm-hero"><div class="mm-logo">🌸</div><h1>Mimi</h1><div class="mm-tag">Language Practice</div><div class="mm-hi">${name?'Hi '+esc(name)+'! ':''}Hôm nay học gì nào?</div></div>
<div class="mm-grid">${card('en')}${card('zh')}${card('ja')}</div>
<div class="mm-box"><h3>📊 Mimi Progress</h3>${row('en')}${row('zh')}${row('ja')}</div>
<div class="mm-extra"><button class="mm-btn" onclick="COLX.free()">🗂 Bộ sưu tập English của tôi</button></div>
${acctHtml||''}</div>`;
}

/* ---------- Mở một môn ---------- */
function openEn(){
  let cols=[];try{cols=JSON.parse(LS.getItem('ENT303_COLS')||'[]')}catch(e){}
  if(!Array.isArray(cols)||!cols.length){COLX.go('ent303');return}
  const a=LS.getItem('ENT303_ACTIVE_COL')||'ent303';
  const c=cols.find(x=>x.id===a&&!x.hidden)||cols.find(x=>!x.hidden);
  if(c)COLX.go(c.id);else COLX.restoreEnt();
}
function open(k){
  if(k==='en')return openEn();
  if(!SUBJ[k])return;
  try{COLX.close()}catch(e){}
  switchSection(k);
}

/* ---------- Môn đang học: chip header, nav ---------- */
function set(s){
  if(!SUBJ[s])return;cur=s;LS.setItem('MIMI_SUBJ',s);
  document.body.dataset.subject=s;
  const chip=$('mimi-subj');if(chip)chip.textContent=SUBJ[s].chip;
  const nb=$('nav-subj');if(nb){const e=nb.querySelector('.nav-emoji'),l=nb.querySelector('.nav-lbl');if(s!=='en'){if(e)e.textContent=SUBJ[s].flag;if(l)l.textContent=SUBJ[s].navLabel}}
}
function setupNav(){
  const nav=document.querySelector('.bottom-nav-inner');if(!nav||$('nav-mimi'))return;
  nav.insertAdjacentHTML('beforeend','<button id="nav-mimi" onclick="COLX.gate()" title="Chọn môn học"><span class="nav-emoji">🌸</span><span>Mimi</span></button><button id="nav-subj" onclick="Mimi.home()"><span class="nav-emoji">🇨🇳</span><span class="nav-lbl">Tiếng Trung</span></button>');
}
const home=()=>switchSection(cur==='ja'?'ja':'zh');

/* ---------- Trang chủ Tiếng Nhật ---------- */
function jaSec(){let s=$('ja-section');if(!s){const c=$('content-area');if(!c)return null;c.insertAdjacentHTML('beforeend','<div id="ja-section" class="hidden"></div>');s=$('ja-section')}return s}
function drawJa(){
  const s=jaSec();if(!s)return;
  const [n,t]=statJa(),p=pct(n,t);
  const road=[['あ','Hiragana','Có bản luyện cơ bản',1],['ア','Katakana','Sắp có',0],['🔊','Phát âm','Sắp có',0],['📚','Từ vựng N5','Có bản luyện cơ bản',1],['漢','Kanji','Sắp có',0],['📖','Minna no Nihongo (từng bài)','Sắp có',0],['🎧','Listening','Sắp có',0],['🗣️','Speaking','Sắp có',0],['✍️','Writing (tracing)','Sắp có',0],['🎯','Practice & Review','Sắp có',0]];
  s.innerHTML=`<div class="mm-jhero"><div style="font-size:42px">🇯🇵</div><h2>日本語 N5</h2><p>Minna no Nihongo • Hiragana → Katakana → Từ vựng → Kanji → Luyện tập</p><span class="mm-bar"><i style="width:${p}%"></i></span><p style="margin-top:6px;font-size:12px">${n}/${t} từ đã thuộc (bản luyện hiện có)</p></div>
<div class="mm-box"><h3>🚧 Đang xây dựng</h3><p style="font-size:14px;font-weight:700;opacity:.8;line-height:1.5">Giáo trình đầy đủ sẽ được thêm theo Minna no Nihongo sau khi HSK1 hoàn chỉnh. Trong lúc chờ, bạn có thể luyện Hiragana và từ N5 cơ bản ở trang luyện hiện có.</p><div class="mm-extra"><a class="mm-btn pri" href="hoc-ngoai-ngu.html">Mở trang luyện Hiragana · N5</a></div></div>
<div class="mm-box"><h3>🗺️ Lộ trình N5</h3><ol class="mm-road">${road.map(r=>`<li><span style="font-size:20px;width:28px;text-align:center">${r[0]}</span><span>${r[1]}</span><span class="mm-st ${r[3]?'ok':''}">${r[2]}</span></li>`).join('')}</ol></div>`;
}

/* ---------- Gắn vào điều hướng ---------- */
const prev=window.switchSection;
window.switchSection=function(s){
  prev.apply(this,arguments);
  const subj=s==='zh'?'zh':s==='ja'?'ja':s==='account'?cur:'en';
  set(subj);
  const ja=jaSec();
  if(s==='ja'){if(ja){ja.classList.remove('hidden');drawJa()}$('unit-hero')?.classList.add('hidden');window.scrollTo(0,0)}
  else if(ja)ja.classList.add('hidden');
  const nb=$('nav-subj');if(nb)nb.classList.toggle('active',s==='zh'||s==='ja');
};

setupNav();
document.body.dataset.subject='en';
window.addEventListener('load',()=>setTimeout(setupNav,0));
window.Mimi={hub,open,home,stats,set,saved,subjects:SUBJ,current:()=>cur};
})();
