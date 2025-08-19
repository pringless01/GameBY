(function(){
  const API = (typeof window !== 'undefined' && window.__API_BASE) ? window.__API_BASE : '';
  const KEY = 'auth_token';
  let navigating = false;
  let lastMe = null, lastTs = 0;

  function getToken(){
    try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY); } catch { return null; }
  }
  function hasToken(){ return !!getToken(); }

  async function verifyToken(){
    // Return cached me if fresh (<3s) to avoid double hops
    if(lastMe && (Date.now()-lastTs)<3000) return lastMe;
    const tk = getToken();
    if(!tk) return null;
    try {
      const controller = new AbortController();
      const t = setTimeout(()=>controller.abort(), 8000);
      const resp = await fetch((API||'') + '/api/auth/me', { headers: { Authorization: 'Bearer ' + tk }, signal: controller.signal });
      clearTimeout(t);
      if(!resp.ok) return null;
      lastMe = await resp.json(); lastTs = Date.now();
      return lastMe;
    } catch { return null; }
  }

  function go(href){ if(navigating) return; navigating = true; setTimeout(()=>{ location.href = href; }, 0); }
  async function isLoggedIn(){
    if(!hasToken()) return false;
    const me = await verifyToken();
    return !!me;
  }
  async function requireAuthOrRedirect(){
    const me = await verifyToken();
    if(!me){ go('/login.html'); return null; }
    return me;
  }

  function clearToken(){
    try{ localStorage.removeItem(KEY); }catch{}
    try{ sessionStorage.removeItem(KEY); }catch{}
  }

  function logout(){
    clearToken();
    try{ sessionStorage.clear(); }catch{}
    go('/login.html');
  }

  window.AuthClient = { getToken, hasToken, verifyToken, isLoggedIn, requireAuthOrRedirect, clearToken, logout };
})();
