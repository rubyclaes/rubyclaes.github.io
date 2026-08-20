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

   Easiest way to edit: open editor.html, then Save over this file.

   You can still edit this file directly. Rules:
   - Keep quote marks around every piece of text.
   - Keep commas between entries.
   - Translated fields look like:  { en: "English", de: "Deutsch" }
   - SHARED is language-independent (name, email, LinkedIn).
   - Project photos: images/portfolio/1/file.jpg (one numbered folder per project).
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

  (state.CONTENT.projects || []).forEach((project) => {
    const images = [];
    if (Array.isArray(project.images)) {
      project.images.forEach((src) => images.push(String(src || "")));
    }
    if (project.image && images.indexOf(project.image) === -1) {
      images.unshift(String(project.image));
    }
    project.images = images.length ? images : [""];
    delete project.image;
  });

  let dirty = false;
  let fileHandle = null;
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

  function status(message) {
    statusEl.textContent = message || "";
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
    return `${tag}<div class="lang-grid">${langs()
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
        <p class="editor-help">Shown as cards on the homepage only. For <strong>Project N</strong>, put files in <code>images/portfolio/N/</code> (not <code>images/docs</code>), then list each path below. The first image is the card; extra images open in the gallery.</p>
        <p class="editor-help">Cards stay <strong>4:3</strong> and zoom to fill that frame (edges of a very tall or wide photo may be cropped on the card). Click to see the full image in the gallery. Use a sharp file at least 1600px on the long side (JPG, PNG or WebP).</p>
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

  function projectImageList(project) {
    const images = [];
    if (Array.isArray(project.images)) {
      project.images.forEach((src) => images.push(String(src || "")));
    }
    if (project.image && images.indexOf(project.image) === -1) {
      images.unshift(String(project.image));
    }
    return images.length ? images : [""];
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
      if (label) label.textContent = "Not found";
    };
    if (!value) {
      img.removeAttribute("src");
      box.classList.add("is-empty");
      if (label) label.textContent = "No path";
      return;
    }
    if (label) label.textContent = "Not found";
    img.src = value;
  }

  function bindImagePreviews() {
    editView.querySelectorAll(".editor-image-row").forEach((row) => {
      const input = row.querySelector("input[data-path]");
      const box = row.querySelector("[data-image-preview]");
      if (input && box) syncImagePreview(box, input.value);
    });
  }

  function renderProject(project, index) {
    const folder = `images/portfolio/${index + 1}/`;
    const images = projectImageList(project);
    const imageRows = images
      .map((src, imageIndex) => {
        const cover = imageIndex === 0 ? " · cover" : "";
        return `<div class="editor-image-row">
          <div class="editor-image-preview is-empty" data-image-preview aria-hidden="true">
            <img alt="">
            <span class="editor-image-preview-label">No path</span>
          </div>
          <label class="field">
            <span class="field-label">Image ${imageIndex + 1}${cover}</span>
            <input type="text" data-path="CONTENT.projects.${index}.images.${imageIndex}" value="${esc(src)}" placeholder="${esc(folder + (index === 0 && imageIndex === 0 ? "example1a.png" : "example.jpg"))}">
          </label>
          ${binButton("remove-image", `data-index="${index}" data-image="${imageIndex}"`, "Remove image")}
        </div>`;
      })
      .join("");
    return `<article class="editor-card" data-list="projects" data-index="${index}">
      <div class="editor-card-head">
        <strong>Project ${index + 1}</strong>
        ${binButton("remove-project", `data-index="${index}"`, "Remove project")}
      </div>
      <p class="editor-sub">Images</p>
      <p class="editor-help">Put files in <code>${esc(folder)}</code>. First path is the homepage card.</p>
      ${imageRows}
      <div class="editor-row-actions">
        <button type="button" class="ghost" data-action="add-image" data-index="${index}">+ Add image</button>
      </div>
      ${locFields("CONTENT.projects." + index + ".title", project.title, { label: "Title" })}
      ${locFields("CONTENT.projects." + index + ".tag", project.tag, { label: "Tag" })}
      ${locFields("CONTENT.projects." + index + ".description", project.description, { label: "Description", multiline: true })}
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
      project.images = (project.images || [])
        .map((src) => String(src || "").trim())
        .filter(Boolean);
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

  function downloadFile() {
    const text = generateContentJs();
    const blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "content.js";
    link.click();
    URL.revokeObjectURL(url);
    setDirty(false);
    status("Downloaded content.js. Put it in this project folder (replace the old file), then Preview.");
  }

  async function saveFile() {
    const text = generateContentJs();
    if (!window.showSaveFilePicker) {
      downloadFile();
      return;
    }
    try {
      if (!fileHandle) {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: "content.js",
          types: [
            {
              description: "JavaScript",
              accept: { "text/javascript": [".js"], "text/plain": [".js"] }
            }
          ]
        });
      }
      const writable = await fileHandle.createWritable();
      await writable.write(text);
      await writable.close();
      setDirty(false);
      status("Saved content.js. Refresh the portfolio to see changes.");
    } catch (error) {
      if (error && error.name === "AbortError") return;
      downloadFile();
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
    if (/\.images\.\d+$/.test(path)) {
      const row = event.target.closest(".editor-image-row");
      if (row) syncImagePreview(row.querySelector("[data-image-preview]"), event.target.value);
    }
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
    const path = event.target.getAttribute("data-path");
    if (!path || event.target.tagName !== "SELECT") return;
    assign(path, event.target.value);
    setDirty(true);
    status("Unsaved changes");
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
        images: [""],
        title: emptyLoc(),
        tag: emptyLoc(),
        description: emptyLoc()
      });
    } else if (action === "remove-project") {
      state.CONTENT.projects.splice(index, 1);
    } else if (action === "add-image") {
      const project = state.CONTENT.projects[index];
      if (!project) return;
      if (!Array.isArray(project.images)) project.images = [""];
      project.images.push("");
    } else if (action === "remove-image") {
      const project = state.CONTENT.projects[index];
      const imageIndex = Number(button.getAttribute("data-image"));
      if (!project || !Array.isArray(project.images)) return;
      project.images.splice(imageIndex, 1);
      if (!project.images.length) project.images.push("");
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

  renderEdit();
})();
