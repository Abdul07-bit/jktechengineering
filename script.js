/* ═══════════════════════════════════════════════════════════════
   JK TECH ENGINEERING — SITE SCRIPT
   Smooth scroll, page transitions, reveal animations
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const on = (el, ev, fn, o) => el ? (el.addEventListener(ev, fn, o), () => el.removeEventListener(ev, fn)) : () => {};

/* ─── NAVBAR ────────────────────────────────────────────── */
const Navbar = (() => {
  const nav = $('#nav');
  if (!nav) return { init() {} };
  let ticking = false;
  const update = () => { nav.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; };
  return {
    init() {
      update();
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      }, { passive: true });
    }
  };
})();

/* ─── MOBILE MENU ───────────────────────────────────────── */
const MobileMenu = (() => {
  const menu = $('#mobileMenu');
  const burger = $('#navBurger');
  if (!menu || !burger) return { init() {} };
  let open = false;
  const openMenu = () => {
    open = true;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    open = false;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  return {
    init() {
      on(burger, 'click', () => open ? closeMenu() : openMenu());
      $$('[data-close]', menu).forEach(el => on(el, 'click', closeMenu));
      $$('.mmenu__links a', menu).forEach(el => on(el, 'click', closeMenu));
      on(document, 'keydown', (e) => { if (e.key === 'Escape' && open) closeMenu(); });
    }
  };
})();

/* ─── SMOOTH SCROLL (with easing) ───────────────────────── */
const SmoothScroll = (() => {
  const NAV_OFFSET = 110;
  return {
    init() {
      document.addEventListener('click', (e) => {
        const link = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        const target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        const startY = window.scrollY;
        const targetY = target.getBoundingClientRect().top + startY - NAV_OFFSET;
        const distance = targetY - startY;
        const duration = Math.min(1200, Math.max(600, Math.abs(distance) * 0.5));
        let startTime = null;
        const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = ease(progress);
          window.scrollTo(0, startY + distance * eased);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        history.replaceState(null, '', href);
      });
    }
  };
})();

/* ─── SCROLL PROGRESS BAR ───────────────────────────────── */
const ScrollProgress = (() => {
  const bar = $('#scrollProgress');
  if (!bar) return { init() {} };
  let ticking = false;
  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = pct + '%';
    ticking = false;
  };
  return {
    init() {
      update();
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      }, { passive: true });
    }
  };
})();

/* ─── SCROLL REVEAL ─────────────────────────────────────── */
const ScrollReveal = (() => ({
  init() {
    const elements = $$('[data-reveal]');
    if (!elements.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-in'));
      $$('.hero__title').forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
    elements.forEach(el => io.observe(el));

    // Hero title reveal lines
    $$('.hero__title').forEach(el => {
      setTimeout(() => el.classList.add('is-in'), 200);
    });
  }
}))();

/* ─── PAGE TRANSITIONS ──────────────────────────────────── */
const PageTransitions = (() => {
  const overlay = $('#pageTransition');
  if (!overlay) return { init() {} };

  const navigate = (href) => {
    overlay.classList.add('is-active');
    document.body.classList.add('is-leaving');
    setTimeout(() => { window.location.href = href; }, 480);
  };

  return {
    init() {
      // Intercept internal link clicks
      document.addEventListener('click', (e) => {
        const link = e.target instanceof Element ? e.target.closest('a') : null;
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;

        // Skip external, mailto, tel, hash, whatsapp
        if (href.startsWith('http') || href.startsWith('mailto') ||
            href.startsWith('tel') || href.startsWith('#') ||
            href.includes('wa.me') || link.target === '_blank') return;

        // Only transition between HTML pages
        if (href.endsWith('.html') || href === '/' || !href.includes('.')) {
          e.preventDefault();
          navigate(href);
        }
      });

      // Fade in on page load
      document.body.style.opacity = '0';
      requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        document.body.style.opacity = '1';
      });
    }
  };
})();

