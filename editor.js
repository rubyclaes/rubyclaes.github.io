/* ==========================================================================
   Content studio — edits SITE / SHARED / UI / CONTENT and writes content.js
   ========================================================================== */

(function () {
  const SAME_THRESHOLD = 40;
  const PAGE = {
    both: "Portfolio & CV",
    portfolio: "Portfolio only",
    cv: "CV only",
    chrome: "Site labels"
  };

  const HEADER = `/* ==========================================================================
   Site content — English + German.

   Easiest way to edit: run start-editor, then Save. That writes this file.

   You can still edit this file directly. Rules:
   - Keep quote marks around every piece of text.
   - Keep commas between entries.
   - Translated fields look like:  { en: "English", de: "Deutsch" }
   - SHARED is language-independent (name, email, LinkedIn).
   - Project photos live in images/portfolio/{folder}/. Folder numbers stay put when you reorder cards.
   - Language pairs: name.en.jpg + name.de.jpg. A file with no .en/.de is used in both languages.
   - Homepage order is this projects array. Move up / Move down in the studio; do not rename folders.
   - Leave de: "" if you have not translated yet — the site falls back to English.
   ========================================================================== */
`;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  const state = {
    SITE: clone(SITE),
    SHARED: clone(SHARED),
    UI: clone(UI),
    CONTENT: clone(CONTENT)
  };

  const TOOL_SUGGESTIONS = ["QGIS", "Sentinel-2", "Excel", "Python", "R", "Inkscape", "ENVI-met", "ArcGIS"];

  function fileName(src) {
    const parts = String(src || "").replace(/\\/g, "/").split("/");
    return parts[parts.length - 1] || "";
  }

  function imageDir(src) {
    const value = String(src || "").replace(/\\/g, "/");
    const i = value.lastIndexOf("/");
    return i === -1 ? "" : value.slice(0, i);
  }

  function imageLangKey(src) {
    const name = fileName(src);
    const dot = name.lastIndexOf(".");
    const stem = dot === -1 ? name : name.slice(0, dot);
    const match = stem.match(/^(.*)\.(en|de)$/i);
    const dir = imageDir(src);
    const prefix = dir ? dir + "/" : "";
    if (match) {
      return { key: prefix + match[1].toLowerCase(), lang: match[2].toLowerCase() };
    }
    return { key: prefix + stem.toLowerCase(), lang: "both" };
  }

  function emptyCaption() {
    return { en: "", de: "" };
  }

  function asImagePair(item) {
    if (!item) return { en: "", de: "", caption: emptyCaption() };
    if (typeof item === "string") {
      const src = item.trim();
      return { en: src, de: "", caption: emptyCaption() };
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

  function pairFromPaths(paths, previous, options) {
    const prune = Boolean(options && options.prune);
    const groups = [];
    const indexOf = {};
    function ensure(key) {
      if (indexOf[key] == null) {
        indexOf[key] = groups.length;
        groups.push({ key: key, en: "", de: "", caption: emptyCaption() });
      }
      return groups[indexOf[key]];
    }
    (previous || []).forEach((raw) => {
      const pair = asImagePair(raw);
      const sample = pair.en || pair.de;
      if (!sample) return;
      const group = ensure(imageLangKey(sample).key);
      if (!prune) {
        group.en = pair.en;
        group.de = pair.de;
      }
      group.caption = pair.caption;
    });
    (paths || []).forEach((src) => {
      const value = String(src || "").trim();
      if (!value) return;
      const parsed = imageLangKey(value);
      const group = ensure(parsed.key);
      if (parsed.lang === "en") group.en = value;
      else if (parsed.lang === "de") group.de = value;
      else if (!group.en) group.en = value;
    });
    return groups
      .map((group) => {
        const en = group.en || "";
        let de = group.de || "";
        if (en && de && en === de) de = "";
        return { en: en, de: de, caption: group.caption || emptyCaption() };
      })
      .filter((pair) => pair.en || pair.de);
  }

  function projectImagePairs(project) {
    const raw = [];
    if (Array.isArray(project.images)) {
      project.images.forEach((item) => {
        if (typeof item === "string") {
          if (item.trim()) raw.push(item.trim());
        } else if (item && (item.en || item.de)) {
          raw.push(item);
        }
      });
    }
    if (project.image) raw.unshift(String(project.image).trim());
    if (raw.length && raw.every((item) => typeof item === "string")) {
      return pairFromPaths(raw, []);
    }
    return pairFromPaths(
      raw.flatMap((item) => (typeof item === "string" ? [item] : [item.en, item.de].filter(Boolean))),
      raw.filter((item) => item && typeof item === "object")
    );
  }

  function pairPaths(pair) {
    const item = asImagePair(pair);
    const list = [];
    if (item.en) list.push(item.en);
    if (item.de && item.de !== item.en) list.push(item.de);
    return list;
  }

  function inferFolder(project) {
    if (project.folder) return String(project.folder);
    const sample = pairPaths((project.images || [])[0] || {})[0] || "";
    const match = String(sample).match(/images\/portfolio\/(\d+)\//);
    return match ? match[1] : "";
  }

  function nextFolder() {
    let max = 0;
    (state.CONTENT.projects || []).forEach((project) => {
      const n = Number(project.folder);
      if (n > max) max = n;
    });
    return String(max + 1);
  }

  function normalizeProjects() {
    const used = {};
    (state.CONTENT.projects || []).forEach((project) => {
      let folder = inferFolder(project);
      if (!folder || used[folder]) folder = nextFolder();
      used[folder] = true;
      project.folder = folder;
      project.tools = Array.isArray(project.tools)
        ? project.tools.map((name) => String(name || "").trim()).filter(Boolean)
        : [];
      project.skills = Array.isArray(project.skills)
        ? project.skills.filter(Boolean)
        : [];
      project.images = projectImagePairs(project);
      delete project.image;
    });
  }

  normalizeProjects();

  let dirty = false;
  let activeTab = "edit";

  const editView = document.getElementById("edit-view");
  const overviewView = document.getElementById("overview-view");
  const statusEl = document.getElementById("editor-status");

  function langs() {
    return (state.SITE.languages || []).map((item) => item.code);
  }

  function langLabel(code) {
    const item = (state.SITE.languages || []).find((entry) => entry.code === code);
    return (item && item.label) || String(code).toUpperCase();
  }

  function defaultLang() {
    return state.SITE.defaultLang || "en";
  }

  function emptyLoc() {
    const obj = {};
    langs().forEach((code) => {
      obj[code] = "";
    });
    return obj;
  }

  function ensureLoc(value) {
    const obj = emptyLoc();
    if (value && typeof value === "object" && !Array.isArray(value)) {
      langs().forEach((code) => {
        obj[code] = value[code] != null ? String(value[code]) : "";
      });
    } else if (typeof value === "string") {
      obj[defaultLang()] = value;
    }
    return obj;
  }

  function setDirty(value) {
    dirty = value;
    document.title = (dirty ? "• " : "") + "Content studio — Ruby Claes";
  }

  function isStudio() {
    const host = location.hostname;
    return location.protocol === "http:" && (host === "127.0.0.1" || host === "localhost");
  }

  function status(message, kind) {
    statusEl.textContent = message || "";
    statusEl.classList.remove("is-ok", "is-warn", "is-error");
    if (kind) statusEl.classList.add("is-" + kind);
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function assign(path, value) {
    const parts = path.split(".");
    let current = state;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const key = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
      current = current[key];
    }
    const last = parts[parts.length - 1];
    current[/^\d+$/.test(last) ? Number(last) : last] = value;
  }

  function isLocalized(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const codes = langs();
    const keys = Object.keys(value);
    if (!codes.some((code) => Object.prototype.hasOwnProperty.call(value, code))) return false;
    return keys.every((key) => typeof value[key] === "string");
  }

  function pageTag(page) {
    if (!page || !PAGE[page]) return "";
    return `<span class="page-tag page-tag-${page}">${PAGE[page]}</span>`;
  }

  function binButton(action, extraAttrs, label) {
    const attrs = extraAttrs || "";
    return `<button type="button" class="icon-btn danger" data-action="${esc(action)}" ${attrs} aria-label="${esc(label || "Remove")}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
    </button>`;
  }

  function symbolNames() {
    return Object.keys(typeof LEGEND_SYMBOLS !== "undefined" ? LEGEND_SYMBOLS : { dashed: "" });
  }

  function nextSymbol() {
    const used = {};
    (state.CONTENT.skills || []).forEach((skill) => {
      used[skill.symbol] = true;
    });
    return symbolNames().find((name) => !used[name]) || "contour";
  }

  function locFields(path, value, options) {
    const opts = options || {};
    const loc = ensureLoc(value);
    const areaClass = opts.tall ? " tall" : "";
    const tag = opts.page ? `<div class="field-page">${pageTag(opts.page)}</div>` : "";
    const gridClass = opts.gridClass || "lang-grid";
    return `${tag}<div class="${gridClass}">${langs()
      .map((code) => {
        const fieldPath = `${path}.${code}`;
        const label = `${langLabel(code)}${opts.label ? " · " + opts.label : ""}`;
        if (opts.multiline) {
          return `<label class="field">
            <span class="field-label">${esc(label)}</span>
            <textarea class="${areaClass.trim()}" data-path="${esc(fieldPath)}">${esc(loc[code])}</textarea>
          </label>`;
        }
        return `<label class="field">
          <span class="field-label">${esc(label)}</span>
          <input type="text" data-path="${esc(fieldPath)}" value="${esc(loc[code])}">
        </label>`;
      })
      .join("")}</div>`;
  }

  function renderEdit() {
    const contact = state.SHARED.contact || {};
    const content = state.CONTENT;
    const skills = content.skills || [];
    const projects = content.projects || [];
    const education = content.education || [];
    const experience = content.experience || [];

    editView.innerHTML = `
      <p class="editor-key" aria-label="Where content appears">
        ${pageTag("portfolio")}
        ${pageTag("cv")}
        ${pageTag("both")}
        ${pageTag("chrome")}
      </p>

      <section class="editor-section">
        <div class="editor-section-head">
          <h2>Shared</h2>
          ${pageTag("both")}
        </div>
        <p class="editor-help">Name and contact details on both pages. Same in every language.</p>
        <div class="field-grid">
          <label class="field">
            <span class="field-label">Name</span>
            <input type="text" data-path="SHARED.name" value="${esc(state.SHARED.name)}">
          </label>
          <label class="field">
            <span class="field-label">Email</span>
            <input type="email" data-path="SHARED.contact.email" value="${esc(contact.email || "")}">
          </label>
          <label class="field">
            <span class="field-label">Email link</span>
            <input type="text" data-path="SHARED.contact.emailLink" value="${esc(contact.emailLink || "")}">
          </label>
          <label class="field">
            <span class="field-label">LinkedIn URL</span>
            <input type="url" data-path="SHARED.contact.linkedin" value="${esc(contact.linkedin || "")}">
          </label>
          <label class="field">
            <span class="field-label">Phone (optional)</span>
            <input type="text" data-path="SHARED.contact.phone" value="${esc(contact.phone || "")}">
          </label>
        </div>
      </section>

      <section class="editor-section">
        <div class="editor-section-head">
          <h2>Header &amp; profile</h2>
        </div>
        <p class="editor-help">The short profile is the homepage blurb. The full profile and languages line are on the CV only.</p>
        ${locFields("CONTENT.tagline", content.tagline, { label: "Tagline", page: "both" })}
        ${locFields("CONTENT.location", content.location, { label: "Location", page: "both" })}
        ${locFields("CONTENT.citizenship", content.citizenship, { label: "Citizenship", page: "both", multiline: true })}
        ${locFields("CONTENT.shortProfile", content.shortProfile, { label: "Short profile", page: "portfolio", multiline: true, tall: true })}
        ${locFields("CONTENT.fullProfile", content.fullProfile, { label: "Full profile", page: "cv", multiline: true, tall: true })}
        ${locFields("CONTENT.languages", content.languages, { label: "Languages line", page: "cv", multiline: true })}
        ${locFields("CONTENT.availability", content.availability, { label: "Availability (footer)", page: "both", multiline: true, tall: true })}
      </section>

      <section class="editor-section">
        <div class="editor-section-head">
          <h2>Skills</h2>
          ${pageTag("both")}
        </div>
        <p class="editor-help">Pick a legend mark for each skill. Unused marks are available when you add another skill.</p>
        <div id="skills-list">${skills.map(renderSkill).join("")}</div>
        <button type="button" class="ghost" data-action="add-skill">+ Add skill</button>
      </section>

      <section class="editor-section">
        <div class="editor-section-head">
          <h2>Projects</h2>
          ${pageTag("portfolio")}
        </div>
        <p class="editor-help">Shown as cards on the homepage only. Each project keeps a folder such as <code>images/portfolio/4/</code> even if you move the card. Use <strong>Move up / Move down</strong> to change homepage order.</p>
        <p class="editor-help">Write a short summary (question → method → what the map shows). Add tools and legend skills. Photos: <code>name.en.jpg</code> and <code>name.de.jpg</code> for language pairs; a file with no <code>.en</code>/<code>.de</code> is used in both languages. Cards stay 4:3 and show the whole sheet (nothing cropped). Click to zoom.</p>
        <div id="projects-list">${projects.map(renderProject).join("")}</div>
        <button type="button" class="ghost" data-action="add-project">+ Add project</button>
      </section>

      <section class="editor-section">
        <div class="editor-section-head">
          <h2>Education</h2>
          ${pageTag("cv")}
        </div>
        <p class="editor-help">CV page only.</p>
        <div id="education-list">${education.map((entry, i) => renderEntry("education", entry, i)).join("")}</div>
        <button type="button" class="ghost" data-action="add-education">+ Add education</button>
      </section>

      <section class="editor-section">
        <div class="editor-section-head">
          <h2>Experience</h2>
          ${pageTag("cv")}
        </div>
        <p class="editor-help">CV page only.</p>
        <div id="experience-list">${experience.map((entry, i) => renderEntry("experience", entry, i)).join("")}</div>
        <button type="button" class="ghost" data-action="add-experience">+ Add experience</button>
      </section>

      <section class="editor-section">
        <div class="editor-section-head">
          <h2>Buttons &amp; headings</h2>
          ${pageTag("chrome")}
        </div>
        <p class="editor-help">Nav, section titles, and footer labels on both pages. LinkedIn / Portfolio can stay the same in both languages.</p>
        ${renderUiFields()}
      </section>
    `;
    bindImagePreviews();
  }

  function renderSkill(skill, index) {
    const current = skill.symbol || "dashed";
    const picker = symbolNames()
      .map((name) => {
        const pressed = current === name ? "true" : "false";
        const svg = (typeof legendSymbolSvg === "function" ? legendSymbolSvg(name) : "") || "";
        return `<button type="button" class="symbol-option" data-action="pick-symbol" data-index="${index}" data-symbol="${esc(name)}" aria-pressed="${pressed}" aria-label="${esc(name)}" title="${esc(name)}">
          <span class="legend-symbol">${svg}</span>
        </button>`;
      })
      .join("");
    return `<article class="editor-card" data-list="skills" data-index="${index}">
      <div class="editor-card-head">
        <strong>Skill ${index + 1}</strong>
        ${binButton("remove-skill", `data-index="${index}"`, "Remove skill")}
      </div>
      <p class="field-label">Legend mark</p>
      <div class="symbol-picker" role="radiogroup" aria-label="Legend mark for skill ${index + 1}">${picker}</div>
      ${locFields("CONTENT.skills." + index + ".label", skill.label, { label: "Label" })}
      ${locFields("CONTENT.skills." + index + ".detail", skill.detail, { label: "Detail" })}
    </article>`;
  }

  function asImageList(value) {
    if (Array.isArray(value)) {
      return value.flatMap((item) => {
        if (typeof item === "string") return item.trim() ? [item.trim()] : [];
        return pairPaths(asImagePair(item));
      });
    }
    if (value) return [String(value)];
    return [];
  }

  function pairsEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i].en !== b[i].en || a[i].de !== b[i].de) return false;
    }
    return true;
  }

  async function syncFolderImages(options) {
    const opts = options || {};
    if (!isStudio()) return false;
    try {
      const response = await fetch("/studio/images");
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return false;
      const map = payload.projects || {};
      let changed = false;
      (state.CONTENT.projects || []).forEach((project) => {
        const disk = asImageList(map[String(project.folder)]);
        const next = pairFromPaths(disk, projectImagePairs(project), { prune: true });
        if (!pairsEqual(next, projectImagePairs(project))) {
          project.images = next;
          changed = true;
        }
      });
      if (changed && !opts.quiet) {
        setDirty(true);
        status("Updated photos from the project folders. Save to keep the list.", "ok");
      }
      return changed;
    } catch (error) {
      if (!opts.quiet) status("Could not read project photo folders.", "error");
      return false;
    }
  }

  function syncImagePreview(box, src) {
    if (!box) return;
    const img = box.querySelector("img");
    const label = box.querySelector(".editor-image-preview-label");
    const value = String(src || "").trim();
    box.classList.remove("is-empty", "is-error", "is-ok");
    if (!img) return;
    img.onload = function () {
      box.classList.remove("is-empty", "is-error");
      box.classList.add("is-ok");
    };
    img.onerror = function () {
      box.classList.remove("is-ok", "is-empty");
      box.classList.add("is-error");
      if (label) label.textContent = "Missing";
    };
    if (!value) {
      img.removeAttribute("src");
      box.classList.add("is-empty");
      if (label) label.textContent = "No photo";
      return;
    }
    if (label) label.textContent = "Missing";
    img.src = value;
  }

  function bindImagePreviews() {
    editView.querySelectorAll("[data-image-preview]").forEach((box) => {
      syncImagePreview(box, box.getAttribute("data-src") || "");
    });
  }

  function previewTile(src, otherSrc, langLabel) {
    const value = String(src || "").trim();
    const fallback = String(otherSrc || "").trim();
    const shown = value || fallback;
    const shared = !value && fallback;
    const name = shown ? fileName(shown) : "—";
    const hint = shared
      ? `<span class="editor-pair-hint">Uses the other language until you add a twin file</span>`
      : "";
    return `<div class="editor-pair-lang">
      <span class="field-label">${esc(langLabel)}</span>
      <div class="editor-image-preview is-empty" data-image-preview data-src="${esc(shown)}" aria-hidden="true">
        <img alt="">
        <span class="editor-image-preview-label">${shown ? "Missing" : "No photo"}</span>
      </div>
      <span class="editor-image-name" title="${esc(shown || name)}">${esc(name)}</span>
      ${hint}
    </div>`;
  }

  function renderProjectImages(project, index) {
    const folderId = String(project.folder || nextFolder());
    const folder = `images/portfolio/${folderId}/`;
    const images = projectImagePairs(project);
    const tiles = images
      .map((pair, imageIndex) => {
        const item = asImagePair(pair);
        const cover = imageIndex === 0
          ? `<span class="page-tag page-tag-portfolio">Cover</span>`
          : "";
        const coverBtn = imageIndex === 0
          ? ""
          : `<button type="button" class="ghost" data-action="cover-image" data-index="${index}" data-image="${imageIndex}">Use as cover</button>`;
        const upDisabled = imageIndex === 0 ? " disabled" : "";
        const downDisabled = imageIndex === images.length - 1 ? " disabled" : "";
        return `<figure class="editor-image-tile editor-pair-tile">
          <div class="editor-pair-head">
            ${cover || `<span class="editor-pair-index">Figure ${imageIndex + 1}</span>`}
            <div class="editor-image-tile-actions">
              <button type="button" class="ghost" data-action="move-image" data-index="${index}" data-image="${imageIndex}" data-delta="-1"${upDisabled}>Move up</button>
              <button type="button" class="ghost" data-action="move-image" data-index="${index}" data-image="${imageIndex}" data-delta="1"${downDisabled}>Move down</button>
              ${coverBtn}
              ${binButton("remove-image", `data-index="${index}" data-image="${imageIndex}"`, "Remove photo pair")}
            </div>
          </div>
          <div class="editor-pair-langs">
            ${previewTile(item.en, item.de, "English")}
            ${previewTile(item.de, item.en, "German")}
          </div>
          ${locFields("CONTENT.projects." + index + ".images." + imageIndex + ".caption", item.caption, { label: "Caption", multiline: true, gridClass: "editor-pair-captions" })}
        </figure>`;
      })
      .join("");
    const empty = images.length
      ? ""
      : `<p class="editor-help">No photos yet. Add JPG, PNG or WebP files for this project.</p>`;
    const studioTools = isStudio()
      ? `<div class="editor-row-actions editor-image-actions">
          <label class="ghost editor-image-add">
            <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple data-action="pick-images" data-index="${index}">
            + Add photos
          </label>
          <button type="button" class="ghost" data-action="scan-images" data-index="${index}">Scan folder</button>
        </div>`
      : `<p class="editor-help">Start the content studio to add or remove photos.</p>`;
    return `<p class="editor-sub">Photos</p>
      <p class="editor-help">These files live in <code>${esc(folder)}</code> (folder ${esc(folderId)} stays put if you move the card). Cover is the homepage card. Use <strong>Move up / Move down</strong> for gallery order, or <strong>Use as cover</strong> to jump a figure to first. Pair languages with <code>name.en.jpg</code> and <code>name.de.jpg</code>. If only one file exists, both languages show it.</p>
      <div class="editor-image-grid" data-image-drop="${index}">
        ${empty}${tiles}
      </div>
      ${studioTools}`;
  }

  function studioProjectParam(project) {
    return encodeURIComponent(String(project.folder || ""));
  }

  async function uploadImages(projectIndex, fileList) {
    const files = Array.prototype.slice.call(fileList || []);
    if (!files.length || !isStudio()) return;
    const project = state.CONTENT.projects[projectIndex];
    if (!project) return;
    if (!project.folder) project.folder = nextFolder();
    status("Adding photos…");
    try {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const response = await fetch(
          "/studio/image?project=" +
            studioProjectParam(project) +
            "&name=" +
            encodeURIComponent(file.name),
          { method: "POST", body: file }
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Could not add that photo.");
      }
      await syncFolderImages({ quiet: true });
      setDirty(true);
      status("Photos added. Save to keep them on the site.", "ok");
      restoreScroll(renderEdit);
    } catch (error) {
      status("Could not add photo: " + (error && error.message ? error.message : "unknown error"), "error");
    }
  }

  async function removeStudioFile(project, src) {
    const name = fileName(src);
    if (!name) return true;
    const response = await fetch(
      "/studio/image?project=" +
        studioProjectParam(project) +
        "&name=" +
        encodeURIComponent(name),
      { method: "DELETE" }
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      status("Could not remove photo: " + (payload.error || response.statusText), "error");
      return false;
    }
    return true;
  }

  async function removeProjectImage(projectIndex, imageIndex) {
    const project = state.CONTENT.projects[projectIndex];
    const pair = projectImagePairs(project)[imageIndex];
    if (!pair) return;
    const files = pairPaths(pair);
    const label = files.map(fileName).join(" and ") || "this photo";
    if (!window.confirm("Remove " + label + " from this project folder?")) return;
    if (isStudio()) {
      for (let i = 0; i < files.length; i += 1) {
        const ok = await removeStudioFile(project, files[i]);
        if (!ok) return;
      }
    }
    const images = projectImagePairs(project);
    images.splice(imageIndex, 1);
    project.images = images;
    setDirty(true);
    status("Unsaved changes");
    restoreScroll(renderEdit);
  }

  function addProjectTool(index, name) {
    const project = state.CONTENT.projects[index];
    const value = String(name || "").trim();
    if (!project || !value) return false;
    if (!Array.isArray(project.tools)) project.tools = [];
    if (project.tools.indexOf(value) !== -1) return false;
    project.tools.push(value);
    return true;
  }

  function renderProjectTools(project, index) {
    const tools = project.tools || [];
    const chips = tools
      .map((name, toolIndex) => {
        return `<button type="button" class="editor-chip" data-action="remove-tool" data-index="${index}" data-tool="${toolIndex}">
          ${esc(name)} <span aria-hidden="true">×</span>
        </button>`;
      })
      .join("");
    const used = {};
    tools.forEach((name) => {
      used[name] = true;
    });
    const suggestions = TOOL_SUGGESTIONS.filter((name) => !used[name])
      .map((name) => {
        return `<button type="button" class="ghost" data-action="add-tool" data-index="${index}" data-name="${esc(name)}">${esc(name)}</button>`;
      })
      .join("");
    return `<p class="editor-sub">Tools</p>
      <p class="editor-help">Shown as chips on the homepage. Same in every language. Click a selected chip to remove it.</p>
      <div class="editor-chip-row">${chips || `<span class="editor-help">No tools yet.</span>`}</div>
      <p class="field-label">Add a tool</p>
      <div class="editor-row-actions editor-tool-suggestions">
        ${suggestions}
      </div>
      <div class="editor-tool-custom">
        <span class="field-label">Or type a name</span>
        <div class="editor-tool-custom-row">
          <input type="text" data-tool-input="${index}" placeholder="e.g. GRASS GIS" aria-label="Tool name">
          <button type="button" class="ghost" data-action="add-tool-custom" data-index="${index}">Add tool</button>
        </div>
      </div>`;
  }

  function renderProjectSkills(project, index) {
    const selected = project.skills || [];
    const picker = (state.CONTENT.skills || [])
      .map((skill) => {
        const name = skill.symbol || "dashed";
        const pressed = selected.indexOf(name) !== -1 ? "true" : "false";
        const label = (skill.label && (skill.label.en || skill.label.de)) || name;
        const svg = (typeof legendSymbolSvg === "function" ? legendSymbolSvg(name) : "") || "";
        return `<button type="button" class="symbol-option" data-action="toggle-project-skill" data-index="${index}" data-symbol="${esc(name)}" aria-pressed="${pressed}" aria-label="${esc(label)}" title="${esc(label)}">
          <span class="legend-symbol">${svg}</span>
        </button>`;
      })
      .join("");
    return `<p class="editor-sub">Skills on this project</p>
      <p class="editor-help">Optional legend marks, matching the skills list above.</p>
      <div class="symbol-picker" role="group" aria-label="Skills shown on this project">${picker}</div>`;
  }

  function renderProject(project, index) {
    const total = (state.CONTENT.projects || []).length;
    const folderId = String(project.folder || "");
    const upDisabled = index === 0 ? " disabled" : "";
    const downDisabled = index === total - 1 ? " disabled" : "";
    return `<article class="editor-card" data-list="projects" data-index="${index}">
      <div class="editor-card-head">
        <strong>Project ${index + 1} <span class="editor-folder-id">folder ${esc(folderId)}</span></strong>
        <div class="editor-card-head-actions">
          <button type="button" class="ghost" data-action="move-project" data-index="${index}" data-delta="-1"${upDisabled}>Move up</button>
          <button type="button" class="ghost" data-action="move-project" data-index="${index}" data-delta="1"${downDisabled}>Move down</button>
          ${binButton("remove-project", `data-index="${index}"`, "Remove project")}
        </div>
      </div>
      ${renderProjectImages(project, index)}
      ${locFields("CONTENT.projects." + index + ".title", project.title, { label: "Title" })}
      ${locFields("CONTENT.projects." + index + ".tag", project.tag, { label: "Tag / context" })}
      ${renderProjectTools(project, index)}
      ${renderProjectSkills(project, index)}
      ${locFields("CONTENT.projects." + index + ".description", project.description, { label: "Summary (question → method → result)", multiline: true, tall: true })}
    </article>`;
  }

  function renderEntry(kind, entry, index) {
    const bullets = entry.bullets || [];
    const bulletHtml = bullets
      .map((bullet, bulletIndex) => {
        return `<div class="editor-card">
          <div class="editor-card-head">
            <strong>Bullet ${bulletIndex + 1}</strong>
            ${binButton("remove-bullet", `data-kind="${kind}" data-index="${index}" data-bullet="${bulletIndex}"`, "Remove bullet")}
          </div>
          ${locFields("CONTENT." + kind + "." + index + ".bullets." + bulletIndex, bullet, { multiline: true })}
        </div>`;
      })
      .join("");
    const title = kind === "education" ? "Education" : "Experience";
    return `<article class="editor-card" data-list="${kind}" data-index="${index}">
      <div class="editor-card-head">
        <strong>${title} ${index + 1}</strong>
        ${binButton("remove-" + kind, `data-index="${index}"`, "Remove " + title.toLowerCase())}
      </div>
      ${locFields("CONTENT." + kind + "." + index + ".role", entry.role, { label: "Role" })}
      ${locFields("CONTENT." + kind + "." + index + ".org", entry.org, { label: "Organisation" })}
      ${locFields("CONTENT." + kind + "." + index + ".dates", entry.dates, { label: "Dates" })}
      <p class="editor-sub">Bullets</p>
      ${bulletHtml}
      <div class="editor-row-actions">
        <button type="button" class="ghost" data-action="add-bullet" data-kind="${kind}" data-index="${index}">+ Add bullet</button>
      </div>
    </article>`;
  }

  function renderUiFields() {
    return Object.keys(state.UI)
      .map((key) => locFields("UI." + key, state.UI[key], { label: key }))
      .join("");
  }

  function collectRows() {
    const rows = [];
    function walk(value, path) {
      if (value == null) return;
      if (isLocalized(value)) {
        rows.push({ path, values: value });
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item, index) => walk(item, `${path}[${index}]`));
        return;
      }
      if (typeof value === "object") {
        Object.keys(value).forEach((key) => {
          walk(value[key], path ? `${path}.${key}` : key);
        });
      }
    }
    walk(state.UI, "UI");
    walk(state.CONTENT, "CONTENT");
    return rows;
  }

  function rowStatus(values) {
    const primary = defaultLang();
    const primaryText = String(values[primary] || "").trim();
    const others = langs().filter((code) => code !== primary);
    const otherTexts = others.map((code) => String(values[code] || "").trim());
    if (!primaryText && otherTexts.every((text) => !text)) return "ok";
    const empty = others.filter((code) => !String(values[code] || "").trim());
    if (empty.length) return "empty";
    const same = others.some((code) => {
      const text = String(values[code] || "").trim();
      return text === primaryText && primaryText.length > SAME_THRESHOLD;
    });
    if (same) return "same";
    return "ok";
  }

  function renderOverview() {
    const rows = collectRows();
    const counts = { ok: 0, empty: 0, same: 0 };
    rows.forEach((row) => {
      counts[rowStatus(row.values)] += 1;
    });
    const labels = { ok: "Translated", empty: "Missing", same: "Same as English" };
    const pills = { ok: "pill-ok", empty: "pill-empty", same: "pill-same" };
    const langHeaders = langs()
      .map((code) => `<th>${esc(langLabel(code))}</th>`)
      .join("");

    overviewView.innerHTML = `
      <section class="editor-section">
        <h2>Translation overview</h2>
        <p class="editor-help">Empty German cells need a translation. “Same as English” only flags longer copied text — short labels like LinkedIn can match on purpose.</p>
        <div class="overview-summary">
          ${Object.keys(counts)
            .map((key) => `<span class="pill ${pills[key]}">${counts[key]} ${labels[key]}</span>`)
            .join("")}
        </div>
        <table class="overview-table">
          <thead>
            <tr><th>Field</th>${langHeaders}<th>Status</th></tr>
          </thead>
          <tbody>
            ${rows
              .map((row) => {
                const flag = rowStatus(row.values);
                const cells = langs()
                  .map((code) => `<td class="cell-text">${esc(row.values[code] || "")}</td>`)
                  .join("");
                return `<tr>
                  <td><code>${esc(row.path)}</code></td>
                  ${cells}
                  <td><span class="pill ${pills[flag]}">${labels[flag]}</span></td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </section>
    `;
  }

  function toJs(value, indent) {
    const pad = "  ".repeat(indent);
    const inner = "  ".repeat(indent + 1);
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value == null) return '""';
    if (Array.isArray(value)) {
      if (!value.length) return "[]";
      return "[\n" + value.map((item) => inner + toJs(item, indent + 1)).join(",\n") + "\n" + pad + "]";
    }
    if (typeof value === "object") {
      const keys = Object.keys(value);
      if (!keys.length) return "{}";
      return "{\n" + keys.map((key) => {
        const printed = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : JSON.stringify(key);
        return inner + printed + ": " + toJs(value[key], indent + 1);
      }).join(",\n") + "\n" + pad + "}";
    }
    return JSON.stringify(value);
  }

  function generateContentJs() {
    const content = clone(state.CONTENT);
    (content.projects || []).forEach((project) => {
      project.folder = String(project.folder || "");
      project.tools = (project.tools || []).map((name) => String(name || "").trim()).filter(Boolean);
      project.skills = (project.skills || []).filter(Boolean);
      project.images = (project.images || []).map(asImagePair).filter((pair) => pair.en || pair.de);
      delete project.image;
    });
    return (
      HEADER +
      "\nconst SITE = " + toJs(state.SITE, 0) + ";\n\n" +
      "const SHARED = " + toJs(state.SHARED, 0) + ";\n\n" +
      "const UI = " + toJs(state.UI, 0) + ";\n\n" +
      "const CONTENT = " + toJs(content, 0) + ";\n"
    );
  }

  async function saveFile() {
    const text = generateContentJs();
    if (!isStudio()) {
      status("Run start-editor, then Save in that window. This page cannot update the project.", "warn");
      return;
    }
    status("Saving…");
    try {
      const response = await fetch("/save-content", {
        method: "POST",
        headers: { "Content-Type": "text/javascript;charset=utf-8" },
        body: text
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || response.statusText || "Save failed");
      }
      setDirty(false);
      status("Saved content.js in this project. Click Preview, then commit and push when you are happy.", "ok");
    } catch (error) {
      status("Could not save: " + (error && error.message ? error.message : "unknown error"), "error");
    }
  }

  function emptyEntry() {
    return {
      role: emptyLoc(),
      org: emptyLoc(),
      dates: emptyLoc(),
      bullets: [emptyLoc()]
    };
  }

  function restoreScroll(fn) {
    const y = window.scrollY;
    fn();
    window.scrollTo(0, y);
  }

  editView.addEventListener("input", (event) => {
    const path = event.target.getAttribute("data-path");
    if (!path) return;
    assign(path, event.target.value);
    if (path === "SHARED.contact.email") {
      const linkPath = "SHARED.contact.emailLink";
      const currentLink = state.SHARED.contact.emailLink || "";
      if (!currentLink || currentLink.indexOf("mailto:") === 0) {
        const next = "mailto:" + event.target.value;
        assign(linkPath, next);
        const linkInput = editView.querySelector('[data-path="SHARED.contact.emailLink"]');
        if (linkInput) linkInput.value = next;
      }
    }
    setDirty(true);
    status("Unsaved changes");
  });

  editView.addEventListener("change", (event) => {
    if (event.target.getAttribute("data-action") === "pick-images") {
      const index = Number(event.target.getAttribute("data-index"));
      const files = event.target.files;
      event.target.value = "";
      uploadImages(index, files);
      return;
    }
    const path = event.target.getAttribute("data-path");
    if (!path || event.target.tagName !== "SELECT") return;
    assign(path, event.target.value);
    setDirty(true);
    status("Unsaved changes");
  });

  editView.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const input = event.target.closest("[data-tool-input]");
    if (!input) return;
    event.preventDefault();
    const index = Number(input.getAttribute("data-tool-input"));
    if (!addProjectTool(index, input.value)) return;
    setDirty(true);
    status("Unsaved changes");
    restoreScroll(renderEdit);
  });

  editView.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.getAttribute("data-action");
    const index = Number(button.getAttribute("data-index"));
    const kind = button.getAttribute("data-kind");

    if (action === "pick-symbol") {
      const symbol = button.getAttribute("data-symbol");
      if (!state.CONTENT.skills[index]) return;
      state.CONTENT.skills[index].symbol = symbol;
      const picker = button.closest(".symbol-picker");
      if (picker) {
        picker.querySelectorAll(".symbol-option").forEach((option) => {
          option.setAttribute("aria-pressed", option === button ? "true" : "false");
        });
      }
      setDirty(true);
      status("Unsaved changes");
      return;
    }

    if (action === "add-skill") {
      state.CONTENT.skills.push({ symbol: nextSymbol(), label: emptyLoc(), detail: emptyLoc() });
    } else if (action === "remove-skill") {
      state.CONTENT.skills.splice(index, 1);
    } else if (action === "add-project") {
      state.CONTENT.projects.push({
        folder: nextFolder(),
        tools: [],
        skills: [],
        images: [],
        title: emptyLoc(),
        tag: emptyLoc(),
        description: emptyLoc()
      });
    } else if (action === "remove-project") {
      state.CONTENT.projects.splice(index, 1);
    } else if (action === "move-project") {
      const delta = Number(button.getAttribute("data-delta"));
      const list = state.CONTENT.projects;
      const next = index + delta;
      if (next < 0 || next >= list.length) return;
      const [item] = list.splice(index, 1);
      list.splice(next, 0, item);
    } else if (action === "add-tool") {
      if (!addProjectTool(index, button.getAttribute("data-name"))) return;
    } else if (action === "add-tool-custom") {
      const input = editView.querySelector('[data-tool-input="' + index + '"]');
      if (!addProjectTool(index, input && input.value)) return;
    } else if (action === "remove-tool") {
      const project = state.CONTENT.projects[index];
      const toolIndex = Number(button.getAttribute("data-tool"));
      if (!project || !Array.isArray(project.tools)) return;
      project.tools.splice(toolIndex, 1);
    } else if (action === "toggle-project-skill") {
      const project = state.CONTENT.projects[index];
      const symbol = button.getAttribute("data-symbol");
      if (!project || !symbol) return;
      if (!Array.isArray(project.skills)) project.skills = [];
      const at = project.skills.indexOf(symbol);
      if (at === -1) project.skills.push(symbol);
      else project.skills.splice(at, 1);
    } else if (action === "cover-image") {
      const project = state.CONTENT.projects[index];
      const imageIndex = Number(button.getAttribute("data-image"));
      if (!project || imageIndex <= 0) return;
      const images = projectImagePairs(project);
      const [item] = images.splice(imageIndex, 1);
      images.unshift(item);
      project.images = images;
    } else if (action === "move-image") {
      const project = state.CONTENT.projects[index];
      const imageIndex = Number(button.getAttribute("data-image"));
      const delta = Number(button.getAttribute("data-delta"));
      if (!project) return;
      const images = projectImagePairs(project);
      const next = imageIndex + delta;
      if (next < 0 || next >= images.length) return;
      const [item] = images.splice(imageIndex, 1);
      images.splice(next, 0, item);
      project.images = images;
    } else if (action === "scan-images") {
      syncFolderImages().then((changed) => {
        if (changed) restoreScroll(renderEdit);
        else status("No new photos in that folder.");
      });
      return;
    } else if (action === "remove-image") {
      removeProjectImage(index, Number(button.getAttribute("data-image")));
      return;
    } else if (action === "pick-images") {
      return;
    } else if (action === "add-education") {
      state.CONTENT.education.push(emptyEntry());
    } else if (action === "remove-education") {
      state.CONTENT.education.splice(index, 1);
    } else if (action === "add-experience") {
      state.CONTENT.experience.push(emptyEntry());
    } else if (action === "remove-experience") {
      state.CONTENT.experience.splice(index, 1);
    } else if (action === "add-bullet") {
      state.CONTENT[kind][index].bullets.push(emptyLoc());
    } else if (action === "remove-bullet") {
      const bulletIndex = Number(button.getAttribute("data-bullet"));
      state.CONTENT[kind][index].bullets.splice(bulletIndex, 1);
    } else {
      return;
    }

    setDirty(true);
    status("Unsaved changes");
    restoreScroll(renderEdit);
  });

  editView.addEventListener("dragover", (event) => {
    const drop = event.target.closest("[data-image-drop]");
    if (!drop || !isStudio()) return;
    event.preventDefault();
    drop.classList.add("is-drop");
  });

  editView.addEventListener("dragleave", (event) => {
    const drop = event.target.closest("[data-image-drop]");
    if (!drop) return;
    if (drop.contains(event.relatedTarget)) return;
    drop.classList.remove("is-drop");
  });

  editView.addEventListener("drop", (event) => {
    const drop = event.target.closest("[data-image-drop]");
    if (!drop || !isStudio()) return;
    event.preventDefault();
    drop.classList.remove("is-drop");
    uploadImages(Number(drop.getAttribute("data-image-drop")), event.dataTransfer.files);
  });

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = button.getAttribute("data-tab");
      document.querySelectorAll("[data-tab]").forEach((tab) => {
        const on = tab === button;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      editView.hidden = activeTab !== "edit";
      overviewView.hidden = activeTab !== "overview";
      if (activeTab === "overview") renderOverview();
    });
  });

  document.getElementById("save-content").addEventListener("click", () => {
    saveFile();
  });

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  const kicker = document.getElementById("editor-kicker");
  if (isStudio()) {
    if (kicker) kicker.textContent = "Saving writes content.js in this project folder";
    status("Ready. Save writes this project’s content.js.");
    syncFolderImages({ quiet: true }).then(() => renderEdit());
  } else {
    document.body.classList.add("editor-not-studio");
    if (kicker) kicker.textContent = "Not the local studio";
    status("Run start-editor.bat (Windows) or start-editor.sh (Mac/Linux), then work in the window it opens.", "warn");
    renderEdit();
  }
})();
