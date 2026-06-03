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
  {
    rules: {
      // French copy is full of apostrophes (l', d', qu'…) which render fine in
      // JSX. This rule only fights the language; disable it.
      "react/no-unescaped-entities": "off",
      // Supabase query results are dynamically shaped. The proper fix is
      // generated DB types (`supabase gen types typescript`); until then keep
      // these visible as warnings rather than blocking commits.
      "@typescript-eslint/no-explicit-any": "warn",
      // Opinionated newer rule. The search page derives state in an effect and
      // should move to useMemo (tracked follow-up); warn for now, don't block.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
