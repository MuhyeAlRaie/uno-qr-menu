// Admin Manager for UNO Restaurant QR Menu System

class AdminManager {
    constructor() {
        this.categories = [];
        this.menuItems = [];
        this.analytics = {};
        this.currentTab = 'menu-management';
        this.editingItem = null;
        this.cloudinaryWidget = null;
    }

    // Initialize admin panel
    init(categories, menuItems, analytics) {
        this.categories = categories;
        this.menuItems = menuItems;
        this.analytics = analytics;
        
        this.setupCloudinaryWidget();
        this.renderMenuItemsTable();
        this.renderCategoriesList();
        this.renderAnalytics();
        this.setupEventListeners();
        
        console.log('Admin panel initialized');
    }

    // Setup Cloudinary upload widget
    setupCloudinaryWidget() {
        if (window.cloudinary) {
            this.cloudinaryWidget = cloudinary.createUploadWidget({
                cloudName: CONFIG.CLOUDINARY.CLOUD_NAME,
                uploadPreset: CONFIG.CLOUDINARY.UPLOAD_PRESET,
                sources: ['local', 'url', 'camera'],
                multiple: false,
                cropping: true,
                croppingAspectRatio: 1.5,
                folder: 'uno-restaurant/menu-items',
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                maxFileSize: 5000000, // 5MB
                maxImageWidth: 1200,
                maxImageHeight: 800
            }, (error, result) => {
                if (!error && result && result.event === "success") {
                    this.handleImageUpload(result.info);
                }
            });
        }
    }

    // Handle image upload result
    handleImageUpload(imageInfo) {
        const imageUrl = imageInfo.secure_url;
        const imageInput = document.getElementById('itemImage');
        const imagePreview = document.getElementById('imagePreview');
        
        if (imageInput) {
            imageInput.value = imageUrl;
        }
        
        if (imagePreview) {
            imagePreview.innerHTML = `
                <img src="${imageUrl}" alt="Uploaded image" class="img-fluid rounded">
                <button type="button" class="btn btn-sm btn-outline-danger mt-2" onclick="adminManager.clearImage()">
                    <i class="fas fa-trash"></i> Remove Image
                </button>
            `;
        }
        
        app.showSuccess(t('image_uploaded_successfully'));
    }

    // Clear uploaded image
    clearImage() {
        const imageInput = document.getElementById('itemImage');
        const imagePreview = document.getElementById('imagePreview');
        
        if (imageInput) imageInput.value = '';
        if (imagePreview) imagePreview.innerHTML = '';
    }

