export function invariant(cond, msg){
  if(!cond){
    const e = new Error(msg);
    e.code = 'E_INVARIANT';
    throw e;
  }
}
