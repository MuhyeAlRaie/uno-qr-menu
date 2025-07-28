// Configuration file for UNO Restaurant QR Menu System

// Google Sheets Configuration
const GOOGLE_SHEETS_CONFIG = {
    // Replace with your Google Sheets ID
    SPREADSHEET_ID: '1ld6dMR_hJaVuy3jCa0mLWyES95-d-_OXu-8gj_ehNrQ',
    
    // Replace with your Google Apps Script Web App URL
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzL5HP5ukoOYsIE76S_dAg6fB6XngyhzPZvDr9JKuTpd6xSYWqtlKXPLoSxndO3a6sC/exec',
    
    // Sheet names
    SHEETS: {
        MENU_ITEMS: 'MenuItems',
        CATEGORIES: 'Categories',
        ORDERS: 'Orders',
        QUICK_ACTIONS: 'QuickActions',
        QUICK_REQUESTS: 'QuickRequests',
        TABLES: 'Tables',
        ANALYTICS: 'Analytics'
    }
};

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
    cloudName: 'dezvuqqrl',
    uploadPreset: 'unsigned_preset',
    apiKey: 'https://api.cloudinary.com/v1_1/dezvuqqrl/image/upload', // Optional for unsigned uploads
    folder: 'uno-restaurant-menu' // Folder to organize uploads
};

// Application Configuration
const APP_CONFIG = {
    // Default language
    DEFAULT_LANGUAGE: 'en',
    
    // Supported languages
    LANGUAGES: {
        en: 'English',
        ar: 'العربية'
    },
    
    // Currency symbol
    CURRENCY: '$',
    
    // Order statuses
    ORDER_STATUSES: {
        PENDING: 'pending',
        PREPARING: 'preparing',
        READY: 'ready',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },
    
    // Quick request statuses
    REQUEST_STATUSES: {
        PENDING: 'pending',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed'
    },
    
    // Table statuses
    TABLE_STATUSES: {
        AVAILABLE: 'available',
        OCCUPIED: 'occupied',
        RESERVED: 'reserved'
    },
    
    // Auto-refresh intervals (in milliseconds)
    REFRESH_INTERVALS: {
        CASHIER: 30000, // 30 seconds
        ADMIN: 60000,   // 1 minute
        MENU: 300000    // 5 minutes
    },
    
    // Sound settings
    SOUND: {
        ENABLED: true,
        VOLUME: 0.7
    },
    
    // Animation settings
    ANIMATION: {
        SLIDER_SPEED: 500,
        FADE_SPEED: 300
    }
};

// API Endpoints for Google Apps Script
const API_ENDPOINTS = {
    // Menu Items
    GET_MENU_ITEMS: 'getMenuItems',
    ADD_MENU_ITEM: 'addMenuItem',
    UPDATE_MENU_ITEM: 'updateMenuItem',
    DELETE_MENU_ITEM: 'deleteMenuItem',
    
    // Categories
    GET_CATEGORIES: 'getCategories',
    ADD_CATEGORY: 'addCategory',
    UPDATE_CATEGORY: 'updateCategory',
    DELETE_CATEGORY: 'deleteCategory',
    
    // Orders
    GET_ORDERS: 'getOrders',
    ADD_ORDER: 'addOrder',
    UPDATE_ORDER: 'updateOrder',
    DELETE_ORDER: 'deleteOrder',
    
    // Quick Actions
    GET_QUICK_ACTIONS: 'getQuickActions',
    ADD_QUICK_ACTION: 'addQuickAction',
    UPDATE_QUICK_ACTION: 'updateQuickAction',
    DELETE_QUICK_ACTION: 'deleteQuickAction',
    
    // Quick Requests
    GET_QUICK_REQUESTS: 'getQuickRequests',
    ADD_QUICK_REQUEST: 'addQuickRequest',
    UPDATE_QUICK_REQUEST: 'updateQuickRequest',
    DELETE_QUICK_REQUEST: 'deleteQuickRequest',
    
    // Tables
    GET_TABLES: 'getTables',
    UPDATE_TABLE: 'updateTable',
    
    // Analytics
    GET_ANALYTICS: 'getAnalytics',
    GET_SALES_DATA: 'getSalesData',
    GET_POPULAR_ITEMS: 'getPopularItems'
};

