// Configuration for UNO Restaurant QR Menu System

const CONFIG = {
    // Google Sheets Configuration
    GOOGLE_SHEETS: {
        API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY', // Replace with actual API key
        SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID', // Replace with actual spreadsheet ID
        SHEETS: {
            MENU_ITEMS: 'MenuItems',
            CATEGORIES: 'Categories',
            ORDERS: 'Orders',
            QUICK_ACTIONS: 'QuickActions',
            TABLES: 'Tables',
            ANALYTICS: 'Analytics'
        }
    },

    // Cloudinary Configuration
    CLOUDINARY: {
        CLOUD_NAME: 'dezvuqqrl',
        UPLOAD_PRESET: 'unsigned_preset'
    },

    // Application Settings
    APP: {
        DEFAULT_LANGUAGE: 'en',
        SUPPORTED_LANGUAGES: ['en', 'ar'],
        SOUND_ALERTS: true,
        ORDER_REFRESH_INTERVAL: 5000, // 5 seconds
        MAX_ITEMS_PER_ORDER: 50
    },

    // Table Configuration
    TABLES: {
        TOTAL_TABLES: 20,
        QR_BASE_URL: window.location.origin + window.location.pathname
    },

    // Order Status
    ORDER_STATUS: {
        PENDING: 'pending',
        PREPARING: 'preparing',
        READY: 'ready',
        SERVED: 'served',
        CANCELLED: 'cancelled'
    },

    // Quick Action Types
    QUICK_ACTION_TYPES: {
        CHARCOAL: 'charcoal',
        NAPKINS: 'napkins',
        BILL: 'bill',
        WAITER: 'waiter'
    }
};

// Translations
const TRANSLATIONS = {
    en: {
        // Common
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'cancel': 'Cancel',
        'confirm': 'Confirm',
        'save': 'Save',
        'delete': 'Delete',
        'edit': 'Edit',
        'add': 'Add',
        'back': 'Back',
        'next': 'Next',
        'previous': 'Previous',
        'search': 'Search',
        'filter': 'Filter',
        'sort': 'Sort',
        'total': 'Total',
        'quantity': 'Quantity',
        'price': 'Price',
        'size': 'Size',
        'description': 'Description',
        'image': 'Image',
        'category': 'Category',
        'name': 'Name',
        'status': 'Status',
        'date': 'Date',
        'time': 'Time',
        'table': 'Table',
        'order': 'Order',
        
        // Menu
        'menu_title': 'UNO Restaurant & Café',
        'menu_subtitle': 'Delicious Food & Great Coffee',
        'categories': 'Categories',
        'items': 'Items',
        'add_to_cart': 'Add to Cart',
        'cart': 'Cart',
        'checkout': 'Checkout',
        'order_now': 'Order Now',
        'prep_time': 'Prep Time',
        'minutes': 'minutes',
        'small': 'Small',
        'medium': 'Medium',
        'large': 'Large',
        
        // Quick Actions
        'quick_actions': 'Quick Actions',
        'request_charcoal': 'Request Charcoal',
        'request_napkins': 'Request Napkins',
        'request_bill': 'Request Bill',
        'call_waiter': 'Call Waiter',
        
        // Cashier
        'cashier_dashboard': 'Cashier Dashboard',
        'new_orders': 'New Orders',
        'order_details': 'Order Details',
        'update_status': 'Update Status',
        'mark_ready': 'Mark Ready',
        'mark_served': 'Mark Served',
        'pending_orders': 'Pending Orders',
        'ready_orders': 'Ready Orders',
        
        // Admin
        'admin_panel': 'Admin Panel',
        'menu_management': 'Menu Management',
        'analytics': 'Analytics',
        'add_item': 'Add Item',
        'edit_item': 'Edit Item',
        'upload_image': 'Upload Image',
        'most_ordered': 'Most Ordered Items',
        'total_sales': 'Total Sales',
        'product_performance': 'Product Performance'
    },
    ar: {
        // Common
        'loading': 'جاري التحميل...',
        'error': 'خطأ',
        'success': 'نجح',
        'cancel': 'إلغاء',
        'confirm': 'تأكيد',
        'save': 'حفظ',
        'delete': 'حذف',
        'edit': 'تعديل',
        'add': 'إضافة',
        'back': 'رجوع',
        'next': 'التالي',
        'previous': 'السابق',
        'search': 'بحث',
        'filter': 'تصفية',
        'sort': 'ترتيب',
        'total': 'المجموع',
        'quantity': 'الكمية',
        'price': 'السعر',
        'size': 'الحجم',
        'description': 'الوصف',
        'image': 'الصورة',
        'category': 'الفئة',
        'name': 'الاسم',
        'status': 'الحالة',
        'date': 'التاريخ',
        'time': 'الوقت',
        'table': 'الطاولة',
        'order': 'الطلب',
        
        // Menu
        'menu_title': 'مطعم وكافيه أونو',
        'menu_subtitle': 'طعام لذيذ وقهوة رائعة',
        'categories': 'الفئات',
        'items': 'العناصر',
        'add_to_cart': 'أضف للسلة',
        'cart': 'السلة',
        'checkout': 'الدفع',
        'order_now': 'اطلب الآن',
        'prep_time': 'وقت التحضير',
        'minutes': 'دقائق',
        'small': 'صغير',
        'medium': 'متوسط',
        'large': 'كبير',
        
        // Quick Actions
        'quick_actions': 'إجراءات سريعة',
        'request_charcoal': 'طلب فحم',
        'request_napkins': 'طلب مناديل',
        'request_bill': 'طلب الفاتورة',
        'call_waiter': 'استدعاء النادل',
        
        // Cashier
        'cashier_dashboard': 'لوحة الكاشير',
        'new_orders': 'طلبات جديدة',
        'order_details': 'تفاصيل الطلب',
        'update_status': 'تحديث الحالة',
        'mark_ready': 'جاهز',
        'mark_served': 'تم التقديم',
        'pending_orders': 'طلبات معلقة',
        'ready_orders': 'طلبات جاهزة',
        
        // Admin
        'admin_panel': 'لوحة الإدارة',
        'menu_management': 'إدارة القائمة',
        'analytics': 'التحليلات',
        'add_item': 'إضافة عنصر',
        'edit_item': 'تعديل عنصر',
        'upload_image': 'رفع صورة',
        'most_ordered': 'الأكثر طلباً',
        'total_sales': 'إجمالي المبيعات',
        'product_performance': 'أداء المنتجات'
    }
};

// Helper function to get translation
function t(key, lang = null) {
    const currentLang = lang || localStorage.getItem('language') || CONFIG.APP.DEFAULT_LANGUAGE;
    return TRANSLATIONS[currentLang][key] || key;
}

