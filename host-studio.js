/* Host Studio — host thêm nội dung bất kỳ (từ vựng, bài tập, ghi chú, ảnh/file, JSON tùy ý) cho English / 中文 / 日本語; người học thấy ngay (Realtime + lưu offline).
   Bảng: host_items (supabase-content.sql). Quyền ghi kiểm tra ở SERVER bằng is_host(). */
(()=>{
const LS=localStorage,$=id=>document.getElementById(id),CK='PE_HOSTITEMS',SK='PE_HOSTSEEN';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=m=>{try{showToast(m)}catch(e){alert(m)}};
const LN={en:'🇬🇧 English',zh:'🇨🇳 中文',ja:'🇯🇵 日本語'},KD={vocab:'📚 Từ vựng',exercise:'📝 Bài tập',note:'📣 Ghi chú / thông báo',file:'🖼️ Ảnh / file',custom:'🧩 Tùy ý (JSON)'};
let items=[],sb=null,host=false,applied={},ch=null,started=0,tab='feed';
try{items=JSON.parse(LS.getItem(CK)||'[]')}catch(e){}
const save=()=>{try{LS.setItem(CK,JSON.stringify(items))}catch(e){}};
const isH=()=>{try{return host||(window.ENT8&&ENT8.isHost&&ENT8.isHost())}catch(e){return host}};

/* ---------- Áp nội dung vào từng môn ---------- */
const KEYF=x=>(x.word||x.phrase||x.title||'').toLowerCase().trim();
function undo(id){const u=applied[id];if(!u)return;try{u()}catch(e){}delete applied[id]}
function applyVocab(it){const d=it.data||{},ws=(d.words||[]).filter(w=>w&&w[0]);if(!ws.length)return;
 if(it.lang==='ja'&&window.JA){const {W,ALL}=JA.data();let g=ALL.find(x=>x._host&&x.t===it.folder);if(!g){g={l:'⭐ Host',t:it.folder||'Từ của Host',e:'⭐',w:[],_host:1};ALL.push(g)}
  const add=[];ws.forEach(w=>{if(W.some(x=>x[0]===w[0]))return;const a=[w[0],w[1]||'',w[2]||'',w[3]||'⭐'];a._hid=it.id;g.w.push(a);const b=a.concat([g.t]);b._hid=it.id;W.push(b);add.push(a)});if(!g.w.length){const i=ALL.indexOf(g);if(i>=0)ALL.splice(i,1);return}
  applied[it.id]=()=>{g.w=g.w.filter(x=>x._hid!==it.id);if(!g.w.length){const i=ALL.indexOf(g);if(i>=0)ALL.splice(i,1)}for(let i=W.length-1;i>=0;i--)if(W[i]._hid===it.id)W.splice(i,1)}}
 else if(it.lang==='zh'&&window.HSK1&&window.ZH){const H=HSK1.lessons;let g=H.find(x=>x._host&&x.t===it.folder);if(!g){g={n:'⭐',t:it.folder||'Từ của Host',vi:'Từ do Host thêm',w:[],_host:1};H.push(g)}
  const all=H.flatMap(l=>l.w);ws.forEach(w=>{if(all.some(x=>x[0]===w[0]))return;const a=[w[0],w[1]||'',w[2]||'',w[3]||''];a._hid=it.id;g.w.push(a)});if(!g.w.length){const i=H.indexOf(g);if(i>=0)H.splice(i,1);return}ZH.reload();
  applied[it.id]=()=>{g.w=g.w.filter(x=>x._hid!==it.id);if(!g.w.length){const i=H.indexOf(g);if(i>=0)H.splice(i,1)}ZH.reload()}}
 else if(it.lang==='en'&&typeof unitsData!=='undefined'){const u=String(it.folder||'').replace(/\D/g,'')||'1',U=unitsData[u];if(!U)return;U.vocab=U.vocab||[];
  const have=new Set(['vocab','idioms','grammar'].flatMap(k=>(U[k]||[]).filter(x=>x._hid!==it.id).map(KEYF)));
  ws.forEach(w=>{const o={word:w[0],def:w[1]||'',pos:w[2]||'',phonetic:w[3]||'',custom:true,host:true,_hid:it.id};if(have.has(KEYF(o)))return;U.vocab.push(o)});
  try{LS.setItem('ENT303_USER_UNITS_DATA',JSON.stringify(unitsData))}catch(e){}try{if(String(currentUnit)===u)switchUnit(currentUnit)}catch(e){}
  applied[it.id]=()=>{U.vocab=U.vocab.filter(x=>x._hid!==it.id);try{LS.setItem('ENT303_USER_UNITS_DATA',JSON.stringify(unitsData))}catch(e){}}}}
function rebuildEx(lang){const L=window.MINNA_L=window.MINNA_L||[],id='HOST-'+lang,i=L.findIndex(x=>x.id===id);if(i>=0)L.splice(i,1);
 const by={};items.filter(x=>x.kind==='exercise'&&x.lang===lang).forEach(x=>{(by[x.folder||'Bài tập mới']=by[x.folder||'Bài tập mới']||[]).push(...((x.data||{}).items||[]))});
 const s=Object.keys(by).map(t=>({t:'⭐ '+t,i:by[t]}));if(s.length)L.push({id,t:'⭐ Bài tập do Host thêm ('+({en:'English',zh:'中文',ja:'日本語'}[lang])+')',lang,s})}
function apply(it){undo(it.id);if(it.kind==='vocab')applyVocab(it);if(it.kind==='exercise')rebuildEx(it.lang)}
function remove(id){const it=items.find(x=>x.id===id);undo(id);items=items.filter(x=>x.id!==id);if(it&&it.kind==='exercise')rebuildEx(it.lang)}
const unread=()=>{const s=LS.getItem(SK)||'';return items.filter(x=>(x.created_at||'')>s).length};

/* ---------- Đồng bộ ---------- */
async function sync(){if(!sb)return;try{const{data,error}=await sb.from('host_items').select('*').order('created_at',{ascending:true});if(error||!data)return;
 const ids=new Set(data.map(x=>x.id));items.filter(x=>!ids.has(x.id)).forEach(x=>remove(x.id));
 data.forEach(x=>{const o=items.find(y=>y.id===x.id);if(!o||o.updated_at!==x.updated_at){const i=items.findIndex(y=>y.id===x.id);i>=0?items[i]=x:items.push(x);apply(x)}});save();fab()}catch(e){console.warn(e)}}
function live(){if(!sb||ch||!sb.channel)return;try{ch=sb.channel('host_items_live').on('postgres_changes',{event:'*',schema:'public',table:'host_items'},p=>{
 if(p.eventType==='DELETE'){remove(p.old.id)}else{const x=p.new,i=items.findIndex(y=>y.id===x.id);i>=0?items[i]=x:items.push(x);apply(x);if(p.eventType==='INSERT'&&!isH())toast('✨ Host vừa thêm: '+(KD[x.kind]||x.kind)+(x.folder?' · '+x.folder:''))}
 save();fab();if($('hs-ov'))draw()}).subscribe()}catch(e){console.warn(e)}}

/* ---------- Giao diện ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>#hs-fab{position:fixed;right:12px;bottom:calc(86px + env(safe-area-inset-bottom,0px));z-index:99990;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#6366f1);color:#fff;font-size:22px;box-shadow:0 6px 18px #0004}#hs-fab b{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:99px;font-size:11px;min-width:18px;padding:0 4px}
#hs-ov{position:fixed;inset:0;z-index:100000;background:#0007;display:flex;align-items:flex-end}#hs-sheet{background:#fff;color:#1f2937;width:100%;max-height:92vh;overflow:auto;border-radius:24px 24px 0 0;padding:16px 16px calc(24px + env(safe-area-inset-bottom,0px))}body[data-mode=dark] #hs-sheet{background:#1e2040;color:#e5e7eb}
.hs-c{border:1px solid #8884;border-radius:18px;padding:12px;margin:10px 0}.hs-b{padding:10px 14px;border-radius:14px;background:#fdf2f8;color:#be185d;font-weight:800;font-size:13px;min-height:44px}.hs-b.p{background:linear-gradient(135deg,#ec4899,#6366f1);color:#fff}.hs-in{width:100%;padding:10px;border-radius:12px;border:2px solid #8884;font-size:15px;background:transparent;color:inherit;margin:4px 0}.hs-m{font-size:12px;opacity:.65}.hs-t{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.hs-t .hs-b.on{background:#be185d;color:#fff}</style>`);
function fab(){let b=$('hs-fab');if(!b){document.body.insertAdjacentHTML('beforeend','<button id="hs-fab" aria-label="Nội dung của Host" onclick="HS.open()">⭐</button>');b=$('hs-fab')}const n=unread();b.innerHTML='⭐'+(n?`<b>${n>99?'99+':n}</b>`:'')}
function fileCard(x){const d=x.data||{},u=d.url||'';const media=!u?'':/image\//.test(d.mime||'')||/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(u)?`<img src="${esc(u)}" style="max-width:100%;border-radius:12px;margin-top:6px">`:/audio\//.test(d.mime||'')||/\.(mp3|m4a|wav|ogg)(\?|$)/i.test(u)?`<audio controls src="${esc(u)}" style="width:100%;margin-top:6px"></audio>`:`<a class="hs-b" style="display:inline-block;margin-top:6px" href="${esc(u)}" target="_blank" rel="noopener">⬇ Mở / tải file</a>`;return media}
function card(x){const d=x.data||{};let b='';
 if(x.kind==='note')b=`<b>${esc(d.title||'Thông báo')}</b><div style="white-space:pre-wrap;margin-top:4px">${esc(d.text||'')}</div>${fileCard(x)}`;
 else if(x.kind==='file')b=`<b>${esc(d.title||'File')}</b><div style="white-space:pre-wrap">${esc(d.text||'')}</div>${fileCard(x)}`;
 else if(x.kind==='vocab')b=`<b>📚 ${(d.words||[]).length} từ mới</b> <span class="hs-m">→ đã vào mục từ vựng${x.folder?' "'+esc(x.folder)+'"':''}</span><div class="hs-m" style="margin-top:4px">${(d.words||[]).slice(0,6).map(w=>esc(w[0])).join(' · ')}${(d.words||[]).length>6?'…':''}</div>`;
 else if(x.kind==='exercise')b=`<b>📝 ${((d.items||[]).length)} câu bài tập</b> <span class="hs-m">${esc(x.folder||'')}</span><div style="margin-top:6px"><button class="hs-b p" onclick="HS.play('${x.lang}')">Làm bài ngay</button></div>`;
 else b=`<b>🧩 ${esc(d.title||'Nội dung')}</b><div style="white-space:pre-wrap">${esc(d.text||JSON.stringify(d,null,1).slice(0,600))}</div>${fileCard(x)}`;
 return `<div class="hs-c"><div class="hs-m">${LN[x.lang]||x.lang} · ${KD[x.kind]||x.kind} · ${new Date(x.created_at||Date.now()).toLocaleDateString('vi-VN')}${isH()?` <button class="hs-m" style="color:#ef4444" onclick="HS.del('${x.id}')">🗑 xóa</button>`:''}</div>${b}</div>`}
let flt='all';
function draw(){const ov=$('hs-ov');if(!ov)return;const hh=isH(),list=[...items].reverse().filter(x=>flt==='all'||x.lang===flt);
 $('hs-sheet').innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-weight:900;font-size:18px">⭐ Nội dung từ Host</h3><button class="hs-b" onclick="HS.close()">Đóng</button></div>
 <div class="hs-t">${[['all','Tất cả'],['en','🇬🇧'],['zh','🇨🇳'],['ja','🇯🇵']].map(([k,l])=>`<button class="hs-b ${flt===k?'on':''}" onclick="HS.flt('${k}')">${l}</button>`).join('')}${hh?`<button class="hs-b ${tab==='add'?'on':''}" onclick="HS.tab('add')">➕ Thêm nội dung</button>`:''}</div>
 <div id="hs-body">${tab==='add'&&hh?composer():(list.length?list.map(card).join(''):'<p class="hs-m">Chưa có nội dung nào. Khi Host thêm từ vựng, bài tập hay thông báo, bạn sẽ thấy ngay ở đây.</p>')}</div>`}
function composer(){return `<div class="hs-c"><div class="hs-m">Chỉ host thấy mục này. Đăng xong, mọi người thấy ngay.</div>
 <select id="hc-l" class="hs-in" onchange="HS.hint()">${Object.entries(LN).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>
 <select id="hc-k" class="hs-in" onchange="HS.hint()">${Object.entries(KD).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>
 <input id="hc-f" class="hs-in" placeholder="Nhóm / bài (English: số Unit, ví dụ 3)">
 <input id="hc-t" class="hs-in" placeholder="Tiêu đề (cho ghi chú, file, tùy ý)">
 <textarea id="hc-x" class="hs-in" rows="8" placeholder=""></textarea><div id="hc-h" class="hs-m"></div>
 <input id="hc-u" class="hs-in" placeholder="Link ảnh/file (tùy chọn) hoặc chọn file bên dưới"><input id="hc-file" type="file" class="hs-in">
 <button class="hs-b p" style="width:100%;margin-top:8px" id="hc-go" onclick="HS.post()">📤 Đăng cho tất cả</button></div>`}
const HINT={vocab:{ja:'Mỗi dòng một từ:  từ | cách đọc | nghĩa | emoji (tùy chọn)\nví dụ:  さくら | sakura | hoa anh đào | 🌸',zh:'Mỗi dòng một từ:  chữ Hán | pinyin | nghĩa | Hán Việt (tùy chọn)\nví dụ:  学校 | xuéxiào | trường học | học hiệu',en:'Mỗi dòng một từ:  word | nghĩa | loại từ | phiên âm (tùy chọn)\nví dụ:  etiquette | phép lịch sự | noun | /ˈetɪket/'},
 exercise:'Mỗi dòng một câu:\np: Điền trợ từ {は} vào câu → mỗi {…} thành 1 câu hỏi\nt: câu hỏi => đáp án 1 / đáp án 2   (gõ đáp án)\nc: câu hỏi => ĐÚNG ; sai 1 ; sai 2   (trắc nghiệm, đáp án đúng ghi đầu)\nr: この / かばん / は / いくら / です / か   (sắp xếp, ghi đúng thứ tự)\nf: câu hỏi => câu mẫu   (tự viết, tự chấm)',note:'Nội dung thông báo / ghi chú…',file:'Mô tả ngắn (tùy chọn)…',custom:'Dán JSON bất kỳ, ví dụ {"text":"Hello","anything":1}'};
function hint(){const l=$('hc-l').value,k=$('hc-k').value,h=k==='vocab'?HINT.vocab[l]:HINT[k];$('hc-x').placeholder=h;$('hc-h').textContent=k==='exercise'?'Bài tập nhập theo cú pháp trên sẽ vào mục "⭐ Bài tập do Host thêm".':''}
function parseEx(txt){const out=[],errs=[];txt.split('\n').map(s=>s.trim()).filter(Boolean).forEach((l,n)=>{const m=l.match(/^([ptcfr])\s*[:：]\s*(.+)$/i);if(!m){errs.push(n+1);return}const k=m[1].toLowerCase(),b=m[2];
 if(k==='p'){/\{[^}]*\}/.test(b)?out.push(['p',b]):errs.push(n+1)}else if(k==='r'){const t=b.split(/\s*\/\s*/).filter(Boolean);t.length>1?out.push(['r',t]):errs.push(n+1)}
 else{const [q,a]=b.split(/\s*=>\s*/);if(!a){errs.push(n+1);return}if(k==='t')out.push(['t',q,a.split(/\s*\/\s*/).filter(Boolean)]);if(k==='f')out.push(['f',q,a]);if(k==='c'){const o=a.split(/\s*;\s*/).filter(Boolean);o.length>1?out.push(['c',q,o,0]):errs.push(n+1)}}});return{out,errs}}
