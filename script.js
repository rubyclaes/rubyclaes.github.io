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

  function asImagePair(item) {
    if (!item) return { en: "", de: "", caption: { en: "", de: "" } };
    if (typeof item === "string") {
      return { en: item.trim(), de: "", caption: { en: "", de: "" } };
    }
    const caption = item.caption && typeof item.caption === "object" ? item.caption : {};
    return {
      en: String(item.en || "").trim(),
      de: String(item.de || "").trim(),
      caption: {
        en: caption.en != null ? String(caption.en) : "",
        de: caption.de != null ? String(caption.de) : ""
      }
    };
  }

  function srcForLang(pair, lang) {
    const item = asImagePair(pair);
    if (lang === "de") return item.de || item.en || "";
    return item.en || item.de || "";
  }

  function projectFigures(project, lang) {
    const raw = [];
    if (Array.isArray(project.images)) {
      project.images.forEach((item) => {
        if (typeof item === "string") {
          if (item.trim()) raw.push(asImagePair(item));
        } else if (item && (item.en || item.de)) {
          raw.push(asImagePair(item));
        }
      });
    }
    if (project.image) {
      const src = String(project.image).trim();
      if (src && !raw.some((pair) => pair.en === src || pair.de === src)) {
        raw.unshift(asImagePair(src));
      }
    }
    return raw
      .map((pair) => ({
        src: srcForLang(pair, lang),
        caption: t(pair.caption, lang).trim()
      }))
      .filter((figure) => figure.src);
  }

  function skillBySymbol(name) {
    return (CONTENT.skills || []).find((skill) => skill.symbol === name) || null;
  }

  function renderProjects(lang) {
    const projectsEl = $("projects-list") || $("projects");
    if (!projectsEl) return;

    projectsEl.innerHTML = "";
    (CONTENT.projects || []).forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card";
      const title = t(project.title, lang);
      const figures = projectFigures(project, lang);
      const cover = figures[0];

      const media = document.createElement("div");
      media.className = "project-media" + (figures.length > 1 ? " has-gallery" : "");
      if (cover) {
        media.appendChild(buildProjectMedia(figures, title, lang));
      } else {
        media.innerHTML = placeholderMarkup(null, lang);
      }
      card.appendChild(media);

      const body = document.createElement("div");
      body.className = "project-body";
      const tools = (project.tools || []).map((name) => String(name || "").trim()).filter(Boolean);
      const skills = (project.skills || []).filter(Boolean);
      let extras = "";
      if (tools.length || skills.length) {
        const chips = tools
          .map((name) => `<span class="project-chip">${escapeHtml(name)}</span>`)
          .join("");
        const marks = skills
          .map((name) => {
            const skill = skillBySymbol(name);
            const label = skill ? t(skill.label, lang) : name;
            const svg = typeof legendSymbolSvg === "function" ? legendSymbolSvg(name) : "";
            return `<span class="project-skill" title="${escapeHtml(label)}"><span class="legend-symbol">${svg}</span></span>`;
          })
          .join("");
        const toolsLabel = tools.length
          ? `<span class="project-tools-label">${escapeHtml(t(UI.tools, lang))}</span>${chips}`
          : "";
        extras = `<div class="project-tools">${toolsLabel}${marks ? `<span class="project-skill-marks">${marks}</span>` : ""}</div>`;
      }
      body.innerHTML = `
        <h3 class="project-title">${escapeHtml(title)}</h3>
        <p class="project-meta">${escapeHtml(t(project.tag, lang))}</p>
        ${extras}
        <p class="project-desc">${escapeHtml(t(project.description, lang))}</p>
      `;
      card.appendChild(body);

      projectsEl.appendChild(card);
    });
  }

  function fillCopy(template, vars) {
    return String(template || "").replace(/\{(\w+)\}/g, (_, key) => (
      vars[key] != null ? String(vars[key]) : ""
    ));
  }

  function chevronSvg(dir) {
    const d = dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7";
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  }

  function buildProjectMedia(figures, title, lang) {
    let current = 0;
    const many = figures.length > 1;
    const wrap = document.createElement("div");
    wrap.className = "project-media-frame";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "project-media-btn";
    const img = document.createElement("img");
    img.className = "project-thumb";
    img.alt = title;
    img.loading = "lazy";
    img.decoding = "async";
    img.onerror = function () {
      wrap.innerHTML = placeholderMarkup(figures[current] && figures[current].src, lang);
    };
    btn.appendChild(img);
    btn.addEventListener("click", () => openLightbox(figures, current, title));
    wrap.appendChild(btn);

    const bundle = document.createElement("div");
    bundle.className = "project-media-bundle";
    bundle.appendChild(wrap);

    const captionEl = document.createElement("p");
    captionEl.className = "project-figure-caption";
    bundle.appendChild(captionEl);

    let cue = null;
    let thumbs = [];

    function setCurrent(index) {
      current = ((index % figures.length) + figures.length) % figures.length;
      const figure = figures[current];
      img.src = figure.src;
      img.alt = figure.caption || title;
      if (figure.caption) {
        captionEl.hidden = false;
        captionEl.textContent = figure.caption;
      } else {
        captionEl.hidden = true;
        captionEl.textContent = "";
      }
      if (many) {
        const galleryLabel = fillCopy(t(UI.viewGallery, lang) || t(UI.viewImage, lang), {
          count: figures.length,
          title: title
        });
        btn.setAttribute("aria-label", galleryLabel);
        if (cue) cue.textContent = formatImageCount(lang, current + 1, figures.length);
        thumbs.forEach((thumb, i) => {
          thumb.classList.toggle("is-active", i === current);
          thumb.setAttribute("aria-current", i === current ? "true" : "false");
        });
      } else {
        btn.setAttribute("aria-label", `${t(UI.viewImage, lang)}: ${title}`);
      }
    }

    if (many) {
      const prev = document.createElement("button");
      prev.type = "button";
      prev.className = "project-media-arrow prev";
      prev.setAttribute("aria-label", t(UI.previousImage, lang));
      prev.innerHTML = chevronSvg("prev");
      prev.addEventListener("click", (event) => {
        event.stopPropagation();
        setCurrent(current - 1);
      });

      const next = document.createElement("button");
      next.type = "button";
      next.className = "project-media-arrow next";
      next.setAttribute("aria-label", t(UI.nextImage, lang));
      next.innerHTML = chevronSvg("next");
      next.addEventListener("click", (event) => {
        event.stopPropagation();
        setCurrent(current + 1);
      });

      const bar = document.createElement("div");
      bar.className = "project-media-bar";
      cue = document.createElement("p");
      cue.className = "project-media-cue";
      const browse = document.createElement("span");
      browse.className = "project-media-browse";
      browse.textContent = fillCopy(t(UI.browsePhotos, lang) || "{count} photos", {
        count: figures.length
      });
      bar.appendChild(cue);
      bar.appendChild(browse);

      const strip = document.createElement("div");
      strip.className = "project-media-strip";
      strip.setAttribute("role", "tablist");
      strip.setAttribute("aria-label", fillCopy(t(UI.browsePhotos, lang) || "{count} photos", {
        count: figures.length
      }));
      thumbs = figures.map((figure, index) => {
        const thumb = document.createElement("button");
        thumb.type = "button";
        thumb.className = "project-media-thumb";
        thumb.setAttribute("role", "tab");
        thumb.setAttribute("aria-label", figure.caption || formatImageCount(lang, index + 1, figures.length));
        const thumbImg = document.createElement("img");
        thumbImg.src = figure.src;
        thumbImg.alt = "";
        thumb.appendChild(thumbImg);
        thumb.addEventListener("click", (event) => {
          event.stopPropagation();
          setCurrent(index);
          openLightbox(figures, index, title);
        });
        strip.appendChild(thumb);
        return thumb;
      });

      wrap.appendChild(prev);
      wrap.appendChild(next);
      wrap.appendChild(bar);
      wrap.appendChild(strip);
    }

    setCurrent(0);
    return bundle;
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

    updateLightboxUi(lang);
    closeLightbox();
    render(lang);
  }

  let lightbox = null;
  let lightboxState = {
    scale: 1,
    x: 0,
    y: 0,
    dragging: false,
    didDrag: false,
    px: 0,
    py: 0,
    items: [],
    captions: [],
    index: 0,
    caption: ""
  };

  function formatImageCount(lang, current, total) {
    const template = t(UI.imageCount, lang) || "{current} / {total}";
    return template
      .replace("{current}", String(current))
      .replace("{total}", String(total));
  }

  function mountLightbox() {
    if (lightbox) return lightbox;
    const box = document.createElement("div");
    box.id = "image-lightbox";
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML = `
      <button type="button" class="lightbox-close" data-lightbox="close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="lightbox-frame">
        <button type="button" class="lightbox-nav lightbox-prev" data-lightbox="prev" aria-label="Previous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <div class="lightbox-stage">
          <img class="lightbox-img" alt="">
        </div>
        <button type="button" class="lightbox-nav lightbox-next" data-lightbox="next" aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
      <div class="lightbox-thumbs" hidden></div>
      <div class="lightbox-bar">
        <p class="lightbox-caption"></p>
        <div class="lightbox-tools">
          <button type="button" class="lightbox-tool" data-lightbox="out" aria-label="Zoom out">−</button>
          <button type="button" class="lightbox-tool" data-lightbox="reset" aria-label="Fit">100%</button>
          <button type="button" class="lightbox-tool" data-lightbox="in" aria-label="Zoom in">+</button>
        </div>
        <p class="lightbox-hint"></p>
      </div>
    `;
    document.body.appendChild(box);
    lightbox = box;

    const stage = box.querySelector(".lightbox-stage");
    const img = box.querySelector(".lightbox-img");
    const resetBtn = box.querySelector('[data-lightbox="reset"]');

    function applyTransform() {
      img.style.transform = `translate(${lightboxState.x}px, ${lightboxState.y}px) scale(${lightboxState.scale})`;
      resetBtn.textContent = Math.round(lightboxState.scale * 100) + "%";
      stage.style.cursor = lightboxState.scale > 1.01 ? "grab" : "zoom-in";
    }

    function setScale(next, originX, originY) {
      const prev = lightboxState.scale;
      const scale = Math.min(6, Math.max(1, next));
      if (scale === 1) {
        lightboxState.x = 0;
        lightboxState.y = 0;
      } else if (originX != null && prev > 0) {
        const ratio = scale / prev;
        lightboxState.x = originX - (originX - lightboxState.x) * ratio;
        lightboxState.y = originY - (originY - lightboxState.y) * ratio;
      }
      lightboxState.scale = scale;
      applyTransform();
    }

    box.addEventListener("click", (event) => {
      const action = event.target.closest("[data-lightbox]");
      if (action) {
        const name = action.getAttribute("data-lightbox");
        if (name === "close") closeLightbox();
        if (name === "in") setScale(lightboxState.scale * 1.25);
        if (name === "out") setScale(lightboxState.scale / 1.25);
        if (name === "reset") setScale(1);
        if (name === "prev") stepLightbox(-1);
        if (name === "next") stepLightbox(1);
        if (name === "goto") {
          const nextIndex = Number(action.getAttribute("data-index"));
          if (!Number.isNaN(nextIndex)) showLightboxImage(nextIndex);
        }
        return;
      }
      if (event.target === box) {
        if (lightboxState.scale <= 1.01) closeLightbox();
        return;
      }
      if (event.target === stage || event.target === img) {
        if (lightboxState.didDrag) return;
        if (lightboxState.scale <= 1.01) {
          const rect = stage.getBoundingClientRect();
          const ox = event.clientX - rect.left - rect.width / 2;
          const oy = event.clientY - rect.top - rect.height / 2;
          setScale(2.5, ox, oy);
        }
      }
    });

    stage.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      lightboxState.didDrag = false;
      if (lightboxState.scale <= 1.01) return;
      lightboxState.dragging = true;
      lightboxState.px = event.clientX - lightboxState.x;
      lightboxState.py = event.clientY - lightboxState.y;
      stage.setPointerCapture(event.pointerId);
      stage.style.cursor = "grabbing";
    });

    stage.addEventListener("pointermove", (event) => {
      if (!lightboxState.dragging) return;
      const nx = event.clientX - lightboxState.px;
      const ny = event.clientY - lightboxState.py;
      if (Math.abs(nx - lightboxState.x) + Math.abs(ny - lightboxState.y) > 3) {
        lightboxState.didDrag = true;
      }
      lightboxState.x = nx;
      lightboxState.y = ny;
      applyTransform();
    });

    function endDrag() {
      lightboxState.dragging = false;
      stage.style.cursor = lightboxState.scale > 1.01 ? "grab" : "zoom-in";
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    stage.addEventListener("wheel", (event) => {
      event.preventDefault();
      const rect = stage.getBoundingClientRect();
      const ox = event.clientX - rect.left - rect.width / 2;
      const oy = event.clientY - rect.top - rect.height / 2;
      const factor = event.deltaY > 0 ? 0.9 : 1.1;
      setScale(lightboxState.scale * factor, ox, oy);
    }, { passive: false });

    document.addEventListener("keydown", (event) => {
      if (box.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
      }
      if (event.key === "+" || event.key === "=") setScale(lightboxState.scale * 1.25);
      if (event.key === "-" || event.key === "_") setScale(lightboxState.scale / 1.25);
      if (event.key === "0") setScale(1);
    });

    box._applyTransform = applyTransform;
    box._setScale = setScale;
    return box;
  }

  function updateLightboxUi(lang) {
    if (!lightbox) return;
    const closeBtn = lightbox.querySelector('[data-lightbox="close"]');
    const inBtn = lightbox.querySelector('[data-lightbox="in"]');
    const outBtn = lightbox.querySelector('[data-lightbox="out"]');
    const resetBtn = lightbox.querySelector('[data-lightbox="reset"]');
    const prevBtn = lightbox.querySelector('[data-lightbox="prev"]');
    const nextBtn = lightbox.querySelector('[data-lightbox="next"]');
    const hint = lightbox.querySelector(".lightbox-hint");
    if (closeBtn) closeBtn.setAttribute("aria-label", t(UI.closeImage, lang));
    if (inBtn) inBtn.setAttribute("aria-label", t(UI.zoomIn, lang));
    if (outBtn) outBtn.setAttribute("aria-label", t(UI.zoomOut, lang));
    if (resetBtn) resetBtn.setAttribute("aria-label", t(UI.zoomReset, lang));
    if (prevBtn) prevBtn.setAttribute("aria-label", t(UI.previousImage, lang));
    if (nextBtn) nextBtn.setAttribute("aria-label", t(UI.nextImage, lang));
    if (hint) hint.textContent = t(UI.zoomHint, lang);
  }

  function resetLightboxZoom() {
    lightboxState.scale = 1;
    lightboxState.x = 0;
    lightboxState.y = 0;
    lightboxState.dragging = false;
    if (lightbox && lightbox._applyTransform) lightbox._applyTransform();
  }

  function renderLightboxThumbs() {
    if (!lightbox) return;
    const strip = lightbox.querySelector(".lightbox-thumbs");
    const items = lightboxState.items;
    strip.innerHTML = "";
    const many = items.length > 1;
    strip.hidden = !many;
    if (!many) return;
    items.forEach((src, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lightbox-thumb" + (index === lightboxState.index ? " is-active" : "");
      btn.setAttribute("data-lightbox", "goto");
      btn.setAttribute("data-index", String(index));
      btn.setAttribute("aria-label", formatImageCount(currentLang, index + 1, items.length));
      btn.setAttribute("aria-current", index === lightboxState.index ? "true" : "false");
      const thumb = document.createElement("img");
      thumb.src = src;
      thumb.alt = "";
      thumb.setAttribute("aria-hidden", "true");
      btn.appendChild(thumb);
      strip.appendChild(btn);
    });
  }

  function showLightboxImage(index) {
    if (!lightbox) return;
    const items = lightboxState.items;
    if (!items.length) return;
    const next = ((index % items.length) + items.length) % items.length;
    lightboxState.index = next;
    const img = lightbox.querySelector(".lightbox-img");
    const captionEl = lightbox.querySelector(".lightbox-caption");
    const title = lightboxState.caption || "";
    const figureCap = (lightboxState.captions || [])[next] || "";
    img.src = items[next];
    img.alt = figureCap || title;
    const parts = [];
    if (items.length > 1) parts.push(formatImageCount(currentLang, next + 1, items.length));
    if (figureCap) parts.push(figureCap);
    else if (title) parts.push(title);
    captionEl.textContent = parts.join(" · ");
    const prevBtn = lightbox.querySelector('[data-lightbox="prev"]');
    const nextBtn = lightbox.querySelector('[data-lightbox="next"]');
    const many = items.length > 1;
    if (prevBtn) prevBtn.hidden = !many;
    if (nextBtn) nextBtn.hidden = !many;
    resetLightboxZoom();
    renderLightboxThumbs();
  }

  function stepLightbox(delta) {
    if (lightboxState.items.length < 2) return;
    showLightboxImage(lightboxState.index + delta);
  }

  function openLightbox(figures, startIndex, title) {
    const list = (figures || []).filter((figure) => figure && figure.src);
    if (!list.length) return;
    const box = mountLightbox();
    updateLightboxUi(currentLang);
    lightboxState.items = list.map((figure) => figure.src);
    lightboxState.captions = list.map((figure) => figure.caption || "");
    lightboxState.caption = title || "";
    box.hidden = false;
    document.body.classList.add("lightbox-open");
    showLightboxImage(startIndex || 0);
    box.querySelector('[data-lightbox="close"]').focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    lightboxState.items = [];
    lightboxState.captions = [];
    lightboxState.index = 0;
    lightboxState.caption = "";
    const img = lightbox.querySelector(".lightbox-img");
    if (img) img.src = "";
  }

  let currentLang = detectLang();
  localStorage.setItem("lang", currentLang);

  mountLangSwitcher();
  render(currentLang);

  const downloadBtn = $("download-cv-btn");
  if (downloadBtn) downloadBtn.addEventListener("click", () => window.print());
})();
