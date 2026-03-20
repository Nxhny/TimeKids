# TimeKids - Deployment Guide

Complete guide for deploying TimeKids to production environments.

## 🚀 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Session secret changed
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Email verification enabled in Supabase
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Security headers configured

---

## 📋 Environment Configuration

### Production .env

```env
# Supabase
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_KEY=your-production-service-key

# Server
PORT=3000
NODE_ENV=production

# Session
SESSION_SECRET=your-very-long-random-session-secret-min-32-chars

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Analytics (optional)
SENTRY_DSN=your-sentry-dsn
```

### Generate Secure Session Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🌐 Hosting Options

### Option 1: Heroku (Easiest)

**Setup:**

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set SUPABASE_URL=https://...
heroku config:set SUPABASE_ANON_KEY=...
heroku config:set SUPABASE_SERVICE_KEY=...
heroku config:set SESSION_SECRET=...
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

**Procfile** (already created):
```
web: npm start
```

---

### Option 2: Vercel

**Setup:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Add environment variables via dashboard
```

**vercel.json:**
```json
{
  "buildCommand": "npm install",
  "outputDirectory": "./",
  "devCommand": "npm run dev",
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

### Option 3: DigitalOcean App Platform

**Setup:**

1. Connect GitHub repository
2. Configure build command: `npm install`
3. Configure start command: `npm start`
4. Set environment variables in dashboard
5. Deploy

---

### Option 4: AWS EC2

**Setup:**

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/timekids.git
cd timekids

# Install dependencies
npm install --production

# Create .env file
sudo nano .env
# Add production credentials

# Install PM2 (process manager)
sudo npm install -g pm2

# Start application
pm2 start server.js --name "timekids"
pm2 save
pm2 startup

# Setup Nginx (reverse proxy)
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

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

```bash
# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 5: Docker (Containerized)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY}
      SESSION_SECRET: ${SESSION_SECRET}
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

---

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renewal setup
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Using CloudFlare (Recommended)

1. Add domain to CloudFlare
2. Update nameservers at registrar
3. Enable "Flexible SSL" or "Full SSL"
4. Configure Page Rules as needed
5. Enable "Automatic HTTPS Rewrites"

---

## 📊 Monitoring & Logging

### Sentry (Error Tracking)

```bash
npm install @sentry/node

# In server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### PM2 (Process Monitoring)

```bash
# Install
npm install -g pm2

# Start with monitoring
pm2 start server.js --name timekids
pm2 monit

# View logs
pm2 logs timekids

# Restart on file changes
pm2 watch
```

### CloudWatch (AWS)

```bash
npm install aws-sdk

# Configure in server.js for CloudWatch metrics
```

---

## 🔄 Database Backups

### Supabase Automatic Backups

Supabase provides daily backups (Pro plan and above).

**Manual Backup:**
```bash
# Export database
pg_dump "postgresql://user:password@host:port/dbname" > backup.sql

# Restore
psql "postgresql://user:password@host:port/dbname" < backup.sql
```

### Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/timekids"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup Supabase database
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db_$DATE.sql"

# Compress
gzip "$BACKUP_DIR/db_$DATE.sql"

# Upload to S3
aws s3 cp "$BACKUP_DIR/db_$DATE.sql.gz" s3://your-bucket/

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

**Schedule with cron:**
```bash
crontab -e

# Add line (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

---

## 🚨 Security Hardening

### Server Configuration

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Configure firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Restart SSH
sudo systemctl restart sshd
```

### Application Security Headers

```javascript
// In server.js
app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000 })); // 1 year
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"]
  }
}));
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

---

## 📈 Performance Optimization

### Caching Strategy

```javascript
// Cache static assets
app.use(express.static('public', {
  maxAge: '1d',
  etag: false
}));

// Cache API responses
const mcache = require('memory-cache');

const cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = mcache.get(key);
    if (cachedBody) {
      res.setHeader('X-Cache', 'HIT');
      res.send(cachedBody);
      return;
    }
    res.sendResponse = res.send;
    res.send = (body) => {
      mcache.put(key, body, duration * 1000);
      res.setHeader('X-Cache', 'MISS');
      res.sendResponse(body);
    };
    next();
  };
};
```

### Database Connection Pooling

```javascript
// Supabase handles connection pooling automatically
// For custom PostgreSQL connections:
const { Pool } = require('pg');
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

### CDN Configuration

```javascript
// Serve static assets from CDN
const ASSET_URL = process.env.CDN_URL || '/public';

// In HTML templates
<link rel="stylesheet" href="${ASSET_URL}/css/styles.css">
<script src="${ASSET_URL}/js/app.js"></script>
```

---

## 🧪 Production Testing

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test with 1000 concurrent users
ab -n 10000 -c 1000 http://your-domain.com/
```

### Health Check

```bash
# Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

### Synthetic Monitoring

Set up external monitoring to check:
- API availability
- Response time
- SSL certificate expiration
- Database connectivity

---

## 📞 Rollback Plan

### If Something Goes Wrong

```bash
# Check logs
pm2 logs timekids

# Restart application
pm2 restart timekids

# Revert to previous version
git revert HEAD
npm install
npm start

# Restore from backup
pg_restore backup.sql
```

---

## 📋 Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Verify authentication works
- [ ] Test audio playback
- [ ] Confirm email notifications send
- [ ] Check database backups running
- [ ] Monitor error logs
- [ ] Verify SSL certificate valid
- [ ] Test from multiple devices
- [ ] Confirm caching working
- [ ] Review server resource usage

---

## 🔍 Monitoring Tools

### Recommended Services

**Uptime Monitoring:**
- Uptimerobot (free)
- Pingdom
- UptimeKuma

**Error Tracking:**
- Sentry (free tier)
- Rollbar
- Bugsnag

**Performance:**
- New Relic
- Datadog
- CloudWatch

**Analytics:**
- Google Analytics
- Mixpanel
- Plausible

---

## 📞 Support & Troubleshooting

### Common Issues

**High Memory Usage:**
```bash
# Check process memory
ps aux | grep node

# Restart if needed
pm2 restart timekids
```

**Database Connection Errors:**
```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**SSL Certificate Issues:**
```bash
# Check certificate
openssl s_client -connect your-domain.com:443

# Renew certificate
sudo certbot renew
```

---

## 📚 Additional Resources

- [Heroku Documentation](https://devcenter.heroku.com)
- [Vercel Documentation](https://vercel.com/docs)
- [DigitalOcean Guides](https://www.digitalocean.com/community/tutorials)
- [Let's Encrypt](https://letsencrypt.org)
- [PM2 Documentation](https://pm2.keymetrics.io)

---

**Last Updated:** March 2024
**Version:** 1.0.0
**Status:** ✅ Ready for Production
