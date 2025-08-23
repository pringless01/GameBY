(function(){
  const API = '';
  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');
  const loginShell = document.getElementById('loginShell');
  const forceResetForm = document.getElementById('forceResetForm');
  const newPassword = document.getElementById('newPassword');
  const resetStatus = document.getElementById('resetStatus');
  const appMain = document.getElementById('appMain');
  const meInfo = document.getElementById('meInfo');
  const statGrid = document.getElementById('statGrid');
  const adminList = document.getElementById('adminList');
  const auditLog = document.getElementById('auditLog');
  const logoutBtn = document.getElementById('logoutBtn');

  function setStatus(el, type, msg){ el.className = 'status '+type; el.textContent = msg; el.style.display='block'; }
  function saveToken(t){ sessionStorage.setItem('root_admin_token', t); }
  function getToken(){ return sessionStorage.getItem('root_admin_token'); }
  function headers(){ return { 'Authorization':'Bearer '+getToken(), 'Content-Type':'application/json' }; }

  async function login(username, password){
    const r = await fetch(API+'/api/root-admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) });
    const d = await r.json(); if(!r.ok) throw d; return d;
  }
  async function me(){ const r = await fetch(API+'/api/root-admin/me', { headers: headers() }); if(!r.ok) return null; return r.json(); }
  async function changePassword(pw){ const r = await fetch(API+'/api/root-admin/password', { method:'POST', headers: headers(), body: JSON.stringify({ new_password: pw }) }); const d = await r.json(); if(!r.ok) throw d; return d; }
  async function fetchAdmins(){ const r = await fetch(API+'/api/root-admin/admins', { headers: headers() }); if(!r.ok) return []; const d = await r.json(); return d.admins; }
  async function fetchStats(){ const r = await fetch(API+'/api/root-admin/stats/basic', { headers: headers() }); if(!r.ok) return {}; return r.json(); }
  async function fetchAudit(){ // reuse existing audit table limited
    try {
      const r = await fetch('/api/admin/logs/audit?limit=20', { headers: {'Authorization':'Bearer '+getToken()} });
      if(!r.ok) return []; const d = await r.json(); return d.audits||[];
    } catch { return []; }
  }

  function metricBox(title, val){
    const div=document.createElement('div');
    div.className='box';
    div.innerHTML='<h3>'+title+'</h3><div style="font-size:20px;font-weight:600">'+val+'</div>';
    return div;
  }

  async function populate(){
    const stats = await fetchStats();
    statGrid.innerHTML='';
    statGrid.append(
      metricBox('Kullanıcılar', stats.users||0),
      metricBox('Chat Mesajları', stats.chat_messages||0)
    );
    const admins = await fetchAdmins();
    adminList.textContent = JSON.stringify(admins, null, 2);
    const audits = await fetchAudit();
    auditLog.textContent = audits.map(a => `${a.id} [${a.action}] u=${a.user_id} ${a.detail||''} ${a.created_at}`).join('\n') || 'Kayıt yok';
  }

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    if(!u||!p){ setStatus(loginStatus,'error','Eksik alan'); return; }
    setStatus(loginStatus,'info','Giriş yapılıyor...');
    try {
      const d = await login(u,p);
      if(!d || !d.token){
        throw { error: 'token_missing' };
      }
      saveToken(d.token);
      if(d.force_reset){
        loginShell.style.display='none'; forceResetForm.style.display='block';
      } else {
        loginShell.style.display='none'; appMain.style.display='flex';
        const m = await me(); meInfo.textContent = m.username+' • '+(m.roles||[]).join(',');
        populate();
      }
      setStatus(loginStatus,'success','Giriş başarılı');
    } catch(err){ setStatus(loginStatus,'error', err.error || 'Hata'); }
  });

  forceResetForm.addEventListener('submit', async e => {
    e.preventDefault();
    const pw = newPassword.value;
    if(!pw || pw.length < 6){ setStatus(resetStatus,'error','Parola >= 6'); return; }
    setStatus(resetStatus,'info','Güncelleniyor...');
    try { await changePassword(pw); setStatus(resetStatus,'success','Güncellendi'); forceResetForm.style.display='none'; appMain.style.display='flex'; const m=await me(); meInfo.textContent=m.username+' • '+(m.roles||[]).join(','); populate(); }
    catch(err){ setStatus(resetStatus,'error', err.error||'Hata'); }
  });

  logoutBtn.addEventListener('click', ()=>{ sessionStorage.removeItem('root_admin_token'); location.reload(); });

  // Oturum var ise direkt içeri al
  (async () => {
    if(getToken()){
      const m = await me();
      if(m){
        loginShell.style.display='none';
        if(m.force_reset){ forceResetForm.style.display='block'; }
        else { appMain.style.display='flex'; meInfo.textContent=m.username+' • '+(m.roles||[]).join(','); populate(); }
      }
    }
  })();
})();
