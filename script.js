/* ==========================================================================
   Aditya Kharadkar — Portfolio Script
   Vanilla JS only. Organized as small, independent modules initialised on load.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initScrollProgress();
  initCursorGlow();
  initNavbar();
  initNetworkCanvas();
  initTypingEffect();
  initRevealOnScroll();
  initCounters();
  initSkillBars();
  initProjectFilter();
  initContactForm();
  initBackToTop();
  initRipple();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------------------------------------------------------------------- */
/* Loading screen                                                          */
/* ---------------------------------------------------------------------- */
function initLoader() {
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 400);
  });
  // Fallback in case 'load' already fired
  setTimeout(() => loader.classList.add('hidden'), 2500);
}

/* ---------------------------------------------------------------------- */
/* Scroll progress bar                                                     */
/* ---------------------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------------------------------------------------------------------- */
/* Cursor glow (desktop only — checked via matchMedia)                     */
/* ---------------------------------------------------------------------- */
function initCursorGlow() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  const glow = document.getElementById('cursorGlow');
  let raf = null;
  window.addEventListener('mousemove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      raf = null;
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Navbar: scroll shadow + mobile menu                                     */
/* ---------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.querySelectorAll('.nav-link');

  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    navbar.classList.toggle('menu-open', !expanded);
  });

  links.forEach((link) => {
    link.addEventListener('click', () => {
      navbar.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Hero network / particle canvas — nodes connect like a small neural net  */
/* and react gently to the cursor.                                         */
/* ---------------------------------------------------------------------- */
function initNetworkCanvas() {
  const canvas = document.getElementById('networkCanvas');
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');
  let width, height, nodes;
  const mouse = { x: null, y: null };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
    const count = Math.min(70, Math.floor((width * height) / 18000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;

      if (mouse.x !== null) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          n.x -= dx * 0.0025;
          n.y -= dy * 0.0025;
        }
      }
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(120, 150, 255, ${0.14 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      ctx.fillStyle = 'rgba(160, 180, 255, 0.55)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reduceMotion) requestAnimationFrame(step);
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  window.addEventListener('resize', resize);
  resize();
  step();
  if (reduceMotion) step(); // draw a single static frame
}

/* ---------------------------------------------------------------------- */
/* Typing animation for hero role text                                     */
/* ---------------------------------------------------------------------- */
function initTypingEffect() {
  const el = document.getElementById('typingText');
  const phrases = [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Analysis',
    'Computer Vision'
  ];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) { el.textContent = phrases[0]; return; }

  let phraseIndex = 0, charIndex = 0, deleting = false;

  function tick() {
    const current = phrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 35 : 65);
  }
  tick();
}

/* ---------------------------------------------------------------------- */
/* Reveal-on-scroll (IntersectionObserver)                                 */
/* ---------------------------------------------------------------------- */
function initRevealOnScroll() {
  const items = document.querySelectorAll('.reveal-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach((item, i) => {
    item.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    observer.observe(item);
  });
}

/* ---------------------------------------------------------------------- */
/* Animated counters                                                       */
/* ---------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();

      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(frame);
        else el.textContent = target + (target >= 100 ? '+' : '');
      }
      requestAnimationFrame(frame);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach((c) => observer.observe(c));
}

/* ---------------------------------------------------------------------- */
/* Skill bar fill animation                                                */
/* ---------------------------------------------------------------------- */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      const fill = item.querySelector('.skill-fill');
      fill.style.width = item.dataset.level + '%';
      observer.unobserve(item);
    });
  }, { threshold: 0.4 });

  bars.forEach((b) => observer.observe(b));
}

/* ---------------------------------------------------------------------- */
/* Project filtering                                                       */
/* ---------------------------------------------------------------------- */
function initProjectFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('filtered-out', !match);
      });
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Contact form — client-side validation, no backend wired up               */
/* ---------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  const rules = {
    name: (v) => v.trim().length >= 2 || 'Enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email.',
    subject: (v) => v.trim().length >= 3 || 'Add a short subject.',
    message: (v) => v.trim().length >= 10 || 'Message should be at least 10 characters.'
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    Object.keys(rules).forEach((field) => {
      const input = form.elements[field];
      const errorEl = form.querySelector(`.form-error[data-for="${field}"]`);
      const result = rules[field](input.value);
      if (result === true) {
        input.classList.remove('invalid');
        errorEl.textContent = '';
      } else {
        input.classList.add('invalid');
        errorEl.textContent = result;
        valid = false;
      }
    });

    if (!valid) {
      status.textContent = 'Please fix the highlighted fields.';
      status.className = 'form-status';
      return;
    }

    // No backend is connected — this simulates a successful send.
    status.textContent = 'Message sent — thanks for reaching out! I\'ll reply soon.';
    status.className = 'form-status success';
    form.reset();
  });
}

/* ---------------------------------------------------------------------- */
/* Back to top button                                                      */
/* ---------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------------------- */
/* Button ripple effect                                                    */
/* ---------------------------------------------------------------------- */
function initRipple() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
}
