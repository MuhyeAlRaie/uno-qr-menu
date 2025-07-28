// Main Application Entry Point for UNO Restaurant QR Menu System

class App {
    constructor() {
        this.isInitialized = false;
        this.soundEnabled = CONFIG.APP.SOUND_ALERTS;
        this.orderRefreshInterval = null;
    }

    // Initialize the application
    async init() {
        try {
            console.log('Initializing UNO Restaurant QR Menu System...');
            
            // Initialize Google Sheets API
            await googleSheetsAPI.init();
            
            // Initialize router
            router.init();
            
            // Set up global event listeners
            this.setupEventListeners();
            
            // Initialize sound system
            this.initSoundSystem();
            
            this.isInitialized = true;
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    // Setup global event listeners
    setupEventListeners() {
        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showNotification('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Connection lost. Some features may not work.', 'warning');
        });

        // Handle visibility change for order refresh
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopOrderRefresh();
            } else if (router.currentView === 'cashier') {
                this.startOrderRefresh();
            }
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals/sidebars
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
        });

        // Handle cart storage
        window.addEventListener('beforeunload', () => {
            this.saveCartToStorage();
        });
    }

    // Initialize sound system
    initSoundSystem() {
        // Create audio context for sound alerts
        if (this.soundEnabled && 'AudioContext' in window) {
            this.audioContext = new AudioContext();
            this.createSoundEffects();
        }
    }

    // Create sound effects
    createSoundEffects() {
        this.sounds = {
            newOrder: this.createBeep(800, 0.1, 'sine'),
            orderReady: this.createBeep(600, 0.2, 'square'),
            notification: this.createBeep(400, 0.1, 'triangle')
        };
    }

    // Create beep sound
    createBeep(frequency, duration, type = 'sine') {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    // Play sound effect
    playSound(soundName) {
        if (this.soundEnabled && this.sounds && this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    // Start order refresh for cashier
    startOrderRefresh() {
        if (this.orderRefreshInterval) return;
        
        this.orderRefreshInterval = setInterval(async () => {
            if (router.currentView === 'cashier' && window.CashierManager) {
                await window.CashierManager.refreshOrders();
            }
        }, CONFIG.APP.ORDER_REFRESH_INTERVAL);
    }

    // Stop order refresh
    stopOrderRefresh() {
        if (this.orderRefreshInterval) {
            clearInterval(this.orderRefreshInterval);
            this.orderRefreshInterval = null;
        }
    }

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.app-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `app-notification alert alert-${type} position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${message}</span>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);

        // Play notification sound
        this.playSound('notification');
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'danger', 5000);
    }

    // Show success message
    showSuccess(message) {
        this.showNotification(message, 'success', 3000);
    }

    // Close all modals and sidebars
    closeAllModals() {
        // Close cart sidebar
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
        }

        // Close Bootstrap modals
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        });
    }

    // Focus search input
    focusSearch() {
        const searchInput = document.querySelector('input[type="search"], .search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    // Save cart to localStorage
    saveCartToStorage() {
        if (window.MenuManager && window.MenuManager.cart) {
            localStorage.setItem('uno_cart', JSON.stringify(window.MenuManager.cart));
        }
    }

    // Load cart from localStorage
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('uno_cart');
        if (savedCart && window.MenuManager) {
            try {
                window.MenuManager.cart = JSON.parse(savedCart);
                window.MenuManager.updateCartDisplay();
            } catch (error) {
                console.error('Failed to load cart from storage:', error);
                localStorage.removeItem('uno_cart');
            }
        }
    }

    // Clear cart storage
    clearCartStorage() {
        localStorage.removeItem('uno_cart');
    }

    // Format currency
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    }

    // Format date
    formatDate(date, locale = null) {
        const currentLocale = locale || localStorage.getItem('language') || 'en';
        return new Intl.DateTimeFormat(currentLocale === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone number
    validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Generate unique ID
    generateId(prefix = '') {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Check if device is mobile
    isMobile() {
        return window.innerWidth <= 768;
    }

    // Check if device supports touch
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Get device info
    getDeviceInfo() {
        return {
            isMobile: this.isMobile(),
            isTouch: this.isTouchDevice(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform
        };
    }

    // Log analytics event
    logEvent(eventName, eventData = {}) {
        // This could be extended to send to analytics services
        console.log('Analytics Event:', eventName, eventData);
        
        // Store locally for basic analytics
        const events = JSON.parse(localStorage.getItem('uno_analytics') || '[]');
        events.push({
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            device: this.getDeviceInfo()
        });
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('uno_analytics', JSON.stringify(events));
    }
}

// Global utility functions
window.toggleCart = function() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('open');
    }
};

window.generateQR = function() {
    const tableNumber = document.getElementById('tableNumber').value;
    if (!tableNumber) {
        app.showError('Please enter a table number');
        return;
    }

    const qrData = `${CONFIG.TABLES.QR_BASE_URL}?view=menu&table=${tableNumber}`;
    const qrContainer = document.getElementById('qrcode');
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Generate QR code
    QRCode.toCanvas(qrData, { width: 200, height: 200 }, (error, canvas) => {
        if (error) {
            app.showError('Failed to generate QR code');
            return;
        }
        
        qrContainer.appendChild(canvas);
        
        // Show QR info
        document.getElementById('qrInfo').innerHTML = `
            <p><strong>Table ${tableNumber}</strong></p>
            <p><small>${qrData}</small></p>
            <button class="btn btn-sm btn-outline-primary" onclick="downloadQR(${tableNumber})">Download</button>
        `;
    });
};

window.downloadQR = function(tableNumber) {
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = `table-${tableNumber}-qr.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
};

window.generateAllQRs = function() {
    const container = document.getElementById('allQRs');
    container.innerHTML = '<p>Generating QR codes...</p>';
    
    const qrGrid = document.createElement('div');
    qrGrid.className = 'row';
    
    for (let i = 1; i <= CONFIG.TABLES.TOTAL_TABLES; i++) {
        const qrData = `${CONFIG.TABLES.QR_BASE_URL}?view=menu&table=${i}`;
        
        const col = document.createElement('div');
        col.className = 'col-md-3 col-sm-4 col-6 mb-3';
        
        const card = document.createElement('div');
        card.className = 'card text-center';
        card.innerHTML = `
            <div class="card-body">
                <h6>Table ${i}</h6>
                <div id="qr-${i}"></div>
                <button class="btn btn-sm btn-outline-primary mt-2" onclick="downloadTableQR(${i})">Download</button>
            </div>
        `;
        
        col.appendChild(card);
        qrGrid.appendChild(col);
        
        // Generate QR code
        QRCode.toCanvas(qrData, { width: 100, height: 100 }, (error, canvas) => {
            if (!error) {
                document.getElementById(`qr-${i}`).appendChild(canvas);
            }
        });
    }
    
    container.innerHTML = '';
    container.appendChild(qrGrid);
};

window.downloadTableQR = function(tableNumber) {
    const canvas = document.querySelector(`#qr-${tableNumber} canvas`);
    if (canvas) {
        const link = document.createElement('a');
        link.download = `table-${tableNumber}-qr.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Create global app instance
    window.app = new App();
    
    // Initialize application
    await app.init();
    
    // Load cart from storage if on menu page
    if (router.currentView === 'menu') {
        app.loadCartFromStorage();
    }
    
    // Log app start event
    app.logEvent('app_start', {
        view: router.currentView,
        table: router.currentTable,
        language: router.currentLanguage
    });
});

// Handle service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

