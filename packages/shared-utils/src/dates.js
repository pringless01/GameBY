export function msToDays(ms){
  return Math.floor(ms / 86400000);
}

export function clampDayFloor(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d;
}

export function clamp(value, min, max){
  const n = Number(value);
  if(!Number.isFinite(n)) return min;
  if(n < min) return min;
  if(n > max) return max;
  return n;
}
