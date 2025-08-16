// @gameby/shared-auth
export function readToken(h='') { return (h||'').replace(/^Bearer\s+/i,''); }
