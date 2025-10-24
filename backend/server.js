process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const os = require('os');

// ✅ KRIJIMI I APP
const app = express();

// ✅ MIDDLEWARE
// Configure CORS for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite default port
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ ROUTES
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const appointmentRoutes = require("./routes/appointments");
app.use("/api/appointments", appointmentRoutes);

const doctorRoutes = require("./routes/doctors");
app.use("/api/doctors", doctorRoutes); // ✅ Rregulluar

const reportRoutes = require("./routes/reports");
app.use("/api/reports", reportRoutes);

app.use("/uploads", express.static("uploads")); // për të shfaqur dokumentet

const documentRoutes = require("./routes/documents");
app.use("/api/documents", documentRoutes);

const workingHoursRoutes = require("./routes/workingHours");
app.use("/api/working-hours", workingHoursRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

app.use("/api/clinic", require("./routes/clinic"));

// ✅ CONNECT TO MONGODB
const connectDB = require('./database');

// Initialize database connection
const initializeApp = async () => {
  await connectDB();
  
  // Start reminder job after DB connection is established
  require("./reminderJob");
  
  console.log('🔄 All services initialized successfully');
};

initializeApp().catch(err => {
  console.error('❌ Failed to initialize application:', err);
  process.exit(1);
});

// ✅ TEST ROUTE - prettier HTML so the status is visible
app.get('/', (req, res) => {
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>MedPal API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background:#f6fbff; display:flex; align-items:center; justify-content:center; height:100vh; margin:0 }
          .card { background: white; border-radius:12px; padding:32px 40px; box-shadow:0 8px 30px rgba(20,40,80,0.08); text-align:center }
          h1 { font-size:36px; margin:0 0 8px }
          p { margin:0; color:#2c3e50; font-size:18px }
          .emoji { font-size:42px; display:block; margin-bottom:12px }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="emoji">🚀</div>
          <h1>MedPal API is running</h1>
          <p>Server is up and listening on port ${process.env.PORT || 5000}</p>
        </div>
      </body>
    </html>
  `);
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
// helper: get first non-internal IPv4 address (for LAN access)
function getLocalIPv4() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

// helper: OSC 8 hyperlink (only enable on terminals that likely support it)
function osc8Link(url, label) {
  return `\u001b]8;;${url}\u0007${label}\u001b]8;;\u0007`;
}

app.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}`;
  const ip = getLocalIPv4();
  const lanUrl = ip ? `http://${ip}:${PORT}` : null;

  // Print a plain URL (most terminals auto-link http/https)
  console.log(`🚀 Server running at ${localUrl}`);

  // If we have a LAN address, print it too (useful to touch from another device)
  if (lanUrl) console.log(`📶 LAN: ${lanUrl}`);

  // If running inside VS Code integrated terminal, try OSC 8 hyperlink for a nicer clickable label.
  const supportsOsc8 = !!process.env.VSCODE_PID || process.env.TERM_PROGRAM === 'vscode';
  if (supportsOsc8) {
    try {
      console.log(osc8Link(localUrl, `Open ${localUrl}`));
      if (lanUrl) console.log(osc8Link(lanUrl, `Open ${lanUrl}`));
    } catch (e) {
      // ignore if terminal doesn't support it
    }
  }
});

