import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/** @type {import("eslint").Linter.FlatConfig[]} */
const config = [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "coverage/**", "next-env.d.ts"]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettier,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true }
        }
      ]
    }
  }
];

export default config;
