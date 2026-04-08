/* ======================================================
   main.js — HCM Cluster
   Theme toggle · Mobile nav · Active link · Scroll-top
   ====================================================== */

"use strict";

/* ==============================
   1. THEME TOGGLE
============================== */

const themeToggle = document.getElementById("theme-toggle");
const root        = document.documentElement;

/**
 * Apply a theme and persist it.
 * @param {"light"|"dark"} theme
 */
function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

// On load: honour saved preference, then OS preference
(function initTheme() {
  const saved    = localStorage.getItem("theme");
  const osDark   = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved ?? (osDark ? "dark" : "light"));
})();

// Toggle on click
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

// Respect live OS changes when user has no saved preference
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });


/* ==============================
   2. MOBILE NAVIGATION
============================== */

const navToggle = document.getElementById("nav-toggle");
const navLinks  = document.getElementById("nav-links");

if (navToggle && navLinks) {
  // Toggle open/closed
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("nav-open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close on link click (mobile UX)
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("nav-open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("nav-open")) {
      navLinks.classList.remove("nav-open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  });

  // Close when clicking outside the nav
  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("nav-open") &&
      !navLinks.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      navLinks.classList.remove("nav-open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}


/* ==============================
   3. ACTIVE NAV LINK
   Marks the current page's link
   with the .active class
============================== */

(function markActiveNav() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-link").forEach((link) => {
    const linkPath = link.getAttribute("href").split("/").pop();
    if (linkPath === currentPath) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
})();


/* ==============================
   4. SCROLL-TO-TOP BUTTON
============================== */

const scrollTopBtn = document.getElementById("scroll-top");

if (scrollTopBtn) {
  // Show/hide based on scroll position (threshold: 400px)
  const toggleScrollBtn = () => {
    const visible = window.scrollY > 400;
    scrollTopBtn.hidden = !visible;
  };

  // Debounce scroll listener for performance
  let scrollTimer;
  window.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(toggleScrollBtn, 60);
  }, { passive: true });

  // Scroll to top on click
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Initial state
  toggleScrollBtn();
}


/* ==============================
   5. FOOTER — AUTO YEAR
============================== */

const yearEl = document.getElementById("footer-year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


/* ==============================
   6. KEYBOARD ACCESSIBILITY
   Only show focus rings for
   keyboard (Tab) users
============================== */

window.addEventListener("keydown", function handleFirstTab(e) {
  if (e.key === "Tab") {
    document.body.classList.add("user-is-tabbing");
    window.removeEventListener("keydown", handleFirstTab);
  }
});

window.addEventListener("mousedown", () => {
  document.body.classList.remove("user-is-tabbing");
});
