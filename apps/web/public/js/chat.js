// 💬 Chat JavaScript - Gerçek Zamanlı Sohbet İşlevleri

class ChatManager {
    constructor() {
        this.socket = null;
        this.user = null;
        this.currentTab = 'global';
        this.messages = {
            global: [],
            local: [],
            private: []
        };
        this.typingUsers = new Set();
        this.typingTimer = null;
        this.isConnected = false;
        this.messageCache = new Map();
        this.lastMessageId = 0;
        
        this.init();
    }

    // Başlatma işlemleri
    async init() {
        try {
            await this.loadUserData();
            this.setupElements();
            this.setupEventListeners();
            this.connectSocket();
            this.loadCachedMessages();
            
            console.log('✅ Chat Manager başlatıldı');
        } catch (error) {
            console.error('❌ Chat başlatma hatası:', error);
            this.showError('Chat yüklenirken bir hata oluştu');
        }
    }

    // Kullanıcı verilerini yükle
    async loadUserData() {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('jwt_token');
        
        if (!userData || !token) {
            window.location.href = '/login.html';
            return;
        }
        
        this.user = JSON.parse(userData);
    }

    // DOM elementlerini ayarla
    setupElements() {
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.messagesContainer = document.getElementById('chat-messages');
        this.onlineCountEl = document.getElementById('online-count');
        this.chatTitleEl = document.getElementById('chat-title-text');
        this.chatIconEl = document.getElementById('chat-icon');
        this.charCounterEl = document.getElementById('char-counter');
        this.typingIndicatorEl = document.getElementById('typing-indicator');
        
        // Tab buttons
        this.tabButtons = document.querySelectorAll('.chat-tab');
    }

    // Event listener'ları ayarla
    setupEventListeners() {
        // Send button
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Message input
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            this.messageInput.addEventListener('input', () => {
                this.updateCharCounter();
                this.updateSendButton();
                this.handleTyping();
            });

            this.messageInput.addEventListener('blur', () => {
                this.stopTyping();
            });
        }

        // Tab buttons
        this.tabButtons.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Message container scroll
        if (this.messagesContainer) {
            this.messagesContainer.addEventListener('scroll', () => {
                this.handleScroll();
            });
        }

        // Context menu for messages
        document.addEventListener('contextmenu', (e) => {
            const messageItem = e.target.closest('.message-item');
            if (messageItem && !messageItem.classList.contains('bot-message')) {
                e.preventDefault();
                this.showContextMenu(e, messageItem);
            }
        });

        // Close context menu
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        // User profile modal
        document.addEventListener('click', (e) => {
            const userName = e.target.closest('.message-user-name');
            if (userName && !userName.textContent.includes('🤖')) {
                this.showUserModal(userName.textContent);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    // Socket bağlantısı kur
    connectSocket() {
        if (typeof io === 'undefined') {
            console.warn('⚠️ Socket.io bulunamadı - chat simülasyon modu');
            this.simulateChatEvents();
            return;
        }

        try {
            this.socket = io({
                timeout: 5000,
                transports: ['websocket', 'polling']
            });
            
            this.socket.on('connect', () => {
                console.log('🔌 Chat socket bağlandı');
                this.isConnected = true;
                this.hideConnectionStatus();
                
                // Join chat room
                this.socket.emit('join_chat', {
                    userId: this.user.id,
                    userName: this.user.displayName,
                    userTrustScore: this.user.trustScore,
                    token: localStorage.getItem('jwt_token')
                });
                
                // Load recent messages
                this.loadRecentMessages();
            });

            this.socket.on('disconnect', () => {
                console.log('🔌 Chat socket bağlantısı kesildi');
                this.isConnected = false;
                this.showConnectionStatus();
            });

            this.socket.on('connect_error', (error) => {
                console.warn('⚠️ Chat socket bağlantı hatası:', error);
                this.showConnectionStatus();
                this.simulateChatEvents();
            });

            // Chat events
            this.socket.on('new_message', (message) => {
                this.handleNewMessage(message);
            });

            this.socket.on('user_joined', (data) => {
                this.showUserJoinedNotification(data);
            });

            this.socket.on('user_left', (data) => {
                this.showUserLeftNotification(data);
            });

            this.socket.on('online_count_updated', (count) => {
                this.updateOnlineCount(count);
            });

            this.socket.on('typing_indicator', (data) => {
                this.handleTypingIndicator(data);
            });

            this.socket.on('bot_message', (data) => {
                this.handleBotMessage(data);
            });

            // Yeni: trust güncelleme
            this.socket.on('trust_updated', (data) => {
                if (this.user && data.id === this.user.id) {
                    this.user.trustScore = data.trust_score;
                    this.inlineToast('Güven puanın: '+data.trust_score, 'trust');
                }
            });
            // Yeni: tutorial ilerleme
            this.socket.on('tutorial_progress', (p) => {
                if (this.user && p.userId === this.user.id) {
                    this.inlineToast('Tutorial adımı: '+p.state, 'tutorial');
                }
            });

            this.socket.on('error', (data) => {
                console.error('Chat socket error:', data);
            });
            
            // Timeout ekle - 5 saniye içinde bağlanamazsa simüle et
            setTimeout(() => {
                if (!this.socket.connected) {
                    console.warn('⚠️ Chat socket timeout - simülasyon moduna geçiliyor');
                    this.simulateChatEvents();
                }
            }, 5000);
            
        } catch (error) {
            console.error('Chat socket hatası:', error);
            this.simulateChatEvents();
        }
    }
    
    // Chat olaylarını simüle et
    simulateChatEvents() {
        console.log('🤖 Chat simülasyon modu aktif');
        this.isConnected = true; // UI için
        this.hideConnectionStatus();
        
        // Demo mesajları ekle
        setTimeout(() => {
            this.addDemoMessages();
        }, 1000);
        
        // Online count simülasyonu
        setInterval(() => {
            const count = 150 + Math.floor(Math.random() * 50);
            this.updateOnlineCount(count);
        }, 30000);
        
        // Bot mesaj simülasyonu
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.handleBotMessage({
                    message: this.getBotRandomMessage(),
                    timestamp: new Date().toISOString()
                });
            }
        }, 45000);
    }
    
