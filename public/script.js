// Global variables
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    updateCartDisplay();
});

// Load products from API - improved error handling
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            console.error('Products API returned non-OK:', response.status, text);
            showNotification('Error loading products (server returned ' + response.status + ')', 'error');
            const grid = document.getElementById('productsGrid');
            if (grid) grid.innerHTML = '<p style="padding:2rem;text-align:center;color:#666">Error loading products</p>';
            return;
        }

        const data = await response.json().catch(() => null);
        products = Array.isArray(data) ? data : [];

        if (products.length === 0) {
            const grid = document.getElementById('productsGrid');
            if (grid) grid.innerHTML = '<p style="padding:2rem;text-align:center;color:#666">No products available</p>';
            return;
        }

        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
        const grid = document.getElementById('productsGrid');
        if (grid) grid.innerHTML = '<p style="padding:2rem;text-align:center;color:#666">Error loading products</p>';
    }
}

// Display products on the page
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card HTML
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="images/${product.image_url}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 4rem; color: #ddd;">
                <i class="fas fa-image"></i>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description || ''}</p>
            <div class="product-price">Rs. ${Number(product.price || 0).toLocaleString()}</div>
            <div class="product-stock">Stock: ${product.stock ?? 0} units</div>
            <button class="add-to-cart" 
                    onclick="addToCart(${product.id})"
                    ${product.stock === 0 ? 'disabled' : ''}>
                ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `;
    return card;
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        if (existingItem.quantity < (product.stock || 0)) {
            existingItem.quantity++;
        } else {
            showNotification('Not enough stock available', 'warning');
            return;
        }
    } else {
        if ((product.stock || 0) > 0) {
            cart.push({
                productId: productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image_url || 'prod1.png'
            });
        } else {
            showNotification('Product is out of stock', 'warning');
            return;
        }
    }

    saveCart();
    updateCartDisplay();
    showNotification('Product added to cart', 'success');
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    updateCartDisplay();
    showNotification('Product removed from cart', 'info');
}

// Update product quantity in cart
function updateQuantity(productId, change) {
    const item = cart.find(item => item.productId === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        // Check stock availability
        const product = products.find(p => p.id === productId);
        if (product && item.quantity > product.stock) {
            item.quantity = product.stock;
            showNotification('Not enough stock available', 'warning');
        }
        saveCart();
        updateCartDisplay();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart display
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;

    // Update cart items
    if (cartItems) {
        cartItems.innerHTML = '';
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="images/${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 5px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 1.5rem; color: #ddd;">
                            <i class="fas fa-image"></i>
                        </div>
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">Rs. ${Number(item.price || 0).toLocaleString()}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateQuantity(${item.productId}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.productId}, 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart(${item.productId})">
                            Remove
                        </button>
                    </div>
                `;
                cartItems.appendChild(cartItem);
            });
        }
    }

    // Update cart total
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toLocaleString();
    }
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartSidebar) cartSidebar.classList.toggle('open');
    if (cartOverlay) cartOverlay.classList.toggle('open');
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }

    // Save cart data for checkout page
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
}

// Scroll to products section
function scrollToProducts() {
    const el = document.getElementById('products');
    if (el) {
        el.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Dummy showNotification (if missing in repo, keep or implement)
function showNotification(message, type='info') {
    // Simple console fallback; keep your existing UI implementation if present
    console.log(`[${type}] ${message}`);
}