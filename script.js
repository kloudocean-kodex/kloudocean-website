// KloudOcean - shared site behaviour
// Principle: every element must be correct with zero JS. Scripts here only
// add motion on top of already-correct HTML - nothing depends on JS to
// display the right value (this fixes the old "counters show 0" bug).

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? '\u00d7' : '\u2630';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '\u2630';
    }));
  }

  /* ---- Scrollspy Active Link Navigation ---- */
  const navLinksList = document.querySelectorAll('.nav-links a[href^="/#"], .nav-links a[href^="#"]');
  if (navLinksList.length && 'IntersectionObserver' in window) {
    const sections = Array.from(navLinksList)
      .map(link => {
        const hash = link.getAttribute('href').split('#')[1];
        return document.getElementById(hash);
      })
      .filter(Boolean);

    if (sections.length) {
      const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinksList.forEach(link => {
              if (link.getAttribute('href').endsWith('#' + entry.target.id)) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }, { rootMargin: '-40% 0px -60% 0px' });

      sections.forEach(section => scrollSpyObserver.observe(section));
    }
  }

  /* ---- Cookie Consent ----
     Google consent mode defaults to denied in the page head. This updates
     analytics storage only after the visitor accepts measurement cookies. */
  const consentBanner = document.querySelector('.cookie-banner');
  const hasConsent = localStorage.getItem('ko_cookie_consent');

  function initGA4() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  }

  function blockGA4() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  }

  if (hasConsent === 'accepted') {
    initGA4();
  } else if (hasConsent === 'declined') {
    blockGA4();
  } else if (consentBanner) {
    // Show cookie banner after a brief delay
    setTimeout(() => consentBanner.classList.add('show'), 800);
  }

  if (consentBanner) {
    const acceptBtn = consentBanner.querySelector('[data-consent="accept"]');
    const declineBtn = consentBanner.querySelector('[data-consent="decline"]');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('ko_cookie_consent', 'accepted');
        consentBanner.classList.remove('show');
        initGA4();
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('ko_cookie_consent', 'declined');
        consentBanner.classList.remove('show');
        blockGA4();
      });
    }
  }

  /* ---- Stat counters ----
     HTML already contains the real, correct final text (e.g. "1,000+").
     If the browser respects prefers-reduced-motion, or IntersectionObserver
     isn't available, we simply leave that correct value alone. Animation
     is a bonus, never a requirement. */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stats = document.querySelectorAll('.stat-num[data-target]');

  if (stats.length && !reduceMotion && 'IntersectionObserver' in window) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        el.textContent = current.toLocaleString('en-IN') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('en-IN') + suffix;
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    stats.forEach(el => observer.observe(el));
  }

  /* ---- Scroll-Reveal Animations ----
     Fade-in-up effect for all .reveal elements as they enter the viewport.
     Also handles staggered grid children (.reveal-stagger). */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    // Single-element reveals
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObserver.observe(el));

    // Staggered grid children
    const staggerContainers = document.querySelectorAll('.reveal-stagger');
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const children = entry.target.querySelectorAll('.card, .why-item, .waypoint');
          children.forEach((child, i) => {
            setTimeout(() => child.classList.add('visible'), i * 100);
          });
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    staggerContainers.forEach(el => staggerObserver.observe(el));
  }

  /* ---- Reading Progress Bar ----
     Fixed bar at top of page that fills as user scrolls through blog posts. */
  const progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(progress, 100) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ---- GA4 event hooks (safe no-ops if gtag isn't present yet) ---- */
  const track = (name, params) => {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  };
  const trackLeadEvent = (name, params) => {
    const eventParams = params || {};
    track(name, eventParams);

    if (name === 'calendly_click') {
      track('qualify_lead', { ...eventParams, lead_source: 'calendly' });
    }
    if (name === 'form_submit_assessment') {
      track('qualify_lead', { ...eventParams, form_name: 'assessment' });
      track('generate_lead', { ...eventParams, form_name: 'assessment' });
    }
    if (name === 'miko_waitlist_submit') {
      track('generate_lead', { ...eventParams, form_name: 'miko_waitlist' });
    }
    if (name === 'resource_unlock') {
      track('generate_lead', { ...eventParams, form_name: 'resource_unlock' });
    }
    if (name === 'whatsapp_click' || name === 'email_click') {
      track('contact', {
        ...eventParams,
        contact_method: name.replace('_click', '')
      });
    }
  };
  document.querySelectorAll('[data-track]').forEach(el => {
    if (el.tagName === 'FORM') return; // forms handled separately below
    el.addEventListener('click', () => trackLeadEvent(el.dataset.track + '_click', { link_text: el.textContent.trim() }));
  });
  const assessForm = document.querySelector('#assessment-form');
  if (assessForm) assessForm.addEventListener('submit', () => trackLeadEvent('form_submit_assessment', {}));
  const mikoForm = document.querySelector('#miko-waitlist-form');
  if (mikoForm) mikoForm.addEventListener('submit', () => trackLeadEvent('miko_waitlist_submit', {}));
  document.querySelectorAll('.gate-form').forEach(form =>
    form.addEventListener('submit', () => trackLeadEvent('resource_unlock', { resource: form.dataset.resource || 'unknown' })));

  /* ---- Cloudflare Turnstile fallback ----
     If Turnstile fails to load (corporate firewall or challenges.cloudflare.com blocked)
     we allow a graceful fallback so leads are not lost. A hidden field is appended
     so backend operators can triage fallback submissions. Timeout is short (2s).
  */
  document.querySelectorAll('.gate-form').forEach(form => {
    const turnstileEl = form.querySelector('.cf-turnstile');
    // mark whether widget loaded
    let widgetLoaded = false;

    if (turnstileEl) {
      // If Cloudflare exposes the turnstile API, consider that loaded.
      if (window.turnstile) widgetLoaded = true;

      // Also watch for the iframe node that the widget injects
      const iframe = turnstileEl.querySelector('iframe');
      if (iframe) widgetLoaded = true;

      // After a short delay, if still not loaded, enable fallback
      setTimeout(() => {
        if (!widgetLoaded) {
          // append a hidden fallback marker so server knows this used fallback
          if (!form.querySelector('input[name="fallback_captcha"]')) {
            const h = document.createElement('input');
            h.type = 'hidden';
            h.name = 'fallback_captcha';
            h.value = '1';
            form.appendChild(h);
          }
          // show a small inline note to the user (non-blocking)
          let note = form.querySelector('.fallback-note');
          if (!note) {
            note = document.createElement('div');
            note.className = 'fallback-note';
            note.setAttribute('role', 'status');
            note.setAttribute('aria-live', 'polite');
            note.textContent = 'Security widget unavailable — submitting directly. We may follow up to verify.';
            form.appendChild(note);
          }
        }
      }, 2000);
    }

    // on submit, ensure fallback marker is present when widget not loaded
    form.addEventListener('submit', (e) => {
      // if widget element exists but API not available, ensure marker
      if (turnstileEl && !window.turnstile) {
        if (!form.querySelector('input[name="fallback_captcha"]')) {
          const h = document.createElement('input');
          h.type = 'hidden';
          h.name = 'fallback_captcha';
          h.value = '1';
          form.appendChild(h);
        }
      }
    });
  });

  /* ---- Migration Cost Estimator (resources.html only) ----
     Everything here is an educational estimate, not a quote - the copy
     around this widget says so, and the numbers are deliberately
     conservative-to-mid so it under-promises rather than over-promises. */
  const estimator = document.querySelector('#estimator-form');
  if (estimator) {
    const tbInput = estimator.querySelector('#est-tb');
    const schemaInput = estimator.querySelector('#est-schemas');
    const bteqInput = estimator.querySelector('#est-bteq');
    const timelineInput = estimator.querySelector('#est-timeline');

    const tbVal = estimator.querySelector('#est-tb-val');
    const schemaVal = estimator.querySelector('#est-schemas-val');
    const bteqVal = estimator.querySelector('#est-bteq-val');

    const rangeLow = document.querySelector('#estimate-low');
    const rangeHigh = document.querySelector('#estimate-high');
    const weeksOut = document.querySelector('#estimate-weeks');
    const riskOut = document.querySelector('#estimate-risk');
    const disclaimerNote = document.querySelector('#estimate-floor-note');

    const fmt = (n) => Math.round(n).toLocaleString('en-US');

    function calculate() {
      const tb = parseFloat(tbInput.value);
      const schemas = parseFloat(schemaInput.value);
      const bteq = parseFloat(bteqInput.value);
      const timeline = timelineInput.value;

      tbVal.textContent = tb + ' TB';
      schemaVal.textContent = schemas;
      bteqVal.textContent = bteq.toLocaleString('en-US');

      const base = (tb * 150) + (schemas * 800) + (bteq * 180);
      const withGovernance = base * 1.25;

      let multiplier = 1.0;
      if (timeline === 'rush') multiplier = 1.35;
      else if (timeline === 'flexible') multiplier = 0.9;

      const subtotal = withGovernance * multiplier;
      let low = subtotal * 0.8;
      let high = subtotal * 1.3;

      let floorNote = false;
      if (low < 599) { low = 599; floorNote = true; }
      if (high < 899) { high = 899; floorNote = true; }

      let weeks = 4 + (tb / 40) + (bteq / 150) + (schemas / 10);
      if (timeline === 'rush') weeks *= 0.75;
      if (timeline === 'flexible') weeks *= 1.15;
      weeks = Math.max(2, Math.round(weeks));

      let risk = 'low';
      if (bteq > 1200 || tb > 400) risk = 'high';
      else if (bteq > 400 || tb > 100) risk = 'medium';
      if (timeline === 'rush' && risk === 'low') risk = 'medium';

      rangeLow.textContent = fmt(low);
      rangeHigh.textContent = fmt(high);
      weeksOut.textContent = weeks + (weeks === 1 ? ' week' : ' weeks');
      riskOut.className = 'risk-badge risk-' + risk;
      riskOut.textContent = risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk';
      disclaimerNote.style.display = floorNote ? 'block' : 'none';

      // Visual Updates
      const storageCost = tb * 150;
      const schemaCost = schemas * 800;
      const bteqCost = bteq * 180;
      const totalBase = storageCost + schemaCost + bteqCost;

      const storagePct = (storageCost / totalBase) * 100;
      const schemaPct = (schemaCost / totalBase) * 100;
      const bteqPct = (bteqCost / totalBase) * 100;

      const segmentStorage = estimator.querySelector('.segment-storage');
      const segmentSchema = estimator.querySelector('.segment-schema');
      const segmentBteq = estimator.querySelector('.segment-bteq');

      if (segmentStorage && segmentSchema && segmentBteq) {
        segmentStorage.style.strokeDasharray = `${storagePct} 100`;
        segmentStorage.style.strokeDashoffset = `0`;
        segmentSchema.style.strokeDasharray = `${schemaPct} 100`;
        segmentSchema.style.strokeDashoffset = `-${storagePct}`;
        segmentBteq.style.strokeDasharray = `${bteqPct} 100`;
        segmentBteq.style.strokeDashoffset = `-${storagePct + schemaPct}`;
      }

      let riskScore = (bteq / 3000) * 0.5 + (tb / 1000) * 0.5;
      if (timeline === 'rush') riskScore += 0.2;
      if (timeline === 'flexible') riskScore -= 0.1;
      riskScore = Math.max(0.05, Math.min(0.95, riskScore));

      const gaugeFill = estimator.querySelector('.speed-fill');
      const needle = estimator.querySelector('.speed-needle');
      if (gaugeFill && needle) {
        gaugeFill.style.strokeDashoffset = 125.6 - (125.6 * riskScore);
        needle.style.transform = `rotate(${-90 + (riskScore * 180)}deg)`;
      }

      // Keep hidden fields in sync so the optional "email me this" form
      // below carries real numbers, not placeholders.
      const hiddenFields = document.querySelectorAll('.estimator-email input[type=hidden]');
      hiddenFields.forEach(f => {
        if (f.name === 'volume_tb') f.value = tb;
        if (f.name === 'schema_count') f.value = schemas;
        if (f.name === 'bteq_count') f.value = bteq;
        if (f.name === 'timeline') f.value = timeline;
        if (f.name === 'estimate_range') f.value = '$' + fmt(low) + ' - $' + fmt(high);
      });
    }

    [tbInput, schemaInput, bteqInput, timelineInput].forEach(el =>
      el.addEventListener('input', calculate));
    calculate();
  }

  /* ---- Progressive enhancement for form submission ---- */
  document.querySelectorAll('form[action="/api/submit"]').forEach(form => {
    form.addEventListener('submit', async (event) => {
      if (form.dataset.submitting === 'true') return;
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      const originalLabel = submitButton ? submitButton.textContent : '';
      const status = form.querySelector('.form-status') || document.createElement('div');
      if (!form.querySelector('.form-status')) {
        status.className = 'form-status';
        status.setAttribute('aria-live', 'polite');
        form.appendChild(status);
      }

      form.dataset.submitting = 'true';
      form.setAttribute('aria-busy', 'true');
      status.className = 'form-status is-visible is-loading';
      status.textContent = 'Sending your request…';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
      }

      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (response.ok || response.redirected || response.type === 'opaqueredirect') {
          status.className = 'form-status is-visible is-success';
          status.textContent = 'Thanks — redirecting you now…';
          const targetUrl = response.redirected ? response.url : (form.dataset.successUrl || '/thank-you');
          window.location.assign(targetUrl);
          return;
        }

        let message = 'Something went wrong. Please try again or contact us directly.';
        try {
          const payload = await response.json();
          if (payload && payload.error) message = payload.error;
        } catch (err) {
          // Fall back to generic message
        }

        status.className = 'form-status is-visible is-error';
        status.textContent = message;
      } catch (err) {
        status.className = 'form-status is-visible is-error';
        status.textContent = 'Submission failed. Please try again or contact us directly.';
      } finally {
        form.dataset.submitting = 'false';
        form.removeAttribute('aria-busy');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        }
      }
    });
  });

  /* ---- Mouse Spotlight Effect for Cards ---- */
  document.querySelectorAll('.card, .price-card, .founder-card, .person-card, .testimonial-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  /* ---- Canvas Particle Background ---- */
  const canvas = document.getElementById('hero-canvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null };

    const resize = () => {
      width = canvas.parentElement.offsetWidth;
      height = canvas.parentElement.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
        this.color = Math.random() > 0.5 ? 'rgba(49, 214, 200, 0.4)' : 'rgba(201, 162, 75, 0.4)';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            this.x -= dx * 0.015;
            this.y -= dy * 0.015;
          }
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(Math.floor((width * height) / 12000), 120);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distanceSq = dx * dx + dy * dy;
          if (distanceSq < 15000) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(49, 214, 200, ${0.12 - distanceSq / 125000})`;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    canvas.parentElement.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    resize();
    animate();
  }

});
