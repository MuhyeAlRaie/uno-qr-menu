// Cashier Manager for UNO Restaurant QR Menu System

class CashierManager {
    constructor() {
        this.orders = [];
        this.selectedOrder = null;
        this.refreshInterval = null;
        this.lastOrderCount = 0;
        this.soundEnabled = CONFIG.APP.SOUND_ALERTS;
    }

    // Initialize cashier dashboard
    init(orders = []) {
        this.orders = orders;
        this.renderOrders();
        this.updateStats();
        this.setupEventListeners();
        this.startAutoRefresh();
        
        // Play startup sound
        if (this.soundEnabled) {
            this.playNotificationSound();
        }
        
        console.log('Cashier dashboard initialized');
    }

    // Render orders list
    renderOrders() {
        const container = document.getElementById('ordersContainer');
        if (!container) return;

        // Group orders by status
        const groupedOrders = this.groupOrdersByStatus();
        
        container.innerHTML = `
            <div class="orders-tabs">
                <ul class="nav nav-tabs" id="ordersTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="pending-tab" data-bs-toggle="tab" data-bs-target="#pending-orders" type="button" role="tab">
                            ${t('pending_orders')} <span class="badge bg-warning ms-1">${groupedOrders.pending.length}</span>
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="preparing-tab" data-bs-toggle="tab" data-bs-target="#preparing-orders" type="button" role="tab">
                            ${t('preparing')} <span class="badge bg-info ms-1">${groupedOrders.preparing.length}</span>
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="ready-tab" data-bs-toggle="tab" data-bs-target="#ready-orders" type="button" role="tab">
                            ${t('ready')} <span class="badge bg-success ms-1">${groupedOrders.ready.length}</span>
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="completed-tab" data-bs-toggle="tab" data-bs-target="#completed-orders" type="button" role="tab">
                            ${t('completed')} <span class="badge bg-secondary ms-1">${groupedOrders.served.length}</span>
                        </button>
                    </li>
                </ul>
                <div class="tab-content" id="ordersTabContent">
                    <div class="tab-pane fade show active" id="pending-orders" role="tabpanel">
                        ${this.renderOrdersList(groupedOrders.pending)}
                    </div>
                    <div class="tab-pane fade" id="preparing-orders" role="tabpanel">
                        ${this.renderOrdersList(groupedOrders.preparing)}
                    </div>
                    <div class="tab-pane fade" id="ready-orders" role="tabpanel">
                        ${this.renderOrdersList(groupedOrders.ready)}
                    </div>
                    <div class="tab-pane fade" id="completed-orders" role="tabpanel">
                        ${this.renderOrdersList(groupedOrders.served)}
                    </div>
                </div>
            </div>
        `;
    }

    // Render orders list for a specific status
    renderOrdersList(orders) {
        if (orders.length === 0) {
            return `<div class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>${t('no_orders_found')}</p>
            </div>`;
        }

        return orders.map(order => this.createOrderCard(order)).join('');
    }

    // Create order card HTML
    createOrderCard(order) {
        const isSelected = this.selectedOrder && this.selectedOrder.id === order.id;
        const orderTime = this.formatOrderTime(order.created_at);
        const timeAgo = this.getTimeAgo(order.created_at);
        
        return `
            <div class="order-card ${isSelected ? 'selected' : ''}" onclick="cashierManager.selectOrder('${order.id}')">
                <div class="order-header">
                    <div class="order-info">
                        <h6 class="order-id mb-1">${order.id}</h6>
                        <div class="order-meta">
                            <span class="table-number">
                                <i class="fas fa-table"></i>
                                ${t('table')} ${order.table_number}
                            </span>
                            <span class="order-time">
                                <i class="fas fa-clock"></i>
                                ${timeAgo}
                            </span>
                        </div>
                    </div>
                    <div class="order-actions">
                        <span class="order-status ${order.status}">${t(order.status)}</span>
                        <div class="order-total">${this.formatCurrency(order.total_amount)}</div>
                    </div>
                </div>
                <div class="order-body">
                    ${order.type === 'quick_action' ? this.renderQuickAction(order) : this.renderOrderItems(order)}
                </div>
                <div class="order-footer">
                    ${this.renderOrderActions(order)}
                </div>
            </div>
        `;
    }

