# Ruby Claes Portfolio Site

Static portfolio + CV website with a map-inspired visual style.

## Current project structure

```
.
|- index.html
|- cv.html
|- content.js
|- script.js
|- theme.js
|- styles.css
|- README.md
|- icons/
|  |- browserconfig.xml
|  |- manifest.json
|  |- *.png, favicon.ico
|- images/
|  |- (project images go here)
```

## How the site is wired

- content.js: single source of editable content in CV_DATA (name, profile text, skills, projects, education, experience, languages, availability).
- script.js: reads CV_DATA and renders both pages.
	- Detects homepage vs CV page.
	- Builds project cards.
	- Shows placeholder if an image path is empty or missing.
- theme.js: injects the light/dark mode toggle and stores the choice in localStorage.
- styles.css: full styling for layout, responsive behavior, dark mode, and CV print/PDF mode.
- index.html: portfolio landing page (profile, skills, projects).
- cv.html: full CV page and PDF export trigger (window.print).
- icons/: favicon and device icon assets used by both HTML files.
- images/: project image files referenced from content.js.

## What you usually edit

Most updates happen in content.js.

- Update text fields directly in CV_DATA.
- Add list items (skills, projects, education, experience) by copying a full object block and editing values.
- Keep quotes and commas valid so JavaScript parsing does not break.

## Update an existing project image

1. Put the replacement file in images/ (you can overwrite the old file name, or use a new file name).
2. In content.js, find the project entry in CV_DATA.projects.
3. Set image to the relative path, for example: image: "images/my-project.jpg".
4. Refresh the page and verify the card image loads.

If the path is wrong, the card shows an "Image not found" placeholder.

## Add a new project image

1. Add the image file to images/.
2. Add or edit a project object in CV_DATA.projects in content.js.
3. Set image to the file path from the repo root, for example:

```js
{
	title: "Coastal Hazard Map",
	tag: "Coursework - QGIS",
	description: "Short summary of the question, data, workflow, and result.",
	image: "images/coastal-hazard-map.jpg"
}
```

4. Save and reload index.html.

## Image guidelines

- Preferred card ratio: 4:3 (CSS uses aspect-ratio: 4 / 3).
- The card image uses object-fit: cover, so very tall/wide images will be cropped.
- Use clear lowercase file names with hyphens, for example: flood-risk-brisbane-2026.jpg.
- Common formats: .jpg, .jpeg, .png, .webp.

## CV PDF export

Open cv.html and click Download CV (PDF). The print stylesheet removes navigation/decorative UI and optimizes output for clean A4 export.

## Run locally

No build step is required.

- Quick open: open index.html in a browser.
- Local server option:

```powershell
npx serve .
```

## Git workflow and GitHub Pages update

Use this flow to publish site updates to GitHub Pages.

1. Clone the repository (first time only):

```powershell
git clone https://github.com/rubyclaes/rubyclaes.github.io.git
cd rubyclaes.github.io
git remote -v
```

2. Pull the latest changes before editing:

```powershell
git pull origin main
```

3. Make your edits (for example in content.js, images/, styles.css).

4. Stage and commit your changes:

```powershell
git status
git add .
git commit -m "Update portfolio content"
```

5. Push to GitHub (this triggers GitHub Pages update):

```powershell
git push origin main
```

6. Verify the live site:

- Open https://rubyclaes.github.io/
- Wait about 30 to 90 seconds after push.
- Hard refresh the browser (Ctrl+F5) if the old version is cached.
