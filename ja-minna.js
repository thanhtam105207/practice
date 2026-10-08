/* Minna no Nihongo Sơ cấp 1 — Bài tập (標準問題集). Engine: đọc dữ liệu từ window.MINNA_L (các file ja-minna-dataN.js nối thêm vào).
   Loại câu: ['p',"câu có {particle}"] · ['t',hỏi,[đáp án..]] · ['c',hỏi,[lựa chọn],chỉ số đúng] · ['r',[từ theo thứ tự đúng]] · ['f',hỏi,"câu mẫu"] (tự chấm) */
(()=>{
window.MINNA_L=window.MINNA_L||[];
const $=id=>document.getElementById(id),LS=localStorage,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const xp=(k,r)=>{try{window.ent303AwardXP&&window.ent303AwardXP(k,r)}catch(e){}};
const PAR=['は','が','を','に','で','へ','の','と','も','から','まで','や','へも','×'];
let PR={};try{PR=JSON.parse(LS.getItem('PE_MINNA')||'{}')}catch(e){}
const sv=()=>{try{LS.setItem('PE_MINNA',JSON.stringify(PR))}catch(e){}};
const norm=s=>String(s).replace(/[\s\u3000。、．，.,・「」『』…~〜!！?？()（）]/g,'').replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0)).replace(/円$/,'').toLowerCase();
const say=t=>{try{window.JA&&JA.say(t)}catch(e){}};
function expand(it){
 const k=it[0];
 if(k==='p'){const s=it[1],bl=[...s.matchAll(/\{([^}]*)\}/g)].map(m=>m[1]);
  return bl.map((a,i)=>{let n=-1;const q=s.replace(/\{([^}]*)\}/g,(m,x)=>{n++;return n===i?'（　？　）':x==='×'?'':x});
   const o=shuf([a,...shuf(PAR.filter(x=>x!==a)).slice(0,3)]);return{k:'c',q,o,a:[a],say:s.replace(/\{([^}]*)\}/g,(m,x)=>x==='×'?'':x)}})}
 if(k==='c')return[{k:'c',q:it[1],o:shuf(it[2]),a:[it[2][it[3]]]}];
 if(k==='t')return[{k:'t',q:it[1],a:it[2]}];
 if(k==='r')return[{k:'r',t:it[1]}];
 if(k==='f')return[{k:'f',q:it[1],m:it[2]}];
 return[]}
const secItems=s=>s.i.flatMap(expand);
let M={v:'home',l:null,s:null},S=null;
const sec=()=>(window.MN&&MN.root?MN.root():$('ja-section')),LL=()=>window.MINNA_L.filter(l=>!l.lang||l.lang===(M.lang||'ja'));
const boxCss='<style>.mn-back{margin:0 0 10px;width:100%}.mn-chip{display:inline-block;margin:4px;min-height:44px}.mn-ans{min-height:52px;border:2px dashed #8884;border-radius:14px;padding:6px;margin:10px 0}.mn-in{width:100%;padding:12px;border-radius:14px;border:2px solid #8884;font-size:16px;background:transparent;color:inherit}.mn-bar{height:6px;background:#8883;border-radius:9px;overflow:hidden;margin-top:6px}.mn-bar i{display:block;height:100%;background:#22c55e}</style>';
if(!document.getElementById('mn-css'))document.head.insertAdjacentHTML('beforeend',boxCss.replace('<style>','<style id="mn-css">'));
const secKey=(l,i)=>l.id+'#'+i;
const secPct=(l,i)=>PR[secKey(l,i)]||0;
const lessPct=l=>{const n=l.s.length;return Math.round(l.s.reduce((a,_,i)=>a+secPct(l,i),0)/n)};
function drawHome(){const L=LL();
 sec().innerHTML=`<button class="jb mn-back" onclick="MN.exit()">← Quay lại</button><div class="jc"><b>📖 Minna no Nihongo Sơ cấp 1 — Bài tập (標準問題集)</b><div class="jm">${L.length} mục · ${L.reduce((a,l)=>a+l.s.length,0)} phần luyện · điểm cao nhất được lưu trên máy</div></div>`+L.map(l=>`<div class="jc" onclick="MN.lesson('${l.id}')" style="cursor:pointer"><b>${esc(l.t)}</b><div class="jm">${l.s.length} phần · tốt nhất ${lessPct(l)}%</div><div class="mn-bar"><i style="width:${lessPct(l)}%"></i></div></div>`).join('');window.scrollTo(0,0)}
