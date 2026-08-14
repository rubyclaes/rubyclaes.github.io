/* ==========================================================================
   Shared dark/light theme toggle — used by both index.html and cv.html.
   Creates the floating toggle button and wires up the click handler, so
   there's a single copy instead of duplicating markup/script per page.
   ========================================================================== */

(function () {
  const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
  </svg>`;
  const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 14.3A8.5 8.5 0 1 1 9.7 3 7 7 0 0 0 21 14.3z"/>
  </svg>`;

  let controls = document.querySelector(".floating-controls");
  if (!controls) {
    controls = document.createElement("div");
    controls.className = "floating-controls";
    document.body.appendChild(controls);
  }

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "theme-toggle";
  toggleBtn.id = "theme-toggle";
  toggleBtn.setAttribute("aria-label", "Toggle dark mode");

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      toggleBtn.innerHTML = sunIcon;
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      toggleBtn.innerHTML = moonIcon;
      localStorage.setItem("theme", "light");
    }
  }

  const currentTheme = localStorage.getItem("theme") || "dark";
  applyTheme(currentTheme === "dark");

  toggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(!isDark);
  });

  controls.appendChild(toggleBtn);
})();
