export function msToDays(ms){
  return Math.floor(ms / 86400000);
}

export function clampDayFloor(date){
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d;
}
