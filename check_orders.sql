-- =============================================
-- Shop.PK Orders and Payments Check Queries
-- Run these queries in SQL Server Management Studio
-- =============================================

-- Use the shop database
USE shop;

-- 1. Check all orders
PRINT '📦 ALL ORDERS:';
SELECT 
    id,
    order_id,
    customer_name,
    customer_email,
    customer_phone,
    total_amount,
    payment_method,
    payment_status,
    order_status,
    payment_reference,
    created_at
FROM orders
ORDER BY created_at DESC;

PRINT '';

-- 2. Count total orders
PRINT '📊 ORDER STATISTICS:';
SELECT 
    COUNT(*) as Total_Orders,
    SUM(CASE WHEN payment_status = 'confirmed' THEN 1 ELSE 0 END) as Confirmed_Orders,
    SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as Delivered_Orders,
    SUM(CASE WHEN payment_status = 'confirmed' THEN total_amount ELSE 0 END) as Total_Revenue
FROM orders;

PRINT '';

-- 3. Check all payments
PRINT '💳 ALL PAYMENTS:';
SELECT 
    p.id,
    p.order_id,
    o.customer_name,
    p.payment_method,
    p.amount,
    p.payment_status,
    p.transaction_id,
    p.payment_reference,
    p.created_at
FROM payments p
LEFT JOIN orders o ON p.order_id = o.order_id
ORDER BY p.created_at DESC;

PRINT '';

-- 4. Payment statistics
PRINT '💰 PAYMENT STATISTICS:';
SELECT 
    payment_method,
    COUNT(*) as Payment_Count,
    SUM(amount) as Total_Amount,
    SUM(CASE WHEN payment_status = 'confirmed' THEN amount ELSE 0 END) as Confirmed_Amount
FROM payments
GROUP BY payment_method;

PRINT '';

-- 5. Recent orders with details
PRINT '🛒 RECENT ORDERS WITH ITEMS:';
SELECT 
    o.order_id,
    o.customer_name,
    o.customer_email,
    o.total_amount,
    o.payment_method,
    o.payment_status,
    o.order_status,
    o.created_at,
    STRING_AGG(p.name + ' (x' + CAST(oi.quantity AS VARCHAR) + ')', ', ') as Products
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY o.id, o.order_id, o.customer_name, o.customer_email, o.total_amount, 
         o.payment_method, o.payment_status, o.order_status, o.created_at
ORDER BY o.created_at DESC;

PRINT '';

-- 6. Check if iPhone 15 Pro Max was ordered
PRINT '📱 IPHONE 15 PRO MAX ORDERS:';
SELECT 
    o.order_id,
    o.customer_name,
    o.customer_email,
    oi.quantity,
    oi.price as unit_price,
    (oi.quantity * oi.price) as total_price,
    o.payment_method,
    o.payment_status,
    o.created_at
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE p.name = 'iPhone 15 Pro Max'
ORDER BY o.created_at DESC;

PRINT '';

-- 7. Daily order summary
PRINT '📅 DAILY ORDER SUMMARY:';
SELECT 
    CAST(created_at AS DATE) as Order_Date,
    COUNT(*) as Orders_Count,
    SUM(total_amount) as Daily_Revenue,
    SUM(CASE WHEN payment_status = 'confirmed' THEN total_amount ELSE 0 END) as Confirmed_Revenue
FROM orders
GROUP BY CAST(created_at AS DATE)
ORDER BY Order_Date DESC;

PRINT '';

-- 8. Customer details for all orders
PRINT '👥 CUSTOMER INFORMATION:';
SELECT 
    customer_name,
    customer_email,
    customer_phone,
    COUNT(*) as Order_Count,
    SUM(total_amount) as Total_Spent
FROM orders
GROUP BY customer_name, customer_email, customer_phone
ORDER BY Total_Spent DESC;

PRINT '';
PRINT '✅ All queries completed! Check the results above.';
