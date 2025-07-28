// Configuration file for UNO QR Menu System

// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://cvrpsuhlejttckonqisc.supabase.co', // Replace with actual Supabase URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cnBzdWhsZWp0dGNrb25xaXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTk3MDUsImV4cCI6MjA2OTI5NTcwNX0.ec4rqH1xJr-wOL6pR_w0quErPwTS7a8MDG0Z49He3qI' // Replace with actual Supabase anon key
};

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
    cloudName: 'dezvuqqrl',
    uploadPreset: 'unsigned_preset'
};

// Application Settings
const APP_CONFIG = {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar'],
    soundAlerts: {
        newOrder: '/assets/sounds/new-order.mp3',
        quickAction: '/assets/sounds/quick-action.mp3'
    },
    orderStatuses: {
        pending: { en: 'Pending', ar: 'في الانتظار' },
        preparing: { en: 'Preparing', ar: 'قيد التحضير' },
        completed: { en: 'Completed', ar: 'مكتمل' },
        cancelled: { en: 'Cancelled', ar: 'ملغي' }
    },
    quickActionStatuses: {
        pending: { en: 'Pending', ar: 'في الانتظار' },
        completed: { en: 'Completed', ar: 'مكتمل' }
    }
};

// Export configurations for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, CLOUDINARY_CONFIG, APP_CONFIG };
}

