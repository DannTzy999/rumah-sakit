import { baseConfig } from "./base.mjs";

/** @type {import("eslint").Linter.FlatConfig[]} */
const nextConfig = [
  ...baseConfig,
  {
    files: ["**/*.{tsx,jsx}"],
    rules: {
      "react/react-in-jsx-scope": "off"
    }
  }
];

export default nextConfig;
