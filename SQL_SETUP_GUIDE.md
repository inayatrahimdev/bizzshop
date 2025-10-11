# 📋 SQL Server Setup Guide for Shop.PK

## 🎯 Quick Setup Steps

### Step 1: Open SQL Server Management Studio
1. Open **SQL Server Management Studio (SSMS)**
2. Connect to your SQL Server instance
3. Make sure you're connected as a user with database creation permissions

### Step 2: Run the Database Setup Script
1. **Open the SQL file**: `SQL_SERVER_SETUP.sql`
2. **Copy the entire contents** of the file
3. **Paste into SSMS** in a new query window
4. **Execute the script** by pressing `F5` or clicking the "Execute" button

### Step 3: Verify Setup
After running the script, you should see:
- ✅ Database "shop" created
- ✅ All tables created successfully
- ✅ 20 products inserted
- ✅ Admin user created
- ✅ Summary of current data

## 📊 What Gets Created

### Database: `shop`
### Tables:
1. **products** - All your products (20 items)
2. **orders** - Customer orders
3. **order_items** - Items in each order
4. **payments** - Payment records
5. **admin_users** - Admin login accounts

### Sample Data:
- **20 products** with prices and categories
- **Test product**: iPhone 15 Pro Max (Rs. 20)
- **Admin account**: username=admin, password=admin123

## 🔧 Manual Setup (Alternative)

If you prefer to run commands one by one:

### 1. Create Database
```sql
CREATE DATABASE shop;
```

### 2. Use Database
```sql
USE shop;
```

### 3. Create Products Table
```sql
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
```

### 4. Create Orders Table
```sql
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
```

### 5. Create Order Items Table
```sql
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id NVARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 6. Create Payments Table
```sql
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
```

### 7. Create Admin Users Table
```sql
CREATE TABLE admin_users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);
```

### 8. Insert Products
```sql
INSERT INTO products (name, description, price, stock, image_url, category) VALUES
('iPhone 15 Pro Max', 'Latest iPhone with titanium design and A17 Pro chip', 20, 10, 'prod1.png', 'Electronics'),
('Samsung Galaxy S24 Ultra', 'Premium Android smartphone with S Pen', 380000, 8, 'prod2.png', 'Electronics'),
-- ... (continue with all 20 products)
```

### 9. Insert Admin User
```sql
INSERT INTO admin_users (username, password, email) VALUES
('admin', '', 'admin@shop.pk');
```

## ✅ Verification

After setup, verify by running:
```sql
USE shop;

-- Check tables exist
SELECT name FROM sys.tables;

-- Check products
SELECT COUNT(*) as ProductCount FROM products;

-- Check admin user
SELECT username, email FROM admin_users;
```

## 🚨 Troubleshooting

### Common Issues:

1. **Permission Denied**:
   - Make sure you're logged in as a user with database creation permissions
   - Try logging in as `sa` or a user with `dbcreator` role

2. **Database Already Exists**:
   - The script will show a warning but continue
   - This is normal if you've run it before

3. **Tables Already Exist**:
   - The script checks for existing tables
   - It will skip creation if tables already exist

4. **Connection Issues**:
   - Make sure SQL Server is running
   - Check your connection string in the application

## 🎉 Next Steps

After successful database setup:

1. **Start your application**:
   ```bash
   npm start
   ```

2. **Test the platform**:
   - Visit: http://localhost:3000
   - Add iPhone 15 Pro Max (Rs. 20) to cart
   - Test checkout and payment

3. **Access admin panel**:
   - Visit: http://localhost:3000/admin.html
   - Login: admin / admin123

Your Shop.PK database is now ready for real-world testing! 🚀
