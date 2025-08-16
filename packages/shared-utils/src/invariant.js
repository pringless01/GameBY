export function invariant(cond, msg){
  if(!cond){
    const e = new Error(msg);
    e.code = 'E_INVARIANT';
    throw e;
  }
}
export function shortId(prefix='id'){
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
}