/* ─── SERVICES ACCORDION ────────────────────────────────── */
const Services = (() => {
  const IMAGES = {
    design:    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
    supply:    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80',
    tc:        'https://images.unsplash.com/photo-1581091870621-1c0e5b0d6f8e?auto=format&fit=crop&w=900&q=80',
    breakdown: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80',
    amc:       'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80',
    om:        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80'
  };
  const CAPTIONS = {
    design:    { num: '01', name: 'DESIGN', text: 'Providing system design and engineering solutions based on project requirements, applicable standards, risk assessment, site conditions and client specifications.' },
    supply:    { num: '02', name: 'SUPPLY', text: 'Supplying quality Life Safety and Security System equipment, materials and accessories suitable for project requirements and approved specifications.' },
    tc:        { num: '03', name: 'TESTING & COMMISSIONING', text: 'Conducting systematic testing, functional verification, programming and commissioning to ensure systems operate safely and effectively as intended.' },
    breakdown: { num: '04', name: 'BREAKDOWN & SERVICE CALLS', text: 'Providing prompt troubleshooting, fault diagnosis, repair and rectification services to restore the normal operation of Life Safety and Security Systems.' },
    amc:       { num: '05', name: 'AMC', text: 'Annual Maintenance Contract — scheduled preventive maintenance, periodic inspection, testing and servicing to ensure system reliability and continuous operational readiness.' },
    om:        { num: '06', name: 'O&M', text: 'Operation & Maintenance — comprehensive support including system monitoring, routine maintenance, inspections, testing, documentation and technical assistance.' }
  };
  return {
    init() {
      const tabs = $$('.svc-tab');
      const img = $('#svcImg img');
      const cap = $('#svcCaption');
      if (!tabs.length || !img) return;
      const activate = (key) => {
        tabs.forEach(t => t.classList.toggle('is-active', t.dataset.svc === key));
        const i = IMAGES[key], c = CAPTIONS[key];
        if (i) { img.style.opacity = '0'; setTimeout(() => { img.src = i; img.style.opacity = '1'; }, 220); }
        if (c && cap) cap.innerHTML = `<p class="label-line label-line--red"><span class="label-line__rule"></span>${c.num} — ${c.name}</p><p class="services__caption-text">${c.text}</p>`;
      };
      tabs.forEach(t => { const head = $('.svc-tab__head', t); if (head) on(head, 'click', () => activate(t.dataset.svc)); });
    }
  };
})();

