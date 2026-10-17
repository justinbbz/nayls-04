/* Nayls 04 Esthétique — animations et interactions.
   GSAP + ScrollTrigger + Lenis (copies locales, assets/vendor). Tout reste lisible sans JavaScript ou avec « réduire les animations ». */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const root = document.documentElement;
  const CFG = window.NYCFG || {};
  const NY = window.NY || { hours: {} };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const tryStore = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* aucune */ } },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* aucune */ } }
  };

  /* ---------- toujours démarrer en haut : l'écran d'ouverture et le héros sont faits pour être vus en premier ---------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) scrollTo(0, 0);

  /* ---------- mouvement : préférence système + bouton ---------- */
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = new URLSearchParams(location.search).get('reduced');
  const saved = tryStore.get('ny-motion');
  root.dataset.motion = forced === '1' ? 'off' : forced === '0' ? 'on' : (saved || (reduceMQ.matches ? 'off' : 'on'));
  const motionOn = () => root.dataset.motion !== 'off';
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  const live = motionOn() && hasGSAP;

  const motionBtn = $('#motionBtn');
  if (motionBtn) {
    const sync = () => {
      const off = !motionOn();
      motionBtn.setAttribute('aria-pressed', String(off));
      const t = off ? 'Activer les animations' : 'Réduire les animations';
      motionBtn.title = t; $('.sr-only', motionBtn).textContent = t;
    };
    sync();
    motionBtn.addEventListener('click', () => { tryStore.set('ny-motion', motionOn() ? 'off' : 'on'); location.search = location.search.replace(/[?&]reduced=\d/, '').replace(/^&/, '?'); });
  }

  /* ---------- utilitaires partagés (focus piégé, annonce) ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trapFocus(box, e) {
    if (e.key !== 'Tab') return;
    const f = $$(FOCUSABLE, box).filter(el => el.offsetParent !== null || el === document.activeElement);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  let lenis = null;
  const scrollToEl = (target, opt = {}) => {
    const el = typeof target === 'string' ? $(target) : target; if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: opt.offset ?? -64, duration: opt.duration ?? 1.4 });
    else el.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto', block: 'start' });
  };
  const toastEl = document.createElement('div');
  toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.hidden = true;
  document.body.appendChild(toastEl);
  let toastT = 0;
  function toast(msg, label, fn) {
    toastEl.innerHTML = '';
    const s = document.createElement('span'); s.textContent = msg; toastEl.appendChild(s);
    if (label) { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', () => { toastEl.hidden = true; fn && fn(); }); toastEl.appendChild(b); }
    toastEl.hidden = false; toastEl.classList.remove('is-in'); void toastEl.offsetWidth; toastEl.classList.add('is-in');
    clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, 5200);
  }
  window.NYUI = { trapFocus, toast, scrollTo: scrollToEl, get lenis() { return lenis; } };

  /* ---------- défilement fluide ---------- */
  if (live && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), wheelMultiplier: .95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = $(id); if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(el, { offset: id === '#accueil' ? 0 : -60 });
    history.replaceState(null, '', id);
    if (el.tabIndex < 0 && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    setTimeout(() => el.focus({ preventScroll: true }), 700);
  });

  /* ---------- en-tête, menu, progression, barre mobile ---------- */
  const hd = $('#hd'), progress = $('#progress'), menu = $('#menu'), burger = $('#burger'), mbar = $('.mbar');
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    hd.classList.toggle('is-solid', y > 40);
    if (progress) progress.style.setProperty('--sp', max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
    const down = y > lastY + 4, up = y < lastY - 4;
    if (y > 520 && down && menu.hidden) hd.classList.add('is-hidden'); else if (up || y < 120) hd.classList.remove('is-hidden');
    if (Math.abs(y - lastY) > 4) lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function closeMenu() { if (!menu || menu.hidden) return; menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); $('.sr-only', burger).textContent = 'Ouvrir le menu'; root.classList.remove('is-locked'); document.body.classList.remove('is-locked'); lenis && lenis.start(); }
  burger.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open; burger.setAttribute('aria-expanded', String(open)); $('.sr-only', burger).textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    document.body.classList.toggle('is-locked', open); hd.classList.remove('is-hidden');
    open ? lenis && lenis.stop() : lenis && lenis.start();
    if (open) $('a', menu).focus();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  // lien actif du menu
  const spy = $$('.nav a'), secs = spy.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { spy.forEach(a => { const on = a.getAttribute('href') === '#' + en.target.id; a.classList.toggle('is-on', on); on ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'); }); } }), { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => io.observe(s));
    // barre d'actions du téléphone : masquée dans la réservation
    const bookSec = $('#reserver');
    if (mbar && bookSec) new IntersectionObserver(es => es.forEach(en => mbar.classList.toggle('is-off', en.isIntersecting))).observe(bookSec);
  }

  /* ---------- film du héros ---------- */
  const film = $('#film'), filmBtn = $('#filmBtn');
  if (film) {
    const small = matchMedia('(max-width: 720px)').matches;
    // une seule vidéo est demandée : la version légère sur téléphone, l'autre sur ordinateur (la source est posée ici, pas dans le HTML)
    if (CFG.FILM) { film.poster = small ? CFG.FILM.posterMobile : CFG.FILM.posterDesktop; if (small) { film.width = 720; film.height = 960; } if (motionOn()) { film.preload = 'auto'; film.src = small ? CFG.FILM.mobile : CFG.FILM.desktop; } }
    let userPaused = false, visible = true;
    const sync = () => {
      const want = motionOn() && !userPaused && visible && !document.hidden;
      if (want) { const p = film.play(); p && p.catch(() => {}); } else film.pause();
      if (filmBtn) { filmBtn.setAttribute('aria-pressed', String(userPaused || !motionOn())); $('.sr-only', filmBtn).textContent = (userPaused || !motionOn()) ? 'Lancer le film' : 'Mettre le film en pause'; }
    };
    if (filmBtn) filmBtn.addEventListener('click', () => { if (!motionOn()) { tryStore.set('ny-motion', 'on'); location.reload(); return; } userPaused = !userPaused; sync(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }, { threshold: .05 }).observe(film);
    document.addEventListener('visibilitychange', sync);
    film.addEventListener('canplay', sync, { once: true });
    sync();
  }

  /* ---------- écran d'ouverture puis entrée du héros ---------- */
  const pre = $('#pre');
  let readied = false;
  function ready() {
    if (readied) return; readied = true;
    root.classList.add('is-ready');
    if (pre) setTimeout(() => { pre.hidden = true; }, 1400);
    if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 300);
  }
  if (pre && live && !tryStore.sget('ny-pre')) {
    tryStore.sset('ny-pre', '1');
    const bar = $('#preBar'), cnt = $('#preCount'), o = { v: 0 };
    document.body.classList.add('is-locked'); lenis && lenis.stop();
    const loaded = new Promise(r => { if (document.readyState === 'complete') r(); else addEventListener('load', r, { once: true }); });
    let done = false;
    const finish = () => { if (done) return; done = true; pre.classList.add('is-out'); document.body.classList.remove('is-locked'); lenis && lenis.start(); setTimeout(ready, 650); };
    gsap.to(o, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate() { const v = Math.round(o.v); cnt.textContent = v; bar.style.transform = 'scaleX(' + (o.v / 100) + ')'; }, onComplete() { loaded.then(finish); } });
    setTimeout(finish, 4200);
    pre.addEventListener('click', finish);
  } else { if (pre) pre.hidden = true; ready(); }

  /* ---------- fonctions de mise en scène (seulement si GSAP et mouvement) ---------- */
  function words(el, mode) {
    // découpe le texte en mots ; conserve les balises <em>
    let n = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(c => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(tok => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            if (mode === 'mask') { w.className = 'sw'; const i = document.createElement('span'); i.className = 'swi'; i.style.setProperty('--w', n++); i.textContent = tok; w.appendChild(i); }
            else { w.className = 'w'; w.textContent = tok; n++; }
            frag.appendChild(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    };
    walk(el);
    return n;
  }

  if (live) {
    /* révélations */
    $$('.split').forEach(el => { const label = el.textContent.trim(); words(el, 'mask'); el.setAttribute('aria-label', label); $$('.sw', el).forEach(w => w.setAttribute('aria-hidden', 'true')); ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => el.classList.add('is-in') }); });
    ScrollTrigger.batch('.reveal', { start: 'top 90%', once: true, onEnter: els => els.forEach((el, i) => { el.style.setProperty('--d', i * 110); el.classList.add('is-in'); }) });

    /* manifeste : les mots s'allument au défilement */
    const man = $('[data-words]');
    if (man) {
      const label = man.textContent.trim(); const n = words(man, 'w'); man.setAttribute('aria-label', label);
      const ws = $$('.w', man); ws.forEach(w => w.setAttribute('aria-hidden', 'true'));
      ScrollTrigger.create({ trigger: man, start: 'top 78%', end: 'bottom 48%', onUpdate: s => { const k = Math.round(s.progress * (n + 2)); ws.forEach((w, i) => w.classList.toggle('is-lit', i < k)); } });
    }

    /* compteurs */
    $$('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), plus = !!el.dataset.plus, o = { v: 0 };
      const fmt = v => (plus ? '+' : '') + v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      el.textContent = fmt(0);
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: target, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); }, onComplete: () => { el.textContent = fmt(target); } }) });
    });

    /* parallaxes */
    $$('.amedia').forEach(f => { const img = $('img', f), sp = parseFloat(f.dataset.speed || 0.06); gsap.fromTo(img, { yPercent: -sp * 100 }, { yPercent: sp * 100, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } }); });
    const arch = $('.arch__clip');
    if (arch) {
      gsap.to($('.arch'), { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to($('.hero__copy'), { yPercent: -5, opacity: .35, ease: 'none', scrollTrigger: { trigger: '.hero', start: '35% top', end: 'bottom top', scrub: true } });
      gsap.to('.palm--a', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    const drop = $('.naya__drop'); if (drop) gsap.fromTo(drop, { y: 40 }, { y: -60, ease: 'none', scrollTrigger: { trigger: '.naya', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* bandeau : défile plus vite quand on défile */
    const band = $('#band');
    if (band) {
      band.innerHTML += band.innerHTML; band.style.animation = 'none';
      const tl = gsap.to(band, { xPercent: -50, duration: 46, ease: 'none', repeat: -1 });
      if (lenis) lenis.on('scroll', ({ velocity }) => { const v = clamp(Math.abs(velocity) / 8, 0, 4); gsap.to(tl, { timeScale: 1 + v, duration: .3, overwrite: true, onComplete: () => gsap.to(tl, { timeScale: 1, duration: 1.2 }) }); });
      const bandBox = band.parentElement; bandBox.addEventListener('mouseenter', () => gsap.to(tl, { timeScale: 0, duration: .5 })); bandBox.addEventListener('mouseleave', () => gsap.to(tl, { timeScale: 1, duration: .5 }));
    }
  } else {
    // sans animations : les compteurs montrent leur valeur finale, le bandeau défile à la main
    $$('[data-count]').forEach(el => { el.textContent = el.textContent; });
  }

  /* ---------- Instagram : rangées sans fin ---------- */
  $$('.ig__row').forEach(row => {
    if (!live) return;
    Array.from(row.children).forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); $$('a', c).forEach(a => a.setAttribute('tabindex', '-1')); row.appendChild(c); });
  });

  /* ---------- carte des tarifs : onglets ---------- */
  const carte = $('#carte');
  if (carte) {
    const tabs = $$('.ctab', carte), panels = $$('.cpanel', carte), figs = $$('.visual__fig');
    panels.forEach(p => $$('.row', p).forEach((r, i) => r.style.setProperty('--i', i)));
    const show = (id, focus) => {
      tabs.forEach(t => { const on = t.dataset.g === id; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      panels.forEach(p => { const on = p.dataset.g === id; p.hidden = !on; p.classList.toggle('is-on', on); p.classList.remove('is-in'); if (on) { void p.offsetWidth; p.classList.add('is-in'); } });
      figs.forEach(f => f.classList.toggle('is-on', f.dataset.g === id));
    };
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.g)));
    $('.ctabs', carte).addEventListener('keydown', e => {
      const i = tabs.findIndex(t => t === document.activeElement); if (i < 0) return;
      let n = -1; if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length; else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = tabs.length - 1;
      if (n >= 0) { e.preventDefault(); show(tabs[n].dataset.g, true); }
    });
    panels[0] && panels[0].classList.add('is-in');
    // « + » : ajoute à la réservation
    carte.addEventListener('click', e => {
      const b = e.target.closest('[data-book]'); if (!b) return;
      const r = window.NYRdv && window.NYRdv.addItem(b.dataset.book);
      const row = b.closest('.row'); if (row) row.classList.toggle('is-sel', !!(r && r.selected));
      if (r && r.msg) toast(r.msg, r.selected ? 'Voir mon message' : '', () => scrollToEl('#reserver'));
    });
  }
  $$('[data-book-group]').forEach(a => a.addEventListener('click', () => window.NYRdv && window.NYRdv.openGroup(a.dataset.bookGroup)));

  /* ---------- créations : rail horizontal épinglé, visionneuse ---------- */
  const crea = $('#creations'), list = $('#creaList'), rail = $('#creaRail'), pin = $('#creaPin');
  const cardsEls = $$('.card:not(.card--end)', list || document);
  const total = cardsEls.length;
  const now = $('#creaNow'), bar = $('#creaBar');
  const setProg = p => { if (bar) crea.style.setProperty('--cp', clamp(p, 0, 1).toFixed(4)); if (now) now.textContent = String(clamp(Math.round(p * (total - 1)) + 1, 1, total)).padStart(2, '0'); };
  if (crea && list) {
    const pinned = live && hasGSAP && innerWidth >= 900 && matchMedia('(hover: hover)').matches;
    if (pinned) {
      const dist = () => Math.max(0, list.scrollWidth - innerWidth + 8);
      const tw = gsap.to(list, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: pin, pin: true, start: 'top top', end: () => '+=' + Math.round(dist() * 1.15), scrub: .7, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => setProg(s.progress) } });
      cardsEls.forEach(c => { const img = $('img', c); gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } }); });
    } else {
      crea.classList.add('is-native');
      const upd = () => { const m = rail.scrollWidth - rail.clientWidth; setProg(m > 0 ? rail.scrollLeft / m : 0); };
      rail.addEventListener('scroll', upd, { passive: true }); upd();
    }
  }
  // visionneuse
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let lbItems = [], lbIdx = 0, lbFrom = null;
  const lbOpen = (items, i, from) => { lbItems = items; lbFrom = from || document.activeElement; lb.hidden = false; document.body.classList.add('is-locked'); lenis && lenis.stop(); lbShow(i); $('#lbX').focus(); };
  const lbShow = i => {
    lbIdx = (i + lbItems.length) % lbItems.length; const it = lbItems[lbIdx];
    lbImg.src = it.full; lbImg.alt = it.alt; lbImg.width = it.w; lbImg.height = it.h; lbCap.textContent = it.cap;
    const multi = lbItems.length > 1; $('#lbPrev').hidden = !multi; $('#lbNext').hidden = !multi;
    if (multi) [lbIdx + 1, lbIdx - 1].forEach(k => { const o = lbItems[(k + lbItems.length) % lbItems.length]; const im = new Image(); im.src = o.full; });
  };
  const lbClose = () => { lb.hidden = true; document.body.classList.remove('is-locked'); lenis && lenis.start(); lbFrom && lbFrom.focus && lbFrom.focus({ preventScroll: true }); };
  const itemOf = b => ({ full: b.dataset.full, w: b.dataset.w, h: b.dataset.h, alt: b.dataset.alt, cap: b.dataset.cap });
  if (lb) {
    const btns = $$('.card__btn');
    btns.forEach((b, i) => b.addEventListener('click', () => lbOpen(btns.map(itemOf), i, b)));
    const cb = $('#cardBtn'); if (cb) cb.addEventListener('click', () => lbOpen([itemOf(cb)], 0, cb));
    $('#lbX').addEventListener('click', lbClose); $('#lbPrev').addEventListener('click', () => lbShow(lbIdx - 1)); $('#lbNext').addEventListener('click', () => lbShow(lbIdx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
    lb.addEventListener('keydown', e => { if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowLeft') lbShow(lbIdx - 1); else if (e.key === 'ArrowRight') lbShow(lbIdx + 1); else trapFocus(lb, e); });
    let sx = null; lb.addEventListener('pointerdown', e => { sx = e.clientX; }); lb.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 60 && lbItems.length > 1) lbShow(lbIdx + (e.clientX < sx ? 1 : -1)); sx = null; });
  }

  /* ---------- avant / après des cils : deux arches en léger décalage ---------- */
  if (live) $$('.duo__item').forEach(f => { const sp = parseFloat(f.dataset.speed || 0); gsap.fromTo(f, { y: -sp * 600 }, { y: sp * 600, ease: 'none', scrollTrigger: { trigger: '.duo', start: 'top bottom', end: 'bottom top', scrub: true } }); });

  /* ---------- avis : défilement, boutons, glisser ---------- */
  const track = $('#revTrack');
  if (track) {
    const step = () => { const c = $('.rev', track); return c ? c.getBoundingClientRect().width + 20 : 320; };
    const rb = $('#revBar');
    const upd = () => { const m = track.scrollWidth - track.clientWidth; const p = m > 0 ? track.scrollLeft / m : 0; if (rb) rb.style.setProperty('--rp', (0.08 + p * 0.92).toFixed(3)); $('#revPrev').disabled = track.scrollLeft < 4; $('#revNext').disabled = track.scrollLeft > m - 4; };
    track.addEventListener('scroll', upd, { passive: true }); upd(); addEventListener('resize', upd);
    $('#revPrev').addEventListener('click', () => track.scrollBy({ left: -step() * 1.5, behavior: motionOn() ? 'smooth' : 'auto' }));
    $('#revNext').addEventListener('click', () => track.scrollBy({ left: step() * 1.5, behavior: motionOn() ? 'smooth' : 'auto' }));
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag'); });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; track.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('is-drag'); });
  }

  /* ---------- ouvert maintenant, jour du jour ---------- */
  const openEl = $('#openNow');
  if (openEl) {
    const parts = () => {
      const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      const g = t => f.find(p => p.type === t).value;
      const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[g('weekday')];
      return { wd, min: (+g('hour') % 24) * 60 + +g('minute') };
    };
    const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
    const hLabel = s => { const [h, m] = s.split(':').map(Number); return h + ' h' + (m ? ' ' + String(m).padStart(2, '0') : ''); };
    const tick = () => {
      const { wd, min } = parts(); const h = NY.hours[wd];
      $$('.hours tr').forEach(tr => tr.classList.toggle('is-today', +tr.dataset.d === wd));
      let txt, open = false;
      if (h && min >= toMin(h[0]) && min < toMin(h[1])) { open = true; txt = 'Ouvert maintenant · jusqu’à ' + hLabel(h[1]); }
      else if (h && min < toMin(h[0])) txt = 'Fermé · ouvre aujourd’hui à ' + hLabel(h[0]);
      else { let k = 1; while (k < 8 && !NY.hours[(wd + k) % 7]) k++; const nh = NY.hours[(wd + k) % 7]; txt = 'Fermé · ouvre ' + (k === 1 ? 'demain' : 'dans ' + k + ' jours') + ' à ' + (nh ? hLabel(nh[0]) : '—'); }
      openEl.classList.toggle('is-open', open); $('span', openEl).textContent = txt;
    };
    tick(); setInterval(tick, 60000);
  }

  /* ---------- carte à la demande ---------- */
  const mapBtn = $('#mapBtn');
  if (mapBtn) mapBtn.addEventListener('click', () => {
    const m = $('#map'); const f = document.createElement('iframe');
    f.src = CFG.MAP_EMBED; f.title = 'Carte Google : ' + CFG.ADDRESS; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
    $$('.map__btn, .map__note', m).forEach(x => x.remove()); m.appendChild(f);
  });

  /* ---------- curseur et boutons magnétiques (souris seulement) ---------- */
  if (live && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cur = $('#cursor'); root.classList.add('has-cursor');
    const dot = $('i', cur), ring = $('span', cur); let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cur.classList.add('is-on'); const t = e.target; cur.classList.toggle('is-link', !!t.closest('a, button, [role="button"], input, .ba__range, .rev__track, .card__btn')); cur.classList.toggle('is-dark', !!t.closest('.crea, .infos, .ft, .lb, .sum')); }, { passive: true });
    gsap.ticker.add(() => { rx += (x - rx) * .18; ry += (y - ry) * .18; dot.style.transform = `translate(${x}px, ${y}px)`; ring.style.transform = `translate(${rx}px, ${ry}px)` + (cur.classList.contains('is-link') ? ' scale(1.7)' : ''); });
    $$('.btn--dark, .btn--pearl, .hero__cta .btn').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 8}px, ${((e.clientY - r.top) / r.height - .5) * 6}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- hauteur de la page qui change (réservation) : recalcul des repères ---------- */
  if (hasGSAP && 'ResizeObserver' in window) {
    let t = 0; const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 250); });
    ['#reserver', '#avis', '#instagram'].forEach(s => { const el = $(s); el && ro.observe(el); });
  }
  addEventListener('load', () => { hasGSAP && ScrollTrigger.refresh(); });
})();
