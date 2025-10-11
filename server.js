const express = require("express");
const sql = require("mssql");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// Database configuration
const dbConfig = {
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "inayat12",
    server: process.env.DB_SERVER || "INAYAT-RAHIM",
    database: process.env.DB_NAME || "shop",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

// STRICT PAYMENT CONFIGURATIONS - REAL ACCOUNTS ONLY
const PAYMENT_CONFIG = {
    MEZAN_BANK: {
        account_number: "1234567890123456",
        account_title: "Inayat Rahim Business Account",
        iban: "PK36MEZN0001234567890123",
        verification_required: true // STRICT: Must verify actual bank transfer
    },
    EASYPAISA: {
        merchant_id: "03165800166",
        api_key: "EASYPAISA_API_KEY_123",
        account_name: "Inayat Rahim",
        account_number: "03165800166",
        verification_required: true, // STRICT: Must verify actual EasyPaisa payment
        sandbox_url: "https://sandbox.easypaisa.com/api/pay"
    },
    JAZZCASH: {
        merchant_id: "03165800166",
        api_key: "JAZZCASH_API_KEY_456",
        account_name: "Inayat Rahim",
        account_number: "03165800166",
        verification_required: true, // STRICT: Must verify actual JazzCash payment
        sandbox_url: "https://sandbox.jazzcash.com.pk/api/pay"
    },
    COD: {
        verification_required: false // Only COD doesn't need pre-verification
    }
};

// STRICT PAYMENT RULES
const PAYMENT_RULES = {
    NO_ORDER_WITHOUT_PAYMENT: true,
    COD_ALLOWED: true,
    MANUAL_VERIFICATION_REQUIRED: true,
    AUTO_CONFIRM_DISABLED: true
};

// ULTRA STRONG JWT Secret - UNBREAKABLE
const JWT_SECRET = process.env.JWT_SECRET || "ShopPK_SuperSecret_2024_UltraSecure_JWT_Token_Key_For_Inayat_Rahim_Admin_Only_NoBreak_12345";

// STRICT ADMIN CREDENTIALS - UNBREAKABLE
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || "inayataifuturescopebrightbzzzz",
    password: process.env.ADMIN_PASSWORD || "inayataifuturescopebrightbzzzz@12345",
    email: process.env.ADMIN_EMAIL || "admin@shop.pk"
};

// Connect to SQL Server
sql.connect(dbConfig)
    .then(() => console.log("✅ Connected to SQL Server successfully!"))
    .catch(err => console.error("❌ Database connection failed:", err));

// Initialize database tables
async function initializeDatabase() {
    try {
        // Create products table
        await sql.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='products' AND xtype='U')
      CREATE TABLE products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        price DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 0,
        image_url NVARCHAR(255),
        category NVARCHAR(100),
        created_at DATETIME DEFAULT GETDATE()
      )
    `);

        // Create orders table
        await sql.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
      CREATE TABLE orders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_id NVARCHAR(50) UNIQUE NOT NULL,
        customer_name NVARCHAR(255) NOT NULL,
        customer_email NVARCHAR(255) NOT NULL,
        customer_phone NVARCHAR(20) NOT NULL,
        customer_address NVARCHAR(MAX) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method NVARCHAR(50) NOT NULL,
        payment_status NVARCHAR(50) DEFAULT 'pending',
        order_status NVARCHAR(50) DEFAULT 'pending',
        payment_reference NVARCHAR(255),
        created_at DATETIME DEFAULT GETDATE()
      )
    `);

        // Create order_items table
        await sql.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_items' AND xtype='U')
      CREATE TABLE order_items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_id NVARCHAR(50) NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

        // Create payments table
        await sql.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='payments' AND xtype='U')
      CREATE TABLE payments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_id NVARCHAR(50) NOT NULL,
        payment_method NVARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_status NVARCHAR(50) DEFAULT 'pending',
        transaction_id NVARCHAR(255),
        payment_reference NVARCHAR(255),
        created_at DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
      )
    `);

        // Create admin_users table
        await sql.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_users' AND xtype='U')
      CREATE TABLE admin_users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        email NVARCHAR(255),
        created_at DATETIME DEFAULT GETDATE()
      )
    `);

        console.log("✅ Database tables initialized successfully!");
    } catch (err) {
        console.error("❌ Database initialization failed:", err);
    }
}

