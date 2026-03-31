/**
 * App color palette — single source for Tailwind (`tailwind.config.js`) and runtime (gradients, icons).
 */
export const socialPalette = {
  bg: "#05060f",
  accent: "#ff3d57",
  accentEnd: "#e11d48",
  /** Welcome / global.css `--brand-end` gradient stop */
  welcomeAccentEnd: "#f2556a",
  slate500: "#64748b",
  slate600: "#475569",
  cardFrom: "#12131a",
  accentFaint: "#ff3d571A",
  accentGlowStrong: "rgba(255, 61, 87, 0.16)",
  accentGlowSoft: "rgba(255, 61, 87, 0.07)",
  accentGlowFade: "rgba(255, 61, 87, 0)",
  accentGlowMidStrong: "rgba(255, 61, 87, 0.05)",
  accentGlowMidSoft: "rgba(255, 61, 87, 0.03)",
  /** Document converter — format icon colors (PDF, Office, image) */
  docPdf: "#ef4444",
  docPdfBg: "rgba(239, 68, 68, 0.1)",
  docWord: "#3b82f6",
  docWordBg: "rgba(59, 130, 246, 0.1)",
  docExcel: "#22c55e",
  docExcelBg: "rgba(34, 197, 94, 0.1)",
  docPpt: "#f97316",
  docPptBg: "rgba(249, 115, 22, 0.1)",
  docImage: "#a855f7",
  docImageBg: "rgba(168, 85, 247, 0.1)",
} as const;

/**
 * Bottom sheet + modal scrim — shared with Tailwind (`social-sheet-*`) and `expo-blur` props.
 */
export const bottomSheet = {
  /** expo-blur tint; pairs with dark `social-bg` / cards */
  blurTint: "dark" as const,
  blurIntensityIos: 55,
  blurIntensityAndroid: 80,
  /** Modal backdrop — same as `social-sheet-scrim` in tailwind */
  backdrop: "rgba(5, 6, 15, 0.72)",
  /** Frosted layer on top of blur — aligns with `social-card-from` */
  surfaceOverlay: "rgba(18, 19, 26, 0.45)",
} as const;

export type SocialPalette = typeof socialPalette;
