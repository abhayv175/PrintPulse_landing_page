/**
 * PrintPulse SaaS Product Landing Page Scripts
 * Includes:
 * 1. View Transitions API Circular Theme Toggle (Dark / Light Mode)
 * 2. Translucent Sliding Nav Pill Indicator with Intersection Observer
 * 3. Brand Scroll to Top
 * 4. Interactive Savings Calculator with Presets
 * 5. Web Audio API Notification Chime Demo
 * 6. Dynamic Live Ping Latency Jitter
 * 7. Copy-to-Clipboard Micro-interaction
 * 8. Desktop & Mobile 18-Screenshot Gallery Tabs & Lightbox Modal
 * 9. FAQ Accordions & Mobile Drawer
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initThemeToggle();
  initNavPill();
  initBrandScrollToTop();
  initCalculator();
  initGalleryTabs();
  initFaqAccordion();
  initMobileMenu();
  initSmoothScroll();
  initLightboxEvents();
  initLivePingJitter();
  initScrollProgressAndScrollbarEnlarge();
  initMobileScrollHighlight();
  initMobileBrandMorph();
});

/* --------------------------------------------------------------------------
   1. View Transitions API Circular Theme Toggle (Dark / Light Mode)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;

  themeBtn.addEventListener('click', (e) => {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const nextTheme = isDark ? 'light' : 'dark';

    // Check if browser supports View Transitions API
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const rect = themeBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        document.documentElement.setAttribute('data-theme', nextTheme);
        try { localStorage.setItem('printpulse_theme', nextTheme); } catch(err) {}
        if (window.lucide) window.lucide.createIcons();
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ];
        document.documentElement.animate(
          {
            clipPath: clipPath
          },
          {
            duration: 480,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
    } else {
      // Graceful fallback with smooth CSS class
      document.body.style.transition = 'background-color 0.4s ease, color 0.4s ease';
      document.documentElement.setAttribute('data-theme', nextTheme);
      try { localStorage.setItem('printpulse_theme', nextTheme); } catch(err) {}
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        document.body.style.transition = '';
      }, 450);
    }
  });
}

/* --------------------------------------------------------------------------
   2. Translucent Sliding Nav Pill Indicator — Silky Spring Tracking
   -------------------------------------------------------------------------- */
let isNavClickScrolling = false;
let navScrollTimer = null;

