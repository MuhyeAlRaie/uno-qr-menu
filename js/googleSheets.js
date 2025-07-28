// Google Sheets API Integration

class GoogleSheetsAPI {
    constructor() {
        this.isInitialized = false;
        this.apiKey = CONFIG.GOOGLE_SHEETS.API_KEY;
        this.spreadsheetId = CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID;
    }

    // Initialize Google Sheets API
    async init() {
        if (this.isInitialized) return true;

        try {
            await new Promise((resolve, reject) => {
                gapi.load('client', {
                    callback: resolve,
                    onerror: reject
                });
            });

            await gapi.client.init({
                apiKey: this.apiKey,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
            });

            this.isInitialized = true;
            console.log('Google Sheets API initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Google Sheets API:', error);
            return false;
        }
    }

    // Read data from a specific sheet
    async readSheet(sheetName, range = '') {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const fullRange = range ? `${sheetName}!${range}` : sheetName;
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: fullRange
            });

            return response.result.values || [];
        } catch (error) {
            console.error(`Error reading sheet ${sheetName}:`, error);
            return [];
        }
    }

    // Write data to a specific sheet
    async writeSheet(sheetName, range, values) {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const response = await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!${range}`,
                valueInputOption: 'RAW',
                resource: {
                    values: values
                }
            });

            return response.result;
        } catch (error) {
            console.error(`Error writing to sheet ${sheetName}:`, error);
            return null;
        }
    }

    // Append data to a specific sheet
    async appendSheet(sheetName, values) {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const response = await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: sheetName,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: values
                }
            });

            return response.result;
        } catch (error) {
            console.error(`Error appending to sheet ${sheetName}:`, error);
            return null;
        }
    }

    // Get menu categories
    async getCategories() {
        const data = await this.readSheet(CONFIG.GOOGLE_SHEETS.SHEETS.CATEGORIES);
        if (data.length === 0) return [];

        const headers = data[0];
        return data.slice(1).map(row => {
            const category = {};
            headers.forEach((header, index) => {
                category[header.toLowerCase().replace(/\s+/g, '_')] = row[index] || '';
            });
            return category;
        });
    }

    // Get menu items
    async getMenuItems() {
        const data = await this.readSheet(CONFIG.GOOGLE_SHEETS.SHEETS.MENU_ITEMS);
        if (data.length === 0) return [];

        const headers = data[0];
        return data.slice(1).map(row => {
            const item = {};
            headers.forEach((header, index) => {
                item[header.toLowerCase().replace(/\s+/g, '_')] = row[index] || '';
            });
            
            // Parse sizes and prices if they exist
            if (item.sizes && item.prices) {
                try {
                    item.sizes = JSON.parse(item.sizes);
                    item.prices = JSON.parse(item.prices);
                } catch (e) {
                    item.sizes = [item.sizes];
                    item.prices = [item.prices];
                }
            }
            
            return item;
        });
    }

    // Get quick actions
    async getQuickActions() {
        const data = await this.readSheet(CONFIG.GOOGLE_SHEETS.SHEETS.QUICK_ACTIONS);
        if (data.length === 0) return [];

        const headers = data[0];
        return data.slice(1).map(row => {
            const action = {};
            headers.forEach((header, index) => {
                action[header.toLowerCase().replace(/\s+/g, '_')] = row[index] || '';
            });
            return action;
        });
    }

    // Get orders
    async getOrders() {
        const data = await this.readSheet(CONFIG.GOOGLE_SHEETS.SHEETS.ORDERS);
        if (data.length === 0) return [];

        const headers = data[0];
        return data.slice(1).map(row => {
            const order = {};
            headers.forEach((header, index) => {
                order[header.toLowerCase().replace(/\s+/g, '_')] = row[index] || '';
            });
            
            // Parse order items if they exist
            if (order.items) {
                try {
                    order.items = JSON.parse(order.items);
                } catch (e) {
                    order.items = [];
                }
            }
            
            return order;
        });
    }

    // Add new order
    async addOrder(orderData) {
        const timestamp = new Date().toISOString();
        const orderId = 'ORD_' + Date.now();
        
        const orderRow = [
            orderId,
            orderData.tableNumber,
            JSON.stringify(orderData.items),
            orderData.totalAmount,
            CONFIG.ORDER_STATUS.PENDING,
            timestamp,
            orderData.customerNotes || '',
            orderData.type || 'order' // 'order' or 'quick_action'
        ];

        return await this.appendSheet(CONFIG.GOOGLE_SHEETS.SHEETS.ORDERS, [orderRow]);
    }

    // Update order status
    async updateOrderStatus(orderId, status) {
        const orders = await this.getOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex === -1) return false;

        const rowIndex = orderIndex + 2; // +1 for header, +1 for 0-based index
        const statusColumnIndex = 5; // Assuming status is in column E (0-based index 4)
        
        return await this.writeSheet(
            CONFIG.GOOGLE_SHEETS.SHEETS.ORDERS,
            `E${rowIndex}`,
            [[status]]
        );
    }

    // Add menu item
    async addMenuItem(itemData) {
        const itemRow = [
            itemData.id || 'ITEM_' + Date.now(),
            itemData.name_en,
            itemData.name_ar,
            itemData.description_en,
            itemData.description_ar,
            itemData.category_id,
            itemData.image_url,
            JSON.stringify(itemData.sizes || []),
            JSON.stringify(itemData.prices || []),
            itemData.prep_time || '15',
            itemData.available || 'true',
            new Date().toISOString()
        ];

        return await this.appendSheet(CONFIG.GOOGLE_SHEETS.SHEETS.MENU_ITEMS, [itemRow]);
    }

    // Update menu item
    async updateMenuItem(itemId, itemData) {
        const items = await this.getMenuItems();
        const itemIndex = items.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) return false;

        const rowIndex = itemIndex + 2;
        const itemRow = [
            itemId,
            itemData.name_en,
            itemData.name_ar,
            itemData.description_en,
            itemData.description_ar,
            itemData.category_id,
            itemData.image_url,
            JSON.stringify(itemData.sizes || []),
            JSON.stringify(itemData.prices || []),
            itemData.prep_time || '15',
            itemData.available || 'true',
            new Date().toISOString()
        ];

        return await this.writeSheet(
            CONFIG.GOOGLE_SHEETS.SHEETS.MENU_ITEMS,
            `A${rowIndex}:L${rowIndex}`,
            [itemRow]
        );
    }

    // Delete menu item
    async deleteMenuItem(itemId) {
        // Note: Google Sheets API doesn't support row deletion directly
        // This would require additional implementation or marking as deleted
        return await this.updateMenuItem(itemId, { available: 'false' });
    }

    // Get analytics data
    async getAnalytics() {
        const orders = await this.getOrders();
        const items = await this.getMenuItems();
        
        // Calculate analytics
        const analytics = {
            totalOrders: orders.length,
            totalSales: orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0),
            mostOrderedItems: this.calculateMostOrderedItems(orders, items),
            ordersByStatus: this.groupOrdersByStatus(orders),
            salesByDate: this.groupSalesByDate(orders)
        };

        return analytics;
    }

    // Helper method to calculate most ordered items
    calculateMostOrderedItems(orders, items) {
        const itemCounts = {};
        
        orders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    itemCounts[item.id] = (itemCounts[item.id] || 0) + item.quantity;
                });
            }
        });

        return Object.entries(itemCounts)
            .map(([itemId, count]) => {
                const item = items.find(i => i.id === itemId);
                return {
                    id: itemId,
                    name: item ? item.name_en : 'Unknown Item',
                    count: count
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    // Helper method to group orders by status
    groupOrdersByStatus(orders) {
        const statusGroups = {};
        orders.forEach(order => {
            const status = order.status || CONFIG.ORDER_STATUS.PENDING;
            statusGroups[status] = (statusGroups[status] || 0) + 1;
        });
        return statusGroups;
    }

    // Helper method to group sales by date
    groupSalesByDate(orders) {
        const dateGroups = {};
        orders.forEach(order => {
            const date = new Date(order.created_at).toDateString();
            const amount = parseFloat(order.total_amount || 0);
            dateGroups[date] = (dateGroups[date] || 0) + amount;
        });
        return dateGroups;
    }
}

// Create global instance
const googleSheetsAPI = new GoogleSheetsAPI();

