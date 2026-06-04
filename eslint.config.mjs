import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Relax React-compiler lint rules for shadcn-generated primitives.
  // These patterns (setState in effects, Math.random in memo, ref.current access)
  // are intentional in the upstream shadcn source and safe to suppress here.
  {
    files: ["components/ui/**/*.tsx", "hooks/**/*.ts"],
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-compiler/react-compiler": "off",
    },
  },
]);

export default eslintConfig;
