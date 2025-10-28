const express = require("express");
const sql = require("mssql");
const { MongoClient } = require("mongodb");
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

// Database configuration for MSSQL (fallback option)
const mssqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME || process.env.DB_DATABASE,
    options: {
        encrypt: (process.env.DB_ENCRYPT === 'true') || true,
        trustServerCertificate: (process.env.DB_TRUST_CERTIFICATE === 'true') || false,
    },
};

// MongoDB/Cosmos DB connection
let mongoClient = null;
let mongoDb = null;

async function connectMongo() {
    if (mongoClient) return mongoDb;
    
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || 'bizzshop';
    
    if (!mongoUri) return null;
    
    try {
        mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
        mongoDb = mongoClient.db(dbName);
        console.log('✅ Connected to Azure Cosmos DB (MongoDB API)');
        return mongoDb;
    } catch (error) {
        console.warn('⚠️  Failed to connect to MongoDB/Cosmos DB:', error.message);
        mongoClient = null;
        mongoDb = null;
        return null;
    }
}

// Basic health check route
app.get('/health', (req, res) => res.status(200).send({ status: 'ok' }));

// Serve test_products.html
app.get('/test_products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'test_products.html'));
});

// Robust products endpoint: prefer Cosmos DB, fallback to MSSQL, final fallback to fixture JSON
app.get('/api/products', async (req, res) => {
    try {
        // 1. Try Azure Cosmos DB (MongoDB API) first if MONGO_URI is configured
        if (process.env.MONGO_URI) {
            try {
                const db = await connectMongo();
                if (db) {
                    const products = await db.collection('products').find({}).toArray();
                    console.log(`📦 Served ${products.length} products from Cosmos DB`);
                    return res.status(200).json(products);
                }
            } catch (mongoErr) {
                console.warn('⚠️  Cosmos DB query failed:', mongoErr.message);
            }
        }

        // 2. Fallback to MSSQL if configured
        if (mssqlConfig.server && mssqlConfig.user && mssqlConfig.password) {
            try {
                const pool = await sql.connect(mssqlConfig);
                const result = await pool.request().query(
                    'SELECT id, name, description, price, stock, image_url, category FROM products'
                );
                const products = result && result.recordset ? result.recordset : [];
                console.log(`📦 Served ${products.length} products from MSSQL`);
                return res.status(200).json(products);
            } catch (sqlErr) {
                console.warn('⚠️  MSSQL query failed:', sqlErr.message);
            }
        }

        // 3. Final fallback: serve fixture JSON
        console.warn('⚠️  No database configured - serving fixture products');
        const fallbackPath = path.join(__dirname, 'database', 'products-fixture.json');
        const fallback = require(fallbackPath);
        return res.status(200).json(Array.isArray(fallback) ? fallback : []);

    } catch (err) {
        console.error('❌ Products endpoint error:', err.message);

        // Ultimate fallback: try fixture
        try {
            const fallbackPath = path.join(__dirname, 'database', 'products-fixture.json');
            const fallback = require(fallbackPath);
            return res.status(200).json(Array.isArray(fallback) ? fallback : []);
        } catch (fallbackErr) {
            console.error('❌ Products fallback read error:', fallbackErr.message);
            return res.status(500).json({ error: 'Unable to load products' });
        }
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (mongoClient) {
        await mongoClient.close();
        console.log('🔌 Closed MongoDB connection');
    }
    process.exit(0);
});

// Ensure server listens on the environment port (Azure requirement)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Products API: http://localhost:${PORT}/api/products`);
    console.log(`📍 Test page: http://localhost:${PORT}/test_products.html`);
    
    if (process.env.MONGO_URI) {
        console.log('🌍 Cosmos DB (MONGO_URI) configured - will try Cosmos DB first');
    } else if (mssqlConfig.server) {
        console.log('🗄️  MSSQL configured - will use MSSQL');
    } else {
        console.log('📄 No database configured - using fixture fallback');
    }
});
