/* ==========================================================================
   Word CV export — builds a .docx from content.js + word-theme.js.
   Tweak colours and fonts in word-theme.js, not here.
   ========================================================================== */

(function (root) {
  function hex(value, fallback) {
    const raw = String(value == null ? fallback : value).trim().replace(/^#/, "");
    return /^[0-9A-Fa-f]{6}$/.test(raw) ? raw.toUpperCase() : fallback;
  }

  function num(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function getTheme() {
    const src = (typeof WORD_THEME !== "undefined" && WORD_THEME) ? WORD_THEME : {};
    const colors = src.colors || {};
    const fonts = src.fonts || {};
    const sizes = src.sizes || {};
    const page = src.page || {};
    return {
      sheet: hex(colors.sheet, "FFFFFF"),
      ink: hex(colors.ink, "22303A"),
      muted: hex(colors.muted, "5B6660"),
      line: hex(colors.line, "C7CBB2"),
      contourGreen: hex(colors.contourGreen, "4F7A5B"),
      accent: hex(colors.accent, "C1560B"),
      symbolAccent: hex(colors.symbolAccent, "B08A4A"),
      fontDisplay: fonts.display || "Georgia",
      fontBody: fonts.body || "Calibri",
      fontMono: fonts.mono || "Consolas",
      sizeEyebrow: num(sizes.eyebrow, 9),
      sizeName: num(sizes.name, 26),
      sizeTagline: num(sizes.tagline, 9),
      sizeContact: num(sizes.contact, 9),
      sizeCitizenship: num(sizes.citizenship, 9),
      sizeSection: num(sizes.section, 16),
      sizeSectionTick: num(sizes.sectionTick, 10),
      sizeBody: num(sizes.body, 11),
      sizeRole: num(sizes.role, 11),
      sizeDates: num(sizes.dates, 9),
      sizeOrg: num(sizes.org, 10.5),
      sizeBullet: num(sizes.bullet, 10.5),
      sizeSkillLabel: num(sizes.skillLabel, 8.5),
      sizeSkillDetail: num(sizes.skillDetail, 10),
      pageWidth: num(page.widthTwips, 11906),
      pageHeight: num(page.heightTwips, 16838),
      marginTop: num(page.marginTop, 737),
      marginRight: num(page.marginRight, 624),
      marginBottom: num(page.marginBottom, 737),
      marginLeft: num(page.marginLeft, 624),
      pageBorder: page.border === true,
      borderSize: num(page.borderSize, 8),
      borderSpace: num(page.borderSpace, 14)
    };
  }

  function xmlEscape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function wordText(value) {
    const text = String(value || "");
    const space = /^\s|\s$/.test(text) ? ' xml:space="preserve"' : "";
    return `<w:t${space}>${xmlEscape(text)}</w:t>`;
  }

  function sz(pt) {
    return String(Math.round(Number(pt) * 2));
  }

  function rFonts(name) {
    const face = xmlEscape(name);
    return `<w:rFonts w:ascii="${face}" w:hAnsi="${face}" w:cs="${face}"/>`;
  }

  function rPr(opts) {
    const parts = [rFonts(opts.font)];
    if (opts.bold) parts.push("<w:b/>");
    if (opts.italic) parts.push("<w:i/>");
    if (opts.caps) parts.push("<w:caps/>");
    parts.push(`<w:sz w:val="${sz(opts.size)}"/><w:szCs w:val="${sz(opts.size)}"/>`);
    parts.push(`<w:color w:val="${opts.color}"/>`);
    if (opts.spacing) parts.push(`<w:spacing w:val="${opts.spacing}"/>`);
    if (opts.underline) {
      const color = opts.underlineColor ? ` w:color="${opts.underlineColor}"` : "";
      parts.push(`<w:u w:val="single"${color}/>`);
    }
    return parts.join("");
  }

  function wordRun(text, opts) {
    return `<w:r><w:rPr>${rPr(opts)}</w:rPr>${wordText(text)}</w:r>`;
  }

  function wordP(inner, extraPr) {
    return `<w:p><w:pPr>${extraPr || ""}</w:pPr>${inner}</w:p>`;
  }

  function styleP(styleId, extra) {
    return `<w:pStyle w:val="${styleId}"/>${extra || ""}`;
  }

  function crc32(bytes) {
    const table = crc32.table || (crc32.table = (function () {
      const out = new Uint32Array(256);
      for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) {
          c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        out[n] = c >>> 0;
      }
      return out;
    }()));
    let crc = 0 ^ -1;
    for (let i = 0; i < bytes.length; i += 1) {
      crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function u16(n) {
    return new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);
  }

  function u32(n) {
    return new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
  }

  function concatBytes(parts) {
    let length = 0;
    parts.forEach((part) => {
      length += part.length;
    });
    const out = new Uint8Array(length);
    let offset = 0;
    parts.forEach((part) => {
      out.set(part, offset);
      offset += part.length;
    });
    return out;
  }

  function zipStore(files) {
    const enc = new TextEncoder();
    const locals = [];
    const centrals = [];
    let offset = 0;
    files.forEach((file) => {
      const name = enc.encode(file.name);
      const data = typeof file.data === "string" ? enc.encode(file.data) : file.data;
      const crc = crc32(data);
      const local = concatBytes([
        u32(0x04034b50), u16(20), u16(0x0800), u16(0),
        u16(0), u16(0), u32(crc), u32(data.length), u32(data.length),
        u16(name.length), u16(0), name, data
      ]);
      locals.push(local);
      centrals.push(concatBytes([
        u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0),
        u16(0), u16(0), u32(crc), u32(data.length), u32(data.length),
        u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0),
        u32(offset), name
      ]));
      offset += local.length;
    });
    const central = concatBytes(centrals);
    const eocd = concatBytes([
      u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
      u32(central.length), u32(offset), u16(0)
    ]);
    return new Blob([concatBytes(locals.concat([central, eocd]))], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
  }

  function themeXml(th) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Map Sheet">
  <a:themeElements>
    <a:clrScheme name="Map Sheet">
      <a:dk1><a:srgbClr val="${th.ink}"/></a:dk1>
      <a:lt1><a:srgbClr val="${th.sheet}"/></a:lt1>
      <a:dk2><a:srgbClr val="${th.muted}"/></a:dk2>
      <a:lt2><a:srgbClr val="E9EBDC"/></a:lt2>
      <a:accent1><a:srgbClr val="${th.accent}"/></a:accent1>
      <a:accent2><a:srgbClr val="${th.contourGreen}"/></a:accent2>
      <a:accent3><a:srgbClr val="3A6EA5"/></a:accent3>
      <a:accent4><a:srgbClr val="8B6A4C"/></a:accent4>
      <a:accent5><a:srgbClr val="${th.symbolAccent}"/></a:accent5>
      <a:accent6><a:srgbClr val="${th.line}"/></a:accent6>
      <a:hlink><a:srgbClr val="${th.ink}"/></a:hlink>
      <a:folHlink><a:srgbClr val="${th.muted}"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Map Sheet">
      <a:majorFont>
        <a:latin typeface="${xmlEscape(th.fontDisplay)}"/>
        <a:ea typeface="${xmlEscape(th.fontDisplay)}"/>
        <a:cs typeface="${xmlEscape(th.fontDisplay)}"/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="${xmlEscape(th.fontBody)}"/>
        <a:ea typeface="${xmlEscape(th.fontBody)}"/>
        <a:cs typeface="${xmlEscape(th.fontBody)}"/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs>
            <a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="1"/>
        </a:gradFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="100000"/><a:satMod val="130000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="350000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="0"/>
        </a:gradFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
        <a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/></a:schemeClr></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:shade val="20000"/></a:schemeClr></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`;
  }

  function stylesXml(th) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        ${rFonts(th.fontBody)}
        <w:sz w:val="${sz(th.sizeBody)}"/><w:szCs w:val="${sz(th.sizeBody)}"/>
        <w:color w:val="${th.ink}"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr>
      ${rFonts(th.fontBody)}
      <w:sz w:val="${sz(th.sizeBody)}"/><w:szCs w:val="${sz(th.sizeBody)}"/>
      <w:color w:val="${th.ink}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Eyebrow">
    <w:name w:val="Eyebrow"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="0" w:after="40"/></w:pPr>
    <w:rPr>
      ${rFonts(th.fontMono)}
      <w:caps/>
      <w:spacing w:val="60"/>
      <w:sz w:val="${sz(th.sizeEyebrow)}"/><w:szCs w:val="${sz(th.sizeEyebrow)}"/>
      <w:color w:val="${th.accent}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr>
    <w:rPr>
      ${rFonts(th.fontDisplay)}
      <w:b/>
      <w:sz w:val="${sz(th.sizeName)}"/><w:szCs w:val="${sz(th.sizeName)}"/>
      <w:color w:val="${th.ink}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Tagline">
    <w:name w:val="Tagline"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr>
    <w:rPr>
      ${rFonts(th.fontMono)}
      <w:caps/>
      <w:spacing w:val="40"/>
      <w:sz w:val="${sz(th.sizeTagline)}"/><w:szCs w:val="${sz(th.sizeTagline)}"/>
      <w:color w:val="${th.muted}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Contact">
    <w:name w:val="Contact"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:jc w:val="right"/>
      <w:spacing w:before="0" w:after="40"/>
    </w:pPr>
    <w:rPr>
      ${rFonts(th.fontMono)}
      <w:sz w:val="${sz(th.sizeContact)}"/><w:szCs w:val="${sz(th.sizeContact)}"/>
      <w:color w:val="${th.muted}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Citizenship">
    <w:name w:val="Citizenship"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="160" w:after="200"/></w:pPr>
    <w:rPr>
      ${rFonts(th.fontMono)}
      <w:b/>
      <w:spacing w:val="20"/>
      <w:sz w:val="${sz(th.sizeCitizenship)}"/><w:szCs w:val="${sz(th.sizeCitizenship)}"/>
      <w:color w:val="${th.contourGreen}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:outlineLvl w:val="0"/>
      <w:spacing w:before="280" w:after="120"/>
      <w:pBdr>
        <w:bottom w:val="single" w:sz="12" w:space="4" w:color="${th.ink}"/>
      </w:pBdr>
    </w:pPr>
    <w:rPr>
      ${rFonts(th.fontDisplay)}
      <w:b/>
      <w:sz w:val="${sz(th.sizeSection)}"/><w:szCs w:val="${sz(th.sizeSection)}"/>
      <w:color w:val="${th.ink}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Role">
    <w:name w:val="Role"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/><w:spacing w:before="140" w:after="0"/></w:pPr>
    <w:rPr>
      ${rFonts(th.fontBody)}
      <w:b/>
      <w:sz w:val="${sz(th.sizeRole)}"/><w:szCs w:val="${sz(th.sizeRole)}"/>
      <w:color w:val="${th.ink}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Dates">
    <w:name w:val="Dates"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:jc w:val="right"/>
      <w:spacing w:before="140" w:after="0"/>
    </w:pPr>
    <w:rPr>
      ${rFonts(th.fontMono)}
      <w:i/>
      <w:sz w:val="${sz(th.sizeDates)}"/><w:szCs w:val="${sz(th.sizeDates)}"/>
      <w:color w:val="${th.muted}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Org">
    <w:name w:val="Organisation"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="0" w:after="40"/></w:pPr>
    <w:rPr>
      ${rFonts(th.fontBody)}
      <w:sz w:val="${sz(th.sizeOrg)}"/><w:szCs w:val="${sz(th.sizeOrg)}"/>
      <w:color w:val="${th.muted}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListBullet">
    <w:name w:val="List Bullet"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>
      <w:spacing w:before="0" w:after="40"/>
    </w:pPr>
    <w:rPr>
      ${rFonts(th.fontBody)}
      <w:sz w:val="${sz(th.sizeBullet)}"/><w:szCs w:val="${sz(th.sizeBullet)}"/>
      <w:color w:val="${th.ink}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="SkillLabel">
    <w:name w:val="Skill Label"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr>
    <w:rPr>
      ${rFonts(th.fontMono)}
      <w:b/><w:caps/>
      <w:spacing w:val="20"/>
      <w:sz w:val="${sz(th.sizeSkillLabel)}"/><w:szCs w:val="${sz(th.sizeSkillLabel)}"/>
      <w:color w:val="${th.ink}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="SkillDetail">
    <w:name w:val="Skill Detail"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr>
    <w:rPr>
      ${rFonts(th.fontBody)}
      <w:sz w:val="${sz(th.sizeSkillDetail)}"/><w:szCs w:val="${sz(th.sizeSkillDetail)}"/>
      <w:color w:val="${th.muted}"/>
    </w:rPr>
  </w:style>
  <w:style w:type="character" w:styleId="Hyperlink">
    <w:name w:val="Hyperlink"/>
    <w:rPr>
      ${rFonts(th.fontMono)}
      <w:color w:val="${th.ink}"/>
      <w:u w:val="single" w:color="${th.line}"/>
    </w:rPr>
  </w:style>
</w:styles>`;
  }

  function numberingXml(th) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="288" w:hanging="180"/></w:pPr>
      <w:rPr>
        ${rFonts(th.fontBody)}
        <w:sz w:val="${sz(th.sizeBullet)}"/>
        <w:color w:val="${th.ink}"/>
      </w:rPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>`;
  }

  function settingsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:displayBackgroundShape/>
</w:settings>`;
  }

  function typesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
</Types>`;
  }

  function pkgRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  }

  function dashedCellBorders(color) {
    return `<w:tcBorders>
      <w:top w:val="nil"/>
      <w:left w:val="nil"/>
      <w:bottom w:val="dashed" w:sz="6" w:space="0" w:color="${color}"/>
      <w:right w:val="nil"/>
    </w:tcBorders>`;
  }

  function noBorders() {
    return `<w:tcBorders>
      <w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/>
    </w:tcBorders>`;
  }

  function wordTable(colWidths, rowsXml, tblPrExtra) {
    const grid = colWidths.map((w) => `<w:gridCol w:w="${w}"/>`).join("");
    return `<w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblLayout w:type="fixed"/>
        ${tblPrExtra || ""}
      </w:tblPr>
      <w:tblGrid>${grid}</w:tblGrid>
      ${rowsXml}
    </w:tbl>`;
  }

  function wordCell(width, inner, extraTcPr) {
    return `<w:tc>
      <w:tcPr>
        <w:tcW w:w="${width}" w:type="dxa"/>
        ${extraTcPr || ""}
      </w:tcPr>
      ${inner}
    </w:tc>`;
  }

  function buildCvDocx(opts) {
    const th = getTheme();
    const lang = opts.lang;
    const t = opts.t;
    const SHARED = opts.SHARED || {};
    const CONTENT = opts.CONTENT || {};
    const UI = opts.UI || {};
    const name = SHARED.name || "CV";
    const contact = SHARED.contact || {};
    const hyperlinks = [];
    let relCount = 4;

    function displayUrl(href) {
      return String(href || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");
    }

    function absHref(href) {
      const value = String(href || "").trim();
      if (!value) return "";
      if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
      return "https://" + value;
    }

    function addHyperlink(href, label, runOpts) {
      relCount += 1;
      const id = "rId" + relCount;
      hyperlinks.push({ id: id, target: String(href || "").trim() });
      const opts = Object.assign({
        font: th.fontMono,
        size: th.sizeContact,
        color: th.ink,
        underline: true,
        underlineColor: th.line
      }, runOpts || {});
      return `<w:hyperlink r:id="${id}" w:history="1"><w:r><w:rPr><w:rStyle w:val="Hyperlink"/>${rPr(opts)}</w:rPr>${wordText(label)}</w:r></w:hyperlink>`;
    }

    const contactParas = [];
    function contactLine(inner) {
      contactParas.push(wordP(inner, styleP("Contact")));
    }
    const location = t(CONTENT.location, lang);
    if (location) contactLine(wordRun(location, { font: th.fontMono, size: th.sizeContact, color: th.muted }));
    if (contact.phone) contactLine(wordRun(contact.phone, { font: th.fontMono, size: th.sizeContact, color: th.muted }));
    if (contact.email) {
      const mail = contact.emailLink && String(contact.emailLink).trim()
        ? contact.emailLink.trim()
        : "mailto:" + contact.email;
      contactLine(addHyperlink(mail, contact.email));
    }
    if (contact.linkedin) {
      contactLine(addHyperlink(absHref(contact.linkedin), displayUrl(contact.linkedin)));
    }
    if (contact.website) {
      contactLine(addHyperlink(absHref(contact.website), displayUrl(contact.website)));
    }
    if (!contactParas.length) contactParas.push(wordP("", styleP("Contact")));

    const leftHeader =
      wordP(wordRun(t(UI.fullCvEyebrow, lang), {
        font: th.fontMono, size: th.sizeEyebrow, color: th.accent, caps: true, spacing: 60
      }), styleP("Eyebrow")) +
      wordP(wordRun(name, {
        font: th.fontDisplay, size: th.sizeName, color: th.ink, bold: true
      }), styleP("Title")) +
      wordP(wordRun(t(CONTENT.tagline, lang), {
        font: th.fontMono, size: th.sizeTagline, color: th.muted, caps: true, spacing: 40
      }), styleP("Tagline"));

    const headerTable = wordTable(
      ["7200", "3460"],
      `<w:tr>
        ${wordCell("7200", leftHeader, `${noBorders()}<w:vAlign w:val="bottom"/>`)}
        ${wordCell("3460", contactParas.join(""), `${noBorders()}<w:vAlign w:val="bottom"/>`)}
      </w:tr>`,
      `<w:tblBorders>
        <w:top w:val="nil"/><w:left w:val="nil"/>
        <w:bottom w:val="single" w:sz="16" w:space="0" w:color="${th.ink}"/>
        <w:right w:val="nil"/>
        <w:insideH w:val="nil"/><w:insideV w:val="nil"/>
      </w:tblBorders>`
    );

    let body = headerTable;
    const citizenship = t(CONTENT.citizenship, lang);
    if (citizenship) {
      body += wordP(wordRun(citizenship, {
        font: th.fontMono, size: th.sizeCitizenship, color: th.contourGreen, bold: true, spacing: 20
      }), styleP("Citizenship"));
    }

    function sectionHeading(title) {
      const tick = wordRun("＋ ", {
        font: th.fontDisplay, size: th.sizeSectionTick, color: th.symbolAccent, bold: true
      });
      const label = wordRun(title, {
        font: th.fontDisplay, size: th.sizeSection, color: th.ink, bold: true
      });
      return wordP(tick + label, styleP("Heading1"));
    }

    body += sectionHeading(t(UI.profile, lang));
    body += wordP(wordRun(t(CONTENT.fullProfile, lang) || t(CONTENT.shortProfile, lang), {
      font: th.fontBody, size: th.sizeBody, color: th.ink
    }), styleP("Normal"));

    const skillRows = (CONTENT.skills || []).map((skill) => {
      const label = t(skill.label, lang);
      const detail = t(skill.detail, lang);
      return `<w:tr>
        ${wordCell("2800", wordP(wordRun(label, {
          font: th.fontMono, size: th.sizeSkillLabel, color: th.ink, bold: true, caps: true, spacing: 20
        }), styleP("SkillLabel")), dashedCellBorders(th.line))}
        ${wordCell("7860", wordP(wordRun(detail, {
          font: th.fontBody, size: th.sizeSkillDetail, color: th.muted
        }), styleP("SkillDetail")), dashedCellBorders(th.line))}
      </w:tr>`;
    }).join("");

    body += sectionHeading(t(UI.skills, lang));
    if (skillRows) {
      body += wordTable(["2800", "7860"], skillRows, `<w:tblBorders>
        <w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/>
        <w:insideH w:val="nil"/><w:insideV w:val="nil"/>
      </w:tblBorders>`);
    }

    function entriesXml(entries) {
      return (entries || []).map((entry) => {
        const role = t(entry.role, lang);
        const dates = t(entry.dates, lang);
        const org = t(entry.org, lang);
        let xml = wordTable(
          ["7600", "3060"],
          `<w:tr>
            ${wordCell("7600", wordP(wordRun(role, {
              font: th.fontBody, size: th.sizeRole, color: th.ink, bold: true
            }), styleP("Role")), `${noBorders()}<w:vAlign w:val="bottom"/>`)}
            ${wordCell("3060", wordP(wordRun(dates, {
              font: th.fontMono, size: th.sizeDates, color: th.muted, italic: true
            }), styleP("Dates")), `${noBorders()}<w:vAlign w:val="bottom"/>`)}
          </w:tr>`,
          `<w:tblBorders>
            <w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/>
            <w:insideH w:val="nil"/><w:insideV w:val="nil"/>
          </w:tblBorders>`
        );
        if (org) {
          xml += wordP(wordRun(org, {
            font: th.fontBody, size: th.sizeOrg, color: th.muted
          }), styleP("Org"));
        }
        (entry.bullets || []).forEach((bullet) => {
          const line = t(bullet, lang);
          if (line) {
            xml += wordP(wordRun(line, {
              font: th.fontBody, size: th.sizeBullet, color: th.ink
            }), styleP("ListBullet"));
          }
        });
        return xml;
      }).join("");
    }

    body += sectionHeading(t(UI.education, lang));
    body += entriesXml(CONTENT.education);
    body += sectionHeading(t(UI.experience, lang));
    body += entriesXml(CONTENT.experience);

    const languages = t(CONTENT.languages, lang);
    if (languages) {
      body += sectionHeading(t(UI.languages, lang));
      body += wordP(wordRun(languages, {
        font: th.fontBody, size: th.sizeBody, color: th.ink
      }), styleP("Normal"));
    }

    const borders = th.pageBorder ? `
      <w:pgBorders w:offsetFrom="page">
        <w:top w:val="single" w:sz="${th.borderSize}" w:space="${th.borderSpace}" w:color="${th.ink}"/>
        <w:left w:val="single" w:sz="${th.borderSize}" w:space="${th.borderSpace}" w:color="${th.ink}"/>
        <w:bottom w:val="single" w:sz="${th.borderSize}" w:space="${th.borderSpace}" w:color="${th.ink}"/>
        <w:right w:val="single" w:sz="${th.borderSize}" w:space="${th.borderSpace}" w:color="${th.ink}"/>
      </w:pgBorders>` : "";

    body += `<w:sectPr>
      <w:pgSz w:w="${th.pageWidth}" w:h="${th.pageHeight}"/>
      <w:pgMar w:top="${th.marginTop}" w:right="${th.marginRight}" w:bottom="${th.marginBottom}" w:left="${th.marginLeft}"/>
      ${borders}
    </w:sectPr>`;

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:background w:color="${th.sheet}"/>
  <w:body>${body}</w:body>
</w:document>`;

    const linkRels = hyperlinks.map((item) => (
      `<Relationship Id="${item.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${xmlEscape(item.target)}" TargetMode="External"/>`
    )).join("");

    const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  ${linkRels}
</Relationships>`;

    return zipStore([
      { name: "[Content_Types].xml", data: typesXml() },
      { name: "_rels/.rels", data: pkgRelsXml() },
      { name: "word/document.xml", data: documentXml },
      { name: "word/styles.xml", data: stylesXml(th) },
      { name: "word/numbering.xml", data: numberingXml(th) },
      { name: "word/settings.xml", data: settingsXml() },
      { name: "word/theme/theme1.xml", data: themeXml(th) },
      { name: "word/_rels/document.xml.rels", data: docRelsXml }
    ]);
  }

  function downloadCvWordFile(opts) {
    const blob = buildCvDocx(opts);
    const slug = String((opts.SHARED && opts.SHARED.name) || "CV").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "CV";
    const suffix = opts.lang === "de" ? "Lebenslauf" : "CV";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}-${suffix}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  root.buildCvDocx = buildCvDocx;
  root.downloadCvWordFile = downloadCvWordFile;
})(window);
