// Database configuration
const config = {
  // Use MongoDB Atlas connection string (must be set in environment for production)
  // Support both MONGODB_URI and MONGO_URI for flexibility. No hard-coded credentials in repo.
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || "",
  
  // JWT Secret
  JWT_SECRET: process.env.JWT_SECRET || "medpal_super_secret_key_2024",
  
  // Server Port
  PORT: process.env.PORT || 5000
};

module.exports = config;