function initNavPill() {
  const navLinksContainer = document.getElementById('nav-links');
  const indicator = document.getElementById('nav-pill-indicator');
  const links = document.querySelectorAll('.nav-links .nav-link');
  if (!navLinksContainer || !indicator || links.length === 0) return;

  let activeLink = null;
  let clickedTimeout = null;

  function positionIndicator(target) {
    if (!target) {
      indicator.style.opacity = '0';
      return;
    }
    const left = target.offsetLeft;
    const width = target.offsetWidth;

    indicator.style.setProperty('--pill-x', `${left}px`);
    indicator.style.width = `${width}px`;
    indicator.style.opacity = '1';
  }

  // Hover effect: preview pill smoothly on hover
  links.forEach(link => {
    link.addEventListener('mouseenter', () => positionIndicator(link));
    link.addEventListener('click', () => {
      // Lock scroll tracking so intermediate sections don't override the clicked tab
      isNavClickScrolling = true;
      clearTimeout(navScrollTimer);

      activeLink = link;
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      positionIndicator(link);

      // Trigger smooth tactile enlargement pulse without overriding translation
      indicator.classList.remove('clicked');
      void indicator.offsetWidth; // Force CSS reflow
      indicator.classList.add('clicked');
      clearTimeout(clickedTimeout);
      clickedTimeout = setTimeout(() => {
        indicator.classList.remove('clicked');
      }, 360);

      // Fallback release if no scroll events occur
      navScrollTimer = setTimeout(() => {
        isNavClickScrolling = false;
      }, 900);
    });
  });

  navLinksContainer.addEventListener('mouseleave', () => {
    positionIndicator(activeLink);
  });

  // Release lock immediately if user manually interacts with wheel or touch
  window.addEventListener('wheel', () => {
    isNavClickScrolling = false;
  }, { passive: true });

  window.addEventListener('touchmove', () => {
    isNavClickScrolling = false;
  }, { passive: true });

  // Track active section as user scrolls with high-performance requestAnimationFrame
  const observedSections = [
    document.getElementById('features'),
    document.getElementById('how-it-works'),
    document.getElementById('calculator'),
    document.getElementById('screenshots'),
    document.getElementById('architecture')
  ].filter(Boolean);

  let scrollTicking = false;
  function updateScrollPosition() {
    // If a tab was clicked, hold the pill on the clicked tab until smooth scroll finishes
    if (isNavClickScrolling) {
      clearTimeout(navScrollTimer);
      navScrollTimer = setTimeout(() => {
        isNavClickScrolling = false;
        updateScrollPosition();
      }, 150);
      return;
    }

    if (window.scrollY < 280) {
      if (activeLink !== null) {
        activeLink = null;
        links.forEach(l => l.classList.remove('active'));
        indicator.style.opacity = '0';
      }
      return;
    }

    // Offset position just beneath the floating navbar
    const checkPoint = window.scrollY + 200;
    let currentSection = null;

    for (let i = observedSections.length - 1; i >= 0; i--) {
      const section = observedSections[i];
      if (section.offsetTop <= checkPoint) {
        currentSection = section;
        break;
      }
    }

    if (currentSection) {
      const id = currentSection.id;
      const matchingLink = document.querySelector(`.nav-links .nav-link[data-section="${id}"]`);
      if (matchingLink && matchingLink !== activeLink) {
        activeLink = matchingLink;
        links.forEach(l => l.classList.remove('active'));
        matchingLink.classList.add('active');
        positionIndicator(matchingLink);
      }
    }
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        updateScrollPosition();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (activeLink) positionIndicator(activeLink);
  });

  // Run initial check
  updateScrollPosition();
}

/* --------------------------------------------------------------------------
   3. Brand Logo: Click moves scroll to Home
   -------------------------------------------------------------------------- */
function initBrandScrollToTop() {
  const brandLink = document.getElementById('nav-brand-link');
  if (!brandLink) return;

  brandLink.addEventListener('click', (e) => {
    e.preventDefault();
    isNavClickScrolling = true;
    clearTimeout(navScrollTimer);

    const links = document.querySelectorAll('.nav-links .nav-link');
    links.forEach(l => l.classList.remove('active'));
    const indicator = document.getElementById('nav-pill-indicator');
    if (indicator) indicator.style.opacity = '0';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    navScrollTimer = setTimeout(() => {
      isNavClickScrolling = false;
    }, 700);
  });
}

/* --------------------------------------------------------------------------
   4. Interactive Savings & Revenue Calculator + Presets
   -------------------------------------------------------------------------- */
let currentRatio = 'mostly-bw'; // 'all-bw', 'mostly-bw', 'balanced'

