/**
 * One-time script to create the initial admin account.
 * Run once: node seedAdmin.js
 * Then delete or keep — re-running will skip if email already exists.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const ADMIN = {
  name: 'Admin',
  email: 'admin@cre8.com',
  password: 'Admin@1234',   // change immediately after first login
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const exists = await Admin.findOne({ email: ADMIN.email });
  if (exists) {
    console.log('Admin already exists:', ADMIN.email);
    process.exit(0);
  }

  await Admin.create({ ...ADMIN, role: 'admin' });
  console.log('Admin created:', ADMIN.email);
  console.log('Password:', ADMIN.password, ' — change this after first login!');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
