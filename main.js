
// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_KEY;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// paste your full old script.js code here

  // ── SCROLL REVEAL ──
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => io.observe(el));

  // ── COUNTER ANIMATION ──
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const duration = 1800;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = target + (target === 100 ? '%' : target === 3 ? 'h' : '');
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current) + (target === 100 ? '%' : target === 3 ? 'h' : '');
          }
        }, 16);
        cio.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => cio.observe(el));

  // ── NAV SCROLL EFFECT ──
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    nav.style.borderBottomColor = window.scrollY > 50
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(255,255,255,0.06)';
  });

  
  let selectedChip = null;

  window.selectChip = function (el) {
    document.querySelectorAll('.wl-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    selectedChip = el.textContent.trim();
    clearErr('wlCategoryErr');
    document.getElementById('wlChips').classList.remove('error');
  }

  // ── per-field validation rules ──
  const RULES = {
    wlName: val => {
      if (!val)            return 'Full name is required.';
      if (val.length < 2)  return 'Name must be at least 2 characters.';
      if (val.length > 80) return 'Name is too long (max 80 characters).';
      if (!/^[a-zA-Z\u0900-\u097F\s\-'.]+$/.test(val)) return 'Name contains invalid characters.';
      return null;
    },
    wlEmail: val => {
      if (!val) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) return 'Enter a valid email address (e.g. you@gmail.com).';
      const domain = val.split('@')[1] || '';
      if (!domain.includes('.')) return 'Email domain looks invalid.';
      if (val.length > 254) return 'Email address is too long.';
      return null;
    },
    wlStruggle: val => {
      if (!val) return 'Please select your biggest screen time struggle.';
      return null;
    }
  };

  // ── show / clear error on a field ──
  function showErr(inputId, errId, message) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (inp) { inp.classList.add('error'); inp.classList.remove('success'); }
    if (err) { err.textContent = '⚠ ' + message; err.classList.add('visible'); }
  }

  function clearErr(errId) {
    const err = document.getElementById(errId);
    if (err) { err.textContent = ''; err.classList.remove('visible'); }
  }

  function markSuccess(inputId) {
    const inp = document.getElementById(inputId);
    if (inp) { inp.classList.remove('error'); inp.classList.add('success'); }
  }

  // ── live validation (oninput + onblur) ──
window.liveValidate = function (fieldId) {
    const el  = document.getElementById(fieldId);
    if (!el) return true;
    const val  = el.value.trim();
    const rule = RULES[fieldId];
    if (!rule) return true;
    const errId = fieldId + 'Err';
    const error = rule(val);
    if (error) { showErr(fieldId, errId, error); return false; }
    clearErr(errId);
    markSuccess(fieldId);
    return true;
  }

  // ── validate ALL fields before submit ──
  function validateAll() {
    let allValid = true;
    ['wlName', 'wlEmail', 'wlStruggle'].forEach(id => {
      if (!liveValidate(id)) allValid = false;
    });
    if (!selectedChip) {
      document.getElementById('wlCategoryErr').textContent = '⚠ Please select a category.';
      document.getElementById('wlCategoryErr').classList.add('visible');
      document.getElementById('wlChips').classList.add('error');
      allValid = false;
    }
    return allValid;
  }

  // ── shake card on error ──
  function shakeCard() {
    const card = document.getElementById('waitlistCard');
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
    card.addEventListener('animationend', () => card.classList.remove('shake'), { once: true });
  }

  // ── reset submit button ──
  function resetBtn() {
    const btn = document.getElementById('wlSubmitBtn');
    if (btn) { btn.disabled = false; }
    document.getElementById('wlBtnText').style.display = 'inline';
    document.getElementById('wlBtnLoader').style.display = 'none';
  }

  // ── toast notification ──
  function showToast(msg, isError = false) {
    let toast = document.getElementById('wlToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'wlToast';
      toast.style.cssText = `
        position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
        background:#1E293B; border:1px solid rgba(255,255,255,0.1);
        color:#F1F5F9; font-family:'DM Mono',monospace; font-size:12px;
        letter-spacing:0.06em; padding:14px 24px; border-radius:6px;
        box-shadow:0 16px 40px rgba(0,0,0,0.5); z-index:9999;
        opacity:0; transition:opacity 0.3s; max-width:90vw; text-align:center;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.borderColor = isError ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)';
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3800);
  }

  // ── fetch live count ──
  async function fetchWaitlistCount() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?select=id`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact',
          'Range': '0-0'
        }
      });
      const range = res.headers.get('content-range');
      if (range) {
        const total = parseInt(range.split('/')[1]);
        if (!isNaN(total) && total > 0) {
          document.querySelector('.wl-count strong').textContent = total.toLocaleString() + '+';
        }
      }
    } catch (_) {}
  }

  // ── MAIN SUBMIT ──
