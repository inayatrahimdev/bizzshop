-- PostgreSQL Database Setup for Shop.PK
-- Run this in your DigitalOcean PostgreSQL database

-- Create database (if not exists)
-- CREATE DATABASE shop;

-- Use the database
-- \c shop;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url VARCHAR(255),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status VARCHAR(50) DEFAULT 'pending',
    payment_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, description, price, stock, image_url, category) VALUES
('iPhone 15 Pro Max', 'Latest iPhone with titanium design and A17 Pro chip', 20, 10, 'prod1.png', 'Electronics'),
('Samsung Galaxy S24 Ultra', 'Premium Android smartphone with S Pen', 380000, 8, 'prod2.png', 'Electronics'),
('MacBook Pro M3', 'Professional laptop with M3 chip and Liquid Retina display', 650000, 5, 'prod3.png', 'Electronics'),
('iPad Air 5th Gen', 'Powerful tablet with M1 chip and all-day battery', 180000, 12, 'prod4.png', 'Electronics'),
('Sony WH-1000XM5', 'Industry-leading noise canceling wireless headphones', 85000, 15, 'prod5.png', 'Electronics'),
('Dell XPS 13', 'Ultrabook with Intel Core i7 and 4K display', 320000, 7, 'prod6.png', 'Electronics'),
('AirPods Pro 2nd Gen', 'Wireless earbuds with active noise cancellation', 65000, 20, 'prod7.png', 'Electronics'),
('Nintendo Switch OLED', 'Gaming console with vibrant OLED screen', 95000, 25, 'prod8.png', 'Electronics'),
('Canon EOS R6 Mark II', 'Professional mirrorless camera with 24MP sensor', 750000, 4, 'prod9.png', 'Electronics'),
('LG OLED C3 55"', 'Premium 4K OLED TV with smart features', 450000, 6, 'prod10.png', 'Electronics'),
('Nike Air Max 270', 'Comfortable running shoes with Max Air cushioning', 25000, 30, 'prod11.png', 'Fashion'),
('Adidas Ultraboost 22', 'High-performance running shoes with Boost technology', 28000, 25, 'prod12.png', 'Fashion'),
('Levi''s 501 Original Jeans', 'Classic straight-fit denim jeans', 12000, 40, 'prod13.png', 'Fashion'),
('Uniqlo Heattech T-Shirt', 'Thermal base layer for cold weather', 3000, 50, 'prod14.png', 'Fashion'),
('Zara Blazer', 'Professional blazer for formal occasions', 18000, 15, 'prod15.png', 'Fashion'),
('KitchenAid Stand Mixer', 'Professional stand mixer for baking', 85000, 8, 'prod16.png', 'Home & Kitchen'),
('Dyson V15 Detect', 'Cordless vacuum with laser dust detection', 95000, 6, 'prod17.png', 'Home & Kitchen'),
('Instant Pot Duo', '7-in-1 electric pressure cooker', 35000, 12, 'prod18.png', 'Home & Kitchen'),
('Philips Hue Starter Kit', 'Smart lighting system with app control', 25000, 20, 'prod19.png', 'Home & Kitchen'),
('IKEA MALM Bed Frame', 'Modern platform bed with storage drawers', 45000, 10, 'prod20.png', 'Home & Kitchen');

-- Insert default admin user
INSERT INTO admin_users (username, password, email) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@shop.pk')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
