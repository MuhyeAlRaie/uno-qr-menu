# UNO Restaurant & Café - QR Menu System

A fully client-side QR Menu System built with HTML, CSS, JavaScript, Bootstrap, and Supabase, designed for deployment on GitHub Pages.

## 🌟 Features

### Customer Menu (`/menu/`)
- **Bilingual Support**: Full Arabic and English language support with RTL layout
- **3D Animations**: Engaging 3D sliders and interactive elements for categories and items
- **QR Code Integration**: Each table has unique QR codes (`?table=X` parameter)
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop devices
- **Interactive Cart**: Real-time cart management with item customization
- **Quick Actions**: Buttons for requesting charcoal, napkins, bill, or calling waiter

### Cashier Dashboard (`/cashier/`)
- **Real-time Updates**: Live order and request monitoring via Supabase real-time subscriptions
- **Sound Alerts**: Audio notifications for new orders and quick action requests
- **Order Management**: Update order status (pending → preparing → completed)
- **Table Status**: Visual table management with availability tracking
- **Statistics**: Today's orders, revenue, and performance metrics
- **Quick Action Handling**: Manage customer service requests efficiently

### Admin Panel (`/admin/`)
- **Menu Management**: Full CRUD operations for categories, menu items, and quick actions
- **Cloudinary Integration**: Professional image upload and management
- **Multi-size Pricing**: Support for different sizes and prices per menu item
- **Order Analytics**: Comprehensive sales reports and performance charts
- **Bilingual Content**: Manage both Arabic and English content
- **Real-time Dashboard**: Live statistics and recent orders overview

## 🏗️ Architecture

### Database Schema (Supabase)
```sql
-- Categories for menu organization
categories (id, name_en, name_ar, display_order)

-- Menu items with multilingual support
menu_items (id, category_id, name_en, name_ar, description_en, description_ar, image_url, estimated_prep_time_minutes, is_available, display_order)

-- Flexible pricing for different sizes
item_prices (id, item_id, size_en, size_ar, price)

-- Quick action buttons
quick_actions (id, action_en, action_ar, icon_url, display_order)

-- Order management
orders (id, table_number, order_time, status)
order_items (id, order_id, item_id, item_price_id, quantity, notes)

-- Quick action requests
quick_action_requests (id, table_number, action_id, request_time, status)

-- Analytics data
analytics (id, item_id, order_count, total_sales, record_date)
```

### File Structure
```
uno_qr_menu/
├── index.html                 # Main navigation page
├── config.js                  # Configuration for Supabase and Cloudinary
├── supabase/
│   ├── schema.sql            # Database schema
│   └── client.js             # Supabase client and API functions
├── menu/
│   ├── index.html            # Customer menu interface
│   ├── styles.css            # Menu-specific styles
│   └── script.js             # Menu functionality
├── cashier/
│   ├── index.html            # Cashier dashboard
│   ├── styles.css            # Cashier-specific styles
│   └── script.js             # Cashier functionality
├── admin/
│   ├── index.html            # Admin panel
│   ├── styles.css            # Admin-specific styles
│   └── script.js             # Admin functionality
└── assets/
    ├── images/               # Menu item images
    └── sounds/               # Sound alert files
```

## 🚀 Setup Instructions

### 1. Supabase Configuration
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in the SQL editor
3. Get your project URL and anon key from Settings > API
4. Update `config.js` with your Supabase credentials:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_URL',
       anonKey: 'YOUR_SUPABASE_ANON_KEY'
   };
   ```

### 2. Cloudinary Configuration
1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Create an unsigned upload preset in Settings > Upload
3. Update `config.js` with your Cloudinary settings:
   ```javascript
   const CLOUDINARY_CONFIG = {
       cloudName: 'your_cloud_name',
       uploadPreset: 'your_upload_preset'
   };
   ```

### 3. GitHub Pages Deployment
1. Create a new GitHub repository
2. Upload all files to the repository
3. Enable GitHub Pages in repository Settings > Pages
4. Select "Deploy from a branch" and choose your main branch
5. Your site will be available at `https://username.github.io/repository-name`

### 4. QR Code Generation
Generate QR codes for each table that point to:
```
https://your-domain.com/menu/?table=1
https://your-domain.com/menu/?table=2
... etc
```

## 📱 Usage

### For Customers
1. Scan the QR code at your table
2. Browse the menu in your preferred language
3. Add items to cart with size and quantity selection
4. Use quick actions for service requests
5. Submit your order when ready

### For Cashiers
1. Monitor incoming orders in real-time
2. Update order status as they progress
3. Handle quick action requests
4. Track table availability
5. View daily statistics

### For Administrators
1. Manage menu categories and items
2. Upload and organize menu images
3. Set pricing for different sizes
4. Configure quick action buttons
5. View detailed analytics and reports

## 🎨 Customization

### Styling
- Colors and themes can be modified in the CSS custom properties (`:root` section)
- Responsive breakpoints are defined for mobile, tablet, and desktop
- RTL support is built-in for Arabic language

### Languages
- Add new languages by extending the translation system
- Update the `updateLanguage()` functions in each module
- Add new language options to the language toggle

### Features
- Extend the database schema for additional functionality
- Add new quick actions through the admin panel
- Customize sound alerts by replacing audio files

## 🔧 Technical Details

### Real-time Updates
- Uses Supabase real-time subscriptions for live order updates
- Automatic refresh of cashier dashboard when new orders arrive
- Sound notifications for enhanced user experience

### Performance Optimizations
- Lazy loading of images
- Efficient database queries with proper indexing
- Client-side caching of frequently accessed data
- Optimized CSS animations for smooth performance

### Security Considerations
- All database operations use Supabase Row Level Security (RLS)
- Client-side validation with server-side enforcement
- Secure image uploads through Cloudinary

## 🐛 Troubleshooting

### Common Issues
1. **Orders not appearing**: Check Supabase configuration and network connectivity
2. **Images not loading**: Verify Cloudinary settings and upload preset
3. **Real-time updates not working**: Ensure Supabase real-time is enabled
4. **Sound alerts not playing**: Check browser permissions and audio file paths

### Browser Compatibility
- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Mobile browsers (iOS Safari 13+, Chrome Mobile 80+)
- JavaScript must be enabled

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section
- Review the Supabase and Cloudinary documentation

---

**UNO Restaurant & Café QR Menu System** - Bringing digital innovation to dining experiences! 🍽️✨

