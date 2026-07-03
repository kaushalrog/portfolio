// Initialize Icons
lucide.createIcons();

// Boot Sequence
document.addEventListener("DOMContentLoaded", () => {
  const bootScreen = document.getElementById("boot-screen");
  const bootLogs = document.getElementById("boot-logs");
  const bootBar = document.querySelector(".boot-bar");
  
  // Skip boot if already visited (sessionStorage)
  if (sessionStorage.getItem("orion_booted")) {
    bootScreen.style.display = "none";
    initParticles();
    initAnimations();
    return;
  }
  
  const logs = [
    "INITIALIZING ORION...",
    "Loading Research Protocols...",
    "Loading Deployed Systems...",
    "Establishing Mission Uplink...",
    "Ready."
  ];
  
  let delay = 0;
  logs.forEach((log, index) => {
    setTimeout(() => {
      const p = document.createElement("div");
      p.className = "log-line";
      p.innerText = log;
      bootLogs.appendChild(p);
      bootLogs.scrollTop = bootLogs.scrollHeight;
      
      gsap.to(bootBar, { width: `${(index + 1) * (100 / logs.length)}%`, duration: 0.2 });
      
      if (index === logs.length - 1) {
        setTimeout(() => {
          gsap.to(bootScreen, { opacity: 0, duration: 0.8, onComplete: () => {
            bootScreen.style.display = "none";
            sessionStorage.setItem("orion_booted", "true");
            initParticles();
            initAnimations();
          }});
        }, 500);
      }
    }, delay);
    delay += 400; // 400ms per log
  });
});

// Particles Background (Stars/Constellations)
function initParticles() {
  tsParticles.load("particles-container", {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 800 } },
      color: { value: "#39D9FF" },
      shape: { type: "circle" },
      opacity: { value: 0.3, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
      size: { value: 2, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#4A8CFF",
        opacity: 0.15,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: false },
        resize: true
      },
      modes: {
        grab: { distance: 140, line_linked: { opacity: 0.3 } }
      }
    },
    retina_detect: true
  });
}

// Animations & Interactions
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero Section Reveal
  gsap.from(".hero-identity > *", {
    y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.2
  });
  
  gsap.from(".mission-panel", {
    x: 40, opacity: 0, duration: 1, ease: "power3.out", delay: 0.5
  });

  // Scroll Reveals for Sections
  const sections = document.querySelectorAll(".mission-section:not(#hero)");
  sections.forEach(sec => {
    gsap.from(sec.querySelectorAll(".section-header, .glass-card, .sys-item, .spec-panel, .uplink-form-wrapper"), {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sec,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  });
}

// Navigation Sticky & Mobile Menu
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// Mobile menu toggle logic
const mobileBtn = document.querySelector(".nav-mobile-btn");
const navLinks = document.querySelector(".nav-links");

mobileBtn.addEventListener("click", () => {
  // Simple toggle for display
  if (navLinks.style.display === "flex") {
    navLinks.style.display = "none";
  } else {
    navLinks.style.display = "flex";
    navLinks.style.flexDirection = "column";
    navLinks.style.position = "absolute";
    navLinks.style.top = "60px";
    navLinks.style.left = "0";
    navLinks.style.right = "0";
    navLinks.style.background = "rgba(5, 8, 22, 0.95)";
    navLinks.style.padding = "20px";
    navLinks.style.borderBottom = "1px solid rgba(115, 247, 255, 0.2)";
  }
});

// Close menu on click link
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 900) {
      navLinks.style.display = "none";
    }
  });
});

// Contact Form Submission (Mailto)
window.transmitSignal = function(e) {
  e.preventDefault();
  const name = document.getElementById("u-name").value.trim();
  const email = document.getElementById("u-email").value.trim();
  const subj = document.getElementById("u-subj").value.trim();
  const msg = document.getElementById("u-msg").value.trim();
  
  const fullSubj = encodeURIComponent(`[ORION UPLINK] ${subj} — ${name}`);
  const fullBody = encodeURIComponent(`SENDER ID: ${name}\nRETURN FREQ: ${email}\n\nPAYLOAD:\n${msg}`);
  
  window.open(`mailto:kaushalreddy15@gmail.com?subject=${fullSubj}&body=${fullBody}`);
  
  const status = document.getElementById("u-status");
  status.style.display = "block";
  e.target.reset();
  
  setTimeout(() => { status.style.display = "none"; }, 5000);
}
