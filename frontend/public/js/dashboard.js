// 🏠 Dashboard JavaScript - Ana Sayfa İşlevleri

class Dashboard {
    constructor() {
        this.user = null;
        this.socket = null;
        this.resources = {
            money: 50,
            wood: 0,
            grain: 0,
            business: 0
        };
        this.goals = {
            daily: { target: 100, current: 50 }
        };
        this.isLoading = false;
        this.trustEarnedToday = 0;
        
        this.init();
    }

    // Başlatma işlemleri
    async init() {
        try {
            console.log('🚀 Dashboard başlatılıyor...');
            
            // İlk UI güncellemeleri - loading state'ini kaldır
            this.hideLoadingStates();
            
            // Kullanıcı verilerini yükle (timeout ile)
            const loadUserPromise = this.loadUserData();
            const timeoutPromise = new Promise((resolve) => 
                setTimeout(() => {
                    console.warn('⚠️ Dashboard: loadUserData timeout - varsayılan verilerle devam');
                    resolve();
                }, 3000)
            );
            
            await Promise.race([loadUserPromise, timeoutPromise]);
            
            // Diğer işlemler (hata olursa devam etsin)
            try {
                this.setupEventListeners();
            } catch (error) {
                console.error('❌ Event listeners hatası:', error);
            }
            
            try {
                this.connectSocket();
            } catch (error) {
                console.error('❌ Socket bağlantı hatası:', error);
            }
            
            try {
                this.updateGreeting();
                this.startPeriodicUpdates();
                this.setupNotifications();
            } catch (error) {
                console.error('❌ UI güncellemeleri hatası:', error);
            }
            
            console.log('✅ Dashboard başlatıldı');
        } catch (error) {
            console.error('❌ Dashboard başlatma hatası:', error);
            this.showError('Dashboard yüklenirken bir hata oluştu');
            
            // En azından temel UI'yi göster
            this.hideLoadingStates();
        }
    }

