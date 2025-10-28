#!/usr/bin/env node
/**
 * Seed script to populate Azure Cosmos DB (MongoDB API) with products
 * 
 * Usage:
 *   node insert_all_products_mongo.js
 * 
 * Requires environment variables:
 *   MONGO_URI - Connection string to Azure Cosmos DB (MongoDB API)
 *   MONGO_DB_NAME - Database name (default: 'bizzshop')
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read products from fixture file
const fixtureFilePath = path.join(__dirname, 'database', 'products-fixture.json');
const products = JSON.parse(fs.readFileSync(fixtureFilePath, 'utf8'));

async function seedProducts() {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || 'bizzshop';

  if (!mongoUri) {
    console.error('❌ Error: MONGO_URI environment variable is not set');
    console.log('Please set MONGO_URI in your .env file or environment variables');
    console.log('Example: MONGO_URI=mongodb+srv://user:pass@cluster.cosmos.azure.com:10255/?ssl=true');
    process.exit(1);
  }

  console.log('🔌 Connecting to Azure Cosmos DB (MongoDB API)...');
  console.log(`   Database: ${dbName}`);
  console.log(`   Collection: products`);

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('✅ Connected to Azure Cosmos DB');

    const db = client.db(dbName);
    const collection = db.collection('products');

    // Clear existing products
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing products`);

    // Insert products from fixture
    const insertResult = await collection.insertMany(products);
    console.log(`✅ Inserted ${insertResult.insertedCount} products successfully`);

    // Display inserted products
    console.log('\n📦 Products in database:');
    const allProducts = await collection.find({}).toArray();
    allProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - Rs. ${product.price.toLocaleString()} (Stock: ${product.stock})`);
    });

    console.log('\n✨ Seeding completed successfully!');
    console.log('You can now start the server with: npm start');

  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

// Run the seeding
seedProducts();
