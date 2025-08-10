// Navigation Manager - Sayfa geçişleri için ortak JavaScript
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }
    
    init() {
        this.createNavigationHeader();
        this.setupNavigationHandlers();
        this.markActiveLink();
        this.logNavigation();
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'dashboard';
        if (path === '/login.html') return 'login';
        if (path === '/chat.html') return 'chat';
        if (path === '/test.html') return 'test';
        return 'unknown';
    }
    
    createNavigationHeader() {
        // Eğer login sayfasındaysak navigation gösterme
        if (this.currentPage === 'login') return;
        
        const nav = document.createElement('nav');
        nav.className = 'page-navigation';
        nav.innerHTML = `
            <div class="nav-container">
                <a href="/index.html" class="nav-logo">🎮 2D Ticaret</a>
                <ul class="nav-links">
                    <li><a href="/index.html" class="nav-link" data-page="dashboard">🏠 Dashboard</a></li>
                    <li><a href="/chat.html" class="nav-link" data-page="chat">💬 Chat</a></li>
                    <li><a href="/test.html" class="nav-link" data-page="test">🧪 Test</a></li>
                    <li><a href="/login.html" class="nav-link" data-page="login">🔐 Çıkış</a></li>
                </ul>
            </div>
        `;
        
        document.body.insertBefore(nav, document.body.firstChild);
    }
    
    setupNavigationHandlers() {
        // Sadece navigation header'daki linkleri intercept et, test linklerini bırak
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && 
                !link.hasAttribute('data-test-link') && 
                link.closest('.page-navigation') && 
                this.isInternalLink(link.href)) {
                
                console.log('🧭 Navigation intercepted:', link.href);
                e.preventDefault();
                this.navigateToPage(link.href);
            } else if (link && link.hasAttribute('data-test-link')) {
                console.log('🧪 Test link - not intercepted:', link.href);
                // Test linklerini normal akışa bırak
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateToPage('/index.html');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateToPage('/chat.html');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateToPage('/test.html');
                        break;
                }
            }
        });
    }
    
    isInternalLink(href) {
        try {
            const url = new URL(href, window.location.origin);
            return url.origin === window.location.origin;
        } catch {
            return false;
        }
    }
    
    async navigateToPage(url) {
        try {
            // Loading animasyonu
            this.showLoadingTransition();
            
            // Kısa gecikme ile sayfa geçişi
            setTimeout(() => {
                window.location.href = url;
            }, 300);
            
        } catch (error) {
            console.error('Navigation error:', error);
            window.location.href = url; // Fallback
        }
    }
    
    showLoadingTransition() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(67, 233, 123, 0.9), rgba(56, 249, 215, 0.9));
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 24px; margin-bottom: 10px;">🎮</div>
                <div style="font-weight: 600;">Sayfa yükleniyor...</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    markActiveLink() {
        const links = document.querySelectorAll('.nav-link[data-page]');
        links.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === this.currentPage) {
                link.classList.add('active');
            }
        });
    }
    
    logNavigation() {
        console.log('🧭 Navigation initialized');
        console.log('📍 Current page:', this.currentPage);
        console.log('🔗 Available shortcuts: Alt+1 (Dashboard), Alt+2 (Chat), Alt+3 (Test)');
    }
}

// CSS animasyonları ekle
function addNavigationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .page-transition {
            animation: pageSlideIn 0.5s ease-out;
        }
        
        @keyframes pageSlideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Auto-initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    addNavigationStyles();
    new NavigationManager();
    
    // Page transition animation
    document.body.classList.add('page-transition');
});

// Export for other modules
window.NavigationManager = NavigationManager;
