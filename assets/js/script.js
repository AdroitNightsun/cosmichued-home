const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. Day / night theme: Vanta fog colours + twinkling star canvas */
const root = document.documentElement;
const modeBtn = document.getElementById('mode');
const knob = modeBtn.querySelector('.knob');
const starsCv = document.getElementById('stars');
const sctx = starsCv.getContext('2d');
let vanta = null, stars = [], shoot = null, raf = 0, SW = 0, SH = 0;

function initVanta(night) {
  if (calm || !window.VANTA) return;
  try {
    if (vanta) vanta.destroy();
    vanta = VANTA.FOG(Object.assign({
      el: '#vanta-bg', mouseControls: false, touchControls: false, gyroControls: false,
      minHeight: 200, minWidth: 200, blurFactor: 0.7, speed: 1.2, zoom: 0.9
    }, night
      ? { highlightColor: 0x7a5bb8, midtoneColor: 0x3b2a6e, lowlightColor: 0x140b2b, baseColor: 0x0d0720 }
      : { highlightColor: 0xf9a8c9, midtoneColor: 0xd9c2ff, lowlightColor: 0xfdeef3, baseColor: 0xfff5f8 }));
  } catch (e) { console.warn('Vanta failed, using CSS gradient', e); }
}

function sizeStars() {
  const d = Math.min(devicePixelRatio || 1, 2);
  SW = innerWidth; SH = innerHeight;
  starsCv.width = SW * d; starsCv.height = SH * d;
  sctx.setTransform(d, 0, 0, d, 0, 0);
  const n = Math.min(260, Math.round(SW * SH / 5500)), cols = ['#ffffff', '#ffd6e6', '#e3d4ff', '#cfe6ff'];
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * SW, y: Math.random() * SH, r: Math.random() * 1.4 + 0.3,
    p: Math.random() * 6.28, s: Math.random() * 1.8 + 0.6,
    c: cols[Math.floor(Math.random() * cols.length)], big: Math.random() < 0.08
  }));
}

function drawStars(t) {
  sctx.clearRect(0, 0, SW, SH);
  for (const s of stars) {
    const a = calm ? 0.85 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t / 1000 * s.s + s.p));   // twinkle
    sctx.globalAlpha = a; sctx.fillStyle = s.c;
    sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, 6.283); sctx.fill();
    if (s.big) {                                                                        // sparkle cross
      const L = s.r * 5 * a;
      sctx.strokeStyle = s.c; sctx.lineWidth = 0.8; sctx.beginPath();
      sctx.moveTo(s.x - L, s.y); sctx.lineTo(s.x + L, s.y);
      sctx.moveTo(s.x, s.y - L); sctx.lineTo(s.x, s.y + L); sctx.stroke();
    }
  }
  if (!calm) {                                                                          // shooting star
    if (!shoot && Math.random() < 0.003) shoot = { x: SW * 0.2 + Math.random() * SW * 0.8, y: Math.random() * SH * 0.35, l: 0 };
    if (shoot) {
      shoot.l += 14;
      const x = shoot.x - shoot.l, y = shoot.y + shoot.l * 0.55;
      const g = sctx.createLinearGradient(x + 90, y - 50, x, y);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.95)');
      sctx.globalAlpha = 1; sctx.strokeStyle = g; sctx.lineWidth = 2;
      sctx.beginPath(); sctx.moveTo(x + 90, y - 50); sctx.lineTo(x, y); sctx.stroke();
      if (shoot.l > 600) shoot = null;
    }
  }
  sctx.globalAlpha = 1;
}
function loop(t) { drawStars(t); raf = requestAnimationFrame(loop); }

function setTheme(night, save) {
  root.dataset.theme = night ? 'night' : 'day';
  modeBtn.setAttribute('aria-pressed', night);
  modeBtn.setAttribute('aria-label', night ? 'Switch to day mode' : 'Switch to night mode');
  knob.textContent = night ? '🌙' : '☀️';
  if (save) { try { localStorage.setItem('theme', night ? 'night' : 'day'); } catch (e) {} }
  cancelAnimationFrame(raf);
  if (night) { sizeStars(); if (calm) drawStars(0); else raf = requestAnimationFrame(loop); }
  initVanta(night);
}
modeBtn.addEventListener('click', () => setTheme(root.dataset.theme !== 'night', true));
addEventListener('resize', () => { if (root.dataset.theme === 'night') { sizeStars(); if (calm) drawStars(0); } });
setTheme(root.dataset.theme === 'night', false);

