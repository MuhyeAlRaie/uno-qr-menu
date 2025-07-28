// Cashier Dashboard for UNO Restaurant QR Menu System

class CashierDashboard {
    constructor() {
        this.orders = [];
        this.quickRequests = [];
        this.tables = [];
        this.lastOrderCount = 0;
        this.lastRequestCount = 0;
        this.refreshInterval = null;
        this.soundEnabled = APP_CONFIG.SOUND.ENABLED;
        
        this.init();
    }

    async init() {
        try {
            // Load initial data
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial UI
            this.renderOrders();
            this.renderQuickRequests();
            this.renderTableStatus();
            this.updateStatistics();
            
            // Start auto-refresh
            this.startAutoRefresh();
            
            // Update current time
            this.updateCurrentTime();
            
            console.log('Cashier dashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing cashier dashboard:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    async loadData() {
        try {
            // Load data in parallel
            const [orders, quickRequests, tables] = await Promise.all([
                googleSheetsAPI.getOrders(false), // Don't use cache for real-time data
                googleSheetsAPI.getQuickRequests(false),
                googleSheetsAPI.getTables(false)
            ]);

            // Check for new orders/requests
            this.checkForNewItems(orders, quickRequests);

            this.orders = orders || [];
            this.quickRequests = quickRequests || [];
            this.tables = tables || [];

        } catch (error) {
            console.error('Error loading cashier data:', error);
            throw error;
        }
    }

    checkForNewItems(newOrders, newRequests) {
        // Check for new orders
        const newOrderCount = newOrders.filter(order => 
            order.status === APP_CONFIG.ORDER_STATUSES.PENDING
        ).length;

        if (newOrderCount > this.lastOrderCount) {
            this.playNotificationSound();
            this.showNewOrderAlert();
        }

        // Check for new requests
        const newRequestCount = newRequests.filter(request => 
            request.status === APP_CONFIG.REQUEST_STATUSES.PENDING
        ).length;

        if (newRequestCount > this.lastRequestCount) {
            this.playNotificationSound();
            this.showNewRequestAlert();
        }

        this.lastOrderCount = newOrderCount;
        this.lastRequestCount = newRequestCount;
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.querySelector('[onclick="refreshData()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // F5 or Ctrl+R for refresh
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.refreshData();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.show');
                modals.forEach(modal => {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) bsModal.hide();
                });
            }
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
    }

    renderOrders() {
        const container = document.getElementById('ordersContainer');
        if (!container) return;

        // Filter active orders (not completed)
        const activeOrders = this.orders.filter(order => 
            order.status !== APP_CONFIG.ORDER_STATUSES.COMPLETED
        );

        if (activeOrders.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fas fa-utensils"></i>
                        <h5>No Active Orders</h5>
                        <p>New orders will appear here automatically</p>
                    </div>
                </div>
            `;
            return;
        }

        const ordersHtml = activeOrders.map(order => {
            const orderTime = new Date(order.timestamp).toLocaleTimeString();
            const statusClass = order.status.toLowerCase();
            const statusText = this.getStatusText(order.status);
            
            const itemsHtml = order.items.map(item => `
                <div class="order-item">
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        ${item.size ? `<div class="item-size">${item.size}</div>` : ''}
                        ${item.specialInstructions ? `<div class="item-instructions"><small>${item.specialInstructions}</small></div>` : ''}
                    </div>
                    <div class="item-quantity">×${item.quantity}</div>
                    <div class="item-price">${Utils.formatCurrency(item.price)}</div>
                </div>
            `).join('');

            return `
                <div class="col-lg-6 col-xl-4">
                    <div class="order-card ${statusClass} animate-fade-in-up" data-order-id="${order.id}">
                        <div class="order-header">
                            <div class="order-info">
                                <h6>Table ${order.tableNumber} - Order #${order.id.slice(-6)}</h6>
                                <small>${orderTime}</small>
                            </div>
                            <span class="order-status ${statusClass}">${statusText}</span>
                        </div>
                        
                        <div class="order-body">
                            <div class="order-items">
                                ${itemsHtml}
                            </div>
                            
                            <div class="order-total">
                                <strong>Total: ${Utils.formatCurrency(order.total)}</strong>
                            </div>
                        </div>
                        
                        <div class="order-actions">
                            <button class="btn btn-sm btn-outline-primary" onclick="cashierDashboard.viewOrderDetails('${order.id}')">
                                <i class="fas fa-eye"></i> Details
                            </button>
                            
                            ${order.status === APP_CONFIG.ORDER_STATUSES.PENDING ? `
                                <button class="btn btn-sm btn-warning" onclick="cashierDashboard.updateOrderStatus('${order.id}', '${APP_CONFIG.ORDER_STATUSES.PREPARING}')">
                                    <i class="fas fa-clock"></i> Preparing
                                </button>
                            ` : ''}
                            
                            ${order.status === APP_CONFIG.ORDER_STATUSES.PREPARING ? `
                                <button class="btn btn-sm btn-success" onclick="cashierDashboard.updateOrderStatus('${order.id}', '${APP_CONFIG.ORDER_STATUSES.READY}')">
                                    <i class="fas fa-check"></i> Ready
                                </button>
                            ` : ''}
                            
                            ${order.status === APP_CONFIG.ORDER_STATUSES.READY ? `
                                <button class="btn btn-sm btn-primary" onclick="cashierDashboard.updateOrderStatus('${order.id}', '${APP_CONFIG.ORDER_STATUSES.COMPLETED}')">
                                    <i class="fas fa-check-double"></i> Complete
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = ordersHtml;
    }

    renderQuickRequests() {
        const container = document.getElementById('quickRequestsContainer');
        if (!container) return;

        // Filter active requests
        const activeRequests = this.quickRequests.filter(request => 
            request.status !== APP_CONFIG.REQUEST_STATUSES.COMPLETED
        );

        if (activeRequests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bolt"></i>
                    <h6>No Active Requests</h6>
                    <p>Quick requests will appear here</p>
                </div>
            `;
            return;
        }

        const requestsHtml = activeRequests.map(request => {
            const requestTime = new Date(request.timestamp).toLocaleTimeString();
            const statusClass = request.status === APP_CONFIG.REQUEST_STATUSES.COMPLETED ? 'completed' : 'pending';
            
            return `
                <div class="quick-request-card ${statusClass} animate-fade-in-up" data-request-id="${request.id}">
                    <div class="request-header">
                        <div class="request-info">
                            <h6>Table ${request.tableNumber}</h6>
                            <div>${request.actionName}</div>
                            <small>${requestTime}</small>
                            ${request.note ? `<div class="mt-1"><small class="text-muted">${request.note}</small></div>` : ''}
                        </div>
                        
                        <div class="request-actions">
                            ${request.status === APP_CONFIG.REQUEST_STATUSES.PENDING ? `
                                <button class="btn btn-sm btn-warning" onclick="cashierDashboard.updateRequestStatus('${request.id}', '${APP_CONFIG.REQUEST_STATUSES.IN_PROGRESS}')">
                                    <i class="fas fa-play"></i>
                                </button>
                                <button class="btn btn-sm btn-success" onclick="cashierDashboard.updateRequestStatus('${request.id}', '${APP_CONFIG.REQUEST_STATUSES.COMPLETED}')">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                            
                            ${request.status === APP_CONFIG.REQUEST_STATUSES.IN_PROGRESS ? `
                                <button class="btn btn-sm btn-success" onclick="cashierDashboard.updateRequestStatus('${request.id}', '${APP_CONFIG.REQUEST_STATUSES.COMPLETED}')">
                                    <i class="fas fa-check"></i> Done
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = requestsHtml;
    }

    renderTableStatus() {
        const container = document.getElementById('tableStatusContainer');
        if (!container) return;

        if (this.tables.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-table"></i>
                    <h6>No Tables</h6>
                    <p>Table status will appear here</p>
                </div>
            `;
            return;
        }

        const tablesHtml = `
            <div class="table-status-grid">
                ${this.tables.map(table => {
                    const statusClass = table.status || 'available';
                    const statusText = this.getTableStatusText(statusClass);
                    
                    return `
                        <div class="table-status-card ${statusClass}" onclick="cashierDashboard.toggleTableStatus('${table.number}')">
                            <div class="table-number">${table.number}</div>
                            <div class="table-status-text ${statusClass}">${statusText}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        container.innerHTML = tablesHtml;
    }

    updateStatistics() {
        // Update order counts
        const pendingCount = this.orders.filter(order => 
            order.status === APP_CONFIG.ORDER_STATUSES.PENDING
        ).length;
        
        const preparingCount = this.orders.filter(order => 
            order.status === APP_CONFIG.ORDER_STATUSES.PREPARING
        ).length;
        
        const readyCount = this.orders.filter(order => 
            order.status === APP_CONFIG.ORDER_STATUSES.READY
        ).length;

        // Update DOM elements
        const pendingElement = document.getElementById('pendingCount');
        const preparingElement = document.getElementById('preparingCount');
        const readyElement = document.getElementById('readyCount');

        if (pendingElement) pendingElement.textContent = pendingCount;
        if (preparingElement) preparingElement.textContent = preparingCount;
        if (readyElement) readyElement.textContent = readyCount;
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            // Show loading state
            const button = event.target;
            const originalContent = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            // Update order status
            await googleSheetsAPI.updateOrderStatus(orderId, newStatus);

            // Refresh data
            await this.loadData();
            this.renderOrders();
            this.updateStatistics();

            // Show success message
            Utils.showToast('Order status updated successfully', 'success');

        } catch (error) {
            console.error('Error updating order status:', error);
            Utils.showToast('Failed to update order status', 'danger');
            
            // Reset button
            if (button) {
                button.disabled = false;
                button.innerHTML = originalContent;
            }
        }
    }

    async updateRequestStatus(requestId, newStatus) {
        try {
            // Show loading state
            const button = event.target;
            const originalContent = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            // Update request status
            await googleSheetsAPI.updateQuickRequestStatus(requestId, newStatus);

            // Refresh data
            await this.loadData();
            this.renderQuickRequests();

            // Show success message
            Utils.showToast('Request status updated successfully', 'success');

        } catch (error) {
            console.error('Error updating request status:', error);
            Utils.showToast('Failed to update request status', 'danger');
            
            // Reset button
            if (button) {
                button.disabled = false;
                button.innerHTML = originalContent;
            }
        }
    }

    async toggleTableStatus(tableNumber) {
        try {
            const table = this.tables.find(t => t.number === tableNumber);
            if (!table) return;

            // Cycle through statuses: available -> occupied -> reserved -> available
            let newStatus;
            switch (table.status) {
                case APP_CONFIG.TABLE_STATUSES.AVAILABLE:
                    newStatus = APP_CONFIG.TABLE_STATUSES.OCCUPIED;
                    break;
                case APP_CONFIG.TABLE_STATUSES.OCCUPIED:
                    newStatus = APP_CONFIG.TABLE_STATUSES.RESERVED;
                    break;
                case APP_CONFIG.TABLE_STATUSES.RESERVED:
                    newStatus = APP_CONFIG.TABLE_STATUSES.AVAILABLE;
                    break;
                default:
                    newStatus = APP_CONFIG.TABLE_STATUSES.AVAILABLE;
            }

            // Update table status
            await googleSheetsAPI.updateTableStatus(tableNumber, newStatus);

            // Refresh data
            await this.loadData();
            this.renderTableStatus();

            // Show success message
            Utils.showToast(`Table ${tableNumber} status updated`, 'success');

        } catch (error) {
            console.error('Error updating table status:', error);
            Utils.showToast('Failed to update table status', 'danger');
        }
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const modal = document.getElementById('orderDetailsModal');
        const modalBody = document.getElementById('orderDetailsBody');
        
        if (!modal || !modalBody) return;

        const orderTime = new Date(order.timestamp).toLocaleDateString() + ' ' + 
                         new Date(order.timestamp).toLocaleTimeString();

        const itemsHtml = order.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.size || '-'}</td>
                <td>${item.quantity}</td>
                <td>${Utils.formatCurrency(item.price)}</td>
                <td>${Utils.formatCurrency(item.price * item.quantity)}</td>
            </tr>
        `).join('');

        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Table:</strong> ${order.tableNumber}</p>
                    <p><strong>Status:</strong> <span class="badge bg-${this.getStatusColor(order.status)}">${this.getStatusText(order.status)}</span></p>
                    <p><strong>Order Time:</strong> ${orderTime}</p>
                </div>
                <div class="col-md-6">
                    <h6>Customer Notes</h6>
                    <p>${order.customerNote || 'No special notes'}</p>
                </div>
            </div>
            
            <h6 class="mt-4">Order Items</h6>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Size</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="4">Total</th>
                            <th>${Utils.formatCurrency(order.total)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        // Store current order for modal actions
        this.currentModalOrder = order;

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    async refreshData() {
        try {
            await this.loadData();
            this.renderOrders();
            this.renderQuickRequests();
            this.renderTableStatus();
            this.updateStatistics();
            
            Utils.showToast('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            Utils.showToast('Failed to refresh data', 'danger');
        }
    }

    startAutoRefresh() {
        // Clear existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Start new interval
        this.refreshInterval = setInterval(() => {
            if (!document.hidden) {
                this.loadData().then(() => {
                    this.renderOrders();
                    this.renderQuickRequests();
                    this.renderTableStatus();
                    this.updateStatistics();
                }).catch(error => {
                    console.error('Auto-refresh error:', error);
                });
            }
        }, APP_CONFIG.REFRESH_INTERVALS.CASHIER);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    playNotificationSound() {
        if (!this.soundEnabled) return;

        const audio = document.getElementById('orderAlert');
        if (audio) {
            audio.volume = APP_CONFIG.SOUND.VOLUME;
            audio.play().catch(error => {
                console.log('Could not play notification sound:', error);
            });
        }
    }

    showNewOrderAlert() {
        const alert = document.createElement('div');
        alert.className = 'new-order-alert';
        alert.innerHTML = `
            <i class="fas fa-bell me-2"></i>
            <strong>New Order Received!</strong>
        `;
        
        document.body.appendChild(alert);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    showNewRequestAlert() {
        const alert = document.createElement('div');
        alert.className = 'new-order-alert';
        alert.style.backgroundColor = 'var(--warning-color)';
        alert.innerHTML = `
            <i class="fas fa-bolt me-2"></i>
            <strong>New Quick Request!</strong>
        `;
        
        document.body.appendChild(alert);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
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

    getStatusText(status) {
        const statusMap = {
            [APP_CONFIG.ORDER_STATUSES.PENDING]: 'Pending',
            [APP_CONFIG.ORDER_STATUSES.PREPARING]: 'Preparing',
            [APP_CONFIG.ORDER_STATUSES.READY]: 'Ready',
            [APP_CONFIG.ORDER_STATUSES.COMPLETED]: 'Completed',
            [APP_CONFIG.ORDER_STATUSES.CANCELLED]: 'Cancelled'
        };
        return statusMap[status] || status;
    }

    getStatusColor(status) {
        const colorMap = {
            [APP_CONFIG.ORDER_STATUSES.PENDING]: 'warning',
            [APP_CONFIG.ORDER_STATUSES.PREPARING]: 'info',
            [APP_CONFIG.ORDER_STATUSES.READY]: 'success',
            [APP_CONFIG.ORDER_STATUSES.COMPLETED]: 'secondary',
            [APP_CONFIG.ORDER_STATUSES.CANCELLED]: 'danger'
        };
        return colorMap[status] || 'secondary';
    }

    getTableStatusText(status) {
        const statusMap = {
            [APP_CONFIG.TABLE_STATUSES.AVAILABLE]: 'Available',
            [APP_CONFIG.TABLE_STATUSES.OCCUPIED]: 'Occupied',
            [APP_CONFIG.TABLE_STATUSES.RESERVED]: 'Reserved'
        };
        return statusMap[status] || status;
    }

    showError(message) {
        Utils.showToast(message, 'danger');
    }

    // Cleanup when page unloads
    destroy() {
        this.stopAutoRefresh();
    }
}

// Global functions for HTML onclick events
window.refreshData = () => {
    if (window.cashierDashboard) {
        window.cashierDashboard.refreshData();
    }
};

window.updateOrderStatus = (orderId, status) => {
    if (window.cashierDashboard) {
        window.cashierDashboard.updateOrderStatus(orderId, status);
    }
};

// Initialize cashier dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cashierDashboard = new CashierDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.cashierDashboard) {
        window.cashierDashboard.destroy();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CashierDashboard;
}

