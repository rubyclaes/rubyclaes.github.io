# Ruby Claes Portfolio Site

A bilingual (English / German) portfolio and CV. The live site is [rubyclaes.github.io](https://rubyclaes.github.io/).

You do not need to write code. There is no build step.

**First time:** install the tools and clone a copy (prerequisites below).

**After that, the usual loop is:** **pull → start the content studio → edit and Save → Preview → commit and push.** GitHub then updates the live site (about 30–90 seconds).

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

**File → Open Folder…** and pick `rubyclaes.github.io`. You should see files like `index.html`, `start-editor.bat`, `content.js`, and a folder called `images`.

---

## Update the site

Do these steps whenever you change text, projects, or photos.

### 1. Always pull before you edit

*Pull* means: download any newer changes from GitHub first, so you do not overwrite someone else’s work (or your own work from another computer).

1. Click the **Source Control** icon in the left sidebar (or press **Ctrl+Shift+G**).
2. Click **⋯** (More Actions) at the top of that panel.
3. Click **Pull**.

If it says you are already up to date, that is fine — continue.

### 2. Start the content studio

This is only a preview on your computer. Visitors still see the live site until you push (step 5).

Keep the black terminal window open while you edit. Close it when you are finished.

**Windows**

1. In VS Code’s file list, right-click `start-editor.bat`.
2. Click **Reveal in File Explorer**.
3. Double-click `start-editor.bat`.
4. If Windows asks, allow it to run. Your browser should open the content studio.

You can also run **Terminal → Run Task… → Start content studio** in VS Code.

**Mac or Linux**

1. In VS Code, open the Terminal (**Terminal → New Terminal**).
2. Type `./start-editor.sh` and press Enter. The `./` at the front matters — do not type `. start-editor.sh`.
3. Your browser should open the content studio.

Python 3 is already present on most Mac and Linux computers. If the script says it is missing, install Python from [python.org](https://www.python.org/downloads/).

Do **not** double-click `editor.html` or `index.html`, and do not use the VS Code preview tab. Save only works in the window the starter opens (`http://127.0.0.1:…`).

### 3. Edit text, then Preview

1. Pull first (step 1) and start the studio (step 2).
2. Edit English and German side by side. Coloured tags show whether a field is on the **Portfolio**, the **CV**, both, or only site labels.
3. Click **Save**. That overwrites `content.js` in this project folder. You should see a short “Saved” note in the header.
4. Click **Preview**. That opens the portfolio from the same local studio. Refresh with **F5** if the tab was already open.

![Content studio with English and German side by side, page tags, Preview, and Save](./images/docs/content-editor.png)

This page is a private editing tool. It is not linked from the public site.

You can still edit `content.js` by hand in VS Code if you need to. Translated fields look like `{ en: "English", de: "Deutsch" }`. Keep the quotes and commas.

### 4. Projects and photos

Homepage order is the project list in the studio. Use **Move up** / **Move down** to change it. Each project keeps a numbered folder such as `images/portfolio/4/` even if that card is first on the page. Do not rename folders to reorder cards. Do not put project photos in `images/docs`.

Write a short **summary** in three beats: the question, the method, what the map shows.

In the content studio, on that project:

1. Click **Add photos** (or drop files onto the photo area). The studio copies them into that project’s folder.
2. Gallery order is top to bottom. **Move up** / **Move down** swap a figure with its neighbour. The first figure is the homepage card; **Use as cover** jumps any figure to first.
3. **Remove** deletes that figure (both language files, if you have a pair).
4. If you copied files in with File Explorer or VS Code, click **Scan folder**.

**English and German maps:** put both in the same folder. `coast.en.jpg` and `coast.de.jpg` are one figure (the site picks the language). A file with no `.en` / `.de` in the name is used in both languages until you add a twin. Add a caption under each figure.

Allowed types: `.jpg`, `.jpeg`, `.png`, `.webp`. Prefer a sharp file at least **1600px on the long side**. Homepage cards stay **4:3** and show the **whole sheet** (nothing cropped). Click a card to zoom.

Then click **Save**, then **Preview**. Git will show the new files under `images/portfolio` plus `content.js`.

### 5. Publish: commit and push in VS Code

*Commit* means: snapshot your changes with a short note.  
*Push* (also called **Sync Changes**) means: send that snapshot to GitHub. That is what updates [rubyclaes.github.io](https://rubyclaes.github.io/).

1. Pull one more time (**⋯ → Pull**) if you have not just done it.
2. Open **Source Control** (**Ctrl+Shift+G**).
3. Under **Changes** you should see files you touched, often `content.js` (and sometimes `index.html` / `cv.html` after Save), plus new files in `images/portfolio`.
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
| The studio says it is “not the local studio” | Close that tab. Start `start-editor.bat` or `start-editor.sh` and use the window it opens. |
| Double-clicking `start-editor.bat` does nothing | In VS Code: **Terminal → Run Task… → Start content studio**. Or install [Python](https://www.python.org/downloads/) (tick **Add python.exe to PATH**) and try the `.bat` again. |
| Photo missing on the site | In the studio, open that project and click **Scan folder**, or **Add photos**. Confirm the file is in that project’s folder (`images/portfolio/4/` stays `4` even if the card moved). |
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
|- start-editor.bat    Windows: double-click to open the content studio
|- start-editor.sh     Mac/Linux: run this in a terminal
|- index.html          Portfolio page
|- cv.html             Full CV
|- editor.html         Content studio (local only)
|- content.js          All editable text — this is what Save updates
|- symbols.js          Skill legend icons
|- script.js / theme.js / styles.css
|- tools/              Helper that lets Save write content.js
|- images/             Site images
|- images/portfolio/   One numbered folder per project (1, 2, 3, …). Numbers stay put if you reorder cards.
|- images/docs/        Screenshots for this README only
|- icons/              Favicons
```
