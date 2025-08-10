# 🔐 Environment & Security Configuration - 2D Online Ticaret Oyunu

## 📋 Environment Setup Overview

**Environments:** Development, Staging, Production  
**Security Level:** High (JWT, Input Validation, Rate Limiting)  
**Deployment:** Docker + Environment Variables  

---

## 🌍 Environment Configuration

### **1. Development (.env.development)**
```bash
# === DEVELOPMENT ENVIRONMENT ===
NODE_ENV=development
PORT=3000

# Database
DATABASE_PATH=./data/game_dev.db
DATABASE_BACKUP_ENABLED=false

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production-please
JWT_EXPIRES_IN=7d
JWT_REFRESH_ENABLED=true

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173

# Logging
LOG_LEVEL=debug
LOG_FILE_ENABLED=true
LOG_DIR=./logs

# Rate Limiting (Relaxed for development)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=1000
RATE_LIMIT_SKIP_LOCALHOST=true

# SMS Service (Mock in development)
SMS_PROVIDER=mock
SMS_API_KEY=mock-key
SMS_SENDER_ID=TICARET

# Bot Configuration
BOT_ENABLED=true
BOT_RESPONSE_DELAY=2000
BOT_AUTO_MESSAGES=true

# Chat Configuration
CHAT_MESSAGE_MAX_LENGTH=500
CHAT_RATE_LIMIT=20
CHAT_HISTORY_LIMIT=100

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif

# Debug Features
DEBUG_MODE=true
FAKE_SMS_CODE=123456
AUTO_LOGIN_ENABLED=true
SEED_DATA_ENABLED=true
```

### **2. Staging (.env.staging)**
```bash
# === STAGING ENVIRONMENT ===
NODE_ENV=staging
PORT=3000

# Database
DATABASE_PATH=./data/game_staging.db
DATABASE_BACKUP_ENABLED=true
DATABASE_BACKUP_INTERVAL=6h

# JWT Configuration (Stronger)
JWT_SECRET=staging-jwt-secret-256-bit-random-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_ENABLED=true
JWT_REFRESH_THRESHOLD=6h

# CORS (Specific staging domain)
ALLOWED_ORIGINS=https://staging.ticaret-oyunu.com,https://test.ticaret-oyunu.com

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true
LOG_DIR=./logs
LOG_ROTATION=daily
LOG_MAX_FILES=7

# Rate Limiting (Production-like)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
RATE_LIMIT_SKIP_LOCALHOST=false

# SMS Service (Real but limited)
SMS_PROVIDER=twilio
SMS_API_KEY=your-twilio-api-key
SMS_ACCOUNT_SID=your-twilio-account-sid
SMS_AUTH_TOKEN=your-twilio-auth-token
SMS_SENDER_ID=TICARET
SMS_RATE_LIMIT=5

# Bot Configuration
BOT_ENABLED=true
BOT_RESPONSE_DELAY=3000
BOT_AUTO_MESSAGES=true

# Chat Configuration
CHAT_MESSAGE_MAX_LENGTH=500
CHAT_RATE_LIMIT=15
CHAT_HISTORY_LIMIT=50

# File Upload
UPLOAD_MAX_SIZE=3145728
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png

# Monitoring
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
ERROR_REPORTING=true

# Debug Features (Disabled)
DEBUG_MODE=false
FAKE_SMS_CODE=disabled
AUTO_LOGIN_ENABLED=false
SEED_DATA_ENABLED=false
```

