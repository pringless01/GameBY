// 🛠️ Utility Functions - Yardımcı Fonksiyonlar

// ==================== FORMAT UTILITIES ====================

// Para formatı
function formatMoney(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Sayı formatı
function formatNumber(number) {
    return new Intl.NumberFormat('tr-TR').format(number);
}

// Tarih formatı
function formatDate(date, includeTime = false) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return new Date(date).toLocaleDateString('tr-TR', options);
}

// Göreli zaman formatı (örn: "2 saat önce")
function formatRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
        return 'Az önce';
    } else if (diffMin < 60) {
        return `${diffMin} dakika önce`;
    } else if (diffHour < 24) {
        return `${diffHour} saat önce`;
    } else if (diffDay < 7) {
        return `${diffDay} gün önce`;
    } else {
        return formatDate(date);
    }
}

// ==================== VALIDATION UTILITIES ====================

// Telefon numarası validasyonu
function validatePhoneNumber(phone) {
    const phoneRegex = /^\+90[0-9]{10}$/;
    return phoneRegex.test(phone);
}

// Email validasyonu
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// SMS kodu validasyonu
function validateSMSCode(code) {
    const codeRegex = /^[0-9]{6}$/;
    return codeRegex.test(code);
}

// Mesaj validasyonu
function validateMessage(message) {
    if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Mesaj boş olamaz' };
    }
    
    const trimmed = message.trim();
    
    if (trimmed.length === 0) {
        return { valid: false, error: 'Mesaj boş olamaz' };
    }
    
    if (trimmed.length > 500) {
        return { valid: false, error: 'Mesaj çok uzun (maksimum 500 karakter)' };
    }
    
    // Spam kontrolü
    if (/(.)\1{10,}/.test(trimmed)) {
        return { valid: false, error: 'Tekrarlayan karakterler tespit edildi' };
    }
    
    return { valid: true, message: trimmed };
}

// ==================== STORAGE UTILITIES ====================

// Güvenli localStorage işlemleri
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set hatası:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get hatası:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove hatası:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear hatası:', error);
            return false;
        }
    }
};

// ==================== TRUST SCORE UTILITIES ====================

// Güven puanı sınıfı
function getTrustClass(score) {
    if (score >= 180) return 'trust-excellent';
    if (score >= 160) return 'trust-good';
    if (score >= 140) return 'trust-medium';
    if (score >= 120) return 'trust-low';
    return 'trust-bad';
}

// Güven puanı açıklaması
function getTrustDescription(score) {
    if (score >= 180) return 'Mükemmel';
    if (score >= 160) return 'Çok İyi';
    if (score >= 140) return 'İyi';
    if (score >= 120) return 'Orta';
    return 'Düşük';
}

// Güven puanı rengi
function getTrustColor(score) {
    if (score >= 180) return '#4CAF50';
    if (score >= 160) return '#8BC34A';
    if (score >= 140) return '#FFEB3B';
    if (score >= 120) return '#FF9800';
    return '#F44336';
}

// ==================== API UTILITIES ====================

// API çağrısı wrapper'ı
async function apiCall(url, options = {}) {
    const token = Storage.get('jwt_token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, finalOptions);
        
        // Token süresi dolmuşsa login'e yönlendir
        if (response.status === 401) {
            Storage.remove('jwt_token');
            Storage.remove('user');
            window.location.href = '/login.html';
            return null;
        }
        
        const data = await response.json().catch(()=>({}));
        
        if (!response.ok) {
            if(response.status === 429){
                showToast('Çok fazla istek yaptınız. Lütfen bekleyin.', 'warning', 4000);
            }
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API çağrısı hatası:', error);
        throw error;
    }
}

// GET request
function apiGet(url) {
    return apiCall(url, { method: 'GET' });
}

// POST request
function apiPost(url, data) {
    return apiCall(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// PUT request
function apiPut(url, data) {
    return apiCall(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// DELETE request
function apiDelete(url) {
    return apiCall(url, { method: 'DELETE' });
}

// ==================== UI UTILITIES ====================

// Loading göster/gizle
function showLoading(show = true, message = 'Yükleniyor...') {
    const existingOverlay = document.getElementById('loading-overlay');
    
    if (show) {
        if (!existingOverlay) {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <p>${message}</p>
            `;
            document.body.appendChild(overlay);
        } else {
            existingOverlay.classList.remove('d-none');
            const messageEl = existingOverlay.querySelector('p');
            if (messageEl) messageEl.textContent = message;
        }
    } else {
        if (existingOverlay) {
            existingOverlay.classList.add('d-none');
        }
    }
}

// Toast bildirimi göster
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    // Stil ekle
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-surface);
        padding: var(--spacing-md);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-heavy);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        border-left: 4px solid ${type === 'success' ? 'var(--trust-excellent)' : 
                                   type === 'error' ? 'var(--danger-color)' : 
                                   type === 'warning' ? 'var(--secondary-color)' : 
                                   'var(--chat-color)'};
    `;
    
    document.body.appendChild(toast);
    
    // Otomatik kaldır
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// Confirm dialog
function showConfirm(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: var(--spacing-md);
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--bg-surface);
        border-radius: var(--radius-lg);
        max-width: 400px;
        width: 100%;
        padding: var(--spacing-lg);
        text-align: center;
    `;
    
    modal.innerHTML = `
        <h3 style="margin-bottom: var(--spacing-md);">Onay</h3>
        <p style="margin-bottom: var(--spacing-lg); color: var(--text-secondary);">${message}</p>
        <div style="display: flex; gap: var(--spacing-md); justify-content: center;">
            <button class="btn btn-primary" id="confirm-yes">Evet</button>
            <button class="btn btn-outline" id="confirm-no">Hayır</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const yesBtn = modal.querySelector('#confirm-yes');
    const noBtn = modal.querySelector('#confirm-no');
    
    yesBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (onConfirm) onConfirm();
    });
    
    noBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    });
    
    // ESC tuşu ile kapat
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', handleEsc);
            if (onCancel) onCancel();
        }
    };
    
    document.addEventListener('keydown', handleEsc);
}

// ==================== DEVICE UTILITIES ====================

// Mobil cihaz kontrolü
function isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Touch cihaz kontrolü
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// PWA kontrolü
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches;
}

