// UNO Restaurant & Café - Menu Script

class MenuApp {
    constructor() {
        this.currentLanguage = 'en';
        this.currentCategory = null;
        this.cart = [];
        this.categories = [];
        this.menuItems = [];
        this.quickActions = [];
        this.tableNumber = this.getTableNumber();
        
        this.init();
    }

    async init() {
        this.showLoading(true);
        
        try {
            // Set table number
            document.getElementById('tableNumber').textContent = this.tableNumber;
            
            // Load data from Supabase
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial content
            this.renderCategories();
            this.renderQuickActions();
            this.renderMenuItems();
            
            // Setup language
            this.updateLanguage();
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load menu data. Please refresh the page.');
        } finally {
            this.showLoading(false);
        }
    }

    getTableNumber() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('table') || '1';
    }

    async loadData() {
        try {
            // Load categories
            this.categories = await DatabaseAPI.getCategories();
            
            // Load menu items
            this.menuItems = await DatabaseAPI.getMenuItems();
            
            // Load quick actions
            this.quickActions = await DatabaseAPI.getQuickActions();
            
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Language toggle
        document.getElementById('langToggle').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Cart toggle
        document.getElementById('cartToggle').addEventListener('click', () => {
            this.toggleCart();
        });

        // Cart close
        document.getElementById('cartClose').addEventListener('click', () => {
            this.toggleCart();
        });

        // Submit order
        document.getElementById('submitOrder').addEventListener('click', () => {
            this.submitOrder();
        });

        // Modal quantity controls
        document.getElementById('decreaseQty').addEventListener('click', () => {
            this.updateModalQuantity(-1);
        });

        document.getElementById('increaseQty').addEventListener('click', () => {
            this.updateModalQuantity(1);
        });

        // Add to cart
        document.getElementById('addToCart').addEventListener('click', () => {
            this.addToCartFromModal();
        });

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cartSidebar');
            const cartToggle = document.getElementById('cartToggle');
            
            if (!cartSidebar.contains(e.target) && !cartToggle.contains(e.target) && cartSidebar.classList.contains('open')) {
                this.toggleCart();
            }
        });
    }

    renderCategories() {
        const container = document.getElementById('categoriesSlider');
        container.innerHTML = '';

        this.categories.forEach((category, index) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.dataset.categoryId = category.id;
            
            const name = this.currentLanguage === 'ar' ? category.name_ar : category.name_en;
            categoryCard.textContent = name;
            
            categoryCard.addEventListener('click', () => {
                this.selectCategory(category.id);
            });

            container.appendChild(categoryCard);
            
            // Add animation delay
            setTimeout(() => {
                categoryCard.classList.add('slide-up');
            }, index * 100);
        });

        // Select first category by default
        if (this.categories.length > 0) {
            this.selectCategory(this.categories[0].id);
        }
    }

    renderMenuItems(categoryId = null) {
        const container = document.getElementById('menuItemsContainer');
        container.innerHTML = '';

        let itemsToShow = this.menuItems;
        if (categoryId) {
            itemsToShow = this.menuItems.filter(item => item.category_id === categoryId);
        }

        itemsToShow.forEach((item, index) => {
            const itemCard = this.createMenuItemCard(item);
            container.appendChild(itemCard);
            
            // Add animation delay
            setTimeout(() => {
                itemCard.classList.add('fade-in');
            }, index * 100);
        });
    }

    createMenuItemCard(item) {
        const card = document.createElement('div');
        card.className = 'menu-item-card';
        
        const name = this.currentLanguage === 'ar' ? item.name_ar : item.name_en;
        const description = this.currentLanguage === 'ar' ? item.description_ar : item.description_en;
        
        // Get price range
        const prices = item.prices || [];
        let priceDisplay = '';
        if (prices.length > 0) {
            const minPrice = Math.min(...prices.map(p => parseFloat(p.price)));
            const maxPrice = Math.max(...prices.map(p => parseFloat(p.price)));
            priceDisplay = minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
        }

        card.innerHTML = `
            <img src="${item.image_url || '/assets/images/placeholder.jpg'}" alt="${name}" class="item-image">
            <div class="item-content">
                <h3 class="item-name">${name}</h3>
                <p class="item-description">${description || ''}</p>
                <div class="item-meta">
                    <span class="item-price">${priceDisplay}</span>
                    <div class="prep-time">
                        <i class="fas fa-clock"></i>
                        <span>${item.estimated_prep_time_minutes || 15}</span>
                        <span data-en="min" data-ar="د">min</span>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.showItemModal(item);
        });

        return card;
    }

    renderQuickActions() {
        const container = document.getElementById('quickActionsGrid');
        container.innerHTML = '';

        this.quickActions.forEach((action, index) => {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'quick-action-btn';
            
            const actionText = this.currentLanguage === 'ar' ? action.action_ar : action.action_en;
            
            actionBtn.innerHTML = `
                <i class="fas fa-concierge-bell"></i>
                <span>${actionText}</span>
            `;

            actionBtn.addEventListener('click', () => {
                this.handleQuickAction(action);
            });

            container.appendChild(actionBtn);
            
            // Add animation delay
            setTimeout(() => {
                actionBtn.classList.add('bounce-in');
            }, index * 150);
        });
    }

    selectCategory(categoryId) {
        // Update active category
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const activeCard = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }

        this.currentCategory = categoryId;
        this.renderMenuItems(categoryId);
    }

    showItemModal(item) {
        const modal = new bootstrap.Modal(document.getElementById('itemModal'));
        
        const name = this.currentLanguage === 'ar' ? item.name_ar : item.name_en;
        const description = this.currentLanguage === 'ar' ? item.description_ar : item.description_en;
        
        // Populate modal content
        document.getElementById('itemModalTitle').textContent = name;
        document.getElementById('itemModalImage').src = item.image_url || '/assets/images/placeholder.jpg';
        document.getElementById('itemModalDescription').textContent = description || '';
        document.getElementById('itemModalPrepTime').textContent = item.estimated_prep_time_minutes || 15;
        
        // Populate size options
        this.renderSizeOptions(item.prices || []);
        
        // Reset quantity and notes
        document.getElementById('itemQuantity').textContent = '1';
        document.getElementById('itemNotes').value = '';
        
        // Store current item
        this.currentModalItem = item;
        
        modal.show();
    }

    renderSizeOptions(prices) {
        const container = document.getElementById('sizeSelection');
        container.innerHTML = '<h6 data-en="Select Size:" data-ar="اختر الحجم:">Select Size:</h6>';
        
        if (prices.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        
        prices.forEach((price, index) => {
            const sizeOption = document.createElement('div');
            sizeOption.className = 'size-option';
            sizeOption.dataset.priceId = price.id;
            
            const sizeName = this.currentLanguage === 'ar' ? price.size_ar : price.size_en;
            
            sizeOption.innerHTML = `
                <span>${sizeName}</span>
                <span>$${parseFloat(price.price).toFixed(2)}</span>
            `;
            
            sizeOption.addEventListener('click', () => {
                document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                sizeOption.classList.add('selected');
            });
            
            container.appendChild(sizeOption);
            
            // Select first option by default
            if (index === 0) {
                sizeOption.classList.add('selected');
            }
        });
    }

    updateModalQuantity(change) {
        const qtyElement = document.getElementById('itemQuantity');
        let currentQty = parseInt(qtyElement.textContent);
        currentQty = Math.max(1, currentQty + change);
        qtyElement.textContent = currentQty;
    }

    addToCartFromModal() {
        const selectedSize = document.querySelector('.size-option.selected');
        const quantity = parseInt(document.getElementById('itemQuantity').textContent);
        const notes = document.getElementById('itemNotes').value;
        
        if (!selectedSize && this.currentModalItem.prices.length > 0) {
            alert('Please select a size');
            return;
        }
        
        const cartItem = {
            id: Date.now(), // Temporary ID for cart
            item: this.currentModalItem,
            priceId: selectedSize ? selectedSize.dataset.priceId : null,
            quantity: quantity,
            notes: notes
        };
        
        this.cart.push(cartItem);
        this.updateCartDisplay();
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();
        
        // Show success message
        this.showToast('Item added to cart!');
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        // Update count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        
        // Update items
        cartItems.innerHTML = '';
        let total = 0;
        
        this.cart.forEach((cartItem, index) => {
            const itemElement = this.createCartItemElement(cartItem, index);
            cartItems.appendChild(itemElement);
            
            // Calculate total
            const price = this.getCartItemPrice(cartItem);
            total += price * cartItem.quantity;
        });
        
        // Update total
        cartTotal.textContent = `$${total.toFixed(2)}`;
        
        // Show/hide submit button
        const submitBtn = document.getElementById('submitOrder');
        submitBtn.style.display = this.cart.length > 0 ? 'block' : 'none';
    }

    createCartItemElement(cartItem, index) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        
        const name = this.currentLanguage === 'ar' ? cartItem.item.name_ar : cartItem.item.name_en;
        const price = this.getCartItemPrice(cartItem);
        const sizeInfo = this.getCartItemSizeInfo(cartItem);
        
        div.innerHTML = `
            <img src="${cartItem.item.image_url || '/assets/images/placeholder.jpg'}" alt="${name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${name}</div>
                <div class="cart-item-size">${sizeInfo}</div>
                <div class="cart-item-price">$${(price * cartItem.quantity).toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="btn btn-sm btn-outline-secondary" onclick="menuApp.updateCartItemQuantity(${index}, -1)">-</button>
                <input type="number" class="cart-item-qty" value="${cartItem.quantity}" min="1" onchange="menuApp.setCartItemQuantity(${index}, this.value)">
                <button class="btn btn-sm btn-outline-secondary" onclick="menuApp.updateCartItemQuantity(${index}, 1)">+</button>
                <button class="btn btn-sm btn-outline-danger" onclick="menuApp.removeCartItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return div;
    }

    getCartItemPrice(cartItem) {
        if (!cartItem.priceId) {
            return 0;
        }
        
        const priceObj = cartItem.item.prices.find(p => p.id === cartItem.priceId);
        return priceObj ? parseFloat(priceObj.price) : 0;
    }

    getCartItemSizeInfo(cartItem) {
        if (!cartItem.priceId) {
            return '';
        }
        
        const priceObj = cartItem.item.prices.find(p => p.id === cartItem.priceId);
        if (!priceObj) return '';
        
        return this.currentLanguage === 'ar' ? priceObj.size_ar : priceObj.size_en;
    }

    updateCartItemQuantity(index, change) {
        if (index >= 0 && index < this.cart.length) {
            this.cart[index].quantity = Math.max(1, this.cart[index].quantity + change);
            this.updateCartDisplay();
        }
    }

    setCartItemQuantity(index, quantity) {
        if (index >= 0 && index < this.cart.length) {
            this.cart[index].quantity = Math.max(1, parseInt(quantity) || 1);
            this.updateCartDisplay();
        }
    }

    removeCartItem(index) {
        if (index >= 0 && index < this.cart.length) {
            this.cart.splice(index, 1);
            this.updateCartDisplay();
        }
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.classList.toggle('open');
    }

    async handleQuickAction(action) {
        try {
            this.showLoading(true);
            
            const request = {
                table_number: this.tableNumber,
                action_id: action.id
            };
            
            await DatabaseAPI.createQuickActionRequest(request);
            
            const actionText = this.currentLanguage === 'ar' ? action.action_ar : action.action_en;
            this.showToast(`${actionText} request sent!`);
            
        } catch (error) {
            console.error('Error sending quick action:', error);
            this.showToast('Failed to send request. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async submitOrder() {
        if (this.cart.length === 0) {
            this.showToast('Your cart is empty!', 'warning');
            return;
        }
        
        try {
            this.showLoading(true);
            
            // Create order
            const order = {
                table_number: this.tableNumber
            };
            
            const createdOrder = await DatabaseAPI.createOrder(order);
            
            // Create order items
            for (const cartItem of this.cart) {
                const orderItem = {
                    order_id: createdOrder.id,
                    item_id: cartItem.item.id,
                    item_price_id: cartItem.priceId,
                    quantity: cartItem.quantity,
                    notes: cartItem.notes
                };
                
                await DatabaseAPI.createOrderItem(orderItem);
            }
            
            // Clear cart
            this.cart = [];
            this.updateCartDisplay();
            this.toggleCart();
            
            this.showToast('Order submitted successfully!', 'success');
            
        } catch (error) {
            console.error('Error submitting order:', error);
            this.showToast('Failed to submit order. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        this.updateLanguage();
    }

    updateLanguage() {
        const body = document.body;
        const langToggle = document.getElementById('langToggle');
        const langText = document.getElementById('langText');
        
        if (this.currentLanguage === 'ar') {
            body.setAttribute('dir', 'rtl');
            body.setAttribute('lang', 'ar');
            langText.textContent = 'English';
        } else {
            body.setAttribute('dir', 'ltr');
            body.setAttribute('lang', 'en');
            langText.textContent = 'العربية';
        }
        
        // Update all translatable elements
        document.querySelectorAll('[data-en]').forEach(element => {
            const text = this.currentLanguage === 'ar' ? element.dataset.ar : element.dataset.en;
            if (text) {
                element.textContent = text;
            }
        });
        
        // Re-render dynamic content
        this.renderCategories();
        this.renderMenuItems(this.currentCategory);
        this.renderQuickActions();
        this.updateCartDisplay();
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.add('show');
        } else {
            spinner.classList.remove('show');
        }
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'primary'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        // Add to page
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove after hiding
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    showError(message) {
        const container = document.querySelector('.main-content .container');
        container.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h4>Error</h4>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menuApp = new MenuApp();
});

