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

  // Neutral — pure greyscale chrome (canonical = light), near-black accent.
  neutral: create({
    base: "light",
    brandTitle: "ScnTw Design System · Neutral",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#171717",
    colorSecondary: "#171717",
    appBg: "#fafafa",
    appContentBg: "#ffffff",
    appPreviewBg: "#ffffff",
    appBorderColor: "#e5e5e5",
    appBorderRadius: 8,
    textColor: "#171717",
    textMutedColor: "#737373",
    textInverseColor: "#fafafa",
    barBg: "#fafafa",
    barTextColor: "#737373",
    barSelectedColor: "#171717",
    barHoverColor: "#171717",
    inputBg: "#ffffff",
    inputBorder: "#e5e5e5",
    inputTextColor: "#171717",
    inputBorderRadius: 6,
    buttonBg: "#ffffff",
    buttonBorder: "#e5e5e5",
    booleanBg: "#f5f5f5",
    booleanSelectedBg: "#171717",
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

// ---------------------------------------------------------------------------
// DARK shell variants — when the preview's dark toggle is on, the WHOLE
// Storybook UI flips to the layer's dark palette (and vice versa), so the
// surrounding panels never disagree with the components.
// ---------------------------------------------------------------------------
const MANAGER_THEMES_DARK: Record<string, ThemeVars> = {
  // shadcn dark = the original dark zinc chrome.
  shadcn: MANAGER_THEMES.shadcn,

  // Neutral dark — inverted greyscale chrome, near-white accent.
  neutral: create({
    base: "dark",
    brandTitle: "ScnTw Design System · Neutral",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#e5e5e5",
    colorSecondary: "#e5e5e5",
    appBg: "#1f1f1f",
    appContentBg: "#141414",
    appPreviewBg: "#141414",
    appBorderColor: "#333333",
    appBorderRadius: 8,
    textColor: "#f5f5f5",
    textMutedColor: "#a3a3a3",
    textInverseColor: "#171717",
    barBg: "#1f1f1f",
    barTextColor: "#a3a3a3",
    barSelectedColor: "#f5f5f5",
    barHoverColor: "#f5f5f5",
    inputBg: "#262626",
    inputBorder: "#333333",
    inputTextColor: "#f5f5f5",
    inputBorderRadius: 6,
    buttonBg: "#262626",
    buttonBorder: "#333333",
    booleanBg: "#262626",
    booleanSelectedBg: "#e5e5e5",
    fontBase: '"Inter", system-ui, sans-serif',
    fontCode: '"JetBrains Mono", monospace',
  }),

  // Material 3 dark — tonal dark surfaces, dark-scheme primary (#d0bcff).
  material: create({
    base: "dark",
    brandTitle: "ScnTw Design System · Material 3",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#d0bcff",
    colorSecondary: "#d0bcff",
    appBg: "#211f26",          // surface-container dark
    appContentBg: "#141218",   // surface dim
    appPreviewBg: "#141218",
    appBorderColor: "#49454f",
    appBorderRadius: 16,
    textColor: "#e6e0e9",
    textMutedColor: "#cac4d0",
    textInverseColor: "#1d1b20",
    barBg: "#211f26",
    barTextColor: "#cac4d0",
    barSelectedColor: "#d0bcff",
    barHoverColor: "#d0bcff",
    inputBg: "#2b2930",
    inputBorder: "#49454f",
    inputTextColor: "#e6e0e9",
    inputBorderRadius: 12,
    buttonBg: "#4a4458",       // secondary-container dark
    buttonBorder: "#49454f",
    booleanBg: "#2b2930",
    booleanSelectedBg: "#d0bcff",
    fontBase: '"Roboto", system-ui, sans-serif',
    fontCode: '"Roboto Mono", "JetBrains Mono", monospace',
  }),

  // Fluent 2 dark — neutral greys, brighter communication blue.
  fluent: create({
    base: "dark",
    brandTitle: "ScnTw Design System · Fluent 2",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#479ef5",
    colorSecondary: "#479ef5",
    appBg: "#292929",
    appContentBg: "#1f1f1f",
    appPreviewBg: "#1f1f1f",
    appBorderColor: "#3d3d3d",
    appBorderRadius: 4,
    textColor: "#ffffff",
    textMutedColor: "#adadad",
    textInverseColor: "#242424",
    barBg: "#292929",
    barTextColor: "#adadad",
    barSelectedColor: "#479ef5",
    barHoverColor: "#479ef5",
    inputBg: "#2e2e2e",
    inputBorder: "#3d3d3d",
    inputTextColor: "#ffffff",
    inputBorderRadius: 4,
    buttonBg: "#2e2e2e",
    buttonBorder: "#3d3d3d",
    booleanBg: "#2e2e2e",
    booleanSelectedBg: "#479ef5",
    fontBase: '"Segoe UI", system-ui, sans-serif',
    fontCode: '"Cascadia Code", "JetBrains Mono", monospace',
  }),

  // Carbon dark = the Gray-100 shell.
  carbon: MANAGER_THEMES.carbon,

  // Apple HIG dark — macOS dark chrome, dark-mode systemBlue (#0a84ff).
  apple: create({
    base: "dark",
    brandTitle: "ScnTw Design System · Apple HIG",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#0a84ff",
    colorSecondary: "#0a84ff",
    appBg: "#1d1d1f",
    appContentBg: "#161617",
    appPreviewBg: "#161617",
    appBorderColor: "#424245",
    appBorderRadius: 10,
    textColor: "#f5f5f7",
    textMutedColor: "#86868b",
    textInverseColor: "#1d1d1f",
    barBg: "#1d1d1f",
    barTextColor: "#86868b",
    barSelectedColor: "#0a84ff",
    barHoverColor: "#0a84ff",
    inputBg: "#2c2c2e",
    inputBorder: "#424245",
    inputTextColor: "#f5f5f7",
    inputBorderRadius: 8,
    buttonBg: "#2c2c2e",
    buttonBorder: "#424245",
    booleanBg: "#2c2c2e",
    booleanSelectedBg: "#0a84ff",
    fontBase: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
    fontCode: '"SF Mono", ui-monospace, "JetBrains Mono", monospace',
  }),

  // Expressive dark — deep violet shell, luminous accents.
  expressive: create({
    base: "dark",
    brandTitle: "ScnTw Design System · Expressive",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#a78bfa",
    colorSecondary: "#a78bfa",
    appBg: "#1a1025",
    appContentBg: "#140c1d",
    appPreviewBg: "#140c1d",
    appBorderColor: "#4c1d95",
    appBorderRadius: 16,
    textColor: "#ede9fe",
    textMutedColor: "#c4b5fd",
    textInverseColor: "#1a1025",
    barBg: "#1a1025",
    barTextColor: "#c4b5fd",
    barSelectedColor: "#a78bfa",
    barHoverColor: "#f472b6",
    inputBg: "#251433",
    inputBorder: "#4c1d95",
    inputTextColor: "#ede9fe",
    inputBorderRadius: 12,
    buttonBg: "#251433",
    buttonBorder: "#4c1d95",
    booleanBg: "#251433",
    booleanSelectedBg: "#a78bfa",
    fontBase: '"Nunito", "Inter", system-ui, sans-serif',
    fontCode: '"JetBrains Mono", monospace',
  }),
};

// LIGHT shell variants for the layers whose canonical shell is dark.
const MANAGER_THEMES_LIGHT: Record<string, ThemeVars> = {
  ...MANAGER_THEMES,

  // shadcn light — zinc-50 chrome, indigo accent.
  shadcn: create({
    base: "light",
    brandTitle: "ScnTw Design System · Neutral",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#6366f1",
    colorSecondary: "#6366f1",
    appBg: "#fafafa",
    appContentBg: "#ffffff",
    appPreviewBg: "#ffffff",
    appBorderColor: "#e4e4e7",
    appBorderRadius: 8,
    textColor: "#09090b",
    textMutedColor: "#71717a",
    textInverseColor: "#fafafa",
    barBg: "#fafafa",
    barTextColor: "#71717a",
    barSelectedColor: "#6366f1",
    barHoverColor: "#6366f1",
    inputBg: "#ffffff",
    inputBorder: "#e4e4e7",
    inputTextColor: "#09090b",
    inputBorderRadius: 6,
    buttonBg: "#ffffff",
    buttonBorder: "#e4e4e7",
    booleanBg: "#f4f4f5",
    booleanSelectedBg: "#6366f1",
    fontBase: '"Inter", system-ui, sans-serif',
    fontCode: '"JetBrains Mono", monospace',
  }),

  // Carbon light — Gray-10 shell, IBM Blue 60.
  carbon: create({
    base: "light",
    brandTitle: "ScnTw Design System · Carbon",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    colorPrimary: "#0f62fe",
    colorSecondary: "#0f62fe",
    appBg: "#f4f4f4",
    appContentBg: "#ffffff",
    appPreviewBg: "#ffffff",
    appBorderColor: "#e0e0e0",
    appBorderRadius: 0,
    textColor: "#161616",
    textMutedColor: "#525252",
    textInverseColor: "#ffffff",
    barBg: "#f4f4f4",
    barTextColor: "#525252",
    barSelectedColor: "#0f62fe",
    barHoverColor: "#0f62fe",
    inputBg: "#ffffff",
    inputBorder: "#8d8d8d",
    inputTextColor: "#161616",
    inputBorderRadius: 0,
    buttonBg: "#ffffff",
    buttonBorder: "#8d8d8d",
    booleanBg: "#e0e0e0",
    booleanSelectedBg: "#0f62fe",
    fontBase: '"IBM Plex Sans", system-ui, sans-serif',
    fontCode: '"IBM Plex Mono", "JetBrains Mono", monospace',
  }),
};

const LAYER_CLASSES = [...Object.keys(MANAGER_THEMES).map((k) => `ds-${k}`), "ds-dark"];

function buildTheme(layer: string, dark: boolean): ThemeVars {
  const safe = layer in MANAGER_THEMES ? layer : "shadcn";
  return dark ? MANAGER_THEMES_DARK[safe] : MANAGER_THEMES_LIGHT[safe];
}

function applyShell(layer: string, dark: boolean): ThemeVars {
  const safe = layer in MANAGER_THEMES ? layer : "shadcn";
  const theme = buildTheme(safe, dark);
  addons.setConfig({ theme });
  // Class hooks for the deeper per-layer CSS in manager-head.html.
  const html = document.documentElement;
  html.classList.remove(...LAYER_CLASSES);
  html.classList.add(`ds-${safe}`);
  if (dark) html.classList.add("ds-dark");
  return theme;
}

// Bootstrap the shell synchronously from the URL so the very first paint is
// already in the right design language + mode (no flash, no missed sync).
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
  theme: buildTheme(initial.layer, initial.dark),
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