function initCalculator() {
  const pagesSlider = document.getElementById('calc-pages-slider');
  const pagesValue = document.getElementById('calc-pages-val');
  const toggleButtons = document.querySelectorAll('.calc-toggle-btn');
  
  const dailyRevEl = document.getElementById('calc-daily-rev');
  const monthlyRevEl = document.getElementById('calc-monthly-rev');
  const annualLossEl = document.getElementById('calc-annual-loss');
  const savingsHighlightEl = document.getElementById('calc-savings-highlight');

  if (!pagesSlider || !pagesValue) return;

  function updateCalculations() {
    const pages = parseInt(pagesSlider.value, 10);
    pagesValue.textContent = `${pages.toLocaleString()} pages / day`;

    // Pricing rates verified from vendor app settings
    const bwRate = 2.0;
    const colorRate = 10.0;
    
    let bwPercent = 0.85;
    let colorPercent = 0.15;

    if (currentRatio === 'all-bw') {
      bwPercent = 1.0;
      colorPercent = 0.0;
    } else if (currentRatio === 'balanced') {
      bwPercent = 0.5;
      colorPercent = 0.5;
    }

    const avgPagePrice = (bwPercent * bwRate) + (colorPercent * colorRate);
    const dailyRevenue = pages * avgPagePrice;
    const monthlyRevenue = dailyRevenue * 30;
    const annualRevenue = dailyRevenue * 365;

    // Traditional Gateway Cut (Razorpay/Stripe charges 2.5% MDR + 18% GST on MDR = 2.95%)
    const annualMdrLoss = annualRevenue * 0.0295;

    // Format numbers
    if (dailyRevEl) dailyRevEl.textContent = `₹${Math.round(dailyRevenue).toLocaleString('en-IN')}`;
    if (monthlyRevEl) monthlyRevEl.textContent = `₹${Math.round(monthlyRevenue).toLocaleString('en-IN')}`;
    if (annualLossEl) annualLossEl.textContent = `₹${Math.round(annualMdrLoss).toLocaleString('en-IN')} / yr`;
    if (savingsHighlightEl) savingsHighlightEl.textContent = `₹${Math.round(annualMdrLoss).toLocaleString('en-IN')}`;
  }

  pagesSlider.addEventListener('input', updateCalculations);

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRatio = btn.getAttribute('data-ratio');
      updateCalculations();
    });
  });

  // Initial calculation
  updateCalculations();
}

