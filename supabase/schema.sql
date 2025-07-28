-- Table for Menu Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  display_order INT NOT NULL
);

-- Table for Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  image_url TEXT,
  estimated_prep_time_minutes INT,
  is_available BOOLEAN DEFAULT TRUE,
  display_order INT NOT NULL
);

-- Table for Item Sizes and Prices
CREATE TABLE item_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  size_en TEXT NOT NULL,
  size_ar TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

-- Table for Quick Actions
CREATE TABLE quick_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_en TEXT NOT NULL,
  action_ar TEXT NOT NULL,
  icon_url TEXT,
  display_order INT NOT NULL
);

-- Table for Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number TEXT NOT NULL,
  order_time TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' -- e.g., 'pending', 'preparing', 'completed', 'cancelled'
);

-- Table for Order Items (junction table for orders and menu_items)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  item_price_id UUID REFERENCES item_prices(id) ON DELETE CASCADE, -- To link to specific size/price
  quantity INT NOT NULL,
  notes TEXT
);

-- Table for Quick Action Requests
CREATE TABLE quick_action_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number TEXT NOT NULL,
  action_id UUID REFERENCES quick_actions(id) ON DELETE CASCADE,
  request_time TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' -- e.g., 'pending', 'completed'
);

-- Table for Analytics (example, can be populated by triggers or backend logic)
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  order_count INT DEFAULT 0,
  total_sales NUMERIC(10, 2) DEFAULT 0.00,
  record_date DATE DEFAULT CURRENT_DATE
);


