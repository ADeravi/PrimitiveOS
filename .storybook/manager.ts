import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

const theme = create({
  base: "dark",

  // Brand
  brandTitle: "ScnTw Design System",
  brandUrl: "https://aderavi.github.io/ScnTw-Design-system/",
  brandTarget: "_self",

  // Accent
  colorPrimary: "#fafafa",
  colorSecondary: "#fafafa",

  // App shell (sidebar + toolbar)
  appBg: "#09090b",
  appContentBg: "#09090b",
  appPreviewBg: "#09090b",
  appBorderColor: "#27272a",
  appBorderRadius: 6,

  // Text
  textColor: "#fafafa",
  textInverseColor: "#09090b",
  textMutedColor: "#71717a",

  // Toolbar
  barTextColor: "#71717a",
  barHoverColor: "#fafafa",
  barSelectedColor: "#fafafa",
  barBg: "#09090b",

  // Inputs (controls panel)
  inputBg: "#18181b",
  inputBorder: "#27272a",
  inputTextColor: "#fafafa",
  inputBorderRadius: 6,

  // Typography
  fontBase: '"Inter", system-ui, -apple-system, sans-serif',
  fontCode: '"JetBrains Mono", "Fira Code", monospace',
});

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
  },
});