### **3. Production (.env.production)**
```bash
# === PRODUCTION ENVIRONMENT ===
NODE_ENV=production
PORT=3000

# Database
DATABASE_PATH=./data/game_production.db
DATABASE_BACKUP_ENABLED=true
DATABASE_BACKUP_INTERVAL=2h
DATABASE_BACKUP_RETENTION=30d

# JWT Configuration (Maximum Security)
JWT_SECRET=production-super-secret-jwt-key-256-bit-random-here
JWT_EXPIRES_IN=12h
JWT_REFRESH_ENABLED=true
JWT_REFRESH_THRESHOLD=3h
JWT_BLACKLIST_ENABLED=true

# CORS (Production domain only)
ALLOWED_ORIGINS=https://ticaret-oyunu.com,https://www.ticaret-oyunu.com

# Logging
LOG_LEVEL=warn
LOG_FILE_ENABLED=true
LOG_DIR=./logs
LOG_ROTATION=daily
LOG_MAX_FILES=30
LOG_COMPRESS=true

# Rate Limiting (Strict)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50
RATE_LIMIT_SKIP_LOCALHOST=false
RATE_LIMIT_REDIS_ENABLED=false

# SMS Service (Production)
SMS_PROVIDER=twilio
SMS_API_KEY=your-production-twilio-api-key
SMS_ACCOUNT_SID=your-production-twilio-account-sid
SMS_AUTH_TOKEN=your-production-twilio-auth-token
SMS_SENDER_ID=TICARET
SMS_RATE_LIMIT=3
SMS_DAILY_LIMIT=1000

# Bot Configuration
BOT_ENABLED=true
BOT_RESPONSE_DELAY=5000
BOT_AUTO_MESSAGES=true
BOT_RATE_LIMIT=10

# Chat Configuration
CHAT_MESSAGE_MAX_LENGTH=300
CHAT_RATE_LIMIT=10
CHAT_HISTORY_LIMIT=30
CHAT_PROFANITY_FILTER=true

# File Upload (Strict)
UPLOAD_MAX_SIZE=2097152
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png
UPLOAD_VIRUS_SCAN=true

# Security Headers
SECURITY_HEADERS_ENABLED=true
HSTS_ENABLED=true
CSP_ENABLED=true

# Monitoring
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
ERROR_REPORTING=true
PERFORMANCE_MONITORING=true

# Debug Features (All disabled)
DEBUG_MODE=false
FAKE_SMS_CODE=disabled
AUTO_LOGIN_ENABLED=false
SEED_DATA_ENABLED=false
```

---

## 🔐 Security Configuration

### **1. JWT Security**
```javascript
// config/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTManager {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshThreshold = process.env.JWT_REFRESH_THRESHOLD || '6h';
    
    // JWT secret validation
    if (!this.secret || this.secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
  }
  
  generateToken(payload) {
    return jwt.sign(
      {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomUUID() // JWT ID for blacklisting
      },
      this.secret,
      { expiresIn: this.expiresIn }
    );
  }
  
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('TOKEN_INVALID');
      }
      throw error;
    }
  }
  
  needsRefresh(token) {
    try {
      const decoded = jwt.decode(token);
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      const refreshThresholdSeconds = this.parseTimeToSeconds(this.refreshThreshold);
      
      return timeUntilExpiry < refreshThresholdSeconds;
    } catch {
      return true;
    }
  }
  
  parseTimeToSeconds(time) {
    const units = { s: 1, m: 60, h: 3600, d: 86400 };
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour
    return parseInt(match[1]) * units[match[2]];
  }
}

module.exports = new JWTManager();
```

