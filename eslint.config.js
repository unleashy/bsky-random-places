import globals from "globals";
import js from "@eslint/js";
import ts from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";
import prettier from "eslint-config-prettier";
import sonarjs from "eslint-plugin-sonarjs";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  ...ts.configs.strictTypeChecked,
  unicorn.configs["flat/recommended"],
  prettier,
  {
    plugins: { sonarjs },
    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        ...globals.es2024,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        { allowConstantLoopConditions: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowBoolean: true,
          allowNumber: true,
        },
      ],
      eqeqeq: ["error", "always"],
      "no-constant-condition": "off",
      "no-useless-escape": "off",
      "prefer-const": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/no-this-assignment": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/prefer-spread": "off",
      "unicorn/prefer-ternary": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          allowList: {
            i: true,
            args: true,
            env: true,
            Env: true,
          },
        },
      ],
      "sonarjs/cognitive-complexity": ["error", 10],
    },
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    ...ts.configs.disableTypeChecked,
  },
  {
    ignores: [".yarn/", "node_modules/", "coverage/"],
  },
);
