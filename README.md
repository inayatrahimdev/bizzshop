# 🛒 Shop.PK E-commerce Platform

A complete end-to-end e-commerce website built with Node.js, Express, and SQL Server.

## 🚀 Features

- **Full-Stack E-commerce**: Complete shopping experience from product browsing to order completion
- **20 Products**: Diverse product catalog with images and detailed information
- **Shopping Cart**: Add/remove products, update quantities
- **Multiple Payment Methods**: EasyPaisa, JazzCash, Mezan Bank, and Cash on Delivery
- **STRICT Payment Verification**: No order confirmation without actual payment received
- **Admin Panel**: Secure admin dashboard for order and payment management
- **ULTRA STRICT Authentication**: Unbreakable admin security system

## 💳 Payment Methods

- **EasyPaisa**: 03165800166 (Inayat Rahim)
- **JazzCash**: 03165800166 (Inayat Rahim)
- **Mezan Bank**: Business Account
- **Cash on Delivery (COD)**: Payment on delivery

## 🔐 Admin Access

**Admin Panel**: http://localhost:3000/admin.html

**Credentials**:
- Username: `inayataifuturescopebrightbzzzz`
- Password: `inayataifuturescopebrightbzzzz@12345`

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: Microsoft SQL Server
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: JWT with ultra-strong security
- **Payment Integration**: EasyPaisa, JazzCash, Bank Transfer

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/bizzshop.git
   cd bizzshop
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup SQL Server**:
   - Install SQL Server Management Studio
   - Run `SQL_SERVER_SETUP.sql` to create database and tables
   - Update database credentials in `.env` file

4. **Start the application**:
   ```bash
   npm start
   ```

## 🌐 Access Points

- **Main Shop**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html

## 🧪 Test Product

- **iPhone 15 Pro Max**: Rs. 20 (Perfect for testing the complete order flow)

## 🔒 Security Features

- **ULTRA STRICT Authentication**: Hardcoded admin credentials
- **Payment Verification**: Manual admin verification required
- **No Auto-Confirmation**: Orders stay pending until payment verified
- **IP Logging**: All admin access tracked
- **Token Security**: 8-hour JWT expiry

## 📊 Admin Features

- View all orders and payments
- Confirm payments manually
- Update order status
- Monitor transaction history
- Access payment verification
- Customer information management

## 🚨 STRICT Payment Rules

- **EasyPaisa/JazzCash/Bank**: Orders remain PENDING until admin verifies payment
- **COD**: Can be confirmed immediately
- **No Compromise**: No order processing without actual payment received
- **Manual Verification**: Admin must check payment accounts before confirming

## 📁 Project Structure

```
bizzshop/
├── public/                 # Frontend files
│   ├── index.html         # Main shop page
│   ├── checkout.html      # Checkout page
│   ├── admin.html         # Admin panel
│   ├── styles.css         # Styling
│   ├── script.js          # Frontend JavaScript
│   └── checkout.js        # Checkout functionality
├── database/              # Database scripts
│   └── init.sql          # Database initialization
├── server.js             # Main server file
├── package.json          # Dependencies
├── .env                  # Environment variables
└── README.md            # This file
```

## 🎯 Order Flow

1. **Browse Products**: Customer views products on main page
2. **Add to Cart**: Add desired products to shopping cart
3. **Checkout**: Fill customer details and select payment method
4. **Payment**: Customer pays to specified accounts
5. **Admin Verification**: Admin checks payment and confirms order
6. **Order Processing**: Order is processed for delivery

## 🔧 Configuration

Update the following in `.env` file:

```env
# Database Configuration
DB_USER=sa
DB_PASSWORD=your_password
DB_SERVER=your_server_name
DB_DATABASE=shop

# Admin Credentials
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password

# Payment Accounts
EASYPAISA_ACCOUNT=03165800166
JAZZCASH_ACCOUNT=03165800166
MEZAN_BANK_ACCOUNT=1234567890123456
```

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Developer

**Inayat Rahim** - Full-Stack Developer

---

## 🚀 Ready for Production

Your Shop.PK e-commerce platform is ready for real customers with:
- ✅ Complete order management
- ✅ Secure payment processing
- ✅ Admin dashboard
- ✅ Mobile responsive design
- ✅ STRICT security measures

**Start your e-commerce business today!** 🛒