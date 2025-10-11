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

async function insertAllProducts() {
    try {
        console.log("🔄 Connecting to database...");
        await sql.connect(dbConfig);
        console.log("✅ Connected successfully!");

        // Clear existing products first
        console.log("🗑️  Clearing existing products...");
        await sql.query`DELETE FROM products`;

        console.log("📦 Inserting 20 products...");

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            await sql.query`
        INSERT INTO products (name, description, price, stock, image_url, category)
        VALUES (${product.name}, ${product.description}, ${product.price}, ${product.stock}, ${product.image_url}, ${product.category})
      `;
            console.log(`✅ ${i + 1}. ${product.name} - Rs. ${product.price}`);
        }

        // Verify insertion
        const result = await sql.query`SELECT COUNT(*) as count FROM products`;
        console.log(`\n🎉 Successfully inserted ${result.recordset[0].count} products!`);

        // Show test product
        const testProduct = await sql.query`SELECT * FROM products WHERE name = 'iPhone 15 Pro Max'`;
        if (testProduct.recordset.length > 0) {
            const product = testProduct.recordset[0];
            console.log(`\n🧪 Test Product Ready:`);
            console.log(`   Name: ${product.name}`);
            console.log(`   Price: Rs. ${product.price}`);
            console.log(`   Stock: ${product.stock}`);
            console.log(`   Image: ${product.image_url}`);
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await sql.close();
    }
}

insertAllProducts();