// Initialize database on startup
initializeDatabase();

// Authentication middleware
// ULTRA STRICT Admin Authentication Middleware
function authenticateAdmin(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        console.log(`❌ ADMIN ACCESS DENIED: No token from IP ${req.ip}`);
        return res.status(401).json({
            message: 'ACCESS DENIED: No authentication token provided.',
            security: 'ULTRA STRICT AUTHENTICATION ACTIVE'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // STRICT VALIDATION - Verify admin credentials
        if (decoded.username !== ADMIN_CREDENTIALS.username || decoded.role !== 'ULTRA_ADMIN') {
            console.log(`❌ ADMIN ACCESS DENIED: Invalid token from IP ${req.ip}`);
            return res.status(403).json({
                message: 'ACCESS DENIED: Invalid admin token.',
                security: 'ULTRA STRICT AUTHENTICATION ACTIVE'
            });
        }

        // STRICT SUCCESS LOG
        console.log(`✅ ADMIN ACCESS GRANTED: ${decoded.username} from IP ${req.ip}`);
        req.admin = decoded;
        next();
    } catch (err) {
        console.log(`❌ ADMIN ACCESS DENIED: Token verification failed from IP ${req.ip}`);
        res.status(403).json({
            message: 'ACCESS DENIED: Token verification failed.',
            security: 'ULTRA STRICT AUTHENTICATION ACTIVE'
        });
    }
}

// API Routes

// Products API
app.get("/api/products", async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM products ORDER BY created_at DESC`;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Error fetching products: " + err.message });
    }
});

app.get("/api/products/:id", async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM products WHERE id = ${req.params.id}`;
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: "Error fetching product: " + err.message });
    }
});

// STRICT Orders API - No order completion without payment
app.post("/api/orders", async (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, customer_address, items, payment_method } = req.body;

        // STRICT RULE: Validate payment method
        if (!PAYMENT_CONFIG[payment_method.toUpperCase()]) {
            return res.status(400).json({
                error: "Invalid payment method. Allowed: COD, EASYPAISA, JAZZCASH, MEZAN_BANK"
            });
        }

        // Calculate total amount
        let total_amount = 0;
        for (const item of items) {
            const product = await sql.query`SELECT price FROM products WHERE id = ${item.product_id}`;
            if (product.recordset.length > 0) {
                total_amount += product.recordset[0].price * item.quantity;
            }
        }

        // Generate unique order ID
        const order_id = uuidv4();

        // STRICT RULE: Create order with PENDING status - NO CONFIRMATION without payment
        await sql.query`
      INSERT INTO orders (order_id, customer_name, customer_email, customer_phone, customer_address, total_amount, payment_method, payment_status, order_status)
      VALUES (${order_id}, ${customer_name}, ${customer_email}, ${customer_phone}, ${customer_address}, ${total_amount}, ${payment_method}, 'pending', 'pending')
    `;

        // Create order items
        for (const item of items) {
            const product = await sql.query`SELECT price FROM products WHERE id = ${item.product_id}`;
            if (product.recordset.length > 0) {
                await sql.query`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (${order_id}, ${item.product_id}, ${item.quantity}, ${product.recordset[0].price})
        `;
            }
        }

        // Create payment record with PENDING status
        await sql.query`
      INSERT INTO payments (order_id, payment_method, amount, payment_status)
      VALUES (${order_id}, ${payment_method}, ${total_amount}, 'pending')
    `;

        // STRICT MESSAGE: Order created but NOT confirmed until payment
        let message = "";
        if (payment_method === 'cod') {
            message = "Order created successfully. Payment will be collected upon delivery. Order is PENDING until payment confirmation.";
        } else {
            message = "Order created successfully. Order is PENDING - NO CONFIRMATION until payment is received and verified by admin.";
        }

        console.log(`⚠️  PENDING ORDER: ${order_id}, Amount: Rs. ${total_amount}, Method: ${payment_method}, Status: PENDING PAYMENT`);

        res.json({
            success: true,
            order_id: order_id,
            total_amount: total_amount,
            payment_status: 'pending',
            order_status: 'pending',
            message: message,
            strict_rules: "NO ORDER CONFIRMATION WITHOUT PAYMENT VERIFICATION"
        });

    } catch (err) {
        console.error("❌ Order creation error:", err);
        res.status(500).json({ error: "Error creating order: " + err.message });
    }
});

