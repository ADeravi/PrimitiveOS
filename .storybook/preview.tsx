import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import "../app/globals.css";

// ---------------------------------------------------------------------------
// Global design-token controls — appear in the Storybook toolbar
// These override the shadcn CSS custom properties on every story root.
// ---------------------------------------------------------------------------
export const globalTypes = {
  radius: {
    description: "Border radius scale",
    toolbar: {
      title: "Radius",
      icon: "circlehollow",
      items: [
        { value: "0rem",    title: "None (square)" },
        { value: "0.3rem",  title: "XS" },
        { value: "0.5rem",  title: "SM" },
        { value: "0.625rem", title: "Default" },
        { value: "0.75rem", title: "MD" },
        { value: "1rem",    title: "LG" },
        { value: "1.5rem",  title: "XL (pill)" },
      ],
      dynamicTitle: true,
    },
    defaultValue: "0.625rem",
  },

  primaryColor: {
    description: "Primary brand colour (OKLCH)",
    toolbar: {
      title: "Primary",
      icon: "paintbrush",
      items: [
        { value: "oklch(0.205 0 0)",          title: "Neutral (default)" },
        { value: "oklch(0.5 0.2 264)",        title: "Blue" },
        { value: "oklch(0.55 0.22 142)",       title: "Green" },
        { value: "oklch(0.55 0.25 27)",        title: "Red" },
        { value: "oklch(0.6 0.22 303)",        title: "Purple" },
        { value: "oklch(0.65 0.22 55)",        title: "Amber" },
        { value: "oklch(0.55 0.2 200)",        title: "Teal" },
      ],
      dynamicTitle: true,
    },
    defaultValue: "oklch(0.205 0 0)",
  },

  density: {
    description: "Spacing density",
    toolbar: {
      title: "Density",
      icon: "component",
      items: [
        { value: "compact",  title: "Compact" },
        { value: "default",  title: "Default" },
        { value: "relaxed",  title: "Relaxed" },
      ],
      dynamicTitle: true,
    },
    defaultValue: "default",
  },
};

// Density maps to font-size scale on the root element
const densityScale: Record<string, string> = {
  compact:  "13px",
  default:  "14px",
  relaxed:  "16px",
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },
    layout: "centered",
  },

  decorators: [
    // 1. Inject global token overrides as inline CSS custom properties
    (Story, context) => {
      const { radius, primaryColor, density } = context.globals as {
        radius: string;
        primaryColor: string;
        density: string;
      };

      const style: React.CSSProperties & Record<string, string> = {
        "--radius":            radius        ?? "0.625rem",
        "--primary":           primaryColor  ?? "oklch(0.205 0 0)",
        fontSize:              densityScale[density] ?? "14px",
      };

      return (
        <div style={style} className="contents">
          <Story />
        </div>
      );
    },

    // 2. Wrap every story in TooltipProvider (required by Tooltip component)
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),

    // 3. Light / dark theme toggle (applies .dark class)
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
