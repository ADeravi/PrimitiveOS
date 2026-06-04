import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { create } from "storybook/theming";
import { TooltipProvider } from "@/components/ui/tooltip";
import "../app/globals.css";

// ---------------------------------------------------------------------------
// Docs panel theme
// ---------------------------------------------------------------------------
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
// Each entry overrides the shadcn CSS custom properties to match the target
// design language. Only the tokens that differ from shadcn neutral are listed.
// ---------------------------------------------------------------------------
type TokenMap = Record<string, string>;

const DS_TOKENS: Record<string, TokenMap> = {
  shadcn: {
    // Neutral defaults — no overrides needed
  },

  material: {
    // Material Design 3 (Material You) — tonal blue palette
    "--primary":              "oklch(0.49 0.17 264)",  // M3 Primary (blue)
    "--primary-foreground":   "oklch(1 0 0)",
    "--secondary":            "oklch(0.87 0.06 200)",  // M3 Secondary container
    "--secondary-foreground":  "oklch(0.2 0.06 200)",
    "--accent":               "oklch(0.88 0.04 280)",  // M3 Tertiary container
    "--accent-foreground":    "oklch(0.2 0.06 280)",
    "--background":           "oklch(0.99 0.004 264)", // M3 Surface
    "--foreground":           "oklch(0.2 0.02 264)",   // M3 On-surface
    "--card":                 "oklch(0.96 0.01 264)",  // M3 Surface-container
    "--card-foreground":      "oklch(0.2 0.02 264)",
    "--muted":                "oklch(0.93 0.02 264)",  // M3 Surface-variant
    "--muted-foreground":     "oklch(0.45 0.05 264)",
    "--border":               "oklch(0.76 0.04 264)",  // M3 Outline-variant
    "--input":                "oklch(0.76 0.04 264)",
    "--ring":                 "oklch(0.49 0.17 264)",
    "--destructive":          "oklch(0.53 0.22 27)",   // M3 Error
    "--radius":               "0.75rem",               // M3 uses more rounding (12px base)
  },

  fluent: {
    // Microsoft Fluent Design 2 — neutral + accent blue
    "--primary":              "oklch(0.5 0.19 250)",   // Fluent Accent Blue
    "--primary-foreground":   "oklch(1 0 0)",
    "--secondary":            "oklch(0.95 0 0)",       // Subtle fill
    "--secondary-foreground":  "oklch(0.1 0 0)",
    "--accent":               "oklch(0.93 0.01 250)",  // Subtle accent
    "--accent-foreground":    "oklch(0.2 0.05 250)",
    "--background":           "oklch(1 0 0)",
    "--foreground":           "oklch(0.13 0 0)",
    "--card":                 "oklch(0.98 0 0)",
    "--card-foreground":      "oklch(0.13 0 0)",
    "--muted":                "oklch(0.97 0 0)",
    "--muted-foreground":     "oklch(0.45 0 0)",
    "--border":               "oklch(0.86 0 0)",
    "--input":                "oklch(0.86 0 0)",
    "--ring":                 "oklch(0.5 0.19 250)",
    "--destructive":          "oklch(0.53 0.22 27)",
    "--radius":               "0.25rem",               // Fluent uses tighter radii (4px)
  },

  carbon: {
    // IBM Carbon Design System — flat, sharp, blue-grey
    "--primary":              "oklch(0.55 0.19 250)",  // IBM Blue 60
    "--primary-foreground":   "oklch(1 0 0)",
    "--secondary":            "oklch(0.93 0 0)",
    "--secondary-foreground":  "oklch(0.1 0 0)",
    "--accent":               "oklch(0.9 0 0)",
    "--accent-foreground":    "oklch(0.1 0 0)",
    "--background":           "oklch(0.97 0 0)",       // Carbon White
    "--foreground":           "oklch(0.1 0 0)",
    "--card":                 "oklch(1 0 0)",
    "--card-foreground":      "oklch(0.1 0 0)",
    "--muted":                "oklch(0.93 0 0)",
    "--muted-foreground":     "oklch(0.4 0 0)",
    "--border":               "oklch(0.77 0 0)",       // Carbon UI-03
    "--input":                "oklch(0.77 0 0)",
    "--ring":                 "oklch(0.55 0.19 250)",
    "--destructive":          "oklch(0.48 0.22 27)",
    "--radius":               "0rem",                  // Carbon is strictly square
  },

  apple: {
    // Apple Human Interface Guidelines — SF-style, tinted greys
    "--primary":              "oklch(0.55 0.2 250)",   // Apple Blue
    "--primary-foreground":   "oklch(1 0 0)",
    "--secondary":            "oklch(0.96 0.005 250)", // Apple secondarySystemBackground
    "--secondary-foreground":  "oklch(0.2 0 0)",
    "--accent":               "oklch(0.93 0.01 250)",
    "--accent-foreground":    "oklch(0.2 0 0)",
    "--background":           "oklch(1 0 0)",
    "--foreground":           "oklch(0.07 0 0)",       // Apple label
    "--card":                 "oklch(0.98 0 0)",
    "--card-foreground":      "oklch(0.07 0 0)",
    "--muted":                "oklch(0.96 0.005 250)",
    "--muted-foreground":     "oklch(0.55 0 0)",       // Apple secondaryLabel
    "--border":               "oklch(0.88 0 0)",       // Apple separator
    "--input":                "oklch(0.88 0 0)",
    "--ring":                 "oklch(0.55 0.2 250)",
    "--destructive":          "oklch(0.55 0.22 27)",   // Apple Red
    "--radius":               "0.625rem",              // Apple uses ~10px
  },
};