/* ─── ENQUIRY ───────────────────────────────────────────── */
const Enquiry = (() => ({
  init() {
    const form = $('#enquiryForm');
    if (!form) return;
    const btn = $('#submitBtn');
    const status = $('#formStatus');
    const fields = {
      name:    { el: $('#f-name'),    err: $('#err-name'),    valid: v => v.trim().length >= 2 || 'Please enter your name.' },
      phone:   { el: $('#f-phone'),   err: $('#err-phone'),   valid: v => /^[0-9+\-\s()]{7,20}$/.test(v.trim()) || 'Please enter a valid phone number.' },
      email:   { el: $('#f-email'),   err: $('#err-email'),   valid: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email.' },
      message: { el: $('#f-message'), err: $('#err-message'), valid: v => v.trim().length >= 10 || 'Please provide a short message (10+ characters).' }
    };
    const setErr = (k, m) => { const f = fields[k]; if (!f) return; if (f.err) f.err.textContent = m || ''; const wrap = f.el.closest('.f-field'); if (wrap) wrap.classList.toggle('has-error', !!m); };
    const validate = (k) => { const f = fields[k]; if (!f) return true; const r = f.valid(f.el.value); if (r === true) { setErr(k, ''); return true; } setErr(k, r); return false; };
    Object.keys(fields).forEach(k => { const f = fields[k]; if (!f.el) return; on(f.el, 'blur', () => validate(k)); on(f.el, 'input', () => { const w = f.el.closest('.f-field'); if (w && w.classList.contains('has-error')) validate(k); }); });
    const emailEl = fields.email.el, replyTo = $('#f-replyto');
    if (emailEl && replyTo) on(emailEl, 'input', () => { replyTo.value = emailEl.value; });
    on(form, 'submit', async (e) => {
      e.preventDefault();
      const honey = $('#f-website');
      if (honey && honey.value) return;
      const ok = Object.keys(fields).every(k => validate(k));
      if (!ok) { status.textContent = 'Please correct the highlighted fields.'; status.className = 'form-status is-error'; return; }
      btn.disabled = true; btn.classList.add('is-loading'); status.textContent = 'Sending your enquiry…'; status.className = 'form-status';
      const fd = new FormData();
      fd.append('name', fields.name.el.value.trim());
      fd.append('company', $('#f-company')?.value.trim() || '');
      fd.append('phone', fields.phone.el.value.trim());
      fd.append('email', fields.email.el.value.trim());
      fd.append('projectType', $('#f-ptype')?.value || '');
      fd.append('projectLocation', $('#f-ploc')?.value.trim() || '');
      fd.append('service', $('#f-service')?.value || '');
      fd.append('message', fields.message.el.value.trim());
      fd.append('_subject', 'New Enquiry — JK Tech Engineering Website');
      fd.append('_replyto', fields.email.el.value.trim());
      try {
        const res = await fetch('https://formspree.io/f/xzeblnpy', { method: 'POST', headers: { 'Accept': 'application/json' }, body: fd });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        status.textContent = 'Thank you — your enquiry has been received. We will respond shortly.';
        status.className = 'form-status is-success';
        form.reset();
        Object.keys(fields).forEach(k => setErr(k, ''));
        if (replyTo) replyTo.value = '';
      } catch (err) {
        console.error('[Formspree error]', err);
        status.textContent = 'Something went wrong. Please email jktechengineering25@gmail.com or call +91 93425 06864.';
        status.className = 'form-status is-error';
      } finally { btn.disabled = false; btn.classList.remove('is-loading'); }
    });
  }
}))();

/* ─── PROJECTS DATA ─────────────────────────────────────── */
const JK_PROJECTS = [
  { id: 1,  title: 'Fire Fighting Pipeline System',  category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Tamil Nadu', year: '2024', image: './images/projects/project-1.jpeg',  description: 'Fire protection pipeline installation with pumps, valves and hydrant connections.' },
  { id: 2,  title: 'Fire Fighting Pipeline System',  category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Tamil Nadu', year: '2024', image: './images/projects/project-2.jpeg',  description: 'Fire protection pipeline installation with pumps, valves and hydrant connections.' },
  { id: 3,  title: 'Fire Fighting Pipeline System',  category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Tamil Nadu', year: '2024', image: './images/projects/project-3.jpeg',  description: 'Fire protection pipeline installation with pumps, valves and hydrant connections.' },
  { id: 4,  title: 'Fire Alarm System',              category: 'fire-alarm',    categoryLabel: 'Fire Alarm',    location: 'Tamil Nadu', year: '2024', image: './images/projects/project-4.jpeg',  description: 'Fire detection and alarm system installation with control panel and detectors.' },
  { id: 5,  title: 'Fire Alarm System',              category: 'fire-alarm',    categoryLabel: 'Fire Alarm',    location: 'Tamil Nadu', year: '2024', image: './images/projects/project-5.jpeg',  description: 'Fire detection and alarm system installation with control panel and detectors.' },
  { id: 6,  title: 'Fire Alarm System',              category: 'fire-alarm',    categoryLabel: 'Fire Alarm',    location: 'Tamil Nadu', year: '2024', image: './images/projects/project-6.jpeg',  description: 'Fire detection and alarm system installation with control panel and detectors.' },
  { id: 7,  title: 'CCTV Surveillance System',       category: 'cctv',          categoryLabel: 'CCTV',          location: 'Tamil Nadu', year: '2024', image: './images/projects/project-7.jpeg',  description: 'IP-based CCTV surveillance installation with NVR storage and monitoring.' },
  { id: 8,  title: 'CCTV Surveillance System',       category: 'cctv',          categoryLabel: 'CCTV',          location: 'Tamil Nadu', year: '2024', image: './images/projects/project-8.jpeg',  description: 'IP-based CCTV surveillance installation with NVR storage and monitoring.' },
  { id: 9,  title: 'CCTV Surveillance System',       category: 'cctv',          categoryLabel: 'CCTV',          location: 'Tamil Nadu', year: '2024', image: './images/projects/project-9.jpeg',  description: 'IP-based CCTV surveillance installation with NVR storage and monitoring.' },
  { id: 10, title: 'Access Control System',          category: 'access',        categoryLabel: 'Access Control', location: 'Tamil Nadu', year: '2024', image: './images/projects/project-10.jpeg', description: 'Access control installation with card readers and entry management.' },
  { id: 11, title: 'Access Control System',          category: 'access',        categoryLabel: 'Access Control', location: 'Tamil Nadu', year: '2024', image: './images/projects/project-11.jpeg', description: 'Access control installation with card readers and entry management.' },
  { id: 12, title: 'Fire Protection Pipeline',       category: 'pipeline',      categoryLabel: 'Pipeline',      location: 'Tamil Nadu', year: '2024', image: './images/projects/project-12.jpeg', description: 'Fire protection pipeline network with hydrant valves and hose connections.' },
  { id: 13, title: 'Fire Protection Pipeline',       category: 'pipeline',      categoryLabel: 'Pipeline',      location: 'Tamil Nadu', year: '2024', image: './images/projects/project-13.jpeg', description: 'Fire protection pipeline network with hydrant valves and hose connections.' },
  { id: 14, title: 'Fire Protection Pipeline',       category: 'pipeline',      categoryLabel: 'Pipeline',      location: 'Tamil Nadu', year: '2024', image: './images/projects/project-14.jpeg', description: 'Fire protection pipeline network with hydrant valves and hose connections.' },
  { id: 15, title: 'Fire Fighting Equipment',        category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Tamil Nadu', year: '2024', image: './images/projects/project-15.jpeg', description: 'Fire fighting equipment installation including pumps and control panels.' },
  { id: 16, title: 'Fire Fighting Equipment',        category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Tamil Nadu', year: '2024', image: './images/projects/project-16.jpeg', description: 'Fire fighting equipment installation including pumps and control panels.' },
  { id: 17, title: 'Fire Fighting Equipment',        category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Tamil Nadu', year: '2024', image: './images/projects/project-17.jpeg', description: 'Fire fighting equipment installation including pumps and control panels.' },
  { id: 18, title: 'Fire Safety Installation',       category: 'fire-alarm',    categoryLabel: 'Fire Alarm',    location: 'Tamil Nadu', year: '2024', image: './images/projects/project-18.jpeg', description: 'Fire safety system installation and commissioning.' },
  { id: 19, title: 'Fire Safety Installation',       category: 'fire-alarm',    categoryLabel: 'Fire Alarm',    location: 'Tamil Nadu', year: '2024', image: './images/projects/project-19.jpeg', description: 'Fire safety system installation and commissioning.' },
  { id: 20, title: 'Fire Safety Installation',       category: 'fire-alarm',    categoryLabel: 'Fire Alarm',    location: 'Tamil Nadu', year: '2024', image: './images/projects/project-20.jpeg', description: 'Fire safety system installation and commissioning.' },
  { id: 21, title: 'Integrated Life Safety System',  category: 'other',         categoryLabel: 'Integrated',    location: 'Tamil Nadu', year: '2024', image: './images/projects/project-21.jpeg', description: 'Integrated life safety and security system installation.' },
  { id: 22, title: 'Integrated Life Safety System',  category: 'other',         categoryLabel: 'Integrated',    location: 'Tamil Nadu', year: '2024', image: './images/projects/project-22.jpeg', description: 'Integrated life safety and security system installation.' },
  { id: 23, title: 'Integrated Life Safety System',  category: 'other',         categoryLabel: 'Integrated',    location: 'Tamil Nadu', year: '2024', image: './images/projects/project-23.jpeg', description: 'Integrated life safety and security system installation.' },
  { id: 24, title: 'Project Installation',           category: 'other',         categoryLabel: 'Installation',  location: 'Tamil Nadu', year: '2024', image: './images/projects/project-24.jpeg', description: 'Life safety system installation and commissioning.' },
  { id: 25, title: 'Project Installation',           category: 'other',         categoryLabel: 'Installation',  location: 'Tamil Nadu', year: '2024', image: './images/projects/project-25.jpeg', description: 'Life safety system installation and commissioning.' }
];

/* ─── PROJECTS PAGE ─────────────────────────────────────── */
const ProjectsPage = (() => {
  const grid = $('#projGrid');
  if (!grid) return { init() {} };
  let activeFilter = 'all';
  let visibleList = [];
  const renderCard = (p, index) => {
    const card = document.createElement('article');
    card.className = 'proj-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.dataset.idx = index;
    const imgHTML = p.image ? `<img class="proj-card__img" src="${p.image}" alt="${p.title}" loading="lazy" />` : `<div class="proj-card__placeholder"><strong>PROJECT PHOTO</strong>Image coming soon</div>`;
    card.innerHTML = `${imgHTML}<div class="proj-card__meta"><span class="proj-card__cat">${p.categoryLabel}</span><span class="proj-card__title">${p.title}</span><span class="proj-card__loc">${p.location}${p.year ? ' · ' + p.year : ''}</span></div>`;
    const open = () => Lightbox.open(index, visibleList);
    on(card, 'click', open);
    on(card, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    return card;
  };
  const render = () => {
    visibleList = activeFilter === 'all' ? [...JK_PROJECTS] : JK_PROJECTS.filter(p => p.category === activeFilter);
    grid.innerHTML = '';
    const countEl = $('#projCount');
    if (countEl) {
      if (activeFilter === 'all') countEl.textContent = `Showing all ${visibleList.length} project${visibleList.length === 1 ? '' : 's'}`;
      else { const label = activeFilter.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); countEl.textContent = `Showing ${visibleList.length} ${label} project${visibleList.length === 1 ? '' : 's'}`; }
    }
    if (!visibleList.length) { grid.style.display = 'block'; grid.innerHTML = '<p style="text-align:center;color:#94a3b8;font-size:.95rem;padding:3rem 1rem;">No projects in this category yet.</p>'; return; }
    grid.style.display = 'grid';
    visibleList.forEach((p, i) => grid.appendChild(renderCard(p, i)));
    $$('.proj-card__img', grid).forEach(img => {
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const parent = img.parentElement;
        if (parent && !parent.querySelector('.proj-card__placeholder')) {
          const ph = document.createElement('div');
          ph.className = 'proj-card__placeholder';
          ph.innerHTML = '<strong>PROJECT PHOTO</strong>Image coming soon';
          parent.insertBefore(ph, parent.firstChild);
        }
      });
    });
  };
  return {
    init() {
      const pills = $$('.proj-filters .pill');
      pills.forEach(p => on(p, 'click', () => {
        pills.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
        p.classList.add('is-active');
        p.setAttribute('aria-selected', 'true');
        activeFilter = p.dataset.filter || 'all';
        render();
      }));
      render();
    }
  };
})();

/* ─── LIGHTBOX ──────────────────────────────────────────── */
const Lightbox = (() => {
  const root = $('#projLightbox');
  if (!root) return { init() {}, open() {} };
  const media = $('#lbMedia'), cat = $('#lbCat'), title = $('#lbTitle'), desc = $('#lbDesc'), loc = $('#lbLoc');
  let list = [], idx = 0, lastFocus = null;
  const render = () => {
    const p = list[idx]; if (!p) return;
    media.innerHTML = p.image ? `<img src="${p.image}" alt="${p.title}" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'padding:2rem;\\'><strong>PROJECT PHOTO</strong>Image coming soon</div>'" />` : `<div style="padding:2rem;"><strong>PROJECT PHOTO</strong>Image coming soon</div>`;
    cat.textContent = p.categoryLabel.toUpperCase();
    title.textContent = p.title;
    desc.textContent = p.description || '';
    loc.textContent = `${p.location}${p.year ? ' · ' + p.year : ''}`;
  };
  const open = (index, sourceList) => {
    list = sourceList; idx = index; lastFocus = document.activeElement;
    root.classList.add('is-open'); root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    render(); document.addEventListener('keydown', onKey);
  };
  const close = () => {
    root.classList.remove('is-open'); root.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  const next = () => { if (list.length) { idx = (idx + 1) % list.length; render(); } };
  const prev = () => { if (list.length) { idx = (idx - 1 + list.length) % list.length; render(); } };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  };
  return {
    init() {
      $$('[data-close]', root).forEach(el => on(el, 'click', close));
      $$('[data-nav]', root).forEach(el => on(el, 'click', () => { const dir = parseInt(el.dataset.nav, 10); dir > 0 ? next() : prev(); }));
      on(root, 'click', (e) => { if (e.target === root) close(); });
      let startX = 0;
      on(root, 'touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
      on(root, 'touchend', (e) => { const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 50) dx < 0 ? next() : prev(); }, { passive: true });
    },
    open, close
  };
})();

/* ─── VIDEO PLAYER ──────────────────────────────────────── */
const VideoPlayer = (() => ({
  init() {
    $$('.video-card[data-video]').forEach(card => {
      on(card, 'click', (e) => {
        if (e.target.tagName === 'IFRAME' || e.target.tagName === 'VIDEO') return;
        const src = card.dataset.video; if (!src) return;
        const thumb = card.querySelector('.video-card__thumb'); if (!thumb) return;
        if (src.includes('youtube.com') || src.includes('youtu.be') || (!src.startsWith('./') && !src.endsWith('.mp4'))) {
          const id = src.replace(/.*(?:v=|youtu\.be\/|embed\/)/, '').split(/[?&]/)[0];
          thumb.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" title="Project video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:0;border-radius:inherit;"></iframe>`;
        } else {
          thumb.innerHTML = `<video src="${src}" controls autoplay playsinline style="width:100%;height:100%;object-fit:cover;border-radius:inherit;background:#000;"></video>`;
        }
      });
    });
  }
}))();

/* ─── 3D BUTTON MOUSE-TRACKING TILT ─────────────────────── */
const Button3D = (() => ({
  init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 900) return;
    $$('.btn--3d').forEach(btn => {
      on(btn, 'mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const tiltX = y * -6;
        const tiltY = x * 6;
        btn.style.transform = `translateY(-4px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
      });
      on(btn, 'mouseleave', () => { btn.style.transform = ''; });
    });
  }
}))();

/* ─── INIT ──────────────────────────────────────────────── */
const init = () => {
  Navbar.init();
  MobileMenu.init();
  SmoothScroll.init();
  ScrollProgress.init();
  ScrollReveal.init();
  PageTransitions.init();
  Services.init();
  Enquiry.init();
  VideoPlayer.init();
  Button3D.init();
  if ($('#projGrid')) { ProjectsPage.init(); Lightbox.init(); }
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
};

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
  /* ═══════════════════════════════════════════════════════════════
   PRODUCTS & MAKES PAGE
   ═══════════════════════════════════════════════════════════════

   HOW TO ADD A PRODUCT:
   Copy a block from the array below, edit, and paste inside the array.
   ═══════════════════════════════════════════════════════════════ */

const PRODUCTS = [
  // ─── FIREFIGHTING SYSTEM ────────────────────────────────
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Fire Pump',               makes: ['Kirloskar', 'CRI', 'Grundfos'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Sprinkler',               makes: ['Tyco', 'Viking'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'MS & GI Pipe',            makes: ['Tata', 'Jindal'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Hydrant Valves',          makes: ['Newage', 'HD', 'Kartar', 'Omex', 'Normex'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Butterfly Valve',         makes: ['Kartar', 'Omex', 'Advance', 'L&T', 'Sant', 'Leader'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Ball Valve',              makes: ['Zoloto', 'Leader', 'Lehry', 'L&T', 'Amtech'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Sluice / Gate Valve',     makes: ['HD', 'Omex', 'Normex', 'L&T', 'Advance', 'Kartar', 'Leader'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'NRV (Non-Return Valve)',  makes: ['Kartar', 'Omex', 'Normex'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Hose Reel Drum',          makes: ['Newage', 'Kartar', 'HD'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Fire Brigade Inlet',      makes: ['HD', 'Newage', 'Kartar'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'RRL Hose & Nozzle',       makes: ['Newage', 'Kartar'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Flow Switch',             makes: ['Honeywell', 'Wika'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Flexible Hose',           makes: ['Tyco', 'Viking'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Pressure Gauge',          makes: ['H Guru', 'Wika'] },
  { category: 'firefighting', categoryLabel: 'Firefighting', name: 'Pressure Switch',         makes: ['Indfos', 'Danfoss'] },

  // ─── FIRE EXTINGUISHER ──────────────────────────────────
  { category: 'extinguisher', categoryLabel: 'Extinguisher', name: 'Fire Extinguisher',       makes: ['Safex', 'Ceasefire', 'Kanex', 'Excellent', 'Andex'] },

  // ─── CLEAN AGENT ────────────────────────────────────────
  { category: 'clean-agent', categoryLabel: 'Clean Agent',   name: 'Clean Agent Systems',     makes: ['FK 5-1-12', 'HFC 227EA', 'Foam Tech', 'Synergy'] },

  // ─── FIRE ALARM SYSTEM ──────────────────────────────────
  { category: 'fire-alarm', categoryLabel: 'Fire Alarm',     name: 'Addressable Fire Alarm',  makes: ['Honeywell', 'Notifier', 'EST', 'GST', 'Ravel-Avani', 'Morley IAS', 'BOSCH', 'Ziton', 'Agni', 'Cooper'] },
  { category: 'fire-alarm', categoryLabel: 'Fire Alarm',     name: 'Conventional Fire Alarm', makes: ['Ravel', 'Bosch', 'Agni', 'System Sensor'] },
  { category: 'fire-alarm', categoryLabel: 'Fire Alarm',     name: 'Gas Leak Detector',       makes: ['Ambetronics', 'Honeywell'] },
  { category: 'fire-alarm', categoryLabel: 'Fire Alarm',     name: 'Aspiration Smoke Detector', makes: ['Honeywell Xtralis VESDA', 'Securiton', 'Minimax HELIOS'] },

  // ─── PA / VOICE EVACUATION ──────────────────────────────
  { category: 'pa', categoryLabel: 'PA / Voice', name: 'Analog PA System',   makes: ['Bosch', 'Honeywell', 'Ahuja'] },
  { category: 'pa', categoryLabel: 'PA / Voice', name: 'Digital PA System',  makes: ['Bosch', 'Honeywell'] },

  // ─── SECURITY SYSTEMS ───────────────────────────────────
  { category: 'security', categoryLabel: 'Security', name: 'CCTV Camera',      makes: ['Hikvision', 'Dahua', 'CP Plus', 'Hi Focus', 'Trueview', 'Honeywell'] },
  { category: 'security', categoryLabel: 'Security', name: 'Access Control',    makes: ['HID', 'Bosch', 'Honeywell'] },
  { category: 'security', categoryLabel: 'Security', name: 'Burglar Alarm',     makes: ['AMC-Tradesec', 'Securico', 'Active', 'Honeywell', 'Vista', 'Texecom Elite'] },
  { category: 'security', categoryLabel: 'Security', name: 'Cables',            makes: ['Polycab', 'Orbit', 'Omex'] }
];

/* ─── BRAND LOGOS WALL ──────────────────────────────────────
   HOW TO ADD A BRAND LOGO:
   1. Save the logo as a PNG (transparent or white background)
   2. Place it in: ./images/brands/
   3. Add an entry below with name + image path
   4. If you don't have the logo yet, remove the `image` field — it
      will show the brand name in text instead (graceful fallback).
   ═══════════════════════════════════════════════════════════ */

const BRAND_LOGOS = [
  { name: 'Tyco',        image: './images/brands/tyco.png' },
  { name: 'NewAge',      image: './images/brands/newage.png' },
  { name: 'Kirloskar',   image: './images/brands/kirloskar.png' },
  { name: 'Honeywell',   image: './images/brands/honeywell.png' },
  { name: 'Bosch',       image: './images/brands/bosch.png' },
  { name: 'Hikvision',   image: './images/brands/hikvision.png' },
  { name: 'CP Plus',     image: './images/brands/cpplus.png' },
  { name: 'Ceasefire',   image: './images/brands/ceasefire.png' },
  { name: 'Viking',      image: './images/brands/viking.png' },
  { name: 'Grundfos',    image: './images/brands/grundfos.png' },
  { name: 'Notifier',    image: './images/brands/notifier.png' },
  { name: 'Polycab',     image: './images/brands/polycab.png' }
];

/* ─── PRODUCTS PAGE CONTROLLER ────────────────────────────── */
const ProductsPage = (() => {
  const grid = document.getElementById('productGrid');
  if (!grid) return { init() {} };

  const countEl = document.getElementById('productsCount');
  const emptyEl = document.getElementById('productEmpty');
  const searchInput = document.getElementById('productSearch');
  const tabs = Array.from(document.querySelectorAll('.products-tabs .pill'));

  let activeCategory = 'all';
  let searchQuery = '';

  const render = () => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = PRODUCTS.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.categoryLabel.toLowerCase().includes(q)) return true;
      if (p.makes.some(m => m.toLowerCase().includes(q))) return true;
      return false;
    });

    grid.innerHTML = '';

    if (countEl) {
      if (!q && activeCategory === 'all') {
        countEl.textContent = `Showing all ${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
      } else if (!q) {
        const label = tabs.find(t => t.dataset.cat === activeCategory)?.textContent || activeCategory;
        countEl.textContent = `Showing ${filtered.length} ${label} product${filtered.length === 1 ? '' : 's'}`;
      } else {
        countEl.textContent = `${filtered.length} result${filtered.length === 1 ? '' : 's'} for "${searchQuery}"`;
      }
    }

    if (!filtered.length) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    filtered.forEach((p, i) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.style.animationDelay = `${Math.min(i * 0.04, 0.4)}s`;
      card.innerHTML = `
        <span class="product-card__cat">${p.categoryLabel}</span>
        <h3 class="product-card__name">${p.name}</h3>
        <div class="product-card__makes">
          ${p.makes.map(m => `<span class="product-chip">${m}</span>`).join('')}
        </div>
      `;
      grid.appendChild(card);
    });
  };

  return {
    init() {
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
          tab.classList.add('is-active');
          tab.setAttribute('aria-selected', 'true');
          activeCategory = tab.dataset.cat || 'all';
          render();
        });
      });

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          render();
        });
      }

      render();
    }
  };
})();

/* ─── BRAND WALL CONTROLLER ───────────────────────────────── */
const BrandWall = (() => {
  const wall = document.getElementById('brandWall');
  if (!wall) return { init() {} };

  return {
    init() {
      wall.innerHTML = BRAND_LOGOS.map(b => `
        <div class="brand-card" title="${b.name}">
          ${b.image
            ? `<img class="brand-card__img" src="${b.image}" alt="${b.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
               <span class="brand-card__name-fallback" style="display:none;">${b.name}</span>`
            : `<span class="brand-card__name-fallback">${b.name}</span>`}
        </div>
      `).join('');
    }
  };
})();

/* ─── BOOT NEW PAGES ──────────────────────────────────────── */
const bootNewPages = () => {
  if (document.getElementById('productGrid')) {
    ProductsPage.init();
    BrandWall.init();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootNewPages);
} else {
  bootNewPages();
}