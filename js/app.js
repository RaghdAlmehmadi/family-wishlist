/* =====================================================================
   app.js — واجهة قائمة أمنيات العائلة (الإصدار 2)
   الروابط: #home ، #search ، #<القسم> ، #<القسم>-<الشخص> ، #<القسم>-<الشخص>-<التصنيف>
   ===================================================================== */
(function () {
  'use strict';

  const CFG = window.WISHLIST_CONFIG || null;
  const Art = window.WishArt;
  const BUY_LABEL = 'تم الشراء';

  // ---------------------------------------------------------------
  // أدوات
  // ---------------------------------------------------------------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id) => `<svg class="ic" aria-hidden="true"><use href="#${id}"/></svg>`;
  const flag = (c) => (c === 'fr'
    ? `<svg class="flag flag-fr" viewBox="0 0 3 2" aria-hidden="true"><use href="#flag-fr"/></svg>`
    : `<svg class="flag flag-uk" viewBox="0 0 60 30" aria-hidden="true"><use href="#flag-uk"/></svg>`);
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* */ } },
  };
  const norm = (s) => String(s || '').toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');

  function nProducts(n, genitive) {
    if (n === 1) return 'منتج واحد';
    if (n === 2) return genitive ? 'منتجين' : 'منتجان';
    const r = n % 100;
    if (r >= 3 && r <= 10) return `${n} منتجات`;
    if (r >= 11 && r <= 99) return `${n} منتجًا`;
    return `${n} منتج`;
  }
  function stats(list) {
    const total = list.length;
    const bought = list.filter((p) => p.purchased).length;
    return { total, bought, left: total - bought, pct: total ? Math.round((bought / total) * 100) : 0 };
  }
  function progressText(st) {
    if (!st.total) return 'لا توجد منتجات بعد';
    if (st.left === 0) return 'اكتملت الأمنيات كلها';
    if (st.bought === 0) return `${nProducts(st.total)} بانتظار الشراء`;
    return `اشترينا ${st.bought} من ${nProducts(st.total, true)}`;
  }
  const bar = (pct) => `<div class="bar" role="presentation"><i style="--p:${pct}%"></i></div>`;

  // ---------------------------------------------------------------
  // الحالة
  // ---------------------------------------------------------------
  const S = {
    store: null,
    D: null,
    loaded: false,
    route: { view: 'home' },
    member: 'all',
    status: LS.get('wl.status', 'all'),
    pending: 0,
    sticky: new Set(),
    pop: null,
    flashId: null,
    sync: 'connecting',
    q: '',
    subscribed: false,
  };

  function indexData(d) {
    const D = { members: d.members.slice(), sections: d.sections.slice(), categories: d.categories.slice(), products: d.products.slice() };
    D.memberById = {}; D.members.forEach((m) => { D.memberById[m.id] = m; });
    D.sectionById = {}; D.sections.forEach((s) => { D.sectionById[s.id] = s; });
    D.catById = {}; D.catsBySection = {};
    D.categories.forEach((c) => { D.catById[c.id] = c; (D.catsBySection[c.section_id] = D.catsBySection[c.section_id] || []).push(c); });
    D.productById = {}; D.products.forEach((p) => { D.productById[p.id] = p; });
    return D;
  }
  function memberMatch(p, member) {
    if (member === 'all') return true;
    if (member === 'shared') return !!p.is_shared;
    return p.member_ids.includes(member);
  }
  const hasCat = (p) => !!(p.category_id && S.D.catById[p.category_id]);

  // ---------------------------------------------------------------
  // الشاشات
  // ---------------------------------------------------------------
  function show(id) { ['screen-loading', 'screen-setup', 'screen-login', 'app'].forEach((x) => { $('#' + x).hidden = x !== id; }); }
  function showSetup(reason) { $('#setup-reason').textContent = reason || ''; show('screen-setup'); }

  function showLogin() {
    show('screen-login');
    document.body.classList.remove('can-add');
    const f = $('#login-form'), input = $('#login-pass'), err = $('#login-err');
    err.hidden = true;
    setTimeout(() => input.focus(), 50);
    f.onsubmit = async (e) => {
      e.preventDefault();
      const btn = f.querySelector('button[type=submit]');
      if (!input.value) { err.textContent = 'كلمة السر مطلوبة'; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = 'جارٍ الدخول…'; err.hidden = true;
      try {
        await S.store.signIn(input.value);
        input.value = '';
        await startApp();
      } catch (ex) {
        err.textContent = /invalid|credentials/i.test(String(ex.message)) ? 'كلمة السر غير صحيحة' : 'تعذّر الدخول. تأكّدوا من الاتصال بالإنترنت وأعيدوا المحاولة.';
        err.hidden = false;
      } finally { btn.disabled = false; btn.textContent = 'دخول'; }
    };
  }

  // ---------------------------------------------------------------
  // الإقلاع
  // ---------------------------------------------------------------
  async function boot() {
    $('#sprite-host').innerHTML = Art.SPRITE;
    $('#hero-host').innerHTML = `
      <section class="hero" aria-label="أمنيات العائلة">
        <div class="wrap hero-inner">
          <div class="hero-text">
            <h1 class="hero-title">أمنيات العائلة</h1>
            <p class="hero-sub">رحلة شتوية، وهدايا ننتظرها بكل حب.</p>
            <p class="hero-tag">${flag('fr')}${flag('uk')}<span>France &amp; United Kingdom | Winter 2026</span></p>
          </div>
          <div class="hero-art">${Art.heroScene()}</div>
        </div>
      </section>`;
    Art.snowfall($('#page-snow'), 64, { durMin: 12, durMax: 26 });
    Art.snowfall($('#view-search .band-snow'), 22, { fall: '300px', durMin: 5, durMax: 11 });
    if (!CFG) return showSetup('ملف الإعداد js/config.js غير موجود.');
    if ((CFG.mode || 'supabase') !== 'preview') {
      if (!CFG.supabaseUrl || /YOUR-PROJECT/i.test(CFG.supabaseUrl) || !CFG.supabaseKey || /YOUR|\.\.\./.test(CFG.supabaseKey)) return showSetup('رابط المشروع أو المفتاح العام غير مضبوط في ملف الإعداد.');
      if (/^sb_secret_/.test(CFG.supabaseKey)) return showSetup('المفتاح الموجود في ملف الإعداد مفتاح سري. ضعوا المفتاح العام (Publishable) بدلًا منه، وغيّروا المفتاح السري من لوحة Supabase.');
      if ((CFG.authMode || 'password') !== 'open' && !CFG.familyEmail) return showSetup('بريد حساب العائلة (familyEmail) غير مضبوط في ملف الإعداد.');
      if (!window.supabase || !window.supabase.createClient) return showSetup('تعذّر تحميل مكتبة Supabase. تأكّدوا من الاتصال بالإنترنت ثم حدّثوا الصفحة.');
    }
    try { S.store = window.WishStore.create(CFG); }
    catch (e) { console.error(e); return showSetup('تعذّر تهيئة الاتصال بقاعدة البيانات. راجعوا قيم ملف الإعداد.'); }

    $('#preview-banner').hidden = S.store.kind !== 'preview';
    $('#logout').hidden = !S.store.needsLogin;
    S.store.onAuthLost(() => { if (!$('#app').hidden) showLogin(); });

    if (S.store.needsLogin) {
      let session = null;
      try { session = await S.store.getSession(); } catch (e) { session = null; }
      if (!session) return showLogin();
    }
    await startApp();
  }

  let started = false;
  async function startApp() {
    show('app');
    if (!started) {
      started = true;
      bindGlobal();
      window.addEventListener('hashchange', onRoute);
      setInterval(() => { if (document.visibilityState === 'visible') scheduleReload(0); }, 60000);
    }
    if (!S.subscribed) {
      S.subscribed = true;
      wasSubscribed = false;
      S.store.subscribe(() => scheduleReload(250), setSync);
    }
    await reload();
    onRoute();
  }

  // ---------------------------------------------------------------
  // التحميل والمزامنة
  // ---------------------------------------------------------------
  let reloadTimer = null, reloading = false, reloadAgain = false, wasSubscribed = false;
  function scheduleReload(delay) { clearTimeout(reloadTimer); reloadTimer = setTimeout(reload, delay === undefined ? 250 : delay); }
  async function reload() {
    if (S.pending > 0) { scheduleReload(400); return false; }
    if (reloading) { reloadAgain = true; return false; }
    reloading = true;
    let ok = false;
    try {
      S.D = indexData(await S.store.loadAll());
      S.loaded = true; ok = true;
      render();
    } catch (e) {
      console.error('load failed', e);
      if (!S.loaded) {
        ['view-home', 'view-search'].forEach((id) => { $('#' + id).hidden = true; });
        const v = $('#view-section');
        v.hidden = false;
        v.innerHTML = `<div class="wrap"><div class="sec-head error-head"><h1>تعذّر تحميل القائمة</h1></div>
          <p class="hint" style="margin-bottom:20px">تأكّدوا من الاتصال بالإنترنت، ومن تشغيل ملف schema.sql في Supabase.</p>
          <button class="btn btn-primary" data-action="retry">إعادة المحاولة</button></div>`;
      } else if (navigator.onLine) {
        toast('تعذّر تحديث القائمة الآن، وستُعاد المحاولة تلقائيًا.', { type: 'error' });
      }
    } finally {
      reloading = false;
      if (reloadAgain) { reloadAgain = false; scheduleReload(100); }
    }
    return ok;
  }
  function setSync(status) {
    if (status === 'SUBSCRIBED') { S.sync = 'ok'; if (wasSubscribed) scheduleReload(0); wasSubscribed = true; }
    else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) S.sync = 'connecting';
    $('#offline-banner').hidden = navigator.onLine;
  }

  // ---------------------------------------------------------------
  // التوجيه
  // ---------------------------------------------------------------
  function parseRoute() {
    const h = decodeURIComponent((location.hash || '').replace(/^#\/?/, ''));
    if (!h || h === 'home') return { view: 'home' };
    if (h === 'search') return { view: 'search' };
    const parts = h.split('-');
    const D = S.D;
    if (D && D.sectionById[parts[0]]) {
      let member = parts[1] || S.member || 'all';
      if (!['all', 'shared'].includes(member) && !D.memberById[member]) member = 'all';
      let cat = parts.slice(2).join('-') || null;
      if (cat && cat !== 'all' && cat !== 'none' && !(D.catById[cat] && D.catById[cat].section_id === parts[0])) cat = null;
      return { view: 'section', section: parts[0], member, cat };
    }
    return { view: 'home' };
  }
  const link = (section, member, cat) => `#${section}-${member}${cat ? '-' + cat : ''}`;

  function onRoute() {
    if (!S.D) return;
    const prev = S.route;
    S.route = parseRoute();
    if (S.route.view === 'section') S.member = S.route.member;
    S.sticky.clear();
    closeMenu();
    render();
    const samePage = prev.view === S.route.view && prev.section === S.route.section && prev.cat === S.route.cat;
    if (!samePage) window.scrollTo(0, 0);
    if (S.route.view === 'search') setTimeout(() => $('#q').focus(), 30);
  }

  // ---------------------------------------------------------------
  // الرسم
  // ---------------------------------------------------------------
  function render() {
    if (!S.D) return;
    renderNav();
    const v = S.route.view;
    $('#view-home').hidden = v !== 'home';
    $('#view-section').hidden = v !== 'section';
    $('#view-search').hidden = v !== 'search';
    document.body.classList.toggle('is-home', v === 'home');
    document.body.classList.toggle('can-add', v === 'section' && !!addContext());
    if (v === 'home') renderHome();
    else if (v === 'section') renderSection();
    else renderSearch();
    $('#offline-banner').hidden = navigator.onLine;
    if (S.flashId) {
      const el = document.querySelector(`.item[data-id="${S.flashId}"]`);
      if (el) { el.classList.add('flash'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
      S.flashId = null;
    }
  }

  function renderNav() {
    const nav = $('#nav');
    const r = S.route;
    let html = `<a href="#home" ${r.view === 'home' ? 'aria-current="page"' : ''}>الرئيسية</a>`;
    for (const s of S.D.sections) {
      const cur = r.view === 'section' && r.section === s.id;
      html += `<a href="${link(s.id, S.member)}" ${cur ? 'aria-current="page"' : ''}>${esc(s.name)}</a>`;
    }
    if (nav.innerHTML !== html) {
      const row = nav.parentElement, sl = row.scrollLeft;
      nav.innerHTML = html;
      row.scrollLeft = sl;
      const a = nav.querySelector('[aria-current=page]');
      if (a && row.scrollWidth > row.clientWidth) {
        const ar = a.getBoundingClientRect(), rr = row.getBoundingClientRect();
        if (ar.left < rr.left || ar.right > rr.right) a.scrollIntoView({ inline: 'center', block: 'nearest' });
      }
    }
  }

  // ---------- الرئيسية ----------
  function renderHome() {
    const D = S.D;
    const all = stats(D.products);
    const cards = D.sections.map((s) => {
      const st = stats(D.products.filter((p) => p.section_id === s.id));
      const sid = /^[a-z]+$/.test(s.id) ? s.id : 'all';
      return `<a class="sec-card" data-tone="${esc(sid)}" href="${link(s.id, S.member)}">
        <div><span class="sec-ico">${icon('s-' + sid)}</span><h3>${esc(s.name)}</h3></div>
        <div class="sec-nums">
          <div><b>${st.total}</b><span>المنتجات</span></div>
          <div class="${st.total && !st.left ? 'done' : ''}"><b>${st.bought}</b><span>المشتراة</span></div>
        </div>
      </a>`;
    }).join('');
    $('#home-dynamic').innerHTML = `
        <section class="stats" aria-label="ملخص المشتريات">
          <div class="stats-row">
            <div class="stat"><b>${all.total}</b><span>إجمالي المنتجات</span></div>
            <div class="stat"><b>${all.bought}</b><span>المشتراة</span></div>
            <div class="stat"><b>${all.left}</b><span>المتبقية</span></div>
            <div class="stat is-pct"><b>${all.pct}%</b><span>نسبة الإنجاز</span></div>
          </div>
          ${bar(all.pct)}
        </section>
        <div class="block-head"><h2>الأقسام</h2></div>
        <div class="sec-grid">${cards}</div>`;
  }

  // ---------- صفحة القسم ----------
  function addContext() {
    const r = S.route;
    if (r.view !== 'section' || r.member === 'all') return null;
    const cats = S.D.catsBySection[r.section] || [];
    let category = null;
    if (cats.length) {
      if (!r.cat || r.cat === 'all') return null;
      category = r.cat === 'none' ? null : r.cat;
    }
    const shared = r.member === 'shared';
    return { section: r.section, category, shared, members: shared ? S.D.members.map((m) => m.id) : [r.member] };
  }

  function ownerLabel(p, member) {
    const D = S.D;
    const names = p.member_ids.map((id) => D.memberById[id]).filter(Boolean).map((m) => m.name);
    if (p.is_shared) return member === 'all' || member === 'shared' ? `مشترك: ${names.length === D.members.length ? 'العائلة كلها' : names.join('، ')}` : 'مشترك';
    if (member === 'all' && names[0]) return `ل${names[0]}`;
    return '';
  }

  function itemRow(p, member, extraMeta) {
    const img = p.image_path ? S.store.imageUrl(p.image_path) : '';
    const owner = ownerLabel(p, member);
    const meta = [`<span class="status">${BUY_LABEL}</span>`];
    if (owner) meta.push(`<span class="${p.is_shared ? 'shared' : ''}">${esc(owner)}</span>`);
    if (extraMeta) meta.push(`<span>${esc(extraMeta)}</span>`);
    return `
      <li class="item${p.purchased ? ' done' : ''}${S.pop === p.id ? ' pop' : ''}" data-id="${p.id}">
        <button class="tick" data-action="buy" data-id="${p.id}" aria-pressed="${!!p.purchased}" aria-label="${BUY_LABEL}: ${esc(p.name)}">${icon('i-check')}</button>
        ${img ? `<button class="thumb" data-action="zoom" data-src="${esc(img)}" aria-label="عرض الصورة"><img src="${esc(img)}" alt="" loading="lazy" decoding="async"></button>`
        : `<div class="thumb" aria-hidden="true">${icon('i-image')}</div>`}
        <div class="item-text">
          <h3>${esc(p.name)}</h3>
          ${p.description ? `<p>${esc(p.description)}</p>` : ''}
          <div class="item-meta">${meta.join('')}</div>
        </div>
        <button class="icon-btn more" data-action="more" data-id="${p.id}" aria-label="خيارات ${esc(p.name)}" aria-haspopup="menu">${icon('i-more')}</button>
      </li>`;
  }

  function filterStatus(list) {
    if (S.status === 'left') return list.filter((p) => !p.purchased || S.sticky.has(p.id));
    if (S.status === 'bought') return list.filter((p) => p.purchased);
    return list;
  }
  const byNewest = (a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0);

  function filtersBar() {
    const f = S.status;
    return `<div class="filters" role="group" aria-label="حالة الشراء">
      <button data-action="status" data-v="all" aria-pressed="${f === 'all'}">الكل</button>
      <button data-action="status" data-v="left" aria-pressed="${f === 'left'}">المتبقية</button>
      <button data-action="status" data-v="bought" aria-pressed="${f === 'bought'}">المشتراة</button>
    </div>`;
  }

  function listBlock(scope, member, emptyText, groupByCat, sectionId) {
    const D = S.D;
    const visible = filterStatus(scope).sort(byNewest);
    if (!visible.length) {
      let msg = emptyText;
      if (scope.length && S.status === 'bought') msg = 'لا توجد منتجات مشتراة بعد.';
      else if (scope.length && S.status === 'left') msg = 'اشترينا كل المنتجات هنا.';
      return `<div class="empty">${esc(msg)}</div>`;
    }
    if (!groupByCat) return `<ul class="items">${visible.map((p) => itemRow(p, member)).join('')}</ul>`;
    const cats = D.catsBySection[sectionId] || [];
    let out = '';
    for (const c of cats) {
      const g = visible.filter((p) => p.category_id === c.id);
      if (g.length) out += `<h3 class="group-title">${esc(c.name)}</h3><ul class="items">${g.map((p) => itemRow(p, member)).join('')}</ul>`;
    }
    const rest = visible.filter((p) => !hasCat(p));
    if (rest.length) out += `<h3 class="group-title">بدون تصنيف</h3><ul class="items">${rest.map((p) => itemRow(p, member)).join('')}</ul>`;
    return out;
  }

  function renderSection() {
    const D = S.D;
    const { section, member, cat } = S.route;
    const sec = D.sectionById[section];
    const cats = D.catsBySection[section] || [];
    const scope = D.products.filter((p) => p.section_id === section && memberMatch(p, member));
    const st = stats(scope);
    const ctx = addContext();
    const memberName = member === 'all' ? 'الكل' : member === 'shared' ? 'المنتجات المشتركة' : D.memberById[member].name;

    const people = `<a class="all-link" href="${link(section, 'all', cat)}" aria-current="${member === 'all'}">${icon('i-group')}الكل</a>`
      + D.members.map((m) => `<a href="${link(section, m.id, cat)}" aria-current="${member === m.id}">${esc(m.name)}</a>`).join('')
      + `<span class="sep" aria-hidden="true"></span><a class="shared-link" href="${link(section, 'shared', cat)}" aria-current="${member === 'shared'}">${icon('i-share')}المنتجات المشتركة</a>`;

    const addBtn = ctx ? `<button class="btn btn-primary add-inline" data-action="add">${icon('i-plus')}إضافة منتج</button>` : '';
    const addHint = !ctx ? (member === 'all' ? 'لإضافة منتج، اختاروا اسم الشخص أولًا.' : 'لإضافة منتج، اختاروا تصنيفًا.') : '';
    let content;

    if (cats.length && !cat) {
      // شبكة التصنيفات
      const card = (href, name, list, cls) => {
        const s2 = stats(list);
        const meta = !s2.total ? `<span class="none">لا توجد منتجات</span>`
          : !s2.left ? `<span class="done">${icon('i-check')}اكتمل</span>`
            : `<span>${esc(nProducts(s2.total))}</span>`;
        if (cls === 'all') {
          return `<a class="cat all" href="${href}"><i class="cat-ico" aria-hidden="true">${icon('i-grid')}</i><div class="cat-text"><b>${esc(name)}</b>${meta}</div><i class="cat-go" aria-hidden="true">${icon('i-back')}</i></a>`;
        }
        return `<a class="cat${cls ? ' ' + cls : ''}" href="${href}"><b>${esc(name)}</b>${meta}</a>`;
      };
      let grid = card(link(section, member, 'all'), 'كل المنتجات', scope, 'all');
      for (const c of cats) grid += card(link(section, member, c.id), c.name, scope.filter((p) => p.category_id === c.id));
      const loose = scope.filter((p) => !hasCat(p));
      if (loose.length) grid += card(link(section, member, 'none'), 'بدون تصنيف', loose);
      content = `
        <div class="content-head"><h2>التصنيفات<span class="sr">، ${esc(memberName)}</span></h2></div>
        <div class="cat-grid">${grid}</div>
        <div class="add-cat" id="add-cat"><button class="btn-text" data-action="add-cat">${icon('i-plus')}إضافة تصنيف</button></div>`;
    } else {
      let title, list, emptyText, groupByCat = false, back = '', srSuffix = '';
      if (!cats.length) {
        title = memberName; list = scope; emptyText = 'لا توجد منتجات في هذا القسم بعد.';
      } else {
        back = `<a class="back" href="${link(section, member)}">${icon('i-back')}التصنيفات</a>`;
        if (cat === 'all') { title = 'كل المنتجات'; list = scope; emptyText = 'لا توجد منتجات في هذا القسم بعد.'; groupByCat = true; }
        else if (cat === 'none') { title = 'بدون تصنيف'; list = scope.filter((p) => !hasCat(p)); emptyText = 'لا توجد منتجات في هذا التصنيف بعد.'; }
        else { title = D.catById[cat].name; list = scope.filter((p) => p.category_id === cat); emptyText = 'لا توجد منتجات في هذا التصنيف بعد.'; }
        if (member !== 'all') srSuffix = `<span class="sr">، ${esc(memberName)}</span>`;
      }
      content = `
        ${back}
        <div class="content-head"><h2>${esc(title)}${srSuffix}</h2>${addBtn}</div>
        ${filtersBar()}
        ${listBlock(list, member, emptyText, groupByCat, section)}
        ${addHint ? `<p class="hint" style="margin-top:18px">${addHint}</p>` : ''}
        ${!cats.length ? `<div class="add-cat" id="add-cat"><button class="btn-text" data-action="add-cat">${icon('i-plus')}إضافة تصنيف</button></div>` : ''}`;
    }

    const v = $('#view-section');
    const peopleEl = $('.people', v);
    const keepScroll = peopleEl && v.dataset.section === section ? peopleEl.scrollLeft : null;
    const sid = /^[a-z]+$/.test(section) ? section : 'all';
    v.dataset.section = section;
    v.dataset.tone = sid;
    if (!$('#sec-head', v)) {
      v.innerHTML = `<header class="sec-band"><div class="band-snow" aria-hidden="true"></div><div class="wrap sec-head" id="sec-head"></div></header><div class="wrap" id="sec-main"></div>`;
      Art.snowfall($('.band-snow', v), 24, { fall: '300px', durMin: 5, durMax: 11 });
    }
    $('#sec-head', v).innerHTML = `
          <span class="sec-ico" aria-hidden="true">${icon('s-' + sid)}</span>
          <div>
            <h1>${esc(sec.name)}</h1>
            <div class="progress"><p>${esc(progressText(st))}</p>${st.total ? bar(st.pct) : ''}</div>
          </div>`;
    $('#sec-main', v).innerHTML = `
        <div class="sec-body">
          <nav class="people" aria-label="أفراد العائلة">${people}</nav>
          <div class="content">${content}</div>
        </div>`;
    const pe = $('.people', v);
    if (keepScroll !== null) pe.scrollLeft = keepScroll;
    else {
      const a = pe.querySelector('[aria-current=true]');
      if (a && pe.scrollWidth > pe.clientWidth) a.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }

  // ---------- البحث ----------
  function renderSearch() {
    const D = S.D;
    const box = $('#search-results');
    const q = norm(S.q.trim());
    if (!q) { box.innerHTML = `<p class="search-note">ابحثوا في جميع الأقسام باسم المنتج أو وصفه أو اسم الشخص.</p>`; return; }
    const terms = q.split(/\s+/).filter(Boolean);
    const hay = (p) => norm([p.name, p.description,
      hasCat(p) ? D.catById[p.category_id].name : '',
      D.sectionById[p.section_id] ? D.sectionById[p.section_id].name : '',
      p.member_ids.map((id) => (D.memberById[id] ? D.memberById[id].name : '')).join(' ')].join(' '));
    const found = D.products.filter((p) => { const h = hay(p); return terms.every((t) => h.includes(t)); }).sort(byNewest);
    if (!found.length) { box.innerHTML = `<div class="empty">لا توجد نتائج.</div>`; return; }
    box.innerHTML = `<p class="search-note">${esc(nProducts(found.length))}</p><ul class="items">` + found.map((p) => {
      const where = [D.sectionById[p.section_id] && D.sectionById[p.section_id].name, hasCat(p) && D.catById[p.category_id].name].filter(Boolean).join('، ');
      return itemRow(p, 'all', where);
    }).join('') + '</ul>';
  }

  // ---------------------------------------------------------------
  // الشراء
  // ---------------------------------------------------------------
  async function toggleBuy(id) {
    const p = S.D && S.D.productById[id];
    if (!p) return;
    const next = !p.purchased;
    const prev = { purchased: p.purchased, purchased_at: p.purchased_at };
    Object.assign(p, { purchased: next, purchased_at: next ? new Date().toISOString() : null });
    S.pop = next ? id : null;
    if (next && S.status === 'left') {
      S.sticky.add(id);
      setTimeout(() => {
        if (!S.sticky.has(id)) return;
        const el = document.querySelector(`.item[data-id="${id}"]`);
        if (el) el.classList.add('leaving');
        setTimeout(() => { S.sticky.delete(id); render(); }, 420);
      }, 2000);
    }
    render();
    S.pop = null;
    if (next && navigator.vibrate) { try { navigator.vibrate(15); } catch (e) { /* */ } }
    S.pending++;
    try {
      await S.store.setPurchased(id, next);
      toast(next ? 'رائع، أمنية تحقّقت' : 'أُلغيت علامة الشراء', { action: { label: 'تراجع', fn: () => toggleBuy(id) } });
    } catch (e) {
      console.error(e);
      Object.assign(p, prev);
      S.sticky.delete(id);
      render();
      toast('تعذّر حفظ علامة الشراء. تأكّدوا من الاتصال وأعيدوا المحاولة.', { type: 'error' });
    } finally { S.pending--; scheduleReload(300); }
  }

  // ---------------------------------------------------------------
  // قائمة الخيارات
  // ---------------------------------------------------------------
  let menuEl = null;
  function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
  function openMenu(btn, id) {
    closeMenu();
    const p = S.D.productById[id];
    if (!p) return;
    menuEl = document.createElement('div');
    menuEl.className = 'menu';
    menuEl.setAttribute('role', 'menu');
    menuEl.dataset.for = id;
    menuEl.innerHTML = `
      <button role="menuitem" data-action="edit" data-id="${id}">${icon('i-edit')}تعديل</button>
      <button role="menuitem" data-action="share" data-id="${id}">${icon('i-share')}${p.is_shared ? 'تعديل المشاركة' : 'نقل إلى المنتجات المشتركة'}</button>
      <button role="menuitem" class="danger" data-action="delete" data-id="${id}">${icon('i-trash')}<span>حذف</span></button>`;
    document.body.appendChild(menuEl);
    const r = btn.getBoundingClientRect();
    const w = 232, h = menuEl.offsetHeight;
    let left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    let top = r.bottom + window.scrollY + 4;
    if (r.bottom + h + 12 > window.innerHeight) top = r.top + window.scrollY - h - 4;
    menuEl.style.left = left + 'px';
    menuEl.style.top = top + 'px';
    menuEl.querySelector('button').focus();
  }

  async function deleteProduct(id) {
    const p = S.D.productById[id];
    if (!p) return;
    S.pending++;
    S.D.products = S.D.products.filter((x) => x.id !== id);
    delete S.D.productById[id];
    render();
    try { await S.store.deleteProduct(p); toast('حُذف المنتج'); }
    catch (e) {
      console.error(e);
      S.D.products.push(p); S.D.productById[id] = p; render();
      toast('تعذّر حذف المنتج. أعيدوا المحاولة بعد التأكد من الاتصال.', { type: 'error' });
    } finally { S.pending--; scheduleReload(200); }
  }

  // ---------------------------------------------------------------
  // اللوحة
  // ---------------------------------------------------------------
  let panelState = null;
  function openPanel(html, opts) {
    closeMenu();
    const root = $('#panel-root'), panel = root.querySelector('.panel');
    panel.innerHTML = html;
    panel.dataset.tone = (opts && opts.tone) || 'gifts';
    root.hidden = false;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('panel-open');
    panelState = Object.assign({ lastFocus: document.activeElement }, opts || {});
    panel.setAttribute('aria-label', (panel.querySelector('h2') || {}).textContent || '');
    return panel;
  }
  function closePanel(force) {
    const root = $('#panel-root');
    if (root.hidden) return;
    if (!force && panelState && panelState.isDirty && panelState.isDirty()) {
      const panel = root.querySelector('.panel');
      if (panel.animate) panel.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 240 });
      return;
    }
    if (panelState && panelState.onClose) panelState.onClose();
    root.hidden = true;
    root.querySelector('.panel').innerHTML = '';
    document.body.style.overflow = '';
    document.body.classList.remove('panel-open');
    const lf = panelState && panelState.lastFocus;
    panelState = null;
    if (lf && lf.focus && document.contains(lf)) lf.focus();
  }

  function contextLine(section, category, members, shared) {
    const D = S.D;
    const where = [D.sectionById[section] && D.sectionById[section].name, category && D.catById[category] && D.catById[category].name].filter(Boolean).join('، ');
    if (shared) return `المنتجات المشتركة في ${where}`;
    const m = D.memberById[members[0]];
    return m ? `قائمة ${m.name} في ${where}` : where;
  }

  // ---------- نموذج المنتج: ثلاثة حقول فقط ----------
  function openProductForm(product) {
    const isNew = !product;
    const ctx = isNew ? addContext() : {
      section: product.section_id, category: product.category_id, shared: product.is_shared, members: product.member_ids.slice(),
    };
    if (!ctx) return;
    const F = { existingPath: product ? product.image_path : null, newBlob: null, previewUrl: null, removeImage: false, dirty: false };

    const panel = openPanel(`
      <form novalidate>
        <div class="panel-head">
          <div><h2>${isNew ? 'منتج جديد' : 'تعديل المنتج'}</h2><p>${esc(contextLine(ctx.section, ctx.category, ctx.members, ctx.shared))}</p></div>
          <button type="button" class="icon-btn" data-close aria-label="إغلاق">${icon('i-close')}</button>
        </div>
        <div class="panel-body">
          <label class="field"><span class="field-label">اسم المنتج</span>
            <input name="name" maxlength="200" autocomplete="off" required value="${esc(product ? product.name : '')}">
            <p class="err" data-err="name" hidden>اسم المنتج مطلوب</p></label>
          <div class="field">
            <span class="field-label">صورة المنتج <small>اختيارية</small></span>
            <div class="photo">
              <div class="photo-well" data-preview></div>
              <div class="photo-actions">
                <button type="button" class="btn btn-quiet" data-pick="cam">${icon('i-camera')}التقاط صورة</button>
                <button type="button" class="btn btn-quiet" data-pick="lib">${icon('i-image')}من الألبوم</button>
                <button type="button" class="btn-text" data-photo-remove>إزالة الصورة</button>
              </div>
            </div>
            <input type="file" accept="image/*" capture="environment" hidden data-file="cam">
            <input type="file" accept="image/*" hidden data-file="lib">
          </div>
          <label class="field"><span class="field-label">وصف المنتج <small>اختياري</small></span>
            <textarea name="description" rows="3" maxlength="1000">${esc(product && product.description ? product.description : '')}</textarea></label>
        </div>
        <div class="panel-foot">
          <p class="err form-err" hidden></p>
          <button type="submit" class="btn btn-primary btn-wide">${isNew ? 'حفظ' : 'حفظ التعديلات'}</button>
        </div>
      </form>`, { tone: ctx.section, isDirty: () => F.dirty, onClose: () => { if (F.previewUrl) URL.revokeObjectURL(F.previewUrl); } });

    const form = panel.querySelector('form');
    const nameEl = form.elements.name;

    function paintPhoto() {
      const src = F.previewUrl || (!F.removeImage && F.existingPath ? S.store.imageUrl(F.existingPath) : '');
      form.querySelector('[data-preview]').innerHTML = src ? `<img src="${esc(src)}" alt="صورة المنتج">` : icon('i-image');
      form.querySelector('[data-photo-remove]').hidden = !src;
    }
    form.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => form.querySelector(`[data-file="${b.dataset.pick}"]`).click()));
    form.querySelectorAll('[data-file]').forEach((inp) => inp.addEventListener('change', async () => {
      const file = inp.files && inp.files[0];
      inp.value = '';
      if (!file) return;
      form.querySelector('[data-preview]').innerHTML = '';
      try {
        const preview = S.store.kind === 'preview';
        const blob = await compressImage(file, preview ? 900 : 1400, preview ? 0.74 : 0.84);
        if (F.previewUrl) URL.revokeObjectURL(F.previewUrl);
        F.newBlob = blob; F.previewUrl = URL.createObjectURL(blob); F.removeImage = false; F.dirty = true;
      } catch (e) {
        toast('تعذّرت قراءة الصورة. جرّبوا صورة أخرى بصيغة JPG أو PNG.', { type: 'error' });
      }
      paintPhoto();
    }));
    form.querySelector('[data-photo-remove]').addEventListener('click', () => {
      if (F.previewUrl) URL.revokeObjectURL(F.previewUrl);
      F.newBlob = null; F.previewUrl = null; F.removeImage = true; F.dirty = true;
      paintPhoto();
    });
    form.addEventListener('input', () => { F.dirty = true; form.querySelector('[data-err=name]').hidden = true; });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = form.querySelector('.form-err');
      errBox.hidden = true;
      const name = nameEl.value.trim();
      if (!name) { form.querySelector('[data-err=name]').hidden = false; nameEl.focus(); return; }
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      btn.textContent = F.newBlob ? 'جارٍ رفع الصورة…' : 'جارٍ الحفظ…';
      let newPath = null, counted = false;
      try {
        if (F.newBlob) { newPath = await S.store.uploadImage(F.newBlob); btn.textContent = 'جارٍ الحفظ…'; }
        const data = {
          section_id: ctx.section, category_id: ctx.category || '', name,
          description: form.elements.description.value,
          image_path: newPath || (F.removeImage ? '' : (F.existingPath || '')),
          is_shared: !!ctx.shared,
        };
        S.pending++; counted = true;
        const id = await S.store.saveProduct(isNew ? null : product.id, data, ctx.members);
        if (F.existingPath && (newPath || F.removeImage)) S.store.removeImage(F.existingPath);
        closePanel(true);
        S.flashId = id;
        toast(isNew ? 'أُضيف المنتج' : 'حُفظت التعديلات');
      } catch (ex) {
        console.error(ex);
        if (newPath) S.store.removeImage(newPath);
        const m = String(ex.message || '');
        errBox.textContent = /storage_full/.test(m) ? 'امتلأت مساحة المعاينة على هذا الجهاز. احذفوا بعض الصور أو اربطوا الموقع بـ Supabase.'
          : /upload|bucket|mime|size/i.test(m) ? 'تعذّر رفع الصورة. جرّبوا صورة أصغر أو احفظوا المنتج دون صورة.'
            : 'تعذّر حفظ المنتج. تأكّدوا من الاتصال بالإنترنت وأعيدوا المحاولة.';
        errBox.hidden = false;
        btn.disabled = false;
        btn.textContent = isNew ? 'حفظ' : 'حفظ التعديلات';
      } finally {
        if (counted) S.pending--;
        scheduleReload(60);
      }
    });

    paintPhoto();
    setTimeout(() => { if (window.matchMedia('(min-width: 768px)').matches || isNew) nameEl.focus({ preventScroll: true }); }, 60);
  }

  // ---------- المشاركة ----------
  function openShare(product) {
    const D = S.D;
    const panel = openPanel(`
      <form novalidate>
        <div class="panel-head">
          <div><h2>مشاركة المنتج</h2><p>${esc(product.name)}</p></div>
          <button type="button" class="icon-btn" data-close aria-label="إغلاق">${icon('i-close')}</button>
        </div>
        <div class="panel-body">
          <p class="panel-note">حدّدوا الأشخاص المرتبطين بهذا المنتج. يكفي شراؤه مرة واحدة لتظهر علامة الشراء عند الجميع.</p>
          <ul class="checks">${D.members.map((m) => `<li><label><input type="checkbox" value="${m.id}" ${product.member_ids.includes(m.id) ? 'checked' : ''}>${esc(m.name)}</label></li>`).join('')}</ul>
          <button type="button" class="btn-text" data-all style="margin-top:10px">اختيار الجميع</button>
          <p class="err" data-err hidden>يلزم اختيار شخص واحد على الأقل</p>
        </div>
        <div class="panel-foot"><button type="submit" class="btn btn-primary btn-wide">حفظ</button></div>
      </form>`, { tone: product.section_id });
    const form = panel.querySelector('form');
    const boxes = () => $$('input[type=checkbox]', form);
    form.querySelector('[data-all]').addEventListener('click', () => boxes().forEach((b) => { b.checked = true; }));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ids = boxes().filter((b) => b.checked).map((b) => b.value);
      if (!ids.length) { form.querySelector('[data-err]').hidden = false; return; }
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'جارٍ الحفظ…';
      S.pending++;
      try {
        await S.store.saveProduct(product.id, {
          section_id: product.section_id, category_id: product.category_id || '', name: product.name,
          description: product.description || '', image_path: product.image_path || '', is_shared: ids.length > 1,
        }, ids);
        closePanel(true);
        toast(ids.length > 1 ? 'أصبح المنتج مشتركًا' : 'حُفظت التعديلات');
      } catch (ex) {
        console.error(ex);
        btn.disabled = false; btn.textContent = 'حفظ';
        toast('تعذّر حفظ المشاركة. أعيدوا المحاولة.', { type: 'error' });
      } finally { S.pending--; scheduleReload(60); }
    });
  }

  // ---------- تصغير الصورة قبل الرفع ----------
  async function compressImage(file, maxSide, quality) {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      if (img.decode) await img.decode(); else await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      const w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) throw new Error('empty');
      const scale = Math.min(1, maxSide / Math.max(w, h));
      const cw = Math.round(w * scale), ch = Math.round(h * scale);
      const canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      const c2 = canvas.getContext('2d');
      c2.fillStyle = '#fff'; c2.fillRect(0, 0, cw, ch);
      c2.drawImage(img, 0, 0, cw, ch);
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
      if (!blob) throw new Error('encode');
      return blob;
    } catch (e) {
      if (/^image\/(jpeg|png|webp|gif)$/.test(file.type) && file.size <= 5 * 1024 * 1024) return file;
      throw new Error('image_unreadable');
    } finally { URL.revokeObjectURL(url); }
  }

  // ---------- إضافة تصنيف ----------
  function startAddCategory() {
    const box = $('#add-cat');
    const sid = S.route.section;
    box.innerHTML = `<input maxlength="60" placeholder="اسم التصنيف" aria-label="اسم التصنيف الجديد"><button class="btn btn-primary" type="button">إضافة</button><button class="btn btn-text" type="button">إلغاء</button>`;
    const input = box.querySelector('input');
    const [ok, cancel] = box.querySelectorAll('button');
    input.focus();
    const done = async () => {
      const name = input.value.trim();
      if (!name) { input.focus(); return; }
      ok.disabled = true;
      try {
        await S.store.addCategory(sid, name);
        toast('أُضيف التصنيف');
        await reload();
      } catch (e) {
        ok.disabled = false;
        toast(e.message === 'category_exists' ? 'هذا التصنيف موجود من قبل' : 'تعذّرت إضافة التصنيف', { type: 'error' });
      }
    };
    ok.addEventListener('click', done);
    cancel.addEventListener('click', () => render());
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') done(); if (e.key === 'Escape') render(); });
  }

  // ---------------------------------------------------------------
  // الرسائل
  // ---------------------------------------------------------------
  function toast(msg, opts) {
    opts = opts || {};
    const host = $('#toasts');
    while (host.firstChild) host.firstChild.remove(); // رسالة واحدة في كل مرة
    const t = document.createElement('div');
    t.className = 'toast' + (opts.type === 'error' ? ' error' : '');
    t.setAttribute('role', opts.type === 'error' ? 'alert' : 'status');
    t.innerHTML = `<span>${esc(msg)}</span>`;
    if (opts.action) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = opts.action.label;
      b.addEventListener('click', () => { t.remove(); opts.action.fn(); });
      t.appendChild(b);
    }
    host.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, opts.action ? 5000 : 2800);
  }

  function openZoom(src) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `<img src="${esc(src)}" alt="صورة المنتج"><button class="icon-btn" aria-label="إغلاق">${icon('i-close')}</button>`;
    lb.addEventListener('click', () => lb.remove());
    document.body.appendChild(lb);
  }

  // ---------------------------------------------------------------
  // الأحداث
  // ---------------------------------------------------------------
  function bindGlobal() {
    document.addEventListener('click', (e) => {
      if (menuEl && !e.target.closest('.menu') && !e.target.closest('[data-action=more]')) closeMenu();
      const a = e.target.closest('[data-action]');
      if (!a) return;
      const id = a.dataset.id;
      switch (a.dataset.action) {
        case 'buy': toggleBuy(id); break;
        case 'more': if (menuEl && menuEl.dataset.for === id) closeMenu(); else openMenu(a, id); break;
        case 'edit': closeMenu(); openProductForm(S.D.productById[id]); break;
        case 'share': closeMenu(); openShare(S.D.productById[id]); break;
        case 'delete':
          if (!a.classList.contains('armed')) { a.classList.add('armed'); a.querySelector('span').textContent = 'اضغطوا مرة أخرى للحذف'; }
          else { closeMenu(); deleteProduct(id); }
          break;
        case 'add': openProductForm(null); break;
        case 'status': S.status = a.dataset.v; S.sticky.clear(); LS.set('wl.status', S.status); render(); break;
        case 'add-cat': startAddCategory(); break;
        case 'search': location.hash = '#search'; break;
        case 'zoom': openZoom(a.dataset.src); break;
        case 'retry': reload().then((ok) => { if (ok) onRoute(); }); break;
        default: break;
      }
    });
    $('#panel-root .backdrop').addEventListener('click', () => closePanel(false));
    $('#panel-root').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closePanel(true); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if ($('.lightbox')) { $('.lightbox').remove(); return; }
      if (menuEl) { closeMenu(); return; }
      closePanel(false);
    });
    window.addEventListener('resize', closeMenu);
    window.addEventListener('online', () => { $('#offline-banner').hidden = true; scheduleReload(0); });
    window.addEventListener('offline', () => { $('#offline-banner').hidden = false; });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') scheduleReload(0); });
    $('#q').addEventListener('input', (e) => { S.q = e.target.value; renderSearch(); });
    $('#logout').addEventListener('click', async () => {
      try { await S.store.signOut(); } catch (e) { /* */ }
      S.subscribed = false;
      showLogin();
    });
  }

  window.__wishlist = { S, reload };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
