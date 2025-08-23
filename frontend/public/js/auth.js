(function () {
  // Same-origin by default; nginx proxy should route /api/*
  const API = window.__API_BASE || '';
  const form = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const identityEl = document.getElementById('identity');
  const passEl = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePass');
  const rememberEl = document.getElementById('remember');
  const statusBox = document.getElementById('statusBox');
  const submitBtn = document.getElementById('submitBtn');
  const suEmail = document.getElementById('su_email');
  const suUsername = document.getElementById('su_username');
  const suPassword = document.getElementById('su_password');
  const suDisplay = document.getElementById('su_display');
  const suRemember = document.getElementById('su_remember');
  const suStatus = document.getElementById('su_status');
  const signupBtn = document.getElementById('signupBtn');

  function setStatus(type, msg) {
    statusBox.className = 'status ' + type;
    statusBox.textContent = msg;
    statusBox.style.display = 'block';
  }

  function mapAuthError(code) {
    const dict = {
      missing_fields: 'Eksik alanlar mevcut',
      duplicate_email: 'E-posta zaten kayıtlı',
      duplicate_username: 'Kullanıcı adı zaten kayıtlı',
      invalid_credentials: 'Kimlik veya şifre hatalı',
      locked: 'Çok fazla deneme, lütfen bekleyin',
      server_error: 'Sunucu hatası. Tekrar deneyin.',
      timeout: 'İstek zaman aşımına uğradı',
      network_error: 'Ağ hatası'
    };
    return dict[code] || code || 'Bilinmeyen hata';
  }
  function setSuStatus(type, msg){
    if(!suStatus) return;
    suStatus.className = 'status ' + type;
    suStatus.textContent = msg;
    suStatus.style.display = 'block';
  }

  function saveToken(token, remember) {
    try {
      const store = remember ? localStorage : sessionStorage;
      store.setItem('auth_token', token);
    } catch { /* noop */ }
  }
  function getToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  async function login(identity, password) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(API + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password }),
        signal: controller.signal
      });
      clearTimeout(t);
      const isJson = resp.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await resp.json() : {};
      if (!resp.ok) {
        throw { status: resp.status, code: data.error, message: data.message, retry_after_ms: data.retry_after_ms };
      }
      return data; // { token, user }
    } catch (e) {
      if (e.name === 'AbortError') throw { status: 0, code: 'timeout' };
      if (e.status === undefined) throw { status: 0, code: 'network_error' };
      throw e;
    }
  }

  async function fetchMe() {
    const tk = getToken();
    if (!tk) return null;
    const resp = await fetch(API + '/api/auth/me', { headers: { Authorization: 'Bearer ' + tk } });
    if (!resp.ok) return null;
    return resp.json();
  }

  async function signup(email, username, password, display_name){
    try{
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const resp = await fetch(API + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, username, password, display_name }),
        signal: controller.signal
      });
      clearTimeout(t);
      const isJson = resp.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await resp.json() : {};
      if (!resp.ok) {
        throw { status: resp.status, code: data.error, message: data.message };
      }
      return data; // { token, user }
    }catch(e){
      if (e.name === 'AbortError') throw { status: 0, code: 'timeout' };
      if (e.status === undefined) throw { status: 0, code: 'network_error' };
      throw e;
    }
  }

  toggleBtn.addEventListener('click', () => {
    if (passEl.type === 'password') { passEl.type = 'text'; toggleBtn.textContent = 'Gizle'; }
    else { passEl.type = 'password'; toggleBtn.textContent = 'Göster'; }
  });

  passEl.addEventListener('keydown', e => { if (e.key === 'Enter') form.requestSubmit(); });
  identityEl.addEventListener('keydown', e => { if (e.key === 'Enter') form.requestSubmit(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identity = identityEl.value.trim();
    const password = passEl.value;
    if (!identity || !password) { setStatus('error', 'Alanları doldurun'); return; }
    submitBtn.disabled = true;
    setStatus('info', 'Giriş yapılıyor...');
    try {
      const { token } = await login(identity, password);
      saveToken(token, rememberEl.checked);
  setStatus('success', 'Giriş başarılı, yönlendiriliyor...');
  setTimeout(() => { window.location.href = './app.html'; }, 500);
    } catch (err) {
      if (err.status === 0) setStatus('error', mapAuthError(err.code));
      else if (err.status === 429) setStatus('error', mapAuthError(err.code) + (err.retry_after_ms ? ` (${Math.ceil(err.retry_after_ms / 1000)} sn)` : ''));
      else if (err.status === 401) setStatus('error', mapAuthError(err.code));
      else setStatus('error', mapAuthError(err.code) || 'Hata oluştu');
    } finally {
      submitBtn.disabled = false;
    }
  });

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = suEmail?.value.trim();
    const username = suUsername?.value.trim();
    const password = suPassword?.value || '';
    const displayName = suDisplay?.value.trim();
    if(!email || !username || !password){ setSuStatus('error','Alanları doldurun'); return; }
    if(signupBtn) signupBtn.disabled = true;
    setSuStatus('info','Kayıt oluşturuluyor...');
    try{
      const { token, user } = await signup(email, username, password, displayName);
      saveToken(token, !!suRemember?.checked);
      const greetName = (user && (user.display_name || user.username)) || (displayName || username);
      if(window.__showGreeting){ window.__showGreeting(greetName); }
      setSuStatus('success','Kayıt başarılı, yönlendiriliyor...');
      setTimeout(()=>{ window.location.href = './app.html'; }, 900);
    }catch(err){
      // Önceden: duplicate durumda otomatik login denemesi yapılıyordu -> kaldırıldı.
      if(err && (err.code === 'duplicate_email' || err.code === 'duplicate_username')){
        // Otomatik giriş yerine kullanıcıyı bilgilendir ve login sekmesine yönlendir.
        const msg = err.code === 'duplicate_email'
          ? 'Bu e-posta zaten kayıtlı. Lütfen Giriş sekmesine geçip giriş yapın.'
          : 'Bu kullanıcı adı alınmış. Farklı bir kullanıcı adı deneyin veya Giriş sekmesine geçin.';
        setSuStatus('error', msg);
        try {
          document.getElementById('tabLogin')?.click();
        } catch {}
      } else {
        setSuStatus('error', mapAuthError(err.code));
      }
    }finally{
      if(signupBtn) signupBtn.disabled = false;
    }
  });

  (async () => {
    try {
  const me = await fetchMe();
  if (me) window.location.href = './app.html';
    } catch { /* noop */ }
  })();

  // logout bilgilendirme mesajı
  try {
    const params = new URLSearchParams(window.location.search);
    if(params.get('logout')==='1'){
      setStatus('info','Çıkış yapıldı');
    }
  } catch { /* ignore */ }
})();
