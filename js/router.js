// Router for UNO Restaurant QR Menu System

class Router {
    constructor() {
        this.routes = {
            'menu': this.loadMenu.bind(this),
            'cashier': this.loadCashier.bind(this),
            'admin': this.loadAdmin.bind(this),
            'qr-generator': this.loadQRGenerator.bind(this)
        };
        
        this.currentView = null;
        this.currentTable = null;
        this.currentLanguage = localStorage.getItem('language') || CONFIG.APP.DEFAULT_LANGUAGE;
        
        // Listen for URL changes
        window.addEventListener('popstate', this.handleRouteChange.bind(this));
        window.addEventListener('hashchange', this.handleRouteChange.bind(this));
    }

    // Initialize router
    init() {
        this.handleRouteChange();
    }

    // Handle route changes
    handleRouteChange() {
        const urlParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.substring(1);
        
        // Determine view from URL parameters
        let view = urlParams.get('view') || hash || 'menu';
        const table = urlParams.get('table');
        const lang = urlParams.get('lang');
        
        // Set language if provided
        if (lang && CONFIG.APP.SUPPORTED_LANGUAGES.includes(lang)) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        }

        // Set table if provided
        if (table) {
            this.currentTable = parseInt(table);
        }

        // Load the appropriate view
        this.loadView(view);
    }

    // Load a specific view
    async loadView(view) {
        if (this.routes[view]) {
            this.currentView = view;
            await this.routes[view]();
        } else {
            // Default to menu view
            this.currentView = 'menu';
            await this.loadMenu();
        }
    }

    // Load menu view
    async loadMenu() {
        const mainContent = document.getElementById('main-content');
        
        try {
            // Show loading
            this.showLoading();
            
            // Initialize Google Sheets API (or use demo mode)
            if (!window.googleSheetsAPI.isInitialized) {
                try {
                    await window.googleSheetsAPI.init();
                } catch (error) {
                    console.log('Google Sheets API failed, using demo mode');
                    window.googleSheetsAPI = new DemoGoogleSheetsAPI();
                    await window.googleSheetsAPI.init();
                }
            }
            
            // Load menu data
            const [categories, menuItems, quickActions] = await Promise.all([
                window.googleSheetsAPI.getCategories(),
                window.googleSheetsAPI.getMenuItems(),
                window.googleSheetsAPI.getQuickActions()
            ]);

            // Generate menu HTML
            const menuHTML = this.generateMenuHTML(categories, menuItems, quickActions);
            mainContent.innerHTML = menuHTML;
            
            // Initialize menu functionality
            if (window.menuManager) {
                window.menuManager.init(categories, menuItems, quickActions);
            } else {
                console.error('MenuManager not found');
            }
            
            // Hide loading
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading menu:', error);
            this.showError('Failed to load menu. Please try again.');
        }
    }

    // Load cashier view
    async loadCashier() {
        const mainContent = document.getElementById('main-content');
        
        try {
            this.showLoading();
            
            // Load orders data
            const orders = await googleSheetsAPI.getOrders();
            
            // Generate cashier HTML
            const cashierHTML = this.generateCashierHTML(orders);
            mainContent.innerHTML = cashierHTML;
            
            // Initialize cashier functionality
            if (window.CashierManager) {
                window.CashierManager.init(orders);
            }
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading cashier:', error);
            this.showError('Failed to load cashier dashboard. Please try again.');
        }
    }

    // Load admin view
    async loadAdmin() {
        const mainContent = document.getElementById('main-content');
        
        try {
            this.showLoading();
            
            // Load admin data
            const [categories, menuItems, analytics] = await Promise.all([
                googleSheetsAPI.getCategories(),
                googleSheetsAPI.getMenuItems(),
                googleSheetsAPI.getAnalytics()
            ]);
            
            // Generate admin HTML
            const adminHTML = this.generateAdminHTML(categories, menuItems, analytics);
            mainContent.innerHTML = adminHTML;
            
            // Initialize admin functionality
            if (window.AdminManager) {
                window.AdminManager.init(categories, menuItems, analytics);
            }
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading admin:', error);
            this.showError('Failed to load admin panel. Please try again.');
        }
    }

    // Load QR generator view
    async loadQRGenerator() {
        const mainContent = document.getElementById('main-content');
        
        const qrHTML = `
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">${t('qr_generator')}</h3>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h5>${t('generate_table_qr')}</h5>
                                        <div class="mb-3">
                                            <label for="tableNumber" class="form-label">${t('table_number')}</label>
                                            <input type="number" class="form-control" id="tableNumber" min="1" max="${CONFIG.TABLES.TOTAL_TABLES}">
                                        </div>
                                        <button class="btn btn-primary" onclick="generateQR()">${t('generate_qr')}</button>
                                    </div>
                                    <div class="col-md-6">
                                        <div id="qrcode"></div>
                                        <div id="qrInfo" class="mt-3"></div>
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-12">
                                        <h5>${t('all_table_qrs')}</h5>
                                        <button class="btn btn-success" onclick="generateAllQRs()">${t('generate_all_qrs')}</button>
                                        <div id="allQRs" class="mt-3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = qrHTML;
        this.hideLoading();
    }

    // Generate menu HTML template
    generateMenuHTML(categories, menuItems, quickActions) {
        return `
            <div class="menu-container">
                <!-- Header -->
                <header class="menu-header text-center py-4">
                    <div class="container">
                        <h1 class="display-4 text-primary">${t('menu_title')}</h1>
                        <p class="lead">${t('menu_subtitle')}</p>
                        ${this.currentTable ? `<div class="badge bg-secondary fs-6">${t('table')} ${this.currentTable}</div>` : ''}
                        <div class="language-switcher mt-3">
                            <button class="btn btn-outline-primary btn-sm me-2 ${this.currentLanguage === 'en' ? 'active' : ''}" onclick="router.switchLanguage('en')">English</button>
                            <button class="btn btn-outline-primary btn-sm ${this.currentLanguage === 'ar' ? 'active' : ''}" onclick="router.switchLanguage('ar')">العربية</button>
                        </div>
                    </div>
                </header>

                <!-- Quick Actions -->
                <section class="quick-actions py-3 bg-light">
                    <div class="container">
                        <h4 class="mb-3">${t('quick_actions')}</h4>
                        <div class="row" id="quickActionsContainer">
                            <!-- Quick actions will be populated here -->
                        </div>
                    </div>
                </section>

                <!-- Menu Categories and Items -->
                <main class="menu-content py-4">
                    <div class="container">
                        <!-- Categories Navigation -->
                        <div class="categories-nav mb-4">
                            <div class="row" id="categoriesContainer">
                                <!-- Categories will be populated here -->
                            </div>
                        </div>

                        <!-- Menu Items -->
                        <div class="menu-items">
                            <div id="menuItemsContainer">
                                <!-- Menu items will be populated here -->
                            </div>
                        </div>
                    </div>
                </main>

                <!-- Cart -->
                <div class="cart-sidebar" id="cartSidebar">
                    <div class="cart-header">
                        <h5>${t('cart')}</h5>
                        <button class="btn-close" onclick="toggleCart()"></button>
                    </div>
                    <div class="cart-body" id="cartItems">
                        <!-- Cart items will be populated here -->
                    </div>
                    <div class="cart-footer">
                        <div class="cart-total">
                            <strong>${t('total')}: <span id="cartTotal">0</span></strong>
                        </div>
                        <button class="btn btn-primary w-100 mt-2" onclick="checkout()">${t('order_now')}</button>
                    </div>
                </div>

                <!-- Cart Toggle Button -->
                <button class="cart-toggle-btn" onclick="toggleCart()">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cartCount">0</span>
                </button>
            </div>
        `;
    }

    // Generate cashier HTML template
    generateCashierHTML(orders) {
        return `
            <div class="cashier-container">
                <header class="cashier-header bg-primary text-white py-3">
                    <div class="container">
                        <h2>${t('cashier_dashboard')}</h2>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="stats">
                                <span class="badge bg-warning me-2">${t('pending_orders')}: <span id="pendingCount">0</span></span>
                                <span class="badge bg-success">${t('ready_orders')}: <span id="readyCount">0</span></span>
                            </div>
                            <button class="btn btn-light btn-sm" onclick="location.reload()">
                                <i class="fas fa-refresh"></i> ${t('refresh')}
                            </button>
                        </div>
                    </div>
                </header>

                <main class="cashier-content py-4">
                    <div class="container">
                        <div class="row">
                            <!-- Orders List -->
                            <div class="col-md-8">
                                <div class="card">
                                    <div class="card-header">
                                        <h5>${t('new_orders')}</h5>
                                    </div>
                                    <div class="card-body">
                                        <div id="ordersContainer">
                                            <!-- Orders will be populated here -->
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Order Details -->
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h5>${t('order_details')}</h5>
                                    </div>
                                    <div class="card-body">
                                        <div id="orderDetailsContainer">
                                            <p class="text-muted">${t('select_order_to_view_details')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    // Generate admin HTML template
    generateAdminHTML(categories, menuItems, analytics) {
        return `
            <div class="admin-container">
                <header class="admin-header bg-dark text-white py-3">
                    <div class="container">
                        <h2>${t('admin_panel')}</h2>
                        <nav class="nav nav-pills">
                            <a class="nav-link active" href="#menu-management" onclick="showAdminTab('menu-management')">${t('menu_management')}</a>
                            <a class="nav-link" href="#analytics" onclick="showAdminTab('analytics')">${t('analytics')}</a>
                        </nav>
                    </div>
                </header>

                <main class="admin-content py-4">
                    <div class="container">
                        <!-- Menu Management Tab -->
                        <div id="menu-management" class="admin-tab active">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="card">
                                        <div class="card-header d-flex justify-content-between">
                                            <h5>${t('menu_items')}</h5>
                                            <button class="btn btn-primary btn-sm" onclick="showAddItemModal()">${t('add_item')}</button>
                                        </div>
                                        <div class="card-body">
                                            <div id="menuItemsTable">
                                                <!-- Menu items table will be populated here -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-header">
                                            <h5>${t('categories')}</h5>
                                        </div>
                                        <div class="card-body">
                                            <div id="categoriesList">
                                                <!-- Categories will be populated here -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Analytics Tab -->
                        <div id="analytics" class="admin-tab" style="display: none;">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <h5>${t('most_ordered')}</h5>
                                        </div>
                                        <div class="card-body">
                                            <div id="mostOrderedChart">
                                                <!-- Chart will be populated here -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <h5>${t('total_sales')}</h5>
                                        </div>
                                        <div class="card-body">
                                            <div id="salesChart">
                                                <!-- Chart will be populated here -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    // Switch language
    switchLanguage(lang) {
        if (CONFIG.APP.SUPPORTED_LANGUAGES.includes(lang)) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            
            // Update URL
            const url = new URL(window.location);
            url.searchParams.set('lang', lang);
            window.history.pushState({}, '', url);
            
            // Reload current view
            this.loadView(this.currentView);
        }
    }

    // Navigate to a specific view
    navigate(view, params = {}) {
        const url = new URL(window.location);
        url.searchParams.set('view', view);
        
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });
        
        window.history.pushState({}, '', url);
        this.handleRouteChange();
    }

    // Show loading screen
    showLoading() {
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('main-content').style.display = 'none';
    }

    // Hide loading screen
    hideLoading() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }

    // Show error message
    showError(message) {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="container mt-5">
                <div class="alert alert-danger text-center">
                    <h4>${t('error')}</h4>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">${t('try_again')}</button>
                </div>
            </div>
        `;
        this.hideLoading();
    }
}

// Create global router instance
const router = new Router();

