// Initialize Icons
lucide.createIcons();

document.addEventListener("DOMContentLoaded", () => {
  /* ════════ BOOT SEQUENCE ════════ */
  const bootScreen = document.getElementById("boot-screen");
  const bootLogs = document.getElementById("boot-logs");
  const bootBar = document.querySelector(".boot-bar");

  const logs = [
    "INITIALIZING SYSTEM CORE...",
    "LOADING NEURAL WEIGHTS [100%]",
    "ESTABLISHING UPLINK...",
    "BYPASSING SECURITY PROTOCOLS...",
    "SYSTEMS NOMINAL."
  ];

  let logIndex = 0;
  const logInterval = setInterval(() => {
    if (logIndex < logs.length) {
      const p = document.createElement("div");
      p.className = "log-line";
      p.textContent = `> ${logs[logIndex]}`;
      bootLogs.appendChild(p);
      bootBar.style.width = `${(logIndex + 1) * 20}%`;
      logIndex++;
    } else {
      clearInterval(logInterval);
      setTimeout(() => {
        gsap.to(bootScreen, {
          yPercent: -100,
          opacity: 0,
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            bootScreen.style.display = "none";
            initMainAnimations();
          }
        });
      }, 500);
    }
  }, 300);

  /* ════════ NAVIGATION ════════ */
  const nav = document.getElementById("nav");
  const mobileBtn = document.querySelector(".nav-mobile-btn");
  const navLinks = document.querySelector(".nav-links");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  });

  mobileBtn.addEventListener("click", () => {
    if (navLinks.style.display === "flex") {
      navLinks.style.display = "none";
    } else {
      navLinks.style.display = "flex";
      navLinks.style.flexDirection = "column";
      navLinks.style.position = "absolute";
      navLinks.style.top = "60px";
      navLinks.style.right = "24px";
      navLinks.style.background = "var(--panel-bg)";
      navLinks.style.backdropFilter = "blur(16px)";
      navLinks.style.padding = "20px";
      navLinks.style.borderRadius = "8px";
      navLinks.style.border = "1px solid var(--glass-border)";
    }
  });

  /* ════════ PARTICLES BACKGROUND ════════ */
  tsParticles.load("particles-container", {
    fpsLimit: 60,
    particles: {
      number: { value: 60, density: { enable: true, value_area: 800 } },
      color: { value: ["#4A8CFF", "#39D9FF", "#73F7FF"] },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: true },
      size: { value: 2, random: true },
      move: { enable: true, speed: 0.5, direction: "none", random: true, straight: false, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        resize: true
      },
      modes: {
        grab: { distance: 150, line_linked: { opacity: 0.3 } }
      }
    },
    retina_detect: true
  });

  /* ════════ GSAP ANIMATIONS ════════ */
  function initMainAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Reveal
    gsap.from(".hero-badge, .hero-name, .hero-role, .hero-desc", {
      y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out"
    });
    
    gsap.from(".hero-metrics", {
      y: 20, opacity: 0, duration: 1, delay: 0.6, ease: "power2.out"
    });

    gsap.from(".hero-visual", {
      scale: 0.95, opacity: 0, duration: 1.5, delay: 0.4, ease: "power2.out"
    });

    // Universal Component Reveals
    const cards = document.querySelectorAll(".glass-card, .glass-panel:not(.hero-metrics, .hero-visual)");
    cards.forEach((card, i) => {
      gsap.from(card, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Atlas interactive scale up
    gsap.from(".atlas-interactive", {
      scale: 0.9, opacity: 0, duration: 1, ease: "power2.out",
      scrollTrigger: {
        trigger: ".atlas-lens-container",
        start: "top 70%",
        toggleActions: "play none none reverse"
      }
    });
  }
});
