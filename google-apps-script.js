// Google Apps Script for UNO Restaurant QR Menu System
// This script should be deployed as a web app in Google Apps Script

// Configuration
const CONFIG = {
  SHEETS: {
    MENU_ITEMS: 'MenuItems',
    CATEGORIES: 'Categories',
    ORDERS: 'Orders',
    QUICK_REQUESTS: 'QuickRequests',
    QUICK_ACTIONS: 'QuickActions',
    TABLES: 'Tables'
  },
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
};

// Main function to handle all requests
function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    // Handle CORS preflight
    if (e.parameter.method === 'OPTIONS') {
      return createResponse({}, 200);
    }

    const action = e.parameter.action;
    const method = e.parameter.method || 'GET';
    
    // Parse request body for POST requests
    let requestData = {};
    if (e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (error) {
        console.error('Error parsing request data:', error);
      }
    }

    // Route requests based on action
    switch (action) {
      case 'getMenuItems':
        return getMenuItems();
      case 'addMenuItem':
        return addMenuItem(requestData);
      case 'updateMenuItem':
        return updateMenuItem(requestData);
      case 'deleteMenuItem':
        return deleteMenuItem(requestData);
        
      case 'getCategories':
        return getCategories();
      case 'addCategory':
        return addCategory(requestData);
      case 'updateCategory':
        return updateCategory(requestData);
      case 'deleteCategory':
        return deleteCategory(requestData);
        
      case 'getOrders':
        return getOrders();
      case 'addOrder':
        return addOrder(requestData);
      case 'updateOrderStatus':
        return updateOrderStatus(requestData);
        
      case 'getQuickRequests':
        return getQuickRequests();
      case 'addQuickRequest':
        return addQuickRequest(requestData);
      case 'updateQuickRequestStatus':
        return updateQuickRequestStatus(requestData);
        
      case 'getQuickActions':
        return getQuickActions();
      case 'addQuickAction':
        return addQuickAction(requestData);
      case 'updateQuickAction':
        return updateQuickAction(requestData);
      case 'deleteQuickAction':
        return deleteQuickAction(requestData);
        
      case 'getTables':
        return getTables();
      case 'updateTableStatus':
        return updateTableStatus(requestData);
        
      case 'getAnalytics':
        return getAnalytics();
        
      default:
        return createResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return createResponse({ error: error.toString() }, 500);
  }
}

// Helper function to create response with CORS headers
function createResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  Object.keys(CONFIG.CORS_HEADERS).forEach(header => {
    response.setHeader(header, CONFIG.CORS_HEADERS[header]);
  });
  
  return response;
}

// Helper function to get sheet
function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    initializeSheet(sheet, sheetName);
  }
  
  return sheet;
}

// Initialize sheet with headers
function initializeSheet(sheet, sheetName) {
  let headers = [];
  
  switch (sheetName) {
    case CONFIG.SHEETS.MENU_ITEMS:
      headers = ['id', 'nameEn', 'nameAr', 'descriptionEn', 'descriptionAr', 'categoryId', 'imageUrl', 'sizes', 'prepTime', 'available', 'createdAt', 'updatedAt'];
      break;
    case CONFIG.SHEETS.CATEGORIES:
      headers = ['id', 'nameEn', 'nameAr', 'icon', 'order', 'createdAt', 'updatedAt'];
      break;
    case CONFIG.SHEETS.ORDERS:
      headers = ['id', 'tableNumber', 'items', 'total', 'status', 'timestamp', 'customerNote'];
      break;
    case CONFIG.SHEETS.QUICK_REQUESTS:
      headers = ['id', 'tableNumber', 'actionName', 'status', 'timestamp', 'note'];
      break;
    case CONFIG.SHEETS.QUICK_ACTIONS:
      headers = ['id', 'nameEn', 'nameAr', 'icon', 'color', 'order', 'createdAt', 'updatedAt'];
      break;
    case CONFIG.SHEETS.TABLES:
      headers = ['number', 'status', 'updatedAt'];
      break;
  }
  
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

// Helper function to convert sheet data to objects
function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const objects = [];
  
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((header, index) => {
      let value = data[i][index];
      
      // Parse JSON fields
      if (header === 'sizes' || header === 'items') {
        try {
          value = value ? JSON.parse(value) : [];
        } catch (e) {
          value = [];
        }
      }
      
      // Parse boolean fields
      if (header === 'available') {
        value = value === true || value === 'true' || value === 'TRUE';
      }
      
      obj[header] = value;
    });
    objects.push(obj);
  }
  
  return objects;
}

