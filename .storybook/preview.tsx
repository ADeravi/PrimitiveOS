import * as React from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { create } from "storybook/theming";
import { TooltipProvider } from "@/components/ui/tooltip";
import "../app/globals.css";

// Docs pages render with the default light theme; preview-head.html flips
// them dark via `.dark .sbdocs` CSS so they follow the dark toggle too.
const docsTheme = create({
  base: "light",
  brandTitle: "ScnTw Design System",
  fontBase: '"Inter", system-ui, sans-serif',
  fontCode: '"JetBrains Mono", monospace',
});

// ---------------------------------------------------------------------------
// Tier 1 primitive ladders, generated per design language.
// The lightness/chroma curves are taken from the base ladders in globals.css,
// so every layer's ladders keep the same perceptual rhythm — only hue and
// chroma scale change. Switching the Design Layer therefore re-themes the
// PRIMITIVES too (Color Palette page, Alert warning text, anything referencing
// --blue-*/--green-*/--red-*/--amber-*/--neutral-*).
// ---------------------------------------------------------------------------
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
// Neutral lightness curve (achromatic ladder in globals.css)
const NEUTRAL_L = [0.985, 0.967, 0.922, 0.87, 0.708, 0.556, 0.439, 0.371, 0.269, 0.205, 0.145];
// Chromatic lightness + chroma curves (blue ladder in globals.css)
const CHROMA_L = [0.97, 0.932, 0.882, 0.809, 0.707, 0.623, 0.546, 0.488, 0.424, 0.379, 0.282];
const CHROMA_C = [0.014, 0.032, 0.059, 0.105, 0.155, 0.188, 0.215, 0.2, 0.16, 0.123, 0.087];

type TokenMap = Record<string, string>;

function chromaticLadder(name: string, hue: number, chromaScale = 1): TokenMap {
  return Object.fromEntries(
    STEPS.map((step, i) => [
      `--${name}-${step}`,
      `oklch(${CHROMA_L[i]} ${(CHROMA_C[i] * chromaScale).toFixed(3)} ${hue})`,
    ])
  );
}

function neutralLadder(hue: number, chroma: number): TokenMap {
  return Object.fromEntries(
    STEPS.map((step, i) => [
      `--neutral-${step}`,
      chroma === 0
        ? `oklch(${NEUTRAL_L[i]} 0 0)`
        : `oklch(${NEUTRAL_L[i]} ${chroma} ${hue})`,
    ])
  );
}

interface LadderSpec {
  neutral: { hue: number; chroma: number };
  blue: number;
  green: number;
  red: number;
  amber: number;
  chromaScale?: number;
}

function primitives(spec: LadderSpec): TokenMap {
  const s = spec.chromaScale ?? 1;
  return {
    ...neutralLadder(spec.neutral.hue, spec.neutral.chroma),
    ...chromaticLadder("blue", spec.blue, s),
    ...chromaticLadder("green", spec.green, s),
    ...chromaticLadder("red", spec.red, s),
    ...chromaticLadder("amber", spec.amber, s),
  };
}

// ---------------------------------------------------------------------------
// Per-layer look: typography, primitives, elevation and motion physics.
// Semantic colour presets live in DS_TOKENS below; LOOK carries everything
// else that makes a design language feel like itself.
// ---------------------------------------------------------------------------
interface Look {
  font: string;
  primitives: TokenMap;
  shadows: TokenMap;
  motion: TokenMap;
}

