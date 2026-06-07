import { addons } from "storybook/manager-api";
import { create, type ThemeVars } from "storybook/theming";

// ---------------------------------------------------------------------------
// Full Storybook-shell themes — one COMPLETE skin per Design Layer.
// Picking Material/Apple/Fluent/… in the toolbar restyles the entire manager:
// light/dark base, surfaces, bars, inputs, corner radius and chrome font.
// manager-head.html adds per-layer CSS via the `ds-<layer>` class set below.
// ---------------------------------------------------------------------------
const MANAGER_THEMES: Record<string, ThemeVars> = {
  // shadcn Neutral — the original dark zinc chrome.
  shadcn: create({
    base: "dark",
    brandTitle: "ScnTw Design System · Neutral",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#6366f1",
    colorSecondary: "#6366f1",
    appBg: "#09090b",
    appContentBg: "#09090b",
    appPreviewBg: "#ffffff",
    appBorderColor: "#27272a",
    appBorderRadius: 8,
    textColor: "#fafafa",
    textMutedColor: "#a1a1aa",
    textInverseColor: "#09090b",
    barBg: "#09090b",
    barTextColor: "#a1a1aa",
    barSelectedColor: "#fafafa",
    barHoverColor: "#fafafa",
    inputBg: "#18181b",
    inputBorder: "#27272a",
    inputTextColor: "#fafafa",
    inputBorderRadius: 6,
    buttonBg: "#18181b",
    buttonBorder: "#27272a",
    booleanBg: "#18181b",
    booleanSelectedBg: "#6366f1",
    fontBase: '"Inter", system-ui, sans-serif',
    fontCode: '"JetBrains Mono", monospace',
  }),

  // Material 3 — light tonal surfaces, M3 primary purple, Roboto, 16px radius.
  material: create({
    base: "light",
    brandTitle: "ScnTw Design System · Material 3",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#6750a4",
    colorSecondary: "#6750a4",
    appBg: "#f3edf7",          // surface-container
    appContentBg: "#fef7ff",   // surface
    appPreviewBg: "#fef7ff",
    appBorderColor: "#cac4d0", // outline-variant
    appBorderRadius: 16,
    textColor: "#1d1b20",      // on-surface
    textMutedColor: "#49454f", // on-surface-variant
    textInverseColor: "#ffffff",
    barBg: "#f3edf7",
    barTextColor: "#49454f",
    barSelectedColor: "#6750a4",
    barHoverColor: "#6750a4",
    inputBg: "#fef7ff",
    inputBorder: "#cac4d0",
    inputTextColor: "#1d1b20",
    inputBorderRadius: 12,
    buttonBg: "#e8def8",       // secondary-container
    buttonBorder: "#cac4d0",
    booleanBg: "#e8def8",
    booleanSelectedBg: "#6750a4",
    fontBase: '"Roboto", system-ui, sans-serif',
    fontCode: '"Roboto Mono", "JetBrains Mono", monospace',
  }),

  // Fluent 2 — quiet light grey, communication blue, Segoe UI, 4px corners.
  fluent: create({
    base: "light",
    brandTitle: "ScnTw Design System · Fluent 2",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#0f6cbd",
    colorSecondary: "#0f6cbd",
    appBg: "#f5f5f5",
    appContentBg: "#ffffff",
    appPreviewBg: "#ffffff",
    appBorderColor: "#e0e0e0",
    appBorderRadius: 4,
    textColor: "#242424",
    textMutedColor: "#616161",
    textInverseColor: "#ffffff",
    barBg: "#f5f5f5",
    barTextColor: "#616161",
    barSelectedColor: "#0f6cbd",
    barHoverColor: "#0f6cbd",
    inputBg: "#ffffff",
    inputBorder: "#d1d1d1",
    inputTextColor: "#242424",
    inputBorderRadius: 4,
    buttonBg: "#ffffff",
    buttonBorder: "#d1d1d1",
    booleanBg: "#f5f5f5",
    booleanSelectedBg: "#0f6cbd",
    fontBase: '"Segoe UI", system-ui, sans-serif',
    fontCode: '"Cascadia Code", "JetBrains Mono", monospace',
  }),

  // IBM Carbon — Gray-100 flat dark shell, IBM Blue 40 selection, Plex, 0px.
  carbon: create({
    base: "dark",
    brandTitle: "ScnTw Design System · Carbon",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#4589ff",
    colorSecondary: "#4589ff",
    appBg: "#161616",
    appContentBg: "#161616",
    appPreviewBg: "#ffffff",
    appBorderColor: "#393939",
    appBorderRadius: 0,
    textColor: "#f4f4f4",
    textMutedColor: "#8d8d8d",
    textInverseColor: "#161616",
    barBg: "#161616",
    barTextColor: "#8d8d8d",
    barSelectedColor: "#78a9ff",
    barHoverColor: "#78a9ff",
    inputBg: "#262626",
    inputBorder: "#393939",
    inputTextColor: "#f4f4f4",
    inputBorderRadius: 0,
    buttonBg: "#262626",
    buttonBorder: "#393939",
    booleanBg: "#262626",
    booleanSelectedBg: "#0f62fe",
    fontBase: '"IBM Plex Sans", system-ui, sans-serif',
    fontCode: '"IBM Plex Mono", "JetBrains Mono", monospace',
  }),

  // Apple HIG — near-white macOS chrome, hairlines, systemBlue, SF stack.
  apple: create({
    base: "light",
    brandTitle: "ScnTw Design System · Apple HIG",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#0071e3",
    colorSecondary: "#0071e3",
    appBg: "#f5f5f7",
    appContentBg: "#ffffff",
    appPreviewBg: "#ffffff",
    appBorderColor: "#d2d2d7",
    appBorderRadius: 10,
    textColor: "#1d1d1f",
    textMutedColor: "#6e6e73",
    textInverseColor: "#ffffff",
    barBg: "#f5f5f7",
    barTextColor: "#6e6e73",
    barSelectedColor: "#0071e3",
    barHoverColor: "#0071e3",
    inputBg: "#ffffff",
    inputBorder: "#d2d2d7",
    inputTextColor: "#1d1d1f",
    inputBorderRadius: 8,
    buttonBg: "#ffffff",
    buttonBorder: "#d2d2d7",
    booleanBg: "#e8e8ed",
    booleanSelectedBg: "#0071e3",
    fontBase: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
    fontCode: '"SF Mono", ui-monospace, "JetBrains Mono", monospace',
  }),

  // Expressive — tinted lavender shell, violet/pink accents, Nunito, 16px.
  expressive: create({
    base: "light",
    brandTitle: "ScnTw Design System · Expressive",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#8b5cf6",
    colorSecondary: "#8b5cf6",
    appBg: "#faf5ff",
    appContentBg: "#ffffff",
    appPreviewBg: "#ffffff",
    appBorderColor: "#e9d5ff",
    appBorderRadius: 16,
    textColor: "#3b0764",
    textMutedColor: "#7e22ce",
    textInverseColor: "#ffffff",
    barBg: "#faf5ff",
    barTextColor: "#7e22ce",
    barSelectedColor: "#8b5cf6",
    barHoverColor: "#ec4899",
    inputBg: "#ffffff",
    inputBorder: "#e9d5ff",
    inputTextColor: "#3b0764",
    inputBorderRadius: 12,
    buttonBg: "#f3e8ff",
    buttonBorder: "#e9d5ff",
    booleanBg: "#f3e8ff",
    booleanSelectedBg: "#8b5cf6",
    fontBase: '"Nunito", "Inter", system-ui, sans-serif',
    fontCode: '"JetBrains Mono", monospace',
  }),
};

