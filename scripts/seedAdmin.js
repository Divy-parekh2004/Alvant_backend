require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'smartboy728382@gmail.com';
    
    if (!adminEmail) {
      console.error('ERROR: ADMIN_EMAIL not found in .env file');
      console.log('Please add ADMIN_EMAIL=your-email@gmail.com to your .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log(`Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    const admin = new Admin({
      email: adminEmail
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log('Use this email address to login with OTP');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
