// core.js - Yeni oyun paneli kontrolcü
(function(){
  console.log('[core] init starting');
  const RUNTIME_VER = window.__APP_VERSION || 'dev';
  // Kendini cache bust: script src versiyonu farklıysa yenile
  try {
    const selfScript = Array.from(document.scripts).find(s=>s.src.includes('core.js'));
    if(selfScript){
      const qv = new URL(selfScript.src, location.origin).searchParams.get('v');
      if(qv && qv !== RUNTIME_VER){
        console.warn('[core] version mismatch detected', qv, RUNTIME_VER);
        setTimeout(()=>location.reload(true),150);
      }
    }
  } catch(e){ console.warn('[core] version check fail', e); }
  const layout = document.getElementById('layoutRoot');
  const loading = document.getElementById('loading-overlay');
  const nav = document.getElementById('nav');
  const viewsRoot = document.getElementById('views');
  const playerNameEl = document.getElementById('playerName');
  const playerTrustEl = document.getElementById('playerTrust');
  const playerMoneyEl = document.getElementById('playerMoney');
  const playerAvatar = document.getElementById('playerAvatar');
  const metrics = {
    trust: document.getElementById('m-trust'),
    assets: document.getElementById('m-assets'),
    contracts: document.getElementById('m-contracts'),
    mentor: document.getElementById('m-mentor')
  };
  const logoutBtn = document.getElementById('btn-logout');
  const refreshBtn = document.getElementById('btn-refresh');

  function showLoading(flag){
    if(!loading){ console.warn('[core] loading overlay yok'); return; }
    if(flag){ loading.classList.add('active'); }
    else { loading.classList.remove('active'); }
  }
  function selectView(name){
    const targetId = 'view-' + name;
  if(!viewsRoot){ console.error('[core] viewsRoot bulunamadı'); return; }
  for(const v of viewsRoot.querySelectorAll('.view')){
      v.classList.toggle('active', v.id === targetId);
    }
  if(!nav){ console.error('[core] nav yok'); return; }
  for(const b of nav.querySelectorAll('.nav-btn')){
      b.classList.toggle('active', b.dataset.view === name);
    }
    if(name === 'logout'){
      if(window.AuthClient){ window.AuthClient.logout(); }
    }
  }

  async function fetchMe(){
    if(!window.AuthClient) return null;
    return await window.AuthClient.verifyToken();
  }

  function applyUser(u){
    if(!u) return;
    try {
      playerNameEl && (playerNameEl.textContent = u.username || 'Oyuncu');
      playerAvatar && (playerAvatar.textContent = (u.username||'O').slice(0,1).toUpperCase());
      playerTrustEl && (playerTrustEl.textContent = 'İtibar ' + (u.trust_score ?? 0));
      playerMoneyEl && (playerMoneyEl.textContent = '💰 ' + (u.money ?? 0));
      metrics.trust && (metrics.trust.textContent = u.trust_score ?? 0);
      metrics.assets && (metrics.assets.textContent = u.assets_total ?? 0);
      metrics.contracts && (metrics.contracts.textContent = u.contracts_active ?? 0);
      metrics.mentor && (metrics.mentor.textContent = u.mentor_score ?? 0);
    } catch(e){ console.error('[core] applyUser hata', e); }
  }

  async function init(){
    showLoading(true);
    try {
      if(!layout){ console.error('[core] layoutRoot bulunamadı'); return; }
      if(window.AuthClient){
        const me = await window.AuthClient.requireAuthOrRedirect();
        if(!me){ console.warn('[core] auth redirect tetiklendi'); return; }
        applyUser(me);
      } else {
        console.warn('[core] AuthClient yok');
      }
      layout.style.opacity = '1';
    } catch(e){
      console.error('[core] init hata', e);
    } finally {
      showLoading(false);
    }
  }

  // Güvenlik / UX: 2.5s içinde görünür olmazsa ve token varsa yine de göster
  setTimeout(()=>{
    try {
      if(layout && window.AuthClient?.hasToken()){
        layout.style.opacity = '1';
      }
    } catch(e){ console.warn('[core] fallback hata', e); }
  }, 2500);

  // Tekrarlayan me hatasında kullanıcıya mesaj
  let meFailCount = 0;
  const origFetchMe = fetchMe;
  fetchMe = async function(){
    const r = await origFetchMe();
    if(!r){
      meFailCount++;
      if(meFailCount === 2){ showTempBanner('Sunucuya erişimde sorun. Tekrar deniyorum...'); }
      if(meFailCount === 4){ showTempBanner('Bağlantı sorunu devam ediyor. Ağınızı kontrol edin.'); }
    } else { meFailCount = 0; hideTempBanner(); }
    return r;
  };

  let bannerEl = null;
  function showTempBanner(msg){
    if(!bannerEl){
      bannerEl = document.createElement('div');
      bannerEl.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#b54708;color:#fff;padding:10px 14px;font-size:13px;font-weight:500;z-index:2000;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.25)';
      document.body.appendChild(bannerEl);
    }
    bannerEl.textContent = msg;
  }
  function hideTempBanner(){ if(bannerEl){ bannerEl.remove(); bannerEl=null; } }

  nav?.addEventListener('click', (e)=>{
    const btn = e.target.closest('.nav-btn');
    if(!btn) return;
    const view = btn.dataset.view;
    if(view) selectView(view);
  });

  logoutBtn?.addEventListener('click', ()=>{ if(window.AuthClient) window.AuthClient.logout(); });
  refreshBtn?.addEventListener('click', async ()=>{
    showLoading(true);
    try { const me = await fetchMe(); applyUser(me); } finally { showLoading(false); }
  });

  // Auto logout on 401 detection enhancement
  (function patchVerify(){
    if(!window.AuthClient) return;
    const orig = window.AuthClient.verifyToken;
    window.AuthClient.verifyToken = async function(){
      const res = await orig();
      if(!res){ // muhtemelen 401
        // Hard guard: eğer token yoksa layout'u gizle
        const tkExists = window.AuthClient.hasToken();
        if(!tkExists){ layout.style.visibility='hidden'; }
      }
      return res;
    };
  })();

  window.addEventListener('pageshow', (e)=>{ if(e.persisted && window.AuthClient){ window.AuthClient.verifyToken(); } });

  init();
})();
