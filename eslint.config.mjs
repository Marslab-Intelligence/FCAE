import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".next_build/**",
      ".next_sid/**",
      "tmp/**",
      "node_modules/**",
      "drizzle/**",
      "public/**",
    ],
  },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]

export default eslintConfig
