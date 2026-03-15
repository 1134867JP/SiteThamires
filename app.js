const body = document.body;
const header = document.querySelector(".header");
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const enterButton = document.querySelector(".enter-button");
const introCue = document.querySelector(".intro-cue");
const revealSelector = "[data-reveal]";

let revealObserver = null;
let experienceUnlocked = false;

function setMobileMenuState(isOpen) {
  if (!hamburger || !navMenu) return;

  hamburger.classList.toggle("active", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
  navMenu.classList.toggle("active", isOpen);
  body.classList.toggle("nav-open", isOpen);
}

function closeMobileMenu() {
  setMobileMenuState(false);
}

function toggleMobileMenu() {
  if (!navMenu) return;
  setMobileMenuState(!navMenu.classList.contains("active"));
}

function unlockExperience() {
  if (experienceUnlocked) return;
  experienceUnlocked = true;
  body.classList.remove("pre-entry");
  body.classList.add("has-entered");
}

function scrollToTarget(target) {
  if (!target || !header) return;

  const offset = header.offsetHeight + 12;
  const top = target.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: top - offset,
    behavior: "smooth"
  });
}

function startTunnelTo(targetSelector = "#sobre") {
  const target = document.querySelector(targetSelector);
  if (!target || body.classList.contains("is-transitioning")) return;

  body.classList.add("is-transitioning");

  window.setTimeout(() => {
    unlockExperience();
    scrollToTarget(target);
  }, 360);

  window.setTimeout(() => {
    body.classList.remove("is-transitioning");
  }, 980);
}

function setActiveNavLink() {
  const sections = document.querySelectorAll("section[id], footer[id]");
  const viewportCenter = window.scrollY + window.innerHeight / 2;
  let activeId = null;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const bottom = top + rect.height;
    const id = section.getAttribute("id");

    if (viewportCenter >= top && viewportCenter < bottom) {
      activeId = id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
}

function handleNavClick(event, targetId) {
  event.preventDefault();
  const target = document.querySelector(targetId);
  if (!target) return;

  if (body.classList.contains("pre-entry")) {
    unlockExperience();
  }

  closeMobileMenu();
  scrollToTarget(target);
  setActiveNavLink();
}

function openWhatsApp() {
  const text = [
    "Olá.",
    "Gostaria de agendar uma avaliação fisioterapêutica domiciliar."
  ].join("\n");

  const whatsappUrl = `https://wa.me/5554999549918?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, "_blank", "noopener");
}

function setupNavigation() {
  hamburger?.addEventListener("click", toggleMobileMenu);

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    link.addEventListener("click", event => handleNavClick(event, href));
  });

  document.addEventListener("click", event => {
    const target = event.target;
    if (!navMenu || !hamburger || !navMenu.classList.contains("active")) return;

    const insideMenu = navMenu.contains(target);
    const insideHamburger = hamburger.contains(target);

    if (!insideMenu && !insideHamburger) {
      closeMobileMenu();
    }
  });

  window.addEventListener("scroll", () => {
    if (body.classList.contains("pre-entry") && window.scrollY > 40) {
      unlockExperience();
    }
    setActiveNavLink();
  }, { passive: true });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 961) {
      closeMobileMenu();
    }
  });
}

function setupReveal() {
  const targets = Array.from(document.querySelectorAll(revealSelector)).filter(
    element => !element.dataset.revealReady
  );

  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach(target => {
      target.dataset.revealReady = "true";
      target.classList.add("reveal", "is-visible");
    });
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal", "is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px"
      }
    );
  }

  targets.forEach(target => {
    target.dataset.revealReady = "true";
    target.classList.add("reveal");
    revealObserver.observe(target);
  });
}

function initEntryState() {
  const currentHash = window.location.hash;

  if (currentHash && currentHash !== "#inicio") {
    unlockExperience();
    return;
  }

  body.classList.add("pre-entry");
}

function init() {
  initEntryState();
  setupNavigation();
  setupReveal();
  setActiveNavLink();

  enterButton?.addEventListener("click", () => startTunnelTo("#sobre"));
  introCue?.addEventListener("click", () => startTunnelTo("#sobre"));
}

document.addEventListener("DOMContentLoaded", init);

window.openWhatsApp = openWhatsApp;
