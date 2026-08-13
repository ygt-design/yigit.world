/**
 * Grid configuration — single source of truth for layout.
 *
 * Desktop : 12 columns
 * Tablet  : 8 columns  (≤ BREAKPOINT_TABLET)
 * Mobile  : 4 columns  (≤ BREAKPOINT)
 *
 * Column counts are plain numbers. Every size / spacing value is a string
 * that already includes its CSS unit, so consuming code never appends "px".
 */

const BREAKPOINT = "1120px";
const BREAKPOINT_TABLET = "1120px";

export const GRID = {
  // ── Desktop ────────────────────────────────────────────────
  /** Number of grid columns on desktop */
  COLUMNS: 12,
  MAX_WIDTH: "100vw",
  /** Horizontal page padding (CSS value) */
  PADDING: "20px",
  /** Column gap / gutter (CSS value) */
  GAP: "20px",
  /** Row gap between grid children (CSS value) */
  ROW_GAP: "2rem",

  // ── Tablet (BREAKPOINT < width ≤ BREAKPOINT_TABLET) ─────────
  /** Number of grid columns on tablet */
  COLUMNS_TABLET: 8,
  /** Horizontal page padding on tablet (CSS value) */
  PADDING_TABLET: "30px",
  /** Column gap on tablet (CSS value) */
  GAP_TABLET: "1rem",
  /** Row gap on tablet (CSS value) */
  ROW_GAP_TABLET: "1.5rem",

  // ── Mobile (≤ BREAKPOINT) ──────────────────────────────────
  /** Number of grid columns on mobile */
  COLUMNS_MOBILE: 4,
  /** Horizontal page padding on mobile (CSS value) */
  PADDING_MOBILE: "20px",
  /** Column gap on mobile (CSS value) */
  GAP_MOBILE: "1rem",
  /** Row gap on mobile (CSS value) */
  ROW_GAP_MOBILE: "2.5rem",

  // ── Breakpoints ────────────────────────────────────────────
  /** Mobile breakpoint — max-width media query threshold */
  BREAKPOINT,
  /** Tablet breakpoint — upper bound of the tablet range */
  BREAKPOINT_TABLET,

  // ── Pre-built media-query strings ──────────────────────────
  /**
   * Mobile: anything at or below BREAKPOINT.
   * Use in styled-components: @media ${GRID.MEDIA_MOBILE} { … }
   */
  MEDIA_MOBILE: `(max-width: ${BREAKPOINT})`,

  MEDIA_TABLET: `(min-width: ${BREAKPOINT}) and (max-width: ${BREAKPOINT_TABLET})`,
};

export default GRID;
