# MedPal Deployment Checklist

Use this checklist to ensure your deployment is complete and successful.

## Pre-Deployment Checklist

### Code Preparation
- [ ] All code changes are committed to Git
- [ ] No sensitive data (passwords, API keys) in code
- [ ] `.gitignore` includes `.env`, `node_modules/`, `dist/`
- [ ] All linter errors are resolved
- [ ] Application tested locally and works correctly

### Environment Setup
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created and configured
- [ ] Database user created with strong password
- [ ] Network access configured (0.0.0.0/0 for Render)
- [ ] Connection string obtained and tested
- [ ] Netlify account created
- [ ] Render account created

### Configuration Files
- [ ] `frontend/netlify.toml` exists and is correct
- [ ] `frontend/public/_redirects` exists
- [ ] `backend/config.js` uses environment variables
- [ ] `frontend/src/config/api.js` uses VITE_API_URL
- [ ] CORS configuration in `backend/server.js` includes CLIENT_URL

## Backend Deployment (Render)

### Initial Setup
- [ ] Repository connected to Render
- [ ] Web Service created
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Node version specified (20 or compatible)

### Environment Variables
- [ ] `MONGODB_URI` - Set with MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Set with random 64+ character string
- [ ] `CLIENT_URL` - Set to Netlify URL (update after frontend deployed)
- [ ] `FRONTEND_URL` - Set to Netlify URL (update after frontend deployed)
- [ ] `PORT` - Set to 5000 (optional, Render sets automatically)
- [ ] `EMAIL_USER` - (Optional) SMTP username
- [ ] `EMAIL_PASS` - (Optional) SMTP password

### Verification
- [ ] Deployment succeeded (check logs)
- [ ] "MongoDB connected successfully" appears in logs
- [ ] Health check endpoint works (visit backend URL)
- [ ] API endpoint shows "MedPal API is running"
- [ ] Backend URL copied for frontend configuration

## Frontend Deployment (Netlify)

### Initial Setup
- [ ] Repository connected to Netlify
- [ ] Base directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `frontend/dist`

### Environment Variables
- [ ] `VITE_API_URL` - Set to Render backend URL

### Verification
- [ ] Build succeeded (check build logs)
- [ ] Site is accessible
- [ ] Home/Welcome page loads correctly
- [ ] No console errors in browser
- [ ] Site URL copied for backend CORS configuration

## Post-Deployment Configuration

### Backend CORS Update
- [ ] Return to Render dashboard
- [ ] Update `CLIENT_URL` with actual Netlify URL
- [ ] Update `FRONTEND_URL` with actual Netlify URL
- [ ] Service redeployed automatically

### Database Initialization
- [ ] Admin user created (using `node scripts/createAdmin.js`)
- [ ] Test data created if needed
- [ ] Database indexes verified

## Testing

### Backend Tests
- [ ] Health endpoint responds: `GET /`
- [ ] API endpoints accessible (test with Postman/curl)
- [ ] MongoDB connection stable (check logs)
- [ ] No error messages in logs
- [ ] Authentication works (JWT tokens generated)

### Frontend Tests
- [ ] All pages load without errors
- [ ] Login/Register functionality works
- [ ] API calls succeed (check Network tab)
- [ ] No CORS errors
- [ ] Patient dashboard accessible
- [ ] Doctor dashboard accessible (if applicable)
- [ ] Clinic dashboard accessible (if applicable)

### Integration Tests
- [ ] Patient can register successfully
- [ ] Email verification works (if enabled)
- [ ] Patient can log in
- [ ] Patient can book appointment
- [ ] Doctor can view appointments
- [ ] Clinic can manage services
- [ ] File uploads work (documents, reports)
- [ ] PDF generation works (reports)

### Mobile Tests
- [ ] Site is responsive on mobile
- [ ] Navigation works on mobile
- [ ] Forms are usable on mobile
- [ ] All features accessible on mobile

## Security Verification

### Backend Security
- [ ] No hardcoded credentials in code
- [ ] JWT_SECRET is strong and random
- [ ] CORS properly configured with actual URLs
- [ ] MongoDB uses strong password
- [ ] Environment variables not exposed in logs
- [ ] HTTPS enabled (automatic on Render)

### Frontend Security
- [ ] No API keys in frontend code
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] Authentication tokens stored securely
- [ ] Sensitive routes protected

### Database Security
- [ ] MongoDB network access restricted
- [ ] Database user has minimal required permissions
- [ ] Connection string uses SSL/TLS
- [ ] Regular backups configured

## Performance Optimization

### Backend
- [ ] Database queries optimized
- [ ] Indexes created where needed
- [ ] Response times acceptable
- [ ] Memory usage reasonable

### Frontend
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Lazy loading implemented where beneficial
- [ ] Build size < 1MB (check build output)

## Monitoring Setup

### Render Monitoring
- [ ] Metrics dashboard reviewed
- [ ] Alert notifications configured
- [ ] Log retention configured

### MongoDB Monitoring
- [ ] Performance monitoring enabled
- [ ] Alerts configured for high usage
- [ ] Backup schedule verified

### Netlify Monitoring
- [ ] Build notifications enabled
- [ ] Analytics configured (if using)
- [ ] Form submissions monitored (if applicable)

## Documentation

### Deployment Documentation
- [ ] DEPLOY.md reviewed and accurate
- [ ] Environment variables documented
- [ ] Deployment URLs documented
- [ ] Admin credentials stored securely

### User Documentation
- [ ] README updated with deployment info
- [ ] User guides created (if needed)
- [ ] API documentation updated (if applicable)

## Final Checks

### Functionality
- [ ] All critical features working
- [ ] Error handling works properly
- [ ] User workflows tested end-to-end
- [ ] Edge cases tested

### User Experience
- [ ] Loading states displayed
- [ ] Error messages are clear
- [ ] Success messages displayed
- [ ] Navigation is intuitive

### Production Readiness
- [ ] DNS configured (if using custom domain)
- [ ] SSL certificates active
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Support contact information added

## Post-Launch

### Immediate (First 24 Hours)
- [ ] Monitor logs for errors
- [ ] Check performance metrics
- [ ] Verify backup completion
- [ ] Test all critical paths
- [ ] Monitor user feedback

### Short Term (First Week)
- [ ] Review error rates
- [ ] Optimize slow queries
- [ ] Address user-reported issues
- [ ] Monitor resource usage
- [ ] Plan scaling if needed

### Long Term (Ongoing)
- [ ] Regular security updates
- [ ] Performance monitoring
- [ ] User feedback incorporation
- [ ] Feature improvements
- [ ] Backup testing

## Deployment Complete! 🎉

Once all items are checked:
- [ ] Deployment documented
- [ ] Team notified
- [ ] Users can access system
- [ ] Monitoring active
- [ ] Support ready

---

**Deployment Date**: _________________

**Deployed By**: _________________

**Backend URL**: _________________

**Frontend URL**: _________________

**MongoDB Cluster**: _________________

**Notes**: 
_______________________________________
_______________________________________
_______________________________________

