export default [
  // Public statik dosyaları lint dışı bırak
  { ignores: ["public/**"] },
  {
    files: ["scripts/**/*.js", "scripts/**/*.ts"],
    languageOptions: {
      globals: { window: "readonly", document: "readonly" }
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
  }
];
