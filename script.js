/* ═══════════════════════════════════════════════════════════════
   JK TECH ENGINEERING — MASTER SITE SCRIPT
   ═══════════════════════════════════════════════════════════════ */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const on = (el, ev, fn, o) => el ? (el.addEventListener(ev, fn, o), () => el.removeEventListener(ev, fn)) : () => {};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── NAVBAR ──────────────────────────────────────────── */
const Navbar = (() => {
  const nav = $('#nav');
  if (!nav) return { init() {} };
  let ticking = false;
  const update = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
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

/* ─── MOBILE MENU ─────────────────────────────────────── */
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

/* ─── SMOOTH SCROLL ───────────────────────────────────── */
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

/* ─── SCROLL PROGRESS ─────────────────────────────────── */
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

/* ─── SCROLL REVEAL ───────────────────────────────────── */
const ScrollReveal = (() => ({
  init() {
    const elements = $$('[data-reveal]');
    if (!elements.length) return;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
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
    $$('.hero__title').forEach(el => setTimeout(() => el.classList.add('is-in'), 200));
  }
}))();

/* ─── PAGE TRANSITIONS ────────────────────────────────── */
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
      document.addEventListener('click', (e) => {
        const link = e.target instanceof Element ? e.target.closest('a') : null;
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;
        if (href.startsWith('http') || href.startsWith('mailto') ||
            href.startsWith('tel') || href.startsWith('#') ||
            href.includes('wa.me') || link.target === '_blank') return;
        if (href.endsWith('.html') || href === '/' || !href.includes('.')) {
          e.preventDefault();
          navigate(href);
        }
      });
      document.body.style.opacity = '0';
      requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        document.body.style.opacity = '1';
      });
    }
  };
})();

/* ─── SERVICES ACCORDION ──────────────────────────────── */
const Services = (() => {
  const IMAGES = {
    design:    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
    supply:    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80',
    tc:        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80',
    breakdown: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80',
    amc:       'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80',
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
      tabs.forEach(t => {
        const head = $('.svc-tab__head', t);
        if (head) on(head, 'click', () => activate(t.dataset.svc));
      });
    }
  };
})();

/* ─── SYSTEMS EXPLORER ────────────────────────────────── */
const SystemsExplorer = (() => ({
  init() {
    const tabs = $$('.systab');
    const layers = $$('.sys-layer');
    const title = $('#sysTitle');
    const desc = $('#sysDesc');
    if (!tabs.length) return;
    const data = {
      'fire-alarm':     { title: 'Fire Alarm',           desc: 'Fire detection and alarm system solutions based on project-specific requirements.' },
      'fire-fighting':  { title: 'Fire Fighting',        desc: 'Fire protection and firefighting system solutions based on project requirements.' },
      'cctv':           { title: 'CCTV',                 desc: 'Video surveillance and monitoring solutions for security and situational awareness.' },
      'access-control': { title: 'Access Control',       desc: 'Controlled access and entry management systems.' },
      'intrusion':      { title: 'Intrusion Detection',  desc: 'Security systems designed to identify unauthorized access or intrusion events.' },
      'pa':             { title: 'PA / Voice Evacuation',desc: 'Public address and voice evacuation solutions supporting emergency communication.' },
      'other':          { title: 'Other Systems',        desc: 'Additional Life Safety and Security System solutions based on project requirements.' }
    };
    const activate = (key) => {
      tabs.forEach(t => {
        const active = t.dataset.system === key;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      layers.forEach(l => l.classList.toggle('is-active', l.dataset.system === key));
      const meta = data[key];
      if (meta) {
        if (title) title.textContent = meta.title;
        if (desc) desc.textContent = meta.desc;
      }
    };
    tabs.forEach(tab => on(tab, 'click', () => activate(tab.dataset.system)));
    activate('fire-alarm');
  }
}))();

/* ─── ENQUIRY FORM ────────────────────────────────────── */
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
    const setErr = (k, m) => {
      const f = fields[k];
      if (!f) return;
      if (f.err) f.err.textContent = m || '';
      const wrap = f.el.closest('.f-field');
      if (wrap) wrap.classList.toggle('has-error', !!m);
    };
    const validate = (k) => {
      const f = fields[k];
      if (!f) return true;
      const r = f.valid(f.el.value);
      if (r === true) { setErr(k, ''); return true; }
      setErr(k, r); return false;
    };
    Object.keys(fields).forEach(k => {
      const f = fields[k];
      if (!f.el) return;
      on(f.el, 'blur', () => validate(k));
      on(f.el, 'input', () => {
        const wrap = f.el.closest('.f-field');
        if (wrap && wrap.classList.contains('has-error')) validate(k);
      });
    });
    const emailEl = fields.email.el, replyTo = $('#f-replyto');
    if (emailEl && replyTo) on(emailEl, 'input', () => { replyTo.value = emailEl.value; });
    on(form, 'submit', async (e) => {
      e.preventDefault();
      const honey = $('#f-website');
      if (honey && honey.value) return;
      const ok = Object.keys(fields).every(k => validate(k));
      if (!ok) {
        status.textContent = 'Please correct the highlighted fields.';
        status.className = 'form-status is-error';
        return;
      }
      btn.disabled = true;
      btn.classList.add('is-loading');
      status.textContent = 'Sending your enquiry…';
      status.className = 'form-status';
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
        const res = await fetch('https://formspree.io/f/xzeblnpy', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: fd
        });
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
      } finally {
        btn.disabled = false;
        btn.classList.remove('is-loading');
      }
    });
  }
}))();

