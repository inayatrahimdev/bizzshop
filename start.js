#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Shop.PK E-commerce Platform...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found. Creating default .env file...\n');

    const defaultEnv = `# Database Configuration
DB_USER=sa
DB_PASSWORD=inayat12
DB_SERVER=INAYAT-RAHIM
DB_NAME=shop

# JWT Secret (Change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=3000

# Payment Configuration (These are demo values - replace with real ones)
EASYPAISA_MERCHANT_ID=MERCHANT123456
EASYPAISA_API_KEY=EASYPAISA_API_KEY_123
JAZZCASH_MERCHANT_ID=JAZZCASH_MERCHANT_789
JAZZCASH_API_KEY=JAZZCASH_API_KEY_456`;

    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Default .env file created. Please update with your database credentials.\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...\n');

    exec('npm install', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error installing dependencies:', error);
            return;
        }
        console.log('✅ Dependencies installed successfully!\n');
        startServer();
    });
} else {
    startServer();
}

function startServer() {
    // Create images directory and placeholder files
    exec('npm run create-images', (error, stdout, stderr) => {
        if (error) {
            console.log('⚠️  Could not create images automatically, but continuing...\n');
        } else {
            console.log(stdout);
        }

        console.log('🎯 Starting the server...\n');
        console.log('📱 Frontend will be available at: http://localhost:3000');
        console.log('🔐 Admin Panel: http://localhost:3000/admin.html');
        console.log('👤 Default Admin: username=admin, password=admin123\n');
        console.log('💰 Payment Accounts:');
        console.log('   - EasyPaisa: 03165800166 (Inayat Rahim)');
        console.log('   - JazzCash: 03165800166 (Inayat Rahim)');
        console.log('   - Mezan Bank: Business Account\n');
        console.log('📦 First product (iPhone 15 Pro Max) is set to Rs. 20 for testing!\n');
        console.log('⚠️  Make sure your SQL Server is running and the "shop" database is created!\n');
        console.log('📋 Run the database/init.sql script in SQL Server Management Studio\n');

        // Start the server
        exec('node server.js', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Server error:', error);
                return;
            }
            console.log(stdout);
        });
    });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Shop.PK server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down Shop.PK server...');
    process.exit(0);
});
