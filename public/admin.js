// Global variables
let authToken = '';
let currentAdmin = null;
let orders = [];
let payments = [];
let products = [];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function () {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
        authToken = token;
        showAdminDashboard();
        loadDashboardData();
    } else {
        showLoginForm();
    }

    // Setup login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

// Show login form
function showLoginForm() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

// Show admin dashboard
function showAdminDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            authToken = result.token;
            currentAdmin = result.admin;

            // Store token in localStorage
            localStorage.setItem('adminToken', authToken);

            showAdminDashboard();
            loadDashboardData();
            showNotification('Login successful!', 'success');
        } else {
            showNotification(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login error: ' + error.message, 'error');
    }
}

// Logout
function logout() {
    authToken = '';
    currentAdmin = null;
    localStorage.removeItem('adminToken');
    showLoginForm();
    showNotification('Logged out successfully', 'info');
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadOrders(),
            loadPayments(),
            loadProducts()
        ]);

        updateDashboardStats();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch('/api/admin/orders', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        orders = await response.json();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Load payments
async function loadPayments() {
    try {
        const response = await fetch('/api/admin/payments', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        payments = await response.json();
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.payment_status === 'confirmed' ? parseFloat(order.total_amount) : 0);
    }, 0);
    const pendingOrders = orders.filter(order => order.order_status === 'pending').length;
    const completedOrders = orders.filter(order => order.order_status === 'delivered').length;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = 'Rs. ' + totalRevenue.toLocaleString();
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName + 'Section').style.display = 'block';

    // Add active class to clicked nav item
    event.target.classList.add('active');

    // Load section data
    if (sectionName === 'orders') {
        displayOrders();
    } else if (sectionName === 'payments') {
        displayPayments();
    } else if (sectionName === 'products') {
        displayProducts();
    }
}

// Display orders
function displayOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No orders found</td></tr>';
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.order_id}</td>
            <td>
                <strong>${order.customer_name}</strong><br>
                <small>${order.customer_email}</small><br>
                <small>${order.customer_phone}</small>
            </td>
            <td>${order.products || 'N/A'}</td>
            <td>Rs. ${parseFloat(order.total_amount).toLocaleString()}</td>
            <td>${order.payment_method.toUpperCase()}</td>
            <td><span class="status-badge status-${order.payment_status}">${order.payment_status}</span></td>
            <td><span class="status-badge status-${order.order_status}">${order.order_status}</span></td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="updateOrderStatusModal('${order.order_id}', '${order.order_status}')">
                    Update Status
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Display payments
function displayPayments() {
    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = '';

    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No payments found</td></tr>';
        return;
    }

    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.id}</td>
            <td>${payment.order_id}</td>
            <td>
                <strong>${payment.customer_name}</strong><br>
                <small>${payment.customer_email}</small>
            </td>
            <td>Rs. ${parseFloat(payment.amount).toLocaleString()}</td>
            <td>${payment.payment_method.toUpperCase()}</td>
            <td><span class="status-badge status-${payment.payment_status}">${payment.payment_status}</span></td>
            <td>${payment.transaction_id || 'N/A'}</td>
            <td>${new Date(payment.created_at).toLocaleDateString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// Display products
function displayProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No products found</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>Rs. ${parseFloat(product.price).toLocaleString()}</td>
            <td>${product.stock}</td>
            <td>${product.category || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary">
                    Edit
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show update order status modal
function updateOrderStatusModal(orderId, currentStatus) {
    const modal = document.getElementById('orderStatusModal');
    const select = document.getElementById('orderStatusSelect');

    select.value = currentStatus;
    select.setAttribute('data-order-id', orderId);

    modal.classList.add('open');
}

// Close order status modal
function closeOrderStatusModal() {
    const modal = document.getElementById('orderStatusModal');
    modal.classList.remove('open');
}

// Update order status
async function updateOrderStatus() {
    const select = document.getElementById('orderStatusSelect');
    const orderId = select.getAttribute('data-order-id');
    const newStatus = select.value;

    try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ order_status: newStatus })
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const result = await response.json();

        if (result.success) {
            showNotification('Order status updated successfully', 'success');
            closeOrderStatusModal();
            refreshOrders();
            updateDashboardStats();
        } else {
            showNotification(result.error || 'Failed to update order status', 'error');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error updating order status', 'error');
    }
}

// Refresh orders
async function refreshOrders() {
    await loadOrders();
    displayOrders();
    updateDashboardStats();
}

// Refresh payments
async function refreshPayments() {
    await loadPayments();
    displayPayments();
}

// Refresh products
async function refreshProducts() {
    await loadProducts();
    displayProducts();
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Get notification color based on type
function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    return colors[type] || '#17a2b8';
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);
