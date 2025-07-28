// Language Support for UNO Restaurant QR Menu System

class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || APP_CONFIG.DEFAULT_LANGUAGE;
        this.translations = {};
        this.isRTL = false;
        this.init();
    }

    init() {
        this.loadTranslations();
        this.setLanguage(this.currentLanguage);
        this.setupLanguageToggle();
    }

    loadTranslations() {
        // Define translations for the application
        this.translations = {
            en: {
                // Header
                'restaurant_name': 'UNO Restaurant & Café',
                'table': 'Table',
                'language_toggle': 'العربية',
                
                // Menu sections
                'quick_actions': 'Quick Actions',
                'our_menu': 'Our Menu',
                'your_order': 'Your Order',
                'total': 'Total',
                'submit_order': 'Submit Order',
                'add_to_cart': 'Add to Cart',
                'remove_from_cart': 'Remove',
                
                // Order process
                'order_submitted': 'Order Submitted!',
                'order_success_message': 'Your order has been sent to the kitchen. Please wait for confirmation.',
                'continue': 'Continue',
                'loading_menu': 'Loading Menu...',
                
                // Item details
                'preparation_time': 'Preparation Time',
                'minutes': 'minutes',
                'select_size': 'Select Size',
                'quantity': 'Quantity',
                'special_instructions': 'Special Instructions',
                'optional': 'Optional',
                
                // Quick actions
                'request_charcoal': 'Request Charcoal',
                'request_napkins': 'Request Napkins',
                'request_bill': 'Request Bill',
                'call_waiter': 'Call Waiter',
                'request_sent': 'Request sent successfully!',
                
                // Cart
                'cart_empty': 'Your cart is empty',
                'cart_item_added': 'Item added to cart',
                'cart_item_removed': 'Item removed from cart',
                'cart_cleared': 'Cart cleared',
                
                // Categories
                'appetizers': 'Appetizers',
                'main_courses': 'Main Courses',
                'desserts': 'Desserts',
                'beverages': 'Beverages',
                'hot_drinks': 'Hot Drinks',
                'cold_drinks': 'Cold Drinks',
                'shisha': 'Shisha',
                
                // Sizes
                'small': 'Small',
                'medium': 'Medium',
                'large': 'Large',
                'extra_large': 'Extra Large',
                
                // Status
                'available': 'Available',
                'unavailable': 'Unavailable',
                'out_of_stock': 'Out of Stock',
                
                // Errors
                'error_loading': 'Error loading data',
                'error_submitting': 'Error submitting order',
                'error_network': 'Network error. Please check your connection.',
                'try_again': 'Try Again',
                
                // Admin
                'dashboard': 'Dashboard',
                'menu_items': 'Menu Items',
                'categories': 'Categories',
                'orders': 'Orders',
                'analytics': 'Analytics',
                'add_new': 'Add New',
                'edit': 'Edit',
                'delete': 'Delete',
                'save': 'Save',
                'cancel': 'Cancel',
                'confirm_delete': 'Are you sure you want to delete this item?',
                
                // Cashier
                'cashier_dashboard': 'Cashier Dashboard',
                'active_orders': 'Active Orders',
                'quick_requests': 'Quick Requests',
                'table_status': 'Table Status',
                'pending': 'Pending',
                'preparing': 'Preparing',
                'ready': 'Ready',
                'completed': 'Completed',
                'mark_as_preparing': 'Mark as Preparing',
                'mark_as_ready': 'Mark as Ready',
                'mark_as_completed': 'Mark as Completed'
            },
            ar: {
                // Header
                'restaurant_name': 'مطعم وكافيه أونو',
                'table': 'طاولة',
                'language_toggle': 'English',
                
                // Menu sections
                'quick_actions': 'إجراءات سريعة',
                'our_menu': 'قائمتنا',
                'your_order': 'طلبك',
                'total': 'المجموع',
                'submit_order': 'إرسال الطلب',
                'add_to_cart': 'إضافة للسلة',
                'remove_from_cart': 'إزالة',
                
                // Order process
                'order_submitted': 'تم إرسال الطلب!',
                'order_success_message': 'تم إرسال طلبك إلى المطبخ. يرجى انتظار التأكيد.',
                'continue': 'متابعة',
                'loading_menu': 'جاري تحميل القائمة...',
                
                // Item details
                'preparation_time': 'وقت التحضير',
                'minutes': 'دقيقة',
                'select_size': 'اختر الحجم',
                'quantity': 'الكمية',
                'special_instructions': 'تعليمات خاصة',
                'optional': 'اختياري',
                
                // Quick actions
                'request_charcoal': 'طلب فحم',
                'request_napkins': 'طلب مناديل',
                'request_bill': 'طلب الفاتورة',
                'call_waiter': 'استدعاء النادل',
                'request_sent': 'تم إرسال الطلب بنجاح!',
                
                // Cart
                'cart_empty': 'سلتك فارغة',
                'cart_item_added': 'تم إضافة العنصر للسلة',
                'cart_item_removed': 'تم إزالة العنصر من السلة',
                'cart_cleared': 'تم مسح السلة',
                
                // Categories
                'appetizers': 'المقبلات',
                'main_courses': 'الأطباق الرئيسية',
                'desserts': 'الحلويات',
                'beverages': 'المشروبات',
                'hot_drinks': 'المشروبات الساخنة',
                'cold_drinks': 'المشروبات الباردة',
                'shisha': 'الشيشة',
                
                // Sizes
                'small': 'صغير',
                'medium': 'متوسط',
                'large': 'كبير',
                'extra_large': 'كبير جداً',
                
                // Status
                'available': 'متوفر',
                'unavailable': 'غير متوفر',
                'out_of_stock': 'نفد المخزون',
                
                // Errors
                'error_loading': 'خطأ في تحميل البيانات',
                'error_submitting': 'خطأ في إرسال الطلب',
                'error_network': 'خطأ في الشبكة. يرجى التحقق من الاتصال.',
                'try_again': 'حاول مرة أخرى',
                
                // Admin
                'dashboard': 'لوحة التحكم',
                'menu_items': 'عناصر القائمة',
                'categories': 'الفئات',
                'orders': 'الطلبات',
                'analytics': 'التحليلات',
                'add_new': 'إضافة جديد',
                'edit': 'تعديل',
                'delete': 'حذف',
                'save': 'حفظ',
                'cancel': 'إلغاء',
                'confirm_delete': 'هل أنت متأكد من حذف هذا العنصر؟',
                
                // Cashier
                'cashier_dashboard': 'لوحة الكاشير',
                'active_orders': 'الطلبات النشطة',
                'quick_requests': 'الطلبات السريعة',
                'table_status': 'حالة الطاولات',
                'pending': 'في الانتظار',
                'preparing': 'قيد التحضير',
                'ready': 'جاهز',
                'completed': 'مكتمل',
                'mark_as_preparing': 'تحديد كقيد التحضير',
                'mark_as_ready': 'تحديد كجاهز',
                'mark_as_completed': 'تحديد كمكتمل'
            }
        };
    }

    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Language ${lang} not supported, falling back to ${APP_CONFIG.DEFAULT_LANGUAGE}`);
            lang = APP_CONFIG.DEFAULT_LANGUAGE;
        }

        this.currentLanguage = lang;
        this.isRTL = lang === 'ar';
        
        // Store in localStorage
        localStorage.setItem('language', lang);
        
        // Update HTML attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = this.isRTL ? 'rtl' : 'ltr';
        
        // Update body class for styling
        document.body.classList.toggle('rtl', this.isRTL);
        document.body.classList.toggle('ltr', !this.isRTL);
        
        // Update all translatable elements
        this.updateTranslations();
        
        // Update language toggle button
        this.updateLanguageToggle();
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang, isRTL: this.isRTL } 
        }));
    }

    updateTranslations() {
        // Update elements with data-en and data-ar attributes
        const elements = document.querySelectorAll('[data-en], [data-ar]');
        elements.forEach(element => {
            const key = this.currentLanguage === 'en' ? 'data-en' : 'data-ar';
            const text = element.getAttribute(key);
            if (text) {
                element.textContent = text;
            }
        });

        // Update elements with data-translate attribute
        const translatableElements = document.querySelectorAll('[data-translate]');
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update placeholders
        const placeholderElements = document.querySelectorAll('[data-placeholder-en], [data-placeholder-ar]');
        placeholderElements.forEach(element => {
            const key = this.currentLanguage === 'en' ? 'data-placeholder-en' : 'data-placeholder-ar';
            const placeholder = element.getAttribute(key);
            if (placeholder) {
                element.placeholder = placeholder;
            }
        });
    }

    updateLanguageToggle() {
        const langToggle = document.getElementById('langText');
        if (langToggle) {
            langToggle.textContent = this.currentLanguage === 'en' ? 'العربية' : 'English';
        }
    }

    setupLanguageToggle() {
        // Add event listener for language toggle
        window.toggleLanguage = () => {
            const newLang = this.currentLanguage === 'en' ? 'ar' : 'en';
            this.setLanguage(newLang);
        };
    }

    translate(key, params = {}) {
        let translation = this.translations[this.currentLanguage][key] || 
                         this.translations[APP_CONFIG.DEFAULT_LANGUAGE][key] || 
                         key;

        // Replace parameters in translation
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });

        return translation;
    }

    translateElement(element, key, params = {}) {
        const translation = this.translate(key, params);
        element.textContent = translation;
        return translation;
    }

    formatNumber(number) {
        // Format numbers according to language
        if (this.currentLanguage === 'ar') {
            // Convert to Arabic-Indic numerals
            return number.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
        }
        return number.toString();
    }

    formatCurrency(amount) {
        const formattedAmount = parseFloat(amount).toFixed(2);
        if (this.currentLanguage === 'ar') {
            return `${this.formatNumber(formattedAmount)} ${APP_CONFIG.CURRENCY}`;
        }
        return `${APP_CONFIG.CURRENCY}${formattedAmount}`;
    }

    formatDate(date) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const locale = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
        return new Date(date).toLocaleDateString(locale, options);
    }

    formatTime(date) {
        const options = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const locale = this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
        return new Date(date).toLocaleTimeString(locale, options);
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Check if current language is RTL
    isRightToLeft() {
        return this.isRTL;
    }

    // Get available languages
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    // Add or update translation
    addTranslation(lang, key, value) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        this.translations[lang][key] = value;
    }

    // Bulk add translations
    addTranslations(lang, translations) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        Object.assign(this.translations[lang], translations);
    }
}

// Create global instance
const languageManager = new LanguageManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}

