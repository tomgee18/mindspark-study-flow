import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        React: "readonly",
      },
      parserOptions: {
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Base ESLint rules
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-unused-vars": "off", // TypeScript handles this
      "no-use-before-define": "off", // TypeScript handles this
      "no-duplicate-imports": "error",
      "no-template-curly-in-string": "warn",
      "no-unreachable": "error",
      "curly": ["error", "all"],
      "eqeqeq": ["error", "always", { "null": "ignore" }],
      "prefer-const": "error",
      
      // React specific rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      
      // TypeScript specific rules - with safer defaults
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-function": ["warn", { "allow": ["arrowFunctions", "functions", "methods"] }],
      "@typescript-eslint/ban-ts-comment": ["warn", {
        "ts-ignore": "allow-with-description",
        "ts-expect-error": "allow-with-description"
      }],
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
    },
  },
  // JavaScript files
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        React: "readonly",
      },
    },
    rules: {
      // Base ESLint rules for JS files
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  }
);