import './style.css'

/* ─── Preloader ─── */
document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Wait for the inner animation to finish (approx 2.4s) before triggering the curtain slide out
    setTimeout(() => {
      preloader.classList.add('loaded');
      // Keeping preloader in DOM for reuse in transitions
      // setTimeout(() => preloader.remove(), 1200);
    }, 2400); 
  }
  
  initNavTransitions();
  initTestimonialAutoScroll();
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
    const category = tab.textContent;
    document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Filter products
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      const cardTag = card.querySelector('.product-tag').textContent;
      if (category === 'All' || cardTag.toLowerCase().includes(category.toLowerCase())) {
        card.style.display = 'flex';
        gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
      } else {
        card.style.display = 'none';
      }
    });
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

/* ─── Cinematic Nav Transitions ─── */
function initNavTransitions() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // Select all internal anchor links in nav and hero
  const links = document.querySelectorAll('nav a[href^="#"], .hero-btns .btn-outline, .hero-btns .btn-fill');
  
  links.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href') || (link.textContent.toLowerCase().includes('story') ? '#origin' : null);
      if (!href || !href.startsWith('#') || href === '#') return;
      
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Start transition
      preloader.classList.add('nav-transition');
      preloader.classList.remove('loaded');

      // Wait for curtain to close fully
      setTimeout(() => {
        window.scrollTo({
          top: target.offsetTop,
          behavior: 'auto' // Instant jump behind the curtain
        });

        // Re-open curtain
        setTimeout(() => {
          preloader.classList.add('loaded');
          
          // Clean up transition class after it's fully open
          setTimeout(() => {
            preloader.classList.remove('nav-transition');
          }, 800);
        }, 100);
      }, 700); // 100ms before the 800ms CSS transition ends for smoothness
    });
  });
}

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

    // ── Update nav visibility based on hero position ──
    const nav = document.getElementById('main-nav');
    if (nav) {
      if (window.innerWidth <= 768 || scrolled >= range) {
        nav.classList.remove('nav-hidden-hero');
      } else {
        nav.classList.add('nav-hidden-hero');
      }
    }
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

/* ─── TABLE BOOKING LOGIC MOVED TO RESERVE.HTML ─── */


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

/* ─── UTILITIES & FEEDBACK ─── */

window.showToast = function(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-msg">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  // Trigger reveal
  requestAnimationFrame(() => toast.classList.add('show'));

  // Remove after 3s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
};

/* ─── NEWSLETTER ─── */
document.addEventListener('DOMContentLoaded', () => {
  const nlBtn = document.querySelector('.nl-btn');
  const nlInput = document.querySelector('.nl-input');

  if (nlBtn && nlInput) {
    nlBtn.addEventListener('click', () => {
      const email = nlInput.value.trim();
      if (!email || !email.includes('@')) {
        window.showToast('Please enter a valid email address.', 'error');
        return;
      }

      nlBtn.textContent = 'Subscribing...';
      nlBtn.disabled = true;

      setTimeout(() => {
        window.showToast('Welcome to the Valley! Check your inbox soon.');
        nlInput.value = '';
        nlBtn.textContent = 'Subscribe';
        nlBtn.disabled = false;
      }, 1500);
    });
  }
});

/* ─── SHARED ACTIONS ─── */
window.scrollToSection = function(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) {
    window.scrollTo({
      top: target.offsetTop - 80,
      behavior: 'smooth'
    });
    
    // Update active state in menu cat nav if present
    document.querySelectorAll('.menu-cat-btn').forEach(btn => {
      if (btn.getAttribute('onclick')?.includes(sectionId)) {
        document.querySelectorAll('.menu-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  }
};

// Global polyfill for coming soon links
document.addEventListener('click', e => {
  const link = e.target.closest('a');
  if (link && link.getAttribute('href') === '#') {
    e.preventDefault();
    window.showToast('Article coming soon to the Journal.', 'info');
  }
});

/* ─── Mobile Menu Toggle ─── */
(function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const closeLinks = document.querySelectorAll('[data-mm-close]');

  if (!toggle || !menu) return;

  function toggleMenu() {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
  }

  toggle.addEventListener('click', toggleMenu);

  closeLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Handle nav visibility for mobile (independent of scroll-intro)
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    if (window.innerWidth <= 768 && nav) {
      nav.classList.remove('nav-hidden-hero');
    }
  }, { passive: true });
})();

/* ─── Testimonial Auto-Scroll ─── */
function initTestimonialAutoScroll() {
  const grid = document.querySelector('.tp-grid');
  if (!grid) return;

  let interval;
  let isInteracting = false;

  const startAutoScroll = () => {
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      // Only scroll on mobile and when not interacting
      if (window.innerWidth > 768 || isInteracting) return;
      
      const cardWidth = grid.querySelector('.tp-card')?.offsetWidth + 20; // card + gap
      if (!cardWidth) return;

      const currentScroll = grid.scrollLeft;
      const maxScroll = grid.scrollWidth - grid.offsetWidth;

      if (currentScroll >= maxScroll - 10) {
        // Loop back to start
        grid.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll to next card
        grid.scrollTo({ left: currentScroll + cardWidth, behavior: 'smooth' });
      }
    }, 4000);
  };

  const stopAutoScroll = () => clearInterval(interval);

  // Pause on interaction
  grid.addEventListener('touchstart', () => { isInteracting = true; stopAutoScroll(); }, { passive: true });
  grid.addEventListener('touchend', () => { 
    isInteracting = false; 
    // Wait a bit after interaction before resuming
    setTimeout(startAutoScroll, 2000); 
  }, { passive: true });

  startAutoScroll();
}

console.log('ARAKU – Enhanced functionality & Mobile navigation initialized');
