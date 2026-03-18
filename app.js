/* ─────────────────────────────────────────────
   APP.JS — Thamires Camargo
──────────────────────────────────────────── */

// ── CURSOR ────────────────────────────────────
const cursor = document.getElementById("cursor");
const cursorTrail = document.getElementById("cursorTrail");

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;
let rafId = null;

if (cursor && cursorTrail && window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + "px";
    cursor.style.top  = mouseY + "px";
  });

  function animateTrail() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    cursorTrail.style.left = trailX + "px";
    cursorTrail.style.top  = trailY + "px";
    rafId = requestAnimationFrame(animateTrail);
  }

  rafId = requestAnimationFrame(animateTrail);

  const hoverTargets = "a, button, [role=button], input, textarea, select, label";
  document.addEventListener("mouseover", e => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.add("cursor-hover");
    }
  });
  document.addEventListener("mouseout", e => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.remove("cursor-hover");
    }
  });
}

// ── HEADER SCROLL ─────────────────────────────
const header = document.getElementById("header");
const SCROLL_THRESHOLD = 40;

function updateHeader() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > SCROLL_THRESHOLD);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// ── MOBILE MENU ───────────────────────────────
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

function setMenuOpen(isOpen) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.classList.toggle("active", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.classList.toggle("open", isOpen);
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

menuToggle?.addEventListener("click", () => {
  setMenuOpen(!mobileMenu.classList.contains("open"));
});

document.addEventListener("click", e => {
  if (!mobileMenu || !menuToggle) return;
  if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    setMenuOpen(false);
  }
});

// ── SMOOTH NAV ────────────────────────────────
const headerHeight = () => header ? header.offsetHeight : 72;

function smoothScrollTo(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight() - 16;
  window.scrollTo({ top, behavior: "smooth" });
}

document.querySelectorAll("[data-nav]").forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    setMenuOpen(false);
    smoothScrollTo(href);
  });
});

// ── ACTIVE NAV ────────────────────────────────
const navLinks = document.querySelectorAll(".nav-link[data-nav]");

function updateActiveNav() {
  const sections = document.querySelectorAll("section[id], footer[id]");
  const mid = window.scrollY + window.innerHeight / 2;
  let activeId = null;

  sections.forEach(s => {
    const top = s.offsetTop;
    const bot = top + s.offsetHeight;
    if (mid >= top && mid < bot) activeId = s.id;
  });

  navLinks.forEach(l => {
    l.classList.toggle("active", l.getAttribute("href") === `#${activeId}`);
  });
}

window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();

// ── REVEAL ON SCROLL ──────────────────────────
function setupReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach(t => t.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -8% 0px"
  });

  targets.forEach(t => observer.observe(t));
}

setupReveal();

// ── HERO ENTRANCE ─────────────────────────────
// Data-animate elements use CSS keyframe animations (no JS needed for delay chain)

// ── WHATSAPP ──────────────────────────────────
function openWhatsApp() {
  const text = "Olá.\nGostaria de agendar uma avaliação fisioterapêutica domiciliar.";
  const url = `https://wa.me/5554999549918?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener");
}

window.openWhatsApp = openWhatsApp;

// ── WINDOW RESIZE ─────────────────────────────
window.addEventListener("resize", () => {
  if (window.innerWidth >= 900) setMenuOpen(false);
}, { passive: true });
