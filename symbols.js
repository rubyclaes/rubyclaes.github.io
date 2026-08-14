/* Map-legend symbols for skills (portfolio, CV, and the content editor).
   Each drawing fits a 40×22 viewBox so they sit neatly in the legend row. */

const LEGEND_SYMBOLS = {
  contour: `<svg viewBox="0 0 40 22"><path d="M2 16 Q10 4 20 12 T38 8" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  grid: `<svg viewBox="0 0 40 22"><g stroke="currentColor" stroke-width="1.6"><line x1="4" y1="2" x2="4" y2="20"/><line x1="14" y1="2" x2="14" y2="20"/><line x1="24" y1="2" x2="24" y2="20"/><line x1="34" y1="2" x2="34" y2="20"/></g><g fill="currentColor"><circle cx="4" cy="6" r="1.6"/><circle cx="14" cy="14" r="1.6"/><circle cx="24" cy="8" r="1.6"/><circle cx="34" cy="16" r="1.6"/></g></svg>`,
  dashed: `<svg viewBox="0 0 40 22"><line x1="2" y1="11" x2="38" y2="11" stroke="currentColor" stroke-width="2.2" stroke-dasharray="6 4"/></svg>`,
  leader: `<svg viewBox="0 0 40 22"><line x1="2" y1="18" x2="24" y2="6" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="6" r="2.4" fill="currentColor"/><line x1="24" y1="6" x2="38" y2="6" stroke="currentColor" stroke-width="2"/></svg>`,
  hatch: `<svg viewBox="0 0 40 22"><g stroke="currentColor" stroke-width="1.6"><line x1="2" y1="20" x2="10" y2="2"/><line x1="10" y1="20" x2="18" y2="2"/><line x1="18" y1="20" x2="26" y2="2"/><line x1="26" y1="20" x2="34" y2="2"/></g></svg>`,
  dotted: `<svg viewBox="0 0 40 22"><line x1="2" y1="11" x2="38" y2="11" stroke="currentColor" stroke-width="2.2" stroke-dasharray="1.8 3.2" stroke-linecap="round"/></svg>`,
  double: `<svg viewBox="0 0 40 22"><g stroke="currentColor" stroke-width="1.8"><line x1="2" y1="8" x2="38" y2="8"/><line x1="2" y1="14" x2="38" y2="14"/></g></svg>`,
  spot: `<svg viewBox="0 0 40 22"><circle cx="20" cy="11" r="4.2" fill="currentColor"/></svg>`,
  triangle: `<svg viewBox="0 0 40 22"><path d="M20 4.5 L29 18 H11 Z" fill="currentColor"/></svg>`,
  cross: `<svg viewBox="0 0 40 22"><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="20" y1="3" x2="20" y2="19"/><line x1="12" y1="11" x2="28" y2="11"/></g></svg>`,
  area: `<svg viewBox="0 0 40 22"><path d="M7 16 L13 6 H33 L27 16 Z" fill="currentColor"/></svg>`,
  ring: `<svg viewBox="0 0 40 22"><g fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="20" cy="11" r="8"/><circle cx="20" cy="11" r="4"/></g></svg>`,
  tick: `<svg viewBox="0 0 40 22"><line x1="2" y1="16" x2="38" y2="16" stroke="currentColor" stroke-width="1.8"/><g stroke="currentColor" stroke-width="1.6"><line x1="8" y1="16" x2="8" y2="6"/><line x1="16" y1="16" x2="16" y2="6"/><line x1="24" y1="16" x2="24" y2="6"/><line x1="32" y1="16" x2="32" y2="6"/></g></svg>`,
  arrow: `<svg viewBox="0 0 40 22"><line x1="3" y1="11" x2="28" y2="11" stroke="currentColor" stroke-width="2"/><path d="M24 5.5 L36 11 L24 16.5 Z" fill="currentColor"/></svg>`
};

function legendSymbolSvg(name) {
  return LEGEND_SYMBOLS[name] || LEGEND_SYMBOLS.dashed;
}
