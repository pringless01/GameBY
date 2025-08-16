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
        this.isMentorQueued = false; // yeni
        this.isMenteeWaiting = false; // yeni
        this.trustHistory = { recent: [], totals: { gained:0, lost:0 } }; // yeni
        this.activeMentorshipId = null; // yeni
        this.mentorshipRatings = { asMentor:{}, asMentee:{} }; // yeni
        this.lbMode = 'top'; // yeni: leaderboard modu
        this.lbCategory = 'trust'; // yeni: trust | mentor
        // Yeni: Trust rank & trend
        this.trustRank = null;
        this.trustTrend = [];
        
        this.mentorLbMinSessions = 3; // yeni dinamik filtre
        this.mentorLbLimit = 15;      // yeni dinamik limit
        
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
            const token = localStorage.getItem('jwt_token');
            if(!token){ window.location.href='/login.html'; return; }
            const r = await fetch('/api/user/bootstrap', { headers:{'Authorization':'Bearer '+token} });
            if(r.ok){
                const b = await r.json();
                this.user = { id: b.user.id, displayName: b.user.username, trustScore: b.user.trust_score, bot_tutorial_state: b.user.bot_tutorial_state, resources:{ money:b.user.money, wood:b.user.wood, grain:b.user.grain, business:b.user.business } };
                this.resources = this.user.resources;
                this.trustEarnedToday = b.dailyTrust.earned;
                this.trustCap = b.dailyTrust.cap;
                this.trustRemaining = b.dailyTrust.remaining;
                if(b.user.mentor_ready) this.isMentorQueued = true;
                if(b.user.mentee_waiting) this.isMenteeWaiting = true;
                if(b.mentorship.active){ this.user.bot_tutorial_state='DONE'; }
                this.trustHistory.recent = b.trust?.recent || [];
                this.trustHistory.totals = b.trust?.totals || { gained:0, lost:0 };
                this.mentorshipRatings = b.mentorshipRatings || { asMentor:{}, asMentee:{} };
                // Yeni: rank & trend
                this.trustRank = b.trustRank || null;
                this.trustTrend = (b.trustTrend && b.trustTrend.days) || [];
                this.updateUserDisplay();
                this.updateResourcesDisplay();
                this.updateMentorCard();
                this.updateMentorReadyButton();
                this.updateTrustEarningsDisplay();
                this.renderTrustMiniHistory();
                this.renderMentorRatingSummary();
                this.renderTrustRank();
                this.renderTrustTrend();
                // Mentor self rank badge
                this.refreshMentorRankBadge();
            } else { await this.legacyLoadUserData(); }
        } catch{ await this.legacyLoadUserData(); }
    }

    async legacyLoadUserData(){
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('jwt_token');
        if (userData && token) {
            this.user = JSON.parse(userData);
            this.resources = this.user.resources || this.resources;
            this.updateUserDisplay();
            this.updateResourcesDisplay();
            await this.loadDailyTrustEarned();
            this.fetchActiveMentorship();
        } else { window.location.href='/login.html'; }
    }
    async loadDailyTrustEarned(force=false){
        try {
            const token = localStorage.getItem('jwt_token');
            const url = '/api/user/trust/daily-earned' + (force ? '?force=1' : '');
            const r = await fetch(url,{headers:{'Authorization':'Bearer '+token}});
            if(r.ok){
                const j=await r.json();
                this.trustEarnedToday = j.earned;
                this.trustCap = j.cap;
                this.trustRemaining = j.remaining;
                this.updateTrustEarningsDisplay();
            }
        } catch(e){}
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
        const reqBtn = document.getElementById('request-real-mentor');
        const cancelBtn = document.getElementById('cancel-real-mentor');
        const eligInfo = document.getElementById('mentor-eligibility-info');
        if(!state || !botSection || !realSection || !mentorStatus) return;
        if(['INTRO','FIRST_CHAT','FIRST_CONTRACT','TRUST_LEARN'].includes(state)) {
            botSection.classList.remove('d-none');
            realSection.classList.add('d-none');
            mentorStatus.textContent = 'Bot';
            mentorStatus.className = 'trust-badge trust-good';
            if(reqBtn) { reqBtn.disabled=false; reqBtn.classList.remove('d-none'); }
        } else if(state === 'MENTOR_MATCH') {
            botSection.classList.remove('d-none');
            realSection.classList.add('d-none');
            mentorStatus.textContent = 'Eşleşme Aranıyor';
            mentorStatus.className = 'trust-badge trust-medium';
            if(reqBtn) reqBtn.disabled = true;
            if(cancelBtn) cancelBtn.classList.remove('d-none');
        } else {
            if(cancelBtn) cancelBtn.classList.add('d-none');
        }
        if(this.isMenteeWaiting && cancelBtn){ cancelBtn.classList.remove('d-none'); if(reqBtn) reqBtn.disabled = true; }
        if(eligInfo) this.loadMentorEligibility();
        this.updateMentorQueues();
    }

    async loadMentorEligibility(){
        try {
            const r = await fetch('/api/mentor/mentor/eligibility', { headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
            if(!r.ok) return;
            const j = await r.json();
            const eligInfo = document.getElementById('mentor-eligibility-info');
            const mentorSelf = document.getElementById('mentor-self-actions');
            if(!eligInfo) return;
            if(j.eligible){
                eligInfo.textContent = 'Mentor olabilirsin (Trust: '+j.trust+')';
                eligInfo.className = 'mentor-eligibility ok';
                if(mentorSelf) mentorSelf.classList.remove('d-none');
                // Backend flag üzerinden hazır mı kontrolü
                this.fetchMentorFlags();
            } else {
                if(j.reason==='low_trust') eligInfo.textContent = 'Mentor olmak için Trust '+j.trust+'/'+j.required;
                else if(j.reason==='already_active') eligInfo.textContent = 'Aktif mentorship var';
                else eligInfo.textContent = 'Mentor olamazsın';
                eligInfo.className = 'mentor-eligibility fail';
                if(mentorSelf) mentorSelf.classList.add('d-none');
            }
        } catch{}
    }

    async fetchMentorFlags(){
        try {
            const r = await fetch('/api/user/me',{ headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
            if(!r.ok) return; const j = await r.json();
            if(j.user){
                this.isMentorQueued = j.user.mentor_ready === 1;
                this.isMenteeWaiting = j.user.mentee_waiting === 1;
                this.updateMentorReadyButton();
                this.updateMentorCard();
            }
        } catch{}
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
        const reqBtn = document.getElementById('request-real-mentor');
        const cancelBtn = document.getElementById('cancel-real-mentor');
        const eligInfo = document.getElementById('mentor-eligibility-info');
        if(!state || !botSection || !realSection || !mentorStatus) return;
        if(['INTRO','FIRST_CHAT','FIRST_CONTRACT','TRUST_LEARN'].includes(state)) {
            botSection.classList.remove('d-none');
            realSection.classList.add('d-none');
            mentorStatus.textContent = 'Bot';
            mentorStatus.className = 'trust-badge trust-good';
            if(reqBtn) { reqBtn.disabled=false; reqBtn.classList.remove('d-none'); }
        } else if(state === 'MENTOR_MATCH') {
            botSection.classList.remove('d-none');
            realSection.classList.add('d-none');
            mentorStatus.textContent = 'Eşleşme Aranıyor';
            mentorStatus.className = 'trust-badge trust-medium';
            if(reqBtn) reqBtn.disabled = true;
            if(cancelBtn) cancelBtn.classList.remove('d-none');
        } else {
            if(cancelBtn) cancelBtn.classList.add('d-none');
        }
        if(this.isMenteeWaiting && cancelBtn){ cancelBtn.classList.remove('d-none'); if(reqBtn) reqBtn.disabled = true; }
        if(eligInfo) this.loadMentorEligibility();
        this.updateMentorQueues();
    }

    async loadMentorEligibility(){
        try {
            const r = await fetch('/api/mentor/mentor/eligibility', { headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
            if(!r.ok) return;
            const j = await r.json();
            const eligInfo = document.getElementById('mentor-eligibility-info');
            const mentorSelf = document.getElementById('mentor-self-actions');
            if(!eligInfo) return;
            if(j.eligible){
                eligInfo.textContent = 'Mentor olabilirsin (Trust: '+j.trust+')';
                eligInfo.className = 'mentor-eligibility ok';
                if(mentorSelf) mentorSelf.classList.remove('d-none');
                // Backend flag üzerinden hazır mı kontrolü
                this.fetchMentorFlags();
            } else {
                if(j.reason==='low_trust') eligInfo.textContent = 'Mentor olmak için Trust '+j.trust+'/'+j.required;
                else if(j.reason==='already_active') eligInfo.textContent = 'Aktif mentorship var';
                else eligInfo.textContent = 'Mentor olamazsın';
                eligInfo.className = 'mentor-eligibility fail';
                if(mentorSelf) mentorSelf.classList.add('d-none');
            }
        } catch{}
    }

    async fetchMentorFlags(){
        try {
            const r = await fetch('/api/user/me',{ headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
            if(!r.ok) return; const j = await r.json();
            if(j.user){
                this.isMentorQueued = j.user.mentor_ready === 1;
                this.isMenteeWaiting = j.user.mentee_waiting === 1;
                this.updateMentorReadyButton();
                this.updateMentorCard();
            }
        } catch{}
    }

    // Mentor rank fetch
    async fetchSelfMentorRank(minSessions=this.mentorLbMinSessions){
        try {
            const r = await fetch(`/api/user/leaderboard?category=mentor&self=1&limit=0&minSessions=${encodeURIComponent(minSessions)}`, { headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
            if(!r.ok) return null; const j = await r.json(); return j.selfRank || null;
        } catch { return null; }
    }
    openMentorRankModal(){ this.loadMentorRank(); const m=document.getElementById('mentor-rank-modal'); if(m) m.classList.remove('d-none'); }
    closeMentorRankModal(){ const m=document.getElementById('mentor-rank-modal'); if(m) m.classList.add('d-none'); }
    async loadMentorRank(){
        const box = document.getElementById('mentor-rank-box'); if(box) box.textContent='Yükleniyor...';
        const data = await this.fetchSelfMentorRank();
        if(!box) return; if(!data){ box.textContent='Hata'; return; }
        if(!data.ranked){
            if(data.reason==='min_sessions') box.innerHTML = `Henüz sıralamada değilsin. Minimum ${data.minSessions} oturum gerek. (Sen: ${data.sessions})`;
            else if(data.reason==='no_rating') box.innerHTML = 'Henüz rating verisi yok.';
            else box.innerHTML = 'Sıralama verisi yok.';
            this.updateMentorRankBadge(null);
            return;
        }
        box.innerHTML = `<div style='display:flex;flex-direction:column;gap:6px;'>
          <div><strong>Rank:</strong> #${data.rank} / ${data.total}</div>
          <div><strong>Percentile:</strong> %${data.percentile}</div>
          <div><strong>Oturum:</strong> ${data.sessions}</div>
          <div><strong>Ortalama Puan:</strong> ⭐ ${data.avg_rating}</div>
          <div style='font-size:11px;opacity:.6;'>Filtre: >=${data.minSessions} oturum</div>
        </div>`;
        this.updateMentorRankBadge(data);
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
                        // Lokal tahmini + server force sync
                        this.trustEarnedToday += 2;
                        this.updateTrustEarningsDisplay();
                        this.genericToast('+2 İtibar (Kontrat)', 'contract');
                        this.loadDailyTrustEarned(true); // force senkron
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
                // Yeni: mentor atama
                this.socket.on('mentor_assigned', (data) => {
                    if(this.user && (data.menteeId === this.user.id || data.mentorId === this.user.id)) {
                        if(data.menteeId === this.user.id){
                            this.user.bot_tutorial_state = 'DONE';
                            this.isMenteeWaiting = false; // reset
                            this.updateMentorCard();
                            const name = data.mentorUsername ? ('Mentor: '+data.mentorUsername) : ('Mentor #' + data.mentorId);
                            this.genericToast('Mentor atandı! '+name,'mentor');
                            this.fetchActiveMentorship();
                            this.fetchMentorFlags();
                        } else if(data.mentorId === this.user.id){
                            this.isMentorQueued = false; // mentor artık aktif
                            const name = data.menteeUsername ? ('Mentee: '+data.menteeUsername) : ('Mentee #' + data.menteeId);
                            this.genericToast('Yeni mentee eşleşti! '+name,'mentor');
                            this.fetchActiveMentorship();
                            this.fetchMentorFlags();
                        }
                    }
                });
                // Yeni: mentorluk tamamlandı -> leaderboard & self rank refresh
                let _mentorLbRefreshTimer=null;
                const scheduleMentorLbRefresh = ()=>{
                    if(_mentorLbRefreshTimer) return;
                    _mentorLbRefreshTimer = setTimeout(()=>{
                        _mentorLbRefreshTimer=null;
                        try { if(this.lbCategory==='mentor') this.loadLeaderboard(); } catch{}
                        try { this.fetchSelfMentorRank && this.fetchSelfMentorRank(); } catch{}
                    }, 1200);
                };
                this.socket.on('mentorship_completed', (m)=>{
                    if(!m) return;
                    // Her iki taraf için güncelleme anlamlı
                    if(this.user && (m.mentor_id===this.user.id || m.mentee_id===this.user.id)){
                        this.genericToast('Mentorluk tamamlandı (#'+m.id+')','mentor');
                        scheduleMentorLbRefresh();
                        this.refreshMentorRankBadge();
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

        // Günlük reset kontrolü (her 60 sn)
        setInterval(()=>{
            const now = new Date();
            if(!this._lastDay){ this._lastDay = now.getDate(); }
            if(this._lastDay !== now.getDate()){
                this._lastDay = now.getDate();
                this.trustEarnedToday = 0;
                this.updateTrustEarningsDisplay();
                this.loadDailyTrustEarned();
            }
        },60000);

        // Günlük trust periyodik senkron (her 30sn cache hit, 5. dakikada force)
        let counter=0;
        setInterval(()=>{
            counter++;
            const force = (counter % 10 === 0); // ~5 dakikada bir force (30s *10)
            this.loadDailyTrustEarned(force);
        },30000);

        // Mentor queue sayıları (her 40sn)
        setInterval(()=>{ this.updateMentorQueues(); }, 40000);
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
        if(el){
            const earned = this.trustEarnedToday||0;
            const cap = this.trustCap||40;
            el.textContent = '+'+earned;
            const ratio = earned / cap;
            el.classList.remove('trust-excellent','trust-good','trust-medium','trust-low','trust-bad');
            if(ratio >= 1){ el.classList.add('trust-bad'); }
            else if(ratio >= 0.85){ el.classList.add('trust-low'); }
            else if(ratio >= 0.6){ el.classList.add('trust-medium'); }
            else if(ratio >= 0.3){ el.classList.add('trust-good'); }
            else { el.classList.add('trust-excellent'); }
            el.title = `Günlük ödül: ${earned}/${cap} (kalan ${Math.max(0, cap-earned)})`;
        }
    }
    async fetchActiveMentorship(){
        try {
            const r = await fetch('/api/mentor/active', { headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
            if(r.ok){
                const j = await r.json();
                if(j.active){
                    const realSection = document.getElementById('real-mentor');
                    const botSection = document.getElementById('bot-mentor');
                    const mentorStatus = document.getElementById('mentor-status');
                    if(realSection && botSection && mentorStatus){
                        botSection.classList.add('d-none');
                        realSection.classList.remove('d-none');
                        mentorStatus.textContent = 'Aktif';
                        mentorStatus.className = 'trust-badge trust-excellent';
                        const nameEl = document.getElementById('mentor-name');
                        const descEl = document.getElementById('mentor-description');
                        if(nameEl) nameEl.textContent = j.mentorship.mentor_username || ('Mentor #' + j.mentorship.mentor_id);
                        if(descEl) descEl.textContent = 'Mentor-ID: '+ j.mentorship.mentor_id + ' | Mentee-ID: ' + j.mentorship.mentee_id;
                    }
                }
            }
        } catch(e){}
    }
    async updateMentorQueues(){
        try {
            const r = await fetch('/api/mentor/queues',{ headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
            if(!r.ok) return; const j = await r.json();
            const el = document.getElementById('mentor-queue-counts');
            if(el){ el.textContent = 'Kuyruk: '+(j.counts?.mentors||0)+' mentor / '+(j.counts?.mentees||0)+' mentee'; }
        } catch{}
    }

    async toggleMentorReady(){
        if(this.isMentorQueued){
            try { const r = await fetch('/api/mentor/mentor/leave',{method:'POST', headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} }); if(r.ok){ this.isMentorQueued=false; this.genericToast('Mentor kuyruğundan çıktın','mentor'); this.updateMentorReadyButton(); } } catch{}
        } else {
            try { const r = await fetch('/api/mentor/mentor/ready',{method:'POST', headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} }); const j = await r.json().catch(()=>({})); if(r.ok && j.ok){ this.isMentorQueued=true; this.genericToast('Mentor olarak hazırsın','mentor'); this.updateMentorReadyButton(); } else { this.showError('Mentor olamadı: '+(j.reason||j.error||'hata')); } } catch{ this.showError('Bağlantı hatası'); }
        }
    }

    updateMentorReadyButton(){
        const btn = document.getElementById('mentor-ready-btn');
        if(!btn) return;
        if(this.isMentorQueued){
            btn.textContent = '🛑 Mentor Modu Kapat';
            btn.classList.remove('btn-outline');
            btn.classList.add('btn-danger');
        } else {
            btn.textContent = '✅ Mentor Modu Aç';
            btn.classList.add('btn-outline');
            btn.classList.remove('btn-danger');
        }
    }

    async requestRealMentor(){
        if(this.isMenteeWaiting){ return; }
        try {
            const r = await fetch('/api/mentor/mentor/request',{ method:'POST', headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
            if(r.ok){
                const j = await r.json();
                if(j.queued){ this.isMenteeWaiting = true; this.genericToast('Gerçek mentor aranıyor...','mentor'); this.user.bot_tutorial_state='MENTOR_MATCH'; this.updateMentorCard(); }
            } else {
                const e = await r.json().catch(()=>({}));
                this.showError('Mentor isteği başarısız: '+(e.reason||e.error||'hata'));
            }
        } catch{ this.showError('Bağlantı hatası'); }
    }

    async cancelRealMentor(){
        if(!this.isMenteeWaiting) return;
        try {
            const r = await fetch('/api/mentor/mentee/toggle',{ method:'POST', headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token'),'Content-Type':'application/json'}, body: JSON.stringify({ waiting:false }) });
            if(r.ok){ this.isMenteeWaiting = false; this.genericToast('Mentor arama iptal edildi','mentor'); const cancelBtn=document.getElementById('cancel-real-mentor'); if(cancelBtn) cancelBtn.classList.add('d-none'); const reqBtn=document.getElementById('request-real-mentor'); if(reqBtn) { reqBtn.disabled=false; } }
        } catch{}
    }
    renderTrustMiniHistory(){
        const wrapId = 'trust-mini-history';
        let wrap = document.getElementById(wrapId);
        if(!wrap){
            wrap = document.createElement('div');
            wrap.id = wrapId;
            wrap.style.marginTop = '12px';
            const statsCard = document.querySelector('.stats-grid')?.parentElement;
            if(statsCard){ statsCard.appendChild(wrap); }
        }
        if(!wrap) return;
        const gained = this.trustHistory.totals.gained||0;
        const lost = this.trustHistory.totals.lost||0;
        wrap.innerHTML = `<div style="font-size:12px;color:#bbb;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <span>Trust Kazanç: +${gained}</span>
          <span>Trust Kayıp: -${lost}</span>
          <span>Son Olaylar:</span>
          ${this.trustHistory.recent.map(r=>`<span style='background:#222;padding:2px 6px;border-radius:12px;'>${r.delta>0?'+':''}${r.delta} (${r.reason})</span>`).join('') || '<em>kayıt yok</em>'}
        </div>`;
        if(!wrap.querySelector('.trust-history-btn')){
            const btn = document.createElement('button');
            btn.textContent = 'Detaylı';
            btn.className = 'trust-history-btn';
            btn.style.cssText = 'margin-left:auto;background:#263238;border:1px solid #444;color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;';
            btn.onclick = ()=> this.openTrustHistory();
            wrap.appendChild(btn);
        }
    }

    async openTrustHistory(){
        if(!this._trustModal){
            const m = document.createElement('div');
            m.id='trust-modal';
            m.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;';
            m.innerHTML=`<div style="background:#121214;padding:16px;border-radius:12px;width:90%;max-width:420px;max-height:80%;overflow:auto;font-size:13px;">
              <h3 style='margin-top:0'>Trust Geçmişi</h3>
              <div id='trust-history-list'>Yükleniyor...</div>
              <div style='display:flex;gap:8px;margin-top:12px;justify-content:space-between;'>
                <button id='trust-prev' style='flex:1;background:#263238;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:6px;'>Önceki</button>
                <button id='trust-next' style='flex:1;background:#263238;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:6px;'>Sonraki</button>
                <button id='trust-close' style='flex:1;background:#8d2e2e;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:6px;'>Kapat</button>
              </div>
            </div>`;
            document.body.appendChild(m);
            this._trustModal = m;
            m.addEventListener('click', e=>{ if(e.target===m) this.closeTrustHistory(); });
            m.querySelector('#trust-close').onclick = ()=> this.closeTrustHistory();
            m.querySelector('#trust-prev').onclick = ()=> { if(this._trustOffset>0){ this._trustOffset -= this._trustLimit; this.loadTrustHistory(); } };
            m.querySelector('#trust-next').onclick = ()=> { if(this._trustOffset + this._trustLimit < (this._trustTotal||0)){ this._trustOffset += this._trustLimit; this.loadTrustHistory(); } };
            this._trustLimit = 20; this._trustOffset = 0; this._trustTotal = 0;
        }
        this._trustModal.style.display='flex';
        this.loadTrustHistory();
    }

    closeTrustHistory(){ if(this._trustModal) this._trustModal.style.display='none'; }

    async loadTrustHistory(){
        try {
            const list = document.getElementById('trust-history-list');
            if(list) list.textContent='Yükleniyor...';
            const r = await fetch(`/api/user/trust/history?limit=${this._trustLimit}&offset=${this._trustOffset}`, { headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
            if(r.ok){
                const j = await r.json();
                this._trustTotal = j.total;
                if(list){
                    if(!j.events.length){ list.innerHTML='<em>Kayıt yok</em>'; }
                    else {
                        list.innerHTML = j.events.map(ev=>`<div style='padding:4px 0;border-bottom:1px solid #1e1e22;display:flex;gap:8px;'>
                          <span style='min-width:46px;color:${ev.delta>0?'#4caf50':'#f44336'};'>${ev.delta>0?'+':''}${ev.delta}</span>
                          <span style='flex:1;'>${ev.reason}</span>
                          <span style='opacity:.6;font-size:11px;'>${ev.created_at}</span>
                        </div>`).join('');
                    }
                }
            } else {
                if(list) list.textContent='Hata';
            }
        } catch(e){ const list = document.getElementById('trust-history-list'); if(list) list.textContent='Hata'; }
    }
    openMentorshipCompleteModal(){ if(!this.activeMentorshipId) return; const m=document.getElementById('mentorship-complete-modal'); if(m) m.classList.remove('d-none'); }
    closeMentorshipCompleteModal(){ const m=document.getElementById('mentorship-complete-modal'); if(m) m.classList.add('d-none'); }
    async submitMentorshipCompletion(){
        if(!this.activeMentorshipId) return;
        const body={};
        const mrEl=document.getElementById('mentor-rating-input');
        const meEl=document.getElementById('mentee-rating-input');
        const mr=Number(mrEl?.value)||0; if(mr>=1&&mr<=5) body.mentor_rating=mr;
        const me=Number(meEl?.value)||0; if(me>=1&&me<=5) body.mentee_rating=me;
        try {
          const r=await fetch(`/api/mentor/mentorship/${this.activeMentorshipId}/complete`, { method:'POST', headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token'),'Content-Type':'application/json'}, body: JSON.stringify(body)});
          const j=await r.json().catch(()=>({}));
          if(r.ok){ this.genericToast('Mentorluk tamamlandı','mentor'); this.closeMentorshipCompleteModal(); this.activeMentorshipId=null; const sess=document.getElementById('mentor-session-actions'); if(sess) sess.style.display='none'; this.fetchMentorFlags(); }
          else { this.showError('Tamamlama hata: '+(j.error||'bilinmeyen')); }
        } catch { this.showError('Bağlantı hatası'); }
    }
    renderMentorRatingSummary(){
        const el = document.getElementById('mentor-rating-summary');
        if(!el || !this.mentorshipRatings) return;
        const m = this.mentorshipRatings.asMentor || { count:0, avg_rating:null };
        const me = this.mentorshipRatings.asMentee || { count:0, avg_rating:null };
        el.textContent = `Mentor: ${m.count||0} oturum${m.avg_rating? ' (⭐'+m.avg_rating+')':''} • Mentee: ${me.count||0}${me.avg_rating? ' (⭐'+me.avg_rating+')':''}`;
    }
    // Mentorluk geçmişi modal
    openMentorshipHistory(){ this.mhOffset=0; this.loadMentorshipHistory(); const modal=document.getElementById('mentorship-history-modal'); if(modal) modal.classList.remove('d-none'); }
    closeMentorshipHistory(){ const modal=document.getElementById('mentorship-history-modal'); if(modal) modal.classList.add('d-none'); }
    async loadMentorshipHistory(){
       try {
         const limit=10; const r=await fetch(`/api/user/mentorship/history?limit=${limit}&offset=${this.mhOffset||0}`, { headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
         if(!r.ok) return; const j=await r.json();
         const list=document.getElementById('mentorship-history-list'); if(!list) return;
         list.innerHTML='';
         if(!j.mentorships.length){ list.innerHTML='<div style="padding:8px;color:#777;">Kayıt yok</div>'; }
         j.mentorships.forEach(m=>{
            const div=document.createElement('div');
            div.style.background='#26262b'; div.style.padding='8px 10px'; div.style.borderRadius='8px';
            const youAre = m.role==='mentor' ? 'Mentor' : 'Mentee';
            const otherId = m.role==='mentor' ? m.mentee_id : m.mentor_id;
            const rating = m.role==='mentor' ? (m.mentee_rating? '⭐'+m.mentee_rating : '-') : (m.mentor_rating? '⭐'+m.mentor_rating : '-');
            div.innerHTML = `<strong>${youAre}</strong> • Diğer: #${otherId} • Puan: ${rating}<br><span style='opacity:.7;'>${m.created_at.split('T')[0]} → ${(m.ended_at||'').split('T')[0] || '—'}</span>`;
            list.appendChild(div);
         });
         const pageInfo=document.getElementById('mh-page-info');
         const prev=document.getElementById('mh-prev');
         const next=document.getElementById('mh-next');
         const page = Math.floor((this.mhOffset||0)/limit)+1;
         const totalPages = Math.max(1, Math.ceil(j.total/limit));
         if(pageInfo) pageInfo.textContent = page + '/' + totalPages;
         if(prev) prev.disabled = page<=1;
         if(next) next.disabled = page>=totalPages;
         prev&&prev.addEventListener('click', ()=>{ if(this.mhOffset>=limit){ this.mhOffset-=limit; this.loadMentorshipHistory(); } });
         next&&next.addEventListener('click', ()=>{ if(this.mhOffset+limit<j.total){ this.mhOffset+=limit; this.loadMentorshipHistory(); } });
       } catch{}
    }
    openLeaderboard(){ this.lbMode='top'; this.loadLeaderboard(); const m=document.getElementById('leaderboard-modal'); if(m) m.classList.remove('d-none'); }
    closeLeaderboard(){ const m=document.getElementById('leaderboard-modal'); if(m) m.classList.add('d-none'); }
    setLeaderboardMode(mode){ this.lbMode=mode; const topBtn=document.getElementById('lb-mode-top'); const aroundBtn=document.getElementById('lb-mode-around'); if(topBtn&&aroundBtn){ if(mode==='top'){ topBtn.classList.replace('btn-outline','btn-secondary'); aroundBtn.classList.replace('btn-secondary','btn-outline'); } else { aroundBtn.classList.replace('btn-outline','btn-secondary'); topBtn.classList.replace('btn-secondary','btn-outline'); } } this.loadLeaderboard(); }
    setLeaderboardCategory(cat){
        if(!['trust','mentor'].includes(cat)) return; this.lbCategory=cat; this.loadLeaderboard();
        const catTrust=document.getElementById('lb-cat-trust'); const catMentor=document.getElementById('lb-cat-mentor');
        if(catTrust&&catMentor){ if(cat==='trust'){ catTrust.classList.add('btn-secondary'); catTrust.classList.remove('btn-outline'); catMentor.classList.add('btn-outline'); catMentor.classList.remove('btn-secondary'); } else { catMentor.classList.add('btn-secondary'); catMentor.classList.remove('btn-outline'); catTrust.classList.add('btn-outline'); catTrust.classList.remove('btn-secondary'); } }
        // Mode buttons sadece trust için göster
        const modeWrap=document.getElementById('lb-mode-wrap'); if(modeWrap){ modeWrap.style.display = (cat==='trust') ? 'flex':'none'; }
        const userRankEl=document.getElementById('leaderboard-user-rank'); if(userRankEl){ userRankEl.style.display = (cat==='trust') ? 'block':'none'; }
    }
    async loadLeaderboard(){
      try {
        const listEl = document.getElementById('leaderboard-list');
        if(listEl) listEl.innerHTML = '<div style="padding:8px;color:#666;">Yükleniyor...</div>';
        if(this.lbCategory==='mentor'){
          const r = await fetch(`/api/user/leaderboard?category=mentor&limit=${this.mentorLbLimit}&minSessions=${this.mentorLbMinSessions}`, { headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
          if(!r.ok){ if(listEl) listEl.innerHTML='<div style="padding:8px;color:#c55;">Hata</div>'; return; }
          const j = await r.json();
          if(!listEl) return;
          listEl.innerHTML='';
          if(typeof j.total === 'number'){
            const info=document.createElement('div');
            info.style.cssText='padding:4px 8px 6px;font-size:11px;opacity:.65;text-align:right;';
            info.textContent = `Toplam Nitelikli Mentor: ${j.total} (>=${this.mentorLbMinSessions} oturum)`;
            listEl.appendChild(info);
          }
          if(!(j.list||[]).length){ listEl.innerHTML+='<div style="padding:8px;color:#888;">Kayıt yok</div>'; return; }
          j.list.forEach((u,i)=>{
            const div=document.createElement('div');
            div.style.background='#26262b'; div.style.padding='6px 10px'; div.style.borderRadius='8px'; div.style.display='flex'; div.style.justifyContent='space-between'; div.style.fontSize='13px';
            div.innerHTML = `<span>#${i+1} ${u.username||('U'+u.id)}<span style='opacity:.5;margin-left:4px;'>${u.sessions} oturum</span></span><span style='font-weight:600;'>⭐ ${u.avg_rating||'-'}</span>`;
            listEl.appendChild(div);
          });
          const rankEl=document.getElementById('leaderboard-user-rank'); if(rankEl) rankEl.textContent='';
          return;
        }
        // trust leaderboard
        const around = this.lbMode==='around' ? '1':'0';
        const r = await fetch(`/api/user/leaderboard?category=trust&limit=15&around=${around}&window=3`, { headers:{'Authorization':'Bearer '+localStorage.getItem('jwt_token')} });
        if(!r.ok) return; const j = await r.json();
        const rankEl = document.getElementById('leaderboard-user-rank');
        if(!listEl) return;
        listEl.innerHTML='';
        if(rankEl && !j.around){ rankEl.textContent = j.userRank ? ('SIRAN: #' + j.userRank) : ''; }
        if(j.around && rankEl){ rankEl.textContent = j.userRank ? ('Çevre Sıra: #' + j.userRank) : ''; }
        (j.list||[]).forEach((u,i)=>{
          const div=document.createElement('div');
          const rank = u.r || (i+1); // around modda r var
          const highlight = (u.id === this.user.id);
          div.style.background = highlight ? '#274054' : '#26262b';
          div.style.padding='6px 10px';
          div.style.borderRadius='8px';
          div.style.display='flex';
          div.style.justifyContent='space-between';
          div.innerHTML = `<span>#${rank} ${u.username}</span><span style='font-weight:600;'>${u.trust_score}</span>`;
          listEl.appendChild(div);
        });
      } catch{}
    }
    // Yeni: Trust Rank gösterimi
    renderTrustRank(){
        const line = document.getElementById('trust-rank-line');
        if(!line || !this.trustRank) return;
        const { rank, total, percentile } = this.trustRank;
        line.textContent = `Sıra: #${rank}/${total} • Yüzdelik: ${percentile}%`;
    }
    // Yeni: Trust Trend sparkline
    renderTrustTrend(){
        const wrap = document.getElementById('trust-trend-spark');
        if(!wrap) return;
        const data = this.trustTrend || [];
        if(!data.length){ wrap.innerHTML = '<em style="font-size:11px;color:#555;">Trend yok</em>'; return; }
        const values = data.map(d=>d.total);
        const min = Math.min(...values, 0);
        const max = Math.max(...values, 1);
        const W = Math.max(120, data.length * 18);
        const H = 28; const pad = 2;
        const scaleX = (i)=> pad + (i/(data.length-1))*(W-2*pad);
        const scaleY = (v)=> {
            if(max===min) return H/2; // flat line
            return H - pad - ((v - min)/(max - min))*(H-2*pad);
        };
        let path = '';
        data.forEach((d,i)=>{
            const x = scaleX(i).toFixed(2);
            const y = scaleY(d.total).toFixed(2);
            path += (i===0?`M${x},${y}`:` L${x},${y}`);
        });
        const areaPath = path + ` L${scaleX(data.length-1).toFixed(2)},${H-pad} L${scaleX(0).toFixed(2)},${H-pad} Z`;
        const last = data[data.length-1];
        const diff = last.total - data[0].total;
        const color = diff>0 ? '#4CAF50' : (diff<0 ? '#F44336' : '#FFC107');
        wrap.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
            <path d="${areaPath}" fill="${color}20" stroke="none"></path>
            <path d="${path}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
        </svg>`;
        wrap.title = data.map(d=>`${d.day}: ${d.total}`).join('\n');
    }
}

// Global fonksiyonlar (HTML'den çağrılabilir)
window.dashboard = null;
window.requestRealMentor = function(){ if(window.dashboard) window.dashboard.requestRealMentor(); };
window.toggleMentorReady = function(){ if(window.dashboard) window.dashboard.toggleMentorReady(); };
window.cancelRealMentor = function(){ if(window.dashboard) window.dashboard.cancelRealMentor(); };
window.openMentorshipCompleteModal=()=>window.dashboard&&window.dashboard.openMentorshipCompleteModal();
window.closeMentorshipCompleteModal=()=>window.dashboard&&window.dashboard.closeMentorshipCompleteModal();
window.submitMentorshipCompletion=()=>window.dashboard&&window.dashboard.submitMentorshipCompletion();
window.openMentorshipHistory=()=>window.dashboard&&window.dashboard.openMentorshipHistory();
window.closeMentorshipHistory=()=>window.dashboard&&window.dashboard.closeMentorshipHistory();
window.openLeaderboard=()=>window.dashboard&&window.dashboard.openLeaderboard();
window.closeLeaderboard=()=>window.dashboard&&window.dashboard.closeLeaderboard();
window.setLeaderboardMode=(m)=>window.dashboard&&window.dashboard.setLeaderboardMode(m);
window.setLeaderboardCategory=(c)=>window.dashboard&&window.dashboard.setLeaderboardCategory(c);
window.openMentorRankModal=()=>window.dashboard&&window.dashboard.openMentorRankModal();
window.closeMentorRankModal=()=>window.dashboard&&window.dashboard.closeMentorRankModal();


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
    if (!window.__DEFER_DASHBOARD__) {
        window.dashboard = new Dashboard();
    } else {
        window.__BOOT_DASHBOARD__ = () => { window.dashboard = new Dashboard(); };
    }
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
