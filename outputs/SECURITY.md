# TimeKids - Security Guidelines

Comprehensive security documentation for TimeKids application.

## 🔐 Security Overview

TimeKids implements multiple layers of security:

1. **Authentication** - User identity verification
2. **Authorization** - Permission checking
3. **Data Protection** - Encryption and validation
4. **Infrastructure** - Server and network security
5. **Compliance** - Standards and regulations

---

## 👤 Authentication Security

### Password Requirements

- Minimum 8 characters
- Mix of uppercase and lowercase letters
- Include numbers and special characters
- No dictionary words

### Password Storage

```javascript
// Backend uses Supabase Auth
// Passwords never stored in plain text
// Automatically hashed and salted
```

### Session Management

```javascript
// Session Configuration
{
  secret: process.env.SESSION_SECRET, // 32+ character random string
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // HTTPS only
    httpOnly: true,    // No JavaScript access
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}
```

### Two-Factor Authentication (Future)

Plan to implement 2FA:
- Email verification
- SMS codes
- Authenticator apps

---

## 🛡️ Authorization & Access Control

### Row-Level Security (RLS)

```sql
-- Audio content: Public read-only
CREATE POLICY "Allow public to read audio" ON audio_content
  FOR SELECT USING (true);

-- Favorites: Users can only see/edit their own
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);
```

### Admin Role Protection

```javascript
// Check admin status
const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
```

### Protected Routes

```javascript
// Routes that require authentication
app.get('/dashboard', requireAuth, (req, res) => {
  // Only authenticated users can access
});

// Routes that require admin
app.post('/admin/audio', requireAdmin, (req, res) => {
  // Only admins can create audio
});
```

---

## 🔒 Data Protection

### HTTPS/TLS

```javascript
// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Secure Headers

```javascript
const helmet = require('helmet');

app.use(helmet());

// Additional headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

### CORS Configuration

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://timekids.app', 'https://www.timekids.app']
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
```

### Input Validation

```javascript
// Validate all inputs
const { body, validationResult } = require('express-validator');

app.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process valid input
});
```

### SQL Injection Prevention

```javascript
// Use parameterized queries (Supabase does this automatically)
// GOOD - Parameterized
const { data } = await supabase
  .from('users')
  .select()
  .eq('email', userEmail); // Parameter passed separately

// BAD - String concatenation (NEVER do this)
// const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

### XSS Prevention

```javascript
// Escape user input
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Never inject user content directly
// GOOD
element.textContent = userContent; // Safe

// BAD
element.innerHTML = userContent; // Vulnerable to XSS
```

### CSRF Protection

```javascript
// Use CSRF tokens for state-changing operations
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false });

app.post('/api/favorites', csrfProtection, (req, res) => {
  // CSRF token already validated by middleware
});
```

---

## 🔑 Secret Management

### Environment Variables

```env
# NEVER commit to git
SUPABASE_SERVICE_KEY=super-secret-key
SESSION_SECRET=random-32-character-string
JWT_SECRET=another-secret-key
```

### .gitignore

```
.env
.env.local
.env.*.local
node_modules/
*.log
```

### Access Control

```bash
# File permissions
chmod 600 .env          # Only owner can read
chmod 700 .env.example  # Example is readable

# Server credentials
# Never share in public repositories
# Only share with authorized team members
# Use environment variables in hosting platform
```

---

## 🚨 Error Handling & Logging

### Safe Error Messages

```javascript
// Show generic messages to users
// GOOD
res.status(500).json({ 
  error: 'An error occurred' 
});

// Log detailed error internally
// GOOD
console.error('Detailed error:', error);

// BAD - Exposing stack trace
res.status(500).json({ 
  error: error.stack 
});
```

### Logging Sensitive Data

```javascript
// GOOD - Log safely
logger.info(`User ${userId} logged in successfully`);

// BAD - Log sensitive data
logger.info(`User ${userId} logged in with password: ${password}`);
```

