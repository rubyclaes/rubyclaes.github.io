/* ==========================================================================
   You shouldn't need to edit this file — it reads content.js and draws
   the page. Use editor.html (or content.js) to change what shows up.
   ========================================================================== */

(function () {
  const $ = (id) => document.getElementById(id);
  const path = window.location.pathname.toLowerCase();
  const looksLikeCVRoute = /(^|\/)cv(?:\.html)?\/?$/.test(path);
  const hasCVMarkers = Boolean($("full-profile-text") || $("education-cv") || $("experience-cv"));
  const isCVPage = looksLikeCVRoute || hasCVMarkers;

  const languages = (typeof SITE !== "undefined" && SITE.languages) || [
    { code: "en", label: "English", locale: "en-AU" }
  ];
  const defaultLang = (typeof SITE !== "undefined" && SITE.defaultLang) || "en";
  const knownCodes = languages.map((l) => l.code);

  function isKnown(code) {
    return knownCodes.indexOf(code) !== -1;
  }

  function htmlLang(code) {
    const meta = languages.find((item) => item.code === code);
    return (meta && meta.locale) || code;
  }

  function resolveLang(raw) {
    const value = (raw || "").toLowerCase();
    if (isKnown(value)) return value;
    if (value === "au" || value === "en-au") return isKnown("en") ? "en" : "";
    if (value === "de-de" || value === "de-at" || value === "de-ch") {
      return isKnown("de") ? "de" : "";
    }
    const short = value.slice(0, 2);
    if (isKnown(short)) return short;
    return "";
  }

  function isGermanLocale(tag) {
    const value = String(tag || "").toLowerCase();
    if (!value) return false;
    if (value === "de" || value.indexOf("de-") === 0) return true;
    const region = (value.split("-")[1] || "").split("_")[0];
    return region === "de" || region === "at" || region === "ch" || region === "li";
  }

  function isGermanSpeakingVisit() {
    const tags = [];
    if (navigator.languages && navigator.languages.length) {
      for (let i = 0; i < navigator.languages.length; i += 1) {
        tags.push(navigator.languages[i]);
      }
    }
    if (navigator.language) tags.push(navigator.language);
    if (navigator.userLanguage) tags.push(navigator.userLanguage);
    try {
      tags.push(Intl.DateTimeFormat().resolvedOptions().locale);
    } catch (e) { /* ignore */ }
    if (tags.some(isGermanLocale)) return true;

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return (
        tz === "Europe/Berlin" ||
        tz === "Europe/Vienna" ||
        tz === "Europe/Zurich" ||
        tz === "Europe/Vaduz"
      );
    } catch (e) {
      return false;
    }
  }

  function detectLang() {
    const fromUrl = resolveLang(new URLSearchParams(window.location.search).get("lang"));
    if (fromUrl) return fromUrl;

    const stored = resolveLang(localStorage.getItem("lang"));
    if (stored) return stored;

    if (isKnown("de") && isGermanSpeakingVisit()) return "de";

    const nav = resolveLang(navigator.language || navigator.userLanguage || "");
    if (nav) return nav;

    return defaultLang;
  }

  function t(value, lang) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    const chosen = value[lang];
    if (chosen != null && String(chosen).trim() !== "") return chosen;
    return value[defaultLang] || value.en || "";
  }

  function withLangParam(href, lang) {
    try {
      const url = new URL(href, "https://example.invalid/");
      url.searchParams.set("lang", lang);
      return url.pathname.replace(/^\//, "") + url.search + url.hash;
    } catch (e) {
      return href;
    }
  }

  function applyUi(lang) {
    document.documentElement.lang = htmlLang(lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (UI[key]) el.textContent = t(UI[key], lang);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (UI[key]) el.setAttribute("aria-label", t(UI[key], lang));
    });

    const themeBtn = $("theme-toggle");
    if (themeBtn && UI.themeToggle) {
      themeBtn.setAttribute("aria-label", t(UI.themeToggle, lang));
    }

    const hint = $("projects-hint");
    if (hint && UI.projectsHint) {
      hint.textContent = "";
      const parts = t(UI.projectsHint, lang).split("{cv}");
      hint.appendChild(document.createTextNode(parts[0] || ""));
      if (parts.length > 1) {
        const a = document.createElement("a");
        a.href = withLangParam("cv.html", lang);
        a.textContent = t(UI.cvLink, lang);
        hint.appendChild(a);
        hint.appendChild(document.createTextNode(parts[1] || ""));
      }
    }

    document.querySelectorAll('a[href^="cv.html"], a[href^="index.html"]').forEach((a) => {
      a.setAttribute("href", withLangParam(a.getAttribute("href"), lang));
    });
  }

  function render(lang) {
    applyUi(lang);

    const name = SHARED.name;
    const tagline = t(CONTENT.tagline, lang);
    document.title = `${name} — ${isCVPage ? t(UI.fullCvEyebrow, lang) : tagline}`;
    if ($("name")) $("name").textContent = name;
    if ($("tagline")) $("tagline").textContent = tagline;
    if ($("citizenship")) $("citizenship").textContent = t(CONTENT.citizenship, lang);
    if ($("availability")) $("availability").textContent = t(CONTENT.availability, lang);

    const c = SHARED.contact || {};
    const contactEl = $("contact");
    if (contactEl) {
      contactEl.innerHTML = "";
      const lines = [t(CONTENT.location, lang), c.phone].filter(Boolean);
      lines.forEach((line) => {
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
        a.textContent = t(UI.linkedin, lang);
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        p.appendChild(a);
        contactEl.appendChild(p);
      }
    }

    if (isCVPage) {
      if ($("full-profile-text")) {
        $("full-profile-text").textContent = t(CONTENT.fullProfile, lang) || t(CONTENT.shortProfile, lang);
      }
      renderLegend(lang);
      renderEntries($("education"), CONTENT.education || [], lang);
      renderEntries($("experience"), CONTENT.experience || [], lang);
      if ($("languages")) $("languages").textContent = t(CONTENT.languages, lang);
    } else {
      if ($("profile-text")) $("profile-text").textContent = t(CONTENT.shortProfile, lang);
      renderLegend(lang);
      renderProjects(lang);
    }

    updateLangSwitcher(lang);
  }

  function renderLegend(lang) {
    const legendEl = $("legend");
    if (!legendEl) return;

    const SYMBOLS = (typeof LEGEND_SYMBOLS !== "undefined") ? LEGEND_SYMBOLS : {};
    const fallback = SYMBOLS.dashed || "";

    legendEl.innerHTML = "";
    (CONTENT.skills || []).forEach((skill) => {
      const row = document.createElement("div");
      row.className = "legend-row";
      row.innerHTML = `
        <div class="legend-symbol">${SYMBOLS[skill.symbol] || fallback}</div>
        <div class="legend-label">${escapeHtml(t(skill.label, lang))}</div>
        <div class="legend-detail">${escapeHtml(t(skill.detail, lang))}</div>
      `;
      legendEl.appendChild(row);
    });
  }

  function renderProjects(lang) {
    const projectsEl = $("projects-list") || $("projects");
    if (!projectsEl) return;

    projectsEl.innerHTML = "";
    (CONTENT.projects || []).forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card";
      const title = t(project.title, lang);

      const media = document.createElement("div");
      if (project.image) {
        const img = document.createElement("img");
        img.className = "project-thumb";
        img.src = project.image;
        img.alt = title;
        img.onerror = function () {
          media.innerHTML = placeholderMarkup(project.image, lang);
        };
        media.appendChild(img);
      } else {
        media.innerHTML = placeholderMarkup(null, lang);
      }
      card.appendChild(media);

      const body = document.createElement("div");
      body.className = "project-body";
      body.innerHTML = `
        <h3 class="project-title">${escapeHtml(title)}</h3>
        <p class="project-meta">${escapeHtml(t(project.tag, lang))}</p>
        <p class="project-desc">${escapeHtml(t(project.description, lang))}</p>
      `;
      card.appendChild(body);

      projectsEl.appendChild(card);
    });
  }

  function placeholderMarkup(imagePath, lang) {
    const msg = imagePath
      ? `${escapeHtml(t(UI.imageNotFound, lang))}<br>${escapeHtml(imagePath)}`
      : escapeHtml(t(UI.addImage, lang)).replace(/\n/g, "<br>");
    return `<div class="project-thumb-placeholder">${msg}</div>`;
  }

  function renderEntries(container, entries, lang) {
    if (!container) return;
    container.innerHTML = "";
    entries.forEach((entry) => {
      const wrap = document.createElement("div");
      wrap.className = "entry";
      const dates = t(entry.dates, lang);
      const bullets = (entry.bullets || [])
        .map((b) => `<li>${escapeHtml(t(b, lang))}</li>`)
        .join("");
      wrap.innerHTML = `
        <div class="entry-head">
          <span class="entry-role">${escapeHtml(t(entry.role, lang))}</span>
          ${dates ? `<span class="entry-dates">${escapeHtml(dates)}</span>` : ""}
        </div>
        <span class="entry-org">${escapeHtml(t(entry.org, lang))}</span>
        ${bullets ? `<ul>${bullets}</ul>` : ""}
      `;
      container.appendChild(wrap);
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function ensureControls() {
    let controls = document.querySelector(".floating-controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "floating-controls";
      document.body.appendChild(controls);
    }
    return controls;
  }

  function updateLangSwitcher(lang) {
    document.querySelectorAll(".lang-switcher button[data-lang]").forEach((btn) => {
      const active = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function mountLangSwitcher() {
    const controls = ensureControls();
    if (controls.querySelector(".lang-switcher")) return;

    const group = document.createElement("div");
    group.className = "lang-switcher";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", t(UI.langSwitcher, currentLang));

    const globe = document.createElement("span");
    globe.className = "lang-globe";
    globe.setAttribute("aria-hidden", "true");
    globe.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18"/>
      <path d="M12 3a15 15 0 0 1 0 18"/>
      <path d="M12 3a15 15 0 0 0 0 18"/>
    </svg>`;
    group.appendChild(globe);

    languages.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-lang", item.code);
      btn.textContent = item.label;
      btn.addEventListener("click", () => setLang(item.code));
      group.appendChild(btn);
    });

    controls.insertBefore(group, controls.firstChild);
  }

  function setLang(lang) {
    if (!isKnown(lang) || lang === currentLang) {
      if (lang === currentLang) render(lang);
      return;
    }
    currentLang = lang;
    localStorage.setItem("lang", lang);

    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(null, "", url.pathname + url.search + url.hash);

    const switcher = document.querySelector(".lang-switcher");
    if (switcher && UI.langSwitcher) {
      switcher.setAttribute("aria-label", t(UI.langSwitcher, lang));
    }

    render(lang);
  }

  let currentLang = detectLang();
  localStorage.setItem("lang", currentLang);

  mountLangSwitcher();
  render(currentLang);

  const downloadBtn = $("download-cv-btn");
  if (downloadBtn) downloadBtn.addEventListener("click", () => window.print());
})();
