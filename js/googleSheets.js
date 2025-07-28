// Google Sheets Integration for UNO Restaurant QR Menu System

class GoogleSheetsAPI {
    constructor() {
        this.webAppUrl = GOOGLE_SHEETS_CONFIG.WEB_APP_URL;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Generic method to call Google Apps Script
    async callScript(action, data = {}) {
        try {
            const payload = {
                action: action,
                data: data,
                timestamp: Utils.getCurrentTimestamp()
            };

            const response = await fetch(this.webAppUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }

            return result.data;
        } catch (error) {
            console.error('Google Sheets API Error:', error);
            throw error;
        }
    }

    // Cache management
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    // Menu Items Methods
    async getMenuItems(useCache = true) {
        const cacheKey = 'menuItems';
        
        if (useCache) {
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;
        }

        try {
            const items = await this.callScript(API_ENDPOINTS.GET_MENU_ITEMS);
            this.setCachedData(cacheKey, items);
            return items;
        } catch (error) {
            console.error('Error fetching menu items:', error);
            return [];
        }
    }

    async addMenuItem(item) {
        try {
            const result = await this.callScript(API_ENDPOINTS.ADD_MENU_ITEM, item);
            this.clearCache('menuItems');
            return result;
        } catch (error) {
            console.error('Error adding menu item:', error);
            throw error;
        }
    }

    async updateMenuItem(id, item) {
        try {
            const result = await this.callScript(API_ENDPOINTS.UPDATE_MENU_ITEM, { id, ...item });
            this.clearCache('menuItems');
            return result;
        } catch (error) {
            console.error('Error updating menu item:', error);
            throw error;
        }
    }

    async deleteMenuItem(id) {
        try {
            const result = await this.callScript(API_ENDPOINTS.DELETE_MENU_ITEM, { id });
            this.clearCache('menuItems');
            return result;
        } catch (error) {
            console.error('Error deleting menu item:', error);
            throw error;
        }
    }

    // Categories Methods
    async getCategories(useCache = true) {
        const cacheKey = 'categories';
        
        if (useCache) {
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;
        }

        try {
            const categories = await this.callScript(API_ENDPOINTS.GET_CATEGORIES);
            this.setCachedData(cacheKey, categories);
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    async addCategory(category) {
        try {
            const result = await this.callScript(API_ENDPOINTS.ADD_CATEGORY, category);
            this.clearCache('categories');
            return result;
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    }

    async updateCategory(id, category) {
        try {
            const result = await this.callScript(API_ENDPOINTS.UPDATE_CATEGORY, { id, ...category });
            this.clearCache('categories');
            return result;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    async deleteCategory(id) {
        try {
            const result = await this.callScript(API_ENDPOINTS.DELETE_CATEGORY, { id });
            this.clearCache('categories');
            return result;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    // Orders Methods
    async getOrders(useCache = false) {
        const cacheKey = 'orders';
        
        if (useCache) {
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;
        }

        try {
            const orders = await this.callScript(API_ENDPOINTS.GET_ORDERS);
            this.setCachedData(cacheKey, orders);
            return orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    async addOrder(order) {
        try {
            const orderData = {
                id: Utils.generateId(),
                tableNumber: order.tableNumber,
                items: order.items,
                total: order.total,
                status: APP_CONFIG.ORDER_STATUSES.PENDING,
                timestamp: Utils.getCurrentTimestamp(),
                customerNote: order.customerNote || ''
            };

            const result = await this.callScript(API_ENDPOINTS.ADD_ORDER, orderData);
            this.clearCache('orders');
            return result;
        } catch (error) {
            console.error('Error adding order:', error);
            throw error;
        }
    }

    async updateOrder(id, updates) {
        try {
            const result = await this.callScript(API_ENDPOINTS.UPDATE_ORDER, { id, ...updates });
            this.clearCache('orders');
            return result;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }

    async updateOrderStatus(id, status) {
        try {
            const result = await this.updateOrder(id, { 
                status: status,
                updatedAt: Utils.getCurrentTimestamp()
            });
            return result;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // Quick Actions Methods
    async getQuickActions(useCache = true) {
        const cacheKey = 'quickActions';
        
        if (useCache) {
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;
        }

        try {
            const actions = await this.callScript(API_ENDPOINTS.GET_QUICK_ACTIONS);
            this.setCachedData(cacheKey, actions);
            return actions;
        } catch (error) {
            console.error('Error fetching quick actions:', error);
            return [];
        }
    }

    async addQuickAction(action) {
        try {
            const result = await this.callScript(API_ENDPOINTS.ADD_QUICK_ACTION, action);
            this.clearCache('quickActions');
            return result;
        } catch (error) {
            console.error('Error adding quick action:', error);
            throw error;
        }
    }

    async updateQuickAction(id, action) {
        try {
            const result = await this.callScript(API_ENDPOINTS.UPDATE_QUICK_ACTION, { id, ...action });
            this.clearCache('quickActions');
            return result;
        } catch (error) {
            console.error('Error updating quick action:', error);
            throw error;
        }
    }

    async deleteQuickAction(id) {
        try {
            const result = await this.callScript(API_ENDPOINTS.DELETE_QUICK_ACTION, { id });
            this.clearCache('quickActions');
            return result;
        } catch (error) {
            console.error('Error deleting quick action:', error);
            throw error;
        }
    }

    // Quick Requests Methods
    async getQuickRequests(useCache = false) {
        const cacheKey = 'quickRequests';
        
        if (useCache) {
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;
        }

        try {
            const requests = await this.callScript(API_ENDPOINTS.GET_QUICK_REQUESTS);
            this.setCachedData(cacheKey, requests);
            return requests;
        } catch (error) {
            console.error('Error fetching quick requests:', error);
            return [];
        }
    }

    async addQuickRequest(request) {
        try {
            const requestData = {
                id: Utils.generateId(),
                tableNumber: request.tableNumber,
                actionId: request.actionId,
                actionName: request.actionName,
                status: APP_CONFIG.REQUEST_STATUSES.PENDING,
                timestamp: Utils.getCurrentTimestamp(),
                note: request.note || ''
            };

            const result = await this.callScript(API_ENDPOINTS.ADD_QUICK_REQUEST, requestData);
            this.clearCache('quickRequests');
            return result;
        } catch (error) {
            console.error('Error adding quick request:', error);
            throw error;
        }
    }

    async updateQuickRequest(id, updates) {
        try {
            const result = await this.callScript(API_ENDPOINTS.UPDATE_QUICK_REQUEST, { id, ...updates });
            this.clearCache('quickRequests');
            return result;
        } catch (error) {
            console.error('Error updating quick request:', error);
            throw error;
        }
    }

    async updateQuickRequestStatus(id, status) {
        try {
            const result = await this.updateQuickRequest(id, { 
                status: status,
                updatedAt: Utils.getCurrentTimestamp()
            });
            return result;
        } catch (error) {
            console.error('Error updating quick request status:', error);
            throw error;
        }
    }

    // Tables Methods
    async getTables(useCache = true) {
        const cacheKey = 'tables';
        
        if (useCache) {
            const cached = this.getCachedData(cacheKey);
            if (cached) return cached;
        }

        try {
            const tables = await this.callScript(API_ENDPOINTS.GET_TABLES);
            this.setCachedData(cacheKey, tables);
            return tables;
        } catch (error) {
            console.error('Error fetching tables:', error);
            return [];
        }
    }

    async updateTable(tableNumber, updates) {
        try {
            const result = await this.callScript(API_ENDPOINTS.UPDATE_TABLE, { 
                tableNumber, 
                ...updates,
                updatedAt: Utils.getCurrentTimestamp()
            });
            this.clearCache('tables');
            return result;
        } catch (error) {
            console.error('Error updating table:', error);
            throw error;
        }
    }

    async updateTableStatus(tableNumber, status) {
        try {
            const result = await this.updateTable(tableNumber, { status });
            return result;
        } catch (error) {
            console.error('Error updating table status:', error);
            throw error;
        }
    }

    // Analytics Methods
    async getAnalytics(dateRange = null) {
        try {
            const analytics = await this.callScript(API_ENDPOINTS.GET_ANALYTICS, { dateRange });
            return analytics;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return {};
        }
    }

    async getSalesData(dateRange = null) {
        try {
            const salesData = await this.callScript(API_ENDPOINTS.GET_SALES_DATA, { dateRange });
            return salesData;
        } catch (error) {
            console.error('Error fetching sales data:', error);
            return [];
        }
    }

    async getPopularItems(limit = 10) {
        try {
            const popularItems = await this.callScript(API_ENDPOINTS.GET_POPULAR_ITEMS, { limit });
            return popularItems;
        } catch (error) {
            console.error('Error fetching popular items:', error);
            return [];
        }
    }

    // Utility Methods
    async testConnection() {
        try {
            await this.callScript('ping');
            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    async initializeSheets() {
        try {
            const result = await this.callScript('initializeSheets');
            return result;
        } catch (error) {
            console.error('Error initializing sheets:', error);
            throw error;
        }
    }
}

// Create global instance
const googleSheetsAPI = new GoogleSheetsAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleSheetsAPI;
}