// Helper function to find row by ID
function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      return i + 1; // Return 1-based row number
    }
  }
  return -1;
}

// Menu Items functions
function getMenuItems() {
  const sheet = getSheet(CONFIG.SHEETS.MENU_ITEMS);
  const items = sheetToObjects(sheet);
  return createResponse(items);
}

function addMenuItem(data) {
  const sheet = getSheet(CONFIG.SHEETS.MENU_ITEMS);
  const row = [
    data.id,
    data.nameEn,
    data.nameAr || '',
    data.descriptionEn || '',
    data.descriptionAr || '',
    data.categoryId,
    data.imageUrl || '',
    JSON.stringify(data.sizes || []),
    data.prepTime || 0,
    data.available !== false,
    data.createdAt || new Date().toISOString(),
    data.updatedAt || new Date().toISOString()
  ];
  
  sheet.appendRow(row);
  return createResponse({ success: true, id: data.id });
}

function updateMenuItem(data) {
  const sheet = getSheet(CONFIG.SHEETS.MENU_ITEMS);
  const rowIndex = findRowById(sheet, data.id);
  
  if (rowIndex === -1) {
    return createResponse({ error: 'Item not found' }, 404);
  }
  
  const row = [
    data.id,
    data.nameEn,
    data.nameAr || '',
    data.descriptionEn || '',
    data.descriptionAr || '',
    data.categoryId,
    data.imageUrl || '',
    JSON.stringify(data.sizes || []),
    data.prepTime || 0,
    data.available !== false,
    data.createdAt,
    new Date().toISOString()
  ];
  
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  return createResponse({ success: true });
}

function deleteMenuItem(data) {
  const sheet = getSheet(CONFIG.SHEETS.MENU_ITEMS);
  const rowIndex = findRowById(sheet, data.id);
  
  if (rowIndex === -1) {
    return createResponse({ error: 'Item not found' }, 404);
  }
  
  sheet.deleteRow(rowIndex);
  return createResponse({ success: true });
}

// Categories functions
function getCategories() {
  const sheet = getSheet(CONFIG.SHEETS.CATEGORIES);
  const categories = sheetToObjects(sheet);
  return createResponse(categories);
}

function addCategory(data) {
  const sheet = getSheet(CONFIG.SHEETS.CATEGORIES);
  const row = [
    data.id,
    data.nameEn,
    data.nameAr || '',
    data.icon || 'fas fa-utensils',
    data.order || 1,
    data.createdAt || new Date().toISOString(),
    data.updatedAt || new Date().toISOString()
  ];
  
  sheet.appendRow(row);
  return createResponse({ success: true, id: data.id });
}

function updateCategory(data) {
  const sheet = getSheet(CONFIG.SHEETS.CATEGORIES);
  const rowIndex = findRowById(sheet, data.id);
  
  if (rowIndex === -1) {
    return createResponse({ error: 'Category not found' }, 404);
  }
  
  const row = [
    data.id,
    data.nameEn,
    data.nameAr || '',
    data.icon || 'fas fa-utensils',
    data.order || 1,
    data.createdAt,
    new Date().toISOString()
  ];
  
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  return createResponse({ success: true });
}

