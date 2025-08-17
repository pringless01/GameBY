// Shared validation helpers (placeholder, no behavior change)
export function isPositiveInt(n) {
  return Number.isInteger(n) && n > 0;
}

export function nonEmptyString(s) {
  return typeof s === 'string' && s.trim().length > 0;
}