    // Demo mesajları ekle
    addDemoMessages() {
        const demoMessages = [
            { 
                id: 1, 
                userName: 'Mentor_Ali', 
                message: 'Hoş geldin! Sorularını sorabilirsin.', 
                timestamp: new Date(Date.now() - 300000).toISOString(),
                trustScore: 180
            },
            { 
                id: 2, 
                userName: 'Ticaret_Uzmanı', 
                message: 'Bugün tahıl fiyatları yükseldi, iyi bir alım fırsatı!', 
                timestamp: new Date(Date.now() - 180000).toISOString(),
                trustScore: 165
            },
            { 
                id: 3, 
                userName: 'Bot_Asistan', 
                message: 'İpucu: İtibar puanınızı yükseltmek için mentorlarla etkileşim kurun!', 
                timestamp: new Date(Date.now() - 60000).toISOString(),
                isBot: true
            }
        ];
        
        demoMessages.forEach(msg => {
            this.handleNewMessage(msg);
        });
    }
    
    // Bot rastgele mesajları
    getBotRandomMessage() {
        const messages = [
            "💡 İpucu: Düzenli ticaret yaparak itibar puanınızı artırabilirsiniz!",
            "📈 Pazar analizi: Tahıl fiyatları bugün %5 arttı.",
            "🎯 Günlük hedef: 3 başarılı ticaret yapın!",
            "⭐ Mentor sistemi: Deneyimli oyunculardan öğrenin!",
            "🏆 Başarı: Bu hafta 50+ kişi mentor seviyesine ulaştı!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Tab değiştir
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab
        this.tabButtons.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update chat title
        const titles = {
            global: { icon: '🌍', text: 'Global Chat' },
            local: { icon: '🏠', text: 'Lokal Chat' },
            private: { icon: '👥', text: 'Özel Mesajlar' }
        };
        
        if (this.chatIconEl) this.chatIconEl.textContent = titles[tabName].icon;
        if (this.chatTitleEl) this.chatTitleEl.textContent = titles[tabName].text;
        
        // Load messages for this tab
        this.loadMessagesForTab(tabName);
        
        // Clear notification badge
        const activeTab = document.querySelector(`.chat-tab[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.removeAttribute('data-count');
        }
    }

    // Mesaj gönder
    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.isConnected) return;
        
        if (message.length > 500) {
            this.showError('Mesaj çok uzun (maksimum 500 karakter)');
            return;
        }

        // Mesajı UI'da göster (optimistic update)
        const tempMessage = {
            id: 'temp_' + Date.now(),
            userId: this.user.id,
            userName: this.user.displayName,
            userTrustScore: this.user.trustScore,
            message: message,
            isBot: false,
            timestamp: new Date().toISOString(),
            status: 'sending'
        };
        
        this.displayMessage(tempMessage);
        
        // Socket'e gönder
        this.socket.emit('send_message', {
            userId: this.user.id,
            userName: this.user.displayName,
            userTrustScore: this.user.trustScore,
            message: message,
            tab: this.currentTab
        });
        
        // Input'u temizle
        this.messageInput.value = '';
        this.updateCharCounter();
        this.updateSendButton();
        this.stopTyping();
        
        // Auto-resize input
        this.messageInput.style.height = 'auto';
    }

    // Yeni mesaj geldiğinde
    handleNewMessage(message) {
        // Remove temp message if exists
        const tempEl = document.querySelector(`[data-message-id^="temp_"]`);
        if (tempEl && message.userId === this.user.id) {
            tempEl.remove();
        }
        
        this.displayMessage(message);
        this.cacheMessage(message);
        
        // Update notification badge if not in current tab
        if (message.tab !== this.currentTab) {
            this.updateTabNotification(message.tab);
        }
        
        // Play notification sound
        this.playNotificationSound();
        
        // Show browser notification if page not visible
        if (document.hidden && message.userId !== this.user.id) {
            this.showBrowserNotification(message);
        }
    }

    // Mesajı ekranda göster
    displayMessage(message) {
        if (!this.messagesContainer) return;
        
        const messageEl = this.createMessageElement(message);
        this.messagesContainer.appendChild(messageEl);
        this.scrollToBottom();
        
        // Update last message ID
        if (typeof message.id === 'number') {
            this.lastMessageId = Math.max(this.lastMessageId, message.id);
        }
    }

    // Mesaj HTML elementi oluştur
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-item ${message.isBot ? 'bot-message' : ''} ${message.userId === this.user.id ? 'own-message' : ''}`;
        messageDiv.dataset.messageId = message.id;
        messageDiv.dataset.userId = message.userId;
        
        const trustClass = this.getTrustClass(message.userTrustScore);
        const timeStr = this.formatTime(message.timestamp);
        const statusIcon = this.getStatusIcon(message.status);
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="message-user">
                    <span class="message-user-name">${this.escapeHtml(message.userName)}</span>
                    <span class="trust-badge ${trustClass} message-user-trust">⭐ ${message.userTrustScore}</span>
                </div>
                <div class="message-time">
                    <span>${timeStr}</span>
                    <div class="message-status ${message.status || ''}">${statusIcon}</div>
                </div>
            </div>
            <div class="message-content">${this.formatMessageContent(message.message)}</div>
            ${this.createReactionsHtml(message.reactions)}
        `;
        
        // Add animation
        messageDiv.style.animation = 'messageSlideIn 0.3s ease';
        
        return messageDiv;
    }

    // Mesaj içeriğini formatla
    formatMessageContent(content) {
        // HTML escape
        let formatted = this.escapeHtml(content);
        
        // Link detection
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        // Emoji conversion (basit)
        const emojiMap = {
            ':)': '😊',
            ':(': '😢',
            ':D': '😃',
            ':P': '😛',
            '<3': '❤️',
            ':fire:': '🔥',
            ':money:': '💰'
        };
        
        Object.entries(emojiMap).forEach(([key, emoji]) => {
            formatted = formatted.replace(new RegExp(this.escapeRegex(key), 'g'), emoji);
        });
        
        return formatted;
    }

    // Reactions HTML oluştur
    createReactionsHtml(reactions) {
        if (!reactions || Object.keys(reactions).length === 0) {
            return '<div class="message-reactions"></div>';
        }
        
        const reactionsHtml = Object.entries(reactions)
            .map(([emoji, count]) => `
                <button class="reaction-button" onclick="toggleReaction('${emoji}', '${this.messageId}')">
                    ${emoji} ${count}
                </button>
            `).join('');
            
        return `<div class="message-reactions">${reactionsHtml}</div>`;
    }

    // Yazma durumunu işle
    handleTyping() {
        if (!this.isConnected) return;
        
        this.socket.emit('typing_start', {
            userId: this.user.id,
            userName: this.user.displayName,
            tab: this.currentTab
        });
        
        // Clear previous timer
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // Stop typing after 3 seconds
        this.typingTimer = setTimeout(() => {
            this.stopTyping();
        }, 3000);
    }

    // Yazmayı durdur
    stopTyping() {
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
            this.typingTimer = null;
        }
        
        if (this.isConnected) {
            this.socket.emit('typing_stop', {
                userId: this.user.id,
                tab: this.currentTab
            });
        }
    }

    // Yazma göstergesini işle
    handleTypingIndicator(data) {
        if (data.userId === this.user.id) return;
        
        if (data.isTyping) {
            this.typingUsers.add(data.userName);
        } else {
            this.typingUsers.delete(data.userName);
        }
        
        this.updateTypingIndicator();
    }

    // Yazma göstergesini güncelle
    updateTypingIndicator() {
        if (!this.typingIndicatorEl) return;
        
        if (this.typingUsers.size === 0) {
            this.typingIndicatorEl.classList.add('d-none');
            return;
        }
        
        const typingUserEl = document.getElementById('typing-user');
        if (typingUserEl) {
            const users = Array.from(this.typingUsers);
            if (users.length === 1) {
                typingUserEl.textContent = users[0];
            } else if (users.length === 2) {
                typingUserEl.textContent = `${users[0]} ve ${users[1]}`;
            } else {
                typingUserEl.textContent = `${users[0]} ve ${users.length - 1} kişi daha`;
            }
        }
        
        this.typingIndicatorEl.classList.remove('d-none');
        this.scrollToBottom();
    }

    // Karakter sayacını güncelle
    updateCharCounter() {
        if (!this.charCounterEl || !this.messageInput) return;
        
        const length = this.messageInput.value.length;
        this.charCounterEl.textContent = `${length}/500`;
        
        this.charCounterEl.className = 'char-counter';
        if (length > 450) {
            this.charCounterEl.classList.add('danger');
        } else if (length > 400) {
            this.charCounterEl.classList.add('warning');
        }
    }

    // Send button durumunu güncelle
    updateSendButton() {
        if (!this.sendButton || !this.messageInput) return;
        
        const hasContent = this.messageInput.value.trim().length > 0;
        const isConnected = this.isConnected;
        
        this.sendButton.disabled = !hasContent || !isConnected;
        
        if (!isConnected) {
            this.sendButton.title = 'Bağlantı kesildi';
        } else if (!hasContent) {
            this.sendButton.title = 'Mesaj yazın';
        } else {
            this.sendButton.title = 'Mesaj gönder';
        }
    }

    // Online sayısını güncelle
    updateOnlineCount(count) {
        if (this.onlineCountEl) {
            this.onlineCountEl.textContent = `${count} kişi online`;
        }
    }

    // Alt kısma kaydır
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    // Kaydırma işlemini işle
    handleScroll() {
        if (!this.messagesContainer) return;
        
        const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
        
        // Auto-scroll to bottom if user is near bottom
        if (isNearBottom) {
            this.scrollToBottom();
        }
        
        // Load more messages if scrolled to top
        if (scrollTop === 0 && this.messages[this.currentTab].length > 0) {
            this.loadMoreMessages();
        }
    }

    // Daha fazla mesaj yükle
    async loadMoreMessages() {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`/api/chat/messages?limit=20&before=${this.lastMessageId}&tab=${this.currentTab}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                data.messages.reverse().forEach(message => {
                    this.prependMessage(message);
                });
            }
        } catch (error) {
            console.error('Mesaj yükleme hatası:', error);
        }
    }