function deleteCategory(data) {
  const sheet = getSheet(CONFIG.SHEETS.CATEGORIES);
  const rowIndex = findRowById(sheet, data.id);
  
  if (rowIndex === -1) {
    return createResponse({ error: 'Category not found' }, 404);
  }
  
  sheet.deleteRow(rowIndex);
  return createResponse({ success: true });
}

// Orders functions
function getOrders() {
  const sheet = getSheet(CONFIG.SHEETS.ORDERS);
  const orders = sheetToObjects(sheet);
  return createResponse(orders);
}

function addOrder(data) {
  const sheet = getSheet(CONFIG.SHEETS.ORDERS);
  const row = [
    data.id,
    data.tableNumber,
    JSON.stringify(data.items || []),
    data.total || 0,
    data.status || 'pending',
    data.timestamp || new Date().toISOString(),
    data.customerNote || ''
  ];
  
  sheet.appendRow(row);
  return createResponse({ success: true, id: data.id });
}

function updateOrderStatus(data) {
  const sheet = getSheet(CONFIG.SHEETS.ORDERS);
  const rowIndex = findRowById(sheet, data.id);
  
  if (rowIndex === -1) {
    return createResponse({ error: 'Order not found' }, 404);
  }
  
  // Update only the status column (column 5)
  sheet.getRange(rowIndex, 5).setValue(data.status);
  return createResponse({ success: true });
}

// Quick Requests functions
function getQuickRequests() {
  const sheet = getSheet(CONFIG.SHEETS.QUICK_REQUESTS);
  const requests = sheetToObjects(sheet);
  return createResponse(requests);
}

function addQuickRequest(data) {
  const sheet = getSheet(CONFIG.SHEETS.QUICK_REQUESTS);
  const row = [
    data.id,
    data.tableNumber,
    data.actionName,
    data.status || 'pending',
    data.timestamp || new Date().toISOString(),
    data.note || ''
  ];
  
  sheet.appendRow(row);
  return createResponse({ success: true, id: data.id });
}

function updateQuickRequestStatus(data) {
  const sheet = getSheet(CONFIG.SHEETS.QUICK_REQUESTS);
  const rowIndex = findRowById(sheet, data.id);
  
  if (rowIndex === -1) {
    return createResponse({ error: 'Request not found' }, 404);
  }
  
  // Update only the status column (column 4)
  sheet.getRange(rowIndex, 4).setValue(data.status);
  return createResponse({ success: true });
}

// Quick Actions functions
function getQuickActions() {
  const sheet = getSheet(CONFIG.SHEETS.QUICK_ACTIONS);
  const actions = sheetToObjects(sheet);
  return createResponse(actions);
}

function addQuickAction(data) {
  const sheet = getSheet(CONFIG.SHEETS.QUICK_ACTIONS);
  const row = [
    data.id,
    data.nameEn,
    data.nameAr || '',
    data.icon || 'fas fa-hand-paper',
    data.color || 'primary',
    data.order || 1,
    data.createdAt || new Date().toISOString(),
    data.updatedAt || new Date().toISOString()
  ];
  
  sheet.appendRow(row);
  return createResponse({ success: true, id: data.id });
}

function updateQuickAction(data) {
  const sheet = getSheet(CONFIG.SHEETS.QUICK_ACTIONS);
  const rowIndex = findRowById(sheet, data.id);
  
  if (rowIndex === -1) {
    return createResponse({ error: 'Quick action not found' }, 404);
  }
  
  const row = [
    data.id,
    data.nameEn,
    data.nameAr || '',
    data.icon || 'fas fa-hand-paper',
    data.color || 'primary',
    data.order || 1,
    data.createdAt,
    new Date().toISOString()
  ];
  
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  return createResponse({ success: true });
}

function deleteQuickAction(data) {
  const sheet = getSheet(CONFIG.SHEETS.QUICK_ACTIONS);
  const rowIndex = findRowById(sheet, data.id);
  
  if (rowIndex === -1) {
    return createResponse({ error: 'Quick action not found' }, 404);
  }
  
  sheet.deleteRow(rowIndex);
  return createResponse({ success: true });
}

