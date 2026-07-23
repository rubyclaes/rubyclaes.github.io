/* ==========================================================================
   Shared dark/light theme toggle — used by both index.html and cv.html.
   Creates the floating toggle button and wires up the click handler, so
   there's a single copy instead of duplicating markup/script per page.
   ========================================================================== */

(function () {
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "theme-toggle";
  toggleBtn.id = "theme-toggle";
  toggleBtn.setAttribute("aria-label", "Toggle dark mode");

  const currentTheme = localStorage.getItem("theme") || "dark";
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    toggleBtn.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    toggleBtn.textContent = "🌙";
  }

  toggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      toggleBtn.textContent = "🌙";
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      toggleBtn.textContent = "☀️";
      localStorage.setItem("theme", "dark");
    }
  });

  document.body.appendChild(toggleBtn);
})();
