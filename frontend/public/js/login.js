// 🔐 Login & Register Sayfası JavaScript

class AuthManager {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.onlineCountElement = document.getElementById('onlineCount');
        this.currentTab = 'login';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateOnlineCount();
        this.startAnimations();
    }

    setupEventListeners() {
        // Form submits
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Real-time validation
        this.setupRealtimeValidation();
        
        // Password toggles
        this.setupPasswordToggles();
    }

    setupRealtimeValidation() {
        const registerUsername = document.getElementById('registerUsername');
        const registerPassword = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const registerPhone = document.getElementById('registerPhone');

        // Username validation
        registerUsername.addEventListener('input', (e) => this.validateUsername(e.target.value));
        
        // Password strength
        registerPassword.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        
        // Password match
        confirmPassword.addEventListener('input', (e) => this.checkPasswordMatch());
        
        // Phone formatting
        registerPhone.addEventListener('input', (e) => this.formatPhoneNumber(e));
    }

    setupPasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const inputWrapper = e.target.closest('.input-wrapper');
                const input = inputWrapper.querySelector('input');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    e.target.textContent = '🙈';
                } else {
                    input.type = 'password';
                    e.target.textContent = '👁️';
                }
            });
        });
    }

    async validateUsername(username) {
        const statusElement = document.getElementById('usernameStatus');
        const input = document.getElementById('registerUsername');
        
        if (username.length < 3) {
            statusElement.textContent = '';
            input.classList.remove('valid', 'invalid', 'username-available', 'username-taken');
            input.removeAttribute('data-validation');
            return false;
        }

        // Username format check
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            statusElement.textContent = '❌';
            statusElement.className = 'input-status taken';
            input.classList.add('invalid', 'username-taken');
            input.classList.remove('valid', 'username-available');
            input.setAttribute('data-validation', 'taken');
            return false;
        }

        // Simulate availability check
        statusElement.textContent = '⏳';
        statusElement.className = 'input-status checking';
        input.classList.remove('valid', 'invalid', 'username-available', 'username-taken');
        input.setAttribute('data-validation', 'checking');
        
        try {
            await this.delay(800); // Simulate API call
            const isAvailable = await this.checkUsernameAvailability(username);
            
            if (isAvailable) {
                statusElement.textContent = '✅';
                statusElement.className = 'input-status available';
                input.classList.add('valid', 'username-available');
                input.classList.remove('invalid', 'username-taken');
                input.setAttribute('data-validation', 'available');
                return true;
            } else {
                statusElement.textContent = '❌';
                statusElement.className = 'input-status taken';
                input.classList.add('invalid', 'username-taken');
                input.classList.remove('valid', 'username-available');
                input.setAttribute('data-validation', 'taken');
                return false;
            }
        } catch (error) {
            statusElement.textContent = '⚠️';
            statusElement.className = 'input-status';
            input.removeAttribute('data-validation');
            return false;
        }
    }

    async checkUsernameAvailability(username) {
        // Simulate username availability check
        const takenUsernames = ['admin', 'test', 'user', 'oyuncu', 'mentor', 'bot'];
        return !takenUsernames.includes(username.toLowerCase());
    }

    checkPasswordStrength(password) {
        const strengthElement = document.getElementById('passwordStrength');
        const input = document.getElementById('registerPassword');
        
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        strengthElement.className = 'password-strength';
        input.classList.remove('valid', 'invalid');
        
        if (password.length === 0) {
            // Empty password
        } else if (score <= 2) {
            strengthElement.classList.add('weak');
            input.classList.add('invalid');
        } else if (score <= 3) {
            strengthElement.classList.add('medium');
        } else {
            strengthElement.classList.add('strong');
            input.classList.add('valid');
        }
        
        // Re-check password match when main password changes
        this.checkPasswordMatch();
        
        return score >= 3;
    }

    checkPasswordMatch() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const matchElement = document.getElementById('passwordMatch');
        const input = document.getElementById('confirmPassword');
        
        if (confirmPassword.length === 0) {
            matchElement.textContent = '';
            matchElement.className = 'password-match';
            input.classList.remove('valid', 'invalid');
            return false;
        }
        
        if (password === confirmPassword) {
            matchElement.textContent = '✅';
            matchElement.className = 'password-match match';
            input.classList.add('valid');
            input.classList.remove('invalid');
            return true;
        } else {
            matchElement.textContent = '❌';
            matchElement.className = 'password-match no-match';
            input.classList.add('invalid');
            input.classList.remove('valid');
            return false;
        }
    }

    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.length <= 4) {
                value = value;
            } else if (value.length <= 7) {
                value = value.slice(0, 4) + ' ' + value.slice(4);
            } else if (value.length <= 9) {
                value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7);
            } else {
                value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 9) + ' ' + value.slice(9, 11);
            }
        }
        
        e.target.value = value;
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            this.showError('Lütfen tüm alanları doldurun');
            return;
        }

        try {
            this.showLoading('Giriş yapılıyor...');
            
            // Simulate login API call
            await this.simulateLogin(username, password);
            
            this.showSuccess('Giriş başarılı! Yönlendiriliyorsun...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            this.hideLoading();
            this.showError('Kullanıcı adı veya şifre hatalı');
            this.shakeForm(this.loginForm);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const acceptTerms = document.getElementById('acceptTerms').checked;
        
        // Validation
        if (!this.validateRegistrationForm(username, password, confirmPassword, acceptTerms)) {
            return;
        }

        try {
            this.showLoading('Hesap oluşturuluyor...');
            
            // Add success animation to form
            this.registerForm.classList.add('registration-success');
            
            // Simulate registration API call
            await this.simulateRegistration(username, phone, password);
            
            this.showSuccess('🎉 Hesap oluşturuldu! Yönlendiriliyorsun...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            this.hideLoading();
            this.registerForm.classList.remove('registration-success');
            this.showError('Hesap oluşturulamadı. Lütfen tekrar dene.');
            this.shakeForm(this.registerForm);
        }
    }

    validateRegistrationForm(username, password, confirmPassword, acceptTerms) {
        if (username.length < 3) {
            this.showError('Kullanıcı adı en az 3 karakter olmalı');
            return false;
        }

        if (password.length < 6) {
            this.showError('Şifre en az 6 karakter olmalı');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError('Şifreler eşleşmiyor');
            return false;
        }

        if (!acceptTerms) {
            this.showError('Kullanım şartlarını kabul etmelisiniz');
            return false;
        }

        return true;
    }

    async simulateLogin(username, password) {
        const delay = 1500 + Math.random() * 1000;
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate some test accounts
                const testAccounts = {
                    'test': 'test123',
                    'demo': 'demo123',
                    'oyuncu': 'oyuncu123'
                };
                
                if (testAccounts[username] === password) {
                    // Create real user data and token
                    const userData = {
                        id: 'user-' + username + '-' + Date.now(),
                        name: username,
                        phone: '0555 000 00 00',
                        trustScore: 120 + Math.floor(Math.random() * 80), // 120-200 arası
                        resources: {
                            money: 100 + Math.floor(Math.random() * 900), // 100-1000 arası
                            wood: Math.floor(Math.random() * 100),
                            grain: Math.floor(Math.random() * 100),
                            business: Math.floor(Math.random() * 10)
                        },
                        mentorStatus: 'kimsesiz',
                        registerDate: new Date().toISOString(),
                        lastLoginDate: new Date().toISOString()
                    };
                    
                    // Create JWT token (fake but working)
                    const token = 'jwt-' + username + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                    
                    // Store in localStorage
                    localStorage.setItem('jwt_token', token);
                    localStorage.setItem('user', JSON.stringify(userData));
                    
                    console.log('🔐 Login successful - Token created:', {
                        token: token,
                        user: userData
                    });
                    
                    resolve({
                        token: token,
                        user: userData
                    });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, delay);
        });
    }

    async simulateRegistration(username, phone, password) {
        const delay = 2000 + Math.random() * 1000;
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // %95 success rate
                if (Math.random() > 0.05) {
                    // Create new user data
                    const userData = {
                        id: 'user-' + username + '-' + Date.now(),
                        name: username,
                        phone: phone || '0555 000 00 00',
                        trustScore: 100, // Yeni kullanıcı başlangıç puanı
                        resources: {
                            money: 50, // Başlangıç parası
                            wood: 0,
                            grain: 0,
                            business: 0
                        },
                        mentorStatus: 'kimsesiz', // Yeni kullanıcı
                        registerDate: new Date().toISOString(),
                        lastLoginDate: new Date().toISOString()
                    };
                    
                    // Create JWT token
                    const token = 'jwt-new-' + username + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                    
                    // Store in localStorage
                    localStorage.setItem('jwt_token', token);
                    localStorage.setItem('user', JSON.stringify(userData));
                    
                    console.log('🌟 Registration successful - New user created:', {
                        token: token,
                        user: userData
                    });
                    
                    resolve({
                        token: token,
                        user: userData
                    });
                } else {
                    reject(new Error('Registration failed'));
                }
            }, delay);
        });
    }

    showLoading(text = 'Yükleniyor...') {
        const loadingText = this.loadingOverlay.querySelector('.loading-text');
        loadingText.textContent = text;
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    showSuccess(message) {
        this.updateLoadingText(message, '#43e97b');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    updateLoadingText(text, color = '#ffffff') {
        const loadingText = this.loadingOverlay.querySelector('.loading-text');
        loadingText.textContent = text;
        loadingText.style.color = color;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : '#43e97b'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-weight: 600;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    shakeForm(form) {
        form.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
    }

    updateOnlineCount() {
        const baseCount = 1150;
        const variation = Math.floor(Math.random() * 200) - 100;
        const onlineCount = baseCount + variation;
        
        this.animateNumber(this.onlineCountElement, onlineCount);
        
        setTimeout(() => this.updateOnlineCount(), 30000);
    }

    animateNumber(element, targetNumber) {
        const startNumber = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const duration = 2000;
        const step = (targetNumber - startNumber) / (duration / 16);
        let currentNumber = startNumber;
        
        const updateNumber = () => {
            currentNumber += step;
            if ((step > 0 && currentNumber >= targetNumber) || (step < 0 && currentNumber <= targetNumber)) {
                element.textContent = this.formatNumber(targetNumber);
                return;
            }
            element.textContent = this.formatNumber(Math.floor(currentNumber));
            requestAnimationFrame(updateNumber);
        };
        
        updateNumber();
    }

    formatNumber(num) {
        return num.toLocaleString('tr-TR');
    }

    startAnimations() {
        this.startFloatingIcons();
        this.animateBackgroundShapes();
    }

    startFloatingIcons() {
        const icons = document.querySelectorAll('.floating-icon');
        icons.forEach((icon, index) => {
            setTimeout(() => {
                icon.style.animationPlayState = 'running';
            }, index * 200);
        });
    }

    animateBackgroundShapes() {
        const shapes = document.querySelectorAll('.bg-shape');
        shapes.forEach(shape => {
            shape.style.animationPlayState = 'running';
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Tab switching function
function switchTab(tab) {
    console.log('🔄 switchTab called with:', tab);
    
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    console.log('🔍 Elements found:', {
        loginTab: !!loginTab,
        registerTab: !!registerTab,
        loginForm: !!loginForm,
        registerForm: !!registerForm
    });
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        console.log('✅ Switched to login tab');
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        console.log('✅ Switched to register tab');
    }
}

// Password toggle function
function togglePassword(inputId) {
    console.log('👁️ togglePassword called with:', inputId);
    
    const input = document.getElementById(inputId);
    const toggle = input?.parentElement?.querySelector('.password-toggle');
    
    console.log('🔍 Elements found:', {
        input: !!input,
        toggle: !!toggle
    });
    
    if (input && toggle) {
        if (input.type === 'password') {
            input.type = 'text';
            toggle.textContent = '🙈';
            console.log('✅ Password revealed');
        } else {
            input.type = 'password';
            toggle.textContent = '👁️';
            console.log('✅ Password hidden');
        }
    } else {
        console.error('❌ togglePassword: Elements not found');
    }
}

// CSS animasyonlarını JavaScript ile ekle
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Login page DOM loaded');
    addDynamicStyles();
    new AuthManager();
    console.log('✅ AuthManager initialized');
    
    // Global fonksiyonları window'a ekle (eğer değilse)
    window.switchTab = switchTab;
    window.togglePassword = togglePassword;
    console.log('🌍 Global functions attached');
});

// Klavye kısayolları
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (!loadingOverlay.classList.contains('hidden')) {
            loadingOverlay.classList.add('hidden');
        }
    }
    
    if (e.ctrlKey && e.key === 'Enter') {
        const activeForm = document.querySelector('.auth-form.active');
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }
});