async function post(){if(!isH()||!sb)return toast('Cần đăng nhập bằng tài khoản host');const lang=$('hc-l').value,kind=$('hc-k').value,folder=$('hc-f').value.trim(),title=$('hc-t').value.trim(),txt=$('hc-x').value.trim();let url=$('hc-u').value.trim(),mime='',data={};
 const btn=$('hc-go');btn.disabled=true;btn.textContent='Đang đăng…';const fail=m=>{toast(m);btn.disabled=false;btn.textContent='📤 Đăng cho tất cả'};
 try{const f=$('hc-file').files[0];if(f){const ext=(f.name.split('.').pop()||'bin').replace(/\W/g,''),path=Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;const r=await sb.storage.from('host-media').upload(path,f,{contentType:f.type||undefined});if(r.error)return fail('Tải file lỗi (đã chạy supabase-content.sql chưa?): '+r.error.message);url=sb.storage.from('host-media').getPublicUrl(path).data.publicUrl;mime=f.type||''}
  if(kind==='vocab'){const words=txt.split('\n').map(l=>l.split('|').map(s=>s.trim())).filter(a=>a[0]);if(!words.length)return fail('Chưa có từ nào');data={words}}
  else if(kind==='exercise'){const r=parseEx(txt);if(!r.out.length)return fail('Chưa có câu hợp lệ');if(r.errs.length&&!confirm('Dòng '+r.errs.join(', ')+' sai cú pháp và sẽ bị bỏ qua. Vẫn đăng?')){btn.disabled=false;btn.textContent='📤 Đăng cho tất cả';return}data={items:r.out}}
  else if(kind==='custom'){let o;try{o=txt?JSON.parse(txt):{}}catch(e){return fail('JSON chưa hợp lệ')}data=Object.assign({title,url,mime},o)}
  else{if(!txt&&!url&&!title)return fail('Chưa có nội dung');data={title,text:txt,url,mime}}
  const{data:row,error}=await sb.from('host_items').insert({lang,kind,folder,data}).select().single();if(error)return fail('Lỗi: '+error.message+' (chạy supabase-content.sql trong Supabase chưa?)');
  if(!items.find(x=>x.id===row.id)){items.push(row);apply(row);save()}toast('Đã đăng ✅ mọi người thấy ngay');tab='feed';fab();draw()}catch(e){fail('Lỗi: '+e.message)}}
