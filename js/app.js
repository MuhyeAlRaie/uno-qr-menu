// Main Application Logic for UNO Restaurant QR Menu System

class App {
    constructor() {
        this.tableNumber = Utils.getTableNumber();
        this.quickActions = [];
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    async init() {
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Load quick actions
            await this.loadQuickActions();
            
            // Render quick actions
            this.renderQuickActions();
            
            // Setup periodic refresh
            this.setupPeriodicRefresh();
            
            // Setup offline/online detection
            this.setupNetworkDetection();
            
            // Update current time
            this.updateCurrentTime();
            
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    setupEventListeners() {
        // Language change event
        window.addEventListener('languageChanged', () => {
            this.renderQuickActions();
        });

        // Visibility change (tab focus/blur)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshData();
            }
        });

        // Window focus
        window.addEventListener('focus', () => {
            this.refreshData();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R for refresh
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshData();
            }
            
            // Escape to close cart
            if (e.key === 'Escape' && window.cartManager && window.cartManager.isOpen) {
                window.cartManager.closeCart();
            }
        });

        // Service worker registration (for PWA support)
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
    }

    async loadQuickActions() {
        try {
            this.quickActions = await googleSheetsAPI.getQuickActions();
        } catch (error) {
            console.error('Error loading quick actions:', error);
            // Use default quick actions if loading fails
            this.quickActions = this.getDefaultQuickActions();
        }
    }

    getDefaultQuickActions() {
        return [
            {
                id: 'charcoal',
                nameEn: 'Request Charcoal',
                nameAr: 'طلب فحم',
                icon: 'fas fa-fire',
                color: 'danger'
            },
            {
                id: 'napkins',
                nameEn: 'Request Napkins',
                nameAr: 'طلب مناديل',
                icon: 'fas fa-tissue',
                color: 'info'
            },
            {
                id: 'bill',
                nameEn: 'Request Bill',
                nameAr: 'طلب الفاتورة',
                icon: 'fas fa-receipt',
                color: 'warning'
            },
            {
                id: 'waiter',
                nameEn: 'Call Waiter',
                nameAr: 'استدعاء النادل',
                icon: 'fas fa-hand-paper',
                color: 'primary'
            }
        ];
    }

    renderQuickActions() {
        const container = document.getElementById('quickActionsContainer');
        if (!container) return;

        const currentLang = languageManager.getCurrentLanguage();

        const actionsHtml = this.quickActions.map(action => {
            const actionName = currentLang === 'en' ? action.nameEn : action.nameAr;
            const colorClass = action.color || 'primary';
            
            return `
                <div class="col-6 col-md-3">
                    <button class="quick-action-btn btn-${colorClass}" 
                            onclick="app.sendQuickRequest('${action.id}', '${actionName}')">
                        <i class="${action.icon || 'fas fa-hand-paper'}"></i>
                        <span>${actionName}</span>
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = actionsHtml;
    }

    async sendQuickRequest(actionId, actionName) {
        try {
            // Show loading state
            const button = event.target.closest('.quick-action-btn');
            if (button) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending...</span>';
            }

            // Prepare request data
            const requestData = {
                tableNumber: this.tableNumber,
                actionId: actionId,
                actionName: actionName,
                timestamp: Utils.getCurrentTimestamp()
            };

            // Send request to Google Sheets
            await googleSheetsAPI.addQuickRequest(requestData);

            // Show success message
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'en' ? 'Request sent successfully!' : 'تم إرسال الطلب بنجاح!';
            Utils.showToast(message, 'success');

            // Reset button
            if (button) {
                button.disabled = false;
                const action = this.quickActions.find(a => a.id === actionId);
                if (action) {
                    const displayName = currentLang === 'en' ? action.nameEn : action.nameAr;
                    button.innerHTML = `<i class="${action.icon}"></i><span>${displayName}</span>`;
                }
            }

        } catch (error) {
            console.error('Error sending quick request:', error);
            
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'en' ? 'Failed to send request. Please try again.' : 'فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.';
            Utils.showToast(message, 'danger');

            // Reset button
            const button = event.target.closest('.quick-action-btn');
            if (button) {
                button.disabled = false;
                const action = this.quickActions.find(a => a.id === actionId);
                if (action) {
                    const displayName = currentLang === 'en' ? action.nameEn : action.nameAr;
                    button.innerHTML = `<i class="${action.icon}"></i><span>${displayName}</span>`;
                }
            }
        }
    }

    async refreshData() {
        try {
            // Clear caches
            googleSheetsAPI.clearCache();
            
            // Refresh menu data
            if (window.menuManager) {
                await window.menuManager.refresh();
            }
            
            // Refresh quick actions
            await this.loadQuickActions();
            this.renderQuickActions();
            
            console.log('Data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }

    setupPeriodicRefresh() {
        // Refresh data every 5 minutes
        setInterval(() => {
            if (!document.hidden && this.isOnline) {
                this.refreshData();
            }
        }, APP_CONFIG.REFRESH_INTERVALS.MENU);
    }

    setupNetworkDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNetworkStatus('online');
            this.refreshData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNetworkStatus('offline');
        });
    }

    showNetworkStatus(status) {
        const currentLang = languageManager.getCurrentLanguage();
        
        if (status === 'online') {
            const message = currentLang === 'en' ? 'Connection restored' : 'تم استعادة الاتصال';
            Utils.showToast(message, 'success');
        } else {
            const message = currentLang === 'en' ? 'No internet connection' : 'لا يوجد اتصال بالإنترنت';
            Utils.showToast(message, 'warning');
        }
    }

    updateCurrentTime() {
        const updateTime = () => {
            const timeElements = document.querySelectorAll('#currentTime');
            timeElements.forEach(element => {
                element.textContent = new Date().toLocaleTimeString();
            });
        };

        // Update immediately
        updateTime();
        
        // Update every second
        setInterval(updateTime, 1000);
    }

    async registerServiceWorker() {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            }
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    // PWA Install prompt
    setupPWAInstall() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            deferredPrompt = null;
        });
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        let installBtn = document.getElementById('installBtn');
        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'installBtn';
            installBtn.className = 'btn btn-outline-primary btn-sm';
            installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                border-radius: 25px;
                padding: 10px 15px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            `;
            
            document.body.appendChild(installBtn);
            
            installBtn.addEventListener('click', () => {
                this.installPWA();
            });
        }
    }

    async installPWA() {
        const deferredPrompt = window.deferredPrompt;
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        window.deferredPrompt = null;
        
        // Hide install button
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        const currentLang = languageManager.getCurrentLanguage();
        let message = currentLang === 'en' ? 'An error occurred' : 'حدث خطأ';
        
        if (error.message) {
            if (error.message.includes('network') || error.message.includes('fetch')) {
                message = currentLang === 'en' ? 'Network error. Please check your connection.' : 'خطأ في الشبكة. يرجى التحقق من الاتصال.';
            }
        }
        
        Utils.showToast(message, 'danger');
    }

    // Analytics tracking
    trackEvent(eventName, eventData = {}) {
        try {
            // Track user interactions for analytics
            const eventLog = {
                event: eventName,
                data: eventData,
                timestamp: Utils.getCurrentTimestamp(),
                tableNumber: this.tableNumber,
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // Store in localStorage for later sync
            const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            events.push(eventLog);
            
            // Keep only last 100 events
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }
            
            localStorage.setItem('analytics_events', JSON.stringify(events));
            
            console.log('Event tracked:', eventLog);
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    }

    // Get app status
    getStatus() {
        return {
            isOnline: this.isOnline,
            tableNumber: this.tableNumber,
            currentLanguage: languageManager.getCurrentLanguage(),
            cartItemCount: window.cartManager ? window.cartManager.getItemCount() : 0,
            quickActionsCount: this.quickActions.length,
            lastRefresh: new Date().toISOString()
        };
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.app) {
        window.app.handleError(event.error, 'global');
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.app) {
        window.app.handleError(event.reason, 'promise');
    }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}

