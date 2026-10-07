/* ✍️ Luyện viết: tô theo chữ mờ (offline) + xem thứ tự nét (cần mạng, Hanzi Writer). Dùng cho chữ Hán, Hiragana, Katakana. */
(()=>{
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=m=>{try{showToast(m)}catch(e){alert(m)}};
const pairs=s=>s.trim().split(/\s+/).reduce((a,x,i,r)=>i%2?a:a.concat([[x,r[i+1]]]),[]);
const HIRA=pairs('あ a い i う u え e お o か ka き ki く ku け ke こ ko さ sa し shi す su せ se そ so た ta ち chi つ tsu て te と to な na に ni ぬ nu ね ne の no は ha ひ hi ふ fu へ he ほ ho ま ma み mi む mu め me も mo や ya ゆ yu よ yo ら ra り ri る ru れ re ろ ro わ wa を wo ん n');
const KATA=pairs('ア a イ i ウ u エ e オ o カ ka キ ki ク ku ケ ke コ ko サ sa シ shi ス su セ se ソ so タ ta チ chi ツ tsu テ te ト to ナ na ニ ni ヌ nu ネ ne ノ no ハ ha ヒ hi フ fu ヘ he ホ ho マ ma ミ mi ム mu メ me モ mo ヤ ya ユ yu ヨ yo ラ ra リ ri ル ru レ re ロ ro ワ wa ヲ wo ン n');
let S=null,drawing=false,last=null,hw=null,hwLoad=null;
const xp=(r)=>{try{window.ent303AwardXP&&window.ent303AwardXP('write_done',r)}catch(e){}};
document.head.insertAdjacentHTML('beforeend',`<style>#wr{position:fixed;inset:0;z-index:7000;overflow:auto;background:#fff7f8;color:#334155;padding:max(14px,env(safe-area-inset-top)) 14px max(20px,env(safe-area-inset-bottom))}body[data-mode=dark] #wr{background:#15162e;color:#e5e7eb}
#wr .wt{display:flex;align-items:center;justify-content:space-between;gap:8px;max-width:520px;margin:0 auto}#wr h2{font-weight:900;font-size:18px}
#wr .wb{min-height:44px;padding:8px 14px;border-radius:14px;font-weight:800;font-size:14px;background:#fff1f2;color:#e11d48;border:1px solid #fecdd3}#wr .wb.pri{background:linear-gradient(135deg,#f43f5e,#fb923c);color:#fff;border:0}#wr .wb.on{outline:2px solid #f43f5e}
#wr .ws{display:flex;gap:6px;overflow-x:auto;max-width:520px;margin:12px auto;padding-bottom:6px}#wr .ws button{flex:none;min-width:48px;height:48px;border-radius:12px;font-size:24px;background:#fff;border:1px solid #fecdd3}#wr .ws button.on{background:#f43f5e;color:#fff}#wr .ws button.dn:after{content:"✓";font-size:10px;vertical-align:top;color:#16a34a}
#wr .wbox{position:relative;width:min(320px,86vw);aspect-ratio:1;margin:0 auto;background:#fff;border:2px solid #f43f5e;border-radius:12px;touch-action:none}body[data-mode=dark] #wr .wbox{background:#1e2040}
#wr canvas,#wr .wh{position:absolute;inset:0;width:100%;height:100%;border-radius:10px}#wr .wh{display:none}
#wr .wr{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:520px;margin:12px auto}#wr .wm{text-align:center;font-size:13px;opacity:.7;max-width:520px;margin:6px auto}</style>`);
function glyph(){return S.items[S.i]}
function grid(g,w){g.clearRect(0,0,w,w);g.strokeStyle='#f43f5e55';g.lineWidth=1;g.setLineDash([5,5]);g.beginPath();g.moveTo(0,0);g.lineTo(w,w);g.moveTo(w,0);g.lineTo(0,w);g.moveTo(w/2,0);g.lineTo(w/2,w);g.moveTo(0,w/2);g.lineTo(w,w/2);g.stroke();g.setLineDash([])}
function paint(){const c=$('wc'),g=c.getContext('2d'),w=c.clientWidth,d=window.devicePixelRatio||1;c.width=c.height=w*d;g.setTransform(d,0,0,d,0,0);grid(g,w);
 if(S.guide){g.fillStyle=document.body.dataset.mode==='dark'?'#ffffff30':'#00000020';g.font=`${w*.78}px "KaiTi","STKaiti","Noto Serif CJK SC","Noto Serif CJK JP","Hiragino Mincho ProN","Yu Mincho",serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(glyph()[0],w/2,w/2+w*.04)}
 const o=$('wo'),h=o.getContext('2d');o.width=o.height=w*d;h.setTransform(d,0,0,d,0,0);h.lineWidth=w*.035;h.lineCap=h.lineJoin='round';h.strokeStyle=document.body.dataset.mode==='dark'?'#fda4af':'#be123c'}
function pos(e){const r=$('wo').getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
function bind(){const o=$('wo');o.onpointerdown=e=>{drawing=true;last=pos(e);o.setPointerCapture(e.pointerId);S.dirty=1;const h=o.getContext('2d');h.beginPath();h.moveTo(...last);h.lineTo(last[0]+.1,last[1]);h.stroke()};
 o.onpointermove=e=>{if(!drawing)return;const p=pos(e),h=o.getContext('2d');h.beginPath();h.moveTo(...last);h.lineTo(...p);h.stroke();last=p};
 o.onpointerup=o.onpointercancel=()=>{drawing=false}}
function say(){const t=glyph()[0];if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang=S.lang;u.rate=.8;speechSynthesis.speak(u)}
function render(){const it=glyph(),done=S.done;
 $('wr').innerHTML=`<div class="wt"><button class="wb" onclick="Write.close()">← Đóng</button><h2>${esc(S.title)}</h2><span style="width:70px"></span></div>
<div class="ws">${S.items.map((x,k)=>`<button class="${k===S.i?'on':''} ${done[x[0]]?'dn':''}" onclick="Write.pick(${k})">${esc(x[0])}</button>`).join('')}</div>
<div class="wm"><b style="font-size:20px">${esc(it[1]||'')}</b> ${it[2]?'· '+esc(it[2]):''}</div>
<div class="wbox"><div class="wh" id="wh"></div><canvas id="wc"></canvas><canvas id="wo"></canvas></div>
<div class="wr"><button class="wb" onclick="Write.clear()">🧽 Xóa</button><button class="wb ${S.guide?'on':''}" onclick="Write.guide()">${S.guide?'👁 Đang tô theo':'🙈 Tự viết (ẩn mẫu)'}</button><button class="wb" onclick="Write.say()">🔊 Nghe</button><button class="wb" onclick="Write.anim()">🎬 Thứ tự nét</button></div>
<div class="wr"><button class="wb" onclick="Write.step(-1)">← Trước</button><button class="wb pri" onclick="Write.ok()">✅ Viết xong</button><button class="wb" onclick="Write.step(1)">Sau →</button></div>
<p class="wm">Tô theo chữ mờ bằng ngón tay hoặc chuột. “Thứ tự nét” cần có mạng; tô theo thì dùng offline được.</p>`;
 requestAnimationFrame(()=>{paint();bind()})}
function loadHW(){if(window.HanziWriter)return Promise.resolve();return hwLoad||(hwLoad=new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';s.onload=ok;s.onerror=()=>{hwLoad=null;no()};document.head.appendChild(s)}))}
function start(o){S=Object.assign({i:0,guide:true,done:{}},o);try{S.done=JSON.parse(localStorage.getItem('PE_WRITE')||'{}')}catch(e){}let w=$('wr');if(!w){w=document.createElement('div');w.id='wr';document.body.appendChild(w)}w.style.display='block';document.body.style.overflow='hidden';history.pushState({s:'wr'},'');render()}
function han(li){const H=(window.HSK1||{}).lessons||[],ls=li==null?H:[H[li]],m=new Map();
 ls.forEach(l=>l.w.forEach(w=>[...w[0]].forEach(ch=>{if(!/[\u4e00-\u9fff]/.test(ch)||m.has(ch))return;m.set(ch,w[0].length===1?[ch,w[1],w[2]]:[ch,'',w[0]+' ('+w[1]+') '+w[2]])})));
 start({title:li==null?'Viết chữ Hán':'Viết chữ · Bài '+H[li].n,items:[...m.values()],lang:'zh-CN',key:'zh'})}
function kana(t){start({title:t==='kata'?'Viết Katakana':'Viết Hiragana',items:(t==='kata'?KATA:HIRA).map(x=>[x[0],x[1],'']),lang:'ja-JP',key:t})}
window.Write={han,kana,say,
 close(){const w=$('wr');if(w)w.style.display='none';document.body.style.overflow='';if(history.state&&history.state.s==='wr')history.back()},
 pick(k){S.i=k;render()},step(d){S.i=(S.i+d+S.items.length)%S.items.length;render()},clear(){paint()},guide(){S.guide=!S.guide;render()},
 ok(){const c=glyph()[0];if(!S.dirty)return toast('Hãy viết thử trước nha ✍️');if(!S.done[c]){S.done[c]=1;try{localStorage.setItem('PE_WRITE',JSON.stringify(S.done))}catch(e){}xp('w:'+c)}S.dirty=0;S.step?0:0;Write.step(1)},
 anim(){const h=$('wh');h.style.display='block';h.innerHTML='<div class="wm" style="padding-top:40%">Đang tải…</div>';loadHW().then(()=>{h.innerHTML='';const w=$('wc').clientWidth;try{hw=HanziWriter.create(h,glyph()[0],{width:w,height:w,padding:12,strokeColor:'#be123c',radicalColor:'#16a34a',delayBetweenLoops:800,onLoadCharDataError:()=>{h.innerHTML='<div class="wm" style="padding-top:40%">Chưa có dữ liệu nét cho chữ này</div>'}});hw.loopCharacterAnimation()}catch(e){h.style.display='none'}h.onclick=()=>{h.style.display='none';h.innerHTML=''}}).catch(()=>{h.style.display='none';toast('Cần kết nối mạng để xem thứ tự nét')})}};
window.addEventListener('popstate',()=>{const w=$('wr');if(w&&w.style.display==='block'&&!(history.state&&history.state.s==='wr')){w.style.display='none';document.body.style.overflow=''}});
})();
