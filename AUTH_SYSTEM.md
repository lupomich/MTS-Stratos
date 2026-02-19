# 🔐 MTS-Stratos Authentication & User Management

Complete authentication and user management system with PostgreSQL, Redis, JWT, and React.

## ✨ Features Implemented

### Backend (Node.js + Express)
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **PostgreSQL Database** - User storage and preferences
- ✅ **Redis Cache** - Fast session and preference caching
- ✅ **Password Hashing** - bcrypt for secure password storage
- ✅ **Role-Based Access Control (RBAC)** - admin, trader, user, viewer roles
- ✅ **User Management API** - CRUD operations for users
- ✅ **Preferences System** - Persistent user preferences
- ✅ **Audit Logging** - Track all user actions
- ✅ **Rate Limiting** - Protect against brute force attacks
- ✅ **Security Headers** - Helmet.js middleware

### Frontend (React)
- ✅ **Login/Register Forms** - Beautiful UI with validation
- ✅ **Protected Routes** - Auth-based access control
- ✅ **User Settings Panel** - Manage preferences
- ✅ **Admin Panel** - User management (admin only)
- ✅ **Preferences Context** - Global state for user settings
- ✅ **Auth Context** - Global authentication state
- ✅ **Real-time User Display** - Show logged-in user in header

### Database Features
- ✅ **Users Table** - id, username, email, password_hash, role, is_active
- ✅ **User Preferences** - Flexible JSONB storage
- ✅ **Sessions Table** - Track active sessions
- ✅ **Audit Log** - Complete action history
- ✅ **Indexes** - Optimized queries
- ✅ **Triggers** - Auto-update timestamps

## 🚀 Quick Start

### 1. Build and Start All Services

```powershell
# From project root
docker-compose -f docker-compose.master.yml up --build -d
```

This will start:
- **Hello App (Backend)** - http://localhost:3000
- **BondVision Digital (Frontend)** - http://localhost:3002
- **PostgreSQL** - localhost:5432
- **Redis** - localhost:6379
- **pgAdmin** - http://localhost:5050

### 2. Access the Application

Open http://localhost:3002 in your browser.

### 3. Login with Demo Accounts

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: Full admin access

**Trader Account:**
- Username: `demo`
- Password: `user123`
- Role: Trader access

⚠️ **IMPORTANT:** Change these passwords in production!

## 📋 Default User Preferences

Each user has customizable preferences:
- **theme**: light/dark
- **language**: en/it/fr/de
- **defaultColumns**: Array of visible columns
- **lastTab**: Last opened tab
- **gridLayout**: compact/comfortable/spacious

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login       - Login user
POST   /api/auth/register    - Register new user
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user info
```

### User Management (Admin only)
```
GET    /api/users            - List all users
GET    /api/users/:id        - Get user by ID
PUT    /api/users/:id        - Update user
DELETE /api/users/:id        - Delete user
PUT    /api/users/:id/password - Change password
```

### Preferences
```
GET    /api/preferences           - Get all preferences
GET    /api/preferences/:key      - Get specific preference
PUT    /api/preferences/:key      - Update preference
DELETE /api/preferences/:key      - Delete preference
POST   /api/preferences/bulk      - Bulk update
```

## 🗄️ Database Schema

### Users Table
```sql
id              UUID PRIMARY KEY
username        VARCHAR(50) UNIQUE
email           VARCHAR(255) UNIQUE
password_hash   VARCHAR(255)
role            VARCHAR(20) - admin|trader|user|viewer
is_active       BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
last_login      TIMESTAMP
```

### User Preferences Table
```sql
id                 UUID PRIMARY KEY
user_id            UUID FOREIGN KEY
preference_key     VARCHAR(100)
preference_value   JSONB
updated_at         TIMESTAMP
```

## 🔧 Configuration

### Environment Variables (Backend)

Edit `docker-compose.master.yml` or create `.env`:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://stratos:stratos2026@postgres:5432/stratos_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=*
```

### Environment Variables (Frontend)