    // Render menu items table
    renderMenuItemsTable() {
        const container = document.getElementById('menuItemsTable');
        if (!container) return;

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>${t('image')}</th>
                            <th>${t('name')}</th>
                            <th>${t('category')}</th>
                            <th>${t('price')}</th>
                            <th>${t('status')}</th>
                            <th>${t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.menuItems.map(item => this.createMenuItemRow(item)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Create menu item table row
    createMenuItemRow(item) {
        const category = this.categories.find(c => c.id === item.category_id);
        const categoryName = category ? this.getLocalizedText(category, 'name') : 'Unknown';
        const prices = Array.isArray(item.prices) ? item.prices : [item.prices].filter(Boolean);
        const minPrice = Math.min(...prices.map(p => parseFloat(p) || 0));
        
        return `
            <tr>
                <td>
                    <img src="${item.image_url || 'https://via.placeholder.com/60x40'}" 
                         alt="${this.getLocalizedText(item, 'name')}" 
                         class="img-thumbnail" 
                         style="width: 60px; height: 40px; object-fit: cover;">
                </td>
                <td>
                    <div class="fw-bold">${this.getLocalizedText(item, 'name')}</div>
                    <small class="text-muted">${this.getLocalizedText(item, 'description').substring(0, 50)}...</small>
                </td>
                <td>
                    <span class="badge bg-secondary">${categoryName}</span>
                </td>
                <td>
                    <span class="fw-bold text-primary">${this.formatCurrency(minPrice)}</span>
                    ${prices.length > 1 ? `<small class="text-muted d-block">+${prices.length - 1} more</small>` : ''}
                </td>
                <td>
                    <span class="badge ${item.available === 'true' ? 'bg-success' : 'bg-danger'}">
                        ${item.available === 'true' ? t('available') : t('unavailable')}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="adminManager.editMenuItem('${item.id}')" title="${t('edit')}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="adminManager.deleteMenuItem('${item.id}')" title="${t('delete')}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="adminManager.toggleItemAvailability('${item.id}')" title="${t('toggle_availability')}">
                            <i class="fas fa-eye${item.available === 'true' ? '-slash' : ''}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Render categories list
    renderCategoriesList() {
        const container = document.getElementById('categoriesList');
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">${t('categories')}</h6>
                <button class="btn btn-sm btn-primary" onclick="adminManager.showAddCategoryModal()">
                    <i class="fas fa-plus"></i> ${t('add_category')}
                </button>
            </div>
            <div class="categories-list">
                ${this.categories.map(category => this.createCategoryItem(category)).join('')}
            </div>
        `;
    }

    // Create category item
    createCategoryItem(category) {
        const itemCount = this.menuItems.filter(item => item.category_id === category.id).length;
        
        return `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-icon">
                        <i class="${category.icon}"></i>
                    </div>
                    <div class="category-details">
                        <div class="category-name">${this.getLocalizedText(category, 'name')}</div>
                        <small class="text-muted">${itemCount} ${t('items')}</small>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="adminManager.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminManager.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Render analytics
    renderAnalytics() {
        const mostOrderedContainer = document.getElementById('mostOrderedChart');
        const salesContainer = document.getElementById('salesChart');
        
        if (mostOrderedContainer) {
            this.renderMostOrderedChart(mostOrderedContainer);
        }
        
        if (salesContainer) {
            this.renderSalesChart(salesContainer);
        }
    }

    // Render most ordered items chart
    renderMostOrderedChart(container) {
        const data = this.analytics.mostOrderedItems || [];
        
        container.innerHTML = `
            <div class="analytics-summary">
                <div class="row text-center mb-4">
                    <div class="col-md-4">
                        <div class="stat-card">
                            <h3 class="text-primary">${this.analytics.totalOrders || 0}</h3>
                            <p class="text-muted">${t('total_orders')}</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <h3 class="text-success">${this.formatCurrency(this.analytics.totalSales || 0)}</h3>
                            <p class="text-muted">${t('total_sales')}</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <h3 class="text-info">${data.length}</h3>
                            <p class="text-muted">${t('active_items')}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="most-ordered-list">
                <h6 class="mb-3">${t('most_ordered_items')}</h6>
                ${data.length === 0 ? `<p class="text-muted">${t('no_data_available')}</p>` : 
                    data.slice(0, 10).map((item, index) => `
                        <div class="most-ordered-item">
                            <div class="item-rank">#${index + 1}</div>
                            <div class="item-info">
                                <div class="item-name">${item.name}</div>
                                <div class="item-count">${item.count} ${t('orders')}</div>
                            </div>
                            <div class="item-progress">
                                <div class="progress">
                                    <div class="progress-bar bg-primary" style="width: ${(item.count / data[0].count) * 100}%"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    }

    // Render sales chart
    renderSalesChart(container) {
        const salesData = this.analytics.salesByDate || {};
        const dates = Object.keys(salesData).sort();
        
        container.innerHTML = `
            <div class="sales-summary">
                <h6 class="mb-3">${t('sales_by_date')}</h6>
                ${dates.length === 0 ? `<p class="text-muted">${t('no_sales_data')}</p>` :
                    dates.slice(-7).map(date => {
                        const amount = salesData[date];
                        const maxAmount = Math.max(...Object.values(salesData));
                        const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                        
                        return `
                            <div class="sales-item">
                                <div class="sales-date">${new Date(date).toLocaleDateString()}</div>
                                <div class="sales-amount">${this.formatCurrency(amount)}</div>
                                <div class="sales-bar">
                                    <div class="progress">
                                        <div class="progress-bar bg-success" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')
                }
            </div>
        `;
    }

    // Show add item modal
    showAddItemModal() {
        this.editingItem = null;
        this.showItemModal();
    }

    // Show edit item modal
    editMenuItem(itemId) {
        this.editingItem = this.menuItems.find(item => item.id === itemId);
        this.showItemModal();
    }

    // Show item modal (add/edit)
    showItemModal() {
        const isEditing = !!this.editingItem;
        const item = this.editingItem || {};
        
        const modalHTML = `
            <div class="modal fade" id="itemModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${isEditing ? t('edit_item') : t('add_item')}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="itemForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">${t('name_en')}</label>
                                            <input type="text" class="form-control" id="itemNameEn" value="${item.name_en || ''}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">${t('name_ar')}</label>
                                            <input type="text" class="form-control" id="itemNameAr" value="${item.name_ar || ''}" required>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">${t('description_en')}</label>
                                            <textarea class="form-control" id="itemDescEn" rows="3">${item.description_en || ''}</textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">${t('description_ar')}</label>
                                            <textarea class="form-control" id="itemDescAr" rows="3">${item.description_ar || ''}</textarea>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">${t('category')}</label>
                                            <select class="form-select" id="itemCategory" required>
                                                <option value="">${t('select_category')}</option>
                                                ${this.categories.map(cat => `
                                                    <option value="${cat.id}" ${cat.id === item.category_id ? 'selected' : ''}>
                                                        ${this.getLocalizedText(cat, 'name')}
                                                    </option>
                                                `).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">${t('prep_time')} (${t('minutes')})</label>
                                            <input type="number" class="form-control" id="itemPrepTime" value="${item.prep_time || 15}" min="1" max="120">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">${t('image')}</label>
                                    <div class="input-group">
                                        <input type="url" class="form-control" id="itemImage" value="${item.image_url || ''}" placeholder="${t('image_url')}">
                                        <button type="button" class="btn btn-outline-secondary" onclick="adminManager.openImageUpload()">
                                            <i class="fas fa-upload"></i> ${t('upload')}
                                        </button>
                                    </div>
                                    <div id="imagePreview" class="mt-2">
                                        ${item.image_url ? `<img src="${item.image_url}" alt="Preview" class="img-fluid rounded" style="max-height: 200px;">` : ''}
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">${t('sizes_and_prices')}</label>
                                    <div id="sizesContainer">
                                        ${this.renderSizesInputs(item)}
                                    </div>
                                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="adminManager.addSizeInput()">
                                        <i class="fas fa-plus"></i> ${t('add_size')}
                                    </button>
                                </div>
                                
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input" id="itemAvailable" ${item.available !== 'false' ? 'checked' : ''}>
                                        <label class="form-check-label" for="itemAvailable">${t('available')}</label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${t('cancel')}</button>
                            <button type="button" class="btn btn-primary" onclick="adminManager.saveMenuItem()">${t('save')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal
        const existingModal = document.getElementById('itemModal');
        if (existingModal) existingModal.remove();
        
        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('itemModal'));
        modal.show();
    }

    // Render sizes inputs
    renderSizesInputs(item) {
        const sizes = Array.isArray(item.sizes) ? item.sizes : (item.sizes ? [item.sizes] : ['Regular']);
        const prices = Array.isArray(item.prices) ? item.prices : (item.prices ? [item.prices] : [0]);
        
        return sizes.map((size, index) => `
            <div class="size-input-group mb-2">
                <div class="row">
                    <div class="col-md-5">
                        <input type="text" class="form-control size-input" placeholder="${t('size_name')}" value="${size}">
                    </div>
                    <div class="col-md-5">
                        <input type="number" class="form-control price-input" placeholder="${t('price')}" value="${prices[index] || 0}" step="0.01" min="0">
                    </div>
                    <div class="col-md-2">
                        <button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="this.parentElement.parentElement.parentElement.remove()">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Add size input
    addSizeInput() {
        const container = document.getElementById('sizesContainer');
        const newInput = document.createElement('div');
        newInput.innerHTML = `
            <div class="size-input-group mb-2">
                <div class="row">
                    <div class="col-md-5">
                        <input type="text" class="form-control size-input" placeholder="${t('size_name')}">
                    </div>
                    <div class="col-md-5">
                        <input type="number" class="form-control price-input" placeholder="${t('price')}" step="0.01" min="0">
                    </div>
                    <div class="col-md-2">
                        <button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="this.parentElement.parentElement.parentElement.remove()">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(newInput.firstElementChild);
    }

    // Open image upload widget
    openImageUpload() {
        if (this.cloudinaryWidget) {
            this.cloudinaryWidget.open();
        } else {
            app.showError(t('image_upload_not_available'));
        }
    }

    // Save menu item
    async saveMenuItem() {
        const form = document.getElementById('itemForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        try {
            // Collect form data
            const itemData = {
                name_en: document.getElementById('itemNameEn').value,
                name_ar: document.getElementById('itemNameAr').value,
                description_en: document.getElementById('itemDescEn').value,
                description_ar: document.getElementById('itemDescAr').value,
                category_id: document.getElementById('itemCategory').value,
                image_url: document.getElementById('itemImage').value,
                prep_time: document.getElementById('itemPrepTime').value,
                available: document.getElementById('itemAvailable').checked.toString()
            };
            
            // Collect sizes and prices
            const sizeInputs = document.querySelectorAll('.size-input');
            const priceInputs = document.querySelectorAll('.price-input');
            
            const sizes = Array.from(sizeInputs).map(input => input.value).filter(Boolean);
            const prices = Array.from(priceInputs).map(input => parseFloat(input.value) || 0);
            
            if (sizes.length === 0) {
                app.showError(t('at_least_one_size_required'));
                return;
            }
            
            itemData.sizes = sizes;
            itemData.prices = prices;
            
            app.showNotification(t('saving_item'), 'info');
            
            let result;
            if (this.editingItem) {
                result = await googleSheetsAPI.updateMenuItem(this.editingItem.id, itemData);
            } else {
                result = await googleSheetsAPI.addMenuItem(itemData);
            }
            
            if (result) {
                app.showSuccess(t('item_saved_successfully'));
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('itemModal'));
                modal.hide();
                
                // Refresh data
                await this.refreshData();
                
                // Log action
                app.logEvent(this.editingItem ? 'item_updated' : 'item_added', {
                    itemId: this.editingItem?.id || 'new',
                    itemName: itemData.name_en
                });
                
            } else {
                app.showError(t('failed_to_save_item'));
            }
            
        } catch (error) {
            console.error('Error saving item:', error);
            app.showError(t('failed_to_save_item'));
        }
    }

    // Delete menu item
    async deleteMenuItem(itemId) {
        if (!confirm(t('confirm_delete_item'))) return;
        
        try {
            app.showNotification(t('deleting_item'), 'info');
            
            const result = await googleSheetsAPI.deleteMenuItem(itemId);
            
            if (result) {
                app.showSuccess(t('item_deleted_successfully'));
                await this.refreshData();
                
                // Log action
                app.logEvent('item_deleted', { itemId });
                
            } else {
                app.showError(t('failed_to_delete_item'));
            }
            
        } catch (error) {
            console.error('Error deleting item:', error);
            app.showError(t('failed_to_delete_item'));
        }
    }

    // Toggle item availability
    async toggleItemAvailability(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;
        
        const newAvailability = item.available === 'true' ? 'false' : 'true';
        
        try {
            const result = await googleSheetsAPI.updateMenuItem(itemId, { available: newAvailability });
            
            if (result) {
                item.available = newAvailability;
                this.renderMenuItemsTable();
                app.showSuccess(t('item_availability_updated'));
                
                // Log action
                app.logEvent('item_availability_toggled', {
                    itemId,
                    newAvailability
                });
                
            } else {
                app.showError(t('failed_to_update_availability'));
            }
            
        } catch (error) {
            console.error('Error updating availability:', error);
            app.showError(t('failed_to_update_availability'));
        }
    }

    // Show admin tab
    showAdminTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${tabId}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });
        
        const activeTab = document.getElementById(tabId);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.display = 'block';
        }
        
        this.currentTab = tabId;
        
        // Refresh analytics if switching to analytics tab
        if (tabId === 'analytics') {
            this.refreshAnalytics();
        }
    }

    // Refresh all data
    async refreshData() {
        try {
            const [categories, menuItems, analytics] = await Promise.all([
                googleSheetsAPI.getCategories(),
                googleSheetsAPI.getMenuItems(),
                googleSheetsAPI.getAnalytics()
            ]);
            
            this.categories = categories;
            this.menuItems = menuItems;
            this.analytics = analytics;
            
            this.renderMenuItemsTable();
            this.renderCategoriesList();
            this.renderAnalytics();
            
        } catch (error) {
            console.error('Error refreshing data:', error);
            app.showError(t('failed_to_refresh_data'));
        }
    }

    // Refresh analytics
    async refreshAnalytics() {
        try {
            this.analytics = await googleSheetsAPI.getAnalytics();
            this.renderAnalytics();
        } catch (error) {
            console.error('Error refreshing analytics:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-bs-toggle="tab"]')) {
                const targetId = e.target.getAttribute('data-bs-target').substring(1);
                this.showAdminTab(targetId);
            }
        });
        
        // Auto-refresh analytics every 30 seconds
        setInterval(() => {
            if (this.currentTab === 'analytics') {
                this.refreshAnalytics();
            }
        }, 30000);
    }

    // Get localized text
    getLocalizedText(item, field) {
        const lang = localStorage.getItem('language') || 'en';
        return item[`${field}_${lang}`] || item[`${field}_en`] || item[field] || '';
    }

    // Format currency
    formatCurrency(amount) {
        return app.formatCurrency(amount);
    }
}

// Global functions for admin panel
window.showAdminTab = function(tabId) {
    if (window.adminManager) {
        window.adminManager.showAdminTab(tabId);
    }
};

window.showAddItemModal = function() {
    if (window.adminManager) {
        window.adminManager.showAddItemModal();
    }
};

// Create global admin manager instance
window.AdminManager = AdminManager;
window.adminManager = new AdminManager();