function applyCalcPreset(pages, ratio) {
  const pagesSlider = document.getElementById('calc-pages-slider');
  const toggleButtons = document.querySelectorAll('.calc-toggle-btn');
  const presetChips = document.querySelectorAll('.calc-preset-chip');

  if (!pagesSlider) return;

  pagesSlider.value = pages;
  currentRatio = ratio;

  toggleButtons.forEach(btn => {
    if (btn.getAttribute('data-ratio') === ratio) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  presetChips.forEach(chip => {
    if (chip.textContent.includes(pages.toString())) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  // Trigger input event to recompute
  pagesSlider.dispatchEvent(new Event('input'));
}

/* --------------------------------------------------------------------------
   5. Dynamic Sound Preview Button (Web Audio API Bell Chime)
   -------------------------------------------------------------------------- */
function playNotificationChime(event) {
  if (event) event.stopPropagation();
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 880 Hz (A5) bell harmony
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.35, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);

    // Animate soundwaves
    const waves = document.querySelectorAll('.sound-waves');
    waves.forEach(w => {
      w.classList.add('playing');
      setTimeout(() => w.classList.remove('playing'), 650);
    });
  } catch (err) {
    console.log('Audio autoplay policy note:', err);
  }
}

/* --------------------------------------------------------------------------
   6. Dynamic Live Ping Latency Jitter
   -------------------------------------------------------------------------- */
function initLivePingJitter() {
  const pingEl = document.getElementById('live-ping-val');
  if (!pingEl) return;

  const pingValues = ['24ms', '28ms', '32ms', '22ms', '27ms', '35ms', '29ms'];
  let index = 0;

  setInterval(() => {
    index = (index + 1) % pingValues.length;
    pingEl.textContent = pingValues[index];
  }, 4000);
}

/* --------------------------------------------------------------------------
   7. Copy to Clipboard Micro-Interaction
   -------------------------------------------------------------------------- */
function copyText(text, el) {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(text).then(() => {
    const originalText = el.textContent;
    el.textContent = '✓ Copied!';
    el.style.color = 'var(--brand-emerald)';
    setTimeout(() => {
      el.textContent = originalText;
      el.style.color = '';
    }, 1800);
  }).catch(err => console.log('Clipboard copy failed:', err));
}

/* --------------------------------------------------------------------------
   9. Desktop & Mobile Gallery Tab Switcher
   -------------------------------------------------------------------------- */
function initGalleryTabs() {
  const tabBtns = document.querySelectorAll('.gallery-tab-btn');
  const panes = document.querySelectorAll('.gallery-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPane = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const paneEl = document.getElementById(targetPane);
      if (paneEl) {
        paneEl.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   10. High-Resolution Screenshot Lightbox Modal (<dialog>) - Ultra Smooth
   -------------------------------------------------------------------------- */
let isLightboxClosing = false;

function preventBackdropScroll(e) {
  const dialog = document.getElementById('screenshot-lightbox');
  if (!dialog || !dialog.open) return;
  e.preventDefault();
}

function applyImageOrientation(dialog, width, height) {
  if (!dialog) return;
  // If width / height < 0.85, it's a mobile/terminal portrait screenshot
  if (width && height && width / height < 0.85) {
    dialog.classList.add('is-portrait');
    dialog.classList.remove('is-landscape');
  } else {
    dialog.classList.add('is-landscape');
    dialog.classList.remove('is-portrait');
  }
}

function openLightbox(imgSrc, title, desc, badge = 'Production Screenshot') {
  const dialog = document.getElementById('screenshot-lightbox');
  const imgEl = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const descEl = document.getElementById('lightbox-desc');
  const badgeEl = document.getElementById('lightbox-badge');

  if (!dialog || !imgEl) return;

  isLightboxClosing = false;
  dialog.classList.remove('is-closing');

  imgEl.src = imgSrc;
  imgEl.alt = title || 'PrintPulse Production Screenshot';
  if (titleEl) titleEl.textContent = title || 'Screenshot Inspection';
  if (descEl) descEl.textContent = desc || '';
  if (badgeEl) badgeEl.textContent = badge;

  // Determine aspect ratio for smart container sizing (portrait vs landscape)
  const probe = new Image();
  probe.src = imgSrc;
  if (probe.complete && probe.naturalWidth) {
    applyImageOrientation(dialog, probe.naturalWidth, probe.naturalHeight);
  } else {
    probe.onload = () => {
      applyImageOrientation(dialog, probe.naturalWidth, probe.naturalHeight);
    };
  }

  // Lock background scrolling completely on HTML & Body
  document.documentElement.classList.add('lightbox-scroll-locked');
  document.body.classList.add('lightbox-scroll-locked');
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  document.addEventListener('touchmove', preventBackdropScroll, { passive: false });

  if (!dialog.open) {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  // Trigger buttery smooth entrance transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dialog.classList.add('is-active');
    });
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeLightbox() {
  const dialog = document.getElementById('screenshot-lightbox');
  if (!dialog || !dialog.open || isLightboxClosing) return;

  isLightboxClosing = true;
  dialog.classList.remove('is-active');
  dialog.classList.add('is-closing');

  // Smooth exit transition duration matches CSS (250ms)
  setTimeout(() => {
    if (!isLightboxClosing) return;
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
    dialog.classList.remove('is-closing');
    dialog.classList.remove('is-portrait');
    dialog.classList.remove('is-landscape');
    isLightboxClosing = false;

    // Release background scroll locks
    document.documentElement.classList.remove('lightbox-scroll-locked');
    document.body.classList.remove('lightbox-scroll-locked');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.removeEventListener('touchmove', preventBackdropScroll);

    const imgEl = document.getElementById('lightbox-img');
    if (imgEl) imgEl.src = '';
  }, 250);
}

function initLightboxEvents() {
  const dialog = document.getElementById('screenshot-lightbox');
  if (!dialog) return;

  // Close when clicking directly on the backdrop (outside .lightbox-content)
  dialog.addEventListener('click', (e) => {
    const content = dialog.querySelector('.lightbox-content');
    if (content && !content.contains(e.target)) {
      closeLightbox();
    }
  });

  // Ensure native ESC key press triggers the super smooth closing transition
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeLightbox();
  });
}

/* --------------------------------------------------------------------------
   11. FAQ Accordion
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close other items
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('open');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   12. Mobile Dropdown Menu (Image 1 replica: Translucent Card on Top Right)
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('nav-mobile-toggle');
  const menuCard = document.getElementById('mobile-menu-card');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  const menuLinks = document.querySelectorAll('.mobile-menu-item');

  if (!toggleBtn || !menuCard || !backdrop) return;

  function openMenu() {
    menuCard.classList.add('open');
    backdrop.classList.add('open');
    toggleBtn.classList.add('active');
    document.body.classList.add('mobile-menu-open');
    document.documentElement.classList.add('mobile-menu-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuCard.classList.remove('open');
    backdrop.classList.remove('open');
    toggleBtn.classList.remove('active');
    document.body.classList.remove('mobile-menu-open');
    document.documentElement.classList.remove('mobile-menu-open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menuCard.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  backdrop.addEventListener('click', closeMenu);

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      closeMenu();
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          // Lock scroll tracking temporarily to prevent jitter
          isNavClickScrolling = true;
          clearTimeout(navScrollTimer);

          target.scrollIntoView({ behavior: 'smooth' });

          menuLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');

          navScrollTimer = setTimeout(() => {
            isNavClickScrolling = false;
          }, 950);
        }
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuCard.classList.contains('open')) {
      closeMenu();
    }
  });

  // Automatically close mobile menu if resized back to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && menuCard.classList.contains('open')) {
      closeMenu();
    }
  });

  // Dynamic active section indicator (Image 1 dot indicator replica)
  const sections = [
    { id: 'hero', link: document.querySelector('.mobile-menu-item[data-section="hero"]') },
    { id: 'features', link: document.querySelector('.mobile-menu-item[data-section="features"]') },
    { id: 'how-it-works', link: document.querySelector('.mobile-menu-item[data-section="how-it-works"]') },
    { id: 'calculator', link: document.querySelector('.mobile-menu-item[data-section="calculator"]') },
    { id: 'screenshots', link: document.querySelector('.mobile-menu-item[data-section="screenshots"]') },
    { id: 'architecture', link: document.querySelector('.mobile-menu-item[data-section="architecture"]') },
    { id: 'api', link: document.querySelector('.mobile-menu-item[data-section="api"]') },
    { id: 'faq', link: document.querySelector('.mobile-menu-item[data-section="faq"]') }
  ].filter(s => s.link && document.getElementById(s.id));

  window.addEventListener('scroll', () => {
    if (isNavClickScrolling) return;
    const scrollPos = window.scrollY + 180;
    for (let i = sections.length - 1; i >= 0; i--) {
      const sectionEl = document.getElementById(sections[i].id);
      if (sectionEl && sectionEl.offsetTop <= scrollPos) {
        menuLinks.forEach(l => l.classList.remove('active'));
        sections[i].link.classList.add('active');
        break;
      }
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   13. Smooth Scroll Navigation
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Skip if it's already a mobile menu item handled above
    if (anchor.classList.contains('mobile-menu-item')) return;

    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   14. Mobile Dynamic Scroll Highlight (Mirrors Desktop Mouse Hover on Scroll)
   -------------------------------------------------------------------------- */
function initMobileScrollHighlight() {
  const highlightTargets = document.querySelectorAll(
    '.bento-card, .step-card, .gallery-card, .arch-node, .calculator-card, .lifecycle-step, .browser-frame'
  );

  if (!highlightTargets.length) return;

  let observer = null;

  function setupObserver() {
    if (window.innerWidth > 880) {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      highlightTargets.forEach(el => el.classList.remove('mobile-highlight'));
      return;
    }

    if (observer) return;

    // Focal reading zone in vertical center of mobile screen
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mobile-highlight');
        } else {
          entry.target.classList.remove('mobile-highlight');
        }
      });
    }, {
      root: null,
      rootMargin: '-18% 0px -28% 0px',
      threshold: 0.12
    });

    highlightTargets.forEach(el => observer.observe(el));
  }

  setupObserver();

  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setupObserver, 150);
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   14. Dynamic Scroll Progress Bar & Scrollbar Relative Enlargement
   -------------------------------------------------------------------------- */
