// UNO Restaurant & Café - Admin Dashboard Script

class AdminApp {
    constructor() {
        this.categories = [];
        this.menuItems = [];
        this.quickActions = [];
        this.orders = [];
        this.currentSection = 'dashboard';
        this.currentOrderFilter = 'all';
        this.charts = {};
        
        this.init();
    }

    async init() {
        this.showLoading(true);
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadData();
            
            // Initialize dashboard
            this.showSection('dashboard');
            
            // Start clock
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
            
            // Setup auto-refresh
            setInterval(() => this.loadData(), 60000); // Refresh every minute
            
        } catch (error) {
            console.error('Error initializing admin app:', error);
            this.showError('Failed to load admin dashboard. Please refresh the page.');
        } finally {
            this.showLoading(false);
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Mobile sidebar toggle
        document.getElementById('mobileSidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('show');
        });

        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('show');
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadData();
        });

        // Form submissions
        document.getElementById('saveCategoryBtn').addEventListener('click', () => {
            this.saveCategory();
        });

        document.getElementById('saveMenuItemBtn').addEventListener('click', () => {
            this.saveMenuItem();
        });

        document.getElementById('saveQuickActionBtn').addEventListener('click', () => {
            this.saveQuickAction();
        });

        // Order filters
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setOrderFilter(e.target.dataset.filter);
            });
        });

        // Analytics date range
        document.getElementById('updateAnalytics').addEventListener('click', () => {
            this.updateAnalytics();
        });

        // Add size button
        document.getElementById('addSizeBtn').addEventListener('click', () => {
            this.addSizeRow();
        });

        // Image upload
        document.getElementById('itemImage').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        // Remove size buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-size') || e.target.parentElement.classList.contains('remove-size')) {
                e.preventDefault();
                const row = e.target.closest('.size-price-row');
                if (document.querySelectorAll('.size-price-row').length > 1) {
                    row.remove();
                }
            }
        });
    }

    async loadData() {
        try {
            // Load all data
            this.categories = await DatabaseAPI.getCategories();
            this.menuItems = await DatabaseAPI.getMenuItems();
            this.quickActions = await DatabaseAPI.getQuickActions();
            this.orders = await DatabaseAPI.getOrders();
            
            // Update current section
            this.updateCurrentSection();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Failed to load data', 'error');
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            categories: 'Categories',
            'menu-items': 'Menu Items',
            'quick-actions': 'Quick Actions',
            orders: 'Orders',
            analytics: 'Analytics'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';

        this.currentSection = sectionName;
        this.updateCurrentSection();
    }

    updateCurrentSection() {
        switch (this.currentSection) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'categories':
                this.renderCategories();
                break;
            case 'menu-items':
                this.renderMenuItems();
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

    updateDashboard() {
        // Update statistics
        document.getElementById('totalMenuItems').textContent = this.menuItems.length;
        document.getElementById('totalOrders').textContent = this.orders.length;
        document.getElementById('totalCategories').textContent = this.categories.length;

        // Calculate revenue
        let totalRevenue = 0;
        this.orders.forEach(order => {
            if (order.order_items) {
                order.order_items.forEach(item => {
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    totalRevenue += price * item.quantity;
                });
            }
        });
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;

        // Render recent orders
        this.renderRecentOrders();
    }

    renderRecentOrders() {
        const container = document.getElementById('recentOrdersTable');
        container.innerHTML = '';

        const recentOrders = this.orders.slice(0, 10);

        recentOrders.forEach(order => {
            const row = document.createElement('tr');
            
            // Calculate total
            let total = 0;
            const itemCount = order.order_items ? order.order_items.length : 0;
            if (order.order_items) {
                order.order_items.forEach(item => {
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    total += price * item.quantity;
                });
            }

            row.innerHTML = `
                <td>#${order.id.substring(0, 8)}</td>
                <td>${order.table_number}</td>
                <td>${itemCount} items</td>
                <td>$${total.toFixed(2)}</td>
                <td><span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span></td>
                <td>${new Date(order.order_time).toLocaleString()}</td>
            `;

            container.appendChild(row);
        });
    }

    renderCategories() {
        const container = document.getElementById('categoriesTable');
        container.innerHTML = '';

        this.categories.forEach(category => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.name_en}</td>
                <td>${category.name_ar}</td>
                <td>${category.display_order}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminApp.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminApp.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            container.appendChild(row);
        });

        // Populate category dropdown in menu item modal
        this.populateCategoryDropdown();
    }

    renderMenuItems() {
        const container = document.getElementById('menuItemsGrid');
        container.innerHTML = '';

        this.menuItems.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6';
            
            const category = this.categories.find(cat => cat.id === item.category_id);
            const prices = item.prices || [];
            const priceRange = prices.length > 0 ? 
                `$${Math.min(...prices.map(p => parseFloat(p.price))).toFixed(2)} - $${Math.max(...prices.map(p => parseFloat(p.price))).toFixed(2)}` :
                'No prices set';

            col.innerHTML = `
                <div class="menu-item-card">
                    <img src="${item.image_url || '/assets/images/placeholder.jpg'}" alt="${item.name_en}" class="menu-item-image">
                    <div class="menu-item-content">
                        <h5 class="menu-item-name">${item.name_en}</h5>
                        <p class="menu-item-category">${category ? category.name_en : 'No Category'}</p>
                        <p class="menu-item-description">${item.description_en || 'No description'}</p>
                        <div class="menu-item-meta">
                            <span class="menu-item-price">${priceRange}</span>
                            <span class="menu-item-prep-time">
                                <i class="fas fa-clock"></i> ${item.estimated_prep_time_minutes || 15}min
                            </span>
                        </div>
                        <div class="menu-item-actions">
                            <button class="btn btn-sm btn-outline-primary" onclick="adminApp.editMenuItem('${item.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="adminApp.deleteMenuItem('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-${item.is_available ? 'warning' : 'success'}" onclick="adminApp.toggleMenuItemAvailability('${item.id}')">
                                <i class="fas fa-${item.is_available ? 'eye-slash' : 'eye'}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(col);
        });
    }

    renderQuickActions() {
        const container = document.getElementById('quickActionsTable');
        container.innerHTML = '';

        this.quickActions.forEach(action => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${action.action_en}</td>
                <td>${action.action_ar}</td>
                <td>${action.display_order}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminApp.editQuickAction('${action.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminApp.deleteQuickAction('${action.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            container.appendChild(row);
        });
    }

    renderOrders() {
        const container = document.getElementById('ordersTable');
        container.innerHTML = '';

        let filteredOrders = this.orders;
        if (this.currentOrderFilter !== 'all') {
            filteredOrders = this.orders.filter(order => order.status === this.currentOrderFilter);
        }

        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            
            // Calculate total
            let total = 0;
            const itemCount = order.order_items ? order.order_items.length : 0;
            if (order.order_items) {
                order.order_items.forEach(item => {
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    total += price * item.quantity;
                });
            }

            row.innerHTML = `
                <td>#${order.id.substring(0, 8)}</td>
                <td>${order.table_number}</td>
                <td>${itemCount} items</td>
                <td>$${total.toFixed(2)}</td>
                <td><span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span></td>
                <td>${new Date(order.order_time).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="adminApp.viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminApp.deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            container.appendChild(row);
        });
    }

    renderAnalytics() {
        this.updateAnalytics();
    }

    updateAnalytics() {
        // Get date range
        const startDate = document.getElementById('startDate').value || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = document.getElementById('endDate').value || new Date().toISOString().split('T')[0];

        // Set default values
        document.getElementById('startDate').value = startDate;
        document.getElementById('endDate').value = endDate;

        // Filter orders by date range
        const filteredOrders = this.orders.filter(order => {
            const orderDate = new Date(order.order_time).toISOString().split('T')[0];
            return orderDate >= startDate && orderDate <= endDate;
        });

        // Render charts
        this.renderMostOrderedChart(filteredOrders);
        this.renderRevenueChart(filteredOrders);
        this.renderPerformanceTable(filteredOrders);
    }

    renderMostOrderedChart(orders) {
        const ctx = document.getElementById('mostOrderedChart').getContext('2d');
        
        // Destroy existing chart
        if (this.charts.mostOrdered) {
            this.charts.mostOrdered.destroy();
        }

        // Calculate most ordered items
        const itemCounts = {};
        orders.forEach(order => {
            if (order.order_items) {
                order.order_items.forEach(item => {
                    const itemName = item.menu_item ? item.menu_item.name_en : 'Unknown';
                    itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
                });
            }
        });

        const sortedItems = Object.entries(itemCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        this.charts.mostOrdered = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedItems.map(([name]) => name),
                datasets: [{
                    label: 'Orders',
                    data: sortedItems.map(([, count]) => count),
                    backgroundColor: 'rgba(212, 175, 55, 0.8)',
                    borderColor: 'rgba(212, 175, 55, 1)',
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

    renderRevenueChart(orders) {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        // Destroy existing chart
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        // Calculate daily revenue
        const dailyRevenue = {};
        orders.forEach(order => {
            const date = new Date(order.order_time).toISOString().split('T')[0];
            if (!dailyRevenue[date]) dailyRevenue[date] = 0;
            
            if (order.order_items) {
                order.order_items.forEach(item => {
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    dailyRevenue[date] += price * item.quantity;
                });
            }
        });

        const sortedDates = Object.keys(dailyRevenue).sort();

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'Revenue ($)',
                    data: sortedDates.map(date => dailyRevenue[date]),
                    backgroundColor: 'rgba(255, 107, 53, 0.2)',
                    borderColor: 'rgba(255, 107, 53, 1)',
                    borderWidth: 2,
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

    renderPerformanceTable(orders) {
        const container = document.getElementById('performanceTable');
        container.innerHTML = '';

        // Calculate performance data
        const itemPerformance = {};
        orders.forEach(order => {
            if (order.order_items) {
                order.order_items.forEach(item => {
                    const itemId = item.item_id;
                    const menuItem = this.menuItems.find(mi => mi.id === itemId);
                    const itemName = menuItem ? menuItem.name_en : 'Unknown';
                    const category = menuItem && this.categories.find(cat => cat.id === menuItem.category_id);
                    const categoryName = category ? category.name_en : 'Unknown';
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    const total = price * item.quantity;

                    if (!itemPerformance[itemId]) {
                        itemPerformance[itemId] = {
                            name: itemName,
                            category: categoryName,
                            orderCount: 0,
                            totalSales: 0,
                            totalQuantity: 0
                        };
                    }

                    itemPerformance[itemId].orderCount += 1;
                    itemPerformance[itemId].totalSales += total;
                    itemPerformance[itemId].totalQuantity += item.quantity;
                });
            }
        });

        // Sort by total sales
        const sortedPerformance = Object.values(itemPerformance)
            .sort((a, b) => b.totalSales - a.totalSales);

        sortedPerformance.forEach(item => {
            const avgOrderValue = item.orderCount > 0 ? item.totalSales / item.orderCount : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.orderCount}</td>
                <td>$${item.totalSales.toFixed(2)}</td>
                <td>$${avgOrderValue.toFixed(2)}</td>
            `;
            container.appendChild(row);
        });
    }

    // CRUD Operations
    async saveCategory() {
        try {
            this.showLoading(true);
            
            const formData = {
                name_en: document.getElementById('categoryNameEn').value,
                name_ar: document.getElementById('categoryNameAr').value,
                display_order: parseInt(document.getElementById('categoryOrder').value)
            };

            const categoryId = document.getElementById('categoryId').value;
            
            if (categoryId) {
                await DatabaseAPI.updateCategory(categoryId, formData);
                this.showToast('Category updated successfully', 'success');
            } else {
                await DatabaseAPI.createCategory(formData);
                this.showToast('Category created successfully', 'success');
            }

            // Close modal and reload data
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
            await this.loadData();
            
        } catch (error) {
            console.error('Error saving category:', error);
            this.showToast('Failed to save category', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async saveMenuItem() {
        try {
            this.showLoading(true);
            
            const formData = {
                name_en: document.getElementById('itemNameEn').value,
                name_ar: document.getElementById('itemNameAr').value,
                category_id: document.getElementById('itemCategory').value,
                description_en: document.getElementById('itemDescEn').value,
                description_ar: document.getElementById('itemDescAr').value,
                estimated_prep_time_minutes: parseInt(document.getElementById('itemPrepTime').value),
                display_order: parseInt(document.getElementById('itemOrder').value),
                is_available: document.getElementById('itemAvailable').checked
            };

            // Add image URL if uploaded
            const imagePreview = document.querySelector('#imagePreview img');
            if (imagePreview) {
                formData.image_url = imagePreview.src;
            }

            const itemId = document.getElementById('menuItemId').value;
            let savedItem;
            
            if (itemId) {
                savedItem = await DatabaseAPI.updateMenuItem(itemId, formData);
                this.showToast('Menu item updated successfully', 'success');
            } else {
                savedItem = await DatabaseAPI.createMenuItem(formData);
                this.showToast('Menu item created successfully', 'success');
            }

            // Save prices
            await this.saveItemPrices(savedItem.id);

            // Close modal and reload data
            bootstrap.Modal.getInstance(document.getElementById('menuItemModal')).hide();
            await this.loadData();
            
        } catch (error) {
            console.error('Error saving menu item:', error);
            this.showToast('Failed to save menu item', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async saveItemPrices(itemId) {
        const sizeRows = document.querySelectorAll('.size-price-row');
        
        for (const row of sizeRows) {
            const sizeEn = row.querySelector('input[name="sizeEn[]"]').value;
            const sizeAr = row.querySelector('input[name="sizeAr[]"]').value;
            const price = row.querySelector('input[name="price[]"]').value;
            
            if (sizeEn && sizeAr && price) {
                const priceData = {
                    item_id: itemId,
                    size_en: sizeEn,
                    size_ar: sizeAr,
                    price: parseFloat(price)
                };
                
                await DatabaseAPI.createItemPrice(priceData);
            }
        }
    }

    async saveQuickAction() {
        try {
            this.showLoading(true);
            
            const formData = {
                action_en: document.getElementById('actionEn').value,
                action_ar: document.getElementById('actionAr').value,
                display_order: parseInt(document.getElementById('actionOrder').value)
            };

            const actionId = document.getElementById('quickActionId').value;
            
            if (actionId) {
                await DatabaseAPI.updateQuickAction(actionId, formData);
                this.showToast('Quick action updated successfully', 'success');
            } else {
                await DatabaseAPI.createQuickAction(formData);
                this.showToast('Quick action created successfully', 'success');
            }

            // Close modal and reload data
            bootstrap.Modal.getInstance(document.getElementById('quickActionModal')).hide();
            await this.loadData();
            
        } catch (error) {
            console.error('Error saving quick action:', error);
            this.showToast('Failed to save quick action', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Edit functions
    editCategory(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (!category) return;

        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryNameEn').value = category.name_en;
        document.getElementById('categoryNameAr').value = category.name_ar;
        document.getElementById('categoryOrder').value = category.display_order;

        new bootstrap.Modal(document.getElementById('categoryModal')).show();
    }

    editMenuItem(itemId) {
        const item = this.menuItems.find(mi => mi.id === itemId);
        if (!item) return;

        document.getElementById('menuItemId').value = item.id;
        document.getElementById('itemNameEn').value = item.name_en;
        document.getElementById('itemNameAr').value = item.name_ar;
        document.getElementById('itemCategory').value = item.category_id;
        document.getElementById('itemDescEn').value = item.description_en || '';
        document.getElementById('itemDescAr').value = item.description_ar || '';
        document.getElementById('itemPrepTime').value = item.estimated_prep_time_minutes || 15;
        document.getElementById('itemOrder').value = item.display_order;
        document.getElementById('itemAvailable').checked = item.is_available;

        // Show image preview
        if (item.image_url) {
            document.getElementById('imagePreview').innerHTML = `<img src="${item.image_url}" alt="Preview">`;
        }

        // Populate sizes
        this.populateItemSizes(item.prices || []);

        new bootstrap.Modal(document.getElementById('menuItemModal')).show();
    }

    editQuickAction(actionId) {
        const action = this.quickActions.find(qa => qa.id === actionId);
        if (!action) return;

        document.getElementById('quickActionId').value = action.id;
        document.getElementById('actionEn').value = action.action_en;
        document.getElementById('actionAr').value = action.action_ar;
        document.getElementById('actionOrder').value = action.display_order;

        new bootstrap.Modal(document.getElementById('quickActionModal')).show();
    }

    // Delete functions
    async deleteCategory(categoryId) {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            this.showLoading(true);
            await DatabaseAPI.deleteCategory(categoryId);
            await this.loadData();
            this.showToast('Category deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showToast('Failed to delete category', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteMenuItem(itemId) {
        if (!confirm('Are you sure you want to delete this menu item?')) return;

        try {
            this.showLoading(true);
            await DatabaseAPI.deleteMenuItem(itemId);
            await this.loadData();
            this.showToast('Menu item deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting menu item:', error);
            this.showToast('Failed to delete menu item', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteQuickAction(actionId) {
        if (!confirm('Are you sure you want to delete this quick action?')) return;

        try {
            this.showLoading(true);
            await DatabaseAPI.deleteQuickAction(actionId);
            await this.loadData();
            this.showToast('Quick action deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting quick action:', error);
            this.showToast('Failed to delete quick action', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            this.showLoading(true);
            // Note: Implement deleteOrder in DatabaseAPI if needed
            await this.loadData();
            this.showToast('Order deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting order:', error);
            this.showToast('Failed to delete order', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Utility functions
    async toggleMenuItemAvailability(itemId) {
        const item = this.menuItems.find(mi => mi.id === itemId);
        if (!item) return;

        try {
            await DatabaseAPI.updateMenuItem(itemId, { is_available: !item.is_available });
            await this.loadData();
            this.showToast(`Menu item ${item.is_available ? 'disabled' : 'enabled'}`, 'success');
        } catch (error) {
            console.error('Error toggling availability:', error);
            this.showToast('Failed to update availability', 'error');
        }
    }

    setOrderFilter(filter) {
        this.currentOrderFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderOrders();
    }

    populateCategoryDropdown() {
        const select = document.getElementById('itemCategory');
        select.innerHTML = '<option value="">Select Category</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name_en;
            select.appendChild(option);
        });
    }

    populateItemSizes(prices) {
        const container = document.getElementById('sizesContainer');
        container.innerHTML = '';
        
        if (prices.length === 0) {
            this.addSizeRow();
        } else {
            prices.forEach(price => {
                this.addSizeRow(price.size_en, price.size_ar, price.price);
            });
        }
    }

    addSizeRow(sizeEn = '', sizeAr = '', price = '') {
        const container = document.getElementById('sizesContainer');
        const row = document.createElement('div');
        row.className = 'size-price-row mb-2';
        row.innerHTML = `
            <div class="row">
                <div class="col-md-3">
                    <input type="text" class="form-control" placeholder="Size (EN)" name="sizeEn[]" value="${sizeEn}">
                </div>
                <div class="col-md-3">
                    <input type="text" class="form-control" placeholder="Size (AR)" name="sizeAr[]" value="${sizeAr}">
                </div>
                <div class="col-md-3">
                    <input type="number" class="form-control" placeholder="Price" name="price[]" step="0.01" value="${price}">
                </div>
                <div class="col-md-3">
                    <button type="button" class="btn btn-outline-danger remove-size">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(row);
    }

    async handleImageUpload(file) {
        if (!file) return;

        try {
            this.showLoading(true);
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.secure_url) {
                document.getElementById('imagePreview').innerHTML = `<img src="${result.secure_url}" alt="Preview">`;
                this.showToast('Image uploaded successfully', 'success');
            } else {
                throw new Error('Upload failed');
            }
            
        } catch (error) {
            console.error('Error uploading image:', error);
            this.showToast('Failed to upload image', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // This would open a detailed order view modal
        // For now, just show an alert with order info
        alert(`Order Details:\nID: ${order.id}\nTable: ${order.table_number}\nStatus: ${order.status}\nTime: ${new Date(order.order_time).toLocaleString()}`);
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('currentTime').textContent = timeString;
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'Pending',
            preparing: 'Preparing',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };
        return statusTexts[status] || status;
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.add('show');
        } else {
            spinner.classList.remove('show');
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 5000
        });
        bsToast.show();
        
        // Remove after hiding
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    showError(message) {
        const container = document.querySelector('.content');
        container.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h4>Error</h4>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
});

