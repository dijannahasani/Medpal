// Sample Data Seeding Script - SAFE for Production
// This script creates demo data that can be easily identified and removed

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const VisitReport = require('../models/VisitReport');

// SAFETY FLAGS - Makes demo data easily identifiable
const DEMO_PREFIX = '[DEMO]';
const DEMO_EMAIL_DOMAIN = '@demo.medpal.com';
const DEMO_CLINIC_ID = 'demo-clinic-001';

async function createSafeDemo() {
  try {
    console.log('🚀 Creating SAFE demo data...');

    // 1. CREATE DEMO CLINIC
    const demoClinic = new User({
      name: `${DEMO_PREFIX} Klinika Demo MedPal`,
      email: `admin${DEMO_EMAIL_DOMAIN}`,
      password: await bcrypt.hash('Demo123!', 10),
      role: 'clinic',
      isVerified: true,
      clinicId: DEMO_CLINIC_ID,
      // SAFETY MARKER
      isDemoData: true,
      demoCreatedAt: new Date()
    });
    await demoClinic.save();
    console.log('✅ Demo clinic created');

    // 2. CREATE DEMO DEPARTMENTS
    const departments = [
      { name: 'Mjekësia e Përgjithshme', clinicId: demoClinic._id },
      { name: 'Kardiologjia', clinicId: demoClinic._id },
      { name: 'Pediatria', clinicId: demoClinic._id }
    ];

    const createdDepartments = [];
    for (let dept of departments) {
      const newDept = new Department({
        ...dept,
        isDemoData: true,
        demoCreatedAt: new Date()
      });
      await newDept.save();
      createdDepartments.push(newDept);
    }
    console.log('✅ Demo departments created');

    // 3. CREATE DEMO SERVICES
    const services = [
      { name: 'Konsultime të përgjithshme', departmentId: createdDepartments[0]._id, clinicId: demoClinic._id },
      { name: 'Kontroll rutinor', departmentId: createdDepartments[0]._id, clinicId: demoClinic._id },
      { name: 'EKG', departmentId: createdDepartments[1]._id, clinicId: demoClinic._id },
      { name: 'Konsultime kardiologjike', departmentId: createdDepartments[1]._id, clinicId: demoClinic._id },
      { name: 'Vaksinime', departmentId: createdDepartments[2]._id, clinicId: demoClinic._id },
      { name: 'Kontroll fëmijësh', departmentId: createdDepartments[2]._id, clinicId: demoClinic._id }
    ];

    for (let service of services) {
      const newService = new Service({
        ...service,
        isDemoData: true,
        demoCreatedAt: new Date()
      });
      await newService.save();
    }
    console.log('✅ Demo services created');

    // 4. CREATE DEMO DOCTORS
    const doctors = [
      {
        name: `${DEMO_PREFIX} Dr. Ana Malaj`,
        email: `ana.malaj${DEMO_EMAIL_DOMAIN}`,
        password: await bcrypt.hash('Doctor123!', 10),
        role: 'doctor',
        departmentId: createdDepartments[0]._id,
        clinicId: demoClinic._id,
        isVerified: true
      },
      {
        name: `${DEMO_PREFIX} Dr. Arben Krasniqi`,
        email: `arben.krasniqi${DEMO_EMAIL_DOMAIN}`,
        password: await bcrypt.hash('Doctor123!', 10),
        role: 'doctor',
        departmentId: createdDepartments[1]._id,
        clinicId: demoClinic._id,
        isVerified: true
      },
      {
        name: `${DEMO_PREFIX} Dr. Ela Hoxha`,
        email: `ela.hoxha${DEMO_EMAIL_DOMAIN}`,
        password: await bcrypt.hash('Doctor123!', 10),
        role: 'doctor',
        departmentId: createdDepartments[2]._id,
        clinicId: demoClinic._id,
        isVerified: true
      }
    ];

    const createdDoctors = [];
    for (let doctor of doctors) {
      const newDoctor = new User({
        ...doctor,
        isDemoData: true,
        demoCreatedAt: new Date()
      });
      await newDoctor.save();
      createdDoctors.push(newDoctor);
    }
    console.log('✅ Demo doctors created');

    // 5. CREATE DEMO PATIENTS
    const patients = [
      {
        name: `${DEMO_PREFIX} Fatmir Berisha`,
        email: `fatmir.berisha${DEMO_EMAIL_DOMAIN}`,
        password: await bcrypt.hash('Patient123!', 10),
        role: 'patient',
        isVerified: true
      },
      {
        name: `${DEMO_PREFIX} Lindita Kastrati`,
        email: `lindita.kastrati${DEMO_EMAIL_DOMAIN}`,
        password: await bcrypt.hash('Patient123!', 10),
        role: 'patient',
        isVerified: true
      },
      {
        name: `${DEMO_PREFIX} Agron Salihi`,
        email: `agron.salihi${DEMO_EMAIL_DOMAIN}`,
        password: await bcrypt.hash('Patient123!', 10),
        role: 'patient',
        isVerified: true
      }
    ];

    const createdPatients = [];
    for (let patient of patients) {
      const newPatient = new User({
        ...patient,
        isDemoData: true,
        demoCreatedAt: new Date()
      });
      await newPatient.save();
      createdPatients.push(newPatient);
    }
    console.log('✅ Demo patients created');

    console.log('\n🎉 SAFE demo data created successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log(`Clinic: admin${DEMO_EMAIL_DOMAIN} / Demo123!`);
    console.log(`Doctor: ana.malaj${DEMO_EMAIL_DOMAIN} / Doctor123!`);
    console.log(`Patient: fatmir.berisha${DEMO_EMAIL_DOMAIN} / Patient123!`);
    console.log('\n⚠️  All demo data is marked with isDemoData: true');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  }
}

module.exports = { createSafeDemo };

if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return createSafeDemo();
    })
    .then(() => {
      console.log('✅ Demo data seeding completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}