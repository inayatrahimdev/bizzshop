const sql = require("mssql");

const dbConfig = {
    user: "sa",
    password: "inayat12",
    server: "INAYAT-RAHIM",
    database: "shop",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

async function checkOrders() {
    try {
        console.log("🔍 Checking Shop.PK Orders and Payments...\n");

        await sql.connect(dbConfig);
        console.log("✅ Connected to database successfully!\n");

        // 1. Check all orders
        console.log("📦 ALL ORDERS:");
        console.log("=".repeat(50));
        const ordersResult = await sql.query`
      SELECT 
        id, order_id, customer_name, customer_email, customer_phone,
        total_amount, payment_method, payment_status, order_status,
        payment_reference, created_at
      FROM orders
      ORDER BY created_at DESC
    `;

        if (ordersResult.recordset.length === 0) {
            console.log("❌ No orders found in database.");
        } else {
            ordersResult.recordset.forEach((order, index) => {
                console.log(`${index + 1}. Order ID: ${order.order_id}`);
                console.log(`   Customer: ${order.customer_name}`);
                console.log(`   Email: ${order.customer_email}`);
                console.log(`   Phone: ${order.customer_phone}`);
                console.log(`   Amount: Rs. ${order.total_amount}`);
                console.log(`   Payment Method: ${order.payment_method}`);
                console.log(`   Payment Status: ${order.payment_status}`);
                console.log(`   Order Status: ${order.order_status}`);
                console.log(`   Date: ${new Date(order.created_at).toLocaleString()}`);
                console.log(`   Payment Ref: ${order.payment_reference || 'N/A'}`);
                console.log("");
            });
        }

        // 2. Order statistics
        console.log("📊 ORDER STATISTICS:");
        console.log("=".repeat(50));
        const statsResult = await sql.query`
      SELECT 
        COUNT(*) as Total_Orders,
        SUM(CASE WHEN payment_status = 'confirmed' THEN 1 ELSE 0 END) as Confirmed_Orders,
        SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as Delivered_Orders,
        SUM(CASE WHEN payment_status = 'confirmed' THEN total_amount ELSE 0 END) as Total_Revenue
      FROM orders
    `;

        const stats = statsResult.recordset[0];
        console.log(`Total Orders: ${stats.Total_Orders}`);
        console.log(`Confirmed Orders: ${stats.Confirmed_Orders}`);
        console.log(`Delivered Orders: ${stats.Delivered_Orders}`);
        console.log(`Total Revenue: Rs. ${stats.Total_Revenue || 0}`);
        console.log("");

        // 3. Check payments
        console.log("💳 ALL PAYMENTS:");
        console.log("=".repeat(50));
        const paymentsResult = await sql.query`
      SELECT 
        p.id, p.order_id, o.customer_name, p.payment_method,
        p.amount, p.payment_status, p.transaction_id,
        p.payment_reference, p.created_at
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.order_id
      ORDER BY p.created_at DESC
    `;

        if (paymentsResult.recordset.length === 0) {
            console.log("❌ No payments found in database.");
        } else {
            paymentsResult.recordset.forEach((payment, index) => {
                console.log(`${index + 1}. Payment ID: ${payment.id}`);
                console.log(`   Order ID: ${payment.order_id}`);
                console.log(`   Customer: ${payment.customer_name}`);
                console.log(`   Method: ${payment.payment_method}`);
                console.log(`   Amount: Rs. ${payment.amount}`);
                console.log(`   Status: ${payment.payment_status}`);
                console.log(`   Transaction ID: ${payment.transaction_id || 'N/A'}`);
                console.log(`   Date: ${new Date(payment.created_at).toLocaleString()}`);
                console.log("");
            });
        }

        // 4. Payment method summary
        console.log("💰 PAYMENT METHOD SUMMARY:");
        console.log("=".repeat(50));
        const paymentMethodsResult = await sql.query`
      SELECT 
        payment_method,
        COUNT(*) as Payment_Count,
        SUM(amount) as Total_Amount,
        SUM(CASE WHEN payment_status = 'confirmed' THEN amount ELSE 0 END) as Confirmed_Amount
      FROM payments
      GROUP BY payment_method
    `;

        paymentMethodsResult.recordset.forEach(payment => {
            console.log(`${payment.payment_method.toUpperCase()}:`);
            console.log(`  Total Payments: ${payment.Payment_Count}`);
            console.log(`  Total Amount: Rs. ${payment.Total_Amount}`);
            console.log(`  Confirmed Amount: Rs. ${payment.Confirmed_Amount}`);
            console.log("");
        });

        // 5. Check iPhone 15 Pro Max orders specifically
        console.log("📱 IPHONE 15 PRO MAX ORDERS:");
        console.log("=".repeat(50));
        const iphoneOrdersResult = await sql.query`
      SELECT 
        o.order_id, o.customer_name, o.customer_email,
        oi.quantity, oi.price as unit_price,
        (oi.quantity * oi.price) as total_price,
        o.payment_method, o.payment_status, o.created_at
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.name = 'iPhone 15 Pro Max'
      ORDER BY o.created_at DESC
    `;

        if (iphoneOrdersResult.recordset.length === 0) {
            console.log("❌ No iPhone 15 Pro Max orders found.");
        } else {
            iphoneOrdersResult.recordset.forEach((order, index) => {
                console.log(`${index + 1}. Order ID: ${order.order_id}`);
                console.log(`   Customer: ${order.customer_name}`);
                console.log(`   Email: ${order.customer_email}`);
                console.log(`   Quantity: ${order.quantity}`);
                console.log(`   Unit Price: Rs. ${order.unit_price}`);
                console.log(`   Total Price: Rs. ${order.total_price}`);
                console.log(`   Payment Method: ${order.payment_method}`);
                console.log(`   Payment Status: ${order.payment_status}`);
                console.log(`   Date: ${new Date(order.created_at).toLocaleString()}`);
                console.log("");
            });
        }

        // 6. Recent orders with product details
        console.log("🛒 RECENT ORDERS WITH PRODUCTS:");
        console.log("=".repeat(50));
        const orderDetailsResult = await sql.query`
      SELECT 
        o.order_id, o.customer_name, o.total_amount,
        o.payment_method, o.payment_status, o.order_status,
        STRING_AGG(p.name + ' (x' + CAST(oi.quantity AS VARCHAR) + ')', ', ') as Products
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, o.order_id, o.customer_name, o.total_amount, 
               o.payment_method, o.payment_status, o.order_status
      ORDER BY o.id DESC
    `;

        orderDetailsResult.recordset.forEach((order, index) => {
            console.log(`${index + 1}. Order ID: ${order.order_id}`);
            console.log(`   Customer: ${order.customer_name}`);
            console.log(`   Products: ${order.Products || 'N/A'}`);
            console.log(`   Total: Rs. ${order.total_amount}`);
            console.log(`   Payment: ${order.payment_method} (${order.payment_status})`);
            console.log(`   Status: ${order.order_status}`);
            console.log("");
        });

        console.log("✅ Order check completed successfully!");

    } catch (error) {
        console.error("❌ Error checking orders:", error.message);
    } finally {
        await sql.close();
    }
}

checkOrders();
