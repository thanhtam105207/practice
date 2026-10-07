/* ✍️ Luyện viết v2 – Hanzi Writer: xem mẫu từng nét → viết theo (có chấm đúng/sai từng nét) → tự viết.
   Chữ Hán: dữ liệu mặc định • Kana: kana-json • Kanji JP: hanzi-writer-data-jp. Lần đầu cần mạng, sau đó service worker lưu lại để dùng offline. */
(()=>{
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=m=>{try{showToast(m)}catch(e){alert(m)}};
const pairs=s=>s.trim().split(/\s+/).reduce((a,x,i,r)=>i%2?a:a.concat([[x,r[i+1]]]),[]);
const HIRA=pairs('あ a い i う u え e お o か ka き ki く ku け ke こ ko さ sa し shi す su せ se そ so た ta ち chi つ tsu て te と to な na に ni ぬ nu ね ne の no は ha ひ hi ふ fu へ he ほ ho ま ma み mi む mu め me も mo や ya ゆ yu よ yo ら ra り ri る ru れ re ろ ro わ wa を wo ん n');
const KATA=pairs('ア a イ i ウ u エ e オ o カ ka キ ki ク ku ケ ke コ ko サ sa シ shi ス su セ se ソ so タ ta チ chi ツ tsu テ te ト to ナ na ニ ni ヌ nu ネ ne ノ no ハ ha ヒ hi フ fu ヘ he ホ ho マ ma ミ mi ム mu メ me モ mo ヤ ya ユ yu ヨ yo ラ ra リ ri ル ru レ re ロ ro ワ wa ヲ wo ン n');
let S=null,hw=null,run=0,hwLoad=null;
const xp=r=>{try{window.ent303AwardXP&&window.ent303AwardXP('write_done',r)}catch(e){}};
const loader=(char,ok,no)=>{const u=S.kind==='kana'?`https://cdn.jsdelivr.net/gh/ailectra/kana-json@v0.0.1/data/${char}.json`:S.kind==='ja'?`https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp@0/${char}.json`:`https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${char}.json`;fetch(u).then(r=>{if(!r.ok)throw 0;return r.json()}).then(ok).catch(no)};
document.head.insertAdjacentHTML('beforeend',`<style>#wr{position:fixed;inset:0;z-index:7000;overflow:auto;background:#fff7f8;color:#334155;padding:max(14px,env(safe-area-inset-top)) 14px max(20px,env(safe-area-inset-bottom))}body[data-mode=dark] #wr{background:#15162e;color:#e5e7eb}
#wr .wt{display:flex;align-items:center;justify-content:space-between;gap:8px;max-width:520px;margin:0 auto}#wr h2{font-weight:900;font-size:18px}
#wr .wb{min-height:44px;padding:8px 14px;border-radius:14px;font-weight:800;font-size:14px;background:#fff1f2;color:#e11d48;border:1px solid #fecdd3}#wr .wb.pri{background:linear-gradient(135deg,#f43f5e,#fb923c);color:#fff;border:0}#wr .wb.on{background:#f43f5e;color:#fff}
#wr .ws{display:flex;gap:6px;overflow-x:auto;max-width:520px;margin:12px auto;padding-bottom:6px}#wr .ws button{flex:none;min-width:48px;height:48px;border-radius:12px;font-size:24px;background:#fff;border:1px solid #fecdd3;color:#334155}#wr .ws button.on{background:#f43f5e;color:#fff}#wr .ws button.dn:after{content:"✓";font-size:10px;vertical-align:top;color:#16a34a}
#wr .wbox{position:relative;width:min(320px,86vw);aspect-ratio:1;margin:0 auto;background:#fff;border:2px solid #f43f5e;border-radius:12px;touch-action:none;background-image:linear-gradient(45deg,transparent 49.6%,#f43f5e33 50%,transparent 50.4%),linear-gradient(-45deg,transparent 49.6%,#f43f5e33 50%,transparent 50.4%),linear-gradient(#f43f5e33,#f43f5e33),linear-gradient(#f43f5e33,#f43f5e33);background-size:100% 100%,100% 100%,1px 100%,100% 1px;background-position:0 0,0 0,center,center;background-repeat:no-repeat}body[data-mode=dark] #wr .wbox{background-color:#1e2040}
#wr .wbox svg{position:absolute;inset:0;width:100%;height:100%}
#wr .wr{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:520px;margin:12px auto}#wr .wm{text-align:center;font-size:13px;opacity:.75;max-width:520px;margin:6px auto}
#wr .wf{max-width:520px;margin:10px auto;min-height:48px;padding:10px 14px;border-radius:14px;font-weight:800;text-align:center;background:#f1f5f9;color:#334155}#wr .wf.ok{background:#dcfce7;color:#166534}#wr .wf.bad{background:#fee2e2;color:#991b1b}#wr .wf.info{background:#e0f2fe;color:#075985}</style>`);
const glyph=()=>S.items[S.i],fb=(t,c)=>{const f=$('wf');if(f){f.className='wf '+(c||'');f.innerHTML=t}};
function render(){const it=glyph(),m=S.mode;
 $('wr').innerHTML=`<div class="wt"><button class="wb" onclick="Write.close()">← Đóng</button><h2>${esc(S.title)}</h2><span style="width:70px"></span></div>
<div class="ws">${S.items.map((x,k)=>`<button class="${k===S.i?'on':''} ${S.done[x[0]]?'dn':''}" onclick="Write.pick(${k})">${esc(x[0])}</button>`).join('')}</div>
<div class="wm"><b style="font-size:20px">${esc(it[1]||'')}</b> ${it[2]?'· '+esc(it[2]):''} <span id="wn"></span></div>
<div class="wbox" id="wh"></div><div class="wf info" id="wf">Đang tải dữ liệu nét…</div>
<div class="wr"><button class="wb ${m==='demo'?'on':''}" onclick="Write.mode('demo')">👀 1. Xem mẫu</button><button class="wb ${m==='trace'?'on':''}" onclick="Write.mode('trace')">✍️ 2. Viết theo</button><button class="wb ${m==='free'?'on':''}" onclick="Write.mode('free')">🙈 3. Tự viết</button></div>
<div class="wr"><button class="wb" onclick="Write.step(-1)">← Trước</button><button class="wb" onclick="Write.mode(Write.cur())">🔁 Làm lại</button><button class="wb" onclick="Write.say()">🔊 Nghe</button><button class="wb pri" onclick="Write.step(1)">Chữ tiếp →</button></div>
<p class="wm">Viết từng nét đúng thứ tự: sai nét sẽ báo ngay, sai 3 lần sẽ gợi ý nét đúng. Lần đầu cần mạng để tải nét; sau đó dùng offline được.</p>`;
 start()}
function start(){const id=++run,h=$('wh'),c=glyph()[0];h.innerHTML='';hw=null;
 if(!window.HanziWriter)return loadHW().then(()=>id===run&&start()).catch(()=>fb('⚠️ Chưa tải được thư viện nét. Hãy bật mạng rồi bấm “Làm lại”.','bad'));
 const w=h.clientWidth||300;
 try{hw=HanziWriter.create(h,c,{width:w,height:w,padding:14,charDataLoader:loader,showOutline:true,strokeColor:'#be123c',outlineColor:document.body.dataset.mode==='dark'?'#475569':'#cbd5e1',drawingColor:'#e11d48',highlightColor:'#16a34a',strokeAnimationSpeed:1.2,delayBetweenStrokes:250,showHintAfterMisses:3,onLoadCharDataSuccess:d=>{if(id!==run)return;S.n=d.strokes.length;const n=$('wn');if(n)n.textContent='· '+S.n+' nét';Write.mode(S.mode)},onLoadCharDataError:()=>fb('⚠️ Chưa có dữ liệu nét cho chữ này (hoặc đang offline).','bad')})}catch(e){fb('⚠️ Lỗi tải nét','bad')}}
function demo(){const id=++run,n=S.n;hw.cancelQuiz();hw.hideCharacter();hw.showOutline();let i=0;
 const nx=()=>{if(id!==run)return;if(i>=n){fb(`✅ Đã xong ${n} nét. Bấm “2. Viết theo” để tự viết.`,'ok');return setTimeout(()=>{if(id===run&&S.mode==='demo'){hw.hideCharacter();demo()}},1800)}
  fb(`Nét ${i+1}/${n}`,'info');hw.animateStroke(i,{onComplete:()=>{i++;setTimeout(nx,350)}})};nx()}
function quiz(outline){const id=++run;hw.hideCharacter();outline?hw.showOutline():hw.hideOutline();fb(outline?'Viết theo nét mờ, đúng thứ tự từ nét 1.':'Tự viết, không có nét mờ. Đúng thứ tự nhé!','info');
 hw.quiz({showHintAfterMisses:3,leniency:1.2,onCorrectStroke:d=>{if(id===run)fb(`✅ Đúng nét ${d.strokeNum+1}/${S.n}${d.strokesRemaining?` — còn ${d.strokesRemaining} nét`:''}`,'ok')},
  onMistake:d=>{if(id===run)fb(`❌ Chưa đúng. Cần viết nét thứ ${d.strokeNum+1}/${S.n} (sai ${d.mistakesOnStroke} lần)${d.mistakesOnStroke>=3?' — nét đúng đang sáng lên':''}`,'bad')},
  onComplete:d=>{if(id!==run)return;const m=d.totalMistakes,c=glyph()[0];if(m<=2){if(!S.done[c]){S.done[c]=1;try{localStorage.setItem('PE_WRITE',JSON.stringify(S.done))}catch(e){}xp('w:'+c)}document.querySelectorAll('#wr .ws button')[S.i]?.classList.add('dn')}
   fb(m===0?'🎉 Hoàn hảo! Đúng hết các nét, đúng thứ tự.':m<=2?`✅ Đạt! Sai ${m} lần. Thử thêm lần nữa cho chắc nhé.`:`💪 Xong nhưng sai ${m} lần — chưa tính là thuộc. Xem mẫu lại rồi viết lại nhé.`,m<=2?'ok':'bad')}})}
function loadHW(){if(window.HanziWriter)return Promise.resolve();return hwLoad||(hwLoad=new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';s.onload=ok;s.onerror=()=>{hwLoad=null;no()};document.head.appendChild(s)}))}
function open(o){S=Object.assign({i:0,mode:'demo',done:{}},o);try{S.done=JSON.parse(localStorage.getItem('PE_WRITE')||'{}')}catch(e){}let w=$('wr');if(!w){w=document.createElement('div');w.id='wr';document.body.appendChild(w)}w.style.display='block';document.body.style.overflow='hidden';history.pushState({s:'wr'},'');render()}
function han(li){const H=(window.HSK1||{}).lessons||[],ls=li==null?H:[H[li]],m=new Map();
 ls.forEach(l=>l.w.forEach(w=>[...w[0]].forEach(ch=>{if(!/[\u4e00-\u9fff]/.test(ch)||m.has(ch))return;m.set(ch,w[0].length===1?[ch,w[1],w[2]]:[ch,'',w[0]+' ('+w[1]+') '+w[2]])})));
 open({title:li==null?'Viết chữ Hán':'Viết chữ · Bài '+H[li].n,items:[...m.values()],lang:'zh-CN',kind:'zh'})}
function kana(t){open({title:t==='kata'?'Viết Katakana':'Viết Hiragana',items:(t==='kata'?KATA:HIRA).map(x=>[x[0],x[1],'']),lang:'ja-JP',kind:'kana'})}
function kanji(list,title){open({title:title||'Viết Kanji',items:list,lang:'ja-JP',kind:'ja'})}
window.Write={han,kana,kanji,cur:()=>S&&S.mode,
 say(){const t=glyph()[0];if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang=S.lang;u.rate=.8;speechSynthesis.speak(u)},
 close(){run++;const w=$('wr');if(w)w.style.display='none';document.body.style.overflow='';if(history.state&&history.state.s==='wr')history.back()},
 pick(k){S.i=k;S.mode='demo';render()},step(d){S.i=(S.i+d+S.items.length)%S.items.length;S.mode='demo';render()},
 mode(m){S.mode=m;document.querySelectorAll('#wr .wr:nth-of-type(1) .wb').forEach((b,k)=>b.classList.toggle('on',['demo','trace','free'][k]===m));if(!hw||!S.n)return;try{hw.cancelQuiz()}catch(e){}if(m==='demo')demo();else quiz(m==='trace')}};
window.addEventListener('popstate',()=>{const w=$('wr');if(w&&w.style.display==='block'&&!(history.state&&history.state.s==='wr')){run++;w.style.display='none';document.body.style.overflow=''}});
})();
