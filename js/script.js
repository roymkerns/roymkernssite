/* ============================================================
   SCRIPT.JS — Shared JavaScript
   roykerns.vercel.app / Hymns of the Hadrian Quadrant
   Runs on every page: starfield, nav, scroll reveals
   ============================================================ */

'use strict';

/* ===========================
   STARFIELD — twinkling stars
   Three tiers: ambient, mid, bright
   =========================== */
(function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let nebulae = [];

    // Color palette from Azar Project cover art
    const STAR_PALETTE = [
        [255, 255, 255],  // white
        [178, 107, 255],  // purple-light
        [224, 104, 40],  // orange
        [200, 64, 168],  // pink
        [200, 195, 255],  // cool blue-white
        [255, 220, 180],  // warm white
    ];

    const NEBULA_PALETTE = [
        { r: 138, g: 53, b: 232, a: 0.030 },
        { r: 224, g: 104, b: 40, a: 0.022 },
        { r: 200, g: 64, b: 168, a: 0.020 },
        { r: 62, g: 20, b: 112, a: 0.035 },
        { r: 80, g: 30, b: 180, a: 0.025 },
        { r: 138, g: 53, b: 232, a: 0.018 },
        { r: 224, g: 104, b: 40, a: 0.018 },
    ];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        buildStars();
        buildNebulae();
    }

    function buildStars() {
        stars = [];

        // Tier 1 — AMBIENT: many small, slow, subtle
        for (let i = 0; i < 160; i++) {
            const [r, g, b] = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)];
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 0.8 + 0.2,
                minAlpha: 0.05,
                maxAlpha: 0.45,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.008 + 0.003,
                tier: 'ambient',
                r, g, b,
            });
        }

        // Tier 2 — MID: moderate size, noticeable twinkle
        for (let i = 0; i < 60; i++) {
            const [r, g, b] = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)];
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 0.9 + 0.9,
                minAlpha: 0.1,
                maxAlpha: 0.85,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.018 + 0.008,
                tier: 'mid',
                r, g, b,
            });
        }

        // Tier 3 — BRIGHT: few large stars, dramatic pulse + bloom
        for (let i = 0; i < 18; i++) {
            const [r, g, b] = STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)];
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.2 + 1.4,
                minAlpha: 0.05,
                maxAlpha: 1.0,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.025 + 0.012,
                tier: 'bright',
                r, g, b,
            });
        }
    }

    function buildNebulae() {
        nebulae = NEBULA_PALETTE.map((c, i) => ({
            x: ((i % 3) + 0.5) / 3 * canvas.width + (Math.random() - 0.5) * canvas.width * 0.25,
            y: (Math.floor(i / 3) + 0.5) / 3 * canvas.height + (Math.random() - 0.5) * canvas.height * 0.25,
            radius: 180 + Math.random() * 200,
            r: c.r, g: c.g, b: c.b, a: c.a,
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Nebulae
        nebulae.forEach(n => {
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
            g.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${n.a})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
        });

        // Stars
        stars.forEach(s => {
            s.phase += s.speed;
            // Use squared sine for a sharper "flash" rather than a smooth fade
            const t = (Math.sin(s.phase) + 1) * 0.5;
            const sharp = s.tier === 'bright' ? t * t : t;
            const alpha = s.minAlpha + sharp * (s.maxAlpha - s.minAlpha);

            if (s.tier === 'bright' && alpha > 0.4) {
                // Bloom: soft radial glow behind the star
                const bloomR = s.radius * 5;
                const bloom = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, bloomR);
                bloom.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${alpha * 0.35})`);
                bloom.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.beginPath();
                ctx.arc(s.x, s.y, bloomR, 0, Math.PI * 2);
                ctx.fillStyle = bloom;
                ctx.fill();

                // Four-point cross sparkle
                const arm = s.radius * (3 + sharp * 5);
                ctx.strokeStyle = `rgba(${s.r},${s.g},${s.b},${alpha * 0.6})`;
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.moveTo(s.x - arm, s.y); ctx.lineTo(s.x + arm, s.y);
                ctx.moveTo(s.x, s.y - arm); ctx.lineTo(s.x, s.y + arm);
                ctx.stroke();

                // Diagonal arms (softer)
                const dArm = arm * 0.5;
                ctx.strokeStyle = `rgba(${s.r},${s.g},${s.b},${alpha * 0.25})`;
                ctx.beginPath();
                ctx.moveTo(s.x - dArm, s.y - dArm); ctx.lineTo(s.x + dArm, s.y + dArm);
                ctx.moveTo(s.x + dArm, s.y - dArm); ctx.lineTo(s.x - dArm, s.y + dArm);
                ctx.stroke();

            } else if (s.tier === 'mid' && alpha > 0.5) {
                // Simple cross on bright mid-stars
                const arm = s.radius * 3;
                ctx.strokeStyle = `rgba(${s.r},${s.g},${s.b},${alpha * 0.4})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(s.x - arm, s.y); ctx.lineTo(s.x + arm, s.y);
                ctx.moveTo(s.x, s.y - arm); ctx.lineTo(s.x, s.y + arm);
                ctx.stroke();
            }

            // Star dot
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${alpha})`;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
})();


/* ===========================
   NAVIGATION
   Active link based on current URL
   Mobile hamburger toggle
   Header scroll effect
   =========================== */
(function initNav() {
    // Active nav link
    const links = document.querySelectorAll('.nav-links a');
    const path = window.location.pathname;

    links.forEach(link => {
        const href = link.getAttribute('href') || '';
        // Normalize both for comparison
        const linkPath = new URL(href, window.location.origin).pathname;

        if (
            (path === '/' && (linkPath === '/' || href === '/index.html')) ||
            (path !== '/' && linkPath !== '/' && path.includes(linkPath.replace('.html', '')))
        ) {
            link.classList.add('active');
        }
    });

    // Mobile hamburger
    const toggle = document.getElementById('menuToggle');
    const navList = document.getElementById('navLinks');

    if (toggle && navList) {
        toggle.addEventListener('click', () => {
            const isOpen = navList.classList.toggle('open');
            toggle.classList.toggle('open', isOpen);
            toggle.setAttribute('aria-expanded', isOpen);
        });

        // Close on link click
        navList.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navList.classList.remove('open');
                toggle.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Header scroll border effect
    const header = document.getElementById('site-header');
    if (header) {
        const onScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 30);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }
})();


/* ===========================
   SCROLL REVEAL
   Elements with class .reveal
   become .visible when in viewport
   =========================== */
(function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach(el => observer.observe(el));
})();


/* ===========================
   PARALLAX (trilogy page)
   Viewport-relative: each element shifts
   based on its own distance from the screen
   center, so each cover gets independent
   natural movement. Call initParallax() on
   pages that use it.
   =========================== */
function initParallax() {
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;
    if (window.innerWidth < 768) return;

    const update = () => {
        const vh = window.innerHeight;
        layers.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.15;
            const rect = el.getBoundingClientRect();
            const center = (rect.top + rect.height / 2) - vh / 2;
            el.style.transform = `translateY(${center * speed}px)`;
        });
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
}


/* ===========================
   CONTACT FORM
   Basic client-side validation
   Firebase + Resend integration
   wired per-page in contact.html
   =========================== */
function initContactForm(formId, onSubmit) {
    const form = document.getElementById(formId);
    if (!form) return;

    const btn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate required fields
        let valid = true;
        form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                valid = false;
            } else {
                field.classList.remove('error');
            }
        });
        if (!valid) return;

        // Loading state
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        try {
            await onSubmit(new FormData(form));
            btn.textContent = 'Message Sent ✓';
            btn.style.background = 'var(--orange)';
            btn.style.borderColor = 'var(--orange)';
            form.reset();
        } catch (err) {
            console.error('Form error:', err);
            btn.textContent = 'Error — Try Again';
            btn.style.background = '';
        }

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.disabled = false;
        }, 4000);
    });

    // Clear error on input
    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => field.classList.remove('error'));
    });
}


/* ===========================
   FIREBASE CONFIG PLACEHOLDER
   Replace with your project config
   from Firebase Console →
   Project Settings → Your apps
   =========================== */
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
};

// Firebase is initialized per-page where needed.
// Export config for use in page scripts:
window.FIREBASE_CONFIG = FIREBASE_CONFIG;


/* ===========================
   RESEND CONFIG PLACEHOLDER
   =========================== */
// Resend email is called server-side via a Vercel serverless function.
// Create /api/contact.js in your project root.
// Replace YOUR_RESEND_API_KEY and YOUR_EMAIL below
// when setting up the contact page.
window.RESEND_TO_EMAIL = "YOUR_PERSONAL_EMAIL@example.com";


/* ===========================
   UTILITY HELPERS
   =========================== */

/** Format a Firestore timestamp to readable date string */
function formatDate(timestamp) {
    if (!timestamp) return '';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Truncate text to N chars with ellipsis */
function truncate(text, maxLen = 140) {
    if (!text || text.length <= maxLen) return text;
    return text.slice(0, maxLen).trimEnd() + '…';
}

/** Validate email format */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Show a temporary toast notification */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--bg-elevated);
        border: 1px solid ${type === 'error' ? 'var(--orange)' : 'var(--border)'};
        color: var(--text);
        font-family: var(--font-display);
        font-size: 0.7rem;
        letter-spacing: 0.15em;
        padding: 0.85rem 1.5rem;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Export helpers for page scripts
window.RKUtils = { formatDate, truncate, isValidEmail, showToast, initContactForm, initParallax };