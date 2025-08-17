// Shared DB utilities (placeholder, no behavior change)
export function toUnixTs(date = new Date()) {
  return Math.floor((date instanceof Date ? date : new Date(date)).getTime() / 1000);
}

export function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}