### **2. Input Validation & Sanitization**
```javascript
// src/middleware/validation.js
const validator = require('validator');
const xss = require('xss');

class ValidationMiddleware {
  static validatePhoneNumber(req, res, next) {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Telefon numarası gerekli',
        code: 'PHONE_REQUIRED'
      });
    }
    
    // E.164 format validation
    if (!validator.isMobilePhone(phoneNumber, 'any', { strictMode: true })) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz telefon numarası formatı',
        code: 'INVALID_PHONE_FORMAT'
      });
    }
    
    // Turkish phone number specific validation
    if (phoneNumber.startsWith('+90') && phoneNumber.length !== 13) {
      return res.status(400).json({
        success: false,
        error: 'Türk telefon numarası 13 haneli olmalı',
        code: 'INVALID_TURKISH_PHONE'
      });
    }
    
    next();
  }
  
  static validateDisplayName(req, res, next) {
    let { displayName } = req.body;
    
    if (!displayName) {
      return res.status(400).json({
        success: false,
        error: 'İsim gerekli',
        code: 'NAME_REQUIRED'
      });
    }
    
    // Length validation
    if (displayName.length < 2 || displayName.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'İsim 2-50 karakter arası olmalı',
        code: 'INVALID_NAME_LENGTH'
      });
    }
    
    // XSS protection
    displayName = xss(displayName);
    
    // Alphanumeric + Turkish characters + spaces
    const nameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
    if (!nameRegex.test(displayName)) {
      return res.status(400).json({
        success: false,
        error: 'İsim sadece harfler ve boşluk içerebilir',
        code: 'INVALID_NAME_CHARACTERS'
      });
    }
    
    // Clean up multiple spaces
    displayName = displayName.replace(/\s+/g, ' ').trim();
    req.body.displayName = displayName;
    
    next();
  }
  
  static validateChatMessage(req, res, next) {
    let { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mesaj boş olamaz',
        code: 'MESSAGE_EMPTY'
      });
    }
    
    // Length validation
    const maxLength = parseInt(process.env.CHAT_MESSAGE_MAX_LENGTH) || 500;
    if (message.length > maxLength) {
      return res.status(400).json({
        success: false,
        error: `Mesaj maksimum ${maxLength} karakter olabilir`,
        code: 'MESSAGE_TOO_LONG'
      });
    }
    
    // XSS protection
    message = xss(message, {
      whiteList: {}, // No HTML allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
    
    // Profanity filter (if enabled)
    if (process.env.CHAT_PROFANITY_FILTER === 'true') {
      message = this.filterProfanity(message);
    }
    
    // Clean up
    message = message.trim();
    req.body.message = message;
    
    next();
  }
  
  static filterProfanity(text) {
    const profanityWords = [
      // Turkish profanity list (basic)
      'aptal', 'salak', 'geri zekalı'
      // Add more as needed
    ];
    
    let filtered = text;
    profanityWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    
    return filtered;
  }
}

module.exports = ValidationMiddleware;
```

### **3. Rate Limiting Configuration**
```javascript
// src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General API rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip localhost in development
      if (process.env.RATE_LIMIT_SKIP_LOCALHOST === 'true') {
        return req.ip === '127.0.0.1' || req.ip === '::1';
      }
      return false;
    }
  });
};

// Progressive delay for repeated requests
const createSlowDown = (windowMs, delayAfter, delayMs) => {
  return slowDown({
    windowMs,
    delayAfter,
    delayMs,
    maxDelayMs: 30000 // Max 30 seconds delay
  });
};

module.exports = {
  // General API (100 req/15min)
  apiLimit: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    parseInt(process.env.RATE_LIMIT_MAX) || 100,
    'Çok fazla API isteği gönderiyorsunuz. 15 dakika sonra tekrar deneyin.'
  ),
  
  // Authentication (5 req/15min)
  authLimit: createRateLimit(
    15 * 60 * 1000,
    5,
    'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.'
  ),
  
  // SMS requests (3 req/hour)
  smsLimit: createRateLimit(
    60 * 60 * 1000, // 1 hour
    parseInt(process.env.SMS_RATE_LIMIT) || 3,
    'SMS limit aşıldı. 1 saat sonra tekrar deneyin.'
  ),
  
  // Chat messages (20 req/min)
  chatLimit: createRateLimit(
    60 * 1000, // 1 minute
    parseInt(process.env.CHAT_RATE_LIMIT) || 20,
    'Çok hızlı mesaj gönderiyorsunuz. Biraz bekleyin.'
  ),
  
  // Progressive slowdown for auth
  authSlowDown: createSlowDown(
    15 * 60 * 1000, // 15 minutes
    2, // Start slowing down after 2 requests
    1000 // Add 1 second delay for each additional request
  )
};
```

