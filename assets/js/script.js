// TODO: switch to the real domain once the blog is connected to cosmichued.com
const BLOG_URL = "https://lime-moose-411861.hostingersite.com";

// TODO: update mood recommendations with your favorite blog post paths
const MOOD_DATA = {
  cozy: {
    emoji: '🌸',
    label: 'cozy',
    message: 'Pour a warm cup of tea and wrap yourself in a soft blanket of calm.',
    // TODO: replace with your preferred post for a cozy mood
    path: '/books-to-read-in-your-20s/',
    cta: 'Read a cozy pick'
  },
  messy: {
    emoji: '🌧️',
    label: 'messy',
    message: 'It is okay if things feel a bit unraveled right now. You do not have to have it all figured out.',
    // TODO: replace with your preferred post for a messy day
    path: '/things-that-should-have-been-taught-in-school/',
    cta: 'A reminder for messy days'
  },
  hopeful: {
    emoji: '✨',
    label: 'hopeful',
    message: 'Something quiet and beautiful is slowly finding its way to you.',
    // TODO: replace with your preferred post for a hopeful mood
    path: '/enjoying-your-own-company/',
    cta: 'Nurture that spark'
  },
  tired: {
    emoji: '😴',
    label: 'tired',
    message: 'Rest is not something you have to earn. Put down the heavy things for a little while.',
    // TODO: replace with your preferred post for resting
    path: '/enjoying-your-own-company/',
    cta: 'Gentle words to unwind'
  },
  thoughtful: {
    emoji: '💭',
    label: 'thoughtful',
    message: 'Deep breaths. Your mind is a garden, give it time and gentle light.',
    // TODO: replace with your preferred post for quiet reflection
    path: '/books-to-read-in-your-20s/',
    cta: 'Wander through this reflection'
  }
};

const THOUGHTS_OF_THE_DAY = [
  "You don’t have to rush becoming who you are meant to be. Blooms take their own sweet time.",
  "Be soft with yourself today; you are learning, unlearning, and growing all at once.",
  "There is quiet magic in an ordinary afternoon if you pause long enough to notice it.",
  "Give yourself permission to pause, breathe, and simply exist without having to produce.",
  "The stars don’t compare their light to each other — they just shine. So should you.",
  "Small steps still carry you forward, even when the path feels blurry.",
  "Trust the season you are in. Even quiet winters are preparing the ground for spring.",
  "Carry a little gentleness in your pocket today; you deserve your own kindness.",
  "Your worth was never measured by your to-do list or anyone else’s expectations.",
  "A cup of tea, an open book, a moment of peace — tiny joys add up to a lovely life.",
  "It’s okay if all you did today was get through it. That is more than enough.",
  "Not everything has to be figured out right now. Let the answers arrive softly.",
  "You bring a quiet hue to the world that no one else can paint.",
  "Allow yourself the grace to be a work in progress with a heart full of wonder.",
  "Today is a clean page. You can write it gently, one soft word at a time."
];

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
      sctx.moveTo(s.x, s.y - L); sctx.lineTo(s.x + L, s.y); sctx.stroke();
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

function getInitialNightState() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'night';
  } catch (e) {}
  const hour = new Date().getHours();
  const isNightTime = hour >= 19 || hour < 6;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isNightTime || prefersDark;
}

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
setTheme(getInitialNightState(), false);

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

/* 3. Link sync with BLOG_URL */
function syncBlogLinks() {
  document.querySelectorAll('a[data-blog-path]').forEach(a => {
    const path = a.getAttribute('data-blog-path');
    if (path) {
      a.href = BLOG_URL + path;
    }
  });
}
syncBlogLinks();

/* 4. Fresh from the journal: WP REST API with skeleton & silent fallback */
const FALLBACK_POSTS = [
  {
    title: "Books to read in your 20s",
    link: BLOG_URL + "/books-to-read-in-your-20s/",
    image: "https://i.pinimg.com/736x/a8/d0/c5/a8d0c54fe1b3bb2aa40adf87feabf3d5.jpg"
  },
  {
    title: "Things that should have been taught in school",
    link: BLOG_URL + "/things-that-should-have-been-taught-in-school/",
    image: "assets/photos/school.png"
  },
  {
    title: "Enjoying your own company",
    link: BLOG_URL + "/enjoying-your-own-company/",
    image: "assets/photos/enjoy-yourself.jpeg"
  }
];

