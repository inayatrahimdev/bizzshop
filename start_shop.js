const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Shop.PK E-commerce Platform...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
    console.log('⚠️  .env file not found. Creating default .env file...');

    const envContent = `# Shop.PK E-commerce Environment Configuration
# STRICT ADMIN AUTHENTICATION

# Database Configuration
DB_USER=sa
DB_PASSWORD=inayat12
DB_SERVER=INAYAT-RAHIM
DB_DATABASE=shop
DB_ENCRYPT=false
DB_TRUST_CERTIFICATE=true

# STRONG ADMIN AUTHENTICATION - UNBREAKABLE
ADMIN_USERNAME=inayataifuturescopebrightbzzzz
ADMIN_PASSWORD=inayataifuturescopebrightbzzzz@12345
ADMIN_EMAIL=admin@shop.pk

# JWT Secret - ULTRA STRONG
JWT_SECRET=ShopPK_SuperSecret_2024_UltraSecure_JWT_Token_Key_For_Inayat_Rahim_Admin_Only_NoBreak_12345

# Payment Configuration
EASYPAISA_ACCOUNT=03165800166
JAZZCASH_ACCOUNT=03165800166
MEZAN_BANK_ACCOUNT=1234567890123456

# Security Settings
STRICT_AUTH=true
ADMIN_ONLY_ACCESS=true
PAYMENT_VERIFICATION_REQUIRED=true
NO_AUTO_CONFIRM=true

# Server Configuration
PORT=3000
NODE_ENV=production`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Default .env file created. Please update with your database credentials.\n');
}

// Create images
console.log('🖼️  Creating product images...');
exec('npm run create-images', (error, stdout, stderr) => {
    if (error) {
        console.log('⚠️  Could not create images automatically, but continuing...\n');
    } else {
        console.log(stdout);
    }

    console.log('🎯 Starting the server...');
    console.log('📱 Frontend will be available at: http://localhost:3000');
    console.log('🔐 Admin Panel: http://localhost:3000/admin.html');
    console.log('👤 ADMIN CREDENTIALS:');
    console.log('   Username: inayataifuturescopebrightbzzzz');
    console.log('   Password: inayataifuturescopebrightbzzzz@12345');
    console.log('💰 Payment Accounts:');
    console.log('   - EasyPaisa: 03165800166 (Inayat Rahim)');
    console.log('   - JazzCash: 03165800166 (Inayat Rahim)');
    console.log('   - Mezan Bank: Business Account\n');
    console.log('📦 First product (iPhone 15 Pro Max) is set to Rs. 20 for testing!\n');

    // Start server
    exec('node server.js', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Server error:', error);
        }
        if (stderr) {
            console.error('❌ Server stderr:', stderr);
        }
        console.log(stdout);
    });
});