### **4. Security Headers**
```javascript
// src/middleware/security.js
const helmet = require('helmet');

const securityMiddleware = (app) => {
  // Helmet for basic security headers
  app.use(helmet({
    contentSecurityPolicy: process.env.CSP_ENABLED === 'true' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "ws:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    } : false,
    
    hsts: process.env.HSTS_ENABLED === 'true' ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    } : false
  }));
  
  // Custom security headers
  app.use((req, res, next) => {
    // Remove server signature
    res.removeHeader('X-Powered-By');
    
    // Custom headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
  });
};

module.exports = securityMiddleware;
```

---

## 🛡️ Environment-Specific Middleware

### **Development Middleware**
```javascript
// src/middleware/development.js
const morgan = require('morgan');
const cors = require('cors');

const developmentMiddleware = (app) => {
  // Detailed logging
  app.use(morgan('combined'));
  
  // Permissive CORS
  app.use(cors({
    origin: true,
    credentials: true
  }));
  
  // Debug endpoint
  app.get('/debug', (req, res) => {
    res.json({
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    });
  });
  
  // Auto-login for testing
  if (process.env.AUTO_LOGIN_ENABLED === 'true') {
    app.post('/api/auth/auto-login', (req, res) => {
      const jwtManager = require('../../config/jwt');
      const token = jwtManager.generateToken({
        userId: 1,
        phoneNumber: '+905551234567',
        displayName: 'Test User'
      });
      
      res.json({
        success: true,
        token,
        user: {
          id: 1,
          phoneNumber: '+905551234567',
          displayName: 'Test User',
          trustScore: 150,
          resources: { wood: 10, grain: 5, money: 100 }
        }
      });
    });
  }
};

module.exports = developmentMiddleware;
```

### **Production Middleware**
```javascript
// src/middleware/production.js
const compression = require('compression');
const cors = require('cors');

const productionMiddleware = (app) => {
  // Gzip compression
  app.use(compression());
  
  // Strict CORS
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
    credentials: true,
    optionsSuccessStatus: 200
  }));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });
  
  // Disable debug endpoints
  app.use('/debug', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

module.exports = productionMiddleware;
```

---

## 🔄 Environment Switching

### **Environment Loading Script**
```javascript
// config/environment.js
const path = require('path');
const fs = require('fs');

class EnvironmentManager {
  constructor() {
    this.loadEnvironment();
    this.validateRequiredVars();
  }
  
  loadEnvironment() {
    const env = process.env.NODE_ENV || 'development';
    const envFile = `.env.${env}`;
    const defaultEnvFile = '.env';
    
    // Load environment-specific file first
    if (fs.existsSync(envFile)) {
      require('dotenv').config({ path: envFile });
      console.log(`📋 Loaded environment: ${envFile}`);
    }
    
    // Load default .env for fallback values
    if (fs.existsSync(defaultEnvFile)) {
      require('dotenv').config({ path: defaultEnvFile, override: false });
    }
    
    // Set NODE_ENV if not set
    process.env.NODE_ENV = env;
  }
  
  validateRequiredVars() {
    const required = [
      'NODE_ENV',
      'PORT',
      'JWT_SECRET',
      'DATABASE_PATH'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('🚨 Missing required environment variables:', missing);
      process.exit(1);
    }
    
    // Validate JWT secret length
    if (process.env.JWT_SECRET.length < 32) {
      console.error('🚨 JWT_SECRET must be at least 32 characters long');
      process.exit(1);
    }
    
    console.log('✅ Environment validation passed');
  }
  
  getConfig() {
    return {
      env: process.env.NODE_ENV,
      port: parseInt(process.env.PORT),
      database: {
        path: process.env.DATABASE_PATH,
        backupEnabled: process.env.DATABASE_BACKUP_ENABLED === 'true'
      },
      jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
        refreshEnabled: process.env.JWT_REFRESH_ENABLED === 'true'
      },
      security: {
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
          max: parseInt(process.env.RATE_LIMIT_MAX)
        },
        cors: {
          origins: process.env.ALLOWED_ORIGINS?.split(',') || []
        }
      },
      features: {
        debugMode: process.env.DEBUG_MODE === 'true',
        botEnabled: process.env.BOT_ENABLED === 'true',
        autoLogin: process.env.AUTO_LOGIN_ENABLED === 'true'
      }
    };
  }
}

module.exports = new EnvironmentManager();
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "start": "NODE_ENV=production node server.js",
    "dev": "NODE_ENV=development nodemon server.js",
    "staging": "NODE_ENV=staging node server.js",
    "test": "NODE_ENV=test jest",
    "test:dev": "NODE_ENV=development jest --watch",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js",
    "deploy:staging": "NODE_ENV=staging npm run build && npm run staging",
    "deploy:prod": "NODE_ENV=production npm run build && npm start"
  }
}
```