// ---------------------------------------------------------------------------
// Global toolbar controls
// ---------------------------------------------------------------------------
export const globalTypes = {
  designSystem: {
    description: "Design system token layer",
    toolbar: {
      title: "Design Layer",
      icon: "grid",
      items: [
        { value: "shadcn",   title: "shadcn Neutral (default)" },
        { value: "material", title: "Material Design 3" },
        { value: "fluent",   title: "Fluent Design 2 (Microsoft)" },
        { value: "carbon",   title: "Carbon Design (IBM)" },
        { value: "apple",    title: "Apple HIG" },
      ],
      dynamicTitle: true,
    },
    defaultValue: "shadcn",
  },

  radius: {
    description: "Border radius override (overrides design layer)",
    toolbar: {
      title: "Radius",
      icon: "circlehollow",
      items: [
        { value: "",          title: "Layer default" },
        { value: "0rem",      title: "None (square)" },
        { value: "0.3rem",    title: "XS" },
        { value: "0.5rem",    title: "SM" },
        { value: "0.625rem",  title: "Default" },
        { value: "0.75rem",   title: "MD" },
        { value: "1rem",      title: "LG" },
        { value: "1.5rem",    title: "XL (pill)" },
      ],
      dynamicTitle: true,
    },
    defaultValue: "",
  },

  primaryColor: {
    description: "Primary colour override (overrides design layer)",
    toolbar: {
      title: "Primary",
      icon: "paintbrush",
      items: [
        { value: "",                      title: "Layer default" },
        { value: "oklch(0.205 0 0)",       title: "Neutral" },
        { value: "oklch(0.5 0.2 264)",     title: "Blue" },
        { value: "oklch(0.55 0.22 142)",   title: "Green" },
        { value: "oklch(0.55 0.25 27)",    title: "Red" },
        { value: "oklch(0.6 0.22 303)",    title: "Purple" },
        { value: "oklch(0.65 0.22 55)",    title: "Amber" },
        { value: "oklch(0.55 0.2 200)",    title: "Teal" },
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
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
      expanded: true,
    },
    layout: "centered",
  },

  decorators: [
    // 1. Apply design-system token layer, then individual overrides on top
    (Story, context) => {
      const { designSystem, radius, primaryColor, density } = context.globals as {
        designSystem: string;
        radius: string;
        primaryColor: string;
        density: string;
      };

      // Start with the selected design system preset
      const preset = DS_TOKENS[designSystem] ?? {};

      // Individual overrides take priority when explicitly set
      const style: React.CSSProperties & Record<string, string> = {
        ...preset,
        ...(radius       ? { "--radius":  radius       } : {}),
        ...(primaryColor ? { "--primary": primaryColor } : {}),
        fontSize: densityScale[density] ?? "14px",
      };

      return (
        <div style={style} className="contents">
          <Story />
        </div>
      );
    },

    // 2. TooltipProvider
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),

    // 3. Light / dark toggle
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
