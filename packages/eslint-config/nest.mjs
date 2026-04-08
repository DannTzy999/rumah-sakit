import { baseConfig } from "./base.mjs";

/** @type {import("eslint").Linter.FlatConfig[]} */
const nestConfig = [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off"
    }
  }
];

export default nestConfig;
