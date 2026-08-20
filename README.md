# Ruby Claes Portfolio Site

A bilingual (English / German) portfolio and CV. The live site is [rubyclaes.github.io](https://rubyclaes.github.io/).

You do not need to write code. There is no build step and no local server.

**First time:** install the tools and clone a copy (prerequisites below).

**After that, the usual loop is:** **pull → edit in the content studio → check it in the browser → commit and push.** GitHub then updates the live site (about 30–90 seconds).

---

## Prerequisites (once)

### Install the tools

You need two programs:

1. **[Visual Studio Code](https://code.visualstudio.com/)** (often called VS Code) — where you open the project, add photos, and publish.
2. **[GitHub Desktop](https://desktop.github.com/)** — the GitHub app for Windows. It includes **Git** (the tool VS Code uses to copy and publish the site). Sign in with the GitHub account that owns this website.

Accept the install defaults. When both are installed, **quit and reopen VS Code** (or restart Windows) so VS Code can find Git.

### Clone the website

*Clone* means: download a full copy of the website onto your computer. Sign in to GitHub in VS Code first (or when VS Code asks, during clone).

1. In VS Code, click the **Source Control** icon in the left sidebar (the Y-shaped branch).
2. If a window says **The extension 'GitHub' wants to sign in using GitHub**, click **Allow** and finish in the browser.  
   You can also click the **Accounts** icon (person silhouette, bottom-left) → **Sign in with GitHub**.
3. Click **Clone Repository**.
4. In the box at the top, type `rubyclaes/rubyclaes.github.io` and select it.  
   You can also paste the full address: `https://github.com/rubyclaes/rubyclaes.github.io.git`
5. Choose a folder you can find again, for example **Documents**.
6. When VS Code asks **Would you like to open the cloned repository?**, click **Open**.

You need the GitHub sign-in so **Clone**, **Pull**, and **Push** work without extra password prompts.

![VS Code Source Control with Clone Repository, and a dialog asking to allow GitHub sign-in](./images/docs/github-account.png)

The folder on disk is named `rubyclaes.github.io`. You only clone once.

![VS Code clone search box listing GitHub repositories](./images/docs/github-repo-dropdown.png)

The search box looks like the screenshot. Use **`rubyclaes/rubyclaes.github.io`**, not another repository from the list.

### Next time you sit down to edit

**File → Open Folder…** and pick `rubyclaes.github.io`. You should see files like `index.html`, `editor.html`, `content.js`, and a folder called `images`.

---

## Update the site

Do these steps whenever you change text, projects, or photos.

### 1. Always pull before you edit

*Pull* means: download any newer changes from GitHub first, so you do not overwrite someone else’s work (or your own work from another computer).

1. Click the **Source Control** icon in the left sidebar (or press **Ctrl+Shift+G**).
2. Click **⋯** (More Actions) at the top of that panel.
3. Click **Pull**.

If it says you are already up to date, that is fine — continue.

### 2. View the site on your computer

This is only a preview on your PC. Visitors still see the live site until you push (step 5).

Use **Chrome** or **Edge** (not the VS Code preview tab).

1. In VS Code’s file list on the left, right-click `index.html`.
2. Click **Reveal in File Explorer**.
3. Double-click `index.html` so it opens in Chrome or Edge.

| File | What you see |
| --- | --- |
| `index.html` | Portfolio (home page) |
| `cv.html` | Full CV |
| `editor.html` | Private content studio (not on the public site) |

After you save edits, go back to the browser tab and press **F5** to refresh. If the page looks stuck on an old version, press **Ctrl+F5**.

You can also click **Preview** in the content studio. That opens the portfolio in a new tab.

### 3. Edit text (content studio)

1. Pull first (step 1).
2. Right-click `editor.html` → **Reveal in File Explorer** → open it in **Chrome or Edge**.
3. Edit English and German side by side. Coloured tags show whether a field is on the **Portfolio**, the **CV**, both, or only site labels.
4. Click **Save**. The first time, the browser asks which file to use — choose the `content.js` that is already in the `rubyclaes.github.io` folder. Allow the permission if Chrome/Edge asks.
5. Click **Preview** (or refresh `index.html` / `cv.html`) to check the result.

![Content studio with English and German side by side, page tags, Preview, and Save](./images/docs/content-editor.png)

This page is a private editing tool. It is not linked from the public site.

**If Save downloads a file instead of updating the project:** drag that file into the VS Code file list and replace the existing `content.js` (confirm overwrite).

You can still edit `content.js` by hand in VS Code if you need to. Translated fields look like `{ en: "English", de: "Deutsch" }`. Keep the quotes and commas.

### 4. Where to put photos

**Project pictures** go in a numbered folder under **`images/portfolio/`**. Do not put them in `images/docs` (that folder is only for this guide).

1. For **Project 1**, copy files into `images/portfolio/1`. Project 2 uses `images/portfolio/2`, and so on. In VS Code you can drag files from File Explorer onto that folder.
2. Use a simple name: lowercase letters, hyphens, no spaces. Example: `flood-risk-overview.jpg`.
3. Allowed types: `.jpg`, `.jpeg`, `.png`, `.webp`.
4. In the content studio, on that project, add an **Image** row for each file. The path must match the file, e.g. `images/portfolio/1/flood-risk-overview.jpg`.
5. The **first** image is the homepage card. Extra images open in the gallery (count badge on the card, then arrows / thumbnails).

Tips:

- Prefer a sharp file at least **1600px on the long side** so zoom stays crisp.
- Homepage cards stay **4:3** and zoom to fill that frame. A very tall or wide photo is cropped on the card; click to see the full picture in the gallery. A true 4:3 photo (for example 1600×1200) fills the card with nothing cut off.
- The site cannot see files sitting in the folder until you list them in the content studio.
- A wrong path shows an “Image not found” box, not a broken page.

### 5. Publish: commit and push in VS Code

*Commit* means: snapshot your changes with a short note.  
*Push* (also called **Sync Changes**) means: send that snapshot to GitHub. That is what updates [rubyclaes.github.io](https://rubyclaes.github.io/).

1. Pull one more time (**⋯ → Pull**) if you have not just done it.
2. Open **Source Control** (**Ctrl+Shift+G**).
3. Under **Changes** you should see files you touched, often `content.js` and new files in `images/portfolio`.
4. Click **+** next to **Changes** (or next to each file) to **stage** them. Staged files are the ones included in this snapshot.
5. At the top of the Source Control panel, type a short message, for example `Update portfolio profile`.
6. Click **Commit**. (If VS Code asks you to confirm Git, follow the prompt.)
7. Click **Sync Changes** (or **Push**) to send the update to GitHub.

Wait about **30–90 seconds**, then open [https://rubyclaes.github.io/](https://rubyclaes.github.io/). If you still see the old version, press **Ctrl+F5**.

---

## If something goes wrong

### VS Code still says Git is missing

GitHub Desktop includes Git for itself. VS Code sometimes still wants Git on Windows separately:

1. Install [Git for Windows](https://git-scm.com/download/win).
2. Click **Next** through the setup (defaults are fine).
3. Close VS Code completely and open it again.

| What you see | What to try |
| --- | --- |
| Clone or push asks you to log in | Sign in with GitHub (Allow the dialog, or the VS Code Accounts icon, or GitHub Desktop). |
| **Push** is rejected / “pull first” | **⋯ → Pull**, then **Sync Changes** again. |
| Save in the editor downloaded `content.js` | Drop that file onto the project in VS Code and replace the old `content.js`. |
| Photo missing on the site | Check the file is inside `images/portfolio/N/` (not `images/docs/`) and that the same path is listed in the content studio. |
| Live site looks old | Wait a minute, then **Ctrl+F5**. Confirm you clicked **Sync Changes**, not only **Commit**. |
| You edited on two computers | Always **Pull** before you start. |

---

## Language

The globe control switches **English** / **Deutsch** on the whole site, including the CV PDF.

- English is Australian English; German is written for a DACH reader (not the Australia move story).
- The visitor’s language and light/dark choice are remembered in the browser.
- First visit: German if the browser or timezone looks German-speaking (Germany, Austria, Switzerland, Liechtenstein); otherwise English.

---

## CV PDF

Open `cv.html`, pick English or Deutsch, then **Download**. That uses the browser print dialog to save a PDF of the language on screen.

---

## Files (you can skip this)

```
.
|- index.html          Portfolio page
|- cv.html             Full CV
|- editor.html         Content studio (local only)
|- content.js          All editable text — this is what Save updates
|- symbols.js          Skill legend icons
|- script.js / theme.js / styles.css
|- images/             Site images
|- images/portfolio/   One numbered folder per project (1, 2, 3, …)
|- images/docs/        Screenshots for this README only
|- icons/              Favicons
```