### Log Retention

```javascript
// Securely delete old logs
// Keep logs for audit trail
// Delete after appropriate retention period (e.g., 90 days)
```

---

## 🔐 Database Security

### Row-Level Security

Enabled on all tables with appropriate policies.

### Data Encryption

```javascript
// Sensitive data encryption
const crypto = require('crypto');

function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text, key) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### Backup Security

```bash
# Encrypt backups
gpg --symmetric --cipher-algo AES256 backup.sql

# Store securely
aws s3 cp backup.sql.gpg s3://secure-bucket/ --sse AES256
```

---

## 🖥️ Infrastructure Security

### Server Hardening

```bash
# Disable unnecessary services
sudo systemctl disable telnet
sudo systemctl disable ftp

# Use SSH keys only (disable password auth)
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no
# PubkeyAuthentication yes

# Firewall configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Fail2ban (brute force protection)
sudo apt-get install fail2ban
```

### Network Security

```bash
# DDoS Protection
# Use CloudFlare or similar service

# WAF (Web Application Firewall)
# Configure rules in CloudFlare or AWS WAF

# API Rate Limiting
# Implement in application
```

---

## 📋 Security Checklist

### Development

- [ ] Never hardcode secrets
- [ ] Use .env for configuration
- [ ] Validate all inputs
- [ ] Escape output
- [ ] Use HTTPS in development (for testing)
- [ ] Keep dependencies updated
- [ ] Run security audits

### Deployment

- [ ] Change default passwords
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set secure session cookies
- [ ] Enable RLS on all tables
- [ ] Setup monitoring and alerts
- [ ] Configure backups
- [ ] Document access controls

### Ongoing

- [ ] Monitor security logs
- [ ] Review access logs regularly
- [ ] Update dependencies monthly
- [ ] Perform penetration testing
- [ ] Conduct security audits
- [ ] Review user permissions
- [ ] Test backup restoration

---

## 🔍 Security Audit Commands

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check Node.js security
snyk test

# Analyze dependencies
npm ls

# Check for outdated packages
npm outdated

# Security linting
npx eslint --plugin security .
```

---

## 🚨 Incident Response

### If Breached

1. **Immediately**
   - Take application offline
   - Check system logs
   - Identify scope of breach

2. **Within Hours**
   - Notify affected users
   - Change all credentials
   - Review database backups

3. **Within 24 Hours**
   - Conduct full security audit
   - Patch vulnerabilities
   - Monitor for continued access

4. **Within 7 Days**
   - Complete incident report
   - Communicate findings
   - Implement fixes

---

## 🎓 Security Resources

### OWASP Top 10

1. Injection
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities (XXE)
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting (XSS)
8. Insecure Deserialization
9. Using Components with Known Vulnerabilities
10. Insufficient Logging & Monitoring

### Security Standards

- **NIST Cybersecurity Framework** - Guidelines
- **ISO 27001** - Information security
- **SOC 2** - Compliance
- **GDPR** - Data protection (EU)
- **CCPA** - Privacy (California)

### Tools

- **OWASP ZAP** - Security testing
- **Burp Suite** - Web vulnerability scanner
- **Snyk** - Dependency security
- **SonarQube** - Code quality
- **Trivy** - Container scanning

### Learning Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [NIST Cyber Framework](https://www.nist.gov/cyberframework)
- [Secure Coding Guide](https://www.securecoding.cert.org/)
- [PortSwigger Web Security](https://portswigger.net/web-security)

---

## 📧 Security Contact

For security vulnerabilities, please report to:
- Email: security@timekids.app
- PGP Key: [Public Key URL]

Do not disclose vulnerabilities publicly until fixed.

---

## 📝 Security Changelog

### Version 1.0.0
- Initial security implementation
- HTTPS enforcement
- Input validation
- RLS policies
- Secure session handling

---

**Last Updated:** March 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready

Remember: **Security is a continuous process, not a destination.**