// Online durumu
function isOnline() {
    return navigator.onLine;
}

// ==================== PERFORMANCE UTILITIES ====================

// Debounce function
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==================== SECURITY UTILITIES ====================

// HTML escape
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// URL validation
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// XSS koruması
function sanitizeInput(input) {
    return escapeHtml(input.trim());
}

// ==================== NOTIFICATION UTILITIES ====================

// Browser notification
function showNotification(title, options = {}) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            return new Notification(title, {
                icon: '/assets/icon-192.png',
                badge: '/assets/badge-72.png',
                ...options
            });
        } else if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    return new Notification(title, options);
                }
            });
        }
    }
    return null;
}

// Vibration API
function vibrate(pattern = [200]) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// ==================== ANALYTICS UTILITIES ====================

// Event tracking
function trackEvent(eventName, eventData = {}) {
    // Google Analytics veya başka analytics servisi için
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Console'da log
    console.log('📊 Event:', eventName, eventData);
}

// Page view tracking
function trackPageView(pageName) {
    trackEvent('page_view', {
        page_title: pageName,
        page_location: window.location.href
    });
}

// ==================== GAME SPECIFIC UTILITIES ====================

// Kaynak ikonu al
function getResourceIcon(resourceType) {
    const icons = {
        money: '💰',
        wood: '🌳',
        grain: '🌾',
        business: '🏪',
        trust: '⭐'
    };
    return icons[resourceType] || '❓';
}

// Aktivite ikonu al
function getActivityIcon(activityType) {
    const icons = {
        'chop-wood': '🪓',
        'farm': '🌾',
        'trade': '🤝',
        'chat': '💬',
        'mentor': '👨‍🏫'
    };
    return icons[activityType] || '⚡';
}

// Başarım seviyesi hesapla
function calculateAchievementLevel(totalPoints) {
    if (totalPoints >= 10000) return 'Usta';
    if (totalPoints >= 5000) return 'Uzman';
    if (totalPoints >= 2000) return 'Deneyimli';
    if (totalPoints >= 500) return 'Acemi';
    return 'Yeni Başlayan';
}

// ==================== EXPORT UTILITIES ====================

// Global olarak kullanılabilir utilityler
window.Utils = {
    // Format
    formatMoney,
    formatNumber,
    formatDate,
    formatRelativeTime,
    
    // Validation
    validatePhoneNumber,
    validateEmail,
    validateSMSCode,
    validateMessage,
    
    // Storage
    Storage,
    
    // Trust
    getTrustClass,
    getTrustDescription,
    getTrustColor,
    
    // API
    apiCall,
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    
    // UI
    showLoading,
    showToast,
    showConfirm,
    
    // Device
    isMobile,
    isTouchDevice,
    isPWA,
    isOnline,
    
    // Performance
    debounce,
    throttle,
    
    // Security
    escapeHtml,
    isValidUrl,
    sanitizeInput,
    
    // Notifications
    showNotification,
    vibrate,
    
    // Analytics
    trackEvent,
    trackPageView,
    
    // Game
    getResourceIcon,
    getActivityIcon,
    calculateAchievementLevel
};

console.log('🛠️ Utils JavaScript yüklendi');