const LOOK: Record<string, Look> = {
  // shadcn inherits everything from globals.css — zero overrides.
  shadcn: { font: '"Inter", ui-sans-serif, system-ui, sans-serif', primitives: {}, shadows: {}, motion: {} },

  // Material 3 — Roboto, tinted neutrals, soft layered elevation,
  // emphasized-decelerate easing, slightly slower durations.
  material: {
    font: '"Roboto", system-ui, sans-serif',
    primitives: primitives({
      neutral: { hue: 264, chroma: 0.012 },
      blue: 259, green: 145, red: 27, amber: 85,
    }),
    shadows: {
      "--shadow-sm": "0 1px 2px 0 oklch(0 0 0 / 30%), 0 1px 3px 1px oklch(0 0 0 / 15%)",
      "--shadow-md": "0 1px 2px 0 oklch(0 0 0 / 30%), 0 2px 6px 2px oklch(0 0 0 / 15%)",
      "--shadow-lg": "0 4px 8px 3px oklch(0 0 0 / 15%), 0 1px 3px 0 oklch(0 0 0 / 30%)",
      "--shadow-xl": "0 8px 12px 6px oklch(0 0 0 / 15%), 0 4px 4px 0 oklch(0 0 0 / 30%)",
    },
    motion: {
      "--duration-fast": "200ms",
      "--duration-normal": "300ms",
      "--duration-slow": "500ms",
      "--ease-standard": "cubic-bezier(0.2, 0, 0, 1)",
      "--ease-enter": "cubic-bezier(0.05, 0.7, 0.1, 1)",
      "--ease-exit": "cubic-bezier(0.3, 0, 0.8, 0.15)",
    },
  },

  // Fluent 2 — Segoe UI, cool sharp neutrals, tight shadows, quick motion.
  fluent: {
    font: '"Segoe UI", system-ui, sans-serif',
    primitives: primitives({
      neutral: { hue: 250, chroma: 0.005 },
      blue: 245, green: 150, red: 25, amber: 70,
    }),
    shadows: {
      "--shadow-sm": "0 1px 2px 0 oklch(0 0 0 / 14%)",
      "--shadow-md": "0 2px 4px 0 oklch(0 0 0 / 14%)",
      "--shadow-lg": "0 4px 8px 0 oklch(0 0 0 / 14%)",
      "--shadow-xl": "0 8px 16px 0 oklch(0 0 0 / 14%)",
    },
    motion: {
      "--duration-fast": "100ms",
      "--duration-normal": "200ms",
      "--duration-slow": "300ms",
      "--ease-standard": "cubic-bezier(0.33, 0, 0.67, 1)",
      "--ease-enter": "cubic-bezier(0, 0, 0, 1)",
      "--ease-exit": "cubic-bezier(1, 0, 1, 1)",
    },
  },

  // IBM Carbon — IBM Plex Sans, vivid IBM Blue ladder, flat surfaces
  // (minimal shadow), productive easing.
  carbon: {
    font: '"IBM Plex Sans", system-ui, sans-serif',
    primitives: primitives({
      neutral: { hue: 260, chroma: 0.004 },
      blue: 262, green: 150, red: 22, amber: 80,
      chromaScale: 1.08,
    }),
    shadows: {
      "--shadow-sm": "0 0 0 1px oklch(0 0 0 / 6%)",
      "--shadow-md": "0 1px 2px 0 oklch(0 0 0 / 12%)",
      "--shadow-lg": "0 2px 6px 0 oklch(0 0 0 / 16%)",
      "--shadow-xl": "0 4px 8px 0 oklch(0 0 0 / 20%)",
    },
    motion: {
      "--duration-fast": "110ms",
      "--duration-normal": "240ms",
      "--duration-slow": "400ms",
      "--ease-standard": "cubic-bezier(0.2, 0, 0.38, 0.9)",
      "--ease-enter": "cubic-bezier(0, 0, 0.38, 0.9)",
      "--ease-exit": "cubic-bezier(0.2, 0, 1, 0.9)",
    },
  },

  // Apple HIG — SF system stack, pure neutrals, system colours
  // (systemBlue/Green/Red/Orange), diffuse soft shadows, sheet-style easing.
  apple: {
    font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
    primitives: primitives({
      neutral: { hue: 0, chroma: 0 },
      blue: 248, green: 152, red: 22, amber: 60,
      chromaScale: 1.05,
    }),
    shadows: {
      "--shadow-sm": "0 1px 4px 0 oklch(0 0 0 / 8%)",
      "--shadow-md": "0 4px 12px 0 oklch(0 0 0 / 10%)",
      "--shadow-lg": "0 10px 30px 0 oklch(0 0 0 / 12%)",
      "--shadow-xl": "0 20px 50px 0 oklch(0 0 0 / 16%)",
    },
    motion: {
      "--duration-fast": "180ms",
      "--duration-normal": "300ms",
      "--duration-slow": "450ms",
      "--ease-standard": "cubic-bezier(0.32, 0.72, 0, 1)",
      "--ease-enter": "cubic-bezier(0.32, 0.72, 0, 1)",
      "--ease-exit": "cubic-bezier(0.4, 0, 1, 1)",
    },
  },

  // Expressive — Nunito, warm tinted neutrals, saturated ladders,
  // big playful shadows, springy motion.
  expressive: {
    font: '"Nunito", "Inter", system-ui, sans-serif',
    primitives: primitives({
      neutral: { hue: 280, chroma: 0.01 },
      blue: 264, green: 142, red: 20, amber: 55,
      chromaScale: 1.25,
    }),
    shadows: {
      "--shadow-sm": "0 2px 4px 0 oklch(0.5 0.22 264 / 10%)",
      "--shadow-md": "0 4px 10px 0 oklch(0.5 0.22 264 / 14%)",
      "--shadow-lg": "0 10px 24px -4px oklch(0.5 0.22 264 / 20%)",
      "--shadow-xl": "0 20px 40px -8px oklch(0.5 0.22 264 / 25%)",
    },
    motion: {
      "--duration-fast": "180ms",
      "--duration-normal": "320ms",
      "--duration-slow": "520ms",
      "--ease-standard": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      "--ease-enter": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      "--ease-exit": "cubic-bezier(0.36, 0, 0.66, -0.56)",
    },
  },
};

