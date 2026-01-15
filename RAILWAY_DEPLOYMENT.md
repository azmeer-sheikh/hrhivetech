# Railway Deployment Guide

## Prerequisites
- Railway account connected to your GitHub repository
- MongoDB Atlas database (or other hosted MongoDB)

## Environment Variables Required on Railway

Set these in your Railway project settings:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d

# Email Configuration (if using email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Frontend URL (Railway will auto-set this)
FRONTEND_URL=https://hrhivetech-production.up.railway.app
```

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Configure Railway deployment"
   git push
   ```

2. **Railway will automatically:**
   - Detect the `nixpacks.toml` configuration
   - Install dependencies for both frontend and backend
   - Build the frontend with Vite
   - Start the backend server
   - Serve frontend files from the backend

3. **The backend server will:**
   - Listen on the PORT environment variable (Railway provides this)
   - Serve API routes at `/api/*`
   - Serve frontend static files for all other routes
   - Handle client-side routing properly

## Testing

After deployment:
1. Check Railway logs for any errors
2. Visit your app URL: `https://hrhivetech-production.up.railway.app`
3. Test login functionality
4. Check Network tab in browser DevTools

## Architecture

```
Railway Deployment
├── Frontend (Vite Build) → dist/
│   └── Served by Express at /*
└── Backend (Express API) → backend/src/
    └── API routes at /api/*
```

All requests go to the same server:
- API requests → Express routes (`/api/*`)
- Frontend requests → Static files from `dist/`
- Client-side routes → `index.html` (SPA routing)

## Troubleshooting

### 405 Method Not Allowed
- Ensure `NODE_ENV=production` is set
- Check Railway logs for server startup
- Verify MongoDB connection string is correct

### CORS Errors
- Backend automatically allows Railway domain
- Check if FRONTEND_URL is set correctly

### Build Failures
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify `nixpacks.toml` configuration

### Database Connection Issues
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access settings
- Add `0.0.0.0/0` to IP whitelist or Railway's IP ranges
