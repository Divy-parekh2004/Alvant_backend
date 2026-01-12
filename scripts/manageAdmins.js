require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('\n✅ Connected to MongoDB\n');

    console.log('📱 ADMIN MANAGEMENT SYSTEM\n');
    console.log('1. Add New Admin');
    console.log('2. View All Admins');
    console.log('3. Delete Admin');
    console.log('4. Exit\n');

    const choice = await question('Select option (1-4): ');

    switch(choice) {
      case '1':
        await addAdmin();
        break;
      case '2':
        await viewAdmins();
        break;
      case '3':
        await deleteAdmin();
        break;
      case '4':
        console.log('\n👋 Goodbye!\n');
        process.exit(0);
      default:
        console.log('\n❌ Invalid option\n');
        process.exit(0);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

async function addAdmin() {
  console.log('\n➕ ADD NEW ADMIN\n');
  const phone = await question('Enter phone number (e.g., +91-7283828058 or 7283828058): ');
  
  if (!phone || phone.trim() === '') {
    console.log('\n❌ Phone number cannot be empty\n');
    return;
  }

  try {
    const existing = await Admin.findOne({ phone });
    if (existing) {
      console.log(`\n❌ Admin with phone ${phone} already exists!\n`);
      return;
    }

    const admin = new Admin({ phone });
    await admin.save();
    
    console.log(`\n✅ Admin created successfully!`);
    console.log(`   Phone: ${phone}`);
    console.log(`   ID: ${admin._id}\n`);
  } catch (err) {
    console.log(`\n❌ Error: ${err.message}\n`);
  }
}

async function viewAdmins() {
  console.log('\n📋 ALL ADMINS\n');
  try {
    const admins = await Admin.find({}, 'phone createdAt');
    
    if (admins.length === 0) {
      console.log('❌ No admins found\n');
      return;
    }

    console.log('┌─────────────────────────────────────────────────┐');
    console.log('│ Phone Number         │ Created At              │');
    console.log('├─────────────────────────────────────────────────┤');
    
    admins.forEach((admin) => {
      const createdAt = new Date(admin.createdAt).toLocaleDateString('en-IN');
      const phone = admin.phone.padEnd(20);
      console.log(`│ ${phone} │ ${createdAt.padEnd(23)} │`);
    });
    
    console.log('└─────────────────────────────────────────────────┘\n');
    console.log(`Total: ${admins.length} admin(s)\n`);
  } catch (err) {
    console.log(`\n❌ Error: ${err.message}\n`);
  }
}

async function deleteAdmin() {
  console.log('\n🗑️ DELETE ADMIN\n');
  const phone = await question('Enter phone number of admin to delete: ');
  
  if (!phone || phone.trim() === '') {
    console.log('\n❌ Phone number cannot be empty\n');
    return;
  }

  try {
    const result = await Admin.deleteOne({ phone });
    
    if (result.deletedCount === 0) {
      console.log(`\n❌ No admin found with phone ${phone}\n`);
      return;
    }

    console.log(`\n✅ Admin with phone ${phone} deleted successfully!\n`);
  } catch (err) {
    console.log(`\n❌ Error: ${err.message}\n`);
  }
}

main();