function initScrollProgressAndScrollbarEnlarge() {
  const progressBar = document.getElementById('scroll-progress-bar');
  const root = document.documentElement;
  let scrollTimeout = null;
  let clickTimeout = null;

  function updateProgress() {
    const scrollY = window.scrollY;
    const maxScroll = root.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const pct = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
    if (progressBar) {
      progressBar.style.width = `${pct}%`;
    }
  }

  // Update on scroll & temporarily enlarge scrollbar
  window.addEventListener('scroll', () => {
    updateProgress();
    root.classList.add('scrollbar-enlarged');
    if (progressBar) progressBar.classList.add('enlarged');

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      root.classList.remove('scrollbar-enlarged');
      if (progressBar) progressBar.classList.remove('enlarged');
    }, 1200);
  }, { passive: true });

  // Mousemove near right edge (within 28px of window scrollbar) or near top bar
  window.addEventListener('mousemove', (e) => {
    const isNearScrollbar = window.innerWidth - e.clientX <= 28;
    const isNearTop = e.clientY <= 65;

    if (isNearScrollbar) {
      root.classList.add('scrollbar-enlarged');
    } else if (!scrollTimeout && !clickTimeout) {
      root.classList.remove('scrollbar-enlarged');
    }

    if (progressBar) {
      if (isNearTop) {
        progressBar.classList.add('enlarged');
      } else if (!scrollTimeout && !clickTimeout) {
        progressBar.classList.remove('enlarged');
      }
    }
  }, { passive: true });

  // On clicking anything on the page: enlarge scrollbar & scroll progress relatively
  document.addEventListener('pointerdown', () => {
    root.classList.add('scrollbar-enlarged');
    if (progressBar) {
      progressBar.classList.add('clicking');
    }

    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      root.classList.remove('scrollbar-enlarged');
      if (progressBar) {
        progressBar.classList.remove('clicking');
      }
      clickTimeout = null;
    }, 450);
  }, { passive: true });

  // Initial update
  updateProgress();
  window.addEventListener('resize', updateProgress);
}