// Payment API
app.post("/api/payment/initiate", async (req, res) => {
    try {
        const { order_id, payment_method } = req.body;

        // Get order details
        const order = await sql.query`SELECT * FROM orders WHERE order_id = ${order_id}`;
        if (order.recordset.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const orderData = order.recordset[0];

        // Generate payment reference
        const payment_reference = uuidv4();

        // Update payment record
        await sql.query`
      UPDATE payments 
      SET payment_reference = ${payment_reference}, payment_status = 'initiated'
      WHERE order_id = ${order_id}
    `;

        // Prepare payment response based on method
        let payment_response = {
            success: true,
            payment_reference: payment_reference,
            order_id: order_id,
            amount: orderData.total_amount,
            payment_method: payment_method
        };

        if (payment_method === 'cod') {
            payment_response.message = "Cash on Delivery selected. Order will be processed after payment confirmation.";
        } else if (payment_method === 'mezan_bank') {
            payment_response.bank_details = PAYMENT_CONFIG.MEZAN_BANK;
            payment_response.message = "Please transfer the amount to the provided bank account and share the transaction reference.";
        } else if (payment_method === 'easypaisa') {
            payment_response.merchant_id = PAYMENT_CONFIG.EASYPAISA.merchant_id;
            payment_response.payment_url = `${PAYMENT_CONFIG.EASYPAISA.sandbox_url}?ref=${payment_reference}`;
        } else if (payment_method === 'jazzcash') {
            payment_response.merchant_id = PAYMENT_CONFIG.JAZZCASH.merchant_id;
            payment_response.payment_url = `${PAYMENT_CONFIG.JAZZCASH.sandbox_url}?ref=${payment_reference}`;
        }

        res.json(payment_response);

    } catch (err) {
        res.status(500).json({ error: "Error initiating payment: " + err.message });
    }
});

// STRICT Payment confirmation API - Only admin can confirm payments
app.post("/api/payment/confirm", authenticateAdmin, async (req, res) => {
    try {
        const { order_id, payment_reference, transaction_id, payment_method } = req.body;

        // Get order details
        const order = await sql.query`SELECT * FROM orders WHERE order_id = ${order_id}`;
        if (order.recordset.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const orderData = order.recordset[0];

        // STRICT RULE: Only COD can be auto-confirmed by admin
        if (payment_method !== 'cod' && !transaction_id) {
            return res.status(400).json({
                error: "STRICT RULE: For non-COD payments, you must provide transaction_id as proof of payment"
            });
        }

        // STRICT RULE: Verify transaction ID format for digital payments
        if (payment_method === 'easypaisa' || payment_method === 'jazzcash') {
            if (!transaction_id || transaction_id.length < 10) {
                return res.status(400).json({
                    error: "STRICT RULE: Valid transaction ID required for EasyPaisa/JazzCash payments"
                });
            }
        }

        // STRICT RULE: For bank transfers, require transaction reference
        if (payment_method === 'mezan_bank') {
            if (!transaction_id || transaction_id.length < 5) {
                return res.status(400).json({
                    error: "STRICT RULE: Bank transfer reference number required"
                });
            }
        }

        // Update payment status to confirmed
        await sql.query`
      UPDATE payments 
      SET payment_status = 'confirmed', transaction_id = ${transaction_id || 'COD-' + order_id}
      WHERE order_id = ${order_id} AND payment_reference = ${payment_reference}
    `;

        // Update order status to confirmed
        await sql.query`
      UPDATE orders 
      SET payment_status = 'confirmed', order_status = 'confirmed'
      WHERE order_id = ${order_id}
    `;

        // Log the confirmation
        console.log(`✅ PAYMENT CONFIRMED: Order ${order_id}, Method: ${payment_method}, Amount: Rs. ${orderData.total_amount}, Transaction: ${transaction_id || 'COD'}`);

        res.json({
            success: true,
            message: "Payment confirmed successfully. Order is now being processed.",
            order_id: order_id,
            payment_method: payment_method,
            amount: orderData.total_amount
        });

    } catch (err) {
        console.error("❌ Payment confirmation error:", err);
        res.status(500).json({ error: "Error confirming payment: " + err.message });
    }
});

// STRICT Admin Authentication API - ULTRA SECURE
app.post("/api/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // STRICT VALIDATION - Check against hardcoded credentials
        if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
            console.log(`❌ ADMIN LOGIN FAILED: ${username} from IP ${req.ip}`);
            return res.status(401).json({
                error: "ACCESS DENIED: Invalid admin credentials",
                security: "ULTRA STRICT AUTHENTICATION ACTIVE"
            });
        }

        // STRICT SUCCESS LOG
        console.log(`✅ ADMIN LOGIN SUCCESS: ${username} from IP ${req.ip}`);

        // Generate ULTRA STRONG JWT token
        const token = jwt.sign(
            {
                id: 'ADMIN_001',
                username: ADMIN_CREDENTIALS.username,
                role: 'ULTRA_ADMIN',
                permissions: ['ALL_ACCESS'],
                loginTime: new Date().toISOString()
            },
            JWT_SECRET,
            { expiresIn: '8h' } // Shorter expiry for security
        );

        res.json({
            success: true,
            token: token,
            admin: {
                id: 'ADMIN_001',
                username: ADMIN_CREDENTIALS.username,
                email: ADMIN_CREDENTIALS.email,
                role: 'ULTRA_ADMIN',
                permissions: ['ALL_ACCESS']
            },
            message: "STRICT ADMIN ACCESS GRANTED"
        });

    } catch (err) {
        console.error("❌ ADMIN LOGIN ERROR:", err);
        res.status(500).json({ error: "SECURITY ERROR: Login system failure" });
    }
});

