import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// ---------------------------------------------------------------------------
// Manager chrome themes — one per Design Layer. When the toolbar's Design
// Layer global changes, the whole Storybook shell (brand title, accents,
// selection colours, fonts) follows the chosen design language.
// ---------------------------------------------------------------------------
const mk = (label: string, accent: string, accentSoft: string, font: string) =>
  create({
    base: "dark",
    brandTitle: `ScnTw Design System · ${label}`,
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    appBg: "#09090b",
    appContentBg: "#09090b",
    appBorderColor: "#27272a",
    appBorderRadius: 8,
    textColor: "#fafafa",
    textMutedColor: "#a1a1aa",
    colorPrimary: accent,
    colorSecondary: accent,
    barBg: "#09090b",
    barTextColor: "#a1a1aa",
    barSelectedColor: accentSoft,
    barHoverColor: accentSoft,
    inputBg: "#18181b",
    inputBorder: "#27272a",
    inputTextColor: "#fafafa",
    booleanSelectedBg: accent,
    fontBase: font,
    fontCode: '"JetBrains Mono", monospace',
  });

const MANAGER_THEMES: Record<string, ReturnType<typeof create>> = {
  shadcn:     mk("Neutral",    "#6366f1", "#fafafa", '"Inter", system-ui, sans-serif'),
  material:   mk("Material 3", "#4285f4", "#a8c7fa", '"Roboto", system-ui, sans-serif'),
  fluent:     mk("Fluent 2",   "#2886de", "#479ef5", '"Segoe UI", system-ui, sans-serif'),
  carbon:     mk("Carbon",     "#0f62fe", "#78a9ff", '"IBM Plex Sans", system-ui, sans-serif'),
  apple:      mk("Apple HIG",  "#0a84ff", "#64b5ff", '-apple-system, BlinkMacSystemFont, system-ui, sans-serif'),
  expressive: mk("Expressive", "#8b5cf6", "#f472b6", '"Nunito", "Inter", system-ui, sans-serif'),
};

addons.setConfig({
  theme: MANAGER_THEMES.shadcn,
  sidebar: {
    showRoots: true,
  },
});

// Sync the manager theme with the preview's `designSystem` global, so the
// whole Storybook shell follows the Design Layer toolbar.
addons.register("scntw/dynamic-manager-theme", (api) => {
  let current = "shadcn";
  const sync = () => {
    try {
      const globals = (api.getGlobals?.() ?? {}) as { designSystem?: string };
      const layer = globals.designSystem ?? "shadcn";
      if (layer === current) return;
      current = layer;
      const theme = MANAGER_THEMES[layer] ?? MANAGER_THEMES.shadcn;
      addons.setConfig({ theme });
      // setOptions triggers an immediate manager re-render with the new theme.
      (api as unknown as { setOptions?: (o: object) => void }).setOptions?.({ theme });
    } catch {
      /* manager theme sync is best-effort */
    }
  };
  // SET_GLOBALS fires when the preview announces globals (incl. from the URL);
  // GLOBALS_UPDATED fires on every toolbar change.
  api.on("setGlobals", sync);
  api.on("globalsUpdated", sync);
});