---

## 📊 Environment Monitoring

### **Health Check Implementation**
```javascript
// src/utils/healthCheck.js
const fs = require('fs');
const path = require('path');

class HealthChecker {
  static async checkSystem() {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      status: 'OK',
      checks: {}
    };
    
    try {
      // Database check
      checks.checks.database = await this.checkDatabase();
      
      // File system check
      checks.checks.filesystem = await this.checkFileSystem();
      
      // Memory check
      checks.checks.memory = this.checkMemory();
      
      // Environment variables check
      checks.checks.environment = this.checkEnvironment();
      
      // Overall status
      const failedChecks = Object.values(checks.checks).filter(check => !check.healthy);
      if (failedChecks.length > 0) {
        checks.status = 'DEGRADED';
      }
      
    } catch (error) {
      checks.status = 'ERROR';
      checks.error = error.message;
    }
    
    return checks;
  }
  
  static async checkDatabase() {
    try {
      const database = require('../../config/database');
      await database.get('SELECT 1');
      
      return {
        healthy: true,
        message: 'Database connection OK',
        responseTime: Date.now()
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'Database connection failed',
        error: error.message
      };
    }
  }
  
  static async checkFileSystem() {
    try {
      const testFile = path.join(process.env.LOG_DIR || './logs', 'health_test.tmp');
      
      // Write test
      fs.writeFileSync(testFile, 'health_check');
      
      // Read test
      const content = fs.readFileSync(testFile, 'utf8');
      
      // Clean up
      fs.unlinkSync(testFile);
      
      return {
        healthy: content === 'health_check',
        message: 'File system read/write OK'
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'File system check failed',
        error: error.message
      };
    }
  }
  
  static checkMemory() {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.rss / 1024 / 1024);
    const heapMB = Math.round(usage.heapUsed / 1024 / 1024);
    
    return {
      healthy: totalMB < 512, // Alert if over 512MB
      message: `Memory usage: ${totalMB}MB total, ${heapMB}MB heap`,
      totalMB,
      heapMB
    };
  }
  
  static checkEnvironment() {
    const required = ['JWT_SECRET', 'DATABASE_PATH'];
    const missing = required.filter(key => !process.env[key]);
    
    return {
      healthy: missing.length === 0,
      message: missing.length ? `Missing: ${missing.join(', ')}` : 'All required env vars present',
      missing
    };
  }
}

module.exports = HealthChecker;
```

---

## 🚨 Error Handling & Logging

### **Environment-Aware Logger**
```javascript
// src/utils/logger.js
const winston = require('winston');
const path = require('path');

const createLogger = () => {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const logDir = process.env.LOG_DIR || './logs';
  
  // Create log directory if it doesn't exist
  require('fs').mkdirSync(logDir, { recursive: true });
  
  const transports = [];
  
  // Console transport (always enabled)
  transports.push(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    )
  }));
  
  // File transports (if enabled)
  if (process.env.LOG_FILE_ENABLED === 'true') {
    // General log file
    transports.push(new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }));
    
    // Error log file
    transports.push(new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }));
  }
  
  return winston.createLogger({
    level: logLevel,
    transports,
    // Don't exit on handled exceptions
    exitOnError: false
  });
};

module.exports = createLogger();
```

---

Bu comprehensive environment configuration ile tüm deployment senaryoları güvenli şekilde handle ediliyor! 🔐

**Hazırlayan:** Musa & GitHub Copilot  
**Tarih:** 5 Ağustos 2025  
**Versiyon:** 1.0 - Complete Environment & Security Guide
