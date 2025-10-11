// Global variables
let cart = [];
let selectedPaymentMethod = '';
let currentOrderId = '';

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function () {
    loadCartFromStorage();
    displayOrderSummary();
});

// Load cart from localStorage
function loadCartFromStorage() {
    const storedCart = localStorage.getItem('checkoutCart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    } else {
        // Redirect to home if no cart data
        window.location.href = 'index.html';
    }
}

// Display order summary
function displayOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');

    orderItems.innerHTML = '';

    if (cart.length === 0) {
        orderItems.innerHTML = '<p>No items in cart</p>';
        return;
    }

    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <br>
                <small>Quantity: ${item.quantity}</small>
            </div>
            <div>
                Rs. ${(item.price * item.quantity).toLocaleString()}
            </div>
        `;
        orderItems.appendChild(orderItem);
    });

    // Calculate and display total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotal.textContent = total.toLocaleString();
}

// Select payment method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    // Remove previous selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Add selection to clicked option
    event.currentTarget.classList.add('selected');

    // Update radio button
    document.getElementById(method).checked = true;
}

// Place order
async function placeOrder() {
    // Validate form
    if (!validateCheckoutForm()) {
        return;
    }

    if (!selectedPaymentMethod) {
        showNotification('Please select a payment method', 'warning');
        return;
    }

    // Show loading
    showLoading(true);

    try {
        // Prepare order data
        const orderData = {
            customer_name: document.getElementById('customerName').value,
            customer_email: document.getElementById('customerEmail').value,
            customer_phone: document.getElementById('customerPhone').value,
            customer_address: document.getElementById('customerAddress').value,
            items: cart.map(item => ({
                product_id: item.productId,
                quantity: item.quantity
            })),
            payment_method: selectedPaymentMethod
        };

        // Create order
        const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const orderResult = await orderResponse.json();

        if (!orderResult.success) {
            throw new Error(orderResult.error || 'Failed to create order');
        }

        currentOrderId = orderResult.order_id;

        // Initiate payment
        const paymentResponse = await fetch('/api/payment/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_id: currentOrderId,
                payment_method: selectedPaymentMethod
            })
        });

        const paymentResult = await paymentResponse.json();

        if (!paymentResult.success) {
            throw new Error(paymentResult.error || 'Failed to initiate payment');
        }

        // Show payment modal based on method
        showPaymentModal(paymentResult);

    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Error placing order: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Validate checkout form
function validateCheckoutForm() {
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'customerAddress'];

    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showNotification(`${field.previousElementSibling.textContent} is required`, 'warning');
            field.focus();
            return false;
        }
    }

    // Validate email format
    const email = document.getElementById('customerEmail').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'warning');
        document.getElementById('customerEmail').focus();
        return false;
    }

    // Validate phone format (Pakistani phone number)
    const phone = document.getElementById('customerPhone').value;
    const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        showNotification('Please enter a valid Pakistani phone number', 'warning');
        document.getElementById('customerPhone').focus();
        return false;
    }

    return true;
}

// Show payment modal
function showPaymentModal(paymentData) {
    const modal = document.getElementById('paymentModal');
    const title = document.getElementById('paymentTitle');
    const content = document.getElementById('paymentContent');

    title.textContent = `${selectedPaymentMethod.toUpperCase()} Payment Details`;

    let contentHTML = '';

    if (selectedPaymentMethod === 'cod') {
        contentHTML = `
            <div class="payment-info">
                <h4>Cash on Delivery</h4>
                <p>Your order has been placed successfully!</p>
                <p><strong>Order ID:</strong> ${currentOrderId}</p>
                <p><strong>Total Amount:</strong> Rs. ${paymentData.amount.toLocaleString()}</p>
                <p>Payment will be collected upon delivery. Please keep the exact amount ready.</p>
            </div>
        `;
    } else if (selectedPaymentMethod === 'mezan_bank') {
        contentHTML = `
            <div class="payment-info">
                <h4>Mezan Bank Transfer</h4>
                <p>Please transfer the amount to the following bank account:</p>
                <div class="bank-details">
                    <p><strong>Account Title:</strong> ${paymentData.bank_details.account_title}</p>
                    <p><strong>Account Number:</strong> ${paymentData.bank_details.account_number}</p>
                    <p><strong>IBAN:</strong> ${paymentData.bank_details.iban}</p>
                    <p><strong>Amount:</strong> Rs. ${paymentData.amount.toLocaleString()}</p>
                    <p><strong>Reference:</strong> ${paymentData.payment_reference}</p>
                </div>
                <p>After making the transfer, please provide the transaction reference number below:</p>
                <div class="form-group">
                    <label for="transactionRef">Transaction Reference Number *</label>
                    <input type="text" id="transactionRef" placeholder="Enter transaction reference">
                </div>
            </div>
        `;
    } else if (selectedPaymentMethod === 'easypaisa') {
        contentHTML = `
            <div class="payment-info">
                <h4>EasyPaisa Payment</h4>
                <p>Please send payment to the following EasyPaisa account:</p>
                <div class="payment-details">
                    <p><strong>Account Name:</strong> Inayat Rahim</p>
                    <p><strong>EasyPaisa Number:</strong> 03165800166</p>
                    <p><strong>Amount:</strong> Rs. ${paymentData.amount.toLocaleString()}</p>
                    <p><strong>Reference:</strong> ${paymentData.payment_reference}</p>
                </div>
                <p><strong>Instructions:</strong></p>
                <ol>
                    <li>Open EasyPaisa app</li>
                    <li>Go to "Send Money"</li>
                    <li>Enter number: <strong>03165800166</strong></li>
                    <li>Enter amount: <strong>Rs. ${paymentData.amount.toLocaleString()}</strong></li>
                    <li>Add reference: <strong>${paymentData.payment_reference}</strong></li>
                    <li>Complete payment</li>
                </ol>
                <div class="form-group">
                    <label for="transactionRef">Transaction ID/Reference *</label>
                    <input type="text" id="transactionRef" placeholder="Enter transaction ID from EasyPaisa">
                </div>
            </div>
        `;
    } else if (selectedPaymentMethod === 'jazzcash') {
        contentHTML = `
            <div class="payment-info">
                <h4>JazzCash Payment</h4>
                <p>Please send payment to the following JazzCash account:</p>
                <div class="payment-details">
                    <p><strong>Account Name:</strong> Inayat Rahim</p>
                    <p><strong>JazzCash Number:</strong> 03165800166</p>
                    <p><strong>Amount:</strong> Rs. ${paymentData.amount.toLocaleString()}</p>
                    <p><strong>Reference:</strong> ${paymentData.payment_reference}</p>
                </div>
                <p><strong>Instructions:</strong></p>
                <ol>
                    <li>Open JazzCash app</li>
                    <li>Go to "Send Money"</li>
                    <li>Enter number: <strong>03165800166</strong></li>
                    <li>Enter amount: <strong>Rs. ${paymentData.amount.toLocaleString()}</strong></li>
                    <li>Add reference: <strong>${paymentData.payment_reference}</strong></li>
                    <li>Complete payment</li>
                </ol>
                <div class="form-group">
                    <label for="transactionRef">Transaction ID/Reference *</label>
                    <input type="text" id="transactionRef" placeholder="Enter transaction ID from JazzCash">
                </div>
            </div>
        `;
    }

    content.innerHTML = contentHTML;
    modal.classList.add('open');
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('open');
}

// STRICT Payment confirmation - Only for COD, others require admin verification
async function confirmPayment() {
    const transactionRef = document.getElementById('transactionRef');

    // STRICT RULE: For non-COD payments, show warning that admin verification is required
    if (selectedPaymentMethod !== 'cod') {
        showNotification('⚠️ STRICT PAYMENT RULE: For ' + selectedPaymentMethod.toUpperCase() + ' payments, order will remain PENDING until admin manually verifies the payment in your account. No automatic confirmation!', 'warning');

        // Show order pending message
        showOrderPending();
        return;
    }

    // Only COD can be confirmed directly
    if (selectedPaymentMethod === 'cod') {
        showLoading(true);

        try {
            const response = await fetch('/api/payment/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
                },
                body: JSON.stringify({
                    order_id: currentOrderId,
                    payment_reference: document.querySelector('[data-payment-ref]')?.textContent || '',
                    transaction_id: 'COD-' + currentOrderId,
                    payment_method: selectedPaymentMethod
                })
            });

            const result = await response.json();

            if (result.success) {
                showOrderSuccess();
            } else {
                throw new Error(result.error || 'Failed to confirm payment');
            }

        } catch (error) {
            console.error('Error confirming payment:', error);
            showNotification('Error confirming payment: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }
}

// Redirect to EasyPaisa
function redirectToEasyPaisa() {
    // In a real implementation, this would redirect to EasyPaisa payment gateway
    // For demo purposes, we'll simulate the payment
    showNotification('Redirecting to EasyPaisa...', 'info');

    setTimeout(() => {
        showNotification('Payment completed successfully!', 'success');
        confirmPayment();
    }, 2000);
}

// Redirect to JazzCash
function redirectToJazzCash() {
    // In a real implementation, this would redirect to JazzCash payment gateway
    // For demo purposes, we'll simulate the payment
    showNotification('Redirecting to JazzCash...', 'info');

    setTimeout(() => {
        showNotification('Payment completed successfully!', 'success');
        confirmPayment();
    }, 2000);
}

// Show order pending (for non-COD payments)
function showOrderPending() {
    closePaymentModal();

    const modal = document.getElementById('paymentModal');
    const title = document.getElementById('paymentTitle');
    const content = document.getElementById('paymentContent');
    const footer = modal.querySelector('.modal-footer');

    title.textContent = 'Order PENDING - Payment Verification Required';
    content.innerHTML = `
        <div class="order-pending">
            <div class="pending-icon">
                <i class="fas fa-clock"></i>
            </div>
            <h3>Order Created - PENDING Payment Verification</h3>
            <p><strong>Order ID:</strong> ${currentOrderId}</p>
            <p><strong>Payment Method:</strong> ${selectedPaymentMethod.toUpperCase()}</p>
            <div class="strict-warning">
                <h4>⚠️ STRICT PAYMENT RULE:</h4>
                <p>Your order is <strong>PENDING</strong> and will NOT be processed until:</p>
                <ul>
                    <li>✅ Payment is received in our account</li>
                    <li>✅ Admin manually verifies the payment</li>
                    <li>✅ Transaction ID is confirmed</li>
                </ul>
                <p><strong>NO AUTOMATIC CONFIRMATION!</strong></p>
            </div>
            <p>You will receive confirmation only after payment verification.</p>
        </div>
    `;

    footer.innerHTML = `
        <button class="btn btn-primary" onclick="goToHome()">
            <i class="fas fa-home"></i> Continue Shopping
        </button>
    `;

    modal.classList.add('open');

    // Clear cart
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutCart');
}

// Show order success (for COD only)
function showOrderSuccess() {
    closePaymentModal();

    const modal = document.getElementById('paymentModal');
    const title = document.getElementById('paymentTitle');
    const content = document.getElementById('paymentContent');
    const footer = modal.querySelector('.modal-footer');

    title.textContent = 'Order Confirmed!';
    content.innerHTML = `
        <div class="order-success">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Thank you for your order!</h3>
            <p><strong>Order ID:</strong> ${currentOrderId}</p>
            <p><strong>Payment Method:</strong> Cash on Delivery</p>
            <p>Your order has been confirmed and will be processed shortly.</p>
            <p>Payment will be collected upon delivery.</p>
        </div>
    `;

    footer.innerHTML = `
        <button class="btn btn-primary" onclick="goToHome()">
            <i class="fas fa-home"></i> Continue Shopping
        </button>
    `;

    modal.classList.add('open');

    // Clear cart
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutCart');
}

// Go to home page
function goToHome() {
    window.location.href = 'index.html';
}

// Show/hide loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
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
    
    .payment-info {
        text-align: center;
    }
    
    .bank-details {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 5px;
        margin: 1rem 0;
        text-align: left;
    }
    
    .bank-details p {
        margin-bottom: 0.5rem;
    }
    
    .order-success {
        text-align: center;
    }
    
    .success-icon {
        font-size: 4rem;
        color: #28a745;
        margin-bottom: 1rem;
    }
    
    .order-success h3 {
        color: #333;
        margin-bottom: 1rem;
    }
    
    .order-success p {
        margin-bottom: 0.5rem;
        color: #666;
    }
`;
document.head.appendChild(style);
