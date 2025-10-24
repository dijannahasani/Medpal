#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { dbName: 'medpal', serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected.');

    // Change this name if your doctor is stored differently
    const keepName = 'Mjeku 1';

    // Find that one user first so you don’t delete them accidentally
    const keeper = await User.findOne({ name: keepName });
    if (!keeper) {
      console.error(`❌ User "${keepName}" not found. Aborting.`);
      process.exit(1);
    }

    // Delete everyone else
    const result = await User.deleteMany({ _id: { $ne: keeper._id } });
    console.log(`✅ Deleted ${result.deletedCount} users (kept "${keeper.name}")`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
