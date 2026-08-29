/* ==========================================================================
   Site content — English + German.

   Easiest way to edit: run start-editor, then Save. That writes this file.

   You can still edit this file directly. Rules:
   - Keep quote marks around every piece of text.
   - Keep commas between entries.
   - Translated fields look like:  { en: "English", de: "Deutsch" }
   - SHARED is language-independent (name, email, LinkedIn).
   - Project photos live in images/portfolio/N/. The studio lists them; Save stores the order.
   - Leave de: "" if you have not translated yet — the site falls back to English.
   ========================================================================== */

const SITE = {
  defaultLang: "en",
  languages: [
    {
      code: "en",
      label: "English",
      locale: "en-AU"
    },
    {
      code: "de",
      label: "Deutsch",
      locale: "de"
    }
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
  portfolioEyebrow: {
    en: "Portfolio",
    de: "Portfolio"
  },
  fullCvEyebrow: {
    en: "Full CV",
    de: "Lebenslauf"
  },
  profile: {
    en: "Profile",
    de: "Profil"
  },
  skills: {
    en: "Skills",
    de: "Kompetenzen"
  },
  navProjects: {
    en: "Projects",
    de: "Projekte"
  },
  projects: {
    en: "Mapped Projects",
    de: "Kartierte Projekte"
  },
  projectsHint: {
    en: "Highlight reel. See {cv} for more context.",
    de: "Auswahl aktueller Arbeiten. Mehr Kontext im {cv}."
  },
  cvLink: {
    en: "full CV",
    de: "Lebenslauf"
  },
  fullCv: {
    en: "Full CV",
    de: "Lebenslauf"
  },
  fullCvShort: {
    en: "CV",
    de: "CV"
  },
  backToPortfolio: {
    en: "Back to Portfolio",
    de: "Zurück zum Portfolio"
  },
  download: {
    en: "Download",
    de: "Herunterladen"
  },
  downloadAria: {
    en: "Download CV PDF",
    de: "Lebenslauf als PDF herunterladen"
  },
  education: {
    en: "Education",
    de: "Ausbildung"
  },
  experience: {
    en: "Field Experience",
    de: "Berufserfahrung"
  },
  languages: {
    en: "Languages",
    de: "Sprachen"
  },
  scale: {
    en: "Scale",
    de: "Maßstab"
  },
  scaleCaption: {
    en: "Entry-level → Field-ready",
    de: "Einstieg → praxistauglich"
  },
  availabilityLabel: {
    en: "Availability",
    de: "Verfügbarkeit"
  },
  linkedin: {
    en: "LinkedIn",
    de: "LinkedIn"
  },
  addImage: {
    en: "+ Add an image\n(see editor.html)",
    de: "+ Bild hinzufügen\n(siehe editor.html)"
  },
  imageNotFound: {
    en: "Image not found:",
    de: "Bild nicht gefunden:"
  },
  viewImage: {
    en: "View larger image",
    de: "Bild vergrößern"
  },
  viewGallery: {
    en: "Browse {count} photos: {title}",
    de: "{count} Fotos ansehen: {title}"
  },
  browsePhotos: {
    en: "{count} photos",
    de: "{count} Fotos"
  },
  previousImage: {
    en: "Previous image",
    de: "Vorheriges Bild"
  },
  nextImage: {
    en: "Next image",
    de: "Nächstes Bild"
  },
  imageCount: {
    en: "{current} / {total}",
    de: "{current} / {total}"
  },
  closeImage: {
    en: "Close",
    de: "Schließen"
  },
  zoomIn: {
    en: "Zoom in",
    de: "Vergrößern"
  },
  zoomOut: {
    en: "Zoom out",
    de: "Verkleinern"
  },
  zoomReset: {
    en: "Fit",
    de: "Anpassen"
  },
  zoomHint: {
    en: "Click or scroll to zoom · drag to pan",
    de: "Klicken oder scrollen zum Zoomen · Ziehen zum Verschieben"
  },
  themeToggle: {
    en: "Toggle dark mode",
    de: "Hell-/Dunkelmodus umschalten"
  },
  langSwitcher: {
    en: "Language",
    de: "Sprache"
  }
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
    en: "I am currently completing my Applied Geography degree in Germany and will be available for entry-level opportunities from late 2026 or early 2027, following the completion of my mandatory internship and Bachelor’s thesis. I am open to opportunities across Europe and Australia, with particular interest in Brisbane and roles within commuting distance of the NSW Central Coast.",
    de: "Derzeit absolviere ich mein Studium der Angewandten Geographie in Deutschland und stehe nach Abschluss meines Pflichtpraktikums und meiner Bachelorarbeit ab Ende 2026 bzw. Anfang 2027 für den Berufseinstieg zur Verfügung. Ich bin flexibel hinsichtlich des Standorts und offen für Positionen in Europa und Australien, mit besonderem Interesse an Deutschland und dem deutschsprachigen Raum."
  },
  fullProfile: {
    en: "Final-year B.Sc. Applied Geography student at RWTH Aachen University, expected to graduate in late 2026, with a broad academic background spanning GIS, spatial analysis, remote sensing, geoscience, geomorphology, geology, soil science and climatology. I have a strong particular interest in GIS and cartography, especially in transforming spatial data into clear, informative and visually compelling outputs.\n\nI am seeking an entry-level or graduate position in Europe or Australia where I can apply my geographical and analytical skills while continuing to develop professionally. GIS and spatial work are a particular area of interest, but I am also open to roles that draw on my broader background in geoscience, environmental applications and field-based geography. Through university projects, fieldwork and practical coursework, I have developed experience working with geospatial data, GIS software, remote sensing and geographical field methods.\n\nAs an Australian–Belgian dual citizen, I have full working rights in Australia and am open to relocating for the right opportunity. I am particularly interested in roles that allow me to combine technical GIS skills with broader geographical and environmental knowledge.\n",
    de: "Geographiestudentin im letzten Bachelorjahr (B.Sc. Angewandte Geographie, RWTH Aachen University) mit voraussichtlichem Studienabschluss Ende 2026 und einem breit gefächerten fachlichen Hintergrund in GIS, Geodatenanalyse, Fernerkundung, Geowissenschaften, Geomorphologie, Geologie, Bodenkunde und Klimatologie. Mein besonderes Interesse gilt GIS und Kartografie, insbesondere der Aufbereitung räumlicher Daten zu aussagekräftigen, übersichtlichen und visuell ansprechenden Karten und Analysen.\n\nFür meinen Berufseinstieg suche ich eine Einstiegs- oder Graduate-Position in Europa, in der ich meine geographischen und analytischen Kenntnisse praktisch anwenden und weiterentwickeln kann. Dabei liegt mein Schwerpunkt auf GIS und räumlicher Datenanalyse, gleichzeitig bin ich offen für Tätigkeiten, die meine weiteren fachlichen Kenntnisse aus den Geowissenschaften, der Umweltplanung und der angewandten Geographie einbeziehen.\n\nDurch Studienprojekte, Geländepraktika und Exkursionen konnte ich praktische Erfahrungen im Umgang mit Geodaten, GIS-Software, Fernerkundung sowie verschiedenen geographischen und geowissenschaftlichen Feldmethoden sammeln. Ich arbeite mich schnell in neue Software und Methoden ein und möchte meine vielseitigen Kenntnisse gerne in einem praxisorientierten Arbeitsumfeld einsetzen."
  },
  skills: [
    {
      symbol: "ring",
      label: {
        en: "GIS & Spatial Tools",
        de: "GIS & Geodatenwerkzeuge "
      },
      detail: {
        en: "QGIS, spatial data analysis, cartographic design",
        de: "QGIS, räumliche Datenanalyse, kartographische Gestaltung"
      }
    },
    {
      symbol: "grid",
      label: {
        en: "Programming & Data",
        de: "Programmierung & Daten"
      },
      detail: {
        en: "Python and R (basic)",
        de: "Python und R (Grundkenntnisse)"
      }
    },
    {
      symbol: "dashed",
      label: {
        en: "Climate Modelling",
        de: "Klimamodellierung"
      },
      detail: {
        en: "ENVI-met (basic)",
        de: "ENVI-met (Grundkenntnisse)"
      }
    },
    {
      symbol: "contour",
      label: {
        en: "Design & Visualisation",
        de: "Design & Visualisierung"
      },
      detail: {
        en: "Inkscape, map layout and cartographic representation",
        de: "Inkscape, Kartenlayout und kartographische Darstellung"
      }
    },
    {
      symbol: "hatch",
      label: {
        en: "Productivity",
        de: "Produktivität"
      },
      detail: {
        en: "Microsoft Office (Word, Excel, PowerPoint)",
        de: "Microsoft Office (Word, Excel, PowerPoint)"
      }
    },
    {
      symbol: "triangle",
      label: {
        en: "Laboratory experience",
        de: "Laborerfahrung "
      },
      detail: {
        en: "Sediment sample analysis ",
        de: "Analyse von Sedimentproben"
      }
    }
  ],
  projects: [
    {
      images: [
        "images/portfolio/1/LST_Amsterdam_Done.png",
        "images/portfolio/1/NDVI_AMS_Fixed.png"
      ],
      title: {
        en: "Bachelor thesis (in progress)",
        de: "Bachelorarbeit (in Arbeit)"
      },
      tag: {
        en: "RWTH Aachen · Geohazards",
        de: "RWTH Aachen · Georisiken"
      },
      description: {
        en: "Sedimentological features of unknown tsunami in Greece",
        de: "Sedimentologische Merkmale von unbekannte Tsunamis in Griechenland"
      }
    },
    {
      images: [
        "images/portfolio/2/GOT map.png"
      ],
      title: {
        en: "Amsterdam - NDVI and LST",
        de: "Amsterdam - NDVI und LST"
      },
      tag: {
        en: "Remote Sensing · Spectral Analysis",
        de: "Fernerkundung · Spektralanalyse"
      },
      description: {
        en: "",
        de: ""
      }
    },
    {
      images: [
        "images/portfolio/3/Hamburg.png",
        "images/portfolio/3/Poster_Claes_23.jpg",
        "images/portfolio/3/Rindhaltung.png",
        "images/portfolio/3/Schutzmaßnahmen.png"
      ],
      title: {
        en: "The German North Sea Coast ",
        de: "Die deutsche Nordseeküste "
      },
      tag: {
        en: "Poster Assignment: Geovisualisation · QGIS",
        de: ""
      },
      description: {
        en: "",
        de: ""
      }
    },
    {
      images: [],
      title: {
        en: "",
        de: ""
      },
      tag: {
        en: "",
        de: ""
      },
      description: {
        en: "",
        de: ""
      }
    }
  ],
  education: [
    {
      role: {
        en: "B.Sc. Applied Geography",
        de: "B.Sc. Angewandte Geographie"
      },
      org: {
        en: "RWTH Aachen University, Germany",
        de: "RWTH Aachen, Deutschland"
      },
      dates: {
        en: "Oct 2023 – Present",
        de: "Okt. 2023 – heute"
      },
      bullets: [
        {
          en: "Expected completion: late 2026",
          de: "Voraussichtlicher Abschluss: Ende 2026"
        },
        {
          en: "Focus areas: GIS, geospatial analysis, human & physical geography, urban geography and spatial planning; minor in Geosciences with an elective focus on Geohazards",
          de: "Schwerpunkte: GIS, Geodatenanalyse, Humangeographie und Physische Geographie, Stadtgeographie und Raumplanung; Nebenfach Geowissenschaften und Wahlpflichtfach in Georisiken"
        },
        {
          en: "Currently completing final exams, ahead of thesis and a mandatory industry internship from October 2026",
          de: "Absolviere derzeit Abschlussprüfungen und Bachelorarbeit schreiben mit Pflichtpraktikum ab Oktober 2026"
        },
        {
          en: "Bachelor thesis: Sedimentological features of unknown tsunami in Greece",
          de: "Bachelorarbeit: Sedimentologische Merkmale von unbekannte Tsunamis in Griechenland"
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
      dates: {
        en: "Graduated 2022",
        de: "Abschluss 2022"
      },
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
      dates: {
        en: "Dec 2025 – Present",
        de: "Dez. 2025 – heute"
      },
      bullets: [
        {
          en: "Assist students and staff with catalogue searches, resource requests and general enquiries",
          de: "Unterstützung von Studierenden und Mitarbeitenden bei Katalogrecherchen, Bestellungen und allgemeinen Anfragen"
        }
      ]
    },
    {
      role: {
        en: "Retail Worker (Seasonal)",
        de: "Aushilfe im Einzelhandel (saisonale Tätigkeit)"
      },
      org: {
        en: "Edeka Buchmühlen, Essen, Germany",
        de: "Edeka Buchmühlen, Essen"
      },
      dates: {
        en: "Seasonal, 2023 – 2025",
        de: "Saisonweise, 2023 – 2025"
      },
      bullets: [
        {
          en: "Delivered customer service and point-of-sale support during peak seasonal periods",
          de: "Kundenberatung und Kassentätigkeit in stoßstarken Saisonzeiten"
        }
      ]
    },
    {
      role: {
        en: "Café Worker",
        de: "Café-Aushilfe"
      },
      org: {
        en: "Lavendel im Brückencafé, Essen, Germany",
        de: "Lavendel im Brückencafé, Essen"
      },
      dates: {
        en: "Mar–May 2023",
        de: "März–Mai 2023"
      },
      bullets: [
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
      org: {
        en: "Essen, Germany",
        de: "Essen"
      },
      dates: {
        en: "",
        de: ""
      },
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
    en: "",
    de: ""
  }
};
