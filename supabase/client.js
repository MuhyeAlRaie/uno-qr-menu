// Supabase client initialization and helper functions

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Database helper functions
const DatabaseAPI = {
    // Categories
    async getCategories() {
        const { data, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('display_order');
        
        if (error) throw error;
        return data;
    },

    async createCategory(category) {
        const { data, error } = await supabaseClient
            .from('categories')
            .insert([category])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async updateCategory(id, updates) {
        const { data, error } = await supabaseClient
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async deleteCategory(id) {
        const { error } = await supabaseClient
            .from('categories')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    },

    // Menu Items
    async getMenuItems(categoryId = null) {
        let query = supabaseClient
            .from('menu_items')
            .select(`
                *,
                category:categories(*),
                prices:item_prices(*)
            `)
            .order('display_order');
        
        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async createMenuItem(item) {
        const { data, error } = await supabaseClient
            .from('menu_items')
            .insert([item])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async updateMenuItem(id, updates) {
        const { data, error } = await supabaseClient
            .from('menu_items')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async deleteMenuItem(id) {
        const { error } = await supabaseClient
            .from('menu_items')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    },

    // Item Prices
    async createItemPrice(price) {
        const { data, error } = await supabaseClient
            .from('item_prices')
            .insert([price])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async updateItemPrice(id, updates) {
        const { data, error } = await supabaseClient
            .from('item_prices')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async deleteItemPrice(id) {
        const { error } = await supabaseClient
            .from('item_prices')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    },

    // Quick Actions
    async getQuickActions() {
        const { data, error } = await supabaseClient
            .from('quick_actions')
            .select('*')
            .order('display_order');
        
        if (error) throw error;
        return data;
    },

    async createQuickAction(action) {
        const { data, error } = await supabaseClient
            .from('quick_actions')
            .insert([action])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async updateQuickAction(id, updates) {
        const { data, error } = await supabaseClient
            .from('quick_actions')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async deleteQuickAction(id) {
        const { error } = await supabaseClient
            .from('quick_actions')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    },

    // Orders
    async createOrder(order) {
        const { data, error } = await supabaseClient
            .from('orders')
            .insert([order])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async getOrders(status = null) {
        let query = supabaseClient
            .from('orders')
            .select(`
                *,
                order_items(
                    *,
                    menu_item:menu_items(*),
                    item_price:item_prices(*)
                )
            `)
            .order('order_time', { ascending: false });
        
        if (status) {
            query = query.eq('status', status);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async updateOrderStatus(id, status) {
        const { data, error } = await supabaseClient
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },

    // Order Items
    async createOrderItem(orderItem) {
        const { data, error } = await supabaseClient
            .from('order_items')
            .insert([orderItem])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    // Quick Action Requests
    async createQuickActionRequest(request) {
        const { data, error } = await supabaseClient
            .from('quick_action_requests')
            .insert([request])
            .select();
        
        if (error) throw error;
        return data[0];
    },

    async getQuickActionRequests(status = null) {
        let query = supabaseClient
            .from('quick_action_requests')
            .select(`
                *,
                quick_action:quick_actions(*)
            `)
            .order('request_time', { ascending: false });
        
        if (status) {
            query = query.eq('status', status);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async updateQuickActionRequestStatus(id, status) {
        const { data, error } = await supabaseClient
            .from('quick_action_requests')
            .update({ status })
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return data[0];
    },

    // Analytics
    async getAnalytics() {
        const { data, error } = await supabaseClient
            .from('analytics')
            .select(`
                *,
                menu_item:menu_items(*)
            `)
            .order('order_count', { ascending: false });
        
        if (error) throw error;
        return data;
    }
};

