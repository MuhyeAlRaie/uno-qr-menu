// Menu Manager for UNO Restaurant QR Menu System

class MenuManager {
    constructor() {
        this.categories = [];
        this.menuItems = [];
        this.quickActions = [];
        this.cart = [];
        this.currentCategory = null;
        this.currentSlideIndex = 0;
        this.isSliding = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
    }

    // Initialize menu with data
    init(categories, menuItems, quickActions) {
        this.categories = categories;
        this.menuItems = menuItems;
        this.quickActions = quickActions;
        
        this.renderCategories();
        this.renderQuickActions();
        this.renderMenuItems();
        this.setupEventListeners();
        this.loadCartFromStorage();
        
        // Set first category as active
        if (this.categories.length > 0) {
            this.selectCategory(this.categories[0].id);
        }
    }

    // Render categories navigation
    renderCategories() {
        const container = document.getElementById('categoriesContainer');
        if (!container) return;

        container.innerHTML = this.categories.map(category => `
            <div class="col-6 col-md-3 col-lg-2">
                <div class="category-btn animate-slide-up" onclick="menuManager.selectCategory('${category.id}')" data-category="${category.id}">
                    <i class="${category.icon}"></i>
                    <h6 class="mt-2 mb-0">${this.getLocalizedText(category, 'name')}</h6>
                </div>
            </div>
        `).join('');
    }

    // Render quick actions
    renderQuickActions() {
        const container = document.getElementById('quickActionsContainer');
        if (!container) return;

        container.innerHTML = this.quickActions.map(action => `
            <div class="col-6 col-md-3">
                <button class="quick-action-btn w-100 animate-fade-in" onclick="menuManager.handleQuickAction('${action.type}')">
                    <i class="${action.icon}"></i>
                    <span>${this.getLocalizedText(action, 'name')}</span>
                </button>
            </div>
        `).join('');
    }

    // Render menu items with 3D slider
    renderMenuItems() {
        const container = document.getElementById('menuItemsContainer');
        if (!container) return;

        // Create slider structure
        container.innerHTML = `
            <div class="menu-items-slider" id="menuSlider">
                <div class="menu-items-track" id="menuTrack">
                    ${this.menuItems.map((item, index) => this.createMenuItemCard(item, index)).join('')}
                </div>
                <div class="slider-controls">
                    <button class="slider-btn prev-btn" onclick="menuManager.previousSlide()">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="slider-btn next-btn" onclick="menuManager.nextSlide()">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="slider-indicators" id="sliderIndicators">
                    ${this.menuItems.map((_, index) => `
                        <span class="indicator ${index === 0 ? 'active' : ''}" onclick="menuManager.goToSlide(${index})"></span>
                    `).join('')}
                </div>
            </div>
        `;

        this.setupSliderEvents();
        this.updateSliderPosition();
    }

