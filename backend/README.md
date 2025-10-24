## MedPal Backend — Deployment & Local setup

This file explains how to run the backend locally, required environment variables, and recommended settings for deploying to Render (or similar services).

Quick summary
- The backend entrypoint is `server.js` inside the `backend` folder.
- The app requires a MongoDB connection string in `MONGODB_URI` (or `MONGO_URI`) — DO NOT hard-code credentials in the repo.

Required environment variables (production)
- MONGODB_URI (or MONGO_URI): MongoDB Atlas connection string (required)
- JWT_SECRET: strong random secret for signing JWTs
- CLIENT_URL or FRONTEND_URL: frontend public URL (used in emails/CORS)
- EMAIL_USER: SMTP username (if sending email)
- EMAIL_PASS: SMTP password (if sending email)
- EMAIL_REJECT_UNAUTHORIZED: optional, set to `true` or `false` depending on SMTP TLS verification needs
- INCLUDE_DEMO: optional, `true` or `false` to include demo data

Recommended local `.env` (do NOT commit this file)
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/medpal?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_secure_random_value
CLIENT_URL=http://localhost:5173
EMAIL_USER=you@example.com
EMAIL_PASS=your-smtp-password
EMAIL_REJECT_UNAUTHORIZED=false
INCLUDE_DEMO=false
PORT=5000
```

Local development
1. Install dependencies:

```powershell
cd backend
npm install
```

2. Start the backend in dev mode (requires `.env` as above):

```powershell
npm run dev
# or
nodemon server.js
```

Production / Render deployment (recommended)
1. Create a new Web Service on Render and connect your repository.
2. Set the "Root Directory" to `/backend` (so Render installs and runs from `backend/package.json`).
3. Build & Start commands:
   - Build command: `npm install` (Render will run this automatically)
   - Start command: `npm start` (uses `backend/package.json` start script which runs `node server.js`)
4. Environment settings (set these in Render's Environment section):
   - `MONGODB_URI` (required)
   - `JWT_SECRET` (required)
   - `CLIENT_URL` (your Netlify frontend URL)
   - `EMAIL_USER` / `EMAIL_PASS` (if you send email)
   - `EMAIL_REJECT_UNAUTHORIZED` (optional)
   - `INCLUDE_DEMO` (optional)
5. Choose Node version 20 (or the version that matches your local dev environment).

Notes
- The backend will exit if it cannot connect to MongoDB (this is intentional). Ensure `MONGODB_URI` is correct.
- CORS is configured in `server.js`; set `CLIENT_URL` / `FRONTEND_URL` in the backend environment so that CORS allows the frontend origin.
- Logs are available in Render. If the server fails to start, check `MONGODB_URI` and SMTP credentials.

Security
- Never commit `.env` or credentials. Use the platform's encrypted environment variables for production.

If you want I can also create a `render.yaml` to declare the service as infrastructure-as-code — tell me if you want that.

---
Created by automation: adjusted config to require `MONGODB_URI` env var and removed any hard-coded credentials from repo.
