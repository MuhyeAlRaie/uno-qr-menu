# UNO Restaurant & Café - QR Menu System

A fully client-side QR Menu System built with HTML, CSS, JavaScript, Bootstrap, and Google Sheets as the database. Designed for deployment on GitHub Pages with no backend requirements.

## 🌟 Features

### 📱 Digital Menu
- **Bilingual Support**: Arabic and English interface
- **3D Slider**: Dynamic and animated menu browsing
- **Responsive Design**: Works on all devices (mobile, tablet, desktop)
- **Item Details**: Photos, multiple sizes/prices, preparation time
- **Quick Actions**: Request charcoal, napkins, bill, or call waiter

### 🧾 Cashier Dashboard
- **Order Management**: View and update order status
- **Table Tracking**: Monitor all table orders in real-time
- **Quick Actions**: Handle customer requests efficiently
- **Sound Alerts**: Notifications for new orders
- **Order Details**: Complete order information and customer notes

### ⚙️ Admin Panel
- **Menu Management**: Add, edit, delete menu items
- **Image Upload**: Cloudinary integration for photos
- **Category Management**: Organize menu items
- **Analytics**: Sales data, popular items, performance metrics
- **Multi-size Support**: Different sizes and prices per item

### 🔗 QR Code System
- **Table-specific QR Codes**: Unique codes for each table
- **Bulk Generation**: Create QR codes for all tables at once
- **Print-ready**: Optimized for printing and placement
- **Direct Menu Access**: Customers scan to view table-specific menu

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd uno-qr-menu
```

### 2. Local Development
```bash
# Start a local server
python3 -m http.server 8080

# Or use any other static file server
npx serve .
```

### 3. Access the Application
- **Menu**: `http://localhost:8080`
- **Cashier**: `http://localhost:8080?view=cashier`
- **Admin**: `http://localhost:8080?view=admin`
- **QR Generator**: `http://localhost:8080/pages/qr-generator.html`

## 📋 Setup Instructions

### Google Sheets Configuration

1. **Create a Google Sheets document** with the following sheets:
   - `Categories`
   - `MenuItems`
   - `Orders`
   - `QuickActions`

2. **Set up Google Sheets API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create credentials (API Key)
   - Update `js/config.js` with your credentials

3. **Sheet Structure** (see `GOOGLE_SHEETS_SETUP.md` for details):

#### Categories Sheet
| id | name_en | name_ar | icon | sort_order | available |
|----|---------|---------|------|------------|-----------|

#### MenuItems Sheet
| id | name_en | name_ar | description_en | description_ar | category_id | image_url | sizes | prices | prep_time | available |
|----|---------|---------|----------------|----------------|-------------|-----------|-------|--------|-----------|-----------|

#### Orders Sheet
| id | table_number | items | total_amount | status | created_at | customer_notes | type |
|----|--------------|-------|--------------|--------|------------|----------------|------|

#### QuickActions Sheet
| id | name_en | name_ar | icon | type | available |
|----|---------|---------|------|------|-----------|

### Cloudinary Configuration