// ---------------------------------------------------------------------------
// Tier 2/3 semantic + functional presets per design language.
// ---------------------------------------------------------------------------
const DS_TOKENS: Record<string, TokenMap> = {

  // ---- shadcn Neutral (default) -------------------------------------------
  // Kept as the canonical neutral baseline — zero chroma everywhere.
  // Functional tokens come from the globals.css :root / .dark base.
  shadcn: {},

  // ---- Material Design 3 (Material You) ------------------------------------
  // Primary = blue, Secondary = teal, Tertiary/Accent = purple.
  // Container tokens map to shadcn secondary/accent (light fill + dark text).
  material: {
    "--primary":              "oklch(0.49 0.17 264)",
    "--primary-foreground":   "oklch(1 0 0)",

    // Secondary = teal (on secondary buttons, chips)
    "--secondary":            "oklch(0.52 0.13 195)",
    "--secondary-foreground": "oklch(1 0 0)",

    // Accent = tertiary purple (hover, focus rings, badges)
    "--accent":               "oklch(0.55 0.18 303)",
    "--accent-foreground":    "oklch(1 0 0)",

    // Functional — Material green / amber / blue
    "--success":              "oklch(0.55 0.14 150)",
    "--success-foreground":   "oklch(1 0 0)",
    "--warning":              "oklch(0.75 0.16 80)",
    "--warning-foreground":   "oklch(0.2 0.04 80)",
    "--info":                 "oklch(0.49 0.17 264)",
    "--info-foreground":      "oklch(1 0 0)",

    // Surfaces — subtly tinted blue-grey
    "--background":           "oklch(0.99 0.004 264)",
    "--foreground":           "oklch(0.18 0.02 264)",
    "--card":                 "oklch(0.97 0.008 264)",
    "--card-foreground":      "oklch(0.18 0.02 264)",
    "--muted":                "oklch(0.93 0.015 264)",
    "--muted-foreground":     "oklch(0.45 0.05 264)",
    "--border":               "oklch(0.78 0.04 264)",
    "--input":                "oklch(0.78 0.04 264)",
    "--ring":                 "oklch(0.49 0.17 264)",
    "--destructive":          "oklch(0.53 0.22 27)",
    "--radius":               "0.75rem",
    // Chart palette — blue, teal, purple, amber, red
    "--chart-1":              "oklch(0.49 0.17 264)",
    "--chart-2":              "oklch(0.52 0.13 195)",
    "--chart-3":              "oklch(0.55 0.18 303)",
    "--chart-4":              "oklch(0.7 0.18 55)",
    "--chart-5":              "oklch(0.6 0.22 27)",
  },

  // ---- Fluent Design 2 (Microsoft) ----------------------------------------
  // Primary = cornflower blue, Secondary = teal, Accent = warm amber.
  fluent: {
    "--primary":              "oklch(0.5 0.19 250)",
    "--primary-foreground":   "oklch(1 0 0)",

    // Secondary = Fluent teal (Teams sidebar accent)
    "--secondary":            "oklch(0.52 0.14 195)",
    "--secondary-foreground": "oklch(1 0 0)",

    // Accent = Fluent amber/gold (warning, highlights)
    "--accent":               "oklch(0.75 0.18 70)",
    "--accent-foreground":    "oklch(0.15 0.04 70)",

    // Functional
    "--success":              "oklch(0.55 0.13 150)",
    "--success-foreground":   "oklch(1 0 0)",
    "--warning":              "oklch(0.75 0.18 70)",
    "--warning-foreground":   "oklch(0.15 0.04 70)",
    "--info":                 "oklch(0.5 0.19 250)",
    "--info-foreground":      "oklch(1 0 0)",

    "--background":           "oklch(1 0 0)",
    "--foreground":           "oklch(0.13 0 0)",
    "--card":                 "oklch(0.98 0 0)",
    "--card-foreground":      "oklch(0.13 0 0)",
    "--muted":                "oklch(0.96 0.005 250)",
    "--muted-foreground":     "oklch(0.45 0.02 250)",
    "--border":               "oklch(0.87 0.01 250)",
    "--input":                "oklch(0.87 0.01 250)",
    "--ring":                 "oklch(0.5 0.19 250)",
    "--destructive":          "oklch(0.53 0.22 27)",
    "--radius":               "0.25rem",
    "--chart-1":              "oklch(0.5 0.19 250)",
    "--chart-2":              "oklch(0.52 0.14 195)",
    "--chart-3":              "oklch(0.75 0.18 70)",
    "--chart-4":              "oklch(0.6 0.22 303)",
    "--chart-5":              "oklch(0.55 0.22 27)",
  },

  // ---- IBM Carbon Design System -------------------------------------------
  // Primary = IBM blue, Secondary = teal/cyan, Accent = purple.
  carbon: {
    "--primary":              "oklch(0.55 0.19 250)",
    "--primary-foreground":   "oklch(1 0 0)",

    // Secondary = IBM Cyan 60
    "--secondary":            "oklch(0.52 0.16 214)",
    "--secondary-foreground": "oklch(1 0 0)",

    // Accent = IBM Purple 60
    "--accent":               "oklch(0.5 0.2 303)",
    "--accent-foreground":    "oklch(1 0 0)",

    // Functional — IBM green / amber / blue
    "--success":              "oklch(0.55 0.13 150)",
    "--success-foreground":   "oklch(1 0 0)",
    "--warning":              "oklch(0.7 0.16 75)",
    "--warning-foreground":   "oklch(0.15 0.04 70)",
    "--info":                 "oklch(0.55 0.19 250)",
    "--info-foreground":      "oklch(1 0 0)",

    "--background":           "oklch(0.97 0 0)",
    "--foreground":           "oklch(0.1 0 0)",
    "--card":                 "oklch(1 0 0)",
    "--card-foreground":      "oklch(0.1 0 0)",
    "--muted":                "oklch(0.93 0 0)",
    "--muted-foreground":     "oklch(0.4 0 0)",
    "--border":               "oklch(0.77 0 0)",
    "--input":                "oklch(0.77 0 0)",
    "--ring":                 "oklch(0.55 0.19 250)",
    "--destructive":          "oklch(0.48 0.22 27)",
    "--radius":               "0rem",
    "--chart-1":              "oklch(0.55 0.19 250)",
    "--chart-2":              "oklch(0.52 0.16 214)",
    "--chart-3":              "oklch(0.5 0.2 303)",
    "--chart-4":              "oklch(0.65 0.2 142)",
    "--chart-5":              "oklch(0.7 0.18 55)",
  },

  // ---- Apple Human Interface Guidelines -----------------------------------
  // Primary = Apple blue, Secondary = green, Accent = orange/amber.
  apple: {
    "--primary":              "oklch(0.55 0.2 250)",
    "--primary-foreground":   "oklch(1 0 0)",

    // Secondary = Apple Green
    "--secondary":            "oklch(0.56 0.18 142)",
    "--secondary-foreground": "oklch(1 0 0)",

    // Accent = Apple Orange
    "--accent":               "oklch(0.7 0.2 55)",
    "--accent-foreground":    "oklch(0.15 0.04 55)",

    // Functional — Apple system green / orange / blue
    "--success":              "oklch(0.56 0.18 142)",
    "--success-foreground":   "oklch(1 0 0)",
    "--warning":              "oklch(0.7 0.2 55)",
    "--warning-foreground":   "oklch(0.15 0.04 55)",
    "--info":                 "oklch(0.55 0.2 250)",
    "--info-foreground":      "oklch(1 0 0)",

    "--background":           "oklch(1 0 0)",
    "--foreground":           "oklch(0.07 0 0)",
    "--card":                 "oklch(0.98 0 0)",
    "--card-foreground":      "oklch(0.07 0 0)",
    "--muted":                "oklch(0.96 0.005 250)",
    "--muted-foreground":     "oklch(0.55 0 0)",
    "--border":               "oklch(0.88 0 0)",
    "--input":                "oklch(0.88 0 0)",
    "--ring":                 "oklch(0.55 0.2 250)",
    "--destructive":          "oklch(0.55 0.22 27)",
    "--radius":               "0.625rem",
    "--chart-1":              "oklch(0.55 0.2 250)",
    "--chart-2":              "oklch(0.56 0.18 142)",
    "--chart-3":              "oklch(0.7 0.2 55)",
    "--chart-4":              "oklch(0.6 0.22 27)",
    "--chart-5":              "oklch(0.5 0.2 303)",
  },

  // ---- Expressive (vibrant 3-colour palette) -------------------------------
  // No specific design language — maximally chromatic to show full component
  // colour range. Good for demoing badges, charts and status components.
  expressive: {
    "--primary":              "oklch(0.5 0.22 264)",   // Vivid blue
    "--primary-foreground":   "oklch(1 0 0)",
    "--secondary":            "oklch(0.55 0.2 142)",   // Vivid green
    "--secondary-foreground": "oklch(1 0 0)",
    "--accent":               "oklch(0.6 0.22 303)",   // Vivid purple
    "--accent-foreground":    "oklch(1 0 0)",

    // Functional — vivid green / amber / blue
    "--success":              "oklch(0.6 0.2 150)",
    "--success-foreground":   "oklch(1 0 0)",
    "--warning":              "oklch(0.75 0.19 75)",
    "--warning-foreground":   "oklch(0.15 0.04 70)",
    "--info":                 "oklch(0.55 0.22 264)",
    "--info-foreground":      "oklch(1 0 0)",

    "--background":           "oklch(0.98 0 0)",
    "--foreground":           "oklch(0.1 0 0)",
    "--card":                 "oklch(1 0 0)",
    "--card-foreground":      "oklch(0.1 0 0)",
    "--muted":                "oklch(0.95 0.01 264)",
    "--muted-foreground":     "oklch(0.45 0.05 264)",
    "--border":               "oklch(0.87 0.02 264)",
    "--input":                "oklch(0.87 0.02 264)",
    "--ring":                 "oklch(0.5 0.22 264)",
    "--destructive":          "oklch(0.55 0.25 27)",   // Vivid red
    "--radius":               "0.75rem",
    "--chart-1":              "oklch(0.5 0.22 264)",
    "--chart-2":              "oklch(0.55 0.2 142)",
    "--chart-3":              "oklch(0.6 0.22 303)",
    "--chart-4":              "oklch(0.65 0.22 55)",
    "--chart-5":              "oklch(0.55 0.25 27)",
  },
};

