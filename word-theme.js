/* ==========================================================================
   Word CV template — tweak this file, then download Word again.

   The website look lives in styles.css. Word cannot load those webfonts or
   the contour drawing, so this file is the closest map-sheet version Word
   can actually open. Colours match the light CV sheet.

   Fonts: Georgia / Calibri / Consolas are on almost every PC. If Fraunces,
   Work Sans, or JetBrains Mono are installed, you can put those names here.
   Use hex colours with or without #.
   ========================================================================== */

const WORD_THEME = {
  colors: {
    sheet: "#FFFFFF",
    ink: "#22303A",
    muted: "#5B6660",
    line: "#C7CBB2",
    contourGreen: "#4F7A5B",
    accent: "#C1560B",
    symbolAccent: "#B08A4A"
  },

  fonts: {
    display: "Georgia",
    body: "Calibri",
    mono: "Consolas"
  },

  // Point sizes. The website name is larger on screen; 26pt still fits A4.
  sizes: {
    eyebrow: 9,
    name: 26,
    tagline: 9,
    contact: 9,
    citizenship: 9,
    section: 16,
    sectionTick: 10,
    body: 11,
    role: 11,
    dates: 9,
    org: 10.5,
    bullet: 10.5,
    skillLabel: 8.5,
    skillDetail: 10
  },

  page: {
    // A4, close to the print CV margins (1.3cm / 1.1cm).
    widthTwips: 11906,
    heightTwips: 16838,
    marginTop: 737,
    marginRight: 624,
    marginBottom: 737,
    marginLeft: 624,
    border: false,
    borderSize: 8,
    borderSpace: 14
  }
};
