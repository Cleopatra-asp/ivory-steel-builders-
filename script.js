document.addEventListener('DOMContentLoaded', () => {

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile nav toggle ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.classList.toggle('active', isOpen);
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
      });
    });
  }

  /* ---------- image fade-in on load (hero + lazy photos) ---------- */
  const markLoaded = (img) => img.classList.add('is-loaded');

  const heroImg = document.getElementById('heroImg');
  if (heroImg) {
    if (heroImg.complete && heroImg.naturalWidth > 0) markLoaded(heroImg);
    else heroImg.addEventListener('load', () => markLoaded(heroImg), { once: true });
  }

  document.querySelectorAll('.project-media img, .process-photo img').forEach(img => {
    if (img.complete && img.naturalWidth > 0) markLoaded(img);
    else img.addEventListener('load', () => markLoaded(img), { once: true });
    // fallback: never leave an image invisible even if 'load' is missed
    img.addEventListener('error', () => markLoaded(img), { once: true });
  });

  /* ---------- throttled scroll handling (progress rail + header bg) ---------- */
  const beamProgress = document.getElementById('beamProgress');
  const header = document.getElementById('siteHeader');
  let scrollTicking = false;

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (beamProgress) beamProgress.style.width = pct + '%';
    if (header) {
      header.style.background = scrollTop > 40 ? 'rgba(18,24,31,.96)' : 'rgba(18,24,31,.86)';
    }
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- project lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxName = document.getElementById('lightboxName');
  const lightboxLoc = document.getElementById('lightboxLoc');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxInner = lightbox ? lightbox.querySelector('.lightbox-inner') : null;
  let lastFocusedEl = null;

  const openLightbox = (card) => {
    const img = card.getAttribute('data-img');
    const name = card.getAttribute('data-name');
    const loc = card.getAttribute('data-loc');
    const tag = card.getAttribute('data-tag');

    lightboxImg.classList.remove('is-loaded');
    lightboxImg.src = img;
    lightboxImg.alt = name;
    lightboxImg.addEventListener('load', () => lightboxImg.classList.add('is-loaded'), { once: true });

    if (lightboxName) lightboxName.textContent = name;
    if (lightboxLoc) lightboxLoc.textContent = loc;
    if (lightboxTag) lightboxTag.textContent = tag;

    lastFocusedEl = document.activeElement;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  };

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openLightbox(card));

    // keyboard accessibility
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${card.getAttribute('data-name')}`);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeLightbox();
      return;
    }

    // simple focus trap while the lightbox is open
    if (e.key === 'Tab' && lightboxInner) {
      const focusable = lightboxInner.querySelectorAll('button, [href], img');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------- quote form validation (front-end only) ---------- */
  const quoteForm = document.getElementById('quoteForm');
  const formNote = document.getElementById('formNote');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const nameField = document.getElementById('fName');
      const phoneField = document.getElementById('fPhone');

      const nameWrap = nameField.closest('label');
      const phoneWrap = phoneField.closest('label');

      nameWrap.classList.remove('invalid');
      phoneWrap.classList.remove('invalid');

      if (!nameField.value.trim()) {
        nameWrap.classList.add('invalid');
        valid = false;
      }

      const phonePattern = /^[0-9+\-\s]{7,15}$/;
      if (!phonePattern.test(phoneField.value.trim())) {
        phoneWrap.classList.add('invalid');
        valid = false;
      }

      if (!valid) {
        formNote.textContent = '';
        const firstInvalid = quoteForm.querySelector('.invalid input');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      formNote.textContent = 'Thanks — details noted. Call us at 01710-339406 to confirm your project.';
      quoteForm.reset();
    });
  }

});
