import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Encourage explicit, narrow imports.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // Catch dead variables — but allow underscore-prefixed names for
      // intentional ignores (e.g. unused destructured props).
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // We rely on `as const` quite a bit; this rule is too aggressive otherwise.
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
