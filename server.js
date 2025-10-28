const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
const publicDir = path.join(__dirname, 'public');
app.use(express.json());
app.use(cors());
app.use(express.static(publicDir));

// Mongo (Cosmos) client
const mongoUri = (process.env.MONGO_URI || '').trim();
const mongoDbName = process.env.MONGO_DB_NAME || process.env.DB_NAME || 'shop';
let mongoClient = null;
let mongoDb = null;
async function tryInitMongo() {
  if (!mongoUri) return;
  try {
    mongoClient = new MongoClient(mongoUri, { maxPoolSize: 10 });
    await mongoClient.connect();
    mongoDb = mongoClient.db(mongoDbName);
    console.log('Connected to Mongo/Cosmos DB (database=%s)', mongoDbName);
  } catch (err) {
    console.error('Mongo init error:', err && err.message ? err.message : err);
    mongoClient = null; mongoDb = null;
  }
}
tryInitMongo().catch(err => console.error('Mongo init uncaught error:', err));

// MSSQL fallback config
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME || process.env.DB_DATABASE,
  options: {
    encrypt: (process.env.DB_ENCRYPT === 'true') || true,
    trustServerCertificate: (process.env.DB_TRUST_CERTIFICATE === 'true') || false,
  },
};

// Health
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Serve test page explicitly
app.get('/test_products.html', (req, res) => {
  return res.sendFile(path.join(publicDir, 'test_products.html'), err => {
    if (err) {
      console.error('Error sending test_products.html:', err);
      res.status(500).json({ error: 'Error serving test page' });
    }
  });
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    if (mongoDb) {
      try {
        const docs = await mongoDb.collection('products').find({}).toArray();
        return res.status(200).json(Array.isArray(docs) ? docs : []);
      } catch (mongoErr) {
        console.error('Mongo query error:', mongoErr && mongoErr.message ? mongoErr.message : mongoErr);
      }
    }

    if (dbConfig.server && dbConfig.user && dbConfig.password) {
      try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT id, name, description, price, stock, image_url, category FROM products');
        const products = result && result.recordset ? result.recordset : [];
        return res.status(200).json(Array.isArray(products) ? products : []);
      } catch (mssqlErr) {
        console.error('MSSQL query error:', mssqlErr && mssqlErr.message ? mssqlErr.message : mssqlErr);
      }
    }

    const fallback = require(path.join(__dirname, 'database', 'products-fixture.json'));
    return res.status(200).json(Array.isArray(fallback) ? fallback : []);
  } catch (err) {
    console.error('Unexpected /api/products error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Unable to load products' });
  }
});

// Admin login endpoint - always returns JSON
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ ok: false, error: 'Username and password are required' });

    const envUser = process.env.ADMIN_USERNAME;
    const envHash = process.env.ADMIN_PASSWORD_HASH; // preferred
    const envPlain = process.env.ADMIN_PASSWORD; // fallback (dev only)

    if (envUser && envHash) {
      if (username !== envUser) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
      const match = await bcrypt.compare(password, envHash);
      if (!match) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    } else if (envUser && envPlain) {
      if (username !== envUser || password !== envPlain) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    } else {
      return res.status(500).json({ ok: false, error: 'Admin credentials not configured' });
    }

    // Issue a simple JWT token (optional)
    const token = jwt.sign({ username }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
    return res.json({ ok: true, message: 'Login successful', token });
  } catch (err) {
    console.error('/api/admin/login error:', err);
    return res.status(500).json({ ok: false, error: 'Server error during login' });
  }
});

// Payments endpoint - always JSON
app.post('/api/payments', async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentRef } = req.body || {};
    if (!orderId || !paymentMethod || !paymentRef) return res.status(400).json({ ok: false, error: 'Missing payment details' });
    // Placeholder: verify with provider, update DB etc.
    return res.status(200).json({ ok: true, message: 'Payment recorded', orderId });
  } catch (err) {
    console.error('/api/payments error:', err);
    return res.status(500).json({ ok: false, error: 'Server error processing payment' });
  }
});

// Fallback to index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(publicDir, 'index.html'), err => {
    if (err) {
      console.error('Error sending index.html fallback:', err);
      res.status(500).send('Server error');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