const LAYER_CLASSES = Object.keys(MANAGER_THEMES).map((k) => `ds-${k}`);

// Canvas backdrop per layer when the preview's dark toggle is on, so the
// area AROUND the story matches the story's own dark surface.
const DARK_PREVIEW_BG: Record<string, string> = {
  shadcn: "#0a0a0a",
  material: "#141218", // M3 dark surface
  fluent: "#1f1f1f",
  carbon: "#161616",
  apple: "#161617",
  expressive: "#1a1025",
};

function buildTheme(layer: string, dark: boolean): ThemeVars {
  const base = MANAGER_THEMES[layer] ?? MANAGER_THEMES.shadcn;
  return {
    ...base,
    appPreviewBg: dark ? (DARK_PREVIEW_BG[layer] ?? "#0a0a0a") : base.appPreviewBg,
  };
}

function applyShell(layer: string, dark: boolean): ThemeVars {
  const safe = layer in MANAGER_THEMES ? layer : "shadcn";
  const theme = buildTheme(safe, dark);
  addons.setConfig({ theme });
  // Class hook for the deeper per-layer CSS in manager-head.html.
  const html = document.documentElement;
  html.classList.remove(...LAYER_CLASSES);
  html.classList.add(`ds-${safe}`);
  return theme;
}

// Bootstrap the shell synchronously from the URL so the very first paint is
// already in the right design language (no neutral flash, no missed sync).
function globalsFromUrl(): { layer: string; dark: boolean } {
  try {
    const raw = new URLSearchParams(window.location.search).get("globals") ?? "";
    const map: Record<string, string> = {};
    for (const pair of raw.split(";")) {
      const [k, v] = pair.split(":").map(decodeURIComponent);
      if (k) map[k] = v ?? "";
    }
    return { layer: map.designSystem ?? "shadcn", dark: map.theme === "dark" };
  } catch {
    return { layer: "shadcn", dark: false };
  }
}

const initial = globalsFromUrl();

addons.setConfig({
  theme: buildTheme(initial.layer in MANAGER_THEMES ? initial.layer : "shadcn", initial.dark),
  sidebar: {
    showRoots: true,
  },
});
applyShell(initial.layer, initial.dark);

// Keep the whole shell in sync with the preview's `designSystem` global and
// its light/dark toggle. IMPORTANT: read globals from the EVENT PAYLOAD —
// api.getGlobals() can still hold the previous values when the event fires.
addons.register("scntw/dynamic-manager-theme", (api) => {
  let current = `${initial.layer}/${initial.dark}`;
  const sync = (args?: { globals?: Record<string, unknown> }) => {
    try {
      const globals =
        (args && args.globals) ??
        ((api.getGlobals?.() ?? {}) as Record<string, unknown>);
      const layer = (globals.designSystem as string) ?? "shadcn";
      const dark = globals.theme === "dark";
      const key = `${layer}/${dark}`;
      if (key === current) return;
      current = key;
      const theme = applyShell(layer, dark);
      // setOptions forces an immediate re-render of the manager UI.
      (api as unknown as { setOptions?: (o: object) => void }).setOptions?.({ theme });
    } catch {
      /* shell sync is best-effort */
    }
  };
  // SET_GLOBALS fires when the preview announces globals (incl. from the URL);
  // GLOBALS_UPDATED fires on every toolbar change.
  api.on("setGlobals", sync);
  api.on("globalsUpdated", sync);
});
