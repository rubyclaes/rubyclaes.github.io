/* ==========================================================================
   Site content — English + German.

   Easiest way to edit: open editor.html, then Save over this file.

   You can still edit this file directly. Rules:
   - Keep quote marks around every piece of text.
   - Keep commas between entries.
   - Translated fields look like:  { en: "English", de: "Deutsch" }
   - SHARED is language-independent (name, email, LinkedIn, image paths).
   - Leave de: "" if you have not translated yet — the site falls back to English.
   ========================================================================== */

const SITE = {
  defaultLang: "en",
  languages: [
    { code: "en", label: "English", locale: "en-AU" },
    { code: "de", label: "Deutsch", locale: "de" }
  ]
};

const SHARED = {
  name: "Ruby Claes",
  contact: {
    email: "ruby.claes@gmail.com",
    emailLink: "mailto:ruby.claes@gmail.com",
    linkedin: "https://www.linkedin.com/in/rubyclaes",
    phone: ""
  }
};

const UI = {
  portfolioEyebrow: { en: "Portfolio", de: "Portfolio" },
  fullCvEyebrow: { en: "Full CV", de: "Lebenslauf" },
  profile: { en: "Profile", de: "Profil" },
  skills: { en: "Skills", de: "Kompetenzen" },
  navProjects: { en: "Projects", de: "Projekte" },
  projects: { en: "Mapped Projects", de: "Kartierte Projekte" },
  projectsHint: {
    en: "Highlight reel. See {cv} for more context.",
    de: "Auswahl aktueller Arbeiten. Mehr Kontext im {cv}."
  },
  cvLink: { en: "full CV", de: "Lebenslauf" },
  fullCv: { en: "Full CV", de: "Lebenslauf" },
  fullCvShort: { en: "CV", de: "CV" },
  backToPortfolio: { en: "Back to Portfolio", de: "Zurück zum Portfolio" },
  download: { en: "Download", de: "Herunterladen" },
  downloadAria: { en: "Download CV PDF", de: "Lebenslauf als PDF herunterladen" },
  education: { en: "Education", de: "Ausbildung" },
  experience: { en: "Field Experience", de: "Berufserfahrung" },
  languages: { en: "Languages", de: "Sprachen" },
  scale: { en: "Scale", de: "Maßstab" },
  scaleCaption: { en: "Entry-level → Field-ready", de: "Einstieg → praxistauglich" },
  availabilityLabel: { en: "Availability", de: "Verfügbarkeit" },
  linkedin: { en: "LinkedIn", de: "LinkedIn" },
  addImage: { en: "+ Add an image\n(see editor.html)", de: "+ Bild hinzufügen\n(siehe editor.html)" },
  imageNotFound: { en: "Image not found:", de: "Bild nicht gefunden:" },
  themeToggle: { en: "Toggle dark mode", de: "Hell-/Dunkelmodus umschalten" },
  langSwitcher: { en: "Language", de: "Sprache" }
};