    // Kullanıcı verilerini yükle
    async loadUserData() {
        try {
            console.log('📊 Dashboard: Kullanıcı verileri yükleniyor...');
            
            // LocalStorage'dan kullanıcı verilerini al
            const userData = localStorage.getItem('user');
            const token = localStorage.getItem('jwt_token');
            
            if (userData && token) {
                this.user = JSON.parse(userData);
                this.resources = this.user.resources || this.resources;
                console.log('✅ Dashboard: LocalStorage veriler yüklendi:', this.user);
                
                // UI'yi hemen güncelle - donmaması için
                setTimeout(() => {
                    this.updateUserDisplay();
                    this.updateResourcesDisplay();
                }, 100);
                
                // API'den güncel verileri al (background'da, timeout ile)
                this.fetchUserProfileWithTimeout();
            } else {
                // Giriş yapmamış, login sayfasına yönlendir
                console.warn('⚠️ Dashboard: Kullanıcı verisi yok, login sayfasına yönlendiriliyor');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1000);
                return;
            }
        } catch (error) {
            console.error('❌ Dashboard: Kullanıcı verileri yüklenemedi:', error);
            // Hata durumunda default verilerle devam et
            this.user = { 
                name: 'Oyuncu', 
                trustScore: 100,
                resources: this.resources 
            };
            this.updateUserDisplay();
            this.updateResourcesDisplay();
        }
    }

    // API'den kullanıcı profilini getir (timeout ile)
    async fetchUserProfileWithTimeout() {
        try {
            console.log('🔄 Dashboard: API profil güncelleme deneniyor...');
            const token = localStorage.getItem('jwt_token');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => { controller.abort(); console.warn('⏰ Dashboard: API timeout - localStorage verisi kullanılıyor'); }, 3000);
            const response = await fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                this.resources = data.user.resources;
                this.updateUserDisplay();
                this.updateResourcesDisplay();
                this.updateMentorCard(); // yeni
                console.log('✅ Dashboard: API den profil güncellendi');
            } else if (response.status === 401) {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('⚠️ Dashboard: API timeout - localStorage verisi kullanılıyor');
            } else {
                console.warn('⚠️ Dashboard: API hatası - localStorage verisi kullanılıyor:', error.message);
            }
        }
    }

    updateMentorCard() {
        const state = this.user?.bot_tutorial_state;
        const botSection = document.getElementById('bot-mentor');
        const realSection = document.getElementById('real-mentor');
        const mentorStatus = document.getElementById('mentor-status');
        if(!state || !botSection || !realSection || !mentorStatus) return;
        if(['INTRO','FIRST_CHAT','FIRST_CONTRACT','TRUST_LEARN'].includes(state)) {
            botSection.classList.remove('d-none');
            realSection.classList.add('d-none');
            mentorStatus.textContent = 'Bot';
            mentorStatus.className = 'trust-badge trust-good';
        } else if(state === 'MENTOR_MATCH') {
            botSection.classList.remove('d-none');
            realSection.classList.add('d-none');
            mentorStatus.textContent = 'Eşleşme Aranıyor';
            mentorStatus.className = 'trust-badge trust-medium';
        } else if(state === 'DONE') {
            botSection.classList.add('d-none');
            realSection.classList.remove('d-none');
            mentorStatus.textContent = 'Aktif';
            mentorStatus.className = 'trust-badge trust-excellent';
        }
    }

    // Event listener'ları ayarla
    setupEventListeners() {
        // Action buttons
        const chopWoodBtn = document.getElementById('chop-wood');
        const farmGrainBtn = document.getElementById('farm-grain');
        
        if (chopWoodBtn) {
            chopWoodBtn.addEventListener('click', () => this.performAction('chop-wood'));
        }
        
        if (farmGrainBtn) {
            farmGrainBtn.addEventListener('click', () => this.performAction('farm'));
        }

        // Resource items - click for details
        const resourceItems = document.querySelectorAll('.resource-item');
        resourceItems.forEach(item => {
            item.addEventListener('click', () => {
                const resourceType = item.dataset.resource;
                this.showResourceDetails(resourceType);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' && e.ctrlKey) {
                e.preventDefault();
                window.location.href = '/chat.html';
            }
        });

        // Pull to refresh (mobile)
        let startY = 0;
        let currentY = 0;
        let isRefreshing = false;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (window.scrollY === 0 && !isRefreshing) {
                currentY = e.touches[0].clientY;
                const difference = currentY - startY;
                
                if (difference > 100) {
                    isRefreshing = true;
                    this.refreshData();
                }
            }
        });
    }

    // Socket bağlantısı kur
    connectSocket() {
        if (typeof io !== 'undefined') {
            try {
                this.socket = io({
                    timeout: 5000,
                    transports: ['websocket', 'polling']
                });
                
                this.socket.on('connect', () => {
                    console.log('🔌 Dashboard socket bağlandı');
                    this.socket.emit('join_chat', {
                        userId: this.user?.id,
                        token: localStorage.getItem('jwt_token')
                    });
                });

                this.socket.on('disconnect', () => {
                    console.log('🔌 Dashboard socket bağlantısı kesildi');
                });

                this.socket.on('connect_error', (error) => {
                    console.warn('⚠️ Dashboard socket bağlantı hatası:', error);
                    this.simulateSocketEvents();
                });

                this.socket.on('online_count_updated', (count) => {
                    this.updateOnlineCount(count);
                });

                this.socket.on('new_message', (message) => {
                    this.handleNewMessage(message);
                });

                this.socket.on('resource_updated', (data) => {
                    if (data.userId === this.user?.id) {
                        this.resources = data.resources;
                        this.updateResourcesDisplay();
                        this.showSuccess('Kaynak güncellendi');
                    }
                });
                // Yeni: trust güncelleme
                this.socket.on('trust_updated', (data) => {
                    if (this.user && data.id === this.user.id) {
                        this.user.trustScore = data.trust_score;
                        this.updateUserDisplay();
                        this.showSuccess('Güven puanın güncellendi: ' + data.trust_score);
                    }
                });
                // Yeni: contract created
                this.socket.on('contract_created', (c) => {
                    this.showContractToast('Yeni kontrat #' + c.id + ' (' + c.status + ')');
                });
                // Yeni: contract updated
                this.socket.on('contract_updated', (c) => {
                    this.showContractToast('Kontrat #' + c.id + ' durum: ' + c.status);
                    if(c.status==='COMPLETED'){
                        // varsayılan ödül +2
                        this.trustEarnedToday += 2; 
                        this.updateTrustEarningsDisplay();
                        this.genericToast('+2 İtibar (Kontrat)', 'contract');
                    }
                });
                // Yeni: tutorial ilerleme
                this.socket.on('tutorial_progress', (p) => {
                    if (this.user && p.userId === this.user.id) {
                        this.showTutorialToast('Tutorial ilerledi: ' + p.state);
                        if (!this.user.bot_tutorial_state || this.user.bot_tutorial_state !== p.state) {
                            this.user.bot_tutorial_state = p.state;
                            this.updateMentorCard();
                        }
                    }
                });
                
                // Timeout ekle - 5 saniye içinde bağlanamazsa simüle et
                setTimeout(() => {
                    if (!this.socket.connected) {
                        console.warn('⚠️ Dashboard socket timeout - simülasyon moduna geçiliyor');
                        this.simulateSocketEvents();
                    }
                }, 5000);
                
            } catch (error) {
                console.error('Dashboard socket hatası:', error);
                this.simulateSocketEvents();
            }
        } else {
            console.warn('⚠️ Socket.io bulunamadı - simülasyon modu');
            this.simulateSocketEvents();
        }
    }
    
    // Socket olaylarını simüle et
    simulateSocketEvents() {
        console.log('🤖 Dashboard simülasyon modu aktif');
        
        // Online count simülasyonu
        setInterval(() => {
            const count = 1100 + Math.floor(Math.random() * 200);
            this.updateOnlineCount(count);
        }, 30000);
        
        // Resource update simülasyonu
        setInterval(() => {
            this.resources.money += Math.floor(Math.random() * 10);
            this.updateResourcesDisplay();
        }, 60000);
    }

    // Karşılama mesajını güncelle
    updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Merhaba';
        
        if (hour < 6) greeting = 'İyi geceler';
        else if (hour < 12) greeting = 'Günaydın';
        else if (hour < 18) greeting = 'İyi günler';
        else greeting = 'İyi akşamlar';
        
        const greetingEl = document.getElementById('greeting');
        if (greetingEl) {
            greetingEl.textContent = greeting;
        }

        // Welcome time message
        const welcomeTimeEl = document.getElementById('welcome-time');
        if (welcomeTimeEl) {
            const messages = [
                'Bugün harika bir gün! Ticaret yapmaya hazır mısın?',
                'Yeni fırsatlar seni bekliyor! Hadi başlayalım!',
                'Mentorlardan tavsiye almayı unutma!',
                'Chat\'te diğer oyuncularla sohbet edebilirsin!'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            welcomeTimeEl.textContent = randomMessage;
        }
    }

    // Kullanıcı bilgilerini göster
    updateUserDisplay() {
        console.log('👤 Dashboard: Kullanıcı bilgileri güncelleniyor:', this.user);

        const userNameEl = document.getElementById('user-name');
        const userTrustEl = document.getElementById('user-trust');
        
        if (userNameEl) {
            const displayName = this.user?.displayName || this.user?.name || 'Oyuncu';
            userNameEl.textContent = displayName;
            console.log('✅ Dashboard: Kullanıcı adı güncellendi:', displayName);
        }
        
        if (userTrustEl) {
            const trustScore = this.user?.trustScore || 100;
            userTrustEl.textContent = trustScore;
            userTrustEl.className = `stat-value ${this.getTrustClass(trustScore)}`;
            console.log('✅ Dashboard: Trust score güncellendi:', trustScore);
        }

        // User initial for avatar
        const userInitial = document.getElementById('user-initial');
        if (userInitial) {
            const name = this.user?.displayName || this.user?.name || 'O';
            userInitial.textContent = name.charAt(0).toUpperCase();
            console.log('✅ Dashboard: Avatar initial güncellendi:', name.charAt(0));
        }

        this.updateTrustEarningsDisplay();
    }

    // Kaynakları güncelle
    updateResourcesDisplay() {
        console.log('💰 Dashboard: Kaynaklar güncelleniyor:', this.resources);
        
        const moneyEl = document.getElementById('money');
        const woodEl = document.getElementById('wood');
        const grainEl = document.getElementById('grain');
        const businessEl = document.getElementById('business');

        if (moneyEl) {
            moneyEl.textContent = `${this.resources.money} TL`;
            console.log('✅ Dashboard: Para güncellendi:', this.resources.money);
        }
        if (woodEl) {
            woodEl.textContent = this.resources.wood;
            console.log('✅ Dashboard: Odun güncellendi:', this.resources.wood);
        }
        if (grainEl) {
            grainEl.textContent = this.resources.grain;
            console.log('✅ Dashboard: Buğday güncellendi:', this.resources.grain);
        }
        if (businessEl) {
            businessEl.textContent = this.resources.business;
            console.log('✅ Dashboard: İş güncellendi:', this.resources.business);
        }

        // Update daily goal progress
        this.updateGoalProgress();
    }

    // Günlük hedef ilerlemesini güncelle
    updateGoalProgress() {
        const progressEl = document.getElementById('goal-progress');
        const progressTextEl = document.getElementById('goal-progress-text');
        const goalStatusEl = document.getElementById('goal-status');
        
        if (progressEl && progressTextEl) {
            const current = this.resources.money;
            const target = this.goals.daily.target;
            const percentage = Math.min((current / target) * 100, 100);
            
            progressEl.style.width = `${percentage}%`;
            progressTextEl.textContent = `${current}/${target} TL (${Math.round(percentage)}%)`;
            
            if (goalStatusEl) {
                goalStatusEl.textContent = `${Math.round(percentage)}%`;
                goalStatusEl.className = `trust-badge ${this.getGoalClass(percentage)}`;
            }
        }
    }

    // Online kullanıcı sayısını güncelle
    updateOnlineCount(count) {
        const onlineCountEls = document.querySelectorAll('#online-count');
        onlineCountEls.forEach(el => {
            el.textContent = `${count} kişi online`;
        });
    }

    // Yeni mesaj geldiğinde
    handleNewMessage(message) {
        // Chat notification badge'ini güncelle
        const notificationEls = document.querySelectorAll('#chat-notification, #fab-chat-notification');
        notificationEls.forEach(el => {
            el.classList.remove('d-none');
            const currentCount = parseInt(el.textContent) || 0;
            el.textContent = currentCount + 1;
        });

        // Sesli bildirim (eğer kullanıcı izin verdiyse)
        this.playNotificationSound();
    }

    // Aktivite gerçekleştir
    async performAction(action) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);
        
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`/api/activity/${action}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                // Kaynakları güncelle
                this.resources = { ...this.resources, ...data.result };
                this.updateResourcesDisplay();
                
                // Başarı mesajı göster
                const messages = {
                    'chop-wood': `🪓 ${data.result.woodGained} odun kazandın!`,
                    'farm': `🌾 ${data.result.grainGained} tahıl kazandın!`
                };
                
                this.showSuccess(messages[action] || 'İşlem başarılı!');
                
                // Kaynak değişim animasyonu
                this.animateResourceChange(action, data.result);
                
            } else {
                this.showError(data.error || 'İşlem başarısız');
            }
        } catch (error) {
            console.error('Aktivite hatası:', error);
            this.showError('Bağlantı hatası oluştu');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    // Kaynak değişim animasyonu
    animateResourceChange(action, result) {
        const resourceType = action === 'chop-wood' ? 'wood' : 'grain';
        const resourceEl = document.querySelector(`[data-resource="${resourceType}"]`);
        
        if (resourceEl) {
            resourceEl.classList.add('animate-bounce');
            setTimeout(() => {
                resourceEl.classList.remove('animate-bounce');
            }, 1000);
        }
    }

    // Verileri yenile
    async refreshData() {
        try {
            await this.fetchUserProfile();
            this.showSuccess('Veriler güncellendi!');
        } catch (error) {
            this.showError('Güncelleme başarısız');
        }
    }

    // Periyodik güncellemeler
    startPeriodicUpdates() {
        // Her 30 saniyede bir online sayısını güncelle
        setInterval(() => {
            if (this.socket && this.socket.connected) {
                this.socket.emit('get_online_count');
            }
        }, 30000);

        // Her 5 dakikada bir kullanıcı verilerini güncelle
        setInterval(() => {
            this.fetchUserProfile();
        }, 300000);
    }

    // Bildirimler ayarla
    setupNotifications() {
        // Tarayıcı bildirimi izni iste
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Bildirim sesi çal
    playNotificationSound() {
        try {
            const audio = new Audio('/assets/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ses çalma başarısız (otomatik oynatma engeli)
                console.log('Bildirim sesi çalınamadı');
            });
        } catch (error) {
            console.log('Ses dosyası bulunamadı');
        }
    }

    // Güven puanı sınıfını al
    getTrustClass(score) {
        if (score >= 180) return 'trust-excellent';
        if (score >= 160) return 'trust-good';
        if (score >= 140) return 'trust-medium';
        if (score >= 120) return 'trust-low';
        return 'trust-bad';
    }

    // Hedef durumu sınıfını al
    getGoalClass(percentage) {
        if (percentage >= 100) return 'trust-excellent';
        if (percentage >= 75) return 'trust-good';
        if (percentage >= 50) return 'trust-medium';
        if (percentage >= 25) return 'trust-low';
        return 'trust-bad';
    }

    // Loading state'lerini gizle (sayfa başlangıcında)
    hideLoadingStates() {
        console.log('🎯 Dashboard: Loading state\'leri gizleniyor...');
        
        // Tüm loading elementlerini gizle
        const loadingElements = [
            'loading-overlay',
            'page-loading',
            'user-loading',
            'resources-loading'
        ];
        
        loadingElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('d-none');
                el.style.display = 'none';
                console.log(`✅ Loading element gizlendi: ${id}`);
            }
        });
        
        // Loading sınıflarını kaldır
        document.body.classList.remove('loading');
        document.documentElement.classList.remove('loading');
        
        // Ana içeriği göster
        const mainContent = document.querySelector('.main-content, .mobile-container, main');
        if (mainContent) {
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            console.log('✅ Ana içerik görünür yapıldı');
        }
    }

    // Loading göster/gizle
    showLoading(show) {
        const loadingEl = document.getElementById('loading-overlay');
        if (loadingEl) {
            loadingEl.classList.toggle('d-none', !show);
        }
    }

    // Başarı mesajı göster
    showSuccess(message) {
        const toastEl = document.getElementById('success-toast');
        if (toastEl) {
            const messageEl = toastEl.querySelector('.toast-message');
            if (messageEl) messageEl.textContent = message;
            
            toastEl.classList.remove('d-none');
            setTimeout(() => {
                toastEl.classList.add('d-none');
            }, 3000);
        }
    }

    // Hata mesajı göster
    showError(message) {
        const toastEl = document.getElementById('error-toast');
        if (toastEl) {
            const messageEl = toastEl.querySelector('.toast-message');
            if (messageEl) messageEl.textContent = message;
            
            toastEl.classList.remove('d-none');
            setTimeout(() => {
                toastEl.classList.add('d-none');
            }, 3000);
        }
    }

    // Kaynak detaylarını göster
    showResourceDetails(resourceType) {
        const details = {
            money: 'Para: Ticaret yapmak ve işletme kurmak için gerekli',
            wood: 'Odun: Odun kesme aktivitesi ile kazanabilirsin',
            grain: 'Tahıl: Çiftçilik aktivitesi ile kazanabilirsin',
            business: 'İşletme: Pasif gelir sağlayan yatırımlar'
        };
        
        const message = details[resourceType] || 'Kaynak bilgisi bulunamadı';
        alert(message);
    }

    showContractToast(text){
        this.genericToast(text, 'contract');
    }
    showTutorialToast(text){
        this.genericToast(text, 'tutorial');
    }
    genericToast(message, type='info'){
        let container = document.getElementById('toast-container');
        if(!container){
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.position='fixed';
            container.style.top='10px';
            container.style.right='10px';
            container.style.zIndex='9999';
            document.body.appendChild(container);
        }
        const el = document.createElement('div');
        el.textContent = message;
        el.style.background = type==='tutorial' ? '#4b6ef5' : (type==='contract' ? '#16a34a' : '#333');
        el.style.color = '#fff';
        el.style.padding = '8px 12px';
        el.style.marginTop = '6px';
        el.style.borderRadius = '6px';
        el.style.fontSize = '14px';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        el.style.opacity='0';
        el.style.transition='opacity .3s';
        container.appendChild(el);
        requestAnimationFrame(()=>{ el.style.opacity='1'; });
        setTimeout(()=>{
            el.style.opacity='0';
            setTimeout(()=> el.remove(), 400);
        }, 4000);
    }
    
    updateTrustEarningsDisplay(){
        const el = document.getElementById('trust-earned-today');
        if(el){ el.textContent = '+'+this.trustEarnedToday; }
    }
}

// Global fonksiyonlar (HTML'den çağrılabilir)
window.dashboard = null;

// Kaynakları yenile
function refreshResources() {
    if (window.dashboard) {
        window.dashboard.refreshData();
    }
}

// Aktivite gerçekleştir
function performAction(action) {
    if (window.dashboard) {
        window.dashboard.performAction(action);
    }
}

// Chat'e git
function goToChat() {
    window.location.href = '/chat.html';
}

// Bot ile sohbet başlat
function openChatWithBot() {
    localStorage.setItem('chat_target', 'bot');
    window.location.href = '/chat.html';
}

// Mentor ipuçlarını göster
function showMentorTips() {
    const tips = [
        '💡 İlk önce odun kesip para biriktir',
        '🤝 Güven puanı yüksek oyuncularla ticaret yap',
        '💬 Chat\'te aktif ol, fırsatları kaçırma',
        '📊 Günlük hedeflerini tamamlamaya odaklan',
        '👥 Mentor bul, deneyimli oyunculardan öğren'
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    alert(randomTip);
}

// Mentor ile iletişime geç
function contactMentor() {
    window.location.href = '/chat.html?mentor=true';
}

// Mentor profilini görüntüle
function viewMentorProfile() {
    window.location.href = '/profile.html?view=mentor';
}

// Detaylı istatistikleri göster
function showDetailedStats() {
    window.location.href = '/stats.html';
}

// Bildirimi kapat
function dismissNotification(element) {
    const notificationCard = element.closest('.notification-card');
    if (notificationCard) {
        notificationCard.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notificationCard.remove();
        }, 300);
    }
}

// Sayfa yüklendiğinde dashboard'u başlat
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Visibility change event - sayfa görünür olduğunda verileri güncelle
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.dashboard) {
        window.dashboard.refreshData();
    }
});

// Online/offline durumu
window.addEventListener('online', () => {
    console.log('🌐 İnternet bağlantısı restore edildi');
    if (window.dashboard) {
        window.dashboard.connectSocket();
    }
});

window.addEventListener('offline', () => {
    console.log('🌐 İnternet bağlantısı kesildi');
});

console.log('📱 Dashboard JavaScript yüklendi');
