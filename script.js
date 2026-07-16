/* ============================================================
   Y Factor — script.js
   Kinetic take-apart (FACTORY → Y FACTOR), scroll reveals,
   counters, heatmap, nav, form. Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  'use strict';

  /* Demo-form endpoint — the fetch URL and the <form action> fallback both
     derive from this one constant. Swap it to move off FormSubmit. */
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/hello@yfactor.ai';

  var rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return rmQuery.matches; }

  /* Counters and utilization bars keep their real values in the markup
     (crawlers and no-JS readers see actual numbers); zero them only when
     they are about to animate. */
  if (!reduced()) {
    document.querySelectorAll('.count').forEach(function (c) { c.textContent = '0'; });
    document.querySelectorAll('.bar-fill').forEach(function (b) { b.style.width = '0%'; });
  }

  /* ---------- Nav: glass on scroll ---------- */
  var nav = document.getElementById('nav');
  function onNavScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ---------- Nav: mark the section in view ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (spyLinks.length && 'IntersectionObserver' in window) {
    var spyMap = {};
    spyLinks.forEach(function (a) { spyMap[a.getAttribute('href').slice(1)] = a; });
    var spySections = Object.keys(spyMap);
    var spyState = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { spyState[e.target.id] = e.isIntersecting; });
      var current = null;
      for (var i = 0; i < spySections.length; i++) {
        if (spyState[spySections[i]]) { current = spySections[i]; break; }
      }
      spyLinks.forEach(function (a) {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      });
      if (current) {
        spyMap[current].classList.add('active');
        spyMap[current].setAttribute('aria-current', 'true');
      }
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    spySections.forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var mmenu = document.getElementById('mmenu');
  if (burger && mmenu) {
    var setMenu = function (open) {
      mmenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', function () {
      setMenu(!mmenu.classList.contains('open'));
    });
    mmenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mmenu.classList.contains('open')) {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* ============================================================
     Kinetic take-apart: FACTORY → Y FACTOR
     Measures three states of the same glyphs:
       state 1 — "FACTORY" (tight)
       state 2 — "F A C T O R Y" (taken apart)
       final   — "Y FACTOR" (the DOM's natural layout)
     then choreographs letters between them with CSS variables.
     ============================================================ */
  var ORDER = 'FACTORY';
  var PHASES = [
    ['k-enter', 60],    // letters rise in as FACTORY
    ['k-spread', 1050], // taken apart: F A C T O R Y
    ['k-solve', 2050],  // the Y lifts out and lands first
    ['k-dotted', 3000]  // the dot docks under the Y
  ];
  var TOTAL = 3550;

  function createKinetic(el) {
    var row = el.querySelector('.k-row');
    var letters = row ? Array.prototype.slice.call(row.querySelectorAll('.k-l')) : [];
    if (!letters.length) return null;

    if (reduced()) {
      el.classList.add('k-static');
      return { play: function () {}, playing: function () { return false; } };
    }
    el.classList.add('k-js');

    var isPlaying = false;

    function buildMeasureRow(wide) {
      var m = document.createElement('span');
      m.className = 'k-measure' + (wide ? ' k-wide' : '');
      m.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < ORDER.length; i++) {
        var l = document.createElement('span');
        l.className = 'k-l';
        l.dataset.ch = ORDER[i];
        var inn = document.createElement('span');
        inn.className = 'k-in';
        inn.textContent = ORDER[i];
        l.appendChild(inn);
        m.appendChild(l);
      }
      el.appendChild(m);
      return m;
    }

    function positionsOf(rowEl) {
      var map = {};
      rowEl.querySelectorAll('.k-l').forEach(function (l) {
        map[l.dataset.ch] = l.getBoundingClientRect().left;
      });
      return map;
    }

    function measure() {
      // Clear transforms so final positions are true.
      letters.forEach(function (l) {
        l.style.removeProperty('--x1');
        l.style.removeProperty('--x2');
      });
      var m1 = buildMeasureRow(false);
      var m2 = buildMeasureRow(true);
      var p1 = positionsOf(m1);
      var p2 = positionsOf(m2);
      letters.forEach(function (l) {
        var ch = l.dataset.ch;
        var fx = l.getBoundingClientRect().left;
        l.style.setProperty('--x1', (p1[ch] - fx).toFixed(2) + 'px');
        l.style.setProperty('--x2', (p2[ch] - fx).toFixed(2) + 'px');
      });
      m1.remove();
      m2.remove();
    }

    function play() {
      if (isPlaying || reduced()) return;
      isPlaying = true;
      PHASES.forEach(function (p) { el.classList.remove(p[0]); });
      el.classList.remove('k-armed');
      measure();
      // Arm: letters jump to their FACTORY positions, hidden.
      el.classList.add('k-armed');
      void el.offsetWidth; // commit the armed state before transitioning
      PHASES.forEach(function (p) {
        setTimeout(function () { el.classList.add(p[0]); }, p[1]);
      });
      setTimeout(function () { isPlaying = false; }, TOTAL);
    }

    return { play: play, playing: function () { return isPlaying; } };
  }

  function whenFontsReady(cb) {
    var done = false;
    function once() { if (!done) { done = true; cb(); } }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(once);
    }
    setTimeout(once, 1400); // fallback if the Font Loading API stalls
  }

  // Background tabs freeze transitions: hold the opening until the page is seen.
  function whenVisible(cb) {
    if (!document.hidden) { cb(); return; }
    document.addEventListener('visibilitychange', function handler() {
      if (!document.hidden) {
        document.removeEventListener('visibilitychange', handler);
        cb();
      }
    });
  }

  var heroKineticEl = document.querySelector('[data-kinetic][data-autoplay]');
  if (heroKineticEl) {
    var heroKinetic = createKinetic(heroKineticEl);
    if (heroKinetic) {
      whenFontsReady(function () {
        whenVisible(function () {
          setTimeout(function () { heroKinetic.play(); }, 120);
        });
      });
    }
  }

  var whyKineticEl = document.querySelector('[data-kinetic][data-inview]');
  if (whyKineticEl) {
    var whyKinetic = createKinetic(whyKineticEl);
    if (whyKinetic && 'IntersectionObserver' in window) {
      var wasOut = true;
      var whyIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            if (wasOut) {
              wasOut = false;
              whenFontsReady(function () { whyKinetic.play(); });
            }
          } else if (!e.isIntersecting) {
            wasOut = true; // fully left: allow a replay on re-entry
          }
        });
      }, { threshold: [0, 0.5] });
      whyIO.observe(whyKineticEl);
    } else if (whyKinetic) {
      whenFontsReady(function () { whyKinetic.play(); });
    }
    var replayBtn = document.getElementById('replayWhy');
    if (replayBtn && whyKinetic) {
      replayBtn.addEventListener('click', function () { whyKinetic.play(); });
    }
  }

  /* ---------- Animated counters ---------- */
  function runCounter(elm) {
    if (elm.dataset.done) return;
    elm.dataset.done = '1';
    var target = parseFloat(elm.dataset.val || '0');
    var dec = parseInt(elm.dataset.dec || '0', 10);
    if (reduced()) { elm.textContent = target.toFixed(dec); return; }
    var t0 = null;
    var DUR = 1300;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / DUR, 1);
      var eased = 1 - Math.pow(1 - p, 3); // cubic ease-out
      elm.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  function activate(elm) {
    elm.classList.add('in');
    elm.querySelectorAll('.count').forEach(runCounter);
    elm.querySelectorAll('svg .draw').forEach(function (d) { d.classList.add('in'); });
    elm.querySelectorAll('.bar-fill').forEach(function (b) {
      b.style.width = b.dataset.w || '0%';
    });
    // Release the reveal transition once it has played — .reveal's
    // transition/transform otherwise outranks card hover styles for good.
    setTimeout(function () {
      elm.classList.remove('reveal', 'in', 'd1', 'd2', 'd3', 'd4');
    }, 1100);
  }
  if (reduced() || !('IntersectionObserver' in window)) {
    revealEls.forEach(activate);
    // hero dashboard counters sit outside .reveal, under .hr
    document.querySelectorAll('.hr .count').forEach(runCounter);
    document.querySelectorAll('.hr svg .draw').forEach(function (d) { d.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          activate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (elm) { io.observe(elm); });
    // hero dashboard (fades in via .hr animation): start its counters after the entrance
    setTimeout(function () {
      document.querySelectorAll('.hr .count').forEach(runCounter);
      document.querySelectorAll('.hr svg .draw').forEach(function (d) { d.classList.add('in'); });
    }, 1100);
  }

  /* ---------- Downtime heatmap (deterministic) ---------- */
  var heat = document.getElementById('heat');
  if (heat) {
    var LEVELS = [
      'rgba(245,239,230,.07)',
      'rgba(233,142,68,.25)',
      'rgba(233,142,68,.55)',
      '#E98E44'
    ];
    for (var i = 0; i < 168; i++) { // 24 h × 7 days
      var v = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      var lvl = v < 0.62 ? 0 : v < 0.82 ? 1 : v < 0.94 ? 2 : 3;
      var cell = document.createElement('span');
      cell.style.background = LEVELS[lvl];
      heat.appendChild(cell);
    }
  }

  /* ---------- Hero parallax (subtle) ---------- */
  var heroArt = document.querySelector('.hero-art');
  if (heroArt && !reduced()) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        if (reduced()) { heroArt.style.transform = ''; ticking = false; return; }
        var y = Math.min(window.scrollY, window.innerHeight);
        heroArt.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Demo form ---------- */
  var form = document.getElementById('demoForm');
  if (form) {
    var fields = [
      { inp: document.getElementById('f-name'), err: document.getElementById('f-name-err'),
        test: function (v) { return v.length > 0; } },
      { inp: document.getElementById('f-co'), err: document.getElementById('f-co-err'),
        test: function (v) { return v.length > 0; } },
      { inp: document.getElementById('f-contact'), err: document.getElementById('f-contact-err'),
        test: function (v) { return v.indexOf('@') > 0 || v.replace(/\D/g, '').length >= 7; } }
    ];
    var status = document.getElementById('okMsg');
    var sendBtn = document.getElementById('f-send');
    var sending = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      var firstBad = null;
      fields.forEach(function (f) {
        if (!f.inp) return;
        var bad = !f.test(f.inp.value.trim());
        f.inp.classList.toggle('err', bad);
        f.inp.setAttribute('aria-invalid', String(bad));
        if (f.err) f.err.hidden = !bad;
        // describe the field by its error only while the error is shown
        if (bad) { f.inp.setAttribute('aria-describedby', f.err.id); }
        else { f.inp.removeAttribute('aria-describedby'); }
        if (bad && !firstBad) firstBad = f.inp;
      });
      if (firstBad) {
        // announce even when focus is already inside the invalid field
        status.textContent = 'Please fix the highlighted fields.';
        firstBad.focus();
        return;
      }
      if (form.elements._honey && form.elements._honey.value) return; // bot filled the honeypot

      // aria-disabled (not disabled) so the focused button keeps focus while sending
      sending = true;
      sendBtn.setAttribute('aria-disabled', 'true');
      sendBtn.textContent = 'Sending…';
      status.textContent = '';
      var contactVal = fields[2].inp.value.trim();
      var payload = {
        name: fields[0].inp.value.trim(),
        company: fields[1].inp.value.trim(),
        contact: contactVal,
        _subject: 'Demo request — Y Factor site',
        _template: 'table'
      };
      if (contactVal.indexOf('@') > 0) payload._replyto = contactVal;
      [['role', 'f-role'], ['plant_type', 'f-plant'], ['scale', 'f-scale']].forEach(function (opt) {
        var el = document.getElementById(opt[1]);
        if (el && el.value.trim()) payload[opt[0]] = el.value.trim();
      });
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('send failed');
        form.reset();
        form.classList.add('sent');
        status.textContent = "Request received. We'll reach out within one business day.";
        status.setAttribute('tabindex', '-1');
        status.focus(); // the submit button is hidden now; park focus on the confirmation
      }).catch(function () {
        sending = false;
        sendBtn.removeAttribute('aria-disabled');
        sendBtn.textContent = 'Book a demo';
        status.innerHTML = 'Could not send right now. Email us at <a href="mailto:hello@yfactor.ai">hello@yfactor.ai</a> and we’ll take it from there.';
      });
    });
  }

  /* ---------- Footer year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
