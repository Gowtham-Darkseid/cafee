import './style.css'

/* ─── Cursor ─── */
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  if (cursor) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  }
});
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => { if (cursor) { cursor.style.width = '20px'; cursor.style.height = '20px'; } });
  el.addEventListener('mouseleave', () => { if (cursor) { cursor.style.width = '10px'; cursor.style.height = '10px'; } });
});

/* ─── Reveal on scroll ─── */
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) setTimeout(() => entry.target.classList.add('visible'), i * 80);
  });
}, { threshold: 0.12 });
reveals.forEach(el => io.observe(el));

/* ─── Product tabs ─── */
document.querySelectorAll('.ptab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

/* ─── Add to cart ─── */
document.querySelectorAll('.product-add').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    btn.textContent = '✓';
    btn.style.background = 'var(--sage)';
    setTimeout(() => { btn.textContent = '+'; btn.style.background = ''; }, 1500);
  });
});

/* ─── Marquee duplicate ─── */
const track = document.querySelector('.marquee-track');
if (track) track.innerHTML += track.innerHTML;

/* ─── Rotating intro tagline ─── */
(function rotateTagline() {
  const l1 = document.getElementById('tagline-l1');
  const l2 = document.getElementById('tagline-l2');
  if (!l1 || !l2) return;

  const quotes = [
    ['ROOTED IN',    'THE CLOUDS'],
    ['HAND PICKED',  'AT DAWN'],
    ['BORN FROM',    'THE MIST'],
    ['BREWED BY',    'THE TRIBE'],
    ['FROM SOIL',    'TO SOUL'],
    ['SHADE GROWN',  'SUN KISSED'],
    ['WILD HARVEST', 'PURE TASTE'],
    ['ANCIENT LAND', 'MODERN CUP'],
    ['STEEP HILLS',  'DEEP FLAVOR'],
    ['FOREST FIRST', 'CUP SECOND'],
  ];

  let current = 0;

  function swap() {
    // fade out
    l1.classList.add('fading');
    l2.classList.add('fading');

    setTimeout(() => {
      current = (current + 1) % quotes.length;
      l1.textContent = quotes[current][0];
      l2.textContent = quotes[current][1];

      // fade back in
      l1.classList.remove('fading');
      l2.classList.remove('fading');
    }, 520); // slightly after the 0.5s CSS transition ends
  }

  setInterval(swap, 3000);
})();

/* ─────────────────────────────────────────────
   INTRO SCROLL-DRIVEN FRAME SEQUENCE
   149 WebP frames, pinned canvas, lerp smoothing
───────────────────────────────────────────── */
(function initFrameSequence() {
  const TOTAL    = 149;
  const BASE_URL = 'https://pwrxtcslsdaojzpdwzqs.supabase.co/storage/v1/object/public/cafe/';
  const DELAY    = '0.041s';

  const canvas   = document.getElementById('intro-canvas');
  const scroller = document.getElementById('intro-scroll');
  if (!canvas || !scroller) return;

  const ctx = canvas.getContext('2d');

  // ── declare state FIRST (avoids TDZ crash) ──
  const imgs = new Array(TOTAL);
  let curF  = 0;
  let tgtF  = 0;
  let lastI = -1;

  // ── cover-fit draw ──
  function paint(idx) {
    const img = imgs[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    const cw = canvas.width, ch = canvas.height;
    const sc = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(
      img,
      (cw - img.naturalWidth  * sc) / 2,
      (ch - img.naturalHeight * sc) / 2,
      img.naturalWidth  * sc,
      img.naturalHeight * sc
    );
  }

  // ── resize canvas to viewport ──
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    paint(lastI >= 0 ? lastI : 0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ── preload all 149 frames ──
  for (let i = 0; i < TOTAL; i++) {
    const img = new Image();
    img.src = `${BASE_URL}frame_${String(i).padStart(3, '0')}_delay-${DELAY}.webp`;
    img.onload = () => { if (i === 0) paint(0); };
    imgs[i] = img;
  }

  // ── scroll → target frame (uses getBoundingClientRect for accuracy) ──
  function onScroll() {
    const rect     = scroller.getBoundingClientRect();
    const scrolled = -rect.top;                             // px scrolled into container
    const range    = scroller.offsetHeight - window.innerHeight; // total scrollable range
    if (range <= 0) return;
    tgtF = Math.max(0, Math.min(1, scrolled / range)) * (TOTAL - 1);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── RAF loop: ease curF toward tgtF ──
  (function tick() {
    curF += (tgtF - curF) * 0.12;
    const idx = Math.round(curF);
    if (idx !== lastI) {
      paint(idx);
      lastI = idx;
    }
    requestAnimationFrame(tick);
  })();

})();

console.log('ARAKU Valley Coffee – frame sequence initialized');

/* ─── Scroll to top ─── */
const scrollToTopBtn = document.getElementById('scroll-to-top');
if (scrollToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight) {
      scrollToTopBtn.classList.add('show');
    } else {
      scrollToTopBtn.classList.remove('show');
    }
  }, { passive: true });

  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
