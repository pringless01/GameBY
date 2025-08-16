#!/usr/bin/env node
// Report-only env checker: prints summaries, never fails the build.
// Usage: node scripts/print-env-check.js

const REQUIRED = [
  'JWT_SECRET',
  'CURSOR_SECRET',
  // Optional rotation
  'CURSOR_SECRET_ROTATION',
  // Cursor abuse config
  'CURSOR_INVALID_THRESHOLD',
  'CURSOR_ABUSE_COOLDOWN_MS',
  'CURSOR_AUTO_DEGRADE',
  // Leaderboard rate limiting
  'LB_RATE_WINDOW_MS',
  'LB_RATE_MAX',
];

const OPTIONAL = [
  'OPENAI_API_KEY',
];

function mask(v) {
  if (!v) return '(empty)';
  if (v.length <= 6) return '*'.repeat(v.length);
  return v.slice(0, 3) + '***' + v.slice(-2);
}

function isStrongSecret(name, v, minLen) {
  if (!v) return false;
  return String(v).length >= (minLen || 24);
}

function num(v, def = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function main() {
  const out = [];
  out.push('Env Check (report-only)');
  out.push('Date: ' + new Date().toISOString());
  out.push('--- Required Variables ---');
  for (const k of REQUIRED) {
    const val = process.env[k];
    out.push(`${k}: ${mask(val || '')}`);
  }
  out.push('--- Optional Variables ---');
  for (const k of OPTIONAL) {
    const val = process.env[k];
    out.push(`${k}: ${mask(val || '')}`);
  }

  // Specific guidance
  const warnings = [];
  if (!isStrongSecret('JWT_SECRET', process.env.JWT_SECRET, 32)) {
    warnings.push('JWT_SECRET is missing or too short (>=32 chars recommended).');
  }
  if (!isStrongSecret('CURSOR_SECRET', process.env.CURSOR_SECRET, 24)) {
    warnings.push('CURSOR_SECRET is missing or too short (>=24 chars recommended).');
  }
  const thr = num(process.env.CURSOR_INVALID_THRESHOLD);
  if (thr == null || thr <= 0) warnings.push('CURSOR_INVALID_THRESHOLD should be a positive number.');
  const cd = num(process.env.CURSOR_ABUSE_COOLDOWN_MS);
  if (cd == null || cd < 0) warnings.push('CURSOR_ABUSE_COOLDOWN_MS should be >= 0.');
  const rateW = num(process.env.LB_RATE_WINDOW_MS);
  const rateM = num(process.env.LB_RATE_MAX);
  if (rateW == null || rateM == null) warnings.push('LB_RATE_WINDOW_MS and LB_RATE_MAX should be set for rate limiting.');

  if (warnings.length) {
    out.push('\nWarnings:');
    for (const w of warnings) out.push('- ' + w);
  } else {
    out.push('\nWarnings: none');
  }

  console.log(out.join('\n'));
  process.exit(0); // never fail
}

main();
