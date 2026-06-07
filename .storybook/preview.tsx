import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { create } from "storybook/theming";
import { TooltipProvider } from "@/components/ui/tooltip";
import "../app/globals.css";

const docsTheme = create({
  base: "dark",
  brandTitle: "ScnTw Design System",
  appBg: "#09090b",
  appContentBg: "#09090b",
  appBorderColor: "#27272a",
  textColor: "#fafafa",
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

const densityScale: Record<string, string> = {
  compact: "13px",
  default: "14px",
  relaxed: "16px",
};

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
      const preset: TokenMap = { ...(DS_TOKENS[designSystem] ?? {}) };
      // In dark mode, hand the surface tokens back to the `.dark` class —
      // inline vars would otherwise override it and lock the canvas light.
      // Brand, functional, chart, radius, primitives, fonts and motion stay.
      if (theme === "dark") {
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
