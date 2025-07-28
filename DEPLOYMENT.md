# Deployment Guide - UNO QR Menu System

## Prerequisites

Before deploying the UNO QR Menu System, ensure you have:

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
3. **GitHub Account**: For GitHub Pages deployment
4. **Basic understanding of**: HTML, CSS, JavaScript, and database concepts

## Step-by-Step Deployment

### 1. Supabase Setup

#### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name (e.g., "uno-restaurant-menu")
3. Set a strong database password
4. Select your preferred region

#### Configure Database
1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the entire content from `supabase/schema.sql`
3. Paste and execute the SQL to create all necessary tables
4. Verify tables are created in the Table Editor

#### Get API Credentials
1. Go to Settings → API
2. Copy your Project URL and anon/public key
3. Save these for the configuration step

#### Enable Real-time (Optional but Recommended)
1. Go to Database → Replication
2. Enable real-time for the following tables:
   - orders
   - order_items
   - quick_action_requests

### 2. Cloudinary Setup

#### Create Account and Project
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Note your Cloud Name from the dashboard

#### Create Upload Preset
1. Go to Settings → Upload
2. Click "Add upload preset"
3. Set Preset name to: `unsigned_preset`
4. Set Signing Mode to: `Unsigned`
5. Set Folder to: `uno-menu-items` (optional)
6. Configure allowed formats: `jpg,png,jpeg,webp`
7. Set transformation: Auto quality and format
8. Save the preset

### 3. Configuration

#### Update config.js
Replace the placeholder values in `config.js`:

```javascript
// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co', // Replace with your URL
    anonKey: 'your-anon-key-here' // Replace with your anon key
};

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
    cloudName: 'your-cloud-name', // Replace with your cloud name
    uploadPreset: 'unsigned_preset' // Use the preset you created
};
```

### 4. GitHub Pages Deployment

#### Prepare Repository
1. Create a new GitHub repository (e.g., `uno-qr-menu`)
2. Clone the repository to your local machine
3. Copy all project files to the repository folder
4. Ensure `config.js` has the correct credentials

#### Deploy to GitHub Pages
1. Commit and push all files to GitHub:
   ```bash
   git add .
   git commit -m "Initial deployment of UNO QR Menu System"
   git push origin main
   ```

2. Go to your repository on GitHub
3. Navigate to Settings → Pages
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"

#### Access Your Site
Your site will be available at:
`https://your-username.github.io/your-repository-name`

### 5. QR Code Generation

#### Create QR Codes for Tables
Generate QR codes that point to your menu with table parameters:

**Table 1**: `https://your-username.github.io/your-repository-name/menu/?table=1`
**Table 2**: `https://your-username.github.io/your-repository-name/menu/?table=2`
...and so on.

#### Recommended QR Code Generators
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)
- [Google Charts QR API](https://developers.google.com/chart/infographics/docs/qr_codes)

#### QR Code Best Practices
- Use high contrast colors (black on white recommended)
- Test scanning from various distances
- Include table number in the QR code design
- Print on durable, easy-to-clean materials
- Size: minimum 2cm x 2cm for reliable scanning

### 6. Initial Setup and Testing

#### Admin Panel Setup
1. Navigate to `your-site-url/admin/`
2. Add menu categories (e.g., "Appetizers", "Main Courses", "Beverages")
3. Add menu items with descriptions, prices, and images
4. Configure quick actions (e.g., "Request Napkins", "Call Waiter")
5. Test the image upload functionality

#### Test Complete Workflow
1. **Customer Flow**:
   - Scan QR code or visit menu URL
   - Browse categories and items
   - Add items to cart
   - Submit order
   - Use quick actions

2. **Cashier Flow**:
   - Monitor incoming orders
   - Update order status
   - Handle quick action requests
   - Check table status

3. **Admin Flow**:
   - Manage menu items
   - View analytics
   - Upload images
   - Monitor system performance

### 7. Production Considerations

#### Performance Optimization
- Enable Supabase connection pooling
- Optimize images through Cloudinary transformations
- Use browser caching for static assets
- Monitor database query performance

#### Security
- Enable Row Level Security (RLS) in Supabase
- Set up proper CORS policies
- Use HTTPS for all connections
- Regularly update dependencies

#### Backup and Monitoring
- Set up Supabase database backups
- Monitor error logs in browser console
- Track user analytics (optional)
- Set up uptime monitoring

### 8. Custom Domain (Optional)

#### Using Custom Domain with GitHub Pages
1. Purchase a domain from a registrar
2. Add a `CNAME` file to your repository root with your domain
3. Configure DNS settings with your registrar
4. Enable HTTPS in GitHub Pages settings

#### DNS Configuration Example
```
Type: CNAME
Name: www
Value: your-username.github.io

Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

### 9. Troubleshooting

#### Common Issues and Solutions

**"Failed to load menu data" Error**
- Check Supabase URL and API key in config.js
- Verify database tables exist
- Check browser console for detailed errors
- Ensure CORS is properly configured

**Images Not Uploading**
- Verify Cloudinary cloud name and upload preset
- Check upload preset is set to "unsigned"
- Ensure file size is within limits
- Check browser console for upload errors

**Real-time Updates Not Working**
- Enable real-time in Supabase dashboard
- Check WebSocket connections in browser dev tools
- Verify table replication is enabled
- Test with multiple browser tabs

**QR Codes Not Working**
- Verify URL format includes table parameter
- Test QR codes with multiple scanning apps
- Check for typos in the generated URLs
- Ensure QR code size is adequate

#### Performance Issues
- Monitor Supabase usage and upgrade plan if needed
- Optimize images and reduce file sizes
- Check for memory leaks in JavaScript
- Use browser dev tools to identify bottlenecks

### 10. Maintenance

#### Regular Tasks
- Monitor Supabase usage and costs
- Update menu items and prices
- Review analytics and performance
- Clean up old orders and data
- Update QR codes if URLs change

#### Updates and Improvements
- Keep dependencies updated
- Monitor for security vulnerabilities
- Gather user feedback for improvements
- Consider mobile app development
- Implement additional features as needed

---

## Support and Resources

- **Supabase Documentation**: [docs.supabase.com](https://docs.supabase.com)
- **Cloudinary Documentation**: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **GitHub Pages Guide**: [docs.github.com/pages](https://docs.github.com/pages)
- **Bootstrap Documentation**: [getbootstrap.com/docs](https://getbootstrap.com/docs)

For technical support, create an issue in the GitHub repository with detailed information about your problem.

---

**Congratulations!** Your UNO QR Menu System is now deployed and ready to enhance your restaurant's digital experience! 🎉

