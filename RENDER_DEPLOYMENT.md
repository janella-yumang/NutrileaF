# Render Deployment Guide

## Prerequisites
- Render account (free tier is sufficient)
- GitHub repository with your code
- Existing PostgreSQL database on Render

## Steps to Deploy Backend on Render

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Add Render configuration and database initialization"
git push origin main
```

### 2. Deploy Backend Service
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `backend` folder or root if backend is in subfolder
5. Configure:
   - **Name**: `nutrilea-backend` (or your existing service name)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt && python init_render_db.py`
   - **Start Command**: `gunicorn --bind 0.0.0.0 --port $PORT server:app`
   - **Plan**: Free

### 3. Add Environment Variables
In your web service settings, add these environment variables:
- `FLASK_ENV`: `production`
- `CORS_ORIGINS`: `https://nutrilea-f.vercel.app,https://nutrilea-f.vercel.app/`
- `DATABASE_URL`: **Copy from your existing PostgreSQL database service**

### 4. Connect to Existing Database
1. Go to your existing PostgreSQL database service on Render
2. Copy the **Database URL** from the Connections tab
3. Paste this URL as the `DATABASE_URL` environment variable in your web service

### 5. Deploy
Click "Create Web Service" and Render will automatically deploy.

## Frontend Configuration
Your frontend is already configured to use:
```
REACT_APP_API_URL=https://nutrilea-backend.onrender.com/api
```

## Testing
After deployment, test these endpoints:
- `https://your-backend-url.onrender.com/` (should return "API is running!")
- `https://your-backend-url.onrender.com/api/products` (should return products)
- `https://your-backend-url.onrender.com/api/products/categories` (should return categories)

## Database Initialization
The `init_render_db.py` script will:
1. Create all necessary tables if they don't exist
2. Seed initial products and categories only if tables are empty
3. Work with your existing PostgreSQL database

## Troubleshooting
If you get 404 errors:
1. Check the build logs in Render dashboard
2. Verify the DATABASE_URL is correctly copied from your PostgreSQL service
3. Check that the database initialization ran successfully
4. Verify CORS origins are correctly configured

## Notes
- The database initialization script is safe to run multiple times
- It will only seed data if the products table is empty
- Your existing database structure will be preserved
- Make sure to copy the exact DATABASE_URL from your PostgreSQL service
