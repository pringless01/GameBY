/* Basit kimlik doğrulama mantığı ve sekme/sürükleme desteği */
const qs = (s, r = document) => r.querySelector(s);
const loginForm = qs('#loginForm');
const registerForm = qs('#registerForm');
const tabLogin = qs('#tabLogin');
const tabRegister = qs('#tabRegister');
const panels = qs('#panels');
const msg = qs('#msg');

function setPanel(which) {
  panels.dataset.active = which;
  const showLogin = which === 'login';
  loginForm.hidden = !showLogin;
  registerForm.hidden = showLogin;
  tabLogin.classList.toggle('is-active', showLogin);
  tabLogin.setAttribute('aria-selected', showLogin);
  tabRegister.classList.toggle('is-active', !showLogin);
  tabRegister.setAttribute('aria-selected', !showLogin);
}

// Sekme tıklamaları
[tabLogin, tabRegister].forEach(btn =>
  btn?.addEventListener('click', () => setPanel(btn === tabLogin ? 'login' : 'register'))
);

// Swipe desteği
let touchX = 0;
panels.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; });
panels.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) < 50) return;
  if (dx > 0) setPanel('login'); else setPanel('register');
});

function showMsg(text) {
  msg.hidden = false;
  msg.innerText = text;
}

function setLoading(btn, on) {
  if (on) {
    btn.disabled = true;
    btn.dataset.prev = btn.innerText;
    btn.innerText = '...';
  } else {
    btn.disabled = false;
    if (btn.dataset.prev) btn.innerText = btn.dataset.prev;
  }
}

async function api(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.error || 'İstek başarısız'), { status: res.status, data });
  return data;
}

async function verifyAndGo() {
  const ok = await fetch('/api/user/me', { credentials: 'include' }).then(r => r.ok).catch(() => false);
  if (ok) location.href = '/';
}

loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = qs('#loginEmail').value.trim();
  const password = qs('#loginPassword').value;
  if (!email || !password) return showMsg('Tüm alanlar zorunlu.');
  const btn = qs('#loginBtn');
  setLoading(btn, true);
  try {
    const data = await api('/api/auth/login', { email, password });
    const token = data?.accessToken;
    const remember = qs('#rememberMe').checked;
    if (token) (remember ? localStorage : sessionStorage).setItem('accessToken', token);
    await verifyAndGo();
    showMsg('Giriş başarılı, yönlendiriliyorsunuz…');
  } catch (err) {
    showMsg(err.status === 401 ? 'Geçersiz bilgiler.' : err.status === 429 ? 'Çok fazla deneme, lütfen bekleyin.' : 'Sunucu hatası.');
  } finally {
    setLoading(btn, false);
  }
});

registerForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = qs('#regEmail').value.trim();
  const username = qs('#regUsername').value.trim();
  const password = qs('#regPassword').value;
  if (!email || !username || password.length < 6) return showMsg('Lütfen geçerli bilgiler girin.');
  const btn = qs('#registerBtn');
  setLoading(btn, true);
  try {
    await api('/api/auth/register', { email, username, password });
    showMsg('Kayıt başarılı! Şimdi giriş yapın.');
    setPanel('login');
  } catch (err) {
    showMsg(err.status === 409 ? 'Bu e-posta/kullanıcı adı kullanımda.' : err.status === 429 ? 'Çok fazla deneme, lütfen bekleyin.' : 'Sunucu hatası.');
  } finally {
    setLoading(btn, false);
  }
});
