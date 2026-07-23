/* ==========================================================================
   EDIT THIS FILE to update your site — that's it, you don't need to touch
   any other file just to change text or add a project.

   Rules to keep it working:
   - Keep the quote marks "like this" around every piece of text.
   - Keep the commas between entries.
   - To add a new item to a list (skills / education / projects / etc.),
     copy one whole { ... } block, paste it above or below, and edit the text.
   - To add a picture: put the image file in the "images" folder, then set
     "image" below to "images/your-file-name.jpg". If you leave it as "",
     the site will show a placeholder box instead — nothing breaks.
   ========================================================================== */

const CV_DATA = {
  name: "Ruby Claes",
  tagline: "Cartography · GIS · Spatial Analysis",
  citizenship: "Dual Australian & Belgian Citizen — Full Working Rights in Australia",

  contact: {
    location: "Aachen, Germany",
    // phone: "",
    email: "ruby.claes@gmail.com",
    linkedin: "https://www.linkedin.com/in/rubyclaes",                    // fill this
    emailLink: "mailto:ruby.claes@gmail.com"
  },

  // Short version for homepage
  shortProfile: "Applied Geography graduate (B.Sc., RWTH Aachen) passionate about GIS, cartography, and turning spatial data into clear, visually compelling maps. Dual Australian–Belgian citizen with full working rights in Australia. Eager to join an entry-level GIS/spatial role from early 2027, with particular interest in Brisbane and roles within commuting distance of the NSW Central Coast.",

  // Full version for CV page
  fullProfile: "Enthusiastic Applied Geography graduate (B.Sc., RWTH Aachen University) with a genuine passion for GIS and cartography, and a particular love of turning raw spatial data into maps that are both factual and visually compelling. Keen to bring hands-on GIS skills, an analytical mindset and cross-cultural experience to an entry-level role in Australia's spatial industry, with particular interest in Brisbane and roles within commuting distance of the NSW Central Coast. Reliable, quick to pick up new tools, and excited to get started.",

  // Each row shows as one line in the "map legend" style skills section.
  // "symbol" picks which little icon is drawn — options:
  // "contour" | "grid" | "dashed" | "leader" | "hatch"
  skills: [
    {
      symbol: "contour",
      label: "GIS & Spatial Tools",
      detail: "QGIS, spatial data analysis, cartographic design"
    },
    {
      symbol: "grid",
      label: "Programming & Data",
      detail: "Python and R (basic)"
    },
    {
      symbol: "dashed",
      label: "Environmental Modelling",
      detail: "ENVI-met (basic)"
    },
    {
      symbol: "leader",
      label: "Design & Visualisation",
      detail: "Inkscape, map layout and cartographic representation"
    },
    {
      symbol: "hatch",
      label: "Productivity",
      detail: "Microsoft Office (Word, Excel, PowerPoint)"
    }
  ],

  // ---- YOUR PROJECTS / MAPS GO HERE ------------------------------------
  // This is the bit worth spending time on: 3-6 pieces of work you're proud
  // of. A course project, a map you made for fun, fieldwork, your thesis
  // once it's done — anything that shows how you think and what you can make.
  projects: [
    {
      title: "Add your first project",
      tag: "Project type, e.g. Coursework · QGIS",
      description:
        "Replace this text with a couple of sentences: what was the question, " +
        "what data or tools did you use, and what did the final map show?",
      image: "" // e.g. "images/project-1.jpg"
    },
    {
      title: "Add your second project",
      tag: "Project type, e.g. Fieldwork · Cartography",
      description:
        "Same idea here — one project per card. It's fine to start with just " +
        "one or two and add more later.",
      image: ""
    },
    {
      title: "Bachelor thesis (in progress)",
      tag: "RWTH Aachen · Geohazards",
      description:
        "Sedimentological Features of Palaeotsunamis in Greece. Update this " +
        "once the thesis is finished — a key figure or map from it would make " +
        "a strong final project card.",
      image: ""
    }
  ],

  education: [
    {
      role: "B.Sc. Applied Geography",
      org: "RWTH Aachen University, Germany",
      dates: "Oct 2023 – Present",
      bullets: [
        "Expected completion: late 2026",
        "Focus areas: GIS, geospatial analysis, human & physical geography, urban geography and spatial planning; minor in Geosciences with an elective focus on Geohazards",
        "Project work: urban development analysis using GIS software",
        "Currently completing final exams, ahead of thesis and a mandatory industry internship from October 2026",
        "Bachelor thesis: Sedimentological Features of Palaeotsunamis in Greece"
      ]
    },
    {
      role: "Abitur — German Senior Secondary Certificate",
      org: "Reinhard-und-Max-Mannesmann-Gymnasium, Duisburg, Germany",
      dates: "Graduated 2022",
      bullets: [
        "Bilingual stream (German–English)"
      ]
    }
  ],

  experience: [
    {
      role: "Library Assistant (Student Job)",
      org: "RWTH Aachen University Library",
      dates: "Dec 2025 – Present",
      bullets: [
        "Assist students and staff with catalogue searches, resource requests and general enquiries",
        "Manage shelving, stock organisation and returns processing to keep library systems running smoothly",
        "Provide front-of-house customer service in a busy academic environment"
      ]
    },
    {
      role: "Retail Assistant (Seasonal)",
      org: "Edeka Buchmühlen, Essen, Germany",
      dates: "Seasonal, 2023 – 2025",
      bullets: [
        "Delivered customer service and point-of-sale support during peak seasonal periods",
        "Restocked shelves and maintained store presentation standards",
        "Worked efficiently within a team to meet daily operational targets"
      ]
    },
    {
      role: "Café Assistant",
      org: "Lavendel im Brückencafé, Essen, Germany",
      dates: "Mar–May 2023",
      bullets: [
        "Prepared and served food and beverages in a busy café setting",
        "Handled customer orders, payments and day-to-day front-of-house duties"
      ]
    },
    {
      role: "Private Tutor (Self-Employed)",
      org: "Essen, Germany",
      dates: "",
      bullets: [
        "Delivered one-on-one tutoring sessions tailored to individual student needs",
      ]
    }
  ],

  languages: "English (native)  ·  German (fluent, C1)  ·  Basic: Italian, French, Spanish, Flemish, Korean",

  availability:
    "Dual Australian–Belgian citizen with full working rights in Australia. Currently completing " +
    "studies in Germany; available to relocate for entry-level GIS/spatial roles following her " +
    "mandatory internship and thesis submission (from late 2026 / early 2027). Flexible and open " +
    "to opportunities across Australia, with particular interest in Brisbane and roles within " +
    "commuting distance of the NSW Central Coast."
};