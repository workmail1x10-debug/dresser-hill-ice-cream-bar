/* Dresser Hill Ice Cream Bar — Global scripts */
(function () {
  'use strict';

  const onReady = (fn) =>
    document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  onReady(() => {
    setupHeader();
    setupMobileMenu();
    setupReveal();
    setupParallax();
    setupTestimonials();
    setupGalleryFilter();
    setupLightbox();
    setupContactForm();
    setupScrollTop();
  });

  /* ---------- Sticky header shadow ---------- */
  function setupHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    const onScroll = () =>
      header.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu (in-header expand; no fixed overlay) ---------- */
  function setupMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (!toggle || !nav) return;

    function setMenuOpen(open) {
      toggle.classList.toggle('open', open);
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', () => setMenuOpen(!nav.classList.contains('open')));
    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') setMenuOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) setMenuOpen(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && nav.classList.contains('open')) setMenuOpen(false);
    });
  }

  /* ---------- Scroll-triggered reveal ---------- */
  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Hero parallax ---------- */
  function setupParallax() {
    const layers = document.querySelectorAll('.hero__bg');
    if (!layers.length) return;
    const mq = window.matchMedia('(max-width: 768px)');
    if (mq.matches) return;
    const onScroll = () => {
      const y = Math.min(window.scrollY, 900);
      layers.forEach((l, i) => {
        const depth = l.classList.contains('hero__bg--sunset') ? 0.18 : 0.32;
        l.style.transform = `translate3d(0, ${y * depth}px, 0) scale(${1 + y * 0.0004})`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Testimonial carousel ---------- */
  function setupTestimonials() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    const slides = carousel.querySelectorAll('.testimonial');
    const dotsWrap = carousel.querySelector('.carousel__dots');
    if (!slides.length || !dotsWrap) return;

    let idx = 0;
    let timer;

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Show testimonial ${i + 1}`);
      b.addEventListener('click', () => show(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = dotsWrap.querySelectorAll('button');

    function show(n, manual) {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      if (manual) restart();
    }
    function next() { show(idx + 1); }
    function restart() {
      clearInterval(timer);
      timer = setInterval(next, 6500);
    }
    show(0);
    restart();
    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', restart);
  }

  /* ---------- Gallery filter ---------- */
  function setupGalleryFilter() {
    const filters = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.gallery__item');
    if (!filters.length || !items.length) return;
    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        filters.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        items.forEach((it) => {
          const match = cat === 'all' || it.dataset.category === cat;
          it.classList.toggle('hidden', !match);
        });
      });
    });
  }

  /* ---------- Lightbox ---------- */
  function setupLightbox() {
    const items = document.querySelectorAll('.gallery__item');
    if (!items.length) return;

    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = `
      <button class="lightbox__close" aria-label="Close">✕</button>
      <button class="lightbox__prev" aria-label="Previous">‹</button>
      <img alt="" />
      <button class="lightbox__next" aria-label="Next">›</button>
    `;
    document.body.appendChild(box);
    const img = box.querySelector('img');
    const close = box.querySelector('.lightbox__close');
    const prev = box.querySelector('.lightbox__prev');
    const next = box.querySelector('.lightbox__next');

    let current = 0;
    const getVisible = () =>
      Array.from(items).filter((it) => !it.classList.contains('hidden'));

    function open(i) {
      const visible = getVisible();
      if (!visible.length) return;
      current = i;
      const node = visible[current].querySelector('img');
      img.src = node.src;
      img.alt = node.alt || '';
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function shut() {
      box.classList.remove('open');
      document.body.style.overflow = '';
    }
    function step(dir) {
      const visible = getVisible();
      current = (current + dir + visible.length) % visible.length;
      const node = visible[current].querySelector('img');
      img.src = node.src;
      img.alt = node.alt || '';
    }

    items.forEach((it, i) => {
      it.addEventListener('click', () => {
        const visible = getVisible();
        open(visible.indexOf(it));
      });
    });
    close.addEventListener('click', shut);
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    box.addEventListener('click', (e) => { if (e.target === box) shut(); });
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') shut();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Contact / apply forms (Web3Forms) ---------- */
  function setupContactForm() {
    document.querySelectorAll('.form').forEach((form) => {
      const success = form.querySelector('.form-success');
      if (!success) return;
      const accessKey = form.querySelector('input[name="access_key"]');
      if (!accessKey) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

      let errorEl = form.querySelector('.form-error');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'form-error';
        errorEl.setAttribute('role', 'alert');
        success.parentNode.insertBefore(errorEl, success);
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const botcheck = form.querySelector('input[name="botcheck"]');
        if (botcheck && botcheck.checked) return;

        success.classList.remove('show');
        errorEl.classList.remove('show');

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending…';
        }

        try {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new FormData(form),
          });
          const data = await res.json().catch(() => ({}));

          if (res.ok && data.success) {
            success.classList.add('show');
            form.reset();
            setTimeout(() => success.classList.remove('show'), 8000);
          } else {
            errorEl.textContent = (data && data.message)
              ? data.message
              : 'Something went wrong. Please try again or call us at (508) 434-0100.';
            errorEl.classList.add('show');
          }
        } catch (err) {
          errorEl.textContent = 'Network error. Please try again or call us at (508) 434-0100.';
          errorEl.classList.add('show');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
          }
        }
      });
    });
  }

  /* ---------- Scroll-to-top ---------- */
  function setupScrollTop() {
    const btn = document.querySelector('.to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }
})();