    // Mesajı üste ekle
    prependMessage(message) {
        if (!this.messagesContainer) return;
        
        const messageEl = this.createMessageElement(message);
        this.messagesContainer.insertBefore(messageEl, this.messagesContainer.firstChild);
    }

    // Trust sınıfını al
    getTrustClass(score) {
        if (score >= 180) return 'trust-excellent';
        if (score >= 160) return 'trust-good';
        if (score >= 140) return 'trust-medium';
        if (score >= 120) return 'trust-low';
        return 'trust-bad';
    }

    // Zamanı formatla
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // 1 dakika
            return 'Az önce';
        } else if (diff < 3600000) { // 1 saat
            const minutes = Math.floor(diff / 60000);
            return `${minutes} dakika önce`;
        } else if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            return date.toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    // Status ikonu al
    getStatusIcon(status) {
        switch (status) {
            case 'sending': return '⏳';
            case 'sent': return '✓';
            case 'delivered': return '✓✓';
            case 'failed': return '❌';
            default: return '';
        }
    }

    // HTML escape
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Regex escape
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Bildirim sesi çal
    playNotificationSound() {
        try {
            const audio = new Audio('/assets/sounds/message.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {
                console.log('Bildirim sesi çalınamadı');
            });
        } catch (error) {
            console.log('Ses dosyası bulunamadı');
        }
    }

    // Tarayıcı bildirimi göster
    showBrowserNotification(message) {
        if (Notification.permission === 'granted') {
            new Notification(`${message.userName}`, {
                body: message.message,
                icon: '/assets/icon-192.png',
                tag: 'chat-message'
            });
        }
    }

    // Mesajı önbelleğe al
    cacheMessage(message) {
        this.messageCache.set(message.id, message);
        
        // Keep only last 100 messages in cache
        if (this.messageCache.size > 100) {
            const firstKey = this.messageCache.keys().next().value;
            this.messageCache.delete(firstKey);
        }
    }

    // Önbellekteki mesajları yükle
    loadCachedMessages() {
        const cached = localStorage.getItem('chat_messages');
        if (cached) {
            try {
                const messages = JSON.parse(cached);
                messages.forEach(message => {
                    this.displayMessage(message);
                });
            } catch (error) {
                console.error('Önbellek yükleme hatası:', error);
            }
        }
    }

    // Hata göster
    showError(message) {
        console.error('Chat hatası:', message);
        
        // Create temporary error message
        const errorEl = document.createElement('div');
        errorEl.className = 'info-message error-message';
        errorEl.textContent = `❌ ${message}`;
        
        if (this.messagesContainer) {
            this.messagesContainer.appendChild(errorEl);
            this.scrollToBottom();
            
            setTimeout(() => {
                errorEl.remove();
            }, 5000);
        }
    }

    // Bağlantı durumunu göster
    showConnectionStatus() {
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.classList.remove('d-none');
        }
    }

    // Bağlantı durumunu gizle
    hideConnectionStatus() {
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.classList.add('d-none');
        }
    }

    inlineToast(message, type='info'){
        let bar = document.getElementById('inline-toast-bar');
        if(!bar){
            bar = document.createElement('div');
            bar.id='inline-toast-bar';
            bar.style.position='fixed';
            bar.style.bottom='10px';
            bar.style.left='50%';
            bar.style.transform='translateX(-50%)';
            bar.style.zIndex='9999';
            bar.style.display='flex';
            bar.style.flexDirection='column';
            bar.style.alignItems='center';
            bar.style.pointerEvents='none';
            document.body.appendChild(bar);
        }
        const el = document.createElement('div');
        el.textContent = message;
        el.style.background = type==='tutorial' ? '#4b6ef5' : (type==='trust' ? '#9333ea' : '#222');
        el.style.color = '#fff';
        el.style.padding = '6px 10px';
        el.style.marginTop = '6px';
        el.style.borderRadius = '20px';
        el.style.fontSize = '13px';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        el.style.opacity='0';
        el.style.transition='opacity .3s';
        bar.appendChild(el);
        requestAnimationFrame(()=>{ el.style.opacity='1'; });
        setTimeout(()=>{
            el.style.opacity='0';
            setTimeout(()=> el.remove(), 400);
        }, 3500);
    }
}

