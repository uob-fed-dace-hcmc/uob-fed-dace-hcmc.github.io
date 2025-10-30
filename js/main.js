/* ====================================
   main.js — Theme Toggle + Mobile Nav
==================================== */

// =====================
// Theme Toggle
// =====================

// Select the theme toggle button
const themeToggle = document.getElementById("theme-toggle");

// Detect and apply previously saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
} else {
  // Default to system preference if available
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
}

// Function to toggle between light and dark themes
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}


// =====================
// Mobile Navigation Toggle (Optional)
// =====================

// If your HTML includes a mobile menu toggle button with ID #nav-toggle
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("nav-open");
    navToggle.classList.toggle("open");
  });

  // Close menu when a link is clicked (mobile UX best practice)
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("nav-open");
      navToggle.classList.remove("open");
    });
  });
}


// =====================
// Accessibility Helpers
// =====================

// Add focus styling for keyboard users only
function handleFirstTab(e) {
  if (e.key === "Tab") {
    document.body.classList.add("user-is-tabbing");
    window.removeEventListener("keydown", handleFirstTab);
  }
}
window.addEventListener("keydown", handleFirstTab);
