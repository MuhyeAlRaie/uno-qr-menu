// Shopping Cart Management for UNO Restaurant QR Menu System

class CartManager {
    constructor() {
        this.items = [];
        this.isOpen = false;
        this.tableNumber = Utils.getTableNumber();
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateCartDisplay();
    }

    setupEventListeners() {
        // Language change event
        window.addEventListener('languageChanged', () => {
            this.updateCartDisplay();
        });

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cartSidebar');
            const cartBtn = document.querySelector('.cart-btn');
            
            if (this.isOpen && cartSidebar && !cartSidebar.contains(e.target) && !cartBtn.contains(e.target)) {
                this.closeCart();
            }
        });

        // Prevent cart from closing when clicking inside
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    addItem(item) {
        // Check if item with same ID, size, and special instructions already exists
        const existingItemIndex = this.items.findIndex(cartItem => 
            cartItem.originalId === item.originalId &&
            cartItem.size === item.size &&
            cartItem.specialInstructions === item.specialInstructions
        );

        if (existingItemIndex > -1) {
            // Update quantity of existing item
            this.items[existingItemIndex].quantity += item.quantity;
        } else {
            // Add new item
            this.items.push({
                ...item,
                id: item.id || Utils.generateId(),
                addedAt: new Date().toISOString()
            });
        }

        this.saveToStorage();
        this.updateCartDisplay();
        this.animateCartButton();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.updateCartDisplay();
        
        const currentLang = languageManager.getCurrentLanguage();
        const message = currentLang === 'en' ? 'Item removed from cart' : 'تم إزالة العنصر من السلة';
        Utils.showToast(message, 'info');
    }

    updateQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(itemId);
            return;
        }

        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            this.saveToStorage();
            this.updateCartDisplay();
        }
    }

    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateCartDisplay();
        
        const currentLang = languageManager.getCurrentLanguage();
        const message = currentLang === 'en' ? 'Cart cleared' : 'تم مسح السلة';
        Utils.showToast(message, 'info');
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartDisplay() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateCartTotal();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const count = this.getItemCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updateCartItems() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;

        const currentLang = languageManager.getCurrentLanguage();

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <p class="text-muted">${currentLang === 'en' ? 'Your cart is empty' : 'سلتك فارغة'}</p>
                </div>
            `;
            return;
        }

        const itemsHtml = this.items.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <img src="${item.image || 'images/placeholder.jpg'}" 
                     alt="${item.name}" 
                     class="cart-item-image"
                     onerror="this.src='images/placeholder.jpg'">
                
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    ${item.size ? `<div class="cart-item-size">${item.size}</div>` : ''}
                    ${item.specialInstructions ? `<div class="cart-item-instructions"><small>${item.specialInstructions}</small></div>` : ''}
                    <div class="cart-item-price">${Utils.formatCurrency(item.price)}</div>
                </div>
                
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <button class="btn btn-sm btn-outline-danger" onclick="cartManager.removeItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        cartItems.innerHTML = itemsHtml;
    }

    updateCartTotal() {
        const cartTotal = document.getElementById('cartTotal');
        if (cartTotal) {
            const total = this.getTotal();
            cartTotal.textContent = total.toFixed(2);
        }
    }

    openCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('open');
            this.isOpen = true;
            
            // Add overlay
            this.addOverlay();
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
            this.isOpen = false;
            
            // Remove overlay
            this.removeOverlay();
        }
    }

    toggleCart() {
        if (this.isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    addOverlay() {
        // Remove existing overlay
        this.removeOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'cartOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Trigger animation
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        // Close cart when clicking overlay
        overlay.addEventListener('click', () => {
            this.closeCart();
        });
    }

    removeOverlay() {
        const overlay = document.getElementById('cartOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    animateCartButton() {
        const cartBtn = document.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.classList.add('animate-pulse');
            setTimeout(() => {
                cartBtn.classList.remove('animate-pulse');
            }, 1000);
        }
    }

    async submitOrder() {
        if (this.items.length === 0) {
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'en' ? 'Your cart is empty' : 'سلتك فارغة';
            Utils.showToast(message, 'warning');
            return;
        }

        try {
            // Prepare order data
            const orderData = {
                tableNumber: this.tableNumber,
                items: this.items.map(item => ({
                    id: item.originalId || item.id,
                    name: item.name,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                    specialInstructions: item.specialInstructions
                })),
                total: this.getTotal(),
                customerNote: '',
                timestamp: Utils.getCurrentTimestamp()
            };

            // Show loading state
            const submitBtn = document.querySelector('[onclick="submitOrder()"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            }

            // Submit order to Google Sheets
            await googleSheetsAPI.addOrder(orderData);

            // Update table status to occupied
            await googleSheetsAPI.updateTableStatus(this.tableNumber, APP_CONFIG.TABLE_STATUSES.OCCUPIED);

            // Clear cart
            this.clearCart();
            this.closeCart();

            // Show success modal
            this.showOrderSuccessModal();

            // Reset submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                const currentLang = languageManager.getCurrentLanguage();
                submitBtn.textContent = currentLang === 'en' ? 'Submit Order' : 'إرسال الطلب';
            }

        } catch (error) {
            console.error('Error submitting order:', error);
            
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'en' ? 'Failed to submit order. Please try again.' : 'فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.';
            Utils.showToast(message, 'danger');

            // Reset submit button
            const submitBtn = document.querySelector('[onclick="submitOrder()"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                const buttonText = currentLang === 'en' ? 'Submit Order' : 'إرسال الطلب';
                submitBtn.textContent = buttonText;
            }
        }
    }

    showOrderSuccessModal() {
        const modal = document.getElementById('orderSuccessModal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('cart_items', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    loadFromStorage() {
        try {
            const savedItems = localStorage.getItem('cart_items');
            if (savedItems) {
                this.items = JSON.parse(savedItems);
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.items = [];
        }
    }

    // Get cart summary for display
    getCartSummary() {
        return {
            items: this.items,
            itemCount: this.getItemCount(),
            total: this.getTotal(),
            tableNumber: this.tableNumber
        };
    }

    // Validate cart before submission
    validateCart() {
        const errors = [];
        const currentLang = languageManager.getCurrentLanguage();

        if (this.items.length === 0) {
            errors.push(currentLang === 'en' ? 'Cart is empty' : 'السلة فارغة');
        }

        // Check for invalid quantities
        const invalidItems = this.items.filter(item => item.quantity <= 0);
        if (invalidItems.length > 0) {
            errors.push(currentLang === 'en' ? 'Some items have invalid quantities' : 'بعض العناصر لها كميات غير صحيحة');
        }

        // Check for invalid prices
        const invalidPrices = this.items.filter(item => !item.price || parseFloat(item.price) <= 0);
        if (invalidPrices.length > 0) {
            errors.push(currentLang === 'en' ? 'Some items have invalid prices' : 'بعض العناصر لها أسعار غير صحيحة');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Export cart data
    exportCart() {
        return {
            items: this.items,
            total: this.getTotal(),
            itemCount: this.getItemCount(),
            tableNumber: this.tableNumber,
            exportedAt: new Date().toISOString()
        };
    }

    // Import cart data
    importCart(cartData) {
        if (cartData && cartData.items) {
            this.items = cartData.items;
            this.saveToStorage();
            this.updateCartDisplay();
        }
    }
}

// Global functions for HTML onclick events
window.toggleCart = () => {
    if (window.cartManager) {
        window.cartManager.toggleCart();
    }
};

window.submitOrder = () => {
    if (window.cartManager) {
        window.cartManager.submitOrder();
    }
};

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}

