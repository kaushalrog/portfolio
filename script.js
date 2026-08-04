lucide.createIcons();

document.addEventListener("DOMContentLoaded", () => {
  /* ════════ SCROLL PROGRESS ════════ */
  const progressBar = document.querySelector(".scroll-progress");
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ════════ NAV ════════ */
  const nav = document.querySelector(".nav-minimal");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }, { passive: true });

  /* ════════ MOBILE MENU ════════ */
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  function setMenuOpen(open) {
    navLinks.classList.toggle("open", open);
    mobileBtn.setAttribute("aria-expanded", String(open));
    mobileBtn.innerHTML = `<i data-lucide="${open ? "x" : "menu"}"></i>`;
    lucide.createIcons();
  }

  mobileBtn.addEventListener("click", () => {
    setMenuOpen(!navLinks.classList.contains("open"));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setMenuOpen(false);
  });

  /* ════════ GSAP REVEALS ════════ */
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance (plays immediately on load)
  gsap.from(".hero-title", { y: 40, opacity: 0, duration: 1.1, ease: "power3.out" });
  gsap.from(".hero-statement", { y: 24, opacity: 0, duration: 1, delay: 0.25, ease: "power3.out" });
  gsap.from(".hero-roles", { y: 16, opacity: 0, duration: 0.9, delay: 0.5, ease: "power2.out" });
  gsap.from(".hero-visual-footer", { opacity: 0, duration: 1.4, delay: 0.3, ease: "power2.out" });

  // Generic reveal for anything further down the page
  const revealTargets = document.querySelectorAll(
    ".principle, .silence-block, .system-list, .atlas-interactive, .proof-step, " +
    ".case-study, .failure-log, .mini-item, .notebook-entry, .network-placeholder, " +
    ".full-width-visual, .massive-footer-photo, .tech-stack-container"
  );

  revealTargets.forEach((el) => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none reverse"
      }
    });
  });
});
