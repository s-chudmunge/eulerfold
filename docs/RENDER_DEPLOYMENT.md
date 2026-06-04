# Render Deployment Guide

This guide explains how to deploy the EulerFold backend to Render.

## Prerequisites

1. A Render account
2. A PostgreSQL database (can be created on Render)
3. A Redis instance (for caching)
4. Firebase project credentials
5. Required API keys ()

## Deployment Steps

### 1. Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - **Name**: `eulerfold-backend`
   - **Environment**: `Python 3`
   - **Region**: Choose your preferred region
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.prod.txt`
   - **Start Command**: `./start_production.sh`

### 2. Configure Environment Variables

In the Render dashboard, add these environment variables:

#### Required Database Variables
```
POSTGRES_HOST=your_postgres_host
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=your_postgres_db
POSTGRES_PORT=5432
```



#### Required API Keys
```
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

#### Required Security Keys
```
SECRET_KEY=your_random_secret_key_32_chars_min
REFRESH_SECRET_KEY=your_random_refresh_secret_key_32_chars_min
CHECKIN_RUN_KEY=your_secure_cron_auth_token
```

#### Required Cache
```
REDIS_URL=redis://your_redis_url
```

#### Optional Admin Credentials
```
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_admin_password
```

### 3. Set up the Cron Job (Auto-Checkins)

To enable the 7-day check-in loop, you need to set up a Cron Job on Render:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Cron Job"
3. Connect your GitHub repository
4. Use these settings:
   - **Name**: `eulerfold-checkin-worker`
   - **Environment**: `Python 3` (or `Docker` if using a Dockerfile)
   - **Schedule**: `0 0 * * *` (Runs every day at midnight to check for due roadmaps)
   - **Command**: `curl -X POST -H "Authorization: Bearer $CHECKIN_RUN_KEY" https://your-backend-url.onrender.com/checkins/run_due`
5. In the Cron Job's "Environment" tab, add the `CHECKIN_RUN_KEY` variable with the same value used in your Web Service.

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically deploy from your GitHub repository
3. The deployment will:
   - Install Python dependencies
   - Run database migrations automatically
   - Start the FastAPI application

### 4. Verify Deployment

Once deployed, test your endpoints:
- Health check: `https://your-app.onrender.com/health`
- API docs: `https://your-app.onrender.com/docs`

## Frontend Configuration

Update your frontend environment variables:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-app.onrender.com
```

## Security Notes

- All sensitive environment variables should be set in Render's dashboard, not committed to code
- Use strong, unique secret keys
- Ensure your database and Redis instances are properly secured
- Consider using Render's private networking for database connections

## Automatic Deployments

Render will automatically redeploy when you push to the `master` branch. The deployment includes:
- Automatic database migrations
- Zero-downtime deployments
- Health checks

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify your database credentials and ensure the database is accessible
2. **Missing Environment Variables**: Check that all required variables are set in Render dashboard
3. **Port Issues**: Render automatically sets the `PORT` environment variable
4. **Memory Issues**: Consider upgrading your Render plan if you encounter memory limits

### Logs

View logs in the Render dashboard under your service's "Logs" tab to debug issues.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify your database credentials and ensure the database is accessible
2. **Missing Environment Variables**: Check that all required variables are set in Render dashboard
3. **Port Issues**: Render automatically sets the `PORT` environment variable
4. **Memory Issues**: Consider upgrading your Render plan if you encounter memory limits

### Logs

View logs in the Render dashboard under your service's "Logs" tab to debug issues.