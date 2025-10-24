# MedPal Deployment Guide

This guide provides step-by-step instructions for deploying the MedPal application to production.

## Prerequisites

Before deployment, ensure you have:
- [x] MongoDB Atlas account with a database cluster
- [x] Netlify account for frontend hosting
- [x] Render account for backend hosting
- [x] SMTP email credentials (optional, for email notifications)

## Part 1: Backend Deployment (Render)

### Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster or use an existing one
3. Create a database user:
   - Database Access → Add New Database User
   - Save the username and password securely
4. Whitelist all IPs (for Render):
   - Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required because Render uses dynamic IPs
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/medpal`)

### Step 2: Deploy Backend to Render

1. Sign in to [Render](https://render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `medpal-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `master` (or `main`)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/medpal?retryWrites=true&w=majority
   JWT_SECRET = [generate a random 64-character string]
   CLIENT_URL = https://your-app-name.netlify.app
   FRONTEND_URL = https://your-app-name.netlify.app
   PORT = 5000
   ```
   
   Optional email variables (if using email notifications):
   ```
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASS = your-app-specific-password
   ```

6. Click "Create Web Service"
7. Wait for deployment to complete (check logs for "MongoDB connected successfully")
8. Copy your backend URL (e.g., `https://medpal-backend.onrender.com`)

### Step 3: Test Backend

Visit `https://your-backend-url.onrender.com` - you should see "MedPal API is running"

## Part 2: Frontend Deployment (Netlify)

### Step 1: Configure Frontend Environment

The frontend needs to know your backend URL. This is configured via the `VITE_API_URL` environment variable.

### Step 2: Deploy to Netlify

1. Go to [Netlify](https://www.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub)
4. Select your repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   
6. Add Environment Variables:
   - Click "Show advanced"
   - Add variable:
     ```
     VITE_API_URL = https://your-backend-url.onrender.com
     ```

7. Click "Deploy site"
8. Wait for deployment to complete

### Step 3: Configure Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Update DNS records as instructed

### Step 4: Update Backend CORS

After getting your Netlify URL:
1. Go back to Render
2. Update the `CLIENT_URL` and `FRONTEND_URL` environment variables with your actual Netlify URL
3. The service will automatically redeploy

## Part 3: Post-Deployment Setup

### Create Admin User

You'll need to create an admin user to access the admin dashboard:

1. SSH into your Render service or use the web shell
2. Navigate to the backend directory
3. Run:
   ```bash
   node scripts/createAdmin.js
   ```
4. Follow the prompts to create an admin account

### Verify Deployment

1. **Backend Health Check**:
   - Visit `https://your-backend-url.onrender.com`
   - Should show "MedPal API is running"

2. **Frontend Check**:
   - Visit `https://your-app-name.netlify.app`
   - Should load the welcome page

3. **API Connection**:
   - Try logging in or registering
   - Check browser console for any CORS errors

4. **Database Connection**:
   - Check Render logs for "MongoDB connected successfully"

### Common Issues & Solutions

**CORS Errors**:
- Ensure `CLIENT_URL` and `FRONTEND_URL` in Render match your Netlify URL exactly
- Check that there are no trailing slashes

**MongoDB Connection Failed**:
- Verify connection string is correct
- Ensure IP whitelist includes 0.0.0.0/0
- Check that database user has proper permissions

**Build Failures**:
- Check Netlify/Render logs for specific errors
- Ensure all dependencies are in package.json
- Verify Node version compatibility

**Email Not Sending**:
- Verify SMTP credentials are correct
- For Gmail, use an App Password, not your regular password
- Check that EMAIL_USER and EMAIL_PASS are set correctly

## Part 4: Local Testing Before Deployment

Test the production build locally before deploying:

### Backend Local Test
```powershell
cd backend
npm install

# Create .env file with production-like values
# MONGODB_URI=your_mongo_connection
# JWT_SECRET=your_secret
# CLIENT_URL=http://localhost:5173

npm start
```

### Frontend Local Test
```powershell
cd frontend
npm install

# Create .env file
# VITE_API_URL=http://localhost:5000

npm run build
npm run preview
```

## Part 5: Monitoring & Maintenance

### Monitoring

1. **Render Metrics**:
   - Go to your Render service dashboard
   - Check CPU, Memory usage
   - Monitor response times

2. **MongoDB Atlas**:
   - Monitor database size
   - Check connection counts
   - Review slow queries

3. **Netlify Analytics**:
   - Track page views
   - Monitor build times
   - Check for failed deployments

### Logs

**Backend Logs (Render)**:
- Go to your service → Logs tab
- Look for errors or warnings
- Monitor MongoDB connection status

**Frontend Logs**:
- Check browser console for errors
- Review Netlify build logs for deployment issues

### Backups

**Database Backups**:
- MongoDB Atlas automatically creates backups
- Configure retention period in Atlas
- Test restore procedures periodically

## Quick Reference

### Environment Variables Summary

**Backend (Render)**:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
CLIENT_URL=https://your-app.netlify.app
FRONTEND_URL=https://your-app.netlify.app
PORT=5000
EMAIL_USER=... (optional)
EMAIL_PASS=... (optional)
```

**Frontend (Netlify)**:
```
VITE_API_URL=https://your-backend.onrender.com
```

### Important URLs

- **Frontend**: https://your-app-name.netlify.app
- **Backend**: https://medpal-backend.onrender.com
- **MongoDB Atlas**: https://cloud.mongodb.com/
- **Render Dashboard**: https://dashboard.render.com/
- **Netlify Dashboard**: https://app.netlify.com/

## Security Checklist

- [ ] MongoDB connection uses strong password
- [ ] JWT_SECRET is a random 64+ character string
- [ ] Environment variables are set in platform (not in code)
- [ ] CORS is properly configured with actual URLs
- [ ] MongoDB IP whitelist is configured
- [ ] HTTPS is enabled (automatic on Netlify/Render)
- [ ] Sensitive data is not committed to repository

## Need Help?

If you encounter issues:
1. Check the logs on Render/Netlify
2. Verify all environment variables are set correctly
3. Test backend health endpoint
4. Check MongoDB Atlas connection
5. Review browser console for frontend errors

---

**Note**: The free tier on Render may spin down after inactivity. The first request after inactivity may take 30-60 seconds to wake up the service.