// ---------------------------------------------------------------------------
// DARK semantic presets — each layer's own dark scheme, not generic zinc.
// In dark mode these are merged OVER the light preset, so every layer keeps
// its identity: M3 tonal dark surfaces + light-tone brand colours, Fluent
// graphite + #479ef5, Carbon Gray-90 + Blue-40, Apple #1d1d1f + systemBlue
// dark, Expressive deep violet. shadcn stays {} → handled by `.dark` class.
// All `*-foreground` pairs are chosen for WCAG-readable contrast.
// ---------------------------------------------------------------------------
const DS_DARK: Record<string, TokenMap> = {
  shadcn: {},

  material: {
    "--primary":              "oklch(0.8 0.12 264)",
    "--primary-foreground":   "oklch(0.27 0.09 264)",
    "--secondary":            "oklch(0.8 0.1 195)",
    "--secondary-foreground": "oklch(0.25 0.06 195)",
    "--accent":               "oklch(0.82 0.12 303)",
    "--accent-foreground":    "oklch(0.28 0.09 303)",
    "--success":              "oklch(0.78 0.14 150)",
    "--success-foreground":   "oklch(0.25 0.06 150)",
    "--warning":              "oklch(0.85 0.14 85)",
    "--warning-foreground":   "oklch(0.28 0.06 85)",
    "--info":                 "oklch(0.8 0.12 264)",
    "--info-foreground":      "oklch(0.27 0.09 264)",
    "--background":           "oklch(0.18 0.012 286)",
    "--foreground":           "oklch(0.91 0.015 286)",
    "--card":                 "oklch(0.22 0.014 286)",
    "--card-foreground":      "oklch(0.91 0.015 286)",
    "--popover":              "oklch(0.22 0.014 286)",
    "--popover-foreground":   "oklch(0.91 0.015 286)",
    "--muted":                "oklch(0.28 0.014 286)",
    "--muted-foreground":     "oklch(0.77 0.02 286)",
    "--border":               "oklch(0.36 0.02 286)",
    "--input":                "oklch(0.36 0.02 286)",
    "--ring":                 "oklch(0.8 0.12 264)",
    "--destructive":          "oklch(0.7 0.19 22)",
    "--chart-1":              "oklch(0.78 0.12 264)",
    "--chart-2":              "oklch(0.78 0.1 195)",
    "--chart-3":              "oklch(0.8 0.12 303)",
    "--chart-4":              "oklch(0.8 0.14 55)",
    "--chart-5":              "oklch(0.72 0.16 27)",
  },

  fluent: {
    "--primary":              "oklch(0.68 0.15 245)",
    "--primary-foreground":   "oklch(0.15 0.03 245)",
    "--secondary":            "oklch(0.72 0.12 195)",
    "--secondary-foreground": "oklch(0.18 0.04 195)",
    "--accent":               "oklch(0.8 0.15 70)",
    "--accent-foreground":    "oklch(0.2 0.05 70)",
    "--success":              "oklch(0.72 0.14 150)",
    "--success-foreground":   "oklch(0.18 0.05 150)",
    "--warning":              "oklch(0.8 0.15 70)",
    "--warning-foreground":   "oklch(0.2 0.05 70)",
    "--info":                 "oklch(0.68 0.15 245)",
    "--info-foreground":      "oklch(0.15 0.03 245)",
    "--background":           "oklch(0.24 0 0)",
    "--foreground":           "oklch(0.98 0 0)",
    "--card":                 "oklch(0.28 0 0)",
    "--card-foreground":      "oklch(0.98 0 0)",
    "--popover":              "oklch(0.28 0 0)",
    "--popover-foreground":   "oklch(0.98 0 0)",
    "--muted":                "oklch(0.32 0 0)",
    "--muted-foreground":     "oklch(0.75 0 0)",
    "--border":               "oklch(0.37 0 0)",
    "--input":                "oklch(0.37 0 0)",
    "--ring":                 "oklch(0.68 0.15 245)",
    "--destructive":          "oklch(0.68 0.19 25)",
    "--chart-1":              "oklch(0.68 0.15 245)",
    "--chart-2":              "oklch(0.74 0.12 195)",
    "--chart-3":              "oklch(0.8 0.15 70)",
    "--chart-4":              "oklch(0.74 0.16 303)",
    "--chart-5":              "oklch(0.7 0.18 27)",
  },

  carbon: {
    "--primary":              "oklch(0.7 0.14 262)",
    "--primary-foreground":   "oklch(0.15 0.04 262)",
    "--secondary":            "oklch(0.72 0.13 214)",
    "--secondary-foreground": "oklch(0.16 0.04 214)",
    "--accent":               "oklch(0.72 0.15 303)",
    "--accent-foreground":    "oklch(0.18 0.05 303)",
    "--success":              "oklch(0.72 0.13 150)",
    "--success-foreground":   "oklch(0.17 0.04 150)",
    "--warning":              "oklch(0.8 0.14 80)",
    "--warning-foreground":   "oklch(0.2 0.05 80)",
    "--info":                 "oklch(0.7 0.14 262)",
    "--info-foreground":      "oklch(0.15 0.04 262)",
    "--background":           "oklch(0.205 0 0)",
    "--foreground":           "oklch(0.96 0 0)",
    "--card":                 "oklch(0.27 0 0)",
    "--card-foreground":      "oklch(0.96 0 0)",
    "--popover":              "oklch(0.27 0 0)",
    "--popover-foreground":   "oklch(0.96 0 0)",
    "--muted":                "oklch(0.31 0 0)",
    "--muted-foreground":     "oklch(0.72 0 0)",
    "--border":               "oklch(0.35 0 0)",
    "--input":                "oklch(0.35 0 0)",
    "--ring":                 "oklch(0.7 0.14 262)",
    "--destructive":          "oklch(0.66 0.2 25)",
    "--chart-1":              "oklch(0.7 0.14 262)",
    "--chart-2":              "oklch(0.74 0.13 214)",
    "--chart-3":              "oklch(0.74 0.15 303)",
    "--chart-4":              "oklch(0.76 0.15 142)",
    "--chart-5":              "oklch(0.8 0.14 55)",
  },

  apple: {
    "--primary":              "oklch(0.62 0.19 252)",
    "--primary-foreground":   "oklch(1 0 0)",
    "--secondary":            "oklch(0.76 0.19 148)",
    "--secondary-foreground": "oklch(0.2 0.06 148)",
    "--accent":               "oklch(0.78 0.16 65)",
    "--accent-foreground":    "oklch(0.22 0.06 65)",
    "--success":              "oklch(0.76 0.19 148)",
    "--success-foreground":   "oklch(0.2 0.06 148)",
    "--warning":              "oklch(0.78 0.16 65)",
    "--warning-foreground":   "oklch(0.22 0.06 65)",
    "--info":                 "oklch(0.62 0.19 252)",
    "--info-foreground":      "oklch(1 0 0)",
    "--background":           "oklch(0.21 0.002 270)",
    "--foreground":           "oklch(0.97 0 0)",
    "--card":                 "oklch(0.25 0.003 270)",
    "--card-foreground":      "oklch(0.97 0 0)",
    "--popover":              "oklch(0.25 0.003 270)",
    "--popover-foreground":   "oklch(0.97 0 0)",
    "--muted":                "oklch(0.3 0.003 270)",
    "--muted-foreground":     "oklch(0.72 0 0)",
    "--border":               "oklch(0.36 0.004 270)",
    "--input":                "oklch(0.36 0.004 270)",
    "--ring":                 "oklch(0.62 0.19 252)",
    "--destructive":          "oklch(0.66 0.21 25)",
    "--chart-1":              "oklch(0.62 0.19 252)",
    "--chart-2":              "oklch(0.76 0.19 148)",
    "--chart-3":              "oklch(0.78 0.16 65)",
    "--chart-4":              "oklch(0.7 0.19 27)",
    "--chart-5":              "oklch(0.7 0.17 303)",
  },

  expressive: {
    "--primary":              "oklch(0.72 0.16 264)",
    "--primary-foreground":   "oklch(0.2 0.08 264)",
    "--secondary":            "oklch(0.74 0.17 142)",
    "--secondary-foreground": "oklch(0.22 0.07 142)",
    "--accent":               "oklch(0.75 0.18 303)",
    "--accent-foreground":    "oklch(0.24 0.09 303)",
    "--success":              "oklch(0.74 0.17 150)",
    "--success-foreground":   "oklch(0.2 0.06 150)",
    "--warning":              "oklch(0.82 0.15 75)",
    "--warning-foreground":   "oklch(0.24 0.06 75)",
    "--info":                 "oklch(0.72 0.16 264)",
    "--info-foreground":      "oklch(0.2 0.08 264)",
    "--background":           "oklch(0.19 0.045 300)",
    "--foreground":           "oklch(0.96 0.015 300)",
    "--card":                 "oklch(0.24 0.05 300)",
    "--card-foreground":      "oklch(0.96 0.015 300)",
    "--popover":              "oklch(0.24 0.05 300)",
    "--popover-foreground":   "oklch(0.96 0.015 300)",
    "--muted":                "oklch(0.3 0.055 300)",
    "--muted-foreground":     "oklch(0.78 0.05 300)",
    "--border":               "oklch(0.37 0.06 300)",
    "--input":                "oklch(0.37 0.06 300)",
    "--ring":                 "oklch(0.72 0.16 264)",
    "--destructive":          "oklch(0.7 0.21 25)",
    "--chart-1":              "oklch(0.72 0.16 264)",
    "--chart-2":              "oklch(0.74 0.17 142)",
    "--chart-3":              "oklch(0.75 0.18 303)",
    "--chart-4":              "oklch(0.8 0.16 55)",
    "--chart-5":              "oklch(0.7 0.2 27)",
  },
};

