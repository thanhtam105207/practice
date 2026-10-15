/* ENT303 v8 — điều hướng, giọng đọc, tab Tài khoản, cài app, host sync, thông báo */
(()=>{
const $=id=>document.getElementById(id),LS=localStorage,CFG=window.ENT303_SUPABASE_CONFIG||{};
const HOSTMAIL='5ef93c022cd91f147089fada01da85fc@ent303.app';
const sb=(CFG.url&&CFG.anonKey&&window.supabase)?window.supabase.createClient(CFG.url,CFG.anonKey):null;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const toast=m=>{try{showToast(m)}catch(e){alert(m)}};
let students=null,isHost=false,dip=null,anns=[],wTab='un',depth=0,popping=false,warned=0;
const E8=window.ENT8={};E8.sb=sb;E8.isHost=()=>isHost;

/* ---------- CSS ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
.bottom-nav-inner{grid-template-columns:repeat(8,minmax(0,1fr))!important}
.bottom-nav button .nav-emoji{font-size:18px}
@media(max-width:700px){.bottom-nav button{font-size:8.5px;min-height:54px}.bottom-nav button .nav-emoji{font-size:16px}}
#app-back-row{position:sticky;top:0;z-index:30}
#app-back-row .back-btn{padding:8px 14px;border-radius:14px;background:#fff1f2;color:#e11d48;font-weight:800;font-size:13px}
.ac-card{background:#fff;border:1px solid #ffe4e6;border-radius:24px;padding:18px}
.ac-card h3{font-weight:900;color:#2d3748;margin-bottom:8px}
.ac-btn{padding:9px 14px;border-radius:14px;background:#fff1f2;color:#e11d48;font-weight:800;font-size:12px}
.ac-btn.pri{background:#f43f5e;color:#fff}
.ac-card details{border-top:1px solid #f3e8ea;padding:9px 0;font-size:13px}
.ac-card summary{font-weight:800;cursor:pointer}.ac-card details p,.ac-card details li{margin-top:6px;color:#4b5563;line-height:1.55}
#ann-bar{margin:0 auto;max-width:80rem;padding:8px 16px 0}
.ann-in{display:flex;gap:10px;align-items:flex-start;background:#fffbeb;border:1px solid #fde68a;border-radius:18px;padding:10px 14px;font-size:13px;font-weight:700;color:#78350f}
.pb{margin-top:10px;padding:9px 16px;border-radius:14px;background:#8b5cf6;color:#fff;font-weight:800;font-size:12px}
.wl{max-height:260px;overflow-y:auto;border:1px solid #f3e8ea;border-radius:14px;padding:6px 10px;margin-top:8px}
.wl div{padding:5px 0;border-bottom:1px solid #f8f1f2;font-size:13px}
body[data-mode=dark] .ac-card{background:#1e2040;border-color:#33365f;color:#e5e7eb}body[data-mode=dark] .ac-card h3{color:#fff}
</style>`);

/* ---------- Giọng đọc tiếng Anh (sửa lỗi đọc như tiếng Việt trên điện thoại) ---------- */
let voices=[];const loadV=()=>{try{voices=speechSynthesis.getVoices()||[]}catch(e){}};
if('speechSynthesis'in window){loadV();speechSynthesis.addEventListener&&speechSynthesis.addEventListener('voiceschanged',()=>{loadV();if(currentSection==='account')render()})}
const enV=()=>voices.filter(v=>/^en[-_]/i.test(v.lang));
function pick(){const s=LS.getItem('PE_VOICE'),f=voices.find(v=>v.voiceURI===s);if(f)return f;const en=enV(),us=en.filter(v=>/en[-_]US/i.test(v.lang));return us.find(v=>/google|natural|samantha|aria|jenny|zira|alex|siri/i.test(v.name))||us[0]||en[0]||null}
function say(t,rate){if(!('speechSynthesis'in window))return;if(!voices.length)loadV();speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(String(t).replace(/\s*\/\s*/g,', ')),v=pick();u.lang=v?v.lang.replace('_','-'):'en-US';if(v)u.voice=v;
 else if(!warned){warned=1;toast('Máy chưa có giọng tiếng Anh: vào Cài đặt → Văn bản sang giọng nói, tải English (US).')}
 u.rate=rate||.9;setTimeout(()=>speechSynthesis.speak(u),40)}
window.speakWord=t=>say(t,.9);
window.speakCurrentListeningWord=r=>{const it=listenQuizItems[listenQuizIndex];if(it)say(it.word,typeof r==='number'?r:.9)};
E8.voice=v=>{LS.setItem('PE_VOICE',v);say('Hello, nice to meet you')};E8.test=()=>say('Hello, nice to meet you');

/* ---------- Điều hướng + nút Back (kể cả nút Back của điện thoại) ---------- */
function closeTop(){
 const g=$('grammar-quiz-run');if(g&&!g.classList.contains('hidden')){closeGrammarQuiz();return true}
 for(const id of ['image-memory-modal','folder-modal','theme-modal','col-md','shortcut-modal','grammar-quiz-modal']){const m=$(id);if(m&&!m.classList.contains('hidden')){m.classList.add('hidden');m.classList.remove('flex');return true}}
 if(['fastquiz','listenquiz'].includes(currentSection)||(currentSection==='quiz'&&activeQuizMode)){openQuizPicker();return true}
 return false}
const prev=window.switchSection;
function backRow(s){$('app-back-row')?.classList.toggle('hidden',s==='home')}
window.switchSection=function(s){
 const from=currentSection,acc=$('account-section');
 if(s==='account'){['home','list','add','flashcard','grammar','quiz','fastquiz','listenquiz','notes'].forEach(x=>$(x+'-section')?.classList.add('hidden'));
  $('unit-hero')?.classList.add('hidden');currentSection='account';['home','list','flashcard','grammar','quiz','notes','add'].forEach(k=>$('nav-'+k)?.classList.remove('active'));$('nav-account')?.classList.add('active');acc.classList.remove('hidden');render();window.scrollTo(0,0)}
 else{acc&&acc.classList.add('hidden');$('nav-account')?.classList.remove('active');prev.apply(this,arguments)}
 if(!popping&&s!==from){history.pushState({s},'');depth++}
 backRow(s)};
window.appGoBack=function(){if(closeTop())return;if(depth>0)history.back();else window.switchSection('home')};
history.replaceState({s:'home'},'');
addEventListener('popstate',e=>{depth=Math.max(0,depth-1);if(closeTop()){history.pushState({s:currentSection},'');depth++;return}
 popping=true;window.switchSection((e.state&&e.state.s)||'home');popping=false});

/* ---------- Giao diện: icon nav + tab Tài khoản + nút luyện tập ngữ pháp ---------- */
const IC={home:'house',list:'book',flashcard:'clone',grammar:'pen-ruler',quiz:'brain',notes:'note-sticky',add:'circle-plus',account:'user'};
function setup(){
 const nav=document.querySelector('.bottom-nav-inner');if(!nav)return;
 if(!$('nav-account'))nav.insertAdjacentHTML('beforeend','<button id="nav-account" onclick="switchSection(\'account\')"><span class="nav-emoji"></span><span>Tài khoản</span></button>');
 Object.entries(IC).forEach(([k,i])=>{const e=$('nav-'+k)?.querySelector('.nav-emoji');if(e)e.innerHTML=`<i class="fa-solid fa-${i}"></i>`});
 if(!$('account-section'))$('content-area').insertAdjacentHTML('beforeend','<div id="account-section" class="hidden space-y-4"></div>');
 if(!$('ann-bar'))document.querySelector('header').insertAdjacentHTML('afterend','<div id="ann-bar"></div>');
 const gc=$('grammar-container');
 if(gc)new MutationObserver(()=>gc.querySelectorAll('[data-g]').forEach(c=>{if(!c.querySelector('.pb'))c.insertAdjacentHTML('beforeend','<button class="pb" onclick="launchQuiz(\'grammar\')"><i class="fa-solid fa-dumbbell"></i> Luyện tập ngữ pháp (Quiz)</button>')})).observe(gc,{childList:true});
 backRow(currentSection)}

/* ---------- Câu hỏi tự thêm (trắc nghiệm ngữ pháp) ---------- */
const QK='PE_CUSTOMQ',getQ=()=>{try{return JSON.parse(LS.getItem(QK)||'[]')}catch(e){return[]}};let hostQ=[];
function injectQ(){try{const mc=grammarBank.mc;for(let i=mc.length-1;i>=0;i--)if(mc[i]._c)mc.splice(i,1);[...hostQ,...getQ()].forEach(q=>mc.push({q:q.q,options:q.options,ans:q.ans,_c:1}))}catch(e){}}
E8.addQ=()=>{const g=id=>($(id)?.value||'').trim(),q=g('cq-q'),o=[1,2,3,4].map(i=>g('cq-o'+i)),a=parseInt($('cq-a')?.value||'0');
 if(!q||o.some(x=>!x))return toast('Nhập đủ câu hỏi và 4 đáp án');const l=getQ();l.push({q,options:o,ans:a,id:Date.now()});LS.setItem(QK,JSON.stringify(l));injectQ();toast('Đã thêm câu hỏi ✅');render()};
E8.delQ=id=>{LS.setItem(QK,JSON.stringify(getQ().filter(x=>x.id!==id)));injectQ();render()};
const qCard=()=>`<div class="ac-card"><h3>➕ Câu hỏi của tôi</h3><p class="text-xs text-gray-500 mb-2">Câu bạn thêm sẽ xuất hiện trong Quiz ngữ pháp (trắc nghiệm).${isHost?' Host bấm Xuất bản để cả lớp cùng có.':''}</p>
<input id="cq-q" class="w-full p-2 border border-rose-100 rounded-xl text-sm mb-2" placeholder="Câu hỏi (dùng ___ cho chỗ trống)">${[1,2,3,4].map(i=>`<input id="cq-o${i}" class="w-full p-2 border border-rose-100 rounded-xl text-sm mb-1" placeholder="Đáp án ${i}">`).join('')}
<select id="cq-a" class="p-2 border border-rose-100 rounded-xl text-sm mt-1"><option value="0">Đúng: đáp án 1</option><option value="1">Đúng: đáp án 2</option><option value="2">Đúng: đáp án 3</option><option value="3">Đúng: đáp án 4</option></select> <button class="ac-btn pri" onclick="ENT8.addQ()">Thêm</button>
<div class="wl">${getQ().length?getQ().map(x=>`<div>${esc(x.q)} <button class="text-rose-500 text-xs" onclick="ENT8.delQ(${x.id})">xóa</button></div>`).join(''):'<div class="text-gray-400">Chưa có câu nào.</div>'}</div></div>`;

/* ---------- Host: danh sách học viên ---------- */
const logged=()=>!!(window.ENT303MP&&ENT303MP.user&&ENT303MP.user());
let acts=null,autoLoaded=false;
let hist=null,histWho='',sqlWarned=false;
const warn=m=>{if(sqlWarned)return;sqlWarned=true;toast(m)};
E8.loadStu=async()=>{if(!sb)return;const{data,error}=await sb.rpc('get_students');if(error){students=[];return warn('Chưa chạy supabase-activity.sql: '+error.message)}students=data||[];render()};
E8.loadAct=async()=>{if(!sb)return;const{data,error}=await sb.rpc('get_activity',{p_limit:500});if(error){acts=[];return warn('Chưa chạy supabase-activity.sql: '+error.message)}acts=data||[];render()};
E8.logAttempt=async(kind,score,total,unit)=>{if(!sb||!logged()||!(total>0))return;try{await sb.rpc('log_quiz_attempt',{p_kind:kind,p_unit:String(unit||''),p_score:Math.max(0,score|0),p_total:total|0})}catch(x){}};
E8.loadHist=async()=>{if(!sb)return;const{data,error}=await sb.rpc('get_quiz_history',{p_limit:500});if(error){hist=[];return warn('Chưa chạy supabase-history.sql: '+error.message)}hist=data||[];render()};
E8.setHistWho=v=>{histWho=v;render()};
E8.refreshClass=()=>{E8.loadStu();E8.loadAct();E8.loadHist()};
const QL={slide:'Quiz Slide',slide_en:'Quiz Anh–Anh',fast:'Quiz 2 cột',listen:'Nghe chép',grammar:'Quiz Ngữ pháp'};
const histCard=()=>{if(!logged())return'';
 let body;if(!hist)body='<div class="text-gray-400">Đang tải...</div>';else{
  const names=[...new Set(hist.map(x=>x.display_name))].sort((a,b)=>a.localeCompare(b,'vi'));
  const rows=hist.filter(x=>!histWho||x.display_name===histWho);
  const sel=`<select class="ac-btn" onchange="ENT8.setHistWho(this.value)"><option value="">Tất cả mọi người</option>${names.map(n=>`<option value="${esc(n)}"${n===histWho?' selected':''}>${esc(n)}</option>`).join('')}</select>`;
  let cur='';const list=!rows.length?'<div class="text-gray-400 mt-2">Chưa có lượt làm bài nào.</div>':rows.map(x=>{const d=fDay(x.created_at);let h='';if(d!==cur){cur=d;const n=rows.filter(y=>fDay(y.created_at)===d).length;h=`<div class="font-extrabold mt-3 text-rose-600">📅 ${esc(d)} <small class="text-gray-400 font-normal">· ${n} lượt</small></div>`}
   const pc=Math.round(x.score*100/x.total);return h+`<div><small class="text-gray-400">${fHour(x.created_at)}</small> <b>${esc(x.display_name)}</b> ${QL[x.kind]||esc(x.kind)}${x.unit?' · '+esc(x.unit):''} — <b class="${pc>=80?'text-emerald-600':pc>=50?'text-amber-600':'text-rose-500'}">${x.score}/${x.total} (${pc}%)</b></div>`}).join('');
  body=sel+list}
 return `<div class="ac-card"><h3>📝 Lịch sử làm bài</h3><p class="text-xs text-gray-500 mb-2">Mỗi lần ai làm xong một bài quiz: giờ Việt Nam, dạng quiz, Unit, số câu đúng. Bài làm dở chưa xong thì chưa ghi.</p><button class="ac-btn" onclick="ENT8.refreshClass()">🔄 Làm mới</button><div class="wl" style="max-height:460px;overflow:auto">${body}</div></div>`};
const TZ='Asia/Ho_Chi_Minh',KL={vocab_learned:'học từ mới',vocab_correct:'trả lời đúng từ vựng',grammar_correct:'trả lời đúng ngữ pháp',quiz_complete_80:'hoàn thành quiz (≥80%)',quiz_complete_100:'hoàn thành quiz (100%)',write_done:'luyện viết'};
const fDay=t=>new Date(t).toLocaleDateString('vi-VN',{timeZone:TZ,weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});
const fHour=t=>new Date(t).toLocaleTimeString('vi-VN',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hour12:false});
function actGroups(){const g=[],last={};for(const e of acts||[]){const t=+new Date(e.created_at),k=e.display_name+'|'+e.kind,L=last[k];if(L&&L.from-t<=600000){L.from=t;L.n++;L.xp+=e.xp}else{const o={name:e.display_name,kind:e.kind,from:t,to:t,n:1,xp:e.xp};last[k]=o;g.push(o)}}return g}
const actCard=()=>{if(!logged())return'';
 let body;if(!acts)body='<div class="text-gray-400">Đang tải...</div>';else if(!acts.length)body='<div class="text-gray-400">Chưa có hoạt động nào.</div>';else{
  const tot={};for(const e of acts){const d=fDay(e.created_at);tot[d]=tot[d]||{};tot[d][e.display_name]=(tot[d][e.display_name]||0)+e.xp}
  let cur='';body=actGroups().map(g=>{const d=fDay(g.to);let h='';if(d!==cur){cur=d;h=`<div class="font-extrabold mt-3 text-rose-600">📅 ${esc(d)}</div><div class="text-xs text-gray-500 mb-1">Tổng ngày: ${Object.entries(tot[d]).sort((a,b)=>b[1]-a[1]).map(([n,x])=>esc(n)+' '+x+' XP').join(' · ')}</div>`}
   const a=fHour(g.from),b=fHour(g.to);return h+`<div><small class="text-gray-400">${a}${g.n>1&&a!==b?'–'+b:''}</small> <b>${esc(g.name)}</b> ${KL[g.kind]||esc(g.kind)}${g.n>1?' ×'+g.n:''} <b class="text-rose-500">+${g.xp} XP</b></div>`}).join('')}
 return `<div class="ac-card"><h3>🕒 Hoạt động của lớp</h3><p class="text-xs text-gray-500 mb-2">Giờ Việt Nam. Các lần làm liên tiếp trong 10 phút được gộp thành một dòng.</p><button class="ac-btn" onclick="ENT8.refreshClass()">🔄 Làm mới</button><div class="wl" style="max-height:420px;overflow:auto">${body}</div></div>`};
const dt=x=>x?new Date(x).toLocaleDateString('vi-VN'):'—';
const stuCard=()=>!logged()?'<div class="ac-card"><h3>👥 Thành viên lớp</h3><p class="text-xs text-gray-400">Đăng nhập để xem danh sách và hoạt động của cả lớp.</p></div>':`<div class="ac-card"><h3>👥 Thành viên lớp ${students?'('+students.length+')':''}</h3><button class="ac-btn" onclick="ENT8.refreshClass()">🔄 Làm mới</button>
<div class="wl">${students?(students.length?students.map(x=>`<div><b>${esc(x.display_name)}</b> — ${x.total_xp} XP <small class="text-gray-400">· đăng ký ${dt(x.registered_at)} · hoạt động ${dt(x.last_active)}</small></div>`).join(''):'<div class="text-gray-400">Chưa có thành viên.</div>'):'<div class="text-gray-400">Đang tải...</div>'}</div></div>`;

/* ---------- Tài khoản ---------- */
const GUIDE=[['Bắt đầu nhanh','<p>Từ vựng: bấm vào một từ để xem đầy đủ. Thẻ: lật thẻ rồi chọn Đã thuộc / Chưa thuộc. Quiz: chọn kiểu quiz, làm xong sẽ có XP. Ngữ pháp: đọc công thức rồi bấm “Luyện tập”.</p>'],
['Thêm từ / ngữ pháp','<p>Tab Thêm: nhập một từ hoặc dán nhiều từ cùng lúc (copy prompt đưa ChatGPT). Dấu ⋮ trên mỗi từ để Sửa / Xóa / Thêm ảnh gợi nhớ.</p>'],
['Phím tắt (máy tính)','<ul><li>Space: lật thẻ · Ctrl+X: nghe phát âm</li><li>← / →: chưa thuộc / đã thuộc</li><li>1–4: chọn đáp án · Enter: nộp / sang câu</li></ul>'],
['Nút Quay lại','<p>Nút “← Quay lại” (hoặc nút Back của điện thoại) đi lùi từng bước: thoát bài quiz → về màn chọn quiz → màn trước đó → Trang chủ.</p>'],
['Giọng đọc không đúng','<p>Vào Tài khoản → Giọng đọc, chọn giọng English (US). Nếu danh sách trống, tải giọng ở Cài đặt điện thoại → Văn bản sang giọng nói.</p>'],
['Đồng bộ & sao lưu','<p>Đăng nhập để XP và dữ liệu theo bạn trên mọi máy. Có thể Sao lưu / Khôi phục file JSON trong tab này.</p>']];
const INSTALL=[['Android (Chrome, Edge, Samsung Internet)','<p>Bấm nút “Cài app” ở trên, hoặc menu ⋮ → <b>Cài đặt ứng dụng / Thêm vào màn hình chính</b>.</p>'],
['iPhone / iPad (Safari)','<p>Bấm nút Chia sẻ <b>⬆</b> → <b>Thêm vào MH chính</b> → Thêm. (Trên iOS phải dùng Safari; Chrome iOS cũng có trong Chia sẻ → Thêm vào MH chính.)</p>'],
['Máy tính (Chrome, Edge)','<p>Bấm biểu tượng cài đặt ở cuối thanh địa chỉ, hoặc menu ⋮ → <b>Cài đặt ENT303</b>.</p>'],
['Firefox / Safari máy tính','<p>Safari Mac: Tệp → <b>Thêm vào Dock</b>. Firefox chưa hỗ trợ cài app, hãy dùng bookmark.</p>']];
const det=a=>a.map(x=>`<details><summary>${x[0]}</summary>${x[1]}</details>`).join('');
function wordsList(){const v=(unitsData[currentUnit]?.vocab||[]);
 const f=wTab==='ok'?v.filter(x=>learnedCardsSet.has(x.word)):wTab==='no'?v.filter(x=>unlearnedCardsSet.has(x.word)):v.filter(x=>!learnedCardsSet.has(x.word)&&!unlearnedCardsSet.has(x.word));
 const t=(k,l)=>`<button class="ac-btn ${wTab===k?'pri':''}" onclick="ENT8.tab('${k}')">${l}</button>`;
 return `<div class="ac-card"><h3>📊 Từ của tôi (${esc(unitsData[currentUnit]?.title||'')})</h3><div class="flex flex-wrap gap-2">${t('ok','✅ Đã thuộc')}${t('no','❌ Chưa thuộc')}${t('un','🆕 Chưa học')}</div><div class="wl">${f.length?f.map(x=>`<div><b>${esc(x.word)}</b> — ${esc(x.def||'')}</div>`).join(''):'<div class="text-gray-400">Chưa có từ nào.</div>'}</div></div>`}
E8.tab=k=>{wTab=k;render()};
function render(){const a=$('account-section');if(!a)return;if(!autoLoaded&&logged()){autoLoaded=true;setTimeout(E8.refreshClass,0)}const n=LS.getItem('ENT303_NAME')||'Khách',on=!!(window.ENT303MP&&ENT303MP.user&&ENT303MP.user());
 const vs=enV(),cur=pick();
 a.innerHTML=`<div class="ac-card"><div class="flex items-center justify-between gap-3 flex-wrap"><div><h3>👤 ${esc(n)} ${isHost?'<span class="ac-btn pri" style="padding:2px 8px">HOST</span>':''}</h3><p class="text-xs text-gray-500">${on?'Đã đăng nhập, dữ liệu được đồng bộ.':'Chưa đăng nhập — dữ liệu chỉ lưu trên máy này.'}</p></div>
 ${on?'<button class="ac-btn" onclick="COLX.logout()">Đăng xuất</button>':'<button class="ac-btn pri" onclick="COLX.login()">Đăng nhập / tạo tài khoản</button>'}</div></div>
 <div class="ac-card"><h3>📣 Thông báo</h3>${anns.length?anns.map(x=>`<div class="text-sm py-1 border-b border-gray-100">${esc(x.text)} <small class="text-gray-400">${new Date(x.created_at).toLocaleDateString('vi-VN')}</small>${isHost?` <button class="text-rose-500 text-xs" onclick="ENT8.delAnn(${x.id})">xóa</button>`:''}</div>`).join(''):'<p class="text-sm text-gray-400">Chưa có thông báo.</p>'}
 ${isHost?'<textarea id="ann-in" rows="2" class="w-full mt-2 p-3 border border-rose-100 rounded-xl text-sm" placeholder="Nội dung thông báo cho cả lớp..."></textarea><button class="ac-btn pri mt-2" onclick="ENT8.postAnn()">Đăng thông báo</button>':''}</div>
 ${isHost?'<div class="ac-card"><h3>🛠 Công cụ Host</h3><p class="text-xs text-gray-500 mb-2">Sửa từ/ngữ pháp bằng nút ⋮ như bình thường, rồi bấm Xuất bản để mọi tài khoản nhận thay đổi.</p><div class="flex flex-wrap gap-2"><button class="ac-btn pri" onclick="ENT8.publish()">📤 Xuất bản cho cả lớp</button><button class="ac-btn" onclick="ENT8.pull(true)">⬇ Tải lại bản đã xuất bản</button></div></div>':''}
 <div class="ac-card"><h3>🌸 Chọn môn học</h3><p class="text-xs text-gray-500 mb-2">English • 中文 (HSK) • 日本語 (N5) — 3 môn ngang hàng trong Mimi.</p><button class="ac-btn pri" onclick="COLX.gate()">Mở Mimi</button></div>
 ${stuCard()}
 ${histCard()}
 ${actCard()}
 ${wordsList()}
 ${qCard()}
 <div class="ac-card"><h3>🎨 Giao diện & giọng đọc</h3><div class="flex flex-wrap gap-2 items-center"><button class="ac-btn" onclick="ENTX.openTheme()">🎨 Chủ đề / nền</button><button class="ac-btn" onclick="changeFont(-1)">A−</button><button class="ac-btn" onclick="changeFont(1)">A+</button></div>
 <div class="flex flex-wrap gap-2 items-center mt-3"><select class="p-2 border border-rose-100 rounded-xl text-xs max-w-full" onchange="ENT8.voice(this.value)">${vs.length?vs.map(v=>`<option value="${esc(v.voiceURI)}" ${cur&&cur.voiceURI===v.voiceURI?'selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join(''):'<option>Chưa có giọng English trên máy</option>'}</select><button class="ac-btn" onclick="ENT8.test()">🔊 Nghe thử</button></div></div>
 <div class="ac-card"><h3>📲 Cài app</h3>${dip?'<button class="ac-btn pri mb-2" onclick="ENT8.install()">Cài app ngay</button>':'<p class="text-xs text-gray-500">Nếu không thấy nút cài, làm theo hướng dẫn dưới đây.</p>'}${det(INSTALL)}</div>
 <div class="ac-card"><h3>📖 Hướng dẫn sử dụng</h3>${det(GUIDE)}<button class="ac-btn mt-3" onclick="toggleShortcutModal()">⌨ Bảng phím tắt</button></div>
 <div class="ac-card"><h3>💾 Sao lưu</h3><div class="flex flex-wrap gap-2"><button class="ac-btn" onclick="downloadBackup()">Tải bản sao lưu</button><label class="ac-btn cursor-pointer">Khôi phục<input type="file" accept=".json" class="hidden" onchange="importBackup(event)"></label></div></div>`}
E8.install=async()=>{if(!dip)return;dip.prompt();try{await dip.userChoice}catch(e){}dip=null;render()};
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;if(currentSection==='account')render()});

/* ---------- Host: nội dung dùng chung + thông báo ---------- */
const KEYF=x=>(x.word||x.phrase||x.title||'').toLowerCase().trim(),LISTS=['vocab','idioms','grammar'];
function merge(base){let n=0;for(const u of Object.keys(base).filter(k=>/^\d+$/.test(k))){const b=base[u],l=unitsData[u];if(!l){unitsData[u]=JSON.parse(JSON.stringify(b));continue}
  ['badge','title','desc'].forEach(k=>{if(b[k])l[k]=b[k]});
  for(const k of LISTS){const bl=b[k]||[],bk=new Set(bl.map(KEYF)),old=l[k]||[],om=new Map(old.map(x=>[KEYF(x),x]));
   const nb=JSON.parse(JSON.stringify(bl));nb.forEach(x=>{const o=om.get(KEYF(x));if(o&&o.image)x.image=o.image});
   const mine=old.filter(x=>x.custom&&!x.host&&!bk.has(KEYF(x)));l[k]=[...nb,...mine];n+=nb.length}}
 try{LS.setItem('ENT303_USER_UNITS_DATA',JSON.stringify(unitsData))}catch(e){}return n}
E8.pull=async function(force){if(!sb)return;try{const{data,error}=await sb.from('host_content').select('data,updated_at').eq('id',1).maybeSingle();if(error||!data)return;
  const st=LS.getItem('ENT303_HOSTVER');if(!force&&st===data.updated_at)return;if(isHost&&!force)return;
  hostQ=data.data.__questions||[];injectQ();merge(data.data);LS.setItem('ENT303_HOSTVER',data.updated_at);try{switchUnit(currentUnit)}catch(e){}if(force)toast('Đã tải nội dung mới nhất')}catch(e){console.warn(e)}};
E8.publish=async function(){if(!isHost)return;if(!confirm('Xuất bản toàn bộ nội dung hiện tại cho mọi tài khoản?'))return;
 const d=JSON.parse(JSON.stringify(unitsData));d.__questions=[...hostQ,...getQ()];Object.values(d).forEach(u=>LISTS.forEach(k=>(u[k]||[]).forEach(x=>{if(x.custom)x.host=true})));
 const{error}=await sb.from('host_content').upsert({id:1,data:d,updated_at:new Date().toISOString()});
 if(error)toast('Lỗi: '+error.message);else{LS.removeItem('ENT303_HOSTVER');toast('Đã xuất bản cho cả lớp ✅')}};
async function loadAnns(){if(!sb)return;try{const{data}=await sb.from('announcements').select('*').order('created_at',{ascending:false}).limit(5);anns=data||[];bar();if(currentSection==='account')render()}catch(e){}}
function bar(){const a=anns[0],b=$('ann-bar');if(!b)return;b.innerHTML=a&&LS.getItem('PE_ANN')!==String(a.id)?`<div class="ann-in"><span>📣</span><span class="flex-1">${esc(a.text)}</span><button onclick="ENT8.dismiss(${a.id})">✕</button></div>`:''}
E8.dismiss=id=>{LS.setItem('PE_ANN',String(id));bar()};
E8.postAnn=async()=>{const t=($('ann-in')?.value||'').trim();if(!t)return;const{error}=await sb.from('announcements').insert({text:t});if(error)return toast('Lỗi: '+error.message);toast('Đã đăng thông báo');loadAnns()};
E8.delAnn=async id=>{await sb.from('announcements').delete().eq('id',id);loadAnns()};
async function checkHost(){if(!sb)return;try{const{data}=await sb.auth.getSession();isHost=data.session?.user?.email===HOSTMAIL;window.dispatchEvent(new Event('ent-host'));if(currentSection==='account')render()}catch(e){}}
if(sb)sb.auth.onAuthStateChange(()=>checkHost());

/* ---------- PWA ---------- */
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
addEventListener('load',()=>setTimeout(async()=>{try{LS.removeItem('PE_HOSTVER')}catch(e){}setup();injectQ();await checkHost();E8.pull();loadAnns();document.addEventListener('visibilitychange',()=>{if(!document.hidden)E8.pull()})},900));
})();
/* hsk1-data.js, hsk1-app.js và mimi.js được nạp trực tiếp bằng <script> trong index.html (đúng thứ tự). */
