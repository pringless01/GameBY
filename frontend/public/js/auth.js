(function(){
  const API = window.__API_BASE || 'http://localhost:3000';
  const form = document.getElementById('loginForm');
  const identityEl = document.getElementById('identity');
  const passEl = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePass');
  const rememberEl = document.getElementById('remember');
  const statusBox = document.getElementById('statusBox');
  const submitBtn = document.getElementById('submitBtn');

  function setStatus(type, msg){
    statusBox.className = 'status ' + type;
    statusBox.textContent = msg;
    statusBox.style.display = 'block';
  }

  function mapAuthError(code){
    const dict = {
      missing_fields: 'Eksik alanlar mevcut',
      duplicate_email: 'E-posta zaten kayıtlı',
      duplicate_username: 'Kullanıcı adı zaten kayıtlı',
      invalid_credentials: 'Kimlik veya şifre hatalı',
      locked: 'Çok fazla deneme, lütfen bekleyin',
      server_error: 'Sunucu hatası. Tekrar deneyin.'
    };
    return dict[code] || code || 'Bilinmeyen hata';
  }

  function saveToken(token, remember){
    try {
      const store = remember ? localStorage : sessionStorage;
      store.setItem('auth_token', token);
    } catch(e) {}
  }
  function getToken(){ return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'); }
  function clearToken(){ try { localStorage.removeItem('auth_token'); sessionStorage.removeItem('auth_token'); } catch(e){} }

  async function login(identity, password){
    const resp = await fetch(API + '/api/auth/login', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ identity, password })
    });
    const isJson = resp.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await resp.json() : {};
    if(!resp.ok){
      throw { status: resp.status, code: data.error, message: data.message };
    }
    return data; // { token, user }
  }

  async function fetchMe(){
    const tk = getToken();
    if(!tk) return null;
    const resp = await fetch(API + '/api/auth/me', { headers:{ Authorization: 'Bearer ' + tk } });
    if(!resp.ok) return null;
    return resp.json();
  }

  toggleBtn.addEventListener('click', () => {
    if(passEl.type === 'password'){ passEl.type = 'text'; toggleBtn.textContent = 'Gizle'; }
    else { passEl.type = 'password'; toggleBtn.textContent = 'Göster'; }
  });

  passEl.addEventListener('keydown', e => { if(e.key === 'Enter'){ form.requestSubmit(); } });
  identityEl.addEventListener('keydown', e => { if(e.key === 'Enter'){ form.requestSubmit(); } });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identity = identityEl.value.trim();
    const password = passEl.value;
    if(!identity || !password){ setStatus('error','Alanları doldurun'); return; }
    submitBtn.disabled = true;
    setStatus('info','Giriş yapılıyor...');
    try {
      const { token } = await login(identity, password);
      saveToken(token, rememberEl.checked);
      setStatus('success','Giriş başarılı, yönlendiriliyor...');
      setTimeout(()=> { window.location.href = './index.html'; }, 500);
    } catch(err){
      if(err.status === 0){ setStatus('error','Bağlantı yok veya sunucu erişilemedi'); }
      else if(err.status === 429){ setStatus('error', mapAuthError(err.code) + (err.retry_after_ms ? ` (${Math.ceil(err.retry_after_ms/1000)} sn)` : '')); }
      else if(err.status === 401){ setStatus('error', mapAuthError(err.code)); }
      else { setStatus('error', mapAuthError(err.code) || 'Hata oluştu'); }
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Otomatik me denemesi (ör. token geçerliyse direkt yönlendir)
  (async ()=> {
    try {
      const me = await fetchMe();
      if(me){ window.location.href = './index.html'; }
    } catch(e){}
  })();
})();
