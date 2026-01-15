# Railway Deployment Checklist

## ⚠️ CRITICAL: Railway Environment Variables

Railway MUST have these environment variables set in your project settings:

### Required Variables:
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d
PORT=5000
```

### Optional Email Variables:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Deployment Files

The following files configure Railway deployment:

1. **nixpacks.toml** - Build and start configuration
2. **railway.json** - Railway-specific settings
3. **Procfile** - Backup process definition
4. **package.json** - Scripts for production

## How It Works

```
Railway Deployment Flow:
1. Install backend dependencies (npm install --prefix backend)
2. Install frontend dependencies (npm install)
3. Build frontend (npm run build → creates dist/)
4. Start backend (node backend/src/server.js)
5. Backend serves:
   - API routes at /api/*
   - Frontend static files at /*
```

## Verify Deployment

### 1. Check Railway Logs

Look for these messages in Railway logs:
```
Server running in production mode on port XXXX
MongoDB Connected: xxxxx
```

### 2. Test Health Endpoint

```bash
curl https://hrhivetech-production.up.railway.app/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Server is running",
  "env": "production",
  "timestamp": "2026-01-15T..."
}
```

### 3. Test Login Endpoint

```bash
curl -X POST https://hrhivetech-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hr-portal.com","password":"admin123"}'
```

Should return a JWT token.

## Troubleshooting

### 405 Method Not Allowed

**Cause:** Backend server is not running or routes not properly configured.

**Solutions:**
1. Check Railway logs for server startup errors
2. Verify MONGODB_URI is set correctly
3. Ensure NODE_ENV=production is set
4. Check if build completed successfully

### CORS Errors

**Cause:** CORS not properly configured or domain not allowed.

**Solution:**
- Backend automatically allows all origins in production
- Check server logs for CORS messages

### 502 Bad Gateway

**Cause:** Backend crashed or not responding.

**Solutions:**
1. Check Railway logs for errors
2. Verify MongoDB connection string
3. Ensure all environment variables are set

### Build Failures

**Cause:** Missing dependencies or build errors.

**Solutions:**
1. Check package-lock.json exists in both root and backend/
2. Verify all dependencies are in package.json
3. Review Railway build logs

## Redeploy Steps

1. Make your code changes
2. Commit changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. Push to trigger deployment:
   ```bash
   git push
   ```
4. Monitor Railway logs
5. Test the deployment using health check
