# MedPal Deployment Credentials & URLs

**⚠️ IMPORTANT: Do NOT commit this file to Git after filling it out!**

This template helps you organize your deployment credentials and URLs.

## 🔐 Credentials Storage

Store actual credentials in:
- Password manager (recommended: 1Password, LastPass, Bitwarden)
- Secure note-taking app
- Encrypted file

**Never** commit credentials to Git or share them publicly.

## 📊 Deployment Information

### Project Name
```
MedPal - Medical Appointment Management System
```

### Deployment Date
```
Date: __________________
Deployed By: __________________
```

---

## 🗄️ MongoDB Atlas

### Account Information
```
Email: __________________________________
Password: (stored in password manager)
2FA: [ ] Enabled  [ ] Disabled
```

### Cluster Information
```
Cluster Name: __________________________________
Region: __________________________________
Tier: [ ] Free  [ ] Paid (_____________)
```

### Database User
```
Username: __________________________________
Password: __________________________________
Database Name: medpal
```

### Connection String
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medpal?retryWrites=true&w=majority

Replace:
- username: __________________________________
- password: __________________________________  
- cluster: __________________________________
```

### Network Access
```
IP Whitelist: [ ] 0.0.0.0/0 (Allow from anywhere)
```

### MongoDB URLs
```
Atlas Dashboard: https://cloud.mongodb.com/
Project ID: __________________________________
```

---

## 🖥️ Render (Backend)

### Account Information
```
Email: __________________________________
Password: (stored in password manager)
2FA: [ ] Enabled  [ ] Disabled
```

### Service Information
```
Service Name: __________________________________
Region: __________________________________
Plan: [ ] Free  [ ] Starter  [ ] Standard
```

### Environment Variables

Copy these to Render Dashboard → Environment:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medpal?retryWrites=true&w=majority
JWT_SECRET=_____________________________________________________________
CLIENT_URL=https://________________________.netlify.app
FRONTEND_URL=https://________________________.netlify.app
PORT=5000
```

Optional (for email functionality):
```
EMAIL_USER=__________________________________
EMAIL_PASS=__________________________________
EMAIL_REJECT_UNAUTHORIZED=false
```

### URLs
```
Service URL: https://________________________.onrender.com
Dashboard: https://dashboard.render.com/
Health Check: https://________________________.onrender.com/
```

### Deployment
```
Branch: master
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

---

## 🌐 Netlify (Frontend)

### Account Information
```
Email: __________________________________
Password: (stored in password manager)
2FA: [ ] Enabled  [ ] Disabled
```

### Site Information
```
Site Name: __________________________________
Custom Domain: __________________________________ (if any)
```

### Environment Variables

Copy these to Netlify → Site settings → Environment variables:

```
VITE_API_URL=https://________________________.onrender.com
```

### URLs
```
Site URL: https://________________________.netlify.app
Dashboard: https://app.netlify.com/
Admin URL: https://________________________.netlify.app/admin
```

### Deployment
```
Branch: master
Base Directory: frontend
Build Command: npm run build
Publish Directory: frontend/dist
```

---

## 🔑 JWT Secret

Generate a secure JWT secret using one of these methods:

**Windows PowerShell:**
```powershell
$guid1 = [guid]::NewGuid().ToString() -replace '-', ''
$guid2 = [guid]::NewGuid().ToString() -replace '-', ''
Write-Host ($guid1 + $guid2)
```

**macOS/Linux:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Generated JWT_SECRET:**
```
_____________________________________________________________________
```

---

## 📧 Email Configuration (Optional)

### SMTP Provider
```
Provider: [ ] Gmail  [ ] SendGrid  [ ] Other: __________
```

### Gmail Setup (if using Gmail)
```
Email: __________________________________
App Password: __________________________________

To generate App Password:
1. Enable 2-Step Verification in Google Account
2. Go to Security → App Passwords
3. Generate password for "Mail"
4. Use generated password in EMAIL_PASS
```

### Other SMTP Provider
```
SMTP Host: __________________________________
SMTP Port: __________________________________
Username: __________________________________
Password: __________________________________
```

---

## 👤 Admin User

### First Admin Account
```
Created: [ ] Yes  [ ] No
Email: __________________________________
Password: __________________________________
Role: admin
```

### Creation Command
```bash
cd backend
node scripts/createAdmin.js
```

---

## 🔗 Quick Links

### Development
```
Local Frontend: http://localhost:5173
Local Backend: http://localhost:5000
```

### Production
```
Frontend: https://________________________.netlify.app
Backend: https://________________________.onrender.com
Backend Health: https://________________________.onrender.com/
```

### Dashboards
```
MongoDB Atlas: https://cloud.mongodb.com/
Render: https://dashboard.render.com/
Netlify: https://app.netlify.com/
```

---

## 📋 Post-Deployment Checklist

After deployment, verify these URLs work:

### Backend Verification
- [ ] Health Check: `https://your-backend.onrender.com/` shows "MedPal API is running"
- [ ] API Endpoint: `https://your-backend.onrender.com/api/doctors/public` returns data

### Frontend Verification
- [ ] Home Page: `https://your-frontend.netlify.app/` loads
- [ ] Login Page: `https://your-frontend.netlify.app/login` loads
- [ ] Register Page: `https://your-frontend.netlify.app/register` loads

### Integration Testing
- [ ] Can register new patient account
- [ ] Can login with credentials
- [ ] Can view doctor list
- [ ] Can book appointment
- [ ] No CORS errors in browser console

---

## 🔒 Security Notes

1. **Password Strength**
   - [ ] MongoDB password is strong (16+ chars, mixed case, numbers, symbols)
   - [ ] Admin password is strong
   - [ ] JWT_SECRET is random (64+ characters)

2. **Access Control**
   - [ ] MongoDB network access configured (0.0.0.0/0)
   - [ ] CORS configured with exact frontend URL
   - [ ] Environment variables set on platforms (not in code)

3. **Backups**
   - [ ] MongoDB Atlas automatic backups enabled
   - [ ] Backup retention period configured
   - [ ] Tested backup restoration (recommended)

4. **Monitoring**
   - [ ] Render metrics enabled
   - [ ] MongoDB metrics enabled
   - [ ] Error logging configured

---

## 📞 Support Contacts

### Team Members
```
Developer: __________________________________
DevOps: __________________________________
Support: __________________________________
```

### External Support
```
MongoDB Support: https://support.mongodb.com/
Render Support: https://render.com/docs
Netlify Support: https://www.netlify.com/support/
```

---

## 📝 Notes

```
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________
```

---

## ⚠️ Security Reminder

**NEVER:**
- Commit this file to Git after filling it out
- Share credentials via email or chat
- Store passwords in plain text in code
- Reuse passwords across services

**ALWAYS:**
- Use a password manager
- Enable 2FA where possible
- Rotate credentials regularly
- Keep backups of credentials in secure location

---

**Last Updated**: __________________

**Next Review Date**: __________________

