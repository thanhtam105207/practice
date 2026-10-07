/* Mimi UX redesign layer
 * Keeps the existing learning data/engines intact and only reorganizes navigation + presentation.
 */
(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const oldSections = ['home','list','add','flashcard','grammar','quiz','fastquiz','listenquiz','notes'];
  let redesignReady = false;

  function addStyles(){
    if($('mimi-redesign-css')) return;
    const style=document.createElement('style'); style.id='mimi-redesign-css';
    style.textContent=`
      :root{--mimi-accent:#e11d48;--mimi-accent-soft:#fff1f2;--mimi-ink:#0f172a;--mimi-muted:#64748b;--mimi-line:#e2e8f0;--mimi-bg:#fffafb}
      body{background:var(--mimi-bg)!important;color:var(--mimi-ink)!important}
      body:before{display:none!important}
      header{background:rgba(255,255,255,.94)!important;border-bottom:1px solid var(--mimi-line)!important;box-shadow:0 1px 3px rgba(15,23,42,.04)!important}
      header>div:first-child{height:68px!important;min-height:68px!important}
      header .group span{font-size:1.1rem!important}
      header .group>div:first-child{width:38px!important;height:38px!important;border-radius:12px!important}
      #unit-select{background:#f8fafc!important;border:1px solid #cbd5e1!important;color:#334155!important;border-radius:10px!important;max-width:260px}
      #unit-hero{background:#fff!important;border:1px solid var(--mimi-line)!important;border-radius:16px!important;box-shadow:0 1px 2px rgba(15,23,42,.04)!important;padding:18px 20px!important}
      #unit-hero .relative>div:first-child>.mb-1{margin:0!important}
      #unit-hero h1{font-size:1.35rem!important;color:var(--mimi-ink)!important}
      #unit-hero .px-4.py-2{background:var(--mimi-accent-soft)!important;color:var(--mimi-accent)!important;border:0!important}
      #content-area>div:not(.hidden){animation:mimiIn .22s ease}
      @keyframes mimiIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
      .mimi-section-title{font-size:1.55rem;font-weight:850;letter-spacing:-.03em;color:var(--mimi-ink)}
      .mimi-muted{color:var(--mimi-muted)}
      .mimi-card{background:#fff;border:1px solid var(--mimi-line);border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.03)}
      .mimi-primary{background:var(--mimi-accent);color:#fff;border:1px solid var(--mimi-accent);border-radius:10px;font-weight:800}
      .mimi-secondary{background:#fff;color:#334155;border:1px solid #cbd5e1;border-radius:10px;font-weight:750}
      .mimi-action{display:flex;align-items:center;gap:12px;width:100%;padding:14px;text-align:left;background:#fff;border:1px solid var(--mimi-line);border-radius:12px;transition:.16s}
      .mimi-action:hover{border-color:#fecdd3;background:#fff8f9;transform:translateY(-1px)}
      .mimi-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--mimi-accent-soft);color:var(--mimi-accent);font-size:18px;flex:none}
      .mimi-progress{height:7px;border-radius:999px;background:#e2e8f0;overflow:hidden}.mimi-progress>span{display:block;height:100%;border-radius:inherit;background:var(--mimi-accent)}
      .mimi-nav{position:fixed;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:1000;width:min(620px,calc(100% - 24px));background:rgba(255,255,255,.97);backdrop-filter:blur(16px);border:1px solid #dbe3ee;box-shadow:0 12px 35px rgba(15,23,42,.12);border-radius:16px;padding:5px}
      .mimi-nav-inner{display:grid;grid-template-columns:repeat(5,1fr);gap:3px}.mimi-nav button{min-height:54px;border:0;background:transparent;border-radius:11px;color:#64748b;font-size:11px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}.mimi-nav button i{font-size:17px}.mimi-nav button.active{background:#fff1f2;color:#e11d48}.mimi-nav button:hover{background:#f8fafc;color:#e11d48}
      #mimi-progress-section{padding-bottom:30px}
      .mimi-skill{display:grid;grid-template-columns:110px 1fr 45px;gap:12px;align-items:center}.mimi-skill+.mimi-skill{margin-top:14px}
      .mimi-learn-tabs{display:flex;gap:6px;border-bottom:1px solid var(--mimi-line);margin-bottom:18px}.mimi-learn-tabs button{padding:10px 13px;border:0;background:none;color:#64748b;font-weight:800;font-size:13px;border-bottom:2px solid transparent}.mimi-learn-tabs button.active{color:#e11d48;border-bottom-color:#e11d48}
      .mimi-learn-hub{padding-bottom:30px}.mimi-unit-card{display:block;width:100%;text-align:left;background:#fff;border:1px solid var(--mimi-line);border-radius:16px;padding:16px;transition:.16s}.mimi-unit-card:hover{border-color:#fecdd3;box-shadow:0 8px 24px rgba(15,23,42,.06);transform:translateY(-1px)}.mimi-unit-card.current{border-color:#fda4af;background:#fff8f9;box-shadow:0 0 0 2px #ffe4e6}.mimi-unit-number{font-size:11px;font-weight:900;color:#e11d48;text-transform:uppercase;letter-spacing:.12em}.mimi-content-pill{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;background:#f8fafc;border:1px solid var(--mimi-line);border-radius:12px}.mimi-content-pill b{font-size:13px}.mimi-content-pill span{font-size:12px;color:#64748b}.mimi-activity-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.mimi-activity-strip button{padding:12px;border:1px solid var(--mimi-line);border-radius:12px;background:#fff;text-align:left}.mimi-activity-strip button:hover{border-color:#fecdd3;background:#fff8f9}@media(max-width:700px){.mimi-activity-strip{grid-template-columns:1fr}.mimi-unit-card{padding:14px}}
      body:not([data-subject=zh]):not([data-subject=ja]) .bottom-nav{display:none!important}body[data-subject=zh] .mimi-nav,body[data-subject=ja] .mimi-nav{display:none!important}.mimi-hidden-compat{display:none!important}
      @media(max-width:700px){body{padding-bottom:86px!important}header>div:first-child{height:60px!important;min-height:60px!important}header .group p{display:none!important}#unit-select{max-width:160px;padding:8px!important;font-size:12px}.mimi-nav{width:calc(100% - 16px);bottom:max(7px,env(safe-area-inset-bottom));border-radius:14px}.mimi-nav button{min-height:52px}.mimi-skill{grid-template-columns:88px 1fr 38px;font-size:12px}}
    `;
    document.head.appendChild(style);
  }

  function replaceNav(){
    if($('mimi-nav')) return;
    const nav=document.createElement('nav'); nav.id='mimi-nav'; nav.className='mimi-nav safe-bottom'; nav.setAttribute('aria-label','Điều hướng chính');
    nav.innerHTML=`<div class="mimi-nav-inner">
      <button id="mimi-nav-home" onclick="MIMIUX.go('home')"><i class="fa-solid fa-house"></i><span>Hôm nay</span></button>
      <button id="mimi-nav-learn" onclick="MIMIUX.go('learn')"><i class="fa-solid fa-book-open"></i><span>Học</span></button>
      <button id="mimi-nav-practice" onclick="MIMIUX.go('practice')"><i class="fa-solid fa-brain"></i><span>Luyện</span></button>
      <button id="mimi-nav-progress" onclick="MIMIUX.go('progress')"><i class="fa-solid fa-chart-simple"></i><span>Tiến độ</span></button>
      <button id="mimi-nav-me" onclick="MIMIUX.go('me')"><i class="fa-solid fa-user"></i><span>Tôi</span></button>
    </div>`;
    document.body.appendChild(nav);
  }

  function homeMarkup(){
    const home=$('home-section'); if(!home) return;
    home.innerHTML=`
      <div class="space-y-5">
        <div class="flex justify-end"><button class="mimi-secondary px-3 py-2 text-xs" onclick="COLX.gate()">🌸 Đổi môn học</button></div>
        <section class="grid lg:grid-cols-[1.45fr_.75fr] gap-4">
          <div class="mimi-card p-5 sm:p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-extrabold uppercase tracking-[.14em] text-rose-600">HÔM NAY</p>
                <h2 class="mimi-section-title mt-1">Tiếp tục học</h2>
                <p class="text-sm text-slate-500 mt-1">Không cần chọn quá nhiều thứ. Hãy tiếp tục từ nơi bạn đang học.</p>
              </div>
              <button type="button" onclick="MIMIUX.go('learn')" class="mimi-primary px-4 py-2.5 text-sm">Tiếp tục →</button>
            </div>
            <div class="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div class="flex items-center justify-between gap-3"><div><span id="mimi-home-unit" class="text-xs font-extrabold text-rose-600">Unit hiện tại</span><h3 id="mimi-home-title" class="font-extrabold text-slate-900 mt-1">Đang học</h3></div><span id="mimi-home-count" class="text-xs font-bold text-slate-500"></span></div>
              <div class="mimi-progress mt-4"><span id="mimi-home-progress" style="width:0%"></span></div>
              <div class="flex justify-between mt-2 text-xs font-bold text-slate-500"><span id="mimi-home-learned">0 đã thuộc</span><span id="mimi-home-total">0 từ</span></div>
            </div>
          </div>
          <div class="mimi-card p-5">
            <div class="flex items-center justify-between"><div><p class="text-xs font-extrabold uppercase tracking-[.14em] text-slate-500">THÓI QUEN</p><h3 class="text-xl font-black mt-1">🔥 <span id="home-streak-number">0</span> ngày</h3></div></div>
            <div id="streak-week" class="grid grid-cols-7 gap-1.5 mt-5"></div>
            <p class="text-xs text-slate-500 mt-4">Học đều quan trọng hơn học thật nhiều trong một ngày.</p>
          </div>
        </section>

        <section class="grid sm:grid-cols-3 gap-3">
          <button class="mimi-action" onclick="MIMIUX.go('practice');setTimeout(()=>MIMIUX.review(),30)"><span class="mimi-icon"><i class="fa-solid fa-rotate"></i></span><span><b class="block text-sm">Ôn từ chưa thuộc</b><small id="mimi-review-count" class="text-xs text-slate-500">Luyện lại các từ còn yếu</small></span></button>
          <button class="mimi-action" onclick="switchSection('flashcard')"><span class="mimi-icon"><i class="fa-solid fa-clone"></i></span><span><b class="block text-sm">Flashcard</b><small class="text-xs text-slate-500">Lật thẻ nhớ nghĩa và phát âm</small></span></button>
          <button class="mimi-action" onclick="MIMIUX.go('progress')"><span class="mimi-icon"><i class="fa-solid fa-chart-line"></i></span><span><b class="block text-sm">Xem tiến độ</b><small class="text-xs text-slate-500">Biết mình đang mạnh ở đâu</small></span></button>
        </section>

        <section class="mimi-card p-5 mimi-hidden-compat">
          <div class="flex items-center justify-between gap-3"><div><p class="text-xs font-extrabold uppercase tracking-[.14em] text-slate-500">THỐNG KÊ NHANH</p><h3 class="text-lg font-extrabold mt-1">Tiến độ Unit hiện tại</h3></div><button onclick="MIMIUX.go('progress')" class="text-xs font-extrabold text-rose-600">Chi tiết →</button></div>
          <div class="grid grid-cols-3 gap-3 mt-4">
            <div class="rounded-xl bg-slate-50 border border-slate-200 p-3"><span class="text-xs text-slate-500">Tổng từ</span><b id="stat-total" class="block text-2xl font-black mt-1">0</b></div>
            <div class="rounded-xl bg-emerald-50 border border-emerald-100 p-3"><span class="text-xs text-emerald-700">Đã thuộc</span><b id="stat-learned" class="block text-2xl font-black mt-1 text-emerald-700">0</b></div>
            <div class="rounded-xl bg-amber-50 border border-amber-100 p-3"><span class="text-xs text-amber-700">Cần học</span><b id="stat-not-learned" class="block text-2xl font-black mt-1 text-amber-700">0</b></div>
          </div>
        </section>

        <section class="mimi-card p-5 flex items-start gap-3">
          <span class="mimi-icon"><i class="fa-solid fa-lightbulb"></i></span><div class="min-w-0"><p class="text-xs font-extrabold uppercase tracking-[.14em] text-slate-400">GỢI Ý NHỎ</p><p id="hq-text" class="font-bold text-slate-800 mt-1 leading-relaxed"></p><p id="hq-author" class="text-xs text-slate-400 mt-1"></p></div><button onclick="ENTX.quote(true)" class="ml-auto text-slate-400 hover:text-rose-600" title="Quote khác">↻</button>
        </section>
        <input id="profile-image-input" type="file" accept="image/*" class="hidden" onchange="handleProfileFile(event)">
        <div class="mimi-hidden-compat"><span id="welcome-name-mini"></span><span id="profile-placeholder"></span><img id="profile-image" class="hidden"><span id="lv-chip"></span><span id="lv-xp"></span><span id="lv-bar"></span><span id="streak-hint"></span></div>
      </div>`;
  }

  function addLearnTabs(){
    const list=$('list-section'), grammar=$('grammar-section');
    if(!list||!grammar||$('mimi-learn-tabs')) return;
    const wrap=document.createElement('div'); wrap.id='mimi-learn-tabs'; wrap.className='mimi-learn-tabs';
    wrap.innerHTML=`<button id="mimi-vocab-tab" class="active" onclick="MIMIUX.learnTab('vocab')">Từ vựng</button><button id="mimi-grammar-tab" onclick="MIMIUX.learnTab('grammar')">Ngữ pháp</button>`;
    list.insertBefore(wrap,list.firstChild);
    const clone=wrap.cloneNode(true); clone.removeAttribute('id'); clone.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id')); grammar.insertBefore(clone,grammar.firstChild);
    const tools=document.createElement('div'); tools.className='flex flex-wrap gap-2 mb-4'; tools.innerHTML=`<button class="mimi-secondary px-3 py-2 text-xs" onclick="MIMIUX.utility('add')"><i class="fa-solid fa-plus mr-1"></i> Thêm từ</button><button class="mimi-secondary px-3 py-2 text-xs" onclick="MIMIUX.utility('notes')"><i class="fa-solid fa-note-sticky mr-1"></i> Ghi chú</button>`; list.insertBefore(tools,wrap.nextSibling);
  }

  function learnHubMarkup(){
    const area=$('content-area'); if(!area||$('mimi-learn-hub')) return;
    const hub=document.createElement('div'); hub.id='mimi-learn-hub'; hub.className='hidden mimi-learn-hub space-y-5';
    area.insertBefore(hub, $('list-section'));
    renderLearnHub();
  }

  function renderLearnHub(){
    const hub=$('mimi-learn-hub'); if(!hub) return;
    const entries=Object.entries(unitsData||{}).sort((a,b)=>Number(a[0])-Number(b[0]));
    const current=unitsData?.[currentUnit]||{};
    const currentV=current.vocab||[], currentI=current.idioms||[], currentG=current.grammar||[];
    const known=currentV.filter(v=>learnedCardsSet?.has(v.word)).length;
    const pct=currentV.length?Math.round(known/currentV.length*100):0;
    hub.innerHTML=`
      <section>
        <p class="text-xs font-extrabold uppercase tracking-[.14em] text-rose-600">HỌC</p>
        <h2 class="mimi-section-title mt-1">Chọn nội dung để học</h2>
        <p class="text-sm text-slate-500 mt-1">Mỗi Unit giữ nguyên toàn bộ tài liệu gốc. Chọn Unit rồi học từ vựng, expressions hoặc ngữ pháp.</p>
      </section>
      <section class="mimi-card p-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="min-w-0"><span class="text-xs font-extrabold text-rose-600">ĐANG HỌC · ${esc(current.badge||('Unit '+currentUnit))}</span><h3 class="text-xl font-black mt-1 truncate">${esc(current.title||'Unit hiện tại')}</h3><p class="text-sm text-slate-500 mt-1">${esc(current.desc||'')}</p></div>
          <button class="mimi-primary px-4 py-2.5 text-sm shrink-0" onclick="MIMIUX.openUnit(${Number(currentUnit)})">Mở Unit →</button>
        </div>
        <div class="mimi-progress mt-5"><span style="width:${pct}%"></span></div>
        <div class="flex justify-between mt-2 text-xs font-bold text-slate-500"><span>${known}/${currentV.length} từ đã thuộc</span><span>${pct}%</span></div>
        <div class="grid sm:grid-cols-3 gap-2 mt-4"><div class="mimi-content-pill"><b>📚 Từ vựng</b><span>${currentV.length}</span></div><div class="mimi-content-pill"><b>💬 Expressions</b><span>${currentI.length}</span></div><div class="mimi-content-pill"><b>📖 Ngữ pháp</b><span>${currentG.length}</span></div></div>
      </section>
      <section>
        <div class="flex items-center justify-between mb-3"><h3 class="font-extrabold">Nội dung theo Unit</h3><span class="text-xs text-slate-400">${entries.length} Unit</span></div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">${entries.map(([n,d])=>{const vs=d.vocab||[],ks=vs.filter(v=>learnedCardsSet?.has(v.word)).length,pp=vs.length?Math.round(ks/vs.length*100):0;return `<button class="mimi-unit-card ${String(n)===String(currentUnit)?'current':''}" onclick="MIMIUX.openUnit(${Number(n)})"><span class="mimi-unit-number">Unit ${esc(n)}</span><strong class="block text-base mt-1 text-slate-900">${esc(d.title||'')}</strong><span class="block text-xs text-slate-500 mt-1 line-clamp-2">${esc(d.desc||'')}</span><div class="flex items-center gap-2 mt-4"><div class="mimi-progress flex-1"><span style="width:${pp}%"></span></div><span class="text-[11px] font-bold text-slate-500">${pp}%</span></div><div class="text-[11px] font-bold text-slate-400 mt-2">${vs.length} từ · ${(d.grammar||[]).length} grammar · ${(d.idioms||[]).length} expressions</div></button>`}).join('')}</div>
      </section>
      <section class="mimi-card p-5"><div class="flex items-center justify-between mb-3"><h3 class="font-extrabold">Học Unit ${esc(currentUnit)} theo thứ tự</h3><span class="text-xs text-slate-400">Không bỏ sót tài liệu</span></div><div class="space-y-2"><button class="mimi-content-pill w-full" onclick="MIMIUX.learnTab('vocab')"><b>01 · 📚 Từ vựng & expressions</b><span>Học nội dung →</span></button><button class="mimi-content-pill w-full" onclick="MIMIUX.learnTab('grammar')"><b>02 · 📖 Ngữ pháp</b><span>${currentG.length} chủ điểm →</span></button><button class="mimi-content-pill w-full" onclick="MIMIUX.go('practice')"><b>03 · 🧠 Kiểm tra lại</b><span>Practice →</span></button></div></section>`;
  }

  function progressMarkup(){
    if($('mimi-progress-section')) return;
    const area=$('content-area'); if(!area) return;
    const div=document.createElement('div'); div.id='mimi-progress-section'; div.className='hidden space-y-5';
    div.innerHTML=`
      <section><p class="text-xs font-extrabold uppercase tracking-[.14em] text-rose-600">TIẾN ĐỘ</p><h2 class="mimi-section-title mt-1">Bạn đang tiến bộ thế nào?</h2><p class="text-sm text-slate-500 mt-1">Các số liệu lấy từ chính dữ liệu học hiện có, không tạo một hệ thống tiến độ mới.</p></section>
      <section class="grid lg:grid-cols-[1fr_.75fr] gap-4">
        <div class="mimi-card p-5"><div class="flex items-center justify-between"><h3 class="font-extrabold">Unit hiện tại</h3><span id="mimi-progress-unit" class="text-xs font-bold text-rose-600"></span></div><div class="mimi-progress mt-4"><span id="mimi-progress-main" style="width:0%"></span></div><div class="flex justify-between text-xs font-bold text-slate-500 mt-2"><span id="mimi-progress-learned">0 đã thuộc</span><span id="mimi-progress-total">0 từ</span></div></div>
        <div class="mimi-card p-5"><h3 class="font-extrabold">Thói quen</h3><div class="mt-4 flex items-end gap-2"><span id="mimi-progress-streak" class="text-4xl font-black">0</span><span class="text-sm font-bold text-slate-500 mb-1">ngày liên tiếp</span></div></div>
      </section>
      <section class="mimi-card p-5"><h3 class="font-extrabold">Tiến độ theo Unit</h3><p class="text-xs text-slate-500 mt-1">Tỉ lệ từ vựng đã thuộc ở từng Unit</p><div id="mimi-unit-progress" class="mt-4"></div></section>
      <section class="mimi-card p-5"><div class="flex items-center justify-between"><h3 class="font-extrabold">Nội dung Unit hiện tại</h3></div><div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"><div class="rounded-xl bg-slate-50 p-3"><span class="text-xs text-slate-500">Từ vựng</span><b id="mimi-stat-words" class="block text-xl font-black mt-1">0</b></div><div class="rounded-xl bg-slate-50 p-3"><span class="text-xs text-slate-500">Expressions</span><b id="mimi-stat-expressions" class="block text-xl font-black mt-1">0</b></div><div class="rounded-xl bg-slate-50 p-3"><span class="text-xs text-slate-500">Grammar</span><b id="mimi-stat-grammar" class="block text-xl font-black mt-1">0</b></div><div class="rounded-xl bg-slate-50 p-3"><span class="text-xs text-slate-500">Đã thuộc</span><b id="mimi-stat-known" class="block text-xl font-black mt-1">0</b></div></div></section>
      `;
    area.appendChild(div);
    const me=document.createElement('div'); me.id='mimi-me-section'; me.className='hidden space-y-5';
    me.innerHTML=`
      <section><p class="text-xs font-extrabold uppercase tracking-[.14em] text-rose-600">TÔI</p><h2 class="mimi-section-title mt-1">Tài khoản & cài đặt</h2><p class="text-sm text-slate-500 mt-1">Đăng nhập, bảng xếp hạng, đổi môn và công cụ cá nhân.</p></section>
      <section class="mimi-card p-5"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p class="text-xs font-extrabold uppercase tracking-[.14em] text-slate-500">CỘNG ĐỒNG</p><h3 class="font-extrabold mt-1">Học cùng bạn bè</h3><p id="mp-subtitle" class="text-xs text-slate-500 mt-1"></p></div><div class="flex gap-2"><button id="mp-auth-btn" onclick="ENT303MP.openAuth()" class="mimi-primary px-3 py-2 text-xs">Đăng nhập</button><button id="mp-refresh-btn" onclick="ENT303MP.refresh()" class="hidden mimi-secondary px-3 py-2 text-xs">↻ Cập nhật</button></div></div><div id="mp-profile-bar" class="hidden mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200"><b id="mp-user-name" class="text-sm">Bạn</b><p id="mp-user-meta" class="text-xs text-slate-500 mt-1"></p><button onclick="ENT303MP.logout()" class="text-xs font-bold text-rose-600 mt-2">Đăng xuất</button></div><div id="mp-leaderboard" class="mt-4 space-y-2"><div class="rounded-xl bg-slate-50 border border-dashed p-4 text-center text-xs text-slate-400">Đăng nhập để xem bảng xếp hạng</div></div><div id="mp-weekly-message" class="hidden mt-3 rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs font-bold text-amber-900"></div></section>
      <section class="mimi-card p-5"><div class="flex items-center justify-between gap-3"><div><p class="text-xs font-extrabold uppercase tracking-[.14em] text-slate-500">CÔNG CỤ</p><h3 class="font-extrabold mt-1">Tùy chỉnh & tài liệu cá nhân</h3></div><button onclick="ENTX.openTheme()" class="mimi-secondary px-3 py-2 text-xs">Giao diện</button></div><div class="mt-4 flex flex-wrap gap-2"><button onclick="MIMIUX.utility('notes')" class="mimi-secondary px-3 py-2 text-xs">📝 Ghi chú</button><button onclick="MIMIUX.utility('add')" class="mimi-secondary px-3 py-2 text-xs">＋ Thêm từ</button><button onclick="COLX.gate()" class="mimi-secondary px-3 py-2 text-xs">Đổi môn / bộ học</button></div></section>`;
    area.appendChild(me);
  }

  function updateHome(){
    const data=unitsData?.[currentUnit]; if(!data) return;
    const all=data.vocab||[], known=all.filter(v=>learnedCardsSet?.has(v.word)).length, pct=all.length?Math.round(known/all.length*100):0;
    const unit=$('mimi-home-unit'), title=$('mimi-home-title'); if(unit) unit.textContent=data.badge||('Unit '+currentUnit); if(title) title.textContent=data.title||'';
    if($('mimi-home-count')) $('mimi-home-count').textContent=`${all.length} từ`;
    if($('mimi-home-progress')) $('mimi-home-progress').style.width=pct+'%';
    if($('mimi-home-learned')) $('mimi-home-learned').textContent=`${known} đã thuộc`;
    if($('mimi-home-total')) $('mimi-home-total').textContent=`${all.length} từ`;
    if($('mimi-review-count')){const un=all.filter(v=>unlearnedCardsSet?.has(v.word)).length;$('mimi-review-count').textContent=un?`${un} từ đang đánh dấu chưa thuộc`:'Chưa có từ cần ôn — đánh dấu khi học flashcard'}
    if($('mimi-progress-unit')) $('mimi-progress-unit').textContent=data.badge||('Unit '+currentUnit);
    if($('mimi-progress-main')) $('mimi-progress-main').style.width=pct+'%';
    if($('mimi-progress-learned')) $('mimi-progress-learned').textContent=`${known} đã thuộc`;
    if($('mimi-progress-total')) $('mimi-progress-total').textContent=`${all.length} từ`;
    if($('mimi-progress-streak')) $('mimi-progress-streak').textContent=$('home-streak-number')?.textContent||'0';
    if($('mimi-skill-vocab')) $('mimi-skill-vocab').style.width=pct+'%'; if($('mimi-skill-vocab-n')) $('mimi-skill-vocab-n').textContent=pct+'%';
    if($('mimi-stat-words')) $('mimi-stat-words').textContent=all.length;
    if($('mimi-stat-expressions')) $('mimi-stat-expressions').textContent=(data.idioms||[]).length;
    if($('mimi-stat-grammar')) $('mimi-stat-grammar').textContent=(data.grammar||[]).length;
    if($('mimi-stat-known')) $('mimi-stat-known').textContent=known;
    const up=$('mimi-unit-progress'); if(up) up.innerHTML=Object.entries(unitsData||{}).sort((a,b)=>Number(a[0])-Number(b[0])).map(([n,d])=>{const vs=d.vocab||[],k=vs.filter(v=>learnedCardsSet?.has(v.word)).length,p=vs.length?Math.round(k/vs.length*100):0;return `<div class="mimi-skill"><span class="font-bold text-sm">Unit ${esc(n)}</span><div class="mimi-progress"><span style="width:${p}%"></span></div><b>${p}%</b></div>`}).join('');
  }

  function practiceHub(){
    const picker=$('quiz-mode-picker'); if(!picker||$('mimi-practice-hub')) return;
    const hub=document.createElement('div'); hub.id='mimi-practice-hub'; hub.className='mb-6';
    hub.innerHTML=`<div class="mb-4"><p class="text-xs font-extrabold uppercase tracking-[.14em] text-rose-600">LUYỆN TẬP</p><h2 class="mimi-section-title mt-1">Củng cố kiến thức</h2><p class="text-sm text-slate-500 mt-1">Chọn một hoạt động. App vẫn dùng toàn bộ dữ liệu từ vựng, ngữ pháp và bài nghe hiện có.</p></div><div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"><button class="mimi-action" onclick="switchSection('flashcard')"><span class="mimi-icon"><i class="fa-solid fa-clone"></i></span><span><b class="block text-sm">Flashcard</b><small class="text-xs text-slate-500">Nhớ nghĩa và phát âm</small></span></button><button class="mimi-action" onclick="launchQuiz('slide')"><span class="mimi-icon"><i class="fa-solid fa-list-check"></i></span><span><b class="block text-sm">Quiz</b><small class="text-xs text-slate-500">Chọn nghĩa đúng</small></span></button><button class="mimi-action" onclick="launchQuiz('listen')"><span class="mimi-icon"><i class="fa-solid fa-headphones"></i></span><span><b class="block text-sm">Nghe</b><small class="text-xs text-slate-500">Nghe và gõ lại</small></span></button><button class="mimi-action" onclick="openGrammarQuizPicker()"><span class="mimi-icon"><i class="fa-solid fa-spell-check"></i></span><span><b class="block text-sm">Ngữ pháp</b><small class="text-xs text-slate-500">Luyện cấu trúc câu</small></span></button></div>`;
    picker.insertBefore(hub,picker.firstChild);
  }

  function showOnly(target){
    oldSections.forEach(s=>$(s+'-section')?.classList.add('hidden'));
    $('mimi-progress-section')?.classList.add('hidden'); $('mimi-me-section')?.classList.add('hidden');
    $('mimi-learn-hub')?.classList.add('hidden');
    if(target==='home') $('home-section')?.classList.remove('hidden');
    if(target==='learn') $('mimi-learn-hub')?.classList.remove('hidden');
    if(target==='practice') $('quiz-section')?.classList.remove('hidden');
    if(target==='progress') $('mimi-progress-section')?.classList.remove('hidden');
    if(target==='me') $('mimi-me-section')?.classList.remove('hidden');
    const hero=$('unit-hero'); if(hero) hero.classList.toggle('hidden',target==='home'||target==='progress'||target==='me');
    ['home','learn','practice','progress','me'].forEach(k=>$('mimi-nav-'+k)?.classList.toggle('active',k===target));
    if(target==='home') { try{renderHomeStats()}catch(e){}; updateHome(); }
    if(target==='learn') { renderLearnHub(); }
    if(target==='practice') { try{showQuizPicker();practiceHub()}catch(e){} }
    if(target==='progress') updateHome();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  window.MIMIUX={
    go(target){
      if(target==='learn'){showOnly('learn');currentSection='list';}
      else if(target==='practice'){showOnly('practice');currentSection='quiz';}
      else if(target==='progress'){showOnly('progress');currentSection='progress';}
      else if(target==='me'){showOnly('me');currentSection='me';}
      else {showOnly('home');currentSection='home';}
    },
    openUnit(unit){
      const n=Number(unit); if(!unitsData?.[n]) return;
      try{switchUnit(n)}catch(e){currentUnit=n;localStorage.setItem('ENT303_CURRENT_UNIT',String(n));}
      showOnly('learn');
      setTimeout(()=>{MIMIUX.learnTab('vocab')},0);
    },
    learnTab(kind){
      const l=$('list-section'),g=$('grammar-section');
      $('mimi-learn-hub')?.classList.add('hidden');
      if(kind==='grammar'){l?.classList.add('hidden');g?.classList.remove('hidden');currentSection='grammar';try{renderGrammar()}catch(e){}}
      else {g?.classList.add('hidden');l?.classList.remove('hidden');currentSection='list';try{renderVocabGrid((unitsData?.[currentUnit]?.vocab||[]).map((_,i)=>i));renderIdiomList(unitsData?.[currentUnit]?.idioms||[])}catch(e){}}
      document.querySelectorAll('.mimi-learn-tabs').forEach(w=>w.querySelectorAll('button').forEach(b=>b.classList.toggle('active',(kind==='grammar'&&b.textContent.includes('Ngữ'))||(kind==='vocab'&&b.textContent.includes('Từ')))));
      $('unit-hero')?.classList.remove('hidden'); window.scrollTo({top:0,behavior:'smooth'});
    },
    review(){showOnly('practice');setTimeout(()=>{try{const all=unitsData?.[currentUnit]?.vocab||[];const un=all.filter(v=>unlearnedCardsSet?.has(v.word)).length;chooseQuizScope(un?'unlearned':'all');if(!un&&typeof showToast==='function')showToast('Chưa có từ "chưa thuộc" — đang chọn toàn bộ từ của Unit.')}catch(e){}},30)},
    utility(kind){showOnly('learn');$('mimi-learn-hub')?.classList.add('hidden');setTimeout(()=>{try{MIMIUX.originalSwitch?.(kind)}catch(e){}},0)},
    originalSwitch:null
  };

  function patchSwitch(){
    const original=window.switchSection; if(!original||original.__mimiPatched) return;
    MIMIUX.originalSwitch=original;
    function wrapped(s){
      if(s==='zh'||s==='ja'){['mimi-learn-hub','mimi-progress-section','mimi-me-section'].forEach(i=>$(i)?.classList.add('hidden'));}
      if(s==='home'){MIMIUX.go('home');return;}
      if(['list','grammar'].includes(s)){MIMIUX.go('learn');if(s==='grammar')setTimeout(()=>MIMIUX.learnTab('grammar'),0);return;}
      if(['quiz','fastquiz','listenquiz','flashcard'].includes(s)){MIMIUX.go('practice');if(s==='flashcard')setTimeout(()=>{try{original('flashcard')}catch(e){}},0);return;}
      if(s==='notes'||s==='add'){MIMIUX.utility(s);return;}
      if(s==='progress'){MIMIUX.go('progress');return;}
      return original.apply(this,arguments);
    }
    wrapped.__mimiPatched=true; window.switchSection=wrapped;
  }

  function patchHomeStats(){
    const fn=window.renderHomeStats; if(!fn||fn.__mimiPatched) return;
    function wrapped(){const r=fn.apply(this,arguments);setTimeout(updateHome,0);return r} wrapped.__mimiPatched=true;window.renderHomeStats=wrapped;
  }

  function init(){
    if(redesignReady) return; if(!$('content-area')) return;
    redesignReady=true; addStyles(); replaceNav(); homeMarkup(); addLearnTabs(); learnHubMarkup(); progressMarkup(); patchSwitch(); patchHomeStats(); new MutationObserver(()=>{if(document.body.dataset.subject==='en')MIMIUX.go('home')}).observe(document.body,{attributes:true,attributeFilter:['data-subject']});
    // Preserve the existing engine's initial data/rendering, then put the user on the new home.
    setTimeout(()=>{try{renderHomeStats()}catch(e){};updateHome();MIMIUX.go('home')},20);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
