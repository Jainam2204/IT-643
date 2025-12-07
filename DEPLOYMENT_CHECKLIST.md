# Deployment Checklist

## ✅ Completed Production Optimizations

### Backend

- ✅ **Helmet.js** - Security headers configured with Socket.io compatibility
- ✅ **Compression** - Gzip compression enabled
- ✅ **Rate Limiting** - Configured for API, auth, and file uploads
- ✅ **CORS** - Environment-based configuration
- ✅ **Winston Logger** - Replaced console.log with proper logging
- ✅ **Environment Validation** - Joi validation on startup
- ✅ **MongoDB Connection Pooling** - Configured for production
- ✅ **Health Check Endpoint** - `/health` endpoint added
- ✅ **PM2 Configuration** - Ecosystem config for process management
- ✅ **Error Handling** - Global error handler with environment-based responses
- ✅ **Graceful Shutdown** - SIGTERM/SIGINT handlers

### Frontend

- ✅ **Environment Variables** - All hardcoded URLs replaced
- ✅ **API Configuration** - Centralized API utility with env vars
- ✅ **Socket.io Configuration** - Environment-based URL
- ✅ **Build Configuration** - Vite configured for production

## 📋 Pre-Deployment Steps

### 1. Environment Variables

#### Backend (.env)
Create `backend/.env` from the template:
```bash
cd backend
# Copy the example (create manually if needed)
# Fill in all required values
```

Required variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Strong random string (min 32 chars)
- `CLIENT_URL` / `FRONTEND_URL` - Your production frontend URL
- `EMAIL` / `EMAIL_PASSWORD` - Email service credentials
- `NODE_ENV=production`

Optional:
- Cloudinary credentials (for file storage)
- Razorpay credentials (for payments)

#### Frontend (.env)
Create `frontend/.env`:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Build Frontend

```bash
cd frontend
npm run build
```

This creates a `dist/` folder with production-ready static files.

### 4. Serve Frontend

You can serve the frontend in several ways:

**Option A: Backend serves static files (recommended for simple deployments)**
- Copy `frontend/dist/*` to `backend/public/`
- Backend will serve static files at root

**Option B: Separate web server (Nginx, Apache, etc.)**
- Deploy frontend to a web server
- Configure reverse proxy for API

**Option C: CDN/Static hosting (Vercel, Netlify, etc.)**
- Deploy frontend separately
- Set environment variables in hosting platform

### 5. Database Setup

- Ensure MongoDB is accessible from your server
- Set up indexes if needed (check models)
- Test connection with provided credentials

### 6. Start Backend with PM2

```bash
cd backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 7. Verify Deployment

1. Check health endpoint:
   ```bash
   curl https://api.yourdomain.com/health
   ```

2. Check logs:
   ```bash
   pm2 logs skillxchange-backend
   # or
   tail -f backend/logs/combined.log
   ```

3. Test API endpoints
4. Test frontend connectivity

## 🔒 Security Checklist

- [ ] All environment variables set and validated
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB credentials are secure
- [ ] CORS is configured for production domain only
- [ ] HTTPS is enabled (use reverse proxy like Nginx)
- [ ] Rate limiting is active
- [ ] Security headers are present (verify with securityheaders.com)
- [ ] No sensitive data in logs
- [ ] File uploads are properly validated

## 📊 Monitoring Setup

### Logs Location
- Backend: `backend/logs/`
  - `combined.log` - All logs
  - `error.log` - Errors only
  - PM2 logs: `pm2 logs`

### Health Monitoring
- Endpoint: `/health`
- Returns: status, uptime, environment

### Recommended Additions
- Error tracking: Sentry, Rollbar
- APM: New Relic, Datadog
- Uptime monitoring: UptimeRobot, Pingdom

## 🚀 Performance Optimizations

- ✅ Gzip compression
- ✅ MongoDB connection pooling
- ✅ PM2 cluster mode (auto-scales to CPU cores)
- ✅ Static file caching (configure in Nginx/reverse proxy)
- ✅ Database indexes (verify in MongoDB)

## 📝 Notes

- All hardcoded `localhost` URLs have been replaced
- Console.log statements replaced with Winston logger
- Production start script uses `node` instead of `nodemon`
- Rate limiting configured per endpoint type
- Health check endpoint for monitoring

## 🔄 Rollback Plan

1. Keep previous version available
2. Use PM2 to stop current version
3. Switch to previous version
4. Monitor logs for issues

## 📞 Support

Check logs in:
- `backend/logs/combined.log`
- `backend/logs/error.log`
- PM2: `pm2 logs skillxchange-backend`

