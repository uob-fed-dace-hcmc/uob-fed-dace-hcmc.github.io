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


/* ==============================
   8. DEADLINE BADGE URGENCY
   Marks deadline-badge elements
   as urgent when within 28 days
============================== */

(function markUrgentDeadlines() {
  const badges = document.querySelectorAll(".deadline-badge[data-deadline]");
  if (!badges.length) return;

  const now     = new Date();
  const URGENT  = 28; // days

  badges.forEach((badge) => {
    const deadlineStr = badge.getAttribute("data-deadline");
    if (!deadlineStr) return;

    const deadline = new Date(deadlineStr);
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      /* Past — mark closed */
      badge.classList.add("deadline-badge--urgent");
      const timeEl = badge.querySelector("time");
      if (timeEl) timeEl.textContent += " (closed)";
    } else if (daysLeft <= URGENT) {
      /* Urgent — add days-remaining label */
      badge.classList.add("deadline-badge--urgent");
      const label = document.createElement("span");
      label.textContent = daysLeft === 0
        ? " — closes today!"
        : ` — ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
      label.setAttribute("aria-hidden", "true");
      badge.appendChild(label);
    }
  });
})();


/* ==============================
   7. CONTACT FORM
   Async Formspree submission with
   inline validation + status banners
============================== */

(function initContactForm() {
  const form       = document.getElementById("contact-form");
  if (!form) return;

  const submitBtn   = document.getElementById("submit-btn");
  const btnLabel    = submitBtn?.querySelector(".btn-label");
  const btnSpinner  = submitBtn?.querySelector(".btn-spinner");
  const successMsg  = document.getElementById("form-success");
  const errorMsg    = document.getElementById("form-error");
  const replySpan   = document.getElementById("reply-email");

  /* -- Inline validation helpers -- */
  function showError(inputId, message) {
    const el = document.getElementById(inputId + "-error");
    if (el) el.textContent = message;
  }

  function clearError(inputId) {
    const el = document.getElementById(inputId + "-error");
    if (el) el.textContent = "";
  }

  function validateField(input) {
    if (!input) return true;
    const id = input.id;
    if (input.required && !input.value.trim()) {
      showError(id, "This field is required.");
      return false;
    }
    if (input.type === "email" && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      showError(id, "Please enter a valid email address.");
      return false;
    }
    clearError(id);
    return true;
  }

  /* Validate on blur for each required field */
  ["name", "email", "subject", "message"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("blur", () => validateField(el));
      el.addEventListener("input", () => clearError(id));
    }
  });

  /* -- Form submission -- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    /* Validate all required fields before sending */
    const fields = ["name", "email", "subject", "message"].map((id) =>
      document.getElementById(id)
    );
    const valid = fields.map(validateField).every(Boolean);
    if (!valid) {
      fields.find((f) => f && !f.value.trim())?.focus();
      return;
    }

    /* Show loading state */
    submitBtn.disabled = true;
    if (btnLabel)  btnLabel.textContent = "Sending…";
    if (btnSpinner) btnSpinner.hidden = false;

    const emailInput = document.getElementById("email");
    if (replySpan && emailInput) replySpan.textContent = emailInput.value;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        if (successMsg) successMsg.hidden = false;
        if (errorMsg)   errorMsg.hidden   = true;
        successMsg?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        throw new Error("Non-OK response");
      }
    } catch {
      if (errorMsg)   errorMsg.hidden   = false;
      if (successMsg) successMsg.hidden = true;
    } finally {
      submitBtn.disabled = false;
      if (btnLabel)  btnLabel.textContent = "Send Message";
      if (btnSpinner) btnSpinner.hidden = true;
    }
  });
})();