/* ═══════════════════════════════════════════════════════════════
   PROJECTS DATA
   ═══════════════════════════════════════════════════════════════ */
const JK_PROJECTS = [
  { id: 1,  title: 'Fire Fighting Pump House Installation',  category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Thanjavur, TN',   year: '2024', image: './images/fire-fighting/fire-pump.jpg',     description: 'Jockey, sprinkler and hydrant electric pumps with control panel and pressure switches.' },
  { id: 2,  title: 'Fire Fighting Pipeline Network',         category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Kumbakonam, TN',  year: '2024', image: './images/fire-fighting/fire-pipeline.jpg', description: 'MS & GI pipe network with hydrant valves, section line indicators and pressure gauges.' },
  { id: 3,  title: 'Fire Fighting System Installation',       category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Trichy, TN',      year: '2024', image: './images/fire-fighting/fire-system.jpg',   description: 'Complete fire fighting system installation with pipeline and control panel.' },
  { id: 4,  title: 'Fire Fighting Valve Assembly',            category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Thanjavur, TN',   year: '2024', image: './images/fire-fighting/fire-valves.jpg',   description: 'Butterfly, sluice, gate and NRV valves with pressure control assembly.' },
  { id: 5,  title: 'Fire Fighting Pump Room',                 category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Kumbakonam, TN',  year: '2024', image: './images/fire-fighting/images.jpg',        description: 'Fire fighting pump room with jockey, sprinkler and hydrant pumps.' },
  { id: 6,  title: 'Fire Fighting Equipment Setup',           category: 'fire-fighting', categoryLabel: 'Fire Fighting', location: 'Thanjavur, TN',   year: '2024', image: './images/fire-fighting/product-jpeg.jpg',  description: 'Fire fighting equipment installation with control panels.' },
  { id: 7,  title: 'Addressable Fire Alarm System',           category: 'fire-alarm', categoryLabel: 'Fire Alarm', location: 'Thanjavur, TN',  year: '2024', image: './images/fire-alarm/FIRE ALARM.webp', description: 'Honeywell addressable fire alarm with smoke detectors, MCPs and central panel.' },
  { id: 8,  title: 'Conventional Fire Alarm Installation',    category: 'fire-alarm', categoryLabel: 'Fire Alarm', location: 'Chennai, TN',    year: '2024', image: './images/fire-alarm/fire-alarm.jpg',   description: 'Ravel conventional fire alarm panel with detectors, hooters and response indicators.' },
  { id: 9,  title: 'Fire Alarm Control Panel Setup',          category: 'fire-alarm', categoryLabel: 'Fire Alarm', location: 'Kumbakonam, TN', year: '2024', image: './images/fire-alarm/FIRE ALARM.webp', description: 'Addressable fire alarm control panel programming and commissioning.' },
  { id: 10, title: 'Fire Detection System',                   category: 'fire-alarm', categoryLabel: 'Fire Alarm', location: 'Trichy, TN',     year: '2024', image: './images/fire-alarm/fire-alarm.jpg',   description: 'Fire detection with smoke detectors, heat detectors and response indicators.' },
  { id: 11, title: 'Fire Alarm Testing & Commissioning',      category: 'fire-alarm', categoryLabel: 'Fire Alarm', location: 'Madurai, TN',    year: '2024', image: './images/fire-alarm/FIRE ALARM.webp', description: 'Fire alarm system testing, functional verification and handover.' },
  { id: 12, title: 'CCTV Surveillance System',                category: 'cctv', categoryLabel: 'CCTV', location: 'Thanjavur, TN',  year: '2024', image: './images/cctv/cctv-camera-system-500x500.webp', description: 'IP-based CCTV with NVR, remote access and 24x7 monitoring.' },
  { id: 13, title: 'Industrial CCTV Installation',            category: 'cctv', categoryLabel: 'CCTV', location: 'Trichy, TN',     year: '2024', image: './images/cctv/cctv-camera-system-500x500.webp', description: 'Industrial-grade dome and bullet cameras with fiber network.' },
  { id: 14, title: 'Perimeter Surveillance System',           category: 'cctv', categoryLabel: 'CCTV', location: 'Kumbakonam, TN', year: '2024', image: './images/cctv/cctv-camera-system-500x500.webp', description: 'Perimeter CCTV covering entry, exit and boundary zones.' },
  { id: 15, title: 'CCTV Control Room Setup',                 category: 'cctv', categoryLabel: 'CCTV', location: 'Chennai, TN',    year: '2024', image: './images/cctv/cctv-camera-system-500x500.webp', description: 'Central control room with video wall and monitoring station.' },
  { id: 16, title: 'Access Control System',                   category: 'access', categoryLabel: 'Access Control', location: 'Thanjavur, TN',  year: '2024', image: './images/access-control/access-control-1686229276357-854x6.webp', description: 'Multi-door access control with card readers and centralised management.' },
  { id: 17, title: 'Door Access Management',                  category: 'access', categoryLabel: 'Access Control', location: 'Coimbatore, TN', year: '2024', image: './images/access-control/Untitled-design-19.webp',                  description: 'Biometric and card-based door access system with audit trail.' },
  { id: 18, title: 'Restricted Area Access Control',          category: 'access', categoryLabel: 'Access Control', location: 'Chennai, TN',    year: '2024', image: './images/access-control/access-control-1686229276357-854x6.webp', description: 'Server room and restricted zone access management.' },
  { id: 19, title: 'Perimeter Intrusion Detection',           category: 'intrusion', categoryLabel: 'Intrusion Detection', location: 'Thanjavur, TN', year: '2024', image: './images/access-control/Untitled-design-19.webp',                  description: 'Perimeter intrusion detection with motion sensors and alert system.' },
  { id: 20, title: 'Burglar Alarm System',                    category: 'intrusion', categoryLabel: 'Intrusion Detection', location: 'Trichy, TN',    year: '2024', image: './images/access-control/access-control-1686229276357-854x6.webp', description: 'Burglar alarm with central monitoring and remote alerts.' },
  { id: 21, title: 'Bosch Public Address System',             category: 'pa', categoryLabel: 'PA / Voice', location: 'Thanjavur, TN', year: '2024', image: './images/pa-system/bosch-public-address-systems-.jpg', description: 'Bosch public address and voice evacuation system with zone control and emergency communication.' },
  { id: 22, title: 'Voice Evacuation System',                 category: 'pa', categoryLabel: 'PA / Voice', location: 'Chennai, TN',   year: '2024', image: './images/pa-system/bosch-public-address-systems-.jpg', description: 'Digital voice evacuation with emergency communication and fire integration.' },
  { id: 23, title: 'Clean Agent Suppression System',          category: 'other', categoryLabel: 'Clean Agent', location: 'Thanjavur, TN', year: '2024', image: './images/clean-agent/Suppression-Social.jpg', description: 'Clean agent suppression system with FM200 / Novec 1230 protection.' },
  { id: 24, title: 'Integrated Life Safety System',           category: 'other', categoryLabel: 'Integrated', location: 'Thanjavur, TN', year: '2024', image: './images/clean-agent/sddefault.jpg',           description: 'Combined fire alarm, PA and emergency communication system.' },
  { id: 25, title: 'Fire Extinguisher Supply',                category: 'other', categoryLabel: 'Fire Extinguisher', location: 'Thanjavur, TN', year: '2024', image: './images/fire-extinguisher/different-types-of-fire-extinguisher-1.webp', description: 'Supply and installation of different types of fire extinguishers — ABC, CO2, Foam and Clean Agent.' }
];

/* ─── PROJECTS PAGE ───────────────────────────────────── */
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
    const imgHTML = p.image
      ? `<img class="proj-card__img" src="${p.image}" alt="${p.title}" loading="lazy" />`
      : `<div class="proj-card__placeholder"><strong>PROJECT PHOTO</strong>Image coming soon</div>`;
    card.innerHTML = `
      ${imgHTML}
      <div class="proj-card__meta">
        <span class="proj-card__cat">${p.categoryLabel}</span>
        <span class="proj-card__title">${p.title}</span>
        <span class="proj-card__loc">${p.location}${p.year ? ' · ' + p.year : ''}</span>
      </div>
    `;
    const open = () => Lightbox.open(index, visibleList);
    on(card, 'click', open);
    on(card, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    return card;
  };

  const render = () => {
    visibleList = activeFilter === 'all'
      ? [...JK_PROJECTS]
      : JK_PROJECTS.filter(p => p.category === activeFilter);
    grid.innerHTML = '';
    const countEl = $('#projCount');
    if (countEl) {
      if (activeFilter === 'all') {
        countEl.textContent = `Showing all ${visibleList.length} project${visibleList.length === 1 ? '' : 's'}`;
      } else {
        const label = activeFilter.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        countEl.textContent = `Showing ${visibleList.length} ${label} project${visibleList.length === 1 ? '' : 's'}`;
      }
    }
    if (!visibleList.length) {
      grid.style.display = 'block';
      grid.innerHTML = '<p style="text-align:center;color:#94a3b8;font-size:.95rem;padding:3rem 1rem;">No projects in this category yet.</p>';
      return;
    }
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

/* ─── LIGHTBOX ───────────────────────────────────────── */
const Lightbox = (() => {
  const root = $('#projLightbox');
  if (!root) return { init() {}, open() {} };
  const media = $('#lbMedia'), cat = $('#lbCat'), title = $('#lbTitle'), desc = $('#lbDesc'), loc = $('#lbLoc');
  let list = [], idx = 0, lastFocus = null;

  const render = () => {
    const p = list[idx];
    if (!p) return;
    media.innerHTML = p.image
      ? `<img src="${p.image}" alt="${p.title}" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'padding:2rem;\\'><strong>PROJECT PHOTO</strong>Image coming soon</div>'" />`
      : `<div style="padding:2rem;"><strong>PROJECT PHOTO</strong>Image coming soon</div>`;
    cat.textContent = p.categoryLabel.toUpperCase();
    title.textContent = p.title;
    desc.textContent = p.description || '';
    loc.textContent = `${p.location}${p.year ? ' · ' + p.year : ''}`;
  };

  const open = (index, sourceList) => {
    list = sourceList;
    idx = index;
    lastFocus = document.activeElement;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    render();
    document.addEventListener('keydown', onKey);
  };

  const close = () => {
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
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
      $$('[data-nav]', root).forEach(el => on(el, 'click', () => {
        const dir = parseInt(el.dataset.nav, 10);
        dir > 0 ? next() : prev();
      }));
      on(root, 'click', (e) => { if (e.target === root) close(); });
      let startX = 0;
      on(root, 'touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
      on(root, 'touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
      }, { passive: true });
    },
    open, close
  };
})();

/* ─── VIDEO PLAYER ───────────────────────────────────── */
const VideoPlayer = (() => ({
  init() {
    $$('.video-card[data-video]').forEach(card => {
      on(card, 'click', (e) => {
        if (e.target.tagName === 'IFRAME' || e.target.tagName === 'VIDEO') return;
        const src = card.dataset.video;
        if (!src) return;
        const thumb = card.querySelector('.video-card__thumb');
        if (!thumb) return;
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

/* ─── 3D BUTTON TILT ─────────────────────────────────── */
const Button3D = (() => ({
  init() {
    if (prefersReducedMotion()) return;
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

/* ─── PRODUCTS PAGE ──────────────────────────────────── */
const PRODUCTS = [
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
  { category: 'extinguisher', categoryLabel: 'Extinguisher', name: 'Fire Extinguisher',       makes: ['Safex', 'Ceasefire', 'Kanex', 'Excellent', 'Andex'] },
  { category: 'clean-agent', categoryLabel: 'Clean Agent',   name: 'Clean Agent Systems',     makes: ['FK 5-1-12', 'HFC 227EA', 'Foam Tech', 'Synergy'] },
  { category: 'fire-alarm', categoryLabel: 'Fire Alarm',     name: 'Addressable Fire Alarm',  makes: ['Honeywell', 'Notifier', 'EST', 'GST', 'Ravel-Avani', 'Morley IAS', 'BOSCH', 'Ziton', 'Agni', 'Cooper'] },
  { category: 'fire-alarm', categoryLabel: 'Fire Alarm',     name: 'Conventional Fire Alarm', makes: ['Ravel', 'Bosch', 'Agni', 'System Sensor'] },
  { category: 'fire-alarm', categoryLabel: 'Fire Alarm',     name: 'Gas Leak Detector',       makes: ['Ambetronics', 'Honeywell'] },
  { category: 'fire-alarm', categoryLabel: 'Fire Alarm',     name: 'Aspiration Smoke Detector', makes: ['Honeywell Xtralis VESDA', 'Securiton', 'Minimax HELIOS'] },
  { category: 'pa', categoryLabel: 'PA / Voice', name: 'Analog PA System',   makes: ['Bosch', 'Honeywell', 'Ahuja'] },
  { category: 'pa', categoryLabel: 'PA / Voice', name: 'Digital PA System',  makes: ['Bosch', 'Honeywell'] },
  { category: 'security', categoryLabel: 'Security', name: 'CCTV Camera',      makes: ['Hikvision', 'Dahua', 'CP Plus', 'Hi Focus', 'Trueview', 'Honeywell'] },
  { category: 'security', categoryLabel: 'Security', name: 'Access Control',    makes: ['HID', 'Bosch', 'Honeywell'] },
  { category: 'security', categoryLabel: 'Security', name: 'Burglar Alarm',     makes: ['AMC-Tradesec', 'Securico', 'Active', 'Honeywell', 'Vista', 'Texecom Elite'] },
  { category: 'security', categoryLabel: 'Security', name: 'Cables',            makes: ['Polycab', 'Orbit', 'Omex'] }
];

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

const BRAND_LOGO_MAP = {
  'Kirloskar': 'kirloskar.png', 'CRI': 'cri.png', 'Grundfos': 'grundfos.png',
  'Tyco': 'tyco.png', 'Viking': 'viking.png', 'Tata': 'tata.png', 'Jindal': 'jindal.png',
  'Newage': 'newage.png', 'HD': 'hd.png', 'Kartar': 'kartar.png', 'Omex': 'omex.png',
  'Normex': 'normex.png', 'Advance': 'advance.png', 'L&T': 'lnt.png', 'Sant': 'sant.png',
  'Leader': 'leader.png', 'Zoloto': 'zoloto.png', 'Lehry': 'lehry.png', 'Amtech': 'amtech.png',
  'Honeywell': 'honeywell.png', 'Wika': 'wika.png', 'H Guru': 'hguru.png',
  'Indfos': 'indfos.png', 'Danfoss': 'danfoss.png',
  'Safex': 'safex.png', 'Ceasefire': 'ceasefire.png', 'Kanex': 'kanex.png',
  'Excellent': 'excellent.png', 'Andex': 'andex.png',
  'Notifier': 'notifier.png', 'EST': 'est.png', 'GST': 'gst.png',
  'Ravel-Avani': 'ravel.png', 'Morley IAS': 'morley.png', 'BOSCH': 'bosch.png',
  'Bosch': 'bosch.png', 'Ziton': 'ziton.png', 'Agni': 'agni.png', 'Cooper': 'cooper.png',
  'Ravel': 'ravel.png', 'System Sensor': 'systemsensor.png',
  'Ambetronics': 'ambetronics.png', 'Securiton': 'securiton.png',
  'Minimax HELIOS': 'minimax.png', 'Ahuja': 'ahuja.png',
  'Hikvision': 'hikvision.png', 'Dahua': 'dahua.png', 'CP Plus': 'cpplus.png',
  'Hi Focus': 'hifocus.png', 'Trueview': 'trueview.png', 'HID': 'hid.png',
  'AMC-Tradesec': 'amc.png', 'Securico': 'securico.png', 'Active': 'active.png',
  'Vista': 'vista.png', 'Texecom Elite': 'texecom.png', 'Polycab': 'polycab.png',
  'Orbit': 'orbit.png'
};

const getBrandSlug = (brand) => {
  const file = BRAND_LOGO_MAP[brand];
  return file ? `./images/brands/${file}` : null;
};
const getBrandInitials = (brand) => brand.split(/[\s-]+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

const ProductsPage = (() => {
  const grid = document.getElementById('productGrid');
  if (!grid) return { init() {} };
  const countEl = document.getElementById('productsCount');
  const emptyEl = document.getElementById('productEmpty');
  const searchInput = document.getElementById('productSearch');
  const tabs = Array.from(document.querySelectorAll('.products-tabs .pill'));
  let activeCategory = 'all';
  let searchQuery = '';

  const chipHTML = (brand) => {
    const slug = getBrandSlug(brand);
    const initials = getBrandInitials(brand);
    const logo = slug
      ? `<img class="chip__logo" src="${slug}" alt="${brand}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span class="chip__fallback" style="display:none;">${initials}</span>`
      : `<span class="chip__fallback">${initials}</span>`;
    return `<span class="product-chip" title="${brand}">${logo}<span class="chip__name">${brand}</span></span>`;
  };

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
      if (!q && activeCategory === 'all') countEl.textContent = `Showing all ${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
      else if (!q) { const label = tabs.find(t => t.dataset.cat === activeCategory)?.textContent || activeCategory; countEl.textContent = `Showing ${filtered.length} ${label} product${filtered.length === 1 ? '' : 's'}`; }
      else countEl.textContent = `${filtered.length} result${filtered.length === 1 ? '' : 's'} for "${searchQuery}"`;
    }
    if (!filtered.length) { if (emptyEl) emptyEl.hidden = false; return; }
    if (emptyEl) emptyEl.hidden = true;
    filtered.forEach((p, i) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.style.animationDelay = `${Math.min(i * 0.04, 0.4)}s`;
      card.innerHTML = `
        <span class="product-card__cat">${p.categoryLabel}</span>
        <h3 class="product-card__name">${p.name}</h3>
        <div class="product-card__makes">${p.makes.map(chipHTML).join('')}</div>
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
      if (searchInput) searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; render(); });
      render();
    }
  };
})();

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

/* ─── INIT ALL ───────────────────────────────────────── */
const init = () => {
  Navbar.init();
  MobileMenu.init();
  SmoothScroll.init();
  ScrollProgress.init();
  ScrollReveal.init();
  PageTransitions.init();
  Services.init();
  SystemsExplorer.init();
  Enquiry.init();
  VideoPlayer.init();
  Button3D.init();
  if ($('#projGrid')) { ProjectsPage.init(); Lightbox.init(); }
  if (document.getElementById('productGrid')) { ProductsPage.init(); BrandWall.init(); }
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
};

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();