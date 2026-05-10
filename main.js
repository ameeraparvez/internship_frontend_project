/**
 * NexaOS — main.js
 * Handles: custom cursor · navbar scroll · hamburger menu ·
 *          scroll reveal (AOS) · counter animation ·
 *          stat bar animation · canvas particles · form UX
 */

'use strict';

/* ════════════════════════════════════════════════════════
   1. CUSTOM CURSOR
════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Hide on touch devices
  if ('ontouchstart' in window) {
    dot.style.display = ring.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Ring follows with slight lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Expand ring on interactive elements
  const interactables = 'a, button, input, [role="button"]';
  document.querySelectorAll(interactables).forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width        = '56px';
      ring.style.height       = '56px';
      ring.style.borderColor  = 'rgba(79,140,255,0.7)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width        = '36px';
      ring.style.height       = '36px';
      ring.style.borderColor  = 'rgba(79,140,255,0.5)';
    });
  });
})();


/* ════════════════════════════════════════════════════════
   2. NAVBAR — scroll effect + active link
════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const links   = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Add/remove .scrolled class
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // Update active nav link based on section in view
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
})();


/* ════════════════════════════════════════════════════════
   3. HAMBURGER MENU
════════════════════════════════════════════════════════ */
const hamburger   = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');

function openDrawer() {
  hamburger.classList.add('open');
  mobileDrawer.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileDrawer.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  hamburger.classList.remove('open');
  mobileDrawer.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileDrawer.setAttribute('aria-hidden', 'true');
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeDrawer() : openDrawer();
  });
}

// Close on outside click
document.addEventListener('click', (e) => {
  if (mobileDrawer && mobileDrawer.classList.contains('open')) {
    if (!mobileDrawer.contains(e.target) && !hamburger.contains(e.target)) {
      closeDrawer();
    }
  }
});

// Expose closeDrawer for inline onclick attributes
window.closeDrawer = closeDrawer;


/* ════════════════════════════════════════════════════════
   4. SCROLL REVEAL (lightweight AOS replacement)
════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const targets = document.querySelectorAll('[data-aos]');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  targets.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════════════════════════════
   5. COUNTER ANIMATION
════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3); // cubic ease-out
  const DURATION = 1600; // ms

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const start  = performance.now();

      // Special case for 99.9%
      const isDecimal = target === 999;

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / DURATION, 1);
        const value    = Math.round(easeOut(progress) * target);

        if (isDecimal) {
          el.textContent = (easeOut(progress) * 99.9).toFixed(1) + '%';
        } else if (target === 24) {
          el.textContent = value + suffix;
        } else if (target === 12000) {
          el.textContent = (easeOut(progress) * 12).toFixed(1) + 'K+';
        } else {
          el.textContent = value + suffix;
        }

        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });

  counters.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════════════════════════════
   6. STAT BAR ANIMATION
════════════════════════════════════════════════════════ */
(function initStatBars() {
  const bars = document.querySelectorAll('.stat-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => observer.observe(bar));
})();


/* ════════════════════════════════════════════════════════
   7. HERO CANVAS — particle field
════════════════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = 90;
  const MAX_DIST = 130;

  // Colors for particles
  const COLORS = ['rgba(79,140,255,', 'rgba(168,85,247,', 'rgba(45,212,191,'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      vx: randomBetween(-0.25, 0.25),
      vy: randomBetween(-0.25, 0.25),
      r: randomBetween(0.8, 2.2),
      alpha: randomBetween(0.25, 0.65),
      color
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Move
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(79,140,255,${0.05 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });

  init();
  draw();
})();


/* ════════════════════════════════════════════════════════
   8. EMAIL FORM UX
════════════════════════════════════════════════════════ */
function handleSignup() {
  const input = document.getElementById('emailInput');
  const note  = document.getElementById('formNote');
  if (!input || !note) return;

  const val = input.value.trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!val) {
    note.style.color = '#f87171';
    note.textContent = 'Please enter your email address.';
    input.focus();
    return;
  }

  if (!emailRe.test(val)) {
    note.style.color = '#f87171';
    note.textContent = 'That doesn\'t look right — check your email.';
    input.focus();
    return;
  }

  // Success state
  note.style.color = '#2dd4bf';
  note.textContent = '🎉 You\'re on the list! We\'ll be in touch.';
  input.value = '';
  input.disabled = true;

  // Reset after 4s
  setTimeout(() => {
    input.disabled = false;
    note.textContent = '';
  }, 4000);
}

// Allow Enter key in email input
const emailInput = document.getElementById('emailInput');
if (emailInput) {
  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSignup();
  });
}

// Expose globally (used in inline onclick)
window.handleSignup = handleSignup;


/* ════════════════════════════════════════════════════════
   9. SMOOTH SCROLL — offset for fixed navbar
════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 70; // navbar height
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ════════════════════════════════════════════════════════
   10. CARD TILT EFFECT (subtle 3D on feature cards)
════════════════════════════════════════════════════════ */
(function initCardTilt() {
  const cards = document.querySelectorAll('.feat-card');
  const STRENGTH = 6; // max tilt degrees

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotateX = -dy * STRENGTH;
      const rotateY =  dx * STRENGTH;
      card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.transformOrigin = 'center center';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