// Tables functions
function getTables() {
  const sheet = getSheet(CONFIG.SHEETS.TABLES);
  let tables = sheetToObjects(sheet);
  
  // If no tables exist, create default tables 1-20
  if (tables.length === 0) {
    for (let i = 1; i <= 20; i++) {
      const row = [i, 'available', new Date().toISOString()];
      sheet.appendRow(row);
    }
    tables = sheetToObjects(sheet);
  }
  
  return createResponse(tables);
}

function updateTableStatus(data) {
  const sheet = getSheet(CONFIG.SHEETS.TABLES);
  const tableData = sheet.getDataRange().getValues();
  
  let rowIndex = -1;
  for (let i = 1; i < tableData.length; i++) {
    if (tableData[i][0] == data.tableNumber) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    // Table doesn't exist, create it
    const row = [data.tableNumber, data.status, new Date().toISOString()];
    sheet.appendRow(row);
  } else {
    // Update existing table
    sheet.getRange(rowIndex, 2).setValue(data.status);
    sheet.getRange(rowIndex, 3).setValue(new Date().toISOString());
  }
  
  return createResponse({ success: true });
}

// Analytics function
function getAnalytics() {
  const ordersSheet = getSheet(CONFIG.SHEETS.ORDERS);
  const orders = sheetToObjects(ordersSheet);
  
  const analytics = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0),
    ordersByStatus: {},
    recentOrders: orders.slice(-10),
    topItems: {},
    dailyRevenue: {}
  };
  
  // Calculate orders by status
  orders.forEach(order => {
    const status = order.status || 'unknown';
    analytics.ordersByStatus[status] = (analytics.ordersByStatus[status] || 0) + 1;
  });
  
  // Calculate top items
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const itemName = item.name || 'Unknown';
        analytics.topItems[itemName] = (analytics.topItems[itemName] || 0) + (item.quantity || 1);
      });
    }
  });
  
  // Calculate daily revenue
  orders.forEach(order => {
    const date = new Date(order.timestamp).toDateString();
    analytics.dailyRevenue[date] = (analytics.dailyRevenue[date] || 0) + (parseFloat(order.total) || 0);
  });
  
  return createResponse(analytics);
}

// Initialize default data (run this once to set up sample data)
function initializeDefaultData() {
  // Add default categories
  const categoriesData = [
    { id: 'cat_1', nameEn: 'Appetizers', nameAr: 'المقبلات', icon: 'fas fa-leaf', order: 1 },
    { id: 'cat_2', nameEn: 'Main Courses', nameAr: 'الأطباق الرئيسية', icon: 'fas fa-utensils', order: 2 },
    { id: 'cat_3', nameEn: 'Beverages', nameAr: 'المشروبات', icon: 'fas fa-coffee', order: 3 },
    { id: 'cat_4', nameEn: 'Desserts', nameAr: 'الحلويات', icon: 'fas fa-ice-cream', order: 4 }
  ];
  
  categoriesData.forEach(category => {
    addCategory(category);
  });
  
  // Add default quick actions
  const quickActionsData = [
    { id: 'qa_1', nameEn: 'Request Charcoal', nameAr: 'طلب فحم', icon: 'fas fa-fire', color: 'danger', order: 1 },
    { id: 'qa_2', nameEn: 'Request Napkins', nameAr: 'طلب مناديل', icon: 'fas fa-tissue', color: 'info', order: 2 },
    { id: 'qa_3', nameEn: 'Request Bill', nameAr: 'طلب الفاتورة', icon: 'fas fa-receipt', color: 'warning', order: 3 },
    { id: 'qa_4', nameEn: 'Call Waiter', nameAr: 'استدعاء النادل', icon: 'fas fa-bell', color: 'primary', order: 4 }
  ];
  
  quickActionsData.forEach(action => {
    addQuickAction(action);
  });
  
  console.log('Default data initialized successfully');
}