// Global fonksiyonlar
window.chatManager = null;

// Emoji picker
function toggleEmojiPicker() {
    const emojiPicker = document.getElementById('emoji-picker');
    if (emojiPicker) {
        emojiPicker.classList.toggle('d-none');
    }
}

function closeEmojiPicker() {
    const emojiPicker = document.getElementById('emoji-picker');
    if (emojiPicker) {
        emojiPicker.classList.add('d-none');
    }
}

function insertEmoji(emoji) {
    const messageInput = document.getElementById('message-input');
    if (messageInput && window.chatManager) {
        const cursorPos = messageInput.selectionStart;
        const textBefore = messageInput.value.substring(0, cursorPos);
        const textAfter = messageInput.value.substring(cursorPos);
        
        messageInput.value = textBefore + emoji + textAfter;
        messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
        messageInput.focus();
        
        window.chatManager.updateCharCounter();
        window.chatManager.updateSendButton();
    }
    
    closeEmojiPicker();
}

// User modal
function closeUserModal() {
    const modal = document.getElementById('user-modal');
    if (modal) {
        modal.classList.add('d-none');
    }
}

function sendPrivateMessage() {
    closeUserModal();
    // Switch to private tab and focus input
    if (window.chatManager) {
        window.chatManager.switchTab('private');
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.focus();
        }
    }
}

function viewUserProfile() {
    closeUserModal();
    // Redirect to user profile page
    window.location.href = '/profile.html';
}

// Sayfa yüklendiğinde chat manager'ı başlat
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});

// Sayfa kapanırken önbelleği kaydet
window.addEventListener('beforeunload', () => {
    if (window.chatManager && window.chatManager.messageCache.size > 0) {
        const messages = Array.from(window.chatManager.messageCache.values()).slice(-50);
        localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
});

console.log('💬 Chat JavaScript yüklendi');