// ---------------------------------------------------------------------------
// Toolbar globals
// ---------------------------------------------------------------------------
export const globalTypes = {
  designSystem: {
    description: "Design system token layer",
    toolbar: {
      title: "Design Layer",
      icon: "grid",
      items: [
        { value: "shadcn",      title: "shadcn Neutral (default)" },
        { value: "material",    title: "Material Design 3" },
        { value: "fluent",      title: "Fluent Design 2 (Microsoft)" },
        { value: "carbon",      title: "Carbon Design (IBM)" },
        { value: "apple",       title: "Apple HIG" },
        { value: "expressive",  title: "Expressive (vivid 3-colour)" },
      ],
      dynamicTitle: true,
    },
    defaultValue: "shadcn",
  },

  radius: {
    description: "Radius override",
    toolbar: {
      title: "Radius",
      icon: "circlehollow",
      items: [
        { value: "",          title: "Layer default" },
        { value: "0rem",      title: "None" },
        { value: "0.3rem",    title: "XS" },
        { value: "0.5rem",    title: "SM" },
        { value: "0.625rem",  title: "Default" },
        { value: "0.75rem",   title: "MD" },
        { value: "1rem",      title: "LG" },
        { value: "1.5rem",    title: "Pill" },
      ],
      dynamicTitle: true,
    },
    defaultValue: "",
  },

  primaryColor: {
    description: "Primary override",
    toolbar: {
      title: "Primary",
      icon: "paintbrush",
      items: [
        { value: "",                     title: "Layer default" },
        { value: "oklch(0.205 0 0)",      title: "Neutral" },
        { value: "oklch(0.5 0.2 264)",    title: "Blue" },
        { value: "oklch(0.55 0.22 142)",  title: "Green" },
        { value: "oklch(0.55 0.25 27)",   title: "Red" },
        { value: "oklch(0.6 0.22 303)",   title: "Purple" },
        { value: "oklch(0.65 0.22 55)",   title: "Amber" },
        { value: "oklch(0.55 0.2 200)",   title: "Teal" },
      ],
      dynamicTitle: true,
    },
    defaultValue: "",
  },

  density: {
    description: "Spacing density",
    toolbar: {
      title: "Density",
      icon: "component",
      items: [
        { value: "compact", title: "Compact" },
        { value: "default", title: "Default" },
        { value: "relaxed", title: "Relaxed" },
      ],
      dynamicTitle: true,
    },
    defaultValue: "default",
  },
};

