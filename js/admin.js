// Admin Dashboard for UNO Restaurant QR Menu System

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.menuItems = [];
        this.categories = [];
        this.quickActions = [];
        this.orders = [];
        this.analytics = {};
        this.charts = {};
        this.currentEditingItem = null;
        
        this.init();
    }

    async init() {
        try {
            // Load initial data
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial UI
            this.showSection('dashboard');
            this.updateCurrentTime();
            
            console.log('Admin dashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing admin dashboard:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    async loadData() {
        try {
            // Load data in parallel
            const [menuItems, categories, quickActions, orders, analytics] = await Promise.all([
                googleSheetsAPI.getMenuItems(false),
                googleSheetsAPI.getCategories(false),
                googleSheetsAPI.getQuickActions(false),
                googleSheetsAPI.getOrders(false),
                googleSheetsAPI.getAnalytics()
            ]);

            this.menuItems = menuItems || [];
            this.categories = categories || [];
            this.quickActions = quickActions || [];
            this.orders = orders || [];
            this.analytics = analytics || {};

        } catch (error) {
            console.error('Error loading admin data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });

        // Refresh button
        const refreshBtn = document.querySelector('[onclick="refreshData()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Sidebar toggle for mobile
        window.toggleSidebar = () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        };

        // Global functions for HTML onclick events
        window.showSection = (section) => this.showSection(section);
        window.showAddItemModal = () => this.showAddItemModal();
        window.showAddCategoryModal = () => this.showAddCategoryModal();
        window.showAddQuickActionModal = () => this.showAddQuickActionModal();
        window.editItem = (id) => this.editItem(id);
        window.deleteItem = (id) => this.deleteItem(id);
        window.editCategory = (id) => this.editCategory(id);
        window.deleteCategory = (id) => this.deleteCategory(id);
        window.editQuickAction = (id) => this.editQuickAction(id);
        window.deleteQuickAction = (id) => this.deleteQuickAction(id);
        window.saveItem = () => this.saveItem();
        window.saveCategory = () => this.saveCategory();
        window.saveQuickAction = () => this.saveQuickAction();
        window.addSizeRow = () => this.addSizeRow();
        window.removeSizeRow = (button) => this.removeSizeRow(button);
    }

    showSection(sectionId) {
        // Update active nav link
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.sidebar-nav .nav-link[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = this.getSectionTitle(sectionId);
        }

        // Load section-specific data
        this.loadSectionData(sectionId);
        this.currentSection = sectionId;
    }

    getSectionTitle(sectionId) {
        const titles = {
            'dashboard': 'Dashboard',
            'menu-items': 'Menu Items',
            'categories': 'Categories',
            'quick-actions': 'Quick Actions',
            'orders': 'Orders',
            'analytics': 'Analytics'
        };
        return titles[sectionId] || 'Dashboard';
    }

    async loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'menu-items':
                this.renderMenuItems();
                break;
            case 'categories':
                this.renderCategories();
                break;
            case 'quick-actions':
                this.renderQuickActions();
                break;
            case 'orders':
                this.renderOrders();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
        }
    }

    renderDashboard() {
        // Update statistics
        this.updateDashboardStats();
        this.renderRecentOrders();
        this.renderQuickStatsChart();
    }

    updateDashboardStats() {
        // Total items
        const totalItemsElement = document.getElementById('totalItems');
        if (totalItemsElement) {
            totalItemsElement.textContent = this.menuItems.length;
        }

        // Total orders
        const totalOrdersElement = document.getElementById('totalOrders');
        if (totalOrdersElement) {
            totalOrdersElement.textContent = this.orders.length;
        }

        // Total revenue
        const totalRevenueElement = document.getElementById('totalRevenue');
        if (totalRevenueElement) {
            const revenue = this.orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
            totalRevenueElement.textContent = Utils.formatCurrency(revenue);
        }

        // Active tables
        const activeTablesElement = document.getElementById('activeTables');
        if (activeTablesElement) {
            const activeTables = this.orders.filter(order => 
                order.status !== APP_CONFIG.ORDER_STATUSES.COMPLETED
            ).length;
            activeTablesElement.textContent = activeTables;
        }
    }

    renderRecentOrders() {
        const tableBody = document.querySelector('#recentOrdersTable tbody');
        if (!tableBody) return;

        const recentOrders = this.orders
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        if (recentOrders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">No orders found</td>
                </tr>
            `;
            return;
        }

        const ordersHtml = recentOrders.map(order => {
            const orderTime = new Date(order.timestamp).toLocaleTimeString();
            const statusBadge = this.getStatusBadge(order.status);
            const itemCount = order.items ? order.items.length : 0;

            return `
                <tr>
                    <td>#${order.id.slice(-6)}</td>
                    <td>${order.tableNumber}</td>
                    <td>${itemCount} items</td>
                    <td>${Utils.formatCurrency(order.total)}</td>
                    <td>${statusBadge}</td>
                    <td>${orderTime}</td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = ordersHtml;
    }

    renderQuickStatsChart() {
        const canvas = document.getElementById('quickStatsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.quickStats) {
            this.charts.quickStats.destroy();
        }

        const statusCounts = this.getOrderStatusCounts();

        this.charts.quickStats = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Preparing', 'Ready', 'Completed'],
                datasets: [{
                    data: [
                        statusCounts.pending,
                        statusCounts.preparing,
                        statusCounts.ready,
                        statusCounts.completed
                    ],
                    backgroundColor: [
                        '#ffc107',
                        '#17a2b8',
                        '#28a745',
                        '#6c757d'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderMenuItems() {
        const tableBody = document.querySelector('#menuItemsTable tbody');
        if (!tableBody) return;

        if (this.menuItems.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">No menu items found</td>
                </tr>
            `;
            return;
        }

        const itemsHtml = this.menuItems.map(item => {
            const price = item.sizes && item.sizes.length > 0 
                ? `${Utils.formatCurrency(Math.min(...item.sizes.map(s => s.price)))} - ${Utils.formatCurrency(Math.max(...item.sizes.map(s => s.price)))}`
                : Utils.formatCurrency(item.price || 0);

            const category = this.categories.find(cat => cat.id === item.categoryId);
            const categoryName = category ? category.nameEn : 'Unknown';

            return `
                <tr>
                    <td>
                        <img src="${item.imageUrl || 'images/placeholder.jpg'}" 
                             alt="${item.nameEn}" 
                             class="img-thumbnail"
                             style="width: 50px; height: 50px; object-fit: cover;"
                             onerror="this.src='images/placeholder.jpg'">
                    </td>
                    <td>${item.nameEn}</td>
                    <td>${item.nameAr || '-'}</td>
                    <td>${categoryName}</td>
                    <td>${price}</td>
                    <td>
                        <span class="badge bg-${item.available ? 'success' : 'danger'}">
                            ${item.available ? 'Available' : 'Unavailable'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editItem('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = itemsHtml;
    }

    renderCategories() {
        const container = document.getElementById('categoriesContainer');
        if (!container) return;

        if (this.categories.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center text-muted py-5">
                        <i class="fas fa-tags fa-3x mb-3"></i>
                        <h5>No categories found</h5>
                        <p>Add your first category to get started</p>
                    </div>
                </div>
            `;
            return;
        }

        const categoriesHtml = this.categories.map(category => {
            const itemCount = this.menuItems.filter(item => item.categoryId === category.id).length;

            return `
                <div class="col-md-6 col-lg-4">
                    <div class="category-card">
                        <div class="category-icon">
                            <i class="${category.icon || 'fas fa-utensils'}"></i>
                        </div>
                        <div class="category-name">${category.nameEn}</div>
                        <div class="category-count">${itemCount} items</div>
                        <div class="category-actions">
                            <button class="btn btn-sm btn-outline-primary" onclick="editCategory('${category.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${category.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = categoriesHtml;
    }

    renderQuickActions() {
        const container = document.getElementById('quickActionsContainer');
        if (!container) return;

        if (this.quickActions.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center text-muted py-5">
                        <i class="fas fa-bolt fa-3x mb-3"></i>
                        <h5>No quick actions found</h5>
                        <p>Add quick actions for customer requests</p>
                    </div>
                </div>
            `;
            return;
        }

        const actionsHtml = this.quickActions.map(action => {
            return `
                <div class="col-md-6 col-lg-4">
                    <div class="quick-action-card">
                        <div class="action-icon text-${action.color || 'primary'}">
                            <i class="${action.icon || 'fas fa-hand-paper'}"></i>
                        </div>
                        <div class="action-name">${action.nameEn}</div>
                        <div class="action-actions">
                            <button class="btn btn-sm btn-outline-primary" onclick="editQuickAction('${action.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteQuickAction('${action.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = actionsHtml;
    }

    renderOrders() {
        const tableBody = document.querySelector('#ordersTable tbody');
        if (!tableBody) return;

        if (this.orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">No orders found</td>
                </tr>
            `;
            return;
        }

        const ordersHtml = this.orders.map(order => {
            const orderDate = new Date(order.timestamp).toLocaleDateString();
            const statusBadge = this.getStatusBadge(order.status);
            const itemCount = order.items ? order.items.length : 0;

            return `
                <tr>
                    <td>#${order.id.slice(-6)}</td>
                    <td>${order.tableNumber}</td>
                    <td>Customer</td>
                    <td>${itemCount} items</td>
                    <td>${Utils.formatCurrency(order.total)}</td>
                    <td>${statusBadge}</td>
                    <td>${orderDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = ordersHtml;
    }

    renderAnalytics() {
        this.renderMostOrderedChart();
        this.renderRevenueTrendChart();
        this.renderCategoryPerformanceChart();
        this.renderOrderStatusChart();
    }

    renderMostOrderedChart() {
        const canvas = document.getElementById('mostOrderedChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.mostOrdered) {
            this.charts.mostOrdered.destroy();
        }

        const itemCounts = this.getMostOrderedItems();

        this.charts.mostOrdered = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: itemCounts.map(item => item.name),
                datasets: [{
                    label: 'Orders',
                    data: itemCounts.map(item => item.count),
                    backgroundColor: 'rgba(108, 92, 231, 0.8)',
                    borderColor: 'rgba(108, 92, 231, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderRevenueTrendChart() {
        const canvas = document.getElementById('revenueTrendChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.revenueTrend) {
            this.charts.revenueTrend.destroy();
        }

        const revenueData = this.getRevenueTrendData();

        this.charts.revenueTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: revenueData.map(item => item.date),
                datasets: [{
                    label: 'Revenue',
                    data: revenueData.map(item => item.revenue),
                    borderColor: 'rgba(0, 184, 148, 1)',
                    backgroundColor: 'rgba(0, 184, 148, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderCategoryPerformanceChart() {
        const canvas = document.getElementById('categoryPerformanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.categoryPerformance) {
            this.charts.categoryPerformance.destroy();
        }

        const categoryData = this.getCategoryPerformanceData();

        this.charts.categoryPerformance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categoryData.map(item => item.name),
                datasets: [{
                    data: categoryData.map(item => item.revenue),
                    backgroundColor: [
                        '#6c5ce7',
                        '#a29bfe',
                        '#fd79a8',
                        '#fdcb6e',
                        '#e17055',
                        '#74b9ff',
                        '#00b894'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderOrderStatusChart() {
        const canvas = document.getElementById('orderStatusChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.orderStatus) {
            this.charts.orderStatus.destroy();
        }

        const statusCounts = this.getOrderStatusCounts();

        this.charts.orderStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Preparing', 'Ready', 'Completed'],
                datasets: [{
                    data: [
                        statusCounts.pending,
                        statusCounts.preparing,
                        statusCounts.ready,
                        statusCounts.completed
                    ],
                    backgroundColor: [
                        '#ffc107',
                        '#17a2b8',
                        '#28a745',
                        '#6c757d'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Modal functions
    showAddItemModal() {
        this.currentEditingItem = null;
        this.resetItemForm();
        this.populateCategorySelect();
        
        const modal = document.getElementById('itemModal');
        const modalTitle = document.getElementById('itemModalTitle');
        
        if (modalTitle) {
            modalTitle.textContent = 'Add New Item';
        }
        
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    showAddCategoryModal() {
        this.resetCategoryForm();
        
        const modal = document.getElementById('categoryModal');
        const modalTitle = document.getElementById('categoryModalTitle');
        
        if (modalTitle) {
            modalTitle.textContent = 'Add New Category';
        }
        
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    showAddQuickActionModal() {
        this.resetQuickActionForm();
        
        const modal = document.getElementById('quickActionModal');
        const modalTitle = document.getElementById('quickActionModalTitle');
        
        if (modalTitle) {
            modalTitle.textContent = 'Add New Quick Action';
        }
        
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    // CRUD operations
    async saveItem() {
        try {
            const formData = this.getItemFormData();
            
            if (!this.validateItemForm(formData)) {
                return;
            }

            // Show loading state
            const saveBtn = document.querySelector('#itemModal .btn-primary');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }

            if (this.currentEditingItem) {
                // Update existing item
                await googleSheetsAPI.updateMenuItem(this.currentEditingItem.id, formData);
                Utils.showToast('Item updated successfully!', 'success');
            } else {
                // Add new item
                await googleSheetsAPI.addMenuItem(formData);
                Utils.showToast('Item added successfully!', 'success');
            }

            // Refresh data and UI
            await this.loadData();
            this.renderMenuItems();

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('itemModal'));
            if (modal) {
                modal.hide();
            }

        } catch (error) {
            console.error('Error saving item:', error);
            Utils.showToast('Failed to save item', 'danger');
        } finally {
            // Reset button
            const saveBtn = document.querySelector('#itemModal .btn-primary');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Item';
            }
        }
    }

    async saveCategory() {
        try {
            const formData = this.getCategoryFormData();
            
            if (!this.validateCategoryForm(formData)) {
                return;
            }

            // Show loading state
            const saveBtn = document.querySelector('#categoryModal .btn-primary');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }

            if (this.currentEditingCategory) {
                // Update existing category
                await googleSheetsAPI.updateCategory(this.currentEditingCategory.id, formData);
                Utils.showToast('Category updated successfully!', 'success');
            } else {
                // Add new category
                await googleSheetsAPI.addCategory(formData);
                Utils.showToast('Category added successfully!', 'success');
            }

            // Refresh data and UI
            await this.loadData();
            this.renderCategories();

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
            if (modal) {
                modal.hide();
            }

        } catch (error) {
            console.error('Error saving category:', error);
            Utils.showToast('Failed to save category', 'danger');
        } finally {
            // Reset button
            const saveBtn = document.querySelector('#categoryModal .btn-primary');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Category';
            }
        }
    }

    async saveQuickAction() {
        try {
            const formData = this.getQuickActionFormData();
            
            if (!this.validateQuickActionForm(formData)) {
                return;
            }

            // Show loading state
            const saveBtn = document.querySelector('#quickActionModal .btn-primary');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }

            if (this.currentEditingQuickAction) {
                // Update existing quick action
                await googleSheetsAPI.updateQuickAction(this.currentEditingQuickAction.id, formData);
                Utils.showToast('Quick action updated successfully!', 'success');
            } else {
                // Add new quick action
                await googleSheetsAPI.addQuickAction(formData);
                Utils.showToast('Quick action added successfully!', 'success');
            }

            // Refresh data and UI
            await this.loadData();
            this.renderQuickActions();

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('quickActionModal'));
            if (modal) {
                modal.hide();
            }

        } catch (error) {
            console.error('Error saving quick action:', error);
            Utils.showToast('Failed to save quick action', 'danger');
        } finally {
            // Reset button
            const saveBtn = document.querySelector('#quickActionModal .btn-primary');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Quick Action';
            }
        }
    }

    // Helper functions
    getItemFormData() {
        return {
            id: this.currentEditingItem ? this.currentEditingItem.id : Utils.generateId(),
            nameEn: document.getElementById('itemNameEn')?.value || '',
            nameAr: document.getElementById('itemNameAr')?.value || '',
            descriptionEn: document.getElementById('itemDescEn')?.value || '',
            descriptionAr: document.getElementById('itemDescAr')?.value || '',
            categoryId: document.getElementById('itemCategory')?.value || '',
            prepTime: parseInt(document.getElementById('itemPrepTime')?.value) || 0,
            imageUrl: document.getElementById('itemImage')?.dataset.uploadedUrl || '',
            sizes: this.getSizesFromForm(),
            available: true,
            createdAt: this.currentEditingItem ? this.currentEditingItem.createdAt : Utils.getCurrentTimestamp(),
            updatedAt: Utils.getCurrentTimestamp()
        };
    }

    getCategoryFormData() {
        return {
            id: this.currentEditingCategory ? this.currentEditingCategory.id : Utils.generateId(),
            nameEn: document.getElementById('categoryNameEn')?.value || '',
            nameAr: document.getElementById('categoryNameAr')?.value || '',
            icon: document.getElementById('categoryIcon')?.value || 'fas fa-utensils',
            order: parseInt(document.getElementById('categoryOrder')?.value) || 1,
            createdAt: this.currentEditingCategory ? this.currentEditingCategory.createdAt : Utils.getCurrentTimestamp(),
            updatedAt: Utils.getCurrentTimestamp()
        };
    }

    getQuickActionFormData() {
        return {
            id: this.currentEditingQuickAction ? this.currentEditingQuickAction.id : Utils.generateId(),
            nameEn: document.getElementById('quickActionNameEn')?.value || '',
            nameAr: document.getElementById('quickActionNameAr')?.value || '',
            icon: document.getElementById('quickActionIcon')?.value || 'fas fa-hand-paper',
            color: document.getElementById('quickActionColor')?.value || 'primary',
            order: parseInt(document.getElementById('quickActionOrder')?.value) || 1,
            createdAt: this.currentEditingQuickAction ? this.currentEditingQuickAction.createdAt : Utils.getCurrentTimestamp(),
            updatedAt: Utils.getCurrentTimestamp()
        };
    }

    getSizesFromForm() {
        const sizes = [];
        const sizeRows = document.querySelectorAll('.size-row');
        
        sizeRows.forEach(row => {
            const nameInput = row.querySelector('input[name="sizeName"]');
            const priceInput = row.querySelector('input[name="sizePrice"]');
            
            if (nameInput?.value && priceInput?.value) {
                sizes.push({
                    name: nameInput.value,
                    price: parseFloat(priceInput.value)
                });
            }
        });
        
        return sizes;
    }

    addSizeRow() {
        const container = document.getElementById('sizesContainer');
        if (!container) return;

        const newRow = document.createElement('div');
        newRow.className = 'size-row mb-2';
        newRow.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <input type="text" class="form-control" placeholder="Size (e.g., Small)" name="sizeName">
                </div>
                <div class="col-md-4">
                    <input type="number" class="form-control" placeholder="Price" name="sizePrice" step="0.01">
                </div>
                <div class="col-md-4">
                    <button type="button" class="btn btn-outline-danger" onclick="removeSizeRow(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(newRow);
    }

    removeSizeRow(button) {
        const row = button.closest('.size-row');
        if (row) {
            row.remove();
        }
    }

    populateCategorySelect() {
        const select = document.getElementById('itemCategory');
        if (!select) return;

        const optionsHtml = this.categories.map(category => 
            `<option value="${category.id}">${category.nameEn}</option>`
        ).join('');

        select.innerHTML = `
            <option value="">Select Category</option>
            ${optionsHtml}
        `;
    }

    resetItemForm() {
        const form = document.getElementById('itemForm');
        if (form) {
            form.reset();
        }

        // Clear image preview
        const previewContainer = document.querySelector('#itemModal .image-preview-container');
        if (previewContainer) {
            previewContainer.remove();
        }

        // Reset sizes container
        const sizesContainer = document.getElementById('sizesContainer');
        if (sizesContainer) {
            sizesContainer.innerHTML = `
                <div class="size-row mb-2">
                    <div class="row">
                        <div class="col-md-4">
                            <input type="text" class="form-control" placeholder="Size (e.g., Small)" name="sizeName">
                        </div>
                        <div class="col-md-4">
                            <input type="number" class="form-control" placeholder="Price" name="sizePrice" step="0.01">
                        </div>
                        <div class="col-md-4">
                            <button type="button" class="btn btn-outline-danger" onclick="removeSizeRow(this)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    resetCategoryForm() {
        const form = document.getElementById('categoryForm');
        if (form) {
            form.reset();
        }
    }

    resetQuickActionForm() {
        const form = document.getElementById('quickActionForm');
        if (form) {
            form.reset();
        }
    }

    validateItemForm(formData) {
        if (!formData.nameEn.trim()) {
            Utils.showToast('Please enter item name in English', 'warning');
            return false;
        }

        if (!formData.categoryId) {
            Utils.showToast('Please select a category', 'warning');
            return false;
        }

        if (formData.sizes.length === 0) {
            Utils.showToast('Please add at least one size and price', 'warning');
            return false;
        }

        return true;
    }

    validateCategoryForm(formData) {
        if (!formData.nameEn.trim()) {
            Utils.showToast('Please enter category name in English', 'warning');
            return false;
        }

        return true;
    }

    validateQuickActionForm(formData) {
        if (!formData.nameEn.trim()) {
            Utils.showToast('Please enter action name in English', 'warning');
            return false;
        }

        return true;
    }

    // Analytics helper functions
    getOrderStatusCounts() {
        return {
            pending: this.orders.filter(order => order.status === APP_CONFIG.ORDER_STATUSES.PENDING).length,
            preparing: this.orders.filter(order => order.status === APP_CONFIG.ORDER_STATUSES.PREPARING).length,
            ready: this.orders.filter(order => order.status === APP_CONFIG.ORDER_STATUSES.READY).length,
            completed: this.orders.filter(order => order.status === APP_CONFIG.ORDER_STATUSES.COMPLETED).length
        };
    }

    getMostOrderedItems() {
        const itemCounts = {};
        
        this.orders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (itemCounts[item.name]) {
                        itemCounts[item.name] += item.quantity;
                    } else {
                        itemCounts[item.name] = item.quantity;
                    }
                });
            }
        });

        return Object.entries(itemCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    getRevenueTrendData() {
        const dailyRevenue = {};
        
        this.orders.forEach(order => {
            const date = new Date(order.timestamp).toDateString();
            if (dailyRevenue[date]) {
                dailyRevenue[date] += parseFloat(order.total || 0);
            } else {
                dailyRevenue[date] = parseFloat(order.total || 0);
            }
        });

        return Object.entries(dailyRevenue)
            .map(([date, revenue]) => ({ date: new Date(date).toLocaleDateString(), revenue }))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-7); // Last 7 days
    }

    getCategoryPerformanceData() {
        const categoryRevenue = {};
        
        this.orders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    const menuItem = this.menuItems.find(mi => mi.nameEn === item.name);
                    if (menuItem) {
                        const category = this.categories.find(cat => cat.id === menuItem.categoryId);
                        if (category) {
                            const categoryName = category.nameEn;
                            const itemRevenue = parseFloat(item.price) * item.quantity;
                            
                            if (categoryRevenue[categoryName]) {
                                categoryRevenue[categoryName] += itemRevenue;
                            } else {
                                categoryRevenue[categoryName] = itemRevenue;
                            }
                        }
                    }
                });
            }
        });

        return Object.entries(categoryRevenue)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue);
    }

    getStatusBadge(status) {
        const statusMap = {
            [APP_CONFIG.ORDER_STATUSES.PENDING]: 'warning',
            [APP_CONFIG.ORDER_STATUSES.PREPARING]: 'info',
            [APP_CONFIG.ORDER_STATUSES.READY]: 'success',
            [APP_CONFIG.ORDER_STATUSES.COMPLETED]: 'secondary',
            [APP_CONFIG.ORDER_STATUSES.CANCELLED]: 'danger'
        };

        const badgeClass = statusMap[status] || 'secondary';
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);

        return `<span class="badge bg-${badgeClass}">${statusText}</span>`;
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

    async refreshData() {
        try {
            await this.loadData();
            this.loadSectionData(this.currentSection);
            Utils.showToast('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            Utils.showToast('Failed to refresh data', 'danger');
        }
    }

    showError(message) {
        Utils.showToast(message, 'danger');
    }
}

// Global functions for HTML onclick events
window.refreshData = () => {
    if (window.adminDashboard) {
        window.adminDashboard.refreshData();
    }
};

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}

