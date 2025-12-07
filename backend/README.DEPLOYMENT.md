# Deployment Guide

This guide covers production deployment setup for the SkillXchange backend.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- PM2 installed globally: `npm install -g pm2`

## Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all required environment variables in `.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a strong random string (minimum 32 characters)
   - `CLIENT_URL`: Your frontend URL (e.g., https://yourdomain.com)
   - `EMAIL` / `EMAIL_PASSWORD`: Email service credentials

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure logs directory exists:
   ```bash
   mkdir -p logs
   ```

## Running in Production

### Using PM2 (Recommended)

1. Start the application:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

2. Save PM2 configuration:
   ```bash
   pm2 save
   pm2 startup
   ```

3. Monitor the application:
   ```bash
   pm2 status
   pm2 logs skillxchange-backend
   ```

### Using Node directly

```bash
NODE_ENV=production node server.js
```

## Health Check

The application exposes a health check endpoint at `/health`:

```bash
curl http://localhost:3000/health
```

## Monitoring

- Logs are stored in `logs/` directory:
  - `combined.log`: All logs
  - `error.log`: Error logs only
  - `pm2-out.log`: PM2 stdout
  - `pm2-error.log`: PM2 stderr

## Security Features

- ✅ Helmet.js for security headers
- ✅ Rate limiting on all endpoints
- ✅ CORS properly configured
- ✅ Environment variable validation
- ✅ Winston logging with log levels
- ✅ MongoDB connection pooling

## Performance Features

- ✅ Gzip compression enabled
- ✅ Connection pooling for MongoDB
- ✅ Cluster mode with PM2 (auto-scales to CPU cores)