window.submitWaitlist = async function () {
    const allValid = validateAll();
    if (!allValid) {
      shakeCard();
      showToast('⚠️ Please fix all errors before submitting.', true);
      const firstErr = document.querySelector('.wl-err.visible');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const name     = document.getElementById('wlName').value.trim();
    const email    = document.getElementById('wlEmail').value.trim();
    const struggle = document.getElementById('wlStruggle').value;

    const btn = document.getElementById('wlSubmitBtn');
    btn.disabled = true;
    document.getElementById('wlBtnText').style.display = 'none';
    document.getElementById('wlBtnLoader').style.display = 'inline';

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer':        'return=representation'
        },
        body: JSON.stringify({ name, email, struggle, category: selectedChip })
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = Array.isArray(data) ? '' : (data?.message || data?.details || '');
        const isDuplicate = msg.toLowerCase().includes('unique') ||
                            msg.toLowerCase().includes('duplicate') ||
                            res.status === 409;
        if (isDuplicate) {
          showErr('wlEmail', 'wlEmailErr', 'This email is already on the waitlist.');
          shakeCard();
          showToast('📧 Email already registered!', true);
        } else {
          showToast('❌ Something went wrong. Please try again.', true);
        }
        resetBtn();
        return;
      }

      // SUCCESS — get real position
      let position = '—';
      try {
        const cr = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?select=id`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'count=exact', 'Range': '0-0'
          }
        });
        const range = cr.headers.get('content-range');
        if (range) position = parseInt(range.split('/')[1]).toLocaleString();
      } catch (_) {}

      document.getElementById('waitlistCard').style.display = 'none';
      document.querySelector('.waitlist-proof').style.transition = 'opacity 0.4s';
      document.querySelector('.waitlist-proof').style.opacity = '0';
      const successEl = document.getElementById('waitlistSuccess');
      successEl.style.display = 'flex';
      document.getElementById('wsNumber').innerHTML =
        `You are <strong style="color:var(--accent)">#${position}</strong> on the waitlist`;

    } catch (err) {
      showToast('❌ Network error. Check your connection and try again.', true);
      resetBtn();
    }
  }

  // ── copy link ──
  window.copyLink = function() {
    const url = window.location.href.split('#')[0] + '#waitlist';
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.querySelector('.ws-share-btn');
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.style.color = '#10B981';
      btn.style.borderColor = 'rgba(16,185,129,0.4)';
      setTimeout(() => { btn.textContent = orig; btn.style.color = ''; btn.style.borderColor = ''; }, 2000);
    }).catch(() => showToast('Could not copy — please copy the URL manually.', true));
  }

  window.addEventListener('load', fetchWaitlistCount);

  // ══════════════════════════════════
  // COMING SOON PAGE LOGIC
  // ══════════════════════════════════

  // Set to true to auto-show on page load instead of the main site
  const SHOW_COMING_SOON = false;

  // Launch date — change this to your actual launch date
  const LAUNCH_DATE = new Date('2025-10-01T00:00:00');

  window.showComingSoon = function() {
    const overlay = document.getElementById('coming-soon');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    startCountdown();
    animateProgress();
    spawnParticles();
  }

  window.hideComingSoon = function() {
    const overlay = document.getElementById('coming-soon');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ── COUNTDOWN ──
  window.startCountdown = function() {
    function update() {
      const now = new Date();
      const diff = LAUNCH_DATE - now;
      if (diff <= 0) {
        document.getElementById('cd-days').textContent = '00';
        document.getElementById('cd-hours').textContent = '00';
        document.getElementById('cd-mins').textContent = '00';
        document.getElementById('cd-secs').textContent = '00';
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const pad = n => String(n).padStart(2, '0');
      document.getElementById('cd-days').textContent  = pad(d);
      document.getElementById('cd-hours').textContent = pad(h);
      document.getElementById('cd-mins').textContent  = pad(m);
      document.getElementById('cd-secs').textContent  = pad(s);
    }
    update();
    setInterval(update, 1000);
  }

  // ── PROGRESS BAR ──
  window.animateProgress = function() {
    setTimeout(() => {
      document.querySelector('.cs-progress-fill').style.width = '68%';
    }, 300);
  }

  // ── PARTICLES ──
  window.spawnParticles = function() {
    const container = document.getElementById('csParticles');
    if (container.children.length > 0) return; // already spawned
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'cs-particle';
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        --dur: ${4 + Math.random() * 8}s;
        --delay: ${Math.random() * 6}s;
        width: ${1 + Math.random() * 3}px;
        height: ${1 + Math.random() * 3}px;
        opacity: 0;
      `;
      container.appendChild(p);
    }
  }

  // ── EMAIL SUBMIT ──
  function submitEmail() {
    const input = document.getElementById('csEmail');
    const val = input.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(val)) {
      input.style.borderLeft = '2px solid var(--red)';
      input.focus();
      setTimeout(() => input.style.borderLeft = '', 1200);
      return;
    }
    document.getElementById('csForm').style.display = 'none';
    const success = document.getElementById('csSuccess');
    success.style.display = 'flex';
    // TODO: hook up to your backend / Mailchimp / etc.
    console.log('Email registered:', val);
  }

  // Allow pressing Enter in email input
  document.getElementById('csEmail').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') submitEmail();
  });

  // Auto-show if flag is set
  if (SHOW_COMING_SOON) {
    window.addEventListener('load', showComingSoon);
  }

  // Escape key closes overlay
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') hideComingSoon();
  });