/* 1b. Flowers that sway left/right (and drift up) as you scroll */
/* drawn SVG flowers (clearly visible on pale day background and dark night sky) */
const PETALS = {   // petal colour, centre colour, petal count
  '🌸': ['#F48FB1', '#FFD66B', 5], '🌷': ['#E56F9C', '#FFE08A', 6], '🌼': ['#FFD966', '#E56F9C', 8],
  '🌺': ['#B993F0', '#FFD66B', 5], '💮': ['#F9B4CB', '#E56F9C', 6]
};
function flowerSVG(key) {
  const [c1, c2, n] = PETALS[key];
  let ps = '';
  for (let i = 0; i < n; i++) ps += '<ellipse cx="50" cy="26" rx="14" ry="24" transform="rotate(' + (i * 360 / n) + ' 50 50)"/>';
  return '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><g fill="' + c1 +
         '" stroke="#fff" stroke-width="3" stroke-linejoin="round">' + ps + '</g><circle cx="50" cy="50" r="13" fill="' + c2 +
         '" stroke="#fff" stroke-width="3"/></svg>';
}
const FLOWERS = [   // emoji, x(0-1), y(0-1), size, sway px, sway speed, drift, tilt, front?
  ['🌸', .06, .20, 40, 90, .0042, .16, 28, 0], ['🌷', .90, .35, 36, 80, .0035, .22, 22, 0],
  ['🌼', .15, .70, 34, 110, .0050, .12, 30, 0], ['🌺', .82, .80, 42, 95, .0038, .18, 26, 0],
  ['🌸', .50, .10, 28, 70, .0045, .10, 20, 0], ['💮', .70, .55, 30, 85, .0040, .14, 24, 0],
  ['🌸', .03, .45, 26, 130, .0060, .30, 35, 1], ['🌷', .94, .15, 24, 120, .0055, .34, 30, 1],
  ['🌼', .88, .62, 22, 140, .0065, .28, 40, 1], ['🌺', .08, .90, 24, 125, .0058, .32, 32, 1]
].map((f, i) => {
  const el = document.createElement('span');
  el.className = 'flower'; el.innerHTML = flowerSVG(f[0]);
  el.style.width = el.style.height = Math.round(f[3] * 1.4) + 'px';
  el.style.opacity = f[8] ? 1 : 0.92;
  const parent = document.getElementById(f[8] ? 'flowers-front' : 'flowers-back');
  if (parent) parent.appendChild(el);
  return { el, bx: f[1], by: f[2], amp: f[4], sp: f[5], vy: f[6], tilt: f[7], ph: i * 1.7 };
});
function flowers(scroll) {
  const W = innerWidth, H = innerHeight, span = H + 160;
  for (const f of FLOWERS) {
    const x = f.bx * W + Math.sin(scroll * f.sp + f.ph) * f.amp;                       // side to side
    const y = (((f.by * H - scroll * f.vy) % span) + span) % span - 80;               // slow upward drift, wraps
    const r = Math.sin(scroll * f.sp * 1.3 + f.ph) * f.tilt;
    f.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + r.toFixed(1) + 'deg)';
  }
}
flowers(0);

/* 2. Lenis: buttery scroll, progress bar, anchor links, light parallax, back to top */
const bar = document.getElementById('progress');
const photosWrap = document.querySelector('.photos');
const photos = [...document.querySelectorAll('.photo')];
const speeds = [0.05, -0.04, 0.07, -0.03];
const backToTop = document.getElementById('back-to-top');

function parallax() {
  if (calm || !photosWrap) return;
  const r = photosWrap.getBoundingClientRect();           // parent isn't moved, so no feedback loop
  const off = (r.top + r.height / 2) - innerHeight / 2;
  photos.forEach((el, i) => el.style.translate = '0 ' + (off * speeds[i % 4]).toFixed(1) + 'px');
}

function updateBackToTop(y) {
  if (backToTop) backToTop.classList.toggle('visible', y > 400);
}

if (window.Lenis) {
  const lenis = new Lenis({ autoRaf: true, lerp: 0.09 });
  lenis.on('scroll', ({ progress, scroll }) => {
    if (bar) bar.style.transform = 'scaleX(' + progress + ')';
    parallax();
    if (!calm) flowers(scroll);
    updateBackToTop(scroll);
  });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const t = document.querySelector(href);
    if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t, { offset: -90, duration: 1.4 });
  }));
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      lenis.scrollTo(0);
    });
  }
} else {
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (bar) bar.style.transform = 'scaleX(' + y / (document.documentElement.scrollHeight - innerHeight) + ')';
    parallax();
    if (!calm) flowers(y);
    updateBackToTop(y);
  };
  addEventListener('scroll', onScroll, { passive: true });
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
    });
  }
}

updateBackToTop(window.scrollY || document.documentElement.scrollTop);

/* 3. Reveal on scroll */
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      io.unobserve(en.target);
      setTimeout(() => en.target.style.transitionDelay = '', 1400);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.hero-card,.photo,.card,.news,h2,.lead,.more-section').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (el.classList.contains('photo') || el.classList.contains('card')
    ? (i % 4) * 90 : 0) + 'ms';
  io.observe(el);
});
parallax();

