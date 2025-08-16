import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      // Legacy folders kept during monorepo migration (lint dışı)
      'server/**',
      'frontend/**',
  'tools/**',
    // Duplike eski test konumu
  'apps/api/tests/**'
    ]
  },
  js.configs.recommended,
  { plugins: { import: importPlugin } },
  {
    files: ['**/*.js','**/*.ts'],
    rules: {
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none', caughtErrorsIgnorePattern: '^_' }],
      'import/order': ['error', { alphabetize: { order: 'asc', caseInsensitive: true }, 'newlines-between': 'always' }]
    }
  },
  // apps/api için Node ortamı ve kurallar
  {
    files: ['apps/api/src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
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
      // Kademeli açılış: bu klasörde unused-vars ve import/order şimdilik kapalı
      'no-empty': 'off',
      'no-unused-vars': 'off',
      'import/order': 'off'
    }
  },
  // Root scripts (node) için ortam
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', Buffer: 'readonly' }
    },
    rules: { 'no-unused-vars': 'off' }
  },
  // apps/api public (browser) scriptleri için tarayıcı global’leri
  {
    files: ['apps/api/src/public/**/*.js', 'apps/api/public/**/*.js'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        location: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        Notification: 'readonly',
        alert: 'readonly',
        requestAnimationFrame: 'readonly',
        io: 'readonly',
        gtag: 'readonly',
        Audio: 'readonly',
        URL: 'readonly'
      }
    }
  },
  // apps/api migrations (node) için globals
  {
    files: ['apps/api/migrations/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly'
      }
    }
  },
  // apps/api test dosyaları için test global’leri
  {
    files: ['apps/api/src/tests/**/*.js'],
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
    },
    rules: { 'no-unused-vars': 'off' }
  },
  // apps/web public (browser) scriptleri için tarayıcı global’leri ve geçici gevşetmeler
  {
    files: ['apps/web/public/**/*.js'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        location: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        Notification: 'readonly',
        Event: 'readonly',
        alert: 'readonly',
        requestAnimationFrame: 'readonly',
        io: 'readonly',
        gtag: 'readonly',
        Audio: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        AbortController: 'readonly'
      }
    },
    rules: {
      'no-empty': 'off',
      'no-unused-vars': 'off',
      'no-dupe-class-members': 'off',
      'no-self-assign': 'off'
    }
  },
  // apps/web scriptleri (node) için ortam
  {
    files: ['apps/web/scripts/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off'
    }
  }
];
