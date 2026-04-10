import './style.css'

/* ─── Preloader ─── */
document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Wait for the inner animation to finish (approx 2.4s) before triggering the curtain slide out
    setTimeout(() => {
      preloader.classList.add('loaded');
      // Completely remove from DOM after the clip-path transition is over to allow scrolling
      setTimeout(() => preloader.remove(), 1200);
    }, 2400); 
  }
});
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
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, { threshold: 0 });
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

/* ─── TABLE BOOKING LOGIC ─── */
window.selectTable = function(tableId) {
  const allTables = document.querySelectorAll('.f-table');
  const target = document.getElementById(tableId);

  // Ignore if booked
  if (!target || target.classList.contains('booked')) return;

  // Deselect others
  allTables.forEach(t => t.classList.remove('selected'));
  
  // Select clicked
  target.classList.add('selected');

  // Update UI Panel
  const tableName = target.getAttribute('data-table');
  const title = document.getElementById('bp-title');
  const desc = document.getElementById('bp-desc');
  const form = document.getElementById('bp-form');
  const empty = document.getElementById('bp-empty');
  const success = document.getElementById('bp-success');

  title.textContent = 'Booking: ' + tableName;
  desc.style.display = 'block';
  empty.style.display = 'none';
  success.style.display = 'none';
  form.style.display = 'block';
};

window.confirmBooking = function(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('bp-btn-submit');
  const originalText = submitBtn.textContent;
  
  submitBtn.textContent = 'Processing...';
  submitBtn.style.opacity = '0.6';

  setTimeout(() => {
    submitBtn.textContent = originalText;
    submitBtn.style.opacity = '1';

    // Show Success, Hide Form
    document.getElementById('bp-form').style.display = 'none';
    document.getElementById('bp-desc').style.display = 'none';
    document.getElementById('bp-title').textContent = 'Confirmed!';
    document.getElementById('bp-success').style.display = 'block';
    
    // Mark table as booked visually
    const selected = document.querySelector('.f-table.selected');
    if (selected) {
      selected.classList.remove('selected');
      selected.classList.add('booked');
      selected.onclick = null; 
      
      const prevData = selected.getAttribute('data-table');
      selected.setAttribute('data-table', prevData + ' (Booked)');
    }
  }, 1200);
};

/* ─── GSAP SCROLL & PARALLAX LOGIC ─── */
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Parallax Backgrounds
  document.querySelectorAll('.parallax-bg').forEach(bg => {
    const speed = bg.getAttribute('data-speed') || 0.5;
    gsap.to(bg, {
      y: () => (document.documentElement.scrollHeight - window.innerHeight) * speed * 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: bg.closest('.parallax-container') || bg.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });

  // GSAP Reveal Animations
  gsap.utils.toArray('.gsap-fade').forEach(elem => {
    gsap.fromTo(elem, 
      { autoAlpha: 0, y: 30 }, 
      { autoAlpha: 1, y: 0, duration: 1.2, ease: "power3.out",
        scrollTrigger: {
          trigger: elem,
          start: "top 85%",
        }
      }
    );
  });
  
  gsap.utils.toArray('.gsap-reveal').forEach(elem => {
    gsap.fromTo(elem, 
      { autoAlpha: 0, y: 50 }, 
      { autoAlpha: 1, y: 0, duration: 1.5, ease: "expo.out",
        scrollTrigger: {
          trigger: elem,
          start: "top 90%",
        }
      }
    );
  });

  // Staggered reveals
  gsap.utils.toArray('.menu-category, .lp-grid').forEach(container => {
    const items = container.querySelectorAll('.gsap-stagger, .lp-card');
    if (items.length > 0) {
      gsap.fromTo(items,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: "top 85%"
          }
        }
      );
    }
  });

  // Split text reveal fallback (basic word splitting)
  document.querySelectorAll('.gsap-stagger-text').forEach(elem => {
    gsap.set(elem, { autoAlpha: 1 });
    const text = elem.innerText;
    elem.innerHTML = text.split(' ').map(word => `<span style="display:inline-block; overflow:hidden; vertical-align:top;"><span style="display:inline-block;" class="stagger-word">${word}</span></span>`).join(' ');
    
    gsap.fromTo(elem.querySelectorAll('.stagger-word'),
      { yPercent: 100 },
      { yPercent: 0, duration: 1, stagger: 0.1, ease: "power4.out",
        scrollTrigger: {
          trigger: elem,
          start: "top 80%"
        }
      }
    );
  });

  /* ─── MAGNETIC BUTTONS ─── */
  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.5, ease: "power3.out" });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
  });

  /* Update custom cursor size on magnetic hover */
  magneticBtns.forEach(el => {
    el.addEventListener('mouseenter', () => { 
      const cursor = document.getElementById('cursor');
      if (cursor) { 
        cursor.style.transform = 'translate(-50%, -50%) scale(3)'; 
        cursor.style.background = 'transparent'; 
        cursor.style.border = '1px solid var(--gold)'; 
      } 
    });
    el.addEventListener('mouseleave', () => { 
      const cursor = document.getElementById('cursor');
      if (cursor) { 
        cursor.style.transform = 'translate(-50%, -50%) scale(1)'; 
        cursor.style.background = 'var(--gold)'; 
        cursor.style.border = 'none'; 
      } 
    });
  });
}
