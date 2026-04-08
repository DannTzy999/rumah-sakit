import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/prisma/generated/**"
    ]
  },
  js.configs.recommended,
  prettier,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: false
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      "unused-imports": unusedImports
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
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
        },
      ],
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    files: ["**/*.js"],
    rules: {
      "no-undef": "off"
    }
  }
];

