// Demo Data for UNO Restaurant QR Menu System Testing

const DEMO_DATA = {
    categories: [
        {
            id: 'CAT_001',
            name_en: 'Pizza',
            name_ar: 'بيتزا',
            icon: 'fas fa-pizza-slice',
            sort_order: '1',
            available: 'true'
        },
        {
            id: 'CAT_002',
            name_en: 'Beverages',
            name_ar: 'مشروبات',
            icon: 'fas fa-coffee',
            sort_order: '2',
            available: 'true'
        },
        {
            id: 'CAT_003',
            name_en: 'Desserts',
            name_ar: 'حلويات',
            icon: 'fas fa-ice-cream',
            sort_order: '3',
            available: 'true'
        },
        {
            id: 'CAT_004',
            name_en: 'Appetizers',
            name_ar: 'مقبلات',
            icon: 'fas fa-utensils',
            sort_order: '4',
            available: 'true'
        }
    ],

    menuItems: [
        {
            id: 'ITEM_001',
            name_en: 'Margherita Pizza',
            name_ar: 'بيتزا مارجريتا',
            description_en: 'Classic pizza with fresh tomatoes, mozzarella cheese, and basil',
            description_ar: 'بيتزا كلاسيكية بالطماطم الطازجة وجبن الموزاريلا والريحان',
            category_id: 'CAT_001',
            image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
            sizes: ['Small', 'Medium', 'Large'],
            prices: [12, 18, 24],
            prep_time: '15',
            available: 'true'
        },
        {
            id: 'ITEM_002',
            name_en: 'Pepperoni Pizza',
            name_ar: 'بيتزا البيبروني',
            description_en: 'Delicious pizza topped with pepperoni and mozzarella cheese',
            description_ar: 'بيتزا لذيذة مغطاة بالبيبروني وجبن الموزاريلا',
            category_id: 'CAT_001',
            image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
            sizes: ['Small', 'Medium', 'Large'],
            prices: [14, 20, 26],
            prep_time: '18',
            available: 'true'
        },
        {
            id: 'ITEM_003',
            name_en: 'Cappuccino',
            name_ar: 'كابتشينو',
            description_en: 'Rich espresso with steamed milk and foam',
            description_ar: 'إسبريسو غني بالحليب المبخر والرغوة',
            category_id: 'CAT_002',
            image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
            sizes: ['Regular'],
            prices: [8],
            prep_time: '5',
            available: 'true'
        },
        {
            id: 'ITEM_004',
            name_en: 'Latte',
            name_ar: 'لاتيه',
            description_en: 'Smooth espresso with steamed milk',
            description_ar: 'إسبريسو ناعم بالحليب المبخر',
            category_id: 'CAT_002',
            image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
            sizes: ['Regular', 'Large'],
            prices: [9, 12],
            prep_time: '6',
            available: 'true'
        },
        {
            id: 'ITEM_005',
            name_en: 'Chocolate Cake',
            name_ar: 'كيك الشوكولاتة',
            description_en: 'Rich and moist chocolate cake with chocolate frosting',
            description_ar: 'كيك شوكولاتة غني ورطب مع كريمة الشوكولاتة',
            category_id: 'CAT_003',
            image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
            sizes: ['Slice'],
            prices: [12],
            prep_time: '10',
            available: 'true'
        },
        {
            id: 'ITEM_006',
            name_en: 'Tiramisu',
            name_ar: 'تيراميسو',
            description_en: 'Classic Italian dessert with coffee-soaked ladyfingers',
            description_ar: 'حلوى إيطالية كلاسيكية مع أصابع السيدة المنقوعة بالقهوة',
            category_id: 'CAT_003',
            image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
            sizes: ['Slice'],
            prices: [14],
            prep_time: '8',
            available: 'true'
        },
        {
            id: 'ITEM_007',
            name_en: 'Bruschetta',
            name_ar: 'بروشيتا',
            description_en: 'Grilled bread topped with fresh tomatoes, garlic, and basil',
            description_ar: 'خبز مشوي مغطى بالطماطم الطازجة والثوم والريحان',
            category_id: 'CAT_004',
            image_url: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop',
            sizes: ['Regular'],
            prices: [10],
            prep_time: '12',
            available: 'true'
        },
        {
            id: 'ITEM_008',
            name_en: 'Mozzarella Sticks',
            name_ar: 'أصابع الموزاريلا',
            description_en: 'Crispy fried mozzarella cheese sticks with marinara sauce',
            description_ar: 'أصابع جبن الموزاريلا المقلية المقرمشة مع صلصة المارينارا',
            category_id: 'CAT_004',
            image_url: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=400&h=300&fit=crop',
            sizes: ['Regular'],
            prices: [9],
            prep_time: '10',
            available: 'true'
        }
    ],

    quickActions: [
        {
            id: 'QA_001',
            name_en: 'Request Charcoal',
            name_ar: 'طلب فحم',
            icon: 'fas fa-fire',
            type: 'charcoal',
            available: 'true'
        },
        {
            id: 'QA_002',
            name_en: 'Request Napkins',
            name_ar: 'طلب مناديل',
            icon: 'fas fa-tissue',
            type: 'napkins',
            available: 'true'
        },
        {
            id: 'QA_003',
            name_en: 'Request Bill',
            name_ar: 'طلب الفاتورة',
            icon: 'fas fa-receipt',
            type: 'bill',
            available: 'true'
        },
        {
            id: 'QA_004',
            name_en: 'Call Waiter',
            name_ar: 'استدعاء النادل',
            icon: 'fas fa-bell',
            type: 'waiter',
            available: 'true'
        }
    ],

    orders: [
        {
            id: 'ORD_001',
            table_number: '5',
            items: JSON.stringify([
                {
                    id: 'ITEM_001',
                    name: 'Margherita Pizza',
                    size: 'Medium',
                    price: 18,
                    quantity: 2
                },
                {
                    id: 'ITEM_003',
                    name: 'Cappuccino',
                    size: 'Regular',
                    price: 8,
                    quantity: 2
                }
            ]),
            total_amount: '52',
            status: 'pending',
            created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            customer_notes: '',
            type: 'order'
        },
        {
            id: 'ORD_002',
            table_number: '3',
            items: JSON.stringify([
                {
                    id: 'ITEM_002',
                    name: 'Pepperoni Pizza',
                    size: 'Large',
                    price: 26,
                    quantity: 1
                }
            ]),
            total_amount: '26',
            status: 'preparing',
            created_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
            customer_notes: 'Extra cheese please',
            type: 'order'
        },
        {
            id: 'ORD_003',
            table_number: '7',
            items: [],
            total_amount: '0',
            status: 'pending',
            created_at: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
            customer_notes: 'Quick Action: Request Charcoal',
            type: 'quick_action'
        }
    ],

    analytics: {
        totalOrders: 15,
        totalSales: 450,
        mostOrderedItems: [
            { id: 'ITEM_001', name: 'Margherita Pizza', count: 8 },
            { id: 'ITEM_003', name: 'Cappuccino', count: 6 },
            { id: 'ITEM_002', name: 'Pepperoni Pizza', count: 5 },
            { id: 'ITEM_005', name: 'Chocolate Cake', count: 4 },
            { id: 'ITEM_004', name: 'Latte', count: 3 }
        ],
        ordersByStatus: {
            pending: 3,
            preparing: 2,
            ready: 1,
            served: 9
        },
        salesByDate: {
            '2024-01-15': 120,
            '2024-01-16': 95,
            '2024-01-17': 150,
            '2024-01-18': 85
        }
    }
};

