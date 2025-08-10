// 🔌 Socket.io Client - Gerçek Zamanlı Bağlantı Yöneticisi

class SocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventHandlers = new Map();
        this.user = null;
        this.connectionTimeout = null;
        
        this.init();
    }

    // Başlatma işlemleri
    init() {
        this.loadUserData();
        this.connect();
        this.setupHeartbeat();
    }

    // Kullanıcı verilerini yükle
    loadUserData() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.user = JSON.parse(userData);
        }
    }

    // Socket bağlantısı kur
    connect() {
        // Geliştirme aşamasında socket.io server yoksa simüle et
        if (typeof io === 'undefined') {
            console.warn('⚠️ Socket.io kütüphanesi bulunamadı - Simülasyon modunda');
            this.simulateConnection();
            return;
        }

        try {
            // Socket.io server'ı kontrol et
            this.socket = io({
                transports: ['websocket', 'polling'],
                timeout: 5000,
                forceNew: true,
                autoConnect: true
            });

            this.setupEventListeners();
            console.log('🔌 Socket bağlantısı başlatıldı');
            
            // Timeout ekle - 5 saniye içinde bağlanamazsa simüle et
            this.connectionTimeout = setTimeout(() => {
                if (!this.isConnected) {
                    console.warn('⚠️ Socket server bulunamadı - Simülasyon moduna geçiliyor');
                    this.socket.disconnect();
                    this.simulateConnection();
                }
            }, 5000);
            
        } catch (error) {
            console.error('Socket bağlantı hatası:', error);
            this.simulateConnection();
        }
    }
    
    // Socket olmadığında bağlantıyı simüle et
    simulateConnection() {
        console.log('🤖 Socket simülasyon modu aktif');
        this.isConnected = true;
        this.socket = {
            id: 'simulated-' + Math.random().toString(36).substr(2, 9),
            emit: (event, data) => {
                console.log('📤 Simulated emit:', event, data);
                // Bazı olayları simüle et
                setTimeout(() => {
                    if (event === 'send_message' && data) {
                        this.triggerEvent('new_message', {
                            ...data,
                            id: Date.now(),
                            timestamp: new Date().toISOString()
                        });
                    }
                }, 100);
            },
            on: () => {},
            disconnect: () => {
                this.isConnected = false;
                console.log('🤖 Simulated disconnect');
            }
        };
        
        // Fake online count güncelleme
        setInterval(() => {
            const onlineCount = 1100 + Math.floor(Math.random() * 200);
            this.triggerEvent('online_count_updated', { count: onlineCount });
        }, 30000);
        
        // Connect event tetikle
        setTimeout(() => {
            this.triggerEvent('connect', { socketId: this.socket.id, simulated: true });
            console.log('✅ Simulated socket connected:', this.socket.id);
        }, 500);
    }

    // Event listener'ları ayarla
    setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Socket bağlandı:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.clearConnectionTimeout();
            
            // Authenticate user
            this.authenticateUser();
            
            // Trigger connect handlers
            this.triggerEvent('connect', { socketId: this.socket.id });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket bağlantısı kesildi:', reason);
            this.isConnected = false;
            
            // Trigger disconnect handlers
            this.triggerEvent('disconnect', { reason });
            
            // Auto-reconnect logic
            if (reason === 'io server disconnect') {
                // Server intentionally disconnected, don't reconnect
                console.log('Server tarafından bağlantı kesildi');
            } else {
                // Client-side disconnect, attempt to reconnect
                this.handleReconnection();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔌 Bağlantı hatası:', error);
            this.handleConnectionError();
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Yeniden bağlandı (deneme ${attemptNumber})`);
            this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('🔄 Yeniden bağlantı hatası:', error);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('❌ Maksimum yeniden bağlantı denemesi aşıldı');
                this.triggerEvent('reconnect_failed');
            }
        });

        // Custom events
        this.socket.on('user_authenticated', (data) => {
            console.log('✅ Kullanıcı doğrulandı:', data);
            this.triggerEvent('user_authenticated', data);
        });

        this.socket.on('authentication_failed', (data) => {
            console.error('❌ Kimlik doğrulama başarısız:', data);
            this.handleAuthenticationFailure();
        });

        // Chat events
        this.socket.on('new_message', (message) => {
            this.triggerEvent('new_message', message);
        });

        this.socket.on('user_joined', (data) => {
            this.triggerEvent('user_joined', data);
        });

        this.socket.on('user_left', (data) => {
            this.triggerEvent('user_left', data);
        });

        this.socket.on('online_count_updated', (count) => {
            this.triggerEvent('online_count_updated', count);
        });

        this.socket.on('typing_indicator', (data) => {
            this.triggerEvent('typing_indicator', data);
        });

        // Game events
        this.socket.on('resource_updated', (data) => {
            this.triggerEvent('resource_updated', data);
        });

        this.socket.on('trust_update', (data) => {
            this.triggerEvent('trust_update', data);
        });

        this.socket.on('transaction_notification', (data) => {
            this.triggerEvent('transaction_notification', data);
        });

        this.socket.on('mentor_request', (data) => {
            this.triggerEvent('mentor_request', data);
        });

        this.socket.on('mentor_response', (data) => {
            this.triggerEvent('mentor_response', data);
        });

        this.socket.on('bot_message', (data) => {
            this.triggerEvent('bot_message', data);
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('Socket hatası:', error);
            this.triggerEvent('error', error);
        });

        // Rate limiting
        this.socket.on('rate_limit_exceeded', (data) => {
            console.warn('⚠️ Rate limit aşıldı:', data);
            this.triggerEvent('rate_limit_exceeded', data);
        });
    }

    // Kullanıcı kimlik doğrulaması
    authenticateUser() {
        if (!this.socket || !this.user) return;

        const token = localStorage.getItem('jwt_token');
        if (!token) {
            console.error('JWT token bulunamadı');
            return;
        }

        this.socket.emit('authenticate', {
            token: token,
            userId: this.user.id,
            userName: this.user.displayName,
            userTrustScore: this.user.trustScore
        });
    }

    // Kimlik doğrulama başarısızlığını işle
    handleAuthenticationFailure() {
        // Clear stored data
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    }

    // Bağlantı hatasını işle
    handleConnectionError() {
        this.isConnected = false;
        
        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
            this.triggerEvent('connection_timeout');
        }, 30000); // 30 seconds
    }

    // Yeniden bağlantı işlemini işle
    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts); // Exponential backoff
            
            console.log(`🔄 ${delay}ms sonra yeniden bağlanılacak...`);
            this.reconnectAttempts++;
            
            setTimeout(() => {
                if (!this.isConnected) {
                    this.socket.connect();
                }
            }, delay);
        } else {
            console.error('❌ Maksimum yeniden bağlantı denemesi aşıldı');
            this.triggerEvent('reconnect_failed');
        }
    }

    // Bağlantı timeout'unu temizle
    clearConnectionTimeout() {
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
    }

    // Heartbeat ayarla (bağlantı canlılık kontrolü)
    setupHeartbeat() {
        setInterval(() => {
            if (this.isConnected && this.socket) {
                this.socket.emit('ping', { timestamp: Date.now() });
            }
        }, 30000); // Her 30 saniyede bir ping
    }

    // Event handler ekle
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    // Event handler kaldır
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // Event tetikle
    triggerEvent(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Event handler hatası (${event}):`, error);
                }
            });
        }
    }

    // Mesaj gönder
    sendMessage(event, data, callback) {
        if (!this.isConnected || !this.socket) {
            console.warn('Socket bağlı değil, mesaj gönderilemedi');
            if (callback) callback({ error: 'Bağlantı yok' });
            return false;
        }

        try {
            if (callback) {
                this.socket.emit(event, data, callback);
            } else {
                this.socket.emit(event, data);
            }
            return true;
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
            if (callback) callback({ error: error.message });
            return false;
        }
    }

    // Chat'e katıl
    joinChat(userData) {
        return this.sendMessage('join_chat', {
            userId: userData.id,
            userName: userData.displayName,
            userTrustScore: userData.trustScore,
            token: localStorage.getItem('jwt_token')
        });
    }

    // Chat mesajı gönder
    sendChatMessage(messageData) {
        return this.sendMessage('send_message', messageData);
    }

    // Typing indicator gönder
    sendTypingStart(data) {
        return this.sendMessage('typing_start', data);
    }

    sendTypingStop(data) {
        return this.sendMessage('typing_stop', data);
    }

    // Online sayısını al
    getOnlineCount() {
        return this.sendMessage('get_online_count');
    }

    // Bağlantı durumunu kontrol et
    isConnected() {
        return this.isConnected && this.socket && this.socket.connected;
    }

    // Socket ID al
    getSocketId() {
        return this.socket ? this.socket.id : null;
    }

    // Bağlantıyı kapat
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.clearConnectionTimeout();
    }

    // Yeniden bağlan
    reconnect() {
        this.disconnect();
        this.reconnectAttempts = 0;
        setTimeout(() => {
            this.connect();
        }, 1000);
    }

    // Debug bilgisi al
    getDebugInfo() {
        return {
            connected: this.isConnected,
            socketId: this.getSocketId(),
            reconnectAttempts: this.reconnectAttempts,
            user: this.user ? {
                id: this.user.id,
                name: this.user.displayName
            } : null,
            transport: this.socket ? this.socket.io.engine.transport.name : null
        };
    }
}