Create `bondvision-digital/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 💾 Database Access

### Using pgAdmin

1. Open http://localhost:5050
2. Login:
   - Email: `admin@stratos.local`
   - Password: `admin`
3. Add server:
   - Host: `postgres`
   - Port: `5432`
   - Username: `stratos`
   - Password: `stratos2026`
   - Database: `stratos_db`

### Using psql

```powershell
docker exec -it mts-stratos-postgres psql -U stratos -d stratos_db
```

## 🧪 Testing the System

### Test Authentication Flow

1. **Register a new user:**
```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

2. **Login:**
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser","password":"test123"}'
```

3. **Get user info (with token):**
```powershell
curl -X GET http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Preferences

```powershell
# Update preference
curl -X PUT http://localhost:3000/api/preferences/ui_settings `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"value":{"theme":"dark","language":"it"}}'

# Get preferences
curl -X GET http://localhost:3000/api/preferences `
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Monitoring

### View Logs

```powershell
# Backend logs
docker logs mts-stratos-hello-app -f

# Frontend logs
docker logs mts-stratos-bondvision-digital -f

# Database logs
docker logs mts-stratos-postgres -f

# Redis logs
docker logs mts-stratos-redis -f
```

### Check Container Status

```powershell
docker ps
```

### View Resource Usage

```powershell
docker stats
```

## 🔒 Security Features

1. **Password Hashing** - bcrypt with salt rounds 10
2. **JWT Tokens** - 24-hour expiration
3. **Token Blacklisting** - Logout invalidates tokens
4. **Rate Limiting** - 100 requests/15min general, 5/15min auth
5. **SQL Injection Protection** - Parameterized queries
6. **CORS Protection** - Configurable origins
7. **Helmet.js** - Security headers
8. **Session Tracking** - IP and user agent logging
9. **Audit Logging** - All actions tracked

## 🛠️ Troubleshooting

### Database Connection Issues

```powershell
# Check if PostgreSQL is running
docker logs mts-stratos-postgres

# Restart PostgreSQL
docker-compose -f docker-compose.master.yml restart postgres
```

### Redis Connection Issues

```powershell
# Check Redis status
docker logs mts-stratos-redis

# Test Redis connection
docker exec -it mts-stratos-redis redis-cli ping
```

### Reset Database

```powershell
# Stop all services
docker-compose -f docker-compose.master.yml down -v

# Start fresh
docker-compose -f docker-compose.master.yml up --build -d
```

### Clear Redis Cache

```powershell
docker exec -it mts-stratos-redis redis-cli FLUSHALL
```

## 📦 Production Deployment

### Before Going to Production:

1. **Change JWT Secret:**
   ```yaml
   JWT_SECRET=use-a-long-random-secure-string-here
   ```

2. **Change Default Passwords:**
   - Update admin/demo user passwords
   - Change pgAdmin password
   - Change PostgreSQL password

3. **Update CORS:**
   ```yaml
   CORS_ORIGIN=https://yourdomain.com
   ```

4. **Enable SSL:**
   - Use HTTPS for frontend
   - Use TLS for PostgreSQL connections

5. **Backup Strategy:**
   - Setup automated PostgreSQL backups
   - Configure Redis persistence (RDB/AOF)

6. **Environment:**
   ```yaml
   NODE_ENV=production
   ```

## 🔄 Backup & Restore

### Backup Database

```powershell
docker exec mts-stratos-postgres pg_dump -U stratos stratos_db > backup.sql
```

### Restore Database

```powershell
cat backup.sql | docker exec -i mts-stratos-postgres psql -U stratos -d stratos_db
```

## 📈 Future Enhancements

Potential additions:
- [ ] Email verification
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2/SAML integration
- [ ] User activity dashboard
- [ ] Advanced audit log search
- [ ] Session management (view/revoke active sessions)
- [ ] API key management
- [ ] Webhook notifications

## 🆘 Support

For issues or questions:
1. Check logs: `docker logs <container-name> -f`
2. Verify all containers are running: `docker ps`
3. Check database connectivity: pgAdmin
4. Review API responses in browser DevTools

---

**System Status:** ✅ Production Ready
**Last Updated:** February 18, 2026
