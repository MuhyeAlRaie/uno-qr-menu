# Google Sheets Setup for UNO Restaurant QR Menu System

## Required Google Sheets Structure

Create a Google Spreadsheet with the following sheets:

### 1. MenuItems Sheet
Columns (Row 1 - Headers):
- `id` - Unique identifier (e.g., ITEM_001)
- `name_en` - Item name in English
- `name_ar` - Item name in Arabic
- `description_en` - Description in English
- `description_ar` - Description in Arabic
- `category_id` - Category identifier
- `image_url` - Cloudinary image URL
- `sizes` - JSON array of sizes (e.g., ["Small", "Medium", "Large"])
- `prices` - JSON array of prices (e.g., [10, 15, 20])
- `prep_time` - Preparation time in minutes
- `available` - true/false
- `created_at` - Timestamp

Example data:
```
ITEM_001 | Margherita Pizza | بيتزا مارجريتا | Classic pizza with tomato and mozzarella | بيتزا كلاسيكية بالطماطم والموزاريلا | CAT_001 | https://res.cloudinary.com/... | ["Small", "Medium", "Large"] | [12, 18, 24] | 15 | true | 2024-01-01T00:00:00Z
```

### 2. Categories Sheet
Columns (Row 1 - Headers):
- `id` - Unique identifier (e.g., CAT_001)
- `name_en` - Category name in English
- `name_ar` - Category name in Arabic
- `icon` - Font Awesome icon class
- `sort_order` - Display order
- `available` - true/false

Example data:
```
CAT_001 | Pizza | بيتزا | fas fa-pizza-slice | 1 | true
CAT_002 | Beverages | مشروبات | fas fa-coffee | 2 | true
CAT_003 | Desserts | حلويات | fas fa-ice-cream | 3 | true
```

### 3. Orders Sheet
Columns (Row 1 - Headers):
- `id` - Order ID (auto-generated)
- `table_number` - Table number
- `items` - JSON array of ordered items
- `total_amount` - Total order amount
- `status` - pending/preparing/ready/served/cancelled
- `created_at` - Order timestamp
- `notes` - Customer notes
- `type` - order/quick_action

Example data:
```
ORD_1234567890 | 5 | [{"id":"ITEM_001","name":"Margherita Pizza","size":"Medium","price":18,"quantity":2}] | 36 | pending | 2024-01-01T12:00:00Z | Extra cheese | order
```

### 4. QuickActions Sheet
Columns (Row 1 - Headers):
- `id` - Action ID
- `name_en` - Action name in English
- `name_ar` - Action name in Arabic
- `icon` - Font Awesome icon class
- `type` - charcoal/napkins/bill/waiter
- `available` - true/false

Example data:
```
QA_001 | Request Charcoal | طلب فحم | fas fa-fire | charcoal | true
QA_002 | Request Napkins | طلب مناديل | fas fa-tissue | napkins | true
QA_003 | Request Bill | طلب الفاتورة | fas fa-receipt | bill | true
QA_004 | Call Waiter | استدعاء النادل | fas fa-bell | waiter | true
```

### 5. Tables Sheet
Columns (Row 1 - Headers):
- `number` - Table number
- `status` - available/occupied/reserved
- `qr_code` - QR code data
- `last_order` - Last order timestamp

Example data:
```
1 | available | https://your-domain.com/?view=menu&table=1 | 2024-01-01T10:00:00Z
2 | occupied | https://your-domain.com/?view=menu&table=2 | 2024-01-01T11:30:00Z
```

### 6. Analytics Sheet
Columns (Row 1 - Headers):
- `date` - Date
- `total_orders` - Number of orders
- `total_sales` - Total sales amount
- `most_ordered_item` - Most popular item
- `avg_order_value` - Average order value

## Setup Instructions

1. **Create Google Spreadsheet:**
   - Go to Google Sheets (sheets.google.com)
   - Create a new spreadsheet
   - Name it "UNO Restaurant Menu System"

2. **Create Sheets:**
   - Create 6 sheets with the names above
   - Add the column headers as specified

3. **Get API Credentials:**
   - Go to Google Cloud Console
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create credentials (API Key)
   - Restrict the API key to Google Sheets API

4. **Make Spreadsheet Public:**
   - Click "Share" button
   - Change access to "Anyone with the link can view"
   - Copy the spreadsheet ID from the URL

5. **Update Configuration:**
   - Replace `YOUR_GOOGLE_SHEETS_API_KEY` in `js/config.js`
   - Replace `YOUR_SPREADSHEET_ID` in `js/config.js`

## Sample Data

You can add sample data to test the system:

### Sample Menu Items:
```
ITEM_001,Margherita Pizza,بيتزا مارجريتا,Classic pizza with tomato and mozzarella,بيتزا كلاسيكية بالطماطم والموزاريلا,CAT_001,https://via.placeholder.com/300x200,"[""Small"", ""Medium"", ""Large""]","[12, 18, 24]",15,true,2024-01-01T00:00:00Z
ITEM_002,Cappuccino,كابتشينو,Rich coffee with steamed milk,قهوة غنية بالحليب المبخر,CAT_002,https://via.placeholder.com/300x200,"[""Regular""]","[8]",5,true,2024-01-01T00:00:00Z
ITEM_003,Chocolate Cake,كيك الشوكولاتة,Delicious chocolate cake,كيك شوكولاتة لذيذ,CAT_003,https://via.placeholder.com/300x200,"[""Slice""]","[12]",10,true,2024-01-01T00:00:00Z
```

### Sample Categories:
```
CAT_001,Pizza,بيتزا,fas fa-pizza-slice,1,true
CAT_002,Beverages,مشروبات,fas fa-coffee,2,true
CAT_003,Desserts,حلويات,fas fa-ice-cream,3,true
```

### Sample Quick Actions:
```
QA_001,Request Charcoal,طلب فحم,fas fa-fire,charcoal,true
QA_002,Request Napkins,طلب مناديل,fas fa-tissue,napkins,true
QA_003,Request Bill,طلب الفاتورة,fas fa-receipt,bill,true
QA_004,Call Waiter,استدعاء النادل,fas fa-bell,waiter,true
```

## Testing

After setup, test the integration by:
1. Opening the application
2. Checking if categories and items load
3. Testing order submission
4. Verifying data appears in the Orders sheet