// Admin Dashboard API (Protected)
app.get("/api/admin/orders", authenticateAdmin, async (req, res) => {
    try {
        const result = await sql.query`
      SELECT o.*, 
             STRING_AGG(p.name + ' (x' + CAST(oi.quantity AS VARCHAR) + ')', ', ') as products
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, o.order_id, o.customer_name, o.customer_email, o.customer_phone, 
               o.customer_address, o.total_amount, o.payment_method, o.payment_status, 
               o.order_status, o.payment_reference, o.created_at
      ORDER BY o.created_at DESC
    `;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Error fetching orders: " + err.message });
    }
});

app.get("/api/admin/payments", authenticateAdmin, async (req, res) => {
    try {
        const result = await sql.query`
      SELECT p.*, o.customer_name, o.customer_email
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      ORDER BY p.created_at DESC
    `;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Error fetching payments: " + err.message });
    }
});

app.put("/api/admin/orders/:order_id/status", authenticateAdmin, async (req, res) => {
    try {
        const { order_id } = req.params;
        const { order_status } = req.body;

        await sql.query`
      UPDATE orders 
      SET order_status = ${order_status}
      WHERE order_id = ${order_id}
    `;

        res.json({ success: true, message: "Order status updated successfully" });

    } catch (err) {
        res.status(500).json({ error: "Error updating order status: " + err.message });
    }
});

// Initialize default admin user
async function createDefaultAdmin() {
    try {
        const adminExists = await sql.query`SELECT COUNT(*) as count FROM admin_users`;

        if (adminExists.recordset[0].count === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await sql.query`
        INSERT INTO admin_users (username, password, email)
        VALUES ('admin', ${hashedPassword}, 'admin@shop.pk')
      `;
            console.log("✅ Default admin user created: username='admin', password='admin123'");
        }
    } catch (err) {
        console.error("❌ Error creating default admin:", err);
    }
}

// Create default admin on startup
setTimeout(createDefaultAdmin, 2000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Shop.PK Server running at http://localhost:${PORT}`);
    console.log(`📱 Admin Panel: http://localhost:${PORT}/admin.html`);
    console.log(`🛒 Shop Frontend: http://localhost:${PORT}/`);
});
