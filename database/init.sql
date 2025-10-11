-- Shop.PK Database Initialization Script
-- Run this script in your SQL Server Management Studio

USE shop;

-- Create products table
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
);

-- Create orders table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id NVARCHAR(50) UNIQUE NOT NULL,
    customer_name NVARCHAR(255) NOT NULL,
    customer_email NVARCHAR(255) NOT NULL,
    customer_phone NVARCHAR(20) NOT NULL,
    customer_address NVARCHAR(MAX) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method NVARCHAR(50) NOT NULL,
    payment_status NVARCHAR(50) DEFAULT 'pending',
    order_status NVARCHAR(50) DEFAULT 'pending',
    payment_reference NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);

-- Create order_items table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_items' AND xtype='U')
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id NVARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create payments table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='payments' AND xtype='U')
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id NVARCHAR(50) NOT NULL,
    payment_method NVARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status NVARCHAR(50) DEFAULT 'pending',
    transaction_id NVARCHAR(255),
    payment_reference NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Create admin_users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_users' AND xtype='U')
CREATE TABLE admin_users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
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

-- Insert default admin user (password will be hashed by the application)
INSERT INTO admin_users (username, password, email) VALUES
('admin', '', 'admin@shop.pk');

PRINT 'Database initialized successfully!';
PRINT 'Default admin credentials: username=admin, password=admin123';
