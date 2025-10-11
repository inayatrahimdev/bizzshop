const sql = require("mssql");

// Try different connection configurations
const connectionConfigs = [
    {
        name: "Windows Authentication",
        config: {
            server: "INAYAT-RAHIM",
            database: "master", // Connect to master first
            options: {
                encrypt: false,
                trustServerCertificate: true,
                trustedConnection: true // Use Windows Authentication
            }
        }
    },
    {
        name: "SA User with inayat12",
        config: {
            user: "sa",
            password: "inayat12",
            server: "INAYAT-RAHIM",
            database: "master",
            options: {
                encrypt: false,
                trustServerCertificate: true,
            }
        }
    },
    {
        name: "SA User with empty password",
        config: {
            user: "sa",
            password: "",
            server: "INAYAT-RAHIM",
            database: "master",
            options: {
                encrypt: false,
                trustServerCertificate: true,
            }
        }
    },
    {
        name: "Local SQL Server",
        config: {
            user: "sa",
            password: "inayat12",
            server: "localhost",
            database: "master",
            options: {
                encrypt: false,
                trustServerCertificate: true,
            }
        }
    }
];

async function testConnections() {
    console.log("🔍 Testing different SQL Server connection methods...\n");

    for (const { name, config } of connectionConfigs) {
        try {
            console.log(`🔄 Testing: ${name}`);
            console.log(`   Server: ${config.server}`);
            console.log(`   Database: ${config.database}`);
            if (config.user) console.log(`   User: ${config.user}`);
            if (config.options.trustedConnection) console.log(`   Auth: Windows Authentication`);

            await sql.connect(config);
            console.log(`✅ ${name} - SUCCESS!\n`);

            // Test if we can create database
            try {
                await sql.query`IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'shop') CREATE DATABASE shop`;
                console.log("✅ Created 'shop' database successfully!");

                // Switch to shop database
                await sql.query`USE shop`;

                // Create tables
                await sql.query`
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
        `;

                // Insert test product
                await sql.query`
          IF NOT EXISTS (SELECT * FROM products WHERE name = 'iPhone 15 Pro Max')
          INSERT INTO products (name, description, price, stock, image_url, category) 
          VALUES ('iPhone 15 Pro Max', 'Latest iPhone for testing', 20, 10, 'prod1.png', 'Electronics')
        `;

                console.log("✅ Created products table and inserted test product!");
                console.log("🎉 Database setup completed successfully!");

                // Test the product
                const result = await sql.query`SELECT * FROM products`;
                console.log(`📦 Found ${result.recordset.length} products in database`);

                if (result.recordset.length > 0) {
                    console.log("✅ Test product ready: iPhone 15 Pro Max - Rs. 20");
                }

                await sql.close();
                return config; // Return successful config

            } catch (dbError) {
                console.log(`⚠️  Connected but database setup failed: ${dbError.message}`);
            }

            await sql.close();

        } catch (error) {
            console.log(`❌ ${name} - FAILED: ${error.message}\n`);
        }
    }

    console.log("❌ All connection methods failed!");
    console.log("\n🔧 Manual Setup Required:");
    console.log("1. Open SQL Server Management Studio");
    console.log("2. Connect to your SQL Server instance");
    console.log("3. Run the SQL_SERVER_SETUP.sql script");
    console.log("4. Update the connection details in server.js");

    return null;
}

async function main() {
    const successfulConfig = await testConnections();

    if (successfulConfig) {
        console.log("\n✅ Database is ready!");
        console.log("🚀 You can now start your server with: npm start");
        console.log("📱 Visit: http://localhost:3000");
        console.log("🔐 Admin: http://localhost:3000/admin.html");
    }
}

main().catch(console.error);
