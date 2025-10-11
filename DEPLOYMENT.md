# Shop.PK Deployment Guide

This guide will help you deploy your Shop.PK e-commerce platform to various hosting services.

## 🚀 Quick Start

### 1. Local Development Setup

```bash
# Clone and setup
git clone <your-repo-url>
cd ecommerce
npm install

# Create database and run init.sql
# Start the application
npm start
```

### 2. Database Setup

1. **Create SQL Server Database**:
   ```sql
   CREATE DATABASE shop;
   USE shop;
   ```

2. **Run Initialization Script**:
   - Open SQL Server Management Studio
   - Execute `database/init.sql`
   - Verify tables are created

3. **Update Environment Variables**:
   ```env
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_SERVER=your_server
   DB_NAME=shop
   ```

## 🌐 Deployment Options

### Option 1: Heroku Deployment

1. **Install Heroku CLI**
2. **Create Heroku App**:
   ```bash
   heroku create shop-pk-ecommerce
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set DB_USER=your_db_user
   heroku config:set DB_PASSWORD=your_db_password
   heroku config:set DB_SERVER=your_db_server
   heroku config:set DB_NAME=shop
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set PORT=3000
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 2: Railway Deployment

1. **Connect GitHub Repository**
2. **Set Environment Variables** in Railway dashboard
3. **Deploy automatically** on push to main branch

### Option 3: DigitalOcean App Platform

1. **Create App** from GitHub repository
2. **Configure Environment Variables**
3. **Set Build Command**: `npm install`
4. **Set Run Command**: `npm start`

### Option 4: AWS EC2 Deployment

1. **Launch EC2 Instance**
2. **Install Node.js and PM2**:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2
   ```

3. **Clone and Setup**:
   ```bash
   git clone <your-repo>
   cd ecommerce
   npm install
   ```

4. **Configure Environment**:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your values
   ```

5. **Start with PM2**:
   ```bash
   pm2 start start.js --name "shop-pk"
   pm2 startup
   pm2 save
   ```

## 🔧 Production Configuration

### Environment Variables for Production

```env
# Database (Production)
DB_USER=production_db_user
DB_PASSWORD=secure_production_password
DB_SERVER=production_db_server
DB_NAME=shop

# Security
JWT_SECRET=very-secure-random-string-here
NODE_ENV=production

# Server
PORT=3000

# Payment Gateways (Real Credentials)
EASYPAISA_MERCHANT_ID=your_real_merchant_id
EASYPAISA_API_KEY=your_real_api_key
JAZZCASH_MERCHANT_ID=your_real_merchant_id
JAZZCASH_API_KEY=your_real_api_key
```

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Use environment variables for secrets
- [ ] Enable database encryption
- [ ] Set up proper firewall rules
- [ ] Regular security updates

### Database Security

1. **Create Production Database User**:
   ```sql
   CREATE LOGIN shop_user WITH PASSWORD = 'StrongPassword123!';
   USE shop;
   CREATE USER shop_user FOR LOGIN shop_user;
   GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO shop_user;
   ```

2. **Enable SSL for Database Connection**
3. **Regular Database Backups**

## 📱 Domain and SSL Setup

### Custom Domain

1. **Purchase Domain** (e.g., shop.pk)
2. **Configure DNS**:
   - A record: `@` → your server IP
   - CNAME: `www` → your domain

### SSL Certificate

1. **Let's Encrypt (Free)**:
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d yourdomain.com
   ```

2. **Configure Nginx** (if using):
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔄 Continuous Deployment

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 📊 Monitoring and Analytics

### Application Monitoring

1. **PM2 Monitoring**:
   ```bash
   pm2 monit
   pm2 logs
   ```

2. **Uptime Monitoring**:
   - UptimeRobot
   - Pingdom
   - StatusCake

### Analytics Setup

1. **Google Analytics**
2. **Custom Dashboard** (built-in admin panel)
3. **Error Tracking**:
   ```bash
   npm install @sentry/node
   ```

## 🚨 Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
sqlcmd -S your_server -d shop -U your_user -P your_password -Q "BACKUP DATABASE shop TO DISK = '/backups/shop_$DATE.bak'"
```

### Application Backups

```bash
# Backup application files
tar -czf shop_pk_backup_$(date +%Y%m%d).tar.gz /path/to/ecommerce/
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check SQL Server is running
   - Verify firewall settings
   - Confirm credentials

2. **Payment Integration Issues**:
   - Verify API credentials
   - Check network connectivity
   - Review payment gateway logs

3. **Performance Issues**:
   - Enable database indexing
   - Use PM2 clustering
   - Implement caching

### Logs and Debugging

```bash
# View application logs
pm2 logs shop-pk

# View system logs
journalctl -u your-service

# Database logs
tail -f /var/log/mssql/mssql.log
```

## 📞 Support

- **Documentation**: Check README.md
- **Issues**: GitHub Issues
- **Community**: Stack Overflow

---

**Important**: Always test your deployment in a staging environment before going live with production data!
