// UNO Restaurant & Café - Cashier Dashboard Script

class CashierApp {
    constructor() {
        this.orders = [];
        this.quickActionRequests = [];
        this.currentOrderId = null;
        this.currentTableNumber = null;
        this.currentFilter = 'all';
        this.soundEnabled = true;
        this.refreshInterval = null;
        this.tableStatuses = new Map();
        
        this.init();
    }

    async init() {
        this.showLoading(true);
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            // Load initial data
            await this.loadData();
            
            // Start clock
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
        } catch (error) {
            console.error('Error initializing cashier app:', error);
            this.showError('Failed to load dashboard data. Please refresh the page.');
        } finally {
            this.showLoading(false);
        }
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadData();
        });

        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });

        // Order filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.status);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.loadData();
                        break;
                    case 's':
                        e.preventDefault();
                        this.toggleSound();
                        break;
                }
            }
        });
    }

    async loadData() {
        try {
            this.showLoading(true);
            
            // Load orders
            this.orders = await DatabaseAPI.getOrders();
            
            // Load quick action requests
            this.quickActionRequests = await DatabaseAPI.getQuickActionRequests();
            
            // Render all components
            this.renderOrders();
            this.renderQuickActions();
            this.updateStatistics();
            this.updateTableStatuses();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Failed to load data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    startRealTimeUpdates() {
        // Subscribe to orders table changes
        supabaseClient
            .channel('orders-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => this.handleOrderChange(payload)
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'order_items' },
                (payload) => this.handleOrderItemChange(payload)
            )
            .subscribe();

        // Subscribe to quick action requests changes
        supabaseClient
            .channel('quick-actions-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'quick_action_requests' },
                (payload) => this.handleQuickActionChange(payload)
            )
            .subscribe();
    }

    handleOrderChange(payload) {
        console.log('Order change:', payload);
        
        if (payload.eventType === 'INSERT') {
            // New order - play sound and show notification
            this.playSound('newOrder');
            this.showToast('New order received!', 'success', 'new-order');
        }
        
        // Reload data to get updated information
        this.loadData();
    }

    handleOrderItemChange(payload) {
        console.log('Order item change:', payload);
        // Reload data when order items change
        this.loadData();
    }

    handleQuickActionChange(payload) {
        console.log('Quick action change:', payload);
        
        if (payload.eventType === 'INSERT') {
            // New quick action request - play sound and show notification
            this.playSound('quickAction');
            this.showToast('New quick action request!', 'info', 'quick-action');
        }
        
        // Reload data to get updated information
        this.loadData();
    }

    renderOrders() {
        const container = document.getElementById('ordersGrid');
        container.innerHTML = '';

        let filteredOrders = this.orders;
        if (this.currentFilter !== 'all') {
            filteredOrders = this.orders.filter(order => order.status === this.currentFilter);
        }

        if (filteredOrders.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No orders found</h5>
                    <p class="text-muted">Orders will appear here when customers place them.</p>
                </div>
            `;
            return;
        }

        filteredOrders.forEach((order, index) => {
            const orderCard = this.createOrderCard(order);
            container.appendChild(orderCard);
            
            // Add animation delay
            setTimeout(() => {
                orderCard.classList.add('fade-in');
            }, index * 100);
        });
    }

    createOrderCard(order) {
        const card = document.createElement('div');
        card.className = `order-card ${order.status}`;
        
        const orderTime = new Date(order.order_time).toLocaleTimeString();
        const orderItems = order.order_items || [];
        
        // Calculate total
        let total = 0;
        orderItems.forEach(item => {
            const price = item.item_price ? parseFloat(item.item_price.price) : 0;
            total += price * item.quantity;
        });

        card.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-table">Table ${order.table_number}</div>
                    <div class="order-time">${orderTime}</div>
                </div>
                <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
            </div>
            
            <div class="order-items">
                ${orderItems.slice(0, 3).map(item => `
                    <div class="order-item">
                        <span class="item-name">${item.menu_item ? item.menu_item.name_en : 'Unknown Item'}</span>
                        <span class="item-quantity">×${item.quantity}</span>
                        <span class="item-price">$${(parseFloat(item.item_price?.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                ${orderItems.length > 3 ? `<div class="text-muted small">+${orderItems.length - 3} more items</div>` : ''}
            </div>
            
            <div class="order-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            this.showOrderModal(order);
        });

        return card;
    }

    renderQuickActions() {
        const container = document.getElementById('quickActionsList');
        const badge = document.getElementById('quickActionsBadge');
        
        const pendingRequests = this.quickActionRequests.filter(req => req.status === 'pending');
        
        // Update badge
        if (pendingRequests.length > 0) {
            badge.textContent = pendingRequests.length;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }

        container.innerHTML = '';

        if (this.quickActionRequests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-bolt fa-2x text-muted mb-2"></i>
                    <p class="text-muted">No quick action requests</p>
                </div>
            `;
            return;
        }

        this.quickActionRequests.forEach((request, index) => {
            const requestItem = this.createQuickActionItem(request);
            container.appendChild(requestItem);
            
            // Add animation delay
            setTimeout(() => {
                requestItem.classList.add('slide-in-right');
            }, index * 50);
        });
    }

    createQuickActionItem(request) {
        const item = document.createElement('div');
        item.className = `quick-action-item ${request.status}`;
        
        const requestTime = new Date(request.request_time).toLocaleTimeString();
        const actionText = request.quick_action ? request.quick_action.action_en : 'Unknown Action';

        item.innerHTML = `
            <div class="action-info">
                <div class="action-table">Table ${request.table_number}</div>
                <div class="action-text">${actionText}</div>
                <div class="action-time">${requestTime}</div>
            </div>
            <div class="action-controls">
                ${request.status === 'pending' ? `
                    <button class="action-btn complete" onclick="cashierApp.completeQuickAction('${request.id}')">
                        <i class="fas fa-check"></i> Complete
                    </button>
                ` : `
                    <span class="badge bg-success">Completed</span>
                `}
            </div>
        `;

        return item;
    }

    updateStatistics() {
        const today = new Date().toDateString();
        const todayOrders = this.orders.filter(order => 
            new Date(order.order_time).toDateString() === today
        );

        const totalOrders = todayOrders.length;
        const completedOrders = todayOrders.filter(order => order.status === 'completed').length;
        const pendingOrders = todayOrders.filter(order => order.status === 'pending').length;

        // Calculate revenue
        let totalRevenue = 0;
        todayOrders.forEach(order => {
            if (order.order_items) {
                order.order_items.forEach(item => {
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    totalRevenue += price * item.quantity;
                });
            }
        });

        // Update DOM
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('completedOrders').textContent = completedOrders;
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    }

    updateTableStatuses() {
        const container = document.getElementById('tablesGrid');
        container.innerHTML = '';

        // Generate table status based on active orders
        const activeTables = new Set();
        this.orders.forEach(order => {
            if (order.status !== 'completed' && order.status !== 'cancelled') {
                activeTables.add(order.table_number);
            }
        });

        // Create table items (assuming 20 tables)
        for (let i = 1; i <= 20; i++) {
            const tableItem = document.createElement('div');
            const status = activeTables.has(i.toString()) ? 'occupied' : 'available';
            
            tableItem.className = `table-item ${status}`;
            tableItem.innerHTML = `
                <div class="table-number">${i}</div>
                <div class="table-status">${status}</div>
            `;

            tableItem.addEventListener('click', () => {
                this.showTableModal(i.toString(), status);
            });

            container.appendChild(tableItem);
        }
    }

    showOrderModal(order) {
        this.currentOrderId = order.id;
        
        const modal = new bootstrap.Modal(document.getElementById('orderModal'));
        
        // Populate modal content
        document.getElementById('modalTableNumber').textContent = order.table_number;
        document.getElementById('modalOrderTime').textContent = new Date(order.order_time).toLocaleString();
        
        const statusBadge = document.getElementById('modalOrderStatus');
        statusBadge.textContent = this.getStatusText(order.status);
        statusBadge.className = `badge bg-${this.getStatusColor(order.status)}`;
        
        // Populate order items
        const itemsContainer = document.getElementById('modalOrderItems');
        itemsContainer.innerHTML = '';
        
        let total = 0;
        if (order.order_items) {
            order.order_items.forEach(item => {
                const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                const itemTotal = price * item.quantity;
                total += itemTotal;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.menu_item ? item.menu_item.name_en : 'Unknown Item'}</td>
                    <td>${item.item_price ? item.item_price.size_en : 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>$${price.toFixed(2)}</td>
                    <td>$${itemTotal.toFixed(2)}</td>
                    <td>${item.notes || '-'}</td>
                `;
                itemsContainer.appendChild(row);
            });
        }
        
        document.getElementById('modalOrderTotal').textContent = `$${total.toFixed(2)}`;
        
        modal.show();
    }

    showTableModal(tableNumber, status) {
        this.currentTableNumber = tableNumber;
        
        const modal = new bootstrap.Modal(document.getElementById('tableModal'));
        
        // Populate modal content
        document.getElementById('modalTableNum').textContent = tableNumber;
        
        const statusBadge = document.getElementById('modalTableStatus');
        statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusBadge.className = `badge bg-${status === 'available' ? 'success' : status === 'occupied' ? 'danger' : 'warning'}`;
        
        // Find current order for this table
        const currentOrder = this.orders.find(order => 
            order.table_number === tableNumber && 
            order.status !== 'completed' && 
            order.status !== 'cancelled'
        );
        
        document.getElementById('modalTableOrder').textContent = currentOrder ? 
            `Order #${currentOrder.id.substring(0, 8)}` : 'No active order';
        
        modal.show();
    }

    async updateOrderStatus(orderId, status) {
        try {
            this.showLoading(true);
            
            await DatabaseAPI.updateOrderStatus(orderId, status);
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
            
            // Reload data
            await this.loadData();
            
            this.showToast(`Order status updated to ${this.getStatusText(status)}`, 'success');
            
        } catch (error) {
            console.error('Error updating order status:', error);
            this.showToast('Failed to update order status', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async completeQuickAction(requestId) {
        try {
            await DatabaseAPI.updateQuickActionRequestStatus(requestId, 'completed');
            
            // Reload data
            await this.loadData();
            
            this.showToast('Quick action completed', 'success');
            
        } catch (error) {
            console.error('Error completing quick action:', error);
            this.showToast('Failed to complete quick action', 'error');
        }
    }

    async markTableAvailable(tableNumber) {
        // This would typically update a table status in the database
        // For now, we'll just close the modal and show a message
        bootstrap.Modal.getInstance(document.getElementById('tableModal')).hide();
        this.showToast(`Table ${tableNumber} marked as available`, 'success');
    }

    async markTableOccupied(tableNumber) {
        bootstrap.Modal.getInstance(document.getElementById('tableModal')).hide();
        this.showToast(`Table ${tableNumber} marked as occupied`, 'info');
    }

    async markTableReserved(tableNumber) {
        bootstrap.Modal.getInstance(document.getElementById('tableModal')).hide();
        this.showToast(`Table ${tableNumber} marked as reserved`, 'warning');
    }

    printOrder() {
        window.print();
    }

    setFilter(status) {
        this.currentFilter = status;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-status="${status}"]`).classList.add('active');
        
        // Re-render orders
        this.renderOrders();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const button = document.getElementById('soundToggle');
        const icon = button.querySelector('i');
        const text = button.querySelector('i').nextSibling;
        
        if (this.soundEnabled) {
            icon.className = 'fas fa-volume-up';
            text.textContent = ' Sound: ON';
        } else {
            icon.className = 'fas fa-volume-mute';
            text.textContent = ' Sound: OFF';
        }
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audio = document.getElementById(type === 'newOrder' ? 'newOrderSound' : 'quickActionSound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Could not play sound:', e));
        }
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('currentTime').textContent = timeString;
    }

    setupAutoRefresh() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 30000);
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

    getStatusColor(status) {
        const statusColors = {
            pending: 'warning',
            preparing: 'info',
            completed: 'success',
            cancelled: 'danger'
        };
        return statusColors[status] || 'secondary';
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.add('show');
        } else {
            spinner.classList.remove('show');
        }
    }

    showToast(message, type = 'info', extraClass = '') {
        const toastContainer = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0 ${extraClass}`;
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
        const container = document.querySelector('.main-content .container-fluid');
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="alert alert-danger text-center" role="alert">
                        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                        <h4>Error</h4>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Cleanup method
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Unsubscribe from real-time updates
        supabaseClient.removeAllChannels();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cashierApp = new CashierApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.cashierApp) {
        window.cashierApp.destroy();
    }
});