// Demo mode Google Sheets API replacement
class DemoGoogleSheetsAPI {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        this.isInitialized = true;
        console.log('Demo Google Sheets API initialized');
        return true;
    }

    async getCategories() {
        return DEMO_DATA.categories;
    }

    async getMenuItems() {
        return DEMO_DATA.menuItems;
    }

    async getQuickActions() {
        return DEMO_DATA.quickActions;
    }

    async getOrders() {
        return DEMO_DATA.orders;
    }

    async addOrder(orderData) {
        const orderId = 'ORD_' + Date.now();
        const newOrder = {
            id: orderId,
            table_number: orderData.tableNumber.toString(),
            items: JSON.stringify(orderData.items),
            total_amount: orderData.totalAmount.toString(),
            status: 'pending',
            created_at: new Date().toISOString(),
            customer_notes: orderData.customerNotes || '',
            type: orderData.type || 'order'
        };
        
        DEMO_DATA.orders.unshift(newOrder);
        console.log('Demo order added:', newOrder);
        return { result: 'success' };
    }

    async updateOrderStatus(orderId, status) {
        const order = DEMO_DATA.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            console.log('Demo order status updated:', orderId, status);
            return { result: 'success' };
        }
        return null;
    }

    async addMenuItem(itemData) {
        const itemId = 'ITEM_' + Date.now();
        const newItem = {
            id: itemId,
            ...itemData,
            created_at: new Date().toISOString()
        };
        
        DEMO_DATA.menuItems.push(newItem);
        console.log('Demo menu item added:', newItem);
        return { result: 'success' };
    }

    async updateMenuItem(itemId, itemData) {
        const itemIndex = DEMO_DATA.menuItems.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            DEMO_DATA.menuItems[itemIndex] = {
                ...DEMO_DATA.menuItems[itemIndex],
                ...itemData
            };
            console.log('Demo menu item updated:', itemId);
            return { result: 'success' };
        }
        return null;
    }

    async deleteMenuItem(itemId) {
        const itemIndex = DEMO_DATA.menuItems.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            DEMO_DATA.menuItems[itemIndex].available = 'false';
            console.log('Demo menu item deleted:', itemId);
            return { result: 'success' };
        }
        return null;
    }

    async getAnalytics() {
        return DEMO_DATA.analytics;
    }
}

// Replace the global Google Sheets API with demo version
if (typeof window !== 'undefined') {
    window.googleSheetsAPI = new DemoGoogleSheetsAPI();
}

