import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const config = [
  ...compat.config({
    extends: [
      "next/core-web-vitals",
      "next/typescript",
      "standard",
      "plugin:tailwindcss/recommended",
      "prettier",
    ],
    ignorePatterns: ["node_modules/", ".next/", "next-env.d.ts"],
    rules: {
      "no-undef": "off",
    },
    overrides: [
      {
        files: ["*.ts", "*.tsx"],
        rules: {
          "no-undef": "off",
        },
      },
    ],
  }),
];

export default config;