// Canvas + docs-page surfaces per layer — SB10 ignores appPreviewBg, so the
// preview paints its own backdrop, sets html.dark and publishes the
// --sbdocs-* variables consumed by preview-head.html's docs CSS. The
// bootstrap script in preview-head.html applies the same values BEFORE first
// paint (no flash); this map keeps them in sync on every globals change.
const DOCS_SURFACES: Record<
  string,
  { bg: string; card: string; border: string; text: string; muted: string; lightBg: string }
> = {
  shadcn:     { bg: "#0a0a0a", card: "#18181b", border: "#27272a", text: "#fafafa", muted: "#a1a1aa", lightBg: "#ffffff" },
  material:   { bg: "#141218", card: "#211f26", border: "#49454f", text: "#e6e0e9", muted: "#cac4d0", lightBg: "#fef7ff" },
  fluent:     { bg: "#1f1f1f", card: "#292929", border: "#3d3d3d", text: "#ffffff", muted: "#adadad", lightBg: "#ffffff" },
  carbon:     { bg: "#161616", card: "#262626", border: "#393939", text: "#f4f4f4", muted: "#a8a8a8", lightBg: "#ffffff" },
  apple:      { bg: "#161617", card: "#1d1d1f", border: "#424245", text: "#f5f5f7", muted: "#a1a1a6", lightBg: "#ffffff" },
  expressive: { bg: "#1a1025", card: "#241432", border: "#3b2353", text: "#f3e8ff", muted: "#c4b5fd", lightBg: "#ffffff" },
};

