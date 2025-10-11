const sql = require("mssql");

// Database configuration
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

async function testDatabaseConnection() {
    try {
        console.log("🔄 Testing database connection...");
        console.log("Server:", dbConfig.server);
        console.log("Database:", dbConfig.database);
        console.log("User:", dbConfig.user);

        // Connect to SQL Server
        await sql.connect(dbConfig);
        console.log("✅ Connected to SQL Server successfully!");

        // Test if database exists
        const result = await sql.query`SELECT name FROM sys.databases WHERE name = 'shop'`;
        if (result.recordset.length > 0) {
            console.log("✅ Database 'shop' exists!");

            // Test if products table exists
            const productsResult = await sql.query`SELECT COUNT(*) as count FROM products`;
            console.log(`✅ Products table exists with ${productsResult.recordset[0].count} products`);

            // Show first few products
            const sampleProducts = await sql.query`SELECT TOP 3 id, name, price, image_url FROM products`;
            console.log("📦 Sample products:");
            sampleProducts.recordset.forEach(product => {
                console.log(`  - ${product.name}: Rs. ${product.price} (${product.image_url})`);
            });

        } else {
            console.log("❌ Database 'shop' does not exist!");
            console.log("Please run the SQL_SERVER_SETUP.sql script in SQL Server Management Studio");
        }

    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        console.log("\n🔧 Troubleshooting steps:");
        console.log("1. Make sure SQL Server is running");
        console.log("2. Check if server name 'INAYAT-RAHIM' is correct");
        console.log("3. Verify username 'sa' and password 'inayat12'");
        console.log("4. Run SQL_SERVER_SETUP.sql script to create database and tables");
    } finally {
        await sql.close();
    }
}

testDatabaseConnection();