async function del(id){if(!isH()||!sb||!confirm('Xóa nội dung này khỏi tất cả mọi người?'))return;const{error}=await sb.from('host_items').delete().eq('id',id);if(error)return toast('Lỗi: '+error.message);remove(id);save();fab();draw()}
function open(){if($('hs-ov'))return;document.body.insertAdjacentHTML('beforeend','<div id="hs-ov" onclick="if(event.target===this)HS.close()"><div id="hs-sheet"></div></div>');tab='feed';draw();const m=items.reduce((a,x)=>x.created_at>a?x.created_at:a,'');if(m)LS.setItem(SK,m);fab()}
function close(){const o=$('hs-ov');if(o)o.remove();if(window.MN)MN.root=null,MN.onExit=null;fab()}
function play(lang){const s=$('hs-sheet');s.innerHTML='<div id="hs-play"></div>';MN.root=()=>$('hs-play');MN.onExit=()=>{MN.root=null;MN.onExit=null;draw()};MN.openGroup('HOST-'+lang)}
window.HS={open,close,tab:t=>{tab=t;draw();if(t==='add')hint()},flt:k=>{flt=k;tab='feed';draw()},hint,post,del,play,items:()=>items,init(s){sb=s||sb;started=1;items.forEach(apply);fab();sync();live()}};
function boot(){fab();items.forEach(apply);const go=()=>{sb=(window.ENT8&&ENT8.sb)||null;if(sb){sync();live();started=1}};go();window.addEventListener('ent-host',()=>{host=true;if(!started)go();if($('hs-ov'))draw()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});setInterval(()=>{if(!document.hidden)sync()},90000)}
window.addEventListener('load',()=>setTimeout(boot,1300));
})();
