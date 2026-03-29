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
} as const;

export type SocialPalette = typeof socialPalette;
