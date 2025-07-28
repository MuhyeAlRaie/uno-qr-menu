# Deployment Guide - UNO Restaurant QR Menu System

This guide will walk you through deploying the UNO Restaurant QR Menu System to GitHub Pages with Google Sheets as the backend.

## 📋 Prerequisites

- GitHub account
- Google account
- Basic understanding of GitHub Pages
- Text editor (optional, for configuration)

## 🚀 Step-by-Step Deployment

### Step 1: Set Up Google Sheets Backend

#### 1.1 Create Google Sheets Document
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Rename it to "UNO Restaurant Menu Database"

#### 1.2 Set Up Google Apps Script
1. In your Google Sheet, go to **Extensions** > **Apps Script**
2. Delete the default `myFunction()` code
3. Copy and paste the entire content from `google-apps-script.js`
4. Save the project (Ctrl+S or Cmd+S)
5. Name the project "UNO Menu API"

#### 1.3 Deploy as Web App
1. Click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Type"
3. Select **Web app**
4. Fill in the deployment settings:
   - **Description**: "UNO Menu API v1"
   - **Execute as**: Me
   - **Who has access**: Anyone
5. Click **Deploy**
6. **Important**: Copy the Web app URL - you'll need this later
7. Click **Done**

#### 1.4 Initialize Default Data (Optional)
1. In the Apps Script editor, find the `initializeDefaultData()` function
2. Click **Run** to execute it
3. This will create sample categories and quick actions

### Step 2: Set Up Cloudinary (Image Upload)

#### 2.1 Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account
3. Note your **Cloud Name**: `dezvuqqrl` (already configured)

#### 2.2 Create Upload Preset
1. In Cloudinary dashboard, go to **Settings** > **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set **Preset name**: `unsigned_preset`
5. Set **Signing Mode**: Unsigned
6. Set **Folder**: `uno-restaurant` (optional)
7. Click **Save**

### Step 3: Deploy to GitHub Pages

#### 3.1 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click **New repository**
3. Name it: `uno-qr-menu` (or your preferred name)
4. Make it **Public**
5. Check **Add a README file**
6. Click **Create repository**

#### 3.2 Upload Project Files
**Option A: Using GitHub Web Interface**
1. Click **uploading an existing file**
2. Drag and drop all project files
3. Commit changes

**Option B: Using Git Commands**
```bash
git clone https://github.com/yourusername/uno-qr-menu.git
cd uno-qr-menu
# Copy all project files here
git add .
git commit -m "Initial commit: UNO QR Menu System"
git push origin main
```

#### 3.3 Configure the Application
1. Open `js/config.js` in your repository
2. Update the Google Sheets Web App URL:
```javascript
const APP_CONFIG = {
    GOOGLE_SHEETS: {
        WEB_APP_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
    },
    // ... rest of config
};
```
3. Commit the changes

#### 3.4 Enable GitHub Pages
1. Go to your repository **Settings**
2. Scroll down to **Pages** section
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch
5. Select **/ (root)** folder
6. Click **Save**
7. Your site will be available at: `https://yourusername.github.io/uno-qr-menu/`

### Step 4: Generate QR Codes

#### 4.1 Access QR Generator
1. Go to your deployed site: `https://yourusername.github.io/uno-qr-menu/qr-generator.html`
2. Enter your GitHub Pages URL in the "Base URL" field
3. Set table range (e.g., 1 to 20)
4. Click **Generate Tables**

#### 4.2 Generate and Download QR Codes
1. Click on any table to generate its QR code
2. Customize size, colors, and error correction as needed
3. Download individual QR codes or use **Download All QR Codes**
4. Print QR codes and place them on restaurant tables

### Step 5: Access Different Interfaces

Your deployed system will have these URLs:

- **Customer Menu**: `https://yourusername.github.io/uno-qr-menu/`
- **Cashier Dashboard**: `https://yourusername.github.io/uno-qr-menu/cashier.html`
- **Admin Panel**: `https://yourusername.github.io/uno-qr-menu/admin.html`
- **QR Generator**: `https://yourusername.github.io/uno-qr-menu/qr-generator.html`

## 🔧 Configuration Options

### Customizing the Menu
1. Access the admin panel
2. Add categories, menu items, and quick actions
3. Upload images using the built-in Cloudinary integration
4. Set prices, descriptions, and availability

### Language Support
- The system supports English and Arabic by default
- Language switching is automatic based on user preference
- To add more languages, modify `js/language.js`

### Styling Customization
- Modify CSS files in the `css/` directory
- Update color schemes by changing CSS variables
- Customize animations and transitions

## 🔒 Security Considerations

### Google Apps Script Security
- The web app is deployed with "Anyone" access for public use
- No sensitive data is exposed in client-side code
- All data operations go through Google's secure infrastructure

### Cloudinary Security
- Uses unsigned upload preset for public image uploads
- Images are stored securely on Cloudinary's CDN
- No API secrets exposed in client-side code

## 📱 Testing Your Deployment

### Test Customer Flow
1. Scan a QR code or visit menu URL with `?table=1` parameter
2. Browse menu items and categories
3. Add items to cart and place an order
4. Test quick actions (request charcoal, napkins, etc.)

### Test Cashier Dashboard
1. Access cashier dashboard
2. Verify orders appear in real-time
3. Test order status updates
4. Check quick requests handling

### Test Admin Panel
1. Access admin panel
2. Add/edit menu items with image upload
3. Manage categories and quick actions
4. View analytics and reports

## 🐛 Troubleshooting

### Common Issues

**QR Codes not working:**
- Verify the base URL in QR generator matches your GitHub Pages URL
- Ensure QR codes include the `?table=X` parameter

**Google Sheets not connecting:**
- Check if the web app URL in `config.js` is correct
- Verify the Apps Script is deployed with "Anyone" access
- Check browser console for error messages

**Images not uploading:**
- Verify Cloudinary cloud name and upload preset
- Check file size (must be under 10MB)
- Ensure internet connection is stable

**Menu items not displaying:**
- Check if categories and menu items exist in Google Sheets
- Verify data format matches the expected schema
- Check browser console for JavaScript errors

### Getting Help
1. Check browser console for error messages
2. Verify all configuration settings
3. Test with sample data first
4. Ensure all external libraries are loading

## 🔄 Updates and Maintenance

### Updating the System
1. Make changes to your local files
2. Commit and push to GitHub
3. GitHub Pages will automatically update

### Backing Up Data
- Google Sheets automatically saves all data
- Export sheets as CSV for additional backup
- Consider setting up automated backups

### Monitoring Usage
- Use Google Sheets to monitor orders and analytics
- Check GitHub Pages analytics for traffic data
- Monitor Cloudinary usage for image storage

## 🎯 Next Steps

After successful deployment:

1. **Train Staff**: Show cashiers and admins how to use their respective dashboards
2. **Test Thoroughly**: Place test orders and verify the entire workflow
3. **Customize Content**: Add your actual menu items, prices, and images
4. **Print QR Codes**: Generate and place QR codes on all tables
5. **Go Live**: Start accepting customer orders through the system

## 📞 Support

If you encounter issues during deployment:

1. Check this guide for troubleshooting steps
2. Verify all configuration settings
3. Test each component individually
4. Check browser console for error messages

---

**Congratulations!** 🎉 Your UNO Restaurant QR Menu System is now live and ready to serve customers!

For ongoing support and updates, keep this documentation handy and refer to the main README.md file for detailed feature information.

