require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const User = require('./backend/models/User');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('Connecting to MongoDB...');

    // ✅ explicitly set dbName so it matches your main backend connection
    await mongoose.connect(uri, {
      dbName: 'medpal',
      serverSelectionTimeoutMS: 15000,
    });

    console.log('✅ Connected to MongoDB');

    const doctors = await User.find({ role: 'doctor' }).lean();
    console.log(`✅ Found ${doctors.length} doctors\n`);

    doctors.forEach((doc, i) => {
      console.log(`👨‍⚕️ #${i + 1}: ${doc.name || '(no name)'}`);
      console.log(doc.workingHours || 'No working hours set');
      console.log('------------------------------------');
    });
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
})();
