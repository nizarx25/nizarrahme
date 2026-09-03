import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Rules enabled as warnings (not errors) so they surface without breaking the
// build. Move to "error" once the codebase is cleaned up.
const warnRules = {
  // TypeScript
  "@typescript-eslint/no-unused-vars": [
    "warn",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
  ],
  "prefer-const": "warn",
  "no-unused-vars": "off", // covered by @typescript-eslint/no-unused-vars
  "no-console": ["warn", { allow: ["warn", "error", "info"] }],
  "no-empty": ["warn", { allowEmptyCatch: true }],

  // React
  "react-hooks/exhaustive-deps": "warn",
  "react/no-unescaped-entities": "warn",
  "react/prop-types": "off", // we use TypeScript
  "react/display-name": "off",
  "react-hooks/purity": "off",
  "react-compiler/react-compiler": "off",

  // TypeScript — still disabled (too noisy for an in-progress refactor)
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-non-null-assertion": "off",
  "@typescript-eslint/ban-ts-comment": "off",
  "@typescript-eslint/prefer-as-const": "off",
  "@typescript-eslint/no-unused-disable-directive": "off",

  // Next.js — still disabled
  "@next/next/no-img-element": "off",
  "@next/next/no-html-link-for-pages": "off",

  // General JS — still disabled (legacy code)
  "no-debugger": "off",
  "no-irregular-whitespace": "off",
  "no-case-declarations": "off",
  "no-fallthrough": "off",
  "no-mixed-spaces-and-tabs": "off",
  "no-redeclare": "off",
  "no-undef": "off",
  "no-unreachable": "off",
  "no-useless-escape": "off",
};

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { rules: warnRules },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "examples/**",
      "skills",
      "scripts/**",
      "prisma/migrations/**",
      // shadcn/ui primitives — mainlined from upstream, lint rules relaxed
      "src/components/ui/carousel.tsx",
      "src/hooks/use-toast.ts",
      "src/hooks/use-mobile.ts",
    ],
  },
];

export default eslintConfig;