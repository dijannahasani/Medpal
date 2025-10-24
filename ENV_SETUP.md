# Environment Variables Setup Guide

This guide explains all environment variables needed for MedPal deployment.

## Backend Environment Variables (Render)

### Required Variables

#### MONGODB_URI
- **Description**: MongoDB Atlas connection string
- **Example**: `mongodb+srv://username:password@cluster.mongodb.net/medpal?retryWrites=true&w=majority`
- **How to Get**:
  1. Go to MongoDB Atlas
  2. Click "Connect" on your cluster
  3. Choose "Connect your application"
  4. Copy the connection string
  5. Replace `<username>` and `<password>` with your database user credentials
  6. Replace `<dbname>` with `medpal`

#### JWT_SECRET
- **Description**: Secret key for signing JWT tokens
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
- **How to Generate**:
  ```bash
  # On Windows PowerShell:
  [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
  
  # On macOS/Linux:
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- **Security**: Must be at least 32 characters, use random characters

#### CLIENT_URL / FRONTEND_URL
- **Description**: URL of your deployed frontend (Netlify)
- **Example**: `https://medpal-app.netlify.app`
- **Important**: 
  - No trailing slash
  - Must match exactly for CORS to work
  - Set both variables to the same value

### Optional Variables

#### PORT
- **Description**: Server port number
- **Default**: `5000`
- **Note**: Render sets this automatically; usually not needed

#### EMAIL_USER
- **Description**: SMTP email username for sending notifications
- **Example**: `noreply@yourdomain.com` or `your-email@gmail.com`
- **Required For**: Email notifications, password reset emails

#### EMAIL_PASS
- **Description**: SMTP email password
- **Example**: `your-app-specific-password`
- **For Gmail**:
  1. Enable 2-Step Verification
  2. Go to Google Account → Security → App Passwords
  3. Generate an App Password
  4. Use that password here

#### EMAIL_REJECT_UNAUTHORIZED
- **Description**: Whether to verify SSL certificates for email
- **Values**: `true` or `false`
- **Default**: `false`
- **Note**: Set to `false` for development, `true` for production with valid SSL

### Complete Backend .env Template

```env
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medpal?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_random_64_character_string_here_make_it_long
CLIENT_URL=https://your-app.netlify.app
FRONTEND_URL=https://your-app.netlify.app

# Optional
PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_REJECT_UNAUTHORIZED=false
NODE_ENV=production
```

## Frontend Environment Variables (Netlify)

### Required Variables

#### VITE_API_URL
- **Description**: URL of your deployed backend (Render)
- **Example**: `https://medpal-backend.onrender.com`
- **Important**:
  - No trailing slash
  - Must be the full URL including `https://`
  - This is used by the frontend to make API calls

### Complete Frontend .env Template

```env
VITE_API_URL=https://medpal-backend.onrender.com
```

## Local Development Setup

### Backend Local .env

For local development, create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medpal-dev?retryWrites=true&w=majority
JWT_SECRET=local_development_secret_key_change_for_production
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_REJECT_UNAUTHORIZED=false
NODE_ENV=development
```

### Frontend Local .env

For local development, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Setting Environment Variables

### On Render (Backend)

1. Go to your Render service
2. Click "Environment" in the left sidebar
3. Click "Add Environment Variable"
4. Enter Key and Value
5. Click "Save Changes"
6. Service will redeploy automatically

**Important**: Always use the "Environment" tab, never commit `.env` files!

### On Netlify (Frontend)

1. Go to your Netlify site
2. Click "Site settings"
3. Click "Environment variables" under "Build & deploy"
4. Click "Add a variable"
5. Enter Key and Value
6. Click "Create variable"
7. Trigger a new deploy (or it will deploy on next push)

**Alternative**: Set during initial deployment by clicking "Show advanced" before deploying.

## Troubleshooting

### "CORS Error" in Browser Console
- **Cause**: `CLIENT_URL` or `FRONTEND_URL` doesn't match Netlify URL
- **Fix**: Update both variables in Render to exact Netlify URL (no trailing slash)

### "Cannot connect to database"
- **Cause**: Invalid MongoDB URI or network restrictions
- **Fix**: 
  - Verify connection string is correct
  - Check MongoDB Atlas network access allows 0.0.0.0/0
  - Ensure database user has correct permissions

### "Invalid token" or Authentication Errors
- **Cause**: `JWT_SECRET` mismatch or not set
- **Fix**: Ensure `JWT_SECRET` is set and is the same across all instances

### "API calls failing" in Frontend
- **Cause**: `VITE_API_URL` not set or incorrect
- **Fix**: Set `VITE_API_URL` to your Render backend URL

### "Email not sending"
- **Cause**: Email credentials not set or incorrect
- **Fix**:
  - Verify `EMAIL_USER` and `EMAIL_PASS` are correct
  - For Gmail, use App Password, not regular password
  - Check spam folder

## Security Best Practices

1. **Never commit .env files** - Add to `.gitignore`
2. **Use strong secrets** - At least 64 random characters for JWT_SECRET
3. **Rotate secrets regularly** - Change JWT_SECRET periodically
4. **Use different secrets** - Don't reuse between development and production
5. **Limit access** - Only share credentials with team members who need them
6. **Use platform variables** - Store in Render/Netlify, not in code
7. **Monitor access** - Review who has access to your environment variables

## Quick Copy-Paste Commands

### Generate JWT_SECRET (Windows PowerShell)
```powershell
$guid1 = [guid]::NewGuid().ToString() -replace '-', ''
$guid2 = [guid]::NewGuid().ToString() -replace '-', ''
Write-Host ($guid1 + $guid2)
```

### Generate JWT_SECRET (macOS/Linux)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test Backend Connection
```bash
curl https://your-backend.onrender.com
# Should return HTML with "MedPal API is running"
```

### Test MongoDB Connection (from backend directory)
```bash
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(err => console.error('❌ Error:', err.message))"
```

## Checklist

Before deploying, ensure:

- [ ] All required backend variables are set in Render
- [ ] `VITE_API_URL` is set in Netlify
- [ ] `CLIENT_URL` matches Netlify URL exactly
- [ ] `JWT_SECRET` is strong and random
- [ ] MongoDB connection string is correct
- [ ] Email credentials are correct (if using email)
- [ ] No `.env` files committed to Git
- [ ] Local development works with local `.env`

---

**Need Help?** Check the [DEPLOY.md](./DEPLOY.md) guide or the [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md).

