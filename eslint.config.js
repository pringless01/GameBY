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
  'tools/**'
    ]
  },
  js.configs.recommended,
  { plugins: { import: importPlugin } },
  {
    files: ['**/*.js','**/*.ts'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'import/no-cycle': 'error',
      'no-restricted-imports': ['error', { 
        patterns: [
          { group: ['**/modules/*/!(index|*.service|*.repo).js'], message: 'Service/Repo dışı module iç dosyalara doğrudan import etme.' },
          { group: ['../modules/*/*'], message: 'Farklı domaine relative import yasak; shared/* veya public API kullan.' }
        ]
      }],
      'import/order': ['error', { alphabetize: { order: 'asc', caseInsensitive: true }, 'newlines-between': 'always' }],
      'no-empty': 'off'
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
      // API kaynaklarında geçici: params ve placeholder fonksiyonlar için
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_|req|res|next',
        varsIgnorePattern: '^(getTrustLeaderboardFacade|computeUserRankMeta|encodeCursor|decodeCursor|computeMentorQualityScore|listUserContracts|getMentorshipById|sleep|updateTrust|canAttempt|evt|meta|now|_)$',
        caughtErrors: 'none',
        caughtErrorsIgnorePattern: '^_'
      }]
    }
  },
  // Legacy test konumu: apps/api/tests/** (Node + fetch globals)
  {
    files: ['apps/api/tests/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly'
      }
    },
    rules: { 'no-unused-vars': 'off' }
  },
  // Root scripts (node) için ortam
  {
    files: ['scripts/**/*.js','scripts/**/*.mjs'],
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
  performance: 'readonly',
        Event: 'readonly',
        alert: 'readonly',
        requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
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
