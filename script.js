/* ==========================================================================
   You shouldn't need to edit this file — it just reads content.js and
   draws the page. Edit content.js instead to change what shows up.
   ========================================================================== */

(function () {
  const $ = (id) => document.getElementById(id);
  const path = window.location.pathname.toLowerCase();
  const looksLikeCVRoute = /(^|\/)cv(?:\.html)?\/?$/.test(path);
  const hasCVMarkers = Boolean($("full-profile-text") || $("education-cv") || $("experience-cv"));
  const isCVPage = looksLikeCVRoute || hasCVMarkers;

  // ---- title block ----
  document.title = `${CV_DATA.name} — ${isCVPage ? 'Full CV' : CV_DATA.tagline}`;
  if ($("name")) $("name").textContent = CV_DATA.name;
  if ($("tagline")) $("tagline").textContent = CV_DATA.tagline;
  if ($("citizenship")) $("citizenship").textContent = CV_DATA.citizenship;
  if ($("availability")) $("availability").textContent = CV_DATA.availability;

  // ---- contact ----
  const c = CV_DATA.contact;
  const contactEl = $("contact");
  if (contactEl) {
    contactEl.innerHTML = "";
    const lines = [c.location, c.phone].filter(Boolean);
    lines.forEach(line => {
      const p = document.createElement("p");
      p.style.margin = "0";
      p.textContent = line;
      contactEl.appendChild(p);
    });
    if (c.email) {
      const p = document.createElement("p");
      p.style.margin = "0";
      const a = document.createElement("a");
      a.href = c.emailLink || `mailto:${c.email}`;
      a.textContent = c.email;
      p.appendChild(a);
      contactEl.appendChild(p);
    }
    if (c.linkedin) {
      const p = document.createElement("p");
      p.style.margin = "0";
      const a = document.createElement("a");
      a.href = c.linkedin;
      a.textContent = "LinkedIn";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      p.appendChild(a);
      contactEl.appendChild(p);
    }
  }

  if (isCVPage) {
    // CV Page
    if ($("full-profile-text")) $("full-profile-text").textContent = CV_DATA.fullProfile || CV_DATA.shortProfile;
    renderLegend();
    renderEntries($("education"), CV_DATA.education);
    renderEntries($("experience"), CV_DATA.experience);
    if ($("languages")) $("languages").textContent = CV_DATA.languages;
    const downloadBtn = $("download-cv-btn");
    if (downloadBtn) downloadBtn.addEventListener("click", () => window.print());
  } else {
    // Homepage
    if ($("profile-text")) $("profile-text").textContent = CV_DATA.shortProfile;
    renderLegend();
    renderProjects();
  }

  function renderLegend() {
    const legendEl = $("legend");
    if (!legendEl) return;

    const SYMBOLS = {
      contour: `<svg viewBox="0 0 40 22"><path d="M2 16 Q10 4 20 12 T38 8" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
      grid: `<svg viewBox="0 0 40 22"><g stroke="currentColor" stroke-width="1.6"><line x1="4" y1="2" x2="4" y2="20"/><line x1="14" y1="2" x2="14" y2="20"/><line x1="24" y1="2" x2="24" y2="20"/><line x1="34" y1="2" x2="34" y2="20"/><line x1="2" y1="4" x2="38" y2="4" opacity="0"/></g><g fill="currentColor"><circle cx="4" cy="6" r="1.6"/><circle cx="14" cy="14" r="1.6"/><circle cx="24" cy="8" r="1.6"/><circle cx="34" cy="16" r="1.6"/></g></svg>`,
      dashed: `<svg viewBox="0 0 40 22"><line x1="2" y1="11" x2="38" y2="11" stroke="currentColor" stroke-width="2.2" stroke-dasharray="6 4"/></svg>`,
      leader: `<svg viewBox="0 0 40 22"><line x1="2" y1="18" x2="24" y2="6" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="6" r="2.4" fill="currentColor"/><line x1="24" y1="6" x2="38" y2="6" stroke="currentColor" stroke-width="2"/></svg>`,
      hatch: `<svg viewBox="0 0 40 22"><g stroke="currentColor" stroke-width="1.6"><line x1="2" y1="20" x2="10" y2="2"/><line x1="10" y1="20" x2="18" y2="2"/><line x1="18" y1="20" x2="26" y2="2"/><line x1="26" y1="20" x2="34" y2="2"/></g></svg>`
    };

    legendEl.innerHTML = "";
    CV_DATA.skills.forEach((skill) => {
      const row = document.createElement("div");
      row.className = "legend-row";
      row.innerHTML = `
        <div class="legend-symbol">${SYMBOLS[skill.symbol] || SYMBOLS.dashed}</div>
        <div class="legend-label">${escapeHtml(skill.label)}</div>
        <div class="legend-detail">${escapeHtml(skill.detail)}</div>
      `;
      legendEl.appendChild(row);
    });
  }

  function renderProjects() {
    const projectsEl = $("projects-list") || $("projects");
    if (!projectsEl) return;

    projectsEl.innerHTML = "";
    CV_DATA.projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card";

      const media = document.createElement("div");
      if (project.image) {
        const img = document.createElement("img");
        img.className = "project-thumb";
        img.src = project.image;
        img.alt = project.title;
        img.onerror = function () {
          media.innerHTML = placeholderMarkup(project.image);
        };
        media.appendChild(img);
      } else {
        media.innerHTML = placeholderMarkup(null);
      }
      card.appendChild(media);

      const body = document.createElement("div");
      body.className = "project-body";
      body.innerHTML = `
        <h3 class="project-title">${escapeHtml(project.title)}</h3>
        <p class="project-meta">${escapeHtml(project.tag || "")}</p>
        <p class="project-desc">${escapeHtml(project.description)}</p>
      `;
      card.appendChild(body);

      projectsEl.appendChild(card);
    });
  }

  function placeholderMarkup(path) {
    const msg = path
      ? `Image not found:<br>${escapeHtml(path)}`
      : `+ Add an image<br>(see content.js)`;
    return `<div class="project-thumb-placeholder">${msg}</div>`;
  }

  function renderEntries(container, entries) {
    if (!container) return;
    container.innerHTML = "";
    entries.forEach((entry) => {
      const wrap = document.createElement("div");
      wrap.className = "entry";
      const bullets = (entry.bullets || [])
        .map((b) => `<li>${escapeHtml(b)}</li>`)
        .join("");
      wrap.innerHTML = `
        <div class="entry-head">
          <span class="entry-role">${escapeHtml(entry.role)}</span>
          ${entry.dates ? `<span class="entry-dates">${escapeHtml(entry.dates)}</span>` : ""}
        </div>
        <span class="entry-org">${escapeHtml(entry.org)}</span>
        ${bullets ? `<ul>${bullets}</ul>` : ""}
      `;
      container.appendChild(wrap);
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
})();