function drawLesson(){const l=window.MINNA_L.find(x=>x.id===M.l);
 sec().innerHTML=`<button class="jb mn-back" onclick="${M.direct?'MN.exit()':'MN.home()'}">← ${M.direct?'Quay lại':'Danh sách bài'}</button><div class="jc"><b>${esc(l.t)}</b></div>`+l.s.map((s,i)=>`<div class="jc" onclick="MN.start(${i})" style="cursor:pointer"><b>${esc(s.t)}</b><div class="jm">${secItems(s).length} câu · tốt nhất ${secPct(l,i)}%</div></div>`).join('');window.scrollTo(0,0)}
function start(i){const l=window.MINNA_L.find(x=>x.id===M.l),s=l.s[i];M.s=i;S={q:secItems(s),n:0,sc:0,bad:[],l,s,i};drawQ()}
function drawQ(){
 if(S.n>=S.q.length){const p=Math.round(S.sc/S.q.length*100),key=secKey(S.l,S.i);if(p>(PR[key]||0)){PR[key]=p;sv()}
  if(!S.d){S.d=1;if(p>=100)xp('quiz_complete_100');else if(p>=80)xp('quiz_complete_80')}
  sec().innerHTML=`<div class="jc" style="text-align:center"><div style="font-size:3rem">${p>=80?'🏆':p>=50?'👍':'💪'}</div><h3 class="text-xl font-black">${S.sc}/${S.q.length} câu đúng (${p}%)</h3><p class="jm">${esc(S.s.t)}</p>${S.bad.length?'<p class="jm">Cần ôn lại:</p>'+S.bad.map(b=>`<div style="text-align:left;margin:6px 0"><div>${esc(b.q)}</div><div class="jm">→ ${esc(b.ans)}</div></div>`).join(''):'<p>Không sai câu nào!</p>'}<div class="jrow" style="margin-top:12px"><button class="jb pri" onclick="MN.start(${S.i})">Làm lại</button><button class="jb" onclick="MN.lesson('${S.l.id}')">Chọn phần khác</button></div></div>`;window.scrollTo(0,0);return}
 const c=S.q[S.n],head=`<button class="jb mn-back" onclick="MN.lesson('${S.l.id}')">← ${esc(S.l.t.split('—')[0])}</button><div class="jc"><div class="jm">${esc(S.s.t)} · Câu ${S.n+1}/${S.q.length}</div><div class="mn-bar"><i style="width:${S.n/S.q.length*100}%"></i></div>`;
 let b='';
 if(c.k==='c')b=`<p style="font-size:1.25rem;font-weight:800;margin:14px 0;line-height:1.7">${esc(c.q)}</p>`+c.o.map(x=>`<button class="jo" data-k="${c.a[0]===x?1:0}">${esc(x==='×'?'× (không cần trợ từ)':x)}</button>`).join('');
 if(c.k==='t')b=`<p style="font-size:1.25rem;font-weight:800;margin:14px 0;line-height:1.7">${esc(c.q)}</p><input class="mn-in" id="mn-i" autocomplete="off" autocapitalize="off" placeholder="Gõ đáp án (kana hoặc kanji)"><button class="jb pri" style="width:100%;margin-top:10px" id="mn-ok">Kiểm tra</button>`;
 if(c.k==='r'){c.sh=shuf(c.t);c.pick=[];b=`<p class="jm" style="margin:10px 0">Sắp xếp thành câu đúng (chạm từ theo thứ tự):</p><div class="mn-ans" id="mn-a"></div><div id="mn-p"></div><button class="jb pri" style="width:100%;margin-top:10px" id="mn-ok">Kiểm tra</button>`}
 if(c.k==='f')b=`<p style="font-size:1.25rem;font-weight:800;margin:14px 0;line-height:1.7">${esc(c.q)}</p><textarea class="mn-in" id="mn-i" rows="2" placeholder="Tự viết câu trả lời của bạn"></textarea><button class="jb pri" style="width:100%;margin-top:10px" id="mn-ok">Xem câu mẫu</button>`;
 sec().innerHTML=head+b+'<div id="mn-fb"></div></div>';window.scrollTo(0,0);
 const fb=(ok,ans)=>{S.q[S.n].done=1;ok?S.sc++:S.bad.push({q:c.q||c.t.join(''),ans});try{ok?(xp('vocab_correct'),correctFx()):wrongFx()}catch(e){}
  $('mn-fb').innerHTML=`<div class="jm" style="margin-top:10px">${ok?'✅ Chính xác!':'❌ Chưa đúng.'} Đáp án: <b>${esc(ans)}</b></div><button class="jb pri" style="width:100%;margin-top:8px" onclick="MN.next()">Tiếp →</button>`};
 if(c.k==='c')sec().querySelectorAll('.jo').forEach(x=>x.onclick=()=>{const ok=x.dataset.k==='1';sec().querySelectorAll('.jo').forEach(y=>{y.disabled=true;if(y.dataset.k==='1')y.classList.add('good')});if(!ok)x.classList.add('bad');if(c.say)say(c.say);fb(ok,c.a[0]==='×'?'× (không cần trợ từ)':c.a[0])});
 if(c.k==='t'){const go=()=>{const v=norm($('mn-i').value);if(!v)return;$('mn-i').disabled=true;$('mn-ok').style.display='none';fb(c.a.some(a=>norm(a)===v),c.a[0])};$('mn-ok').onclick=go;$('mn-i').onkeydown=e=>{if(e.key==='Enter')go()}}
 if(c.k==='r'){const dr=()=>{$('mn-a').innerHTML=c.pick.map((w,i)=>`<button class="jb mn-chip" data-i="${i}">${esc(w)}</button>`).join('');$('mn-p').innerHTML=c.sh.map((w,i)=>c.pick.some(p=>p.i===i)?'':`<button class="jb mn-chip" data-w="${i}">${esc(w)}</button>`).join('')};
  const draw2=()=>{$('mn-a').innerHTML=c.pick.map((p,j)=>`<button class="jb mn-chip" data-j="${j}">${esc(c.sh[p])}</button>`).join('');$('mn-p').innerHTML=c.sh.map((w,i)=>c.pick.includes(i)?'':`<button class="jb mn-chip" data-w="${i}">${esc(w)}</button>`).join('');
   $('mn-a').querySelectorAll('[data-j]').forEach(x=>x.onclick=()=>{c.pick.splice(+x.dataset.j,1);draw2()});$('mn-p').querySelectorAll('[data-w]').forEach(x=>x.onclick=()=>{c.pick.push(+x.dataset.w);draw2()})};draw2();
  $('mn-ok').onclick=()=>{if(!c.pick.length)return;const got=c.pick.map(i=>c.sh[i]).join(''),ok=got===c.t.join('');$('mn-ok').style.display='none';$('mn-a').querySelectorAll('button').forEach(x=>x.disabled=true);$('mn-p').innerHTML='';fb(ok,c.t.join('')+'。');say(c.t.join(''))}}
 if(c.k==='f')$('mn-ok').onclick=()=>{$('mn-i').disabled=true;$('mn-ok').style.display='none';$('mn-fb').innerHTML=`<div class="jm" style="margin-top:10px">Câu mẫu: <b>${esc(c.m)}</b> <button class="jb" onclick="JA.say('${esc(c.m)}')">🔊</button></div><p class="jm">Bạn tự chấm nhé:</p><div class="jrow"><button class="jb pri" onclick="MN.self(1)">✅ Mình viết đúng</button><button class="jb" onclick="MN.self(0)">🔁 Chưa đúng</button></div>`}
}
window.MN={home(){M.v='home';drawHome()},lesson(id){M.l=id;drawLesson()},start,next(){S.n++;drawQ()},self(ok){const c=S.q[S.n];if(ok)S.sc++;else S.bad.push({q:c.q,ans:c.m});S.n++;drawQ()},exit(){if(MN.onExit)return MN.onExit();try{Mimi.drawJa()}catch(e){location.reload()}},openGroup(id){const l=window.MINNA_L.find(x=>x.id===id);if(!l)return;M.lang=l.lang||'ja';M.l=id;M.direct=1;drawLesson()},openLang(l){M.direct=0;M.lang=l;M.v='home';drawHome()},open(){M.direct=0;M.lang='ja';M.v='home';drawHome()}};
/* Gắn nút vào trang chủ 日本語 */
const wrap=()=>{if(!window.Mimi||Mimi.__mn)return;const o=Mimi.drawJa;Mimi.__mn=1;Mimi.drawJa=function(){o.apply(this,arguments);const s=sec();if(!s||!window.MINNA_L.length)return;const L=window.MINNA_L,done=Math.round(L.reduce((a,l)=>a+lessPct(l),0)/L.length);
  const box=`<div class="mm-box"><h3>📖 Minna no Nihongo — Bài tập</h3><p style="font-size:14px;font-weight:700;opacity:.8;line-height:1.5">${L.length} mục bài tập (trắc nghiệm trợ từ, gõ đáp án, sắp xếp câu, tự viết có câu mẫu). Điểm trung bình hiện tại: ${done}%.</p><div class="mm-extra"><button class="mm-btn pri" onclick="MN.open()">Bắt đầu luyện</button></div></div>`;
  const first=s.querySelector('.mm-box');first?first.insertAdjacentHTML('beforebegin',box):s.insertAdjacentHTML('beforeend',box)}};
wrap();window.addEventListener('load',()=>setTimeout(wrap,0));
})();
