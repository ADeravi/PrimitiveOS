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
// Design-system token presets
// Secondary, accent and tertiary now carry real chromatic values so that
// secondary buttons, hover states and badges all look visually distinct.
// ---------------------------------------------------------------------------
type TokenMap = Record<string, string>;

const DS_TOKENS: Record<string, TokenMap> = {

  // ---- shadcn Neutral (default) -------------------------------------------
  // Kept as the canonical neutral baseline — zero chroma everywhere.
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
      default: "white",
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
  },

  decorators: [
    (Story, context) => {
      const { designSystem, radius, primaryColor, density } = context.globals as {
        designSystem: string; radius: string; primaryColor: string; density: string;
      };
      const preset = DS_TOKENS[designSystem] ?? {};
      const style: React.CSSProperties & Record<string, string> = {
        ...preset,
        ...(radius       ? { "--radius":  radius       } : {}),
        ...(primaryColor ? { "--primary": primaryColor } : {}),
        fontSize: densityScale[density] ?? "14px",
      };
      return <div style={style} className="contents"><Story /></div>;
    },
    (Story) => <TooltipProvider><Story /></TooltipProvider>,
    withThemeByClassName({ themes: { light: "", dark: "dark" }, defaultTheme: "light" }),
  ],
};

export default preview;
