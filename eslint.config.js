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
  // Frontend (apps/web) henüz lint uyumlu değil; geçici olarak ignore
      'apps/web/**',
      // Duplike eski test konumu
  'apps/api/tests/**',
  // Geçici: api yardımcı scriptleri ve testleri kökten ignore
  'apps/api/src/scripts/**',
  'apps/api/src/tests/**'
    ]
  },
  js.configs.recommended,
  {
    plugins: { import: importPlugin },
    rules: {
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
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
      // Geçici olarak katı kuralları kapatıyoruz; monorepo düzeni tamamlanınca sıkılaştırılacak
      'no-empty': 'off',
      'no-unused-vars': 'off',
      'import/order': 'off'
    }
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
    }
  }
];