// Error Messages
const ERROR_MESSAGES = {
    en: {
        NETWORK_ERROR: 'Network error. Please check your connection.',
        INVALID_DATA: 'Invalid data provided.',
        UPLOAD_FAILED: 'Image upload failed. Please try again.',
        ORDER_FAILED: 'Failed to submit order. Please try again.',
        LOAD_FAILED: 'Failed to load data. Please refresh the page.',
        SAVE_FAILED: 'Failed to save changes. Please try again.',
        DELETE_FAILED: 'Failed to delete item. Please try again.'
    },
    ar: {
        NETWORK_ERROR: 'خطأ في الشبكة. يرجى التحقق من الاتصال.',
        INVALID_DATA: 'البيانات المدخلة غير صحيحة.',
        UPLOAD_FAILED: 'فشل في رفع الصورة. يرجى المحاولة مرة أخرى.',
        ORDER_FAILED: 'فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.',
        LOAD_FAILED: 'فشل في تحميل البيانات. يرجى تحديث الصفحة.',
        SAVE_FAILED: 'فشل في حفظ التغييرات. يرجى المحاولة مرة أخرى.',
        DELETE_FAILED: 'فشل في حذف العنصر. يرجى المحاولة مرة أخرى.'
    }
};

// Success Messages
const SUCCESS_MESSAGES = {
    en: {
        ORDER_SUBMITTED: 'Order submitted successfully!',
        REQUEST_SENT: 'Request sent successfully!',
        ITEM_SAVED: 'Item saved successfully!',
        ITEM_DELETED: 'Item deleted successfully!',
        CATEGORY_SAVED: 'Category saved successfully!',
        CATEGORY_DELETED: 'Category deleted successfully!',
        QUICK_ACTION_SAVED: 'Quick action saved successfully!',
        QUICK_ACTION_DELETED: 'Quick action deleted successfully!'
    },
    ar: {
        ORDER_SUBMITTED: 'تم إرسال الطلب بنجاح!',
        REQUEST_SENT: 'تم إرسال الطلب بنجاح!',
        ITEM_SAVED: 'تم حفظ العنصر بنجاح!',
        ITEM_DELETED: 'تم حذف العنصر بنجاح!',
        CATEGORY_SAVED: 'تم حفظ الفئة بنجاح!',
        CATEGORY_DELETED: 'تم حذف الفئة بنجاح!',
        QUICK_ACTION_SAVED: 'تم حفظ الإجراء السريع بنجاح!',
        QUICK_ACTION_DELETED: 'تم حذف الإجراء السريع بنجاح!'
    }
};

// Utility Functions
const Utils = {
    // Generate unique ID
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Format currency
    formatCurrency: (amount) => {
        return `${APP_CONFIG.CURRENCY}${parseFloat(amount).toFixed(2)}`;
    },
    
    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString();
    },
    
    // Format time
    formatTime: (date) => {
        return new Date(date).toLocaleTimeString();
    },
    
    // Get current timestamp
    getCurrentTimestamp: () => {
        return new Date().toISOString();
    },
    
    // Get table number from URL
    getTableNumber: () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('table') || '1';
    },
    
    // Show loading spinner
    showLoading: (element) => {
        if (element) {
            element.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        }
    },
    
    // Hide loading spinner
    hideLoading: () => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    },
    
    // Show toast notification
    showToast: (message, type = 'success') => {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        // Add to page
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove after hiding
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GOOGLE_SHEETS_CONFIG,
        CLOUDINARY_CONFIG,
        APP_CONFIG,
        API_ENDPOINTS,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        Utils
    };
}

