// Menu Management for UNO Restaurant QR Menu System

class MenuManager {
    constructor() {
        this.menuItems = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.currentSlideIndex = 0;
        this.filteredItems = [];
        this.tableNumber = Utils.getTableNumber();
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            await this.loadData();
            this.setupEventListeners();
            this.renderCategories();
            this.renderMenuItems();
            this.setupSlider();
            this.hideLoading();
        } catch (error) {
            console.error('Error initializing menu:', error);
            this.showError('Failed to load menu data');
        }
    }

    showLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    async loadData() {
        try {
            // Load menu items and categories in parallel
            const [menuItems, categories] = await Promise.all([
                googleSheetsAPI.getMenuItems(),
                googleSheetsAPI.getCategories()
            ]);

            this.menuItems = menuItems || [];
            this.categories = categories || [];
            this.filteredItems = this.menuItems;

            // Update table number display
            const tableNumberElement = document.getElementById('tableNumber');
            if (tableNumberElement) {
                tableNumberElement.textContent = this.tableNumber;
            }

        } catch (error) {
            console.error('Error loading menu data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Language change event
        window.addEventListener('languageChanged', () => {
            this.renderCategories();
            this.renderMenuItems();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.slideMenu('prev');
            } else if (e.key === 'ArrowRight') {
                this.slideMenu('next');
            }
        });

        // Touch/swipe support
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        const slider = document.getElementById('menuSlider');
        if (!slider) return;

        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        slider.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            e.preventDefault();
        });

        slider.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;

            const diff = startX - currentX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.slideMenu('next');
                } else {
                    this.slideMenu('prev');
                }
            }
        });
    }

    renderCategories() {
        const categoryNav = document.getElementById('categoryNav');
        if (!categoryNav) return;

        const currentLang = languageManager.getCurrentLanguage();
        
        // Add "All" category
        const allCategoryHtml = `
            <button class="category-btn ${this.currentCategory === 'all' ? 'active' : ''}" 
                    onclick="menuManager.filterByCategory('all')">
                ${currentLang === 'en' ? 'All' : 'الكل'}
            </button>
        `;

        // Render other categories
        const categoriesHtml = this.categories.map(category => `
            <button class="category-btn ${this.currentCategory === category.id ? 'active' : ''}" 
                    onclick="menuManager.filterByCategory('${category.id}')">
                <i class="${category.icon || 'fas fa-utensils'}"></i>
                ${currentLang === 'en' ? category.nameEn : category.nameAr}
            </button>
        `).join('');

        categoryNav.innerHTML = allCategoryHtml + categoriesHtml;
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.currentSlideIndex = 0;

        if (categoryId === 'all') {
            this.filteredItems = this.menuItems;
        } else {
            this.filteredItems = this.menuItems.filter(item => item.categoryId === categoryId);
        }

        this.renderCategories();
        this.renderMenuItems();
        this.updateSliderPosition();
    }

    renderMenuItems() {
        const menuSlider = document.getElementById('menuSlider');
        if (!menuSlider) return;

        const currentLang = languageManager.getCurrentLanguage();

        const itemsHtml = this.filteredItems.map(item => {
            const itemName = currentLang === 'en' ? item.nameEn : item.nameAr;
            const itemDescription = currentLang === 'en' ? item.descriptionEn : item.descriptionAr;
            const prepTimeText = currentLang === 'en' ? 'minutes' : 'دقيقة';
            
            // Get price display
            let priceDisplay = '';
            if (item.sizes && item.sizes.length > 0) {
                const minPrice = Math.min(...item.sizes.map(size => parseFloat(size.price)));
                const maxPrice = Math.max(...item.sizes.map(size => parseFloat(size.price)));
                if (minPrice === maxPrice) {
                    priceDisplay = Utils.formatCurrency(minPrice);
                } else {
                    priceDisplay = `${Utils.formatCurrency(minPrice)} - ${Utils.formatCurrency(maxPrice)}`;
                }
            } else {
                priceDisplay = Utils.formatCurrency(item.price || 0);
            }

            return `
                <div class="menu-item animate-slide-up" data-item-id="${item.id}">
                    <img src="${item.imageUrl || 'images/placeholder.jpg'}" 
                         alt="${itemName}" 
                         class="menu-item-image"
                         onerror="this.src='images/placeholder.jpg'">
                    
                    <div class="menu-item-content">
                        <h3 class="menu-item-title">${itemName}</h3>
                        <p class="menu-item-description">${itemDescription || ''}</p>
                        <div class="menu-item-price">${priceDisplay}</div>
                        
                        ${item.prepTime ? `
                            <div class="menu-item-prep-time">
                                <i class="fas fa-clock"></i>
                                ${item.prepTime} ${prepTimeText}
                            </div>
                        ` : ''}
                        
                        <div class="menu-item-actions">
                            <button class="btn-add-to-cart" onclick="menuManager.addToCart('${item.id}')">
                                ${currentLang === 'en' ? 'Add to Cart' : 'إضافة للسلة'}
                            </button>
                            <button class="btn-view-details" onclick="menuManager.showItemDetails('${item.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        menuSlider.innerHTML = itemsHtml;
        
        // Add animation delay to items
        const items = menuSlider.querySelectorAll('.menu-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    setupSlider() {
        // Auto-slide functionality
        this.startAutoSlide();
        
        // Pause auto-slide on hover
        const sliderContainer = document.querySelector('.menu-slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => {
                this.stopAutoSlide();
            });
            
            sliderContainer.addEventListener('mouseleave', () => {
                this.startAutoSlide();
            });
        }
    }

    slideMenu(direction) {
        const itemsPerView = this.getItemsPerView();
        const maxIndex = Math.max(0, this.filteredItems.length - itemsPerView);

        if (direction === 'next') {
            this.currentSlideIndex = Math.min(this.currentSlideIndex + 1, maxIndex);
        } else {
            this.currentSlideIndex = Math.max(this.currentSlideIndex - 1, 0);
        }

        this.updateSliderPosition();
    }

    updateSliderPosition() {
        const menuSlider = document.getElementById('menuSlider');
        if (!menuSlider) return;

        const itemWidth = 320; // 300px + 20px margin
        const translateX = -this.currentSlideIndex * itemWidth;
        
        menuSlider.style.transform = `translateX(${translateX}px)`;
        
        // Update 3D effect
        const items = menuSlider.querySelectorAll('.menu-item');
        items.forEach((item, index) => {
            const distance = Math.abs(index - this.currentSlideIndex - 1);
            const scale = Math.max(0.8, 1 - distance * 0.1);
            const rotateY = (index - this.currentSlideIndex - 1) * 10;
            const translateZ = -distance * 50;
            
            item.style.transform = `scale(${scale}) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
            item.style.opacity = distance > 2 ? '0.3' : '1';
        });
    }

    getItemsPerView() {
        const screenWidth = window.innerWidth;
        if (screenWidth < 480) return 1;
        if (screenWidth < 768) return 2;
        if (screenWidth < 1024) return 3;
        return 4;
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            const itemsPerView = this.getItemsPerView();
            const maxIndex = Math.max(0, this.filteredItems.length - itemsPerView);
            
            if (this.currentSlideIndex >= maxIndex) {
                this.currentSlideIndex = 0;
            } else {
                this.currentSlideIndex++;
            }
            
            this.updateSliderPosition();
        }, 4000);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    addToCart(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;

        // If item has multiple sizes, show selection modal
        if (item.sizes && item.sizes.length > 1) {
            this.showItemDetails(itemId);
            return;
        }

        // Add to cart with default size or no size
        const cartItem = {
            id: item.id,
            name: languageManager.getCurrentLanguage() === 'en' ? item.nameEn : item.nameAr,
            image: item.imageUrl,
            price: item.sizes && item.sizes.length > 0 ? item.sizes[0].price : item.price,
            size: item.sizes && item.sizes.length > 0 ? item.sizes[0].name : null,
            quantity: 1
        };

        cartManager.addItem(cartItem);
        
        // Show success feedback
        const currentLang = languageManager.getCurrentLanguage();
        const message = currentLang === 'en' ? 'Item added to cart' : 'تم إضافة العنصر للسلة';
        Utils.showToast(message, 'success');
    }

    showItemDetails(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;

        const modal = document.getElementById('itemModal');
        const modalTitle = document.getElementById('itemModalTitle');
        const modalBody = document.getElementById('itemModalBody');
        
        if (!modal || !modalTitle || !modalBody) return;

        const currentLang = languageManager.getCurrentLanguage();
        const itemName = currentLang === 'en' ? item.nameEn : item.nameAr;
        const itemDescription = currentLang === 'en' ? item.descriptionEn : item.descriptionAr;
        const prepTimeText = currentLang === 'en' ? 'minutes' : 'دقيقة';

        modalTitle.textContent = itemName;

        const sizesHtml = item.sizes && item.sizes.length > 0 ? `
            <div class="mb-3">
                <label class="form-label">${currentLang === 'en' ? 'Select Size' : 'اختر الحجم'}</label>
                <div class="size-options">
                    ${item.sizes.map((size, index) => `
                        <div class="size-option ${index === 0 ? 'selected' : ''}" 
                             onclick="menuManager.selectSize(this, '${size.name}', ${size.price})">
                            <div class="size-name">${size.name}</div>
                            <div class="size-price">${Utils.formatCurrency(size.price)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        modalBody.innerHTML = `
            <img src="${item.imageUrl || 'images/placeholder.jpg'}" 
                 alt="${itemName}" 
                 class="item-modal-image"
                 onerror="this.src='images/placeholder.jpg'">
            
            <p class="mb-3">${itemDescription || ''}</p>
            
            ${item.prepTime ? `
                <div class="mb-3">
                    <strong>${currentLang === 'en' ? 'Preparation Time' : 'وقت التحضير'}:</strong>
                    ${item.prepTime} ${prepTimeText}
                </div>
            ` : ''}
            
            ${sizesHtml}
            
            <div class="mb-3">
                <label class="form-label">${currentLang === 'en' ? 'Quantity' : 'الكمية'}</label>
                <div class="d-flex align-items-center gap-2">
                    <button class="quantity-btn" onclick="menuManager.changeQuantity(-1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span id="modalQuantity" class="mx-3">1</span>
                    <button class="quantity-btn" onclick="menuManager.changeQuantity(1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">${currentLang === 'en' ? 'Special Instructions' : 'تعليمات خاصة'} 
                    <small class="text-muted">(${currentLang === 'en' ? 'Optional' : 'اختياري'})</small>
                </label>
                <textarea class="form-control" id="specialInstructions" rows="3" 
                          placeholder="${currentLang === 'en' ? 'Any special requests...' : 'أي طلبات خاصة...'}"></textarea>
            </div>
            
            <div class="d-grid">
                <button class="btn btn-primary btn-lg" onclick="menuManager.addToCartFromModal('${item.id}')">
                    ${currentLang === 'en' ? 'Add to Cart' : 'إضافة للسلة'}
                </button>
            </div>
        `;

        // Store current item data
        this.currentModalItem = item;
        this.currentModalQuantity = 1;
        this.currentModalSize = item.sizes && item.sizes.length > 0 ? item.sizes[0] : null;

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    selectSize(element, sizeName, sizePrice) {
        // Remove selected class from all size options
        const sizeOptions = element.parentElement.querySelectorAll('.size-option');
        sizeOptions.forEach(option => option.classList.remove('selected'));
        
        // Add selected class to clicked option
        element.classList.add('selected');
        
        // Update current modal size
        this.currentModalSize = { name: sizeName, price: sizePrice };
    }

    changeQuantity(change) {
        this.currentModalQuantity = Math.max(1, this.currentModalQuantity + change);
        const quantityElement = document.getElementById('modalQuantity');
        if (quantityElement) {
            quantityElement.textContent = this.currentModalQuantity;
        }
    }

    addToCartFromModal(itemId) {
        const item = this.currentModalItem;
        if (!item) return;

        const specialInstructions = document.getElementById('specialInstructions')?.value || '';
        const currentLang = languageManager.getCurrentLanguage();

        const cartItem = {
            id: item.id + '_' + Date.now(), // Unique ID for cart item
            originalId: item.id,
            name: currentLang === 'en' ? item.nameEn : item.nameAr,
            image: item.imageUrl,
            price: this.currentModalSize ? this.currentModalSize.price : item.price,
            size: this.currentModalSize ? this.currentModalSize.name : null,
            quantity: this.currentModalQuantity,
            specialInstructions: specialInstructions
        };

        cartManager.addItem(cartItem);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('itemModal'));
        if (modal) {
            modal.hide();
        }
        
        // Show success feedback
        const message = currentLang === 'en' ? 'Item added to cart' : 'تم إضافة العنصر للسلة';
        Utils.showToast(message, 'success');
    }

    showError(message) {
        const currentLang = languageManager.getCurrentLanguage();
        const errorMessage = currentLang === 'en' ? message : 'حدث خطأ في تحميل البيانات';
        Utils.showToast(errorMessage, 'danger');
    }

    // Refresh menu data
    async refresh() {
        try {
            this.showLoading();
            await this.loadData();
            this.renderCategories();
            this.renderMenuItems();
            this.hideLoading();
        } catch (error) {
            console.error('Error refreshing menu:', error);
            this.showError('Failed to refresh menu data');
        }
    }
}

// Global functions for HTML onclick events
window.slideMenu = (direction) => {
    if (window.menuManager) {
        window.menuManager.slideMenu(direction);
    }
};

// Initialize menu manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menuManager = new MenuManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuManager;
}

