(function(){
  const API = (typeof window !== 'undefined' && window.__API_BASE) ? window.__API_BASE : '';
  const KEY = 'auth_token';

  function getToken(){
    try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY); } catch { return null; }
  }

  async function verifyToken(){
    const tk = getToken();
    if(!tk) return null;
    try {
      const resp = await fetch((API||'') + '/api/auth/me', { headers: { Authorization: 'Bearer ' + tk } });
      if(!resp.ok) return null;
      return await resp.json();
    } catch { return null; }
  }

  async function requireAuthOrRedirect(){
    const me = await verifyToken();
    if(!me){ location.href = '/login.html'; return null; }
    return me;
  }

  window.AuthClient = { getToken, verifyToken, requireAuthOrRedirect };
})();