/* --------------------------------------------------------------------------
   15. Mobile Dynamic Brand Header Scroll Morph
   (Covers ~50% screen at scroll=0, smoothly morphs into top dock on scroll)
   -------------------------------------------------------------------------- */
function initMobileBrandMorph() {
  const brandLink = document.getElementById('nav-brand-link');
  if (!brandLink) return;

  let ticking = false;

  function updateMorph() {
    if (window.innerWidth > 768) {
      brandLink.style.removeProperty('--brand-morph-y');
      brandLink.style.removeProperty('--brand-morph-scale');
      brandLink.classList.remove('docked', 'hero-expanded');
      ticking = false;
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset || 0;
    // Complete the morph within the first 140px of scrolling
    const maxScroll = 140;
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

    // When scrollY == 0: translate 18vh down, scale 1.75 (commands ~50% upper screen)
    // When scrollY >= 140: translate 0vh, scale 1.0 (docked in top navbar)
    const currentY = (1 - progress) * 18;
    const currentScale = 1 + (1 - progress) * 0.75;

    brandLink.style.setProperty('--brand-morph-y', `${currentY.toFixed(2)}vh`);
    brandLink.style.setProperty('--brand-morph-scale', currentScale.toFixed(3));

    if (progress >= 0.95) {
      brandLink.classList.add('docked');
      brandLink.classList.remove('hero-expanded');
    } else {
      brandLink.classList.remove('docked');
      brandLink.classList.add('hero-expanded');
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateMorph);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Initial call
  updateMorph();
}

// Explicitly assign global handlers to window object for reliable HTML onclick accessibility
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.playNotificationChime = playNotificationChime;
window.applyCalcPreset = applyCalcPreset;
window.copyText = copyText;