    // Render quick action
    renderQuickAction(order) {
        return `
            <div class="quick-action-order">
                <i class="fas fa-bolt text-warning"></i>
                <span class="ms-2">${order.customer_notes || t('quick_action')}</span>
            </div>
        `;
    }

    // Render order items
    renderOrderItems(order) {
        if (!order.items || order.items.length === 0) {
            return '<p class="text-muted">No items</p>';
        }

        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        
        return `
            <div class="order-items">
                ${items.map(item => `
                    <div class="order-item">
                        <span class="item-quantity">${item.quantity}x</span>
                        <span class="item-name">${item.name}</span>
                        ${item.size && item.size !== 'Regular' ? `<span class="item-size">(${item.size})</span>` : ''}
                        <span class="item-price ms-auto">${this.formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Render order actions based on status
    renderOrderActions(order) {
        const actions = [];
        
        switch (order.status) {
            case CONFIG.ORDER_STATUS.PENDING:
                actions.push(`
                    <button class="btn btn-primary btn-sm" onclick="cashierManager.updateOrderStatus('${order.id}', '${CONFIG.ORDER_STATUS.PREPARING}')">
                        <i class="fas fa-play"></i> ${t('start_preparing')}
                    </button>
                `);
                actions.push(`
                    <button class="btn btn-danger btn-sm" onclick="cashierManager.updateOrderStatus('${order.id}', '${CONFIG.ORDER_STATUS.CANCELLED}')">
                        <i class="fas fa-times"></i> ${t('cancel')}
                    </button>
                `);
                break;
                
            case CONFIG.ORDER_STATUS.PREPARING:
                actions.push(`
                    <button class="btn btn-success btn-sm" onclick="cashierManager.updateOrderStatus('${order.id}', '${CONFIG.ORDER_STATUS.READY}')">
                        <i class="fas fa-check"></i> ${t('mark_ready')}
                    </button>
                `);
                break;
                
            case CONFIG.ORDER_STATUS.READY:
                actions.push(`
                    <button class="btn btn-info btn-sm" onclick="cashierManager.updateOrderStatus('${order.id}', '${CONFIG.ORDER_STATUS.SERVED}')">
                        <i class="fas fa-utensils"></i> ${t('mark_served')}
                    </button>
                `);
                break;
        }
        
        return `<div class="order-actions-buttons">${actions.join('')}</div>`;
    }

    // Group orders by status
    groupOrdersByStatus() {
        const groups = {
            pending: [],
            preparing: [],
            ready: [],
            served: [],
            cancelled: []
        };
        
        this.orders.forEach(order => {
            const status = order.status || CONFIG.ORDER_STATUS.PENDING;
            if (groups[status]) {
                groups[status].push(order);
            }
        });
        
        // Sort by creation time (newest first)
        Object.keys(groups).forEach(status => {
            groups[status].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        });
        
        return groups;
    }

    // Select order for detailed view
    selectOrder(orderId) {
        this.selectedOrder = this.orders.find(order => order.id === orderId);
        
        // Update order cards selection
        document.querySelectorAll('.order-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[onclick*="${orderId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Update order details panel
        this.renderOrderDetails();
        
        // Log order selection
        app.logEvent('order_selected', {
            orderId,
            orderStatus: this.selectedOrder?.status,
            tableNumber: this.selectedOrder?.table_number
        });
    }

    // Render order details panel
    renderOrderDetails() {
        const container = document.getElementById('orderDetailsContainer');
        if (!container) return;
        
        if (!this.selectedOrder) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-mouse-pointer fa-3x mb-3"></i>
                    <p>${t('select_order_to_view_details')}</p>
                </div>
            `;
            return;
        }
        
        const order = this.selectedOrder;
        const orderTime = this.formatOrderTime(order.created_at);
        
        container.innerHTML = `
            <div class="order-details">
                <div class="order-details-header">
                    <h5>${order.id}</h5>
                    <span class="order-status ${order.status}">${t(order.status)}</span>
                </div>
                
                <div class="order-details-info">
                    <div class="info-item">
                        <i class="fas fa-table"></i>
                        <span>${t('table')} ${order.table_number}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>${orderTime}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>${this.formatCurrency(order.total_amount)}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-tag"></i>
                        <span>${order.type === 'quick_action' ? t('quick_action') : t('order')}</span>
                    </div>
                </div>
                
                ${order.type === 'order' ? `
                    <div class="order-details-items">
                        <h6>${t('items')}</h6>
                        ${this.renderDetailedItems(order)}
                    </div>
                ` : `
                    <div class="order-details-action">
                        <h6>${t('quick_action')}</h6>
                        <p>${order.customer_notes}</p>
                    </div>
                `}
                
                ${order.customer_notes && order.type === 'order' ? `
                    <div class="order-details-notes">
                        <h6>${t('notes')}</h6>
                        <p>${order.customer_notes}</p>
                    </div>
                ` : ''}
                
                <div class="order-details-actions">
                    ${this.renderDetailedActions(order)}
                </div>
            </div>
        `;
    }

    // Render detailed items list
    renderDetailedItems(order) {
        if (!order.items) return '<p class="text-muted">No items</p>';
        
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        
        return `
            <div class="detailed-items-list">
                ${items.map(item => `
                    <div class="detailed-item">
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            ${item.size && item.size !== 'Regular' ? `<div class="item-size">${item.size}</div>` : ''}
                        </div>
                        <div class="item-quantity">×${item.quantity}</div>
                        <div class="item-total">${this.formatCurrency(item.price * item.quantity)}</div>
                    </div>
                `).join('')}
                <div class="items-total">
                    <strong>${t('total')}: ${this.formatCurrency(order.total_amount)}</strong>
                </div>
            </div>
        `;
    }

    // Render detailed actions
    renderDetailedActions(order) {
        const actions = [];
        
        switch (order.status) {
            case CONFIG.ORDER_STATUS.PENDING:
                actions.push(`
                    <button class="btn btn-primary w-100 mb-2" onclick="cashierManager.updateOrderStatus('${order.id}', '${CONFIG.ORDER_STATUS.PREPARING}')">
                        <i class="fas fa-play"></i> ${t('start_preparing')}
                    </button>
                `);
                actions.push(`
                    <button class="btn btn-outline-danger w-100" onclick="cashierManager.updateOrderStatus('${order.id}', '${CONFIG.ORDER_STATUS.CANCELLED}')">
                        <i class="fas fa-times"></i> ${t('cancel_order')}
                    </button>
                `);
                break;
                
            case CONFIG.ORDER_STATUS.PREPARING:
                actions.push(`
                    <button class="btn btn-success w-100 mb-2" onclick="cashierManager.updateOrderStatus('${order.id}', '${CONFIG.ORDER_STATUS.READY}')">
                        <i class="fas fa-check"></i> ${t('mark_ready')}
                    </button>
                `);
                actions.push(`
                    <button class="btn btn-outline-secondary w-100" onclick="cashierManager.updateOrderStatus('${order.id}', '${CONFIG.ORDER_STATUS.PENDING}')">
                        <i class="fas fa-undo"></i> ${t('back_to_pending')}
                    </button>
                `);
                break;
                
            case CONFIG.ORDER_STATUS.READY:
                actions.push(`
                    <button class="btn btn-info w-100 mb-2" onclick="cashierManager.updateOrderStatus('${order.id}', '${CONFIG.ORDER_STATUS.SERVED}')">
                        <i class="fas fa-utensils"></i> ${t('mark_served')}
                    </button>
                `);
                actions.push(`
                    <button class="btn btn-outline-secondary w-100" onclick="cashierManager.updateOrderStatus('${order.id}', '${CONFIG.ORDER_STATUS.PREPARING}')">
                        <i class="fas fa-undo"></i> ${t('back_to_preparing')}
                    </button>
                `);
                break;
                
            case CONFIG.ORDER_STATUS.SERVED:
                actions.push(`
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle"></i> ${t('order_completed')}
                    </div>
                `);
                break;
        }
        
        return actions.join('');
    }

    // Update order status
    async updateOrderStatus(orderId, newStatus) {
        try {
            app.showNotification(t('updating_order_status'), 'info');
            
            const result = await googleSheetsAPI.updateOrderStatus(orderId, newStatus);
            
            if (result) {
                // Update local order
                const order = this.orders.find(o => o.id === orderId);
                if (order) {
                    order.status = newStatus;
                }
                
                // Update selected order if it's the same
                if (this.selectedOrder && this.selectedOrder.id === orderId) {
                    this.selectedOrder.status = newStatus;
                }
                
                // Re-render orders and details
                this.renderOrders();
                this.renderOrderDetails();
                this.updateStats();
                
                // Play sound for status changes
                this.playStatusChangeSound(newStatus);
                
                app.showSuccess(t('order_status_updated'));
                
                // Log status update
                app.logEvent('order_status_updated', {
                    orderId,
                    newStatus,
                    previousStatus: order?.status
                });
                
            } else {
                app.showError(t('failed_to_update_order_status'));
            }
            
        } catch (error) {
            console.error('Error updating order status:', error);
            app.showError(t('failed_to_update_order_status'));
        }
    }

    // Update dashboard stats
    updateStats() {
        const stats = this.calculateStats();
        
        const pendingCount = document.getElementById('pendingCount');
        const readyCount = document.getElementById('readyCount');
        
        if (pendingCount) pendingCount.textContent = stats.pending;
        if (readyCount) readyCount.textContent = stats.ready;
    }

    // Calculate dashboard statistics
    calculateStats() {
        const stats = {
            pending: 0,
            preparing: 0,
            ready: 0,
            served: 0,
            total: this.orders.length,
            totalRevenue: 0
        };
        
        this.orders.forEach(order => {
            const status = order.status || CONFIG.ORDER_STATUS.PENDING;
            if (stats.hasOwnProperty(status)) {
                stats[status]++;
            }
            stats.totalRevenue += parseFloat(order.total_amount || 0);
        });
        
        return stats;
    }

    // Refresh orders from Google Sheets
    async refreshOrders() {
        try {
            const newOrders = await googleSheetsAPI.getOrders();
            
            // Check for new orders
            const newOrderCount = newOrders.length;
            if (newOrderCount > this.lastOrderCount) {
                this.playNewOrderSound();
                app.showNotification(`${newOrderCount - this.lastOrderCount} ${t('new_orders_received')}`, 'success');
            }
            
            this.lastOrderCount = newOrderCount;
            this.orders = newOrders;
            
            // Re-render if orders changed
            this.renderOrders();
            this.updateStats();
            
            // Update selected order details if still selected
            if (this.selectedOrder) {
                const updatedOrder = this.orders.find(o => o.id === this.selectedOrder.id);
                if (updatedOrder) {
                    this.selectedOrder = updatedOrder;
                    this.renderOrderDetails();
                }
            }
            
        } catch (error) {
            console.error('Error refreshing orders:', error);
        }
    }

    // Start auto-refresh
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.refreshOrders();
        }, CONFIG.APP.ORDER_REFRESH_INTERVAL);
    }

    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else {
                this.startAutoRefresh();
            }
        });
        
        // Handle window focus
        window.addEventListener('focus', () => {
            this.refreshOrders();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.refreshOrders();
            }
        });
    }

    // Play new order sound
    playNewOrderSound() {
        if (this.soundEnabled && app.sounds && app.sounds.newOrder) {
            app.sounds.newOrder();
        }
    }

    // Play status change sound
    playStatusChangeSound(status) {
        if (!this.soundEnabled || !app.sounds) return;
        
        switch (status) {
            case CONFIG.ORDER_STATUS.READY:
                if (app.sounds.orderReady) app.sounds.orderReady();
                break;
            default:
                if (app.sounds.notification) app.sounds.notification();
                break;
        }
    }

    // Play notification sound
    playNotificationSound() {
        if (this.soundEnabled && app.sounds && app.sounds.notification) {
            app.sounds.notification();
        }
    }

    // Format order time
    formatOrderTime(timestamp) {
        return app.formatDate(timestamp);
    }

    // Get time ago string
    getTimeAgo(timestamp) {
        const now = new Date();
        const orderTime = new Date(timestamp);
        const diffMs = now - orderTime;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return t('just_now');
        if (diffMins < 60) return `${diffMins}${t('min_ago')}`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}${t('hour_ago')}`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}${t('day_ago')}`;
    }

    // Format currency
    formatCurrency(amount) {
        return app.formatCurrency(amount);
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
        this.selectedOrder = null;
        this.orders = [];
    }
}

// Create global cashier manager instance
window.CashierManager = CashierManager;
window.cashierManager = new CashierManager();

