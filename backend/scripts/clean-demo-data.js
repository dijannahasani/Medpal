// Clean Demo Data Script - SAFELY removes only demo data
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const VisitReport = require('../models/VisitReport');

async function cleanDemoData() {
  try {
    console.log('🧹 Starting SAFE demo data cleanup...');

    // SAFETY CHECK - Only delete records marked as demo data
    const demoFilter = { isDemoData: true };

    // Count demo records before deletion
    const demoUsers = await User.countDocuments(demoFilter);
    const demoDepartments = await Department.countDocuments(demoFilter);
    const demoServices = await Service.countDocuments(demoFilter);
    const demoAppointments = await Appointment.countDocuments(demoFilter);
    const demoReports = await VisitReport.countDocuments(demoFilter);

    console.log('\n📊 Demo records found:');
    console.log(`Users: ${demoUsers}`);
    console.log(`Departments: ${demoDepartments}`);
    console.log(`Services: ${demoServices}`);
    console.log(`Appointments: ${demoAppointments}`);
    console.log(`Reports: ${demoReports}`);

    if (demoUsers === 0 && demoDepartments === 0 && demoServices === 0) {
      console.log('✅ No demo data found to clean');
      return;
    }

    // Ask for confirmation in production
    if (process.env.NODE_ENV === 'production') {
      console.log('\n⚠️  PRODUCTION ENVIRONMENT DETECTED');
      console.log('This will delete demo data. Continue? (This is safe)');
      // In production, you might want to add readline confirmation
    }

    // Delete demo data (SAFE - only marked records)
    await VisitReport.deleteMany(demoFilter);
    await Appointment.deleteMany(demoFilter);
    await Service.deleteMany(demoFilter);
    await Department.deleteMany(demoFilter);
    await User.deleteMany(demoFilter);

    console.log('\n✅ Demo data cleaned successfully!');
    console.log('💡 Only records marked with isDemoData: true were removed');

  } catch (error) {
    console.error('❌ Error cleaning demo data:', error);
  }
}

module.exports = { cleanDemoData };

if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return cleanDemoData();
    })
    .then(() => {
      console.log('✅ Demo cleanup completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}