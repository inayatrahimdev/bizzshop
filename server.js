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

// Database configuration - read from env; Azure-friendly defaults
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME || process.env.DB_DATABASE,
    options: {
        // For Azure SQL you typically want encrypt:true and trustServerCertificate:false
        encrypt: (process.env.DB_ENCRYPT === 'true') || true,
        trustServerCertificate: (process.env.DB_TRUST_CERTIFICATE === 'true') || false,
    },
};

// Basic health check route
app.get('/health', (req, res) => res.status(200).send({ status: 'ok' }));

// Robust products endpoint with DB attempt and fixture fallback
app.get('/api/products', async (req, res) => {
  try {
    // If DB credentials are not provided, skip DB attempt and return fixture
    if (!dbConfig.server || !dbConfig.user || !dbConfig.password) {
      console.warn('DB config missing - serving fixture products');
      const fallbackPath = path.join(__dirname, 'database', 'products-fixture.json');
      const fallback = require(fallbackPath);
      return res.status(200).json(Array.isArray(fallback) ? fallback : []);
    }

    // Attempt to connect to DB and fetch products
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(
      'SELECT id, name, description, price, stock, image_url, category FROM products'
    );
    const products = result && result.recordset ? result.recordset : [];
    return res.status(200).json(products);
  } catch (err) {
    console.error('Products endpoint DB error:', err && err.message ? err.message : err);

    // Dev/production-safe fallback: return fixture JSON so frontend doesn't break
    try {
      const fallbackPath = path.join(__dirname, 'database', 'products-fixture.json');
      const fallback = require(fallbackPath);
      return res.status(200).json(Array.isArray(fallback) ? fallback : []);
    } catch (fallbackErr) {
      console.error('Products fallback read error:', fallbackErr);
      return res.status(500).json({ error: 'Unable to load products' });
    }
  }
});

// Keep other existing routes here (auth/admin/order etc.) if present in original server.js

// Ensure server listens on the environment port (Azure requirement)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
