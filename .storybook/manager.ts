import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    base: "dark",
    brandTitle: "ScnTw Design System",
    brandUrl: "https://github.com/ADeravi/ScnTw-Design-system",
    appBg: "#09090b",
    appContentBg: "#09090b",
    appBorderColor: "#27272a",
    appBorderRadius: 8,
    textColor: "#fafafa",
    textMutedColor: "#a1a1aa",
    colorPrimary: "#6366f1",
    colorSecondary: "#6366f1",
    barBg: "#09090b",
    barTextColor: "#a1a1aa",
    barSelectedColor: "#fafafa",
    barHoverColor: "#fafafa",
    inputBg: "#18181b",
    inputBorder: "#27272a",
    inputTextColor: "#fafafa",
    fontBase: '"Inter", system-ui, sans-serif',
    fontCode: '"JetBrains Mono", monospace',
  }),
  sidebar: {
    showRoots: true,
  },
});
