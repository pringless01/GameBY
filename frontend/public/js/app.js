/*
 * legacy app.js (dashboard) - Yeni layout (app.html + core.js) ile KULLANILMIYOR.
 * Marka güncellendi: Sermaye Arena (eski: GameBY).
 */
/* Sermaye Arena - Eski Dashboard JS */
const qs = s => document.querySelector(s);

// Dashboard buton event listener'ları
document.addEventListener('DOMContentLoaded', () => {
  console.log('[app] Dashboard yüklendi');
  
  // Chat butonu - en önemli
  qs('#btn-chat')?.addEventListener('click', () => {
    console.log('[dashboard] Chat açılıyor...');
    openChat();
  });

  // Bildirimler
  qs('#btn-notifications')?.addEventListener('click', () => {
    console.log('[dashboard] Bildirimler açılıyor...');
    showNotifications();
  });

  // Portföy
  qs('#btn-portfolio')?.addEventListener('click', () => {
    console.log('[dashboard] Portföy açılıyor...');
    openPortfolio();
  });

  // Kontratlar
  qs('#btn-contracts')?.addEventListener('click', () => {
    console.log('[dashboard] Kontratlar açılıyor...');
    openContracts();
  });

  // İşletmeler
  qs('#btn-businesses')?.addEventListener('click', () => {
    console.log('[dashboard] İşletmeler açılıyor...');
    openBusinesses();
  });

  // Mentorlar
  qs('#btn-mentors')?.addEventListener('click', () => {
    console.log('[dashboard] Mentorlar açılıyor...');
    openMentors();
  });

  // Piyasa
  qs('#btn-market')?.addEventListener('click', () => {
    console.log('[dashboard] Piyasa açılıyor...');
    openMarket();
  });

  // Ayarlar
  qs('#btn-settings')?.addEventListener('click', () => {
    console.log('[dashboard] Ayarlar açılıyor...');
    openSettings();
  });

  // Çıkış
  qs('#btn-logout')?.addEventListener('click', () => {
    try {
      showToast('🚪 Çıkış yapılıyor...');
      if (window.AuthClient) AuthClient.logout();
      else {
        // Yedek: token temizle ve yönlendir
        try { localStorage.removeItem('auth_token'); sessionStorage.removeItem('auth_token'); } catch {}
        window.location.href = '/login.html';
      }
    } catch (e) {
      console.error('[app] logout hata', e);
    }
  });

  // İlk yüklendiğinde kullanıcı verilerini getir
  loadUserData();
});

// Dashboard fonksiyonları (şimdilik placeholder)
function openChat() {
  // TODO: Chat ekranına geçiş veya modal
  showToast('💬 Chat yakında gelecek!');
}

function showNotifications() {
  showToast('🔔 Bildirimler yakında gelecek!');
}

function openPortfolio() {
  showToast('📊 Portföy yakında gelecek!');
}

function openContracts() {
  showToast('🤝 Kontratlar yakında gelecek!');
}

function openBusinesses() {
  showToast('🏪 İşletmeler yakında gelecek!');
}

function openMentors() {
  showToast('👥 Mentorlar yakında gelecek!');
}

function openMarket() {
  showToast('📈 Piyasa yakında gelecek!');
}

function openSettings() {
  showToast('⚙️ Ayarlar yakında gelecek!');
}

// Kullanıcı verilerini yükle
async function loadUserData() {
  try {
    // TODO: API'den gerçek veri çek
    console.log('[app] Kullanıcı verileri yükleniyor...');
    
    // Şimdilik statik veriler
    updateUserDisplay({
      username: 'Musa',
      trustScore: 180,
      maxTrust: 200,
      money: 2500,
      activeBusinesses: 2,
      dailyIncome: 75
    });
  } catch (error) {
    console.error('[app] Veri yükleme hatası:', error);
    showToast('❌ Veri yükleme hatası!');
  }
}

// Kullanıcı UI'ını güncelle
function updateUserDisplay(userData) {
  const { username, trustScore, maxTrust, money, activeBusinesses, dailyIncome } = userData;
  
  // Kullanıcı adı
  qs('.username').textContent = username;
  
  // İtibar puanı
  qs('.trust-value').textContent = trustScore;
  qs('.trust-max').textContent = `/${maxTrust}`;
  
  // İtibar rengini ayarla
  const trustIcon = qs('.trust-icon');
  const trustValue = qs('.trust-value');
  if (trustScore >= 180) {
    trustIcon.style.color = 'var(--trust-excellent)';
    trustValue.style.color = 'var(--trust-excellent)';
  } else if (trustScore >= 150) {
    trustIcon.style.color = 'var(--trust-good)';
    trustValue.style.color = 'var(--trust-good)';
  } else if (trustScore >= 100) {
    trustIcon.style.color = 'var(--trust-warning)';
    trustValue.style.color = 'var(--trust-warning)';
  } else {
    trustIcon.style.color = 'var(--trust-danger)';
    trustValue.style.color = 'var(--trust-danger)';
  }
  
  // Para miktarı (K formatında)
  const formattedMoney = money >= 1000 ? `${(money / 1000).toFixed(1)}K` : money.toString();
  qs('.money-value').textContent = formattedMoney;
  
  // Alt bar: aktif işletme sayısı
  qs('.status-item:first-child .status-value').textContent = activeBusinesses;
  
  // Alt bar: günlük kazanç
  const incomeElement = qs('.status-item:last-child .status-value');
  incomeElement.textContent = `+${dailyIncome} TL`;
  incomeElement.className = dailyIncome >= 0 ? 'status-value positive' : 'status-value negative';
}

// Toast mesajları için basit sistem
function showToast(message) {
  // Varsa önceki toast'u kaldır
  const existingToast = qs('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Yeni toast oluştur
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--text-primary);
    color: var(--bg-card);
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: 500;
    z-index: 1000;
    animation: toastSlideUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // 3 saniye sonra kaldır
  setTimeout(() => {
    toast.style.animation = 'toastSlideDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Toast animasyonları için CSS ekle
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes toastSlideUp {
    from { transform: translateX(-50%) translateY(100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  @keyframes toastSlideDown {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(100%); opacity: 0; }
  }
`;
document.head.appendChild(toastStyles);
