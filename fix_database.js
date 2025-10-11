const sql = require("mssql");

// Database configuration - using the working connection from earlier
const dbConfig = {
    user: "sa",
    password: "inayat12",
    server: "INAYAT-RAHIM",
    database: "master", // Connect to master first
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

async function fixDatabase() {
    try {
        console.log("🔧 Fixing Shop.PK Database...\n");

        // Step 1: Connect to master database
        console.log("🔄 Connecting to SQL Server...");
        await sql.connect(dbConfig);
        console.log("✅ Connected successfully!");

        // Step 2: Create shop database if it doesn't exist
        console.log("🔄 Creating/checking 'shop' database...");
        await sql.query`
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'shop')
      BEGIN
        CREATE DATABASE shop;
        PRINT 'Database shop created successfully';
      END
      ELSE
      BEGIN
        PRINT 'Database shop already exists';
      END
    `;
        console.log("✅ Database 'shop' is ready!");

        // Step 3: Switch to shop database
        console.log("🔄 Switching to shop database...");
        await sql.query`USE shop`;
        console.log("✅ Switched to shop database!");

        // Step 4: Create all tables
        console.log("🔄 Creating database tables...");

        // Create products table
        await sql.query`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='products' AND xtype='U')
      BEGIN
        CREATE TABLE products (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          price DECIMAL(10,2) NOT NULL,
          stock INT DEFAULT 0,
          image_url NVARCHAR(255),
          category NVARCHAR(100),
          created_at DATETIME DEFAULT GETDATE()
        );
        PRINT 'Products table created';
      END
      ELSE
      BEGIN
        PRINT 'Products table already exists';
      END
    `;

        // Create orders table
        await sql.query`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
      BEGIN
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
        );
        PRINT 'Orders table created';
      END
      ELSE
      BEGIN
        PRINT 'Orders table already exists';
      END
    `;

        // Create order_items table
        await sql.query`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_items' AND xtype='U')
      BEGIN
        CREATE TABLE order_items (
          id INT IDENTITY(1,1) PRIMARY KEY,
          order_id NVARCHAR(50) NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL,
          price DECIMAL(10,2) NOT NULL
        );
        PRINT 'Order_items table created';
      END
      ELSE
      BEGIN
        PRINT 'Order_items table already exists';
      END
    `;

        // Create payments table
        await sql.query`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='payments' AND xtype='U')
      BEGIN
        CREATE TABLE payments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          order_id NVARCHAR(50) NOT NULL,
          payment_method NVARCHAR(50) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          payment_status NVARCHAR(50) DEFAULT 'pending',
          transaction_id NVARCHAR(255),
          payment_reference NVARCHAR(255),
          created_at DATETIME DEFAULT GETDATE()
        );
        PRINT 'Payments table created';
      END
      ELSE
      BEGIN
        PRINT 'Payments table already exists';
      END
    `;

        // Create admin_users table
        await sql.query`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_users' AND xtype='U')
      BEGIN
        CREATE TABLE admin_users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          username NVARCHAR(50) UNIQUE NOT NULL,
          password NVARCHAR(255) NOT NULL,
          email NVARCHAR(255),
          created_at DATETIME DEFAULT GETDATE()
        );
        PRINT 'Admin_users table created';
      END
      ELSE
      BEGIN
        PRINT 'Admin_users table already exists';
      END
    `;

        console.log("✅ All tables created successfully!");

        // Step 5: Clear and insert products
        console.log("🔄 Setting up products...");
        await sql.query`DELETE FROM products`; // Clear existing products

        const products = [
            { name: 'iPhone 15 Pro Max', description: 'Latest iPhone with titanium design and A17 Pro chip', price: 20, stock: 10, image_url: 'prod1.png', category: 'Electronics' },
            { name: 'Samsung Galaxy S24 Ultra', description: 'Premium Android smartphone with S Pen', price: 380000, stock: 8, image_url: 'prod2.png', category: 'Electronics' },
            { name: 'MacBook Pro M3', description: 'Professional laptop with M3 chip and Liquid Retina display', price: 650000, stock: 5, image_url: 'prod3.png', category: 'Electronics' },
            { name: 'iPad Air 5th Gen', description: 'Powerful tablet with M1 chip and all-day battery', price: 180000, stock: 12, image_url: 'prod4.png', category: 'Electronics' },
            { name: 'Sony WH-1000XM5', description: 'Industry-leading noise canceling wireless headphones', price: 85000, stock: 15, image_url: 'prod5.png', category: 'Electronics' },
            { name: 'Dell XPS 13', description: 'Ultrabook with Intel Core i7 and 4K display', price: 320000, stock: 7, image_url: 'prod6.png', category: 'Electronics' },
            { name: 'AirPods Pro 2nd Gen', description: 'Wireless earbuds with active noise cancellation', price: 65000, stock: 20, image_url: 'prod7.png', category: 'Electronics' },
            { name: 'Nintendo Switch OLED', description: 'Gaming console with vibrant OLED screen', price: 95000, stock: 25, image_url: 'prod8.png', category: 'Electronics' },
            { name: 'Canon EOS R6 Mark II', description: 'Professional mirrorless camera with 24MP sensor', price: 750000, stock: 4, image_url: 'prod9.png', category: 'Electronics' },
            { name: 'LG OLED C3 55"', description: 'Premium 4K OLED TV with smart features', price: 450000, stock: 6, image_url: 'prod10.png', category: 'Electronics' },
            { name: 'Nike Air Max 270', description: 'Comfortable running shoes with Max Air cushioning', price: 25000, stock: 30, image_url: 'prod11.png', category: 'Fashion' },
            { name: 'Adidas Ultraboost 22', description: 'High-performance running shoes with Boost technology', price: 28000, stock: 25, image_url: 'prod12.png', category: 'Fashion' },
            { name: 'Levi\'s 501 Original Jeans', description: 'Classic straight-fit denim jeans', price: 12000, stock: 40, image_url: 'prod13.png', category: 'Fashion' },
            { name: 'Uniqlo Heattech T-Shirt', description: 'Thermal base layer for cold weather', price: 3000, stock: 50, image_url: 'prod14.png', category: 'Fashion' },
            { name: 'Zara Blazer', description: 'Professional blazer for formal occasions', price: 18000, stock: 15, image_url: 'prod15.png', category: 'Fashion' },
            { name: 'KitchenAid Stand Mixer', description: 'Professional stand mixer for baking', price: 85000, stock: 8, image_url: 'prod16.png', category: 'Home & Kitchen' },
            { name: 'Dyson V15 Detect', description: 'Cordless vacuum with laser dust detection', price: 95000, stock: 6, image_url: 'prod17.png', category: 'Home & Kitchen' },
            { name: 'Instant Pot Duo', description: '7-in-1 electric pressure cooker', price: 35000, stock: 12, image_url: 'prod18.png', category: 'Home & Kitchen' },
            { name: 'Philips Hue Starter Kit', description: 'Smart lighting system with app control', price: 25000, stock: 20, image_url: 'prod19.png', category: 'Home & Kitchen' },
            { name: 'IKEA MALM Bed Frame', description: 'Modern platform bed with storage drawers', price: 45000, stock: 10, image_url: 'prod20.png', category: 'Home & Kitchen' }
        ];

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            await sql.query`
        INSERT INTO products (name, description, price, stock, image_url, category)
        VALUES (${product.name}, ${product.description}, ${product.price}, ${product.stock}, ${product.image_url}, ${product.category})
      `;
            console.log(`✅ ${i + 1}. ${product.name} - Rs. ${product.price}`);
        }

        // Step 6: Setup admin user
        console.log("🔄 Setting up admin user...");
        await sql.query`DELETE FROM admin_users WHERE username = 'admin'`; // Clear existing admin

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await sql.query`
      INSERT INTO admin_users (username, password, email)
      VALUES ('admin', ${hashedPassword}, 'admin@shop.pk')
    `;
        console.log("✅ Admin user created: username=admin, password=admin123");

        // Step 7: Verify setup
        console.log("\n🔍 Verifying setup...");
        const productCount = await sql.query`SELECT COUNT(*) as count FROM products`;
        const adminCount = await sql.query`SELECT COUNT(*) as count FROM admin_users`;

        console.log(`📦 Products in database: ${productCount.recordset[0].count}`);
        console.log(`👤 Admin users: ${adminCount.recordset[0].count}`);

        // Show test product
        const testProduct = await sql.query`SELECT * FROM products WHERE name = 'iPhone 15 Pro Max'`;
        if (testProduct.recordset.length > 0) {
            const product = testProduct.recordset[0];
            console.log(`\n🧪 Test Product Ready:`);
            console.log(`   Name: ${product.name}`);
            console.log(`   Price: Rs. ${product.price}`);
            console.log(`   Stock: ${product.stock}`);
        }

        console.log("\n🎉 Database setup completed successfully!");
        console.log("✅ All tables created");
        console.log("✅ 20 products inserted");
        console.log("✅ Admin user created");
        console.log("✅ Test product (iPhone 15 Pro Max - Rs. 20) ready");

        console.log("\n🚀 You can now start your server:");
        console.log("   npm start");
        console.log("   Visit: http://localhost:3000");

    } catch (error) {
        console.error("❌ Error fixing database:", error.message);
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Make sure SQL Server is running");
        console.log("2. Check if server name 'INAYAT-RAHIM' is correct");
        console.log("3. Verify sa user has proper permissions");
    } finally {
        await sql.close();
    }
}

fixDatabase();
