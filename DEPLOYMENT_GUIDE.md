# Deployment Guide - UNO Restaurant QR Menu System

This guide provides step-by-step instructions for deploying the UNO Restaurant QR Menu System to GitHub Pages.

## 📋 Pre-Deployment Checklist

### ✅ Required Accounts
- [ ] GitHub account
- [ ] Google Cloud Platform account (for Sheets API)
- [ ] Cloudinary account (for image uploads)

### ✅ Required Information
- [ ] Restaurant name and branding
- [ ] Menu categories and items
- [ ] Table numbers and layout
- [ ] Contact information

## 🔧 Step 1: Google Sheets Setup

### 1.1 Create Google Sheets Document

1. **Go to Google Sheets**: [sheets.google.com](https://sheets.google.com)
2. **Create a new spreadsheet** named "UNO Restaurant Menu"
3. **Create the following sheets** (tabs):
   - Categories
   - MenuItems
   - Orders
   - QuickActions

### 1.2 Set Up Sheet Structure

#### Categories Sheet
Create columns with headers:
```
id | name_en | name_ar | icon | sort_order | available
```

Example data:
```
CAT_001 | Pizza | بيتزا | fas fa-pizza-slice | 1 | true
CAT_002 | Beverages | مشروبات | fas fa-coffee | 2 | true
CAT_003 | Desserts | حلويات | fas fa-ice-cream | 3 | true
```

#### MenuItems Sheet
Create columns with headers:
```
id | name_en | name_ar | description_en | description_ar | category_id | image_url | sizes | prices | prep_time | available
```

Example data:
```
ITEM_001 | Margherita Pizza | بيتزا مارجريتا | Classic pizza with fresh tomatoes | بيتزا كلاسيكية بالطماطم | CAT_001 | https://example.com/image.jpg | Small,Medium,Large | 12,18,24 | 15 | true
```

#### Orders Sheet
Create columns with headers:
```
id | table_number | items | total_amount | status | created_at | customer_notes | type
```

#### QuickActions Sheet
Create columns with headers:
```
id | name_en | name_ar | icon | type | available
```

Example data:
```
QA_001 | Request Charcoal | طلب فحم | fas fa-fire | charcoal | true
QA_002 | Request Napkins | طلب مناديل | fas fa-tissue | napkins | true
```

### 1.3 Configure Google Sheets API

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Create a new project** or select existing
3. **Enable Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
5. **Make spreadsheet public**:
   - In Google Sheets, click "Share"
   - Change to "Anyone with the link can view"
   - Copy the spreadsheet ID from the URL

## 🖼️ Step 2: Cloudinary Setup

### 2.1 Create Cloudinary Account
1. **Sign up**: [cloudinary.com](https://cloudinary.com)
2. **Note your Cloud Name**: Found in dashboard (should be `dezvuqqrl`)

### 2.2 Create Upload Preset
1. **Go to Settings** > "Upload"
2. **Add upload preset**:
   - Preset name: `unsigned_preset`
   - Signing mode: "Unsigned"
   - Folder: `uno-restaurant/menu-items`
   - Save

## ⚙️ Step 3: Configure Application

### 3.1 Update Configuration File
Edit `js/config.js`:

```javascript
const CONFIG = {
    GOOGLE_SHEETS: {
        API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',
        SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID'
    },
    CLOUDINARY: {
        CLOUD_NAME: 'dezvuqqrl',
        UPLOAD_PRESET: 'unsigned_preset'
    },
    RESTAURANT: {
        NAME: 'UNO Restaurant & Café',
        CURRENCY: 'USD',
        CURRENCY_SYMBOL: '$',
        PHONE: '+1234567890',
        ADDRESS: 'Your Restaurant Address'
    }
};
```

### 3.2 Customize Branding
1. **Replace logo**: Add your logo to `images/logo.png`
2. **Update colors**: Modify CSS variables in `css/style.css`
3. **Update restaurant info**: Edit contact details in config

## 🚀 Step 4: Deploy to GitHub Pages

### 4.1 Create GitHub Repository
1. **Go to GitHub**: [github.com](https://github.com)
2. **Create new repository**:
   - Name: `uno-restaurant-menu`
   - Description: "QR Menu System for UNO Restaurant & Café"
   - Public repository
   - Don't initialize with README (we have one)

### 4.2 Upload Files
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial deployment of UNO Restaurant QR Menu System"

# Add remote origin
git remote add origin https://github.com/yourusername/uno-restaurant-menu.git

# Push to GitHub
git push -u origin main
```

### 4.3 Enable GitHub Pages
1. **Go to repository settings**
2. **Scroll to "Pages" section**
3. **Configure source**:
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"
4. **Save settings**
5. **Wait for deployment** (usually 5-10 minutes)

### 4.4 Access Your Site
Your site will be available at:
```
https://yourusername.github.io/uno-restaurant-menu/
```

## 🔗 Step 5: Generate QR Codes

### 5.1 Access QR Generator
Go to: `https://yourusername.github.io/uno-restaurant-menu/pages/qr-generator.html`

### 5.2 Generate Table QR Codes
1. **For single table**:
   - Enter table number
   - Select size (recommended: Medium 300x300)
   - Click "Generate QR Code"
   - Download PNG file

2. **For all tables**:
   - Enter total number of tables
   - Select size (recommended: Medium 200x200)
   - Check "Include table information"
   - Click "Generate All QR Codes"
   - Download ZIP file

### 5.3 Print and Install QR Codes
1. **Print on quality material**:
   - Use waterproof/durable material
   - Minimum size: 2x2 inches
   - High contrast (black on white)

2. **Place on tables**:
   - Visible location
   - Protected from spills
   - Include instruction: "Scan to view menu"

## 🧪 Step 6: Testing

### 6.1 Test All Views
- [ ] **Menu**: `https://yoursite.com`
- [ ] **Cashier**: `https://yoursite.com?view=cashier`
- [ ] **Admin**: `https://yoursite.com?view=admin`
- [ ] **QR Generator**: `https://yoursite.com/pages/qr-generator.html`

### 6.2 Test QR Codes
1. **Scan with mobile device**
2. **Verify correct table number**
3. **Test menu functionality**
4. **Place test order**

### 6.3 Test Responsive Design
- [ ] Mobile phones (various sizes)
- [ ] Tablets
- [ ] Desktop computers
- [ ] Different browsers

## 🔧 Step 7: Post-Deployment Configuration

### 7.1 Add Menu Items
1. **Access admin panel**: `https://yoursite.com?view=admin`
2. **Add categories** first
3. **Add menu items** with:
   - Photos (upload via Cloudinary)
   - Multiple sizes and prices
   - Accurate descriptions
   - Preparation times

### 7.2 Train Staff
1. **Cashier training**:
   - Order management
   - Status updates
   - Quick actions handling

2. **Admin training**:
   - Menu updates
   - Analytics review
   - System maintenance

### 7.3 Monitor System
- [ ] Check order processing
- [ ] Monitor Google Sheets data
- [ ] Verify image uploads
- [ ] Test QR code functionality

## 🔒 Step 8: Security & Maintenance

### 8.1 Security Checklist
- [ ] API keys are properly configured
- [ ] Google Sheets permissions are correct
- [ ] No sensitive data in public repository
- [ ] Regular security updates

### 8.2 Regular Maintenance
- [ ] **Weekly**: Update menu items and prices
- [ ] **Monthly**: Review analytics and performance
- [ ] **Quarterly**: Update system dependencies
- [ ] **As needed**: Add new features or fix issues

## 🆘 Troubleshooting

### Common Issues

#### Site Not Loading
- Check GitHub Pages deployment status
- Verify all files are uploaded
- Check for JavaScript errors in browser console

#### Google Sheets Not Working
- Verify API key is correct
- Check spreadsheet permissions (public viewing)
- Ensure spreadsheet ID is correct

#### Images Not Uploading
- Check Cloudinary configuration
- Verify upload preset settings
- Test with different image formats

#### QR Codes Not Working
- Verify QR library is loading
- Check generated URLs
- Test with different QR scanner apps

### Getting Help
1. **Check browser console** for error messages
2. **Review configuration** files
3. **Test with demo data** to isolate issues
4. **Contact support** if needed

## 📈 Performance Optimization

### 7.1 Speed Optimization
- [ ] Optimize images (use WebP format when possible)
- [ ] Minimize CSS and JavaScript files
- [ ] Enable browser caching
- [ ] Use CDN for external libraries

### 7.2 SEO Optimization
- [ ] Add meta descriptions
- [ ] Include structured data
- [ ] Optimize for local search
- [ ] Add Google Analytics

## 🎉 Launch Checklist

### Pre-Launch
- [ ] All menu items added
- [ ] QR codes printed and placed
- [ ] Staff trained
- [ ] System tested thoroughly
- [ ] Backup procedures in place

### Launch Day
- [ ] Monitor system performance
- [ ] Be available for support
- [ ] Collect customer feedback
- [ ] Document any issues

### Post-Launch
- [ ] Review analytics
- [ ] Gather staff feedback
- [ ] Plan improvements
- [ ] Schedule regular maintenance

---

**Congratulations!** Your UNO Restaurant QR Menu System is now live and ready to serve customers. Remember to regularly update your menu and monitor system performance for the best customer experience.