function renderJournalCards(posts) {
  const container = document.getElementById('journal-posts');
  if (!container) return;
  container.innerHTML = posts.map(p => `
    <article class="card glass journal-card">
      <a href="${p.link}" class="journal-img-link" aria-label="${p.title.replace(/"/g, '&quot;')}">
        <img src="${p.image}" alt="${p.title.replace(/"/g, '&quot;')}" class="journal-thumb" loading="lazy">
      </a>
      <div class="journal-body">
        <h3 class="journal-title">
          <a href="${p.link}" class="journal-title-link">${p.title}</a>
        </h3>
        <a href="${p.link}" class="journal-link">Read <span aria-hidden="true">&rarr;</span></a>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.journal-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = (i * 90) + 'ms';
    if (window.appIo) window.appIo.observe(card);
  });
}

function extractFeaturedImage(post) {
  try {
    const media = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
    if (media) {
      if (media.media_details && media.media_details.sizes) {
        const sizes = media.media_details.sizes;
        if (sizes.medium_large && sizes.medium_large.source_url) return sizes.medium_large.source_url;
        if (sizes.medium && sizes.medium.source_url) return sizes.medium.source_url;
        if (sizes.large && sizes.large.source_url) return sizes.large.source_url;
      }
      if (media.source_url) return media.source_url;
    }
  } catch (e) {}
  return 'assets/photos/enjoy-yourself.jpeg';
}

function loadJournalPosts() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  fetch(`${BLOG_URL}/wp-json/wp/v2/posts?per_page=3&_embed`, { signal: controller.signal })
    .then(res => {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(data => {
      clearTimeout(timeoutId);
      if (Array.isArray(data) && data.length > 0) {
        const posts = data.slice(0, 3).map(p => {
          let title = p.title && p.title.rendered ? p.title.rendered : 'Journal Post';
          const temp = document.createElement('div');
          temp.innerHTML = title;
          title = temp.textContent || temp.innerText || title;
          return {
            title,
            link: p.link || (BLOG_URL + '/'),
            image: extractFeaturedImage(p)
          };
        });
        renderJournalCards(posts);
      } else {
        renderJournalCards(FALLBACK_POSTS);
      }
    })
    .catch(() => {
      clearTimeout(timeoutId);
      renderJournalCards(FALLBACK_POSTS);
    });
}
loadJournalPosts();

/* 5. Mood picker */
function initMoodPicker() {
  const btns = document.querySelectorAll('.mood-btn');
  const responseBox = document.getElementById('mood-response');
  if (!btns.length || !responseBox) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const moodKey = btn.getAttribute('data-mood');
      const data = MOOD_DATA[moodKey];
      if (!data) return;

      btns.forEach(b => b.classList.toggle('active', b === btn));
      responseBox.style.display = 'block';
      responseBox.innerHTML = `
        <p class="mood-card-msg">${data.emoji} ${data.message}</p>
        <a href="${BLOG_URL + data.path}" class="mood-card-btn">${data.cta} <span aria-hidden="true">&rarr;</span></a>
      `;
    });
  });
}
initMoodPicker();

/* 6. Thought of the day */
function initThoughtOfTheDay() {
  const thoughtEl = document.getElementById('daily-thought-text');
  if (!thoughtEl || !THOUGHTS_OF_THE_DAY.length) return;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const thought = THOUGHTS_OF_THE_DAY[dayOfYear % THOUGHTS_OF_THE_DAY.length];
  thoughtEl.textContent = `“${thought}”`;
}
initThoughtOfTheDay();

/* 7. Sparkle cursor trail on desktop */
function initCursorSparkles() {
  if (calm) return;
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

  const sparkles = [];
  const maxSparkles = 12;
  const colors = ['#E56F9C', '#F4A9C2', '#C9A7F5', '#D6BEFF', '#FFD1DC'];
  const symbols = ['✦', '✧'];
  let lastX = 0, lastY = 0, lastTime = 0;

  window.addEventListener('pointermove', (e) => {
    const now = Date.now();
    if (now - lastTime < 45) return;
    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (dist < 12) return;

    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;

    if (sparkles.length >= maxSparkles) {
      const oldest = sparkles.shift();
      if (oldest && oldest.parentNode) oldest.remove();
    }

    const span = document.createElement('span');
    span.className = 'cursor-sparkle';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    span.style.left = e.clientX + 'px';
    span.style.top = e.clientY + 'px';
    span.style.color = colors[Math.floor(Math.random() * colors.length)];
    span.style.fontSize = (Math.random() * 6 + 10).toFixed(0) + 'px';

    document.body.appendChild(span);
    sparkles.push(span);

    span.addEventListener('animationend', () => {
      span.remove();
      const idx = sparkles.indexOf(span);
      if (idx > -1) sparkles.splice(idx, 1);
    }, { once: true });
  }, { passive: true });
}
initCursorSparkles();

/* 8. Reveal on scroll */
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      io.unobserve(en.target);
      setTimeout(() => en.target.style.transitionDelay = '', 1400);
    }
  });
}, { threshold: 0.15 });
window.appIo = io;

document.querySelectorAll('.hero-card,.photo,.card,.news,h2,.lead,.more-section,.mood-section,.journal-section').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = (el.classList.contains('photo') || el.classList.contains('card')
    ? (i % 4) * 90 : 0) + 'ms';
  io.observe(el);
});
parallax();