    // Create menu item card
    createMenuItemCard(item, index) {
        const sizes = Array.isArray(item.sizes) ? item.sizes : [item.sizes].filter(Boolean);
        const prices = Array.isArray(item.prices) ? item.prices : [item.prices].filter(Boolean);
        
        return `
            <div class="menu-item-card" data-item-id="${item.id}" data-category="${item.category_id}">
                <div class="menu-item-image-container">
                    <img src="${item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                         alt="${this.getLocalizedText(item, 'name')}" 
                         class="menu-item-image"
                         onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    <div class="menu-item-overlay">
                        <button class="quick-add-btn" onclick="menuManager.quickAddToCart('${item.id}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="menu-item-content">
                    <h5 class="menu-item-title">${this.getLocalizedText(item, 'name')}</h5>
                    <p class="menu-item-description">${this.getLocalizedText(item, 'description')}</p>
                    
                    ${sizes.length > 1 ? `
                        <div class="menu-item-sizes">
                            ${sizes.map((size, sizeIndex) => `
                                <button class="size-btn ${sizeIndex === 0 ? 'active' : ''}" 
                                        onclick="menuManager.selectSize('${item.id}', ${sizeIndex})">
                                    ${size}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="menu-item-price" id="price-${item.id}">
                        ${this.formatPrice(prices[0] || 0)}
                    </div>
                    
                    <div class="menu-item-footer">
                        <div class="prep-time">
                            <i class="fas fa-clock"></i>
                            <span>${item.prep_time || 15} ${t('minutes')}</span>
                        </div>
                        <button class="add-to-cart-btn" onclick="menuManager.addToCart('${item.id}')">
                            <i class="fas fa-cart-plus me-1"></i>
                            ${t('add_to_cart')}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup slider event listeners
    setupSliderEvents() {
        const slider = document.getElementById('menuSlider');
        if (!slider) return;

        // Touch events for mobile
        slider.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        });

        slider.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        });

        // Mouse events for desktop
        let isMouseDown = false;
        let startX = 0;

        slider.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            startX = e.clientX;
            slider.style.cursor = 'grabbing';
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            e.preventDefault();
        });

        slider.addEventListener('mouseup', (e) => {
            if (!isMouseDown) return;
            isMouseDown = false;
            slider.style.cursor = 'grab';
            
            const endX = e.clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Auto-slide (optional)
        this.startAutoSlide();
    }

    // Handle swipe gesture
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
        }
    }

    // Go to next slide
    nextSlide() {
        if (this.isSliding) return;
        
        const visibleItems = this.getVisibleItems();
        if (this.currentSlideIndex < visibleItems.length - this.getItemsPerView()) {
            this.currentSlideIndex++;
            this.updateSliderPosition();
        }
    }

    // Go to previous slide
    previousSlide() {
        if (this.isSliding) return;
        
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            this.updateSliderPosition();
        }
    }

    // Go to specific slide
    goToSlide(index) {
        if (this.isSliding) return;
        
        const visibleItems = this.getVisibleItems();
        const maxIndex = Math.max(0, visibleItems.length - this.getItemsPerView());
        this.currentSlideIndex = Math.min(index, maxIndex);
        this.updateSliderPosition();
    }

    // Update slider position
    updateSliderPosition() {
        const track = document.getElementById('menuTrack');
        if (!track) return;

        this.isSliding = true;
        
        const itemWidth = 330; // 300px + 30px margin
        const translateX = -this.currentSlideIndex * itemWidth;
        
        track.style.transform = `translateX(${translateX}px)`;
        
        // Update 3D effects
        this.update3DEffects();
        
        // Update indicators
        this.updateIndicators();
        
        setTimeout(() => {
            this.isSliding = false;
        }, 800);
    }

    // Update 3D effects for visible items
    update3DEffects() {
        const visibleItems = this.getVisibleItems();
        const itemsPerView = this.getItemsPerView();
        const centerIndex = Math.floor(itemsPerView / 2);
        
        visibleItems.forEach((item, index) => {
            const card = item.element;
            const relativeIndex = index - this.currentSlideIndex;
            
            if (relativeIndex >= 0 && relativeIndex < itemsPerView) {
                const distanceFromCenter = Math.abs(relativeIndex - centerIndex);
                const scale = 1 - (distanceFromCenter * 0.1);
                const rotateY = (relativeIndex - centerIndex) * 15;
                const translateZ = distanceFromCenter === 0 ? 50 : -distanceFromCenter * 20;
                
                card.style.transform = `
                    scale(${scale}) 
                    rotateY(${rotateY}deg) 
                    translateZ(${translateZ}px)
                `;
                card.style.opacity = 1 - (distanceFromCenter * 0.2);
                card.style.zIndex = itemsPerView - distanceFromCenter;
            } else {
                card.style.transform = 'scale(0.8) rotateY(45deg) translateZ(-100px)';
                card.style.opacity = 0.3;
                card.style.zIndex = 0;
            }
        });
    }

    // Update slider indicators
    updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlideIndex);
        });
    }

    // Get visible items based on current category
    getVisibleItems() {
        const items = this.currentCategory 
            ? this.menuItems.filter(item => item.category_id === this.currentCategory)
            : this.menuItems;
            
        return items.map((item, index) => ({
            item,
            index,
            element: document.querySelector(`[data-item-id="${item.id}"]`)
        })).filter(item => item.element);
    }

    // Get number of items per view based on screen size
    getItemsPerView() {
        const width = window.innerWidth;
        if (width < 576) return 1;
        if (width < 768) return 2;
        if (width < 992) return 3;
        return 4;
    }

    // Start auto-slide
    startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
            const visibleItems = this.getVisibleItems();
            if (this.currentSlideIndex >= visibleItems.length - this.getItemsPerView()) {
                this.currentSlideIndex = 0;
            } else {
                this.nextSlide();
            }
        }, 5000);
    }

    // Stop auto-slide
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    // Select category
    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        this.currentSlideIndex = 0;
        
        // Update category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === categoryId);
        });
        
        // Filter and show items
        this.filterItemsByCategory(categoryId);
        this.updateSliderPosition();
        
        // Log category selection
        app.logEvent('category_selected', { categoryId });
    }

    // Filter items by category
    filterItemsByCategory(categoryId) {
        const allItems = document.querySelectorAll('.menu-item-card');
        
        allItems.forEach(item => {
            const itemCategory = item.dataset.category;
            const shouldShow = !categoryId || itemCategory === categoryId;
            
            item.style.display = shouldShow ? 'block' : 'none';
            
            if (shouldShow) {
                item.classList.add('animate-slide-up');
            }
        });
    }

    // Select size for an item
    selectSize(itemId, sizeIndex) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;
        
        const sizeButtons = document.querySelectorAll(`[data-item-id="${itemId}"] .size-btn`);
        sizeButtons.forEach((btn, index) => {
            btn.classList.toggle('active', index === sizeIndex);
        });
        
        // Update price
        const prices = Array.isArray(item.prices) ? item.prices : [item.prices];
        const newPrice = prices[sizeIndex] || prices[0] || 0;
        const priceElement = document.getElementById(`price-${itemId}`);
        if (priceElement) {
            priceElement.textContent = this.formatPrice(newPrice);
        }
    }

    // Quick add to cart (default size)
    quickAddToCart(itemId) {
        this.addToCart(itemId, 0); // Add with first size
    }

    // Add item to cart
    addToCart(itemId, sizeIndex = null) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;
        
        // Determine selected size
        if (sizeIndex === null) {
            const activeSize = document.querySelector(`[data-item-id="${itemId}"] .size-btn.active`);
            sizeIndex = activeSize ? Array.from(activeSize.parentElement.children).indexOf(activeSize) : 0;
        }
        
        const sizes = Array.isArray(item.sizes) ? item.sizes : [item.sizes].filter(Boolean);
        const prices = Array.isArray(item.prices) ? item.prices : [item.prices].filter(Boolean);
        
        const selectedSize = sizes[sizeIndex] || sizes[0] || 'Regular';
        const selectedPrice = prices[sizeIndex] || prices[0] || 0;
        
        // Check if item already in cart
        const existingItem = this.cart.find(cartItem => 
            cartItem.id === itemId && cartItem.size === selectedSize
        );
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: itemId,
                name: this.getLocalizedText(item, 'name'),
                size: selectedSize,
                price: selectedPrice,
                quantity: 1,
                image: item.image_url
            });
        }
        
        this.updateCartDisplay();
        this.saveCartToStorage();
        
        // Show success feedback
        app.showSuccess(`${this.getLocalizedText(item, 'name')} ${t('added_to_cart')}`);
        
        // Log add to cart event
        app.logEvent('add_to_cart', {
            itemId,
            itemName: this.getLocalizedText(item, 'name'),
            size: selectedSize,
            price: selectedPrice
        });
    }

    // Update cart display
    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        if (cartItems) {
            cartItems.innerHTML = this.cart.length === 0 
                ? `<p class="text-center text-muted">${t('cart_empty')}</p>`
                : this.cart.map(item => this.createCartItemHTML(item)).join('');
        }
        
        if (cartTotal) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = this.formatPrice(total);
        }
    }

    // Create cart item HTML
    createCartItemHTML(item) {
        return `
            <div class="cart-item">
                <img src="${item.image || 'https://via.placeholder.com/60x60'}" 
                     alt="${item.name}" 
                     class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-size">${item.size}</div>
                    <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="menuManager.updateCartItemQuantity('${item.id}', '${item.size}', -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="menuManager.updateCartItemQuantity('${item.id}', '${item.size}', 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="quantity-btn text-danger" onclick="menuManager.removeFromCart('${item.id}', '${item.size}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Update cart item quantity
    updateCartItemQuantity(itemId, size, change) {
        const cartItem = this.cart.find(item => item.id === itemId && item.size === size);
        if (!cartItem) return;
        
        cartItem.quantity += change;
        
        if (cartItem.quantity <= 0) {
            this.removeFromCart(itemId, size);
        } else {
            this.updateCartDisplay();
            this.saveCartToStorage();
        }
    }

    // Remove item from cart
    removeFromCart(itemId, size) {
        this.cart = this.cart.filter(item => !(item.id === itemId && item.size === size));
        this.updateCartDisplay();
        this.saveCartToStorage();
    }

    // Handle quick actions
    handleQuickAction(actionType) {
        const action = this.quickActions.find(a => a.type === actionType);
        if (!action) return;
        
        // Create quick action order
        const orderData = {
            tableNumber: router.currentTable || 1,
            items: [],
            totalAmount: 0,
            type: 'quick_action',
            actionType: actionType,
            customerNotes: `Quick Action: ${this.getLocalizedText(action, 'name')}`
        };
        
        this.submitOrder(orderData);
        
        // Log quick action
        app.logEvent('quick_action', {
            actionType,
            actionName: this.getLocalizedText(action, 'name'),
            tableNumber: router.currentTable
        });
    }

    // Checkout process
    checkout() {
        if (this.cart.length === 0) {
            app.showError(t('cart_empty'));
            return;
        }
        
        const orderData = {
            tableNumber: router.currentTable || 1,
            items: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                size: item.size,
                price: item.price,
                quantity: item.quantity
            })),
            totalAmount: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            type: 'order',
            customerNotes: ''
        };
        
        this.submitOrder(orderData);
    }

    // Submit order to Google Sheets
    async submitOrder(orderData) {
        try {
            app.showNotification(t('submitting_order'), 'info');
            
            const result = await googleSheetsAPI.addOrder(orderData);
            
            if (result) {
                app.showSuccess(t('order_submitted_successfully'));
                
                // Clear cart if it's a regular order
                if (orderData.type === 'order') {
                    this.cart = [];
                    this.updateCartDisplay();
                    this.saveCartToStorage();
                    
                    // Close cart sidebar
                    document.getElementById('cartSidebar').classList.remove('open');
                }
                
                // Log order submission
                app.logEvent('order_submitted', {
                    orderType: orderData.type,
                    itemCount: orderData.items.length,
                    totalAmount: orderData.totalAmount,
                    tableNumber: orderData.tableNumber
                });
                
            } else {
                app.showError(t('order_submission_failed'));
            }
            
        } catch (error) {
            console.error('Order submission error:', error);
            app.showError(t('order_submission_failed'));
        }
    }

    // Setup additional event listeners
    setupEventListeners() {
        // Window resize handler
        window.addEventListener('resize', app.debounce(() => {
            this.updateSliderPosition();
        }, 250));
        
        // Pause auto-slide on hover
        const slider = document.getElementById('menuSlider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.stopAutoSlide());
            slider.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }

    // Get localized text
    getLocalizedText(item, field) {
        const lang = localStorage.getItem('language') || 'en';
        return item[`${field}_${lang}`] || item[`${field}_en`] || item[field] || '';
    }

    // Format price
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(price);
    }

    // Save cart to storage
    saveCartToStorage() {
        localStorage.setItem('uno_cart', JSON.stringify(this.cart));
    }

    // Load cart from storage
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('uno_cart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
                this.updateCartDisplay();
            } catch (error) {
                console.error('Failed to load cart from storage:', error);
                this.cart = [];
            }
        }
    }
}

// Create global menu manager instance
window.MenuManager = MenuManager;
window.menuManager = new MenuManager();

// Global checkout function
window.checkout = function() {
    menuManager.checkout();
};

