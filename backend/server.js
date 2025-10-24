// ✅ ENV & DEPENDENCIES
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const os = require("os");

// ✅ CREATE APP
const app = express();

// ✅ SECURE: Remove this (don’t disable TLS verification)
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// ✅ CORS CONFIGURATION
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Vite default
  "http://localhost:5174", // alternate Vite port
  "http://localhost:4173", // Vite preview
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.NETLIFY_PREVIEW_ORIGIN,
].filter(Boolean);

// Matches any localhost origin with any port
const localhostRegex = /^http:\/\/localhost(?::\d+)?$/i;

// ✅ Dual-mode dynamic CORS logic
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without origin (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    const isLocalhost = localhostRegex.test(origin);
    const isAllowed = allowedOrigins.includes(origin) || isLocalhost;

    // In production, only allow FRONTEND_URL explicitly (Render or Netlify)
    if (process.env.NODE_ENV === "production" && !isAllowed) {
      console.warn("🚫 Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS: " + origin));
    }

    // Otherwise, allow during dev or local testing
    if (isAllowed || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// ✅ Apply CORS middleware globally
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// ✅ ROUTES
const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const appointmentRoutes = require("./routes/appointments");
app.use("/api/appointments", appointmentRoutes);

const doctorRoutes = require("./routes/doctors");
app.use("/api/doctors", doctorRoutes);

const reportRoutes = require("./routes/reports");
app.use("/api/reports", reportRoutes);

app.use("/uploads", express.static("uploads"));

const documentRoutes = require("./routes/documents");
app.use("/api/documents", documentRoutes);

const workingHoursRoutes = require("./routes/workingHours");
app.use("/api/working-hours", workingHoursRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

app.use("/api/clinic", require("./routes/clinic"));

// ✅ CONNECT TO MONGODB
const connectDB = require("./database");

const initializeApp = async () => {
  await connectDB();
  require("./reminderJob");
  console.log("🔄 All services initialized successfully");
};

initializeApp().catch((err) => {
  console.error("❌ Failed to initialize application:", err);
  process.exit(1);
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
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

function getLocalIPv4() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

function osc8Link(url, label) {
  return `\u001b]8;;${url}\u0007${label}\u001b]8;;\u0007`;
}

app.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}`;
  const ip = getLocalIPv4();
  const lanUrl = ip ? `http://${ip}:${PORT}` : null;

  console.log(`🚀 Server running at ${localUrl}`);
  if (lanUrl) console.log(`📶 LAN: ${lanUrl}`);

  const supportsOsc8 =
    !!process.env.VSCODE_PID || process.env.TERM_PROGRAM === "vscode";
  if (supportsOsc8) {
    try {
      console.log(osc8Link(localUrl, `Open ${localUrl}`));
      if (lanUrl) console.log(osc8Link(lanUrl, `Open ${lanUrl}`));
    } catch (e) {
      // ignore
    }
  }
});