1. **Create a Cloudinary account** at [cloudinary.com](https://cloudinary.com)
2. **Get your credentials**:
   - Cloud Name: `dezvuqqrl` (already configured)
   - Upload Preset: `unsigned_preset` (create this in your dashboard)
3. **Configure upload preset**:
   - Go to Settings > Upload
   - Create unsigned upload preset
   - Set folder to `uno-restaurant/menu-items`

## 🎯 Usage Guide

### For Restaurant Staff

#### Cashier Dashboard
1. Access: `yoursite.com?view=cashier`
2. View incoming orders by status (Pending, Preparing, Ready, Served)
3. Click orders to view details and update status
4. Handle quick action requests from customers
5. Mark tables as available when bill is paid

#### Admin Panel
1. Access: `yoursite.com?view=admin`
2. **Menu Management**:
   - Add new items with photos and pricing
   - Edit existing items
   - Toggle item availability
   - Manage categories
3. **Analytics**:
   - View sales data
   - Track popular items
   - Monitor performance

### For Customers

#### Ordering Process
1. Scan QR code at table
2. Browse menu by categories
3. Select items and sizes
4. Add to cart
5. Submit order
6. Use quick actions for additional requests

### QR Code Setup

#### Generate QR Codes
1. Access: `yoursite.com/pages/qr-generator.html`
2. **Single QR Code**:
   - Enter table number
   - Select size
   - Generate and download
3. **Bulk Generation**:
   - Set total number of tables
   - Generate all at once
   - Download as ZIP file

#### Print and Place
1. Print QR codes on quality paper/material
2. Place on tables with clear visibility
3. Include instructions: "Scan to view menu"

## 🔧 Configuration

### Environment Variables
Update `js/config.js`:

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        API_KEY: 'your-google-sheets-api-key',
        SPREADSHEET_ID: 'your-spreadsheet-id'
    },
    CLOUDINARY: {
        CLOUD_NAME: 'dezvuqqrl',
        UPLOAD_PRESET: 'unsigned_preset'
    },
    RESTAURANT: {
        NAME: 'UNO Restaurant & Café',
        CURRENCY: 'USD',
        CURRENCY_SYMBOL: '$'
    }
};
```

### Customization

#### Branding
- Update restaurant name in `js/config.js`
- Replace logo in `images/` folder
- Modify colors in `css/style.css` (CSS variables)

#### Menu Categories
- Add/edit categories in Google Sheets
- Update icons using Font Awesome classes
- Adjust sort order for display sequence

#### Languages
- Modify translations in `js/translations.js`
- Add new languages by extending the translations object
- Update language selector in the interface

## 📱 Mobile Optimization

### Features
- Touch-friendly interface
- Swipe gestures for menu navigation
- Optimized for various screen sizes
- Fast loading on mobile networks

### Testing
- Test on actual mobile devices
- Verify QR code scanning works
- Check touch interactions
- Validate responsive design

## 🚀 Deployment

### GitHub Pages
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to Pages section
   - Select source: Deploy from branch
   - Choose branch: main
   - Save

3. **Access your site**:
   - URL: `https://yourusername.github.io/repository-name`

### Custom Domain (Optional)
1. Add `CNAME` file with your domain
2. Configure DNS settings
3. Enable HTTPS in GitHub Pages settings

## 🔍 Troubleshooting

### Common Issues

#### Google Sheets API Errors
- Verify API key is correct
- Check spreadsheet sharing permissions
- Ensure API is enabled in Google Cloud Console

#### Images Not Loading
- Check Cloudinary configuration
- Verify upload preset settings
- Test image URLs manually

#### QR Codes Not Working
- Ensure QR library is loading
- Check network connectivity
- Verify QR code URLs are correct

#### Mobile Issues
- Test on actual devices
- Check responsive design
- Verify touch interactions

### Demo Mode
The system includes a demo mode that works without external APIs:
- Automatically activates when Google Sheets API fails
- Includes sample data for testing
- Perfect for development and demonstrations

## 📊 Analytics & Monitoring

### Built-in Analytics
- Order tracking
- Popular items analysis
- Sales by date
- Customer preferences

### External Integration
- Google Analytics (add tracking code)
- Custom analytics solutions
- Performance monitoring

## 🔒 Security Considerations

### Data Protection
- No sensitive data stored locally
- Secure API communications
- Input validation and sanitization

### Access Control
- Admin panel access control
- Cashier dashboard restrictions
- Customer data privacy

## 🤝 Support & Maintenance

### Regular Updates
- Menu items and prices
- Seasonal categories
- System improvements

### Monitoring
- Check order processing
- Monitor system performance
- Update external dependencies

## 📄 License

This project is created for UNO Restaurant & Café. All rights reserved.

## 🙏 Acknowledgments

- Bootstrap for responsive framework
- Font Awesome for icons
- Google Sheets for database
- Cloudinary for image management
- QR.js for QR code generation

---

**UNO Restaurant & Café QR Menu System** - Bringing digital innovation to dining experiences.