// Global socket client instance
window.socketClient = null;

// Socket client'i başlat
function initSocketClient() {
    if (!window.socketClient) {
        window.socketClient = new SocketClient();
        console.log('🔌 Socket Client başlatıldı');
    }
    return window.socketClient;
}

// Socket client'i al
function getSocketClient() {
    return window.socketClient || initSocketClient();
}

// Socket bağlantı durumunu kontrol et
function isSocketConnected() {
    const client = getSocketClient();
    return client ? client.isConnected() : false;
}

// Sayfa yüklendiğinde socket client'i başlat
document.addEventListener('DOMContentLoaded', () => {
    // Sadece login sayfası değilse socket'i başlat
    if (!window.location.pathname.includes('login')) {
        initSocketClient();
    }
});

// Sayfa kapanırken bağlantıyı kapat
window.addEventListener('beforeunload', () => {
    if (window.socketClient) {
        window.socketClient.disconnect();
    }
});

// Online/offline durumları
window.addEventListener('online', () => {
    console.log('🌐 İnternet bağlantısı restore edildi');
    if (window.socketClient && !window.socketClient.isConnected()) {
        window.socketClient.reconnect();
    }
});

window.addEventListener('offline', () => {
    console.log('🌐 İnternet bağlantısı kesildi');
});

// Visibility change - sayfa gizlenip göründüğünde
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.socketClient) {
        // Sayfa görünür olduğunda bağlantıyı kontrol et
        if (!window.socketClient.isConnected()) {
            window.socketClient.reconnect();
        }
    }
});

console.log('🔌 Socket Client JavaScript yüklendi');
