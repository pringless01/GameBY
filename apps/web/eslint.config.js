export default [
  {
    files: ["**/*.js","**/*.ts"],
    languageOptions: {
      globals: { window: "readonly", document: "readonly" }
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
  }
];
