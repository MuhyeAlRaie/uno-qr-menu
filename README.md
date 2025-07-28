# UNO Restaurant & Café - QR Menu System

A fully client-side QR Menu System for restaurants using HTML, CSS, JavaScript, Bootstrap, and Google Sheets as the database. Deployable on GitHub Pages with no backend required.

## 🌟 Features

### Customer Menu Interface
- **Multilingual Support**: Available in both Arabic and English
- **3D Slider Menu**: Dynamic and animated menu display
- **Item Details**: Photos, multiple sizes/prices, preparation time
- **Quick Actions**: Request charcoal, napkins, bill, or call waiter
- **Mobile Responsive**: Optimized for all devices

### Cashier Dashboard
- **Real-time Order Management**: View and update order statuses
- **Sound Alerts**: Notifications for new orders and requests
- **Quick Requests Handling**: Manage customer service requests
- **Table Status**: Monitor table availability
- **Order Processing**: Update order status from pending to completed

### Admin Panel
- **Menu Management**: Add, edit, delete menu items with Cloudinary image upload
- **Category Management**: Organize menu items into categories
- **Quick Actions Setup**: Configure customer request buttons
- **Analytics Dashboard**: View sales data, popular items, and performance metrics
- **Order Management**: View and manage all orders

### QR Code Generator
- **Bulk Generation**: Create QR codes for all tables at once
- **Customizable**: Adjust size, colors, and error correction
- **Print Ready**: High-quality PNG format for printing
- **Download Options**: Individual or bulk download

## 🚀 Quick Start

### 1. Setup Google Sheets Database

1. Create a new Google Sheets document
2. Create the following sheets:
   - `MenuItems`
   - `Categories` 
   - `Orders`
   - `QuickRequests`
   - `QuickActions`
   - `Tables`

3. Set up Google Apps Script:
   - Go to Extensions > Apps Script
   - Replace the default code with the provided Apps Script code
   - Deploy as web app with execute permissions for "Anyone"
   - Copy the web app URL

### 2. Configure Cloudinary

1. Create a free Cloudinary account
2. Note your cloud name: `dezvuqqrl`
3. Create an unsigned upload preset: `unsigned_preset`

### 3. Deploy to GitHub Pages

1. Fork or download this repository
2. Update `js/config.js` with your Google Sheets web app URL
3. Enable GitHub Pages in repository settings
4. Your menu will be available at: `https://yourusername.github.io/uno-qr-menu/`

### 4. Generate QR Codes

1. Open `qr-generator.html`
2. Enter your GitHub Pages URL
3. Generate QR codes for your tables
4. Print and place QR codes on tables

## 📁 Project Structure

```
uno-qr-menu/
├── index.html              # Main menu interface
├── cashier.html            # Cashier dashboard
├── admin.html              # Admin panel
├── qr-generator.html       # QR code generator
├── css/
│   ├── style.css           # Main menu styles
│   ├── cashier.css         # Cashier dashboard styles
│   └── admin.css           # Admin panel styles
├── js/
│   ├── config.js           # Configuration settings
│   ├── googleSheets.js     # Google Sheets API integration
│   ├── language.js         # Multilingual support
│   ├── menu.js             # Menu functionality
│   ├── cart.js             # Shopping cart management
│   ├── app.js              # Main application logic
│   ├── cashier.js          # Cashier dashboard logic
│   ├── admin.js            # Admin panel logic
│   ├── cloudinary.js       # Image upload integration
│   └── utils.js            # Utility functions
├── images/                 # Static images
└── README.md              # This file
```

## ⚙️ Configuration

### Google Sheets Configuration

Update `js/config.js` with your settings:

```javascript
const APP_CONFIG = {
    GOOGLE_SHEETS: {
        WEB_APP_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'
    },
    CLOUDINARY: {
        cloudName: 'dezvuqqrl',
        uploadPreset: 'unsigned_preset'
    }
};
```

### Google Sheets Schema

#### MenuItems Sheet
| Column | Description |
|--------|-------------|
| id | Unique identifier |
| nameEn | Item name in English |
| nameAr | Item name in Arabic |
| descriptionEn | Description in English |
| descriptionAr | Description in Arabic |
| categoryId | Category reference |
| imageUrl | Cloudinary image URL |
| sizes | JSON array of sizes and prices |
| prepTime | Preparation time in minutes |
| available | Boolean availability status |

#### Categories Sheet
| Column | Description |
|--------|-------------|
| id | Unique identifier |
| nameEn | Category name in English |
| nameAr | Category name in Arabic |
| icon | Font Awesome icon class |
| order | Display order |

#### Orders Sheet
| Column | Description |
|--------|-------------|
| id | Unique identifier |
| tableNumber | Table number |
| items | JSON array of ordered items |
| total | Total amount |
| status | Order status |
| timestamp | Order timestamp |
| customerNote | Special instructions |

## 🎨 Customization

### Styling
- Modify CSS files in the `css/` directory
- Update color schemes in CSS variables
- Customize animations and transitions

### Languages
- Add new languages in `js/language.js`
- Update language switcher in HTML files
- Add RTL support for Arabic languages

### Features
- Add new quick actions in admin panel
- Customize order statuses
- Add new analytics charts

## 📱 Mobile Optimization

The system is fully responsive and optimized for:
- Smartphones (iOS/Android)
- Tablets
- Desktop computers
- Touch interfaces

## 🔧 Development

### Local Development
1. Clone the repository
2. Start a local HTTP server:
   ```bash
   python3 -m http.server 8080
   ```
3. Open `http://localhost:8080` in your browser

### Testing
- Test all interfaces: menu, cashier, admin, QR generator
- Verify mobile responsiveness
- Test with different browsers
- Validate Google Sheets integration

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in Settings
3. Select source branch (usually `main`)
4. Access your site at `https://yourusername.github.io/repository-name/`

### Custom Domain (Optional)
1. Add CNAME file with your domain
2. Configure DNS settings
3. Enable HTTPS in GitHub Pages settings

## 🔒 Security

- No sensitive data stored in client-side code
- Google Sheets API handles data securely
- Cloudinary manages image uploads securely
- No backend server required

## 📊 Analytics

The admin panel provides insights on:
- Most ordered items
- Revenue trends
- Category performance
- Order status distribution
- Table utilization

## 🆘 Troubleshooting

### Common Issues

**QR Codes not generating:**
- Check if QR code library is loading
- Verify internet connection
- Ensure JavaScript is enabled

**Google Sheets not connecting:**
- Verify web app URL in config.js
- Check Apps Script deployment permissions
- Ensure sheets have correct column headers

**Images not uploading:**
- Verify Cloudinary configuration
- Check upload preset settings
- Ensure file size is under 10MB

**Menu not loading:**
- Check browser console for errors
- Verify Google Sheets data format
- Ensure all required fields are filled

## 📞 Support

For technical support or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify configuration settings
4. Test with sample data

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🔄 Updates

To update your deployment:
1. Pull latest changes from repository
2. Update configuration if needed
3. Test locally
4. Push to GitHub Pages

---

**UNO Restaurant & Café QR Menu System** - Bringing digital innovation to dining experiences! 🍽️✨

