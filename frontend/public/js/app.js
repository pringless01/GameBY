/* v0: yalın giriş ekranı davranışı (şimdilik log-only) */
const qs = s => document.querySelector(s);

qs('#btn-start')?.addEventListener('click', () => {
  console.log('[ui] start clicked');
  // Bir sonraki adımda: onboarding-1 ekranına yönlendirme
});

qs('#btn-login')?.addEventListener('click', () => {
  console.log('[ui] login clicked');
  // Bir sonraki adımda: login modal / sayfa
});