const CONTENT = {
  tagline: {
    en: "Cartography · GIS · Spatial Analysis",
    de: "Kartographie · GIS · Raumanalyse"
  },
  citizenship: {
    en: "Dual Australian & Belgian Citizen — Full Working Rights in Australia",
    de: "Doppelte Staatsbürgerschaft Australien und Belgien"
  },
  location: {
    en: "Essen, Germany",
    de: "Essen, Deutschland"
  },
  shortProfile: {
    en: "Applied Geography graduate (B.Sc., RWTH Aachen) passionate about GIS, cartography, and turning spatial data into clear, visually compelling maps. Dual Australian–Belgian citizen with full working rights in Australia. Eager to join an entry-level GIS/spatial role from early 2027, with particular interest in Brisbane and roles within commuting distance of the NSW Central Coast.",
    de: "Absolventin der Angewandten Geographie (B.Sc., RWTH Aachen) mit Leidenschaft für GIS, Kartographie und die Umsetzung räumlicher Daten in klare, visuell überzeugende Karten. Schließt derzeit ihr Studium an der RWTH Aachen ab und sucht ab Oktober 2026 ein Pflichtpraktikum im GIS- und Geodatenbereich, anschließend eine Einstiegsstelle ab Ende 2026 / Anfang 2027."
  },
  fullProfile: {
    en: "Enthusiastic Applied Geography graduate (B.Sc., RWTH Aachen University) with a genuine passion for GIS and cartography, and a particular love of turning raw spatial data into maps that are both factual and visually compelling. Keen to bring hands-on GIS skills, an analytical mindset and cross-cultural experience to an entry-level role in Australia's spatial industry, with particular interest in Brisbane and roles within commuting distance of the NSW Central Coast. Reliable, quick to pick up new tools, and excited to get started.",
    de: "Enthusiastische Absolventin der Angewandten Geographie (B.Sc., RWTH Aachen) mit echter Begeisterung für GIS und Kartographie — besonders dafür, aus räumlichen Rohdaten Karten zu machen, die sachlich und visuell überzeugend sind. Bringt praktische GIS-Kenntnisse, analytisches Denken und interkulturelle Erfahrung mit und sucht nach dem Pflichtpraktikum (ab Oktober 2026) und der Bachelorarbeit eine Einstiegsrolle in GIS, Kartographie oder räumlicher Analyse. Zuverlässig, lernbereit und motiviert, durchzustarten."
  },
  skills: [
    {
      symbol: "contour",
      label: { en: "GIS & Spatial Tools", de: "GIS & Geodaten-Tools" },
      detail: {
        en: "QGIS, spatial data analysis, cartographic design",
        de: "QGIS, räumliche Datenanalyse, kartographische Gestaltung"
      }
    },
    {
      symbol: "grid",
      label: { en: "Programming & Data", de: "Programmierung & Daten" },
      detail: { en: "Python and R (basic)", de: "Python und R (Grundkenntnisse)" }
    },
    {
      symbol: "dashed",
      label: { en: "Environmental Modelling", de: "Umweltmodellierung" },
      detail: { en: "ENVI-met (basic)", de: "ENVI-met (Grundkenntnisse)" }
    },
    {
      symbol: "leader",
      label: { en: "Design & Visualisation", de: "Design & Visualisierung" },
      detail: {
        en: "Inkscape, map layout and cartographic representation",
        de: "Inkscape, Kartenlayout und kartographische Darstellung"
      }
    },
    {
      symbol: "hatch",
      label: { en: "Productivity", de: "Produktivität" },
      detail: {
        en: "Microsoft Office (Word, Excel, PowerPoint)",
        de: "Microsoft Office (Word, Excel, PowerPoint)"
      }
    }
  ],
  projects: [
    {
      image: "",
      title: { en: "Add your first project", de: "Erstes Projekt eintragen" },
      tag: {
        en: "Project type, e.g. Coursework · QGIS",
        de: "Projektart, z. B. Lehrveranstaltung · QGIS"
      },
      description: {
        en: "Replace this text with a couple of sentences: what was the question, what data or tools did you use, and what did the final map show?",
        de: "Diesen Text durch ein paar Sätze ersetzen: Was war die Fragestellung, welche Daten oder Werkzeuge wurden genutzt, und was hat die fertige Karte gezeigt?"
      }
    },
    {
      image: "",
      title: { en: "Add your second project", de: "Zweites Projekt eintragen" },
      tag: {
        en: "Project type, e.g. Fieldwork · Cartography",
        de: "Projektart, z. B. Geländearbeit · Kartographie"
      },
      description: {
        en: "Same idea here — one project per card. It's fine to start with just one or two and add more later.",
        de: "Dasselbe hier — ein Projekt pro Karte. Ein oder zwei Einträge reichen zum Anfang; weitere können später dazukommen."
      }
    },
    {
      image: "",
      title: { en: "Bachelor thesis (in progress)", de: "Bachelorarbeit (in Arbeit)" },
      tag: { en: "RWTH Aachen · Geohazards", de: "RWTH Aachen · Georisiken" },
      description: {
        en: "Sedimentological Features of Palaeotsunamis in Greece. Update this once the thesis is finished — a key figure or map from it would make a strong final project card.",
        de: "Sedimentological Features of Palaeotsunamis in Greece. Nach Abschluss der Arbeit aktualisieren — eine zentrale Abbildung oder Karte eignet sich gut als Projektkarte."
      }
    }
  ],
  education: [
    {
      role: { en: "B.Sc. Applied Geography", de: "B.Sc. Angewandte Geographie" },
      org: {
        en: "RWTH Aachen University, Germany",
        de: "RWTH Aachen, Deutschland"
      },
      dates: { en: "Oct 2023 – Present", de: "Okt. 2023 – heute" },
      bullets: [
        {
          en: "Expected completion: late 2026",
          de: "Voraussichtlicher Abschluss: Ende 2026"
        },
        {
          en: "Focus areas: GIS, geospatial analysis, human & physical geography, urban geography and spatial planning; minor in Geosciences with an elective focus on Geohazards",
          de: "Schwerpunkte: GIS, Geodatenanalyse, Humangeographie und Physische Geographie, Stadtgeographie und Raumplanung; Nebenfach Geowissenschaften mit Wahlfokus Georisiken"
        },
        {
          en: "Project work: urban development analysis using GIS software",
          de: "Projektarbeit: städtebauliche Analyse mit GIS-Software"
        },
        {
          en: "Currently completing final exams, ahead of thesis and a mandatory industry internship from October 2026",
          de: "Derzeit Abschlussprüfungen, danach Bachelorarbeit und Pflichtpraktikum in der Industrie ab Oktober 2026"
        },
        {
          en: "Bachelor thesis: Sedimentological Features of Palaeotsunamis in Greece",
          de: "Bachelorarbeit: Sedimentological Features of Palaeotsunamis in Greece"
        }
      ]
    },
    {
      role: {
        en: "Abitur — German Senior Secondary Certificate",
        de: "Abitur"
      },
      org: {
        en: "Reinhard-und-Max-Mannesmann-Gymnasium, Duisburg, Germany",
        de: "Reinhard-und-Max-Mannesmann-Gymnasium, Duisburg"
      },
      dates: { en: "Graduated 2022", de: "Abschluss 2022" },
      bullets: [
        {
          en: "Bilingual stream (German–English)",
          de: "Bilingualer Zweig (Deutsch–Englisch)"
        }
      ]
    }
  ],
  experience: [
    {
      role: {
        en: "Library Assistant (Student Job)",
        de: "Studentische Hilfskraft (Bibliothek)"
      },
      org: {
        en: "RWTH Aachen University Library",
        de: "Universitätsbibliothek der RWTH Aachen"
      },
      dates: { en: "Dec 2025 – Present", de: "Dez. 2025 – heute" },
      bullets: [
        {
          en: "Assist students and staff with catalogue searches, resource requests and general enquiries",
          de: "Unterstützung von Studierenden und Mitarbeitenden bei Katalogrecherchen, Bestellungen und allgemeinen Anfragen"
        },
        {
          en: "Manage shelving, stock organisation and returns processing to keep library systems running smoothly",
          de: "Regalpflege, Bestandsordnung und Rückbuchungen, damit der Bibliotheksbetrieb reibungslos läuft"
        },
        {
          en: "Provide front-of-house customer service in a busy academic environment",
          de: "Service am Infoschalter in einem belebten wissenschaftlichen Umfeld"
        }
      ]
    },
    {
      role: {
        en: "Retail Assistant (Seasonal)",
        de: "Aushilfe im Einzelhandel (saisonale Tätigkeit)"
      },
      org: {
        en: "Edeka Buchmühlen, Essen, Germany",
        de: "Edeka Buchmühlen, Essen"
      },
      dates: { en: "Seasonal, 2023 – 2025", de: "Saisonweise, 2023 – 2025" },
      bullets: [
        {
          en: "Delivered customer service and point-of-sale support during peak seasonal periods",
          de: "Kundenberatung und Kassentätigkeit in stoßstarken Saisonzeiten"
        },
        {
          en: "Restocked shelves and maintained store presentation standards",
          de: "Regale aufgefüllt und die Warenpräsentation gepflegt"
        },
        {
          en: "Worked efficiently within a team to meet daily operational targets",
          de: "Im Team die täglichen Betriebsziele erreicht"
        }
      ]
    },
    {
      role: { en: "Café Assistant", de: "Café-Aushilfe" },
      org: {
        en: "Lavendel im Brückencafé, Essen, Germany",
        de: "Lavendel im Brückencafé, Essen"
      },
      dates: { en: "Mar–May 2023", de: "März–Mai 2023" },
      bullets: [
        {
          en: "Prepared and served food and beverages in a busy café setting",
          de: "Speisen und Getränke in einem belebten Café zubereitet und serviert"
        },
        {
          en: "Handled customer orders, payments and day-to-day front-of-house duties",
          de: "Bestellungen, Zahlungen und den Servicebetrieb übernommen"
        }
      ]
    },
    {
      role: {
        en: "Private Tutor (Self-Employed)",
        de: "Nachhilfelehrerin (selbstständig)"
      },
      org: { en: "Essen, Germany", de: "Essen" },
      dates: { en: "", de: "" },
      bullets: [
        {
          en: "Delivered one-on-one tutoring sessions tailored to individual student needs",
          de: "Individuelle Nachhilfestunden, angepasst an den Lernstand"
        }
      ]
    }
  ],
  languages: {
    en: "English (native)  ·  German (fluent, C1)  ·  Basic: Italian, French, Spanish, Flemish, Korean",
    de: "Englisch (Muttersprache)  ·  Deutsch (fließend, C1)  ·  Grundkenntnisse: Italienisch, Französisch, Spanisch, Flämisch, Koreanisch"
  },
  availability: {
    en: "Dual Australian–Belgian citizen with full working rights in Australia. Currently completing studies in Germany; available to relocate for entry-level GIS/spatial roles following her mandatory internship and thesis submission (from late 2026 / early 2027). Flexible and open to opportunities across Australia, with particular interest in Brisbane and roles within commuting distance of the NSW Central Coast.",
    de: "Schließt derzeit das Studium an der RWTH Aachen ab. Verfügbar für ein Pflichtpraktikum im GIS-/Geodatenbereich ab Oktober 2026 und für eine Einstiegsstelle nach Abgabe der Bachelorarbeit (ab Ende 2026 / Anfang 2027). Offen für Stationen in Deutschland und im deutschsprachigen Raum."
  }
};
