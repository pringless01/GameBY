(() => {
  const API = '/api/admin-core';
  const LS = 'sys_admin_token';
  const loginView = document.getElementById('loginView');
  const forceResetView = document.getElementById('forceResetView');
  const appMain = document.getElementById('appMain');
  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');
  const resetForm = document.getElementById('resetForm');
  const resetStatus = document.getElementById('resetStatus');
  const logoutBtn = document.getElementById('logoutBtn');
  const meBadge = document.getElementById('meBadge');
  const metricsGrid = document.getElementById('metricsGrid');
  const quickInfo = document.getElementById('quickInfo');
  const navTabs = document.getElementById('navTabs');
  const auditLog = document.getElementById('auditLog');
  const auditReload = document.getElementById('auditReload');
  const auditFilterAction = document.getElementById('auditFilterAction');
  const adminTable = document.getElementById('adminTable').querySelector('tbody');
  const createAdminForm = document.getElementById('createAdminForm');
  const createAdminStatus = document.getElementById('createAdminStatus');
  const lockForm = document.getElementById('lockForm');
  const lockStatus = document.getElementById('lockStatus');
  const resetPwForm = document.getElementById('resetPwForm');
  const resetPwStatus = document.getElementById('resetPwStatus');

  function setStatus(el, type, msg){ el.className='status '+type; el.textContent=msg; el.style.display='block'; }
  function token(){ return sessionStorage.getItem(LS); }
  function setToken(t){ sessionStorage.setItem(LS, t); }
  function headers(json=true){ const h = {}; if(token()) h['Authorization']='Bearer '+token(); if(json) h['Content-Type']='application/json'; return h; }

  async function api(path, opts={}){
    opts.headers = Object.assign(headers(true), opts.headers||{});
    const r = await fetch(API+path, opts);
    const ct = r.headers.get('content-type')||''; let data;
    if(ct.includes('application/json')) data = await r.json(); else data = await r.text();
    if(!r.ok) throw data;
    return data;
  }

  function show(view){ [loginView, forceResetView, appMain].forEach(v=>v.style.display='none'); view.style.display= (view===appMain?'flex':'block'); }

  function activateTab(tab){
    [...navTabs.querySelectorAll('button')].forEach(b=> b.classList.toggle('active', b.dataset.tab===tab));
    ['dashboard','admins','audit','security'].forEach(id => {
      const el = document.getElementById('tab-'+id); if(el) el.classList.toggle('hidden', id!==tab);
    });
    if(tab==='dashboard') loadStats();
    if(tab==='admins') loadAdmins();
    if(tab==='audit') loadAudit();
  }

  async function loadStats(){
    try {
      const s = await api('/stats',{ method:'GET', headers: headers(false) });
      metricsGrid.innerHTML='';
      const items = Object.entries(s);
      for(const [k,v] of items){
        const div=document.createElement('div');
        div.className='card';
        div.innerHTML='<h3>'+k+'</h3><div class="metric">'+v+'</div>';
        metricsGrid.appendChild(div);
      }
      quickInfo.textContent = JSON.stringify({ ts: new Date().toISOString(), count: items.length }, null, 2);
    } catch(e){ quickInfo.textContent='Hata: '+(e.error||e.message||e); }
  }

  async function loadAdmins(){
    adminTable.innerHTML='<tr><td colspan="6">Yükleniyor...</td></tr>';
    try {
      const d = await api('/admins',{ method:'GET', headers: headers(false) });
      const admins = d.admins || [];
      adminTable.innerHTML='';
      if(!admins.length){ adminTable.innerHTML='<tr><td colspan="6">Yok</td></tr>'; return; }
      for(const a of admins){
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${a.id}</td><td>${a.username}</td><td>${(a.roles||[]).join(',')}</td><td>${a.is_locked?'kilitli':'ok'}${a.force_reset?' / reset':''}</td><td>${a.last_login_at||''}</td><td><button data-act="lock" data-id="${a.id}" style="font-size:11px;padding:4px 8px">Lock</button> <button data-act="unlock" data-id="${a.id}" style="font-size:11px;padding:4px 8px">Unlock</button></td>`;
        adminTable.appendChild(tr);
      }
      adminTable.querySelectorAll('button').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.dataset.id; const act = btn.dataset.act;
        try {
          await api(`/admins/${id}/${act==='lock'?'lock':'unlock'}`, { method:'PATCH', headers: headers(false) });
          loadAdmins();
        } catch(e){ alert('Hata: '+(e.error||e.message||e)); }
      }));
    } catch(e){ adminTable.innerHTML='<tr><td colspan="6">Hata</td></tr>'; }
  }

  async function loadAudit(){
    auditLog.textContent='Yükleniyor...';
    try {
      const action = auditFilterAction.value.trim();
      const q = action? `?action=${encodeURIComponent(action)}`:'';
      const d = await api('/audit'+q, { method:'GET', headers: headers(false) });
      auditLog.textContent = (d.audits||[]).map(r => `${r.id} ${r.created_at} a=${r.admin_id||'-'} [${r.action}] ${r.detail||''}`).join('\n') || 'Kayıt yok';
    } catch(e){ auditLog.textContent='Hata: '+(e.error||e.message||e); }
  }

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value;
    if(!u||!p){ setStatus(loginStatus,'error','Eksik'); return; }
    setStatus(loginStatus,'info','Giriş...');
    try {
      const d = await api('/login',{ method:'POST', body: JSON.stringify({ username: u, password: p }) });
      if(!d.token) throw { error:'token_missing' };
      setToken(d.token);
      if(d.force_reset){ show(forceResetView); setStatus(loginStatus,'success','İlk giriş'); }
      else { show(appMain); meLoad(); setStatus(loginStatus,'success','Başarılı'); }
    } catch(err){ setStatus(loginStatus,'error', err.error || 'Hata'); }
  });

  resetForm.addEventListener('submit', async e => {
    e.preventDefault();
    const np = document.getElementById('newPassword').value;
    if(!np || np.length<8){ setStatus(resetStatus,'error','Min 8'); return; }
    setStatus(resetStatus,'info','Kaydediliyor...');
    try { await api('/password',{ method:'POST', body: JSON.stringify({ new_password: np }) }); show(appMain); meLoad(); setStatus(resetStatus,'success','Güncellendi'); }
    catch(err){ setStatus(resetStatus,'error', err.error||'Hata'); }
  });

  logoutBtn.addEventListener('click', async () => {
    try { await api('/logout',{ method:'POST', headers: headers(false) }); } catch { /* ignore */ }
    sessionStorage.removeItem(LS); location.href='sysadmin.html?v='+(Date.now());
  });

  navTabs.addEventListener('click', e => { if(e.target.tagName==='BUTTON'){ activateTab(e.target.dataset.tab); }});
  auditReload.addEventListener('click', () => loadAudit());

  createAdminForm.addEventListener('submit', async e => {
    e.preventDefault();
    const u = document.getElementById('newAdminUser').value.trim();
    const pw = document.getElementById('newAdminPass').value;
    const roles = document.getElementById('newAdminRoles').value.split(',').map(s=>s.trim()).filter(Boolean);
    if(!u||!pw){ setStatus(createAdminStatus,'error','Eksik'); return; }
    setStatus(createAdminStatus,'info','Oluşturuluyor...');
    try { await api('/admins',{ method:'POST', body: JSON.stringify({ username:u, password:pw, roles }) }); setStatus(createAdminStatus,'success','Ok'); loadAdmins(); }
    catch(err){ setStatus(createAdminStatus,'error', err.error||'Hata'); }
  });

  lockForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('lockAdminId').value.trim();
    const act = document.getElementById('lockAction').value;
    if(!id){ setStatus(lockStatus,'error','ID'); return; }
    setStatus(lockStatus,'info','İşleniyor...');
    try { await api(`/admins/${id}/${act==='lock'?'lock':'unlock'}`, { method:'PATCH' }); setStatus(lockStatus,'success','Tamam'); loadAdmins(); }
    catch(err){ setStatus(lockStatus,'error', err.error||'Hata'); }
  });

  resetPwForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('resetPwAdminId').value.trim();
    const np = document.getElementById('resetPwNew').value;
    if(!id||!np){ setStatus(resetPwStatus,'error','Eksik'); return; }
    if(np.length<8){ setStatus(resetPwStatus,'error','Min 8'); return; }
    setStatus(resetPwStatus,'info','Reset...');
    try { await api(`/admins/${id}/reset-password`, { method:'POST', body: JSON.stringify({ new_password: np }) }); setStatus(resetPwStatus,'success','Reset'); }
    catch(err){ setStatus(resetPwStatus,'error', err.error||'Hata'); }
  });

  async function meLoad(){
    try {
      const me = await api('/me',{ method:'GET', headers: headers(false) });
      meBadge.textContent = me.username+' • '+(me.roles||[]).join(',');
      if(me.force_reset){ show(forceResetView); }
      else { show(appMain); loadStats(); }
    } catch { show(loginView); }
  }

  // Auto token
  if(token()) meLoad(); else show(loginView);
})();
