const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('✅ Created images directory: public/images/');
}

// Create placeholder image files
for (let i = 1; i <= 20; i++) {
    const imagePath = path.join(imagesDir, `prod${i}.png`);
    if (!fs.existsSync(imagePath)) {
        // Create a simple placeholder file
        const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        fs.writeFileSync(imagePath, placeholder);
        console.log(`✅ Created placeholder: prod${i}.png`);
    }
}

console.log('\n🎉 All product images created successfully!');
console.log('📁 Images are located in: public/images/');
console.log('🖼️  You can now replace these with actual product images');
console.log('\n📋 To generate proper product images:');
console.log('1. Open create_images.html in your browser');
console.log('2. Click "Generate All 20 Product Images"');
console.log('3. Download each image and save in public/images/ folder');