const densityScale: Record<string, string> = {
  compact: "13px",
  default: "14px",
  relaxed: "16px",
};

// Soft fade between Design Layers / dark modes: `.theme-fade` on <html>
// enables colour transitions (CSS in preview-head.html) for the duration of
// the switch only. It must be set BEFORE the new tokens paint, so the
// decorator toggles it synchronously during render when the key changes.
let lastThemeKey: string | null = null;
let themeFadeTimer: ReturnType<typeof setTimeout> | undefined;
function pulseThemeFade(themeKey: string) {
  if (typeof document === "undefined") return;
  if (lastThemeKey !== null && lastThemeKey !== themeKey) {
    document.documentElement.classList.add("theme-fade");
    clearTimeout(themeFadeTimer);
    themeFadeTimer = setTimeout(
      () => document.documentElement.classList.remove("theme-fade"),
      500
    );
  }
  lastThemeKey = themeKey;
}

const preview: Preview = {
  parameters: {
    docs: { theme: docsTheme },
    backgrounds: {
      // No forced default: the backdrop comes from the manager theme's
      // appPreviewBg, which follows the Design Layer and the dark toggle.
      values: [
        { name: "white",       value: "#ffffff" },
        { name: "zinc-50",     value: "#fafafa" },
        { name: "zinc-100",    value: "#f4f4f5" },
        { name: "zinc-950",    value: "#09090b" },
        { name: "transparent", value: "transparent" },
      ],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i }, expanded: true },
    layout: "centered",
    options: {
      storySort: {
        order: [
          "Introduction",
          "Design System",
          ["Color Palette", "Typography", "Spacing", "Elevation", "Radius", "Motion"],
          "Charts",
          [
            "Index",
            "Choosing a Chart",
            "Interactive",
            ["Core", "Flow & Hierarchy", "KPI & Time", "Distributions", "Linked Dashboard"],
            "States",
            "Overview",
            "Flow & Hierarchy",
            "KPI & Time",
            "Distributions",
            "Maps",
            "Network Graphs",
            "Graph Idioms",
          ],
          "Patterns",
          "UI",
        ],
      },
    },
  },

  decorators: [
    (Story, context) => {
      const { designSystem, radius, primaryColor, density, theme } = context.globals as {
        designSystem: string; radius: string; primaryColor: string; density: string; theme?: string;
      };
      const look = LOOK[designSystem] ?? LOOK.shadcn;
      const dark = theme === "dark";
      // Arm the soft fade BEFORE the new tokens hit the DOM.
      pulseThemeFade(`${designSystem}/${dark}`);
      const preset: TokenMap = { ...(DS_TOKENS[designSystem] ?? {}) };
      if (dark) {
        const darkPreset = DS_DARK[designSystem] ?? {};
        if (Object.keys(darkPreset).length > 0) {
          // The layer has its OWN dark scheme — merge it over the light
          // preset so surfaces, brand colours and charts all go layer-dark.
          Object.assign(preset, darkPreset);
        } else {
          // shadcn: hand the surface tokens back to the `.dark` class —
          // inline vars would otherwise override it and lock the canvas light.
          for (const key of [
            "--background", "--foreground",
            "--card", "--card-foreground",
            "--popover", "--popover-foreground",
            "--muted", "--muted-foreground",
            "--border", "--input",
          ]) {
            delete preset[key];
          }
        }
      }
      // Keep the page around the story in sync with the layer + dark toggle:
      // html.dark (docs CSS hook), color-scheme, the --sbdocs-* surface vars
      // and the body/root backdrop. Mirrors preview-head.html's bootstrap.
      React.useEffect(() => {
        const docs = DOCS_SURFACES[designSystem] ?? DOCS_SURFACES.shadcn;
        const bg = dark ? docs.bg : docs.lightBg;
        const rootEl = document.documentElement;
        rootEl.classList.toggle("dark", dark);
        rootEl.style.colorScheme = dark ? "dark" : "light";
        rootEl.style.backgroundColor = bg;
        rootEl.style.setProperty("--sbdocs-bg", docs.bg);
        rootEl.style.setProperty("--sbdocs-card", docs.card);
        rootEl.style.setProperty("--sbdocs-border", docs.border);
        rootEl.style.setProperty("--sbdocs-text", docs.text);
        rootEl.style.setProperty("--sbdocs-muted", docs.muted);
        document.body.style.backgroundColor = bg;
        // Persist the scheme so a reloading iframe (e.g. after a manager
        // shell re-render) boots straight into it — no white flash.
        try {
          window.localStorage.setItem(
            "scntw-globals",
            JSON.stringify({ layer: designSystem, dark })
          );
        } catch {
          /* storage may be unavailable — cosmetic only */
        }
      }, [designSystem, dark]);
      const style: React.CSSProperties & Record<string, string> = {
        // Tier 1: regenerated primitive ladders for this design language
        ...look.primitives,
        // Elevation + motion physics
        ...look.shadows,
        ...look.motion,
        // Tier 2/3: semantic + functional colour preset
        ...preset,
        // Toolbar overrides on top
        ...(radius       ? { "--radius":  radius       } : {}),
        ...(primaryColor ? { "--primary": primaryColor } : {}),
        // Typography
        "--font-sans": look.font,
        fontFamily: look.font,
        fontSize: densityScale[density] ?? "14px",
      };
      return <div style={style} className="contents"><Story /></div>;
    },
    (Story) => <TooltipProvider><Story /></TooltipProvider>,
    withThemeByClassName({ themes: { light: "", dark: "dark" }, defaultTheme: "light" }),
  ],
};

export default preview;
