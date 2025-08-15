// ESLint v9 flat config (keeps parity with existing .eslintrc.json)
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import nPlugin from 'eslint-plugin-n';
import promisePlugin from 'eslint-plugin-promise';

export default [
  {
    ignores: ['migrations/**', 'coverage/**', 'node_modules/**']
  },
  js.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      n: nPlugin,
      promise: promisePlugin
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node-like globals for server code
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        global: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^e$|^err$', varsIgnorePattern: '^_' , caughtErrors: 'none' }],
      'no-console': 'off',
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
      'n/no-process-env': 'off',
      // allow empty catch blocks, but still warn on other empty blocks
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  // Overrides for browser-targeted scripts
  {
    files: ['public/**/*.js'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        location: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly'
      }
    }
  },
  // Test overrides
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly'
      }
    }
  }
];
